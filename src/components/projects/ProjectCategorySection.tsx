import { ProjectRow } from '@/hooks/useProjects';
import { ClaimStageInfo } from '@/hooks/useProjectClaimStages';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Pencil, Clock, TrendingUp, TrendingDown, Minus, CheckCircle2, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

interface ProjectCategorySectionProps {
  label: string;
  projects: ProjectRow[];
  onEdit?: (project: ProjectRow) => void;
  trends?: Record<string, { schedule: string; profit: string; scheduleDays: number; profitDelta: number }>;
  claimStages?: Record<string, ClaimStageInfo>;
}

const formatCurrency = (val: number) => {
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(2)}M`;
  if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}K`;
  return `$${val.toFixed(0)}`;
};

const getGpColor = (gp: number) => {
  if (gp >= 16) return 'text-success';
  if (gp >= 12) return 'text-warning';
  return 'text-danger';
};

function ScheduleTrend({ status, days }: { status: string; days: number }) {
  if (status === 'unknown') return <Minus className="h-4 w-4 text-muted-foreground" />;
  if (status === 'on_time') return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
  if (status === 'ahead') return <TrendingDown className="h-4 w-4 text-emerald-500" />;
  return <AlertTriangle className="h-4 w-4 text-red-500" />;
}

function ProfitTrend({ status, delta }: { status: string; delta: number }) {
  if (status === 'unknown') return <Minus className="h-4 w-4 text-muted-foreground" />;
  if (status === 'same') return <Minus className="h-4 w-4 text-muted-foreground" />;
  if (status === 'up') return <TrendingUp className="h-4 w-4 text-emerald-500" />;
  return <TrendingDown className="h-4 w-4 text-red-500" />;
}

const OWN_JOBS = ['28 Durimbil St', '117A Tranters Ave'];

function CategorySummaryRow({ projects }: { projects: ProjectRow[] }) {
  const totalContract = projects.reduce((s, p) => s + p.contract_value_ex_gst, 0);
  const totalCost = projects.reduce((s, p) => s + p.forecast_cost, 0);
  const totalGP = projects.reduce((s, p) => s + p.forecast_gross_profit, 0);

  // Weighted GP% excludes own jobs
  const external = projects.filter(p => !OWN_JOBS.some(name => p.job_name.includes(name)));
  const extContract = external.reduce((s, p) => s + p.contract_value_ex_gst, 0);
  const extGP = external.reduce((s, p) => s + p.forecast_gross_profit, 0);
  const weightedGp = extContract > 0 ? (extGP / extContract) * 100 : 0;

  return (
    <TableRow className="border-t-2 border-border bg-muted/40 font-semibold">
      <TableCell className="text-xs uppercase tracking-wide text-muted-foreground">Totals</TableCell>
      <TableCell />
      <TableCell className="text-right tabular-nums">{formatCurrency(totalContract)}</TableCell>
      <TableCell className="text-right tabular-nums">{formatCurrency(totalCost)}</TableCell>
      <TableCell className="text-right tabular-nums">{formatCurrency(totalGP)}</TableCell>
      <TableCell className={cn('text-right font-bold tabular-nums', getGpColor(weightedGp))}>
        <Tooltip>
          <TooltipTrigger asChild>
            <span>{weightedGp.toFixed(1)}%</span>
          </TooltipTrigger>
          <TooltipContent>Weighted avg GP% (excl. own jobs)</TooltipContent>
        </Tooltip>
      </TableCell>
      <TableCell />
      <TableCell />
      <TableCell />
      <TableCell />
      <TableCell />
      <TableCell />
    </TableRow>
  );
}

