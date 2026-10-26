import { getUnitAttackRadius } from './combatDamage';

type Viewport = { x: number; y: number; w: number; h: number };

export interface ViewportBounds {
  boxWidth: number;
  boxHeight: number;
  minWidth: number;
  maxWidth: number;
  worldWidth: number;
  worldHeight: number;
}

interface RustViewportModule {
  default: () => Promise<unknown>;
  zoom_view: (
    x: number, y: number, width: number, height: number,
    boxWidth: number, boxHeight: number, pointerX: number, pointerY: number,
    factor: number, minWidth: number, maxWidth: number, worldWidth: number, worldHeight: number,
  ) => Float64Array;
  pan_view: (
    x: number, y: number, width: number, height: number,
    boxWidth: number, boxHeight: number, deltaX: number, deltaY: number,
    minWidth: number, maxWidth: number, worldWidth: number, worldHeight: number,
  ) => Float64Array;
  smooth_view: (
    x: number, y: number, width: number, height: number,
    targetX: number, targetY: number, targetWidth: number, targetHeight: number,
    dtMs: number, timeConstantMs: number,
  ) => Float64Array;
  prepare_unit_movement: (
    targetX: number, targetY: number, worldWidth: number, worldHeight: number, group: string,
  ) => Float64Array;
  step_unit_movement: (
    startX: number, startY: number, targetX: number, targetY: number,
    elapsedMs: number, deltaMs: number, speed: number, group: string, kind: string,
  ) => Float64Array;

  calculate_attack_radius: (strength: number, group: string, kind: string) => number;
  prepare_unit_attack?: (strength: number, group: string, kind: string) => Float64Array;
  is_target_in_attack_range: (
    originX: number, originY: number, targetX: number, targetY: number, radius: number,
  ) => boolean;
  check_boundary_cross?: (
    unitX: number, unitY: number, mapType: string, playerSide: string,
  ) => boolean;
  calculate_ai_border_response?: (
    invaderX: number, invaderY: number, invaderGroup: string, mapType: string, playerSide: string, threatQuantity: number,
  ) => Float64Array;
}

export interface AiBorderResponse {
  shouldScramble: boolean;
  alertLevel: number;
  spawnInfantry: number;
  spawnTank: number;
  spawnApc: number;
  spawnOrigin: { x: number; y: number };
  interceptTarget: { x: number; y: number };
}

export function evaluateBorderIncursion(
  engine: RustViewportModule,
  invaderX: number,
  invaderY: number,
  invaderGroup: string,
  mapType: 'land' | 'sea',
  playerSide: 'attacker' | 'defender',
  threatQuantity: number,
): AiBorderResponse | null {
  if (engine.calculate_ai_border_response) {
    const raw = engine.calculate_ai_border_response(
      invaderX, invaderY, invaderGroup, mapType, playerSide, threatQuantity,
    );
    if (raw && raw[0] >= 0.5) {
      return {
        shouldScramble: true,
        alertLevel: raw[1],
        spawnInfantry: raw[2],
        spawnTank: raw[3],
        spawnApc: raw[4],
        spawnOrigin: { x: raw[5], y: raw[6] },
        interceptTarget: { x: raw[7], y: raw[8] },
      };
    }
  }
  return null;
}

let loadedRust: RustViewportModule | null = null;
const shownViews = new WeakMap<SVGSVGElement, Viewport>();
let warnedAboutAttackCompatibility = false;

export interface UnitAttackProfile {
  radius: number;
  projectileSpeed: number;
  weaponType: number;
}

export function prepareUnitAttack(
  engine: RustViewportModule,
  strength: number,
  group: string,
  kind: string,
): UnitAttackProfile {
  const result = engine.prepare_unit_attack?.(strength, group, kind);
  if (result && result.length >= 3) {
    const [radius, projectileSpeed, weaponType] = result;
    if ([radius, projectileSpeed, weaponType].every(Number.isFinite) && projectileSpeed > 0) {
      return { radius: getUnitAttackRadius(kind, strength), projectileSpeed, weaponType };
    }
    throw new Error('Rust attack engine returned an invalid attack profile');
  }

  if (!warnedAboutAttackCompatibility) {
    console.warn('[warMapViewport] Loaded WASM is missing prepare_unit_attack; using compatible attack profile');
    warnedAboutAttackCompatibility = true;
  }

  const weaponType = kind === 'artileriBerat' || kind === 'peluncurRoket'
    ? 0
    : group === 'udara'
      ? 1
      : kind === 'kapalSelamNuklir' || kind === 'kapalSelamReguler'
        ? 2
        : group === 'laut'
          ? 3
          : 4;
  const projectileSpeed = [1350, 2400, 900, 1600, 1800][weaponType];
  return {
    radius: getUnitAttackRadius(kind, strength),
    projectileSpeed,
    weaponType,
  };
}

let rustModulePromise: Promise<RustViewportModule> | null = null;

export function loadRustViewport(): Promise<RustViewportModule> {
  if (rustModulePromise) return rustModulePromise;

  const loading = import("../../../../../../wasm/war-map-viewport/war_map_viewport")
    .then(async (module) => {
      await module.default();
      loadedRust = module as unknown as RustViewportModule;
      return module;
    })
    .catch((error: unknown) => {
      rustModulePromise = null;
      throw error;
    });
  rustModulePromise = loading;
  return loading;
}

