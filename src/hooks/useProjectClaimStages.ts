import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ClaimStageInfo {
  currentStage: string | null;
  nextStage: string | null;
  nextDate: string | null;
}

export function useProjectClaimStages(projectIds: string[]) {
  return useQuery({
    queryKey: ['project-claim-stages', projectIds],
    enabled: projectIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('claims')
        .select('project_id, claim_type, claim_date, status')
        .in('project_id', projectIds)
        .order('claim_date', { ascending: true });
      if (error) throw error;

      const today = new Date().toISOString().split('T')[0];
      const result: Record<string, ClaimStageInfo> = {};

      for (const pid of projectIds) {
        const claims = (data || []).filter(c => c.project_id === pid);
        
        // Current stage: the most recent claim that is 'claimed' or 'confirmed', or the latest past planned
        const pastOrCurrent = claims.filter(c => c.claim_date <= today || c.status === 'claimed');
        const claimed = pastOrCurrent.filter(c => c.status === 'claimed');
        const confirmed = pastOrCurrent.filter(c => c.status === 'confirmed');
        
        let currentStage: string | null = null;
        if (claimed.length > 0) {
          currentStage = claimed[claimed.length - 1].claim_type;
        } else if (confirmed.length > 0) {
          currentStage = confirmed[confirmed.length - 1].claim_type;
        } else if (pastOrCurrent.length > 0) {
          currentStage = pastOrCurrent[pastOrCurrent.length - 1].claim_type;
        }

        // Next stage: first upcoming claim not yet claimed
        const upcoming = claims.filter(c => c.claim_date > today && c.status !== 'claimed');
        const next = upcoming.length > 0 ? upcoming[0] : null;

        result[pid] = {
          currentStage,
          nextStage: next?.claim_type || null,
          nextDate: next?.claim_date || null,
        };
      }

      return result;
    },
  });
}
