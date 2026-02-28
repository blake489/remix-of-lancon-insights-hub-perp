import { useState } from 'react';
import { MagicEquationHeader } from '@/components/dashboard/MagicEquationHeader';
import { DashboardFilters } from '@/components/dashboard/DashboardFilters';
import { TodayWidget } from '@/components/dashboard/TodayWidget';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrafficLight } from '@/components/dashboard/TrafficLight';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  getCurrentKPIData,
  getFortnight1KPIData,
  getPreviousFortnightKPIData,
} from '@/data/mockData';
import { getCurrentMonth, getCurrentFortnight } from '@/lib/formatters';
import { useProjects } from '@/hooks/useProjects';
import { useKPISettings } from '@/hooks/useKPISettings';
import { gpStatus, gpTextColor, GpThresholds, DEFAULT_GP_THRESHOLDS } from '@/lib/gpThresholds';
import { cn } from '@/lib/utils';
import { Sparkles, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { useMemo } from 'react';

const availableMonths = [
  '2025-02',
  '2025-01',
  '2024-12',
  '2024-11',
];

const fmt = (v: number) => {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
  return `$${v.toFixed(0)}`;
};

type SortField = 'job_name' | 'contract_value_ex_gst' | 'forecast_cost' | 'forecast_gross_profit' | 'forecast_gp_percent';
type SortDir = 'asc' | 'desc';

const Magic = () => {
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [selectedFortnight, setSelectedFortnight] = useState<1 | 2>(getCurrentFortnight());
  const monthlyKPI = getCurrentKPIData();
  const currentFortnightKPI = getFortnight1KPIData();
  const previousFortnightKPI = getPreviousFortnightKPIData();
  const [overheadOverride, setOverheadOverride] = useState<number>(monthlyKPI.overheads);

  const { projects, isLoading } = useProjects();
  const { data: kpi } = useKPISettings();
  const t: GpThresholds = kpi ? { green: kpi.gp_threshold_green, orange: kpi.gp_threshold_orange } : DEFAULT_GP_THRESHOLDS;

  const [sortField, setSortField] = useState<SortField>('forecast_gp_percent');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const sorted = useMemo(() => {
    const active = projects.filter(p => p.status === 'Active');
    return [...active].sort((a, b) => {
      const aVal = a[sortField] as number | string;
      const bVal = b[sortField] as number | string;
      if (typeof aVal === 'string') return sortDir === 'asc' ? (aVal as string).localeCompare(bVal as string) : (bVal as string).localeCompare(aVal as string);
      return sortDir === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });
  }, [projects, sortField, sortDir]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir(field === 'job_name' ? 'asc' : 'desc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground" />;
    return sortDir === 'asc' ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />;
  };

  const catLabel = (c: string) => {
    switch (c) {
      case 'pre_construction': return 'Pre Con';
      case 'construction': return 'Construction';
      case 'handover': return 'Handover';
      default: return c;
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-full bg-background">
        {/* Header */}
        <div className="border-b border-border/40 bg-background">
          <div className="mx-auto max-w-7xl px-6 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <h1 className="text-xl font-semibold text-foreground">Magic Equation</h1>
                </div>
                <TodayWidget variant="inline" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="mx-auto max-w-7xl px-6 py-8 space-y-8">
          <MagicEquationHeader
            monthlyKPI={monthlyKPI}
            currentFortnightKPI={currentFortnightKPI}
            previousFortnightKPI={previousFortnightKPI}
            selectedMonth={selectedMonth}
            selectedFortnight={selectedFortnight}
            overheadOverride={overheadOverride}
            onOverheadChange={setOverheadOverride}
          />

          {/* Project Breakdown Table */}
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-muted-foreground">
                  Active Projects — GP% Breakdown
                </CardTitle>
                <Badge variant="secondary" className="text-xs">{sorted.length} projects</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-6 text-sm text-muted-foreground text-center">Loading projects...</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-border/50">
                        <TableHead
                          className="cursor-pointer select-none hover:text-foreground transition-colors"
                          onClick={() => handleSort('job_name')}
                        >
                          <span className="flex items-center gap-1.5">Project <SortIcon field="job_name" /></span>
                        </TableHead>
                        <TableHead>Stage</TableHead>
                        <TableHead>Manager</TableHead>
                        <TableHead
                          className="text-right cursor-pointer select-none hover:text-foreground transition-colors"
                          onClick={() => handleSort('contract_value_ex_gst')}
                        >
                          <span className="flex items-center justify-end gap-1.5">Contract <SortIcon field="contract_value_ex_gst" /></span>
                        </TableHead>
                        <TableHead
                          className="text-right cursor-pointer select-none hover:text-foreground transition-colors"
                          onClick={() => handleSort('forecast_cost')}
                        >
                          <span className="flex items-center justify-end gap-1.5">Cost <SortIcon field="forecast_cost" /></span>
                        </TableHead>
                        <TableHead
                          className="text-right cursor-pointer select-none hover:text-foreground transition-colors"
                          onClick={() => handleSort('forecast_gross_profit')}
                        >
                          <span className="flex items-center justify-end gap-1.5">GP <SortIcon field="forecast_gross_profit" /></span>
                        </TableHead>
                        <TableHead
                          className="cursor-pointer select-none hover:text-foreground transition-colors"
                          onClick={() => handleSort('forecast_gp_percent')}
                        >
                          <span className="flex items-center gap-1.5">GP% <SortIcon field="forecast_gp_percent" /></span>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sorted.map(p => (
                        <TableRow key={p.id} className="group">
                          <TableCell>
                            <p className="font-medium text-foreground text-sm">{p.job_name}</p>
                            {p.client_name && <p className="text-[11px] text-muted-foreground">{p.client_name}</p>}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-[10px] capitalize">{catLabel(p.category)}</Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground font-medium">{p.site_manager || '—'}</TableCell>
                          <TableCell className="text-right font-semibold tabular-nums text-sm">
                            {p.contract_value_ex_gst > 0 ? fmt(p.contract_value_ex_gst) : '—'}
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground tabular-nums text-sm">
                            {p.forecast_cost > 0 ? fmt(p.forecast_cost) : '—'}
                          </TableCell>
                          <TableCell className="text-right tabular-nums text-sm font-medium">
                            {p.forecast_gross_profit > 0 ? fmt(p.forecast_gross_profit) : '—'}
                          </TableCell>
                          <TableCell>
                            {p.forecast_gp_percent > 0 ? (
                              <div className="flex items-center gap-2">
                                <TrafficLight status={gpStatus(p.forecast_gp_percent, t)} size="sm" />
                                <span className={cn('font-bold tabular-nums text-sm', gpTextColor(p.forecast_gp_percent, t))}>
                                  {p.forecast_gp_percent.toFixed(1)}%
                                </span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                      {/* Totals row */}
                      {sorted.length > 0 && (() => {
                        const totContract = sorted.reduce((s, p) => s + p.contract_value_ex_gst, 0);
                        const totCost = sorted.reduce((s, p) => s + p.forecast_cost, 0);
                        const totGP = sorted.reduce((s, p) => s + p.forecast_gross_profit, 0);
                        const wGp = totContract > 0 ? (totGP / totContract) * 100 : 0;
                        return (
                          <TableRow className="border-t-2 border-border bg-muted/40 font-semibold">
                            <TableCell className="text-xs uppercase tracking-wide text-muted-foreground">Totals</TableCell>
                            <TableCell />
                            <TableCell />
                            <TableCell className="text-right tabular-nums text-sm">{fmt(totContract)}</TableCell>
                            <TableCell className="text-right tabular-nums text-sm text-muted-foreground">{fmt(totCost)}</TableCell>
                            <TableCell className="text-right tabular-nums text-sm">{fmt(totGP)}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <TrafficLight status={gpStatus(wGp, t)} size="sm" />
                                <span className={cn('font-bold tabular-nums text-sm', gpTextColor(wGp, t))}>
                                  {wGp.toFixed(1)}%
                                </span>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })()}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </DashboardLayout>
  );
};

export default Magic;
