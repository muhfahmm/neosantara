import { rmSync, writeFileSync } from "node:fs";
import { execFileSync, spawn } from "node:child_process";
import { networkInterfaces } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ensureGradleWrapper } from "./ensure-gradle-wrapper.mjs";
import { findFreePort } from "./dev-ports.mjs";
import { waitForServerReady, warmupDevServer } from "./warmup.mjs";

const appDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const androidProjectDir = path.join(appDir, "src-tauri", "gen", "android");

function getAndroidSdkPath() {
  return process.env.ANDROID_HOME ||
    process.env.ANDROID_SDK_ROOT ||
    (process.env.LOCALAPPDATA ? path.join(process.env.LOCALAPPDATA, "Android", "Sdk") : null);
}

function getAdbPath() {
  const sdkPath = getAndroidSdkPath();
  return sdkPath
    ? path.join(sdkPath, "platform-tools", process.platform === "win32" ? "adb.exe" : "adb")
    : "adb";
}

function getConnectedAndroidDevices(adbPath) {
  const output = execFileSync(adbPath, ["devices"], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  });
  return output
    .split(/\r?\n/)
    .slice(1)
    .map(line => line.trim().split(/\s+/))
    .filter(([serial, state]) => serial && state === "device")
    .map(([serial]) => serial);
}

function getAvailableEmulators(sdkPath) {
  const emulatorPath = path.join(
    sdkPath,
    "emulator",
    process.platform === "win32" ? "emulator.exe" : "emulator",
  );
  const output = execFileSync(emulatorPath, ["-list-avds"], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  });
  return {
    emulatorPath,
    avds: output.split(/\r?\n/).map(name => name.trim()).filter(Boolean),
  };
}

function getRunningEmulatorName(adbPath, serial) {
  try {
    return execFileSync(adbPath, ["-s", serial, "emu", "avd", "name"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
      timeout: 5000,
    }).split(/\r?\n/)[0].trim();
  } catch {
    return null;
  }
}

