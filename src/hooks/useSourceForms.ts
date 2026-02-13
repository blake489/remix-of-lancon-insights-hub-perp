import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface SourceFormField {
  id?: string;
  form_id?: string;
  label: string;
  field_key: string;
  field_type: string;
  required: boolean;
  options: string[] | null;
  sort_order: number;
}

export interface SourceForm {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  assigned_staff_member_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  assigned_staff?: { id: string; name: string } | null;
  fields?: SourceFormField[];
  _count?: { responses: number };
}

export function useSourceForms() {
  return useQuery({
    queryKey: ['source-forms'],
    queryFn: async () => {
      const { data: forms, error } = await supabase
        .from('source_forms')
        .select('*, assigned_staff:team_members!source_forms_assigned_staff_member_id_fkey(id, name)')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get response counts
      const { data: counts } = await supabase
        .from('source_form_responses')
        .select('form_id');

      const countMap: Record<string, number> = {};
      counts?.forEach((r: any) => {
        countMap[r.form_id] = (countMap[r.form_id] || 0) + 1;
      });

      return (forms || []).map((f: any) => ({
        ...f,
        assigned_staff: f.assigned_staff?.[0] || f.assigned_staff || null,
        _count: { responses: countMap[f.id] || 0 },
      })) as SourceForm[];
    },
  });
}

export function useSourceForm(slugOrId: string | undefined) {
  return useQuery({
    queryKey: ['source-form', slugOrId],
    enabled: !!slugOrId,
    queryFn: async () => {
      // Try slug first, then id
      let query = supabase
        .from('source_forms')
        .select('*, assigned_staff:team_members!source_forms_assigned_staff_member_id_fkey(id, name)')
        .eq('slug', slugOrId!)
        .maybeSingle();

      let { data, error } = await query;

      if (!data) {
        const res = await supabase
          .from('source_forms')
          .select('*, assigned_staff:team_members!source_forms_assigned_staff_member_id_fkey(id, name)')
          .eq('id', slugOrId!)
          .maybeSingle();
        data = res.data;
        error = res.error;
      }

      if (error) throw error;
      if (!data) throw new Error('Form not found');

      // Fetch fields
      const { data: fields } = await supabase
        .from('source_form_fields')
        .select('*')
        .eq('form_id', data.id)
        .order('sort_order', { ascending: true });

      return {
        ...data,
        assigned_staff: (data as any).assigned_staff?.[0] || (data as any).assigned_staff || null,
        fields: (fields || []).map((f: any) => ({
          ...f,
          options: f.options as string[] | null,
        })),
      } as SourceForm;
    },
  });
}

export function useCreateForm() {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: {
      name: string;
      description: string;
      slug: string;
      assigned_staff_member_id: string | null;
      fields: SourceFormField[];
    }) => {
      const { data: form, error: formError } = await supabase
        .from('source_forms')
        .insert({
          name: input.name,
          description: input.description,
          slug: input.slug,
          assigned_staff_member_id: input.assigned_staff_member_id,
          created_by: user?.id || null,
        })
        .select()
        .single();

      if (formError) throw formError;

      if (input.fields.length > 0) {
        const { error: fieldsError } = await supabase
          .from('source_form_fields')
          .insert(
            input.fields.map((f, i) => ({
              form_id: form.id,
              label: f.label,
              field_key: f.field_key,
              field_type: f.field_type,
              required: f.required,
              options: f.options,
              sort_order: i,
            }))
          );
        if (fieldsError) throw fieldsError;
      }

      return form;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['source-forms'] });
      toast.success('Form created successfully');
    },
    onError: (err: any) => toast.error(err.message),
  });
}

