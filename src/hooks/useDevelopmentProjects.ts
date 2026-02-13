import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DevelopmentProject {
  id: string;
  project_name: string;
  current_value: number;
  current_loan: number;
  funds_in_offset: number;
  grv: number;
  forecast_margin_on_costs: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DevelopmentProjectWithLVR extends DevelopmentProject {
  current_lvr: number;
}

export interface GroupMetrics {
  total_current_value: number;
  total_current_loan: number;
  total_funds_in_offset: number;
  total_grv: number;
  total_forecast_margin_on_costs: number;
  group_current_lvr: number;
}

function computeLVR(loan: number, value: number): number {
  if (value === 0) return 0;
  return (loan / value) * 100;
}

export function computeGroupMetrics(projects: DevelopmentProject[]): GroupMetrics {
  const active = projects.filter(p => p.is_active);
  const totals = active.reduce(
    (acc, p) => ({
      total_current_value: acc.total_current_value + Number(p.current_value),
      total_current_loan: acc.total_current_loan + Number(p.current_loan),
      total_funds_in_offset: acc.total_funds_in_offset + Number(p.funds_in_offset),
      total_grv: acc.total_grv + Number(p.grv),
      total_forecast_margin_on_costs: acc.total_forecast_margin_on_costs + Number(p.forecast_margin_on_costs),
    }),
    { total_current_value: 0, total_current_loan: 0, total_funds_in_offset: 0, total_grv: 0, total_forecast_margin_on_costs: 0 }
  );

  return {
    ...totals,
    group_current_lvr: computeLVR(totals.total_current_loan, totals.total_current_value),
  };
}

export function addLVR(project: DevelopmentProject): DevelopmentProjectWithLVR {
  return {
    ...project,
    current_lvr: computeLVR(Number(project.current_loan), Number(project.current_value)),
  };
}

export function useDevelopmentProjects() {
  return useQuery({
    queryKey: ['development_projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('development_projects')
        .select('*')
        .order('project_name');
      if (error) throw error;
      return (data || []) as DevelopmentProject[];
    },
  });
}
