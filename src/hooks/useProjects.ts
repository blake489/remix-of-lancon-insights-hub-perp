import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type ProjectCategory = 'pre_construction' | 'construction' | 'handover';

export interface ProjectRow {
  id: string;
  job_name: string;
  client_name: string | null;
  address: string | null;
  site_manager: string | null;
  category: ProjectCategory;
  contract_value_ex_gst: number;
  contract_value_inc_gst: number;
  start_date: string | null;
  pc_date: string | null;
  current_stage: string | null;
  status: string;
  forecast_cost: number;
  forecast_gross_profit: number;
  forecast_gp_percent: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export type ProjectInsert = Omit<ProjectRow, 'id' | 'created_at' | 'updated_at'>;
export type ProjectUpdate = Partial<ProjectInsert> & { id: string };

export function useProjects() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as ProjectRow[];
    },
  });

  const addProject = useMutation({
    mutationFn: async (project: ProjectInsert) => {
      const { data, error } = await supabase
        .from('projects')
        .insert(project)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({ title: 'Project added', description: 'New project created successfully.' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const updateProject = useMutation({
    mutationFn: async ({ id, ...updates }: ProjectUpdate) => {
      const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({ title: 'Project updated', description: 'Changes saved.' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  return { projects, isLoading, addProject, updateProject };
}
