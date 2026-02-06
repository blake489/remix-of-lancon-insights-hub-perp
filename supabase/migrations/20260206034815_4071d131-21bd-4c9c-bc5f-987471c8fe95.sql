-- Create role level enum for hierarchy
CREATE TYPE public.role_level AS ENUM ('director', 'manager', 'staff');

-- Add hierarchy columns to team_members
ALTER TABLE public.team_members
ADD COLUMN reports_to uuid REFERENCES public.team_members(id) ON DELETE SET NULL,
ADD COLUMN role_level role_level NOT NULL DEFAULT 'staff';

-- Create index for efficient hierarchy queries
CREATE INDEX idx_team_members_reports_to ON public.team_members(reports_to);
CREATE INDEX idx_team_members_role_level ON public.team_members(role_level);