// Real data from LanCon Excel files (Metrics_14.08.25.xlsx and Copy_of_LanCon_Claims_Schedule.xlsx)

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

// Real projects from the Metrics file
export const mockProjects: Project[] = [
  {
    id: 'baroona-47',
    jobName: '47 Baroona Road',
    clientName: 'Client',
    address: '47 Baroona Road, Milton',
    siteManager: 'ROBBIE',
    contractValueExGst: 1213646,
    contractValueIncGst: 1335010.60,
    startDate: '2024-07-16',
    pcDate: '2025-06-27',
    status: 'Active',
    currentStage: 'PC',
  },
  {
    id: 'beeby-40',
    jobName: '40 Beeby Street',
    clientName: 'Client',
    address: '40 Beeby Street, Wavell Heights',
    siteManager: 'BRIAN',
    contractValueExGst: 1676475,
    contractValueIncGst: 1844122.50,
    startDate: '2024-07-08',
    pcDate: '2025-05-30',
    status: 'Active',
    currentStage: 'PC',
  },
  {
    id: 'sumar-9',
    jobName: '9 Sumar St',
    clientName: 'Client',
    address: '9 Sumar St, Wavell Heights',
    siteManager: 'JUSTIN',
    contractValueExGst: 1177170,
    contractValueIncGst: 1294887,
    startDate: '2024-08-01',
    pcDate: '2025-07-28',
    status: 'Active',
    currentStage: 'PC',
  },
  {
    id: 'pangeza-34',
    jobName: '34 Pangeza Street',
    clientName: 'Client',
    address: '34 Pangeza Street, Stafford Heights',
    siteManager: 'JUSTIN',
    contractValueExGst: 1305692,
    contractValueIncGst: 1436261.20,
    startDate: '2024-06-15',
    pcDate: '2025-08-05',
    status: 'Active',
    currentStage: 'PC',
  },
  {
    id: 'tranters-76',
    jobName: '76 Tranters Ave',
    clientName: 'Ben Dugdell & Josephine Sum',
    address: '76 Tranters Ave, Camp Hill',
    siteManager: 'BRIAN',
    contractValueExGst: 1745937,
    contractValueIncGst: 1920530.70,
    startDate: '2024-02-13',
    pcDate: '2025-12-08',
    status: 'Active',
    currentStage: 'Fixing',
  },
  {
    id: 'durimbil-26',
    jobName: '26 Durimbil St',
    clientName: 'Client',
    address: '26 Durimbil St, Camp Hill',
    siteManager: 'BRIAN',
    contractValueExGst: 1558531,
    contractValueIncGst: 1714384.10,
    startDate: '2024-04-01',
    pcDate: '2025-09-23',
    status: 'Active',
    currentStage: 'Fixing',
  },
  {
    id: 'mawson-53',
    jobName: '53 Mawson St',
    clientName: 'Client',
    address: '53 Mawson St, Kedron',
    siteManager: 'JUSTIN',
    contractValueExGst: 1294635,
    contractValueIncGst: 1424098.50,
    startDate: '2024-05-01',
    pcDate: '2025-10-01',
    status: 'Active',
    currentStage: 'Enclosed',
  },
  {
    id: 'tranters-17',
    jobName: '17 Tranters Ave',
    clientName: 'Client',
    address: '17 Tranters Ave, Camp Hill',
    siteManager: 'ROBBIE',
    contractValueExGst: 1165923,
    contractValueIncGst: 1282515.30,
    startDate: '2024-06-01',
    pcDate: '2025-11-18',
    status: 'Active',
    currentStage: 'Frame',
  },
  {
    id: 'yorkville-5',
    jobName: '5 Yorkville Place',
    clientName: 'Client',
    address: '5 Yorkville Place, Carina',
    siteManager: 'JULES',
    contractValueExGst: 985171,
    contractValueIncGst: 1083688.10,
    startDate: '2024-07-01',
    pcDate: '2025-10-15',
    status: 'Active',
    currentStage: 'Enclosed',
  },
  {
    id: 'exley-3',
    jobName: '3 Exley Street',
    clientName: 'Client',
    address: '3 Exley Street, Kedron',
    siteManager: 'JUSTIN',
    contractValueExGst: 978630,
    contractValueIncGst: 1076493,
    startDate: '2024-08-01',
    pcDate: '2025-11-26',
    status: 'Active',
    currentStage: 'Enclosed',
  },
  {
    id: 'sterculia-106',
    jobName: '106 Sterculia Ave',
    clientName: 'Gino Pippia & Sandra Pelusi',
    address: '106 Sterculia Ave, Holland Park West',
    siteManager: 'ROBBIE',
    contractValueExGst: 1130493,
    contractValueIncGst: 1243542.30,
    startDate: '2024-04-22',
    pcDate: '2026-01-20',
    status: 'Active',
    currentStage: 'PC',
  },
  {
    id: 'yallambie-5',
    jobName: '5 Yallambie Court',
    clientName: 'Client',
    address: '5 Yallambie Court, Bunya',
    siteManager: 'JULES',
    contractValueExGst: 1196732,
    contractValueIncGst: 1316405.20,
    startDate: '2024-09-01',
    pcDate: '2025-11-19',
    status: 'Active',
    currentStage: 'Frame',
  },
  {
    id: 'ferneydell-29',
    jobName: '29 Ferneydell St',
    clientName: 'Jeremy & Susan Ross',
    address: '29 Ferneydell St, Ashgrove',
    siteManager: 'JUSTIN',
    contractValueExGst: 1250190,
    contractValueIncGst: 1375209,
    startDate: '2024-05-29',
    pcDate: '2026-03-24',
    status: 'Active',
    currentStage: 'Fixing',
  },
  {
    id: 'melaleuca-23',
    jobName: '23 Melaleuca Place',
    clientName: 'David Crandon & Ellie Rowe',
    address: '23 Melaleuca Place, Keperra',
    siteManager: 'JULES',
    contractValueExGst: 1017275,
    contractValueIncGst: 1119002.50,
    startDate: '2024-05-15',
    pcDate: '2026-01-15',
    status: 'Active',
    currentStage: 'Fixing',
  },
  {
    id: 'stadcor-48',
    jobName: '48 Stadcor Street',
    clientName: 'Ryan & Dominique Halloran',
    address: '48 Stadcor Street, Wavell Heights',
    siteManager: 'JUSTIN',
    contractValueExGst: 1094996,
    contractValueIncGst: 1204495.60,
    startDate: '2024-07-10',
    pcDate: '2026-03-12',
    status: 'Active',
    currentStage: 'Enclosed',
  },
  {
    id: 'tranters-117a',
    jobName: '117A Tranters Ave',
    clientName: 'Client',
    address: '117A Tranters Ave, Camp Hill',
    siteManager: 'ROBBIE',
    contractValueExGst: 2626730,
    contractValueIncGst: 2889403,
    startDate: '2024-12-11',
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
    contractValueExGst: 1093489,
    contractValueIncGst: 1202837.90,
    startDate: '2024-07-21',
    pcDate: '2026-04-03',
    status: 'Active',
    currentStage: 'Enclosed',
  },
  {
    id: 'faringdon-11',
    jobName: '11 Faringdon St',
    clientName: 'Danny & Amy Tsai',
    address: '11 Faringdon St, Robertson',
    siteManager: 'ROBBIE',
    contractValueExGst: 2258644,
    contractValueIncGst: 2484508.40,
    startDate: '2024-09-22',
    pcDate: '2026-09-13',
    status: 'Active',
    currentStage: 'Base',
  },
];

