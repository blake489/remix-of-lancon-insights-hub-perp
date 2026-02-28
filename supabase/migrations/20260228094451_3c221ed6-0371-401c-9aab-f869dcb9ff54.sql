
CREATE TABLE public.project_forecast_audit (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  old_forecast_cost NUMERIC NOT NULL DEFAULT 0,
  new_forecast_cost NUMERIC NOT NULL DEFAULT 0,
  old_contract_value NUMERIC NOT NULL DEFAULT 0,
  new_contract_value NUMERIC NOT NULL DEFAULT 0,
  old_gross_profit NUMERIC NOT NULL DEFAULT 0,
  new_gross_profit NUMERIC NOT NULL DEFAULT 0,
  old_gp_percent NUMERIC NOT NULL DEFAULT 0,
  new_gp_percent NUMERIC NOT NULL DEFAULT 0,
  changed_by UUID,
  changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reason TEXT
);

ALTER TABLE public.project_forecast_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view forecast audit" ON public.project_forecast_audit FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated can insert forecast audit" ON public.project_forecast_audit FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
