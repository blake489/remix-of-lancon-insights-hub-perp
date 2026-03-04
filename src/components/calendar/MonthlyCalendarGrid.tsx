import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  isToday,
} from 'date-fns';
import { CalendarEventDB, CalendarEventCategory } from '@/hooks/useCalendarEvents';
import { CalendarEvent } from '@/types/calendar';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MonthlyCalendarGridProps {
  currentMonth: Date;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  dbEvents: CalendarEventDB[];
  systemEvents: CalendarEvent[];
  onEventClick?: (event: CalendarEventDB) => void;
}

const categoryColors: Record<CalendarEventCategory, string> = {
  meeting: 'bg-blue-500 text-white',
  deadline: 'bg-red-500 text-white',
  milestone: 'bg-green-500 text-white',
  reminder: 'bg-yellow-500 text-yellow-900',
  task: 'bg-purple-500 text-white',
  other: 'bg-gray-500 text-white',
};

const systemEventColors: Record<string, string> = {
  'fortnight-start': 'bg-primary/80 text-primary-foreground',
  'fortnight-end': 'bg-warning/80 text-warning-foreground',
  'pc-date': 'bg-success/80 text-success-foreground',
  'project-start': 'bg-blue-500/80 text-white',
  'contract-completion': 'bg-secondary text-secondary-foreground',
  'revised-completion': 'bg-red-500/80 text-white',
  'claim-deadline': 'bg-accent text-accent-foreground',
  'eot-deadline': 'bg-orange-500/80 text-white',
  'claim-projected': 'bg-amber-400/80 text-amber-950',
  'claim-confirmed': 'bg-sky-500/80 text-white',
  'claim-claimed': 'bg-emerald-500/80 text-white',
  'variation-due': 'bg-rose-500/80 text-white',
  'rain-eot': 'bg-cyan-500/80 text-white',
  'public-holiday': 'bg-red-600/80 text-white',
  'new-business': 'bg-violet-500/80 text-white',
};

export function MonthlyCalendarGrid({
  currentMonth,
  selectedDate,
  onSelectDate,
  dbEvents,
  systemEvents,
  onEventClick,
}: MonthlyCalendarGridProps) {
  const navigate = useNavigate();

  const claimEventTypes = new Set(['claim-projected', 'claim-confirmed', 'claim-claimed', 'variation-due']);

  const handleSystemEventClick = (event: CalendarEvent, e: React.MouseEvent) => {
    if (claimEventTypes.has(event.type) && event.projectId) {
      e.stopPropagation();
      navigate(`/claims?project=${event.projectId}`);
    }
  };

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentMonth]);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, { db: CalendarEventDB[]; system: CalendarEvent[] }>();

    dbEvents.forEach((event) => {
      const dateKey = format(new Date(event.start_time), 'yyyy-MM-dd');
      if (!map.has(dateKey)) {
        map.set(dateKey, { db: [], system: [] });
      }
      map.get(dateKey)!.db.push(event);
    });

    systemEvents.forEach((event) => {
      const dateKey = format(event.date, 'yyyy-MM-dd');
      if (!map.has(dateKey)) {
        map.set(dateKey, { db: [], system: [] });
      }
      map.get(dateKey)!.system.push(event);
    });

    return map;
  }, [dbEvents, systemEvents]);

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="flex flex-col h-full">
      {/* Week day headers */}
      <div className="grid grid-cols-7 border-b border-border/50">
        {weekDays.map((day) => (
          <div
            key={day}
            className="py-2 text-center text-xs font-medium text-muted-foreground"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 flex-1 auto-rows-fr">
        {calendarDays.map((day, idx) => {
          const dateKey = format(day, 'yyyy-MM-dd');
          const dayEvents = eventsByDate.get(dateKey) || { db: [], system: [] };
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isSelected = isSameDay(day, selectedDate);
          const isTodayDate = isToday(day);
          const totalEvents = dayEvents.db.length + dayEvents.system.length;

          return (
            <div
              key={idx}
              className={cn(
                'min-h-[100px] border-b border-r border-border/30 p-1 cursor-pointer transition-colors hover:bg-muted/30',
                !isCurrentMonth && 'bg-muted/10 text-muted-foreground',
                isSelected && 'bg-primary/5 ring-2 ring-primary ring-inset'
              )}
              onClick={() => onSelectDate(day)}
            >
              {/* Date number */}
              <div className="flex items-center justify-between mb-1">
                <span
                  className={cn(
                    'text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full',
                    isTodayDate && 'bg-primary text-primary-foreground',
                    !isTodayDate && isCurrentMonth && 'text-foreground',
                    !isCurrentMonth && 'text-muted-foreground'
                  )}
                >
                  {format(day, 'd')}
                </span>
                {totalEvents > 3 && (
                  <span className="text-[10px] text-muted-foreground">
                    +{totalEvents - 3} more
                  </span>
                )}
              </div>

              {/* Events */}
              <ScrollArea className="h-[60px]">
                <div className="space-y-0.5">
                  {/* System events first */}
                  {dayEvents.system.slice(0, 2).map((event) => {
                    const isClickable = claimEventTypes.has(event.type) && !!event.projectId;
                    return (
                      <div
                        key={event.id}
                        className={cn(
                          'text-[10px] px-1.5 py-0.5 rounded truncate',
                          systemEventColors[event.type] || 'bg-gray-500 text-white',
                          isClickable && 'cursor-pointer hover:opacity-80 hover:ring-1 hover:ring-white/40'
                        )}
                        title={isClickable ? `${event.title} — Click to open in Claims Papi` : event.title}
                        onClick={isClickable ? (e) => handleSystemEventClick(event, e) : undefined}
                      >
                        {event.title}
                      </div>
                    );
                  })}

                  {/* DB events */}
                  {dayEvents.db.slice(0, 3 - Math.min(dayEvents.system.length, 2)).map((event) => (
                    <div
                      key={event.id}
                      className={cn(
                        'text-[10px] px-1.5 py-0.5 rounded truncate cursor-pointer hover:opacity-80',
                        categoryColors[event.category]
                      )}
                      title={event.title}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick?.(event);
                      }}
                    >
                      {!event.all_day && (
                        <span className="font-medium mr-1">
                          {format(new Date(event.start_time), 'HH:mm')}
                        </span>
                      )}
                      {event.title}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          );
        })}
      </div>
    </div>
  );
}