// Forecast data from Metrics file
export const mockForecasts: Record<string, Forecast> = {
  'baroona-47': {
    projectId: 'baroona-47',
    forecastCost: 979837,
    forecastGrossProfit: 233809,
    forecastGpPercent: 19.27,
    monthYear: '2025-02',
  },
  'beeby-40': {
    projectId: 'beeby-40',
    forecastCost: 1363271,
    forecastGrossProfit: 313204,
    forecastGpPercent: 18.68,
    monthYear: '2025-02',
  },
  'sumar-9': {
    projectId: 'sumar-9',
    forecastCost: 924011,
    forecastGrossProfit: 253159,
    forecastGpPercent: 21.51,
    monthYear: '2025-02',
  },
  'pangeza-34': {
    projectId: 'pangeza-34',
    forecastCost: 1063283,
    forecastGrossProfit: 242409,
    forecastGpPercent: 18.57,
    monthYear: '2025-02',
  },
  'tranters-76': {
    projectId: 'tranters-76',
    forecastCost: 1403917,
    forecastGrossProfit: 342020,
    forecastGpPercent: 19.59,
    monthYear: '2025-02',
  },
  'durimbil-26': {
    projectId: 'durimbil-26',
    forecastCost: 1264805,
    forecastGrossProfit: 293726,
    forecastGpPercent: 18.85,
    monthYear: '2025-02',
  },
  'mawson-53': {
    projectId: 'mawson-53',
    forecastCost: 1057782,
    forecastGrossProfit: 236853,
    forecastGpPercent: 18.29,
    monthYear: '2025-02',
  },
  'tranters-17': {
    projectId: 'tranters-17',
    forecastCost: 955092,
    forecastGrossProfit: 210831,
    forecastGpPercent: 18.08,
    monthYear: '2025-02',
  },
  'yorkville-5': {
    projectId: 'yorkville-5',
    forecastCost: 790494,
    forecastGrossProfit: 194677,
    forecastGpPercent: 19.76,
    monthYear: '2025-02',
  },
  'exley-3': {
    projectId: 'exley-3',
    forecastCost: 791125,
    forecastGrossProfit: 187505,
    forecastGpPercent: 19.16,
    monthYear: '2025-02',
  },
  'sterculia-106': {
    projectId: 'sterculia-106',
    forecastCost: 916724,
    forecastGrossProfit: 213769,
    forecastGpPercent: 18.91,
    monthYear: '2025-02',
  },
  'yallambie-5': {
    projectId: 'yallambie-5',
    forecastCost: 970318,
    forecastGrossProfit: 226414,
    forecastGpPercent: 18.92,
    monthYear: '2025-02',
  },
  'ferneydell-29': {
    projectId: 'ferneydell-29',
    forecastCost: 1029578,
    forecastGrossProfit: 220612,
    forecastGpPercent: 17.65,
    monthYear: '2025-02',
  },
  'melaleuca-23': {
    projectId: 'melaleuca-23',
    forecastCost: 848910,
    forecastGrossProfit: 168365,
    forecastGpPercent: 16.55,
    monthYear: '2025-02',
  },
  'stadcor-48': {
    projectId: 'stadcor-48',
    forecastCost: 902223,
    forecastGrossProfit: 192773,
    forecastGpPercent: 17.60,
    monthYear: '2025-02',
  },
  'tranters-117a': {
    projectId: 'tranters-117a',
    forecastCost: 2353060,
    forecastGrossProfit: 273670,
    forecastGpPercent: 10.42,
    monthYear: '2025-02',
  },
  'royal-59': {
    projectId: 'royal-59',
    forecastCost: 898515,
    forecastGrossProfit: 194974,
    forecastGpPercent: 17.83,
    monthYear: '2025-02',
  },
  'faringdon-11': {
    projectId: 'faringdon-11',
    forecastCost: 1850447,
    forecastGrossProfit: 408197,
    forecastGpPercent: 18.07,
    monthYear: '2025-02',
  },
};

