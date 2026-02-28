import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ProjectTrend {
  schedule: 'on_time' | 'behind' | 'ahead' | 'unknown';
  profit: 'up' | 'same' | 'down' | 'unknown';
  scheduleDays: number; // net days moved
  profitDelta: number;  // current GP% - original GP%
}

export function useProjectTrends(projectIds: string[]) {
  return useQuery({
    queryKey: ['project-trends', projectIds.sort().join(',')],
    enabled: projectIds.length > 0,
    queryFn: async () => {
      // Fetch claim moves for schedule trend (net days delta per project)
      const { data: moves } = await supabase
        .from('claim_moves')
        .select('project_id, days_delta')
        .in('project_id', projectIds);

      // Fetch forecast audit for profit trend (first vs current)
      const { data: audits } = await supabase
        .from('project_forecast_audit')
        .select('project_id, old_gp_percent, new_gp_percent, changed_at')
        .in('project_id', projectIds)
        .order('changed_at', { ascending: true });

      const trends: Record<string, ProjectTrend> = {};

      for (const id of projectIds) {
        // Schedule: sum of days_delta from all moves
        const projectMoves = (moves || []).filter(m => m.project_id === id);
        const netDays = projectMoves.reduce((sum, m) => sum + (m.days_delta || 0), 0);
        
        let schedule: ProjectTrend['schedule'] = 'unknown';
        if (projectMoves.length > 0) {
          if (netDays > 0) schedule = 'behind';
          else if (netDays < 0) schedule = 'ahead';
          else schedule = 'on_time';
        }

        // Profit: compare original GP% (first audit old value) vs current project GP%
        const projectAudits = (audits || []).filter(a => a.project_id === id);
        let profit: ProjectTrend['profit'] = 'unknown';
        let profitDelta = 0;

        if (projectAudits.length > 0) {
          const originalGp = projectAudits[0].old_gp_percent;
          const currentGp = projectAudits[projectAudits.length - 1].new_gp_percent;
          profitDelta = currentGp - originalGp;
          
          if (Math.abs(profitDelta) < 0.5) profit = 'same';
          else if (profitDelta > 0) profit = 'up';
          else profit = 'down';
        }

        trends[id] = { schedule, profit, scheduleDays: netDays, profitDelta };
      }

      return trends;
    },
  });
}
