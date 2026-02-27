
-- Create claims table
CREATE TABLE public.claims (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  claim_date date NOT NULL,
  month_key text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  direction text NOT NULL DEFAULT 'Up' CHECK (direction IN ('Up', 'Down')),
  claim_type text NOT NULL CHECK (claim_type IN ('Deposit', 'Base', 'Slab/Base', 'Frame', 'Enclosed', 'Fixing', 'PC', 'Handover', 'Variation', 'Retaining Wall', 'Other')),
  reference text,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Index for fast month grouping
CREATE INDEX idx_claims_month_key ON public.claims(month_key);
CREATE INDEX idx_claims_project_id ON public.claims(project_id);

-- Enable RLS
ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Authenticated can view claims" ON public.claims FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated can insert claims" ON public.claims FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated can update claims" ON public.claims FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated can delete claims" ON public.claims FOR DELETE USING (auth.uid() IS NOT NULL);

-- Auto-update updated_at
CREATE TRIGGER update_claims_updated_at
  BEFORE UPDATE ON public.claims
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
