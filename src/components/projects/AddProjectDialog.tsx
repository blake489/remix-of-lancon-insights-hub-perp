import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { ProjectCategory, ProjectInsert } from '@/hooks/useProjects';
import { useSiteManagers } from '@/hooks/useSiteManagers';

const stages = ['Deposit', 'Retaining', 'Base', 'Slab/Base', 'Frame', 'Enclosed', 'Fixing', 'PC', 'Handover'];
const categories: { value: ProjectCategory; label: string }[] = [
  { value: 'pre_construction', label: 'Pre Construction' },
  { value: 'construction', label: 'Construction' },
  { value: 'handover', label: 'Handover' },
];

interface AddProjectDialogProps {
  onSubmit: (project: ProjectInsert) => void;
  isSubmitting?: boolean;
}

export function AddProjectDialog({ onSubmit, isSubmitting }: AddProjectDialogProps) {
  const { siteManagers } = useSiteManagers();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    job_name: '',
    client_name: '',
    address: '',
    site_manager: '',
    category: 'pre_construction' as ProjectCategory,
    current_stage: '',
    contract_value_ex_gst: '',
    contract_value_inc_gst: '',
    start_date: '',
    pc_date: '',
    forecast_cost: '',
    forecast_gross_profit: '',
    forecast_gp_percent: '',
  });

  const reset = () => setForm({
    job_name: '', client_name: '', address: '', site_manager: '',
    category: 'pre_construction', current_stage: '',
    contract_value_ex_gst: '', contract_value_inc_gst: '',
    start_date: '', pc_date: '',
    forecast_cost: '', forecast_gross_profit: '', forecast_gp_percent: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      job_name: form.job_name,
      client_name: form.client_name || null,
      address: form.address || null,
      site_manager: form.site_manager || null,
      category: form.category,
      current_stage: form.current_stage || null,
      contract_value_ex_gst: parseFloat(form.contract_value_ex_gst) || 0,
      contract_value_inc_gst: parseFloat(form.contract_value_inc_gst) || 0,
      start_date: form.start_date || null,
      pc_date: form.pc_date || null,
      status: 'Active',
      forecast_cost: parseFloat(form.forecast_cost) || 0,
      forecast_gross_profit: parseFloat(form.forecast_gross_profit) || 0,
      forecast_gp_percent: parseFloat(form.forecast_gp_percent) || 0,
      created_by: null,
    });
    reset();
    setOpen(false);
  };

  const updateField = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  // Auto-calc inc GST when ex GST changes
  const handleExGstChange = (val: string) => {
    updateField('contract_value_ex_gst', val);
    const num = parseFloat(val);
    if (!isNaN(num)) updateField('contract_value_inc_gst', (num * 1.1).toFixed(2));
  };

  // Auto-calc GP% when cost or profit changes
  const handleForecastChange = (field: 'forecast_cost' | 'forecast_gross_profit', val: string) => {
    updateField(field, val);
    const cost = parseFloat(field === 'forecast_cost' ? val : form.forecast_cost) || 0;
    const profit = parseFloat(field === 'forecast_gross_profit' ? val : form.forecast_gross_profit) || 0;
    const total = cost + profit;
    if (total > 0) updateField('forecast_gp_percent', ((profit / total) * 100).toFixed(2));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Project
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Project</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 pt-2">
          {/* Core Details */}
          <fieldset className="space-y-4">
            <legend className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Project Details</legend>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="job_name">Job Name *</Label>
                <Input id="job_name" required value={form.job_name} onChange={e => updateField('job_name', e.target.value)} placeholder="e.g. 28 Durimbil St" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client_name">Client Name</Label>
                <Input id="client_name" value={form.client_name} onChange={e => updateField('client_name', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" value={form.address} onChange={e => updateField('address', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Site Manager</Label>
                <Select value={form.site_manager} onValueChange={v => updateField('site_manager', v)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {siteManagers.map(sm => <SelectItem key={sm} value={sm}>{sm}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select value={form.category} onValueChange={v => updateField('category', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {categories.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Current Stage</Label>
                <Select value={form.current_stage} onValueChange={v => updateField('current_stage', v)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {stages.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </fieldset>

          {/* Dates & Value */}
          <fieldset className="space-y-4">
            <legend className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Contract & Dates</legend>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contract_ex">Contract Value (ex GST)</Label>
                <Input id="contract_ex" type="number" step="0.01" value={form.contract_value_ex_gst} onChange={e => handleExGstChange(e.target.value)} placeholder="0.00" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contract_inc">Contract Value (inc GST)</Label>
                <Input id="contract_inc" type="number" step="0.01" value={form.contract_value_inc_gst} onChange={e => updateField('contract_value_inc_gst', e.target.value)} placeholder="Auto-calculated" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date</Label>
                <Input id="start_date" type="date" value={form.start_date} onChange={e => updateField('start_date', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pc_date">PC Date</Label>
                <Input id="pc_date" type="date" value={form.pc_date} onChange={e => updateField('pc_date', e.target.value)} />
              </div>
            </div>
          </fieldset>

          {/* Financials */}
          <fieldset className="space-y-4">
            <legend className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Forecast Financials</legend>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="forecast_cost">Forecast Cost</Label>
                <Input id="forecast_cost" type="number" step="0.01" value={form.forecast_cost} onChange={e => handleForecastChange('forecast_cost', e.target.value)} placeholder="0.00" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="forecast_profit">Forecast Gross Profit</Label>
                <Input id="forecast_profit" type="number" step="0.01" value={form.forecast_gross_profit} onChange={e => handleForecastChange('forecast_gross_profit', e.target.value)} placeholder="0.00" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="forecast_gp">Forecast GP%</Label>
                <Input id="forecast_gp" type="number" step="0.01" value={form.forecast_gp_percent} onChange={e => updateField('forecast_gp_percent', e.target.value)} placeholder="Auto-calculated" />
              </div>
            </div>
          </fieldset>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Add Project'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
