import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { TodayWidget } from '@/components/dashboard/TodayWidget';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useProjects } from '@/hooks/useProjects';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { useMessages } from '@/hooks/useMessages';
import { useKPISettings } from '@/hooks/useKPISettings';
import { gpStatus } from '@/lib/gpThresholds';
import { cn } from '@/lib/utils';
import { format, addDays, isAfter, parseISO } from 'date-fns';
import {
  Sparkles,
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
  Mail,
  DollarSign,
  BarChart3,
} from 'lucide-react';

const quickLinks = [
  { title: 'Magic Equation', description: 'Revenue, GP% & pure profit', icon: Sparkles, url: '/magic', color: 'text-amber-500' },
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

const Dashboard = () => {
  const navigate = useNavigate();
  const { projects, isLoading: projLoading } = useProjects();
  const { data: kpi } = useKPISettings();

  const now = new Date();
  const nextMonth = addDays(now, 30);
  const { events, isLoading: eventsLoading } = useCalendarEvents(now, nextMonth);
  const { unreadCount } = useMessages();

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
            <div className="flex items-center gap-6">
              <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
              <TodayWidget variant="inline" />
            </div>
          </div>
        </div>

        <main className="mx-auto max-w-7xl px-6 py-8 space-y-6">
          {/* Top Stats Row */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="border-border/50">
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Active Projects</p>
                    <p className="text-2xl font-bold">{projectHealth?.active ?? '—'}</p>
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-blue-500" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">{projectHealth?.total ?? 0} total projects</p>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Portfolio Value</p>
                    <p className="text-2xl font-bold">{projectHealth ? fmt(projectHealth.totalContract) : '—'}</p>
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-emerald-500" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">GP: {projectHealth ? fmt(projectHealth.totalGP) : '—'}</p>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Weighted GP%</p>
                    <p className={cn('text-2xl font-bold', projectHealth && gpStatus(projectHealth.weightedGp) === 'success' ? 'text-emerald-600' : gpStatus(projectHealth?.weightedGp ?? 0) === 'warning' ? 'text-amber-600' : 'text-red-600')}>
                      {projectHealth ? `${projectHealth.weightedGp.toFixed(1)}%` : '—'}
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <BarChart3 className="h-5 w-5 text-amber-500" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Target: {kpi?.gp_percent_target ?? 18}%</p>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Unread Messages</p>
                    <p className="text-2xl font-bold">{unreadCount}</p>
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-rose-500/10 flex items-center justify-center">
                    <Mail className="h-5 w-5 text-rose-500" />
                  </div>
                </div>
                <button onClick={() => navigate('/inbox')} className="text-xs text-primary hover:underline mt-2">View inbox →</button>
              </CardContent>
            </Card>
          </div>

          {/* Main Grid: Health + Events + Quick Links */}
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
                    {/* Health bars */}
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

                    {/* Category breakdown */}
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
