import { MOBILE_PREBAKED_LAND_PATHS } from './mobilePrebakedPaths';

let cachedPrebakedPath2D: Path2D[] | null = null;

function getPrebakedPath2DList(): Path2D[] {
  if (cachedPrebakedPath2D) return cachedPrebakedPath2D;
  if (typeof Path2D === 'undefined') return [];
  cachedPrebakedPath2D = MOBILE_PREBAKED_LAND_PATHS.map((d) => new Path2D(d));
  return cachedPrebakedPath2D;
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
 * Merender pratinjau peta dunia taktis secara instan (0ms) ke elemen canvas
 * menggunakan Path2D terkompilasi sebelum engine WASM Rust selesai menginisialisasi data penuh.
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

  // Background samudra gelap sesuai warna engine Rust
  ctx.fillStyle = '#06101a';
  ctx.fillRect(0, 0, width, height);

  // Grid taktis tipis
  ctx.strokeStyle = 'rgba(20, 184, 166, 0.08)';
  ctx.lineWidth = 1;
  const stepX = width / 12;
  const stepY = height / 6;
  ctx.beginPath();
  for (let x = stepX; x < width; x += stepX) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
  }
  for (let y = stepY; y < height; y += stepY) {
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
  }
  ctx.stroke();

  // Render siluet daratan dunia nyata instan dari MOBILE_PREBAKED_LAND_PATHS (viewBox 1000 x 500)
  const paths = getPrebakedPath2DList();
  if (paths.length > 0) {
    ctx.save();
    ctx.scale(width / 1000, height / 500);
    ctx.fillStyle = '#153e35';
    ctx.strokeStyle = 'rgba(45, 212, 191, 0.55)';
    ctx.lineWidth = 0.7;
    for (let i = 0; i < paths.length; i++) {
      ctx.fill(paths[i]);
      ctx.stroke(paths[i]);
    }
    ctx.restore();
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
