-- Create enum for team departments
CREATE TYPE public.team_department AS ENUM ('site_supervisor', 'management', 'administration', 'accounts');

-- Create team_members table
CREATE TABLE public.team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    department team_department NOT NULL,
    job_title TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Create policies - authenticated users can view all team members
CREATE POLICY "Authenticated users can view team members"
ON public.team_members
FOR SELECT
TO authenticated
USING (true);

-- Authenticated users can create team members
CREATE POLICY "Authenticated users can create team members"
ON public.team_members
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- Authenticated users can update team members
CREATE POLICY "Authenticated users can update team members"
ON public.team_members
FOR UPDATE
TO authenticated
USING (auth.uid() IS NOT NULL);

-- Authenticated users can delete team members
CREATE POLICY "Authenticated users can delete team members"
ON public.team_members
FOR DELETE
TO authenticated
USING (auth.uid() IS NOT NULL);

-- Add trigger for updated_at
CREATE TRIGGER update_team_members_updated_at
BEFORE UPDATE ON public.team_members
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();