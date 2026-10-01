import express from "express";
import { createServer } from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { DatabaseSync } from "node:sqlite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type StudentRecord = Record<string, unknown> & { id: string; profile?: { name?: string } };

type DatabaseRow = { id: string; name_key: string; data: string; updated_at: string };

async function startServer() {
  const app = express();
  const server = createServer(app);
  const DEFAULT_TEACHER_PASSWORD = "7391846205";
  const LEGACY_TEACHER_PASSWORD = "professor";
  const dataDirectory = path.resolve(__dirname, "..", ".local-data");
  const databaseFile = path.join(dataDirectory, "classroom.sqlite");
  const legacyStudentsFile = path.join(dataDirectory, "students.json");
  const legacyTeacherFile = path.join(dataDirectory, "teacher.json");
  const normalizeStudentName = (name: string) => name.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, " ").toLocaleLowerCase("pt-BR");

  fs.mkdirSync(dataDirectory, { recursive: true });
  const database = new DatabaseSync(databaseFile);
  database.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS students (
      id TEXT PRIMARY KEY,
      name_key TEXT NOT NULL DEFAULT '',
      data TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE UNIQUE INDEX IF NOT EXISTS students_name_key_unique_idx ON students (name_key) WHERE name_key <> '';
    CREATE INDEX IF NOT EXISTS students_updated_at_idx ON students (updated_at);
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  const studentRows = () => database.prepare("SELECT id, name_key, data, updated_at FROM students ORDER BY updated_at ASC").all() as unknown as DatabaseRow[];
  const readStudents = (): Record<string, StudentRecord> => {
    const students: Record<string, StudentRecord> = {};
    for (const row of studentRows()) {
      try { students[row.id] = JSON.parse(row.data) as StudentRecord; } catch { console.error(`Registro inválido ignorado: ${row.id}`); }
    }
    return students;
  };
  const saveStudent = (student: StudentRecord) => {
    database.prepare(`
      INSERT INTO students (id, name_key, data, updated_at) VALUES (?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET name_key = excluded.name_key, data = excluded.data, updated_at = excluded.updated_at
    `).run(student.id, normalizeStudentName(String(student.profile?.name ?? "")), JSON.stringify(student), new Date().toISOString());
  };
  const saveStudents = (students: Record<string, StudentRecord>) => {
    const transaction = database.prepare(`
      INSERT INTO students (id, name_key, data, updated_at) VALUES (?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET name_key = excluded.name_key, data = excluded.data, updated_at = excluded.updated_at
    `);
    const timestamp = new Date().toISOString();
    database.exec("BEGIN");
    try {
      for (const student of Object.values(students)) transaction.run(student.id, normalizeStudentName(String(student.profile?.name ?? "")), JSON.stringify(student), timestamp);
      database.exec("COMMIT");
    } catch (error) {
      database.exec("ROLLBACK");
      throw error;
    }
  };
  const migrateLegacyData = () => {
    if (!fs.existsSync(legacyStudentsFile) || studentRows().length > 0) return;
    try {
      const legacy = JSON.parse(fs.readFileSync(legacyStudentsFile, "utf8")) as Record<string, StudentRecord>;
      if (Object.keys(legacy).length) {
        saveStudents(legacy);
        console.log(`Migrados ${Object.keys(legacy).length} perfil(is) do students.json para SQLite local.`);
      }
    } catch (error) {
      console.error("Não foi possível migrar students.json:", error);
    }
  };
  const readTeacherPassword = () => {
    const row = database.prepare("SELECT value FROM settings WHERE key = 'teacher_password'").get() as { value?: string } | undefined;
    if (row?.value) return row.value;
    let password = DEFAULT_TEACHER_PASSWORD;
    try {
      const legacy = JSON.parse(fs.readFileSync(legacyTeacherFile, "utf8")) as { password?: string };
      if (legacy.password) password = legacy.password === LEGACY_TEACHER_PASSWORD ? DEFAULT_TEACHER_PASSWORD : legacy.password;
    } catch { /* Primeiro uso: usa a senha padrão. */ }
    database.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('teacher_password', ?)").run(password);
    return password;
  };
  const writeTeacherPassword = (password: string) => {
    database.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('teacher_password', ?)").run(password);
  };
  const clearSessionsOnStartup = () => {
    const students = readStudents();
    let changed = false;
    for (const student of Object.values(students)) {
      if ("activeSession" in student) {
        delete student.activeSession;
        changed = true;
      }
    }
    if (changed) saveStudents(students);
  };

  migrateLegacyData();
  readTeacherPassword();
  clearSessionsOnStartup();
  console.log(`Banco local SQLite: ${databaseFile}`);

  app.use(express.json({ limit: "8mb" }));
  const asyncRoute = (handler: express.RequestHandler): express.RequestHandler => (req, res, next) => { Promise.resolve(handler(req, res, next)).catch(next); };
  app.post("/api/teacher/authorize", (req, res) => String(req.body?.password ?? "") === readTeacherPassword() ? res.json({ ok: true }) : res.status(401).json({ error: "Senha não reconhecida." }));
  app.put("/api/teacher/password", (req, res) => {
    const current = String(req.body?.current ?? "");
    const next = String(req.body?.next ?? "");
    if (current !== readTeacherPassword()) return res.status(401).json({ error: "A senha atual não confere." });
    if (next.trim().length < 6) return res.status(400).json({ error: "A nova senha precisa ter pelo menos 6 caracteres." });
    writeTeacherPassword(next);
    return res.json({ ok: true });
  });
  const publicStudent = (student: unknown) => { const { activeSession: _activeSession, ...safeStudent } = student as Record<string, unknown>; return safeStudent; };
  app.get("/api/students", asyncRoute(async (_req, res) => res.json(Object.values(readStudents()).map(publicStudent))));
  app.get("/api/students/:id", asyncRoute(async (req, res) => { const student = readStudents()[req.params.id]; return student ? res.json(publicStudent(student)) : res.status(404).json({ error: "Student not found" }); }));
  const sessionIsActive = (student: unknown) => { const session = (student as { activeSession?: { token?: string; lastSeen?: number } } | undefined)?.activeSession; return Boolean(session?.token && session.lastSeen && Date.now() - session.lastSeen < 120000); };
  const createSession = (student: StudentRecord, token: string) => { student.activeSession = { token, lastSeen: Date.now() }; };
  app.post("/api/students", asyncRoute(async (req, res) => {
    const payload = req.body as { id?: string; profile?: { name?: string }; completions?: unknown; worldApprovals?: unknown; answers?: unknown; gameState?: unknown; sessionToken?: string; teacherOverride?: boolean };
    if (!payload.id || !payload.profile) return res.status(400).json({ error: "Student id and profile are required" });
    const students = readStudents();
    const incomingName = normalizeStudentName(String(payload.profile.name ?? ""));
    const duplicate = Object.values(students).find((student) => student.id !== payload.id && normalizeStudentName(String(student.profile?.name ?? "")) === incomingName);
    if (duplicate) return res.status(409).json({ error: "Já existe um aluno com esse nome." });
    const existing = students[payload.id];
    const active = existing?.activeSession as { token?: string } | undefined;
    if (existing && sessionIsActive(existing) && active?.token !== payload.sessionToken && !payload.teacherOverride) return res.status(409).json({ error: "Este aluno já está em jogo em outro dispositivo." });
    const record = { ...(existing ?? {}), id: payload.id, profile: payload.profile, completions: payload.completions ?? {}, worldApprovals: payload.worldApprovals ?? {}, answers: payload.answers ?? [], ...(payload.gameState !== undefined ? { gameState: payload.gameState } : {}), updatedAt: new Date().toISOString() } as StudentRecord;
    if (payload.sessionToken) createSession(record, payload.sessionToken);
    try { saveStudent(record); } catch (error) { console.error("Unable to save student", error); return res.status(503).json({ error: "O banco de dados local está indisponível no momento." }); }
    return res.json({ ok: true });
  }));
  app.post("/api/students/:id/session", asyncRoute(async (req, res) => {
    const students = readStudents(); const student = students[req.params.id]; const token = String(req.body?.sessionToken ?? "");
    if (!student) return res.status(404).json({ error: "Aluno não encontrado." });
    const active = student.activeSession as { token?: string } | undefined;
    if (!token) return res.status(400).json({ error: "Sessão inválida." });
    if (sessionIsActive(student) && active?.token !== token) return res.status(409).json({ error: "Este aluno já está em jogo em outro dispositivo." });
    createSession(student, token); saveStudent(student); return res.json({ ok: true });
  }));
  app.delete("/api/students/:id/session", asyncRoute(async (req, res) => {
    const student = readStudents()[req.params.id]; const token = String(req.body?.sessionToken ?? "");
    if (!student) return res.status(404).json({ error: "Aluno não encontrado." });
    const active = student.activeSession as { token?: string } | undefined;
    if (active?.token === token) { delete student.activeSession; saveStudent(student); }
    return res.json({ ok: true });
  }));
  app.delete("/api/students/:id", asyncRoute(async (req, res) => {
    const students = readStudents(); const student = students[req.params.id];
    const confirmation = normalizeStudentName(String(req.body?.confirmName ?? ""));
    if (!student) return res.status(404).json({ error: "Aluno não encontrado." });
    if (!confirmation || confirmation !== normalizeStudentName(String(student.profile?.name ?? ""))) return res.status(400).json({ error: "A confirmação do nome não confere." });
    database.prepare("DELETE FROM students WHERE id = ?").run(req.params.id); return res.json({ ok: true });
  }));
  app.use("/manus-storage", asyncRoute(async (req, res) => {
    const key = req.path.replace(/^\//, ""); if (!key) return res.status(400).send("Missing storage key");
    const forgeBaseUrl = (process.env.BUILT_IN_FORGE_API_URL || "").replace(/\/+$/, ""); const forgeKey = process.env.BUILT_IN_FORGE_API_KEY;
    if (!forgeBaseUrl || !forgeKey) return res.status(500).send("Storage proxy not configured");
    try { const forgeUrl = new URL("v1/storage/presign/get", forgeBaseUrl + "/"); forgeUrl.searchParams.set("path", key); const forgeResponse = await fetch(forgeUrl, { headers: { Authorization: `Bearer ${forgeKey}` } }); if (!forgeResponse.ok) return res.status(502).send("Storage backend error"); const { url } = await forgeResponse.json() as { url?: string }; if (!url) return res.status(502).send("Empty signed URL"); return res.redirect(307, url); } catch { return res.status(502).send("Storage proxy error"); }
  }));
  app.use((error: unknown, _req: express.Request, res: express.Response, next: express.NextFunction) => { console.error("Unhandled request error", error); if (res.headersSent) return next(error); return res.status(503).json({ error: "O servidor não conseguiu concluir a solicitação." }); });
  const staticPath = process.env.NODE_ENV === "production" ? path.resolve(__dirname, "public") : path.resolve(__dirname, "..", "dist", "public");
  app.use(express.static(staticPath));
  app.get("*", (_req, res) => res.sendFile(path.join(staticPath, "index.html")));
  const port = process.env.PORT || 3000;
  server.listen(port, () => console.log(`Servidor do jogo rodando em http://localhost:${port}/`));
}

startServer().catch(console.error);
