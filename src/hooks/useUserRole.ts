import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type UserRole =
  | 'director'
  | 'construction_manager'
  | 'sales_manager'
  | 'design_manager'
  | 'production_manager'
  | 'admin';

export interface UserRoleInfo {
  role: UserRole;
  isDirector: boolean;
  isConstructionManager: boolean;
  isSalesManager: boolean;
  isDesignManager: boolean;
  isProductionManager: boolean;
  isAdmin: boolean;
  canViewFinancials: boolean;
  canViewGP: boolean;
  canViewSales: boolean;
  canManageSettings: boolean;
}

const DEFAULT_ROLE: UserRole = 'director';

const ROLE_LABELS: Record<UserRole, string> = {
  director: 'Director',
  construction_manager: 'Construction Manager',
  sales_manager: 'Sales Manager',
  design_manager: 'Design Manager',
  production_manager: 'Production Manager',
  admin: 'Admin',
};

export function getRoleLabel(role: UserRole): string {
  return ROLE_LABELS[role] ?? role;
}

export function useUserRole(): UserRoleInfo & { isLoading: boolean } {
  const { user } = useAuth();

  const { data: role = DEFAULT_ROLE, isLoading } = useQuery({
    queryKey: ['user-role', user?.id],
    queryFn: async () => {
      if (!user?.id) return DEFAULT_ROLE;
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error || !data?.role) return DEFAULT_ROLE;
      return data.role as UserRole;
    },
    enabled: !!user?.id,
  });

  const isDirector = role === 'director';
  const isConstructionManager = role === 'construction_manager';
  const isSalesManager = role === 'sales_manager';
  const isDesignManager = role === 'design_manager';
  const isProductionManager = role === 'production_manager';
  const isAdmin = role === 'admin';

  return {
    role,
    isDirector,
    isConstructionManager,
    isSalesManager,
    isDesignManager,
    isProductionManager,
    isAdmin,
    isLoading,
    canViewFinancials: isDirector || isProductionManager,
    canViewGP: isDirector || isConstructionManager || isProductionManager,
    canViewSales: isDirector || isSalesManager,
    canManageSettings: isDirector || isAdmin,
  };
}
