import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

export interface SiteWeeklyActivity {
  id: string;
  project_id: string;
  week_start: string;
  client_message: boolean;
  photos: number;
  hs_walk: boolean;
}

export function useSiteWeeklyActivities(weekStart: Date) {
  const qc = useQueryClient();
  const weekKey = format(weekStart, 'yyyy-MM-dd');

  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['site-weekly-activities', weekKey],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_weekly_activities')
        .select('*')
        .eq('week_start', weekKey);
      if (error) throw error;
      return data as SiteWeeklyActivity[];
    },
  });

  // Also fetch previous week for red-flag logic
  const prevWeekKey = format(new Date(weekStart.getTime() - 7 * 86400000), 'yyyy-MM-dd');
  const { data: prevActivities = [] } = useQuery({
    queryKey: ['site-weekly-activities', prevWeekKey],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_weekly_activities')
        .select('*')
        .eq('week_start', prevWeekKey);
      if (error) throw error;
      return data as SiteWeeklyActivity[];
    },
  });

  const upsert = useMutation({
    mutationFn: async (row: { project_id: string; client_message: boolean; photos: number; hs_walk: boolean }) => {
      const { error } = await supabase
        .from('site_weekly_activities')
        .upsert(
          { ...row, week_start: weekKey, updated_at: new Date().toISOString() },
          { onConflict: 'project_id,week_start' }
        );
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['site-weekly-activities', weekKey] });
    },
  });

  const activityMap = new Map(activities.map(a => [a.project_id, a]));
  const prevActivityMap = new Map(prevActivities.map(a => [a.project_id, a]));

  const getActivity = (projectId: string): { clientMessage: boolean; photos: number; hsWalk: boolean } => {
    const a = activityMap.get(projectId);
    return a ? { clientMessage: a.client_message, photos: a.photos, hsWalk: a.hs_walk } : { clientMessage: false, photos: 0, hsWalk: false };
  };

  const isComplete = (act: { clientMessage: boolean; photos: number; hsWalk: boolean }) =>
    act.clientMessage && act.photos >= 4 && act.hsWalk;

  const isRedFlagged = (projectId: string): boolean => {
    const curr = getActivity(projectId);
    const prev = prevActivityMap.get(projectId);
    const prevAct = prev ? { clientMessage: prev.client_message, photos: prev.photos, hsWalk: prev.hs_walk } : { clientMessage: false, photos: 0, hsWalk: false };
    return !isComplete(curr) && !isComplete(prevAct);
  };

  return { activities, isLoading, getActivity, isRedFlagged, upsert, isComplete };
}
