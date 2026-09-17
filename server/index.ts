import express from "express";
import { createServer } from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mysql, { type Pool, type RowDataPacket } from "mysql2/promise";

type StudentRecord = Record<string, unknown>;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_TEACHER_PASSWORD = "7391846205";
const LEGACY_TEACHER_PASSWORD = "professor";

async function startServer() {
  const app = express();
  const server = createServer(app);
  const classroomFile = path.resolve(__dirname, "..", ".local-data", "students.json");
  const teacherFile = path.resolve(__dirname, "..", ".local-data", "teacher.json");
  const databaseUrl = process.env.MYSQL_URL?.trim();
  const pool: Pool | null = databaseUrl ? mysql.createPool(databaseUrl) : null;

  const readLocalStudents = (): Record<string, StudentRecord> => {
    try { return JSON.parse(fs.readFileSync(classroomFile, "utf8")) as Record<string, StudentRecord>; } catch { return {}; }
  };
  const writeLocalStudents = (students: Record<string, StudentRecord>) => {
    fs.mkdirSync(path.dirname(classroomFile), { recursive: true });
    const temporaryFile = `${classroomFile}.tmp`;
    fs.writeFileSync(temporaryFile, JSON.stringify(students, null, 2), "utf8");
    fs.renameSync(temporaryFile, classroomFile);
  };
  const readStudents = async (): Promise<Record<string, StudentRecord>> => {
    if (!pool) return readLocalStudents();
    const [rows] = await pool.query<RowDataPacket[]>("SELECT id, data FROM students ORDER BY updated_at ASC");
    return Object.fromEntries(rows.map((row) => [String(row.id), typeof row.data === "string" ? JSON.parse(row.data) as StudentRecord : row.data as StudentRecord]));
  };
  const writeStudents = async (students: Record<string, StudentRecord>) => {
    if (!pool) return writeLocalStudents(students);
    const client = await pool.getConnection();
    try {
      await client.beginTransaction();
      for (const student of Object.values(students)) {
        await client.query("INSERT INTO students (id, data, updated_at) VALUES (?, ?, NOW()) ON DUPLICATE KEY UPDATE data = VALUES(data), updated_at = NOW()", [student.id, JSON.stringify(student)]);
      }
      await client.commit();
    } catch (error) {
      await client.rollback();
      throw error;
    } finally { client.release(); }
  };
  const initDatabase = async () => {
    if (!pool) return;
    await pool.query("CREATE TABLE IF NOT EXISTS students (id VARCHAR(191) PRIMARY KEY, data JSON NOT NULL, updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)");
    const [countRows] = await pool.query<RowDataPacket[]>("SELECT COUNT(*) AS count FROM students");
    const localStudents = readLocalStudents();
    if (Number(countRows[0]?.count ?? 0) === 0 && Object.keys(localStudents).length) {
      for (const student of Object.values(localStudents)) {
        await pool.query("INSERT IGNORE INTO students (id, data, updated_at) VALUES (?, ?, NOW())", [student.id, JSON.stringify(student)]);
      }
      console.log(`Migrated ${Object.keys(localStudents).length} local student save(s) to MySQL`);
    }
    console.log("Persistent student storage: MySQL");
  };
  const readTeacherPassword = () => {
    try {
      const data = JSON.parse(fs.readFileSync(teacherFile, "utf8")) as { password?: string };
      if (!data.password) return DEFAULT_TEACHER_PASSWORD;
      if (data.password === LEGACY_TEACHER_PASSWORD) { writeTeacherPassword(DEFAULT_TEACHER_PASSWORD); return DEFAULT_TEACHER_PASSWORD; }
      return data.password;
    } catch { return DEFAULT_TEACHER_PASSWORD; }
  };
  const writeTeacherPassword = (password: string) => {
    fs.mkdirSync(path.dirname(teacherFile), { recursive: true });
    fs.writeFileSync(teacherFile, JSON.stringify({ password }, null, 2), "utf8");
  };
  const publicStudent = (student: StudentRecord) => { const { activeSession: _activeSession, ...safeStudent } = student; return safeStudent; };
  const normalizeStudentName = (name: string) => name.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, " ").toLocaleLowerCase("pt-BR");
  const sessionIsActive = (student: StudentRecord | undefined) => {
    const session = student?.activeSession as { token?: string; lastSeen?: number } | undefined;
    return Boolean(session?.token && session.lastSeen && Date.now() - session.lastSeen < 120000);
  };
  const createSession = (student: StudentRecord, token: string) => { student.activeSession = { token, lastSeen: Date.now() }; };

  app.use(express.json({ limit: "8mb" }));
  app.post("/api/teacher/authorize", (req, res) => String(req.body?.password ?? "") === readTeacherPassword() ? res.json({ ok: true }) : res.status(401).json({ error: "Senha não reconhecida." }));
  app.put("/api/teacher/password", (req, res) => {
    const current = String(req.body?.current ?? "");
    const next = String(req.body?.next ?? "");
    if (current !== readTeacherPassword()) return res.status(401).json({ error: "A senha atual não confere." });
    if (next.trim().length < 6) return res.status(400).json({ error: "A nova senha precisa ter pelo menos 6 caracteres." });
    writeTeacherPassword(next); return res.json({ ok: true });
  });
  app.get("/api/students", async (_req, res) => res.json(Object.values(await readStudents()).map(publicStudent)));
  app.get("/api/students/:id", async (req, res) => { const student = (await readStudents())[req.params.id]; return student ? res.json(publicStudent(student)) : res.status(404).json({ error: "Student not found" }); });
  app.post("/api/students", async (req, res) => {
    const payload = req.body as { id?: string; profile?: StudentRecord; completions?: unknown; worldApprovals?: unknown; answers?: unknown; sessionToken?: string; teacherOverride?: boolean };
    if (!payload.id || !payload.profile) return res.status(400).json({ error: "Student id and profile are required" });
    const students = await readStudents();
    const incomingName = normalizeStudentName(String(payload.profile.name ?? ""));
    const duplicate = Object.values(students).find((student) => student.id !== payload.id && normalizeStudentName(String((student.profile as StudentRecord | undefined)?.name ?? "")) === incomingName);
    if (duplicate) return res.status(409).json({ error: "Já existe um aluno com esse nome." });
    const existing = students[payload.id];
    const active = existing?.activeSession as { token?: string } | undefined;
    if (existing && sessionIsActive(existing) && active?.token !== payload.sessionToken && !payload.teacherOverride) return res.status(409).json({ error: "Este aluno já está em jogo em outro dispositivo." });
    const record: StudentRecord = { ...(existing ?? {}), id: payload.id, profile: payload.profile, completions: payload.completions ?? {}, worldApprovals: payload.worldApprovals ?? {}, answers: payload.answers ?? [], updatedAt: new Date().toISOString() };
    if (payload.sessionToken) createSession(record, payload.sessionToken);
    students[payload.id] = record; await writeStudents(students); return res.json({ ok: true });
  });
  app.post("/api/students/:id/session", async (req, res) => {
    const students = await readStudents(); const student = students[req.params.id]; const token = String(req.body?.sessionToken ?? "");
    if (!student) return res.status(404).json({ error: "Aluno não encontrado." });
    if (!token) return res.status(400).json({ error: "Sessão inválida." });
    const active = student.activeSession as { token?: string } | undefined;
    if (sessionIsActive(student) && active?.token !== token) return res.status(409).json({ error: "Este aluno já está em jogo em outro dispositivo." });
    createSession(student, token); students[req.params.id] = student; await writeStudents(students); return res.json({ ok: true });
  });
  app.delete("/api/students/:id/session", async (req, res) => {
    const students = await readStudents(); const student = students[req.params.id]; const token = String(req.body?.sessionToken ?? "");
    if (!student) return res.status(404).json({ error: "Aluno não encontrado." });
    if ((student.activeSession as { token?: string } | undefined)?.token === token) { delete student.activeSession; students[req.params.id] = student; await writeStudents(students); }
    return res.json({ ok: true });
  });
  app.delete("/api/students/:id", async (req, res) => {
    const students = await readStudents(); const student = students[req.params.id];
    const confirmation = normalizeStudentName(String(req.body?.confirmName ?? ""));
    if (!student) return res.status(404).json({ error: "Aluno não encontrado." });
    if (!confirmation || confirmation !== normalizeStudentName(String((student.profile as StudentRecord | undefined)?.name ?? ""))) return res.status(400).json({ error: "A confirmação do nome não confere." });
    delete students[req.params.id];
    if (pool) await pool.query("DELETE FROM students WHERE id = ?", [req.params.id]); else writeLocalStudents(students);
    return res.json({ ok: true });
  });
  app.use("/manus-storage", async (req, res) => {
    const key = req.path.replace(/^\//, ""); if (!key) return res.status(400).send("Missing storage key");
    const forgeBaseUrl = (process.env.BUILT_IN_FORGE_API_URL || "").replace(/\/+$/, ""); const forgeKey = process.env.BUILT_IN_FORGE_API_KEY;
    if (!forgeBaseUrl || !forgeKey) return res.status(500).send("Storage proxy not configured");
    try { const forgeUrl = new URL("v1/storage/presign/get", forgeBaseUrl + "/"); forgeUrl.searchParams.set("path", key); const forgeResponse = await fetch(forgeUrl, { headers: { Authorization: `Bearer ${forgeKey}` } }); if (!forgeResponse.ok) return res.status(502).send("Storage backend error"); const { url } = await forgeResponse.json() as { url?: string }; return url ? res.redirect(307, url) : res.status(502).send("Empty signed URL"); } catch { return res.status(502).send("Storage proxy error"); }
  });
  const staticPath = process.env.NODE_ENV === "production" ? path.resolve(__dirname, "public") : path.resolve(__dirname, "..", "dist", "public");
  app.use(express.static(staticPath)); app.get("*", (_req, res) => res.sendFile(path.join(staticPath, "index.html")));
  await initDatabase();
  const port = process.env.PORT || 3000;
  server.listen(port, () => console.log(`Server running on http://localhost:${port}/`));
}
startServer().catch((error) => { console.error("Unable to start server:", error); process.exitCode = 1; });
