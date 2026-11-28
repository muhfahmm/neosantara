const { app, BrowserWindow } = require("electron");
const fs = require("node:fs");
const path = require("node:path");
const http = require("node:http");
const { fork } = require("node:child_process");

const appDataBase = process.env.LOCALAPPDATA || process.env.APPDATA || path.join(process.env.USERPROFILE || "", "AppData", "Roaming");
const writableAppData = path.join(appDataBase, "PresidenSimulator");
fs.mkdirSync(writableAppData, { recursive: true });
app.setPath("userData", writableAppData);

const cacheDir = path.join(writableAppData, "Cache");
fs.mkdirSync(cacheDir, { recursive: true });
app.setPath("cache", cacheDir);
app.commandLine.appendSwitch("disk-cache-dir", cacheDir);
app.commandLine.appendSwitch("autoplay-policy", "no-user-gesture-required");

let serverProcess = null;
let mainWindow = null;

function probeUrl(targetUrl) {
  return new Promise((resolve) => {
    const req = http.get(targetUrl, (res) => {
      res.resume();
      res.on("end", () => resolve(res.statusCode ?? 500));
    });
    req.setTimeout(800, () => req.destroy());
    req.on("error", () => resolve(null));
  });
}

async function waitForServer(targetUrl, timeoutMs = 60000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const code = await probeUrl(targetUrl);
    if (code && code < 500) {
      return true;
    }
    await new Promise((r) => setTimeout(r, 100));
  }
  return false;
}

function resolveServerPaths() {
  const standaloneBase = app.isPackaged
    ? path.join(process.resourcesPath, "standalone")
    : path.resolve(__dirname, "..", "apps", ".next", "standalone");

  const candidates = [
    { script: path.join(standaloneBase, "apps", "server.js"), cwd: path.join(standaloneBase, "apps") },
    { script: path.join(standaloneBase, "neosantara", "apps", "server.js"), cwd: path.join(standaloneBase, "neosantara", "apps") },
    { script: path.join(standaloneBase, "server.js"), cwd: standaloneBase }
  ];

  for (const c of candidates) {
    if (fs.existsSync(c.script)) {
      return { ...c, base: standaloneBase };
    }
  }

  return { script: candidates[0].script, cwd: candidates[0].cwd, base: standaloneBase };
}

function startNextProductionServer(port) {
  const resolved = resolveServerPaths();
  const dbPath = path.join(resolved.base, "data", "neosantara_master.db");
  const logFile = path.join(writableAppData, "server.log");

  fs.appendFileSync(logFile, `[${new Date().toISOString()}] Menjalankan server dari ${resolved.script}\n`);

  if (!fs.existsSync(resolved.script)) {
    fs.appendFileSync(logFile, `[ERROR] server.js tidak ditemukan di ${resolved.script}\n`);
    return;
  }

  const env = {
    ...process.env,
    PORT: String(port),
    HOSTNAME: "0.0.0.0",
    NODE_ENV: "production",
    SQLITE_DB_PATH: dbPath,
    ELECTRON_RUN_AS_NODE: "1",
  };

  serverProcess = fork(resolved.script, [], {
    cwd: resolved.cwd,
    env,
    stdio: ["ignore", "pipe", "pipe", "ipc"],
  });

  if (serverProcess.stdout) {
    serverProcess.stdout.on("data", (chunk) => {
      fs.appendFileSync(logFile, `[STDOUT] ${chunk.toString()}`);
    });
  }

  if (serverProcess.stderr) {
    serverProcess.stderr.on("data", (chunk) => {
      fs.appendFileSync(logFile, `[STDERR] ${chunk.toString()}`);
    });
  }

  serverProcess.on("error", (err) => {
    fs.appendFileSync(logFile, `[ERROR] Next server error: ${err.stack || err}\n`);
  });

  serverProcess.on("exit", (code, signal) => {
    fs.appendFileSync(logFile, `[EXIT] Next server berhenti dengan code ${code}, signal ${signal}\n`);
  });
}

