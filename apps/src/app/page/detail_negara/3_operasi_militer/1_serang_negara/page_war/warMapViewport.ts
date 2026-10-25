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
    elapsedMs: number, deltaMs: number, speed: number, group: string,
  ) => Float64Array;
  calculate_attack_radius: (strength: number, group: string, kind: string) => number;
  prepare_unit_attack?: (strength: number, group: string, kind: string) => Float64Array;
  is_target_in_attack_range: (
    originX: number, originY: number, targetX: number, targetY: number, radius: number,
  ) => boolean;
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
      return { radius, projectileSpeed, weaponType };
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
    radius: engine.calculate_attack_radius(strength, group, kind),
    projectileSpeed,
    weaponType,
  };
}

let rustModulePromise: Promise<RustViewportModule> | null = null;

export function loadRustViewport(): Promise<RustViewportModule> {
  if (!rustModulePromise) {
    rustModulePromise = import("../../../../../../wasm/war-map-viewport/war_map_viewport")
      .then(async (module) => {
        await module.default();
        loadedRust = module as unknown as RustViewportModule;
        return module;
      })
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

export function scheduleViewportPreview<T extends Viewport, E extends SVGSVGElement>(
  nextView: T,
  elementRef: { current: E | null },
  viewRef: { current: T },
  pendingRef: { current: T | null },
  frameRef: { current: number | null },
  smooth = false,
): void {
  const element = elementRef.current;
  if (element && !shownViews.has(element)) shownViews.set(element, { ...viewRef.current });
  viewRef.current = nextView;
  pendingRef.current = nextView;
  element?.classList.add('map-navigating');
  if (frameRef.current !== null) return;

  let last = performance.now();
  const tick = (now: number) => {
    frameRef.current = null;
    const el = elementRef.current;
    const target = pendingRef.current;
    if (!el || !target) return;

    const rust = loadedRust;
    const shown = shownViews.get(el);
    if (smooth && rust && shown) {
      const dt = Math.min(now - last, 64);
      last = now;
      const [x, y, w, h, done] = rust.smooth_view(
        shown.x, shown.y, shown.w, shown.h, target.x, target.y, target.w, target.h, dt, 70,
      );
      const stepped = { x, y, w, h };
      shownViews.set(el, stepped);
      applyViewportViewBox(el, stepped);
      if (done < 0.5) frameRef.current = requestAnimationFrame(tick);
      return;
    }
    shownViews.set(el, { x: target.x, y: target.y, w: target.w, h: target.h });
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

function applyViewportViewBox(element: SVGSVGElement, view: Viewport, final = false): void {
  if (!final && drawSnapshot(element, view)) return;
  endSnapshot(element);
  element.setAttribute('viewBox', `${view.x} ${view.y} ${view.w} ${view.h}`);
  if (!final) return;
  const s = snaps.get(element);
  // Saat zoom-out jauh, seluruh SVG hidup sangat berat (animasi + ribuan elemen): tetap tampilkan bitmap statis.
  if (s && s.ready && view.w >= s.world.w * 0.6 && drawSnapshot(element, view)) {
    s.keepView = view;
    return;
  }
  if (s) s.keepView = null;
  endSnapshot(element);
}

/* ───────── Snapshot bitmap: selama geser/zoom peta digambar sebagai gambar (canvas) ───────── */
interface Snap {
  keepView?: Viewport | null;
  img: CanvasImageSource | null;
  canvas: HTMLCanvasElement;
  world: Viewport;
  resolution: number;
  ready: boolean;
  token: number;
  timer: ReturnType<typeof setTimeout> | null;
}
const snaps = new WeakMap<SVGSVGElement, Snap>();

function drawSnapshot(svg: SVGSVGElement, view: Viewport): boolean {
  const s = snaps.get(svg);
  if (!s || !s.ready || !s.img) return false;
  const w = svg.clientWidth, h = svg.clientHeight;
  if (!w || !h) return false;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const scale = Math.min(w / view.w, h / view.h);
  if (scale * dpr > s.resolution) return false;
  const cw = Math.round(w * dpr), ch = Math.round(h * dpr);
  if (s.canvas.width !== cw || s.canvas.height !== ch) { s.canvas.width = cw; s.canvas.height = ch; }
  const ctx = s.canvas.getContext('2d');
  if (!ctx) return false;
  const ox = (w - view.w * scale) / 2, oy = (h - view.h * scale) / 2;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, cw, ch);
  ctx.setTransform(scale * dpr, 0, 0, scale * dpr, (ox - view.x * scale) * dpr, (oy - view.y * scale) * dpr);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(s.img, s.world.x, s.world.y, s.world.w, s.world.h);
  s.canvas.style.display = 'block';
  svg.style.opacity = '0';
  return true;
}

function endSnapshot(svg: SVGSVGElement): void {
  const s = snaps.get(svg);
  if (s) s.canvas.style.display = 'none';
  svg.style.opacity = '';
}

/** Membuat snapshot gambar dari seluruh dunia peta agar pan/zoom cukup menggambar ulang satu bitmap. */
export function attachMapSnapshot(svg: SVGSVGElement, world: Viewport, maxPx = 3072) {
  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;display:none';
  svg.after(canvas);
  const snap: Snap = { img: null, canvas, world, resolution: 0, ready: false, token: 0, timer: null };
  snaps.set(svg, snap);

  const build = () => {
    if (svg.classList.contains('map-navigating')) { snap.timer = setTimeout(build, 500); return; }
    const token = ++snap.token;
    const k = maxPx / Math.max(world.w, world.h);
    const clone = svg.cloneNode(true) as SVGSVGElement;
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    clone.setAttribute('viewBox', `${world.x} ${world.y} ${world.w} ${world.h}`);
    clone.setAttribute('width', String(Math.round(world.w * k)));
    clone.setAttribute('height', String(Math.round(world.h * k)));
    clone.removeAttribute('class');
    clone.removeAttribute('style');
    const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(clone)], { type: 'image/svg+xml;charset=utf-8' }));
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      if (token !== snap.token) return;
      // Rasterisasi SATU KALI ke bitmap tetap; SVG-image langsung akan di-raster ulang tiap skala berubah.
      const raster = document.createElement('canvas');
      raster.width = Math.round(world.w * k);
      raster.height = Math.round(world.h * k);
      const rctx = raster.getContext('2d');
      if (!rctx) return;
      rctx.drawImage(img, 0, 0, raster.width, raster.height);
      snap.img = raster;
      snap.resolution = raster.width / world.w;
      snap.ready = true;
      if (snap.keepView) drawSnapshot(svg, snap.keepView);
    };
    img.onerror = () => URL.revokeObjectURL(url);
    img.src = url;
  };

  return {
    refresh(delay = 800) {
      snap.ready = false;
      // Konten berubah: tampilkan SVG hidup sampai snapshot baru siap (keepView dipertahankan untuk digambar ulang).
      endSnapshot(svg);
      snap.token++;
      if (snap.timer !== null) clearTimeout(snap.timer);
      snap.timer = setTimeout(build, delay);
    },
    dispose() {
      snap.token++;
      if (snap.timer !== null) clearTimeout(snap.timer);
      snaps.delete(svg);
      endSnapshot(svg);
      canvas.remove();
    },
  };
}
