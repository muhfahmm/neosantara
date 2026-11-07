import { rmSync, writeFileSync } from "node:fs";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { findFreePort, isPortAvailable } from "./dev-ports.mjs";

const appDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const nextCli = fileURLToPath(import.meta.resolve("next/dist/bin/next"));
const apiDir = path.join(
  appDir,
  "src",
  "app",
  "page",
  "menus",
  "inbox",
  "logic",
  "7_notifikasi_ekonomi",
  "demo_logic",
  "2_dialog_terbuka",
);

function readPortArgument() {
  const index = process.argv.indexOf("--port");
  if (index === -1) return null;

  const port = Number(process.argv[index + 1]);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("Nilai --port harus berupa nomor port antara 1 dan 65535.");
  }
  return port;
}

function stopChild(child) {
  if (child && child.exitCode === null && !child.killed) {
    child.kill();
  }
}

async function main() {
  const requestedPort = readPortArgument();
  const frontendPort = requestedPort ?? (await findFreePort(3000, 3999));
  if (!(await isPortAvailable(frontendPort))) {
    throw new Error(`Port ${frontendPort} sedang digunakan.`);
  }
  const apiPort = await findFreePort(8000);
  const tsconfigPath = path.join(appDir, `.tsconfig-dev-${frontendPort}.json`);
  writeFileSync(tsconfigPath, JSON.stringify({ extends: "./tsconfig.json" }, null, 2));

  console.log(`Next.js: http://localhost:${frontendPort}`);
  console.log(`Dialog API: http://localhost:${apiPort}`);

  const apiProcess = spawn(
    process.env.PYTHON || "python",
    ["-m", "uvicorn", "python.main:app", "--host", "0.0.0.0", "--port", String(apiPort)],
    { cwd: apiDir, stdio: "inherit" },
  );
  const nextProcess = spawn(
    process.execPath,
    [nextCli, "dev", "--turbopack", "--hostname", "0.0.0.0", "--port", String(frontendPort)],
    {
      cwd: appDir,
      env: {
        ...process.env,
        DIALOG_API_URL: `http://127.0.0.1:${apiPort}`,
        NEXT_DIST_DIR: `.next-dev-${frontendPort}`,
        NEXT_TSCONFIG_PATH: path.basename(tsconfigPath),
        PORT: String(frontendPort),
      },
      stdio: "inherit",
    },
  );
  const children = [apiProcess, nextProcess];
  let stopping = false;

  const stopAll = () => {
    if (stopping) return;
    stopping = true;
    children.forEach(stopChild);
  };

  for (const child of children) {
    child.on("error", (error) => {
      console.error("Gagal menjalankan server development:", error.message);
      process.exitCode = 1;
      stopAll();
    });
    child.on("close", (code, signal) => {
      if (!stopping) {
        process.exitCode = code ?? (signal ? 1 : 0);
        stopAll();
      }
    });
  }

  process.on("SIGINT", () => {
    process.exitCode = 130;
    stopAll();
  });
  process.on("SIGTERM", () => {
    process.exitCode = 143;
    stopAll();
  });

  try {
    await Promise.all(
      children.map(
        (child) =>
          new Promise((resolve) => {
            child.once("close", resolve);
          }),
      ),
    );
  } finally {
    rmSync(tsconfigPath, { force: true });
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