function applyScreenAdaptiveZoom(window) {
  if (!window || window.isDestroyed()) return;
  const bounds = window.getBounds();
  let zoom = 1.15;
  if (bounds.width < 1400) {
    zoom = 0.75;
  } else if (bounds.width < 1700) {
    zoom = 0.80;
  } else if (bounds.width < 1850) {
    zoom = 0.85;
  } else {
    zoom = 1.15;
  }
  window.webContents.setZoomFactor(zoom);
}

function createMainWindow(startUrl) {
  const iconPath = app.isPackaged
    ? path.join(process.resourcesPath, "app-icon.ico")
    : path.resolve(__dirname, "..", "app-icon.ico");

  const logFile = path.join(writableAppData, "server.log");

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    minWidth: 960,
    minHeight: 540,
    title: "Presiden Simulator",
    icon: fs.existsSync(iconPath) ? iconPath : undefined,
    show: false,
    backgroundColor: "#0b1320",
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: false,
      sandbox: false,
      zoomFactor: 1.0,
      nativeWindowOpen: true,
    },
    // User-agent Chrome standar agar Google Login tidak mendeteksi webview embedded yang dibatasi
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    // Tangani popup Google OAuth dan Firebase Auth secara khusus
    if (
      url.startsWith("https://accounts.google.com") ||
      url.startsWith("https://neosantara-auth.firebaseapp.com") ||
      url.startsWith("https://neosantara-auth.web.app")
    ) {
      return {
        action: "allow",
        overrideBrowserWindowOptions: {
          width: 520,
          height: 680,
          autoHideMenuBar: true,
          webPreferences: {
            contextIsolation: false,
            nodeIntegration: false,
            sandbox: false,
          },
        },
      };
    }
    return { action: "allow" };
  });

  mainWindow.webContents.on("console-message", (e, level, message, line, sourceId) => {
    fs.appendFileSync(logFile, `[CLIENT CONSOLE lvl=${level}] ${message} (${sourceId}:${line})\n`);
  });

  mainWindow.webContents.on("did-fail-load", (e, errorCode, errorDescription, validatedURL) => {
    fs.appendFileSync(logFile, `[CLIENT FAIL LOAD] code=${errorCode} ${errorDescription} URL=${validatedURL}\n`);
  });

  mainWindow.on("resize", () => {
    applyScreenAdaptiveZoom(mainWindow);
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  // Begitu server siap, langsung buka jendela game pada menu utama
  fs.appendFileSync(logFile, `[MAIN] Menunggu server siap pada ${startUrl}...\n`);
  waitForServer(startUrl).then((ready) => {
    fs.appendFileSync(logFile, `[MAIN] Server siap? ${ready}. MainWindow ada? ${Boolean(mainWindow)}\n`);
    if (mainWindow && !mainWindow.isDestroyed()) {
      fs.appendFileSync(logFile, `[MAIN] Memanggil mainWindow.loadURL(${startUrl})\n`);
      mainWindow.loadURL(startUrl);
      mainWindow.once("ready-to-show", () => {
        fs.appendFileSync(logFile, `[MAIN] Event ready-to-show diterima\n`);
        mainWindow.maximize();
        mainWindow.show();
        applyScreenAdaptiveZoom(mainWindow);
      });
      mainWindow.webContents.on("did-finish-load", () => {
        fs.appendFileSync(logFile, `[MAIN] Event did-finish-load diterima\n`);
        if (!mainWindow.isVisible()) {
          mainWindow.maximize();
          mainWindow.show();
        }
        applyScreenAdaptiveZoom(mainWindow);
      });
    }
  });
}

app.whenReady().then(async () => {
  let startUrl = process.env.ELECTRON_START_URL;

  if (!startUrl) {
    const port = 3000;
    startUrl = `http://localhost:${port}`;
    startNextProductionServer(port);
  }

  createMainWindow(startUrl);

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow(startUrl);
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", () => {
  if (serverProcess && !serverProcess.killed) {
    serverProcess.kill();
    serverProcess = null;
  }
});
