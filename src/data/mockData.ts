// Real data from LanCon Metrics_10.02.26.xlsx

import { 
  Project, 
  Forecast, 
  Timing, 
  SiteManagerActivity, 
  MagicEquationConfig,
  ProjectWithMetrics,
  ProjectStage
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
  'ROBBIE',
  'BRIAN', 
  'JUSTIN',
  'JULES',
];

// Projects from Metrics_10.02.26.xlsx - Active Jobs + Budgets Not Finalised
export const mockProjects: Project[] = [
  // ── Active Jobs ──
  {
    id: 'tranters-76',
    jobName: '76 Tranters Ave',
    clientName: 'Client',
    address: '76 Tranters Ave, Camp Hill',
    siteManager: 'BRIAN',
    contractValueExGst: 1784065,
    contractValueIncGst: 1962471.50,
    startDate: '2025-02-13',
    pcDate: '2026-04-02',
    status: 'Active',
    currentStage: 'Fixing',
  },
  {
    id: 'mawson-53',
    jobName: '53 Mawson St',
    clientName: 'Client',
    address: '53 Mawson St, Kedron',
    siteManager: 'JUSTIN',
    contractValueExGst: 1295034,
    contractValueIncGst: 1424537.40,
    startDate: '2024-12-16',
    pcDate: '2025-12-09',
    status: 'Active',
    currentStage: 'PC',
  },
  {
    id: 'tranters-17',
    jobName: '17 Tranters Ave',
    clientName: 'Client',
    address: '17 Tranters Ave, Camp Hill',
    siteManager: 'ROBBIE',
    contractValueExGst: 1197961,
    contractValueIncGst: 1317757.10,
    startDate: '2024-06-01',
    pcDate: '2025-12-04',
    status: 'Active',
    currentStage: 'PC',
  },
  {
    id: 'yorkville-5',
    jobName: '5 Yorkville Place',
    clientName: 'Client',
    address: '5 Yorkville Place, Carina',
    siteManager: 'JULES',
    contractValueExGst: 985838,
    contractValueIncGst: 1084421.80,
    startDate: '2024-07-01',
    pcDate: '2025-11-27',
    status: 'Active',
    currentStage: 'PC',
  },
  {
    id: 'exley-3',
    jobName: '3 Exley Street',
    clientName: 'Client',
    address: '3 Exley Street, Kedron',
    siteManager: 'JUSTIN',
    contractValueExGst: 1009950,
    contractValueIncGst: 1110945,
    startDate: '2024-08-01',
    pcDate: '2025-12-05',
    status: 'Active',
    currentStage: 'PC',
  },
  {
    id: 'sterculia-106',
    jobName: '106 Sterculia Ave',
    clientName: 'Gino Pippia & Sandra Pelusi',
    address: '106 Sterculia Ave, Holland Park West',
    siteManager: 'ROBBIE',
    contractValueExGst: 1133782,
    contractValueIncGst: 1247160.20,
    startDate: '2024-04-22',
    pcDate: '2026-02-06',
    status: 'Active',
    currentStage: 'PC',
  },
  {
    id: 'yallambie-5',
    jobName: '5 Yallambie Court',
    clientName: 'Client',
    address: '5 Yallambie Court, Bunya',
    siteManager: 'JULES',
    contractValueExGst: 1256823,
    contractValueIncGst: 1382505.30,
    startDate: '2024-09-01',
    pcDate: '2025-11-18',
    status: 'Active',
    currentStage: 'PC',
  },
  {
    id: 'ferneydell-29',
    jobName: '29 Ferneydell St',
    clientName: 'Jeremy & Susan Ross',
    address: '29 Ferneydell St, Ashgrove',
    siteManager: 'JUSTIN',
    contractValueExGst: 1252676,
    contractValueIncGst: 1377943.60,
    startDate: '2024-05-29',
    pcDate: '2026-04-02',
    status: 'Active',
    currentStage: 'Fixing',
  },
  {
    id: 'melaleuca-23',
    jobName: '23 Melaleuca Place',
    clientName: 'David Crandon & Ellie Rowe',
    address: '23 Melaleuca Place, Keperra',
    siteManager: 'JULES',
    contractValueExGst: 1054167,
    contractValueIncGst: 1159583.70,
    startDate: '2024-05-15',
    pcDate: '2026-02-12',
    status: 'Active',
    currentStage: 'Fixing',
  },
  {
    id: 'stadcor-48',
    jobName: '48 Stadcor St',
    clientName: 'Ryan & Dominique Halloran',
    address: '48 Stadcor St, Wavell Heights',
    siteManager: 'JUSTIN',
    contractValueExGst: 1066017,
    contractValueIncGst: 1172618.70,
    startDate: '2024-07-10',
    pcDate: '2026-03-16',
    status: 'Active',
    currentStage: 'Enclosed',
  },
  {
    id: 'royal-59',
    jobName: '59 Royal St',
    clientName: 'Antonia & Mick Meitner',
    address: '59 Royal St, Virginia',
    siteManager: 'JUSTIN',
    contractValueExGst: 1096489,
    contractValueIncGst: 1206137.90,
    startDate: '2024-07-21',
    pcDate: '2026-04-10',
    status: 'Active',
    currentStage: 'Enclosed',
  },
  {
    id: 'faringdon-11',
    jobName: '11 Faringdon St',
    clientName: 'Danny & Amy Tsai',
    address: '11 Faringdon St, Robertson',
    siteManager: 'ROBBIE',
    contractValueExGst: 2348953,
    contractValueIncGst: 2583848.30,
    startDate: '2024-09-22',
    pcDate: '2026-07-02',
    status: 'Active',
    currentStage: 'Base',
  },
  // ── Budgets Not Finalised ──
  {
    id: 'dianella-14',
    jobName: '14 Dianella Terrace',
    clientName: 'Client',
    address: '14 Dianella Terrace, Keperra',
    siteManager: 'BRIAN',
    contractValueExGst: 1287008,
    contractValueIncGst: 1415708.80,
    startDate: '2025-06-01',
    pcDate: '2026-06-01',
    status: 'Active',
    currentStage: 'Base',
  },
  {
    id: 'tranters-117a',
    jobName: '117A Tranters Ave',
    clientName: 'Client',
    address: '117A Tranters Ave, Camp Hill',
    siteManager: 'ROBBIE',
    contractValueExGst: 3344911,
    contractValueIncGst: 3679402.10,
    startDate: '2024-12-11',
    pcDate: '2026-04-30',
    status: 'Active',
    currentStage: 'Enclosed',
  },
  {
    id: 'durimbil-28',
    jobName: '28 Durimbil St',
    clientName: 'Client',
    address: '28 Durimbil St, Camp Hill',
    siteManager: 'BRIAN',
    contractValueExGst: 1829091,
    contractValueIncGst: 2012000.10,
    startDate: '2025-01-15',
    pcDate: '2026-06-15',
    status: 'Active',
    currentStage: 'Base',
  },
];

