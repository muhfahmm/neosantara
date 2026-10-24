'use client';

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Flag,
  Trophy,
  TrendingDown,
  ArrowLeft,
  AlertTriangle,
} from 'lucide-react';
import { COUNTRIES_DATA, CAPITALS_DATA } from '@/app/page/map_system/map-data';
import PerbandinganPasukan from '../detail_negara/3_operasi_militer/1_serang_negara/perbandingan_pasukan';
import PageWar from '../detail_negara/3_operasi_militer/1_serang_negara/page_war/page_war';
import { simulateBattleTs } from '../detail_negara/3_operasi_militer/1_serang_negara/war_algoritm/battleEngine';
import { isSimulationTimePaused } from './time_logic';
import { initializeRouteMathRust } from './routeMathRust';
import {
  isRouteMathRustReady,
  projectMapPointRust,
  projectRouteGeometryRust,
  quadraticMotionRust,
  quadraticMotionFastRust,
} from './routeMathRust';

/* ============================================================
 * TIPE & INTERFACE
 * ============================================================ */

export interface LatLng {
  lat: number;
  lng: number;
}

export interface CapitalPoint extends LatLng {
  country: string;
  capital: string;
  iso?: string;
  [key: string]: any;
}

export interface ProjectionConfig {
  width: number;
  height: number;
  minLng?: number;
  maxLng?: number;
  minLat?: number;
  maxLat?: number;
}

export interface ScreenPoint {
  x: number;
  y: number;
}

export interface BezierCurve {
  start: ScreenPoint;
  control: ScreenPoint;
  end: ScreenPoint;
}

export type WarPhase = 'travel' | 'impact' | 'comparison' | 'battle_page' | 'result';
export type WarResult = 'win' | 'lose';
export type WarAction = 'annex' | 'loot' | 'retreat';

export interface WarPath {
  id: string;
  attacker: CapitalPoint;
  target: CapitalPoint;
  durationMs: number;
  createdAt: number;
}

/* ============================================================
 * KOORDINAT IBUKOTA
 * ============================================================ */

export const CAPITAL_COORDS: Record<string, LatLng> = (() => {
  const map: Record<string, LatLng> = {};

  CAPITALS_DATA.forEach((item: any) => {
    if (item.country && typeof item.lat === 'number' && typeof item.lng === 'number') {
      const countryName = String(item.country).trim();
      if (countryName) {
        map[countryName] = { lat: item.lat, lng: item.lng };
      }
    }
  });

  COUNTRIES_DATA.forEach((item: any) => {
    if (item.country) {
      const lat = item.latitude ?? item.lat;
      const lng = item.longitude ?? item.lng;
      if (typeof lat === 'number' && typeof lng === 'number') {
        const countryName = String(item.country).trim();
        if (countryName && !map[countryName]) {
          map[countryName] = { lat, lng };
        }
      }
    }
  });

  return map;
})();

const COUNTRY_NAME_ALIASES: Record<string, string> = {
  brasil: 'Brazil',
  tiongkok: 'China',
};

const resolveCountryAlias = (name: string): string =>
  COUNTRY_NAME_ALIASES[name.trim().toLowerCase()] ?? name;

export function getCapitalCoord(countryName: string): LatLng | null {
  if (!countryName) return null;
  const key = resolveCountryAlias(countryName).trim();
  if (CAPITAL_COORDS[key]) return CAPITAL_COORDS[key];

  const lowerKey = key.toLowerCase();
  const foundKey = Object.keys(CAPITAL_COORDS).find(
    (k) => k.toLowerCase() === lowerKey
  );
  if (foundKey) return CAPITAL_COORDS[foundKey];

  const cleanNorm = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');
  const cleanKey = cleanNorm(key);
  if (!cleanKey) return null;

  const foundCleanKey = Object.keys(CAPITAL_COORDS).find(
    (k) => cleanNorm(k) === cleanKey
  );
  if (foundCleanKey) return CAPITAL_COORDS[foundCleanKey];

  const capMatch = CAPITALS_DATA.find(
    (c: any) => cleanNorm(String(c.country || '')) === cleanKey
  );
  if (capMatch && typeof capMatch.lat === 'number' && typeof capMatch.lng === 'number') {
    return { lat: capMatch.lat, lng: capMatch.lng };
  }

  const match = COUNTRIES_DATA.find(
    (c: any) => cleanNorm(String(c.country || '')) === cleanKey
  );
  if (match) {
    const lat = match.latitude ?? match.lat;
    const lng = match.longitude ?? match.lng;
    if (typeof lat === 'number' && typeof lng === 'number') {
      return { lat, lng };
    }
  }

  return null;
}

export function buildCapitalPoint(
  country: string,
  capital?: string
): CapitalPoint | null {
  if (!country) return null;
  const ll = getCapitalCoord(country);
  const cleanNorm = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');
  const cleanCountry = cleanNorm(resolveCountryAlias(country));
  const match = COUNTRIES_DATA.find(
    (c) => cleanNorm(c.country || '') === cleanCountry
  );
  const capMatch = CAPITALS_DATA.find(
    (c: any) => cleanNorm(c.country || '') === cleanCountry
  );
  const capitalName = capital || capMatch?.capital || match?.capital || country;

  if (!ll) {
    return {
      country,
      capital: capitalName,
      lat: match?.latitude ?? match?.lat ?? 0,
      lng: match?.longitude ?? match?.lng ?? 0,
    };
  }

  return {
    country,
    capital: capitalName,
    lat: ll.lat,
    lng: ll.lng,
  };
}

