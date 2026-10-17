-- Apply once to your Neon PostgreSQL database before configuring DATABASE_URL.
CREATE TABLE IF NOT EXISTS dwell_workspaces (
  user_id TEXT PRIMARY KEY,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT workspace_data_object CHECK (jsonb_typeof(data) = 'object')
);
-- Every server query is scoped to the Site-authenticated user ID.
