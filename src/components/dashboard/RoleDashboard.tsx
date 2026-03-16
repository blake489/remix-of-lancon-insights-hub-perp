import { type UserRoleInfo } from '@/hooks/useUserRole';
import { DirectorDashboard } from './roles/DirectorDashboard';
import { ConstructionManagerDashboard } from './roles/ConstructionManagerDashboard';
import { SalesManagerDashboard } from './roles/SalesManagerDashboard';
import { DesignManagerDashboard } from './roles/DesignManagerDashboard';
import { ProductionManagerDashboard } from './roles/ProductionManagerDashboard';

interface RoleDashboardProps {
  roleInfo: UserRoleInfo;
  /** All shared data/state passed down from Dashboard */
  shared: SharedDashboardProps;
}

export interface SharedDashboardProps {
  projects: any[];
  projLoading: boolean;
  kpi: any;
  claims: any[];
  events: any[];
  eventsLoading: boolean;
  unreadCount: number;
  claimsRevenue: any;
  activeGpPercent: { percent: number; count: number } | null;
  projectHealth: any;
  upcomingEvents: any[];
  // Magic equation props
  monthlyKPI: any;
  currentFortnightKPI: any;
  previousFortnightKPI: any;
  selectedMonth: string;
  selectedFortnight: 1 | 2;
  overheadOverride: number;
  onOverheadChange: (v: number) => void;
  adjacentMonthProfits: any;
  lastMonthOverhead: number;
  nextMonthOverhead: number;
  onLastMonthOverheadChange: (v: number) => void;
  onNextMonthOverheadChange: (v: number) => void;
  bhagTarget: number;
  onBhagChange: (v: number) => void;
  onBhagCommit: (v: number) => void;
  // Table sort
  groupedProjects: any[];
  sorted: any[];
  handleSort: (field: any) => void;
  sortField: string;
  sortDir: string;
  t: any;
  navigate: (path: string) => void;
}

export function RoleDashboard({ roleInfo, shared }: RoleDashboardProps) {
  if (roleInfo.isDirector) return <DirectorDashboard shared={shared} />;
  if (roleInfo.isConstructionManager) return <ConstructionManagerDashboard shared={shared} />;
  if (roleInfo.isSalesManager) return <SalesManagerDashboard shared={shared} />;
  if (roleInfo.isDesignManager) return <DesignManagerDashboard shared={shared} />;
  if (roleInfo.isProductionManager) return <ProductionManagerDashboard shared={shared} />;
  // Admin or unknown → same as director
  return <DirectorDashboard shared={shared} />;
}
