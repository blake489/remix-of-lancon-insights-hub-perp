// Mock data for LanCon Qld Dashboard

import { 
  Project, 
  Claim, 
  Forecast, 
  Timing, 
  SiteManagerActivity, 
  MagicEquationConfig,
  ProjectWithMetrics
} from '@/types/dashboard';

export const magicEquationConfig: MagicEquationConfig = {
  monthlyRevenueTarget: 1650000,
  gpPercentTarget: 18,
  overheadPercent: 10.5,
  thresholds: {
    gpGreen: 16,
    gpOrange: 12,
    revenueGreen: 1650000,
    revenueOrange: 1400000,
  },
};

export const siteManagers = [
  'Michael Torres',
  'Sarah Chen',
  'James Wilson',
  'Emma Rodriguez',
];

export const mockProjects: Project[] = [
  {
    id: 'PRJ-001',
    jobName: 'Hamilton Residence',
    clientName: 'David & Emma Hamilton',
    address: '42 Riverside Drive, Hamilton',
    siteManager: 'Michael Torres',
    contractValueExGst: 2850000,
    contractValueIncGst: 3135000,
    startDate: '2024-08-15',
    pcDate: '2025-06-30',
    status: 'Active',
    currentStage: 'Frame',
  },
  {
    id: 'PRJ-002',
    jobName: 'Ascot Estate',
    clientName: 'Richard Blackwell',
    address: '18 Eagle Street, Ascot',
    siteManager: 'Sarah Chen',
    contractValueExGst: 4200000,
    contractValueIncGst: 4620000,
    startDate: '2024-06-01',
    pcDate: '2025-09-15',
    status: 'Active',
    currentStage: 'Enclosed',
  },
  {
    id: 'PRJ-003',
    jobName: 'Teneriffe Terrace',
    clientName: 'Lucy & Mark Stevens',
    address: '7 James Street, Teneriffe',
    siteManager: 'Michael Torres',
    contractValueExGst: 1950000,
    contractValueIncGst: 2145000,
    startDate: '2024-10-01',
    pcDate: '2025-05-20',
    status: 'Active',
    currentStage: 'Slab/Base',
  },
  {
    id: 'PRJ-004',
    jobName: 'New Farm Villa',
    clientName: 'Andrew Chen',
    address: '23 Merthyr Road, New Farm',
    siteManager: 'James Wilson',
    contractValueExGst: 3100000,
    contractValueIncGst: 3410000,
    startDate: '2024-07-20',
    pcDate: '2025-08-10',
    status: 'Active',
    currentStage: 'Fixing',
  },
  {
    id: 'PRJ-005',
    jobName: 'Clayfield Manor',
    clientName: 'Sophie Turner',
    address: '56 Junction Road, Clayfield',
    siteManager: 'Emma Rodriguez',
    contractValueExGst: 2400000,
    contractValueIncGst: 2640000,
    startDate: '2024-09-10',
    pcDate: '2025-07-15',
    status: 'Active',
    currentStage: 'Frame',
  },
  {
    id: 'PRJ-006',
    jobName: 'Bulimba Waterfront',
    clientName: 'James & Rebecca Moore',
    address: '12 Oxford Street, Bulimba',
    siteManager: 'Sarah Chen',
    contractValueExGst: 5500000,
    contractValueIncGst: 6050000,
    startDate: '2024-05-01',
    pcDate: '2025-10-30',
    status: 'Active',
    currentStage: 'Enclosed',
  },
];

export const mockForecasts: Record<string, Forecast> = {
  'PRJ-001': {
    projectId: 'PRJ-001',
    forecastCost: 2394000,
    forecastGrossProfit: 456000,
    forecastGpPercent: 16.0,
    monthYear: '2025-02',
  },
  'PRJ-002': {
    projectId: 'PRJ-002',
    forecastCost: 3444000,
    forecastGrossProfit: 756000,
    forecastGpPercent: 18.0,
    monthYear: '2025-02',
  },
  'PRJ-003': {
    projectId: 'PRJ-003',
    forecastCost: 1657500,
    forecastGrossProfit: 292500,
    forecastGpPercent: 15.0,
    monthYear: '2025-02',
  },
  'PRJ-004': {
    projectId: 'PRJ-004',
    forecastCost: 2511000,
    forecastGrossProfit: 589000,
    forecastGpPercent: 19.0,
    monthYear: '2025-02',
  },
  'PRJ-005': {
    projectId: 'PRJ-005',
    forecastCost: 1992000,
    forecastGrossProfit: 408000,
    forecastGpPercent: 17.0,
    monthYear: '2025-02',
  },
  'PRJ-006': {
    projectId: 'PRJ-006',
    forecastCost: 4510000,
    forecastGrossProfit: 990000,
    forecastGpPercent: 18.0,
    monthYear: '2025-02',
  },
};

