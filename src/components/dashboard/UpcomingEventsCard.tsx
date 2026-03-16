import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Calendar, Users, AlertTriangle, TrendingUp, CheckCircle2, Clock,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import type { SharedDashboardProps } from './RoleDashboard';

const categoryIcon = (cat: string) => {
  switch (cat) {
    case 'deadline': return <AlertTriangle className="h-3.5 w-3.5 text-red-500" />;
    case 'milestone': return <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />;
    case 'meeting': return <Users className="h-3.5 w-3.5 text-blue-500" />;
    case 'task': return <CheckCircle2 className="h-3.5 w-3.5 text-amber-500" />;
    default: return <Clock className="h-3.5 w-3.5 text-muted-foreground" />;
  }
};

export function UpcomingEventsCard({ shared }: { shared: SharedDashboardProps }) {
  const { eventsLoading, upcomingEvents, navigate } = shared;

  return (
    <Card className="border-border/50 lg:col-span-1">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          Upcoming Events
        </CardTitle>
      </CardHeader>
      <CardContent>
        {eventsLoading ? (
          <p className="text-xs text-muted-foreground">Loading...</p>
        ) : upcomingEvents.length > 0 ? (
          <div className="space-y-3">
            {upcomingEvents.map((event: any) => (
              <div key={event.id} className="flex items-start gap-3 group">
                <div className="mt-0.5">{categoryIcon(event.category)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{event.title}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {format(parseISO(event.start_time), event.all_day ? 'EEE, d MMM' : 'EEE, d MMM · h:mm a')}
                  </p>
                </div>
                <Badge variant="outline" className="text-[9px] h-4 shrink-0 capitalize">
                  {event.category}
                </Badge>
              </div>
            ))}
            <button onClick={() => navigate('/calendar')} className="text-xs text-primary hover:underline w-full text-left">
              View calendar →
            </button>
          </div>
        ) : (
          <div className="text-center py-6">
            <Calendar className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">No upcoming events</p>
            <button onClick={() => navigate('/calendar')} className="text-xs text-primary hover:underline mt-1">
              Add an event →
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
