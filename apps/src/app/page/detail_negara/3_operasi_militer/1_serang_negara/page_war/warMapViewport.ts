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
}

let rustModulePromise: Promise<RustViewportModule> | null = null;

export function loadRustViewport(): Promise<RustViewportModule> {
  if (!rustModulePromise) {
    rustModulePromise = import("../../../../../../wasm/war-map-viewport/war_map_viewport")
      .catch((error: unknown) => {
        rustModulePromise = null;
        throw error;
      });
  }

  return rustModulePromise;
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

export function scheduleViewportCommit<T extends Viewport>(
  nextView: T,
  viewRef: { current: T },
  pendingRef: { current: T | null },
  frameRef: { current: number | null },
  commit: (view: T) => void,
): void {
  viewRef.current = nextView;
  pendingRef.current = nextView;
  if (frameRef.current !== null) return;

  const commitOnFrame = (timestamp: number) => {
    const elapsed = timestamp - lastViewportCommit;
    if (lastViewportCommit > 0 && elapsed < 16) {
      frameRef.current = requestAnimationFrame(commitOnFrame);
      return;
    }

    lastViewportCommit = timestamp;
    frameRef.current = null;
    const pendingView = pendingRef.current;
    pendingRef.current = null;
    if (pendingView) commit(pendingView);
  };

  frameRef.current = requestAnimationFrame(commitOnFrame);
}

let lastViewportCommit = 0;