function clampViewport(
  x: number,
  y: number,
  width: number,
  bounds: ViewportBounds,
): Viewport {
  const aspect = bounds.boxWidth / bounds.boxHeight;
  const w = Math.max(bounds.minWidth, Math.min(Math.max(bounds.minWidth, bounds.maxWidth), width));
  const h = w / aspect;
  return {
    x: Math.max(0, Math.min(bounds.worldWidth - w, x)),
    y: h >= bounds.worldHeight
      ? (bounds.worldHeight - h) / 2
      : Math.max(0, Math.min(bounds.worldHeight - h, y)),
    w,
    h,
  };
}

export function zoomViewport(
  view: Viewport,
  bounds: ViewportBounds,
  pointerX: number,
  pointerY: number,
  factor: number,
  rust?: RustViewportModule,
): Viewport {
  if (rust) {
    const [x, y, w, h] = rust.zoom_view(
      view.x, view.y, view.w, view.h,
      bounds.boxWidth, bounds.boxHeight, pointerX, pointerY, factor,
      bounds.minWidth, bounds.maxWidth, bounds.worldWidth, bounds.worldHeight,
    );
    return { x, y, w, h };
  }

  const scale = Math.min(bounds.boxWidth / view.w, bounds.boxHeight / view.h);
  const offsetX = (bounds.boxWidth - view.w * scale) / 2;
  const offsetY = (bounds.boxHeight - view.h * scale) / 2;
  const nextWidth = view.w / factor;
  const nextHeight = nextWidth / (bounds.boxWidth / bounds.boxHeight);
  const nextScale = Math.min(bounds.boxWidth / nextWidth, bounds.boxHeight / nextHeight);
  const worldX = view.x + (pointerX - offsetX) / scale;
  const worldY = view.y + (pointerY - offsetY) / scale;
  return clampViewport(
    worldX - (pointerX - offsetX) / nextScale,
    worldY - (pointerY - offsetY) / nextScale,
    nextWidth,
    bounds,
  );
}

export function panViewport(
  view: Viewport,
  bounds: ViewportBounds,
  deltaX: number,
  deltaY: number,
  rust?: RustViewportModule,
): Viewport {
  if (rust) {
    const [x, y, w, h] = rust.pan_view(
      view.x, view.y, view.w, view.h,
      bounds.boxWidth, bounds.boxHeight, deltaX, deltaY,
      bounds.minWidth, bounds.maxWidth, bounds.worldWidth, bounds.worldHeight,
    );
    return { x, y, w, h };
  }

  const scale = Math.min(bounds.boxWidth / view.w, bounds.boxHeight / view.h);
  return clampViewport(
    view.x - deltaX / scale,
    view.y - deltaY / scale,
    view.w,
    bounds,
  );
}

export function scheduleViewportPreview<T extends Viewport, E extends SVGSVGElement>(
  nextView: T,
  elementRef: { current: E | null },
  viewRef: { current: T },
  pendingRef: { current: T | null },
  frameRef: { current: number | null },
  smooth = false,
): void {
  const element = elementRef.current;
  viewRef.current = nextView;
  pendingRef.current = nextView;
  element?.classList.add('map-navigating');
  if (frameRef.current !== null) return;

  const tick = () => {
    frameRef.current = null;
    const el = elementRef.current;
    const target = pendingRef.current;
    if (!el || !target) return;
    applyViewportViewBox(el, target);
  };
  frameRef.current = requestAnimationFrame(tick);
}

export function flushViewportPreview<T extends Viewport, E extends SVGSVGElement>(
  elementRef: { current: E | null },
  viewRef: { current: T },
  pendingRef: { current: T | null },
  frameRef: { current: number | null },
): T | null {
  if (frameRef.current !== null) {
    cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
  }

  const pendingView = pendingRef.current;
  if (!pendingView) return null;

  const element = elementRef.current;
  if (element) {
    applyViewportViewBox(element, pendingView, true);
    shownViews.set(element, { x: pendingView.x, y: pendingView.y, w: pendingView.w, h: pendingView.h });
    element.classList.remove('map-navigating');
  }
  pendingRef.current = null;
  return viewRef.current;
}

function applyViewportViewBox(element: SVGSVGElement, view: Viewport, _final = false): void {
  const x = Math.round(view.x * 10) / 10;
  const y = Math.round(view.y * 10) / 10;
  const w = Math.round(view.w * 10) / 10;
  const h = Math.round(view.h * 10) / 10;
  const nextVal = `${x} ${y} ${w} ${h}`;
  if (element.getAttribute('viewBox') !== nextVal) {
    element.setAttribute('viewBox', nextVal);
  }
}

/** Snapshot helper no-op (menghilangkan overhead XMLSerializer dan DOM cloning pada SVG) */
export function attachMapSnapshot(_svg: SVGSVGElement, _world: Viewport, _maxPx = 3072) {
  return {
    refresh(_delay = 800) {},
    dispose() {},
  };
}
