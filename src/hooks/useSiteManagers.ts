import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useSiteManagers() {
  const { data: siteManagers = [], isLoading } = useQuery({
    queryKey: ['site-managers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_members')
        .select('id, name')
        .eq('department', 'site_supervisor')
        .eq('is_active', true)
        .order('name');
      if (error) throw error;
      return data.map(m => m.name.toUpperCase());
    },
  });

  return { siteManagers, isLoading };
}
