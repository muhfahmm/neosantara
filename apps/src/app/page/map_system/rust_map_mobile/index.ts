import { MOBILE_PREBAKED_LAND_PATHS } from './mobilePrebakedPaths';

interface PreviewFeature {
  properties?: { CONTINENT?: string };
  geometry?: {
    type?: string;
    coordinates?: unknown;
  };
}

interface PreviewFeatureCollection {
  features?: PreviewFeature[];
}

let previewFeaturesPromise: Promise<PreviewFeature[]> | null = null;
let cachedPrebakedPath2Ds: Path2D[] | null = null;

function getPrebakedPath2Ds(): Path2D[] {
  if (!cachedPrebakedPath2Ds && typeof Path2D !== 'undefined') {
    cachedPrebakedPath2Ds = MOBILE_PREBAKED_LAND_PATHS.map((d) => new Path2D(d));
  }
  return cachedPrebakedPath2Ds || [];
}

function getPreviewFeatures(): Promise<PreviewFeature[]> {
  if (!previewFeaturesPromise) {
    const url = isMobileDevice() ? '/world_mobile.geojson' : '/world.geojson';
    previewFeaturesPromise = fetch(url, { cache: 'force-cache' })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status} while loading ${url}`);
        }
        return response.json() as Promise<PreviewFeatureCollection>;
      })
      .then((collection) => {
        if (!Array.isArray(collection.features)) {
          throw new Error(`Invalid GeoJSON preview payload from ${url}`);
        }
        return collection.features;
      })
      .catch((error: unknown) => {
        previewFeaturesPromise = null;
        throw error;
      });
  }
  return previewFeaturesPromise;
}

function continentColor(continent: string | undefined): string {
  switch (continent) {
    case 'Asia': return '#2e7d32';
    case 'Africa': return '#d97706';
    case 'Europe': return '#2563eb';
    case 'North America': return '#0d9488';
    case 'South America': return '#ea580c';
    case 'Oceania': return '#0284c7';
    case 'Antarctica': return '#e2e8f0';
    default: return '#475569';
  }
}

export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent || '';
  return (
    /Android|iPhone|iPad|iPod/i.test(ua) ||
    window.location.origin.includes('tauri.localhost') ||
    window.innerWidth <= 1024
  );
}

/**
 * Merender peta dari path SVG pre-baked secara instan (0ms sinkron)
 * sebelum engine WASM selesai memproses, sehingga layar tidak pernah kosong atau biru polos.
 */
export function renderInstantMobileCanvasPreview(canvasId: string): boolean {
  if (typeof document === 'undefined') return false;
  const el = document.getElementById(canvasId);
  if (!(el instanceof HTMLCanvasElement)) return false;

  const rect = el.getBoundingClientRect();
  const width = Math.max(rect.width || window.innerWidth, 320);
  const height = Math.max(rect.height || window.innerHeight, 240);
  if (el.width !== width || el.height !== height) {
    el.width = width;
    el.height = height;
  }

  const ctx = el.getContext('2d');
  if (!ctx) return false;

  // Latar belakang laut/samudra
  ctx.fillStyle = '#0f244a';
  ctx.fillRect(0, 0, width, height);

  // 1. Coba gambar secara INSTAN (0ms) menggunakan prebaked Path2D daratan dunia
  try {
    const paths = getPrebakedPath2Ds();
    if (paths.length > 0) {
      ctx.save();
      // viewBox prebaked paths adalah 1000 x 500
      ctx.scale(width / 1000, height / 500);
      ctx.fillStyle = '#1e3a5f';
      ctx.strokeStyle = 'rgba(74, 222, 128, 0.4)';
      ctx.lineWidth = 1;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';

      for (const p of paths) {
        ctx.fill(p);
        ctx.stroke(p);
      }
      ctx.restore();
    }
  } catch {
    // Fallback jika Path2D tidak didukung
  }

  // 2. Jika ada GeoJSON features, detail warna benua akan ditimpa secara asinkron
  void getPreviewFeatures()
    .then((features) => {
      const mapWindow = window as Window & { __neosantara_map_engine_ready?: boolean };
      if (mapWindow.__neosantara_map_engine_ready || !el.isConnected) return;

      const previewContext = el.getContext('2d');
      if (!previewContext) return;
      previewContext.fillStyle = '#0f244a';
      previewContext.fillRect(0, 0, width, height);
      previewContext.lineJoin = 'round';
      previewContext.lineCap = 'round';

      const traceRing = (ring: unknown, context: CanvasRenderingContext2D) => {
        if (!Array.isArray(ring) || ring.length < 2) return;
        let started = false;
        for (const point of ring) {
          if (!Array.isArray(point) || typeof point[0] !== 'number' || typeof point[1] !== 'number') continue;
          const x = ((point[0] + 180) / 360) * width;
          const y = ((90 - point[1]) / 180) * height;
          if (!started) {
            context.moveTo(x, y);
            started = true;
          } else {
            context.lineTo(x, y);
          }
        }
        if (started) context.closePath();
      };

      for (const feature of features) {
        const geometry = feature.geometry;
        if (!geometry?.coordinates) continue;
        const polygons = geometry.type === 'Polygon'
          ? [geometry.coordinates]
          : geometry.type === 'MultiPolygon' && Array.isArray(geometry.coordinates)
            ? geometry.coordinates
            : [];
        if (polygons.length === 0) continue;

        previewContext.beginPath();
        for (const polygon of polygons) {
          if (!Array.isArray(polygon)) continue;
          for (const ring of polygon) traceRing(ring, previewContext);
        }
        previewContext.fillStyle = continentColor(feature.properties?.CONTINENT);
        previewContext.fill('evenodd');
        previewContext.strokeStyle = 'rgba(255, 255, 255, 0.75)';
        previewContext.lineWidth = 0.85;
        previewContext.stroke();
      }
    })
    .catch((error: unknown) => {
      console.error('Failed to render GeoJSON map preview:', error);
    });

  return true;
}

interface GeoJsonGeometry {
  type?: string;
  coordinates?: unknown;
}

interface GeoJsonFeature {
  type?: string;
  properties?: Record<string, unknown>;
  geometry?: GeoJsonGeometry;
  [key: string]: unknown;
}

function decimateCoordinateRing(ring: unknown[], toleranceSq: number): unknown[] {
  if (ring.length <= 10) return ring;
  const result: unknown[] = [ring[0]];
  let lastPt = ring[0];

  for (let i = 1; i < ring.length - 1; i++) {
    const pt = ring[i];
    if (
      Array.isArray(pt) &&
      Array.isArray(lastPt) &&
      typeof pt[0] === 'number' &&
      typeof pt[1] === 'number' &&
      typeof lastPt[0] === 'number' &&
      typeof lastPt[1] === 'number'
    ) {
      const dx = pt[0] - lastPt[0];
      const dy = pt[1] - lastPt[1];
      if (dx * dx + dy * dy >= toleranceSq) {
        result.push([Number(pt[0].toFixed(3)), Number(pt[1].toFixed(3))]);
        lastPt = pt;
      }
    } else {
      result.push(pt);
    }
  }

  result.push(ring[ring.length - 1]);
  return result.length >= 4 ? result : ring;
}

/**
 * Mengoptimalkan koordinat GeoJSON untuk perangkat mobile agar ukuran payload string
 * dan waktu parsing Rust WASM berkurang drastis tanpa mengubah bentuk peta.
 */
export function optimizeGeojsonForMobile<T extends GeoJsonFeature>(features: T[]): T[] {
  if (!isMobileDevice()) return features;
  // Toleransi ~0.04 derajat (~0.0016 kuadrat) menjaga akurasi batas negara di layar mobile
  const toleranceSq = 0.0016;

  return features.map((feature) => {
    const geom = feature.geometry;
    if (!geom || !Array.isArray(geom.coordinates)) return feature;

    if (geom.type === 'Polygon') {
      const rings = geom.coordinates.map((ring) =>
        Array.isArray(ring) ? decimateCoordinateRing(ring, toleranceSq) : ring
      );
      return {
        ...feature,
        geometry: {
          ...geom,
          coordinates: rings,
        },
      };
    }

    if (geom.type === 'MultiPolygon') {
      const polygons = geom.coordinates.map((poly) =>
        Array.isArray(poly)
          ? poly.map((ring) =>
              Array.isArray(ring) ? decimateCoordinateRing(ring, toleranceSq) : ring
            )
          : poly
      );
      return {
        ...feature,
        geometry: {
          ...geom,
          coordinates: polygons,
        },
      };
    }

    return feature;
  });
}
