const { app, BrowserWindow, screen } = require("electron");

const startUrl = process.env.ELECTRON_START_URL || "http://localhost:3000";

function applyScreenAdaptiveZoom(window) {
  if (!window || window.isDestroyed()) return;
  const bounds = window.getBounds();
  // Monitor Desktop (lebar layar >= 1800px): pertahankan zoom 1.15 persis seperti yang sudah Anda sukai
  // Layar Laptop (lebar layar < 1800px): set zoom ke 0.80 agar modal mengecil secara proporsional dan tidak menabrak Time Controller
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

function createWindow() {
  const window = new BrowserWindow({
    width: 1280,
    height: 720,
    minWidth: 960,
    minHeight: 540,
    title: "Presiden Simulator",
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      zoomFactor: 1.0,
    },
  });

  window.webContents.on("did-finish-load", () => {
    applyScreenAdaptiveZoom(window);
  });

  window.on("resize", () => {
    applyScreenAdaptiveZoom(window);
  });

  window.once("ready-to-show", () => {
    window.maximize();
    window.show();
    applyScreenAdaptiveZoom(window);
  });

  window.loadURL(startUrl);
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
