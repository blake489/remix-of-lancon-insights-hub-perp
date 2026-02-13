import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { useSourceForm, useCreateForm, useUpdateForm, useTeamMembers, SourceFormField } from '@/hooks/useSourceForms';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Plus, Trash2, GripVertical, ArrowUp, ArrowDown } from 'lucide-react';
import { Link } from 'react-router-dom';

const FIELD_TYPES = [
  { value: 'text', label: 'Text' },
  { value: 'textarea', label: 'Textarea' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
  { value: 'select', label: 'Select (Dropdown)' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'radio', label: 'Radio' },
];

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function FormBuilder() {
  const { formId } = useParams<{ formId: string }>();
  const isEdit = !!formId && formId !== 'new';
  const navigate = useNavigate();

  const { data: existingForm, isLoading: loadingForm } = useSourceForm(isEdit ? formId : undefined);
  const { data: teamMembers } = useTeamMembers();
  const createForm = useCreateForm();
  const updateForm = useUpdateForm();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [slug, setSlug] = useState('');
  const [staffId, setStaffId] = useState<string>('');
  const [fields, setFields] = useState<SourceFormField[]>([]);
  const [autoSlug, setAutoSlug] = useState(true);

  useEffect(() => {
    if (existingForm && isEdit) {
      setName(existingForm.name);
      setDescription(existingForm.description || '');
      setSlug(existingForm.slug);
      setStaffId(existingForm.assigned_staff_member_id || '');
      setFields(existingForm.fields || []);
      setAutoSlug(false);
    }
  }, [existingForm, isEdit]);

  useEffect(() => {
    if (autoSlug && !isEdit) {
      setSlug(slugify(name));
    }
  }, [name, autoSlug, isEdit]);

  const addField = () => {
    setFields(prev => [...prev, {
      label: '',
      field_key: '',
      field_type: 'text',
      required: false,
      options: null,
      sort_order: prev.length,
    }]);
  };

  const updateField = (index: number, updates: Partial<SourceFormField>) => {
    setFields(prev => prev.map((f, i) => i === index ? { ...f, ...updates } : f));
  };

  const removeField = (index: number) => {
    setFields(prev => prev.filter((_, i) => i !== index));
  };

  const moveField = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= fields.length) return;
    const updated = [...fields];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setFields(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name,
      description,
      slug: slug || slugify(name),
      assigned_staff_member_id: staffId || null,
      fields: fields.map((f, i) => ({
        ...f,
        field_key: f.field_key || slugify(f.label),
        sort_order: i,
      })),
    };

    if (isEdit) {
      await updateForm.mutateAsync({ id: formId!, ...payload });
    } else {
      await createForm.mutateAsync(payload);
    }
    navigate('/source-data/manage');
  };

  const isSaving = createForm.isPending || updateForm.isPending;

  if (isEdit && loadingForm) {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-3xl px-6 py-12">
          <p className="text-muted-foreground">Loading form…</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-full bg-background">
        <div className="border-b border-border/40 bg-background">
          <div className="mx-auto max-w-3xl px-6 py-5">
            <div className="flex items-center gap-3">
              <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                <Link to="/source-data/manage"><ArrowLeft className="h-4 w-4" /></Link>
              </Button>
              <h1 className="text-xl font-semibold text-foreground">
                {isEdit ? 'Edit Form' : 'Create New Form'}
              </h1>
            </div>
          </div>
        </div>

        <main className="mx-auto max-w-3xl px-6 py-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Form Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Form Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Form Name *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Weekly Site Report"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="What is this form used for?"
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">URL Slug</Label>
                  <Input
                    id="slug"
                    value={slug}
                    onChange={e => { setSlug(e.target.value); setAutoSlug(false); }}
                    placeholder="auto-generated-from-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Assigned Staff Member</Label>
                  <Select value={staffId} onValueChange={setStaffId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select staff member (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {teamMembers?.map(m => (
                        <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Fields */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Form Fields</CardTitle>
                  <Button type="button" variant="outline" size="sm" onClick={addField}>
                    <Plus className="mr-1 h-4 w-4" /> Add Field
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {fields.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    No fields yet. Click "Add Field" to start building your form.
                  </p>
                )}
                {fields.map((field, index) => (
                  <div key={index} className="rounded-lg border p-4 space-y-3 bg-muted/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-muted-foreground">Field {index + 1}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => moveField(index, -1)} disabled={index === 0}>
                          <ArrowUp className="h-3 w-3" />
                        </Button>
                        <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => moveField(index, 1)} disabled={index === fields.length - 1}>
                          <ArrowDown className="h-3 w-3" />
                        </Button>
                        <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeField(index)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Label *</Label>
                        <Input
                          value={field.label}
                          onChange={e => updateField(index, {
                            label: e.target.value,
                            field_key: field.id ? field.field_key : slugify(e.target.value),
                          })}
                          placeholder="Field label"
                          required
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Type</Label>
                        <Select value={field.field_type} onValueChange={v => updateField(index, { field_type: v })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {FIELD_TYPES.map(t => (
                              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {(field.field_type === 'select' || field.field_type === 'radio') && (
                      <div className="space-y-1.5">
                        <Label className="text-xs">Options (comma-separated)</Label>
                        <Input
                          value={field.options?.join(', ') || ''}
                          onChange={e => updateField(index, {
                            options: e.target.value.split(',').map(s => s.trim()).filter(Boolean),
                          })}
                          placeholder="Option 1, Option 2, Option 3"
                        />
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <Switch
                        checked={field.required}
                        onCheckedChange={v => updateField(index, { required: v })}
                      />
                      <Label className="text-xs">Required</Label>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => navigate('/source-data/manage')}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving || !name.trim()}>
                {isSaving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Form'}
              </Button>
            </div>
          </form>
        </main>
      </div>
    </DashboardLayout>
  );
}
