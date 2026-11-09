import { MOBILE_PREBAKED_CONTINENTS } from './mobilePrebakedPaths';

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
let cachedContinentPath2Ds: Array<{ color: string; path: Path2D }> | null = null;

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

function getContinentPath2Ds(): Array<{ color: string; path: Path2D }> {
  if (!cachedContinentPath2Ds && typeof Path2D !== 'undefined') {
    cachedContinentPath2Ds = Object.entries(MOBILE_PREBAKED_CONTINENTS)
      .filter(([, d]) => Boolean(d))
      .map(([cont, d]) => ({
        color: continentColor(cont),
        path: new Path2D(d),
      }));
  }
  return cachedContinentPath2Ds || [];
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

  // Gambar daratan benua secara INSTAN (0ms sinkron)
  try {
    const continents = getContinentPath2Ds();
    if (continents.length > 0) {
      ctx.save();
      // viewBox prebaked paths adalah 1000 x 500
      ctx.scale(width / 1000, height / 500);
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';

      for (const { color, path } of continents) {
        ctx.fillStyle = color;
        ctx.fill(path, 'evenodd');
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 0.8;
        ctx.stroke(path);
      }
      ctx.restore();
    }
  } catch {
    // Fallback jika Path2D tidak didukung
  }

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