/* ============================================================
 * PROYEKSI REAL-TIME TERHADAP CANVASES MAP (#map-canvas)
 * ============================================================ */

export interface MapCanvasTransform {
  rect: DOMRect;
  scale: number;
  offsetX: number;
  offsetY: number;
  canvasWidth: number;
  canvasHeight: number;
  worldCssWidth: number;
}

let cachedRect: DOMRect | null = null;
let cachedRectAt = 0;
let cachedRectEl: HTMLCanvasElement | null = null;

if (typeof window !== 'undefined') {
  window.addEventListener('resize', () => {
    cachedRect = null;
  }, { passive: true });
}

export function getMapCanvasTransform(): MapCanvasTransform | null {
  if (typeof window === 'undefined') return null;
  const canvasEl = (cachedRectEl && cachedRectEl.isConnected) ? cachedRectEl : (document.getElementById('map-canvas') as HTMLCanvasElement | null);
  if (!canvasEl) return null;

  const nowTs = performance.now();
  if (!cachedRect || cachedRectEl !== canvasEl || nowTs - cachedRectAt > 1000) {
    cachedRect = canvasEl.getBoundingClientRect();
    cachedRectAt = nowTs;
    cachedRectEl = canvasEl;
  }
  const rect = cachedRect;
  const ctx = canvasEl.getContext('2d');

  let scale = 1;
  let offsetX = 0;
  let offsetY = 0;

  const hookCam = (window as any).__neosantara_map_camera;
  if (hookCam && typeof hookCam.scale === 'number') {
    scale = hookCam.scale;
    offsetX = hookCam.offsetX;
    offsetY = hookCam.offsetY;
  } else if (ctx && typeof ctx.getTransform === 'function') {
    const matrix = ctx.getTransform();
    scale = matrix.a || 1;
    offsetX = matrix.e || 0;
    offsetY = matrix.f || 0;
  }

  const canvasWidth = canvasEl.width || rect.width || 1000;
  const canvasHeight = canvasEl.height || rect.height || 500;
  const worldCssWidth = rect.width * scale;

  return {
    rect,
    scale,
    offsetX,
    offsetY,
    canvasWidth,
    canvasHeight,
    worldCssWidth,
  };
}

export function getMapScreenPos(lat: number, lng: number): ScreenPoint {
  const transform = getMapCanvasTransform();
  if (!transform) return { x: 0, y: 0 };

  const { rect, scale, offsetX, offsetY, canvasWidth, canvasHeight, worldCssWidth } = transform;
  const rustPoint = projectMapPointRust(
    lat,
    lng,
    rect.left,
    rect.top,
    rect.width,
    rect.height,
    canvasWidth,
    canvasHeight,
    scale,
    offsetX,
    offsetY,
    worldCssWidth,
    window.innerWidth,
  );
  if (rustPoint) return { x: rustPoint[0], y: rustPoint[1] };

  const x_norm = (lng + 180.0) / 360.0;
  const y_norm = (90.0 - lat) / 180.0;

  const px = x_norm * canvasWidth;
  const py = y_norm * canvasHeight;

  let x = rect.left + (px * scale + offsetX) * (rect.width / canvasWidth);
  const y = rect.top + (py * scale + offsetY) * (rect.height / canvasHeight);

  if (worldCssWidth > 0) {
    const viewCenter = window.innerWidth / 2;
    const shiftCopies = Math.round((viewCenter - x) / worldCssWidth);
    x += shiftCopies * worldCssWidth;
  }

  return { x, y };
}

export interface MapRouteGeometry {
  start: ScreenPoint;
  end: ScreenPoint;
  control: ScreenPoint;
  path: string;
}

const routeMemo = new Map<string, MapRouteGeometry>();

export function getMapRouteGeometry(
  originLat: number,
  originLng: number,
  targetLat: number,
  targetLng: number,
  routeCurvature = 0.18
): MapRouteGeometry {
  const t = getMapCanvasTransform();
  if (t && isRouteMathRustReady()) {
    const key = `${originLat},${originLng},${targetLat},${targetLng},${routeCurvature},${t.scale},${t.offsetX},${t.offsetY},${t.rect.left},${t.rect.top},${t.rect.width},${t.rect.height},${window.innerWidth}`;
    const hit = routeMemo.get(key);
    if (hit) return hit;
    const val = computeMapRouteGeometry(originLat, originLng, targetLat, targetLng, routeCurvature);
    if (routeMemo.size > 64) routeMemo.clear();
    routeMemo.set(key, val);
    return val;
  }
  return computeMapRouteGeometry(originLat, originLng, targetLat, targetLng, routeCurvature);
}

