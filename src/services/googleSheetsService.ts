const SPREADSHEET_ID = '1kl9P01zn0CduZ1rj4A0nHY0oscUmudEPdpLVftU8XGs';
const API_KEY = import.meta.env.VITE_GOOGLE_SHEETS_API_KEY;
const RANGE = 'Updated!A510:ZZ510';
const SHEETS_URL = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${RANGE}?key=${API_KEY}`;

const MAGIC_EQUATION_TARGET = 1_650_000;

const MONTH_LABELS = [
  'Jul 25', 'Aug 25', 'Sep 25', 'Oct 25', 'Nov 25', 'Dec 25',
  'Jan 26', 'Feb 26', 'Mar 26', 'Apr 26', 'May 26', 'Jun 26',
  'Jul 26', 'Aug 26', 'Sep 26', 'Oct 26', 'Nov 26', 'Dec 26',
  'Jan 27', 'Feb 27', 'Mar 27', 'Apr 27', 'May 27', 'Jun 27',
];

const MOCK_DATA: MonthRevenue[] = [
  { month: 'May 25', revenue: 1420000 },
  { month: 'Jun 25', revenue: 2100000 },
  { month: 'Jul 25', revenue: 2800000 },
  { month: 'Aug 25', revenue: 2950000 },
  { month: 'Sep 25', revenue: 0 },
  { month: 'Oct 25', revenue: 2200000 },
  { month: 'Nov 25', revenue: 2650000 },
  { month: 'Dec 25', revenue: 1800000 },
  { month: 'Jan 26', revenue: 354000 },
  { month: 'Feb 26', revenue: 2100000 },
  { month: 'Mar 26', revenue: 2450019 },
];

function parseRevenue(raw: unknown): number {
  if (raw == null || raw === '') return 0;
  const str = String(raw).replace(/[$,\s]/g, '');
  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
}

export interface MonthRevenue {
  month: string;
  revenue: number;
}

export interface MonthlyRevenueData {
  months: MonthRevenue[];
  currentMonthRevenue: number;
  currentMonthLabel: string;
  fullYearAverage: number;
  monthsAboveTarget: number;
  totalMonthsWithData: number;
  magicEquationTarget: number;
  isMockData: boolean;
}

function buildSummary(months: MonthRevenue[], isMockData: boolean): MonthlyRevenueData {
  const withData = months.filter(m => m.revenue > 0);
  const totalMonthsWithData = withData.length;
  const sum = withData.reduce((acc, m) => acc + m.revenue, 0);
  const fullYearAverage = totalMonthsWithData > 0 ? sum / totalMonthsWithData : 0;
  const monthsAboveTarget = withData.filter(m => m.revenue >= MAGIC_EQUATION_TARGET).length;
  const current = withData.length > 0 ? withData[withData.length - 1] : { month: '', revenue: 0 };

  return {
    months,
    currentMonthRevenue: current.revenue,
    currentMonthLabel: current.month,
    fullYearAverage,
    monthsAboveTarget,
    totalMonthsWithData,
    magicEquationTarget: MAGIC_EQUATION_TARGET,
    isMockData,
  };
}

export async function fetchClaimsScheduleRow510(): Promise<MonthRevenue[] | null> {
  if (!API_KEY) {
    console.warn('VITE_GOOGLE_SHEETS_API_KEY not set — using mock data');
    return MOCK_DATA;
  }

  try {
    const res = await fetch(SHEETS_URL);
    if (!res.ok) {
      console.error('Google Sheets API error:', res.status, await res.text());
      return null;
    }
    const data = await res.json();
    const row: unknown[] = data.values?.[0] ?? [];

    const months: MonthRevenue[] = [];
    for (let i = 0; i < MONTH_LABELS.length; i++) {
      const baseIdx = 1 + i * 4;
      const valueIdx = baseIdx + 1;
      const revenue = parseRevenue(row[valueIdx]);
      months.push({ month: MONTH_LABELS[i], revenue });
    }

    return months;
  } catch (err) {
    console.error('Failed to fetch claims schedule row 510:', err);
    return null;
  }
}

export async function fetchMonthlyRevenueData(): Promise<MonthlyRevenueData | null> {
  const isMock = !API_KEY;

  if (isMock) {
    return buildSummary(MOCK_DATA, true);
  }

  const months = await fetchClaimsScheduleRow510();
  if (!months) return null;

  return buildSummary(months, false);
}
