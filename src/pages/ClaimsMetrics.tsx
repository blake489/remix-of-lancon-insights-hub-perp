import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { supabase } from '@/integrations/supabase/client';
import { useProjects, ProjectRow } from '@/hooks/useProjects';
import { format, addMonths, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  AlertTriangle, TrendingDown, Clock, ArrowDownRight, ArrowUpRight,
  CheckCircle2, BarChart3, Activity, CalendarClock, Hammer,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, Cell, PieChart, Pie,
} from 'recharts';

type ClaimMove = {
  id: string;
  claim_id: string;
  project_id: string;
  claim_type: string;
  old_date: string;
  new_date: string;
  days_delta: number;
  reason_category: string | null;
  reason_text: string | null;
  moved_at: string;
};

function formatDate(d: string) {
  return format(new Date(d + 'T00:00:00'), 'dd MMM yyyy');
}

export default function ClaimsMetrics() {
  const { projects } = useProjects();

  const { data: moves = [] } = useQuery({
    queryKey: ['claim-moves-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('claim_moves')
        .select('*')
        .order('moved_at', { ascending: false });
      if (error) throw error;
      return data as ClaimMove[];
    },
  });

  const projectMap = useMemo(() => {
    const map = new Map<string, ProjectRow>();
    (projects || []).forEach(p => map.set(p.id, p));
    return map;
  }, [projects]);

  // ── Per-project aggregates ──
  const projectStats = useMemo(() => {
    const map = new Map<string, {
      projectId: string;
      totalMoves: number;
      totalDaysLost: number;
      totalDaysGained: number;
      netDays: number;
      claimBreakdown: Map<string, { moves: number; daysLost: number }>;
      reasonBreakdown: Map<string, number>;
      latestMove: string;
    }>();

    moves.forEach(m => {
      if (!map.has(m.project_id)) {
        map.set(m.project_id, {
          projectId: m.project_id,
          totalMoves: 0,
          totalDaysLost: 0,
          totalDaysGained: 0,
          netDays: 0,
          claimBreakdown: new Map(),
          reasonBreakdown: new Map(),
          latestMove: m.moved_at,
        });
      }
      const s = map.get(m.project_id)!;
      s.totalMoves++;
      const delta = m.days_delta || 0;
      if (delta > 0) s.totalDaysLost += delta;
      if (delta < 0) s.totalDaysGained += Math.abs(delta);
      s.netDays += delta;

      // Claim type breakdown
      if (!s.claimBreakdown.has(m.claim_type)) {
        s.claimBreakdown.set(m.claim_type, { moves: 0, daysLost: 0 });
      }
      const cb = s.claimBreakdown.get(m.claim_type)!;
      cb.moves++;
      if (delta > 0) cb.daysLost += delta;

      // Reason breakdown
      const reason = m.reason_category || 'Unknown';
      s.reasonBreakdown.set(reason, (s.reasonBreakdown.get(reason) || 0) + 1);

      if (m.moved_at > s.latestMove) s.latestMove = m.moved_at;
    });

    return Array.from(map.values()).sort((a, b) => b.netDays - a.netDays);
  }, [moves]);

  // ── Global metrics ──
  const globalMetrics = useMemo(() => {
    const totalMoves = moves.length;
    const totalDaysLost = moves.filter(m => (m.days_delta || 0) > 0).reduce((s, m) => s + (m.days_delta || 0), 0);
    const totalDaysGained = moves.filter(m => (m.days_delta || 0) < 0).reduce((s, m) => s + Math.abs(m.days_delta || 0), 0);
    const projectsAffected = new Set(moves.map(m => m.project_id)).size;
    const avgDaysPerProject = projectsAffected > 0 ? Math.round(totalDaysLost / projectsAffected) : 0;
    const totalProjects = (projects || []).length;
    const onScheduleCount = totalProjects - projectsAffected;

    return { totalMoves, totalDaysLost, totalDaysGained, projectsAffected, avgDaysPerProject, onScheduleCount, totalProjects };
  }, [moves, projects]);

  // ── Reason distribution (for pie chart) ──
  const reasonData = useMemo(() => {
    const map = new Map<string, number>();
    moves.forEach(m => {
      const reason = m.reason_category || 'Unknown';
      map.set(reason, (map.get(reason) || 0) + 1);
    });
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [moves]);

  const REASON_COLORS = ['hsl(var(--primary))', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#ec4899'];

  // ── Bar chart: days lost per project ──
  const barData = useMemo(() => {
    return projectStats.slice(0, 15).map(s => ({
      name: projectMap.get(s.projectId)?.job_name?.split(' ').slice(0, 2).join(' ') || 'Unknown',
      daysLost: s.totalDaysLost,
      daysGained: s.totalDaysGained,
      net: s.netDays,
    }));
  }, [projectStats, projectMap]);

  // Performance rating
  function getPerformanceRating(netDays: number) {
    if (netDays <= 0) return { label: 'On Track', color: 'bg-emerald-100 text-emerald-700 border-emerald-300', icon: CheckCircle2 };
    if (netDays <= 14) return { label: 'Minor Delay', color: 'bg-amber-100 text-amber-700 border-amber-300', icon: Clock };
    if (netDays <= 30) return { label: 'At Risk', color: 'bg-orange-100 text-orange-700 border-orange-300', icon: AlertTriangle };
    return { label: 'Critical', color: 'bg-red-100 text-red-700 border-red-300', icon: TrendingDown };
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-2rem)] p-4 gap-5 overflow-auto">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Claims Metrics</h1>
          <p className="text-sm text-muted-foreground">Schedule performance & claim movement analysis</p>
        </div>

        {/* Summary KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'Total Movements', value: globalMetrics.totalMoves, icon: Activity, color: 'text-primary', sub: `across ${globalMetrics.projectsAffected} projects` },
            { label: 'Days Lost', value: `${globalMetrics.totalDaysLost}d`, icon: ArrowDownRight, color: 'text-red-500', sub: 'pushed forward' },
            { label: 'Days Gained', value: `${globalMetrics.totalDaysGained}d`, icon: ArrowUpRight, color: 'text-emerald-500', sub: 'pulled back' },
            { label: 'Avg Days Lost', value: `${globalMetrics.avgDaysPerProject}d`, icon: BarChart3, color: 'text-amber-500', sub: 'per affected project' },
            { label: 'On Schedule', value: `${globalMetrics.onScheduleCount}/${globalMetrics.totalProjects}`, icon: CheckCircle2, color: 'text-emerald-500', sub: 'no movements' },
            { label: 'Projects at Risk', value: projectStats.filter(s => s.netDays > 14).length, icon: AlertTriangle, color: 'text-red-500', sub: '>14 days behind' },
          ].map(kpi => (
            <Card key={kpi.label} className="border-border/60">
              <CardContent className="p-3">
                <div className="flex items-start gap-2">
                  <kpi.icon className={cn("h-4 w-4 mt-0.5 shrink-0", kpi.color)} />
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{kpi.label}</p>
                    <p className="text-lg font-bold tabular-nums leading-tight">{kpi.value}</p>
                    <p className="text-[10px] text-muted-foreground">{kpi.sub}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Bar Chart: Days Lost per Project */}
          <Card className="lg:col-span-2 border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Hammer className="h-4 w-4" />
                Net Days Lost by Project
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              {barData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={barData} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.4} />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} angle={-30} textAnchor="end" height={60} />
                    <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                    <RechartsTooltip
                      contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }}
                      formatter={(value: number, name: string) => [`${value} days`, name === 'net' ? 'Net' : name === 'daysLost' ? 'Lost' : 'Gained']}
                    />
                    <Bar dataKey="net" radius={[4, 4, 0, 0]}>
                      {barData.map((entry, i) => (
                        <Cell key={i} fill={entry.net > 14 ? '#ef4444' : entry.net > 0 ? '#f59e0b' : '#10b981'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-sm text-muted-foreground">No claim movements recorded yet</div>
              )}
            </CardContent>
          </Card>

          {/* Pie Chart: Reason Breakdown */}
          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <CalendarClock className="h-4 w-4" />
                Delay Reasons
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              {reasonData.length > 0 ? (
                <div className="flex flex-col items-center gap-3">
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie
                        data={reasonData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={75}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {reasonData.map((_, i) => (
                          <Cell key={i} fill={REASON_COLORS[i % REASON_COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {reasonData.map((r, i) => (
                      <div key={r.name} className="flex items-center gap-1.5 text-[10px]">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: REASON_COLORS[i % REASON_COLORS.length] }} />
                        <span className="text-muted-foreground">{r.name} ({r.value})</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-[180px] flex items-center justify-center text-sm text-muted-foreground">No data</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Project Performance Table */}
        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Project Schedule Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="text-xs font-semibold w-[200px]">Project</TableHead>
                    <TableHead className="text-xs font-semibold text-center">Status</TableHead>
                    <TableHead className="text-xs font-semibold text-center">Movements</TableHead>
                    <TableHead className="text-xs font-semibold text-center">Days Lost</TableHead>
                    <TableHead className="text-xs font-semibold text-center">Days Gained</TableHead>
                    <TableHead className="text-xs font-semibold text-center">Net</TableHead>
                    <TableHead className="text-xs font-semibold">Most Moved Claim</TableHead>
                    <TableHead className="text-xs font-semibold">Top Reason</TableHead>
                    <TableHead className="text-xs font-semibold text-center">Last Move</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projectStats.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center text-sm text-muted-foreground py-8">
                        No claim movements recorded — all projects are on schedule.
                      </TableCell>
                    </TableRow>
                  ) : (
                    projectStats.map(s => {
                      const project = projectMap.get(s.projectId);
                      const rating = getPerformanceRating(s.netDays);
                      const RatingIcon = rating.icon;

                      // Most moved claim
                      let worstClaim = '';
                      let worstMoves = 0;
                      s.claimBreakdown.forEach((v, k) => {
                        if (v.moves > worstMoves) { worstMoves = v.moves; worstClaim = k; }
                      });

                      // Top reason
                      let topReason = '';
                      let topReasonCount = 0;
                      s.reasonBreakdown.forEach((v, k) => {
                        if (v > topReasonCount) { topReasonCount = v; topReason = k; }
                      });

                      return (
                        <TableRow key={s.projectId} className="hover:bg-muted/20">
                          <TableCell>
                            <div>
                              <p className="text-sm font-medium">{project?.job_name || 'Unknown'}</p>
                              {project?.site_manager && (
                                <p className="text-[10px] text-muted-foreground">{project.site_manager}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <TooltipProvider delayDuration={100}>
                              <Tooltip>
                                <TooltipTrigger>
                                  <Badge variant="outline" className={cn("text-[10px] gap-1", rating.color)}>
                                    <RatingIcon className="h-3 w-3" />
                                    {rating.label}
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent className="text-xs">
                                  {s.netDays > 0 ? `${s.netDays} days behind original schedule` : 'On or ahead of schedule'}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="text-sm font-bold tabular-nums">{s.totalMoves}</span>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="text-sm font-bold tabular-nums text-red-600">+{s.totalDaysLost}d</span>
                          </TableCell>
                          <TableCell className="text-center">
                            {s.totalDaysGained > 0 ? (
                              <span className="text-sm font-bold tabular-nums text-emerald-600">-{s.totalDaysGained}d</span>
                            ) : (
                              <span className="text-sm text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            <span className={cn(
                              "text-sm font-bold tabular-nums",
                              s.netDays > 0 ? "text-red-600" : s.netDays < 0 ? "text-emerald-600" : "text-muted-foreground"
                            )}>
                              {s.netDays > 0 ? `+${s.netDays}d` : s.netDays < 0 ? `${s.netDays}d` : '0d'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="text-xs">
                              <span className="font-medium">{worstClaim}</span>
                              <span className="text-muted-foreground ml-1">({worstMoves}×)</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="text-[10px]">
                              {topReason} ({topReasonCount})
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center text-xs text-muted-foreground tabular-nums">
                            {format(new Date(s.latestMove), 'dd MMM')}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Movement Log */}
        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Movement Log
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-auto max-h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="text-xs font-semibold">Date</TableHead>
                    <TableHead className="text-xs font-semibold">Project</TableHead>
                    <TableHead className="text-xs font-semibold">Claim Stage</TableHead>
                    <TableHead className="text-xs font-semibold text-center">From</TableHead>
                    <TableHead className="text-xs font-semibold text-center">To</TableHead>
                    <TableHead className="text-xs font-semibold text-center">Days</TableHead>
                    <TableHead className="text-xs font-semibold">Reason</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {moves.slice(0, 100).map(m => {
                    const delta = m.days_delta || 0;
                    return (
                      <TableRow key={m.id} className="hover:bg-muted/20">
                        <TableCell className="text-xs text-muted-foreground tabular-nums whitespace-nowrap">
                          {format(new Date(m.moved_at), 'dd MMM yyyy')}
                        </TableCell>
                        <TableCell className="text-xs font-medium">
                          {projectMap.get(m.project_id)?.job_name || 'Unknown'}
                        </TableCell>
                        <TableCell className="text-xs">{m.claim_type}</TableCell>
                        <TableCell className="text-xs text-center tabular-nums">{formatDate(m.old_date)}</TableCell>
                        <TableCell className="text-xs text-center tabular-nums">{formatDate(m.new_date)}</TableCell>
                        <TableCell className="text-center">
                          <span className={cn(
                            "text-xs font-bold tabular-nums",
                            delta > 0 ? "text-red-600" : delta < 0 ? "text-emerald-600" : "text-muted-foreground"
                          )}>
                            {delta > 0 ? `+${delta}d` : delta < 0 ? `${delta}d` : '0d'}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{m.reason_text || m.reason_category || '—'}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