// Forecast data from Metrics_10.02.26.xlsx - Page 1 Final Forecast columns
export const mockForecasts: Record<string, Forecast> = {
  'tranters-76': {
    projectId: 'tranters-76',
    forecastCost: 1513821,
    forecastGrossProfit: 270244,
    forecastGpPercent: 15.15,
    monthYear: '2026-02',
  },
  'mawson-53': {
    projectId: 'mawson-53',
    forecastCost: 1058634,
    forecastGrossProfit: 236400,
    forecastGpPercent: 18.25,
    monthYear: '2026-02',
  },
  'tranters-17': {
    projectId: 'tranters-17',
    forecastCost: 992051,
    forecastGrossProfit: 205910,
    forecastGpPercent: 17.19,
    monthYear: '2026-02',
  },
  'yorkville-5': {
    projectId: 'yorkville-5',
    forecastCost: 804283,
    forecastGrossProfit: 181555,
    forecastGpPercent: 18.42,
    monthYear: '2026-02',
  },
  'exley-3': {
    projectId: 'exley-3',
    forecastCost: 806962,
    forecastGrossProfit: 202988,
    forecastGpPercent: 20.10,
    monthYear: '2026-02',
  },
  'sterculia-106': {
    projectId: 'sterculia-106',
    forecastCost: 917410,
    forecastGrossProfit: 216372,
    forecastGpPercent: 19.08,
    monthYear: '2026-02',
  },
  'yallambie-5': {
    projectId: 'yallambie-5',
    forecastCost: 1016186,
    forecastGrossProfit: 240637,
    forecastGpPercent: 19.15,
    monthYear: '2026-02',
  },
  'ferneydell-29': {
    projectId: 'ferneydell-29',
    forecastCost: 1030789,
    forecastGrossProfit: 221887,
    forecastGpPercent: 17.71,
    monthYear: '2026-02',
  },
  'melaleuca-23': {
    projectId: 'melaleuca-23',
    forecastCost: 900343,
    forecastGrossProfit: 153824,
    forecastGpPercent: 14.59,
    monthYear: '2026-02',
  },
  'stadcor-48': {
    projectId: 'stadcor-48',
    forecastCost: 878605,
    forecastGrossProfit: 187412,
    forecastGpPercent: 17.58,
    monthYear: '2026-02',
  },
  'royal-59': {
    projectId: 'royal-59',
    forecastCost: 896863,
    forecastGrossProfit: 199626,
    forecastGpPercent: 18.21,
    monthYear: '2026-02',
  },
  'faringdon-11': {
    projectId: 'faringdon-11',
    forecastCost: 1906727,
    forecastGrossProfit: 442226,
    forecastGpPercent: 18.83,
    monthYear: '2026-02',
  },
  'dianella-14': {
    projectId: 'dianella-14',
    forecastCost: 1065095,
    forecastGrossProfit: 221913,
    forecastGpPercent: 17.24,
    monthYear: '2026-02',
  },
  'tranters-117a': {
    projectId: 'tranters-117a',
    forecastCost: 2963500,
    forecastGrossProfit: 381411,
    forecastGpPercent: 11.40,
    monthYear: '2026-02',
  },
  'durimbil-28': {
    projectId: 'durimbil-28',
    forecastCost: 1641708,
    forecastGrossProfit: 187383,
    forecastGpPercent: 10.24,
    monthYear: '2026-02',
  },
};

