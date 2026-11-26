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
} from 'lucide-react';
import { getLocalizedCountryName } from '@/app/logic/countryNameLogic';
import { useLanguage } from '@/app/page/paused_menu/terjemahan_paused_menu/languageLogic';
import { COUNTRIES_DATA, CAPITALS_DATA } from '@/app/page/map_system/map-data';
import ModalCloseButton from '../root_modals_design_menu/ModalCloseButton';
import { getArmadaPowerSummary } from '../navigasi_menu/2_navigasi_bawah/6_pertahanan/4_armada/logic/armadaLogic';
import NotebookModalWrapper from '../navigasi_menu/2_navigasi_bawah/NotebookModalWrapper';
import { resolveRequestedInvasionOutcome } from '../detail_negara/3_operasi_militer/6_minta_serang_negara/requestedInvasionLogic';
import PerbandinganPasukan from '../detail_negara/3_operasi_militer/1_serang_negara/perbandingan_pasukan';
import { getWarUnitComposition, type WarUnit } from '../detail_negara/3_operasi_militer/1_serang_negara/war_algoritm/warUnitComposition';
import {
  getMinimumLossRatioForCasualty,
  resolveBattleDamage,
  simulateBattleTs,
} from '../detail_negara/3_operasi_militer/1_serang_negara/war_algoritm/battleEngine';
import {
  estimateTravelTime,
  getSimulationDayPosition,
  getSimulationMillisecondsPerDay,
  isSimulationTimePaused,
  MAX_TRAVEL_DAYS,
} from './time_logic';
import {
  initializeRouteMathRust,
  isRouteMathRustReady,
  projectMapPointRust,
  projectRouteGeometryRust,
  quadraticMotionRust,
  quadraticMotionFastRust,
} from './routeMathRust';
import { isPlayerWarWinner } from './warAnalysisLogic';

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
  aljazair: 'Algeria',
  algeria: 'Algeria',
};

const resolveCountryAlias = (name: string): string =>
  COUNTRY_NAME_ALIASES[name.trim().toLowerCase()] ?? name;

export function getCapitalCoord(countryName: string): LatLng | null {
  if (!countryName) return null;
  const rawKey = countryName.trim();
  const aliasKey = resolveCountryAlias(rawKey).trim();
  
  for (const key of [rawKey, aliasKey]) {
    if (CAPITAL_COORDS[key]) return CAPITAL_COORDS[key];

    const lowerKey = key.toLowerCase();
    const foundKey = Object.keys(CAPITAL_COORDS).find(
      (k) => k.toLowerCase() === lowerKey
    );
    if (foundKey) return CAPITAL_COORDS[foundKey];

    const cleanNorm = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanKey = cleanNorm(key);
    if (cleanKey) {
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
    routeMemo.clear();
  }, { passive: true });
}

