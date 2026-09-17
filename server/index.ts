import express from "express";
import { createServer } from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);
  const DEFAULT_TEACHER_PASSWORD = "7391846205";
  const LEGACY_TEACHER_PASSWORD = "professor";
  const classroomFile = path.resolve(__dirname, "..", ".local-data", "students.json");
  const teacherFile = path.resolve(__dirname, "..", ".local-data", "teacher.json");
  const supabaseUrl = process.env.SUPABASE_URL?.trim();
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const supabaseEnabled = Boolean(supabaseUrl && supabaseServiceRoleKey);
  const supabaseRequest = async <T>(resource: string, init: RequestInit = {}) => {
    if (!supabaseUrl || !supabaseServiceRoleKey) throw new Error("Supabase credentials are not configured");
    const response = await fetch(`${supabaseUrl.replace(/\/$/, "")}/rest/v1/${resource}`, {
      ...init,
      headers: { apikey: supabaseServiceRoleKey, Authorization: `Bearer ${supabaseServiceRoleKey}`, "Content-Type": "application/json", ...(init.headers ?? {}) },
    });
    if (!response.ok) throw new Error(`Supabase request failed (${response.status}): ${await response.text()}`);
    return response.status === 204 ? null as T : await response.json() as T;
  };
  const readStudents = () => {
    try { return JSON.parse(fs.readFileSync(classroomFile, "utf8")) as Record<string, unknown>; } catch { return {}; }
  };
  const writeStudents = (students: Record<string, unknown>) => {
    fs.mkdirSync(path.dirname(classroomFile), { recursive: true });
    const temporaryFile = `${classroomFile}.tmp`;
    fs.writeFileSync(temporaryFile, JSON.stringify(students, null, 2), "utf8");
    fs.renameSync(temporaryFile, classroomFile);
  };
  const loadStudents = async (): Promise<Record<string, unknown>> => {
    if (!supabaseEnabled) return readStudents();
    const rows = await supabaseRequest<Array<{ id: string; data: Record<string, unknown> }>>("students?select=id,data&order=updated_at.asc");
    return Object.fromEntries(rows.map((row) => [String(row.id), row.data]));
  };
  const saveStudents = async (students: Record<string, unknown>) => {
    if (!supabaseEnabled) return writeStudents(students);
    await supabaseRequest("students", { method: "POST", headers: { Prefer: "resolution=merge-duplicates,return=minimal" }, body: JSON.stringify(Object.values(students).map((student) => ({ id: (student as { id: string }).id, data: student, updated_at: new Date().toISOString() }))) });
  };
  const initializeSupabase = async () => {
    if (!supabaseEnabled) return;
    const existing = await supabaseRequest<Array<{ id: string }>>("students?select=id&limit=1");
    if (!existing.length) console.log("Supabase students table is empty; starting with no local student data.");
    try { if (fs.existsSync(classroomFile)) fs.unlinkSync(classroomFile); } catch { /* Local data is optional when Supabase is active. */ }
    console.log("Persistent student storage: Supabase");
  };
  const clearSessionsOnStartup = async () => {
    const students = await loadStudents();
    let changed = false;
    for (const student of Object.values(students)) {
      if (student && typeof student === "object" && "activeSession" in student) {
        delete (student as Record<string, unknown>).activeSession;
        changed = true;
      }
    }
    if (changed) await saveStudents(students);
  };
  const readTeacherPassword = () => {
    try {
      const data = JSON.parse(fs.readFileSync(teacherFile, "utf8")) as { password?: string };
      if (!data.password) return DEFAULT_TEACHER_PASSWORD;
      // Migrate the password used by versions before the documented default.
      // Do not overwrite a password that the teacher has configured explicitly.
      if (data.password === LEGACY_TEACHER_PASSWORD) {
        writeTeacherPassword(DEFAULT_TEACHER_PASSWORD);
        return DEFAULT_TEACHER_PASSWORD;
      }
      return data.password;
    } catch {
      return DEFAULT_TEACHER_PASSWORD;
    }
  };
  const writeTeacherPassword = (password: string) => {
    fs.mkdirSync(path.dirname(teacherFile), { recursive: true });
    fs.writeFileSync(teacherFile, JSON.stringify({ password }, null, 2), "utf8");
  };

  app.use(express.json({ limit: "8mb" }));
  app.post("/api/teacher/authorize", (req, res) => {
    const password = String(req.body?.password ?? "");
    return password === readTeacherPassword() ? res.json({ ok: true }) : res.status(401).json({ error: "Senha não reconhecida." });
  });
  app.put("/api/teacher/password", (req, res) => {
    const current = String(req.body?.current ?? "");
    const next = String(req.body?.next ?? "");
    if (current !== readTeacherPassword()) return res.status(401).json({ error: "A senha atual não confere." });
    if (next.trim().length < 6) return res.status(400).json({ error: "A nova senha precisa ter pelo menos 6 caracteres." });
    writeTeacherPassword(next);
    return res.json({ ok: true });
  });
  const publicStudent = (student: unknown) => {
    const { activeSession: _activeSession, ...safeStudent } = student as Record<string, unknown>;
    return safeStudent;
  };
  app.get("/api/students", async (_req, res) => res.json(Object.values(await loadStudents()).map(publicStudent)));
  app.get("/api/students/:id", async (req, res) => {
    const student = (await loadStudents())[req.params.id];
    return student ? res.json(publicStudent(student)) : res.status(404).json({ error: "Student not found" });
  });
  const normalizeStudentName = (name: string) => name.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, " ").toLocaleLowerCase("pt-BR");
  const sessionIsActive = (student: unknown) => {
    const session = (student as { activeSession?: { token?: string; lastSeen?: number } } | undefined)?.activeSession;
    return Boolean(session?.token && session.lastSeen && Date.now() - session.lastSeen < 120000);
  };
  const createSession = (student: Record<string, unknown>, token: string) => {
    student.activeSession = { token, lastSeen: Date.now() };
  };
  app.post("/api/students", async (req, res) => {
    const payload = req.body as { id?: string; profile?: unknown; completions?: unknown; worldApprovals?: unknown; answers?: unknown; sessionToken?: string; teacherOverride?: boolean };
    if (!payload.id || !payload.profile) return res.status(400).json({ error: "Student id and profile are required" });
    const students = await loadStudents();
    const incomingName = normalizeStudentName(String((payload.profile as { name?: string }).name ?? ""));
    const duplicate = Object.values(students).find((student) => {
      const item = student as { id?: string; profile?: { name?: string } };
      return item.id !== payload.id && normalizeStudentName(String(item.profile?.name ?? "")) === incomingName;
    });
    if (duplicate) return res.status(409).json({ error: "Já existe um aluno com esse nome." });
    const existing = students[payload.id] as Record<string, unknown> | undefined;
    const active = existing?.activeSession as { token?: string; lastSeen?: number } | undefined;
    if (existing && sessionIsActive(existing) && active?.token !== payload.sessionToken && !payload.teacherOverride) return res.status(409).json({ error: "Este aluno já está em jogo em outro dispositivo." });
    const record = { ...(existing ?? {}), id: payload.id, profile: payload.profile, completions: payload.completions ?? {}, worldApprovals: payload.worldApprovals ?? {}, answers: payload.answers ?? [], updatedAt: new Date().toISOString() } as Record<string, unknown>;
    if (payload.sessionToken) createSession(record, payload.sessionToken);
    students[payload.id] = record;
    await saveStudents(students);
    return res.json({ ok: true });
  });
  app.post("/api/students/:id/session", async (req, res) => {
    const students = await loadStudents();
    const student = students[req.params.id] as Record<string, unknown> | undefined;
    const token = String(req.body?.sessionToken ?? "");
    if (!student) return res.status(404).json({ error: "Aluno não encontrado." });
    const active = student.activeSession as { token?: string } | undefined;
    if (!token) return res.status(400).json({ error: "Sessão inválida." });
    if (sessionIsActive(student) && active?.token !== token) return res.status(409).json({ error: "Este aluno já está em jogo em outro dispositivo." });
    createSession(student, token);
    await saveStudents(students);
    return res.json({ ok: true });
  });
  app.delete("/api/students/:id/session", async (req, res) => {
    const students = await loadStudents();
    const student = students[req.params.id] as Record<string, unknown> | undefined;
    const token = String(req.body?.sessionToken ?? "");
    if (!student) return res.status(404).json({ error: "Aluno não encontrado." });
    const active = student.activeSession as { token?: string } | undefined;
    if (active?.token === token) { delete student.activeSession; await saveStudents(students); }
    return res.json({ ok: true });
  });
  app.delete("/api/students/:id", async (req, res) => {
    const students = await loadStudents();
    const student = students[req.params.id] as { profile?: { name?: string } } | undefined;
    const confirmation = normalizeStudentName(String(req.body?.confirmName ?? ""));
    if (!student) return res.status(404).json({ error: "Aluno não encontrado." });
    if (!confirmation || confirmation !== normalizeStudentName(String(student.profile?.name ?? ""))) {
      return res.status(400).json({ error: "A confirmação do nome não confere." });
    }
    delete students[req.params.id];
    if (supabaseEnabled) await supabaseRequest(`students?id=eq.${encodeURIComponent(req.params.id)}`, { method: "DELETE", headers: { Prefer: "return=minimal" } });
    else writeStudents(students);
    return res.json({ ok: true });
  });
  app.use("/manus-storage", async (req, res) => {
    const key = req.path.replace(/^\//, "");
    if (!key) return res.status(400).send("Missing storage key");
    const forgeBaseUrl = (process.env.BUILT_IN_FORGE_API_URL || "").replace(/\/+$/, "");
    const forgeKey = process.env.BUILT_IN_FORGE_API_KEY;
    if (!forgeBaseUrl || !forgeKey) return res.status(500).send("Storage proxy not configured");
    try {
      const forgeUrl = new URL("v1/storage/presign/get", forgeBaseUrl + "/");
      forgeUrl.searchParams.set("path", key);
      const forgeResponse = await fetch(forgeUrl, { headers: { Authorization: `Bearer ${forgeKey}` } });
      if (!forgeResponse.ok) return res.status(502).send("Storage backend error");
      const { url } = (await forgeResponse.json()) as { url?: string };
      if (!url) return res.status(502).send("Empty signed URL");
      return res.redirect(307, url);
    } catch {
      return res.status(502).send("Storage proxy error");
    }
  });
  // Serve static files from dist/public in production
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  // Handle client-side routing - serve index.html for all routes
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3000;

  // A server restart ends every previous in-memory session. Persisted student
  // profiles must not remain blocked because a browser closed unexpectedly.
  await initializeSupabase();
  await clearSessionsOnStartup();
  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
