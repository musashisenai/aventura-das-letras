import fs from "node:fs/promises";
import path from "node:path";
import { createLocalStore } from "../server/localStore.js";

const desktop = process.env.BACKUP_DIR?.trim()
  || (process.env.USERPROFILE ? path.join(process.env.USERPROFILE, "Desktop") : path.join(process.env.HOME || ".", "Desktop"));
const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const output = path.join(desktop, `aventura-das-letras-backup-${timestamp}.json`);

const store = await createLocalStore();
try {
  const students = await store.list();
  await fs.mkdir(desktop, { recursive: true });
  await fs.writeFile(output, JSON.stringify({ exportedAt: new Date().toISOString(), students }, null, 2), "utf8");
  console.log(`Backup criado com ${Object.keys(students).length} aluno(s): ${output}`);
} finally {
  await store.close();
}
