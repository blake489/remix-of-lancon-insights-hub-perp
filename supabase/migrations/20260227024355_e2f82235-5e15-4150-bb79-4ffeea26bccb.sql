
-- Project category enum
CREATE TYPE project_category AS ENUM ('pre_construction', 'construction', 'handover');

-- Projects table
CREATE TABLE projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_name text NOT NULL,
  client_name text,
  address text,
  site_manager text,
  category project_category NOT NULL DEFAULT 'pre_construction',
  contract_value_ex_gst numeric NOT NULL DEFAULT 0,
  contract_value_inc_gst numeric NOT NULL DEFAULT 0,
  start_date date,
  pc_date date,
  current_stage text,
  status text NOT NULL DEFAULT 'Active',
  forecast_cost numeric NOT NULL DEFAULT 0,
  forecast_gross_profit numeric NOT NULL DEFAULT 0,
  forecast_gp_percent numeric NOT NULL DEFAULT 0,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view projects" ON projects FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated can insert projects" ON projects FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated can update projects" ON projects FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can delete projects" ON projects FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- Indexes
CREATE INDEX idx_projects_category ON projects(category);
CREATE INDEX idx_projects_status ON projects(status);

-- Updated_at trigger
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
