CREATE TABLE public.claim_moves (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  claim_id uuid NOT NULL REFERENCES public.claims(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  claim_type text NOT NULL,
  old_date date NOT NULL,
  new_date date NOT NULL,
  moved_by uuid REFERENCES auth.users(id),
  moved_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.claim_moves ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view claim moves" ON public.claim_moves FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated can insert claim moves" ON public.claim_moves FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);