// Timing data from Metrics file (days lost/remaining)
export const mockTimings: Record<string, Timing> = {
  'baroona-47': {
    projectId: 'baroona-47',
    contractDays: 308,
    workingDays: 220,
    eotDays: 27,
    daysLost: 0,
    daysUsed: 203,
    startDate: '2024-07-16',
    contractCompletionDate: '2025-06-12',
    revisedCompletionDate: '2025-07-21',
  },
  'beeby-40': {
    projectId: 'beeby-40',
    contractDays: 386,
    workingDays: 260,
    eotDays: 35,
    daysLost: 0,
    daysUsed: 180,
    startDate: '2024-07-08',
    contractCompletionDate: '2025-07-30',
    revisedCompletionDate: '2025-09-18',
  },
  'sumar-9': {
    projectId: 'sumar-9',
    contractDays: 320,
    workingDays: 240,
    eotDays: 0,
    daysLost: 0,
    daysUsed: 186,
    startDate: '2024-08-01',
    contractCompletionDate: '2025-07-28',
    revisedCompletionDate: '2025-07-28',
  },
  'pangeza-34': {
    projectId: 'pangeza-34',
    contractDays: 340,
    workingDays: 250,
    eotDays: 0,
    daysLost: 2,
    daysUsed: 212,
    startDate: '2024-06-15',
    contractCompletionDate: '2025-08-05',
    revisedCompletionDate: '2025-08-07',
  },
  'tranters-76': {
    projectId: 'tranters-76',
    contractDays: 450,
    workingDays: 320,
    eotDays: 21,
    daysLost: 9,
    daysUsed: 238,
    startDate: '2024-02-13',
    contractCompletionDate: '2025-12-08',
    revisedCompletionDate: '2025-12-29',
  },
  'durimbil-26': {
    projectId: 'durimbil-26',
    contractDays: 380,
    workingDays: 270,
    eotDays: 14,
    daysLost: 0,
    daysUsed: 212,
    startDate: '2024-04-01',
    contractCompletionDate: '2025-09-23',
    revisedCompletionDate: '2025-10-07',
  },
  'mawson-53': {
    projectId: 'mawson-53',
    contractDays: 360,
    workingDays: 260,
    eotDays: 10,
    daysLost: 15,
    daysUsed: 210,
    startDate: '2024-05-01',
    contractCompletionDate: '2025-10-01',
    revisedCompletionDate: '2025-10-11',
  },
  'tranters-17': {
    projectId: 'tranters-17',
    contractDays: 400,
    workingDays: 290,
    eotDays: 7,
    daysLost: 5,
    daysUsed: 279,
    startDate: '2024-06-01',
    contractCompletionDate: '2025-11-18',
    revisedCompletionDate: '2025-11-25',
  },
  'yorkville-5': {
    projectId: 'yorkville-5',
    contractDays: 340,
    workingDays: 250,
    eotDays: 0,
    daysLost: 0,
    daysUsed: 162,
    startDate: '2024-07-01',
    contractCompletionDate: '2025-10-15',
    revisedCompletionDate: '2025-10-15',
  },
  'exley-3': {
    projectId: 'exley-3',
    contractDays: 350,
    workingDays: 260,
    eotDays: 14,
    daysLost: 29,
    daysUsed: 209,
    startDate: '2024-08-01',
    contractCompletionDate: '2025-11-26',
    revisedCompletionDate: '2025-12-10',
  },
  'sterculia-106': {
    projectId: 'sterculia-106',
    contractDays: 420,
    workingDays: 300,
    eotDays: 21,
    daysLost: 25,
    daysUsed: 251,
    startDate: '2024-04-22',
    contractCompletionDate: '2026-01-20',
    revisedCompletionDate: '2026-02-10',
  },
  'yallambie-5': {
    projectId: 'yallambie-5',
    contractDays: 380,
    workingDays: 280,
    eotDays: 14,
    daysLost: 22,
    daysUsed: 204,
    startDate: '2024-09-01',
    contractCompletionDate: '2025-11-19',
    revisedCompletionDate: '2025-12-03',
  },
  'ferneydell-29': {
    projectId: 'ferneydell-29',
    contractDays: 460,
    workingDays: 330,
    eotDays: 21,
    daysLost: 6,
    daysUsed: 296,
    startDate: '2024-05-29',
    contractCompletionDate: '2026-03-24',
    revisedCompletionDate: '2026-04-14',
  },
  'melaleuca-23': {
    projectId: 'melaleuca-23',
    contractDays: 420,
    workingDays: 310,
    eotDays: 28,
    daysLost: 53,
    daysUsed: 231,
    startDate: '2024-05-15',
    contractCompletionDate: '2026-01-15',
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
    contractCompletionDate: '2026-03-12',
    revisedCompletionDate: '2026-03-12',
  },
  'tranters-117a': {
    projectId: 'tranters-117a',
    contractDays: 380,
    workingDays: 280,
    eotDays: 35,
    daysLost: 26,
    daysUsed: 343,
    startDate: '2024-12-11',
    contractCompletionDate: '2026-03-16',
    revisedCompletionDate: '2026-04-20',
  },
  'royal-59': {
    projectId: 'royal-59',
    contractDays: 460,
    workingDays: 340,
    eotDays: 0,
    daysLost: 0,
    daysUsed: 270,
    startDate: '2024-07-21',
    contractCompletionDate: '2026-04-03',
    revisedCompletionDate: '2026-04-03',
  },
  'faringdon-11': {
    projectId: 'faringdon-11',
    contractDays: 560,
    workingDays: 420,
    eotDays: 21,
    daysLost: -1, // Ahead of schedule
    daysUsed: 287,
    startDate: '2024-09-22',
    contractCompletionDate: '2026-09-13',
    revisedCompletionDate: '2026-10-04',
  },
};

