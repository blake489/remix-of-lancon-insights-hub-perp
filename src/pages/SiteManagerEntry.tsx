import { useState, useMemo, useCallback } from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { useProjects } from '@/hooks/useProjects';
import { useClaims } from '@/hooks/useClaims';
import { useSiteWeeklyActivities } from '@/hooks/useSiteWeeklyActivities';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { TrafficLight } from '@/components/dashboard/TrafficLight';
import { gpStatus, gpTextColor, DEFAULT_GP_THRESHOLDS } from '@/lib/gpThresholds';
import { useKPISettings } from '@/hooks/useKPISettings';
import { cn } from '@/lib/utils';
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, isThisWeek } from 'date-fns';
import { ClipboardCheck, Camera, Shield, CheckCircle2, AlertCircle, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';

const fmt = (v: number) => {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
  return `$${v.toFixed(0)}`;
};

export default function SiteManagerEntry() {
  const { projects, isLoading: projLoading } = useProjects();
  const { claims } = useClaims();
  const { data: kpi } = useKPISettings();
  const t = kpi ? { green: kpi.gp_threshold_green, orange: kpi.gp_threshold_orange } : DEFAULT_GP_THRESHOLDS;

  // Week navigation
  const [selectedWeekStart, setSelectedWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const weekEnd = endOfWeek(selectedWeekStart, { weekStartsOn: 1 });
  const isCurrentWeek = isThisWeek(selectedWeekStart, { weekStartsOn: 1 });
  const currentMonthKey = format(new Date(), 'yyyy-MM');

  const { getActivity, isRedFlagged, upsert, isComplete } = useSiteWeeklyActivities(selectedWeekStart);

  // Only construction projects
  const constructionProjects = useMemo(
    () => projects.filter(p => p.status === 'Active' && p.category === 'construction'),
    [projects]
  );

  // Group by site manager
  const grouped = useMemo(() => {
    const map = new Map<string, typeof constructionProjects>();
    constructionProjects.forEach(p => {
      const mgr = p.site_manager || 'Unassigned';
      if (!map.has(mgr)) map.set(mgr, []);
      map.get(mgr)!.push(p);
    });
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [constructionProjects]);

  const handleUpdate = useCallback((projectId: string, field: 'clientMessage' | 'photos' | 'hsWalk', value: boolean | number) => {
    const current = getActivity(projectId);
    const updated = { ...current, [field]: value };
    upsert.mutate({
      project_id: projectId,
      client_message: updated.clientMessage,
      photos: updated.photos,
      hs_walk: updated.hsWalk,
    });
  }, [getActivity, upsert]);

  // Get current & next claim for a project
  const getProjectClaims = (projectId: string) => {
    const projectClaims = claims
      .filter(c => c.project_id === projectId)
      .sort((a, b) => a.claim_date.localeCompare(b.claim_date));
    const currentClaim = projectClaims.find(c => c.month_key === currentMonthKey);
    const futureClaims = projectClaims.filter(c => c.month_key > currentMonthKey);
    const nextClaim = futureClaims[0] || null;
    return { currentClaim, nextClaim };
  };

  // Manager summary stats
  const getManagerStats = (managerProjects: typeof constructionProjects) => {
    const total = managerProjects.length;
    const msgs = managerProjects.filter(p => getActivity(p.id).clientMessage).length;
    const photos = managerProjects.filter(p => getActivity(p.id).photos >= 4).length;
    const hs = managerProjects.filter(p => getActivity(p.id).hsWalk).length;
    return { total, msgs, photos, hs };
  };

  return (
    <DashboardLayout>
      <div className="min-h-full bg-background">
        <div className="border-b border-border/40 bg-background">
          <div className="mx-auto max-w-7xl px-6 py-5">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold text-foreground">Client Communication — Weekly Entry</h1>
                <p className="text-sm text-muted-foreground">
                  Week of {format(selectedWeekStart, 'dd MMM')} – {format(weekEnd, 'dd MMM yyyy')}
                </p>
              </div>
              <div className="flex items-center gap-6">
                {/* Week navigator */}
                <div className="flex items-center gap-1 border rounded-lg bg-muted/30 p-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setSelectedWeekStart(prev => subWeeks(prev, 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={isCurrentWeek ? 'default' : 'ghost'}
                    size="sm"
                    className="text-xs h-8 px-3"
                    onClick={() => setSelectedWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))}
                  >
                    This Week
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    disabled={isCurrentWeek}
                    onClick={() => setSelectedWeekStart(prev => addWeeks(prev, 1))}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <ClipboardCheck className="h-4 w-4 text-blue-500" />
                    Client Message
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Camera className="h-4 w-4 text-violet-500" />
                    Photos
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Shield className="h-4 w-4 text-emerald-500" />
                    H&S Walk
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <main className="mx-auto max-w-7xl px-6 py-6 space-y-6">
          {projLoading ? (
            <div className="text-center py-12 text-muted-foreground">Loading projects...</div>
          ) : grouped.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No construction projects found.</div>
          ) : (
            grouped.map(([manager, managerProjects]) => {
              const stats = getManagerStats(managerProjects);
              const allComplete = stats.msgs === stats.total && stats.photos === stats.total && stats.hs === stats.total;

              return (
                <Card key={manager} className="border-border/50">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-bold uppercase tracking-wide text-foreground">
                        {manager}
                      </CardTitle>
                      <div className="flex items-center gap-4">
                        <Badge variant="outline" className="text-[10px] gap-1">
                          <ClipboardCheck className="h-3 w-3" />
                          {stats.msgs}/{stats.total}
                        </Badge>
                        <Badge variant="outline" className="text-[10px] gap-1">
                          <Camera className="h-3 w-3" />
                          {stats.photos}/{stats.total}
                        </Badge>
                        <Badge variant="outline" className="text-[10px] gap-1">
                          <Shield className="h-3 w-3" />
                          {stats.hs}/{stats.total}
                        </Badge>
                        {allComplete ? (
                          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300 text-[10px] gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Complete
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] gap-1 text-amber-600 border-amber-300 bg-amber-50">
                            <AlertCircle className="h-3 w-3" /> Incomplete
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/40 border-b border-border/50">
                            <TableHead className="font-semibold text-xs">Address / Project</TableHead>
                            <TableHead className="font-semibold text-xs">Client</TableHead>
                            <TableHead className="font-semibold text-xs">Stage</TableHead>
                            <TableHead className="text-right font-semibold text-xs">Current Claim</TableHead>
                            <TableHead className="text-right font-semibold text-xs">Next Claim</TableHead>
                            <TableHead className="font-semibold text-xs">GP%</TableHead>
                            <TableHead className="text-center font-semibold text-xs">
                              <span className="flex items-center justify-center gap-1">
                                <ClipboardCheck className="h-3 w-3 text-blue-500" />
                                Message
                              </span>
                            </TableHead>
                            <TableHead className="text-center font-semibold text-xs">
                              <span className="flex items-center justify-center gap-1">
                                <Camera className="h-3 w-3 text-violet-500" />
                                Photos
                              </span>
                            </TableHead>
                            <TableHead className="text-center font-semibold text-xs">
                              <span className="flex items-center justify-center gap-1">
                                <Shield className="h-3 w-3 text-emerald-500" />
                                H&S
                              </span>
                            </TableHead>
                            <TableHead className="font-semibold text-xs text-center">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {managerProjects.map(p => {
                            const { currentClaim, nextClaim } = getProjectClaims(p.id);
                            const act = getActivity(p.id);
                            const rowComplete = isComplete(act);
                            const redFlag = isRedFlagged(p.id);

                            return (
                              <TableRow
                                key={p.id}
                                className={cn(
                                  rowComplete && 'bg-emerald-50/30 dark:bg-emerald-950/10',
                                  redFlag && !rowComplete && 'bg-destructive/5 dark:bg-destructive/10 border-l-2 border-l-destructive'
                                )}
                              >
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    {redFlag && !rowComplete && (
                                      <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
                                    )}
                                    <div>
                                      <p className={cn("font-medium text-sm", redFlag && !rowComplete ? "text-destructive" : "text-foreground")}>{p.job_name}</p>
                                      {p.address && <p className="text-[11px] text-muted-foreground">{p.address}</p>}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">{p.client_name || '—'}</TableCell>
                                <TableCell>
                                  <span className="text-xs text-muted-foreground">{p.current_stage || '—'}</span>
                                </TableCell>
                                <TableCell className="text-right">
                                  {currentClaim ? (
                                    <div>
                                      <p className="text-sm font-semibold tabular-nums">{fmt(Math.abs(currentClaim.amount))}</p>
                                      <p className="text-[10px] text-muted-foreground">{currentClaim.claim_type}</p>
                                    </div>
                                  ) : (
                                    <span className="text-xs text-muted-foreground">—</span>
                                  )}
                                </TableCell>
                                <TableCell className="text-right">
                                  {nextClaim ? (
                                    <div>
                                      <p className="text-sm tabular-nums text-muted-foreground">{fmt(Math.abs(nextClaim.amount))}</p>
                                      <p className="text-[10px] text-muted-foreground">{format(new Date(nextClaim.claim_date + 'T00:00:00'), 'MMM yyyy')}</p>
                                    </div>
                                  ) : (
                                    <span className="text-xs text-muted-foreground">—</span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {p.forecast_gp_percent > 0 ? (
                                    <div className="flex items-center gap-1.5">
                                      <TrafficLight status={gpStatus(p.forecast_gp_percent, t)} size="sm" />
                                      <span className={cn('font-bold tabular-nums text-sm', gpTextColor(p.forecast_gp_percent, t))}>
                                        {p.forecast_gp_percent.toFixed(1)}%
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="text-muted-foreground">—</span>
                                  )}
                                </TableCell>
                                <TableCell className="text-center">
                                  <Checkbox
                                    checked={act.clientMessage}
                                    onCheckedChange={v => handleUpdate(p.id, 'clientMessage', !!v)}
                                    className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                                  />
                                </TableCell>
                                <TableCell className="text-center">
                                  <div className="flex flex-col items-center gap-0.5">
                                    <Input
                                      type="number"
                                      min={0}
                                      value={act.photos}
                                      onChange={e => handleUpdate(p.id, 'photos', Math.max(0, parseInt(e.target.value) || 0))}
                                      className={cn(
                                        "w-16 h-8 text-center text-sm tabular-nums mx-auto",
                                        act.photos > 0 && act.photos < 4 && "border-amber-400 text-amber-600"
                                      )}
                                    />
                                    {act.photos > 0 && act.photos < 4 && (
                                      <span className="text-[9px] text-amber-500 font-medium">min 4</span>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell className="text-center">
                                  <Checkbox
                                    checked={act.hsWalk}
                                    onCheckedChange={v => handleUpdate(p.id, 'hsWalk', !!v)}
                                    className="data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                                  />
                                </TableCell>
                                <TableCell className="text-center">
                                  {redFlag && !rowComplete ? (
                                    <Badge className="bg-destructive/10 text-destructive border-destructive/30 text-[10px] gap-1">
                                      <AlertTriangle className="h-3 w-3" /> 2 Weeks
                                    </Badge>
                                  ) : rowComplete ? (
                                    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300 text-[10px]">
                                      <CheckCircle2 className="h-3 w-3 mr-1" /> Complete
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-300 bg-amber-50">
                                      <AlertCircle className="h-3 w-3 mr-1" /> Incomplete
                                    </Badge>
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                          {/* Manager subtotal */}
                          {(() => {
                            const totContract = managerProjects.reduce((s, p) => s + p.contract_value_ex_gst, 0);
                            const totGP = managerProjects.reduce((s, p) => s + p.forecast_gross_profit, 0);
                            const wGp = totContract > 0 ? (totGP / totContract) * 100 : 0;
                            return (
                              <TableRow className="border-t border-border bg-muted/30 font-semibold">
                                <TableCell className="text-[10px] uppercase tracking-wide text-muted-foreground">{manager}</TableCell>
                                <TableCell />
                                <TableCell />
                                <TableCell className="text-right tabular-nums text-xs">{fmt(totContract)}</TableCell>
                                <TableCell />
                                <TableCell>
                                  <div className="flex items-center gap-1.5">
                                    <TrafficLight status={gpStatus(wGp, t)} size="sm" />
                                    <span className={cn('font-bold tabular-nums text-xs', gpTextColor(wGp, t))}>
                                      {wGp.toFixed(1)}%
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell colSpan={4} />
                              </TableRow>
                            );
                          })()}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </main>
      </div>
    </DashboardLayout>
  );
}
