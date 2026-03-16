import { useMemo, useState } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { useProjects } from '@/hooks/useProjects';
import { useKPISettings } from '@/hooks/useKPISettings';
import { TrafficLight } from '@/components/dashboard/TrafficLight';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { ForecastAuditTrail } from '@/components/projects/ForecastAuditTrail';
import { formatCurrency, formatPercent } from '@/lib/formatters';
import { gpStatus, type GpThresholds, DEFAULT_GP_THRESHOLDS } from '@/lib/gpThresholds';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const OWN_JOBS = ['28 durimbil st', '117a tranters ave'];

type Filter = 'all' | 'active' | 'onsite';

const borderColor: Record<'success' | 'warning' | 'danger', string> = {
  success: 'border-l-emerald-500',
  warning: 'border-l-amber-500',
  danger: 'border-l-red-500',
};

const GPHealthBoard = () => {
  const { projects, isLoading } = useProjects();
  const { data: kpi } = useKPISettings();
  const [selectedProject, setSelectedProject] = useState<typeof projects[0] | null>(null);
  const [filter, setFilter] = useState<Filter>('active');

  const t: GpThresholds = kpi
    ? { green: kpi.gp_threshold_green, orange: kpi.gp_threshold_orange }
    : DEFAULT_GP_THRESHOLDS;

  const filtered = useMemo(() => {
    const base = projects.filter(
      p => !OWN_JOBS.includes(p.job_name.toLowerCase()),
    );

    let result = base;
    if (filter === 'active') {
      result = base.filter(p => p.status === 'Active');
    } else if (filter === 'onsite') {
      result = base.filter(
        p => p.status === 'Active' && p.category === 'construction',
      );
    }

    // Sort by GP% ascending (worst first)
    return [...result].sort(
      (a, b) => a.forecast_gp_percent - b.forecast_gp_percent,
    );
  }, [projects, filter]);

  const summary = useMemo(() => {
    let green = 0;
    let orange = 0;
    let red = 0;
    let totalContract = 0;
    let totalProfit = 0;

    for (const p of filtered) {
      const s = gpStatus(p.forecast_gp_percent, t);
      if (s === 'success') green++;
      else if (s === 'warning') orange++;
      else red++;
      totalContract += p.contract_value_ex_gst || 0;
      totalProfit += p.forecast_gross_profit || 0;
    }

    const weightedGp = totalContract > 0 ? (totalProfit / totalContract) * 100 : 0;
    return { green, orange, red, weightedGp };
  }, [filtered, t]);

  const filters: { label: string; value: Filter }[] = [
    { label: 'All Jobs', value: 'all' },
    { label: 'Active Only', value: 'active' },
    { label: 'On Site', value: 'onsite' },
  ];

  return (
    <DashboardLayout>
      <div className="min-h-full bg-background">
        <div className="border-b border-border/40 bg-background">
          <div className="mx-auto max-w-7xl px-6 py-5">
            <h1 className="text-xl font-semibold text-foreground">GP Health Board</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Active On-Site Jobs — Change from Original Margin
            </p>
          </div>
        </div>

        <main className="mx-auto max-w-7xl px-6 py-8 space-y-6">
          {/* Summary chips + filters */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800">
                {summary.green} Green
              </Badge>
              <Badge className="bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800">
                {summary.orange} Orange
              </Badge>
              <Badge className="bg-red-100 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800">
                {summary.red} Red
              </Badge>
              <span className="text-xs font-semibold text-muted-foreground ml-2">
                Portfolio GP: {formatPercent(summary.weightedGp)} weighted avg
              </span>
            </div>

            <div className="flex rounded-lg border border-border overflow-hidden">
              {filters.map(f => (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value)}
                  className={cn(
                    'px-3 py-1.5 text-xs font-medium transition-colors',
                    filter === f.value
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-background text-muted-foreground hover:bg-muted',
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="glass-card overflow-hidden">
            {isLoading ? (
              <div className="p-8 text-center text-sm text-muted-foreground">Loading projects…</div>
            ) : filtered.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">No projects match the current filter.</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-border/50">
                      <TableHead className="pl-5">Job Name</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead className="text-right">Contract Value</TableHead>
                      <TableHead className="text-right">Original GP%</TableHead>
                      <TableHead className="text-right">Current GP%</TableHead>
                      <TableHead className="text-right">Change</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead>Site Manager</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map(p => {
                      const status = gpStatus(p.forecast_gp_percent, t);
                      // Original GP% not stored separately yet — use current as baseline
                      const originalGp = p.forecast_gp_percent;
                      const change = p.forecast_gp_percent - originalGp;

                      return (
                        <TableRow
                          key={p.id}
                          className={cn(
                            'border-l-4',
                            borderColor[status],
                          )}
                        >
                          <TableCell className="pl-5">
                            <p className="font-medium text-foreground text-sm">{p.job_name}</p>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {p.client_name || '—'}
                          </TableCell>
                          <TableCell className="text-right text-sm tabular-nums font-medium">
                            {formatCurrency(p.contract_value_ex_gst, true)}
                          </TableCell>
                          <TableCell className="text-right text-sm tabular-nums">
                            {formatPercent(originalGp)}
                          </TableCell>
                          <TableCell className="text-right text-sm tabular-nums font-semibold">
                            {formatPercent(p.forecast_gp_percent)}
                          </TableCell>
                          <TableCell className="text-right text-sm tabular-nums">
                            <span
                              className={cn(
                                'font-semibold',
                                change > 0
                                  ? 'text-emerald-600 dark:text-emerald-400'
                                  : change < 0
                                    ? 'text-destructive'
                                    : 'text-muted-foreground',
                              )}
                            >
                              {change > 0 ? '+' : ''}
                              {change.toFixed(1)}%
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex justify-center">
                              <TrafficLight status={status} size="sm" />
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground font-medium">
                            {p.site_manager || '—'}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          {/* Development Projects Section */}
          {(() => {
            const devProjects = projects.filter(p =>
              OWN_JOBS.includes(p.job_name.toLowerCase()),
            );
            if (devProjects.length === 0) return null;
            const DEV_TARGET = 10;
            return (
              <Collapsible defaultOpen={false}>
                <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border border-border/50 bg-muted/30 px-5 py-3 text-left hover:bg-muted/50 transition-colors group">
                  <span className="text-sm font-semibold text-foreground">
                    LanCon Development Projects — Overhead Coverage Tracking
                  </span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-3 space-y-4">
                  <p className="text-xs text-muted-foreground px-1">
                    These projects are LanCon-owned developments. GP target = overhead coverage only (not subject to the 18% Magic Equation standard).
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {devProjects.map(p => (
                      <div key={p.id} className="glass-card p-5 space-y-3">
                        <h3 className="text-sm font-semibold text-foreground">{p.job_name}</h3>
                        <div className="space-y-1 text-xs text-muted-foreground">
                          <p>Contract: <span className="font-medium text-foreground">{formatCurrency(p.contract_value_ex_gst, true)}</span></p>
                          <p>Forecast GP: <span className="font-medium text-foreground">{formatPercent(p.forecast_gp_percent)}</span></p>
                        </div>
                        {/* Progress bar */}
                        <div className="space-y-1">
                          <div className="relative h-3 w-full rounded-full bg-muted overflow-hidden">
                            <div
                              className={cn(
                                'h-full rounded-full transition-all',
                                p.forecast_gp_percent >= DEV_TARGET ? 'bg-emerald-500' : 'bg-amber-500',
                              )}
                              style={{ width: `${Math.min(100, Math.max(0, (p.forecast_gp_percent / 25) * 100))}%` }}
                            />
                            {/* Target line at 10% */}
                            <div
                              className="absolute top-0 h-full w-0.5 bg-foreground/60"
                              style={{ left: `${(DEV_TARGET / 25) * 100}%` }}
                            />
                          </div>
                          <p className="text-[10px] text-muted-foreground">Target: {DEV_TARGET}% overhead coverage</p>
                        </div>
                        <p className="text-[10px] text-muted-foreground/70 italic">
                          Development project — overhead coverage target only
                        </p>
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            );
          })()}
        </main>
      </div>
    </DashboardLayout>
  );
};

export default GPHealthBoard;
