import { useGoogleSheetsRevenue } from '@/hooks/useGoogleSheetsRevenue';
import { useProjects } from '@/hooks/useProjects';
import { useKPISettings } from '@/hooks/useKPISettings';
import { TrafficLight } from './TrafficLight';
import { formatCurrency, formatPercent } from '@/lib/formatters';
import { gpStatus, type GpThresholds, DEFAULT_GP_THRESHOLDS } from '@/lib/gpThresholds';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';

const OWN_JOBS = ['28 durimbil st', '117a tranters ave'];

type Status = 'success' | 'warning' | 'danger';

function revenueStatus(actual: number): Status {
  if (actual >= 1_650_000) return 'success';
  if (actual >= 1_300_000) return 'warning';
  return 'danger';
}

function overallStatus(rev: Status, gp: Status): { label: string; status: Status } {
  if (rev === 'danger' || gp === 'danger') return { label: 'OFF TARGET', status: 'danger' };
  if (rev === 'warning' || gp === 'warning') return { label: 'WATCH', status: 'warning' };
  return { label: 'ON TARGET', status: 'success' };
}

const statusText: Record<Status, string> = {
  success: 'text-emerald-600 dark:text-emerald-400',
  warning: 'text-amber-600 dark:text-amber-400',
  danger: 'text-destructive',
};

export function MagicEquationScorecard() {
  const { data: sheetsData, isLoading: sheetsLoading } = useGoogleSheetsRevenue();
  const { projects } = useProjects();
  const { data: kpi } = useKPISettings();

  const t: GpThresholds = kpi
    ? { green: kpi.gp_threshold_green, orange: kpi.gp_threshold_orange }
    : DEFAULT_GP_THRESHOLDS;

  const overheadTarget = 150_000;

  const activeGp = useMemo(() => {
    const active = projects.filter(
      p =>
        p.status === 'Active' &&
        !OWN_JOBS.includes(p.job_name.toLowerCase()) &&
        (p.category === 'pre_construction' || p.category === 'construction'),
    );
    const totalContract = active.reduce((s, p) => s + (p.contract_value_ex_gst || 0), 0);
    const totalProfit = active.reduce((s, p) => s + (p.forecast_gross_profit || 0), 0);
    return totalContract > 0 ? (totalProfit / totalContract) * 100 : 0;
  }, [projects]);

  const actualRevenue = sheetsData?.currentMonthRevenue ?? 0;
  const revStatus = revenueStatus(actualRevenue);
  const gpSt = gpStatus(activeGp, t);
  const overall = overallStatus(revStatus, gpSt);

  if (sheetsLoading) {
    return (
      <div className="glass-card-elevated p-6 space-y-4">
        <div className="h-4 w-48 rounded bg-muted shimmer" />
        <div className="grid gap-4 sm:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="kpi-card p-5 space-y-3">
              <div className="h-3 w-20 rounded bg-muted shimmer" />
              <div className="h-7 w-28 rounded bg-muted shimmer" />
              <div className="h-3 w-24 rounded bg-muted shimmer" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const cards: {
    label: string;
    target: string;
    actual: string;
    status: Status;
    note?: string;
  }[] = [
    {
      label: 'Revenue',
      target: '$1.65M / month',
      actual: formatCurrency(actualRevenue, true),
      status: revStatus,
      note: sheetsData?.currentMonthLabel ?? '',
    },
    {
      label: 'Gross Profit %',
      target: '18%',
      actual: formatPercent(activeGp),
      status: gpSt,
      note: 'Weighted avg (active projects)',
    },
    {
      label: 'Overheads',
      target: formatCurrency(overheadTarget, true),
      actual: formatCurrency(overheadTarget, true),
      status: 'success',
      note: 'Fixed overhead target',
    },
  ];

  return (
    <div className="glass-card-elevated p-6 space-y-4">
      <h2 className="text-sm font-semibold text-foreground">Magic Equation Scorecard</h2>

      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map(c => (
          <div key={c.label} className="kpi-card p-5 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                {c.label}
              </p>
              <TrafficLight status={c.status} size="sm" />
            </div>
            <p className="text-2xl font-bold text-foreground">{c.actual}</p>
            <p className="text-xs text-muted-foreground">
              Target: {c.target}
            </p>
            {c.note && (
              <p className="text-[10px] text-muted-foreground/70">{c.note}</p>
            )}
          </div>
        ))}
      </div>

      {/* Overall status line */}
      <div className="flex items-center gap-2 pt-1">
        <TrafficLight status={overall.status} size="sm" />
        <span className="text-xs font-semibold text-muted-foreground">Magic Equation Status:</span>
        <span className={cn('text-xs font-bold', statusText[overall.status])}>
          {overall.label}
        </span>
      </div>
    </div>
  );
}