// Timing data from Metrics_10.02.26.xlsx project detail pages
export const mockTimings: Record<string, Timing> = {
  'tranters-76': {
    projectId: 'tranters-76',
    contractDays: 365,
    workingDays: 237,
    eotDays: 41,
    daysLost: 79,
    daysUsed: 228,
    startDate: '2025-02-13',
    contractCompletionDate: '2026-02-04',
    revisedCompletionDate: '2026-04-02',
  },
  'mawson-53': {
    projectId: 'mawson-53',
    contractDays: 365,
    workingDays: 237,
    eotDays: 2,
    daysLost: 21,
    daysUsed: 187,
    startDate: '2024-12-16',
    contractCompletionDate: '2025-12-05',
    revisedCompletionDate: '2025-12-09',
  },
  'tranters-17': {
    projectId: 'tranters-17',
    contractDays: 365,
    workingDays: 237,
    eotDays: 0,
    daysLost: 0,
    daysUsed: 229,
    startDate: '2024-06-01',
    contractCompletionDate: '2025-12-04',
    revisedCompletionDate: '2025-12-04',
  },
  'yorkville-5': {
    projectId: 'yorkville-5',
    contractDays: 340,
    workingDays: 250,
    eotDays: 0,
    daysLost: 0,
    daysUsed: 193,
    startDate: '2024-07-01',
    contractCompletionDate: '2025-11-27',
    revisedCompletionDate: '2025-11-27',
  },
  'exley-3': {
    projectId: 'exley-3',
    contractDays: 350,
    workingDays: 260,
    eotDays: 0,
    daysLost: 0,
    daysUsed: 206,
    startDate: '2024-08-01',
    contractCompletionDate: '2025-12-05',
    revisedCompletionDate: '2025-12-05',
  },
  'sterculia-106': {
    projectId: 'sterculia-106',
    contractDays: 420,
    workingDays: 300,
    eotDays: 0,
    daysLost: 0,
    daysUsed: 264,
    startDate: '2024-04-22',
    contractCompletionDate: '2026-02-06',
    revisedCompletionDate: '2026-02-06',
  },
  'yallambie-5': {
    projectId: 'yallambie-5',
    contractDays: 380,
    workingDays: 280,
    eotDays: 0,
    daysLost: 0,
    daysUsed: 200,
    startDate: '2024-09-01',
    contractCompletionDate: '2025-11-18',
    revisedCompletionDate: '2025-11-18',
  },
  'ferneydell-29': {
    projectId: 'ferneydell-29',
    contractDays: 460,
    workingDays: 330,
    eotDays: 0,
    daysLost: 0,
    daysUsed: 296,
    startDate: '2024-05-29',
    contractCompletionDate: '2026-04-02',
    revisedCompletionDate: '2026-04-02',
  },
  'melaleuca-23': {
    projectId: 'melaleuca-23',
    contractDays: 420,
    workingDays: 310,
    eotDays: 0,
    daysLost: 0,
    daysUsed: 231,
    startDate: '2024-05-15',
    contractCompletionDate: '2026-02-12',
    revisedCompletionDate: '2026-02-12',
  },
  'stadcor-48': {
    projectId: 'stadcor-48',
    contractDays: 440,
    workingDays: 320,
    eotDays: 0,
    daysLost: 0,
    daysUsed: 240,
    startDate: '2024-07-10',
    contractCompletionDate: '2026-03-16',
    revisedCompletionDate: '2026-03-16',
  },
  'royal-59': {
    projectId: 'royal-59',
    contractDays: 460,
    workingDays: 340,
    eotDays: 0,
    daysLost: 0,
    daysUsed: 270,
    startDate: '2024-07-21',
    contractCompletionDate: '2026-04-10',
    revisedCompletionDate: '2026-04-10',
  },
  'faringdon-11': {
    projectId: 'faringdon-11',
    contractDays: 560,
    workingDays: 420,
    eotDays: 0,
    daysLost: 0,
    daysUsed: 287,
    startDate: '2024-09-22',
    contractCompletionDate: '2026-07-02',
    revisedCompletionDate: '2026-07-02',
  },
  'dianella-14': {
    projectId: 'dianella-14',
    contractDays: 365,
    workingDays: 237,
    eotDays: 0,
    daysLost: 0,
    daysUsed: 120,
    startDate: '2025-06-01',
    contractCompletionDate: '2026-06-01',
    revisedCompletionDate: '2026-06-01',
  },
  'tranters-117a': {
    projectId: 'tranters-117a',
    contractDays: 480,
    workingDays: 350,
    eotDays: 0,
    daysLost: 0,
    daysUsed: 343,
    startDate: '2024-12-11',
    contractCompletionDate: '2026-04-30',
    revisedCompletionDate: '2026-04-30',
  },
  'durimbil-28': {
    projectId: 'durimbil-28',
    contractDays: 400,
    workingDays: 290,
    eotDays: 0,
    daysLost: 0,
    daysUsed: 180,
    startDate: '2025-01-15',
    contractCompletionDate: '2026-06-15',
    revisedCompletionDate: '2026-06-15',
  },
};

