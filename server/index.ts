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
  const classroomFile = path.resolve(__dirname, "..", ".local-data", "students.json");
  const teacherFile = path.resolve(__dirname, "..", ".local-data", "teacher.json");
  const readStudents = () => {
    try { return JSON.parse(fs.readFileSync(classroomFile, "utf8")) as Record<string, unknown>; } catch { return {}; }
  };
  const writeStudents = (students: Record<string, unknown>) => {
    fs.mkdirSync(path.dirname(classroomFile), { recursive: true });
    fs.writeFileSync(classroomFile, JSON.stringify(students, null, 2), "utf8");
  };
  const readTeacherPassword = () => {
    try {
      const data = JSON.parse(fs.readFileSync(teacherFile, "utf8")) as { password?: string };
      return data.password || "professor";
    } catch {
      return "professor";
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
  app.get("/api/students", (_req, res) => res.json(Object.values(readStudents())));
  app.get("/api/students/:id", (req, res) => {
    const student = readStudents()[req.params.id];
    return student ? res.json(student) : res.status(404).json({ error: "Student not found" });
  });
  const normalizeStudentName = (name: string) => name.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, " ").toLocaleLowerCase("pt-BR");
  app.post("/api/students", (req, res) => {
    const payload = req.body as { id?: string; profile?: unknown; completions?: unknown; worldApprovals?: unknown; answers?: unknown };
    if (!payload.id || !payload.profile) return res.status(400).json({ error: "Student id and profile are required" });
    const students = readStudents();
    const incomingName = normalizeStudentName(String((payload.profile as { name?: string }).name ?? ""));
    const duplicate = Object.values(students).find((student) => {
      const item = student as { id?: string; profile?: { name?: string } };
      return item.id !== payload.id && normalizeStudentName(String(item.profile?.name ?? "")) === incomingName;
    });
    if (duplicate) return res.status(409).json({ error: "Já existe um aluno com esse nome." });
    students[payload.id] = { id: payload.id, profile: payload.profile, completions: payload.completions ?? {}, worldApprovals: payload.worldApprovals ?? {}, answers: payload.answers ?? [], updatedAt: new Date().toISOString() };
    writeStudents(students);
    return res.json({ ok: true });
  });
  app.delete("/api/students/:id", (req, res) => {
    const students = readStudents();
    const student = students[req.params.id] as { profile?: { name?: string } } | undefined;
    const confirmation = normalizeStudentName(String(req.body?.confirmName ?? ""));
    if (!student) return res.status(404).json({ error: "Aluno não encontrado." });
    if (!confirmation || confirmation !== normalizeStudentName(String(student.profile?.name ?? ""))) {
      return res.status(400).json({ error: "A confirmação do nome não confere." });
    }
    delete students[req.params.id];
    writeStudents(students);
    return res.json({ ok: true });
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

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
