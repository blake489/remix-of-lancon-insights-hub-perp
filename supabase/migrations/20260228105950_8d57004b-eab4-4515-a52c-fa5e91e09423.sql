
-- Table to persist weather EOT notifications per project per day
CREATE TABLE public.weather_eot_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  log_date DATE NOT NULL,
  rain_chance NUMERIC NOT NULL DEFAULT 0,
  rain_amount NUMERIC NOT NULL DEFAULT 0,
  severity TEXT NOT NULL DEFAULT 'info',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(project_id, log_date)
);

-- RLS
ALTER TABLE public.weather_eot_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view weather eot logs"
  ON public.weather_eot_logs FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can insert weather eot logs"
  ON public.weather_eot_logs FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can delete weather eot logs"
  ON public.weather_eot_logs FOR DELETE
  USING (auth.uid() IS NOT NULL);