export function ProjectCategorySection({ label, projects, onEdit, trends, claimStages }: ProjectCategorySectionProps) {
  if (projects.length === 0) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-bold text-foreground">{label}</h2>
        <Badge variant="secondary" className="text-xs">{projects.length}</Badge>
      </div>
      <div className="glass-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border/50">
              <TableHead className="min-w-[180px]">Project</TableHead>
              <TableHead>Site Manager</TableHead>
              <TableHead className="text-right">Contract (ex GST)</TableHead>
              <TableHead className="text-right">Forecast Cost</TableHead>
              <TableHead className="text-right">Forecast GP</TableHead>
              <TableHead className="text-right">GP%</TableHead>
              <TableHead className="min-w-[100px]">Current Stage</TableHead>
              <TableHead className="min-w-[120px]">Next Claim</TableHead>
              <TableHead className="text-center w-[60px]">
                <Tooltip>
                  <TooltipTrigger asChild><span className="flex items-center justify-center"><Clock className="h-3.5 w-3.5" /></span></TooltipTrigger>
                  <TooltipContent>Schedule: On time vs original</TooltipContent>
                </Tooltip>
              </TableHead>
              <TableHead className="text-center w-[60px]">
                <Tooltip>
                  <TooltipTrigger asChild><span className="flex items-center justify-center"><TrendingUp className="h-3.5 w-3.5" /></span></TooltipTrigger>
                  <TooltipContent>Profit: vs original forecast</TooltipContent>
                </Tooltip>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((project) => {
              const trend = trends?.[project.id];
              return (
                <TableRow key={project.id} className="group cursor-pointer hover:bg-accent/50" onClick={() => onEdit?.(project)}>
                  <TableCell>
                    <div className="space-y-0.5">
                      <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {project.job_name}
                      </p>
                      {project.client_name && (
                        <p className="text-xs text-muted-foreground">{project.client_name}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground font-medium">
                    {project.site_manager || '—'}
                  </TableCell>
                  <TableCell className="text-right font-semibold tabular-nums">
                    {project.contract_value_ex_gst > 0 ? formatCurrency(project.contract_value_ex_gst) : '—'}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground tabular-nums">
                    {project.forecast_cost > 0 ? formatCurrency(project.forecast_cost) : '—'}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground tabular-nums">
                    {project.forecast_gross_profit > 0 ? formatCurrency(project.forecast_gross_profit) : '—'}
                  </TableCell>
                  <TableCell className={cn('text-right font-bold tabular-nums', getGpColor(project.forecast_gp_percent))}>
                    {project.forecast_gp_percent > 0 ? `${project.forecast_gp_percent.toFixed(1)}%` : '—'}
                  </TableCell>
                  {(() => {
                    const stage = claimStages?.[project.id];
                    return (
                      <>
                        <TableCell className="text-xs">
                          {stage?.currentStage ? (
                            <Badge variant="outline" className="text-[11px] font-medium">{stage.currentStage}</Badge>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-xs">
                          {stage?.nextStage ? (
                            <div className="space-y-0.5">
                              <Badge variant="secondary" className="text-[11px] font-medium">{stage.nextStage}</Badge>
                              {stage.nextDate && (
                                <p className="text-[10px] text-muted-foreground tabular-nums">
                                  {format(new Date(stage.nextDate), 'dd MMM yy')}
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                      </>
                    );
                  })()}
                  <TableCell className="text-center">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="inline-flex items-center justify-center">
                          <ScheduleTrend status={trend?.schedule || 'unknown'} days={trend?.scheduleDays || 0} />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        {!trend || trend.schedule === 'unknown' ? 'No schedule data' :
                          trend.schedule === 'on_time' ? 'On time — no claim movements' :
                          trend.schedule === 'ahead' ? `Ahead by ${Math.abs(trend.scheduleDays)} days` :
                          `Behind by ${trend.scheduleDays} days`}
                      </TooltipContent>
                    </Tooltip>
                  </TableCell>
                  <TableCell className="text-center">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="inline-flex items-center justify-center">
                          <ProfitTrend status={trend?.profit || 'unknown'} delta={trend?.profitDelta || 0} />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        {!trend || trend.profit === 'unknown' ? 'No forecast changes' :
                          trend.profit === 'same' ? 'GP% unchanged from original' :
                          trend.profit === 'up' ? `GP% up ${trend.profitDelta.toFixed(1)}% from original` :
                          `GP% down ${Math.abs(trend.profitDelta).toFixed(1)}% from original`}
                      </TooltipContent>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Badge variant={project.status === 'Active' ? 'default' : 'secondary'} className="text-xs">
                      {project.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => { e.stopPropagation(); onEdit?.(project); }}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
            <CategorySummaryRow projects={projects} />
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
