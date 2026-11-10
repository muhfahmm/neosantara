import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { ensureGradleWrapper } from "./ensure-gradle-wrapper.mjs";

const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const androidProject = resolve(appRoot, "src-tauri", "gen", "android");

async function main() {
  if (existsSync(androidProject)) {
    try {
      await ensureGradleWrapper(androidProject);
      console.log("Tauri Android project already initialized and the Gradle wrapper is ready.");
    } catch (error) {
      console.warn(`[Android] Could not repair the Gradle wrapper automatically: ${error.message}`);
    }
    return;
  }

  const require = createRequire(import.meta.url);
  const tauriCli = require.resolve("@tauri-apps/cli/tauri.js");
  const result = spawnSync(process.execPath, [tauriCli, "android", "init"], {
    cwd: appRoot,
    stdio: "inherit",
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    process.exitCode = result.status ?? 1;
    return;
  }

  await ensureGradleWrapper(androidProject);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});