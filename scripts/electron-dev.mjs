import { spawn } from "node:child_process";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { findFreePort } from "../apps/scripts/dev-ports.mjs";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const electronCli = fileURLToPath(import.meta.resolve("electron/cli.js"));
const devServerScript = path.resolve(scriptDir, "..", "apps", "scripts", "dev-server.mjs");

function probeServer(startUrl) {
  return new Promise((resolve) => {
    const request = http.get(startUrl, (response) => {
      response.resume();
      response.on("end", () => resolve(response.statusCode ?? 500));
    });

    request.setTimeout(1500, () => request.destroy());
    request.on("error", () => resolve(null));
  });
}

async function waitForServer(nextProcess, startUrl) {
  const timeoutAt = Date.now() + 120_000;

  while (Date.now() < timeoutAt) {
    if (nextProcess.exitCode !== null) {
      throw new Error(`Next.js berhenti dengan kode ${nextProcess.exitCode} sebelum siap.`);
    }

    const status = await probeServer(startUrl);
    if (status !== null) {
      if (status >= 500) {
        throw new Error(`Next.js merespons HTTP ${status} pada ${startUrl}.`);
      }
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  throw new Error(`Next.js tidak siap dalam 120 detik pada ${startUrl}.`);
}

async function main() {
  const port = await findFreePort(3000, 3999);
  const startUrl = `http://localhost:${port}`;
  let devServerProcess = null;
  let electronProcess = null;

  try {
    devServerProcess = spawn(process.execPath, [devServerScript, "--port", String(port)], {
      cwd: path.resolve(scriptDir, "..", "apps"),
      stdio: "inherit",
    });
    devServerProcess.on("error", (error) => {
      console.error("Gagal menjalankan server development:", error.message);
    });
    await waitForServer(devServerProcess, startUrl);

    console.log(`Membuka Electron dengan server ${startUrl}.`);
    const electronEnv = { ...process.env, ELECTRON_START_URL: startUrl };
    delete electronEnv.ELECTRON_RUN_AS_NODE;
    electronProcess = spawn(process.execPath, [electronCli, "."], {
      cwd: path.resolve(scriptDir, ".."),
      env: electronEnv,
      stdio: "inherit",
    });

    const exitCode = await new Promise((resolve, reject) => {
      electronProcess.on("error", reject);
      electronProcess.on("close", (code, signal) => resolve(signal ? 1 : (code ?? 1)));
    });
    process.exitCode = exitCode;
  } finally {
    if (electronProcess && electronProcess.exitCode === null) electronProcess.kill();
    if (devServerProcess && devServerProcess.exitCode === null) devServerProcess.kill();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
