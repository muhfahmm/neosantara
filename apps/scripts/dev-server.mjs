import { rmSync, writeFileSync } from "node:fs";
import { spawn } from "node:child_process";
import { networkInterfaces } from "node:os";
import path from "node:path";
import { StringDecoder } from "node:string_decoder";
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

function getLanIPv4Addresses() {
  const addresses = [];
  for (const [interfaceName, entries] of Object.entries(networkInterfaces())) {
    for (const entry of entries ?? []) {
      if (
        entry.internal ||
        (entry.family !== "IPv4" && entry.family !== 4) ||
        !/^(?:10\.|192\.168\.|172\.(?:1[6-9]|2\d|3[01])\.)/.test(entry.address)
      ) {
        continue;
      }
      addresses.push({ interfaceName, address: entry.address });
    }
  }
  return addresses;
}

function stopChild(child) {
  if (child && child.exitCode === null && !child.killed) {
    child.kill();
  }
}

function pipeNextOutput(nextProcess) {
  const reset = "\u001b[0m";
  const red = "\u001b[31m";
  const ansiPattern = /\u001b\[[0-?]*[ -/]*[@-~]/g;
  let hasServedMapPage = false;
  let highlightRefreshRequestsUntil = 0;

  const writeLine = (line, destination) => {
    const plainLine = line.replace(ansiPattern, "");
    const isMapPageRequest = /\b(?:GET|HEAD)\s+\/page\/map_system(?:[?\s]|$)/.test(plainLine);
    const isRefreshSignal = /(?:Compiled in \d+(?:\.\d+)?(?:ms|s)|Fast Refresh.*(?:reload|rebuilding)|performing full reload)/i.test(plainLine);
    const isFollowupRequest = /\b(?:GET|HEAD)\s+\/(?:$|\s)|\b(?:GET|HEAD)\s+\/(?:api\/(?:game-bootstrap|country-data|building-metadata|price-data)|page\/map_system)(?:[?\s]|$)/.test(plainLine);
    const highlight = (hasServedMapPage && isRefreshSignal) ||
      (Date.now() < highlightRefreshRequestsUntil && isFollowupRequest);

    if (hasServedMapPage && isRefreshSignal) {
      highlightRefreshRequestsUntil = Date.now() + 10_000;
    }
    if (isMapPageRequest) hasServedMapPage = true;

    destination.write(highlight ? `${red}${plainLine}${reset}\n` : `${line}\n`);
  };

  for (const [stream, destination] of [
    [nextProcess.stdout, process.stdout],
    [nextProcess.stderr, process.stderr],
  ]) {
    const decoder = new StringDecoder("utf8");
    let pending = "";
    stream.on("data", chunk => {
      pending += decoder.write(chunk);
      const lines = pending.split("\n");
      pending = lines.pop() ?? "";
      for (const line of lines) writeLine(line.replace(/\r$/, ""), destination);
    });
    stream.on("end", () => {
      pending += decoder.end();
      if (pending) writeLine(pending.replace(/\r$/, ""), destination);
    });
  }
}

async function main() {
  const requestedPort = readPortArgument();
  const frontendPort = requestedPort ?? (await findFreePort(3000, 3999));
  if (!(await isPortAvailable(frontendPort))) {
    throw new Error(`Port ${frontendPort} sedang digunakan.`);
  }
  const apiPort = await findFreePort(8000);
  const productionMode = process.env.TAURI_ANDROID_PRODUCTION === "1";
  const distDir = process.env.NEXT_DIST_DIR
    ?? (productionMode ? `.next-android-${frontendPort}` : `.next-dev-${frontendPort}`);
  const tsconfigPath = productionMode
    ? null
    : path.join(appDir, `.tsconfig-dev-${frontendPort}.json`);
  const lanAddresses = getLanIPv4Addresses();
  if (tsconfigPath) {
    writeFileSync(tsconfigPath, JSON.stringify({ extends: "./tsconfig.json" }, null, 2));
  }

  console.log(`Next.js (komputer ini): http://localhost:${frontendPort}`);
  if (lanAddresses.length > 0) {
    console.log("URL untuk perangkat lain di jaringan yang sama:");
    lanAddresses.forEach(({ interfaceName, address }) => {
      console.log(`  ${interfaceName}: http://${address}:${frontendPort}`);
    });
    if (!productionMode) {
      console.log("Buka salah satu URL LAN di HP/perangkat lain; perubahan kode akan tersinkron lewat Fast Refresh.");
    }
  } else {
    console.log("Tidak ada alamat IPv4 LAN yang terdeteksi; perangkat lain belum bisa terhubung.");
  }
  console.log(`Dialog API: http://localhost:${apiPort}`);

  const apiProcess = spawn(
    process.env.PYTHON || "python",
    ["-m", "uvicorn", "python.main:app", "--host", "0.0.0.0", "--port", String(apiPort)],
    { cwd: apiDir, stdio: "inherit" },
  );

  // Set NEXT_DEV_HOST atau assetPrefix agar dev server dan client HMR rute tepat
  const nextArgs = productionMode
    ? [nextCli, "start", "--hostname", "0.0.0.0", "--port", String(frontendPort)]
    : [nextCli, "dev", "--turbopack", "--hostname", "0.0.0.0", "--port", String(frontendPort)];
  const nextProcess = spawn(
    process.execPath,
    nextArgs,
    {
      cwd: appDir,
      env: {
        ...process.env,
        DIALOG_API_URL: `http://127.0.0.1:${apiPort}`,
        NEXT_DIST_DIR: distDir,
        NEXT_ALLOWED_DEV_ORIGINS: productionMode
          ? ""
          : lanAddresses.map(({ address }) => address).join(","),
        ...(tsconfigPath ? { NEXT_TSCONFIG_PATH: path.basename(tsconfigPath) } : {}),
        PORT: String(frontendPort),
      },
      stdio: ["inherit", "pipe", "pipe"],
    },
  );
  pipeNextOutput(nextProcess);
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
    if (tsconfigPath) rmSync(tsconfigPath, { force: true });
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