function computeMapRouteGeometry(
  originLat: number,
  originLng: number,
  targetLat: number,
  targetLng: number,
  routeCurvature = 0.18
): MapRouteGeometry {
  const transform = getMapCanvasTransform();
  if (!transform) {
    const start = { x: 0, y: 0 };
    const end = { x: 0, y: 0 };
    const control = { x: 0, y: 0 };
    return { start, end, control, path: 'M 0 0' };
  }

  const { rect, scale, offsetX, offsetY, canvasWidth, canvasHeight, worldCssWidth } = transform;
  const rustGeometry = projectRouteGeometryRust({
    originLat,
    originLng,
    targetLat,
    targetLng,
    rectLeft: rect.left,
    rectTop: rect.top,
    rectWidth: rect.width,
    rectHeight: rect.height,
    canvasWidth,
    canvasHeight,
    scale,
    offsetX,
    offsetY,
    worldCssWidth,
    windowWidth: window.innerWidth,
    curvature: routeCurvature,
  });
  if (rustGeometry) {
    const start = { x: rustGeometry[0], y: rustGeometry[1] };
    const end = { x: rustGeometry[2], y: rustGeometry[3] };
    const control = { x: rustGeometry[4], y: rustGeometry[5] };
    return { start, end, control, path: buildSVGPath(start, control, end) };
  }

  const sNormX = (originLng + 180.0) / 360.0;
  const sNormY = (90.0 - originLat) / 180.0;
  const tNormX = (targetLng + 180.0) / 360.0;
  const tNormY = (90.0 - targetLat) / 180.0;

  const sPx = sNormX * canvasWidth;
  const sPy = sNormY * canvasHeight;
  const tPx = tNormX * canvasWidth;
  const tPy = tNormY * canvasHeight;

  let startX = rect.left + (sPx * scale + offsetX) * (rect.width / canvasWidth);
  const startY = rect.top + (sPy * scale + offsetY) * (rect.height / canvasHeight);

  let endX = rect.left + (tPx * scale + offsetX) * (rect.width / canvasWidth);
  const endY = rect.top + (tPy * scale + offsetY) * (rect.height / canvasHeight);

  if (worldCssWidth > 0) {
    let diff = endX - startX;
    diff = ((diff + worldCssWidth / 2) % worldCssWidth + worldCssWidth) % worldCssWidth - worldCssWidth / 2;
    endX = startX + diff;

    const viewCenter = window.innerWidth / 2;
    const routeCenter = (startX + endX) / 2;
    const shiftCopies = Math.round((viewCenter - routeCenter) / worldCssWidth);
    if (shiftCopies !== 0) {
      const shiftPx = shiftCopies * worldCssWidth;
      startX += shiftPx;
      endX += shiftPx;
    }
  }

  const start: ScreenPoint = { x: startX, y: startY };
  const end: ScreenPoint = { x: endX, y: endY };
  const control = buildControlPoint(start, end, routeCurvature);
  const path = buildSVGPath(start, control, end);

  return { start, end, control, path };
}

/* ============================================================
 * KURVA BEZIER KUADRATIK
 * ============================================================ */

export function buildControlPoint(
  a: ScreenPoint,
  b: ScreenPoint,
  curvature = 0.18
): ScreenPoint {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const dist = Math.hypot(dx, dy) || 1;
  const nx = -dy / dist;
  const ny = dx / dist;
  return {
    x: mx + nx * curvature * dist,
    y: my + ny * curvature * dist,
  };
}

export function pointOnQuadraticBezier(
  a: ScreenPoint,
  c: ScreenPoint,
  b: ScreenPoint,
  t: number
): ScreenPoint {
  const mt = 1 - t;
  return {
    x: mt * mt * a.x + 2 * mt * t * c.x + t * t * b.x,
    y: mt * mt * a.y + 2 * mt * t * c.y + t * t * b.y,
  };
}

export function tangentOnQuadraticBezier(
  a: ScreenPoint,
  c: ScreenPoint,
  b: ScreenPoint,
  t: number
): number {
  const dx = 2 * (1 - t) * (c.x - a.x) + 2 * t * (b.x - c.x);
  const dy = 2 * (1 - t) * (c.y - a.y) + 2 * t * (b.y - c.y);
  return Math.atan2(dy, dx);
}

const motionResultObj = { x: 0, y: 0, angle: 0 };

export function getQuadraticMotion(
  start: ScreenPoint,
  control: ScreenPoint,
  end: ScreenPoint,
  progress: number,
): ScreenPoint & { angle: number } {
  const fastBuf = quadraticMotionFastRust(
    start.x,
    start.y,
    control.x,
    control.y,
    end.x,
    end.y,
    progress,
  );
  if (fastBuf) {
    motionResultObj.x = fastBuf[0];
    motionResultObj.y = fastBuf[1];
    // fastBuf[2] is angle in degrees, convert back to rad for backwards compatibility
    motionResultObj.angle = fastBuf[2] * Math.PI / 180;
    return motionResultObj;
  }
  const rustMotion = quadraticMotionRust(
    start.x,
    start.y,
    control.x,
    control.y,
    end.x,
    end.y,
    progress,
  );
  if (rustMotion) {
    motionResultObj.x = rustMotion[0];
    motionResultObj.y = rustMotion[1];
    motionResultObj.angle = rustMotion[2];
    return motionResultObj;
  }
  const p = pointOnQuadraticBezier(start, control, end, progress);
  motionResultObj.x = p.x;
  motionResultObj.y = p.y;
  motionResultObj.angle = tangentOnQuadraticBezier(start, control, end, progress);
  return motionResultObj;
}

export function buildSVGPath(
  a: ScreenPoint,
  c: ScreenPoint,
  b: ScreenPoint
): string {
  return `M ${a.x} ${a.y} Q ${c.x} ${c.y} ${b.x} ${b.y}`;
}

/* ============================================================
 * DURASI ANIMASI
 * ============================================================ */

export interface DurationOptions {
  pxPerSecond?: number;
  minMs?: number;
  maxMs?: number;
}

