import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { TodayWidget } from '@/components/dashboard/TodayWidget';
import { MagicEquationHeader } from '@/components/dashboard/MagicEquationHeader';
import { TrafficLight } from '@/components/dashboard/TrafficLight';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useProjects } from '@/hooks/useProjects';
import { useMessages } from '@/hooks/useMessages';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';

import { useKPISettings } from '@/hooks/useKPISettings';
import { useClaims } from '@/hooks/useClaims';
import { gpStatus, gpTextColor, GpThresholds, DEFAULT_GP_THRESHOLDS } from '@/lib/gpThresholds';
import {
  getCurrentKPIData,
  getFortnight1KPIData,
  getPreviousFortnightKPIData,
} from '@/data/mockData';
import { getCurrentMonth, getCurrentFortnight } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { format, addDays, isAfter, parseISO, addMonths, subMonths } from 'date-fns';
import {
  FileText,
  Receipt,
  Landmark,
  Users,
  Calendar,
  CloudSun,
  ArrowRight,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
  Sparkles,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Mail,
} from 'lucide-react';

const quickLinks = [
  { title: 'Projects', description: 'Contracts & portfolio', icon: FileText, url: '/projects', color: 'text-blue-500' },
  { title: 'Claims Papi', description: 'Claim schedules', icon: Receipt, url: '/claims', color: 'text-emerald-500' },
  { title: 'Development', description: 'Property tracking', icon: Landmark, url: '/development', color: 'text-violet-500' },
  { title: 'Team', description: 'Staff & org chart', icon: Users, url: '/team', color: 'text-rose-500' },
  { title: 'Calendar', description: 'Events & deadlines', icon: Calendar, url: '/calendar', color: 'text-cyan-500' },
  { title: 'Weather', description: 'Site forecasts', icon: CloudSun, url: '/weather', color: 'text-orange-500' },
];

const fmt = (v: number) => {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
  return `$${v.toFixed(0)}`;
};

type SortField = 'job_name' | 'contract_value_ex_gst' | 'forecast_cost' | 'forecast_gross_profit' | 'forecast_gp_percent';
type SortDir = 'asc' | 'desc';

const OWN_JOBS = ['28 durimbil st', '117a tranters ave'];

