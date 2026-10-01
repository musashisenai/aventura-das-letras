import express from "express";
import { createServer } from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type StudentRecord = Record<string, unknown> & { id: string; profile?: { name?: string; placementCompleted?: boolean } };
type ClassroomDatabase = { students: Record<string, StudentRecord>; settings: Record<string, string> };

async function startServer() {
  const app = express();
  const server = createServer(app);
  const DEFAULT_TEACHER_PASSWORD = "7391846205";
  const LEGACY_TEACHER_PASSWORD = "professor";
  const databaseFile = path.resolve(__dirname, "..", "database", "classroom.json");
  const legacyStudentsFile = path.resolve(__dirname, "..", ".local-data", "students.json");
  const legacyTeacherFile = path.resolve(__dirname, "..", ".local-data", "teacher.json");
  const normalizeStudentName = (name: string) => name.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, " ").toLocaleLowerCase("pt-BR");

  fs.mkdirSync(path.dirname(databaseFile), { recursive: true });
  const emptyDatabase = (): ClassroomDatabase => ({ students: {}, settings: {} });
  const readDatabase = (): ClassroomDatabase => {
    try {
      const parsed = JSON.parse(fs.readFileSync(databaseFile, "utf8")) as Partial<ClassroomDatabase>;
      return { students: parsed.students && typeof parsed.students === "object" ? parsed.students as Record<string, StudentRecord> : {}, settings: parsed.settings && typeof parsed.settings === "object" ? parsed.settings as Record<string, string> : {} };
    } catch {
      return emptyDatabase();
    }
  };
  const writeDatabase = (database: ClassroomDatabase) => {
    const temporaryFile = `${databaseFile}.tmp`;
    fs.writeFileSync(temporaryFile, `${JSON.stringify(database, null, 2)}\n`, "utf8");
    fs.renameSync(temporaryFile, databaseFile);
  };
  const migrateLegacyData = () => {
    const database = readDatabase();
    if (Object.keys(database.students).length || !fs.existsSync(legacyStudentsFile)) return database;
    try {
      const students = JSON.parse(fs.readFileSync(legacyStudentsFile, "utf8")) as Record<string, StudentRecord>;
      database.students = students;
      writeDatabase(database);
      console.log(`Migrados ${Object.keys(students).length} perfil(is) do students.json para database/classroom.json.`);
    } catch (error) { console.error("Não foi possível migrar students.json:", error); }
    return database;
  };
  const getTeacherPassword = (database: ClassroomDatabase) => {
    if (database.settings.teacherPassword) return database.settings.teacherPassword;
    let password = DEFAULT_TEACHER_PASSWORD;
    try {
      const legacy = JSON.parse(fs.readFileSync(legacyTeacherFile, "utf8")) as { password?: string };
      if (legacy.password) password = legacy.password === LEGACY_TEACHER_PASSWORD ? DEFAULT_TEACHER_PASSWORD : legacy.password;
    } catch { /* Primeiro uso: usa a senha padrão. */ }
    database.settings.teacherPassword = password;
    writeDatabase(database);
    return password;
  };
  const saveStudent = (student: StudentRecord) => {
    const database = readDatabase();
    database.students[student.id] = student;
    writeDatabase(database);
  };
  const clearSessionsOnStartup = () => {
    const database = readDatabase();
    let changed = false;
    for (const student of Object.values(database.students)) {
      if ("activeSession" in student) { delete student.activeSession; changed = true; }
    }
    if (changed) writeDatabase(database);
  };

  const database = migrateLegacyData();
  if (!fs.existsSync(databaseFile)) writeDatabase(database);
  getTeacherPassword(database);
  clearSessionsOnStartup();
  console.log(`Banco local versionado: ${databaseFile}`);

  app.use(express.json({ limit: "8mb" }));
  const asyncRoute = (handler: express.RequestHandler): express.RequestHandler => (req, res, next) => { Promise.resolve(handler(req, res, next)).catch(next); };
  app.post("/api/teacher/authorize", (req, res) => { const database = readDatabase(); return String(req.body?.password ?? "") === getTeacherPassword(database) ? res.json({ ok: true }) : res.status(401).json({ error: "Senha não reconhecida." }); });
  app.put("/api/teacher/password", (req, res) => {
    const database = readDatabase();
    const current = String(req.body?.current ?? "");
    const next = String(req.body?.next ?? "");
    if (current !== getTeacherPassword(database)) return res.status(401).json({ error: "A senha atual não confere." });
    if (next.trim().length < 6) return res.status(400).json({ error: "A nova senha precisa ter pelo menos 6 caracteres." });
    database.settings.teacherPassword = next; writeDatabase(database); return res.json({ ok: true });
  });
  const publicStudent = (student: unknown) => { const { activeSession: _activeSession, ...safeStudent } = student as Record<string, unknown>; return safeStudent; };
  app.get("/api/students", asyncRoute(async (_req, res) => res.json(Object.values(readDatabase().students).map(publicStudent))));
  app.get("/api/students/:id", asyncRoute(async (req, res) => { const student = readDatabase().students[req.params.id]; return student ? res.json(publicStudent(student)) : res.status(404).json({ error: "Student not found" }); }));
  const sessionIsActive = (student: unknown) => { const session = (student as { activeSession?: { token?: string; lastSeen?: number } } | undefined)?.activeSession; return Boolean(session?.token && session.lastSeen && Date.now() - session.lastSeen < 120000); };
  const createSession = (student: StudentRecord, token: string) => { student.activeSession = { token, lastSeen: Date.now() }; };
  app.post("/api/students", asyncRoute(async (req, res) => {
    const payload = req.body as { id?: string; profile?: { name?: string; placementCompleted?: boolean }; completions?: unknown; worldApprovals?: unknown; answers?: unknown; gameState?: unknown; sessionToken?: string; teacherOverride?: boolean };
    if (!payload.id || !payload.profile) return res.status(400).json({ error: "Student id and profile are required" });
    const database = readDatabase();
    const students = database.students;
    const incomingName = normalizeStudentName(String(payload.profile.name ?? ""));
    const duplicate = Object.values(students).find((student) => student.id !== payload.id && normalizeStudentName(String(student.profile?.name ?? "")) === incomingName);
    if (duplicate) return res.status(409).json({ error: "Já existe um aluno com esse nome." });
    const existing = students[payload.id];
    const active = existing?.activeSession as { token?: string } | undefined;
    if (existing && sessionIsActive(existing) && active?.token !== payload.sessionToken && !payload.teacherOverride) return res.status(409).json({ error: "Este aluno já está em jogo em outro dispositivo." });
    const record = { ...(existing ?? {}), id: payload.id, profile: payload.profile, completions: payload.completions ?? {}, worldApprovals: payload.worldApprovals ?? {}, answers: payload.answers ?? [], ...(payload.gameState !== undefined ? { gameState: payload.gameState } : {}), updatedAt: new Date().toISOString() } as StudentRecord;
    if (payload.sessionToken) createSession(record, payload.sessionToken);
    try { database.students[payload.id] = record; writeDatabase(database); } catch (error) { console.error("Unable to save student", error); return res.status(503).json({ error: "O banco local está indisponível no momento." }); }
    return res.json({ ok: true });
  }));
  app.post("/api/students/:id/session", asyncRoute(async (req, res) => {
    const database = readDatabase(); const student = database.students[req.params.id]; const token = String(req.body?.sessionToken ?? "");
    if (!student) return res.status(404).json({ error: "Aluno não encontrado." });
    const active = student.activeSession as { token?: string } | undefined;
    if (!token) return res.status(400).json({ error: "Sessão inválida." });
    if (sessionIsActive(student) && active?.token !== token) return res.status(409).json({ error: "Este aluno já está em jogo em outro dispositivo." });
    createSession(student, token); database.students[student.id] = student; writeDatabase(database); return res.json({ ok: true });
  }));
  app.delete("/api/students/:id/session", asyncRoute(async (req, res) => {
    const database = readDatabase(); const student = database.students[req.params.id]; const token = String(req.body?.sessionToken ?? "");
    if (!student) return res.status(404).json({ error: "Aluno não encontrado." });
    const active = student.activeSession as { token?: string } | undefined;
    if (active?.token === token) { delete student.activeSession; database.students[student.id] = student; writeDatabase(database); }
    return res.json({ ok: true });
  }));
  app.delete("/api/students/:id", asyncRoute(async (req, res) => {
    const database = readDatabase(); const student = database.students[req.params.id];
    const confirmation = normalizeStudentName(String(req.body?.confirmName ?? ""));
    if (!student) return res.status(404).json({ error: "Aluno não encontrado." });
    if (!confirmation || confirmation !== normalizeStudentName(String(student.profile?.name ?? ""))) return res.status(400).json({ error: "A confirmação do nome não confere." });
    delete database.students[req.params.id]; writeDatabase(database); return res.json({ ok: true });
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
