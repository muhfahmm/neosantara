import { DatabaseSync } from "node:sqlite";
import { mkdir, writeFile } from "node:fs/promises";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const appDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const databasePath = process.env.SQLITE_DB_PATH
  ? path.resolve(process.env.SQLITE_DB_PATH)
  : path.resolve(appDirectory, "..", "data", "neosantara_master.db");
const outputPath = path.join(appDirectory, "out", "local-master-data.json");

if (!fs.existsSync(databasePath)) {
  throw new Error(`Master database not found: ${databasePath}`);
}

const database = new DatabaseSync(databasePath, { readOnly: true });

try {
  const tableNames = database
    .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name LIKE 'database_%' ORDER BY name")
    .all()
    .map((row) => row.name);

  if (tableNames.length === 0) {
    throw new Error(`No game master-data tables found in ${databasePath}`);
  }

  const tables = {};
  for (const tableName of tableNames) {
    const escapedName = tableName.replaceAll('"', '""');
    tables[tableName] = database.prepare(`SELECT * FROM "${escapedName}"`).all();
  }

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, JSON.stringify({ tables }), "utf8");
  console.log(`Embedded ${tableNames.length} master-data tables at ${outputPath}.`);
} finally {
  database.close();
}
