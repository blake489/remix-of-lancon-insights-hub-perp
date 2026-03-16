import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { useGoogleSheetsRevenue } from '@/hooks/useGoogleSheetsRevenue';
import { Badge } from '@/components/ui/badge';

const TARGET = 1_650_000;

const fmtAxis = (v: number) => {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
  return `$${v}`;
};

const fmtFull = (v: number) =>
  `$${v.toLocaleString('en-AU', { maximumFractionDigits: 0 })}`;

const fmtCompact = (v: number) => {
  if (Math.abs(v) >= 1_000_000) return `$${(v / 1_000_000).toFixed(2)}M`;
  if (Math.abs(v) >= 1_000) return `$${(Math.abs(v) / 1_000).toFixed(0)}K`;
  return `$${v.toFixed(0)}`;
};

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.[0]) return null;
  const revenue = payload[0].value as number;
  const diff = revenue - TARGET;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-md text-xs space-y-1">
      <p className="font-semibold text-popover-foreground">{label}</p>
      <p className="text-popover-foreground">Revenue: {fmtFull(revenue)}</p>
      <p className={diff >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'}>
        vs Target: {diff >= 0 ? '+' : '-'}{fmtFull(Math.abs(diff))}
      </p>
    </div>
  );
}

export function MonthlyRevenueChart() {
  const { data, isLoading } = useGoogleSheetsRevenue();

  if (isLoading) {
    return (
      <div className="glass-card p-6 space-y-4">
        <div className="h-4 w-64 rounded bg-muted shimmer" />
        <div className="flex gap-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-6 w-32 rounded-full bg-muted shimmer" />
          ))}
        </div>
        <div className="h-[300px] rounded bg-muted shimmer" />
      </div>
    );
  }

  if (!data) return null;

  const chartData = data.months.map(m => ({
    month: m.month,
    revenue: m.revenue,
  }));

  return (
    <div className="glass-card p-6 space-y-4">
      <h2 className="text-sm font-semibold text-foreground">
        Monthly Revenue — Claims Schedule (Excl. GST)
      </h2>

      {/* KPI chips */}
      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary" className="text-xs font-medium">
          Year Average: {fmtCompact(data.fullYearAverage)}
        </Badge>
        <Badge variant="secondary" className="text-xs font-medium">
          {data.monthsAboveTarget}/{data.totalMonthsWithData} months above target
        </Badge>
        <Badge variant="secondary" className="text-xs font-medium">
          Current month: {fmtCompact(data.currentMonthRevenue)}
        </Badge>
      </div>

      {/* Chart */}
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <XAxis
              dataKey="month"
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
              axisLine={false}
              interval={0}
              angle={-45}
              textAnchor="end"
              height={50}
            />
            <YAxis
              tickFormatter={fmtAxis}
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
              axisLine={false}
              width={55}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted) / 0.5)' }} />
            <ReferenceLine
              y={TARGET}
              stroke="hsl(35, 92%, 50%)"
              strokeDasharray="6 3"
              strokeWidth={1.5}
              label={{
                value: 'Target $1.65M',
                position: 'insideTopRight',
                fontSize: 10,
                fill: 'hsl(35, 92%, 50%)',
                fontWeight: 600,
              }}
            />
            <Bar dataKey="revenue" radius={[4, 4, 0, 0]} maxBarSize={36}>
              {chartData.map((entry, idx) => {
                let fill = '#2563a8'; // royal blue — below target
                if (entry.revenue === 0) fill = 'hsl(var(--muted-foreground) / 0.25)';
                else if (entry.revenue >= TARGET) fill = '#22c55e'; // green — at/above
                return <Cell key={idx} fill={fill} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
