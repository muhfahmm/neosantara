import { mergeClaimedTerritories } from './world-map-geometry';
import { COUNTRIES_DATA, CAPITALS_DATA } from './map-data';
import { mapTracker } from './mapLoadTracker';
import { isMobileDevice, optimizeGeojsonForMobile, renderInstantMobileCanvasPreview } from './rust_map_mobile';

export interface MapEngineModule {
  default: (module_or_path?: unknown) => Promise<unknown>;
  start_map_engine: (canvasId: string, geojsonStr: string, countriesData: unknown, capitalsData: unknown) => unknown;
  set_selected_country_on_map: (iso: string, center?: boolean) => void;
  get_country_at_on_map: (x: number, y: number) => {
    iso?: string;
    country?: string;
    name?: string;
    country_name?: string;
    capital?: string;
    selected_city?: string;
    selected_city_id?: string;
    selected_city_owner?: string;
  } | null;
  set_map_horizontal_wrap?: (wrap: boolean) => void;
  set_capitals_on_map: (capitals: unknown[]) => void;
  set_city_ownership_on_map: (cities: unknown[]) => void;
  set_feature_colors_on_map: (colors: Array<string | null>, beatSelected: boolean) => void;
  set_provinces_on_map?: (provincesGeojson: string) => void;
  set_show_province_borders_on_map?: (show: boolean) => void;
  [key: string]: unknown;
}

interface WindowWithMapCache extends Window {
  __neosantara_wasm?: MapEngineModule;
  __neosantara_world_geojson_str?: string;
  neosantara_world_geojson_features?: unknown[];
  __neosantara_shared_map_canvas?: HTMLCanvasElement;
  __neosantara_map_parking_host?: HTMLDivElement;
  __neosantara_map_engine_ready?: boolean;
  __neosantara_map_engine_starting?: Promise<MapEngineModule> | null;
}

let wasmInitPromise: Promise<MapEngineModule> | null = null;
let geojsonPromise: Promise<string> | null = null;
const MAP_ENGINE_WASM_URL = '/map_engine_rs_bg.wasm?v=city-flags-zoom3-tablet-20261110';

function getMapWindow(): WindowWithMapCache | undefined {
  return typeof window !== 'undefined' ? (window as WindowWithMapCache) : undefined;
}

/**
 * Mengembalikan apakah engine peta pada shared canvas sudah pernah diinisialisasi
 * sehingga tidak perlu memanggil start_map_engine atau merender ulang dari awal.
 */
export function isSharedMapEngineReady(): boolean {
  const win = getMapWindow();
  return Boolean(win?.__neosantara_map_engine_ready && win?.__neosantara_shared_map_canvas && win?.__neosantara_wasm);
}

/**
 * Membuat atau mengambil tempat parkir tersembunyi berdimensi penuh untuk menjaga
 * elemen <canvas> tetap hidup saat berpindah halaman.
 */
function getOrCreateParkingHost(): HTMLDivElement | null {
  const win = getMapWindow();
  if (!win || typeof document === 'undefined') return null;

  if (win.__neosantara_map_parking_host && document.body.contains(win.__neosantara_map_parking_host)) {
    return win.__neosantara_map_parking_host;
  }

  let existing = document.getElementById('neosantara-map-parking-host') as HTMLDivElement | null;
  if (!existing) {
    existing = document.createElement('div');
    existing.id = 'neosantara-map-parking-host';
    existing.style.cssText =
      'position:fixed;top:0;left:0;width:100vw;height:100vh;visibility:hidden;pointer-events:none;z-index:-9999;overflow:hidden;';
    document.body.appendChild(existing);
  }
  win.__neosantara_map_parking_host = existing;
  return existing;
}

/**
 * Mengambil atau membuat singleton elemen <canvas> peta yang dipakai bersama
 * sehingga tidak pernah dihancurkan atau dibuat ulang antar halaman.
 */
export function getOrCreateSharedMapCanvas(targetId = 'map-canvas'): HTMLCanvasElement | null {
  const win = getMapWindow();
  if (!win || typeof document === 'undefined') return null;

  if (win.__neosantara_shared_map_canvas) {
    win.__neosantara_shared_map_canvas.id = 'map-canvas';
    return win.__neosantara_shared_map_canvas;
  }

  const canvas = document.createElement('canvas');
  canvas.id = 'map-canvas';
  canvas.className = 'w-full h-full block cursor-pointer';
  win.__neosantara_shared_map_canvas = canvas;

  const parking = getOrCreateParkingHost();
  if (parking && !canvas.parentElement) {
    parking.appendChild(canvas);
    renderInstantMobileCanvasPreview('map-canvas');
  }

  return canvas;
}

/**
 * Memindahkan shared <canvas> yang sudah jadi langsung ke dalam container halaman aktif (0ms).
 */
