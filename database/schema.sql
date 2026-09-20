CREATE TABLE IF NOT EXISTS public.students (
  id TEXT PRIMARY KEY,
  name_key TEXT NOT NULL DEFAULT '',
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.students ADD COLUMN IF NOT EXISTS name_key TEXT NOT NULL DEFAULT '';
CREATE INDEX IF NOT EXISTS students_updated_at_idx ON public.students (updated_at);
CREATE UNIQUE INDEX IF NOT EXISTS students_name_key_unique_idx ON public.students (name_key) WHERE name_key <> '';
