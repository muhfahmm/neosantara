import http from "node:http";

function fetchUrl(url) {
  return new Promise((resolve) => {
    http
      .get(url, (res) => {
        res.resume();
        res.on("end", () => resolve(res.statusCode));
      })
      .on("error", () => resolve(null));
  });
}

export async function waitForServerReady(port, maxAttempts = 60) {
  const url = `http://127.0.0.1:${port}/`;
  for (let i = 0; i < maxAttempts; i++) {
    const status = await fetchUrl(url);
    if (status !== null) return true;
    await new Promise((r) => setTimeout(r, 500));
  }
  return false;
}

export async function warmupDevServer(port) {
  console.log(`[Warmup] Menghangatkan Next.js dev server pada port ${port}...`);
  const t0 = performance.now();
  const routes = [
    `http://127.0.0.1:${port}/`,
    `http://127.0.0.1:${port}/page`,
    `http://127.0.0.1:${port}/page/map_system/pilih-negara`,
    `http://127.0.0.1:${port}/page/map_system`,
    `http://127.0.0.1:${port}/api/game-bootstrap`,
    `http://127.0.0.1:${port}/world_mobile.geojson`,
    `http://127.0.0.1:${port}/map_engine_rs_bg.wasm`,
  ];

  await Promise.all(
    routes.map(async (url) => {
      try {
        const code = await fetchUrl(url);
        console.log(`[Warmup] ${new URL(url).pathname} -> HTTP ${code}`);
      } catch (err) {
        console.warn(`[Warmup] Warning on ${url}:`, err.message);
      }
    })
  );
  const elapsed = Math.round(performance.now() - t0);
  console.log(`[Warmup] Selesai dalam ${elapsed} ms. Halaman telah terkompilasi!`);
}

if (process.argv[1] && process.argv[1].endsWith("warmup.mjs")) {
  const port = Number(process.argv[2]) || 3000;
  waitForServerReady(port)
    .then((ok) => {
      if (ok) return warmupDevServer(port);
      console.warn(`[Warmup] Dev server tidak merespons dalam batas waktu.`);
    })
    .catch(console.error);
}

