
CREATE TABLE public.site_weekly_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  week_start date NOT NULL,
  client_message boolean NOT NULL DEFAULT false,
  photos integer NOT NULL DEFAULT 0,
  hs_walk boolean NOT NULL DEFAULT false,
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (project_id, week_start)
);

ALTER TABLE public.site_weekly_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view site activities" ON public.site_weekly_activities
  FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can insert site activities" ON public.site_weekly_activities
  FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can update site activities" ON public.site_weekly_activities
  FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL);
