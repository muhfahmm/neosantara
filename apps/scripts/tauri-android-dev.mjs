import { execSync, spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { findFreePort } from "./dev-ports.mjs";
import { waitForServerReady, warmupDevServer } from "./warmup.mjs";

function setupAdbReverse(port, apiPort = 8000) {
  try {
    const adbPath = process.env.LOCALAPPDATA
      ? path.join(process.env.LOCALAPPDATA, "Android", "Sdk", "platform-tools", "adb.exe")
      : "adb";
    execSync(`"${adbPath}" reverse tcp:${port} tcp:${port}`, { stdio: "ignore" });
    execSync(`"${adbPath}" reverse tcp:${apiPort} tcp:${apiPort}`, { stdio: "ignore" });
    console.log(`[ADB Reverse] Port ${port} dan ${apiPort} berhasil diarahkan langsung ke HP fisik via USB/Wi-Fi.`);
  } catch {
    // Abaikan jika adb tidak ada / belum connect
  }
}

async function main() {
  const port = await findFreePort(3000, 3999);
  console.log(`Tauri Android akan menggunakan port Next.js ${port}.`);
  setupAdbReverse(port, 8000);

  // Background warmup agar saat APK terbuka, Next.js sudah selesai mengompilasi halaman
  void (async () => {
    const ready = await waitForServerReady(port);
    if (ready) {
      await warmupDevServer(port);
    }
  })();

  const config = JSON.stringify({
    build: {
      devUrl: `http://localhost:${port}`,
      beforeDevCommand: `node scripts/dev-server.mjs --port ${port}`,
    },
  });
  const tauriCli = fileURLToPath(import.meta.resolve("@tauri-apps/cli/tauri.js"));
  const tauriProcess = spawn(
    process.execPath,
    [tauriCli, "android", "dev", "--config", config, ...process.argv.slice(2)],
    { cwd: path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".."), stdio: "inherit" },
  );

  const exitCode = await new Promise((resolve, reject) => {
    tauriProcess.on("error", reject);
    tauriProcess.on("close", (code, signal) => resolve(signal ? 1 : (code ?? 1)));
  });
  process.exitCode = exitCode;
}



main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
