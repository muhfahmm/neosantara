import { mergeClaimedTerritories } from './world-map-geometry';
import { COUNTRIES_DATA, CAPITALS_DATA } from './map-data';

interface MapEngineModule {
  default: (module_or_path?: any) => Promise<any>;
  start_map_engine: (canvasId: string, geojsonStr: string, countriesData: any, capitalsData: any) => any;
  set_selected_country_on_map: (iso: string) => void;
  get_country_at_on_map: (x: number, y: number) => any;
  set_map_horizontal_wrap?: (wrap: boolean) => void;
  [key: string]: any;
}

let wasmInitPromise: Promise<MapEngineModule> | null = null;
let geojsonPromise: Promise<string> | null = null;

export async function loadMapEngineWasm(): Promise<MapEngineModule> {
  if (typeof window !== 'undefined' && (window as any).__neosantara_wasm) {
    return (window as any).__neosantara_wasm;
  }

  if (!wasmInitPromise) {
    wasmInitPromise = (async () => {
      // Static dynamic import so bundlers can resolve it consistently
      const mod = await import('@/wasm/map-engine-rs/map_engine_rs');
      await mod.default();
      if (typeof window !== 'undefined') {
        (window as any).__neosantara_wasm = mod;
      }
      return mod as unknown as MapEngineModule;
    })();
  }
  return wasmInitPromise;
}

export async function loadWorldGeojson(): Promise<string> {
  if (typeof window !== 'undefined' && (window as any).__neosantara_world_geojson_str) {
    return (window as any).__neosantara_world_geojson_str;
  }

  if (!geojsonPromise) {
    geojsonPromise = (async () => {
      // 1. Check if features already cached on window
      if (typeof window !== 'undefined' && Array.isArray((window as any).neosantara_world_geojson_features)) {
        const payload = JSON.stringify({
          type: 'FeatureCollection',
          features: (window as any).neosantara_world_geojson_features,
        });
        (window as any).__neosantara_world_geojson_str = payload;
        return payload;
      }

      // 2. Fetch from static file
      const res = await fetch('/world.geojson', { cache: 'force-cache' });
      if (!res.ok) {
        throw new Error(`Failed to load world map data: HTTP ${res.status}`);
      }
      const rawText = await res.text();
      const geojson = JSON.parse(rawText);
      if (!Array.isArray(geojson.features)) {
        throw new Error('Invalid world map GeoJSON payload.');
      }
      const drawableFeatures = mergeClaimedTerritories(
        geojson.features.filter((feature: { geometry?: unknown }) => feature.geometry)
      );
      geojson.features = drawableFeatures;
      const str = JSON.stringify(geojson);

      if (typeof window !== 'undefined') {
        (window as any).neosantara_world_geojson_features = drawableFeatures;
        (window as any).__neosantara_world_geojson_str = str;
        window.dispatchEvent(new Event('world_map_features_ready'));
      }
      return str;
    })();
  }
  return geojsonPromise;
}

/**
 * Preload both map engine and geojson in background during idle time
 */
export function preloadMapAssets(): void {
  if (typeof window === 'undefined') return;
  const runner = () => {
    loadWorldGeojson().catch(() => {});
    loadMapEngineWasm().catch(() => {});
  };
  if (typeof (window as any).requestIdleCallback === 'function') {
    (window as any).requestIdleCallback(runner, { timeout: 2000 });
  } else {
    setTimeout(runner, 500);
  }
}