async function ensureAndroidDevice(tauriArgs) {
  const emulatorFlagIndex = tauriArgs.findIndex(argument => argument === "--emulator" || argument.startsWith("--emulator="));
  let requestedAvd = null;
  if (emulatorFlagIndex !== -1) {
    const option = tauriArgs[emulatorFlagIndex];
    requestedAvd = option.includes("=") ? option.slice(option.indexOf("=") + 1) : tauriArgs[emulatorFlagIndex + 1];
    if (!requestedAvd) {
      throw new Error("Opsi --emulator membutuhkan nama profil, contoh: --emulator Medium_Phone_API_37.0.");
    }
    tauriArgs.splice(emulatorFlagIndex, option.includes("=") ? 1 : 2);
  }

  const adbPath = getAdbPath();
  const connectedDevices = getConnectedAndroidDevices(adbPath);
  if (connectedDevices.length > 0) {
    const connectedEmulators = connectedDevices
      .filter(serial => serial.startsWith("emulator-"))
      .map(serial => ({ serial, avd: getRunningEmulatorName(adbPath, serial) }))
      .filter(({ avd }) => avd);
    const connectedPhones = connectedDevices.filter(serial => !serial.startsWith("emulator-"));
    if (requestedAvd) {
      const selectedEmulator = connectedEmulators.find(({ avd }) => avd === requestedAvd);
      if (selectedEmulator) {
        return { tauriDevice: selectedEmulator.avd, adbSerial: selectedEmulator.serial };
      }
      if (connectedPhones.length > 0) {
        throw new Error(
          `Emulator "${requestedAvd}" belum berjalan. HP fisik terhubung: ${connectedPhones.join(", ")}.`,
        );
      }
    } else if (connectedPhones.length === 1) {
      return { tauriDevice: null, adbSerial: connectedPhones[0] };
    } else if (connectedPhones.length > 1) {
      throw new Error(
        `Lebih dari satu HP fisik terhubung (${connectedPhones.join(", ")}). Sisakan satu HP melalui USB, lalu jalankan lagi.`,
      );
    } else {
      throw new Error(
        `Tidak ada HP fisik terhubung. Emulator yang terdeteksi: ${connectedEmulators.map(({ avd }) => avd).join(", ")}. ` +
        "Hubungkan HP melalui USB, aktifkan USB debugging, lalu jalankan lagi. " +
        "Untuk memakai emulator secara eksplisit, gunakan --emulator <nama-profil>.",
      );
    }
  }

  const sdkPath = getAndroidSdkPath();
  if (!sdkPath) {
    throw new Error("Tidak ada HP Android terhubung dan Android SDK tidak ditemukan. Hubungkan HP dengan USB debugging aktif.");
  }

  let emulatorPath;
  let availableAvds;
  try {
    ({ emulatorPath, avds: availableAvds } = getAvailableEmulators(sdkPath));
  } catch (error) {
    throw new Error(`Tidak dapat memeriksa emulator Android di "${sdkPath}": ${error.message}`);
  }

  if (!requestedAvd) {
    throw new Error(
      "Tidak ada HP fisik terhubung melalui ADB. Hubungkan HP dengan USB debugging aktif; " +
      "emulator tidak dijalankan otomatis. Untuk memilih emulator secara eksplisit, gunakan --emulator <nama-profil>.",
    );
  } else if (!availableAvds.includes(requestedAvd)) {
    throw new Error(`Profil emulator "${requestedAvd}" tidak ditemukan. Profil tersedia: ${availableAvds.join(", ") || "(tidak ada)"}.`);
  }

  console.log(`[Android] Tidak ada perangkat terhubung; menyalakan emulator "${requestedAvd}"...`);
  const emulatorProcess = spawn(emulatorPath, ["-avd", requestedAvd], {
    detached: true,
    stdio: "ignore",
    windowsHide: true,
  });
  await new Promise((resolve, reject) => {
    emulatorProcess.once("spawn", resolve);
    emulatorProcess.once("error", reject);
  });
  emulatorProcess.unref();

  const deadline = Date.now() + 180_000;
  let emulatorSerial = null;
  while (Date.now() < deadline) {
    if (emulatorProcess.exitCode !== null) {
      throw new Error(`Emulator "${requestedAvd}" berhenti sebelum siap (exit code ${emulatorProcess.exitCode}).`);
    }

    try {
      emulatorSerial = getConnectedAndroidDevices(adbPath)
        .find(serial => serial.startsWith("emulator-") && getRunningEmulatorName(adbPath, serial) === requestedAvd);
      if (emulatorSerial) {
        const bootCompleted = execFileSync(adbPath, ["-s", emulatorSerial, "shell", "getprop", "sys.boot_completed"], {
          encoding: "utf8",
          stdio: ["ignore", "pipe", "ignore"],
          timeout: 5000,
        }).trim();
        if (bootCompleted === "1") {
          console.log(`[Android] Emulator "${requestedAvd}" siap; melanjutkan ke Tauri.`);
          return { tauriDevice: requestedAvd, adbSerial: emulatorSerial };
        }
      }
    } catch {
      // Wait until ADB and Android finish starting.
    }

    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  throw new Error(
    `Emulator "${requestedAvd}" belum siap setelah 180 detik. Periksa Android Studio atau jalankan emulator secara manual.`,
  );
}

function setupAdbReverse(deviceSerial, port, apiPort = 8000) {
  const adbPath = getAdbPath();
  try {
    execFileSync(adbPath, ["-s", deviceSerial, "reverse", `tcp:${port}`, `tcp:${port}`], { stdio: "ignore" });
    execFileSync(adbPath, ["-s", deviceSerial, "reverse", `tcp:${apiPort}`, `tcp:${apiPort}`], { stdio: "ignore" });
    console.log(`[ADB Reverse] Port ${port} dan ${apiPort} berhasil diarahkan ke ${deviceSerial}.`);
    return true;
  } catch {
    return false;
  }
}

function validateAndroidDeviceHost(tauriArgs) {
  const hostOptionIndex = tauriArgs.findIndex(argument => argument === "--host" || argument.startsWith("--host="));
  if (hostOptionIndex === -1) {
    return;
  }

  const option = tauriArgs[hostOptionIndex];
  const host = option.startsWith("--host=")
    ? option.slice("--host=".length)
    : tauriArgs[hostOptionIndex + 1] && !tauriArgs[hostOptionIndex + 1].startsWith("--")
      ? tauriArgs[hostOptionIndex + 1]
      : null;
  const localAddresses = Object.values(networkInterfaces())
    .flatMap(interfaces => interfaces ?? [])
    .filter(address => !address.internal)
    .map(address => address.address);
  if (host && localAddresses.includes(host)) return;

  tauriArgs.splice(hostOptionIndex, option.startsWith("--host=") || !host ? 1 : 2);
  console.warn(
    `[Android] Host "${host ?? "(kosong)"}" bukan alamat komputer yang aktif; ` +
    "menghapus override agar Tauri memilih alamat LAN yang benar.",
  );
}

async function main() {
  await ensureGradleWrapper(androidProjectDir);

  const tauriArgs = process.argv.slice(2);
  const tauriCli = fileURLToPath(import.meta.resolve("@tauri-apps/cli/tauri.js"));
  if (tauriArgs.includes("--help") || tauriArgs.includes("-h")) {
    execFileSync(process.execPath, [tauriCli, "android", "dev", "--help"], {
      cwd: appDir,
      stdio: "inherit",
    });
    return;
  }

  const productionIndex = tauriArgs.indexOf("--production");
  const hotReloadIndex = tauriArgs.indexOf("--hot");
  if (productionIndex !== -1 && hotReloadIndex !== -1) {
    throw new Error("Pilih satu mode: gunakan --hot atau --production, jangan keduanya.");
  }
  const useHotReload = productionIndex === -1;
  const modeFlagIndexes = [productionIndex, hotReloadIndex]
    .filter((value) => value !== -1)
    .sort((a, b) => b - a);
  for (const index of modeFlagIndexes) {
    tauriArgs.splice(index, 1);
  }

  const selectedDevice = tauriArgs.includes("--open")
    ? null
    : await ensureAndroidDevice(tauriArgs);
  if (selectedDevice) {
    validateAndroidDeviceHost(tauriArgs);
    if (selectedDevice.tauriDevice) {
      tauriArgs.unshift(selectedDevice.tauriDevice);
    } else {
      console.log(`[Android] Menargetkan HP fisik ${selectedDevice.adbSerial}; emulator tidak digunakan.`);
    }
  }

  const port = await findFreePort(3000, 3999);
  const distDir = useHotReload ? `.next-dev-${port}` : `.next-android-${port}`;
  const frontendEnv = {
    ...process.env,
    NEXT_DIST_DIR: distDir,
    TAURI_ANDROID_PRODUCTION: useHotReload ? "0" : "1",
    TAURI_ANDROID_HMR_PORT: String(port),
    ...(selectedDevice ? { ANDROID_SERIAL: selectedDevice.adbSerial } : {}),
  };

  console.log(`Mode Android: ${useHotReload ? "development dengan Fast Refresh aktif" : "production tanpa HMR"}.`);
  if (!useHotReload) {
    console.log("Membangun frontend production tanpa HMR agar kompilasi tidak me-reload simulasi Android...");
    const nextCli = fileURLToPath(import.meta.resolve("next/dist/bin/next"));
    const tsconfigPath = path.join(appDir, `.tsconfig-android-${port}.json`);
    writeFileSync(tsconfigPath, JSON.stringify({ extends: "./tsconfig.json" }, null, 2));
    try {
      execFileSync(process.execPath, [nextCli, "build", "--webpack"], {
        cwd: appDir,
        env: {
          ...frontendEnv,
          NEXT_TSCONFIG_PATH: path.basename(tsconfigPath),
          NODE_OPTIONS: [process.env.NODE_OPTIONS, "--max-old-space-size=4096"].filter(Boolean).join(" "),
        },
        stdio: "inherit",
      });
    } finally {
      rmSync(tsconfigPath, { force: true });
    }
  }

  console.log(`Tauri Android akan menggunakan port Next.js ${port}.`);
  const adbReverseReady = selectedDevice
    ? setupAdbReverse(selectedDevice.adbSerial, port, 8000)
    : true;
  if (selectedDevice && !adbReverseReady) {
    console.log("[ADB Reverse] HP belum siap; akan mencoba ulang setelah perangkat tersambung.");
  }

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
  const tauriProcess = spawn(
    process.execPath,
    [tauriCli, "android", "dev", "--config", config, ...tauriArgs],
    { cwd: appDir, env: frontendEnv, stdio: "inherit" },
  );
  let adbRetryTimer;
  if (!adbReverseReady) {
    adbRetryTimer = setInterval(() => {
      if (tauriProcess.exitCode !== null) {
        clearInterval(adbRetryTimer);
        return;
      }

      const adbPath = getAdbPath();
      try {
        const connectedDevices = getConnectedAndroidDevices(adbPath);
        if (selectedDevice && connectedDevices.includes(selectedDevice.adbSerial) &&
          setupAdbReverse(selectedDevice.adbSerial, port, 8000)) {
          clearInterval(adbRetryTimer);
        }
      } catch {
        // ADB may not be ready until Android finishes starting.
      }
    }, 2000);
  }

  const exitCode = await new Promise((resolve, reject) => {
    tauriProcess.on("error", reject);
    tauriProcess.on("close", (code, signal) => {
      if (adbRetryTimer) clearInterval(adbRetryTimer);
      resolve(signal ? 1 : (code ?? 1));
    });
  });
  process.exitCode = exitCode;
}



main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
