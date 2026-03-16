import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Activity } from 'lucide-react';
import type { SharedDashboardProps } from './RoleDashboard';

export function ProjectHealthCard({ shared }: { shared: SharedDashboardProps }) {
  const { projLoading, projectHealth, kpi, navigate } = shared;

  return (
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
  );
}