// Monthly claims data (February 2025) from Claims Schedule
export const mockMonthlyClaims: Record<string, number> = {
  'baroona-47': 0, // Already at PC
  'beeby-40': 0, // Already at PC
  'sumar-9': 0, // Already at PC
  'pangeza-34': 0, // Already at PC
  'tranters-76': 169125, // PC claim due
  'durimbil-26': 0,
  'mawson-53': 0,
  'tranters-17': 0,
  'yorkville-5': 0,
  'exley-3': 0,
  'sterculia-106': 188374, // PC claim Feb
  'yallambie-5': 0,
  'ferneydell-29': 274230, // Fixing claim Feb
  'melaleuca-23': 0,
  'stadcor-48': 247484, // Fixing claim Feb
  'tranters-117a': 240000, // Fixing claim Feb
  'royal-59': 237538, // Fixing claim Feb
  'faringdon-11': 503260, // Frame + variations Feb
};

// Cumulative claims to date from Metrics file
export const mockCumulativeClaims: Record<string, number> = {
  'baroona-47': 1213646,
  'beeby-40': 1676475,
  'sumar-9': 1177170,
  'pangeza-34': 1305692,
  'tranters-76': 773110,
  'durimbil-26': 1327331,
  'mawson-53': 842054,
  'tranters-17': 479678,
  'yorkville-5': 639208,
  'exley-3': 635189,
  'sterculia-106': 445498,
  'yallambie-5': 483283,
  'ferneydell-29': 314653,
  'melaleuca-23': 409134,
  'stadcor-48': 26314,
  'tranters-117a': 663093,
  'royal-59': 67756,
  'faringdon-11': 112932,
};