export const mockTimings: Record<string, Timing> = {
  'PRJ-001': {
    projectId: 'PRJ-001',
    contractDays: 320,
    workingDays: 250,
    eotDays: 14,
    daysLost: 8,
    daysUsed: 175,
    startDate: '2024-08-15',
    contractCompletionDate: '2025-06-30',
    revisedCompletionDate: '2025-07-14',
  },
  'PRJ-002': {
    projectId: 'PRJ-002',
    contractDays: 470,
    workingDays: 365,
    eotDays: 21,
    daysLost: 12,
    daysUsed: 250,
    startDate: '2024-06-01',
    contractCompletionDate: '2025-09-15',
    revisedCompletionDate: '2025-10-06',
  },
  'PRJ-003': {
    projectId: 'PRJ-003',
    contractDays: 230,
    workingDays: 180,
    eotDays: 0,
    daysLost: 15,
    daysUsed: 125,
    startDate: '2024-10-01',
    contractCompletionDate: '2025-05-20',
    revisedCompletionDate: '2025-06-04',
  },
  'PRJ-004': {
    projectId: 'PRJ-004',
    contractDays: 385,
    workingDays: 300,
    eotDays: 7,
    daysLost: 5,
    daysUsed: 200,
    startDate: '2024-07-20',
    contractCompletionDate: '2025-08-10',
    revisedCompletionDate: '2025-08-17',
  },
  'PRJ-005': {
    projectId: 'PRJ-005',
    contractDays: 308,
    workingDays: 240,
    eotDays: 10,
    daysLost: 3,
    daysUsed: 145,
    startDate: '2024-09-10',
    contractCompletionDate: '2025-07-15',
    revisedCompletionDate: '2025-07-25',
  },
  'PRJ-006': {
    projectId: 'PRJ-006',
    contractDays: 545,
    workingDays: 420,
    eotDays: 28,
    daysLost: 18,
    daysUsed: 280,
    startDate: '2024-05-01',
    contractCompletionDate: '2025-10-30',
    revisedCompletionDate: '2025-11-27',
  },
};

// Monthly claims data (current month - February 2025)
export const mockMonthlyClaims: Record<string, number> = {
  'PRJ-001': 285000,
  'PRJ-002': 420000,
  'PRJ-003': 195000,
  'PRJ-004': 310000,
  'PRJ-005': 180000,
  'PRJ-006': 385000,
};

export const mockCumulativeClaims: Record<string, number> = {
  'PRJ-001': 1710000,
  'PRJ-002': 2940000,
  'PRJ-003': 585000,
  'PRJ-004': 2170000,
  'PRJ-005': 960000,
  'PRJ-006': 3300000,
};

export const mockSiteManagerActivities: SiteManagerActivity[] = [
  // Michael Torres - 2 projects
  {
    id: 'SMA-001',
    projectId: 'PRJ-001',
    siteManager: 'Michael Torres',
    fortnightStart: '2025-02-01',
    fortnightEnd: '2025-02-14',
    clientMessageSent: true,
    photoUploads: 8,
    hsWalkthroughCompleted: true,
  },
  {
    id: 'SMA-002',
    projectId: 'PRJ-003',
    siteManager: 'Michael Torres',
    fortnightStart: '2025-02-01',
    fortnightEnd: '2025-02-14',
    clientMessageSent: true,
    photoUploads: 5,
    hsWalkthroughCompleted: false,
  },
  // Sarah Chen - 2 projects
  {
    id: 'SMA-003',
    projectId: 'PRJ-002',
    siteManager: 'Sarah Chen',
    fortnightStart: '2025-02-01',
    fortnightEnd: '2025-02-14',
    clientMessageSent: true,
    photoUploads: 12,
    hsWalkthroughCompleted: true,
  },
  {
    id: 'SMA-004',
    projectId: 'PRJ-006',
    siteManager: 'Sarah Chen',
    fortnightStart: '2025-02-01',
    fortnightEnd: '2025-02-14',
    clientMessageSent: false,
    photoUploads: 0,
    hsWalkthroughCompleted: true,
  },
  // James Wilson - 1 project
  {
    id: 'SMA-005',
    projectId: 'PRJ-004',
    siteManager: 'James Wilson',
    fortnightStart: '2025-02-01',
    fortnightEnd: '2025-02-14',
    clientMessageSent: true,
    photoUploads: 6,
    hsWalkthroughCompleted: true,
  },
  // Emma Rodriguez - 1 project
  {
    id: 'SMA-006',
    projectId: 'PRJ-005',
    siteManager: 'Emma Rodriguez',
    fortnightStart: '2025-02-01',
    fortnightEnd: '2025-02-14',
    clientMessageSent: false,
    photoUploads: 3,
    hsWalkthroughCompleted: false,
  },
];

