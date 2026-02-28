import { useMemo } from 'react';
import { ProjectRow } from '@/hooks/useProjects';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { BarChart3, DollarSign, Percent, Hash, ArrowUpDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';

const OWN_JOBS = ['28 Durimbil St', '117A Tranters Ave'];

const fmt = (v: number) => {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
  return `$${v.toFixed(0)}`;
};

const gpColor = (gp: number) => {
  if (gp >= 16) return 'text-emerald-600';
  if (gp >= 12) return 'text-amber-600';
  return 'text-red-600';
};

interface MetricProps {
  label: string;
  value: string;
  sub?: string;
  className?: string;
  icon?: React.ReactNode;
}

function Metric({ label, value, sub, className, icon }: MetricProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium uppercase tracking-wide">
        {icon}
        {label}
      </div>
      <p className={cn('text-xl font-bold tabular-nums', className)}>{value}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

const CAT_COLORS = ['hsl(220, 70%, 50%)', 'hsl(160, 60%, 45%)', 'hsl(35, 80%, 50%)'];

interface ChartRow {
  name: string;
  contract: number;
  cost: number;
  gp: number;
  gpPct: number;
  count: number;
}

function CategoryChart({ data, total }: { data: ChartRow[]; total: number }) {
  const fmtTooltip = (val: number) => `$${(val / 1_000_000).toFixed(2)}M`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6 items-center">
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} layout="vertical" margin={{ left: 10, right: 30, top: 5, bottom: 5 }}>
          <XAxis type="number" tickFormatter={(v: number) => `$${(v / 1_000_000).toFixed(1)}M`} tick={{ fontSize: 11 }} />
          <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 12, fontWeight: 600 }} />
          <RechartsTooltip
            formatter={(value: number, name: string) => [fmtTooltip(value), name === 'contract' ? 'Contract' : name === 'cost' ? 'Cost' : 'GP']}
            labelStyle={{ fontWeight: 600 }}
            contentStyle={{ borderRadius: 8, border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }}
          />
          <Bar dataKey="contract" name="Contract" radius={[0, 4, 4, 0]} barSize={28}>
            {data.map((_, i) => (
              <Cell key={i} fill={CAT_COLORS[i]} fillOpacity={0.85} />
            ))}
          </Bar>
          <Bar dataKey="cost" name="Cost" radius={[0, 4, 4, 0]} barSize={28}>
            {data.map((_, i) => (
              <Cell key={i} fill={CAT_COLORS[i]} fillOpacity={0.35} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="space-y-3">
        {data.map((d, i) => {
          const pct = total > 0 ? (d.contract / total) * 100 : 0;
          return (
            <div key={d.name} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-sm" style={{ background: CAT_COLORS[i] }} />
                  <span className="font-medium">{d.name}</span>
                </div>
                <span className="tabular-nums font-semibold">{pct.toFixed(0)}%</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, background: CAT_COLORS[i] }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>{d.count} jobs</span>
                <span className={cn('font-semibold', gpColor(d.gpPct))}>{d.gpPct.toFixed(1)}% GP</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const GP_THRESHOLD_GREEN = 16;
const GP_THRESHOLD_AMBER = 12;

function ProjectGpChart({ projects }: { projects: ProjectRow[] }) {
  const sorted = useMemo(() =>
    projects
      .filter(p => p.forecast_gp_percent > 0)
      .sort((a, b) => b.forecast_gp_percent - a.forecast_gp_percent)
      .map(p => ({
        name: p.job_name.length > 20 ? p.job_name.slice(0, 18) + '…' : p.job_name,
        fullName: p.job_name,
        gp: p.forecast_gp_percent,
      })),
    [projects]
  );

  const barFill = (gp: number) => {
    if (gp >= GP_THRESHOLD_GREEN) return 'hsl(160, 60%, 45%)';
    if (gp >= GP_THRESHOLD_AMBER) return 'hsl(35, 80%, 50%)';
    return 'hsl(0, 65%, 50%)';
  };

  const chartHeight = Math.max(200, sorted.length * 32);

  return (
    <ResponsiveContainer width="100%" height={chartHeight}>
      <BarChart data={sorted} layout="vertical" margin={{ left: 10, right: 40, top: 5, bottom: 5 }}>
        <XAxis type="number" domain={[0, 'auto']} tickFormatter={(v: number) => `${v}%`} tick={{ fontSize: 11 }} />
        <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 11, fontWeight: 500 }} />
        <RechartsTooltip
          formatter={(value: number) => [`${value.toFixed(1)}%`, 'GP%']}
          labelFormatter={(label: string, payload: any[]) => payload?.[0]?.payload?.fullName || label}
          contentStyle={{ borderRadius: 8, border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }}
        />
        <Bar dataKey="gp" name="GP%" radius={[0, 4, 4, 0]} barSize={22}>
          {sorted.map((d, i) => (
            <Cell key={i} fill={barFill(d.gp)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function PortfolioSummary({ projects }: { projects: ProjectRow[] }) {
  const metrics = useMemo(() => {
    const all = projects;
    const external = all.filter(p => !OWN_JOBS.some(name => p.job_name.includes(name)));
    const active = all.filter(p => p.status === 'Active');

    const totalCount = all.length;
    const activeCount = active.length;

    // Totals
    const totalContract = all.reduce((s, p) => s + p.contract_value_ex_gst, 0);
    const totalCost = all.reduce((s, p) => s + p.forecast_cost, 0);
    const totalGP = all.reduce((s, p) => s + p.forecast_gross_profit, 0);

    // Averages
    const avgContract = totalCount > 0 ? totalContract / totalCount : 0;
    const avgCost = totalCount > 0 ? totalCost / totalCount : 0;
    const avgGP = totalCount > 0 ? totalGP / totalCount : 0;

    // Weighted GP% (all projects)
    const allWeightedGp = totalContract > 0 ? (totalGP / totalContract) * 100 : 0;

    // Weighted GP% (excl. own jobs)
    const extContract = external.reduce((s, p) => s + p.contract_value_ex_gst, 0);
    const extGP = external.reduce((s, p) => s + p.forecast_gross_profit, 0);
    const extWeightedGp = extContract > 0 ? (extGP / extContract) * 100 : 0;

    // Simple avg GP%
    const gpValues = all.filter(p => p.forecast_gp_percent > 0).map(p => p.forecast_gp_percent);
    const simpleAvgGp = gpValues.length > 0 ? gpValues.reduce((s, v) => s + v, 0) / gpValues.length : 0;

    // Min / Max GP%
    const minGp = gpValues.length > 0 ? Math.min(...gpValues) : 0;
    const maxGp = gpValues.length > 0 ? Math.max(...gpValues) : 0;

    // Margin on Cost (total GP / total Cost)
    const marginOnCost = totalCost > 0 ? (totalGP / totalCost) * 100 : 0;

    // Total cost as % of contract
    const costPercent = totalContract > 0 ? (totalCost / totalContract) * 100 : 0;

    // By category
    const byCat = (cat: string) => {
      const cp = all.filter(p => p.category === cat);
      const cv = cp.reduce((s, p) => s + p.contract_value_ex_gst, 0);
      const gp = cp.reduce((s, p) => s + p.forecast_gross_profit, 0);
      return { count: cp.length, contract: cv, gp, weightedGp: cv > 0 ? (gp / cv) * 100 : 0 };
    };

    return {
      totalCount, activeCount,
      totalContract, totalCost, totalGP,
      avgContract, avgCost, avgGP,
      allWeightedGp, extWeightedGp, simpleAvgGp,
      minGp, maxGp, marginOnCost, costPercent,
      preCon: byCat('pre_construction'),
      construction: byCat('construction'),
      handover: byCat('handover'),
    };
  }, [projects]);

  if (projects.length === 0) return null;

  return (
    <section className="space-y-3 pt-4">
      <div className="flex items-center gap-3">
        <BarChart3 className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-bold text-foreground">Portfolio Summary</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Totals */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground flex items-center gap-1.5">
              <DollarSign className="h-3.5 w-3.5" /> Totals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Metric label="Contract Value" value={fmt(metrics.totalContract)} icon={<span />} />
            <Metric label="Forecast Cost" value={fmt(metrics.totalCost)} sub={`${metrics.costPercent.toFixed(1)}% of contract`} />
            <Metric label="Forecast GP" value={fmt(metrics.totalGP)} className="text-emerald-600" />
          </CardContent>
        </Card>

        {/* Averages */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground flex items-center gap-1.5">
              <ArrowUpDown className="h-3.5 w-3.5" /> Averages Per Project
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Metric label="Avg Contract" value={fmt(metrics.avgContract)} />
            <Metric label="Avg Cost" value={fmt(metrics.avgCost)} />
            <Metric label="Avg GP" value={fmt(metrics.avgGP)} />
          </CardContent>
        </Card>

        {/* GP Metrics */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground flex items-center gap-1.5">
              <Percent className="h-3.5 w-3.5" /> Profit Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Metric
              label="Weighted GP% (excl. own)"
              value={`${metrics.extWeightedGp.toFixed(1)}%`}
              className={gpColor(metrics.extWeightedGp)}
              sub="Revenue-weighted average"
            />
            <Metric
              label="Weighted GP% (all)"
              value={`${metrics.allWeightedGp.toFixed(1)}%`}
              className={gpColor(metrics.allWeightedGp)}
            />
            <Metric
              label="Simple Avg GP%"
              value={`${metrics.simpleAvgGp.toFixed(1)}%`}
              className={gpColor(metrics.simpleAvgGp)}
              sub="Unweighted mean"
            />
            <Metric
              label="Margin on Cost"
              value={`${metrics.marginOnCost.toFixed(1)}%`}
              sub="GP ÷ Cost"
            />
          </CardContent>
        </Card>

        {/* Range & Counts */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground flex items-center gap-1.5">
              <Hash className="h-3.5 w-3.5" /> Counts & Range
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Metric label="Total Projects" value={String(metrics.totalCount)} sub={`${metrics.activeCount} active`} />
            <Metric
              label="GP% Range"
              value={`${metrics.minGp.toFixed(1)}% – ${metrics.maxGp.toFixed(1)}%`}
              sub={`Spread: ${(metrics.maxGp - metrics.minGp).toFixed(1)}pp`}
            />
            <Separator />
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pre Construction</span>
                <span className="font-semibold">{metrics.preCon.count} jobs · {fmt(metrics.preCon.contract)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Construction</span>
                <span className="font-semibold">{metrics.construction.count} jobs · {fmt(metrics.construction.contract)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Handover</span>
                <span className="font-semibold">{metrics.handover.count} jobs · {fmt(metrics.handover.contract)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Distribution Chart */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-muted-foreground flex items-center gap-1.5">
            <BarChart3 className="h-3.5 w-3.5" /> Contract Value by Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CategoryChart
            data={[
              { name: 'Pre Construction', contract: metrics.preCon.contract, cost: metrics.preCon.contract - metrics.preCon.gp, gp: metrics.preCon.gp, gpPct: metrics.preCon.weightedGp, count: metrics.preCon.count },
              { name: 'Construction', contract: metrics.construction.contract, cost: metrics.construction.contract - metrics.construction.gp, gp: metrics.construction.gp, gpPct: metrics.construction.weightedGp, count: metrics.construction.count },
              { name: 'Handover', contract: metrics.handover.contract, cost: metrics.handover.contract - metrics.handover.gp, gp: metrics.handover.gp, gpPct: metrics.handover.weightedGp, count: metrics.handover.count },
            ]}
            total={metrics.totalContract}
          />
        </CardContent>
      </Card>

      {/* Individual Project GP% Chart */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-muted-foreground flex items-center gap-1.5">
            <Percent className="h-3.5 w-3.5" /> Project GP% Ranking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ProjectGpChart projects={projects} />
        </CardContent>
      </Card>
    </section>
  );
}
