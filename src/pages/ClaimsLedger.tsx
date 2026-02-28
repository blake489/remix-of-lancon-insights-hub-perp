import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useProjects, ProjectRow } from '@/hooks/useProjects';
import { useClaims } from '@/hooks/useClaims';
import { useKPISettings } from '@/hooks/useKPISettings';
import { format, parse, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, Search, ArrowUp, ArrowDown, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';

function formatCurrency(val: number) {
  const abs = Math.abs(val);
  const formatted = abs.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return val < 0 ? `-$${formatted}` : `$${formatted}`;
}

function monthLabel(key: string) {
  const d = parse(key + '-01', 'yyyy-MM-dd', new Date());
  return format(d, 'MMMM yyyy');
}

const STAGE_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  'Deposit':        { bg: 'bg-amber-100',   border: 'border-amber-300',   text: 'text-amber-800' },
  'Slab/Base':      { bg: 'bg-orange-100',  border: 'border-orange-300',  text: 'text-orange-800' },
  'Retaining Wall': { bg: 'bg-stone-100',   border: 'border-stone-300',   text: 'text-stone-800' },
  'Frame':          { bg: 'bg-sky-100',     border: 'border-sky-300',     text: 'text-sky-800' },
  'Enclosed':       { bg: 'bg-indigo-100',  border: 'border-indigo-300',  text: 'text-indigo-800' },
  'Fixing':         { bg: 'bg-violet-100',  border: 'border-violet-300',  text: 'text-violet-800' },
  'PC':             { bg: 'bg-emerald-100', border: 'border-emerald-300', text: 'text-emerald-800' },
  'Handover':       { bg: 'bg-teal-100',    border: 'border-teal-300',    text: 'text-teal-800' },
  'Variation':      { bg: 'bg-rose-100',    border: 'border-rose-300',    text: 'text-rose-800' },
};

function getStageBadgeClasses(claimType: string) {
  for (const [key, val] of Object.entries(STAGE_COLORS)) {
    if (claimType.includes(key)) return val;
  }
  return { bg: 'bg-muted', border: 'border-border', text: 'text-foreground' };
}