// Cumulative claims to date from Metrics_10.02.26.xlsx Page 1 "Claims to Date" column
export const mockCumulativeClaims: Record<string, number> = {
  'tranters-76': 1587915,
  'mawson-53': 1295034,
  'tranters-17': 1197961,
  'yorkville-5': 985838,
  'exley-3': 1009950,
  'sterculia-106': 1133782,
  'yallambie-5': 1256823,
  'ferneydell-29': 1065701,
  'melaleuca-23': 899590,
  'stadcor-48': 672292,
  'royal-59': 718587,
  'faringdon-11': 518916,
  'dianella-14': 259654,
  'tranters-117a': 2408548,
  'durimbil-28': 365818,
};

// February 2026 monthly claims (estimated from prior/current column differences)
export const mockMonthlyClaims: Record<string, number> = {
  'tranters-76': 89894,      // $1,498,021 → $1,587,915
  'mawson-53': 0,            // Fully claimed
  'tranters-17': 0,          // Fully claimed
  'yorkville-5': 0,          // Fully claimed
  'exley-3': 0,              // Fully claimed
  'sterculia-106': 0,        // Fully claimed
  'yallambie-5': 0,          // Fully claimed
  'ferneydell-29': 186975,   // Remaining work in progress
  'melaleuca-23': 154577,    // Remaining work in progress
  'stadcor-48': 120000,      // Enclosed stage claims
  'royal-59': 130000,        // Enclosed stage claims
  'faringdon-11': 350000,    // Base stage, large project
  'dianella-14': 80000,      // Base stage
  'tranters-117a': 280000,   // Enclosed stage, large project
  'durimbil-28': 120000,     // Base stage
};

