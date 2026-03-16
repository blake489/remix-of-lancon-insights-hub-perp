import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { TrafficLight } from '@/components/dashboard/TrafficLight';
import { UpcomingEventsCard } from '@/components/dashboard/UpcomingEventsCard';
import { gpStatus, type GpThresholds, DEFAULT_GP_THRESHOLDS } from '@/lib/gpThresholds';
import { formatCurrency, formatPercent } from '@/lib/formatters';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  parseISO, differenceInDays, isWithinInterval,
} from 'date-fns';
import {
  HardHat, CloudRain, CalendarDays, Users, AlertTriangle, CheckCircle2, ExternalLink,
} from 'lucide-react';
import type { SharedDashboardProps } from '../RoleDashboard';

const OWN_JOBS = ['28 durimbil st', '117a tranters ave'];

const STATUS_ORDER: Record<string, number> = { danger: 0, warning: 1, success: 2 };

const borderColor: Record<'success' | 'warning' | 'danger', string> = {
  success: 'border-emerald-500',
  warning: 'border-amber-500',
  danger: 'border-red-500',
};

/* ── Site manager last-activity query ── */
function useSiteManagerActivity() {
  return useQuery({
    queryKey: ['site-manager-last-activity'],
    queryFn: async () => {
      // Get the most recent week_start per project, then join with project site_manager
      const { data, error } = await supabase
        .from('site_weekly_activities')
        .select('project_id, week_start')
        .order('week_start', { ascending: false });
      if (error) throw error;
      return data as { project_id: string; week_start: string }[];
    },
  });
}

