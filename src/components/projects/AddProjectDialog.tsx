import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { ProjectCategory, ProjectInsert } from '@/hooks/useProjects';
import { useSiteManagers } from '@/hooks/useSiteManagers';
import { ClaimsScheduleTable, ClaimScheduleType } from './ClaimsScheduleTable';
import { VariationsSection, Variation } from './VariationsSection';
import { PdfUploadField } from './PdfUploadField';
import { deriveCategory } from '@/lib/deriveCategory';

// Category is now auto-derived — no manual selection needed

interface AddProjectDialogProps {
  onSubmit: (project: ProjectInsert) => void;
  isSubmitting?: boolean;
  defaultOpen?: boolean;
  prefillClientName?: string;
  prefillContractValue?: string;
}

export const AddProjectDialog = React.forwardRef<HTMLDivElement, AddProjectDialogProps>(function AddProjectDialog({ onSubmit, isSubmitting, defaultOpen = false, prefillClientName, prefillContractValue }, _ref) {
  const { siteManagers } = useSiteManagers();
  const [open, setOpen] = useState(defaultOpen);
  const [customTimeframes, setCustomTimeframes] = useState<Record<string, number>>({});
  const [variations, setVariations] = useState<Variation[]>([]);
  const [form, setForm] = useState({
    job_name: prefillClientName || '',
    client_name: prefillClientName || '',
    client_mobile: '',
    client_email: '',
    address: '',
    site_manager: '',
    category: 'pre_construction' as ProjectCategory, // auto-derived on save
    schedule_type: 'standard' as ClaimScheduleType,
    contract_value_ex_gst: prefillContractValue || '',
    contract_value_inc_gst: '',
    start_date: '',
    site_start_date: '',
    pc_date: '',
    forecast_cost: '',
    forecast_gross_profit: '',
    forecast_gp_percent: '',
  });
  const [plansPdf, setPlansPdf] = useState<string | null>(null);
  const [specsPdf, setSpecsPdf] = useState<string | null>(null);

  const reset = () => {
    setForm({
      job_name: '', client_name: '', client_mobile: '', client_email: '',
      address: '', site_manager: '',
      category: 'pre_construction', schedule_type: 'standard',
      contract_value_ex_gst: '', contract_value_inc_gst: '',
      start_date: '', site_start_date: '', pc_date: '',
      forecast_cost: '', forecast_gross_profit: '', forecast_gp_percent: '',
    });
    setCustomTimeframes({});
    setVariations([]);
    setPlansPdf(null);
    setSpecsPdf(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!plansPdf || !specsPdf) return;
    onSubmit({
      job_name: form.job_name,
      client_name: form.client_name || null,
      client_mobile: form.client_mobile || null,
      client_email: form.client_email || null,
      address: form.address || null,
      site_manager: form.site_manager || null,
      category: deriveCategory({ siteStartDate: form.site_start_date }),
      current_stage: null,
      contract_value_ex_gst: parseFloat(form.contract_value_ex_gst) || 0,
      contract_value_inc_gst: parseFloat(form.contract_value_inc_gst) || 0,
      start_date: form.start_date || null,
      site_start_date: form.site_start_date || null,
      pc_date: form.pc_date || null,
      status: 'Active',
      forecast_cost: parseFloat(form.forecast_cost) || 0,
      forecast_gross_profit: parseFloat(form.forecast_gross_profit) || 0,
      forecast_gp_percent: parseFloat(form.forecast_gp_percent) || 0,
      schedule_type: form.schedule_type,
      custom_timeframes: customTimeframes,
      variations: variations,
      created_by: null,
      plans_pdf_path: plansPdf,
      specs_pdf_path: specsPdf,
    } as any);
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

  // Auto-calc Gross Profit = Contract ex GST - Forecast Cost; GP% = Profit / Contract * 100
  const handleForecastCostChange = (val: string) => {
    updateField('forecast_cost', val);
    const contract = parseFloat(form.contract_value_ex_gst) || 0;
    const cost = parseFloat(val) || 0;
    const profit = contract - cost;
    updateField('forecast_gross_profit', profit.toFixed(2));
    if (contract > 0) updateField('forecast_gp_percent', ((profit / contract) * 100).toFixed(2));
  };

  // Also recalc when contract value changes
  const handleExGstChangeWithForecast = (val: string) => {
    handleExGstChange(val);
    const contract = parseFloat(val) || 0;
    const cost = parseFloat(form.forecast_cost) || 0;
    const profit = contract - cost;
    updateField('forecast_gross_profit', profit.toFixed(2));
    if (contract > 0) updateField('forecast_gp_percent', ((profit / contract) * 100).toFixed(2));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add a New Contract
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
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
                <Label htmlFor="client_mobile">Client Mobile</Label>
                <Input id="client_mobile" type="tel" value={form.client_mobile} onChange={e => updateField('client_mobile', e.target.value)} placeholder="e.g. 0412 345 678" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client_email">Client Email</Label>
                <Input id="client_email" type="email" value={form.client_email} onChange={e => updateField('client_email', e.target.value)} placeholder="e.g. client@email.com" />
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
            </div>
          </fieldset>

          {/* Document Uploads */}
          <fieldset className="space-y-4">
            <legend className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Approved Documents</legend>
            <div className="grid grid-cols-2 gap-4">
              <PdfUploadField label="Approved Plans" required value={plansPdf} onChange={setPlansPdf} />
              <PdfUploadField label="Approved Specs" required value={specsPdf} onChange={setSpecsPdf} />
            </div>
          </fieldset>

          {/* Contract Value — highlighted as key tracking area */}
          <fieldset className="space-y-4 border-2 border-blue-400/30 bg-blue-500/[0.03] rounded-lg px-4 py-4 ring-1 ring-blue-400/10 transition-all duration-300">
            <legend className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider px-1.5">💰 Contract Value</legend>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contract_ex">Contract Value (ex GST)</Label>
                <Input id="contract_ex" type="number" step="0.01" value={form.contract_value_ex_gst} onChange={e => handleExGstChangeWithForecast(e.target.value)} placeholder="0.00" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contract_inc">Contract Value (inc GST) <span className="text-muted-foreground">(auto)</span></Label>
                <Input id="contract_inc" type="number" step="0.01" value={form.contract_value_inc_gst} readOnly className="bg-muted/50 tabular-nums" placeholder="Auto-calculated" />
              </div>
            </div>
          </fieldset>

          {/* Variations — separate from schedule of payments */}
          <fieldset className="space-y-4 border-2 border-blue-400/30 bg-blue-500/[0.03] rounded-lg px-4 py-4 ring-1 ring-blue-400/10 transition-all duration-300">
            <legend className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider px-1.5">📋 Variations</legend>
            <VariationsSection variations={variations} onChange={setVariations} />
          </fieldset>

          <ClaimsScheduleTable
            scheduleType={form.schedule_type}
            onScheduleTypeChange={v => updateField('schedule_type', v)}
            contractValueExGst={parseFloat(form.contract_value_ex_gst) || 0}
            contractSignDate={form.start_date}
            onContractSignDateChange={v => updateField('start_date', v)}
            siteStartDate={form.site_start_date}
            onSiteStartDateChange={v => updateField('site_start_date', v)}
            customTimeframes={customTimeframes}
            onTimeframeChange={(stage, value) => setCustomTimeframes(prev => ({ ...prev, [stage]: value }))}
          />

          {/* Financials — highlighted as primary tracking area */}
          <fieldset className="space-y-4 border-2 border-primary/30 bg-primary/[0.03] rounded-lg px-4 py-4 ring-1 ring-primary/10">
            <legend className="text-sm font-bold text-primary uppercase tracking-wide px-1.5">⚡ Forecast Financials</legend>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="forecast_cost">Forecast Cost</Label>
                <Input id="forecast_cost" type="number" step="0.01" value={form.forecast_cost} onChange={e => handleForecastCostChange(e.target.value)} placeholder="0.00" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="forecast_profit">Forecast Gross Profit</Label>
                <Input id="forecast_profit" type="number" step="0.01" value={form.forecast_gross_profit} readOnly className="bg-muted" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="forecast_gp">Forecast GP%</Label>
                <Input id="forecast_gp" type="number" step="0.01" value={form.forecast_gp_percent} readOnly className="bg-muted" />
              </div>
            </div>
          </fieldset>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Add Contract'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
});
