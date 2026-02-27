import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProjectRow, ProjectCategory, ProjectUpdate } from '@/hooks/useProjects';
import { useSiteManagers } from '@/hooks/useSiteManagers';
import { ClaimsScheduleTable, ClaimScheduleType } from './ClaimsScheduleTable';

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
  const [form, setForm] = useState<Record<string, string>>({});

  // Reset form when project changes
  const currentProject = project;
  const getVal = (field: string, fallback: string = '') => {
    if (field in form) return form[field];
    if (!currentProject) return fallback;
    const val = (currentProject as any)[field];
    return val != null ? String(val) : fallback;
  };

  const updateField = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const handleExGstChange = (val: string) => {
    updateField('contract_value_ex_gst', val);
    const num = parseFloat(val);
    if (!isNaN(num)) updateField('contract_value_inc_gst', (num * 1.1).toFixed(2));
  };

  const handleForecastChange = (field: 'forecast_cost' | 'forecast_gross_profit', val: string) => {
    updateField(field, val);
    const cost = parseFloat(field === 'forecast_cost' ? val : getVal('forecast_cost', '0')) || 0;
    const profit = parseFloat(field === 'forecast_gross_profit' ? val : getVal('forecast_gross_profit', '0')) || 0;
    const total = cost + profit;
    if (total > 0) updateField('forecast_gp_percent', ((profit / total) * 100).toFixed(2));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProject) return;

    const updates: any = { id: currentProject.id };
    
    const fields = [
      'job_name', 'client_name', 'client_mobile', 'client_email', 'address', 'site_manager', 'category',
      'status', 'start_date', 'pc_date',
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

    onSubmit(updates);
    setForm({});
    onOpenChange(false);
  };

  if (!currentProject) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) setForm({}); onOpenChange(v); }}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
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

          <ClaimsScheduleTable
            scheduleType={(getVal('schedule_type', 'standard') as ClaimScheduleType)}
            onScheduleTypeChange={v => updateField('schedule_type', v)}
            contractValueExGst={parseFloat(getVal('contract_value_ex_gst', '0')) || 0}
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
            <legend className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Status</legend>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={getVal('status', 'Active')} onValueChange={v => updateField('status', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Complete">Complete</SelectItem>
                    <SelectItem value="On Hold">On Hold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Contract & Dates</legend>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Contract Value (ex GST)</Label>
                <Input type="number" step="0.01" value={getVal('contract_value_ex_gst')} onChange={e => handleExGstChange(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Contract Value (inc GST)</Label>
                <Input type="number" step="0.01" value={getVal('contract_value_inc_gst')} onChange={e => updateField('contract_value_inc_gst', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input type="date" value={getVal('start_date')} onChange={e => updateField('start_date', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>PC Date</Label>
                <Input type="date" value={getVal('pc_date')} onChange={e => updateField('pc_date', e.target.value)} />
              </div>
            </div>
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Forecast Financials</legend>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Forecast Cost</Label>
                <Input type="number" step="0.01" value={getVal('forecast_cost')} onChange={e => handleForecastChange('forecast_cost', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Forecast Gross Profit</Label>
                <Input type="number" step="0.01" value={getVal('forecast_gross_profit')} onChange={e => handleForecastChange('forecast_gross_profit', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Forecast GP%</Label>
                <Input type="number" step="0.01" value={getVal('forecast_gp_percent')} onChange={e => updateField('forecast_gp_percent', e.target.value)} />
              </div>
            </div>
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
