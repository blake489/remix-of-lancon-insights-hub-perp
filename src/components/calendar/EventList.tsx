import { format, isSameDay } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Plus, 
  Clock, 
  MapPin, 
  Building2,
  Calendar as CalendarIcon,
  Video,
  Target,
  AlertCircle,
  Bell,
  CheckSquare
} from 'lucide-react';
import { CalendarEventDB, CalendarEventCategory } from '@/hooks/useCalendarEvents';
import { CalendarEvent } from '@/types/calendar';
import { cn } from '@/lib/utils';
import { mockProjects } from '@/data/mockData';
import { useNavigate } from 'react-router-dom';

interface EventListProps {
  selectedDate: Date;
  dbEvents: CalendarEventDB[];
  systemEvents: CalendarEvent[];
  onCreateEvent: () => void;
  onEditEvent: (event: CalendarEventDB) => void;
}

const categoryConfig: Record<CalendarEventCategory, { icon: typeof Clock; color: string; bg: string }> = {
  meeting: { icon: Video, color: 'text-blue-600', bg: 'bg-blue-500/10' },
  deadline: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-500/10' },
  milestone: { icon: Target, color: 'text-green-600', bg: 'bg-green-500/10' },
  reminder: { icon: Bell, color: 'text-yellow-600', bg: 'bg-yellow-500/10' },
  task: { icon: CheckSquare, color: 'text-purple-600', bg: 'bg-purple-500/10' },
  other: { icon: CalendarIcon, color: 'text-gray-600', bg: 'bg-gray-500/10' },
};

export function EventList({
  selectedDate,
  dbEvents,
  systemEvents,
  onCreateEvent,
  onEditEvent,
}: EventListProps) {
  const navigate = useNavigate();
  const claimEventTypes = new Set(['claim-projected', 'claim-confirmed', 'claim-claimed', 'variation-due']);

  // Filter events for selected date
  const dayDbEvents = dbEvents.filter((e) =>
    isSameDay(new Date(e.start_time), selectedDate)
  );
  const daySystemEvents = systemEvents.filter((e) =>
    isSameDay(e.date, selectedDate)
  );

  const hasEvents = dayDbEvents.length > 0 || daySystemEvents.length > 0;

  const getProjectName = (projectId: string | null) => {
    if (!projectId) return null;
    const project = mockProjects.find((p) => p.id === projectId);
    return project?.jobName || null;
  };

  const handleSystemEventClick = (event: CalendarEvent) => {
    if (claimEventTypes.has(event.type) && event.projectId) {
      navigate(`/claims?project=${event.projectId}`);
    }
  };

  return (
    <Card className="glass-card border-border/50 h-full flex flex-col">
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">
              {format(selectedDate, 'EEEE, MMMM d')}
            </CardTitle>
            <CardDescription>
              {hasEvents
                ? `${dayDbEvents.length + daySystemEvents.length} event${dayDbEvents.length + daySystemEvents.length !== 1 ? 's' : ''}`
                : 'No events scheduled'}
            </CardDescription>
          </div>
          <Button size="sm" onClick={onCreateEvent}>
            <Plus className="h-4 w-4 mr-1" />
            Add Event
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full px-6 pb-6">
          {!hasEvents ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CalendarIcon className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-sm text-muted-foreground mb-4">
                No events for this day
              </p>
              <Button variant="outline" size="sm" onClick={onCreateEvent}>
                <Plus className="h-4 w-4 mr-1" />
                Create Event
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {/* System events (fortnights, milestones) */}
              {daySystemEvents.map((event) => {
                const isClickable = claimEventTypes.has(event.type) && !!event.projectId;
                return (
                <div
                  key={event.id}
                  className={cn(
                    'p-3 rounded-lg border border-primary/30 bg-primary/5',
                    isClickable && 'cursor-pointer hover:shadow-md hover:border-primary/50 transition-all'
                  )}
                  onClick={isClickable ? () => handleSystemEventClick(event) : undefined}
                  title={isClickable ? `${event.title} — Click to open in Claims Papi` : undefined}
                >
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                      <CalendarIcon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm truncate">{event.title}</p>
                        <Badge variant="outline" className="shrink-0">System</Badge>
                      </div>
                      {event.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {event.description}
                        </p>
                      )}
                      {event.projectName && (
                        <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                          <Building2 className="h-3 w-3" />
                          {event.projectName}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                );
              })}

              {/* User events */}
              {dayDbEvents.map((event) => {
                const config = categoryConfig[event.category];
                const Icon = config.icon;
                const projectName = getProjectName(event.project_id);

                return (
                  <div
                    key={event.id}
                    className={cn(
                      'p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md',
                      config.bg,
                      'border-transparent hover:border-border'
                    )}
                    onClick={() => onEditEvent(event)}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          'h-8 w-8 rounded-lg flex items-center justify-center shrink-0',
                          config.bg
                        )}
                      >
                        <Icon className={cn('h-4 w-4', config.color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-medium text-sm truncate">{event.title}</p>
                          <Badge variant="secondary" className="shrink-0 capitalize text-[10px]">
                            {event.category}
                          </Badge>
                        </div>

                        {/* Time */}
                        {!event.all_day && (
                          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {format(new Date(event.start_time), 'HH:mm')}
                            {event.end_time && (
                              <> - {format(new Date(event.end_time), 'HH:mm')}</>
                            )}
                          </div>
                        )}
                        {event.all_day && (
                          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            All day
                          </div>
                        )}

                        {/* Location */}
                        {event.location && (
                          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {event.location}
                          </div>
                        )}

                        {/* Project */}
                        {projectName && (
                          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                            <Building2 className="h-3 w-3" />
                            {projectName}
                          </div>
                        )}

                        {/* Description */}
                        {event.description && (
                          <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                            {event.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