export function mountSharedMapCanvas(
  container: HTMLElement | null,
  targetId: string,
  className = 'w-full h-full block cursor-pointer'
): HTMLCanvasElement | null {
  if (!container || typeof document === 'undefined') return null;

  // Hapus canvas statis bawaan SSR jika ada dengan id yang sama tapi bukan shared canvas
  const win = getMapWindow();
  const shared = getOrCreateSharedMapCanvas(targetId);
  if (!shared) return null;

  const existingInDom = document.getElementById(targetId);
  if (existingInDom && existingInDom !== shared && existingInDom.parentElement) {
    existingInDom.parentElement.removeChild(existingInDom);
  }

  shared.id = targetId;
  shared.className = className;

  if (shared.parentElement !== container) {
    container.appendChild(shared);
  }

  // Jika engine WASM belum selesai, gambar preview instan agar layar langsung menampilkan peta
  if (!win?.__neosantara_map_engine_ready) {
    renderInstantMobileCanvasPreview(targetId);
  } else {
    // Sinkronkan ukuran viewport segera dan minta engine WASM merender 1 frame instan
    window.dispatchEvent(new Event('resize'));
    requestAnimationFrame(() => {
      window.dispatchEvent(new Event('resize'));
      if (win?.__neosantara_wasm && typeof (win.__neosantara_wasm as any).render === 'function') {
        try {
          (win.__neosantara_wasm as any).render();
        } catch {}
      }
    });
  }

  return shared;
}

/**
 * Memarkir kembali shared <canvas> ke host tersembunyi saat komponen halaman unmount
 * agar konteks WebGL/2D, Path2D cache, dan loop render Rust tetap hidup.
 */
export function parkSharedMapCanvas(canvas?: HTMLCanvasElement | null): void {
  const win = getMapWindow();
  const target = canvas || win?.__neosantara_shared_map_canvas;
  if (!target) return;
  const parking = getOrCreateParkingHost();
  if (parking && target.parentElement !== parking) {
    parking.appendChild(target);
  }
}

export async function loadMapEngineWasm(): Promise<MapEngineModule> {
  const win = getMapWindow();
  if (win?.__neosantara_wasm) {
    return win.__neosantara_wasm;
  }

  if (!wasmInitPromise) {
    const pending = (async () => {
      const mod = await mapTracker.runStage('import_wasm_js', async () => {
        return import('../../../wasm/map-engine-rs/map_engine_rs');
      }, 15000);

      await mapTracker.runStage('instantiate_wasm', async () => {
        try {
          await mod.default(MAP_ENGINE_WASM_URL);
          mapTracker.setStageInfo('instantiate_wasm', `url: ${MAP_ENGINE_WASM_URL}`);
        } catch {
          await mod.default();
          mapTracker.setStageInfo('instantiate_wasm', 'fallback default()');
        }
      }, 20000);

      const typedMod = mod as unknown as MapEngineModule;
      if (win) {
        win.__neosantara_wasm = typedMod;
      }
      return typedMod;
    })();
    wasmInitPromise = pending;
    void pending.catch(() => {
      if (wasmInitPromise === pending) wasmInitPromise = null;
    });
  }
  return wasmInitPromise;
}

export async function loadWorldGeojson(): Promise<string> {
  const win = getMapWindow();
  if (win?.__neosantara_world_geojson_str) {
    return win.__neosantara_world_geojson_str;
  }

  if (!geojsonPromise) {
    const pending = (async () => {
      // JALUR CEPAT MOBILE (Zero-Parse & Pre-merged 439KB GeoJSON):
      // Melewati download 10.33 MB, JSON.parse, mergeClaimedTerritories, dan JSON.stringify
      // di main thread mobile sehingga start_map_engine dapat langsung menerima string pre-baked.
      if (isMobileDevice()) {
        const mobileText = await mapTracker.runStage('fetch_world_geojson', async (signal) => {
          const res = await fetch('/world_mobile.geojson', { cache: 'force-cache', signal });
          if (!res.ok) {
            throw new Error(`HTTP ${res.status} on /world_mobile.geojson`);
          }
          const text = await res.text();
          const ctype = res.headers.get('content-type') || 'application/json';
          mapTracker.setStageInfo(
            'fetch_world_geojson',
            `${res.status} | mobile-fast | ${ctype} | ${(text.length / 1024).toFixed(0)}KB`
          );
          return text;
        }, 20000);

        if (win) {
          win.__neosantara_world_geojson_str = mobileText;
          // Isi neosantara_world_geojson_features secara malas (lazy) di latar belakang
          // setelah canvas utama selesai dirender oleh Rust WASM.
          setTimeout(() => {
            try {
              if (!win.neosantara_world_geojson_features) {
                const parsed = JSON.parse(mobileText) as { features?: unknown[] };
                if (Array.isArray(parsed.features)) {
                  win.neosantara_world_geojson_features = parsed.features;
                  window.dispatchEvent(new Event('world_map_features_ready'));
                }
              }
            } catch {
              // Abaikan jika gagal parse di background
            }
          }, 150);
        }
        return mobileText;
      }

      if (win && Array.isArray(win.neosantara_world_geojson_features)) {
        const optimized = optimizeGeojsonForMobile(
          win.neosantara_world_geojson_features as Record<string, unknown>[]
        );
        const payload = JSON.stringify({
          type: 'FeatureCollection',
          features: optimized,
        });
        win.__neosantara_world_geojson_str = payload;
        return payload;
      }

      const rawText = await mapTracker.runStage('fetch_world_geojson', async (signal) => {
        const res = await fetch('/world.geojson', { cache: 'force-cache', signal });
        if (!res.ok) {
          throw new Error(`HTTP ${res.status} on /world.geojson`);
        }
        const text = await res.text();
        const ctype = res.headers.get('content-type') || 'unknown';
        mapTracker.setStageInfo('fetch_world_geojson', `${res.status} | ${ctype} | ${(text.length / 1024).toFixed(0)}KB`);
        return text;
      }, 20000);

      const geojson = await mapTracker.runStage('json_parse_geojson', async () => {
        const parsed = JSON.parse(rawText) as { type?: string; features?: Record<string, unknown>[] };
        if (!Array.isArray(parsed.features)) {
          throw new Error('Invalid world map GeoJSON payload.');
        }
        return parsed;
      }, 10000);

      const drawableFeatures = await mapTracker.runStage('merge_claimed_territories', async () => {
        const merged = mergeClaimedTerritories(
          (geojson.features ?? []).filter((feature) => Boolean(feature.geometry))
        );
        return optimizeGeojsonForMobile(merged as Record<string, unknown>[]);
      }, 10000);

      const str = await mapTracker.runStage('json_stringify_geojson', async () => {
        geojson.features = drawableFeatures;
        const out = JSON.stringify(geojson);
        mapTracker.setStageInfo('json_stringify_geojson', `${(out.length / 1024).toFixed(0)}KB`);
        return out;
      }, 10000);

      if (win) {
        win.neosantara_world_geojson_features = drawableFeatures;
        win.__neosantara_world_geojson_str = str;
        window.dispatchEvent(new Event('world_map_features_ready'));
      }
      return str;
    })();
    geojsonPromise = pending;
    void pending.catch(() => {
      if (geojsonPromise === pending) geojsonPromise = null;
    });
  }
  return geojsonPromise;
}

