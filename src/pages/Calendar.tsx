import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CalendarDays, 
  Clock, 
  AlertTriangle, 
  CheckCircle2,
  Building2,
  CalendarClock,
  FileText,
  Target
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isWithinInterval, addMonths, subMonths, parseISO, isSameMonth } from 'date-fns';
import { mockProjects, mockTimings } from '@/data/mockData';
import { CalendarEvent, CalendarEventType, EventsByDate } from '@/types/calendar';
import { cn } from '@/lib/utils';

const eventTypeConfig: Record<CalendarEventType, { 
  color: string; 
  bgColor: string;
  icon: typeof CalendarDays;
  label: string;
}> = {
  'fortnight-start': { 
    color: 'text-primary', 
    bgColor: 'bg-primary/10 border-primary/30',
    icon: CalendarClock,
    label: 'Fortnight Start'
  },
  'fortnight-end': { 
    color: 'text-warning', 
    bgColor: 'bg-warning/10 border-warning/30',
    icon: Clock,
    label: 'Fortnight End'
  },
  'pc-date': { 
    color: 'text-success', 
    bgColor: 'bg-success/10 border-success/30',
    icon: CheckCircle2,
    label: 'Practical Completion'
  },
  'contract-completion': { 
    color: 'text-secondary-foreground', 
    bgColor: 'bg-secondary border-secondary',
    icon: FileText,
    label: 'Contract Completion'
  },
  'revised-completion': { 
    color: 'text-danger', 
    bgColor: 'bg-danger/10 border-danger/30',
    icon: AlertTriangle,
    label: 'Revised Completion'
  },
  'claim-deadline': { 
    color: 'text-accent-foreground', 
    bgColor: 'bg-accent border-accent',
    icon: Target,
    label: 'Claim Deadline'
  },
  'eot-deadline': { 
    color: 'text-warning', 
    bgColor: 'bg-warning/10 border-warning/30',
    icon: AlertTriangle,
    label: 'EOT Deadline'
  },
  'project-start': { 
    color: 'text-primary', 
    bgColor: 'bg-primary/10 border-primary/30',
    icon: Building2,
    label: 'Project Start'
  },
};

// Generate fortnight dates for a given year
function generateFortnightDates(year: number): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  
  for (let month = 0; month < 12; month++) {
    const monthDate = new Date(year, month, 1);
    const monthStr = format(monthDate, 'MMMM yyyy');
    
    // Fortnight 1: 1st - 14th
    events.push({
      id: `fn1-start-${year}-${month}`,
      date: new Date(year, month, 1),
      title: `Fortnight 1 Start`,
      type: 'fortnight-start',
      description: `${monthStr} - First fortnight reporting period begins`,
      priority: 'medium',
    });
    
    events.push({
      id: `fn1-end-${year}-${month}`,
      date: new Date(year, month, 14),
      title: `Fortnight 1 End`,
      type: 'fortnight-end',
      description: `${monthStr} - First fortnight metrics due`,
      priority: 'high',
    });
    
    // Fortnight 2: 15th - end of month
    events.push({
      id: `fn2-start-${year}-${month}`,
      date: new Date(year, month, 15),
      title: `Fortnight 2 Start`,
      type: 'fortnight-start',
      description: `${monthStr} - Second fortnight reporting period begins`,
      priority: 'medium',
    });
    
    const lastDay = endOfMonth(monthDate).getDate();
    events.push({
      id: `fn2-end-${year}-${month}`,
      date: new Date(year, month, lastDay),
      title: `Fortnight 2 End`,
      type: 'fortnight-end',
      description: `${monthStr} - Second fortnight metrics due`,
      priority: 'high',
    });
  }
  
  return events;
}

