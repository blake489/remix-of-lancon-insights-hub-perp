-- Allow authenticated users to update KPI settings (including BHAG target)
-- This fixes BHAG edits failing when no admin role rows exist.
DROP POLICY IF EXISTS "Authenticated users can update KPI settings" ON public.kpi_settings;

CREATE POLICY "Authenticated users can update KPI settings"
ON public.kpi_settings
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);