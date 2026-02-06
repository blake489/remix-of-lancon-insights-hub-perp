import { useEffect } from 'react';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Message, useMessages } from '@/hooks/useMessages';
import { Reply, Trash2, ArrowLeft } from 'lucide-react';

interface MessageDetailProps {
  message: Message;
  type: 'inbox' | 'sent';
  onReply: () => void;
  onDelete: () => void;
  onBack: () => void;
}

export function MessageDetail({ message, type, onReply, onDelete, onBack }: MessageDetailProps) {
  const { markAsRead } = useMessages();
  
  const profile = type === 'inbox' ? message.sender_profile : message.recipient_profile;
  const displayName = profile?.display_name || 'Unknown User';
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Mark as read when viewing inbox message
  useEffect(() => {
    if (type === 'inbox' && !message.is_read) {
      markAsRead.mutate(message.id);
    }
  }, [message.id, message.is_read, type, markAsRead]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2 mb-4 md:hidden">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </div>
        
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            
            <div>
              <h2 className="font-semibold text-lg">{message.subject}</h2>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-0.5">
                <span>
                  {type === 'inbox' ? 'From:' : 'To:'} {displayName}
                </span>
                <span>•</span>
                <span>{format(new Date(message.created_at), 'MMM d, yyyy h:mm a')}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {type === 'inbox' && (
              <Button variant="outline" size="sm" onClick={onReply}>
                <Reply className="h-4 w-4 mr-1" />
                Reply
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={onDelete} className="text-destructive hover:text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <Separator />

      {/* Content */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="prose prose-sm max-w-none dark:prose-invert">
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
    </div>
  );
}
