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
  Skull,
  X,
} from 'lucide-react';
import { COUNTRIES_DATA, CAPITALS_DATA } from '@/app/page/map_system/map-data';
import NotebookModalWrapper from '../navigasi_menu/2_navigasi_bawah/NotebookModalWrapper';
import { resolveRequestedInvasionOutcome } from '../detail_negara/3_operasi_militer/6_minta_serang_negara/requestedInvasionLogic';
import PerbandinganPasukan from '../detail_negara/3_operasi_militer/1_serang_negara/perbandingan_pasukan';
import { getWarUnitComposition, type WarUnit } from '../detail_negara/3_operasi_militer/1_serang_negara/war_algoritm/warUnitComposition';
import { simulateBattleTs } from '../detail_negara/3_operasi_militer/1_serang_negara/war_algoritm/battleEngine';
import {
  estimateTravelTime,
  getSimulationDayPosition,
  getSimulationMillisecondsPerDay,
  isSimulationTimePaused,
} from './time_logic';
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
  cityId?: string;
  cityName?: string;
  cityIsCapital?: boolean;
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

export type WarPhase = 'travel' | 'impact' | 'comparison' | 'result';
export type WarResult = 'win' | 'lose';
export type WarAction = 'annex' | 'loot' | 'retreat';

export interface WarPath {
  id: string;
  attacker: CapitalPoint;
  target: CapitalPoint;
  travelDays: number;
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
 * BUILDER WAR PATH
 * ============================================================ */

export interface BuildWarPathInput {
  attacker: CapitalPoint;
  target: CapitalPoint;
}

export function buildWarPath(input: BuildWarPathInput): WarPath | null {
  const { attacker, target } = input;
  const travelEstimate = estimateTravelTime(attacker.country, target.country);
  if (!travelEstimate) {
    console.error('[WarPath] No travel estimate available for route', {
      attackerCountry: attacker.country,
      targetCountry: target.country,
    });
    return null;
  }

  return {
    id: `${attacker.country}-${target.country}-${Date.now()}`,
    attacker,
    target,
    travelDays: travelEstimate.days,
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
  requestedInvasion?: boolean;
  attackerWinRoll?: number;
  attackerBonus?: number;
  defenderBonus?: number;
  isUserDefender?: boolean;
  isNpcWar?: boolean;
}

export interface WarResultOutput {
  result: WarResult;
  attackerScore: number;
  targetScore: number;
  attackerLossRatio: number;
  targetLossRatio: number;
  totalRounds?: number;
  message?: string;
  log?: string[];
  winner?: 'attacker' | 'target' | 'draw';
}

const UNIT_LOSS_LABELS: Record<WarUnit['kind'], string> = {
  infanteri: 'Pasukan Infanteri',
  tank: 'Tank Tempur Utama',
  apcIfv: 'APC / IFV',
  artileriBerat: 'Artileri Berat',
  peluncurRoket: 'Sistem Peluncur Roket',
  pertahananUdaraMobile: 'Pertahanan Udara Mobile',
  kendaraanTaktis: 'Kendaraan Taktis',
  kapalInduk: 'Kapal Induk',
  kapalIndukNuklir: 'Kapal Induk Nuklir',
  destroyer: 'Kapal Destroyer',
  korvet: 'Kapal Korvet',
  kapalSelamNuklir: 'Kapal Selam Nuklir',
  kapalSelamReguler: 'Kapal Selam Reguler',
  kapalRanjau: 'Kapal Ranjau',
  kapalLogistik: 'Kapal Logistik',
  jetTempurSiluman: 'Jet Tempur Siluman',
  jetTempurInterceptor: 'Jet Tempur Interceptor',
  pesawatPengebom: 'Pesawat Pengebom',
  helikopterSerang: 'Helikopter Serang',
  pesawatPengintai: 'Pesawat Pengintai',
  droneIntaiUav: 'Drone Intai UAV',
  droneKamikaze: 'Drone Kamikaze',
  pesawatAngkut: 'Pesawat Angkut',
};

function calculateUnitLosses(units: WarUnit[], lossRatio: number) {
  return units.map((unit) => {
    const lost = Math.min(unit.quantity, Math.round(unit.quantity * lossRatio));
    return {
      label: UNIT_LOSS_LABELS[unit.kind],
      deployed: unit.quantity,
      lost,
      remaining: unit.quantity - lost,
    };
  }).filter((unit) => unit.lost > 0);
}

export function computeWarResult(input: WarResultInput): WarResultOutput {
  const { attackerPower, targetPower, isUserDefender = false, isNpcWar = false } = input;

  let deployedPowerRatio = 1.0;
  // Perang antar NPC/mandat tidak boleh dipengaruhi konfigurasi pasukan milik user.
  if (!isNpcWar && typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('deployed_units_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        const vals = Object.values(parsed).filter((v): v is number => typeof v === 'number');
        if (vals.length > 0) {
          const sum = vals.reduce((acc, curr) => acc + curr, 0);
          const avgPct = sum / vals.length;
          deployedPowerRatio = Math.max(0, avgPct / 100);
        }
      }
    } catch (e) { }
  }

  const actualAttackerPower = isUserDefender ? Math.round(attackerPower) : Math.round(attackerPower * deployedPowerRatio);
  const actualTargetPower = isUserDefender ? Math.round(targetPower * deployedPowerRatio) : Math.round(targetPower);
  const requestedInvasionOutcome = input.requestedInvasion
    ? resolveRequestedInvasionOutcome({
      attackerPower: actualAttackerPower,
      targetPower: actualTargetPower,
      roll: input.attackerWinRoll ?? Math.random(),
    })
    : null;
  if (actualAttackerPower === 0 || actualTargetPower === 0) {
    const winner = requestedInvasionOutcome
      ? requestedInvasionOutcome.attackerWins ? 'attacker' : 'target'
      : actualAttackerPower > 0
        ? 'attacker'
        : actualTargetPower > 0
          ? 'target'
          : 'draw';
    const isUserWin = isUserDefender
      ? winner === 'target'
      : winner === 'attacker';
    return {
      result: isUserWin ? 'win' : 'lose',
      attackerScore: actualAttackerPower,
      targetScore: actualTargetPower,
      attackerLossRatio: 0,
      targetLossRatio: 0,
      totalRounds: 0,
      message: requestedInvasionOutcome
        ? requestedInvasionOutcome.message
        : 'Pertempuran ditentukan oleh pasukan yang dikerahkan.',
      log: requestedInvasionOutcome
        ? ['Hasil operasi berbayar ditentukan oleh peluang berdasarkan perbandingan kekuatan pasukan.']
        : ['Salah satu pihak tidak mengerahkan pasukan.'],
      winner,
    };
  }

  const battle = simulateBattleTs({
    attackerPower: actualAttackerPower,
    targetPower: actualTargetPower,
  });

  const winner = requestedInvasionOutcome
    ? requestedInvasionOutcome.attackerWins ? 'attacker' : 'target'
    : battle.winner;
  const isUserWin = isUserDefender
    ? winner === 'target'
    : winner === 'attacker';

  return {
    result: isUserWin ? 'win' : 'lose',
    attackerScore: battle.attackerFinalPower,
    targetScore: battle.targetFinalPower,
    attackerLossRatio: actualAttackerPower > 0
      ? Math.min(1, Math.max(0, 1 - battle.attackerFinalPower / actualAttackerPower))
      : 0,
    targetLossRatio: actualTargetPower > 0
      ? Math.min(1, Math.max(0, 1 - battle.targetFinalPower / actualTargetPower))
      : 0,
    totalRounds: battle.totalRounds,
    message: requestedInvasionOutcome
      ? requestedInvasionOutcome.message
      : battle.message,
    log: battle.log,
    winner,
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
  requestedInvasion?: boolean;
  isPbbCoalition?: boolean;
  onAnalysisVisibilityChange?: (isVisible: boolean) => void;
  onAttackerForcesModalVisibilityChange?: (isVisible: boolean) => void;
  onClose: () => void;
  onResolve: (payload: {
    result: WarResult;
    action: WarAction;
    path: WarPath;
    isUserDefender?: boolean;
    isPbbCoalition?: boolean;
  }) => void;
  onAutoResolve?: (result: WarResult) => void;
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
  requestedInvasion = false,
  isPbbCoalition = false,
  onAnalysisVisibilityChange,
  onAttackerForcesModalVisibilityChange,
  onClose,
  onResolve,
  onAutoResolve,
}: WarMapProps) {
  const [phase, setPhase] = useState<WarPhase>('travel');
  const [result, setResult] = useState<WarResult | null>(null);
  const [showFlash, setShowFlash] = useState(false);
  const [showAttackerForces, setShowAttackerForces] = useState(false);
  const [attackerDeploymentPercent, setAttackerDeploymentPercent] = useState(50);
  const requestedInvasionRollRef = useRef(Math.random());
  const onCloseRef = useRef(onClose);
  const onAutoResolveRef = useRef(onAutoResolve);
  const autoResolveReportedRef = useRef(false);

  useEffect(() => {
    onAnalysisVisibilityChange?.(
      phase === 'comparison' || phase === 'result'
    );
  }, [phase, onAnalysisVisibilityChange]);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    onAutoResolveRef.current = onAutoResolve;
  }, [onAutoResolve]);

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
  const isAiAttacker = isNpcWar || isUserDefender;
  const effectiveAttackerDeploymentPercent = isAiAttacker
    ? attackerDeploymentPercent
    : 100;

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
    const cityCoordinates = target.cityId &&
      Number.isFinite(target.lat) &&
      Number.isFinite(target.lng);
    const coord = cityCoordinates ? null : getCapitalCoord(target.country);
    return {
      ...target,
      lat: cityCoordinates
        ? target.lat
        : (coord ? coord.lat : (typeof target.lat === 'number' && target.lat !== 0 ? target.lat : (target.latitude ?? 0))),
      lng: cityCoordinates
        ? target.lng
        : (coord ? coord.lng : (typeof target.lng === 'number' && target.lng !== 0 ? target.lng : (target.longitude ?? 0))),
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
      attackerPower:
        (Number((attacker as Record<string, unknown>).pbbCoalitionPower) || attackerPower) *
        effectiveAttackerDeploymentPercent / 100,
      targetPower,
      attackerBonus,
      defenderBonus,
      isUserDefender,
      isNpcWar: isNpcWar && !isPbbCoalition,
      requestedInvasion,
      attackerWinRoll: requestedInvasionRollRef.current,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, attackerPower, effectiveAttackerDeploymentPercent, targetPower, attackerBonus, defenderBonus, isUserDefender, isNpcWar, isPbbCoalition, requestedInvasion]);

  const deploymentConfig = useMemo(() => {
    if (typeof window === 'undefined') return {};
    try {
      const saved = window.localStorage.getItem('deployed_units_config');
      if (!saved) return {};
      const parsed: unknown = JSON.parse(saved);
      return parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed)
        ? parsed as Record<string, unknown>
        : {};
    } catch (error) {
      console.error('Gagal membaca konfigurasi pengerahan unit untuk laporan kerugian.', error);
      return {};
    }
  }, []);

  const attackerLosses = useMemo(() => {
    const units = getWarUnitComposition(
      attacker,
      deploymentConfig,
      !isAiAttacker && !isPbbCoalition
    ).map(unit => ({
      ...unit,
      quantity: isAiAttacker
        ? Math.round(unit.quantity * effectiveAttackerDeploymentPercent / 100)
        : unit.quantity,
    }));
    return calculateUnitLosses(units, battleOutcome?.attackerLossRatio ?? 0);
  }, [attacker, deploymentConfig, isAiAttacker, isPbbCoalition, effectiveAttackerDeploymentPercent, battleOutcome]);

  const targetLosses = useMemo(() => {
    const units = getWarUnitComposition(target, deploymentConfig, isUserDefender);
    return calculateUnitLosses(units, battleOutcome?.targetLossRatio ?? 0);
  }, [target, deploymentConfig, isUserDefender, battleOutcome]);

  const attackerForces = useMemo(
    () => getWarUnitComposition(attacker, {}, false)
      .map(unit => ({
        ...unit,
        quantity: Math.round(unit.quantity * effectiveAttackerDeploymentPercent / 100),
      }))
      .filter(unit => unit.quantity > 0),
    [attacker, effectiveAttackerDeploymentPercent]
  );
  const attackerForceGroups = useMemo(
    () => [
      { id: 'darat', label: 'Pasukan Darat' },
      { id: 'laut', label: 'Pasukan Laut' },
      { id: 'udara', label: 'Pasukan Udara' },
    ].map(group => ({
      ...group,
      units: attackerForces.filter(unit => unit.group === group.id),
    })).filter(group => group.units.length > 0),
    [attackerForces]
  );
  const isAttackerForcesModalVisible =
    showAttackerForces && isAiAttacker && (phase === 'travel' || phase === 'impact');

  useEffect(() => {
    onAttackerForcesModalVisibilityChange?.(isAttackerForcesModalVisible);
    return () => onAttackerForcesModalVisibilityChange?.(false);
  }, [isAttackerForcesModalVisible, onAttackerForcesModalVisibilityChange]);

  useEffect(() => {
    if (isOpen) {
      setPhase('travel');
      progressRef.current = 0;
      autoResolveReportedRef.current = false;
      requestedInvasionRollRef.current = Math.random();
      setAttackerDeploymentPercent(50 + Math.floor(Math.random() * 26));
      progressPathRef.current?.setAttribute('stroke-dasharray', '0 100');
      setResult(null);
      setShowFlash(false);
      setShowAttackerForces(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !warPath) return;
    void initializeRouteMathRust();
    let raf = 0;
    let lastTime = performance.now();
    let elapsedDays = 0;
    const startingDayPosition = getSimulationDayPosition();
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
      const currentDayPosition = getSimulationDayPosition();
      if (startingDayPosition !== null && currentDayPosition !== null) {
        elapsedDays = Math.max(elapsedDays, currentDayPosition - startingDayPosition);
      } else {
        const millisecondsPerDay = getSimulationMillisecondsPerDay() ?? 2500;
        elapsedDays += delta / millisecondsPerDay;
      }
      const currentProgress = Math.min(1, elapsedDays / warPath.travelDays);
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
      if (!autoResolveReportedRef.current) {
        autoResolveReportedRef.current = true;
        onAutoResolveRef.current?.(battleOutcome.result);
      }
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
              <g
                ref={tankRef}
                transform="translate(0 0)"
                className={isAiAttacker ? 'pointer-events-auto cursor-pointer' : undefined}
                role={isAiAttacker ? 'button' : undefined}
                tabIndex={isAiAttacker ? 0 : undefined}
                aria-label={isAiAttacker ? `Lihat jumlah pasukan ${attacker.country}` : undefined}
                onClick={isAiAttacker ? event => {
                  event.stopPropagation();
                  setShowAttackerForces(true);
                } : undefined}
                onKeyDown={isAiAttacker ? event => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    setShowAttackerForces(true);
                  }
                } : undefined}
              >
                {/* ==== AURA GLOW (dipertahankan dari versi lama) ==== */}
                <circle r={36} fill="#FF2D55" opacity={0.10} />
                <circle r={24} fill="#FF2D55" opacity={0.18} />

                <g ref={tankRotationRef} transform="rotate(0)">
                  {/* ==== SHADOW KONTAK DI TANAH ==== */}
                  <ellipse cx={1} cy={3} rx={27} ry={15} fill="#000000" opacity={0.45} />

                  {/* ==== TRACKS ==== */}
                  {/* Track jauh (atas di local Y) */}
                  <rect x={-21} y={-13} width={42} height={6.5} rx={2} fill="#3A0714" />
                  <rect x={-21} y={-13} width={42} height={1.8} rx={0.9} fill="#8B1030" />
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                    <rect
                      key={`ft${i}`}
                      x={-19 + i * 4.1}
                      y={-12.3}
                      width={2.4}
                      height={5}
                      fill="#1A0208"
                      opacity={0.55}
                    />
                  ))}

                  {/* Track dekat (bawah di local Y) */}
                  <rect x={-21} y={6.5} width={42} height={6.5} rx={2} fill="#3A0714" />
                  <rect x={-21} y={6.5} width={42} height={1.8} rx={0.9} fill="#8B1030" />
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                    <rect
                      key={`nt${i}`}
                      x={-19 + i * 4.1}
                      y={7.3}
                      width={2.4}
                      height={5}
                      fill="#1A0208"
                      opacity={0.55}
                    />
                  ))}

                  {/* Road wheels mengintip dari track */}
                  {[-16, -10, -4, 2, 8, 14].map((x) => (
                    <g key={`rw${x}`}>
                      <circle cx={x} cy={-10.5} r={1.6} fill="#6B1020" />
                      <circle cx={x} cy={10.5} r={1.6} fill="#6B1020" />
                    </g>
                  ))}

                  {/* Drive sprocket (depan) & idler (belakang) */}
                  <circle cx={-18} cy={-10} r={2.6} fill="#B71C3A" stroke="#3A0714" strokeWidth={0.5} />
                  <circle cx={-18} cy={10} r={2.6} fill="#B71C3A" stroke="#3A0714" strokeWidth={0.5} />
                  <circle cx={18} cy={-10} r={2.6} fill="#B71C3A" stroke="#3A0714" strokeWidth={0.5} />
                  <circle cx={18} cy={10} r={2.6} fill="#B71C3A" stroke="#3A0714" strokeWidth={0.5} />

                  {/* ==== HULL ==== */}
                  <path
                    d="M-21,-6 L-19,-6.5 L18,-6.5 L21,-3.5 L21,3.5 L18,6.5 L-19,6.5 L-21,6 Z"
                    fill="#FF2D55"
                    stroke="#6B1020"
                    strokeWidth={0.9}
                  />
                  {/* Permukaan atas hull (lebih terang — menangkap cahaya) */}
                  <path d="M-19,-6 L18,-6 L20,-3 L-20,-3 Z" fill="#FF5C7E" opacity={0.55} />
                  {/* Glacis depan (sisi miring depan) */}
                  <path
                    d="M18,-6.5 L21,-3.5 L21,3.5 L18,6.5 L19,3 L19,-3 Z"
                    fill="#FF7096"
                    opacity={0.7}
                  />
                  {/* Pelat belakang (lebih gelap) */}
                  <path d="M-21,-6 L-19,-6.5 L-19,6.5 L-21,6 Z" fill="#B71C3A" />
                  {/* Panel line */}
                  <path d="M-14,-6 L-14,6" stroke="#6B1020" strokeWidth={0.5} opacity={0.55} />
                  <path d="M13,-6 L13,6" stroke="#6B1020" strokeWidth={0.5} opacity={0.55} />
                  {/* Lampu depan */}
                  <circle cx={19.5} cy={-4.2} r={0.9} fill="#FFE5EC" />
                  <circle cx={19.5} cy={4.2} r={0.9} fill="#FFE5EC" />

                  {/* ==== TURRET ==== */}
                  {/* Ring dasar turret */}
                  <ellipse cx={-2} cy={0} rx={10.5} ry={7} fill="#B71C3A" />
                  {/* Body turret */}
                  <path
                    d="M-10,-4 L6,-4.5 L9,-2 L9,2 L6,4.5 L-10,4 L-12,2 L-12,-2 Z"
                    fill="#FF2D55"
                    stroke="#6B1020"
                    strokeWidth={0.7}
                  />
                  {/* Highlight atas turret */}
                  <path d="M-10,-3.5 L6,-4 L8.5,-1.5 L-11,-1.5 Z" fill="#FF7096" opacity={0.5} />
                  {/* Shadow sisi kanan turret */}
                  <path d="M6,-4.5 L9,-2 L9,2 L6,4.5 L8,2 L8,-2 Z" fill="#B71C3A" opacity={0.7} />

                  {/* Cupola komandan */}
                  <circle cx={-5} cy={-1} r={2.2} fill="#D01A42" stroke="#6B1020" strokeWidth={0.5} />
                  <circle cx={-5} cy={-1} r={1.1} fill="#FF7096" opacity={0.6} />
                  <circle cx={-5} cy={-1} r={0.5} fill="#6B1020" />
                  {/* Hatch loader */}
                  <circle cx={1} cy={1.5} r={1.3} fill="#D01A42" stroke="#6B1020" strokeWidth={0.4} />
                  <circle cx={1} cy={1.5} r={0.5} fill="#B71C3A" />

                  {/* ==== BARREL ==== */}
                  {/* Mantlet */}
                  <rect
                    x={8}
                    y={-2.5}
                    width={4}
                    height={5}
                    rx={1}
                    fill="#B71C3A"
                    stroke="#6B1020"
                    strokeWidth={0.5}
                  />
                  {/* Laras utama */}
                  <rect x={11} y={-1.3} width={19} height={2.6} fill="#D01A42" />
                  <rect x={11} y={-1.3} width={19} height={0.9} fill="#FF7096" opacity={0.55} />
                  <rect x={11} y={0.7} width={19} height={0.6} fill="#6B1020" opacity={0.5} />
                  {/* Bore evacuator (penebalan tengah laras) */}
                  <rect
                    x={19}
                    y={-1.8}
                    width={3}
                    height={3.6}
                    rx={0.7}
                    fill="#B71C3A"
                    stroke="#6B1020"
                    strokeWidth={0.3}
                  />
                  {/* Muzzle brake */}
                  <rect
                    x={30}
                    y={-2}
                    width={4.5}
                    height={4}
                    rx={0.8}
                    fill="#3A0714"
                    stroke="#1A0208"
                    strokeWidth={0.4}
                  />
                  <rect x={30} y={-2} width={4.5} height={1.2} rx={0.4} fill="#B71C3A" />
                  <ellipse cx={34.5} cy={0} rx={0.6} ry={1.6} fill="#1A0208" />
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

      {isAttackerForcesModalVisible && (
        <NotebookModalWrapper
          onClose={() => setShowAttackerForces(false)}
          zIndexClass="z-[150]"
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="attacker-forces-title"
            className="relative flex h-full flex-col overflow-hidden rounded-xl border border-[#00FFAA]/20 bg-[#0A1A1A] shadow-[0_0_30px_rgba(0,255,170,0.15)]"
          >
            <header className="relative z-10 flex shrink-0 items-center justify-between gap-2 border-b border-[#00FFAA]/20 bg-[#0A1A1A] px-4 py-2.5 sm:px-6 sm:py-3">
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#FF7088]">
                  Informasi Pergerakan Militer
                </p>
                <h2 id="attacker-forces-title" className="mt-1 break-words text-base font-black text-[#00FFAA] sm:text-xl">
                  Pasukan {attacker.country}
                </h2>
                <p className="mt-1 break-words text-xs text-white/65">
                  Jumlah unit yang dibawa dalam serangan ini
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAttackerForces(false)}
                className="flex shrink-0 cursor-pointer items-center gap-1 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] p-1.5 text-xs font-bold uppercase text-[#6B8A8A] shadow-sm transition-all hover:border-[#00FFAA] hover:text-[#00FFAA] lg:p-2"
              >
                <span className="pl-1 text-[10px] font-semibold uppercase tracking-widest lg:text-xs">
                  Tutup
                </span>
                <X className="h-4 w-4" />
              </button>
            </header>

            <div className="relative z-10 flex-1 overflow-y-auto bg-[#0A1A1A]/80 p-3 sm:p-5 [&::-webkit-scrollbar]:w-1.5 sm:[&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-[#0A1A1A] [&::-webkit-scrollbar-track]:border-l [&::-webkit-scrollbar-track]:border-[#00FFAA]/20 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb]:border-[#0A1A1A] [&::-webkit-scrollbar-thumb]:bg-gradient-to-b [&::-webkit-scrollbar-thumb]:from-[#00FFAA] [&::-webkit-scrollbar-thumb]:to-[#00B37A] [&::-webkit-scrollbar-thumb]:shadow-[0_0_10px_rgba(0,255,170,0.6)] hover:[&::-webkit-scrollbar-thumb]:from-[#33FFBB] hover:[&::-webkit-scrollbar-thumb]:to-[#00FFAA]">
                {attackerForceGroups.length > 0 ? (
                  <div className="flex flex-col gap-4">
                    {attackerForceGroups.map(group => (
                      <section key={group.id} className="min-w-0 rounded-xl border border-[#00FFAA]/20 bg-[#0A1A1A]/70 p-3">
                        <h3 className="mb-2 break-words text-xs font-bold uppercase tracking-wider text-[#00FFAA]">
                          {group.label}
                        </h3>
                        <ul className="space-y-1.5">
                          {group.units.map(unit => (
                            <li
                              key={`${group.id}-${unit.kind}`}
                              className="flex min-w-0 items-start justify-between gap-3 text-sm"
                            >
                              <span className="min-w-0 break-words text-white/75">{unit.displayName || unit.label}</span>
                              <strong className="shrink-0 tabular-nums text-white">
                                {Math.round(unit.quantity).toLocaleString('id-ID')}
                              </strong>
                            </li>
                          ))}
                        </ul>
                      </section>
                    ))}
                  </div>
                ) : (
                  <p className="break-words rounded-xl bg-white/5 p-3 text-sm text-white/70">
                    Data jumlah pasukan penyerang belum tersedia.
                  </p>
                )}

                <aside className="mt-5 max-w-full rounded-xl border border-amber-300/25 bg-amber-300/10 p-3 text-xs leading-relaxed text-amber-100/85 [overflow-wrap:anywhere]">
                  <strong className="mr-1">Catatan:</strong>
                  Negara penyerang mengerahkan {effectiveAttackerDeploymentPercent}% dari armadanya untuk operasi ini. Persentase pengerahan dipilih secara acak antara 50% dan 75%.
                </aside>
            </div>
          </section>
        </NotebookModalWrapper>
      )}

      {phase === 'comparison' && (
        <PerbandinganPasukan
          attackerName={isPbbCoalition ? 'Pasukan Gabungan PBB' : attacker.country}
          attackerIso={attacker.iso || 'cn'}
          attackerPower={attackerPower}
          attackerPowerOverride={Number((attacker as Record<string, unknown>).pbbCoalitionPower) || undefined}
          attackerDetail={attacker}
          attackerDeploymentPercent={isAiAttacker ? effectiveAttackerDeploymentPercent : undefined}
          targetName={target.country}
          targetIso={target.iso || 'un'}
          targetPower={targetPower}
          targetDetail={target}
          isUserAttacker={!isNpcWar && !isUserDefender}
          isUserDefender={isUserDefender}
          isCoalitionForce={isPbbCoalition}
          onAutoResult={handleAutoResult}
          onClose={onClose}
        />
      )}

      {/* ══════════ LAYAR HASIL PERTEMPURAN (Fase 'result') ══════════ */}
      {/* FIX: Container utama transparan (tanpa bg-black/backdrop-blur) dan pointer-events-none. */}
      {phase === 'result' && result && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center pt-[88px] sm:pt-[100px] lg:pt-[clamp(92px,10dvh,115px)] pb-3 sm:pb-4 lg:pb-5 px-3 sm:px-6 lg:px-10 pointer-events-none animate-[warFadeIn_0.4s_ease-out]">
          {/* FIX: pointer-events-auto ditambahkan di sini agar kotak modal bisa diklik */}
          <div className="w-full max-w-3xl lg:max-w-[940px] xl:max-w-[1040px] 2xl:max-w-5xl h-full max-h-[calc(100dvh-100px)] sm:max-h-[calc(100dvh-116px)] lg:max-h-[calc(100dvh-112px)] overflow-y-auto bg-[#0A1A1A] border border-[#00FFAA]/30 rounded-3xl shadow-[0_0_80px_rgba(0,255,170,0.2)] font-sans select-none pointer-events-auto">
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
              {target.cityName && (
                <div className="mx-auto mt-4 flex w-fit items-center gap-2 rounded-xl border border-[#00FFAA]/30 bg-[#00FFAA]/10 px-4 py-2">
                  <Flag className="h-4 w-4 text-[#00FFAA]" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B8A8A]">
                    Kota sasaran
                  </span>
                  <strong className="text-sm text-[#00FFAA]">
                    {target.cityName}, {target.country}
                  </strong>
                  {target.cityIsCapital && (
                    <span className="rounded bg-amber-400/15 px-2 py-1 text-[9px] font-bold uppercase text-amber-300">
                      Ibu kota
                    </span>
                  )}
                </div>
              )}
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

            <div className="border-b border-[#00FFAA]/10 p-5">
              <h3 className="mb-1 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#E0E0E0]">
                <Skull className="h-4 w-4 text-[#FF2D55]" />
                Rincian Kehilangan Unit
              </h3>
              <p className="mb-4 text-[10px] text-[#6B8A8A]">
                Estimasi kehilangan dibagi proporsional berdasarkan penurunan kekuatan tempur.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  {
                    name: isPbbCoalition ? 'Pasukan Gabungan PBB' : attacker.country,
                    color: '#00FFAA',
                    losses: attackerLosses,
                  },
                  { name: target.country, color: '#FF2D55', losses: targetLosses },
                ].map((side) => (
                  <section key={side.name} className="min-w-0 rounded-xl border border-white/10 bg-black/20 p-3">
                    <h4 className="mb-2 truncate text-[10px] font-black uppercase tracking-wider" style={{ color: side.color }}>
                      {side.name}
                    </h4>
                    {side.losses.length === 0 ? (
                      <p className="text-[10px] text-[#6B8A8A]">Tidak ada kehilangan unit yang tercatat.</p>
                    ) : (
                      <div className="max-h-36 space-y-2 overflow-y-auto pr-1">
                        {side.losses.map((loss) => (
                          <div key={loss.label} className="flex items-start justify-between gap-2 text-[10px]">
                            <span className="text-[#CBD5D5]">{loss.label}</span>
                            <span className="shrink-0 text-right">
                              <span className="font-bold text-[#FF2D55]">-{loss.lost.toLocaleString('id-ID')}</span>
                              <span className="block text-[9px] text-[#6B8A8A]">
                                sisa {loss.remaining.toLocaleString('id-ID')} / {loss.deployed.toLocaleString('id-ID')}
                              </span>
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                ))}
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