
-- Source Forms
CREATE TABLE public.source_forms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  slug TEXT NOT NULL UNIQUE,
  assigned_staff_member_id UUID REFERENCES public.team_members(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Source Form Fields
CREATE TABLE public.source_form_fields (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  form_id UUID NOT NULL REFERENCES public.source_forms(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  field_key TEXT NOT NULL,
  field_type TEXT NOT NULL DEFAULT 'text',
  required BOOLEAN NOT NULL DEFAULT false,
  options JSONB,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Source Form Responses
CREATE TABLE public.source_form_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  form_id UUID NOT NULL REFERENCES public.source_forms(id) ON DELETE CASCADE,
  submitted_by_staff_id UUID REFERENCES public.team_members(id) ON DELETE SET NULL,
  submitted_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Source Form Response Values
CREATE TABLE public.source_form_response_values (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  response_id UUID NOT NULL REFERENCES public.source_form_responses(id) ON DELETE CASCADE,
  field_id UUID NOT NULL REFERENCES public.source_form_fields(id) ON DELETE CASCADE,
  value TEXT
);

-- Enable RLS on all tables
ALTER TABLE public.source_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.source_form_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.source_form_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.source_form_response_values ENABLE ROW LEVEL SECURITY;

-- RLS Policies for source_forms
CREATE POLICY "Authenticated users can view active forms" ON public.source_forms
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can insert forms" ON public.source_forms
  FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update forms" ON public.source_forms
  FOR UPDATE USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete forms" ON public.source_forms
  FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for source_form_fields
CREATE POLICY "Authenticated users can view form fields" ON public.source_form_fields
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can insert form fields" ON public.source_form_fields
  FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update form fields" ON public.source_form_fields
  FOR UPDATE USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete form fields" ON public.source_form_fields
  FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for source_form_responses
CREATE POLICY "Authenticated users can view responses" ON public.source_form_responses
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert responses" ON public.source_form_responses
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- RLS Policies for source_form_response_values
CREATE POLICY "Authenticated users can view response values" ON public.source_form_response_values
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert response values" ON public.source_form_response_values
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Updated_at triggers
CREATE TRIGGER update_source_forms_updated_at
  BEFORE UPDATE ON public.source_forms
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_source_form_fields_updated_at
  BEFORE UPDATE ON public.source_form_fields
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Index for performance
CREATE INDEX idx_source_form_fields_form_id ON public.source_form_fields(form_id);
CREATE INDEX idx_source_form_responses_form_id ON public.source_form_responses(form_id);
CREATE INDEX idx_source_form_response_values_response_id ON public.source_form_response_values(response_id);
