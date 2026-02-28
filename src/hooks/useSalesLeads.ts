import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SalesLead {
  id: string;
  client_name: string;
  estimated_value: number;
  revenue_type: 'prospective' | 'firm';
  status: string;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export type SalesLeadInsert = Omit<SalesLead, 'id' | 'created_at' | 'updated_at'>;

export function useSalesLeads() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ['sales-leads'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sales_leads' as any)
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as SalesLead[];
    },
  });

  const addLead = useMutation({
    mutationFn: async (lead: Partial<SalesLeadInsert>) => {
      const { error } = await supabase.from('sales_leads' as any).insert(lead as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales-leads'] });
      toast({ title: 'Lead added' });
    },
    onError: (e: Error) => toast({ title: 'Error adding lead', description: e.message, variant: 'destructive' }),
  });

  const updateLead = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<SalesLeadInsert>) => {
      const { error } = await supabase.from('sales_leads' as any).update(updates as any).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales-leads'] });
      toast({ title: 'Lead updated' });
    },
    onError: (e: Error) => toast({ title: 'Error updating lead', description: e.message, variant: 'destructive' }),
  });

  const deleteLead = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('sales_leads' as any).delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales-leads'] });
      toast({ title: 'Lead deleted' });
    },
    onError: (e: Error) => toast({ title: 'Error deleting lead', description: e.message, variant: 'destructive' }),
  });

  return { leads, isLoading, addLead, updateLead, deleteLead };
}
