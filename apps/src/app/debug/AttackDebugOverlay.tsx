'use client';

import { useEffect, useId, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import type { AttackDebugPoint, AttackDebugRoute } from './attackDebugLogic';

type AttackDebugOverlayProps = {
  route: AttackDebugRoute;
  durationMs?: number;
  onComplete: () => void;
};

type MapCamera = {
  scale?: number;
  offsetX?: number;
  offsetY?: number;
};

type ScreenPoint = AttackDebugPoint;

const isDevelopment = process.env.NODE_ENV !== 'production';
const subscribeClientState = () => () => {};
const getClientState = () => true;
const getServerClientState = () => false;
const subscribeReducedMotion = (onChange: () => void) => {
  if (typeof window === 'undefined') return () => {};
  const query = window.matchMedia('(prefers-reduced-motion: reduce)');
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
};
const getReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const getServerReducedMotion = () => false;

export function AttackDebugOverlay({
  route,
  durationMs = 3500,
  onComplete,
}: AttackDebugOverlayProps) {
  const ready = useSyncExternalStore(
    subscribeClientState,
    getClientState,
    getServerClientState
  );
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotion,
    getServerReducedMotion
  );
  const [screenPoints, setScreenPoints] = useState<ScreenPoint[]>([]);
  const [viewport, setViewport] = useState({ width: 0, height: 0 });
  const pathId = `attack-debug-route-${useId().replace(/:/g, '')}`;

  useEffect(() => {
    if (!ready) return;
    const canvas = document.getElementById('map-canvas');
    if (!(canvas instanceof HTMLCanvasElement)) {
      return;
    }

    const updatePositions = () => {
      const rect = canvas.getBoundingClientRect();
      const camera = (window as Window & { __neosantara_map_camera?: MapCamera })
        .__neosantara_map_camera ?? {};
      const scale = typeof camera.scale === 'number' ? camera.scale : 1;
      const offsetX = camera.offsetX ?? 0;
      const offsetY = camera.offsetY ?? 0;
      const canvasScaleX = rect.width / Math.max(1, canvas.width);
      const canvasScaleY = rect.height / Math.max(1, canvas.height);
      const visibleWorldCenterX = (canvas.width / 2 - offsetX) / (canvas.width * Math.max(scale, 0.001));
      const worldCopyOffset = Math.round(visibleWorldCenterX - route.start.x);
      setViewport({ width: window.innerWidth, height: window.innerHeight });
      setScreenPoints(route.points.map(point => ({
        x: rect.left + ((point.x + worldCopyOffset) * canvas.width * scale + offsetX) * canvasScaleX,
        y: rect.top + (point.y * canvas.height * scale + offsetY) * canvasScaleY,
      })));
    };

    const initialUpdate = window.requestAnimationFrame(updatePositions);
    const observer = new ResizeObserver(updatePositions);
    observer.observe(canvas);
    window.addEventListener('resize', updatePositions);
    window.addEventListener('neosantara_map_camera', updatePositions);
    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(initialUpdate);
      window.removeEventListener('resize', updatePositions);
      window.removeEventListener('neosantara_map_camera', updatePositions);
    };
  }, [ready, route]);

  useEffect(() => {
    if (!ready) return;
    const timeout = window.setTimeout(onComplete, durationMs);
    return () => window.clearTimeout(timeout);
  }, [durationMs, onComplete, ready]);

  if (!isDevelopment || !ready || screenPoints.length < 2) return null;

  const pointList = screenPoints.map(point => `${point.x},${point.y}`).join(' ');
  const animationPath = screenPoints
    .map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x},${point.y}`)
    .join(' ');
  const start = screenPoints[0];
  const end = screenPoints[screenPoints.length - 1];
  const svg = (
    <svg
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[202] overflow-visible"
      width={viewport.width}
      height={viewport.height}
      viewBox={`0 0 ${viewport.width} ${viewport.height}`}
      style={{ pointerEvents: 'none' }}
    >
      <defs>
        <filter id={`${pathId}-glow`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <polyline
        id={pathId}
        points={pointList}
        fill="none"
        stroke="#FF2D55"
        strokeWidth="3"
        strokeDasharray="9 7"
        strokeLinecap="round"
        filter={`url(#${pathId}-glow)`}
        opacity="0.9"
      />
      <circle cx={start.x} cy={start.y} r="7" fill="#FF2D55" stroke="#fff" strokeWidth="2" />
      <circle cx={end.x} cy={end.y} r="8" fill="#00FFAA" stroke="#fff" strokeWidth="2" />
      <text x={start.x + 10} y={start.y - 10} fill="#fff" stroke="#0F2424" strokeWidth="3" paintOrder="stroke" fontSize="12" fontWeight="bold">
        {route.attacker}
      </text>
      <text x={end.x + 10} y={end.y - 10} fill="#fff" stroke="#0F2424" strokeWidth="3" paintOrder="stroke" fontSize="12" fontWeight="bold">
        {route.target}
      </text>
      {reducedMotion ? (
        <g transform={`translate(${end.x} ${end.y}) rotate(0)`}>
          <TankIcon />
        </g>
      ) : (
        <g>
          <animateMotion
            dur={`${Math.max(1, durationMs) / 1000}s`}
            rotate="auto"
            fill="freeze"
            path={animationPath}
          />
          <g>
            <TankIcon />
          </g>
        </g>
      )}
    </svg>
  );
  return createPortal(svg, document.body);
}

function TankIcon() {
  return (
    <g transform="translate(-17 -12)" fill="#FF2D55" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round">
      <path d="M2 12h26l4 4v5H2z" />
      <path d="M9 12l3-6h10l4 6z" />
      <path d="M18 7h15v3H18z" />
      <rect x="4" y="21" width="27" height="4" rx="2" fill="#0F2424" />
      <circle cx="9" cy="23" r="2" />
      <circle cx="17" cy="23" r="2" />
      <circle cx="25" cy="23" r="2" />
    </g>
  );
}
