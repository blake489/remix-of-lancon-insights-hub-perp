import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProjectRow, ProjectCategory, ProjectUpdate } from '@/hooks/useProjects';
import { useSiteManagers } from '@/hooks/useSiteManagers';
import { ClaimsScheduleTable, ClaimScheduleType } from './ClaimsScheduleTable';
import { ForecastAuditTrail } from './ForecastAuditTrail';
import { VariationsSection, Variation } from './VariationsSection';
import { PdfUploadField } from './PdfUploadField';
import { supabase } from '@/integrations/supabase/client';

const categories: { value: ProjectCategory; label: string }[] = [
  { value: 'pre_construction', label: 'Pre Construction' },
  { value: 'construction', label: 'Construction' },
  { value: 'handover', label: 'Handover' },
];

interface EditProjectDialogProps {
  project: ProjectRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ProjectUpdate) => void;
  isSubmitting?: boolean;
}

export function EditProjectDialog({ project, open, onOpenChange, onSubmit, isSubmitting }: EditProjectDialogProps) {
  const { siteManagers } = useSiteManagers();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<Record<string, string>>({});
  const [forecastReason, setForecastReason] = useState('');
  const [variations, setVariations] = useState<Variation[]>([]);

  // Initialize variations from project when it changes
  const currentProject = project;
  const currentVariations = (() => {
    if (variations.length > 0 || Object.keys(form).length > 0) return variations;
    if (!currentProject) return [];
    try {
      const raw = (currentProject as any).variations;
      return Array.isArray(raw) ? raw as Variation[] : [];
    } catch { return []; }
  })();

  const getVal = (field: string, fallback: string = '') => {
    if (field in form) return form[field];
    if (!currentProject) return fallback;
    const val = (currentProject as any)[field];
    return val != null ? String(val) : fallback;
  };

  const updateField = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const variationsTotal = currentVariations.reduce((s, v) => s + (v.amount || 0), 0);
  const effectiveContract = (parseFloat(getVal('contract_value_ex_gst', '0')) || 0) + variationsTotal;

  const recalcForecasts = (contract: number) => {
    updateField('contract_value_inc_gst', (contract * 1.1).toFixed(2));
    const cost = parseFloat(getVal('forecast_cost', '0')) || 0;
    const profit = contract - cost;
    updateField('forecast_gross_profit', profit.toFixed(2));
    if (contract > 0) updateField('forecast_gp_percent', ((profit / contract) * 100).toFixed(2));
  };

  const handleExGstChange = (val: string) => {
    updateField('contract_value_ex_gst', val);
    const base = parseFloat(val) || 0;
    const total = base + variationsTotal;
    recalcForecasts(total);
  };

  const handleForecastCostChange = (val: string) => {
    updateField('forecast_cost', val);
    const contract = (parseFloat(getVal('contract_value_ex_gst', '0')) || 0) + variationsTotal;
    const cost = parseFloat(val) || 0;
    const profit = contract - cost;
    updateField('forecast_gross_profit', profit.toFixed(2));
    if (contract > 0) updateField('forecast_gp_percent', ((profit / contract) * 100).toFixed(2));
  };

  const handleVariationsChange = (newVars: Variation[]) => {
    setVariations(newVars);
    const newTotal = newVars.reduce((s, v) => s + (v.amount || 0), 0);
    const base = parseFloat(getVal('contract_value_ex_gst', '0')) || 0;
    const total = base + newTotal;
    recalcForecasts(total);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProject) return;

    const updates: any = { id: currentProject.id };
    
    const fields = [
      'job_name', 'client_name', 'client_mobile', 'client_email', 'address', 'site_manager', 'category',
      'status', 'start_date', 'site_start_date', 'pc_date', 'schedule_type',
    ];
    const numFields = [
      'contract_value_ex_gst', 'contract_value_inc_gst',
      'forecast_cost', 'forecast_gross_profit', 'forecast_gp_percent',
    ];

    fields.forEach(f => {
      const val = getVal(f);
      updates[f] = val || null;
    });
    numFields.forEach(f => {
      updates[f] = parseFloat(getVal(f, '0')) || 0;
    });

    // Parse and save custom_timeframes and variations as JSON
    try {
    updates.custom_timeframes = JSON.parse(getVal('custom_timeframes', '{}'));
    } catch {
      updates.custom_timeframes = {};
    }
    updates.variations = currentVariations;
    updates.plans_pdf_path = getVal('plans_pdf_path') || null;
    updates.specs_pdf_path = getVal('specs_pdf_path') || null;

    // Log forecast audit if cost or contract changed
    const newCost = parseFloat(getVal('forecast_cost', '0')) || 0;
    const newContract = parseFloat(getVal('contract_value_ex_gst', '0')) || 0;
    const oldCost = currentProject.forecast_cost;
    const oldContract = currentProject.contract_value_ex_gst;

    if (newCost !== oldCost || newContract !== oldContract) {
      if (!forecastReason.trim()) {
        // Show validation - require reason
        const el = document.getElementById('forecast-reason');
        if (el) { el.focus(); el.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
        return;
      }

      const oldProfit = currentProject.forecast_gross_profit;
      const oldGp = currentProject.forecast_gp_percent;
      const newProfit = newContract - newCost;
      const newGp = newContract > 0 ? (newProfit / newContract) * 100 : 0;

      supabase.from('project_forecast_audit').insert({
        project_id: currentProject.id,
        old_forecast_cost: oldCost,
        new_forecast_cost: newCost,
        old_contract_value: oldContract,
        new_contract_value: newContract,
        old_gross_profit: oldProfit,
        new_gross_profit: newProfit,
        old_gp_percent: oldGp,
        new_gp_percent: newGp,
        reason: forecastReason.trim(),
      }).then(() => {
        queryClient.invalidateQueries({ queryKey: ['forecast-audit', currentProject.id] });
      });
    }

    onSubmit(updates);
    setForm({});
    setVariations([]);
    setForecastReason('');
    onOpenChange(false);
  };

  if (!currentProject) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { setForm({}); setVariations([]); setForecastReason(''); } onOpenChange(v); }}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 pt-2">
          <fieldset className="space-y-4">
            <legend className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Project Details</legend>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2">
                <Label>Job Name *</Label>
                <Input required value={getVal('job_name')} onChange={e => updateField('job_name', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Client Name</Label>
                <Input value={getVal('client_name')} onChange={e => updateField('client_name', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Input value={getVal('address')} onChange={e => updateField('address', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Client Mobile</Label>
                <Input type="tel" value={getVal('client_mobile')} onChange={e => updateField('client_mobile', e.target.value)} placeholder="e.g. 0412 345 678" />
              </div>
              <div className="space-y-2">
                <Label>Client Email</Label>
                <Input type="email" value={getVal('client_email')} onChange={e => updateField('client_email', e.target.value)} placeholder="e.g. client@email.com" />
              </div>
              <div className="space-y-2">
                <Label>Site Manager</Label>
                <Select value={getVal('site_manager')} onValueChange={v => updateField('site_manager', v)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {siteManagers.map(sm => <SelectItem key={sm} value={sm}>{sm}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select value={getVal('category', 'construction')} onValueChange={v => updateField('category', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {categories.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </fieldset>

          {/* Document Uploads */}
          <fieldset className="space-y-4">
            <legend className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Approved Documents</legend>
            <div className="grid grid-cols-2 gap-4">
              <PdfUploadField
                label="Approved Plans"
                value={getVal('plans_pdf_path') || null}
                onChange={v => updateField('plans_pdf_path', v || '')}
                projectId={currentProject.id}
              />
              <PdfUploadField
                label="Approved Specs"
                value={getVal('specs_pdf_path') || null}
                onChange={v => updateField('specs_pdf_path', v || '')}
                projectId={currentProject.id}
              />
            </div>
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Contract Value</legend>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Contract Value (ex GST)</Label>
                <Input type="number" step="0.01" value={getVal('contract_value_ex_gst')} onChange={e => handleExGstChange(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Contract Value (inc GST)</Label>
                <Input type="number" step="0.01" value={getVal('contract_value_inc_gst')} onChange={e => updateField('contract_value_inc_gst', e.target.value)} />
              </div>
            </div>
          </fieldset>

          <VariationsSection variations={currentVariations} onChange={handleVariationsChange} />

          {variationsTotal !== 0 && (
            <div className="text-sm text-muted-foreground px-1">
              Effective contract (base + variations): <span className="font-semibold text-foreground">${effectiveContract.toLocaleString()}</span> ex GST
            </div>
          )}

          <ClaimsScheduleTable
            scheduleType={(getVal('schedule_type', 'standard') as ClaimScheduleType)}
            onScheduleTypeChange={v => updateField('schedule_type', v)}
            contractValueExGst={effectiveContract}
            contractSignDate={getVal('start_date')}
            onContractSignDateChange={v => updateField('start_date', v)}
            siteStartDate={getVal('site_start_date')}
            onSiteStartDateChange={v => updateField('site_start_date', v)}
            customTimeframes={(() => {
              try { return JSON.parse(getVal('custom_timeframes', '{}')); } catch { return {}; }
            })()}
            onTimeframeChange={(stage, value) => {
              let current: Record<string, number> = {};
              try { current = JSON.parse(getVal('custom_timeframes', '{}')); } catch {}
              current[stage] = value;
              updateField('custom_timeframes', JSON.stringify(current));
            }}
          />


          <fieldset className="space-y-4">
            <legend className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Forecast Financials</legend>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Forecast Cost</Label>
                <Input type="number" step="0.01" value={getVal('forecast_cost')} onChange={e => handleForecastCostChange(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Forecast Gross Profit</Label>
                <Input type="number" step="0.01" value={getVal('forecast_gross_profit')} readOnly className="bg-muted" />
              </div>
              <div className="space-y-2">
                <Label>Forecast GP%</Label>
                <Input type="number" step="0.01" value={getVal('forecast_gp_percent')} readOnly className="bg-muted" />
              </div>
            </div>
            {currentProject && (
              (parseFloat(getVal('forecast_cost', '0')) || 0) !== currentProject.forecast_cost ||
              (parseFloat(getVal('contract_value_ex_gst', '0')) || 0) !== currentProject.contract_value_ex_gst
            ) && (
              <div className="space-y-2 border rounded-md p-3 bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
                <Label htmlFor="forecast-reason" className="text-sm font-medium">
                  Reason for change <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="forecast-reason"
                  value={forecastReason}
                  onChange={e => setForecastReason(e.target.value)}
                  placeholder="e.g. Updated after subcontractor requote, material price increase..."
                  className="min-h-[60px] text-sm"
                  required
                />
              </div>
            )}
            <ForecastAuditTrail projectId={currentProject.id} />
          </fieldset>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => { setForm({}); onOpenChange(false); }}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
