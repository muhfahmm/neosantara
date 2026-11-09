import { rmSync, writeFileSync } from "node:fs";
import { execFileSync, execSync, spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { findFreePort } from "./dev-ports.mjs";
import { waitForServerReady, warmupDevServer } from "./warmup.mjs";

const appDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

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
  const tauriArgs = process.argv.slice(2);
  const hotReloadIndex = tauriArgs.indexOf("--hot");
  const useHotReload = hotReloadIndex !== -1;
  if (useHotReload) {
    tauriArgs.splice(hotReloadIndex, 1);
  }

  const port = await findFreePort(3000, 3999);
  const distDir = useHotReload ? `.next-dev-${port}` : `.next-android-${port}`;
  const frontendEnv = {
    ...process.env,
    NEXT_DIST_DIR: distDir,
    TAURI_ANDROID_PRODUCTION: useHotReload ? "0" : "1",
    TAURI_ANDROID_HMR_PORT: String(port),
  };

  if (!useHotReload) {
    console.log("Membangun frontend production agar kompilasi/HMR tidak me-reload simulasi Android...");
    const nextCli = fileURLToPath(import.meta.resolve("next/dist/bin/next"));
    const tsconfigPath = path.join(appDir, `.tsconfig-android-${port}.json`);
    writeFileSync(tsconfigPath, JSON.stringify({ extends: "./tsconfig.json" }, null, 2));
    try {
      execFileSync(process.execPath, [nextCli, "build", "--webpack"], {
        cwd: appDir,
        env: {
          ...frontendEnv,
          NEXT_TSCONFIG_PATH: path.basename(tsconfigPath),
        },
        stdio: "inherit",
      });
    } finally {
      rmSync(tsconfigPath, { force: true });
    }
  }

  console.log(`Tauri Android akan menggunakan port Next.js ${port}.`);
  setupAdbReverse(port, 8000);

  if (useHotReload) {
    void (async () => {
      const ready = await waitForServerReady(port);
      if (ready) {
        await warmupDevServer(port);
      }
    })();
  }

  const config = JSON.stringify({
    build: {
      devUrl: `http://localhost:${port}`,
      beforeDevCommand: `node scripts/dev-server.mjs --port ${port}`,
    },
  });
  const tauriCli = fileURLToPath(import.meta.resolve("@tauri-apps/cli/tauri.js"));
  const tauriProcess = spawn(
    process.execPath,
    [tauriCli, "android", "dev", "--config", config, ...tauriArgs],
    { cwd: appDir, env: frontendEnv, stdio: "inherit" },
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
