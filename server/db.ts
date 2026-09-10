import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertStudent, InsertUser, Student, students, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// TODO: add feature queries here as your schema grows.


export type StudentPayload = {
  id: string;
  profile: Record<string, unknown>;
  completions?: Record<string, unknown>;
  worldApprovals?: Record<string, unknown>;
  answers?: unknown[];
};

export function normalizeStudentName(name: string) {
  return name.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").trim().replace(/\s+/g, " ").toLocaleLowerCase("pt-BR");
}

function parseJson<T>(value: string, fallback: T): T {
  try { return JSON.parse(value) as T; } catch { return fallback; }
}

export function studentToPayload(row: Student): StudentPayload & { updatedAt: string } {
  return {
    id: row.id,
    profile: parseJson(row.profile, {}),
    completions: parseJson(row.completions, {}),
    worldApprovals: parseJson(row.worldApprovals, {}),
    answers: parseJson(row.answers, []),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function listStudents() {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(students).orderBy(desc(students.updatedAt));
  return rows.map(studentToPayload);
}

export async function getStudentById(id: string) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(students).where(eq(students.id, id)).limit(1);
  return rows[0] ? studentToPayload(rows[0]) : undefined;
}

export async function upsertStudent(payload: StudentPayload) {
  const db = await getDb();
  if (!db) return null;
  const name = String(payload.profile.name ?? "").trim().replace(/\s+/g, " ").slice(0, 80);
  if (!payload.id || !name) throw new Error("STUDENT_NAME_REQUIRED");
  const normalizedName = normalizeStudentName(name).slice(0, 80);
  const existing = await db.select().from(students).where(eq(students.normalizedName, normalizedName)).limit(1);
  if (existing[0] && existing[0].id !== payload.id) throw new Error("STUDENT_NAME_TAKEN");
  const values: InsertStudent = {
    id: payload.id.slice(0, 96),
    name,
    normalizedName,
    profile: JSON.stringify({ ...payload.profile, name }),
    completions: JSON.stringify(payload.completions ?? {}),
    worldApprovals: JSON.stringify(payload.worldApprovals ?? {}),
    answers: JSON.stringify(payload.answers ?? []),
  };
  await db.insert(students).values(values).onDuplicateKeyUpdate({
    set: {
      name: values.name,
      normalizedName: values.normalizedName,
      profile: values.profile,
      completions: values.completions,
      worldApprovals: values.worldApprovals,
      answers: values.answers,
      updatedAt: new Date(),
    },
  });
  return getStudentById(values.id);
}

export async function deleteStudentById(id: string) {
  const db = await getDb();
  if (!db) return false;
  const result = await db.delete(students).where(eq(students.id, id));
  return Number(result[0]?.affectedRows ?? 0) > 0;
}
