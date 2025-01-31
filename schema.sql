-- Towers table (already created, but included for completeness)
CREATE TABLE IF NOT EXISTS towers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  buff TEXT NOT NULL,
  description TEXT,
  members JSONB DEFAULT '[]',
  contest JSONB DEFAULT '{"isContested": false}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Members table
CREATE TABLE IF NOT EXISTS members (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  class VARCHAR(255) NOT NULL,
  is_ready BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Shadow War table
CREATE TABLE IF NOT EXISTS shadow_wars (
  id SERIAL PRIMARY KEY,
  war_time TIMESTAMP WITH TIME ZONE,
  war_types JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS towers_created_at_idx ON towers(created_at);
CREATE INDEX IF NOT EXISTS members_created_at_idx ON members(created_at);
CREATE INDEX IF NOT EXISTS shadow_wars_created_at_idx ON shadow_wars(created_at);

