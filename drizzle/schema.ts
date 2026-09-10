import { int, mediumtext, mysqlEnum, mysqlTable, timestamp, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: mediumtext("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

/**
 * One durable record per student. The game state is kept as JSON text so the
 * browser and the local-network server share the same shape without losing
 * future fields when the game evolves. Drawings use MEDIUMTEXT because they
 * may arrive as data URLs before a future storage migration.
 */
export const students = mysqlTable("students", {
  id: varchar("id", { length: 96 }).primaryKey(),
  name: varchar("name", { length: 80 }).notNull(),
  normalizedName: varchar("normalizedName", { length: 80 }).notNull().unique(),
  profile: mediumtext("profile").notNull(),
  completions: mediumtext("completions").notNull(),
  worldApprovals: mediumtext("worldApprovals").notNull(),
  answers: mediumtext("answers").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Student = typeof students.$inferSelect;
export type InsertStudent = typeof students.$inferInsert;
