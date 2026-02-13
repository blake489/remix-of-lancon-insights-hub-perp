
-- Create development_projects table
CREATE TABLE public.development_projects (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_name text NOT NULL UNIQUE,
  current_value numeric NOT NULL DEFAULT 0,
  current_loan numeric NOT NULL DEFAULT 0,
  funds_in_offset numeric NOT NULL DEFAULT 0,
  grv numeric NOT NULL DEFAULT 0,
  forecast_margin_on_costs numeric NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.development_projects ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Authenticated users can view development projects"
ON public.development_projects FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can insert development projects"
ON public.development_projects FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update development projects"
ON public.development_projects FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete development projects"
ON public.development_projects FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_development_projects_updated_at
BEFORE UPDATE ON public.development_projects
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
