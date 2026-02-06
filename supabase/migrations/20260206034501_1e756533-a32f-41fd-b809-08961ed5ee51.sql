-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table for admin access control
CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (prevents recursive RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
ON public.user_roles FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create KPI settings table
CREATE TABLE public.kpi_settings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    monthly_revenue_target numeric NOT NULL DEFAULT 1650000,
    gp_percent_target numeric NOT NULL DEFAULT 18,
    overhead_percent numeric NOT NULL DEFAULT 10.5,
    gp_threshold_green numeric NOT NULL DEFAULT 16,
    gp_threshold_orange numeric NOT NULL DEFAULT 12,
    revenue_threshold_green numeric NOT NULL DEFAULT 1650000,
    revenue_threshold_orange numeric NOT NULL DEFAULT 1400000,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_by uuid REFERENCES auth.users(id)
);

-- Enable RLS on kpi_settings
ALTER TABLE public.kpi_settings ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view active settings
CREATE POLICY "Authenticated users can view KPI settings"
ON public.kpi_settings FOR SELECT
TO authenticated
USING (true);

-- Only admins can modify settings
CREATE POLICY "Admins can update KPI settings"
ON public.kpi_settings FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert KPI settings"
ON public.kpi_settings FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create KPI settings audit trail
CREATE TABLE public.kpi_settings_audit (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    settings_id uuid REFERENCES public.kpi_settings(id) ON DELETE SET NULL,
    monthly_revenue_target numeric NOT NULL,
    gp_percent_target numeric NOT NULL,
    overhead_percent numeric NOT NULL,
    gp_threshold_green numeric NOT NULL,
    gp_threshold_orange numeric NOT NULL,
    revenue_threshold_green numeric NOT NULL,
    revenue_threshold_orange numeric NOT NULL,
    changed_by uuid REFERENCES auth.users(id),
    changed_by_email text,
    change_reason text,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on audit table
ALTER TABLE public.kpi_settings_audit ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view audit trail
CREATE POLICY "Authenticated users can view audit trail"
ON public.kpi_settings_audit FOR SELECT
TO authenticated
USING (true);

-- Only admins can insert audit records
CREATE POLICY "Admins can insert audit records"
ON public.kpi_settings_audit FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Add updated_at trigger for kpi_settings
CREATE TRIGGER update_kpi_settings_updated_at
BEFORE UPDATE ON public.kpi_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default KPI settings
INSERT INTO public.kpi_settings (
    monthly_revenue_target,
    gp_percent_target,
    overhead_percent,
    gp_threshold_green,
    gp_threshold_orange,
    revenue_threshold_green,
    revenue_threshold_orange,
    is_active
) VALUES (
    1650000,
    18,
    10.5,
    16,
    12,
    1650000,
    1400000,
    true
);