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
    req.setTimeout(1500, () => req.destroy());
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
    await new Promise((r) => setTimeout(r, 300));
  }
  return false;
}

function startNextProductionServer(port) {
  const standaloneBase = app.isPackaged
    ? path.join(process.resourcesPath, "standalone")
    : path.resolve(__dirname, "..", "apps", ".next", "standalone", "neosantara");

  const serverScript = path.join(standaloneBase, "apps", "server.js");
  const appsDir = path.join(standaloneBase, "apps");

  if (!fs.existsSync(serverScript)) {
    console.error("server.js not found at:", serverScript);
    return;
  }

  const env = {
    ...process.env,
    PORT: String(port),
    HOSTNAME: "127.0.0.1",
    NODE_ENV: "production",
  };

  delete env.ELECTRON_RUN_AS_NODE;

  serverProcess = fork(serverScript, [], {
    cwd: appsDir,
    env,
    stdio: "ignore",
  });

  serverProcess.on("error", (err) => {
    console.error("Next server error:", err);
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

function createWindow(startUrl) {
  const iconPath = app.isPackaged
    ? path.join(process.resourcesPath, "app-icon.ico")
    : path.resolve(__dirname, "..", "app-icon.ico");

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    minWidth: 960,
    minHeight: 540,
    title: "Presiden Simulator",
    icon: fs.existsSync(iconPath) ? iconPath : undefined,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      zoomFactor: 1.0,
    },
    userAgent: "NeosantaraClient-Desktop/1.0 (Windows; Electron)",
  });

  mainWindow.webContents.on("did-finish-load", () => {
    applyScreenAdaptiveZoom(mainWindow);
  });

  mainWindow.on("resize", () => {
    applyScreenAdaptiveZoom(mainWindow);
  });

  mainWindow.once("ready-to-show", () => {
    mainWindow.maximize();
    mainWindow.show();
    applyScreenAdaptiveZoom(mainWindow);
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  mainWindow.loadURL(startUrl);
}

app.whenReady().then(async () => {
  let startUrl = process.env.ELECTRON_START_URL;

  if (!startUrl) {
    const port = 3000;
    startUrl = `http://127.0.0.1:${port}`;
    startNextProductionServer(port);
    await waitForServer(startUrl);
  }

  createWindow(startUrl);

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow(startUrl);
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
