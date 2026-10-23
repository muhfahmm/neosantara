import initializeWasm, {
  great_circle_distance_km,
  project_map_point,
  project_route_geometry,
  quadratic_motion,
} from '../../../wasm/path-logic-rs/route_math.js';

interface RouteProjectionInput {
  originLat: number;
  originLng: number;
  targetLat: number;
  targetLng: number;
  rectLeft: number;
  rectTop: number;
  rectWidth: number;
  rectHeight: number;
  canvasWidth: number;
  canvasHeight: number;
  scale: number;
  offsetX: number;
  offsetY: number;
  worldCssWidth: number;
  windowWidth: number;
  curvature: number;
}

let initialization: Promise<void> | null = null;
let ready = false;

export function initializeRouteMathRust(): Promise<void> {
  if (initialization) return initialization;
  const pendingInitialization = initializeWasm()
    .then(() => {
      ready = true;
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('neosantara_map_camera'));
      }
    })
    .catch((error: unknown) => {
      initialization = null;
      console.error('Rust path math initialization failed; using TypeScript calculations:', error);
    });
  initialization = pendingInitialization;
  return pendingInitialization;
}

export function isRouteMathRustReady(): boolean {
  return ready;
}

export function projectMapPointRust(
  latitude: number,
  longitude: number,
  rectLeft: number,
  rectTop: number,
  rectWidth: number,
  rectHeight: number,
  canvasWidth: number,
  canvasHeight: number,
  scale: number,
  offsetX: number,
  offsetY: number,
  worldCssWidth: number,
  windowWidth: number,
): [number, number] | null {
  if (!ready) return null;
  const result = project_map_point(
    latitude,
    longitude,
    rectLeft,
    rectTop,
    rectWidth,
    rectHeight,
    canvasWidth,
    canvasHeight,
    scale,
    offsetX,
    offsetY,
    worldCssWidth,
    windowWidth,
  );
  return [result[0], result[1]];
}

export function projectRouteGeometryRust(
  input: RouteProjectionInput,
): [number, number, number, number, number, number] | null {
  if (!ready) return null;
  const result = project_route_geometry(
    input.originLat,
    input.originLng,
    input.targetLat,
    input.targetLng,
    input.rectLeft,
    input.rectTop,
    input.rectWidth,
    input.rectHeight,
    input.canvasWidth,
    input.canvasHeight,
    input.scale,
    input.offsetX,
    input.offsetY,
    input.worldCssWidth,
    input.windowWidth,
    input.curvature,
  );
  return [result[0], result[1], result[2], result[3], result[4], result[5]];
}

export function quadraticMotionRust(
  startX: number,
  startY: number,
  controlX: number,
  controlY: number,
  endX: number,
  endY: number,
  progress: number,
): [number, number, number] | null {
  if (!ready) return null;
  const result = quadratic_motion(
    startX,
    startY,
    controlX,
    controlY,
    endX,
    endY,
    progress,
  );
  return [result[0], result[1], result[2]];
}

export function greatCircleDistanceKmRust(
  originLat: number,
  originLng: number,
  targetLat: number,
  targetLng: number,
): number | null {
  return ready
    ? great_circle_distance_km(originLat, originLng, targetLat, targetLng)
    : null;
}
