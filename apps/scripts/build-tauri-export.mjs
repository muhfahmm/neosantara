import { spawn } from "node:child_process";
import { access, mkdir, rename, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const appDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const excludedPaths = [
  {
    source: path.join(appDirectory, "src", "app", "api"),
    name: "api",
  },
  {
    source: path.join(appDirectory, "src", "middleware.ts"),
    name: "middleware.ts",
  },
];
const backupDirectory = path.join(
  appDirectory,
  "..",
  `.tauri-export-backup-${process.pid}`,
);
const movedPaths = [];
const require = createRequire(import.meta.url);
const nextCli = require.resolve("next/dist/bin/next");
const snapshotScript = path.join(appDirectory, "scripts", "create-local-master-data.mjs");
let backupCreated = false;

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      return false;
    }
    throw error;
  }
}

function runExportBuild() {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [nextCli, "build", "--webpack"], {
      cwd: appDirectory,
      env: {
        ...process.env,
        NEXT_DIST_DIR: ".next",
        NEXT_PUBLIC_API_URL:
          process.env.NEXT_PUBLIC_API_URL?.trim() || "https://neosantara.com",
        NEXT_PUBLIC_LOCAL_MASTER_DATA: "1",
        NEXT_TAURI_EXPORT: "1",
      },
      stdio: "inherit",
    });
    const forwardSignal = (signal) => child.kill(signal);
    const handleInterrupt = () => forwardSignal("SIGINT");
    const handleTermination = () => forwardSignal("SIGTERM");

    process.once("SIGINT", handleInterrupt);
    process.once("SIGTERM", handleTermination);

    child.once("error", reject);
    child.once("exit", (code, signal) => {
      process.removeListener("SIGINT", handleInterrupt);
      process.removeListener("SIGTERM", handleTermination);
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`Tauri frontend export failed (${signal || `exit code ${code}`}).`));
    });
  });
}

function createLocalMasterData() {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [snapshotScript], {
      cwd: appDirectory,
      env: process.env,
      stdio: "inherit",
    });

    child.once("error", reject);
    child.once("exit", (code, signal) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`Local master-data export failed (${signal || `exit code ${code}`}).`));
    });
  });
}

let buildError;

try {
  await mkdir(backupDirectory);
  backupCreated = true;

  for (const entry of excludedPaths) {
    if (!(await exists(entry.source))) continue;
    const backupPath = path.join(backupDirectory, entry.name);
    await rename(entry.source, backupPath);
    movedPaths.push({ source: entry.source, backupPath });
  }

  await runExportBuild();
  await createLocalMasterData();
} catch (error) {
  buildError = error;
} finally {
  for (const entry of movedPaths.reverse()) {
    try {
      if (await exists(entry.source)) {
        throw new Error(`Cannot restore excluded source because it already exists: ${entry.source}`);
      }
      await rename(entry.backupPath, entry.source);
    } catch (error) {
      console.error("Failed to restore source after the Tauri export build:", error);
      buildError ??= error;
    }
  }

  if (
    backupCreated &&
    !(await Promise.all(movedPaths.map((entry) => exists(entry.backupPath)))).some(Boolean)
  ) {
    await rm(backupDirectory, { recursive: true, force: true });
  }
}

if (buildError) {
  throw buildError;
}
