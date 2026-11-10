export interface MapCameraApi {
  end_map_pan_on_map: () => void;
  pan_map_by_on_map: (deltaX: number, deltaY: number) => void;
  zoom_map_at_on_map: (factor: number, x: number, y: number) => void;
}

interface Point {
  x: number;
  y: number;
}

interface ActivePointer extends Point {
  pointerType: string;
  button: number;
}

interface MapGestureControllerOptions {
  camera: () => MapCameraApi | null;
  onGestureStart: () => void;
  onGestureEnd: () => void;
  onWheel: () => void;
}

const DRAG_THRESHOLD_MOUSE = 5;
const DRAG_THRESHOLD_TOUCH = 7;
const WHEEL_LINE_HEIGHT = 16;
const MAX_WHEEL_DELTA_PER_FRAME = 240;

function distance(first: Point, second: Point): number {
  return Math.hypot(first.x - second.x, first.y - second.y);
}

function midpoint(first: Point, second: Point): Point {
  return { x: (first.x + second.x) / 2, y: (first.y + second.y) / 2 };
}

function normalizeWheelDelta(event: WheelEvent): number {
  if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) {
    return event.deltaY * WHEEL_LINE_HEIGHT;
  }
  if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) {
    return event.deltaY * window.innerHeight;
  }
  return event.deltaY;
}

function isAndroidWebView(): boolean {
  return /android/i.test(navigator.userAgent);
}