export const mockSiteManagerActivities: SiteManagerActivity[] = [
  // ROBBIE - 4 projects
  {
    id: 'SMA-001',
    projectId: 'baroona-47',
    siteManager: 'ROBBIE',
    fortnightStart: '2025-02-01',
    fortnightEnd: '2025-02-14',
    clientMessageSent: true,
    photoUploads: 6,
    hsWalkthroughCompleted: true,
  },
  {
    id: 'SMA-002',
    projectId: 'tranters-17',
    siteManager: 'ROBBIE',
    fortnightStart: '2025-02-01',
    fortnightEnd: '2025-02-14',
    clientMessageSent: true,
    photoUploads: 4,
    hsWalkthroughCompleted: true,
  },
  {
    id: 'SMA-003',
    projectId: 'sterculia-106',
    siteManager: 'ROBBIE',
    fortnightStart: '2025-02-01',
    fortnightEnd: '2025-02-14',
    clientMessageSent: true,
    photoUploads: 8,
    hsWalkthroughCompleted: false,
  },
  {
    id: 'SMA-004',
    projectId: 'tranters-117a',
    siteManager: 'ROBBIE',
    fortnightStart: '2025-02-01',
    fortnightEnd: '2025-02-14',
    clientMessageSent: false,
    photoUploads: 3,
    hsWalkthroughCompleted: true,
  },
  {
    id: 'SMA-005',
    projectId: 'faringdon-11',
    siteManager: 'ROBBIE',
    fortnightStart: '2025-02-01',
    fortnightEnd: '2025-02-14',
    clientMessageSent: true,
    photoUploads: 10,
    hsWalkthroughCompleted: true,
  },
  // BRIAN - 3 projects
  {
    id: 'SMA-006',
    projectId: 'beeby-40',
    siteManager: 'BRIAN',
    fortnightStart: '2025-02-01',
    fortnightEnd: '2025-02-14',
    clientMessageSent: true,
    photoUploads: 5,
    hsWalkthroughCompleted: true,
  },
  {
    id: 'SMA-007',
    projectId: 'tranters-76',
    siteManager: 'BRIAN',
    fortnightStart: '2025-02-01',
    fortnightEnd: '2025-02-14',
    clientMessageSent: true,
    photoUploads: 7,
    hsWalkthroughCompleted: true,
  },
  {
    id: 'SMA-008',
    projectId: 'durimbil-26',
    siteManager: 'BRIAN',
    fortnightStart: '2025-02-01',
    fortnightEnd: '2025-02-14',
    clientMessageSent: false,
    photoUploads: 0,
    hsWalkthroughCompleted: false,
  },
  // JUSTIN - 7 projects
  {
    id: 'SMA-009',
    projectId: 'sumar-9',
    siteManager: 'JUSTIN',
    fortnightStart: '2025-02-01',
    fortnightEnd: '2025-02-14',
    clientMessageSent: true,
    photoUploads: 4,
    hsWalkthroughCompleted: true,
  },
  {
    id: 'SMA-010',
    projectId: 'pangeza-34',
    siteManager: 'JUSTIN',
    fortnightStart: '2025-02-01',
    fortnightEnd: '2025-02-14',
    clientMessageSent: true,
    photoUploads: 6,
    hsWalkthroughCompleted: true,
  },
  {
    id: 'SMA-011',
    projectId: 'mawson-53',
    siteManager: 'JUSTIN',
    fortnightStart: '2025-02-01',
    fortnightEnd: '2025-02-14',
    clientMessageSent: true,
    photoUploads: 3,
    hsWalkthroughCompleted: false,
  },
  {
    id: 'SMA-012',
    projectId: 'exley-3',
    siteManager: 'JUSTIN',
    fortnightStart: '2025-02-01',
    fortnightEnd: '2025-02-14',
    clientMessageSent: false,
    photoUploads: 2,
    hsWalkthroughCompleted: true,
  },
  {
    id: 'SMA-013',
    projectId: 'ferneydell-29',
    siteManager: 'JUSTIN',
    fortnightStart: '2025-02-01',
    fortnightEnd: '2025-02-14',
    clientMessageSent: true,
    photoUploads: 5,
    hsWalkthroughCompleted: true,
  },
  {
    id: 'SMA-014',
    projectId: 'stadcor-48',
    siteManager: 'JUSTIN',
    fortnightStart: '2025-02-01',
    fortnightEnd: '2025-02-14',
    clientMessageSent: true,
    photoUploads: 4,
    hsWalkthroughCompleted: true,
  },
  {
    id: 'SMA-015',
    projectId: 'royal-59',
    siteManager: 'JUSTIN',
    fortnightStart: '2025-02-01',
    fortnightEnd: '2025-02-14',
    clientMessageSent: true,
    photoUploads: 6,
    hsWalkthroughCompleted: true,
  },
  // JULES - 3 projects
  {
    id: 'SMA-016',
    projectId: 'yorkville-5',
    siteManager: 'JULES',
    fortnightStart: '2025-02-01',
    fortnightEnd: '2025-02-14',
    clientMessageSent: true,
    photoUploads: 5,
    hsWalkthroughCompleted: true,
  },
  {
    id: 'SMA-017',
    projectId: 'yallambie-5',
    siteManager: 'JULES',
    fortnightStart: '2025-02-01',
    fortnightEnd: '2025-02-14',
    clientMessageSent: false,
    photoUploads: 0,
    hsWalkthroughCompleted: false,
  },
  {
    id: 'SMA-018',
    projectId: 'melaleuca-23',
    siteManager: 'JULES',
    fortnightStart: '2025-02-01',
    fortnightEnd: '2025-02-14',
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

// Get current month KPI data from real February 2025 claims
export function getCurrentKPIData() {
  // February 2025 total claims from Claims Schedule: ~$2.57M
  const totalMonthlyRevenue = 2569293; // From row 122 of Claims Schedule
  // Using weighted average margin of 18.21% from Metrics file
  const avgGpPercent = 18.21;
  const totalMonthlyGrossProfit = totalMonthlyRevenue * (avgGpPercent / 100);
  
  return calculateKPIData(totalMonthlyRevenue, totalMonthlyGrossProfit, magicEquationConfig);
}

// Fortnight 1 data (days 1-14)
export function getFortnight1KPIData() {
  // Approximately 45% of monthly claims in first fortnight
  const totalRevenue = 2569293 * 0.45;
  const avgGpPercent = 18.1;
  const totalGrossProfit = totalRevenue * (avgGpPercent / 100);
  
  return calculateKPIData(totalRevenue, totalGrossProfit, magicEquationConfig);
}

// Previous fortnight data (Jan 15-31)
export function getPreviousFortnightKPIData() {
  // January second half: ~$651K from Claims Schedule
  const totalRevenue = 651231;
  const avgGpPercent = 17.8;
  const totalGrossProfit = totalRevenue * (avgGpPercent / 100);
  
  return calculateKPIData(totalRevenue, totalGrossProfit, magicEquationConfig);
}
