-- Tighten policy to avoid overly permissive TRUE conditions.
DROP POLICY IF EXISTS "Authenticated users can update KPI settings" ON public.kpi_settings;

CREATE POLICY "Authenticated users can update active KPI settings"
ON public.kpi_settings
FOR UPDATE
TO authenticated
USING (is_active = true)
WITH CHECK (is_active = true);