// Helper function to generate project with metrics
export function getProjectsWithMetrics(): ProjectWithMetrics[] {
  return mockProjects.map((project) => {
    const forecast = mockForecasts[project.id];
    const timing = mockTimings[project.id];
    const monthlyClaimsExGst = mockMonthlyClaims[project.id] || 0;
    const cumulativeClaimsExGst = mockCumulativeClaims[project.id] || 0;
    
    // Calculate implied GP% based on cumulative claims
    const impliedGpPercent = forecast 
      ? (cumulativeClaimsExGst / project.contractValueExGst) * forecast.forecastGpPercent
      : 0;
    
    // Calculate variance from target (18%)
    const gpVariancePercent = forecast.forecastGpPercent - magicEquationConfig.gpPercentTarget;
    const gpVarianceDollars = (gpVariancePercent / 100) * project.contractValueExGst;
    
    // Determine schedule status
    const progressPercent = timing.daysUsed / timing.workingDays;
    const expectedProgress = timing.daysUsed / (timing.workingDays + timing.eotDays);
    let scheduleStatus: 'ahead' | 'on-time' | 'behind' = 'on-time';
    if (timing.daysLost > 10) {
      scheduleStatus = 'behind';
    } else if (timing.daysLost < 3 && timing.eotDays === 0) {
      scheduleStatus = 'ahead';
    }

    return {
      ...project,
      monthlyClaimsExGst,
      cumulativeClaimsExGst,
      forecastGrossProfit: forecast?.forecastGrossProfit || 0,
      forecastGpPercent: forecast?.forecastGpPercent || 0,
      impliedGpPercent,
      gpVariancePercent,
      gpVarianceDollars,
      scheduleStatus,
      timing,
    };
  });
}

// Calculate KPI data for a given period
export function calculateKPIData(
  totalRevenue: number,
  totalGrossProfit: number,
  config: MagicEquationConfig
) {
  const gpPercent = totalRevenue > 0 ? (totalGrossProfit / totalRevenue) * 100 : 0;
  const overheads = totalRevenue * (config.overheadPercent / 100);
  const pureProfit = totalGrossProfit - overheads;
  
  // Determine status colors
  let revenueStatus: 'success' | 'warning' | 'danger' = 'danger';
  if (totalRevenue >= config.thresholds.revenueGreen) {
    revenueStatus = 'success';
  } else if (totalRevenue >= config.thresholds.revenueOrange) {
    revenueStatus = 'warning';
  }
  
  let gpStatus: 'success' | 'warning' | 'danger' = 'danger';
  if (gpPercent >= config.thresholds.gpGreen) {
    gpStatus = 'success';
  } else if (gpPercent >= config.thresholds.gpOrange) {
    gpStatus = 'warning';
  }
  
  const pureProfitStatus: 'success' | 'warning' | 'danger' = pureProfit >= 0 ? 'success' : 'danger';

  return {
    revenue: totalRevenue,
    revenueTarget: config.monthlyRevenueTarget,
    revenueStatus,
    grossProfit: totalGrossProfit,
    gpPercent,
    gpStatus,
    overheads,
    pureProfit,
    pureProfitStatus,
  };
}

// Get current month and fortnight KPI data
export function getCurrentKPIData() {
  const totalMonthlyRevenue = Object.values(mockMonthlyClaims).reduce((a, b) => a + b, 0);
  const avgGpPercent = Object.values(mockForecasts).reduce((sum, f) => sum + f.forecastGpPercent, 0) / Object.values(mockForecasts).length;
  const totalMonthlyGrossProfit = totalMonthlyRevenue * (avgGpPercent / 100);
  
  return calculateKPIData(totalMonthlyRevenue, totalMonthlyGrossProfit, magicEquationConfig);
}

// Fortnight 1 data (days 1-14, roughly 50% of month)
export function getFortnight1KPIData() {
  const totalRevenue = Object.values(mockMonthlyClaims).reduce((a, b) => a + b, 0) * 0.48;
  const avgGpPercent = 17.2; // Slightly different GP for fortnight variation
  const totalGrossProfit = totalRevenue * (avgGpPercent / 100);
  
  return calculateKPIData(totalRevenue, totalGrossProfit, magicEquationConfig);
}

// Fortnight 2 data (previous fortnight for context)
export function getPreviousFortnightKPIData() {
  const totalRevenue = 820000; // Previous fortnight
  const avgGpPercent = 16.8;
  const totalGrossProfit = totalRevenue * (avgGpPercent / 100);
  
  return calculateKPIData(totalRevenue, totalGrossProfit, magicEquationConfig);
}
