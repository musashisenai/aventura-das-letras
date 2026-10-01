import express, { type NextFunction, type Request, type Response } from "express";
import { createServer } from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import os from "node:os";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const execFileAsync = promisify(execFile);

type Profile = { studentId?: string; sessionToken?: string; placementCompleted?: boolean; name: string; partner?: string; currentWorld: number; recommendedWorld?: number; [key: string]: unknown };
type StoredStudent = { id: string; name: string; status: { placementCompleted: boolean; currentWorld: number; recommendedWorld: number; activeScreen: string; activeWorld: number; activePhase: number; questionIndex: number }; save: { profile: Profile; completions: unknown; worldApprovals: unknown; answers: unknown; gameState: unknown }; activeSession?: { token?: string; lastSeen?: number }; sessionVersion?: number; updatedAt: string };
type ClassroomDatabase = { students: Record<string, StoredStudent>; settings: Record<string, string> };

async function startServer() {
  const app = express();
  const server = createServer(app);
  const DEFAULT_TEACHER_PASSWORD = "7391846205";
  const LEGACY_TEACHER_PASSWORD = "professor";
  const FINAL_DATABASE_CLEAR_PASSWORD = "Don't forget 3. Oct. 11";
  const databaseFile = path.resolve(__dirname, "..", "database", "classroom.json");
  const repositoryRoot = path.resolve(__dirname, "..");
  const legacyStudentsFile = path.resolve(__dirname, "..", ".local-data", "students.json");
  const legacyTeacherFile = path.resolve(__dirname, "..", ".local-data", "teacher.json");
  const normalizeStudentName = (name: string) => name.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, " ").toLocaleLowerCase("pt-BR");
  const initialProfile = (name: string, id: string): Profile => ({ placementCompleted: false, studentId: id, name, partner: "Lumi", currentWorld: 0, recommendedWorld: 0, coins: 20, xp: 0, eggs: 0, eggCollection: [], petLevel: 1, petCare: 30, petName: "Faísca", petStage: "filhote", petSpecies: "raposa", audioEnabled: true });
  const serverIpv4Addresses = () => Object.values(os.networkInterfaces()).flatMap((entries) => (entries ?? []).filter((entry) => entry.family === "IPv4" && !entry.internal).map((entry) => entry.address));

  fs.mkdirSync(path.dirname(databaseFile), { recursive: true });
  const emptyDatabase = (): ClassroomDatabase => ({ students: {}, settings: {} });
  const toStoredStudent = (id: string, raw: Partial<StoredStudent> & Record<string, unknown>): StoredStudent => {
    if (raw.name && raw.status && raw.save) return raw as StoredStudent;
    const profile = (raw.profile ?? initialProfile(String((raw as { name?: string }).name ?? "Aluno"), id)) as Profile;
    const gameState = (raw.gameState ?? {}) as Record<string, unknown>;
    return { id, name: profile.name, status: { placementCompleted: profile.placementCompleted === true, currentWorld: profile.currentWorld ?? 0, recommendedWorld: profile.recommendedWorld ?? profile.currentWorld ?? 0, activeScreen: String(gameState.screen ?? "menu"), activeWorld: Number(gameState.activeWorld ?? profile.currentWorld ?? 0), activePhase: Number(gameState.activePhase ?? 0), questionIndex: Number(gameState.questionIndex ?? 0) }, save: { profile, completions: raw.completions ?? {}, worldApprovals: raw.worldApprovals ?? {}, answers: raw.answers ?? [], gameState: raw.gameState ?? {} }, activeSession: raw.activeSession, updatedAt: String(raw.updatedAt ?? new Date().toISOString()) };
  };
  const readDatabase = (): ClassroomDatabase => {
    try {
      const parsed = JSON.parse(fs.readFileSync(databaseFile, "utf8")) as Partial<ClassroomDatabase>;
      const rawStudents = parsed.students && typeof parsed.students === "object" ? parsed.students as Record<string, Partial<StoredStudent> & Record<string, unknown>> : {};
      return { students: Object.fromEntries(Object.entries(rawStudents).map(([id, student]) => [id, toStoredStudent(id, student)])), settings: parsed.settings && typeof parsed.settings === "object" ? parsed.settings as Record<string, string> : {} };
    } catch { return emptyDatabase(); }
  };
  const sectionsDirectory = path.resolve(__dirname, "..", "database", "sections");
  const writeDatabaseViews = (database: ClassroomDatabase) => {
    fs.mkdirSync(sectionsDirectory, { recursive: true });
    const writeView = (filename: string, value: unknown) => { const temporaryFile = path.join(sectionsDirectory, `${filename}.tmp`); fs.writeFileSync(temporaryFile, `${JSON.stringify(value, null, 2)}\n`, "utf8"); fs.renameSync(temporaryFile, path.join(sectionsDirectory, filename)); };
    writeView("names.json", Object.fromEntries(Object.values(database.students).map((student) => [student.id, { id: student.id, name: student.name }])));
    writeView("statuses.json", Object.fromEntries(Object.values(database.students).map((student) => [student.id, { id: student.id, name: student.name, ...student.status, updatedAt: student.updatedAt }])));
    writeView("saves.json", Object.fromEntries(Object.values(database.students).map((student) => [student.id, { id: student.id, name: student.name, profile: student.save.profile, gameState: student.save.gameState, completions: student.save.completions, worldApprovals: student.save.worldApprovals }])));
    writeView("answers.json", Object.fromEntries(Object.values(database.students).map((student) => [student.id, { id: student.id, name: student.name, answers: student.save.answers }])));
  };
  const writeDatabase = (database: ClassroomDatabase) => { const temporaryFile = `${databaseFile}.tmp`; fs.writeFileSync(temporaryFile, `${JSON.stringify(database, null, 2)}\n`, "utf8"); fs.renameSync(temporaryFile, databaseFile); writeDatabaseViews(database); };
  const migrateLegacyData = () => {
    const database = readDatabase();
    if (Object.keys(database.students).length || !fs.existsSync(legacyStudentsFile)) return database;
    try { const students = JSON.parse(fs.readFileSync(legacyStudentsFile, "utf8")) as Record<string, Record<string, unknown>>; database.students = Object.fromEntries(Object.entries(students).map(([id, student]) => [id, toStoredStudent(id, student)])); writeDatabase(database); console.log(`Migrados ${Object.keys(students).length} perfil(is) para database/classroom.json.`); } catch (error) { console.error("Não foi possível migrar students.json:", error); }
    return database;
  };
  const getTeacherPassword = (database: ClassroomDatabase) => {
    if (database.settings.teacherPassword) return database.settings.teacherPassword;
    let password = DEFAULT_TEACHER_PASSWORD;
    try { const legacy = JSON.parse(fs.readFileSync(legacyTeacherFile, "utf8")) as { password?: string }; if (legacy.password) password = legacy.password === LEGACY_TEACHER_PASSWORD ? DEFAULT_TEACHER_PASSWORD : legacy.password; } catch { /* primeiro uso */ }
    database.settings.teacherPassword = password; writeDatabase(database); return password;
  };
  const toApiStudent = (student: StoredStudent) => ({ id: student.id, profile: { ...student.save.profile, name: student.name, studentId: student.id }, sessionVersion: student.sessionVersion ?? 0, completions: student.save.completions, worldApprovals: student.save.worldApprovals, answers: student.save.answers, gameState: student.save.gameState, updatedAt: student.updatedAt });
  const fromApiStudent = (id: string, payload: Record<string, unknown>, existing?: StoredStudent): StoredStudent => {
    const profile = (payload.profile ?? existing?.save.profile ?? initialProfile(String(payload.name ?? existing?.name ?? "Aluno"), id)) as Profile;
    const gameState = (payload.gameState ?? existing?.save.gameState ?? {}) as Record<string, unknown>;
    return { id, name: String(profile.name ?? existing?.name ?? "Aluno"), status: { placementCompleted: profile.placementCompleted === true, currentWorld: Number(profile.currentWorld ?? 0), recommendedWorld: Number(profile.recommendedWorld ?? profile.currentWorld ?? 0), activeScreen: String(gameState.screen ?? "menu"), activeWorld: Number(gameState.activeWorld ?? profile.currentWorld ?? 0), activePhase: Number(gameState.activePhase ?? 0), questionIndex: Number(gameState.questionIndex ?? 0) }, save: { profile, completions: payload.completions ?? existing?.save.completions ?? {}, worldApprovals: payload.worldApprovals ?? existing?.save.worldApprovals ?? {}, answers: payload.answers ?? existing?.save.answers ?? [], gameState }, activeSession: existing?.activeSession, sessionVersion: existing?.sessionVersion ?? 0, updatedAt: new Date().toISOString() };
  };
  const clearSessionsOnStartup = () => { const database = readDatabase(); let changed = false; for (const student of Object.values(database.students)) if (student.activeSession) { delete student.activeSession; changed = true; } if (changed) writeDatabase(database); };
  let syncInProgress = false;
  const syncDatabaseToGit = async () => {
    if (syncInProgress) return { ok: false, message: "Já existe uma sincronização em andamento." };
    syncInProgress = true;
    try {
      await execFileAsync("git", ["add", "--", "database/classroom.json"], { cwd: repositoryRoot, timeout: 30000 });
      let stagedChanges = true;
      try { await execFileAsync("git", ["diff", "--cached", "--quiet", "--", "database/classroom.json"], { cwd: repositoryRoot, timeout: 30000 }); stagedChanges = false; } catch { /* há dados novos para commit */ }
      if (stagedChanges) await execFileAsync("git", ["-c", "user.name=Aventura das Letras", "-c", "user.email=aventura-das-letras@local.invalid", "commit", "-m", "Atualizar banco dos alunos"], { cwd: repositoryRoot, timeout: 30000 });
      await execFileAsync("git", ["fetch", "origin", "main"], { cwd: repositoryRoot, timeout: 60000 });
      let localCommit = (await execFileAsync("git", ["rev-parse", "HEAD"], { cwd: repositoryRoot, timeout: 30000 })).stdout.trim();
      let remoteCommit = (await execFileAsync("git", ["rev-parse", "origin/main"], { cwd: repositoryRoot, timeout: 30000 })).stdout.trim();
      let uploaded = false;
      if (localCommit !== remoteCommit) {
        try { await execFileAsync("git", ["merge-base", "--is-ancestor", "origin/main", "HEAD"], { cwd: repositoryRoot, timeout: 30000 }); }
        catch { await execFileAsync("git", ["pull", "--rebase", "--autostash", "origin", "main"], { cwd: repositoryRoot, timeout: 120000 }); }
        await execFileAsync("git", ["push", "origin", "main"], { cwd: repositoryRoot, timeout: 120000 });
        uploaded = true;
        localCommit = (await execFileAsync("git", ["rev-parse", "HEAD"], { cwd: repositoryRoot, timeout: 30000 })).stdout.trim();
        remoteCommit = (await execFileAsync("git", ["ls-remote", "origin", "refs/heads/main"], { cwd: repositoryRoot, timeout: 60000 })).stdout.trim().split(/\s+/)[0];
      }
      if (localCommit !== remoteCommit) return { ok: false, message: "O banco foi salvo localmente, mas a confirmação do GitHub não coincidiu com o commit deste computador." };
      return { ok: true, message: stagedChanges || uploaded ? "Banco salvo e sincronizado com o GitHub." : "O banco já estava sincronizado com o GitHub." };
    } catch (error) {
      const detail = error as { stderr?: string; message?: string };
      const reason = String(detail.stderr ?? detail.message ?? "erro desconhecido").trim().split("\n").slice(-1)[0];
      console.error("Sincronização falhou:", error);
      return { ok: false, message: `O banco foi salvo localmente, mas não subiu para o GitHub: ${reason}` };
    } finally { syncInProgress = false; }
  };

  const database = migrateLegacyData(); if (!fs.existsSync(databaseFile)) writeDatabase(database); getTeacherPassword(database); clearSessionsOnStartup(); writeDatabaseViews(readDatabase());
  app.use(express.json({ limit: "8mb" }));
  const asyncRoute = (handler: express.RequestHandler): express.RequestHandler => (req, res, next) => { Promise.resolve(handler(req, res, next)).catch(next); };
  const requireTeacher = (req: express.Request) => { const database = readDatabase(); return String(req.body?.password ?? "") === getTeacherPassword(database); };
  const sessionIsActive = (student: StoredStudent) => Boolean(student.activeSession?.token && student.activeSession.lastSeen && Date.now() - student.activeSession.lastSeen < 120000);
  const createSession = (student: StoredStudent, token: string) => { student.activeSession = { token, lastSeen: Date.now() }; };

  app.post("/api/teacher/authorize", (req, res) => { const database = readDatabase(); return String(req.body?.password ?? "") === getTeacherPassword(database) ? res.json({ ok: true }) : res.status(401).json({ error: "Senha não reconhecida." }); });
  app.put("/api/teacher/password", (req, res) => { const database = readDatabase(); const current = String(req.body?.current ?? ""); const next = String(req.body?.next ?? ""); if (current !== getTeacherPassword(database)) return res.status(401).json({ error: "A senha atual não confere." }); if (next.trim().length < 6) return res.status(400).json({ error: "A nova senha precisa ter pelo menos 6 caracteres." }); database.settings.teacherPassword = next; writeDatabase(database); return res.json({ ok: true }); });
  app.post("/api/teacher/database/sync", asyncRoute(async (req, res) => { if (!requireTeacher(req)) return res.status(401).json({ error: "Senha não reconhecida." }); const result = await syncDatabaseToGit(); return result.ok ? res.json(result) : res.status(503).json(result); }));
  app.post("/api/teacher/students/:id/reset", asyncRoute(async (req, res) => { if (!requireTeacher(req)) return res.status(401).json({ error: "Senha não reconhecida." }); const database = readDatabase(); const student = database.students[req.params.id]; if (!student) return res.status(404).json({ error: "Aluno não encontrado." }); const profile = initialProfile(student.name, student.id); const reset = fromApiStudent(student.id, { profile, completions: {}, worldApprovals: {}, answers: [], gameState: { screen: "placement", placementIndex: 0, placementScore: 0, placementAttempts: 0, placementResults: [], placementQueue: [] } }); if (student.activeSession) reset.activeSession = { token: `reset-${Date.now()}`, lastSeen: Date.now() }; database.students[student.id] = reset; writeDatabase(database); return res.json({ ok: true, student: toApiStudent(database.students[student.id]) }); }));
  app.put("/api/teacher/students/:id", asyncRoute(async (req, res) => { if (!requireTeacher(req)) return res.status(401).json({ error: "Senha não reconhecida." }); const database = readDatabase(); const student = database.students[req.params.id]; const name = String(req.body?.name ?? "").trim(); if (!student) return res.status(404).json({ error: "Aluno não encontrado." }); if (!name) return res.status(400).json({ error: "Informe um nome." }); const duplicate = Object.values(database.students).find((item) => item.id !== student.id && normalizeStudentName(item.name) === normalizeStudentName(name)); if (duplicate) return res.status(409).json({ error: "Já existe um aluno com esse nome." }); student.name = name; student.save.profile.name = name; if (student.activeSession) student.activeSession = { token: `renamed-${Date.now()}`, lastSeen: Date.now() }; student.updatedAt = new Date().toISOString(); writeDatabase(database); return res.json({ ok: true, student: toApiStudent(student) }); }));
  app.post("/api/teacher/database/clear", asyncRoute(async (req, res) => { const serverIp = String(req.body?.serverIp ?? "").trim(); const finalPassword = String(req.body?.finalPassword ?? ""); if (!requireTeacher(req)) return res.status(400).json({ error: "A senha do professor não confere." }); if (!serverIpv4Addresses().includes(serverIp)) return res.status(400).json({ error: "O IP informado não corresponde ao computador que está executando o servidor." }); if (finalPassword !== FINAL_DATABASE_CLEAR_PASSWORD) return res.status(400).json({ error: "A senha final não confere. O banco não foi alterado." }); const database = readDatabase(); database.students = {}; writeDatabase(database); return res.json({ ok: true, message: "Todos os alunos, status e saves foram removidos." }); }));
  app.post("/api/teacher/sessions/logout-all", asyncRoute(async (req, res) => { if (!requireTeacher(req)) return res.status(401).json({ error: "Senha não reconhecida." }); const database = readDatabase(); let loggedOut = 0; for (const student of Object.values(database.students)) { if (sessionIsActive(student)) loggedOut += 1; student.sessionVersion = (student.sessionVersion ?? 0) + 1; delete student.activeSession; } writeDatabase(database); return res.json({ ok: true, loggedOut, affected: Object.keys(database.students).length }); }));
  app.get("/api/students", asyncRoute(async (_req, res) => res.json(Object.values(readDatabase().students).map(toApiStudent))));
  app.get("/api/students/:id", asyncRoute(async (req, res) => { const student = readDatabase().students[req.params.id]; return student ? res.json(toApiStudent(student)) : res.status(404).json({ error: "Student not found" }); }));
  app.post("/api/students", asyncRoute(async (req, res) => {
    const payload = req.body as Record<string, unknown>; const id = String(payload.id ?? ""); if (!id || !payload.profile) return res.status(400).json({ error: "Student id and profile are required" }); const database = readDatabase(); const existing = database.students[id]; const profile = payload.profile as Profile; const incomingName = normalizeStudentName(String(profile.name ?? "")); const duplicate = Object.values(database.students).find((student) => student.id !== id && normalizeStudentName(student.name) === incomingName); if (duplicate) return res.status(409).json({ error: "Já existe um aluno com esse nome." }); const sessionVersion = Number(payload.sessionVersion ?? 0); if (existing && payload.sessionToken && (!Number.isSafeInteger(sessionVersion) || sessionVersion !== (existing.sessionVersion ?? 0))) return res.status(401).json({ error: "A sessão foi encerrada. Entre novamente." }); if (existing && sessionIsActive(existing) && existing.activeSession?.token !== payload.sessionToken && !payload.teacherOverride) return res.status(409).json({ error: "Este aluno já está em jogo em outro dispositivo." }); const record = fromApiStudent(id, payload, existing); if (payload.sessionToken) createSession(record, String(payload.sessionToken)); database.students[id] = record; writeDatabase(database); return res.json({ ok: true });
  }));
  app.post("/api/students/:id/session", asyncRoute(async (req, res) => { const database = readDatabase(); const student = database.students[req.params.id]; const token = String(req.body?.sessionToken ?? ""); const sessionVersion = Number(req.body?.sessionVersion ?? 0); if (!student) return res.status(404).json({ error: "Aluno não encontrado." }); if (!token) return res.status(400).json({ error: "Sessão inválida." }); if (!Number.isSafeInteger(sessionVersion) || sessionVersion !== (student.sessionVersion ?? 0)) return res.status(401).json({ error: "A sessão foi encerrada. Entre novamente." }); if (sessionIsActive(student) && student.activeSession?.token !== token) return res.status(409).json({ error: "Este aluno já está em jogo em outro dispositivo." }); createSession(student, token); writeDatabase(database); return res.json({ ok: true }); }));
  app.delete("/api/students/:id/session", asyncRoute(async (req, res) => { const database = readDatabase(); const student = database.students[req.params.id]; const token = String(req.body?.sessionToken ?? ""); if (!student) return res.status(404).json({ error: "Aluno não encontrado." }); if (student.activeSession?.token === token) { delete student.activeSession; writeDatabase(database); } return res.json({ ok: true }); }));
  app.delete("/api/students/:id", asyncRoute(async (req, res) => { if (!requireTeacher(req)) return res.status(401).json({ error: "Senha não reconhecida." }); const database = readDatabase(); const student = database.students[req.params.id]; const confirmation = normalizeStudentName(String(req.body?.confirmName ?? "")); if (!student) return res.status(404).json({ error: "Aluno não encontrado." }); if (!confirmation || confirmation !== normalizeStudentName(student.name)) return res.status(400).json({ error: "A confirmação do nome não confere." }); delete database.students[req.params.id]; writeDatabase(database); return res.json({ ok: true }); }));
  app.use("/manus-storage", asyncRoute(async (req, res) => { const key = req.path.replace(/^\//, ""); if (!key) return res.status(400).send("Missing storage key"); const forgeBaseUrl = (process.env.BUILT_IN_FORGE_API_URL || "").replace(/\/+$/, ""); const forgeKey = process.env.BUILT_IN_FORGE_API_KEY; if (!forgeBaseUrl || !forgeKey) return res.status(500).send("Storage proxy not configured"); try { const forgeUrl = new URL("v1/storage/presign/get", forgeBaseUrl + "/"); forgeUrl.searchParams.set("path", key); const forgeResponse = await fetch(forgeUrl, { headers: { Authorization: `Bearer ${forgeKey}` } }); if (!forgeResponse.ok) return res.status(502).send("Storage backend error"); const { url } = await forgeResponse.json() as { url?: string }; if (!url) return res.status(502).send("Empty signed URL"); return res.redirect(307, url); } catch { return res.status(502).send("Storage proxy error"); } }));
  app.use((error: unknown, _req: Request, res: Response, next: NextFunction) => { console.error("Unhandled request error", error); if (res.headersSent) return next(error); return res.status(503).json({ error: "O servidor não conseguiu concluir a solicitação." }); });
  const staticPath = process.env.NODE_ENV === "production" ? path.resolve(__dirname, "public") : path.resolve(__dirname, "..", "dist", "public"); app.use(express.static(staticPath)); app.get("*", (_req, res) => res.sendFile(path.join(staticPath, "index.html")));
  const port = Number(process.env.PORT || 3000); const autosyncTimer = setInterval(() => { void syncDatabaseToGit(); }, 15 * 60 * 1000); autosyncTimer.unref(); server.listen(port, "0.0.0.0", () => { console.log(`Servidor do jogo rodando em http://localhost:${port}/`); const networkAddresses = Object.values(os.networkInterfaces()).flatMap((interfaces) => (interfaces ?? []).filter((item) => item.family === "IPv4" && !item.internal).map((item) => `http://${item.address}:${port}/`)); console.log(networkAddresses.length ? `Acesso pela rede local: ${networkAddresses.join(" | ")}` : "Acesso pela rede local: não foi encontrado um IPv4 ativo; verifique a rede e o firewall."); });
}

startServer().catch(console.error);
