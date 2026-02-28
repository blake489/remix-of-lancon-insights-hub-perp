
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS schedule_type text NOT NULL DEFAULT 'standard',
  ADD COLUMN IF NOT EXISTS custom_timeframes jsonb NOT NULL DEFAULT '{}'::jsonb;
