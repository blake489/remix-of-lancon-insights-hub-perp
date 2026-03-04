import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
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
  
} from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { CalendarEvent } from '@/types/calendar';
import { useCalendarEvents, CalendarEventDB, CalendarEventInput } from '@/hooks/useCalendarEvents';
import { MonthlyCalendarGrid } from '@/components/calendar/MonthlyCalendarGrid';
import { EventList } from '@/components/calendar/EventList';
import { EventDialog } from '@/components/calendar/EventDialog';
import { CalendarMetrics } from '@/components/calendar/CalendarMetrics';
import { computeProjectedClaims } from '@/lib/claimsScheduleUtils';
import { ClaimScheduleType } from '@/components/projects/ClaimsScheduleTable';

// ── QLD Public Holidays ──
function getPublicHolidays(year: number): CalendarEvent[] {
  const holidays: { date: Date; title: string }[] = [
    { date: new Date(year, 0, 1), title: "New Year's Day" },
    { date: new Date(year, 0, 27), title: 'Australia Day (QLD)' },
    { date: new Date(year, 3, 25), title: 'Anzac Day' },
    { date: new Date(year, 11, 25), title: 'Christmas Day' },
    { date: new Date(year, 11, 26), title: 'Boxing Day' },
    // Easter - approximate for 2025-2027
    ...(year === 2025 ? [
      { date: new Date(2025, 3, 18), title: 'Good Friday' },
      { date: new Date(2025, 3, 19), title: 'Easter Saturday' },
      { date: new Date(2025, 3, 21), title: 'Easter Monday' },
    ] : year === 2026 ? [
      { date: new Date(2026, 3, 3), title: 'Good Friday' },
      { date: new Date(2026, 3, 4), title: 'Easter Saturday' },
      { date: new Date(2026, 3, 6), title: 'Easter Monday' },
    ] : year === 2027 ? [
      { date: new Date(2027, 2, 26), title: 'Good Friday' },
      { date: new Date(2027, 2, 27), title: 'Easter Saturday' },
      { date: new Date(2027, 2, 29), title: 'Easter Monday' },
    ] : []),
    // Queens Birthday - last Monday of October in QLD
    ...(year === 2025 ? [{ date: new Date(2025, 9, 27), title: "Queen's Birthday (QLD)" }] :
       year === 2026 ? [{ date: new Date(2026, 9, 26), title: "Queen's Birthday (QLD)" }] :
       year === 2027 ? [{ date: new Date(2027, 9, 25), title: "Queen's Birthday (QLD)" }] : []),
    // Royal Qld Show (Ekka) - August
    ...(year === 2025 ? [{ date: new Date(2025, 7, 13), title: 'Royal Qld Show (Ekka)' }] :
       year === 2026 ? [{ date: new Date(2026, 7, 12), title: 'Royal Qld Show (Ekka)' }] :
       year === 2027 ? [{ date: new Date(2027, 7, 11), title: 'Royal Qld Show (Ekka)' }] : []),
  ];

  return holidays.map(h => ({
    id: `holiday-${year}-${h.title}`,
    date: h.date,
    title: `🏖️ ${h.title}`,
    type: 'public-holiday' as const,
    description: 'Public Holiday — QLD',
    priority: 'high' as const,
  }));
}

