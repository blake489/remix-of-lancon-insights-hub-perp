import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface KPISettings {
  id: string;
  monthly_revenue_target: number;
  gp_percent_target: number;
  overhead_percent: number;
  gp_threshold_green: number;
  gp_threshold_orange: number;
  revenue_threshold_green: number;
  revenue_threshold_orange: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  updated_by: string | null;
}

export interface KPISettingsAudit {
  id: string;
  settings_id: string | null;
  monthly_revenue_target: number;
  gp_percent_target: number;
  overhead_percent: number;
  gp_threshold_green: number;
  gp_threshold_orange: number;
  revenue_threshold_green: number;
  revenue_threshold_orange: number;
  changed_by: string | null;
  changed_by_email: string | null;
  change_reason: string | null;
  created_at: string;
}

export interface UpdateKPISettingsInput {
  monthly_revenue_target: number;
  gp_percent_target: number;
  overhead_percent: number;
  gp_threshold_green: number;
  gp_threshold_orange: number;
  revenue_threshold_green: number;
  revenue_threshold_orange: number;
  change_reason: string;
}

export function useKPISettings() {
  return useQuery({
    queryKey: ['kpi-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('kpi_settings')
        .select('*')
        .eq('is_active', true)
        .single();

      if (error) throw error;
      return data as KPISettings;
    },
  });
}

export function useKPISettingsAudit() {
  return useQuery({
    queryKey: ['kpi-settings-audit'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('kpi_settings_audit')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as KPISettingsAudit[];
    },
  });
}

export function useUpdateKPISettings() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ settingsId, input }: { settingsId: string; input: UpdateKPISettingsInput }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // First, create audit record
      const { error: auditError } = await supabase
        .from('kpi_settings_audit')
        .insert({
          settings_id: settingsId,
          monthly_revenue_target: input.monthly_revenue_target,
          gp_percent_target: input.gp_percent_target,
          overhead_percent: input.overhead_percent,
          gp_threshold_green: input.gp_threshold_green,
          gp_threshold_orange: input.gp_threshold_orange,
          revenue_threshold_green: input.revenue_threshold_green,
          revenue_threshold_orange: input.revenue_threshold_orange,
          changed_by: user.id,
          changed_by_email: user.email,
          change_reason: input.change_reason,
        });

      if (auditError) throw auditError;

      // Then update settings
      const { error: updateError } = await supabase
        .from('kpi_settings')
        .update({
          monthly_revenue_target: input.monthly_revenue_target,
          gp_percent_target: input.gp_percent_target,
          overhead_percent: input.overhead_percent,
          gp_threshold_green: input.gp_threshold_green,
          gp_threshold_orange: input.gp_threshold_orange,
          revenue_threshold_green: input.revenue_threshold_green,
          revenue_threshold_orange: input.revenue_threshold_orange,
          updated_by: user.id,
        })
        .eq('id', settingsId);

      if (updateError) throw updateError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kpi-settings'] });
      queryClient.invalidateQueries({ queryKey: ['kpi-settings-audit'] });
      toast({
        title: 'Settings Updated',
        description: 'KPI settings have been saved successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update settings. You may not have admin permissions.',
        variant: 'destructive',
      });
    },
  });
}

export function useUserRole() {
  return useQuery({
    queryKey: ['user-role'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      if (error) throw error;
      
      // Check if user has admin role
      const isAdmin = data?.some(r => r.role === 'admin') ?? false;
      return { isAdmin, roles: data?.map(r => r.role) ?? [] };
    },
  });
}
