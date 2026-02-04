// LanCon Qld Dashboard Types

export type TrafficLightStatus = 'success' | 'warning' | 'danger';

export type ProjectStage = 
  | 'Deposit' 
  | 'Retaining' 
  | 'Slab/Base' 
  | 'Frame' 
  | 'Enclosed' 
  | 'Fixing' 
  | 'PC' 
  | 'Handover';

export type ProjectStatus = 'Active' | 'Complete' | 'On Hold';

export interface Project {
  id: string;
  jobName: string;
  clientName: string;
  address: string;
  siteManager: string;
  contractValueExGst: number;
  contractValueIncGst: number;
  startDate: string;
  pcDate: string;
  status: ProjectStatus;
  currentStage: ProjectStage;
}

export interface Claim {
  id: string;
  projectId: string;
  claimDate: string;
  stage: ProjectStage;
  amountIncGst: number;
  amountExGst: number;
  month: string; // YYYY-MM format
}

export interface Forecast {
  projectId: string;
  forecastCost: number;
  forecastGrossProfit: number;
  forecastGpPercent: number;
  monthYear: string; // YYYY-MM format
}

export interface Timing {
  projectId: string;
  contractDays: number;
  workingDays: number;
  eotDays: number;
  daysLost: number;
  daysUsed: number;
  startDate: string;
  contractCompletionDate: string;
  revisedCompletionDate: string;
}

export interface SiteManagerActivity {
  id: string;
  projectId: string;
  siteManager: string;
  fortnightStart: string;
  fortnightEnd: string;
  clientMessageSent: boolean;
  photoUploads: number;
  hsWalkthroughCompleted: boolean;
}

export interface MagicEquationConfig {
  monthlyRevenueTarget: number;
  gpPercentTarget: number;
  overheadPercent: number;
  thresholds: {
    gpGreen: number;
    gpOrange: number;
    revenueGreen: number;
    revenueOrange: number;
  };
}

export interface KPIData {
  revenue: number;
  revenueTarget: number;
  revenueStatus: TrafficLightStatus;
  grossProfit: number;
  gpPercent: number;
  gpStatus: TrafficLightStatus;
  overheads: number;
  pureProfit: number;
  pureProfitStatus: TrafficLightStatus;
}

export interface FortnightPeriod {
  month: string; // YYYY-MM
  fortnight: 1 | 2;
  startDate: string;
  endDate: string;
}

export interface ProjectWithMetrics extends Project {
  monthlyClaimsExGst: number;
  cumulativeClaimsExGst: number;
  forecastGrossProfit: number;
  forecastGpPercent: number;
  impliedGpPercent: number;
  gpVariancePercent: number;
  gpVarianceDollars: number;
  scheduleStatus: 'ahead' | 'on-time' | 'behind';
  timing: Timing;
}
