import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UpcomingEventsCard } from '@/components/dashboard/UpcomingEventsCard';
import { Palette, Landmark } from 'lucide-react';
import { formatCurrency, formatPercent } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import type { SharedDashboardProps } from '../RoleDashboard';

const OWN_JOBS = ['28 durimbil st', '117a tranters ave'];
const DEV_TARGET = 10;

export function DesignManagerDashboard({ shared }: { shared: SharedDashboardProps }) {
  const designProjects = useMemo(
    () => shared.projects.filter(p => p.status === 'Active' && p.category === 'pre_construction'),
    [shared.projects],
  );

  const devProjects = useMemo(
    () => shared.projects.filter(p => OWN_JOBS.includes(p.job_name.toLowerCase())),
    [shared.projects],
  );

  return (
    <>
      {/* Design phase projects */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Palette className="h-4 w-4 text-primary" />
            Active Design / Pre-Construction Projects
          </CardTitle>
        </CardHeader>
        <CardContent>
          {shared.projLoading ? (
            <p className="text-xs text-muted-foreground">Loading…</p>
          ) : designProjects.length === 0 ? (
            <p className="text-xs text-muted-foreground">No projects currently in design phase</p>
          ) : (
            <div className="space-y-2">
              {designProjects.map(p => (
                <div key={p.id} className="flex items-center justify-between border rounded-md px-3 py-2 bg-muted/20">
                  <div>
                    <p className="text-sm font-medium text-foreground">{p.job_name}</p>
                    {p.client_name && <p className="text-[11px] text-muted-foreground">{p.client_name}</p>}
                  </div>
                  <Badge variant="outline" className="text-[10px] bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800">
                    Pre Con
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Development projects */}
      {devProjects.length > 0 && (
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Landmark className="h-4 w-4 text-primary" />
              LanCon Development Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              {devProjects.map(p => (
                <div key={p.id} className="glass-card p-4 space-y-2">
                  <h3 className="text-sm font-semibold text-foreground">{p.job_name}</h3>
                  <div className="text-xs text-muted-foreground space-y-0.5">
                    <p>Contract: <span className="font-medium text-foreground">{formatCurrency(p.contract_value_ex_gst, true)}</span></p>
                    <p>Forecast GP: <span className="font-medium text-foreground">{formatPercent(p.forecast_gp_percent)}</span></p>
                  </div>
                  <div className="space-y-1">
                    <div className="relative h-3 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all',
                          p.forecast_gp_percent >= DEV_TARGET ? 'bg-emerald-500' : 'bg-amber-500',
                        )}
                        style={{ width: `${Math.min(100, Math.max(0, (p.forecast_gp_percent / 25) * 100))}%` }}
                      />
                      <div
                        className="absolute top-0 h-full w-0.5 bg-foreground/60"
                        style={{ left: `${(DEV_TARGET / 25) * 100}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground">Target: {DEV_TARGET}% overhead coverage</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <UpcomingEventsCard shared={shared} />
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Design Workflow</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {designProjects.length} project{designProjects.length !== 1 ? 's' : ''} in pre-construction phase
            </p>
            <button onClick={() => shared.navigate('/projects')} className="text-xs text-primary hover:underline mt-2">
              View all projects →
            </button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