export default function ClaimsLedger() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialMonth = searchParams.get('month') || format(new Date(), 'yyyy-MM');
  const [currentMonth, setCurrentMonth] = useState(initialMonth);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterDirection, setFilterDirection] = useState('all');

  const { projects, isLoading: projectsLoading } = useProjects();
  const { claims, isLoading: claimsLoading } = useClaims();
  const { data: kpiSettings } = useKPISettings();

  const projectMap = useMemo(() => {
    const map = new Map<string, ProjectRow>();
    (projects || []).forEach(p => map.set(p.id, p));
    return map;
  }, [projects]);

  // Filter claims for the selected month
  const monthClaims = useMemo(() => {
    return claims
      .filter(c => c.month_key === currentMonth)
      .filter(c => {
        if (searchQuery) {
          const project = projectMap.get(c.project_id);
          const haystack = [
            project?.job_name, project?.client_name, project?.site_manager,
            c.claim_type, c.reference, c.notes,
          ].filter(Boolean).join(' ').toLowerCase();
          if (!haystack.includes(searchQuery.toLowerCase())) return false;
        }
        if (filterType !== 'all' && c.claim_type !== filterType) return false;
        if (filterDirection !== 'all' && c.direction !== filterDirection) return false;
        return true;
      })
      .sort((a, b) => a.claim_date.localeCompare(b.claim_date));
  }, [claims, currentMonth, searchQuery, filterType, filterDirection, projectMap]);

  // Unique claim types in this month
  const claimTypes = useMemo(() => {
    const set = new Set(claims.filter(c => c.month_key === currentMonth).map(c => c.claim_type));
    return Array.from(set).sort();
  }, [claims, currentMonth]);

  // Totals — Gross Profit from claims & fixed overheads from Magic
  const totals = useMemo(() => {
    // Calculate gross profit per claim using project's forecast GP%
    const grossProfit = monthClaims
      .filter(c => c.direction === 'Up')
      .reduce((s, c) => {
        const project = projectMap.get(c.project_id);
        const gpRate = (project?.forecast_gp_percent ?? 0) / 100;
        return s + (c.amount * gpRate);
      }, 0);
    // Monthly overheads from KPI settings (same as Magic dashboard)
    const revenueTarget = kpiSettings?.monthly_revenue_target ?? 1650000;
    const overheadPercent = kpiSettings?.overhead_percent ?? 10.5;
    const monthlyOverhead = revenueTarget * (overheadPercent / 100);
    return { grossProfit, overhead: monthlyOverhead, net: grossProfit - monthlyOverhead, count: monthClaims.length };
  }, [monthClaims, kpiSettings, projectMap]);

  const navigateMonth = (dir: 'prev' | 'next') => {
    const d = parse(currentMonth + '-01', 'yyyy-MM-dd', new Date());
    const newMonth = format(dir === 'next' ? addMonths(d, 1) : subMonths(d, 1), 'yyyy-MM');
    setCurrentMonth(newMonth);
    setSearchParams({ month: newMonth });
  };

  const isLoading = projectsLoading || claimsLoading;

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-2rem)] p-4 gap-4">
        {/* Header */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Claims Ledger</h1>
              <p className="text-sm text-muted-foreground">Detailed view of all claims for a given month</p>
            </div>
          </div>

          {/* Month Navigation */}
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" onClick={() => navigateMonth('prev')}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-lg font-semibold min-w-[180px] text-center">
              {monthLabel(currentMonth)}
            </div>
            <Button variant="outline" size="icon" onClick={() => navigateMonth('next')}>
              <ChevronRight className="h-4 w-4" />
            </Button>

            <div className="h-8 w-px bg-border mx-2" />

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search claims..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 w-56 h-9 text-sm"
              />
            </div>

            {/* Type filter */}
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-40 h-9 text-sm"><SelectValue placeholder="Claim Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {claimTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>

            {/* Direction filter */}
            <Select value={filterDirection} onValueChange={setFilterDirection}>
              <SelectTrigger className="w-32 h-9 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="Up">Up (Income)</SelectItem>
                <SelectItem value="Down">Down (Expense)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-4 gap-3">
            <div className="rounded-lg border bg-card p-3">
              <p className="text-xs text-muted-foreground font-medium">Total Claims</p>
              <p className="text-xl font-bold tabular-nums">{totals.count}</p>
            </div>
            <div className="rounded-lg border bg-card p-3">
              <div className="flex items-center gap-1.5">
                <ArrowUp className="h-3.5 w-3.5 text-emerald-500" />
                <p className="text-xs text-muted-foreground font-medium">Gross Profit</p>
              </div>
              <p className="text-xl font-bold tabular-nums text-emerald-600">{formatCurrency(totals.grossProfit)}</p>
            </div>
            <div className="rounded-lg border bg-card p-3">
              <div className="flex items-center gap-1.5">
                <ArrowDown className="h-3.5 w-3.5 text-red-500" />
                <p className="text-xs text-muted-foreground font-medium">Fixed Costs</p>
              </div>
              <p className="text-xl font-bold tabular-nums text-red-600">{formatCurrency(totals.overhead)}</p>
            </div>
            <div className="rounded-lg border bg-card p-3">
              <div className="flex items-center gap-1.5">
                <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                <p className="text-xs text-muted-foreground font-medium">Pure Profit</p>
              </div>
              <p className={cn("text-xl font-bold tabular-nums", totals.net >= 0 ? "text-emerald-600" : "text-red-600")}>
                {formatCurrency(totals.net)}
              </p>
            </div>
          </div>
        </div>

        {/* Claims Table */}
        <div className="flex-1 border rounded-lg overflow-hidden bg-card">
          {isLoading ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">Loading...</div>
          ) : monthClaims.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
              <DollarSign className="h-10 w-10 opacity-30" />
              <p className="text-sm">No claims recorded for {monthLabel(currentMonth)}</p>
            </div>
          ) : (
            <div className="overflow-auto h-full">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="font-semibold w-[140px]">Date</TableHead>
                    <TableHead className="font-semibold">Project</TableHead>
                    <TableHead className="font-semibold">Client</TableHead>
                    <TableHead className="font-semibold">Supervisor</TableHead>
                    <TableHead className="font-semibold w-[140px]">Claim Type</TableHead>
                    <TableHead className="font-semibold w-[80px] text-center">Direction</TableHead>
                    <TableHead className="font-semibold text-right w-[140px]">Amount</TableHead>
                    <TableHead className="font-semibold">Reference</TableHead>
                    <TableHead className="font-semibold">Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {monthClaims.map(claim => {
                    const project = projectMap.get(claim.project_id);
                    const badge = getStageBadgeClasses(claim.claim_type);
                    return (
                      <TableRow key={claim.id} className="hover:bg-muted/20">
                        <TableCell className="tabular-nums text-sm">
                          {format(new Date(claim.claim_date + 'T00:00:00'), 'dd MMM yyyy')}
                        </TableCell>
                        <TableCell className="font-medium text-sm">
                          {project?.job_name || '—'}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {project?.client_name || '—'}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {project?.site_manager || '—'}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn("text-xs font-medium", badge.bg, badge.border, badge.text)}
                          >
                            {claim.claim_type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          {claim.direction === 'Up' ? (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
                              <ArrowUp className="h-3 w-3" /> Up
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600">
                              <ArrowDown className="h-3 w-3" /> Down
                            </span>
                          )}
                        </TableCell>
                        <TableCell className={cn(
                          "text-right font-bold tabular-nums text-sm",
                          claim.direction === 'Up' ? "text-emerald-700" : "text-red-700"
                        )}>
                          {formatCurrency(claim.amount)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {claim.reference || '—'}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                          {claim.notes || '—'}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {/* Totals Row */}
                  <TableRow className="bg-muted/30 font-semibold border-t-2">
                    <TableCell colSpan={6} className="text-right text-sm">
                      Month Total ({totals.count} claims)
                    </TableCell>
                    <TableCell className={cn(
                      "text-right font-bold tabular-nums text-sm",
                      totals.net >= 0 ? "text-emerald-700" : "text-red-700"
                    )}>
                      {formatCurrency(totals.net)}
                    </TableCell>
                    <TableCell colSpan={2} />
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
