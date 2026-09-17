CREATE TABLE IF NOT EXISTS public.students (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS students_updated_at_idx ON public.students (updated_at);

-- The server uses SUPABASE_SERVICE_ROLE_KEY and accesses this table server-side.
-- Run this file in Supabase Dashboard > SQL Editor before starting the project.
