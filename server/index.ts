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
  const readStudents = () => {
    try { return JSON.parse(fs.readFileSync(classroomFile, "utf8")) as Record<string, unknown>; } catch { return {}; }
  };
  const writeStudents = (students: Record<string, unknown>) => {
    fs.mkdirSync(path.dirname(classroomFile), { recursive: true });
    fs.writeFileSync(classroomFile, JSON.stringify(students, null, 2), "utf8");
  };

  app.use(express.json({ limit: "8mb" }));
  app.get("/api/students", (_req, res) => res.json(Object.values(readStudents())));
  app.get("/api/students/:id", (req, res) => {
    const student = readStudents()[req.params.id];
    return student ? res.json(student) : res.status(404).json({ error: "Student not found" });
  });
  app.post("/api/students", (req, res) => {
    const payload = req.body as { id?: string; profile?: unknown; completions?: unknown; worldApprovals?: unknown; answers?: unknown };
    if (!payload.id || !payload.profile) return res.status(400).json({ error: "Student id and profile are required" });
    const students = readStudents();
    students[payload.id] = { id: payload.id, profile: payload.profile, completions: payload.completions ?? {}, worldApprovals: payload.worldApprovals ?? {}, answers: payload.answers ?? [], updatedAt: new Date().toISOString() };
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
