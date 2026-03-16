import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity } from 'lucide-react';
import { ProjectHealthCard } from '@/components/dashboard/ProjectHealthCard';
import { UpcomingEventsCard } from '@/components/dashboard/UpcomingEventsCard';
import { GPBreakdownTable } from '@/components/dashboard/GPBreakdownTable';
import type { SharedDashboardProps } from '../RoleDashboard';

export function ConstructionManagerDashboard({ shared }: { shared: SharedDashboardProps }) {
  return (
    <>
      {/* Construction-specific header */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            Construction Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          {shared.projectHealth ? (
            <div className="flex flex-wrap gap-3">
              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800">
                {shared.projectHealth.healthy} Healthy
              </Badge>
              <Badge className="bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800">
                {shared.projectHealth.atRisk} At Risk
              </Badge>
              <Badge className="bg-red-100 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800">
                {shared.projectHealth.critical} Critical
              </Badge>
              <span className="text-xs text-muted-foreground ml-2 self-center">
                {shared.projectHealth.active} active on-site jobs
              </span>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">Loading…</p>
          )}
        </CardContent>
      </Card>

      <GPBreakdownTable shared={shared} />

      <div className="grid gap-6 lg:grid-cols-2">
        <ProjectHealthCard shared={shared} />
        <UpcomingEventsCard shared={shared} />
      </div>
    </>
  );
}