/* ── Weather EOT this month ── */
function useMonthlyEOT() {
  const now = new Date();
  const monthStart = format(startOfMonth(now), 'yyyy-MM-dd');
  const monthEnd = format(endOfMonth(now), 'yyyy-MM-dd');

  return useQuery({
    queryKey: ['weather-eot-month', monthStart],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('weather_eot_logs')
        .select('id, log_date, rain_amount, severity')
        .gte('log_date', monthStart)
        .lte('log_date', monthEnd);
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function ConstructionManagerDashboard({ shared }: { shared: SharedDashboardProps }) {
  const { projects, kpi, navigate } = shared;
  const { data: activityRows = [] } = useSiteManagerActivity();
  const { data: eotLogs = [] } = useMonthlyEOT();

  const now = new Date();
  const t: GpThresholds = kpi
    ? { green: kpi.gp_threshold_green, orange: kpi.gp_threshold_orange }
    : DEFAULT_GP_THRESHOLDS;

  /* ── Active jobs (excluding own) sorted red → orange → green ── */
  const activeJobs = useMemo(() => {
    const jobs = projects
      .filter(p => p.status === 'Active' && !OWN_JOBS.includes(p.job_name.toLowerCase()));
    return [...jobs].sort((a, b) => {
      const sa = STATUS_ORDER[gpStatus(a.forecast_gp_percent, t)] ?? 2;
      const sb = STATUS_ORDER[gpStatus(b.forecast_gp_percent, t)] ?? 2;
      if (sa !== sb) return sa - sb;
      return a.forecast_gp_percent - b.forecast_gp_percent;
    });
  }, [projects, t]);

  /* ── Site manager activity summary ── */
  const siteManagerSummary = useMemo(() => {
    // Map project_id → latest week_start
    const latestByProject = new Map<string, string>();
    for (const row of activityRows) {
      const existing = latestByProject.get(row.project_id);
      if (!existing || row.week_start > existing) {
        latestByProject.set(row.project_id, row.week_start);
      }
    }

    // Map site_manager → latest submission across their projects
    const managerLatest = new Map<string, string>();
    for (const p of projects) {
      if (!p.site_manager || p.status !== 'Active') continue;
      const mgr = p.site_manager;
      const latestWeek = latestByProject.get(p.id);
      if (latestWeek) {
        const existing = managerLatest.get(mgr);
        if (!existing || latestWeek > existing) {
          managerLatest.set(mgr, latestWeek);
        }
      }
    }

    // Build list of unique active site managers
    const managers = [...new Set(
      projects
        .filter(p => p.status === 'Active' && p.site_manager)
        .map(p => p.site_manager as string)
    )];

    return managers.map(name => {
      const lastDate = managerLatest.get(name);
      const daysAgo = lastDate ? differenceInDays(now, new Date(lastDate + 'T00:00:00')) : null;
      const overdue = daysAgo === null || daysAgo > 8;
      return { name, lastDate, daysAgo, overdue };
    }).sort((a, b) => {
      if (a.overdue !== b.overdue) return a.overdue ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
  }, [projects, activityRows]);

  /* ── Weather EOT totals ── */
  const eotSummary = useMemo(() => {
    const totalDays = eotLogs.length;
    const totalRain = eotLogs.reduce((s, l) => s + (l.rain_amount ?? 0), 0);
    return { totalDays, totalRain };
  }, [eotLogs]);

  /* ── This week's events ── */
  const weekEvents = useMemo(() => {
    const ws = startOfWeek(now, { weekStartsOn: 1 });
    const we = endOfWeek(now, { weekStartsOn: 1 });
    return shared.events
      .filter(e => {
        const d = parseISO(e.start_time);
        return isWithinInterval(d, { start: ws, end: we });
      })
      .slice(0, 8);
  }, [shared.events]);

  return (
    <>
      {/* ── Active Jobs Traffic Light Grid ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HardHat className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">Active Jobs</h2>
            <Badge variant="secondary" className="text-[10px]">{activeJobs.length} projects</Badge>
          </div>
          <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => navigate('/gp-health')}>
            GP Health Board →
          </Button>
        </div>

        {shared.projLoading ? (
          <p className="text-xs text-muted-foreground">Loading projects…</p>
        ) : activeJobs.length === 0 ? (
          <p className="text-xs text-muted-foreground">No active jobs found.</p>
        ) : (
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {activeJobs.map(p => {
              const status = gpStatus(p.forecast_gp_percent, t);
              return (
                <div
                  key={p.id}
                  className={cn(
                    'glass-card p-4 border-l-4 space-y-2 cursor-pointer hover:shadow-md transition-shadow',
                    borderColor[status],
                  )}
                  onClick={() => navigate('/gp-health')}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold text-foreground leading-tight">{p.job_name}</h3>
                    <TrafficLight status={status} size="sm" />
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className={cn(
                      'font-bold tabular-nums',
                      status === 'success' ? 'text-emerald-600 dark:text-emerald-400'
                        : status === 'warning' ? 'text-amber-600 dark:text-amber-400'
                        : 'text-destructive',
                    )}>
                      {formatPercent(p.forecast_gp_percent)} GP
                    </span>
                    <span className="text-muted-foreground/60">|</span>
                    <span>{formatCurrency(p.contract_value_ex_gst, true)}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>{p.site_manager || 'No manager'}</span>
                    {p.site_start_date && (
                      <span className="tabular-nums">
                        Started {format(new Date(p.site_start_date + 'T00:00:00'), 'd MMM yy')}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Bottom panels: Site Manager Activity + Weather/EOT + Events ── */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Site Manager Activity */}
        <div className="glass-card p-5 space-y-4 lg:col-span-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Site Manager Activity</h3>
            </div>
          </div>

          {siteManagerSummary.length === 0 ? (
            <p className="text-xs text-muted-foreground">No active site managers found.</p>
          ) : (
            <div className="space-y-2.5">
              {siteManagerSummary.map(mgr => (
                <div key={mgr.name} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {mgr.overdue ? (
                      <AlertTriangle className="h-3.5 w-3.5 text-destructive shrink-0" />
                    ) : (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    )}
                    <span className="text-sm font-medium truncate">{mgr.name}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {mgr.overdue ? (
                      <Badge variant="destructive" className="text-[9px] h-5">Overdue</Badge>
                    ) : (
                      <span className="text-[10px] text-muted-foreground tabular-nums">
                        {mgr.daysAgo != null ? `${mgr.daysAgo}d ago` : '—'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <Separator />

          <Button
            variant="outline"
            size="sm"
            className="w-full h-8 text-xs gap-1.5"
            onClick={() => navigate('/site-entry')}
          >
            <ExternalLink className="h-3 w-3" />
            View All Activity
          </Button>
        </div>

        {/* Weather / EOT Panel */}
        <div className="glass-card p-5 space-y-4 lg:col-span-1">
          <div className="flex items-center gap-2">
            <CloudRain className="h-4 w-4 text-primary" />
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Weather / EOT — {format(now, 'MMMM yyyy')}
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold tabular-nums">{eotSummary.totalDays}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Rain Days</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold tabular-nums">{eotSummary.totalRain.toFixed(0)}mm</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Total Rainfall</p>
            </div>
          </div>

          <Separator />

          <Button
            variant="outline"
            size="sm"
            className="w-full h-8 text-xs gap-1.5"
            onClick={() => navigate('/weather')}
          >
            <ExternalLink className="h-3 w-3" />
            Full Weather Detail
          </Button>
        </div>

        {/* This Week's Events */}
        <div className="glass-card p-5 space-y-4 lg:col-span-1">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-primary" />
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              This Week
            </h3>
          </div>

          {shared.eventsLoading ? (
            <p className="text-xs text-muted-foreground">Loading…</p>
          ) : weekEvents.length === 0 ? (
            <div className="text-center py-4">
              <CalendarDays className="h-6 w-6 text-muted-foreground/30 mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">No events this week</p>
            </div>
          ) : (
            <div className="space-y-2">
              {weekEvents.map(event => (
                <div key={event.id} className="flex items-start gap-2.5">
                  <div className="w-1 h-full rounded-full bg-primary/40 shrink-0 mt-1" style={{ minHeight: 16 }} />
                  <div className="min-w-0">
                    <p className="text-xs font-medium truncate">{event.title}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {format(parseISO(event.start_time), event.all_day ? 'EEE, d MMM' : 'EEE, d MMM · h:mm a')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            className="w-full h-8 text-xs gap-1.5"
            onClick={() => navigate('/calendar')}
          >
            <ExternalLink className="h-3 w-3" />
            View Calendar
          </Button>
        </div>
      </div>
    </>
  );
}
