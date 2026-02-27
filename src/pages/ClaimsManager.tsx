import { useState, useMemo, useCallback } from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useProjects, ProjectRow } from '@/hooks/useProjects';
import { useClaims, Claim, ClaimInsert } from '@/hooks/useClaims';
import { format, addMonths, subMonths, parse, startOfMonth } from 'date-fns';
import { Plus, Search, ArrowUp, ArrowDown, Trash2, DollarSign, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

const CLAIM_TYPES = ['Deposit', 'Base', 'Slab/Base', 'Frame', 'Enclosed', 'Fixing', 'PC', 'Handover', 'Retaining Wall', 'Variation', 'Other'];

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

export default function ClaimsManager() {
  const { toast } = useToast();
  const { projects, isLoading: projectsLoading } = useProjects();
  const { claims, isLoading: claimsLoading, addClaim, updateClaim, deleteClaim } = useClaims();

  // Month range
  const now = new Date();
  const [startMonth, setStartMonth] = useState(format(subMonths(now, 1), 'yyyy-MM'));
  const [endMonth, setEndMonth] = useState(format(addMonths(now, 3), 'yyyy-MM'));
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
  });

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

  // Claims grouped by project_id + month_key
  const claimMap = useMemo(() => {
    const map = new Map<string, Claim[]>();
    claims.forEach(c => {
      const key = `${c.project_id}__${c.month_key}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(c);
    });
    return map;
  }, [claims]);

  // Summary totals for visible range
  const summaryTotals = useMemo(() => {
    const visible = claims.filter(c => months.includes(c.month_key));
    const up = visible.filter(c => c.direction === 'Up').reduce((s, c) => s + c.amount, 0);
    const down = visible.filter(c => c.direction === 'Down').reduce((s, c) => s + c.amount, 0);
    return { up, down, net: up + down };
  }, [claims, months]);

  // Month totals
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
    };
    try {
      if (editingClaim) {
        await updateClaim.mutateAsync({ id: editingClaim.id, ...payload });
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

  const applyRange = () => {
    setStartMonth(tempStart);
    setEndMonth(tempEnd);
  };

  const isLoading = projectsLoading || claimsLoading;

  // Find project name for supervisor display in claim form
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
            {/* Month Range */}
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

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 w-48 h-9 text-sm"
              />
            </div>

            {/* Supervisor Filter */}
            <Select value={filterSupervisor} onValueChange={setFilterSupervisor}>
              <SelectTrigger className="w-40 h-9 text-sm">
                <SelectValue placeholder="Supervisor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Supervisors</SelectItem>
                {supervisors.map(s => <SelectItem key={s} value={s!}>{s}</SelectItem>)}
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-32 h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Complete">Complete</SelectItem>
                <SelectItem value="On Hold">On Hold</SelectItem>
              </SelectContent>
            </Select>

            <div className="h-8 w-px bg-border" />

            {/* Summary Strip */}
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
                {/* Header */}
                <div className="h-12 border-b bg-muted/40 flex items-center px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Project / Supervisor
                </div>
                {/* Project Rows */}
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
                          "min-h-[72px] border-b px-3 py-2 cursor-pointer transition-colors hover:bg-muted/30 flex flex-col justify-center",
                          selectedProjectId === p.id && "bg-primary/5 border-l-2 border-l-primary"
                        )}
                        onClick={() => setSelectedProjectId(selectedProjectId === p.id ? null : p.id)}
                      >
                        <p className="text-sm font-medium truncate leading-tight">{p.job_name}</p>
                        {p.site_manager && (
                          <p className="text-xs text-muted-foreground truncate">{p.site_manager}</p>
                        )}
                        {(p.client_name || p.address) && (
                          <p className="text-xs text-muted-foreground/70 truncate">
                            {[p.client_name, p.address].filter(Boolean).join(' · ')}
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
                    <div className="flex sticky top-0 z-10 bg-muted/40 border-b">
                      {months.map(mk => (
                        <div key={mk} className="w-[180px] shrink-0 h-12 border-r flex flex-col items-center justify-center">
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
                      ))}
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
                            "flex min-h-[72px] border-b transition-colors",
                            selectedProjectId === p.id && "bg-primary/5"
                          )}
                        >
                          {months.map(mk => {
                            const cellClaims = claimMap.get(`${p.id}__${mk}`) || [];
                            return (
                              <div
                                key={mk}
                                className="w-[180px] shrink-0 border-r p-1.5 flex flex-col gap-1"
                              >
                                {cellClaims.map(claim => (
                                  <button
                                    key={claim.id}
                                    onClick={() => openEditClaim(claim)}
                                    className={cn(
                                      "w-full rounded px-2 py-1 text-left text-xs transition-all hover:shadow-md cursor-pointer border",
                                      claim.direction === 'Up'
                                        ? "bg-emerald-50 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:border-emerald-800"
                                        : "bg-red-50 border-red-200 hover:bg-red-100 dark:bg-red-950/30 dark:border-red-800"
                                    )}
                                  >
                                    <div className="flex items-center justify-between gap-1">
                                      <span className="font-semibold truncate">{claim.claim_type}</span>
                                      {claim.direction === 'Up'
                                        ? <ArrowUp className="h-3 w-3 text-emerald-600 shrink-0" />
                                        : <ArrowDown className="h-3 w-3 text-red-600 shrink-0" />
                                      }
                                    </div>
                                    <div className={cn(
                                      "font-bold tabular-nums",
                                      claim.direction === 'Up' ? "text-emerald-700 dark:text-emerald-400" : "text-red-700 dark:text-red-400"
                                    )}>
                                      {formatCurrency(claim.amount)}
                                    </div>
                                    {claim.reference && (
                                      <span className="text-muted-foreground text-[10px] truncate block">{claim.reference}</span>
                                    )}
                                    {(claim.claim_type === 'Variation' || claim.claim_type === 'PC') && (
                                      <Badge variant="outline" className="text-[9px] px-1 py-0 mt-0.5">
                                        {claim.claim_type === 'Variation' ? 'VAR' : 'PC'}
                                      </Badge>
                                    )}
                                  </button>
                                ))}
                              </div>
                            );
                          })}
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

      {/* Claim Dialog (Add / Edit) */}
      <Dialog open={claimDialogOpen} onOpenChange={v => { if (!v) { setClaimDialogOpen(false); resetClaimForm(); } else setClaimDialogOpen(true); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingClaim ? 'Edit Claim' : 'Add Claim'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Project */}
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

            {/* Supervisor (display only) */}
            {selectedProject?.site_manager && (
              <div className="space-y-1">
                <Label className="text-muted-foreground text-xs">Site Supervisor</Label>
                <p className="text-sm font-medium">{selectedProject.site_manager}</p>
              </div>
            )}

            {/* Claim Date */}
            <div className="space-y-2">
              <Label>Claim Date *</Label>
              <Input type="date" value={claimForm.claim_date} onChange={e => setClaimForm(f => ({ ...f, claim_date: e.target.value }))} />
            </div>

            {/* Claim Type + Direction */}
            <div className="grid grid-cols-2 gap-3">
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
                <Label>Direction *</Label>
                <Select value={claimForm.direction} onValueChange={v => setClaimForm(f => ({ ...f, direction: v as 'Up' | 'Down' }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Up">
                      <span className="flex items-center gap-2"><ArrowUp className="h-3 w-3 text-emerald-600" /> Up</span>
                    </SelectItem>
                    <SelectItem value="Down">
                      <span className="flex items-center gap-2"><ArrowDown className="h-3 w-3 text-red-600" /> Down</span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Amount */}
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

            {/* Reference */}
            <div className="space-y-2">
              <Label>Reference</Label>
              <Input placeholder="e.g. 15.16 VAR" value={claimForm.reference} onChange={e => setClaimForm(f => ({ ...f, reference: e.target.value }))} />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea rows={2} value={claimForm.notes} onChange={e => setClaimForm(f => ({ ...f, notes: e.target.value }))} />
            </div>

            {/* Actions */}
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
    </DashboardLayout>
  );
}
