
-- Claims schedule snapshot storage for historical reporting
CREATE TABLE claims_schedule_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_label text NOT NULL,
  snapshot_order int NOT NULL,
  snapshot_date date,
  gp_percent numeric NOT NULL DEFAULT 18.6,
  monthly_overhead numeric NOT NULL DEFAULT 150000,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE claims_snapshot_months (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_id uuid NOT NULL REFERENCES claims_schedule_snapshots(id) ON DELETE CASCADE,
  month text NOT NULL,
  revenue_inc_gst numeric NOT NULL DEFAULT 0,
  revenue_ex_gst numeric NOT NULL DEFAULT 0,
  includes_pending boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE claims_schedule_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE claims_snapshot_months ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view snapshots" ON claims_schedule_snapshots FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can insert snapshots" ON claims_schedule_snapshots FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update snapshots" ON claims_schedule_snapshots FOR UPDATE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete snapshots" ON claims_schedule_snapshots FOR DELETE USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated can view snapshot months" ON claims_snapshot_months FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can insert snapshot months" ON claims_snapshot_months FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update snapshot months" ON claims_snapshot_months FOR UPDATE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete snapshot months" ON claims_snapshot_months FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- Index for fast lookups
CREATE INDEX idx_snapshot_months_snapshot_id ON claims_snapshot_months(snapshot_id);
CREATE INDEX idx_snapshot_months_month ON claims_snapshot_months(month);
CREATE INDEX idx_snapshots_order ON claims_schedule_snapshots(snapshot_order);
