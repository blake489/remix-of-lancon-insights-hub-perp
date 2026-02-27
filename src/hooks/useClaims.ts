import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

export interface Claim {
  id: string;
  project_id: string;
  claim_date: string;
  month_key: string;
  amount: number;
  direction: 'Up' | 'Down';
  claim_type: string;
  reference: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClaimInsert {
  project_id: string;
  claim_date: string;
  amount: number;
  direction: 'Up' | 'Down';
  claim_type: string;
  reference?: string | null;
  notes?: string | null;
}

export function useClaims() {
  const queryClient = useQueryClient();

  const { data: claims = [], isLoading } = useQuery({
    queryKey: ['claims'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('claims')
        .select('*')
        .order('claim_date', { ascending: true });
      if (error) throw error;
      return data as Claim[];
    },
  });

  const addClaim = useMutation({
    mutationFn: async (input: ClaimInsert) => {
      const monthKey = format(new Date(input.claim_date), 'yyyy-MM');
      // Enforce direction/amount consistency
      let amount = Math.abs(input.amount);
      if (input.direction === 'Down') amount = -amount;

      const { error } = await supabase.from('claims').insert({
        project_id: input.project_id,
        claim_date: input.claim_date,
        month_key: monthKey,
        amount,
        direction: input.direction,
        claim_type: input.claim_type,
        reference: input.reference || null,
        notes: input.notes || null,
      });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['claims'] }),
  });

  const updateClaim = useMutation({
    mutationFn: async ({ id, ...input }: ClaimInsert & { id: string }) => {
      const monthKey = format(new Date(input.claim_date), 'yyyy-MM');
      let amount = Math.abs(input.amount);
      if (input.direction === 'Down') amount = -amount;

      const { error } = await supabase.from('claims').update({
        project_id: input.project_id,
        claim_date: input.claim_date,
        month_key: monthKey,
        amount,
        direction: input.direction,
        claim_type: input.claim_type,
        reference: input.reference || null,
        notes: input.notes || null,
      }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['claims'] }),
  });

  const deleteClaim = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('claims').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['claims'] }),
  });

  return { claims, isLoading, addClaim, updateClaim, deleteClaim };
}