/**
 * Menginisialisasi Rust WASM MapEngine HANYA SEKALI pada shared <canvas>.
 * Pemanggilan berikutnya langsung mengembalikan instance yang sudah siap (0ms)
 * tanpa menyiapkan ulang atau merender ulang dari awal.
 */
export async function ensureSharedMapEngineInitialized(
  targetCanvasId = 'map-canvas',
  customCapitals?: unknown[]
): Promise<{ mod: MapEngineModule; reused: boolean }> {
  const win = getMapWindow();
  const sharedCanvas = getOrCreateSharedMapCanvas('map-canvas');

  if (win?.__neosantara_map_engine_ready && win.__neosantara_wasm && sharedCanvas) {
    sharedCanvas.id = 'map-canvas';
    if (customCapitals) {
      win.__neosantara_wasm.set_capitals_on_map(customCapitals);
    }
    window.dispatchEvent(new Event('resize'));
    return { mod: win.__neosantara_wasm, reused: true };
  }

  if (win?.__neosantara_map_engine_starting) {
    const mod = await win.__neosantara_map_engine_starting;
    if (sharedCanvas) sharedCanvas.id = 'map-canvas';
    if (customCapitals) {
      mod.set_capitals_on_map(customCapitals);
    }
    window.dispatchEvent(new Event('resize'));
    return { mod, reused: true };
  }

  const startPromise = (async () => {
    const [mod, geojsonStr] = await Promise.all([
      loadMapEngineWasm(),
      loadWorldGeojson(),
    ]);

    const canvas = getOrCreateSharedMapCanvas('map-canvas');
    if (canvas) {
      canvas.id = 'map-canvas';
    }

    await mapTracker.runStage('start_map_engine', async () => {
      const el = document.getElementById('map-canvas');
      mapTracker.setStageInfo('start_map_engine', `canvasInDom: ${Boolean(el)} | reused: false`);
      mod.start_map_engine(
        'map-canvas',
        geojsonStr,
        COUNTRIES_DATA,
        customCapitals ?? CAPITALS_DATA
      );
    }, 15000);

    if (win) {
      win.__neosantara_map_engine_ready = true;
    }
    return mod;
  })();

  if (win) {
    win.__neosantara_map_engine_starting = startPromise;
  }

  try {
    const mod = await startPromise;
    return { mod, reused: false };
  } finally {
    if (win && win.__neosantara_map_engine_starting === startPromise) {
      win.__neosantara_map_engine_starting = null;
    }
  }
}

/**
 * Menyiapkan dan merender shared <canvas> di latar belakang sejak menu utama dibuka
 * sehingga ketika pemain masuk ke Pilih Negara atau Peta Utama, canvas sudah jadi 100%.
 */
export function preloadMapAssets(): void {
  if (typeof window === 'undefined') return;
  // Buat shared canvas dan gambar preview daratan 0ms segera
  getOrCreateSharedMapCanvas('map-canvas');
  // Mulai inisialisasi WASM + GeoJSON setelah jeda singkat agar tidak berebut bandwidth dengan hidrasi awal
  setTimeout(() => {
    void ensureSharedMapEngineInitialized('map-canvas').catch(() => {});
  }, 120);
}
