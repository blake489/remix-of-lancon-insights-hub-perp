import { ProjectRow } from '@/hooks/useProjects';
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
import { cn } from '@/lib/utils';
import { Pencil } from 'lucide-react';

interface ProjectCategorySectionProps {
  label: string;
  projects: ProjectRow[];
  onEdit?: (project: ProjectRow) => void;
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

export function ProjectCategorySection({ label, projects, onEdit }: ProjectCategorySectionProps) {
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
              <TableHead>Stage</TableHead>
              <TableHead className="text-right">Contract (ex GST)</TableHead>
              <TableHead className="text-right">Forecast Cost</TableHead>
              <TableHead className="text-right">Forecast GP</TableHead>
              <TableHead className="text-right">GP%</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((project) => (
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
                <TableCell>
                  {project.current_stage ? (
                    <Badge variant="outline" className="text-xs">{project.current_stage}</Badge>
                  ) : '—'}
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
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
