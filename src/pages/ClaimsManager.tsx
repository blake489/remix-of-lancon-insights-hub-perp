import { useState, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { ClaimMoveAuditPanel } from '@/components/claims/ClaimMoveAuditPanel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useProjects, ProjectRow } from '@/hooks/useProjects';
import { useClaims, Claim, ClaimInsert } from '@/hooks/useClaims';
import { computeProjectedClaims, ProjectedClaim } from '@/lib/claimsScheduleUtils';
import { supabase } from '@/integrations/supabase/client';
import { ClaimScheduleType } from '@/components/projects/ClaimsScheduleTable';
import { format, addMonths, parse, startOfMonth } from 'date-fns';
import { Plus, Search, Trash2, DollarSign, TrendingUp, TrendingDown, Minus, CalendarClock, CheckCircle2, Circle, CheckCheck, ChevronLeft, ChevronRight } from 'lucide-react';
// Checkbox removed - status managed in edit dialog
import { cn } from '@/lib/utils';

const STAGE_COLORS: Record<string, { bg: string; border: string; text: string; darkBg: string; darkBorder: string }> = {
  'Deposit':        { bg: 'bg-amber-50',   border: 'border-amber-300',   text: 'text-amber-700',   darkBg: 'dark:bg-amber-950/30',   darkBorder: 'dark:border-amber-700' },
  'Slab/Base':      { bg: 'bg-orange-50',  border: 'border-orange-300',  text: 'text-orange-700',  darkBg: 'dark:bg-orange-950/30',  darkBorder: 'dark:border-orange-700' },
  'Retaining Wall': { bg: 'bg-stone-50',   border: 'border-stone-300',   text: 'text-stone-700',   darkBg: 'dark:bg-stone-950/30',   darkBorder: 'dark:border-stone-700' },
  'Frame':          { bg: 'bg-sky-50',     border: 'border-sky-300',     text: 'text-sky-700',     darkBg: 'dark:bg-sky-950/30',     darkBorder: 'dark:border-sky-700' },
  'Enclosed':       { bg: 'bg-indigo-50',  border: 'border-indigo-300',  text: 'text-indigo-700',  darkBg: 'dark:bg-indigo-950/30',  darkBorder: 'dark:border-indigo-700' },
  'Fixing':         { bg: 'bg-violet-50',  border: 'border-violet-300',  text: 'text-violet-700',  darkBg: 'dark:bg-violet-950/30',  darkBorder: 'dark:border-violet-700' },
  'PC':             { bg: 'bg-emerald-50', border: 'border-emerald-300', text: 'text-emerald-700', darkBg: 'dark:bg-emerald-950/30', darkBorder: 'dark:border-emerald-700' },
  'Handover':       { bg: 'bg-teal-50',    border: 'border-teal-300',    text: 'text-teal-700',    darkBg: 'dark:bg-teal-950/30',    darkBorder: 'dark:border-teal-700' },
  'Variation':      { bg: 'bg-rose-50',    border: 'border-rose-300',    text: 'text-rose-700',    darkBg: 'dark:bg-rose-950/30',    darkBorder: 'dark:border-rose-700' },
  'Other':          { bg: 'bg-gray-50',    border: 'border-gray-300',    text: 'text-gray-700',    darkBg: 'dark:bg-gray-950/30',    darkBorder: 'dark:border-gray-700' },
};

function getStageColor(claimType: string) {
  // Match by partial key (e.g. "Slab/Base Stage" matches "Slab/Base")
  for (const [key, val] of Object.entries(STAGE_COLORS)) {
    if (claimType.includes(key)) return val;
  }
  return STAGE_COLORS['Other'];
}

const CLAIM_TYPES = ['Deposit', 'Base', 'Slab/Base Stage', 'Frame Stage', 'Enclosed Stage', 'Fixing Stage', 'PC', 'Handover', 'Retaining Wall', 'Variation', 'Other'];

function formatCurrency(val: number) {
  const abs = Math.abs(val);
  const formatted = abs.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return val < 0 ? `-$${formatted}` : `$${formatted}`;
}

function getMonthRange(start: string, end: string): string[] {
  const months: string[] = [];
  let current = startOfMonth(parse(start + '-01', 'yyyy-MM-dd', new Date()));
  const last = startOfMonth(parse(end + '-01', 'yyyy-MM-dd', new Date()));
  while (current <= last) {
    months.push(format(current, 'yyyy-MM'));
    current = addMonths(current, 1);
  }
  return months;
}

function monthLabel(key: string) {
  const d = parse(key + '-01', 'yyyy-MM-dd', new Date());
  return format(d, 'MMM yyyy');
}

/** Determine which fortnight half a date falls into: 1 = 1st-15th, 2 = 16th-end */
function getHalf(dateStr: string): 1 | 2 {
  const day = new Date(dateStr + 'T00:00:00').getDate();
  return day <= 15 ? 1 : 2;
}

function getLastDay(monthKey: string): number {
  const [y, m] = monthKey.split('-').map(Number);
  return new Date(y, m, 0).getDate();
}

export default function ClaimsManager() {
  const { toast } = useToast();
  const { projects, isLoading: projectsLoading } = useProjects();
  const { claims, isLoading: claimsLoading, addClaim, updateClaim, deleteClaim } = useClaims();

  // Month range
  const now = new Date();
  const [startMonth, setStartMonth] = useState(format(now, 'yyyy-MM'));
  const [endMonth, setEndMonth] = useState(format(addMonths(now, 2), 'yyyy-MM'));
  const [tempStart, setTempStart] = useState(startMonth);
  const [tempEnd, setTempEnd] = useState(endMonth);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSupervisor, setFilterSupervisor] = useState('all');
  const [filterStatus, setFilterStatus] = useState('Active');

  // Selected project row
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // Claim modal
  const [claimDialogOpen, setClaimDialogOpen] = useState(false);
  const [editingClaim, setEditingClaim] = useState<Claim | null>(null);
  const [claimForm, setClaimForm] = useState({
    project_id: '',
    claim_date: format(now, 'yyyy-MM-dd'),
    claim_type: 'Base' as string,
    direction: 'Up' as 'Up' | 'Down',
    amount: '',
    reference: '',
    notes: '',
    status: 'planned' as string,
  });

  // Inline editing
  const [inlineEditId, setInlineEditId] = useState<string | null>(null);
  const [inlineEditAmount, setInlineEditAmount] = useState('');

  // Celebration animation for claimed status
  const [celebratingClaimId, setCelebratingClaimId] = useState<string | null>(null);

  // Drag state
  const [dragClaim, setDragClaim] = useState<{ id: string; projectId: string } | null>(null);
  const [dragOverCell, setDragOverCell] = useState<string | null>(null);

  // Move-date dialog state (shown after drop)
  const [moveDateDialog, setMoveDateDialog] = useState<{
    claim: Claim;
    targetMonth: string;
    targetHalf: 1 | 2;
    date: string;
    reasonCategory: string;
    reasonText: string;
  } | null>(null);

  const months = useMemo(() => getMonthRange(startMonth, endMonth), [startMonth, endMonth]);

  // Active projects only, filtered
  const activeProjects = useMemo(() => {
    return (projects || []).filter((p: ProjectRow) => {
      const matchSearch = !searchQuery ||
        p.job_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.address?.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchSupervisor = filterSupervisor === 'all' || p.site_manager === filterSupervisor;
      const matchStatus = filterStatus === 'all' || p.status === filterStatus;
      return matchSearch && matchSupervisor && matchStatus;
    });
  }, [projects, searchQuery, filterSupervisor, filterStatus]);

  // Supervisors for filter
  const supervisors = useMemo(() => {
    const set = new Set((projects || []).map((p: ProjectRow) => p.site_manager).filter(Boolean));
    return Array.from(set).sort();
  }, [projects]);

  // Claims grouped by project_id + month_key + half
  const claimMap = useMemo(() => {
    const map = new Map<string, Claim[]>();
    claims.forEach(c => {
      const half = getHalf(c.claim_date);
      const key = `${c.project_id}__${c.month_key}__${half}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(c);
    });
    return map;
  }, [claims]);

  // Projected claims from schedule
  const projectedClaimMap = useMemo(() => {
    const map = new Map<string, ProjectedClaim[]>();
    (projects || []).forEach((p: ProjectRow) => {
      if (!p.start_date || p.contract_value_ex_gst <= 0) return;
      const projected = computeProjectedClaims(
        p.id,
        p.start_date,
        (p.schedule_type || 'standard') as ClaimScheduleType,
        (p.custom_timeframes || {}) as Record<string, number>,
        p.contract_value_ex_gst,
        p.site_start_date,
      );
      projected.forEach(pc => {
        const half = getHalf(format(pc.projectedDate, 'yyyy-MM-dd'));
        const key = `${pc.projectId}__${pc.monthKey}__${half}`;
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(pc);
      });
    });
    return map;
  }, [projects]);

  // Check if a projected claim has a matching actual claim (same project + stage)
  const hasActualClaim = useCallback((projectId: string, stage: string) => {
    return claims.some(c => c.project_id === projectId && c.claim_type === stage);
  }, [claims]);

  // Summary totals for visible range
  const summaryTotals = useMemo(() => {
    const visible = claims.filter(c => months.includes(c.month_key));
    const up = visible.filter(c => c.direction === 'Up').reduce((s, c) => s + c.amount, 0);
    const down = visible.filter(c => c.direction === 'Down').reduce((s, c) => s + c.amount, 0);
    return { up, down, net: up + down };
  }, [claims, months]);

  // Status-based month metrics: planned/confirmed/claimed per month
  const monthStatusTotals = useMemo(() => {
    const map = new Map<string, { planned: number; confirmed: number; claimed: number }>();
    claims.forEach(c => {
      if (!months.includes(c.month_key)) return;
      if (!map.has(c.month_key)) map.set(c.month_key, { planned: 0, confirmed: 0, claimed: 0 });
      const entry = map.get(c.month_key)!;
      const amt = Math.abs(c.amount);
      const status = (c.status || 'planned') as 'planned' | 'confirmed' | 'claimed';
      entry[status] += amt;
    });
    // Also add projected (not yet created) claims as planned
    (projects || []).forEach((p: ProjectRow) => {
      if (!p.start_date || p.contract_value_ex_gst <= 0) return;
      const projected = computeProjectedClaims(
        p.id, p.start_date,
        (p.schedule_type || 'standard') as ClaimScheduleType,
        (p.custom_timeframes || {}) as Record<string, number>,
        p.contract_value_ex_gst,
        p.site_start_date,
      );
      projected.forEach(pc => {
        if (!months.includes(pc.monthKey)) return;
        if (claims.some(c => c.project_id === pc.projectId && c.claim_type === pc.stage)) return;
        if (!map.has(pc.monthKey)) map.set(pc.monthKey, { planned: 0, confirmed: 0, claimed: 0 });
        map.get(pc.monthKey)!.planned += pc.amountExGst;
      });
    });
    return map;
  }, [claims, months, projects]);

  // Full month totals for the header
  const monthTotals = useMemo(() => {
    const map = new Map<string, number>();
    claims.forEach(c => {
      map.set(c.month_key, (map.get(c.month_key) || 0) + c.amount);
    });
    return map;
  }, [claims]);


  const resetClaimForm = useCallback(() => {
    setClaimForm({
      project_id: '',
      claim_date: format(now, 'yyyy-MM-dd'),
      claim_type: 'Base',
      direction: 'Up',
      amount: '',
      reference: '',
      notes: '',
      status: 'planned',
    });
    setEditingClaim(null);
  }, []);

  const openAddClaim = () => {
    resetClaimForm();
    setClaimDialogOpen(true);
  };

  const openEditClaim = (claim: Claim) => {
    setEditingClaim(claim);
    setClaimForm({
      project_id: claim.project_id,
      claim_date: claim.claim_date,
      claim_type: claim.claim_type,
      direction: claim.direction,
      amount: Math.abs(claim.amount).toString(),
      reference: claim.reference || '',
      notes: claim.notes || '',
      status: claim.status || 'planned',
    });
    setClaimDialogOpen(true);
  };

  // Open dialog pre-filled from a projected claim
  const openFromProjected = (pc: ProjectedClaim) => {
    resetClaimForm();
    setClaimForm({
      project_id: pc.projectId,
      claim_date: format(pc.projectedDate, 'yyyy-MM-dd'),
      claim_type: pc.stage,
      direction: 'Up',
      amount: pc.amountExGst.toFixed(2),
      reference: '',
      notes: `Scheduled ${pc.stage} claim`,
      status: 'planned',
    });
    setClaimDialogOpen(true);
  };

  const handleSaveClaim = async () => {
    if (!claimForm.project_id || !claimForm.claim_date || !claimForm.amount) {
      toast({ title: 'Please fill all required fields', variant: 'destructive' });
      return;
    }
    const payload: ClaimInsert = {
      project_id: claimForm.project_id,
      claim_date: claimForm.claim_date,
      claim_type: claimForm.claim_type,
      direction: claimForm.direction,
      amount: parseFloat(claimForm.amount) || 0,
      reference: claimForm.reference || null,
      notes: claimForm.notes || null,
      status: claimForm.status || 'planned',
    };
    try {
      if (editingClaim) {
        await updateClaim.mutateAsync({ id: editingClaim.id, ...payload });
        // Trigger celebration if status changed to claimed
        if (payload.status === 'claimed' && editingClaim.status !== 'claimed') {
          setCelebratingClaimId(editingClaim.id);
          setTimeout(() => setCelebratingClaimId(null), 2000);
          // Full-screen confetti burst
          const end = Date.now() + 1500;
          const colors = ['#10b981', '#34d399', '#6ee7b7', '#fbbf24', '#f59e0b'];
          (function frame() {
            confetti({ particleCount: 4, angle: 60, spread: 55, origin: { x: 0, y: 0.7 }, colors });
            confetti({ particleCount: 4, angle: 120, spread: 55, origin: { x: 1, y: 0.7 }, colors });
            if (Date.now() < end) requestAnimationFrame(frame);
          })();
        }
        toast({ title: 'Claim updated' });
      } else {
        await addClaim.mutateAsync(payload);
        toast({ title: 'Claim added' });
      }
      setClaimDialogOpen(false);
      resetClaimForm();
    } catch (e: any) {
      toast({ title: 'Error saving claim', description: e.message, variant: 'destructive' });
    }
  };

  const handleDeleteClaim = async () => {
    if (!editingClaim) return;
    try {
      await deleteClaim.mutateAsync(editingClaim.id);
      toast({ title: 'Claim deleted' });
      setClaimDialogOpen(false);
      resetClaimForm();
    } catch (e: any) {
      toast({ title: 'Error deleting claim', description: e.message, variant: 'destructive' });
    }
  };

  // Inline amount save
  const handleInlineSave = async (claim: Claim) => {
    const newAmount = parseFloat(inlineEditAmount);
    if (isNaN(newAmount) || newAmount === 0) {
      setInlineEditId(null);
      return;
    }
    try {
      await updateClaim.mutateAsync({
        id: claim.id,
        project_id: claim.project_id,
        claim_date: claim.claim_date,
        claim_type: claim.claim_type,
        direction: claim.direction,
        amount: newAmount,
        reference: claim.reference,
        notes: claim.notes,
      });
      toast({ title: 'Amount updated' });
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
    setInlineEditId(null);
  };

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, claimId: string, projectId: string) => {
    setDragClaim({ id: claimId, projectId });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, projectId: string, cellKey: string) => {
    if (dragClaim && dragClaim.projectId === projectId) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      if (dragOverCell !== cellKey) setDragOverCell(cellKey);
    }
  };

  const handleDrop = (e: React.DragEvent, projectId: string, monthKey: string, half: 1 | 2) => {
    e.preventDefault();
    if (!dragClaim || dragClaim.projectId !== projectId) return;

    const claim = claims.find(c => c.id === dragClaim.id);
    if (!claim) {
      setDragClaim(null);
      return;
    }

    // Default date: 1st or 16th of the target month
    const defaultDay = half === 1 ? '01' : '16';
    const defaultDate = `${monthKey}-${defaultDay}`;

    setMoveDateDialog({
      claim,
      targetMonth: monthKey,
      targetHalf: half,
      date: defaultDate,
      reasonCategory: '',
      reasonText: '',
    });
    setDragClaim(null);
  };

  // Click-based move: shift claim by one fortnight left or right
  const handleClickMove = (claim: Claim, direction: 'left' | 'right') => {
    const currentDate = new Date(claim.claim_date + 'T00:00:00');
    const day = currentDate.getDate();
    let targetDate: Date;

    if (direction === 'right') {
      // Move to next fortnight
      if (day <= 15) {
        targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 16);
      } else {
        targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
      }
    } else {
      // Move to previous fortnight
      if (day >= 16) {
        targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      } else {
        // Go to 16th of previous month
        targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 16);
      }
    }

    const targetMonthKey = format(targetDate, 'yyyy-MM');
    const targetHalf: 1 | 2 = targetDate.getDate() <= 15 ? 1 : 2;

    setMoveDateDialog({
      claim,
      targetMonth: targetMonthKey,
      targetHalf: targetHalf,
      date: format(targetDate, 'yyyy-MM-dd'),
      reasonCategory: '',
      reasonText: '',
    });
  };

  const handleMoveConfirm = async () => {
    if (!moveDateDialog) return;
    const { claim, date, reasonCategory, reasonText } = moveDateDialog;

    // Require a reason
    if (!reasonCategory) {
      toast({ title: 'Please select a reason for moving this claim', variant: 'destructive' });
      return;
    }
    if (reasonCategory === 'Custom' && !reasonText.trim()) {
      toast({ title: 'Please enter a custom reason', variant: 'destructive' });
      return;
    }

    const oldDate = claim.claim_date;
    const daysDelta = Math.round((new Date(date + 'T00:00:00').getTime() - new Date(oldDate + 'T00:00:00').getTime()) / (1000 * 60 * 60 * 24));

    try {
      await updateClaim.mutateAsync({
        id: claim.id,
        project_id: claim.project_id,
        claim_date: date,
        claim_type: claim.claim_type,
        direction: claim.direction,
        amount: Math.abs(claim.amount),
        reference: claim.reference,
        notes: claim.notes,
      });
      // Log the move with reason and days delta
      await supabase.from('claim_moves').insert({
        claim_id: claim.id,
        project_id: claim.project_id,
        claim_type: claim.claim_type,
        old_date: oldDate,
        new_date: date,
        days_delta: daysDelta,
        reason_category: reasonCategory === 'Custom' ? 'Custom' : reasonCategory,
        reason_text: reasonCategory === 'Custom' ? reasonText.trim() : reasonCategory,
      });
      toast({ title: `Moved to ${format(new Date(date + 'T00:00:00'), 'dd MMM yyyy')} (${daysDelta > 0 ? '+' : ''}${daysDelta} days)` });
    } catch (e: any) {
      toast({ title: 'Error moving claim', description: e.message, variant: 'destructive' });
    }
    setMoveDateDialog(null);
  };

  const applyRange = () => {
    setStartMonth(tempStart);
    setEndMonth(tempEnd);
  };

  const isLoading = projectsLoading || claimsLoading;

  const selectedProject = (projects || []).find((p: ProjectRow) => p.id === claimForm.project_id);

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-2rem)] p-4 gap-4">
        {/* Top Toolbar */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Claims Manager</h1>
              <p className="text-sm text-muted-foreground">Monthly claims schedule</p>
            </div>
            <Button onClick={openAddClaim} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Claim
            </Button>
          </div>

          {/* Controls Row */}
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex items-end gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Start</Label>
                <Input type="month" value={tempStart} onChange={e => setTempStart(e.target.value)} className="w-36 h-9 text-sm" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">End</Label>
                <Input type="month" value={tempEnd} onChange={e => setTempEnd(e.target.value)} className="w-36 h-9 text-sm" />
              </div>
              <Button size="sm" variant="secondary" onClick={applyRange}>Apply</Button>
            </div>

            <div className="h-8 w-px bg-border" />

            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search projects..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9 w-48 h-9 text-sm" />
            </div>

            <Select value={filterSupervisor} onValueChange={setFilterSupervisor}>
              <SelectTrigger className="w-40 h-9 text-sm"><SelectValue placeholder="Supervisor" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Supervisors</SelectItem>
                {supervisors.map(s => <SelectItem key={s} value={s!}>{s}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-32 h-9 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Complete">Complete</SelectItem>
                <SelectItem value="On Hold">On Hold</SelectItem>
              </SelectContent>
            </Select>

            <div className="h-8 w-px bg-border" />

            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
                <span className="font-semibold text-emerald-600">{formatCurrency(summaryTotals.up)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <TrendingDown className="h-4 w-4 text-red-500" />
                <span className="font-semibold text-red-600">{formatCurrency(summaryTotals.down)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Minus className="h-4 w-4 text-muted-foreground" />
                <span className="font-bold">{formatCurrency(summaryTotals.net)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Spreadsheet Grid */}
        <div className="flex-1 border rounded-lg overflow-hidden bg-card">
          {isLoading ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">Loading...</div>
          ) : (
            <div className="flex h-full">
              {/* Left Fixed Project Index Pane */}
              <div className="w-[280px] shrink-0 border-r bg-muted/20 flex flex-col">
                <div className="border-b bg-muted/40 flex flex-col">
                  <div className="h-7 flex items-center px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Project
                  </div>
                  <div className="h-5 border-t bg-muted/20 flex items-center px-3 text-[9px] text-muted-foreground">
                    Supervisor
                  </div>
                  <div className="h-6 border-t flex items-center px-3 text-[10px] font-medium text-muted-foreground">
                    Contract Date
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {activeProjects.length === 0 ? (
                    <div className="p-6 text-center text-sm text-muted-foreground">
                      No projects yet — add a project to begin.
                    </div>
                  ) : (
                    activeProjects.map((p: ProjectRow) => (
                      <div
                        key={p.id}
                        className={cn(
                          "h-[100px] border-b px-3 py-2 cursor-pointer transition-colors hover:bg-muted/30 flex flex-col justify-center",
                          selectedProjectId === p.id && "bg-primary/5 border-l-2 border-l-primary"
                        )}
                        onClick={() => setSelectedProjectId(selectedProjectId === p.id ? null : p.id)}
                      >
                        <p className="text-sm font-medium truncate leading-tight">{p.job_name}</p>
                        {p.site_manager && (
                          <p className="text-xs text-muted-foreground truncate">{p.site_manager}</p>
                        )}
                        {p.start_date && (
                          <p className="text-[10px] text-muted-foreground/60 truncate">
                            Contract: {format(new Date(p.start_date + 'T00:00:00'), 'dd MMM yyyy')}
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Right Claims Grid */}
              <div className="flex-1 overflow-hidden">
                <ScrollArea className="h-full w-full">
                  <div className="inline-flex flex-col min-w-full">
                    {/* Month Headers */}
                    <div className="sticky top-0 z-10 bg-muted/40 border-b">
                      {/* Top row: month names + status metrics */}
                      <div className="flex">
                        {months.map(mk => {
                          const st = monthStatusTotals.get(mk) || { planned: 0, confirmed: 0, claimed: 0 };
                          return (
                            <div key={mk} className="w-[300px] shrink-0 border-r">
                              <div className="h-7 flex items-center justify-center gap-2">
                                <span className="text-xs font-semibold uppercase tracking-wide">{monthLabel(mk)}</span>
                                {monthTotals.has(mk) && (
                                  <span className={cn(
                                    "text-[10px] font-medium",
                                    (monthTotals.get(mk) || 0) >= 0 ? "text-emerald-600" : "text-red-600"
                                  )}>
                                    {formatCurrency(monthTotals.get(mk) || 0)}
                                  </span>
                                )}
                              </div>
                              {/* Status metrics row */}
                              <div className="flex items-center justify-center gap-2 h-5 border-t bg-muted/20">
                                <span className="text-[9px] flex items-center gap-0.5">
                                  <Circle className="h-2 w-2 text-muted-foreground" />
                                  <span className="text-muted-foreground">{formatCurrency(st.planned)}</span>
                                </span>
                                <span className="text-[9px] flex items-center gap-0.5">
                                  <CheckCircle2 className="h-2 w-2 text-amber-500" />
                                  <span className="text-amber-600">{formatCurrency(st.confirmed)}</span>
                                </span>
                                <span className="text-[9px] flex items-center gap-0.5">
                                  <CheckCheck className="h-2 w-2 text-emerald-500" />
                                  <span className="text-emerald-600">{formatCurrency(st.claimed)}</span>
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      {/* Sub row: fortnight labels */}
                      <div className="flex border-t">
                        {months.map(mk => {
                          const lastDay = getLastDay(mk);
                          return (
                            <div key={mk} className="w-[300px] shrink-0 flex border-r">
                              <div className="w-1/2 h-6 flex items-center justify-center border-r text-[10px] font-medium text-muted-foreground">
                                1st – 15th
                              </div>
                              <div className="w-1/2 h-6 flex items-center justify-center text-[10px] font-medium text-muted-foreground">
                                16th – {lastDay}th
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Claims Rows (per project) */}
                    {activeProjects.length === 0 ? (
                      <div className="p-8 text-center text-muted-foreground text-sm">
                        Blank month columns ready to populate.
                      </div>
                    ) : (
                      activeProjects.map((p: ProjectRow) => (
                        <div
                          key={p.id}
                          className={cn(
                            "flex h-[100px] border-b transition-colors",
                            selectedProjectId === p.id && "bg-primary/5"
                          )}
                        >
                          {months.map(mk => (
                            <div key={mk} className="w-[300px] shrink-0 flex border-r">
                              {([1, 2] as const).map(half => {
                                const cellClaims = claimMap.get(`${p.id}__${mk}__${half}`) || [];
                                const cellProjected = (projectedClaimMap.get(`${p.id}__${mk}__${half}`) || [])
                                  .filter(pc => !hasActualClaim(p.id, pc.stage));

                                return (
                                  <div
                                    key={half}
                                    className={cn(
                                      "w-1/2 p-1 flex flex-col gap-1 overflow-hidden transition-all duration-200 ease-in-out ring-0 ring-transparent",
                                      half === 1 && "border-r",
                                      dragClaim?.projectId === p.id && "bg-accent/20",
                                      dragOverCell === `${p.id}__${mk}__${half}` && "bg-primary/15 ring-2 ring-primary/40 ring-inset"
                                    )}
                                    onDragOver={e => handleDragOver(e, p.id, `${p.id}__${mk}__${half}`)}
                                    onDragLeave={() => setDragOverCell(null)}
                                    onDrop={e => handleDrop(e, p.id, mk, half)}
                                  >
                                    {/* Actual Claims */}
                                    {cellClaims.map(claim => {
                                      const sc = getStageColor(claim.claim_type);
                                      return (
                                        <div
                                          key={claim.id}
                                          draggable
                                          onDragStart={e => handleDragStart(e, claim.id, p.id)}
                                          onDragEnd={() => { setDragClaim(null); setDragOverCell(null); }}
                                          onClick={() => openEditClaim(claim)}
                                          className={cn(
                                            "group/tile w-full rounded px-1.5 py-1 text-left text-xs transition-all hover:shadow-md cursor-grab active:cursor-grabbing border relative overflow-visible",
                                            claim.status === 'claimed'
                                              ? 'bg-emerald-100 border-emerald-400 dark:bg-emerald-950/40 dark:border-emerald-600'
                                              : cn(sc.bg, sc.border, sc.darkBg, sc.darkBorder)
                                          )}
                                        >
                                          {/* Celebration emoji animation */}
                                          {celebratingClaimId === claim.id && (
                                            <div className="absolute inset-0 pointer-events-none z-20 overflow-visible">
                                              {['🎉', '🥳', '🎊', '✨', '🎉', '🥳'].map((emoji, idx) => (
                                                <span
                                                  key={idx}
                                                  className="absolute text-base"
                                                  style={{
                                                    left: `${10 + idx * 15}%`,
                                                    bottom: '0%',
                                                    animation: `celebrate-float 1.8s ease-out ${idx * 0.15}s forwards`,
                                                  }}
                                                >
                                                  {emoji}
                                                </span>
                                              ))}
                                            </div>
                                          )}
                                          <div className="flex items-center justify-between gap-0.5">
                                            <span
                                              className={cn("font-medium truncate cursor-pointer text-[10px]", sc.text)}
                                              onClick={() => openEditClaim(claim)}
                                            >
                                              {claim.claim_type}
                                            </span>
                                            <CalendarClock className="h-2.5 w-2.5 text-muted-foreground shrink-0" />
                                          </div>
                                          <span className="text-[9px] text-muted-foreground block">
                                            {format(new Date(claim.claim_date + 'T00:00:00'), 'dd MMM')}
                                          </span>
                                          {inlineEditId === claim.id ? (
                                            <Input
                                              type="number"
                                              step="0.01"
                                              autoFocus
                                              className="h-5 text-[10px] p-0.5 mt-0.5 w-full"
                                              value={inlineEditAmount}
                                              onChange={e => setInlineEditAmount(e.target.value)}
                                              onBlur={() => handleInlineSave(claim)}
                                              onKeyDown={e => {
                                                if (e.key === 'Enter') handleInlineSave(claim);
                                                if (e.key === 'Escape') setInlineEditId(null);
                                              }}
                                            />
                                          ) : (
                                            <div
                                              className={cn(
                                                "font-semibold tabular-nums cursor-pointer hover:underline text-[10px]", sc.text
                                              )}
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setInlineEditId(claim.id);
                                                setInlineEditAmount(Math.abs(claim.amount).toString());
                                              }}
                                            >
                                              {formatCurrency(claim.amount)}
                                            </div>
                                          )}
                                          {(() => {
                                            const proj = (projects || []).find((pr: ProjectRow) => pr.id === claim.project_id);
                                            if (proj && proj.contract_value_ex_gst > 0) {
                                              const pct = (Math.abs(claim.amount) / proj.contract_value_ex_gst * 100).toFixed(0);
                                              return <span className="text-[9px] text-muted-foreground">{pct}%</span>;
                                            }
                                            return null;
                                          })()}
                                          {/* Status label */}
                                          <span className={cn("font-semibold", {
                                            'text-[9px] text-muted-foreground': claim.status === 'planned',
                                            'text-[9px] text-amber-600': claim.status === 'confirmed',
                                            'text-[11px] text-emerald-700 dark:text-emerald-400': claim.status === 'claimed',
                                          })}>
                                            {claim.status === 'planned' ? 'Planned' : claim.status === 'confirmed' ? 'Confirmed' : 'Claimed'}
                                          </span>
                                          {/* Move arrows - shown on hover */}
                                          <div className="flex items-center justify-between mt-0.5 opacity-0 group-hover/tile:opacity-100 transition-opacity">
                                            <button
                                              className="p-0 h-4 w-4 rounded hover:bg-foreground/10 flex items-center justify-center transition-colors"
                                              title="Move to previous fortnight"
                                              onClick={(e) => { e.stopPropagation(); handleClickMove(claim, 'left'); }}
                                            >
                                              <ChevronLeft className="h-3 w-3 text-muted-foreground" />
                                            </button>
                                            <span className="text-[8px] text-muted-foreground">Move</span>
                                            <button
                                              className="p-0 h-4 w-4 rounded hover:bg-foreground/10 flex items-center justify-center transition-colors"
                                              title="Move to next fortnight"
                                              onClick={(e) => { e.stopPropagation(); handleClickMove(claim, 'right'); }}
                                            >
                                              <ChevronRight className="h-3 w-3 text-muted-foreground" />
                                            </button>
                                          </div>
                                        </div>
                                      );
                                    })}

                                    {/* Projected (Scheduled) Claims */}
                                    {cellProjected.map(pc => {
                                      const sc = getStageColor(pc.stage);
                                      return (
                                        <button
                                          key={`projected-${pc.stage}`}
                                          onClick={() => openFromProjected(pc)}
                                          className={cn(
                                            "w-full rounded px-1.5 py-1 text-left text-[10px] border-2 border-dashed hover:shadow-sm transition-all cursor-pointer",
                                            sc.bg, sc.darkBg,
                                            sc.border.replace('border-', 'border-dashed border-')
                                          )}
                                          style={{ borderStyle: 'dashed' }}
                                        >
                                          <div className="flex items-center justify-between gap-0.5">
                                            <span className={cn("font-medium truncate", sc.text)}>{pc.stage}</span>
                                            <CalendarClock className="h-2.5 w-2.5 text-muted-foreground shrink-0" />
                                          </div>
                                          <span className="text-[9px] text-muted-foreground block">
                                            {format(pc.projectedDate, 'dd MMM')}
                                          </span>
                                          <div className={cn("font-semibold tabular-nums", sc.text)}>
                                            {formatCurrency(pc.amountExGst)}
                                          </div>
                                          <span className="text-[9px] text-muted-foreground">{pc.percent}%</span>
                                        </button>
                                      );
                                    })}
                                  </div>
                                );
                              })}
                            </div>
                          ))}
                        </div>
                      ))
                    )}
                  </div>
                  <ScrollBar orientation="horizontal" />
                  <ScrollBar orientation="vertical" />
                </ScrollArea>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Audit Trail Panel - shown when a project is selected */}
      {selectedProjectId && (() => {
        const proj = (projects || []).find((p: ProjectRow) => p.id === selectedProjectId);
        return proj ? <ClaimMoveAuditPanel projectId={selectedProjectId} projectName={proj.job_name} /> : null;
      })()}

      {/* Claim Dialog (Add / Edit) */}
      <Dialog open={claimDialogOpen} onOpenChange={v => { if (!v) { setClaimDialogOpen(false); resetClaimForm(); } else setClaimDialogOpen(true); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingClaim ? 'Edit Claim' : 'Add Claim'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Project *</Label>
              <Select value={claimForm.project_id} onValueChange={v => setClaimForm(f => ({ ...f, project_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
                <SelectContent>
                  {(projects || []).map((p: ProjectRow) => (
                    <SelectItem key={p.id} value={p.id}>{p.job_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedProject?.site_manager && (
              <div className="space-y-1">
                <Label className="text-muted-foreground text-xs">Site Supervisor</Label>
                <p className="text-sm font-medium">{selectedProject.site_manager}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label>Claim Date *</Label>
              <Input type="date" value={claimForm.claim_date} onChange={e => setClaimForm(f => ({ ...f, claim_date: e.target.value }))} />
            </div>

            <div className="space-y-2">
              <Label>Claim Type *</Label>
              <Select value={claimForm.claim_type} onValueChange={v => setClaimForm(f => ({ ...f, claim_type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CLAIM_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Amount *</Label>
              <div className="relative">
                <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={claimForm.amount}
                  onChange={e => setClaimForm(f => ({ ...f, amount: e.target.value }))}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={claimForm.status} onValueChange={v => setClaimForm(f => ({ ...f, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="planned">Planned</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="claimed">Claimed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea rows={2} value={claimForm.notes} onChange={e => setClaimForm(f => ({ ...f, notes: e.target.value }))} />
            </div>

            <div className="flex items-center justify-between pt-2">
              {editingClaim ? (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" className="gap-1.5">
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete this claim?</AlertDialogTitle>
                      <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteClaim}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              ) : <div />}
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => { setClaimDialogOpen(false); resetClaimForm(); }}>Cancel</Button>
                <Button onClick={handleSaveClaim}>
                  {editingClaim ? 'Update' : 'Save'}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Move Date Dialog */}
      <Dialog open={!!moveDateDialog} onOpenChange={v => { if (!v) setMoveDateDialog(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Move Claim — Pick a Date</DialogTitle>
          </DialogHeader>
          {moveDateDialog && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Moving <span className="font-semibold text-foreground">{moveDateDialog.claim.claim_type}</span> ({formatCurrency(moveDateDialog.claim.amount)}) to {monthLabel(moveDateDialog.targetMonth)}.
              </p>
              {/* Days delta preview */}
              {(() => {
                const delta = Math.round((new Date(moveDateDialog.date + 'T00:00:00').getTime() - new Date(moveDateDialog.claim.claim_date + 'T00:00:00').getTime()) / (1000 * 60 * 60 * 24));
                return (
                  <div className={cn("text-sm font-semibold rounded-md px-3 py-2 border", delta > 0 ? "bg-destructive/10 text-destructive border-destructive/20" : delta < 0 ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800" : "bg-muted text-muted-foreground border-border")}>
                    {delta === 0 ? 'No change in days' : delta > 0 ? `⚠️ ${delta} day${delta !== 1 ? 's' : ''} later (delayed)` : `✅ ${Math.abs(delta)} day${Math.abs(delta) !== 1 ? 's' : ''} earlier (brought forward)`}
                  </div>
                );
              })()}
              <div className="space-y-2">
                <Label>New Date *</Label>
                <Input
                  type="date"
                  value={moveDateDialog.date}
                  onChange={e => setMoveDateDialog(prev => prev ? { ...prev, date: e.target.value } : null)}
                />
              </div>
              <div className="space-y-2">
                <Label>Reason for Move *</Label>
                <Select
                  value={moveDateDialog.reasonCategory}
                  onValueChange={v => setMoveDateDialog(prev => prev ? { ...prev, reasonCategory: v, reasonText: v === 'Custom' ? prev.reasonText : '' } : null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a reason..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Trade Delay">Trade Delay</SelectItem>
                    <SelectItem value="Materials Delay">Materials Delay</SelectItem>
                    <SelectItem value="Weather Delay">Weather Delay</SelectItem>
                    <SelectItem value="Schedule Delay">Schedule Delay</SelectItem>
                    <SelectItem value="Custom">Custom Reason</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {moveDateDialog.reasonCategory === 'Custom' && (
                <div className="space-y-2">
                  <Label>Custom Reason *</Label>
                  <Input
                    placeholder="Enter reason..."
                    value={moveDateDialog.reasonText}
                    onChange={e => setMoveDateDialog(prev => prev ? { ...prev, reasonText: e.target.value } : null)}
                  />
                </div>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setMoveDateDialog(null)}>Cancel</Button>
                <Button onClick={handleMoveConfirm}>Confirm Move</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
