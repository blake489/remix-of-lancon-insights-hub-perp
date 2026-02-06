import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

export interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  subject: string;
  content: string;
  is_read: boolean;
  created_at: string;
  read_at: string | null;
  sender_profile?: {
    display_name: string | null;
    avatar_url: string | null;
  };
  recipient_profile?: {
    display_name: string | null;
    avatar_url: string | null;
  };
}

export function useMessages() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch inbox messages (received)
  const inboxQuery = useQuery({
    queryKey: ['messages', 'inbox', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .eq('recipient_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch sender profiles
      const senderIds = [...new Set(messages.map(m => m.sender_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name, avatar_url')
        .in('user_id', senderIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      return messages.map(m => ({
        ...m,
        sender_profile: profileMap.get(m.sender_id) || null,
      })) as Message[];
    },
    enabled: !!user,
  });

  // Fetch sent messages
  const sentQuery = useQuery({
    queryKey: ['messages', 'sent', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .eq('sender_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch recipient profiles
      const recipientIds = [...new Set(messages.map(m => m.recipient_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name, avatar_url')
        .in('user_id', recipientIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      return messages.map(m => ({
        ...m,
        recipient_profile: profileMap.get(m.recipient_id) || null,
      })) as Message[];
    },
    enabled: !!user,
  });

  // Get unread count
  const unreadCount = inboxQuery.data?.filter(m => !m.is_read).length || 0;

  // Send message mutation
  const sendMessage = useMutation({
    mutationFn: async ({ recipientId, subject, content }: { 
      recipientId: string; 
      subject: string; 
      content: string;
    }) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          recipient_id: recipientId,
          subject,
          content,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });

  // Mark as read mutation
  const markAsRead = useMutation({
    mutationFn: async (messageId: string) => {
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', messageId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });

  // Delete message mutation
  const deleteMessage = useMutation({
    mutationFn: async (messageId: string) => {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });

  // Real-time subscription for new messages
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('messages-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `recipient_id=eq.${user.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['messages', 'inbox'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

  return {
    inbox: inboxQuery.data || [],
    sent: sentQuery.data || [],
    unreadCount,
    isLoading: inboxQuery.isLoading || sentQuery.isLoading,
    sendMessage,
    markAsRead,
    deleteMessage,
  };
}

// Hook to fetch all users for recipient selection
export function useUsers() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['users-for-messaging'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, display_name, avatar_url')
        .neq('user_id', user?.id || '');

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}
