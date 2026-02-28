CREATE TABLE public.sales_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_name TEXT NOT NULL,
  estimated_value NUMERIC NOT NULL DEFAULT 0,
  revenue_type TEXT NOT NULL DEFAULT 'prospective' CHECK (revenue_type IN ('prospective', 'firm')),
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'proposal', 'negotiation', 'won', 'lost')),
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.sales_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view sales leads" ON public.sales_leads FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated can insert sales leads" ON public.sales_leads FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated can update sales leads" ON public.sales_leads FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated can delete sales leads" ON public.sales_leads FOR DELETE USING (auth.uid() IS NOT NULL);