// Generate project milestone events
function generateProjectEvents(): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  
  mockProjects.forEach(project => {
    const timing = mockTimings[project.id];
    
    // Project start date
    if (project.startDate) {
      events.push({
        id: `start-${project.id}`,
        date: parseISO(project.startDate),
        title: `${project.jobName} - Project Start`,
        type: 'project-start',
        projectId: project.id,
        projectName: project.jobName,
        description: `Site Manager: ${project.siteManager}`,
        priority: 'medium',
      });
    }
    
    // PC Date
    if (project.pcDate) {
      events.push({
        id: `pc-${project.id}`,
        date: parseISO(project.pcDate),
        title: `${project.jobName} - PC Date`,
        type: 'pc-date',
        projectId: project.id,
        projectName: project.jobName,
        description: `Practical Completion target`,
        priority: 'high',
      });
    }
    
    // Contract completion date
    if (timing?.contractCompletionDate) {
      events.push({
        id: `contract-${project.id}`,
        date: parseISO(timing.contractCompletionDate),
        title: `${project.jobName} - Contract Completion`,
        type: 'contract-completion',
        projectId: project.id,
        projectName: project.jobName,
        description: `Original contract completion date`,
        priority: 'medium',
      });
    }
    
    // Revised completion date (if different from contract)
    if (timing?.revisedCompletionDate && timing.revisedCompletionDate !== timing.contractCompletionDate) {
      events.push({
        id: `revised-${project.id}`,
        date: parseISO(timing.revisedCompletionDate),
        title: `${project.jobName} - Revised Completion`,
        type: 'revised-completion',
        projectId: project.id,
        projectName: project.jobName,
        description: `EOT: ${timing.eotDays} days, Days Lost: ${timing.daysLost}`,
        priority: 'high',
      });
    }
  });
  
  return events;
}

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState('all');
  
  // Generate all events
  const allEvents = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const fortnightEvents = [
      ...generateFortnightDates(currentYear),
      ...generateFortnightDates(currentYear + 1),
    ];
    const projectEvents = generateProjectEvents();
    
    return [...fortnightEvents, ...projectEvents].sort(
      (a, b) => a.date.getTime() - b.date.getTime()
    );
  }, []);
  
  // Group events by date
  const eventsByDate = useMemo(() => {
    const grouped: EventsByDate = {};
    allEvents.forEach(event => {
      const dateKey = format(event.date, 'yyyy-MM-dd');
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(event);
    });
    return grouped;
  }, [allEvents]);
  
  // Get events for selected date
  const selectedDateEvents = useMemo(() => {
    if (!selectedDate) return [];
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    return eventsByDate[dateKey] || [];
  }, [selectedDate, eventsByDate]);
  
  // Filter events by type for tabs
  const filteredEvents = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    
    return allEvents.filter(event => {
      const inMonth = isWithinInterval(event.date, { start: monthStart, end: monthEnd });
      if (!inMonth) return false;
      
      if (activeTab === 'all') return true;
      if (activeTab === 'fortnights') return event.type.includes('fortnight');
      if (activeTab === 'milestones') return ['pc-date', 'contract-completion', 'revised-completion', 'project-start'].includes(event.type);
      return true;
    });
  }, [allEvents, currentMonth, activeTab]);
  
  // Upcoming events (next 30 days)
  const upcomingEvents = useMemo(() => {
    const today = new Date();
    const thirtyDaysLater = addMonths(today, 1);
    
    return allEvents
      .filter(event => event.date >= today && event.date <= thirtyDaysLater)
      .slice(0, 10);
  }, [allEvents]);
  
  // Custom day render for calendar
  const getDayEventIndicators = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    const dayEvents = eventsByDate[dateKey] || [];
    
    if (dayEvents.length === 0) return null;
    
    const hasHighPriority = dayEvents.some(e => e.priority === 'high');
    const hasFortnight = dayEvents.some(e => e.type.includes('fortnight'));
    const hasProject = dayEvents.some(e => ['pc-date', 'revised-completion', 'project-start'].includes(e.type));
    
    return (
      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
        {hasFortnight && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
        {hasProject && <div className="w-1.5 h-1.5 rounded-full bg-success" />}
        {hasHighPriority && !hasFortnight && !hasProject && (
          <div className="w-1.5 h-1.5 rounded-full bg-warning" />
        )}
      </div>
    );
  };
  
  return (
    <DashboardLayout>
      <div className="min-h-full gradient-mesh">
        {/* Page Header */}
        <div className="border-b border-border/30 bg-card/30 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground tracking-tight">Calendar</h1>
                <p className="text-sm text-muted-foreground">
                  Track key metric dates, fortnights, and project milestones
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <main className="mx-auto max-w-7xl px-6 py-8">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Calendar Section */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="glass-card border-border/50">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <CalendarDays className="h-5 w-5 text-primary" />
                      Metric Calendar
                    </CardTitle>
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                      <TabsList className="h-8">
                        <TabsTrigger value="all" className="text-xs px-3">All</TabsTrigger>
                        <TabsTrigger value="fortnights" className="text-xs px-3">Fortnights</TabsTrigger>
                        <TabsTrigger value="milestones" className="text-xs px-3">Milestones</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    month={currentMonth}
                    onMonthChange={setCurrentMonth}
                    className="rounded-lg border border-border/50 p-3 pointer-events-auto"
                    modifiers={{
                      hasEvents: (date) => {
                        const dateKey = format(date, 'yyyy-MM-dd');
                        return !!eventsByDate[dateKey];
                      },
                    }}
                    modifiersClassNames={{
                      hasEvents: 'relative',
                    }}
                    components={{
                      DayContent: ({ date }) => (
                        <div className="relative w-full h-full flex items-center justify-center">
                          {date.getDate()}
                          {getDayEventIndicators(date)}
                        </div>
                      ),
                    }}
                  />
                  
                  {/* Legend */}
                  <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                      <span>Fortnight</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-success" />
                      <span>Project Milestone</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-warning" />
                      <span>High Priority</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Selected Date Events */}
              <Card className="glass-card border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold">
                    {selectedDate ? format(selectedDate, 'EEEE, MMMM d, yyyy') : 'Select a date'}
                  </CardTitle>
                  <CardDescription>
                    {selectedDateEvents.length} event{selectedDateEvents.length !== 1 ? 's' : ''} scheduled
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedDateEvents.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">
                      No events scheduled for this date
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {selectedDateEvents.map(event => {
                        const config = eventTypeConfig[event.type];
                        const Icon = config.icon;
                        
                        return (
                          <div
                            key={event.id}
                            className={cn(
                              "p-3 rounded-lg border transition-colors",
                              config.bgColor
                            )}
                          >
                            <div className="flex items-start gap-3">
                              <Icon className={cn("h-5 w-5 mt-0.5 shrink-0", config.color)} />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="font-medium text-sm">{event.title}</p>
                                  <Badge variant="outline" className="text-xs">
                                    {config.label}
                                  </Badge>
                                  {event.priority === 'high' && (
                                    <Badge variant="destructive" className="text-xs">
                                      High Priority
                                    </Badge>
                                  )}
                                </div>
                                {event.description && (
                                  <p className="text-xs text-muted-foreground mt-1">
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
                </CardContent>
              </Card>
            </div>
            
            {/* Sidebar - Upcoming Events */}
            <div className="space-y-6">
              <Card className="glass-card border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Clock className="h-4 w-4 text-warning" />
                    Upcoming Events
                  </CardTitle>
                  <CardDescription>Next 30 days</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[400px]">
                    <div className="p-4 pt-0 space-y-3">
                      {upcomingEvents.map(event => {
                        const config = eventTypeConfig[event.type];
                        const Icon = config.icon;
                        const isToday = isSameDay(event.date, new Date());
                        
                        return (
                          <button
                            key={event.id}
                            onClick={() => {
                              setSelectedDate(event.date);
                              setCurrentMonth(event.date);
                            }}
                            className={cn(
                              "w-full p-3 rounded-lg border text-left transition-all hover:shadow-md",
                              config.bgColor,
                              isToday && "ring-2 ring-primary ring-offset-2"
                            )}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <Icon className={cn("h-4 w-4 shrink-0", config.color)} />
                              <span className="text-xs font-medium text-muted-foreground">
                                {isToday ? 'Today' : format(event.date, 'MMM d')}
                              </span>
                              {event.priority === 'high' && (
                                <AlertTriangle className="h-3 w-3 text-danger ml-auto" />
                              )}
                            </div>
                            <p className="text-sm font-medium truncate">{event.title}</p>
                            {event.projectName && (
                              <p className="text-xs text-muted-foreground truncate mt-0.5">
                                {event.projectName}
                              </p>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
              
              {/* Monthly Summary */}
              <Card className="glass-card border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold">
                    {format(currentMonth, 'MMMM yyyy')} Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Total Events</span>
                      <Badge variant="secondary">{filteredEvents.length}</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Fortnight Deadlines</span>
                      <Badge variant="outline" className="bg-primary/10">
                        {filteredEvents.filter(e => e.type === 'fortnight-end').length}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">PC Dates</span>
                      <Badge variant="outline" className="bg-success/10">
                        {filteredEvents.filter(e => e.type === 'pc-date').length}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">High Priority</span>
                      <Badge variant="destructive">
                        {filteredEvents.filter(e => e.priority === 'high').length}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </DashboardLayout>
  );
}
