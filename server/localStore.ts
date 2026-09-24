import mysql, { type Pool, type RowDataPacket } from "mysql2/promise";

export type StudentRecord = Record<string, unknown>;

type QueueRow = RowDataPacket & {
  id: number;
  operation: "upsert" | "delete";
  student_id: string;
  payload: StudentRecord | null;
};

type StudentRow = RowDataPacket & { id: string; data: StudentRecord };
type CountRow = RowDataPacket & { total: number };

const quoteIdentifier = (value: string) => {
  if (!/^[a-zA-Z0-9_]+$/.test(value)) throw new Error(`Invalid MySQL identifier: ${value}`);
  return `\`${value}\``;
};

export async function createLocalStore() {
  const host = process.env.LOCAL_MYSQL_HOST?.trim() || "127.0.0.1";
  const port = Number(process.env.LOCAL_MYSQL_PORT || 3306);
  const user = process.env.LOCAL_MYSQL_USER?.trim() || "root";
  const password = process.env.LOCAL_MYSQL_PASSWORD ?? "";
  const database = process.env.LOCAL_MYSQL_DATABASE?.trim() || "aventura_das_letras";
  const databaseIdentifier = quoteIdentifier(database);

  const bootstrap = await mysql.createConnection({ host, port, user, password });
  await bootstrap.query(`CREATE DATABASE IF NOT EXISTS ${databaseIdentifier} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await bootstrap.end();

  const pool: Pool = mysql.createPool({
    host,
    port,
    user,
    password,
    database,
    waitForConnections: true,
    connectionLimit: 5,
    charset: "utf8mb4",
  });

  await pool.query(`
    CREATE TABLE IF NOT EXISTS students (
      id VARCHAR(191) PRIMARY KEY,
      name_key VARCHAR(191) NOT NULL DEFAULT '',
      data JSON NOT NULL,
      updated_at DATETIME(3) NOT NULL,
      INDEX students_updated_at_idx (updated_at),
      INDEX students_name_key_idx (name_key)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS sync_queue (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      operation ENUM('upsert', 'delete') NOT NULL,
      student_id VARCHAR(191) NOT NULL,
      payload JSON NULL,
      created_at DATETIME(3) NOT NULL,
      INDEX sync_queue_created_at_idx (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  const list = async (): Promise<Record<string, StudentRecord>> => {
    const [rows] = await pool.query<StudentRow[]>("SELECT id, data FROM students ORDER BY updated_at ASC");
    return Object.fromEntries(rows.map((row) => [String(row.id), row.data]));
  };

  const upsert = async (student: StudentRecord) => {
    const id = String(student.id);
    const name = String((student.profile as { name?: string } | undefined)?.name ?? "");
    const nameKey = name.trim().normalize("NFD").replace(/[\\u0300-\\u036f]/g, "").replace(/\\s+/g, " ").toLocaleLowerCase("pt-BR");
    const updatedAt = new Date(String(student.updatedAt ?? new Date().toISOString()));
    await pool.execute(
      `INSERT INTO students (id, name_key, data, updated_at) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE name_key = VALUES(name_key), data = VALUES(data), updated_at = VALUES(updated_at)`,
      [id, nameKey, JSON.stringify(student), updatedAt],
    );
  };

  const remove = async (id: string) => {
    await pool.execute("DELETE FROM students WHERE id = ?", [id]);
  };

  const enqueue = async (operation: "upsert" | "delete", studentId: string, payload: StudentRecord | null) => {
    await pool.execute("INSERT INTO sync_queue (operation, student_id, payload, created_at) VALUES (?, ?, ?, ?)", [operation, studentId, payload ? JSON.stringify(payload) : null, new Date()]);
  };

  const pending = async (): Promise<QueueRow[]> => {
    const [rows] = await pool.query<QueueRow[]>("SELECT id, operation, student_id, payload FROM sync_queue ORDER BY id ASC");
    return rows;
  };

  const removeQueueItem = async (id: number) => {
    await pool.execute("DELETE FROM sync_queue WHERE id = ?", [id]);
  };

  const count = async () => {
    const [rows] = await pool.query<CountRow[]>("SELECT COUNT(*) AS total FROM students");
    return Number(rows[0]?.total ?? 0);
  };

  const close = async () => pool.end();

  return { list, upsert, remove, enqueue, pending, removeQueueItem, count, close, database, host, port };
}

export type LocalStore = Awaited<ReturnType<typeof createLocalStore>>;
