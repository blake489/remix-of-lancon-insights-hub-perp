import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { TrafficLight } from '@/components/dashboard/TrafficLight';
import { gpStatus, gpTextColor } from '@/lib/gpThresholds';
import { cn } from '@/lib/utils';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import type { SharedDashboardProps } from './RoleDashboard';

const fmt = (v: number) => {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
  return `$${v.toFixed(0)}`;
};

const catLabel = (c: string) => {
  switch (c) {
    case 'pre_construction': return 'Pre Con';
    case 'construction': return 'Construction';
    case 'handover': return 'Handover';
    default: return c;
  }
};

type SortField = 'job_name' | 'contract_value_ex_gst' | 'forecast_cost' | 'forecast_gross_profit' | 'forecast_gp_percent';

function SortIcon({ field, sortField, sortDir }: { field: SortField; sortField: string; sortDir: string }) {
  if (sortField !== field) return <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground" />;
  return sortDir === 'asc' ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />;
}

export function GPBreakdownTable({ shared }: { shared: SharedDashboardProps }) {
  const { groupedProjects, sorted, handleSort, sortField, sortDir, projLoading, t } = shared;

  return (
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
                    <span className="flex items-center gap-1.5">Project <SortIcon field="job_name" sortField={sortField} sortDir={sortDir} /></span>
                  </TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Manager</TableHead>
                  <TableHead className="text-right cursor-pointer select-none hover:text-foreground transition-colors" onClick={() => handleSort('contract_value_ex_gst')}>
                    <span className="flex items-center justify-end gap-1.5">Contract <SortIcon field="contract_value_ex_gst" sortField={sortField} sortDir={sortDir} /></span>
                  </TableHead>
                  <TableHead className="text-right cursor-pointer select-none hover:text-foreground transition-colors" onClick={() => handleSort('forecast_cost')}>
                    <span className="flex items-center justify-end gap-1.5">Cost <SortIcon field="forecast_cost" sortField={sortField} sortDir={sortDir} /></span>
                  </TableHead>
                  <TableHead className="text-right cursor-pointer select-none hover:text-foreground transition-colors" onClick={() => handleSort('forecast_gross_profit')}>
                    <span className="flex items-center justify-end gap-1.5">GP <SortIcon field="forecast_gross_profit" sortField={sortField} sortDir={sortDir} /></span>
                  </TableHead>
                  <TableHead className="cursor-pointer select-none hover:text-foreground transition-colors" onClick={() => handleSort('forecast_gp_percent')}>
                    <span className="flex items-center gap-1.5">GP% <SortIcon field="forecast_gp_percent" sortField={sortField} sortDir={sortDir} /></span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groupedProjects.map(group => {
                  if (group.projects.length === 0) return null;
                  const grpContract = group.projects.reduce((s: number, p: any) => s + p.contract_value_ex_gst, 0);
                  const grpCost = group.projects.reduce((s: number, p: any) => s + p.forecast_cost, 0);
                  const grpGP = group.projects.reduce((s: number, p: any) => s + p.forecast_gross_profit, 0);
                  const grpWGp = grpContract > 0 ? (grpGP / grpContract) * 100 : 0;
                  return (
                    <React.Fragment key={group.category}>
                      <TableRow className="bg-muted/60 border-b-0">
                        <TableCell colSpan={7} className="py-2">
                          <span className={cn(
                            "text-xs font-bold uppercase tracking-wider",
                            group.category === 'pre_construction' ? 'text-blue-600 dark:text-blue-400' : 'text-amber-600 dark:text-amber-400'
                          )}>
                            {group.label} ({group.projects.length})
                          </span>
                        </TableCell>
                      </TableRow>
                      {group.projects.map((p: any) => (
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
                      <TableRow className="border-t border-border/50 bg-muted/30">
                        <TableCell className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">{group.label} Subtotal</TableCell>
                        <TableCell />
                        <TableCell />
                        <TableCell className="text-right tabular-nums text-xs font-semibold">{fmt(grpContract)}</TableCell>
                        <TableCell className="text-right tabular-nums text-xs text-muted-foreground font-semibold">{fmt(grpCost)}</TableCell>
                        <TableCell className="text-right tabular-nums text-xs font-semibold">{fmt(grpGP)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <TrafficLight status={gpStatus(grpWGp, t)} size="sm" />
                            <span className={cn('font-bold tabular-nums text-xs', gpTextColor(grpWGp, t))}>
                              {grpWGp.toFixed(1)}%
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  );
                })}
                {sorted.length > 0 && (() => {
                  const totContract = sorted.reduce((s: number, p: any) => s + p.contract_value_ex_gst, 0);
                  const totCost = sorted.reduce((s: number, p: any) => s + p.forecast_cost, 0);
                  const totGP = sorted.reduce((s: number, p: any) => s + p.forecast_gross_profit, 0);
                  const wGp = totContract > 0 ? (totGP / totContract) * 100 : 0;
                  return (
                    <TableRow className="border-t-2 border-border bg-muted/40 font-semibold">
                      <TableCell className="text-xs uppercase tracking-wide text-muted-foreground">Grand Total</TableCell>
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
  );
}
