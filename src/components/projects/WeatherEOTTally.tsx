import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CloudRain, AlertTriangle } from 'lucide-react';
import { useWeatherEOTLogs } from '@/hooks/useWeatherEOTLogs';
import { ProjectRow } from '@/hooks/useProjects';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface WeatherEOTTallyProps {
  projects: ProjectRow[];
}

export function WeatherEOTTally({ projects }: WeatherEOTTallyProps) {
  const { tallies, isLoading } = useWeatherEOTLogs();
  const currentMonth = format(new Date(), 'MMMM yyyy');

  const activeProjects = useMemo(
    () => projects.filter(p => p.status === 'Active'),
    [projects]
  );

  const projectTallies = useMemo(() => {
    return activeProjects
      .map(p => ({
        project: p,
        tally: tallies[p.id] || { projectId: p.id, currentMonthDays: 0, lifetimeDays: 0 },
      }))
      .sort((a, b) => b.tally.lifetimeDays - a.tally.lifetimeDays);
  }, [activeProjects, tallies]);

  const totalMonthDays = projectTallies.reduce((s, t) => s + t.tally.currentMonthDays, 0);
  const totalLifetimeDays = projectTallies.reduce((s, t) => s + t.tally.lifetimeDays, 0);

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <CloudRain className="h-4 w-4 text-blue-500" />
            Weather EOT Tally
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px]">
              {currentMonth}: {totalMonthDays} day{totalMonthDays !== 1 ? 's' : ''}
            </Badge>
            <Badge variant="secondary" className="text-[10px]">
              Lifetime: {totalLifetimeDays} day{totalLifetimeDays !== 1 ? 's' : ''}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-xs text-muted-foreground text-center py-4">Loading EOT data...</p>
        ) : projectTallies.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">No active projects</p>
        ) : (
          <div className="space-y-1.5">
            {/* Header */}
            <div className="grid grid-cols-[1fr_100px_100px] gap-2 px-2 text-[10px] uppercase tracking-wide text-muted-foreground font-medium">
              <span>Project</span>
              <span className="text-center">{format(new Date(), 'MMM')}</span>
              <span className="text-center">Total</span>
            </div>

            {projectTallies.map(({ project, tally }) => (
              <div
                key={project.id}
                className={cn(
                  'grid grid-cols-[1fr_100px_100px] gap-2 items-center px-2 py-1.5 rounded-md',
                  tally.lifetimeDays > 0 ? 'bg-muted/40' : ''
                )}
              >
                <div className="min-w-0">
                  <p className="text-xs font-medium truncate">{project.job_name}</p>
                  <p className="text-[10px] text-muted-foreground">{project.site_manager || '—'}</p>
                </div>
                <div className="text-center">
                  {tally.currentMonthDays > 0 ? (
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-xs tabular-nums',
                        tally.currentMonthDays >= 5
                          ? 'border-red-300 bg-red-50 text-red-700'
                          : tally.currentMonthDays >= 3
                          ? 'border-amber-300 bg-amber-50 text-amber-700'
                          : 'border-blue-300 bg-blue-50 text-blue-700'
                      )}
                    >
                      {tally.currentMonthDays}
                    </Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </div>
                <div className="text-center">
                  {tally.lifetimeDays > 0 ? (
                    <div className="flex items-center justify-center gap-1">
                      {tally.lifetimeDays >= 10 && (
                        <AlertTriangle className="h-3 w-3 text-red-500" />
                      )}
                      <span className={cn(
                        'text-xs font-bold tabular-nums',
                        tally.lifetimeDays >= 10
                          ? 'text-red-600'
                          : tally.lifetimeDays >= 5
                          ? 'text-amber-600'
                          : 'text-foreground'
                      )}>
                        {tally.lifetimeDays}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
