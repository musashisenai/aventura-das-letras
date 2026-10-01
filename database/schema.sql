-- Estrutura equivalente criada automaticamente pelo servidor Node.js.
-- O banco real fica em .local-data/classroom.sqlite e não é enviado ao GitHub.
CREATE TABLE IF NOT EXISTS students (
  id TEXT PRIMARY KEY,
  name_key TEXT NOT NULL DEFAULT '',
  data TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS students_name_key_unique_idx
  ON students (name_key) WHERE name_key <> '';

CREATE INDEX IF NOT EXISTS students_updated_at_idx
  ON students (updated_at);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