export function attachMapGestureController(
  canvas: HTMLCanvasElement,
  options: MapGestureControllerOptions,
): () => void {
  const activePointers = new Map<number, ActivePointer>();
  const lastAppliedPointers = new Map<number, Point>();
  const startPointers = new Map<number, Point>();
  const syntheticWheelEvents = new WeakSet<WheelEvent>();
  let animationFrame: number | null = null;
  let wheelAnimationFrame: number | null = null;
  let pendingWheelDelta = 0;
  let pendingWheelPoint: Point | null = null;
  let pointerGestureActive = false;
  let isDragging = false;
  let hadMultiplePointers = false;
  let suppressClickUntil = 0;

  const canvasPoint = (clientX: number, clientY: number): Point => {
    const rect = canvas.getBoundingClientRect();
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const beginGesture = () => {
    if (pointerGestureActive) return;
    pointerGestureActive = true;
    options.onGestureStart();
  };

  const endGesture = () => {
    if (!pointerGestureActive) return;
    pointerGestureActive = false;
    options.camera()?.end_map_pan_on_map();
    options.onGestureEnd();
  };

  const applyPointerFrame = () => {
    animationFrame = null;
    const current = [...activePointers.entries()].slice(0, 2);
    if (current.length === 0) return;

    const first = current[0];
    const firstLast = lastAppliedPointers.get(first[0]) ?? first[1];
    const firstStart = startPointers.get(first[0]) ?? firstLast;
    const firstMovedX = Math.abs(first[1].x - firstStart.x);
    const firstMovedY = Math.abs(first[1].y - firstStart.y);
    const firstMoved = Math.max(firstMovedX, firstMovedY);
    const threshold = first[1].pointerType === 'touch'
      ? DRAG_THRESHOLD_TOUCH
      : DRAG_THRESHOLD_MOUSE;

    if (current.length === 1) {
      const deltaX = first[1].x - firstLast.x;
      const deltaY = first[1].y - firstLast.y;
      if (first[1].pointerType === 'touch' && !isDragging && firstMoved < threshold) return;
      if (first[1].pointerType === 'mouse' && first[1].button !== 0 && first[1].button !== 2) {
        return;
      }
      if (deltaX !== 0 || deltaY !== 0) {
        isDragging ||= firstMoved > threshold;
        beginGesture();
        options.camera()?.pan_map_by_on_map(deltaX, deltaY);
      }
    } else {
      const second = current[1];
      const secondLast = lastAppliedPointers.get(second[0]) ?? second[1];
      const oldDistance = Math.max(1, distance(firstLast, secondLast));
      const newDistance = Math.max(1, distance(first[1], second[1]));
      const oldCenter = midpoint(firstLast, secondLast);
      const newCenter = midpoint(first[1], second[1]);
      const factor = newDistance / oldDistance;
      if (factor !== 1 || oldCenter.x !== newCenter.x || oldCenter.y !== newCenter.y) {
        beginGesture();
        const camera = options.camera();
        camera?.zoom_map_at_on_map(factor, oldCenter.x, oldCenter.y);
        camera?.pan_map_by_on_map(newCenter.x - oldCenter.x, newCenter.y - oldCenter.y);
      }
      hadMultiplePointers = true;
    }

    for (const [pointerId, point] of current) {
      lastAppliedPointers.set(pointerId, { x: point.x, y: point.y });
    }
  };

  const schedulePointerFrame = () => {
    if (animationFrame !== null) return;
    animationFrame = window.requestAnimationFrame(applyPointerFrame);
  };

  const handlePointerDown = (event: PointerEvent) => {
    if (event.pointerType === 'mouse' && event.button !== 0 && event.button !== 2) return;
    if (activePointers.size === 0) suppressClickUntil = 0;

    const point = canvasPoint(event.clientX, event.clientY);
    activePointers.set(event.pointerId, { ...point, pointerType: event.pointerType, button: event.button });
    lastAppliedPointers.set(event.pointerId, point);
    startPointers.set(event.pointerId, point);
    try {
      canvas.setPointerCapture(event.pointerId);
    } catch (error) {
      console.warn('Map pointer capture could not be set.', error);
    }

    if (activePointers.size > 1) {
      hadMultiplePointers = true;
      isDragging = false;
      beginGesture();
    }
  };

  const handlePointerMove = (event: PointerEvent) => {
    const pointer = activePointers.get(event.pointerId);
    if (!pointer) return;
    activePointers.set(event.pointerId, {
      ...canvasPoint(event.clientX, event.clientY),
      pointerType: pointer.pointerType,
      button: pointer.button,
    });
    schedulePointerFrame();
  };

  const handlePointerUp = (event: PointerEvent) => {
    if (!activePointers.has(event.pointerId)) return;
    const pointer = activePointers.get(event.pointerId);
    if (pointer) {
      activePointers.set(event.pointerId, {
        ...canvasPoint(event.clientX, event.clientY),
        pointerType: pointer.pointerType,
        button: pointer.button,
      });
    }
    if (animationFrame !== null) {
      window.cancelAnimationFrame(animationFrame);
      applyPointerFrame();
    }
    activePointers.delete(event.pointerId);
    lastAppliedPointers.delete(event.pointerId);
    startPointers.delete(event.pointerId);

    if (isDragging || hadMultiplePointers) {
      suppressClickUntil = performance.now() + 150;
    }

    if (activePointers.size === 1) {
      const remaining = activePointers.entries().next().value as [number, ActivePointer] | undefined;
      if (remaining) {
        lastAppliedPointers.set(remaining[0], { x: remaining[1].x, y: remaining[1].y });
      }
      isDragging = hadMultiplePointers;
    } else if (activePointers.size === 0) {
      isDragging = false;
      hadMultiplePointers = false;
      endGesture();
    }
  };

  const handlePointerCancel = (event: PointerEvent) => {
    if (!activePointers.has(event.pointerId)) return;
    if (animationFrame !== null) {
      window.cancelAnimationFrame(animationFrame);
      applyPointerFrame();
    }
    activePointers.delete(event.pointerId);
    lastAppliedPointers.delete(event.pointerId);
    startPointers.delete(event.pointerId);
    hadMultiplePointers = true;
    if (activePointers.size === 0) {
      isDragging = false;
      hadMultiplePointers = false;
      endGesture();
      return;
    }

    for (const [pointerId, point] of activePointers) {
      lastAppliedPointers.set(pointerId, { x: point.x, y: point.y });
      startPointers.set(pointerId, { x: point.x, y: point.y });
    }
    isDragging = true;
  };

  const handleClick = (event: MouseEvent) => {
    if (performance.now() > suppressClickUntil) {
      suppressClickUntil = 0;
      return;
    }
    suppressClickUntil = 0;
    event.preventDefault();
    event.stopImmediatePropagation();
  };

  const handleWheel = (event: WheelEvent) => {
    if (syntheticWheelEvents.has(event)) return;

    options.onWheel();
    if (!event.isTrusted) {
      if (event.cancelable) event.preventDefault();
      return;
    }

    const shouldNormalize =
      isAndroidWebView() ||
      event.ctrlKey ||
      event.deltaMode !== WheelEvent.DOM_DELTA_PIXEL;
    if (!shouldNormalize) {
      if (event.cancelable) event.preventDefault();
      return;
    }

    if (event.cancelable) event.preventDefault();
    event.stopImmediatePropagation();
    pendingWheelDelta += normalizeWheelDelta(event);
    pendingWheelPoint = canvasPoint(event.clientX, event.clientY);
    if (wheelAnimationFrame !== null) return;

    wheelAnimationFrame = window.requestAnimationFrame(() => {
      wheelAnimationFrame = null;
      if (!pendingWheelPoint || pendingWheelDelta === 0) return;
      const deltaY = Math.max(
        -MAX_WHEEL_DELTA_PER_FRAME,
        Math.min(MAX_WHEEL_DELTA_PER_FRAME, pendingWheelDelta),
      );
      const point = pendingWheelPoint;
      pendingWheelDelta = 0;
      pendingWheelPoint = null;
      if (isAndroidWebView()) {
        const factor = 1 + deltaY * 0.001;
        if (factor > 0) {
          options.camera()?.zoom_map_at_on_map(factor, point.x, point.y);
        }
        return;
      }

      const syntheticEvent = new WheelEvent('wheel', {
        bubbles: true,
        cancelable: true,
        deltaY,
        deltaMode: WheelEvent.DOM_DELTA_PIXEL,
        clientX: point.x + canvas.getBoundingClientRect().left,
        clientY: point.y + canvas.getBoundingClientRect().top,
      });
      syntheticWheelEvents.add(syntheticEvent);
      canvas.dispatchEvent(syntheticEvent);
    });
  };

  const handleCanvasTouchMove = (event: TouchEvent) => {
    if (event.cancelable) event.preventDefault();
  };

  const handleLostPointerCapture = (event: PointerEvent) => {
    if (activePointers.has(event.pointerId)) handlePointerCancel(event);
  };

  canvas.addEventListener('pointerdown', handlePointerDown, { passive: false });
  canvas.addEventListener('pointermove', handlePointerMove, { passive: false });
  canvas.addEventListener('pointerup', handlePointerUp, { passive: false });
  canvas.addEventListener('pointercancel', handlePointerCancel, { passive: false });
  canvas.addEventListener('lostpointercapture', handleLostPointerCapture);
  canvas.addEventListener('click', handleClick, true);
  canvas.addEventListener('wheel', handleWheel, { capture: true, passive: false });
  canvas.addEventListener('touchmove', handleCanvasTouchMove, { passive: false });

  return () => {
    canvas.removeEventListener('pointerdown', handlePointerDown);
    canvas.removeEventListener('pointermove', handlePointerMove);
    canvas.removeEventListener('pointerup', handlePointerUp);
    canvas.removeEventListener('pointercancel', handlePointerCancel);
    canvas.removeEventListener('lostpointercapture', handleLostPointerCapture);
    canvas.removeEventListener('click', handleClick, true);
    canvas.removeEventListener('wheel', handleWheel, true);
    canvas.removeEventListener('touchmove', handleCanvasTouchMove);
    if (animationFrame !== null) window.cancelAnimationFrame(animationFrame);
    if (wheelAnimationFrame !== null) window.cancelAnimationFrame(wheelAnimationFrame);
    activePointers.clear();
    lastAppliedPointers.clear();
    startPointers.clear();
    endGesture();
  };
}
