const { spawn } = require("node:child_process");
const http = require("node:http");
const path = require("node:path");

const port = 3000;
const startUrl = `http://localhost:${port}`;
const nextCli = require.resolve("next/dist/bin/next");
const electronCli = require.resolve("electron/cli.js");

function probeServer() {
  return new Promise((resolve) => {
    const request = http.get(startUrl, (response) => {
      response.resume();
      response.on("end", () => resolve(response.statusCode ?? 500));
    });

    request.setTimeout(1500, () => request.destroy());
    request.on("error", () => resolve(null));
  });
}

async function waitForServer(nextProcess) {
  const timeoutAt = Date.now() + 120_000;

  while (Date.now() < timeoutAt) {
    if (nextProcess.exitCode !== null) {
      throw new Error(`Next.js berhenti dengan kode ${nextProcess.exitCode} sebelum siap.`);
    }

    const status = await probeServer();
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
  let nextProcess = null;
  let shouldStopNext = false;

  try {
    const existingStatus = await probeServer();
    if (existingStatus === null) {
      nextProcess = spawn(
        process.execPath,
        [nextCli, "dev", "--turbopack", "--port", String(port)],
        {
          cwd: path.resolve(__dirname, "..", "apps"),
          stdio: "inherit",
        },
      );
      shouldStopNext = true;
      nextProcess.on("error", (error) => {
        console.error("Gagal menjalankan Next.js:", error);
      });
      await waitForServer(nextProcess);
    } else if (existingStatus >= 500) {
      throw new Error(`Port ${port} merespons HTTP ${existingStatus}; periksa server yang sedang berjalan.`);
    } else {
      console.log(`Menggunakan server yang sudah berjalan di ${startUrl}.`);
    }

    const electronProcess = spawn(process.execPath, [electronCli, "."], {
      cwd: path.resolve(__dirname, ".."),
      env: { ...process.env, ELECTRON_START_URL: startUrl },
      stdio: "inherit",
    });

    const exitCode = await new Promise((resolve, reject) => {
      electronProcess.on("error", reject);
      electronProcess.on("close", (code, signal) => {
        if (signal) {
          resolve(1);
          return;
        }
        resolve(code ?? 1);
      });
    });
    process.exitCode = exitCode;
  } finally {
    if (shouldStopNext && nextProcess && nextProcess.exitCode === null) {
      nextProcess.kill();
    }
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