// ── Fortnight dates ──
function generateFortnightDates(year: number): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  for (let month = 0; month < 12; month++) {
    const monthDate = new Date(year, month, 1);
    const monthStr = format(monthDate, 'MMMM yyyy');
    events.push({
      id: `fn1-start-${year}-${month}`, date: new Date(year, month, 1),
      title: 'FN1 Start', type: 'fortnight-start',
      description: `${monthStr} — First fortnight begins`, priority: 'medium',
    });
    events.push({
      id: `fn1-end-${year}-${month}`, date: new Date(year, month, 14),
      title: 'FN1 End', type: 'fortnight-end',
      description: `${monthStr} — First fortnight metrics due`, priority: 'high',
    });
    events.push({
      id: `fn2-start-${year}-${month}`, date: new Date(year, month, 15),
      title: 'FN2 Start', type: 'fortnight-start',
      description: `${monthStr} — Second fortnight begins`, priority: 'medium',
    });
    const lastDay = endOfMonth(monthDate).getDate();
    events.push({
      id: `fn2-end-${year}-${month}`, date: new Date(year, month, lastDay),
      title: 'FN2 End', type: 'fortnight-end',
      description: `${monthStr} — Second fortnight metrics due`, priority: 'high',
    });
  }
  return events;
}

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEventDB | null>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const { events: dbEvents, createEvent, updateEvent, deleteEvent } = useCalendarEvents(
    subMonths(monthStart, 1), addMonths(monthEnd, 1)
  );

  // ── Fetch projects ──
  const { data: projects } = useQuery({
    queryKey: ['projects-calendar'],
    queryFn: async () => {
      const { data, error } = await supabase.from('projects').select('*').eq('is_archived', false);
      if (error) throw error;
      return data;
    },
  });

  // ── Fetch rain EOT logs ──
  const { data: weatherLogs } = useQuery({
    queryKey: ['weather-eot-calendar'],
    queryFn: async () => {
      const { data, error } = await supabase.from('weather_eot_logs').select('*');
      if (error) throw error;
      return data;
    },
  });

  // ── Fetch new business / sales leads ──
  const { data: salesLeads } = useQuery({
    queryKey: ['sales-leads-calendar'],
    queryFn: async () => {
      const { data, error } = await supabase.from('sales_leads').select('*');
      if (error) throw error;
      return data;
    },
  });

  // ── Build system events ──
  const systemEvents = useMemo(() => {
    const currentYear = new Date().getFullYear();
    let all: CalendarEvent[] = [];

    // Fortnights
    const fortnights = [
      ...generateFortnightDates(currentYear - 1),
      ...generateFortnightDates(currentYear),
      ...generateFortnightDates(currentYear + 1),
    ];
    all.push(...fortnights);

    // Public holidays
    const holidays = [
      ...getPublicHolidays(currentYear - 1),
      ...getPublicHolidays(currentYear),
      ...getPublicHolidays(currentYear + 1),
    ];
    all.push(...holidays);

    // ── Project milestones + projected claims ──
    (projects || []).forEach((p: any) => {
      // Site start
      if (p.site_start_date) {
        all.push({
          id: `start-${p.id}`, date: new Date(p.site_start_date + 'T00:00:00'),
          title: `${p.job_name} Start`, type: 'project-start',
          projectId: p.id, projectName: p.job_name,
          description: `Site Manager: ${p.site_manager || '—'}`, priority: 'medium',
        });
      }

      // Projected claims from schedule
      if (p.start_date && p.contract_value_ex_gst > 0) {
        const variations = Array.isArray(p.variations) ? p.variations : [];
        const projected = computeProjectedClaims(
          p.id, p.start_date,
          (p.schedule_type || 'standard') as ClaimScheduleType,
          (p.custom_timeframes || {}) as Record<string, number>,
          p.contract_value_ex_gst,
          p.site_start_date,
          (p.claim_stage_statuses || {}) as Record<string, string>,
          variations,
        );

        projected.forEach(pc => {
          const isVariation = pc.stage.startsWith('Variation:');
          const typeMap: Record<string, CalendarEvent['type']> = {
            planned: isVariation ? 'variation-due' : 'claim-projected',
            confirmed: 'claim-confirmed',
            claimed: 'claim-claimed',
          };
          const eventType = typeMap[pc.status] || 'claim-projected';
          const amtStr = `$${pc.amountExGst.toLocaleString('en-AU', { maximumFractionDigits: 0 })}`;

          all.push({
            id: `claim-${p.id}-${pc.stage}`,
            date: pc.projectedDate,
            title: `${p.job_name} — ${pc.stage}`,
            type: eventType,
            projectId: p.id,
            projectName: p.job_name,
            description: `${amtStr} ex GST · ${pc.status}`,
            priority: pc.status === 'claimed' ? 'low' : 'high',
          });
        });
      }
    });

    // ── Rain EOT days ──
    (weatherLogs || []).forEach((log: any) => {
      // Show rain EOT when rain chance > 25% (matches alert threshold)
      if (log.rain_chance > 25 || log.severity === 'warning' || log.severity === 'danger') {
        const severityLabel = log.rain_amount >= 10 ? 'danger' : log.rain_chance >= 45 ? 'warning' : 'info';
        all.push({
          id: `rain-${log.id}`,
          date: new Date(log.log_date + 'T00:00:00'),
          title: `🌧️ Rain EOT ${log.rain_amount}mm`,
          type: 'rain-eot',
          description: `${log.rain_chance}% chance · ${log.rain_amount}mm · ${severityLabel}`,
          priority: severityLabel === 'danger' ? 'high' : 'medium',
        });
      }
    });

    // ── New Business target dates ──
    (salesLeads || []).forEach((lead: any) => {
      if (lead.target_start_date) {
        const statusEmoji = lead.status === 'Won' ? '🏆' : lead.status === 'Design Fees Paid' ? '✅' : '📋';
        all.push({
          id: `lead-${lead.id}`,
          date: new Date(lead.target_start_date + 'T00:00:00'),
          title: `${statusEmoji} ${lead.client_name}`,
          type: 'new-business',
          description: `$${(lead.estimated_value || 0).toLocaleString()} · ${lead.status}`,
          priority: ['Won', 'Design Fees Paid'].includes(lead.status) ? 'high' : 'medium',
        });
      }
    });

    // ── Filter by active tab ──
    if (activeTab === 'fortnights') {
      all = all.filter(e => e.type.includes('fortnight'));
    } else if (activeTab === 'milestones') {
      all = all.filter(e => ['project-start', 'pc-date', 'revised-completion'].includes(e.type));
    } else if (activeTab === 'claims') {
      all = all.filter(e => ['claim-projected', 'claim-confirmed', 'claim-claimed', 'variation-due'].includes(e.type));
    } else if (activeTab === 'weather') {
      all = all.filter(e => e.type === 'rain-eot');
    } else if (activeTab === 'holidays') {
      all = all.filter(e => e.type === 'public-holiday');
    } else if (activeTab === 'business') {
      all = all.filter(e => e.type === 'new-business');
    }

    return all.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [activeTab, projects, weatherLogs, salesLeads]);

  // ── Event handlers ──
  const handleCreateEvent = () => { setEditingEvent(null); setDialogOpen(true); };
  const handleEditEvent = (event: CalendarEventDB) => { setEditingEvent(event); setDialogOpen(true); };
  const handleSaveEvent = (eventData: CalendarEventInput) => {
    if (editingEvent) { updateEvent.mutate({ id: editingEvent.id, ...eventData }); }
    else { createEvent.mutate(eventData); }
    setDialogOpen(false); setEditingEvent(null);
  };
  const handleDeleteEvent = (id: string) => { deleteEvent.mutate(id); setDialogOpen(false); setEditingEvent(null); };
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1));
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
                <div className="flex items-center rounded-lg border border-border bg-muted p-1">
                  <Button variant={viewMode === 'grid' ? 'secondary' : 'ghost'} size="sm" className="h-7 px-2" onClick={() => setViewMode('grid')}>
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                  <Button variant={viewMode === 'list' ? 'secondary' : 'ghost'} size="sm" className="h-7 px-2" onClick={() => setViewMode('list')}>
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
        
        <main className="mx-auto max-w-7xl px-6 py-6">
          <div className="grid gap-6 lg:grid-cols-4">
            <div className="lg:col-span-3 space-y-4">
              <Card className="glass-card border-border/50">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-4">
                      <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        <CalendarDays className="h-5 w-5 text-primary" />
                        {format(currentMonth, 'MMMM yyyy')}
                      </CardTitle>
                      <div className="flex items-center gap-1">
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => navigateMonth('prev')}>
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setCurrentMonth(new Date())}>Today</Button>
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => navigateMonth('next')}>
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                      <TabsList className="h-8 flex-wrap">
                        <TabsTrigger value="all" className="text-xs px-2">All</TabsTrigger>
                        <TabsTrigger value="claims" className="text-xs px-2">Claims</TabsTrigger>
                        <TabsTrigger value="business" className="text-xs px-2">New Business</TabsTrigger>
                        <TabsTrigger value="weather" className="text-xs px-2">Rain EOT</TabsTrigger>
                        <TabsTrigger value="holidays" className="text-xs px-2">Holidays</TabsTrigger>
                        <TabsTrigger value="fortnights" className="text-xs px-2">Fortnights</TabsTrigger>
                        <TabsTrigger value="milestones" className="text-xs px-2">Milestones</TabsTrigger>
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

              <EventList
                selectedDate={selectedDate}
                dbEvents={dbEvents}
                systemEvents={systemEvents}
                onCreateEvent={handleCreateEvent}
                onEditEvent={handleEditEvent}
              />
            </div>
            
            <div className="space-y-4">
              <CalendarMetrics events={dbEvents} currentMonth={currentMonth} />

              {/* Legend */}
              <Card className="glass-card border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold">Legend</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1.5 text-[11px]">
                  <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-amber-400/80" /> Claim (Planned)</div>
                  <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-sky-500/80" /> Claim (Confirmed)</div>
                  <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-emerald-500/80" /> Claim (Claimed)</div>
                  <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-rose-500/80" /> Variation Due</div>
                  <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-violet-500/80" /> New Business</div>
                  <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-cyan-500/80" /> Rain EOT</div>
                  <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-red-600/80" /> Public Holiday</div>
                  <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-blue-500/80" /> Project Start</div>
                  <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-primary/80" /> Fortnight Start</div>
                  <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-warning/80" /> Fortnight End</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>

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