export function useUpdateForm() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      id: string;
      name: string;
      description: string;
      slug: string;
      assigned_staff_member_id: string | null;
      fields: SourceFormField[];
    }) => {
      const { error: formError } = await supabase
        .from('source_forms')
        .update({
          name: input.name,
          description: input.description,
          slug: input.slug,
          assigned_staff_member_id: input.assigned_staff_member_id,
        })
        .eq('id', input.id);

      if (formError) throw formError;

      // Delete old fields and re-insert (preserves historical response_values via field_id FK)
      // Actually, we should NOT delete fields that have responses. Instead, let's upsert.
      // For simplicity: delete fields not in new set, upsert existing ones
      const existingFieldIds = input.fields.filter(f => f.id).map(f => f.id!);
      
      // Delete removed fields
      if (existingFieldIds.length > 0) {
        await supabase
          .from('source_form_fields')
          .delete()
          .eq('form_id', input.id)
          .not('id', 'in', `(${existingFieldIds.join(',')})`);
      } else {
        await supabase
          .from('source_form_fields')
          .delete()
          .eq('form_id', input.id);
      }

      // Upsert fields
      for (let i = 0; i < input.fields.length; i++) {
        const f = input.fields[i];
        if (f.id) {
          await supabase
            .from('source_form_fields')
            .update({
              label: f.label,
              field_key: f.field_key,
              field_type: f.field_type,
              required: f.required,
              options: f.options,
              sort_order: i,
            })
            .eq('id', f.id);
        } else {
          await supabase
            .from('source_form_fields')
            .insert({
              form_id: input.id,
              label: f.label,
              field_key: f.field_key,
              field_type: f.field_type,
              required: f.required,
              options: f.options,
              sort_order: i,
            });
        }
      }

      return input;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['source-forms'] });
      qc.invalidateQueries({ queryKey: ['source-form'] });
      toast.success('Form updated successfully');
    },
    onError: (err: any) => toast.error(err.message),
  });
}

export function useDeleteForm() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('source_forms').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['source-forms'] });
      toast.success('Form deleted');
    },
    onError: (err: any) => toast.error(err.message),
  });
}

export function useSubmitFormResponse() {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: {
      form_id: string;
      staff_id: string | null;
      values: { field_id: string; value: string }[];
    }) => {
      const { data: response, error: respError } = await supabase
        .from('source_form_responses')
        .insert({
          form_id: input.form_id,
          submitted_by_staff_id: input.staff_id,
          submitted_by_user_id: user?.id || null,
        })
        .select()
        .single();

      if (respError) throw respError;

      if (input.values.length > 0) {
        const { error: valError } = await supabase
          .from('source_form_response_values')
          .insert(
            input.values.map(v => ({
              response_id: response.id,
              field_id: v.field_id,
              value: v.value,
            }))
          );
        if (valError) throw valError;
      }

      return response;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['form-responses', vars.form_id] });
      toast.success('Submission saved');
    },
    onError: (err: any) => toast.error(err.message),
  });
}

export function useFormResponses(formId: string | undefined, page = 0, pageSize = 10) {
  return useQuery({
    queryKey: ['form-responses', formId, page],
    enabled: !!formId,
    queryFn: async () => {
      const from = page * pageSize;
      const to = from + pageSize - 1;

      const { data: responses, error, count } = await supabase
        .from('source_form_responses')
        .select('*, staff:team_members!source_form_responses_submitted_by_staff_id_fkey(name)', { count: 'exact' })
        .eq('form_id', formId!)
        .order('submitted_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      // Fetch values for these responses
      const responseIds = (responses || []).map((r: any) => r.id);
      let values: any[] = [];
      if (responseIds.length > 0) {
        const { data: vals } = await supabase
          .from('source_form_response_values')
          .select('*')
          .in('response_id', responseIds);
        values = vals || [];
      }

      return {
        responses: (responses || []).map((r: any) => ({
          ...r,
          staff: r.staff?.[0] || r.staff || null,
          values: values.filter((v: any) => v.response_id === r.id),
        })),
        total: count || 0,
      };
    },
  });
}

export function useTeamMembers() {
  return useQuery({
    queryKey: ['team-members'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_members')
        .select('id, name, email, job_title, department')
        .eq('is_active', true)
        .order('name');
      if (error) throw error;
      return data || [];
    },
  });
}
