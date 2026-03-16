import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { MonthlyRevenueChart } from '@/components/dashboard/MonthlyRevenueChart';
import { TrafficLight } from '@/components/dashboard/TrafficLight';
import { UpcomingEventsCard } from '@/components/dashboard/UpcomingEventsCard';
import { useGoogleSheetsRevenue } from '@/hooks/useGoogleSheetsRevenue';
import { useSalesLeads } from '@/hooks/useSalesLeads';
import { Target, TrendingUp, Search, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, startOfMonth, endOfMonth, subMonths, isWithinInterval } from 'date-fns';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Cell,
} from 'recharts';
import type { SharedDashboardProps } from '../RoleDashboard';

/* ── constants ── */
const QUOTE_TARGET = 4_000_000;
const GP_SIGN_TARGET = 180_000;

const STATUS_OPTIONS = [
  { value: 'new', label: 'New', color: 'bg-sky-100 text-sky-700 border-sky-200' },
  { value: 'contacted', label: 'Contacted', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { value: 'proposal', label: 'Proposal', color: 'bg-violet-100 text-violet-700 border-violet-200' },
  { value: 'negotiation', label: 'Negotiation', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  { value: 'design_fees_paid', label: 'Design Fees Paid', color: 'bg-cyan-100 text-cyan-700 border-cyan-200' },
  { value: 'won', label: 'Won', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
];

function getStatusStyle(status: string) {
  return STATUS_OPTIONS.find(s => s.value === status) || STATUS_OPTIONS[0];
}

const fmt = (v: number) => {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
  return `$${v.toFixed(0)}`;
};

function kpiTrafficLight(actual: number, target: number): 'success' | 'warning' | 'danger' {
  const pct = target > 0 ? (actual / target) * 100 : 0;
  if (pct >= 90) return 'success';
  if (pct >= 70) return 'warning';
  return 'danger';
}

export function SalesManagerDashboard({ shared }: { shared: SharedDashboardProps }) {
  const { leads, isLoading: leadsLoading } = useSalesLeads();
  const { data: revenueData } = useGoogleSheetsRevenue();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const now = new Date();
  const currentMonthStart = startOfMonth(now);
  const currentMonthEnd = endOfMonth(now);

  /* ── KPI 1: Monthly Quote actual ── */
  const quotedActual = useMemo(() => {
    return leads
      .filter(l => {
        if (l.status !== 'proposal' && l.status !== 'negotiation' && l.status !== 'design_fees_paid' && l.status !== 'won') return false;
        const d = new Date(l.created_at);
        return isWithinInterval(d, { start: currentMonthStart, end: currentMonthEnd });
      })
      .reduce((s, l) => s + l.estimated_value, 0);
  }, [leads, currentMonthStart, currentMonthEnd]);

  /* ── KPI 2: Contracts signed GP this month ── */
  const signedGPActual = useMemo(() => {
    return shared.projects
      .filter(p => {
        if (!p.start_date) return false;
        const d = new Date(p.start_date + 'T00:00:00');
        return isWithinInterval(d, { start: currentMonthStart, end: currentMonthEnd });
      })
      .reduce((s, p) => s + (p.forecast_gross_profit || 0), 0);
  }, [shared.projects, currentMonthStart, currentMonthEnd]);

  /* ── Google Sheets current month revenue ── */
  const currentMonthRevenue = revenueData?.currentMonthRevenue ?? 0;
  const currentMonthLabel = revenueData?.currentMonthLabel ?? format(now, 'MMM yy');

  /* ── Contracts signed by month (past 6 months) ── */
  const contractsByMonth = useMemo(() => {
    const months: { month: string; monthDate: Date; value: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = subMonths(now, i);
      const ms = startOfMonth(d);
      const me = endOfMonth(d);
      const val = shared.projects
        .filter(p => {
          if (!p.start_date) return false;
          const sd = new Date(p.start_date + 'T00:00:00');
          return isWithinInterval(sd, { start: ms, end: me });
        })
        .reduce((s, p) => s + (p.contract_value_ex_gst || 0), 0);
      months.push({ month: format(d, 'MMM yy'), monthDate: d, value: val });
    }
    return months;
  }, [shared.projects]);

  /* ── Filtered leads for pipeline table ── */
  const filteredLeads = useMemo(() => {
    return leads.filter(l => {
      const matchSearch = !search || l.client_name.toLowerCase().includes(search.toLowerCase());
      const matchStatus = filterStatus === 'all' || l.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [leads, search, filterStatus]);

  const quoteStatus = kpiTrafficLight(quotedActual, QUOTE_TARGET);
  const gpSignStatus = kpiTrafficLight(signedGPActual, GP_SIGN_TARGET);

  return (
    <>
      {/* ── Two KPI Target Cards ── */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Quote target */}
        <div className="glass-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Monthly Quote Target</h3>
            </div>
            <TrafficLight status={quoteStatus} size="sm" />
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-2xl font-bold tabular-nums">{fmt(quotedActual)}</p>
              <p className="text-[10px] text-muted-foreground">of {fmt(QUOTE_TARGET)} target</p>
            </div>
            <span className={cn(
              'text-sm font-bold tabular-nums',
              quoteStatus === 'success' ? 'text-emerald-600' : quoteStatus === 'warning' ? 'text-amber-600' : 'text-destructive',
            )}>
              {QUOTE_TARGET > 0 ? Math.round((quotedActual / QUOTE_TARGET) * 100) : 0}%
            </span>
          </div>
          <div className="h-2.5 rounded-full bg-muted overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all',
                quoteStatus === 'success' ? 'bg-emerald-500' : quoteStatus === 'warning' ? 'bg-amber-500' : 'bg-destructive',
              )}
              style={{ width: `${Math.min(100, QUOTE_TARGET > 0 ? (quotedActual / QUOTE_TARGET) * 100 : 0)}%` }}
            />
          </div>
        </div>

        {/* GP sign target */}
        <div className="glass-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Monthly Contracts Signed</h3>
            </div>
            <TrafficLight status={gpSignStatus} size="sm" />
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-2xl font-bold tabular-nums">{fmt(signedGPActual)}</p>
              <p className="text-[10px] text-muted-foreground">of {fmt(GP_SIGN_TARGET)} GP target</p>
            </div>
            <span className={cn(
              'text-sm font-bold tabular-nums',
              gpSignStatus === 'success' ? 'text-emerald-600' : gpSignStatus === 'warning' ? 'text-amber-600' : 'text-destructive',
            )}>
              {GP_SIGN_TARGET > 0 ? Math.round((signedGPActual / GP_SIGN_TARGET) * 100) : 0}%
            </span>
          </div>
          <div className="h-2.5 rounded-full bg-muted overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all',
                gpSignStatus === 'success' ? 'bg-emerald-500' : gpSignStatus === 'warning' ? 'bg-amber-500' : 'bg-destructive',
              )}
              style={{ width: `${Math.min(100, GP_SIGN_TARGET > 0 ? (signedGPActual / GP_SIGN_TARGET) * 100 : 0)}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── Revenue context from Google Sheets ── */}
      <div className="glass-card p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="h-4 w-4 text-primary shrink-0" />
          <div>
            <p className="text-sm font-semibold">
              Current month claims: <span className="tabular-nums">{fmt(currentMonthRevenue)}</span>
            </p>
            <p className="text-[10px] text-muted-foreground">
              This reflects construction revenue from active projects ({currentMonthLabel})
            </p>
          </div>
        </div>
      </div>

      {/* ── Contracts Signed by Month chart ── */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Contracts Signed by Month — Past 6 Months</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={contractsByMonth} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
                <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => fmt(v)}
                />
                <Tooltip
                  formatter={(value: number) => [fmt(value), 'Contract Value']}
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={48}>
                  {contractsByMonth.map((entry, idx) => (
                    <Cell
                      key={idx}
                      fill={entry.value > 0 ? 'hsl(var(--primary))' : 'hsl(var(--muted))'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* ── Sales Pipeline Table ── */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">Sales Pipeline</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-8 w-40 h-8 text-xs"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {STATUS_OPTIONS.map(s => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => shared.navigate('/sales')}>
                Full Pipeline →
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {leadsLoading ? (
            <div className="p-6 text-sm text-muted-foreground text-center">Loading pipeline…</div>
          ) : filteredLeads.length === 0 ? (
            <div className="p-6 text-sm text-muted-foreground text-center">No leads match the filter.</div>
          ) : (
            <div className="overflow-x-auto max-h-[360px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="text-xs font-semibold">Client</TableHead>
                    <TableHead className="text-right text-xs font-semibold">Est. Value</TableHead>
                    <TableHead className="text-xs font-semibold">Type</TableHead>
                    <TableHead className="text-xs font-semibold">Status</TableHead>
                    <TableHead className="text-xs font-semibold">Target Start</TableHead>
                    <TableHead className="text-xs font-semibold">Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeads.map(lead => {
                    const st = getStatusStyle(lead.status);
                    return (
                      <TableRow key={lead.id} className="hover:bg-muted/30">
                        <TableCell className="font-medium text-sm">{lead.client_name}</TableCell>
                        <TableCell className="text-right tabular-nums font-semibold text-sm">
                          {fmt(lead.estimated_value)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn(
                            "text-[10px] font-semibold uppercase",
                            lead.revenue_type === 'firm'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          )}>
                            {lead.revenue_type === 'firm' ? 'Firm' : 'Prospective'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn("text-[10px] font-semibold", st.color)}>
                            {st.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs tabular-nums text-muted-foreground">
                          {lead.target_start_date
                            ? format(new Date(lead.target_start_date + 'T00:00:00'), 'MMM yyyy')
                            : '—'}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-[160px] truncate">
                          {lead.notes || '—'}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Bottom row: events ── */}
      <div className="grid gap-6 lg:grid-cols-2">
        <UpcomingEventsCard shared={shared} />
        <MonthlyRevenueChart />
      </div>
    </>
  );
}
