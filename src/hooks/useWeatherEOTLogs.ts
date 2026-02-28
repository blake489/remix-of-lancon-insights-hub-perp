import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfMonth, endOfMonth } from 'date-fns';

export interface WeatherEOTLog {
  id: string;
  project_id: string;
  log_date: string;
  rain_chance: number;
  rain_amount: number;
  severity: string;
  created_at: string;
}

export interface ProjectEOTTally {
  projectId: string;
  currentMonthDays: number;
  lifetimeDays: number;
}

export function useWeatherEOTLogs() {
  const queryClient = useQueryClient();
  const now = new Date();
  const monthStart = format(startOfMonth(now), 'yyyy-MM-dd');
  const monthEnd = format(endOfMonth(now), 'yyyy-MM-dd');

  const { data: allLogs = [], isLoading } = useQuery({
    queryKey: ['weather-eot-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('weather_eot_logs')
        .select('*')
        .order('log_date', { ascending: false });
      if (error) throw error;
      return data as WeatherEOTLog[];
    },
  });

  const tallies = allLogs.reduce<Record<string, ProjectEOTTally>>((acc, log) => {
    if (!acc[log.project_id]) {
      acc[log.project_id] = { projectId: log.project_id, currentMonthDays: 0, lifetimeDays: 0 };
    }
    acc[log.project_id].lifetimeDays += 1;
    if (log.log_date >= monthStart && log.log_date <= monthEnd) {
      acc[log.project_id].currentMonthDays += 1;
    }
    return acc;
  }, {});

  const logEOTForProjects = useMutation({
    mutationFn: async (entries: { project_id: string; log_date: string; rain_chance: number; rain_amount: number; severity: string }[]) => {
      if (!entries.length) return;
      const { error } = await supabase
        .from('weather_eot_logs')
        .upsert(entries, { onConflict: 'project_id,log_date', ignoreDuplicates: true });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['weather-eot-logs'] }),
  });

  return { logs: allLogs, tallies, isLoading, logEOTForProjects };
}