const Dashboard = () => {
  const navigate = useNavigate();
  const { projects, isLoading: projLoading } = useProjects();
  const { data: kpi } = useKPISettings();
  const { claims } = useClaims();
  const { unreadCount } = useMessages();

  const now = new Date();
  const nextMonth = addDays(now, 30);
  const { events, isLoading: eventsLoading } = useCalendarEvents(now, nextMonth);

  // Magic Equation state
  const [selectedMonth] = useState(getCurrentMonth());
  const [selectedFortnight] = useState<1 | 2>(getCurrentFortnight());
  const monthlyKPI = getCurrentKPIData();
  const currentFortnightKPI = getFortnight1KPIData();
  const previousFortnightKPI = getPreviousFortnightKPIData();
  const [overheadOverride, setOverheadOverride] = useState<number>(monthlyKPI.overheads);
  const [lastMonthOverhead, setLastMonthOverhead] = useState<number>(monthlyKPI.overheads);
  const [nextMonthOverhead, setNextMonthOverhead] = useState<number>(monthlyKPI.overheads);

  const t: GpThresholds = kpi ? { green: kpi.gp_threshold_green, orange: kpi.gp_threshold_orange } : DEFAULT_GP_THRESHOLDS;
  const revenueTarget = kpi?.monthly_revenue_target ?? 1650000;

  // Claims revenue for current month
  const currentMonthKey = format(new Date(), 'yyyy-MM');
  const claimsRevenue = useMemo(() => {
    const monthClaims = claims.filter(c => c.month_key === currentMonthKey);
    const planned = monthClaims.filter(c => c.status === 'planned').reduce((s, c) => s + Math.abs(c.amount), 0);
    const confirmed = monthClaims.filter(c => c.status === 'confirmed').reduce((s, c) => s + Math.abs(c.amount), 0);
    const claimed = monthClaims.filter(c => c.status === 'claimed').reduce((s, c) => s + Math.abs(c.amount), 0);
    return { total: planned + confirmed + claimed, planned, confirmed, claimed, target: revenueTarget };
  }, [claims, currentMonthKey, revenueTarget]);

  // Weighted average GP% of active projects (excluding own jobs)
  const activeGpPercent = useMemo(() => {
    const active = projects.filter(p => p.status === 'Active' && !OWN_JOBS.includes(p.job_name.toLowerCase()));
    const totalContract = active.reduce((s, p) => s + (p.contract_value_ex_gst || 0), 0);
    const totalProfit = active.reduce((s, p) => s + (p.forecast_gross_profit || 0), 0);
    return totalContract > 0 ? (totalProfit / totalContract) * 100 : 0;
  }, [projects]);

  // Adjacent month pure profit calculations
  const adjacentMonthProfits = useMemo(() => {
    const now = new Date();
    const lastMonthKey = format(subMonths(now, 1), 'yyyy-MM');
    const nextMonthKey = format(addMonths(now, 1), 'yyyy-MM');
    const gpRate = (activeGpPercent ?? 0) / 100;
    const getRevenue = (mk: string) => claims.filter(c => c.month_key === mk).reduce((s, c) => s + Math.abs(c.amount), 0);
    return {
      lastMonth: { label: format(subMonths(now, 1), 'MMM yyyy'), pureProfit: getRevenue(lastMonthKey) * gpRate - lastMonthOverhead },
      nextMonth: { label: format(addMonths(now, 1), 'MMM yyyy'), pureProfit: getRevenue(nextMonthKey) * gpRate - nextMonthOverhead },
    };
  }, [claims, activeGpPercent, lastMonthOverhead, nextMonthOverhead]);

  // Sort state for GP breakdown table
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

  // Dashboard widgets data
  const projectHealth = useMemo(() => {
    if (!projects.length) return null;
    const active = projects.filter(p => p.status === 'Active');
    const greenThreshold = kpi?.gp_threshold_green ?? 17;
    const orangeThreshold = kpi?.gp_threshold_orange ?? 12;

    const healthy = active.filter(p => p.forecast_gp_percent >= greenThreshold).length;
    const atRisk = active.filter(p => p.forecast_gp_percent >= orangeThreshold && p.forecast_gp_percent < greenThreshold).length;
    const critical = active.filter(p => p.forecast_gp_percent > 0 && p.forecast_gp_percent < orangeThreshold).length;

    const totalContract = projects.reduce((s, p) => s + p.contract_value_ex_gst, 0);
    const totalGP = projects.reduce((s, p) => s + p.forecast_gross_profit, 0);
    const weightedGp = totalContract > 0 ? (totalGP / totalContract) * 100 : 0;

    const byCat = {
      pre_construction: projects.filter(p => p.category === 'pre_construction').length,
      construction: projects.filter(p => p.category === 'construction').length,
      handover: projects.filter(p => p.category === 'handover').length,
    };

    return { total: projects.length, active: active.length, healthy, atRisk, critical, totalContract, totalGP, weightedGp, byCat };
  }, [projects, kpi]);

  const upcomingEvents = useMemo(() => {
    return events
      .filter(e => isAfter(parseISO(e.start_time), now))
      .slice(0, 5);
  }, [events]);

  const categoryIcon = (cat: string) => {
    switch (cat) {
      case 'deadline': return <AlertTriangle className="h-3.5 w-3.5 text-red-500" />;
      case 'milestone': return <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />;
      case 'meeting': return <Users className="h-3.5 w-3.5 text-blue-500" />;
      case 'task': return <CheckCircle2 className="h-3.5 w-3.5 text-amber-500" />;
      default: return <Clock className="h-3.5 w-3.5 text-muted-foreground" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-full bg-background">
        <div className="border-b border-border/40 bg-background">
          <div className="mx-auto max-w-7xl px-6 py-5">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-6">
                <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
                <TodayWidget variant="inline" />
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={() => navigate('/inbox')}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors"
                >
                  <Mail className="h-4 w-4 text-primary" />
                  <span className="text-xs font-semibold text-primary">{unreadCount} unread</span>
                </button>
              )}
            </div>
          </div>
        </div>

        <main className="mx-auto max-w-7xl px-6 py-8 space-y-8">
          {/* Magic Equation KPIs */}
          <MagicEquationHeader
            monthlyKPI={monthlyKPI}
            currentFortnightKPI={currentFortnightKPI}
            previousFortnightKPI={previousFortnightKPI}
            selectedMonth={selectedMonth}
            selectedFortnight={selectedFortnight}
            overheadOverride={overheadOverride}
            onOverheadChange={setOverheadOverride}
            activeGpPercent={activeGpPercent}
            claimsRevenue={claimsRevenue}
            adjacentMonthProfits={adjacentMonthProfits}
            lastMonthOverhead={lastMonthOverhead}
            nextMonthOverhead={nextMonthOverhead}
            onLastMonthOverheadChange={setLastMonthOverhead}
            onNextMonthOverheadChange={setNextMonthOverhead}
          />

          {/* GP% Breakdown Table */}
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
              {projLoading ? (
                <div className="p-6 text-sm text-muted-foreground text-center">Loading projects...</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-border/50">
                        <TableHead className="cursor-pointer select-none hover:text-foreground transition-colors" onClick={() => handleSort('job_name')}>
                          <span className="flex items-center gap-1.5">Project <SortIcon field="job_name" /></span>
                        </TableHead>
                        <TableHead>Stage</TableHead>
                        <TableHead>Manager</TableHead>
                        <TableHead className="text-right cursor-pointer select-none hover:text-foreground transition-colors" onClick={() => handleSort('contract_value_ex_gst')}>
                          <span className="flex items-center justify-end gap-1.5">Contract <SortIcon field="contract_value_ex_gst" /></span>
                        </TableHead>
                        <TableHead className="text-right cursor-pointer select-none hover:text-foreground transition-colors" onClick={() => handleSort('forecast_cost')}>
                          <span className="flex items-center justify-end gap-1.5">Cost <SortIcon field="forecast_cost" /></span>
                        </TableHead>
                        <TableHead className="text-right cursor-pointer select-none hover:text-foreground transition-colors" onClick={() => handleSort('forecast_gross_profit')}>
                          <span className="flex items-center justify-end gap-1.5">GP <SortIcon field="forecast_gross_profit" /></span>
                        </TableHead>
                        <TableHead className="cursor-pointer select-none hover:text-foreground transition-colors" onClick={() => handleSort('forecast_gp_percent')}>
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
                            <Badge variant="outline" className={cn(
                              "text-[10px] capitalize",
                              p.category === 'pre_construction' && 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800',
                              p.category === 'construction' && 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800',
                              p.category === 'handover' && 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800',
                            )}>{catLabel(p.category)}</Badge>
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

          {/* Dashboard Widgets: Health + Events + Quick Links */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Project Health */}
            <Card className="border-border/50 lg:col-span-1">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" />
                  Project Health
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {projLoading ? (
                  <p className="text-xs text-muted-foreground">Loading...</p>
                ) : projectHealth ? (
                  <>
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                          <span className="text-xs font-medium">Healthy (≥{kpi?.gp_threshold_green ?? 17}%)</span>
                        </div>
                        <span className="text-xs font-bold tabular-nums">{projectHealth.healthy}</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${projectHealth.active > 0 ? (projectHealth.healthy / projectHealth.active) * 100 : 0}%` }} />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                          <span className="text-xs font-medium">At Risk ({kpi?.gp_threshold_orange ?? 12}–{(kpi?.gp_threshold_green ?? 17) - 1}%)</span>
                        </div>
                        <span className="text-xs font-bold tabular-nums">{projectHealth.atRisk}</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${projectHealth.active > 0 ? (projectHealth.atRisk / projectHealth.active) * 100 : 0}%` }} />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                          <span className="text-xs font-medium">Critical (&lt;{kpi?.gp_threshold_orange ?? 12}%)</span>
                        </div>
                        <span className="text-xs font-bold tabular-nums">{projectHealth.critical}</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div className="h-full bg-red-500 rounded-full transition-all" style={{ width: `${projectHealth.active > 0 ? (projectHealth.critical / projectHealth.active) * 100 : 0}%` }} />
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-1.5">
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">By Stage</p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Pre Construction</span>
                        <Badge variant="secondary" className="text-[10px] h-5">{projectHealth.byCat.pre_construction}</Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Construction</span>
                        <Badge variant="secondary" className="text-[10px] h-5">{projectHealth.byCat.construction}</Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Handover</span>
                        <Badge variant="secondary" className="text-[10px] h-5">{projectHealth.byCat.handover}</Badge>
                      </div>
                    </div>

                    <button onClick={() => navigate('/projects')} className="text-xs text-primary hover:underline w-full text-left">
                      View all projects →
                    </button>
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground">No projects yet</p>
                )}
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card className="border-border/50 lg:col-span-1">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  Upcoming Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                {eventsLoading ? (
                  <p className="text-xs text-muted-foreground">Loading...</p>
                ) : upcomingEvents.length > 0 ? (
                  <div className="space-y-3">
                    {upcomingEvents.map(event => (
                      <div key={event.id} className="flex items-start gap-3 group">
                        <div className="mt-0.5">{categoryIcon(event.category)}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{event.title}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {format(parseISO(event.start_time), event.all_day ? 'EEE, d MMM' : 'EEE, d MMM · h:mm a')}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-[9px] h-4 shrink-0 capitalize">
                          {event.category}
                        </Badge>
                      </div>
                    ))}
                    <button onClick={() => navigate('/calendar')} className="text-xs text-primary hover:underline w-full text-left">
                      View calendar →
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Calendar className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">No upcoming events</p>
                    <button onClick={() => navigate('/calendar')} className="text-xs text-primary hover:underline mt-1">
                      Add an event →
                    </button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card className="border-border/50 lg:col-span-1">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Quick Access
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {quickLinks.map((link) => (
                    <button
                      key={link.url}
                      onClick={() => navigate(link.url)}
                      className="flex items-center gap-3 w-full px-2.5 py-2 rounded-lg hover:bg-muted/60 transition-colors text-left group"
                    >
                      <link.icon className={cn('h-4 w-4 shrink-0', link.color)} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium">{link.title}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{link.description}</p>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
