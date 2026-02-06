import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ChevronLeft, 
  ChevronRight, 
  CalendarDays,
  Plus,
  List,
  LayoutGrid
} from 'lucide-react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  addMonths, 
  subMonths, 
  parseISO
} from 'date-fns';
import { mockProjects, mockTimings } from '@/data/mockData';
import { CalendarEvent } from '@/types/calendar';
import { useCalendarEvents, CalendarEventDB, CalendarEventInput } from '@/hooks/useCalendarEvents';
import { MonthlyCalendarGrid } from '@/components/calendar/MonthlyCalendarGrid';
import { EventList } from '@/components/calendar/EventList';
import { EventDialog } from '@/components/calendar/EventDialog';
import { CalendarMetrics } from '@/components/calendar/CalendarMetrics';

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
      title: `FN1 Start`,
      type: 'fortnight-start',
      description: `${monthStr} - First fortnight reporting period begins`,
      priority: 'medium',
    });
    
    events.push({
      id: `fn1-end-${year}-${month}`,
      date: new Date(year, month, 14),
      title: `FN1 End`,
      type: 'fortnight-end',
      description: `${monthStr} - First fortnight metrics due`,
      priority: 'high',
    });
    
    // Fortnight 2: 15th - end of month
    events.push({
      id: `fn2-start-${year}-${month}`,
      date: new Date(year, month, 15),
      title: `FN2 Start`,
      type: 'fortnight-start',
      description: `${monthStr} - Second fortnight reporting period begins`,
      priority: 'medium',
    });
    
    const lastDay = endOfMonth(monthDate).getDate();
    events.push({
      id: `fn2-end-${year}-${month}`,
      date: new Date(year, month, lastDay),
      title: `FN2 End`,
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
        title: `${project.jobName} Start`,
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
        title: `${project.jobName} PC`,
        type: 'pc-date',
        projectId: project.id,
        projectName: project.jobName,
        description: `Practical Completion target`,
        priority: 'high',
      });
    }
    
    // Revised completion date (if different from contract)
    if (timing?.revisedCompletionDate && timing.revisedCompletionDate !== timing.contractCompletionDate) {
      events.push({
        id: `revised-${project.id}`,
        date: parseISO(timing.revisedCompletionDate),
        title: `${project.jobName} Revised`,
        type: 'revised-completion',
        projectId: project.id,
        projectName: project.jobName,
        description: `EOT: ${timing.eotDays} days`,
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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEventDB | null>(null);

  // Fetch events from database
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const { 
    events: dbEvents, 
    createEvent, 
    updateEvent, 
    deleteEvent 
  } = useCalendarEvents(
    subMonths(monthStart, 1),
    addMonths(monthEnd, 1)
  );

  // Generate system events (fortnights + project milestones)
  const systemEvents = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const fortnightEvents = [
      ...generateFortnightDates(currentYear - 1),
      ...generateFortnightDates(currentYear),
      ...generateFortnightDates(currentYear + 1),
    ];
    const projectEvents = generateProjectEvents();
    
    let all = [...fortnightEvents, ...projectEvents];

    // Filter by tab
    if (activeTab === 'fortnights') {
      all = all.filter(e => e.type.includes('fortnight'));
    } else if (activeTab === 'milestones') {
      all = all.filter(e => ['pc-date', 'revised-completion', 'project-start'].includes(e.type));
    }

    return all.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [activeTab]);

  // Handle event actions
  const handleCreateEvent = () => {
    setEditingEvent(null);
    setDialogOpen(true);
  };

  const handleEditEvent = (event: CalendarEventDB) => {
    setEditingEvent(event);
    setDialogOpen(true);
  };

  const handleSaveEvent = (eventData: CalendarEventInput) => {
    if (editingEvent) {
      updateEvent.mutate({ id: editingEvent.id, ...eventData });
    } else {
      createEvent.mutate(eventData);
    }
    setDialogOpen(false);
    setEditingEvent(null);
  };

  const handleDeleteEvent = (id: string) => {
    deleteEvent.mutate(id);
    setDialogOpen(false);
    setEditingEvent(null);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => 
      direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1)
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
                  Manage events, track deadlines, and view project milestones
                </p>
              </div>
              <div className="flex items-center gap-3">
                {/* View toggle */}
                <div className="flex items-center rounded-lg border border-border bg-muted p-1">
                  <Button
                    variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                    size="sm"
                    className="h-7 px-2"
                    onClick={() => setViewMode('grid')}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                    size="sm"
                    className="h-7 px-2"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
                <Button onClick={handleCreateEvent}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Event
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <main className="mx-auto max-w-7xl px-6 py-6">
          <div className="grid gap-6 lg:grid-cols-4">
            {/* Calendar Section */}
            <div className="lg:col-span-3 space-y-4">
              {/* Calendar Controls */}
              <Card className="glass-card border-border/50">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        <CalendarDays className="h-5 w-5 text-primary" />
                        {format(currentMonth, 'MMMM yyyy')}
                      </CardTitle>
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => navigateMonth('prev')}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setCurrentMonth(new Date())}
                        >
                          Today
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => navigateMonth('next')}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                      <TabsList className="h-8">
                        <TabsTrigger value="all" className="text-xs px-3">All</TabsTrigger>
                        <TabsTrigger value="fortnights" className="text-xs px-3">Fortnights</TabsTrigger>
                        <TabsTrigger value="milestones" className="text-xs px-3">Milestones</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="h-[600px]">
                    <MonthlyCalendarGrid
                      currentMonth={currentMonth}
                      selectedDate={selectedDate}
                      onSelectDate={setSelectedDate}
                      dbEvents={dbEvents}
                      systemEvents={systemEvents}
                      onEventClick={handleEditEvent}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Selected Day Events */}
              <EventList
                selectedDate={selectedDate}
                dbEvents={dbEvents}
                systemEvents={systemEvents}
                onCreateEvent={handleCreateEvent}
                onEditEvent={handleEditEvent}
              />
            </div>
            
            {/* Sidebar - Metrics */}
            <div className="space-y-4">
              <CalendarMetrics 
                events={dbEvents} 
                currentMonth={currentMonth} 
              />
            </div>
          </div>
        </main>

        {/* Event Dialog */}
        <EventDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          event={editingEvent}
          selectedDate={selectedDate}
          onSave={handleSaveEvent}
          onDelete={handleDeleteEvent}
          isLoading={createEvent.isPending || updateEvent.isPending || deleteEvent.isPending}
        />
      </div>
    </DashboardLayout>
  );
}