export const mockSiteManagerActivities: SiteManagerActivity[] = [
  // ROBBIE - 3 projects (17 Tranters, 106 Sterculia, 11 Faringdon, 117A Tranters)
  {
    id: 'SMA-001',
    projectId: 'tranters-17',
    siteManager: 'ROBBIE',
    fortnightStart: '2026-02-01',
    fortnightEnd: '2026-02-14',
    clientMessageSent: true,
    photoUploads: 4,
    hsWalkthroughCompleted: true,
  },
  {
    id: 'SMA-002',
    projectId: 'sterculia-106',
    siteManager: 'ROBBIE',
    fortnightStart: '2026-02-01',
    fortnightEnd: '2026-02-14',
    clientMessageSent: true,
    photoUploads: 8,
    hsWalkthroughCompleted: false,
  },
  {
    id: 'SMA-003',
    projectId: 'faringdon-11',
    siteManager: 'ROBBIE',
    fortnightStart: '2026-02-01',
    fortnightEnd: '2026-02-14',
    clientMessageSent: true,
    photoUploads: 10,
    hsWalkthroughCompleted: true,
  },
  {
    id: 'SMA-004',
    projectId: 'tranters-117a',
    siteManager: 'ROBBIE',
    fortnightStart: '2026-02-01',
    fortnightEnd: '2026-02-14',
    clientMessageSent: false,
    photoUploads: 3,
    hsWalkthroughCompleted: true,
  },
  // BRIAN - 3 projects (76 Tranters, 14 Dianella, 28 Durimbil)
  {
    id: 'SMA-005',
    projectId: 'tranters-76',
    siteManager: 'BRIAN',
    fortnightStart: '2026-02-01',
    fortnightEnd: '2026-02-14',
    clientMessageSent: true,
    photoUploads: 7,
    hsWalkthroughCompleted: true,
  },
  {
    id: 'SMA-006',
    projectId: 'dianella-14',
    siteManager: 'BRIAN',
    fortnightStart: '2026-02-01',
    fortnightEnd: '2026-02-14',
    clientMessageSent: true,
    photoUploads: 5,
    hsWalkthroughCompleted: true,
  },
  {
    id: 'SMA-007',
    projectId: 'durimbil-28',
    siteManager: 'BRIAN',
    fortnightStart: '2026-02-01',
    fortnightEnd: '2026-02-14',
    clientMessageSent: false,
    photoUploads: 0,
    hsWalkthroughCompleted: false,
  },
  // JUSTIN - 5 projects (53 Mawson, 3 Exley, 29 Ferneydell, 48 Stadcor, 59 Royal)
  {
    id: 'SMA-008',
    projectId: 'mawson-53',
    siteManager: 'JUSTIN',
    fortnightStart: '2026-02-01',
    fortnightEnd: '2026-02-14',
    clientMessageSent: true,
    photoUploads: 3,
    hsWalkthroughCompleted: false,
  },
  {
    id: 'SMA-009',
    projectId: 'exley-3',
    siteManager: 'JUSTIN',
    fortnightStart: '2026-02-01',
    fortnightEnd: '2026-02-14',
    clientMessageSent: false,
    photoUploads: 2,
    hsWalkthroughCompleted: true,
  },
  {
    id: 'SMA-010',
    projectId: 'ferneydell-29',
    siteManager: 'JUSTIN',
    fortnightStart: '2026-02-01',
    fortnightEnd: '2026-02-14',
    clientMessageSent: true,
    photoUploads: 5,
    hsWalkthroughCompleted: true,
  },
  {
    id: 'SMA-011',
    projectId: 'stadcor-48',
    siteManager: 'JUSTIN',
    fortnightStart: '2026-02-01',
    fortnightEnd: '2026-02-14',
    clientMessageSent: true,
    photoUploads: 4,
    hsWalkthroughCompleted: true,
  },
  {
    id: 'SMA-012',
    projectId: 'royal-59',
    siteManager: 'JUSTIN',
    fortnightStart: '2026-02-01',
    fortnightEnd: '2026-02-14',
    clientMessageSent: true,
    photoUploads: 6,
    hsWalkthroughCompleted: true,
  },
  // JULES - 3 projects (5 Yorkville, 5 Yallambie, 23 Melaleuca)
  {
    id: 'SMA-013',
    projectId: 'yorkville-5',
    siteManager: 'JULES',
    fortnightStart: '2026-02-01',
    fortnightEnd: '2026-02-14',
    clientMessageSent: true,
    photoUploads: 5,
    hsWalkthroughCompleted: true,
  },
  {
    id: 'SMA-014',
    projectId: 'yallambie-5',
    siteManager: 'JULES',
    fortnightStart: '2026-02-01',
    fortnightEnd: '2026-02-14',
    clientMessageSent: false,
    photoUploads: 0,
    hsWalkthroughCompleted: false,
  },
  {
    id: 'SMA-015',
    projectId: 'melaleuca-23',
    siteManager: 'JULES',
    fortnightStart: '2026-02-01',
    fortnightEnd: '2026-02-14',
    clientMessageSent: true,
    photoUploads: 4,
    hsWalkthroughCompleted: true,
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
    const claimProgress = cumulativeClaimsExGst / project.contractValueExGst;
    const impliedGpPercent = forecast 
      ? claimProgress * forecast.forecastGpPercent
      : 0;
    
    // Calculate variance from target (18%)
    const gpVariancePercent = forecast.forecastGpPercent - magicEquationConfig.gpPercentTarget;
    const gpVarianceDollars = (gpVariancePercent / 100) * project.contractValueExGst;
    
    // Determine schedule status based on days lost
    let scheduleStatus: 'ahead' | 'on-time' | 'behind' = 'on-time';
    if (timing.daysLost > 15) {
      scheduleStatus = 'behind';
    } else if (timing.daysLost < 0 || (timing.daysLost === 0 && timing.eotDays === 0)) {
      scheduleStatus = 'ahead';
    } else if (timing.daysLost > 5) {
      scheduleStatus = 'behind';
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
  // Fixed overheads: 10.5% of the $1.65M magic equation target = $173,250/month
  const fixedMonthlyOverheads = config.monthlyRevenueTarget * (config.overheadPercent / 100);
  const pureProfit = totalGrossProfit - fixedMonthlyOverheads;
  
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
    overheads: fixedMonthlyOverheads,
    pureProfit,
    pureProfitStatus,
  };
}

// Get current month KPI data - February 2026 from Metrics_10.02.26.xlsx
// Total builds: $15,481,755, Total forecast GP: $2,759,081
// Weighted average margin: 18.17%, Average margin: 17.85%
export function getCurrentKPIData() {
  // Sum of Feb 2026 monthly claims
  const totalMonthlyRevenue = Object.values(mockMonthlyClaims).reduce((sum, v) => sum + v, 0);
  // Using weighted average margin of 17.85% from Metrics file
  const avgGpPercent = 17.85;
  const totalMonthlyGrossProfit = totalMonthlyRevenue * (avgGpPercent / 100);
  
  return calculateKPIData(totalMonthlyRevenue, totalMonthlyGrossProfit, magicEquationConfig);
}

// Fortnight 1 data (Feb 1-14, 2026)
export function getFortnight1KPIData() {
  // Approximately 45% of monthly claims in first fortnight
  const totalMonthlyRevenue = Object.values(mockMonthlyClaims).reduce((sum, v) => sum + v, 0);
  const totalRevenue = totalMonthlyRevenue * 0.45;
  const avgGpPercent = 17.85;
  const totalGrossProfit = totalRevenue * (avgGpPercent / 100);
  
  return calculateKPIData(totalRevenue, totalGrossProfit, magicEquationConfig);
}

// Previous fortnight data (Jan 15-31, 2026)
export function getPreviousFortnightKPIData() {
  // January second half estimate from claims data: ~$660K
  const totalRevenue = 660000;
  const avgGpPercent = 17.80;
  const totalGrossProfit = totalRevenue * (avgGpPercent / 100);
  
  return calculateKPIData(totalRevenue, totalGrossProfit, magicEquationConfig);
}
