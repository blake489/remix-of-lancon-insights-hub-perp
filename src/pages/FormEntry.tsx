import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { useSourceForm, useSubmitFormResponse, useFormResponses, useTeamMembers } from '@/hooks/useSourceForms';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

export default function FormEntry() {
  const { slug } = useParams<{ slug: string }>();
  const { data: form, isLoading } = useSourceForm(slug);
  const { data: teamMembers } = useTeamMembers();
  const submitResponse = useSubmitFormResponse();

  const [values, setValues] = useState<Record<string, string>>({});
  const [staffId, setStaffId] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [page, setPage] = useState(0);

  const { data: responsesData } = useFormResponses(form?.id, page);

  const setValue = (fieldId: string, value: string) => {
    setValues(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;

    // Validate required fields
    for (const field of form.fields || []) {
      if (field.required && !values[field.id!]?.trim()) {
        return;
      }
    }

    await submitResponse.mutateAsync({
      form_id: form.id,
      staff_id: staffId || null,
      values: Object.entries(values)
        .filter(([, v]) => v !== undefined && v !== '')
        .map(([fieldId, value]) => ({ field_id: fieldId, value })),
    });

    setValues({});
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-3xl px-6 py-12">
          <p className="text-muted-foreground">Loading form…</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!form) {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-3xl px-6 py-12">
          <p className="text-muted-foreground">Form not found.</p>
        </div>
      </DashboardLayout>
    );
  }

  const fields = form.fields || [];

  return (
    <DashboardLayout>
      <div className="min-h-full bg-background">
        <div className="border-b border-border/40 bg-background">
          <div className="mx-auto max-w-3xl px-6 py-5">
            <div className="flex items-center gap-3">
              <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                <Link to="/source-data"><ArrowLeft className="h-4 w-4" /></Link>
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-foreground">{form.name}</h1>
                {form.description && (
                  <p className="text-sm text-muted-foreground">{form.description}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <main className="mx-auto max-w-3xl px-6 py-8 space-y-8">
          {/* Submission Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">New Submission</CardTitle>
            </CardHeader>
            <CardContent>
              {submitted && (
                <div className="mb-4 flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-3 text-sm text-primary">
                  <CheckCircle2 className="h-4 w-4" />
                  Submission saved successfully!
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Submitted By */}
                <div className="space-y-2">
                  <Label>Submitted By</Label>
                  <Select value={staffId} onValueChange={setStaffId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select staff member" />
                    </SelectTrigger>
                    <SelectContent>
                      {teamMembers?.map(m => (
                        <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {fields.map(field => (
                  <div key={field.id} className="space-y-2">
                    <Label>
                      {field.label}
                      {field.required && <span className="text-destructive ml-1">*</span>}
                    </Label>

                    {field.field_type === 'text' && (
                      <Input
                        value={values[field.id!] || ''}
                        onChange={e => setValue(field.id!, e.target.value)}
                        required={field.required}
                      />
                    )}

                    {field.field_type === 'textarea' && (
                      <Textarea
                        value={values[field.id!] || ''}
                        onChange={e => setValue(field.id!, e.target.value)}
                        required={field.required}
                        rows={3}
                      />
                    )}

                    {field.field_type === 'number' && (
                      <Input
                        type="number"
                        value={values[field.id!] || ''}
                        onChange={e => setValue(field.id!, e.target.value)}
                        required={field.required}
                      />
                    )}

                    {field.field_type === 'date' && (
                      <Input
                        type="date"
                        value={values[field.id!] || ''}
                        onChange={e => setValue(field.id!, e.target.value)}
                        required={field.required}
                      />
                    )}

                    {field.field_type === 'select' && (
                      <Select
                        value={values[field.id!] || ''}
                        onValueChange={v => setValue(field.id!, v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select…" />
                        </SelectTrigger>
                        <SelectContent>
                          {(field.options || []).map(opt => (
                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}

                    {field.field_type === 'checkbox' && (
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={values[field.id!] === 'true'}
                          onCheckedChange={v => setValue(field.id!, v ? 'true' : 'false')}
                        />
                        <span className="text-sm text-muted-foreground">Yes</span>
                      </div>
                    )}

                    {field.field_type === 'radio' && (
                      <RadioGroup
                        value={values[field.id!] || ''}
                        onValueChange={v => setValue(field.id!, v)}
                      >
                        {(field.options || []).map(opt => (
                          <div key={opt} className="flex items-center gap-2">
                            <RadioGroupItem value={opt} id={`${field.id}-${opt}`} />
                            <Label htmlFor={`${field.id}-${opt}`} className="font-normal">{opt}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    )}
                  </div>
                ))}

                <div className="pt-2">
                  <Button type="submit" disabled={submitResponse.isPending}>
                    {submitResponse.isPending ? 'Saving…' : 'Submit'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Recent Submissions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Submissions</CardTitle>
            </CardHeader>
            <CardContent>
              {!responsesData?.responses.length ? (
                <p className="text-sm text-muted-foreground">No submissions yet.</p>
              ) : (
                <>
                  <div className="rounded-lg border overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Submitted By</TableHead>
                          {fields.slice(0, 3).map(f => (
                            <TableHead key={f.id}>{f.label}</TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {responsesData.responses.map((resp: any) => (
                          <TableRow key={resp.id}>
                            <TableCell className="whitespace-nowrap">
                              {format(new Date(resp.submitted_at), 'dd MMM yyyy HH:mm')}
                            </TableCell>
                            <TableCell>{resp.staff?.name || '—'}</TableCell>
                            {fields.slice(0, 3).map(f => {
                              const val = resp.values?.find((v: any) => v.field_id === f.id);
                              return (
                                <TableCell key={f.id} className="max-w-[200px] truncate">
                                  {val?.value || '—'}
                                </TableCell>
                              );
                            })}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  {responsesData.total > 10 && (
                    <div className="flex items-center justify-between mt-4">
                      <p className="text-xs text-muted-foreground">
                        Showing {page * 10 + 1}–{Math.min((page + 1) * 10, responsesData.total)} of {responsesData.total}
                      </p>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
                          Previous
                        </Button>
                        <Button variant="outline" size="sm" disabled={(page + 1) * 10 >= responsesData.total} onClick={() => setPage(p => p + 1)}>
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </DashboardLayout>
  );
}