export function computeDuration(
  distancePx: number,
  opts: DurationOptions = {}
): number {
  const { pxPerSecond = 350, minMs = 3500, maxMs = 9000 } = opts;
  const seconds = distancePx / pxPerSecond;
  return Math.min(maxMs, Math.max(minMs, seconds * 1000));
}

/* ============================================================
 * BUILDER WAR PATH
 * ============================================================ */

export interface BuildWarPathInput {
  attacker: CapitalPoint;
  target: CapitalPoint;
  duration?: DurationOptions;
}

export function buildWarPath(input: BuildWarPathInput): WarPath {
  const { attacker, target, duration } = input;
  const start = getMapScreenPos(attacker.lat, attacker.lng);
  const end = getMapScreenPos(target.lat, target.lng);
  const dist = Math.hypot(end.x - start.x, end.y - start.y);

  return {
    id: `${attacker.country}-${target.country}-${Date.now()}`,
    attacker,
    target,
    durationMs: computeDuration(dist, duration),
    createdAt: Date.now(),
  };
}

/* ============================================================
 * HASIL PERTEMPURAN (DeepSeek AI Engine)
 * ============================================================ */

export interface WarResultInput {
  attackerPower: number;
  targetPower: number;
  roll?: number;
  attackerBonus?: number;
  defenderBonus?: number;
  isUserDefender?: boolean;
}

export interface WarResultOutput {
  result: WarResult;
  attackerScore: number;
  targetScore: number;
  totalRounds?: number;
  message?: string;
  log?: string[];
  winner?: 'attacker' | 'target' | 'draw';
}

export function computeWarResult(input: WarResultInput): WarResultOutput {
  const { attackerPower, targetPower, isUserDefender = false } = input;

  let deployedPowerRatio = 1.0;
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('deployed_units_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        const vals = Object.values(parsed).filter((v): v is number => typeof v === 'number');
        if (vals.length > 0) {
          const sum = vals.reduce((acc, curr) => acc + curr, 0);
          const avgPct = sum / vals.length;
          deployedPowerRatio = Math.max(0.01, avgPct / 100);
        }
      }
    } catch (e) { }
  }

  const actualAttackerPower = isUserDefender ? Math.round(attackerPower) : Math.round(attackerPower * deployedPowerRatio);
  const actualTargetPower = isUserDefender ? Math.round(targetPower * deployedPowerRatio) : Math.round(targetPower);

  const battle = simulateBattleTs({
    attackerPower: Math.max(1, actualAttackerPower),
    targetPower: Math.max(1, actualTargetPower),
  });

  const isUserWin = isUserDefender
    ? battle.winner === 'target'
    : battle.winner === 'attacker';

  return {
    result: isUserWin ? 'win' : 'lose',
    attackerScore: battle.attackerFinalPower,
    targetScore: battle.targetFinalPower,
    totalRounds: battle.totalRounds,
    message: battle.message,
    log: battle.log,
    winner: battle.winner,
  };
}

/* ============================================================
 * PROPS & KOMPONEN WAR MAP OVERLAY
 * ============================================================ */

interface WarMapProps {
  isOpen: boolean;
  attacker: CapitalPoint;
  target: CapitalPoint;
  attackerPower: number;
  targetPower: number;
  attackerBonus?: number;
  defenderBonus?: number;
  isUserDefender?: boolean;
  isNpcWar?: boolean;
  isPbbCoalition?: boolean;
  onClose: () => void;
  onResolve: (payload: {
    result: WarResult;
    action: WarAction;
    path: WarPath;
    isUserDefender?: boolean;
    isPbbCoalition?: boolean;
  }) => void;
}

