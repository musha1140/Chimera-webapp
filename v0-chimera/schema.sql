-- Existing tables remain unchanged

-- Create shadow_war_snapshots table if it doesn't exist
CREATE TABLE IF NOT EXISTS shadow_war_snapshots (
  id SERIAL PRIMARY KEY,
  snapshot_date TIMESTAMP WITH TIME ZONE NOT NULL,
  war_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS shadow_war_snapshots_date_idx ON shadow_war_snapshots(snapshot_date);

