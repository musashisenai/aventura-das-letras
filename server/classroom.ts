import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import type { Express, Request, Response } from "express";
import { deleteStudentById, getStudentById, getDb, listStudents, normalizeStudentName, upsertStudent, type StudentPayload } from "./db";

type StoredStudent = StudentPayload & { updatedAt: string };
const dataDir = path.resolve(process.cwd(), ".local-data");
const dataFile = path.join(dataDir, "students.json");
const teacherTokens = new Map<string, number>();

function send(res: Response, status: number, payload: unknown) {
  res.status(status).json(payload);
}

function readFallback(): Record<string, StoredStudent> {
  try { return JSON.parse(fs.readFileSync(dataFile, "utf8")) as Record<string, StoredStudent>; } catch { return {}; }
}

function writeFallback(students: Record<string, StoredStudent>) {
  fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(dataFile, JSON.stringify(students, null, 2), "utf8");
}

function teacherPassword() {
  return process.env.TEACHER_PASSWORD || process.env.TEACHER_DELETE_SECRET || "professor";
}

export function deleteConfirmationFor(name: string) {
  return `EXCLUIR ${name.trim()}`;
}

function getBearerToken(req: Request) {
  const value = req.headers.authorization;
  return value?.startsWith("Bearer ") ? value.slice("Bearer ".length) : "";
}

function validTeacherToken(token: string) {
  const expiresAt = teacherTokens.get(token);
  if (!expiresAt || expiresAt < Date.now()) {
    teacherTokens.delete(token);
    return false;
  }
  return true;
}

function studentName(payload: StudentPayload) {
  return String(payload.profile?.name ?? "").trim().replace(/\s+/g, " ").slice(0, 80);
}

export function registerClassroomRoutes(app: Express) {
  app.post("/api/teacher/verify", (req, res) => {
    if (String(req.body?.password ?? "") !== teacherPassword()) return send(res, 401, { error: "TEACHER_PASSWORD_INVALID" });
    const token = crypto.randomBytes(32).toString("hex");
    teacherTokens.set(token, Date.now() + 8 * 60 * 60 * 1000);
    return send(res, 200, { token, expiresIn: 8 * 60 * 60 });
  });

  app.get("/api/students/name-available", async (req, res) => {
    const name = String(req.query.name ?? "").trim();
    const excludeId = String(req.query.excludeId ?? "");
    if (!name) return send(res, 400, { error: "STUDENT_NAME_REQUIRED" });
    const normalized = normalizeStudentName(name);
    const db = await getDb();
    if (db) {
      const students = await listStudents() ?? [];
      const taken = students.some((student) => student.id !== excludeId && normalizeStudentName(String(student.profile.name ?? "")) === normalized);
      return send(res, 200, { available: !taken });
    }
    const taken = Object.values(readFallback()).some((student) => student.id !== excludeId && normalizeStudentName(String(student.profile.name ?? "")) === normalized);
    return send(res, 200, { available: !taken });
  });

  app.get("/api/students", async (_req, res) => {
    const dbStudents = await listStudents();
    if (dbStudents) return send(res, 200, dbStudents);
    return send(res, 200, Object.values(readFallback()));
  });

  app.get("/api/students/:id", async (req, res) => {
    const dbStudent = await getStudentById(req.params.id);
    if (dbStudent) return send(res, 200, dbStudent);
    if (dbStudent === undefined) return send(res, 404, { error: "STUDENT_NOT_FOUND" });
    const fallback = readFallback()[req.params.id];
    return fallback ? send(res, 200, fallback) : send(res, 404, { error: "STUDENT_NOT_FOUND" });
  });

  app.post("/api/students", async (req, res) => {
    const payload = req.body as StudentPayload;
    const name = studentName(payload);
    if (!payload?.id || !name) return send(res, 400, { error: "STUDENT_NAME_REQUIRED" });
    const normalized = normalizeStudentName(name);
    try {
      const db = await getDb();
      if (db) {
        const saved = await upsertStudent({ ...payload, profile: { ...payload.profile, name } });
        return send(res, 200, { ok: true, student: saved });
      }
      const fallback = readFallback();
      const duplicate = Object.values(fallback).find((student) => student.id !== payload.id && normalizeStudentName(String(student.profile.name ?? "")) === normalized);
      if (duplicate) return send(res, 409, { error: "STUDENT_NAME_TAKEN", message: "Este nome já está sendo usado por outro aluno." });
      fallback[payload.id] = { id: payload.id, profile: { ...payload.profile, name }, completions: payload.completions ?? {}, worldApprovals: payload.worldApprovals ?? {}, answers: payload.answers ?? [], updatedAt: new Date().toISOString() };
      writeFallback(fallback);
      return send(res, 200, { ok: true, student: fallback[payload.id] });
    } catch (error) {
      if (error instanceof Error && error.message === "STUDENT_NAME_TAKEN") return send(res, 409, { error: error.message, message: "Este nome já está sendo usado por outro aluno." });
      console.error("[Classroom] Failed to save student", error);
      return send(res, 500, { error: "STUDENT_SAVE_FAILED" });
    }
  });

  app.delete("/api/students/:id", async (req, res) => {
    if (!validTeacherToken(getBearerToken(req))) return send(res, 401, { error: "TEACHER_AUTH_REQUIRED" });
    const existing = await getStudentById(req.params.id);
    const fallback = existing === null ? readFallback()[req.params.id] : undefined;
    const student = existing ?? fallback;
    if (!student) return send(res, 404, { error: "STUDENT_NOT_FOUND" });
    const expected = deleteConfirmationFor(String(student.profile.name ?? ""));
    if (String(req.body?.confirmation ?? "") !== expected) return send(res, 400, { error: "DELETE_CONFIRMATION_INVALID", message: `Digite exatamente: ${expected}` });
    const db = await getDb();
    if (db) await deleteStudentById(req.params.id);
    else {
      const students = readFallback();
      delete students[req.params.id];
      writeFallback(students);
    }
    return send(res, 200, { ok: true });
  });
}