export default function WarMap({
  isOpen,
  attacker,
  target,
  attackerPower,
  targetPower,
  attackerBonus = 1,
  defenderBonus = 1,
  isUserDefender: isUserDefenderProp,
  isNpcWar = false,
  isPbbCoalition = false,
  onClose,
  onResolve,
}: WarMapProps) {
  const [phase, setPhase] = useState<WarPhase>('travel');
  const [result, setResult] = useState<WarResult | null>(null);
  const [showFlash, setShowFlash] = useState(false);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  const isUserDefender = useMemo(() => {
    if (typeof isUserDefenderProp === 'boolean') return isUserDefenderProp;
    if (typeof window === 'undefined') return false;
    try {
      const saved = localStorage.getItem('user_country');
      if (saved) {
        const parsed = JSON.parse(saved);
        const userCountryName = String(parsed?.country || parsed?.nama_negara || '').toLowerCase().trim();
        const targetCountryName = String(target?.country || '').toLowerCase().trim();
        if (userCountryName && targetCountryName && userCountryName === targetCountryName) {
          return true;
        }
      }
    } catch (e) { }
    return false;
  }, [isUserDefenderProp, target.country]);

  const [screenSize, setScreenSize] = useState<{ w: number; h: number }>({
    w: typeof window !== 'undefined' ? window.innerWidth : 1920,
    h: typeof window !== 'undefined' ? window.innerHeight : 1080,
  });

  const progressRef = useRef(0);
  const routeGeometryRef = useRef<MapRouteGeometry | null>(null);
  const routePathRef = useRef<SVGPathElement>(null);
  const progressPathRef = useRef<SVGPathElement>(null);
  const startMarkerRef = useRef<SVGCircleElement>(null);
  const startHaloRef = useRef<SVGCircleElement>(null);
  const endMarkerRef = useRef<SVGCircleElement>(null);
  const endHaloRef = useRef<SVGCircleElement>(null);
  const impactBurstRef = useRef<SVGCircleElement>(null);
  const tankRef = useRef<SVGGElement>(null);
  const tankRotationRef = useRef<SVGGElement>(null);

  useEffect(() => {
    const handleResize = () => {
      setScreenSize({ w: window.innerWidth, h: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const resolvedAttacker = useMemo<CapitalPoint>(() => {
    const coord = getCapitalCoord(attacker.country);
    return {
      ...attacker,
      lat: coord ? coord.lat : (typeof attacker.lat === 'number' && attacker.lat !== 0 ? attacker.lat : (attacker.latitude ?? 0)),
      lng: coord ? coord.lng : (typeof attacker.lng === 'number' && attacker.lng !== 0 ? attacker.lng : (attacker.longitude ?? 0)),
    };
  }, [attacker]);

  const resolvedTarget = useMemo<CapitalPoint>(() => {
    const coord = getCapitalCoord(target.country);
    return {
      ...target,
      lat: coord ? coord.lat : (typeof target.lat === 'number' && target.lat !== 0 ? target.lat : (target.latitude ?? 0)),
      lng: coord ? coord.lng : (typeof target.lng === 'number' && target.lng !== 0 ? target.lng : (target.longitude ?? 0)),
    };
  }, [target]);

  const warPath = useMemo<WarPath | null>(() => {
    if (!isOpen) return null;
    return buildWarPath({ attacker: resolvedAttacker, target: resolvedTarget });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, resolvedAttacker.country, resolvedTarget.country, resolvedAttacker.lat, resolvedAttacker.lng, resolvedTarget.lat, resolvedTarget.lng]);

  const battleOutcome = useMemo(() => {
    if (!isOpen) return null;
    return computeWarResult({
      attackerPower: Number((attacker as Record<string, unknown>).pbbCoalitionPower) || attackerPower,
      targetPower,
      attackerBonus,
      defenderBonus,
      isUserDefender,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, attackerPower, targetPower, attackerBonus, defenderBonus, isUserDefender]);

  useEffect(() => {
    if (isOpen) {
      setPhase('travel');
      progressRef.current = 0;
      progressPathRef.current?.setAttribute('stroke-dasharray', '0 100');
      setResult(null);
      setShowFlash(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !warPath) return;
    void initializeRouteMathRust();
    let raf = 0;
    let lastTime = performance.now();
    let accumulatedMs = 0;
    const dur = warPath.durationMs;
    let lastGeo: MapRouteGeometry | null = null;

    const updateOverlayGeometry = (geo: MapRouteGeometry) => {
      routePathRef.current?.setAttribute('d', geo.path);
      progressPathRef.current?.setAttribute('d', geo.path);
      startMarkerRef.current?.setAttribute('cx', String(geo.start.x));
      startMarkerRef.current?.setAttribute('cy', String(geo.start.y));
      startHaloRef.current?.setAttribute('cx', String(geo.start.x));
      startHaloRef.current?.setAttribute('cy', String(geo.start.y));
      endMarkerRef.current?.setAttribute('cx', String(geo.end.x));
      endMarkerRef.current?.setAttribute('cy', String(geo.end.y));
      endHaloRef.current?.setAttribute('cx', String(geo.end.x));
      endHaloRef.current?.setAttribute('cy', String(geo.end.y));
      impactBurstRef.current?.setAttribute('cx', String(geo.end.x));
      impactBurstRef.current?.setAttribute('cy', String(geo.end.y));

      if (tankRef.current && tankRotationRef.current) {
        const currentProgress = progressRef.current;
        const motion = getQuadraticMotion(geo.start, geo.control, geo.end, currentProgress);
        tankRef.current.setAttribute('transform', `translate(${motion.x} ${motion.y})`);
        tankRotationRef.current.setAttribute('transform', `rotate(${motion.angle * 180 / Math.PI})`);
      }
    };
    const isGamePaused = () =>
      isSimulationTimePaused() ||
      (typeof window !== 'undefined' && Boolean((window as Window & { neosantara_is_paused?: boolean }).neosantara_is_paused));

    const refreshCameraGeometry = () => {
      const geo = getMapRouteGeometry(
        resolvedAttacker.lat,
        resolvedAttacker.lng,
        resolvedTarget.lat,
        resolvedTarget.lng,
        0.18
      );
      if (geo === lastGeo) return;
      lastGeo = geo;
      routeGeometryRef.current = geo;
      updateOverlayGeometry(geo);
    };
    refreshCameraGeometry();
    window.addEventListener('neosantara_map_camera', refreshCameraGeometry);

    const stopLoop = () => {
      if (raf === 0) return;
      cancelAnimationFrame(raf);
      raf = 0;
    };
    const startLoop = () => {
      if (raf !== 0 || isGamePaused()) return;
      lastTime = performance.now();
      raf = requestAnimationFrame(loop);
    };
    const handleClockState = (event: Event) => {
      const detail = (event as CustomEvent<{ isPaused?: boolean }>).detail;
      if (detail?.isPaused) {
        stopLoop();
        return;
      }
      startLoop();
    };
    window.addEventListener('neosantara:simulation-clock-state', handleClockState);

    const loop = (now: number) => {
      raf = 0;
      const delta = now - lastTime;
      lastTime = now;

      if (phase !== 'travel' || isGamePaused()) return;
      accumulatedMs += delta;
      const currentProgress = Math.min(1, accumulatedMs / dur);
      progressRef.current = currentProgress;
      progressPathRef.current?.setAttribute('stroke-dasharray', `${currentProgress * 100} 100`);
      const geo = routeGeometryRef.current;
      if (geo && tankRef.current && tankRotationRef.current) {
        const motion = getQuadraticMotion(geo.start, geo.control, geo.end, currentProgress);
        tankRef.current.setAttribute('transform', `translate(${motion.x} ${motion.y})`);
        tankRotationRef.current.setAttribute('transform', `rotate(${motion.angle * 180 / Math.PI})`);
      }
      if (currentProgress >= 1) {
        setPhase('impact');
        return;
      }
      raf = requestAnimationFrame(loop);
    };

    startLoop();
    return () => {
      stopLoop();
      window.removeEventListener('neosantara_map_camera', refreshCameraGeometry);
      window.removeEventListener('neosantara:simulation-clock-state', handleClockState);
    };
  }, [isOpen, phase, warPath, resolvedAttacker.lat, resolvedAttacker.lng, resolvedTarget.lat, resolvedTarget.lng]);

  useEffect(() => {
    if (phase !== 'impact' || !battleOutcome) return;
    setShowFlash(true);
    if (isNpcWar && !isPbbCoalition) {
      const closeTimer = setTimeout(() => onCloseRef.current(), 1300);
      const flashTimer = setTimeout(() => setShowFlash(false), 500);
      return () => {
        clearTimeout(closeTimer);
        clearTimeout(flashTimer);
      };
    }
    const t1 = setTimeout(() => {
      setPhase('comparison');
    }, 700);
    const t2 = setTimeout(() => setShowFlash(false), 500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [phase, battleOutcome, isNpcWar, isPbbCoalition]);

  const handleAction = useCallback(
    (action: WarAction) => {
      if (!warPath || !result) return;
      // 👈 Sertakan isPbbCoalition ke dalam payload
      onResolve({ result, action, path: warPath, isPbbCoalition }); 
    },
    [warPath, result, onResolve, isPbbCoalition]
  );

  const handleAutoResult = useCallback(() => {
    if (battleOutcome) {
      setResult(battleOutcome.result);
      setPhase('result');
    }
  }, [battleOutcome]);

  const handleStartBattle = useCallback(() => {
    setPhase('battle_page');
  }, []);

  if (!isOpen || !warPath) return null;

  const VB = `0 0 ${screenSize.w} ${screenSize.h}`;

  return (
    <>
      {(phase === 'travel' || phase === 'impact') && (
        <div className="fixed inset-0 z-[10] pointer-events-none font-sans select-none overflow-hidden">
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox={VB}
          >
            <defs>
              <filter id="glow-red" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="6" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <radialGradient id="impact-burst">
                <stop offset="0%" stopColor="#FFEB3B" stopOpacity="1" />
                <stop offset="40%" stopColor="#FF2D55" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#FF2D55" stopOpacity="0" />
              </radialGradient>
            </defs>

            <path
              ref={routePathRef}
              d="M 0 0"
              fill="none"
              stroke="#FF2D55"
              strokeWidth={4}
              strokeDasharray="14 10"
              opacity={phase === 'travel' ? 0.85 : 0.4}
              style={{ animation: 'warPathMarch 1s linear infinite' }}
            />

            <path
              ref={progressPathRef}
              d="M 0 0"
              fill="none"
              stroke="#FF2D55"
              strokeWidth={6}
              strokeLinecap="round"
              pathLength={100}
              strokeDasharray="0 100"
            />

            <circle ref={startMarkerRef} cx={0} cy={0} r={8} fill="#00FFAA" opacity={0.8} />
            <circle ref={startHaloRef} cx={0} cy={0} r={16} fill="none" stroke="#00FFAA" strokeWidth={2} opacity={0.5} />

            <circle ref={endMarkerRef} cx={0} cy={0} r={8} fill="#FF2D55" opacity={0.8} />
            <circle ref={endHaloRef} cx={0} cy={0} r={20} fill="none" stroke="#FF2D55" strokeWidth={2}>
              <animate attributeName="r" values="16;30;16" dur="1.6s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.7;0;0.7" dur="1.6s" repeatCount="indefinite" />
            </circle>

            {phase === 'travel' && (
              <g ref={tankRef} transform="translate(0 0)">
                <circle r={30} fill="#FF2D55" opacity={0.25} />
                <g ref={tankRotationRef} transform="rotate(0)">
                  <rect x={-22} y={-10} width={40} height={16} rx={3} fill="#FF2D55" />
                  <rect x={-12} y={-20} width={22} height={10} rx={2} fill="#FF2D55" />
                  <rect x={10} y={-17} width={28} height={4} fill="#FF2D55" />
                  <circle cx={-16} cy={10} r={4} fill="#FF2D55" />
                  <circle cx={-6} cy={10} r={4} fill="#FF2D55" />
                  <circle cx={4} cy={10} r={4} fill="#FF2D55" />
                  <circle cx={13} cy={10} r={4} fill="#FF2D55" />
                </g>
              </g>
            )}

            {phase === 'impact' && (
              <circle ref={impactBurstRef} cx={0} cy={0} r={0} fill="url(#impact-burst)">
                <animate attributeName="r" from="0" to="160" dur="0.7s" fill="freeze" />
                <animate attributeName="opacity" from="1" to="0" dur="0.7s" fill="freeze" />
              </circle>
            )}
          </svg>

          {showFlash && (
            <div className="absolute inset-0 bg-white/70 pointer-events-none animate-[warFlash_0.6s_ease-out_forwards]" />
          )}
        </div>
      )}

      {phase === 'comparison' && (
        <PerbandinganPasukan
          attackerName={isPbbCoalition ? 'Pasukan Gabungan PBB' : attacker.country}
          attackerIso={attacker.iso || 'cn'}
          attackerPower={attackerPower}
          attackerPowerOverride={Number((attacker as Record<string, unknown>).pbbCoalitionPower) || undefined}
          attackerDetail={attacker}
          targetName={target.country}
          targetIso={target.iso || 'un'}
          targetPower={targetPower}
          targetDetail={target}
          isUserDefender={isUserDefender}
          isCoalitionForce={isPbbCoalition}
          onStartBattle={handleStartBattle}
          onAutoResult={handleAutoResult}
          onClose={onClose}
        />
      )}

      {phase === 'battle_page' && (
        <PageWar
          attackerName={attacker.country}
          targetName={target.country}
          onAutoResult={handleAutoResult}
          onClose={onClose}
        />
      )}

      {/* ══════════ LAYAR HASIL PERTEMPURAN (Fase 'result') ══════════ */}
      {/* FIX: Container utama transparan (tanpa bg-black/backdrop-blur) dan pointer-events-none. */}
      {phase === 'result' && result && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 pointer-events-none animate-[warFadeIn_0.4s_ease-out]">
          {/* FIX: pointer-events-auto ditambahkan di sini agar kotak modal bisa diklik */}
          <div className="w-full max-w-lg bg-[#0A1A1A] border border-[#00FFAA]/30 rounded-3xl overflow-hidden shadow-[0_0_80px_rgba(0,255,170,0.2)] font-sans select-none pointer-events-auto">
            <div
              className={`p-6 text-center border-b ${result === 'win'
                  ? 'bg-[#00FFAA]/10 border-[#00FFAA]/30'
                  : 'bg-[#FF2D55]/10 border-[#FF2D55]/30'
                }`}
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-3">
                {result === 'win' ? (
                  <Trophy className="h-10 w-10 text-[#FFEB3B]" />
                ) : (
                  <TrendingDown className="h-10 w-10 text-[#FF2D55]" />
                )}
              </div>
              <h2
                className={`text-xl font-black uppercase tracking-widest ${result === 'win' ? 'text-[#00FFAA]' : 'text-[#FF2D55]'
                  }`}
              >
                {isUserDefender
                  ? (result === 'win' ? 'Pertahanan Berhasil!' : 'Pertahanan Terpukul Kalah!')
                  : (result === 'win' ? 'Kemenangan Mutlak!' : 'Pasukan Terpukul Mundur')}
              </h2>
              <p className="text-xs text-[#E0E0E0] mt-2 leading-relaxed">
                {isUserDefender ? (
                  result === 'win' ? (
                    <>
                      Pasukan <strong className="text-white">{target.country}</strong>{' '}
                      berhasil memukul mundur{' '}
                      {isPbbCoalition ? 'Pasukan Gabungan PBB' : <>agresi militer <strong className="text-white">{attacker.country}</strong></>}! Pertahanan nasional berdiri kokoh.
                    </>
                  ) : (
                    <>
                      {isPbbCoalition
                        ? <strong className="text-white">Pasukan Gabungan PBB</strong>
                        : <>Pasukan <strong className="text-white">{attacker.country}</strong></>}{' '}
                      berhasil menembus benteng pertahanan{' '}
                      <strong className="text-white">{target.country}</strong>. Kerugian armada dialami.
                    </>
                  )
                ) : (
                  result === 'win' ? (
                    <>
                      {isPbbCoalition
                        ? <strong className="text-white">Pasukan Gabungan PBB</strong>
                        : <>Pasukan <strong className="text-white">{attacker.country}</strong></>}{' '}
                      berhasil menembus benteng pertahanan{' '}
                      <strong className="text-white">{target.country}</strong>!
                    </>
                  ) : (
                    <>
                      {isPbbCoalition
                        ? <strong className="text-white">Pasukan Gabungan PBB</strong>
                        : <>Pasukan <strong className="text-white">{attacker.country}</strong></>}{' '}
                      gagal menembus pertahanan{' '}
                      <strong className="text-white">{target.country}</strong>.
                    </>
                  )
                )}
              </p>
            </div>

            <div className="grid grid-cols-2 divide-x divide-[#00FFAA]/10 border-b border-[#00FFAA]/10">
              <div className="p-4 text-center">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#6B8A8A] mb-1">
                  {isPbbCoalition ? 'Skor Pasukan Gabungan PBB' : `Skor Penyerang (${attacker.country})`}
                </p>
                <p className="text-lg font-black text-[#00FFAA]">
                  {battleOutcome?.attackerScore.toLocaleString()}
                </p>
              </div>
              <div className="p-4 text-center">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#6B8A8A] mb-1">
                  {isPbbCoalition ? `Skor Pertahanan (${target.country})` : `Skor Bertahan (${target.country})`}
                </p>
                <p className="text-lg font-black text-[#FF2D55]">
                  {battleOutcome?.targetScore.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="p-5 space-y-3">
              {isUserDefender ? (
                <div className="space-y-3">
                  <div className={`flex items-start gap-3 p-3 rounded-xl ${result === 'win' ? 'bg-[#00FFAA]/10 border border-[#00FFAA]/30' : 'bg-[#FF2D55]/10 border border-[#FF2D55]/30'}`}>
                    <AlertTriangle className={`h-4 w-4 ${result === 'win' ? 'text-[#00FFAA]' : 'text-[#FF2D55]'} mt-0.5 flex-shrink-0`} />
                    <p className="text-[11px] text-[#E0E0E0] leading-relaxed">
                      {result === 'win'
                        ? `Operasi pertahanan nasional sukses besar! ${isPbbCoalition ? 'Pasukan Gabungan PBB' : `Pasukan ${attacker.country}`} dipaksa mundur.`
                        : `Wilayah nasional terdampak serangan ${isPbbCoalition ? 'Pasukan Gabungan PBB' : `musuh (${attacker.country})`}. Kerugian armada pertahanan telah terjadi.`}
                    </p>
                  </div>
                  <button
                    onClick={() => handleAction('retreat')}
                    className="w-full py-3 rounded-xl bg-[#0F2424] hover:bg-[#1A3838] border border-[#00FFAA]/30 text-xs font-black uppercase tracking-widest text-[#E0E0E0] transition-colors cursor-pointer"
                  >
                    {result === 'win' ? 'Selesai Pertahanan' : 'Tarik Sisa Pasukan & Evaluasi'}
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#6B8A8A] mb-2">
                    {result === 'win'
                      ? (isPbbCoalition ? 'PILIH OPSI TAKTIS PASUKAN PBB:' : 'Pilih Aneksasi atau Opsi Taktis:')
                      : 'Pilihan:'}
                  </p>

                  {result === 'win' ? (
                    <div className={`grid grid-cols-1 ${isPbbCoalition ? 'sm:grid-cols-2' : 'sm:grid-cols-3'} gap-3`}>
                      
                      {/* FIX: Tombol Duduki / Aneksasi */}
                      <ActionButton
                        icon={<Flag className="h-5 w-5" />}
                        title={isPbbCoalition ? 'Duduki Negara' : 'Aneksasi'}
                        desc={isPbbCoalition ? 'Kendalikan wilayah target' : 'Caplok & integrasikan wilayah target'}
                        accent="#00FFAA"
                        onClick={() => handleAction('annex')}
                      />

                      {/* FIX: Tombol Jarah SDA (Disembunyikan jika PBB) */}
                      {!isPbbCoalition && (
                        <ActionButton
                          icon={<Trophy className="h-5 w-5" />}
                          title="Jarah SDA"
                          desc="Rampas sumber daya tanpa mencaplok"
                          accent="#FFEB3B"
                          onClick={() => handleAction('loot')}
                        />
                      )}

                      {/* Tombol Mundur */}
                      <ActionButton
                        icon={<ArrowLeft className="h-5 w-5" />}
                        title="Mundur"
                        desc="Tarik pasukan tanpa aksi lanjutan"
                        accent="#6B8A8A"
                        onClick={() => handleAction('retreat')}
                      />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 p-3 rounded-xl bg-[#FF2D55]/10 border border-[#FF2D55]/30">
                        <AlertTriangle className="h-4 w-4 text-[#FF2D55] mt-0.5 flex-shrink-0" />
                        <p className="text-[11px] text-[#E0E0E0] leading-relaxed">
                          Hubungan diplomatik dengan {target.country} memburuk. Reputasi
                          internasional Anda menurun.
                        </p>
                      </div>
                      <button
                        onClick={() => handleAction('retreat')}
                        className="w-full py-3 rounded-xl bg-[#0F2424] hover:bg-[#1A3838] border border-[#00FFAA]/30 text-xs font-black uppercase tracking-widest text-[#E0E0E0] transition-colors cursor-pointer"
                      >
                        Tarik Pasukan
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══════════ CSS ANIMATIONS ══════════ */}
      <style jsx>{`
        @keyframes warPathMarch {
          to {
            stroke-dashoffset: -24;
          }
        }
        @keyframes warFlash {
          0% { opacity: 0.9; }
          100% { opacity: 0; }
        }
        @keyframes warFadeIn {
          0% { opacity: 0; transform: scale(0.98); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </>
  );
}

/* ============================================================
 * SUB-KOMPONEN: ActionButton (Aneksasi / Jarah / Mundur)
 * ============================================================ */

function ActionButton({
  icon,
  title,
  desc,
  accent,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  accent: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group flex flex-col items-center text-center gap-2 p-4 rounded-2xl bg-[#0F2424] hover:bg-[#142E2E] border border-[#00FFAA]/15 hover:border-[#00FFAA]/40 transition-all cursor-pointer"
      style={{ borderColor: `${accent}33` }}
    >
      <div
        className="p-2.5 rounded-xl transition-transform group-hover:scale-110"
        style={{ backgroundColor: `${accent}1A`, color: accent }}
      >
        {icon}
      </div>
      <h3
        className="text-xs font-black uppercase tracking-widest"
        style={{ color: accent }}
      >
        {title}
      </h3>
      <p className="text-[10px] text-[#6B8A8A] font-semibold leading-tight">
        {desc}
      </p>
    </button>
  );
}