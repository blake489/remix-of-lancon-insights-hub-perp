import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CalendarDays, 
  Target, 
  Clock, 
  AlertTriangle 
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, isBefore } from 'date-fns';
import { CalendarEventDB } from '@/hooks/useCalendarEvents';
import { mockProjects } from '@/data/mockData';
import { cn } from '@/lib/utils';

interface CalendarMetricsProps {
  events: CalendarEventDB[];
  currentMonth: Date;
}

export function CalendarMetrics({ events, currentMonth }: CalendarMetricsProps) {
  const metrics = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const today = new Date();

    // Events this month
    const monthEvents = events.filter((e) => {
      const eventDate = new Date(e.start_time);
      return eventDate >= monthStart && eventDate <= monthEnd;
    });

    // Group by category
    const byCategory = monthEvents.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Project milestones this month
    const projectMilestones = mockProjects.filter((p) => {
      if (!p.pcDate) return false;
      const pcDate = new Date(p.pcDate);
      return pcDate >= monthStart && pcDate <= monthEnd;
    });

    // Overdue projects (PC date passed)
    const overdueProjects = mockProjects.filter((p) => {
      if (!p.pcDate) return false;
      const pcDate = new Date(p.pcDate);
      return isBefore(pcDate, today) && p.status === 'Active';
    });

    // Upcoming deadlines (next 7 days)
    const sevenDaysFromNow = new Date(today);
    sevenDaysFromNow.setDate(today.getDate() + 7);
    
    const upcomingDeadlines = events.filter((e) => {
      if (e.category !== 'deadline') return false;
      const eventDate = new Date(e.start_time);
      return eventDate >= today && eventDate <= sevenDaysFromNow;
    });

    // Fortnight info
    const day = today.getDate();
    const currentFortnight = day <= 14 ? 1 : 2;
    const fortnightEnd = currentFortnight === 1 ? 14 : endOfMonth(today).getDate();
    const daysUntilFortnightEnd = fortnightEnd - day;

    return {
      totalEvents: monthEvents.length,
      byCategory,
      projectMilestones: projectMilestones.length,
      overdueProjects: overdueProjects.length,
      upcomingDeadlines: upcomingDeadlines.length,
      currentFortnight,
      daysUntilFortnightEnd,
    };
  }, [events, currentMonth]);

  return (
    <div className="space-y-4">
      {/* Monthly Overview */}
      <Card className="glass-card border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-primary" />
            {format(currentMonth, 'MMMM yyyy')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total Events</span>
            <Badge variant="secondary">{metrics.totalEvents}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Meetings</span>
            <Badge className="bg-blue-500/20 text-blue-600">{metrics.byCategory.meeting || 0}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Deadlines</span>
            <Badge className="bg-red-500/20 text-red-600">{metrics.byCategory.deadline || 0}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Milestones</span>
            <Badge className="bg-green-500/20 text-green-600">{metrics.byCategory.milestone || 0}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Fortnight Status */}
      <Card className="glass-card border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Clock className="h-4 w-4 text-warning" />
            Reporting Period
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Current Fortnight</span>
            <Badge variant="outline">FN{metrics.currentFortnight}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Days Remaining</span>
            <Badge 
              className={cn(
                metrics.daysUntilFortnightEnd <= 3 
                  ? 'bg-red-500/20 text-red-600' 
                  : 'bg-green-500/20 text-green-600'
              )}
            >
              {metrics.daysUntilFortnightEnd} days
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Project Status */}
      <Card className="glass-card border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Target className="h-4 w-4 text-success" />
            Project Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">PC This Month</span>
            <Badge className="bg-green-500/20 text-green-600">{metrics.projectMilestones}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Active Projects</span>
            <Badge variant="secondary">{mockProjects.filter((p) => p.status === 'Active').length}</Badge>
          </div>
          {metrics.overdueProjects > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-red-600 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Overdue
              </span>
              <Badge className="bg-red-500/20 text-red-600">{metrics.overdueProjects}</Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Deadlines Alert */}
      {metrics.upcomingDeadlines > 0 && (
        <Card className="glass-card border-warning/50 bg-warning/5">
          <CardContent className="py-3">
            <div className="flex items-center gap-2 text-warning">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">
                {metrics.upcomingDeadlines} deadline{metrics.upcomingDeadlines > 1 ? 's' : ''} this week
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