export function getMapCanvasTransform(): MapCanvasTransform | null {
  if (typeof window === 'undefined') return null;
  const canvasEl = (cachedRectEl && cachedRectEl.isConnected) ? cachedRectEl : (document.getElementById('map-canvas') as HTMLCanvasElement | null);
  if (!canvasEl) return null;

  const isPanningActive = Boolean((window as any).neosantara_map_pan_active);
  const nowTs = performance.now();
  if (!cachedRect || cachedRectEl !== canvasEl || isPanningActive || nowTs - cachedRectAt > 100) {
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
  const worldCssWidth = (rect.width * scale);

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
  const canvasCenter = rect.left + rect.width / 2;
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
    rect.width,
  );
  if (rustPoint) return { x: rustPoint[0], y: rustPoint[1] };

  const x_norm = (lng + 180.0) / 360.0;
  const y_norm = (90.0 - lat) / 180.0;

  const px = x_norm * canvasWidth;
  const py = y_norm * canvasHeight;

  let x = rect.left + (px * scale + offsetX) * (rect.width / canvasWidth);
  const y = rect.top + (py * scale + offsetY) * (rect.height / canvasHeight);

  if (worldCssWidth > 0) {
    const shiftCopies = Math.round((canvasCenter - x) / worldCssWidth);
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
  const travelEstimate = estimateTravelTime(attacker.country, target.country, {
    diplomacyKind: 'serang-negara',
  });
  const hasValidCoordinates = (point: CapitalPoint) =>
    Number.isFinite(point.lat) &&
    Number.isFinite(point.lng) &&
    point.lat >= -90 &&
    point.lat <= 90 &&
    point.lng >= -180 &&
    point.lng <= 180 &&
    (point.lat !== 0 || point.lng !== 0);

  if (!travelEstimate && (!hasValidCoordinates(attacker) || !hasValidCoordinates(target))) {
    console.error('[WarPath] Cannot build route without valid country coordinates', {
      attackerCountry: attacker.country,
      targetCountry: target.country,
      attackerCoordinates: { lat: attacker.lat, lng: attacker.lng },
      targetCoordinates: { lat: target.lat, lng: target.lng },
    });
    return null;
  }

  const travelDays = travelEstimate?.days ?? MAX_TRAVEL_DAYS;
  if (!travelEstimate) {
    console.warn('[WarPath] Using the fixed travel duration because country data is unavailable', {
      attackerCountry: attacker.country,
      targetCountry: target.country,
    });
  }

  return {
    id: `${attacker.country}-${target.country}-${Date.now()}`,
    attacker,
    target,
    travelDays,
    createdAt: Date.now(),
  };
}

/* ============================================================
 * HASIL PERTEMPURAN (DeepSeek AI Engine)
 * ============================================================ */

export interface WarResultInput {
  attackerPower: number;
  targetPower: number;
  attackerDeploymentPowerRatio?: number;
  targetDeploymentPowerRatio?: number;
  roll?: number;
  requestedInvasion?: boolean;
  attackerWinRoll?: number;
  seed?: number;
  attackerBonus?: number;
  defenderBonus?: number;
  isUserDefender?: boolean;
  isMilitaryAid?: boolean;
  isNpcWar?: boolean;
  targetCityIsCapital?: boolean;
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

const UNIT_LOSS_TRANSLATION_KEYS: Record<WarUnit['kind'], string> = {
  infanteri: 'barak',
  tank: 'tank_tempur_utama',
  apcIfv: 'apc_ifv',
  artileriBerat: 'artileri_berat',
  peluncurRoket: 'sistem_peluncur_roket',
  pertahananUdaraMobile: 'pertahanan_udara_mobile',
  kendaraanTaktis: 'kendaraan_taktis',
  kapalInduk: 'kapal_induk',
  kapalIndukNuklir: 'kapal_induk_nuklir',
  destroyer: 'kapal_destroyer',
  korvet: 'kapal_korvet',
  kapalSelamNuklir: 'kapal_selam_nuklir',
  kapalSelamReguler: 'kapal_selam_regular',
  kapalRanjau: 'kapal_ranjau',
  kapalLogistik: 'kapal_logistik',
  jetTempurSiluman: 'jet_tempur_siluman',
  jetTempurInterceptor: 'jet_tempur_interceptor',
  pesawatPengebom: 'pesawat_pengebom',
  helikopterSerang: 'helikopter_serang',
  pesawatPengintai: 'pesawat_pengintai',
  droneIntaiUav: 'drone_intai_uav',
  droneKamikaze: 'drone_kamikaze',
  pesawatAngkut: 'pesawat_angkut',
};

function calculateUnitLosses(units: WarUnit[], lossRatio: number) {
  return units.map((unit) => {
    const lost = Math.min(unit.quantity, Math.round(unit.quantity * lossRatio));
    return {
      translationKey: UNIT_LOSS_TRANSLATION_KEYS[unit.kind],
      deployed: unit.quantity,
      lost,
      remaining: unit.quantity - lost,
    };
  }).filter((unit) => unit.lost > 0);
}

function getDeployedPowerRatio(
  breakdown: ReturnType<typeof getArmadaPowerSummary>['breakdown'],
  deploymentConfig: Record<string, unknown>,
): number {
  const totalPower = breakdown.reduce((total, unit) => total + unit.totalPower, 0);
  if (totalPower <= 0) return 0;

  const hasDeploymentConfig = Object.values(deploymentConfig).some(
    value => typeof value === 'number' && Number.isFinite(value),
  );
  if (!hasDeploymentConfig) return 1;

  const deployedPower = breakdown.reduce((total, unit) => {
    const key = unit.dataKey === 'pasukan_infanteri' ? 'barak' : unit.dataKey;
    const configuredPercent = deploymentConfig[key];
    const percent = typeof configuredPercent === 'number' && Number.isFinite(configuredPercent)
      ? Math.max(0, Math.min(100, configuredPercent))
      : 0;
    return total + unit.totalPower * percent / 100;
  }, 0);

  return deployedPower / totalPower;
}

export function computeWarResult(input: WarResultInput): WarResultOutput {
  const {
    attackerPower,
    targetPower,
    isUserDefender = false,
    isNpcWar = false,
  } = input;

  let deployedPowerRatio = input.attackerDeploymentPowerRatio ?? 1.0;
  // Perang antar NPC/mandat tidak boleh dipengaruhi konfigurasi pasukan milik user.
  if (
    input.attackerDeploymentPowerRatio === undefined &&
    input.targetDeploymentPowerRatio === undefined &&
    !isNpcWar &&
    typeof window !== 'undefined'
  ) {
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
  const targetDeploymentPowerRatio = input.targetDeploymentPowerRatio ?? deployedPowerRatio;
  const actualTargetPower = isUserDefender
    ? Math.round(targetPower * targetDeploymentPowerRatio)
    : Math.round(targetPower);
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
    const isUserWin = isPlayerWarWinner(winner, isUserDefender, input.isMilitaryAid === true);
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
    seed: input.seed,
  });

  const requestedWinner = requestedInvasionOutcome
    ? requestedInvasionOutcome.attackerWins ? 'attacker' : 'target'
    : undefined;

  let attackerDamage = Math.max(0, actualAttackerPower - battle.attackerFinalPower);
  let targetDamage = Math.max(0, actualTargetPower - battle.targetFinalPower);

  // Jika penyerang menang dalam aneksasi wilayah yang belum ke ibukota,
  // pasukan target/bertahan hanya berkurang 10-15% (bukan musnah total).
  if ((requestedWinner ?? battle.winner) === 'attacker' && input.targetCityIsCapital === false) {
    const seedVal = typeof input.seed === 'number' && Number.isFinite(input.seed)
      ? Math.abs(Math.sin(input.seed))
      : (typeof input.attackerWinRoll === 'number' && Number.isFinite(input.attackerWinRoll) ? input.attackerWinRoll : Math.random());
    const nonCapitalLossRatio = 0.10 + (seedVal % 1) * 0.05; // rentang 10% - 15% (0.10 - 0.15)
    targetDamage = Math.min(targetDamage, Math.max(1, Math.round(actualTargetPower * nonCapitalLossRatio)));
  }

  const damageResolution = resolveBattleDamage({
    attackerPower: actualAttackerPower,
    targetPower: actualTargetPower,
    attackerDamage,
    targetDamage,
    tieBreaker: battle.winner,
    winnerOverride: requestedWinner,
  });
  const winner = damageResolution.winner;
  const attackerScore = actualAttackerPower - damageResolution.attackerDamage;
  const targetScore = actualTargetPower - damageResolution.targetDamage;
  const attackerLossRatio = actualAttackerPower > 0
    ? damageResolution.attackerDamage / actualAttackerPower
    : 0;
  const targetLossRatio = actualTargetPower > 0
    ? damageResolution.targetDamage / actualTargetPower
    : 0;

  return {
    result: isPlayerWarWinner(winner, isUserDefender, input.isMilitaryAid === true)
      ? 'win'
      : 'lose',
    attackerScore,
    targetScore,
    attackerLossRatio,
    targetLossRatio,
    totalRounds: battle.totalRounds,
    message: requestedInvasionOutcome?.message ?? (
      winner === 'attacker'
        ? 'PENYERANG MENANG (KERUGIAN KEKUATAN LEBIH RENDAH)'
        : winner === 'target'
          ? 'TARGET MENANG (KERUGIAN KEKUATAN LEBIH RENDAH)'
          : battle.message
    ),
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
  deployedUnitsConfig?: Record<string, number>;
  isUserDefender?: boolean;
  isNpcWar?: boolean;
  isMilitaryAid?: boolean;
  isPeacekeeperDeploy?: boolean;
  primaryWar?: {
    attacker: CapitalPoint;
    target: CapitalPoint;
    isMilitaryAid?: boolean;
  };
  requestedInvasion?: boolean;
  isPbbCoalition?: boolean;
  shouldShowBattleAnalysis?: boolean;
  isPlayerCoalitionAttacker?: boolean;
  isExternalModalOpen?: boolean;
  onAnalysisVisibilityChange?: (isVisible: boolean) => void;
  onBattlePhaseChange?: (phase: WarPhase) => void;
  onAttackerForcesModalVisibilityChange?: (isVisible: boolean) => void;
  onClose: (battleOutcome?: Pick<WarResultOutput, 'result' | 'attackerLossRatio'>) => void;
  onResolve: (payload: {
    result: WarResult;
    action: WarAction;
    path: WarPath;
    isUserDefender?: boolean;
    isPbbCoalition?: boolean;
    attackerLossRatio?: number;
    targetLossRatio?: number;
    attackerLosses?: Array<{ translationKey?: string; unitKey?: string; lost: number }>;
    targetLosses?: Array<{ translationKey?: string; unitKey?: string; lost: number }>;
  }) => void;
  onAutoResolve?: (outcome: WarResultOutput) => void;
}

export default function WarMap({
  isOpen,
  attacker,
  target,
  attackerPower,
  targetPower,
  attackerBonus = 1,
  defenderBonus = 1,
  deployedUnitsConfig: committedDeploymentConfig,
  isUserDefender: isUserDefenderProp,
  isNpcWar = false,
  isMilitaryAid = false,
  isPeacekeeperDeploy = false,
  primaryWar,
  requestedInvasion = false,
  isPbbCoalition = false,
  shouldShowBattleAnalysis = true,
  isPlayerCoalitionAttacker = false,
  isExternalModalOpen = false,
  onAnalysisVisibilityChange,
  onBattlePhaseChange,
  onAttackerForcesModalVisibilityChange,
  onClose,
  onResolve,
  onAutoResolve,
}: WarMapProps) {
  const { t, language } = useLanguage();
  const tr = (key: string, params?: Record<string, string | number>) =>
    t(`navigation_defense_attack.${key}`, params);
  const [phase, setPhase] = useState<WarPhase>('travel');
  const phaseRef = useRef<WarPhase>('travel');
  phaseRef.current = phase;
  const lastAnalysisVisibilityRef = useRef<boolean | null>(null);
  const impactHandledRef = useRef(false);
  const battleOutcomeRef = useRef<WarResultOutput | null>(null);
  const [result, setResult] = useState<WarResult | null>(null);
  const [resolvedBattleOutcome, setResolvedBattleOutcome] = useState<WarResultOutput | null>(null);
  const [showFlash, setShowFlash] = useState(false);
  const [showAttackerForces, setShowAttackerForces] = useState(false);
  const [attackerDeploymentPercent, setAttackerDeploymentPercent] = useState(50);
  const requestedInvasionRollRef = useRef(Math.random());
  const onCloseRef = useRef(onClose);
  const onResolveRef = useRef(onResolve);
  const onAutoResolveRef = useRef(onAutoResolve);
  const autoResolveReportedRef = useRef(false);

  useEffect(() => {
    const isVisible = shouldShowBattleAnalysis && (phase === 'comparison' || phase === 'result');
    if (lastAnalysisVisibilityRef.current !== isVisible) {
      lastAnalysisVisibilityRef.current = isVisible;
      onAnalysisVisibilityChange?.(isVisible);
    }
  }, [phase, shouldShowBattleAnalysis, onAnalysisVisibilityChange]);

  useEffect(() => () => {
    if (!lastAnalysisVisibilityRef.current) return;
    lastAnalysisVisibilityRef.current = false;
    onAnalysisVisibilityChange?.(false);
  }, [onAnalysisVisibilityChange]);

  useEffect(() => {
    onBattlePhaseChange?.(phase);
  }, [phase, onBattlePhaseChange]);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    onResolveRef.current = onResolve;
  }, [onResolve]);

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
  const localizedAttackerCountry = getLocalizedCountryName(attacker.country, language);
  const localizedTargetCountry = getLocalizedCountryName(target.country, language);
  const localizedAttackerName = isPbbCoalition
    ? tr("analysis.coalition")
    : localizedAttackerCountry;
  const localizedTargetName = localizedTargetCountry;
  const canViewAttackerForces = isAiAttacker || isPbbCoalition;
  const attackerForceDisplayName = isPbbCoalition
    ? 'Pasukan Gabungan PBB'
    : `Pasukan ${attacker.country}`;
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
  const endMarkerRef = useRef<SVGCircleElement>(null);
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

  // Primary war route (misal agresor merah menyerang sekutu, berjalan bersamaan dengan konvoi biru bantuan pemain)
  const resolvedPrimaryAttacker = useMemo<CapitalPoint | null>(() => {
    if (!primaryWar?.attacker?.country) return null;
    const coord = getCapitalCoord(primaryWar.attacker.country);
    return {
      ...primaryWar.attacker,
      lat: coord ? coord.lat : (typeof primaryWar.attacker.lat === 'number' && primaryWar.attacker.lat !== 0 ? primaryWar.attacker.lat : (primaryWar.attacker.latitude ?? 0)),
      lng: coord ? coord.lng : (typeof primaryWar.attacker.lng === 'number' && primaryWar.attacker.lng !== 0 ? primaryWar.attacker.lng : (primaryWar.attacker.longitude ?? 0)),
    };
  }, [primaryWar?.attacker]);

  const resolvedPrimaryTarget = useMemo<CapitalPoint | null>(() => {
    if (!primaryWar?.target?.country) return null;
    const coord = getCapitalCoord(primaryWar.target.country);
    return {
      ...primaryWar.target,
      lat: coord ? coord.lat : (typeof primaryWar.target.lat === 'number' && primaryWar.target.lat !== 0 ? primaryWar.target.lat : (primaryWar.target.latitude ?? 0)),
      lng: coord ? coord.lng : (typeof primaryWar.target.lng === 'number' && primaryWar.target.lng !== 0 ? primaryWar.target.lng : (primaryWar.target.longitude ?? 0)),
    };
  }, [primaryWar?.target]);

  const primaryWarPath = useMemo<WarPath | null>(() => {
    if (!isOpen || !resolvedPrimaryAttacker || !resolvedPrimaryTarget) return null;
    return buildWarPath({ attacker: resolvedPrimaryAttacker, target: resolvedPrimaryTarget });
  }, [isOpen, resolvedPrimaryAttacker, resolvedPrimaryTarget]);

  const primaryRouteGeometryRef = useRef<MapRouteGeometry | null>(null);
  const primaryRoutePathRef = useRef<SVGPathElement>(null);
  const primaryProgressPathRef = useRef<SVGPathElement>(null);
  const primaryStartMarkerRef = useRef<SVGCircleElement>(null);
  const primaryEndMarkerRef = useRef<SVGCircleElement>(null);
  const primaryTankRef = useRef<SVGGElement>(null);
  const primaryTankRotationRef = useRef<SVGGElement>(null);

  const warPath = useMemo<WarPath | null>(() => {
    if (!isOpen) return null;
    const path = buildWarPath({ attacker: resolvedAttacker, target: resolvedTarget });
    if (!path) return null;
    return path;
  }, [isOpen, resolvedAttacker.country, resolvedTarget.country, resolvedAttacker.lat, resolvedAttacker.lng, resolvedTarget.lat, resolvedTarget.lng]);

  const deploymentConfig = useMemo(() => {
    if (committedDeploymentConfig) return committedDeploymentConfig;
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
  }, [committedDeploymentConfig]);

  const calculateBattleOutcome = useCallback(() => {
    if (!isOpen) return null;
    const attackerBreakdown = getArmadaPowerSummary(attacker).breakdown;
    const attackerDeploymentPowerRatio = getDeployedPowerRatio(attackerBreakdown, deploymentConfig);
    const targetDeploymentPowerRatio = getDeployedPowerRatio(
      getArmadaPowerSummary(target).breakdown,
      deploymentConfig,
    );
    const outcome = computeWarResult({
      attackerPower:
        (Number((attacker as Record<string, unknown>).pbbCoalitionPower) || attackerPower) *
        effectiveAttackerDeploymentPercent / 100,
      attackerDeploymentPowerRatio: !isAiAttacker && !isPbbCoalition
        ? attackerDeploymentPowerRatio
        : undefined,
      targetDeploymentPowerRatio: isUserDefender ? targetDeploymentPowerRatio : undefined,
      targetPower,
      attackerBonus,
      defenderBonus,
      isUserDefender,
      isMilitaryAid,
      isNpcWar: isNpcWar && !isPbbCoalition,
      targetCityIsCapital: target.cityIsCapital,
      requestedInvasion,
      attackerWinRoll: requestedInvasionRollRef.current,
    });
    if (!outcome || outcome.winner === 'draw') return outcome;

    const attackerUnits = getWarUnitComposition(
      attacker,
      deploymentConfig,
      !isAiAttacker && !isPbbCoalition,
    ).map(unit => ({
      ...unit,
      quantity: isAiAttacker
        ? Math.round(unit.quantity * effectiveAttackerDeploymentPercent / 100)
        : unit.quantity,
    }));
    const targetUnits = getWarUnitComposition(target, deploymentConfig, isUserDefender);

    return outcome.winner === 'attacker'
      ? {
        ...outcome,
        targetLossRatio: Math.max(
          outcome.targetLossRatio,
          getMinimumLossRatioForCasualty(targetUnits.map(unit => unit.quantity)),
        ),
      }
      : {
        ...outcome,
        attackerLossRatio: Math.max(
          outcome.attackerLossRatio,
          getMinimumLossRatioForCasualty(attackerUnits.map(unit => unit.quantity)),
        ),
      };
  }, [
    isOpen,
    attacker,
    target,
    attackerPower,
    targetPower,
    effectiveAttackerDeploymentPercent,
    isAiAttacker,
    isPbbCoalition,
    committedDeploymentConfig,
    deploymentConfig,
    isUserDefender,
    isMilitaryAid,
    isNpcWar,
    requestedInvasion,
    attackerBonus,
    defenderBonus,
  ]);

  const battleOutcome = useMemo(() => {
    if (resolvedBattleOutcome) return resolvedBattleOutcome;
    if (shouldShowBattleAnalysis && phase !== 'result') return null;
    return calculateBattleOutcome();
  }, [
    calculateBattleOutcome,
    resolvedBattleOutcome,
    shouldShowBattleAnalysis,
    phase,
  ]);
  battleOutcomeRef.current = battleOutcome;

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
    () => {
      const usesPlayerDeployment = !isAiAttacker && !isPbbCoalition;
      return getWarUnitComposition(
        attacker,
        usesPlayerDeployment ? deploymentConfig : {},
        usesPlayerDeployment
      )
      .map(unit => ({
        ...unit,
        quantity: usesPlayerDeployment
          ? unit.quantity
          : Math.round(unit.quantity * effectiveAttackerDeploymentPercent / 100),
      }))
      .filter(unit => unit.quantity > 0);
    },
    [attacker, deploymentConfig, effectiveAttackerDeploymentPercent, isAiAttacker, isPbbCoalition]
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
    showAttackerForces && (phase === 'travel' || phase === 'impact');
  const isAnotherModalOpen = isExternalModalOpen || isAttackerForcesModalVisible;

  useEffect(() => {
    onAttackerForcesModalVisibilityChange?.(isAttackerForcesModalVisible);
    return () => onAttackerForcesModalVisibilityChange?.(false);
  }, [isAttackerForcesModalVisible, onAttackerForcesModalVisibilityChange]);

  useEffect(() => {
    if (isOpen) {
      setPhase('travel');
      phaseRef.current = 'travel';
      progressRef.current = 0;
      autoResolveReportedRef.current = false;
      impactHandledRef.current = false;
      lastAnalysisVisibilityRef.current = false;
      requestedInvasionRollRef.current = Math.random();
      setAttackerDeploymentPercent(50 + Math.floor(Math.random() * 26));
      progressPathRef.current?.setAttribute('stroke-dasharray', '0 100');
      setResult(null);
      setResolvedBattleOutcome(null);
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
    let lastPrimaryGeo: MapRouteGeometry | null = null;

    const updateOverlayGeometry = (geo: MapRouteGeometry) => {
      routePathRef.current?.setAttribute('d', geo.path);
      progressPathRef.current?.setAttribute('d', geo.path);
      startMarkerRef.current?.setAttribute('cx', String(geo.start.x));
      startMarkerRef.current?.setAttribute('cy', String(geo.start.y));
      endMarkerRef.current?.setAttribute('cx', String(geo.end.x));
      endMarkerRef.current?.setAttribute('cy', String(geo.end.y));
      impactBurstRef.current?.setAttribute('cx', String(geo.end.x));
      impactBurstRef.current?.setAttribute('cy', String(geo.end.y));

      if (tankRef.current && tankRotationRef.current) {
        const currentProgress = progressRef.current;
        const motion = getQuadraticMotion(geo.start, geo.control, geo.end, currentProgress);
        tankRef.current.setAttribute('transform', `translate(${motion.x} ${motion.y})`);
        tankRotationRef.current.setAttribute('transform', `rotate(${motion.angle * 180 / Math.PI})`);
      }
    };

    const updatePrimaryOverlayGeometry = (geo: MapRouteGeometry) => {
      primaryRoutePathRef.current?.setAttribute('d', geo.path);
      primaryProgressPathRef.current?.setAttribute('d', geo.path);
      primaryStartMarkerRef.current?.setAttribute('cx', String(geo.start.x));
      primaryStartMarkerRef.current?.setAttribute('cy', String(geo.start.y));
      primaryEndMarkerRef.current?.setAttribute('cx', String(geo.end.x));
      primaryEndMarkerRef.current?.setAttribute('cy', String(geo.end.y));

      if (primaryTankRef.current && primaryTankRotationRef.current) {
        const currentProgress = progressRef.current;
        const motion = getQuadraticMotion(geo.start, geo.control, geo.end, currentProgress);
        primaryTankRef.current.setAttribute('transform', `translate(${motion.x} ${motion.y})`);
        primaryTankRotationRef.current.setAttribute('transform', `rotate(${motion.angle * 180 / Math.PI})`);
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
      if (geo !== lastGeo) {
        lastGeo = geo;
        routeGeometryRef.current = geo;
        updateOverlayGeometry(geo);
      }

      if (resolvedPrimaryAttacker && resolvedPrimaryTarget) {
        const pGeo = getMapRouteGeometry(
          resolvedPrimaryAttacker.lat,
          resolvedPrimaryAttacker.lng,
          resolvedPrimaryTarget.lat,
          resolvedPrimaryTarget.lng,
          0.18
        );
        if (pGeo !== lastPrimaryGeo) {
          lastPrimaryGeo = pGeo;
          primaryRouteGeometryRef.current = pGeo;
          updatePrimaryOverlayGeometry(pGeo);
        }
      }
    };
    refreshCameraGeometry();
    const initialRefreshFrame = requestAnimationFrame(refreshCameraGeometry);
    const initialRefreshTimer = window.setTimeout(refreshCameraGeometry, 250);
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

      if (phaseRef.current !== 'travel' || isGamePaused()) return;
      const currentDayPosition = getSimulationDayPosition();
      if (startingDayPosition !== null && currentDayPosition !== null) {
        elapsedDays = Math.max(elapsedDays, currentDayPosition - startingDayPosition);
      } else {
        const millisecondsPerDay = getSimulationMillisecondsPerDay() ?? 2500;
        elapsedDays += delta / millisecondsPerDay;
      }
      // Kecepatan dihitung seragam berdasarkan warPath.travelDays (atau primaryWarPath jika ada)
      const maxTravelDays = primaryWarPath ? Math.max(warPath.travelDays, primaryWarPath.travelDays) : warPath.travelDays;
      const currentProgress = Math.min(1, elapsedDays / maxTravelDays);
      progressRef.current = currentProgress;
      progressPathRef.current?.setAttribute('stroke-dasharray', `${currentProgress * 100} 100`);
      primaryProgressPathRef.current?.setAttribute('stroke-dasharray', `${currentProgress * 100} 100`);

      const geo = routeGeometryRef.current;
      if (geo && tankRef.current && tankRotationRef.current) {
        const motion = getQuadraticMotion(geo.start, geo.control, geo.end, currentProgress);
        tankRef.current.setAttribute('transform', `translate(${motion.x} ${motion.y})`);
        tankRotationRef.current.setAttribute('transform', `rotate(${motion.angle * 180 / Math.PI})`);
      }

      const pGeo = primaryRouteGeometryRef.current;
      if (pGeo && primaryTankRef.current && primaryTankRotationRef.current) {
        const pMotion = getQuadraticMotion(pGeo.start, pGeo.control, pGeo.end, currentProgress);
        primaryTankRef.current.setAttribute('transform', `translate(${pMotion.x} ${pMotion.y})`);
        primaryTankRotationRef.current.setAttribute('transform', `rotate(${pMotion.angle * 180 / Math.PI})`);
      }

      if (currentProgress >= 1) {
        phaseRef.current = 'impact';
        setPhase('impact');
        return;
      }
      raf = requestAnimationFrame(loop);
    };

    startLoop();
    return () => {
      stopLoop();
      cancelAnimationFrame(initialRefreshFrame);
      window.clearTimeout(initialRefreshTimer);
      window.removeEventListener('neosantara_map_camera', refreshCameraGeometry);
      window.removeEventListener('neosantara:simulation-clock-state', handleClockState);
    };
  }, [
    isOpen,
    warPath,
    primaryWarPath,
    resolvedAttacker.lat,
    resolvedAttacker.lng,
    resolvedTarget.lat,
    resolvedTarget.lng,
  ]);

  useEffect(() => {
    if (phase !== 'impact') return;
    if (impactHandledRef.current) return;
    impactHandledRef.current = true;
    setShowFlash(true);

    const outcome = battleOutcomeRef.current || battleOutcome;

    // Jika ini adalah pengiriman pasukan penjaga perdamaian ke ibukota sekutu:
    // Garis rute hilang dan tank menetap di ibukota (disimpan ke stationedPeacekeepers)
    if (isPeacekeeperDeploy) {
      const closeTimer = setTimeout(() => {
        onCloseRef.current(undefined);
      }, 800);
      const flashTimer = setTimeout(() => setShowFlash(false), 500);
      return () => {
        clearTimeout(closeTimer);
        clearTimeout(flashTimer);
      };
    }

    if (isPbbCoalition && shouldShowBattleAnalysis) {
      if (lastAnalysisVisibilityRef.current !== true) {
        lastAnalysisVisibilityRef.current = true;
        onAnalysisVisibilityChange?.(true);
      }
      phaseRef.current = 'comparison';
      setPhase('comparison');
      const flashTimer = setTimeout(() => setShowFlash(false), 500);
      return () => clearTimeout(flashTimer);
    }

    if (isPbbCoalition) {
      const resolveTimer = setTimeout(() => {
        if (outcome && warPath) {
          onResolveRef.current({
            result: outcome.result,
            action: 'retreat',
            path: warPath,
            isPbbCoalition: true,
            attackerLossRatio: outcome.attackerLossRatio,
            targetLossRatio: outcome.targetLossRatio,
          });
        } else {
          onCloseRef.current(outcome || undefined);
        }
      }, 1300);
      const flashTimer = setTimeout(() => setShowFlash(false), 500);
      return () => {
        clearTimeout(resolveTimer);
        clearTimeout(flashTimer);
      };
    }

    if (isNpcWar && !isUserDefender && !isPbbCoalition && !shouldShowBattleAnalysis) {
      if (!autoResolveReportedRef.current && outcome) {
        autoResolveReportedRef.current = true;
        onAutoResolveRef.current?.(outcome);
      }
      const closeTimer = setTimeout(() => onCloseRef.current(outcome || undefined), 1300);
      const flashTimer = setTimeout(() => setShowFlash(false), 500);
      return () => {
        clearTimeout(closeTimer);
        clearTimeout(flashTimer);
      };
    }

    const t1 = setTimeout(() => {
      phaseRef.current = 'comparison';
      setPhase('comparison');
    }, 700);
    const t2 = setTimeout(() => setShowFlash(false), 500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [phase, battleOutcome, isNpcWar, isUserDefender, isPbbCoalition, shouldShowBattleAnalysis, warPath, onAnalysisVisibilityChange]);

  const handleAction = useCallback(
    (action: WarAction) => {
      if (!warPath || !result) return;
      // 👈 Sertakan isPbbCoalition dan attackerLosses ke dalam payload
      onResolve({
        result,
        action,
        path: warPath,
        isPbbCoalition,
        attackerLossRatio: battleOutcome?.attackerLossRatio,
        targetLossRatio: battleOutcome?.targetLossRatio,
        attackerLosses: attackerLosses.map(l => ({
          translationKey: l.translationKey,
          unitKey: l.translationKey,
          lost: l.lost,
        })),
        targetLosses: targetLosses.map(l => ({
          translationKey: l.translationKey,
          unitKey: l.translationKey,
          lost: l.lost,
        })),
      });
    },
    [warPath, result, onResolve, isPbbCoalition, battleOutcome, attackerLosses, targetLosses]
  );

  const handleAutoResult = useCallback(() => {
    const outcome = calculateBattleOutcome();
    if (outcome) {
      setResolvedBattleOutcome(outcome);
      battleOutcomeRef.current = outcome;
      setResult(outcome.result);
      setPhase('result');
    }
  }, [calculateBattleOutcome]);

  if (!isOpen || !warPath) return null;

  const VB = `0 0 ${screenSize.w} ${screenSize.h}`;

  // Warna tema animasi: Merah agresor reguler (#FF2D55) vs Biru Muda PBB bantuan militer (#38BDF8)
  const warTheme = useMemo(() => {
    if (isMilitaryAid && !primaryWar?.isMilitaryAid) {
      return {
        main: '#38BDF8', // Biru muda PBB / Sky 400
        dark: '#0284C7', // Sky 600
        darker: '#0369A1', // Sky 700
        border: '#075985', // Sky 800
        track: '#0C4A6E', // Sky 900
        trackDeep: '#082F49', // Sky 950
        light: '#7DD3FC', // Sky 300
        glow: '#BAE6FD', // Sky 200
        burstEnd: '#38BDF8',
      };
    }
    return {
      main: '#FF2D55',
      dark: '#D01A42',
      darker: '#B71C3A',
      border: '#6B1020',
      track: '#3A0714',
      trackDeep: '#1A0208',
      light: '#FF5C7E',
      glow: '#FF7096',
      burstEnd: '#FF2D55',
    };
  }, [isMilitaryAid, primaryWar?.isMilitaryAid]);
  const primaryWarAccent = primaryWar?.isMilitaryAid ? '#38BDF8' : '#FF2D55';

  return (
    <>
      {(phase === 'travel' || phase === 'impact') && (
        <div
          data-war-overlay
          className={`fixed inset-0 z-20 ${isAnotherModalOpen ? 'invisible' : ''} pointer-events-none font-sans select-none overflow-hidden`}
          style={{ clipPath: 'inset(5rem 0 0 0)' }}
        >
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox={VB}
          >
            <defs>

              <radialGradient id="impact-burst">
                <stop offset="0%" stopColor="#FFEB3B" stopOpacity="1" />
                <stop offset="40%" stopColor={warTheme.main} stopOpacity="0.85" />
                <stop offset="100%" stopColor={warTheme.burstEnd} stopOpacity="0" />
              </radialGradient>
            </defs>

            <path
              ref={routePathRef}
              d="M 0 0"
              fill="none"
              stroke={warTheme.main}
              strokeWidth={4}
              strokeDasharray="14 10"
              opacity={phase === 'travel' ? 0.85 : 0.4}
              style={{ animation: 'warPathMarch 1s linear infinite' }}
            />

            <path
              ref={progressPathRef}
              d="M 0 0"
              fill="none"
              stroke={warTheme.main}
              strokeWidth={6}
              strokeLinecap="round"
              pathLength={100}
              strokeDasharray="0 100"
            />

            <circle ref={startMarkerRef} cx={0} cy={0} r={8} fill="#00FFAA" opacity={0.8} />
            <circle ref={endMarkerRef} cx={0} cy={0} r={8} fill={warTheme.main} opacity={0.8} />

            {phase === 'travel' && (
              <g
                ref={tankRef}
                transform="translate(0 0)"
                className="pointer-events-auto cursor-pointer focus:outline-none"
                role="button"
                tabIndex={0}
                aria-label={`Lihat jumlah ${attackerForceDisplayName}`}
                onClick={event => {
                  event.stopPropagation();
                  setShowAttackerForces(true);
                }}
                onKeyDown={event => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    setShowAttackerForces(true);
                  }
                }}
              >
                <circle r={44} fill="transparent" pointerEvents="all" />
                {/* ==== AURA GLOW (dipertahankan dari versi lama) ==== */}
                <circle r={36} fill={warTheme.main} opacity={0.10} />
                <circle r={24} fill={warTheme.main} opacity={0.18} />

                <g ref={tankRotationRef} transform="rotate(0)">
                  {/* ==== SHADOW KONTAK DI TANAH ==== */}
                  <ellipse cx={1} cy={3} rx={27} ry={15} fill="#000000" opacity={0.45} />

                  {/* ==== TRACKS ==== */}
                  {/* Track jauh (atas di local Y) */}
                  <rect x={-21} y={-13} width={42} height={6.5} rx={2} fill={warTheme.track} />
                  <rect x={-21} y={-13} width={42} height={1.8} rx={0.9} fill={warTheme.border} />
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                    <rect
                      key={`ft${i}`}
                      x={-19 + i * 4.1}
                      y={-12.3}
                      width={2.4}
                      height={5}
                      fill={warTheme.trackDeep}
                      opacity={0.55}
                    />
                  ))}

                  {/* Track dekat (bawah di local Y) */}
                  <rect x={-21} y={6.5} width={42} height={6.5} rx={2} fill={warTheme.track} />
                  <rect x={-21} y={6.5} width={42} height={1.8} rx={0.9} fill={warTheme.border} />
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                    <rect
                      key={`nt${i}`}
                      x={-19 + i * 4.1}
                      y={7.3}
                      width={2.4}
                      height={5}
                      fill={warTheme.trackDeep}
                      opacity={0.55}
                    />
                  ))}

                  {/* Road wheels mengintip dari track */}
                  {[-16, -10, -4, 2, 8, 14].map((x) => (
                    <g key={`rw${x}`}>
                      <circle cx={x} cy={-10.5} r={1.6} fill={warTheme.border} />
                      <circle cx={x} cy={10.5} r={1.6} fill={warTheme.border} />
                    </g>
                  ))}

                  {/* Drive sprocket (depan) & idler (belakang) */}
                  <circle cx={-18} cy={-10} r={2.6} fill={warTheme.darker} stroke={warTheme.track} strokeWidth={0.5} />
                  <circle cx={-18} cy={10} r={2.6} fill={warTheme.darker} stroke={warTheme.track} strokeWidth={0.5} />
                  <circle cx={18} cy={-10} r={2.6} fill={warTheme.darker} stroke={warTheme.track} strokeWidth={0.5} />
                  <circle cx={18} cy={10} r={2.6} fill={warTheme.darker} stroke={warTheme.track} strokeWidth={0.5} />

                  {/* ==== HULL ==== */}
                  <path
                    d="M-21,-6 L-19,-6.5 L18,-6.5 L21,-3.5 L21,3.5 L18,6.5 L-19,6.5 L-21,6 Z"
                    fill={warTheme.main}
                    stroke={warTheme.border}
                    strokeWidth={0.9}
                  />
                  {/* Permukaan atas hull (lebih terang — menangkap cahaya) */}
                  <path d="M-19,-6 L18,-6 L20,-3 L-20,-3 Z" fill={warTheme.light} opacity={0.55} />
                  {/* Glacis depan (sisi miring depan) */}
                  <path
                    d="M18,-6.5 L21,-3.5 L21,3.5 L18,6.5 L19,3 L19,-3 Z"
                    fill={warTheme.glow}
                    opacity={0.7}
                  />
                  {/* Pelat belakang (lebih gelap) */}
                  <path d="M-21,-6 L-19,-6.5 L-19,6.5 L-21,6 Z" fill={warTheme.darker} />
                  {/* Panel line */}
                  <path d="M-14,-6 L-14,6" stroke={warTheme.border} strokeWidth={0.5} opacity={0.55} />
                  <path d="M13,-6 L13,6" stroke={warTheme.border} strokeWidth={0.5} opacity={0.55} />
                  {/* Lampu depan */}
                  <circle cx={19.5} cy={-4.2} r={0.9} fill="#E0F2FE" />
                  <circle cx={19.5} cy={4.2} r={0.9} fill="#E0F2FE" />

                  {/* ==== TURRET ==== */}
                  {/* Ring dasar turret */}
                  <ellipse cx={-2} cy={0} rx={10.5} ry={7} fill={warTheme.darker} />
                  {/* Body turret */}
                  <path
                    d="M-10,-4 L6,-4.5 L9,-2 L9,2 L6,4.5 L-10,4 L-12,2 L-12,-2 Z"
                    fill={warTheme.main}
                    stroke={warTheme.border}
                    strokeWidth={0.7}
                  />
                  {/* Highlight atas turret */}
                  <path d="M-10,-3.5 L6,-4 L8.5,-1.5 L-11,-1.5 Z" fill={warTheme.glow} opacity={0.5} />
                  {/* Shadow sisi kanan turret */}
                  <path d="M6,-4.5 L9,-2 L9,2 L6,4.5 L8,2 L8,-2 Z" fill={warTheme.darker} opacity={0.7} />

                  {/* Cupola komandan */}
                  <circle cx={-5} cy={-1} r={2.2} fill={warTheme.dark} stroke={warTheme.border} strokeWidth={0.5} />
                  <circle cx={-5} cy={-1} r={1.1} fill={warTheme.glow} opacity={0.6} />
                  <circle cx={-5} cy={-1} r={0.5} fill={warTheme.border} />
                  {/* Hatch loader */}
                  <circle cx={1} cy={1.5} r={1.3} fill={warTheme.dark} stroke={warTheme.border} strokeWidth={0.4} />
                  <circle cx={1} cy={1.5} r={0.5} fill={warTheme.darker} />

                  {/* ==== BARREL ==== */}
                  {/* Mantlet */}
                  <rect
                    x={8}
                    y={-2.5}
                    width={4}
                    height={5}
                    rx={1}
                    fill={warTheme.darker}
                    stroke={warTheme.border}
                    strokeWidth={0.5}
                  />
                  {/* Laras utama */}
                  <rect x={11} y={-1.3} width={19} height={2.6} fill={warTheme.dark} />
                  <rect x={11} y={-1.3} width={19} height={0.9} fill={warTheme.glow} opacity={0.55} />
                  <rect x={11} y={0.7} width={19} height={0.6} fill={warTheme.border} opacity={0.5} />
                  {/* Bore evacuator (penebalan tengah laras) */}
                  <rect
                    x={19}
                    y={-1.8}
                    width={3}
                    height={3.6}
                    rx={0.7}
                    fill={warTheme.darker}
                    stroke={warTheme.border}
                    strokeWidth={0.3}
                  />
                  {/* Muzzle brake */}
                  <rect
                    x={30}
                    y={-2}
                    width={4.5}
                    height={4}
                    rx={0.8}
                    fill={warTheme.track}
                    stroke={warTheme.trackDeep}
                    strokeWidth={0.4}
                  />
                  <rect x={30} y={-2} width={4.5} height={1.2} rx={0.4} fill={warTheme.darker} />
                  <ellipse cx={34.5} cy={0} rx={0.6} ry={1.6} fill={warTheme.trackDeep} />
                </g>
              </g>
            )}

            {/* JALUR UTAMA PERANG (MERAH) - JIKA ADA KONVOI UTAMA SECARA SIMULTAN */}
            {primaryWarPath && (
              <>
                <path
                  ref={primaryRoutePathRef}
                  d="M 0 0"
                  fill="none"
                  stroke={primaryWarAccent}
                  strokeWidth={4}
                  strokeDasharray="14 10"
                  opacity={phase === 'travel' ? 0.85 : 0.4}
                  style={{ animation: 'warPathMarch 1s linear infinite' }}
                />
                <path
                  ref={primaryProgressPathRef}
                  d="M 0 0"
                  fill="none"
                  stroke={primaryWarAccent}
                  strokeWidth={6}
                  strokeLinecap="round"
                  pathLength={100}
                  strokeDasharray="0 100"
                />
                <circle ref={primaryStartMarkerRef} cx={0} cy={0} r={8} fill="#00FFAA" opacity={0.8} />
                <circle ref={primaryEndMarkerRef} cx={0} cy={0} r={8} fill={primaryWarAccent} opacity={0.8} />

                {phase === 'travel' && (
                  <g
                    ref={primaryTankRef}
                    transform="translate(0 0)"
                    className="pointer-events-auto cursor-pointer focus:outline-none"
                    role="button"
                    tabIndex={0}
                    aria-label={`Konvoi ${primaryWar?.attacker?.country || 'Agresor'}`}
                  >
                    <circle r={36} fill={primaryWarAccent} opacity={0.10} />
                    <circle r={24} fill={primaryWarAccent} opacity={0.18} />
                    <g ref={primaryTankRotationRef} transform="rotate(0)">
                      <ellipse cx={1} cy={3} rx={27} ry={15} fill="#000000" opacity={0.45} />
                      <rect x={-21} y={-13} width={42} height={6.5} rx={2} fill="#3A0714" />
                      <rect x={-21} y={-13} width={42} height={1.8} rx={0.9} fill="#8B1030" />
                      <rect x={-21} y={6.5} width={42} height={6.5} rx={2} fill="#3A0714" />
                      <rect x={-21} y={6.5} width={42} height={1.8} rx={0.9} fill="#8B1030" />
                      <path d="M-21,-6 L-19,-6.5 L18,-6.5 L21,-3.5 L21,3.5 L18,6.5 L-19,6.5 L-21,6 Z" fill={primaryWarAccent} stroke="#6B1020" strokeWidth={0.9} />
                      <ellipse cx={-2} cy={0} rx={10.5} ry={7} fill="#B71C3A" />
                      <path d="M-10,-4 L6,-4.5 L9,-2 L9,2 L6,4.5 L-10,4 L-12,2 L-12,-2 Z" fill="#FF2D55" stroke="#6B1020" strokeWidth={0.7} />
                      <rect x={8} y={-2.5} width={4} height={5} rx={1} fill="#B71C3A" stroke="#6B1020" strokeWidth={0.5} />
                      <rect x={11} y={-1.3} width={19} height={2.6} fill="#D01A42" />
                      <rect x={30} y={-2} width={4.5} height={4} rx={0.8} fill="#3A0714" stroke="#1A0208" strokeWidth={0.4} />
                    </g>
                  </g>
                )}
              </>
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
            className="relative flex h-full flex-col overflow-hidden rounded-xl border border-root-accent/20 bg-root-canvas shadow-[0_0_30px_rgba(0,255,170,0.15)]"
          >
            <header className="relative z-10 flex shrink-0 items-center justify-between gap-2 border-b border-root-accent/20 bg-root-canvas px-4 py-2.5 sm:px-6 sm:py-3">
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#FF7088]">
                  {t('game.attackerForces.movementInfo') || 'Informasi Pergerakan Militer'}
                </p>
                <h2 id="attacker-forces-title" className="mt-1 break-words text-[length:var(--modal-font-title)] font-black text-root-accent">
                  {attackerForceDisplayName}
                </h2>
                <p className="mt-1 break-words text-xs text-white/65">
                  {t('game.attackerForces.unitsBrought') || 'Jumlah unit yang dibawa dalam serangan ini'}
                </p>
              </div>
              <ModalCloseButton
                onClick={() => setShowAttackerForces(false)}
                className="shadow-sm lg:p-2"
              />
            </header>

            <div className="relative z-10 flex-1 overflow-y-auto bg-root-canvas/80 p-3 sm:p-5 [&::-webkit-scrollbar]:w-1.5 sm:[&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-root-canvas [&::-webkit-scrollbar-track]:border-l [&::-webkit-scrollbar-track]:border-root-accent/20 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb]:border-root-canvas [&::-webkit-scrollbar-thumb]:bg-gradient-to-b [&::-webkit-scrollbar-thumb]:from-root-accent [&::-webkit-scrollbar-thumb]:to-[#00B37A] [&::-webkit-scrollbar-thumb]:shadow-[0_0_10px_rgba(0,255,170,0.6)] hover:[&::-webkit-scrollbar-thumb]:from-[#33FFBB] hover:[&::-webkit-scrollbar-thumb]:to-root-accent">
                {attackerForceGroups.length > 0 ? (
                  <div className="flex flex-col gap-4">
                    {attackerForceGroups.map(group => (
                      <section key={group.id} className="min-w-0 rounded-xl border border-root-accent/20 bg-root-canvas/70 p-3">
                        <h3 className="mb-2 break-words text-xs font-bold uppercase tracking-wider text-root-accent">
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
                                {Math.round(unit.quantity).toLocaleString(language === 'id' ? 'id-ID' : 'en-US')}
                              </strong>
                            </li>
                          ))}
                        </ul>
                      </section>
                    ))}
                  </div>
                ) : (
                  <p className="break-words rounded-xl bg-white/5 p-3 text-sm text-white/70">
                    {t('game.attackerForces.notAvailable') || 'Data jumlah pasukan penyerang belum tersedia.'}
                  </p>
                )}

                <aside className="mt-5 max-w-full rounded-xl border border-amber-300/25 bg-amber-300/10 p-3 text-xs leading-relaxed text-amber-100/85 [overflow-wrap:anywhere]">
                  <strong className="mr-1">{t('game.attackerForces.noteTitle') || 'Catatan:'}</strong>
                  {canViewAttackerForces
                    ? t('game.attackerForces.deploymentDesc', {
                        force: isPbbCoalition
                          ? (t('game.attackerForces.pbbCoalition') || 'Pasukan Gabungan PBB')
                          : (t('game.attackerForces.attackingCountry') || 'Negara penyerang'),
                        percent: effectiveAttackerDeploymentPercent
                      }) || `${isPbbCoalition ? 'Pasukan Gabungan PBB' : 'Negara penyerang'} mengerahkan ${effectiveAttackerDeploymentPercent}% dari armadanya untuk operasi ini. Persentase pengerahan dipilih secara acak antara 50% dan 75%.`
                    : (t('game.attackerForces.unitsAdjust') || 'Jumlah unit menyesuaikan persentase pengerahan yang Anda pilih.')}
                </aside>
            </div>
          </section>
        </NotebookModalWrapper>
      )}

      {shouldShowBattleAnalysis && phase === 'comparison' && (
        <PerbandinganPasukan
          key={`comparison-${attacker.country}-${target.country}`}
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
          isMilitaryAid={isMilitaryAid}
          isUserAttacker={(!isNpcWar && !isUserDefender) || isPlayerCoalitionAttacker}
          isUserDefender={isUserDefender}
          isCoalitionForce={isPbbCoalition}
          requestedInvasion={requestedInvasion}
          targetCityIsCapital={target.cityIsCapital}
          onAutoResult={handleAutoResult}
          onClose={() => onClose(battleOutcome ?? undefined)}
        />
      )}

      {/* ══════════ LAYAR HASIL PERTEMPURAN (Fase 'result') ══════════ */}
      {/* Container utama transparan dan tidak menghalangi interaksi. */}
      {shouldShowBattleAnalysis && phase === 'result' && result && (
        <div
          style={{
            paddingTop: 'var(--modal-top-offset)',
            paddingBottom: 'var(--modal-bottom-offset)',
            paddingLeft: 'var(--modal-side-offset)',
            paddingRight: 'var(--modal-side-offset)',
          }}
          className="fixed inset-0 z-[300] flex items-center justify-center pointer-events-none animate-[warFadeIn_0.4s_ease-out]"
        >
          {/* FIX: pointer-events-auto ditambahkan di sini agar kotak modal bisa diklik */}
          <div className="modal-responsive-shell overflow-y-auto bg-root-canvas border border-root-accent/30 rounded-3xl shadow-[0_0_80px_rgba(0,255,170,0.2)] font-sans select-none pointer-events-auto">
            <div
              className={`p-6 text-center border-b ${result === 'win'
                ? 'bg-root-accent/10 border-root-accent/30'
                : 'bg-root-danger/10 border-root-danger/30'
                }`}
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-3">
                {result === 'win' ? (
                  <Trophy className="h-10 w-10 text-[#FFEB3B]" />
                ) : (
                  <TrendingDown className="h-10 w-10 text-root-danger" />
                )}
              </div>
              <h2
                className={`text-xl font-black uppercase tracking-widest ${result === 'win' ? 'text-root-accent' : 'text-root-danger'
                  }`}
              >
                {(isUserDefender || isMilitaryAid)
                  ? tr(result === 'win' ? "warResult.defenseWon" : "warResult.defenseLost")
                  : tr(result === 'win' ? "result.victory" : "warResult.attackerLost")}
              </h2>
              <p className="text-xs text-root-text mt-2 leading-relaxed">
                {tr(
                  (isUserDefender || isMilitaryAid)
                    ? result === 'win'
                      ? "warResult.defenseVictorySummary"
                      : "warResult.defenseDefeatSummary"
                    : result === 'win'
                      ? "warResult.attackerVictorySummary"
                      : "warResult.attackerDefeatSummary",
                  {
                    attacker: localizedAttackerName,
                    defender: localizedTargetName,
                    target: localizedTargetName,
                  },
                )}
              </p>
              {target.cityName && (
                <div className="mx-auto mt-4 flex w-fit items-center gap-2 rounded-xl border border-root-accent/30 bg-root-accent/10 px-4 py-2">
                  <Flag className="h-4 w-4 text-root-accent" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-root-subtle">
                    {tr("warResult.targetCity")}
                  </span>
                  <strong className="text-sm text-root-accent">
                    {target.cityName}, {localizedTargetName}
                  </strong>
                  {target.cityIsCapital && (
                    <span className="rounded bg-amber-400/15 px-2 py-1 text-[9px] font-bold uppercase text-amber-300">
                      {tr("warResult.capital")}
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 divide-x divide-root-accent/10 border-b border-root-accent/10">
              <div className="p-4 text-center">
                <p className="text-[10px] font-bold uppercase tracking-widest text-root-subtle mb-1">
                  {tr(
                    isPbbCoalition ? "warResult.coalitionScore" : "warResult.attackerScore",
                    { country: localizedAttackerCountry },
                  )}
                </p>
                <p className="text-lg font-black text-root-accent">
                  {battleOutcome?.attackerScore.toLocaleString(language)}
                </p>
              </div>
              <div className="p-4 text-center">
                <p className="text-[10px] font-bold uppercase tracking-widest text-root-subtle mb-1">
                  {tr(
                    isPbbCoalition ? "warResult.defenseScore" : "warResult.defenderScore",
                    { country: localizedTargetName },
                  )}
                </p>
                <p className="text-lg font-black text-root-danger">
                  {battleOutcome?.targetScore.toLocaleString(language)}
                </p>
              </div>
            </div>

            <div className="border-b border-root-accent/10 p-5">
              <h3 className="mb-1 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-root-text">
                <Skull className="h-4 w-4 text-root-danger" />
                {tr("warResult.lossTitle")}
              </h3>
              <p className="mb-4 text-[10px] text-root-subtle">
                {tr("warResult.lossDescription")}
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  {
                    name: localizedAttackerName,
                    color: '#00FFAA',
                    losses: attackerLosses,
                  },
                  { name: localizedTargetName, color: '#FF2D55', losses: targetLosses },
                ].map((side) => (
                  <section key={side.name} className="min-w-0 rounded-xl border border-white/10 bg-black/20 p-3">
                    <h4 className="mb-2 truncate text-[10px] font-black uppercase tracking-wider" style={{ color: side.color }}>
                      {side.name}
                    </h4>
                    {side.losses.length === 0 ? (
                      <p className="text-[10px] text-root-subtle">{tr("warResult.noLosses")}</p>
                    ) : (
                      <div className="max-h-36 space-y-2 overflow-y-auto pr-1">
                        {side.losses.map((loss, index) => (
                          <div key={`${loss.translationKey}-${index}`} className="flex items-start justify-between gap-2 text-[10px]">
                            <span className="text-[#CBD5D5]">{tr(`units.${loss.translationKey}`)}</span>
                            <span className="shrink-0 text-right">
                              <span className="font-bold text-root-danger">-{loss.lost.toLocaleString(language)}</span>
                              <span className="block text-[9px] text-root-subtle">
                                {tr("warResult.remaining", {
                                  remaining: loss.remaining.toLocaleString(language),
                                  deployed: loss.deployed.toLocaleString(language),
                                })}
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
              {isUserDefender || isMilitaryAid ? (
                <div className="space-y-3">
                  <div className={`flex items-start gap-3 p-3 rounded-xl ${result === 'win' ? 'bg-root-accent/10 border border-root-accent/30' : 'bg-root-danger/10 border border-root-danger/30'}`}>
                    <AlertTriangle className={`h-4 w-4 ${result === 'win' ? 'text-root-accent' : 'text-root-danger'} mt-0.5 flex-shrink-0`} />
                    <p className="text-[11px] text-root-text leading-relaxed">
                      {tr(
                        result === 'win'
                          ? "warResult.defenseSuccessAlert"
                          : "warResult.defenseFailureAlert",
                        { attacker: localizedAttackerName },
                      )}
                    </p>
                  </div>
                  <button
                    onClick={() => handleAction('retreat')}
                    className="w-full py-3 rounded-xl bg-root-surface hover:bg-[#1A3838] border border-root-accent/30 text-xs font-black uppercase tracking-widest text-root-text transition-colors cursor-pointer"
                  >
                    {tr(result === 'win' ? "warResult.defenseDone" : "warResult.defenseEvaluate")}
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-[10px] font-black uppercase tracking-widest text-root-subtle mb-2">
                    {result === 'win'
                      ? tr(isPbbCoalition ? "warResult.coalitionActionChoice" : "warResult.actionChoice")
                      : tr("warResult.choice")}
                  </p>

                  {result === 'win' ? (
                    <div className={`grid grid-cols-1 ${isPbbCoalition ? 'sm:grid-cols-2' : 'sm:grid-cols-3'} gap-3`}>

                      {/* FIX: Tombol Duduki / Aneksasi */}
                      <ActionButton
                        icon={<Flag className="h-5 w-5" />}
                        title={isPbbCoalition ? tr("warResult.occupation") : tr("result.annex")}
                        desc={isPbbCoalition
                          ? tr("warResult.occupationDescription")
                          : tr("result.annexDescription", {
                            country: localizedTargetName,
                            player: localizedAttackerCountry,
                          })}
                        accent="#00FFAA"
                        onClick={() => handleAction('annex')}
                      />

                      {/* FIX: Tombol Jarah SDA (Disembunyikan jika PBB) */}
                      {!isPbbCoalition && (
                        <ActionButton
                          icon={<Trophy className="h-5 w-5" />}
                          title={tr("result.plunder")}
                          desc={tr("result.plunderDescription", { country: localizedTargetName })}
                          accent="#FFEB3B"
                          onClick={() => handleAction('loot')}
                        />
                      )}

                      {/* Tombol Mundur */}
                      <ActionButton
                        icon={<ArrowLeft className="h-5 w-5" />}
                        title={tr("result.retreat")}
                        desc={tr("result.retreatDescription")}
                        accent="#6B8A8A"
                        onClick={() => handleAction('retreat')}
                      />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 p-3 rounded-xl bg-root-danger/10 border border-root-danger/30">
                        <AlertTriangle className="h-4 w-4 text-root-danger mt-0.5 flex-shrink-0" />
                        <p className="text-[11px] text-root-text leading-relaxed">
                          {tr("warResult.diplomacyWarning", { country: localizedTargetName })}
                        </p>
                      </div>
                      <button
                        onClick={() => handleAction('retreat')}
                        className="w-full py-3 rounded-xl bg-root-surface hover:bg-[#1A3838] border border-root-accent/30 text-xs font-black uppercase tracking-widest text-root-text transition-colors cursor-pointer"
                      >
                        {tr("warResult.withdraw")}
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
      className="group flex flex-col items-center text-center gap-2 p-4 rounded-2xl bg-root-surface hover:bg-[#142E2E] border border-root-accent/15 hover:border-root-accent/40 transition-all cursor-pointer"
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
      <p className="text-[10px] text-root-subtle font-semibold leading-tight">
        {desc}
      </p>
    </button>
  );
}