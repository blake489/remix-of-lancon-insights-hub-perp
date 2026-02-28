import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { useSalesLeads, SalesLead } from '@/hooks/useSalesLeads';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Plus, Search, Trash2, Pencil, TrendingUp, DollarSign, Target, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

const STATUS_OPTIONS = [
  { value: 'new', label: 'New', color: 'bg-sky-100 text-sky-700 border-sky-200' },
  { value: 'contacted', label: 'Contacted', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { value: 'proposal', label: 'Proposal', color: 'bg-violet-100 text-violet-700 border-violet-200' },
  { value: 'negotiation', label: 'Negotiation', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  { value: 'won', label: 'Won', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  { value: 'lost', label: 'Lost', color: 'bg-red-100 text-red-700 border-red-200' },
];

function getStatusStyle(status: string) {
  return STATUS_OPTIONS.find(s => s.value === status) || STATUS_OPTIONS[0];
}

function formatCurrency(val: number) {
  return val === 0 ? '$0' : `$${val.toLocaleString('en-AU', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export default function Sales() {
  const { leads, isLoading, addLead, updateLead, deleteLead } = useSalesLeads();
  const [search, setSearch] = useState('');
  const [filterRevType, setFilterRevType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<SalesLead | null>(null);
  const [form, setForm] = useState({
    client_name: '',
    estimated_value: '',
    revenue_type: 'prospective' as 'prospective' | 'firm',
    status: 'new',
    notes: '',
  });

  const filtered = useMemo(() => {
    return leads.filter(l => {
      const matchSearch = !search || l.client_name.toLowerCase().includes(search.toLowerCase());
      const matchRev = filterRevType === 'all' || l.revenue_type === filterRevType;
      const matchStatus = filterStatus === 'all' || l.status === filterStatus;
      return matchSearch && matchRev && matchStatus;
    });
  }, [leads, search, filterRevType, filterStatus]);

  const metrics = useMemo(() => {
    const active = leads.filter(l => l.status !== 'lost');
    const prospective = active.filter(l => l.revenue_type === 'prospective');
    const firm = active.filter(l => l.revenue_type === 'firm');
    const won = leads.filter(l => l.status === 'won');
    return {
      totalLeads: active.length,
      prospectiveValue: prospective.reduce((s, l) => s + l.estimated_value, 0),
      firmValue: firm.reduce((s, l) => s + l.estimated_value, 0),
      wonValue: won.reduce((s, l) => s + l.estimated_value, 0),
      wonCount: won.length,
    };
  }, [leads]);

  const resetForm = () => {
    setForm({ client_name: '', estimated_value: '', revenue_type: 'prospective', status: 'new', notes: '' });
    setEditing(null);
  };

  const openAdd = () => { resetForm(); setDialogOpen(true); };
  const openEdit = (lead: SalesLead) => {
    setEditing(lead);
    setForm({
      client_name: lead.client_name,
      estimated_value: lead.estimated_value.toString(),
      revenue_type: lead.revenue_type,
      status: lead.status,
      notes: lead.notes || '',
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.client_name) return;
    const payload = {
      client_name: form.client_name,
      estimated_value: parseFloat(form.estimated_value) || 0,
      revenue_type: form.revenue_type,
      status: form.status,
      notes: form.notes || null,
    };
    if (editing) {
      await updateLead.mutateAsync({ id: editing.id, ...payload });
    } else {
      await addLead.mutateAsync(payload);
    }
    setDialogOpen(false);
    resetForm();
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-2rem)] p-4 gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Sales</h1>
            <p className="text-sm text-muted-foreground">Leads & opportunities tracker</p>
          </div>
          <Button onClick={openAdd} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Lead
          </Button>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="border-border/60">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Active Leads</span>
              </div>
              <p className="text-2xl font-bold tabular-nums">{metrics.totalLeads}</p>
            </CardContent>
          </Card>
          <Card className="border-border/60">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-amber-500" />
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Prospective</span>
              </div>
              <p className="text-2xl font-bold tabular-nums text-amber-600">{formatCurrency(metrics.prospectiveValue)}</p>
            </CardContent>
          </Card>
          <Card className="border-border/60">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="h-4 w-4 text-emerald-500" />
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Firm Revenue</span>
              </div>
              <p className="text-2xl font-bold tabular-nums text-emerald-600">{formatCurrency(metrics.firmValue)}</p>
            </CardContent>
          </Card>
          <Card className="border-border/60">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Target className="h-4 w-4 text-primary" />
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Won ({metrics.wonCount})</span>
              </div>
              <p className="text-2xl font-bold tabular-nums text-primary">{formatCurrency(metrics.wonValue)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-end gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search clients..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 w-48 h-9 text-sm" />
          </div>
          <Select value={filterRevType} onValueChange={setFilterRevType}>
            <SelectTrigger className="w-40 h-9 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Revenue Types</SelectItem>
              <SelectItem value="prospective">Prospective</SelectItem>
              <SelectItem value="firm">Firm</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-36 h-9 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {STATUS_OPTIONS.map(s => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="flex-1 border rounded-lg overflow-hidden bg-card">
          {isLoading ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground">
              <p className="text-sm">No leads found</p>
              <Button variant="outline" size="sm" onClick={openAdd}>Add your first lead</Button>
            </div>
          ) : (
            <div className="overflow-auto h-full">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="font-semibold text-xs">Client Name</TableHead>
                    <TableHead className="text-right font-semibold text-xs">Est. Value</TableHead>
                    <TableHead className="font-semibold text-xs">Revenue Type</TableHead>
                    <TableHead className="font-semibold text-xs">Status</TableHead>
                    <TableHead className="font-semibold text-xs">Notes</TableHead>
                    <TableHead className="w-20 text-right font-semibold text-xs">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(lead => {
                    const st = getStatusStyle(lead.status);
                    return (
                      <TableRow key={lead.id} className="cursor-pointer hover:bg-muted/30" onClick={() => openEdit(lead)}>
                        <TableCell className="font-medium">{lead.client_name}</TableCell>
                        <TableCell className="text-right tabular-nums font-semibold">{formatCurrency(lead.estimated_value)}</TableCell>
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
                        <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{lead.notes || '—'}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={e => { e.stopPropagation(); openEdit(lead); }}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={e => e.stopPropagation()}>
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete lead?</AlertDialogTitle>
                                  <AlertDialogDescription>This will permanently remove "{lead.client_name}" from your sales pipeline.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => deleteLead.mutate(lead.id)}>Delete</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={o => { if (!o) { setDialogOpen(false); resetForm(); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Lead' : 'Add Lead'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-sm">Client Name *</Label>
              <Input value={form.client_name} onChange={e => setForm(f => ({ ...f, client_name: e.target.value }))} placeholder="e.g. Smith Family" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Estimated Contract Value</Label>
              <Input type="number" value={form.estimated_value} onChange={e => setForm(f => ({ ...f, estimated_value: e.target.value }))} placeholder="0" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Revenue Type *</Label>
              <Select value={form.revenue_type} onValueChange={v => setForm(f => ({ ...f, revenue_type: v as 'prospective' | 'firm' }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="prospective">Prospective Revenue</SelectItem>
                  <SelectItem value="firm">Firm Revenue</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Status</Label>
              <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map(s => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Notes</Label>
              <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Any additional details..." rows={3} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }}>Cancel</Button>
              <Button onClick={handleSave} disabled={!form.client_name}>{editing ? 'Save' : 'Add Lead'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
