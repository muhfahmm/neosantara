'use client';

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  X,
  Swords,
  Flag,
  Trophy,
  TrendingDown,
  ArrowLeft,
  Shield,
  FastForward,
  AlertTriangle,
} from 'lucide-react';
import { COUNTRIES_DATA } from '@/app/page/map_system/map-data';
import PerbandinganPasukan from './perbandingan_pasukan';
import PageWar from './page_war/page_war';

/* ============================================================
 * TIPE & INTERFACE (Penggabungan dari path-war.ts)
 * ============================================================ */

export interface LatLng {
  lat: number;
  lng: number;
}

export interface CapitalPoint extends LatLng {
  /** Nama negara (untuk display & lookup) */
  country: string;
  /** Nama ibukota (mis. "Kabul", "Tehran", "Jakarta") */
  capital: string;
  /** Kode ISO 2 huruf negara (opsional) */
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

export const CAPITAL_COORDS: Record<string, LatLng> = {
  // ── Asia Tengah & Timur Tengah ──
  Afganistan: { lat: 34.52, lng: 69.18 },
  Afghanistan: { lat: 34.52, lng: 69.18 },
  Iran: { lat: 35.6892, lng: 51.389 },
  Turkmenistan: { lat: 37.96, lng: 58.32 },
  Pakistan: { lat: 33.6844, lng: 73.0479 },
  Uzbekistan: { lat: 41.2995, lng: 69.2401 },
  Tajikistan: { lat: 38.5598, lng: 68.787 },
  Kyrgyzstan: { lat: 42.8746, lng: 74.5698 },
  Kazakhstan: { lat: 51.1694, lng: 71.4491 },
  Iraq: { lat: 33.3152, lng: 44.3661 },
  'Saudi Arabia': { lat: 24.7136, lng: 46.6753 },
  'Arab Saudi': { lat: 24.7136, lng: 46.6753 },
  Turkey: { lat: 39.9334, lng: 32.8597 },
  Turki: { lat: 39.9334, lng: 32.8597 },
  India: { lat: 28.6139, lng: 77.209 },
  China: { lat: 39.9042, lng: 116.4074 },
  Tiongkok: { lat: 39.9042, lng: 116.4074 },
  Russia: { lat: 55.7558, lng: 37.6173 },
  Rusia: { lat: 55.7558, lng: 37.6173 },

  // ── ASEAN ──
  Indonesia: { lat: -6.2088, lng: 106.8456 },
  Malaysia: { lat: 3.139, lng: 101.6869 },
  Singapore: { lat: 1.3521, lng: 103.8198 },
  Singapura: { lat: 1.3521, lng: 103.8198 },
  Philippines: { lat: 14.5995, lng: 120.9842 },
  Filipina: { lat: 14.5995, lng: 120.9842 },
  Thailand: { lat: 13.7563, lng: 100.5018 },
  Vietnam: { lat: 21.0285, lng: 105.8542 },
  Myanmar: { lat: 19.7633, lng: 96.0785 },
  Cambodia: { lat: 11.5564, lng: 104.9282 },
  Kamboja: { lat: 11.5564, lng: 104.9282 },
  Laos: { lat: 17.9757, lng: 102.6331 },
  Brunei: { lat: 4.9031, lng: 114.9398 },

  // ── Asia Timur & Selatan ──
  Japan: { lat: 35.6762, lng: 139.6503 },
  Jepang: { lat: 35.6762, lng: 139.6503 },
  'South Korea': { lat: 37.5665, lng: 126.978 },
  'Korea Selatan': { lat: 37.5665, lng: 126.978 },
  'North Korea': { lat: 39.0392, lng: 125.7625 },
  'Korea Utara': { lat: 39.0392, lng: 125.7625 },
  Bangladesh: { lat: 23.8103, lng: 90.4125 },
  Nepal: { lat: 27.7172, lng: 85.324 },
  'Sri Lanka': { lat: 6.9271, lng: 79.8612 },

  // ── Eropa ──
  'United Kingdom': { lat: 51.5074, lng: -0.1278 },
  Inggris: { lat: 51.5074, lng: -0.1278 },
  France: { lat: 48.8566, lng: 2.3522 },
  Prancis: { lat: 48.8566, lng: 2.3522 },
  Germany: { lat: 52.52, lng: 13.405 },
  Jerman: { lat: 52.52, lng: 13.405 },
  Italy: { lat: 41.9028, lng: 12.4964 },
  Italia: { lat: 41.9028, lng: 12.4964 },
  Spain: { lat: 40.4168, lng: -3.7038 },
  Spanyol: { lat: 40.4168, lng: -3.7038 },
  Netherlands: { lat: 52.3676, lng: 4.9041 },
  Belanda: { lat: 52.3676, lng: 4.9041 },
  Poland: { lat: 52.2297, lng: 21.0122 },
  Polandia: { lat: 52.2297, lng: 21.0122 },
  Ukraine: { lat: 50.4501, lng: 30.5234 },
  Ukraina: { lat: 50.4501, lng: 30.5234 },

  // ── Amerika ──
  'United States': { lat: 38.9072, lng: -77.0369 },
  'Amerika Serikat': { lat: 38.9072, lng: -77.0369 },
  Canada: { lat: 45.4215, lng: -75.6972 },
  Kanada: { lat: 45.4215, lng: -75.6972 },
  Mexico: { lat: 19.4326, lng: -99.1332 },
  Meksiko: { lat: 19.4326, lng: -99.1332 },
  Brazil: { lat: -15.7975, lng: -47.8919 },
  Brasil: { lat: -15.7975, lng: -47.8919 },
  Argentina: { lat: -34.6037, lng: -58.3816 },

  // ── Afrika & Oseania ──
  Egypt: { lat: 30.0444, lng: 31.2357 },
  Mesir: { lat: 30.0444, lng: 31.2357 },
  Nigeria: { lat: 9.0765, lng: 7.3986 },
  'South Africa': { lat: -25.7479, lng: 28.2293 },
  'Afrika Selatan': { lat: -25.7479, lng: 28.2293 },
  Australia: { lat: -35.2809, lng: 149.13 },
};

export function getCapitalCoord(countryName: string): LatLng | null {
  const key = countryName.trim();
  if (CAPITAL_COORDS[key]) return CAPITAL_COORDS[key];
  const found = Object.keys(CAPITAL_COORDS).find(
    (k) => k.toLowerCase() === key.toLowerCase()
  );
  if (found) return CAPITAL_COORDS[found];

  // Fallback ke COUNTRIES_DATA dari map-data
  const match = COUNTRIES_DATA.find(
    (c) => c.country.toLowerCase().trim() === key.toLowerCase()
  );
  if (match && match.latitude !== undefined && match.longitude !== undefined) {
    return { lat: match.latitude, lng: match.longitude };
  }

  return null;
}

export function buildCapitalPoint(
  country: string,
  capital?: string
): CapitalPoint | null {
  const ll = getCapitalCoord(country);
  const match = COUNTRIES_DATA.find(
    (c) => c.country.toLowerCase().trim() === country.toLowerCase().trim()
  );
  const capitalName = capital || match?.capital || country;

  if (!ll) {
    return {
      country,
      capital: capitalName,
      lat: 0,
      lng: 0,
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

export function getMapScreenPos(lat: number, lng: number): ScreenPoint {
  if (typeof window === 'undefined') return { x: 0, y: 0 };
  const canvasEl = document.getElementById('map-canvas') as HTMLCanvasElement | null;
  if (!canvasEl) return { x: 0, y: 0 };

  const rect = canvasEl.getBoundingClientRect();
  const ctx = canvasEl.getContext('2d');

  let scale = 1;
  let offsetX = 0;
  let offsetY = 0;

  if (ctx && typeof ctx.getTransform === 'function') {
    const matrix = ctx.getTransform();
    scale = matrix.a || 1;
    offsetX = matrix.e || 0;
    offsetY = matrix.f || 0;
  }

  const canvasWidth = canvasEl.width || rect.width || 1000;
  const canvasHeight = canvasEl.height || rect.height || 500;

  // Proyeksi Equirectangular yang persis sama dengan MapEngine WASM
  const x_norm = (lng + 180.0) / 360.0;
  const y_norm = (90.0 - lat) / 180.0;

  const px = x_norm * canvasWidth;
  const py = y_norm * canvasHeight;

  const x = rect.left + px * scale + offsetX;
  const y = rect.top + py * scale + offsetY;

  return { x, y };
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
 * HASIL PERTEMPURAN
 * ============================================================ */

export interface WarResultInput {
  attackerPower: number;
  targetPower: number;
  roll?: number;
  attackerBonus?: number;
  defenderBonus?: number;
}

export interface WarResultOutput {
  result: WarResult;
  attackerScore: number;
  targetScore: number;
}

export function computeWarResult(input: WarResultInput): WarResultOutput {
  const {
    attackerPower,
    targetPower,
    roll = Math.random(),
    attackerBonus = 1,
    defenderBonus = 1,
  } = input;

  const atk = attackerPower * attackerBonus * (0.85 + roll * 0.3);
  const def = targetPower * defenderBonus * (0.85 + (1 - roll) * 0.3);

  return {
    result: atk >= def ? 'win' : 'lose',
    attackerScore: Math.round(atk),
    targetScore: Math.round(def),
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
  onClose: () => void;
  onResolve: (payload: {
    result: WarResult;
    action: WarAction;
    path: WarPath;
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
  onClose,
  onResolve,
}: WarMapProps) {
  const [phase, setPhase] = useState<WarPhase>('travel');
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<WarResult | null>(null);
  const [showFlash, setShowFlash] = useState(false);

  /* ── Viewport screen size ── */
  const [screenSize, setScreenSize] = useState<{ w: number; h: number }>({
    w: typeof window !== 'undefined' ? window.innerWidth : 1920,
    h: typeof window !== 'undefined' ? window.innerHeight : 1080,
  });

  /* ── State Posisi Real-time di Canvas Map ── */
  const [startPos, setStartPos] = useState<ScreenPoint>({ x: 0, y: 0 });
  const [endPos, setEndPos] = useState<ScreenPoint>({ x: 0, y: 0 });

  /* ── Listener Resize Window ── */
  useEffect(() => {
    const handleResize = () => {
      setScreenSize({ w: window.innerWidth, h: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  /* ── Bangun data WarPath dasar ── */
  const warPath = useMemo<WarPath | null>(() => {
    if (!isOpen) return null;
    return buildWarPath({ attacker, target });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, attacker.country, target.country]);

  /* ── Hitung hasil bentrokan ── */
  const battleOutcome = useMemo(() => {
    if (!isOpen) return null;
    return computeWarResult({
      attackerPower,
      targetPower,
      attackerBonus,
      defenderBonus,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, attackerPower, targetPower, attackerBonus, defenderBonus]);

  /* ── Reset state saat dibuka ── */
  useEffect(() => {
    if (isOpen) {
      setPhase('travel');
      setProgress(0);
      setResult(null);
      setShowFlash(false);
    }
  }, [isOpen]);

  /* ── Main Loop (RAF) update posisi canvas & pergerakan tank ── */
  useEffect(() => {
    if (!isOpen || !warPath) return;
    let raf = 0;
    let lastTime = performance.now();
    let accumulatedMs = 0;
    const dur = warPath.durationMs;

    const loop = (now: number) => {
      const delta = now - lastTime;
      lastTime = now;

      // Update posisi ibukota penyerang & target persis di atas Canvas Map real-time
      const curStart = getMapScreenPos(attacker.lat, attacker.lng);
      const curEnd = getMapScreenPos(target.lat, target.lng);
      setStartPos(curStart);
      setEndPos(curEnd);

      const isGamePaused = typeof window !== 'undefined' ? Boolean((window as any).neosantara_is_paused) : false;

      if (phase === 'travel') {
        if (!isGamePaused) {
          accumulatedMs += delta;
          const t = Math.min(1, accumulatedMs / dur);
          setProgress(t);
          if (t >= 1) {
            setPhase('impact');
          }
        }
        raf = requestAnimationFrame(loop);
      } else {
        raf = requestAnimationFrame(loop);
      }
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [isOpen, phase, warPath, attacker.lat, attacker.lng, target.lat, target.lng]);

  /* ── Fase impact -> fase comparison (Perbandingan Pasukan) ── */
  useEffect(() => {
    if (phase !== 'impact' || !battleOutcome) return;
    setShowFlash(true);
    const t1 = setTimeout(() => {
      setPhase('comparison');
    }, 700);
    const t2 = setTimeout(() => setShowFlash(false), 500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [phase, battleOutcome]);

  /* ── Titik kontrol Bezier & jalur ── */
  const controlPos = useMemo(() => {
    return buildControlPoint(startPos, endPos, 0.18);
  }, [startPos, endPos]);

  const svgPathStr = useMemo(() => {
    return buildSVGPath(startPos, controlPos, endPos);
  }, [startPos, controlPos, endPos]);

  /* ── Posisi & rotasi tank ── */
  const tank = useMemo(() => {
    const p = pointOnQuadraticBezier(startPos, controlPos, endPos, progress);
    const angle =
      (tangentOnQuadraticBezier(startPos, controlPos, endPos, progress) * 180) /
      Math.PI;
    return { ...p, angle };
  }, [startPos, controlPos, endPos, progress]);

  /* ── Handlers ── */
  const handleAction = useCallback(
    (action: WarAction) => {
      if (!warPath || !result) return;
      onResolve({ result, action, path: warPath });
    },
    [warPath, result, onResolve]
  );

  const handleSkip = useCallback(() => {
    if (phase === 'travel') {
      setProgress(1);
      setPhase('impact');
    }
  }, [phase]);

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
      {/* ══════════ SVG MAP OVERLAY (HANYA MUNCUL SAAT FASE TRAVEL / IMPACT) ══════════ */}
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

            {/* ── Garis putus-putus merah (rencana jalur penyerangan) ── */}
            <path
              d={svgPathStr}
              fill="none"
              stroke="#FF2D55"
              strokeWidth={4}
              strokeDasharray="14 10"
              opacity={phase === 'travel' ? 0.85 : 0.4}
              style={{
                animation: 'warPathMarch 1s linear infinite',
              }}
            />

            {/* ── Bagian jalur yang sudah dilalui tank (solid glow) ── */}
            <path
              d={svgPathStr}
              fill="none"
              stroke="#FF2D55"
              strokeWidth={6}
              strokeLinecap="round"
              filter="url(#glow-red)"
              pathLength={100}
              strokeDasharray={`${progress * 100} 100`}
            />

            {/* ── Marker ibukota penyerang ── */}
            <circle cx={startPos.x} cy={startPos.y} r={8} fill="#00FFAA" opacity={0.8} />
            <circle cx={startPos.x} cy={startPos.y} r={16} fill="none" stroke="#00FFAA" strokeWidth={2} opacity={0.5} />

            {/* ── Marker ibukota target ── */}
            <circle cx={endPos.x} cy={endPos.y} r={8} fill="#FF2D55" opacity={0.8} />
            <circle cx={endPos.x} cy={endPos.y} r={20} fill="none" stroke="#FF2D55" strokeWidth={2}>
              <animate attributeName="r" values="16;30;16" dur="1.6s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.7;0;0.7" dur="1.6s" repeatCount="indefinite" />
            </circle>

            {/* ── Tank penyerang bergerak di atas Canvas ── */}
            {tank && phase === 'travel' && (
              <g transform={`translate(${tank.x} ${tank.y})`}>
                {/* Halo Merah */}
                <circle r={30} fill="#FF2D55" opacity={0.25} />
                {/* Tank (rotasi sesuai arah kurva) */}
                <g transform={`rotate(${tank.angle})`}>
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

            {/* ── Impact burst saat tiba di ibukota target ── */}
            {phase === 'impact' && (
              <circle cx={endPos.x} cy={endPos.y} r={0} fill="url(#impact-burst)">
                <animate attributeName="r" from="0" to="160" dur="0.7s" fill="freeze" />
                <animate attributeName="opacity" from="1" to="0" dur="0.7s" fill="freeze" />
              </circle>
            )}
          </svg>

          {/* ══════════ FLASH OVERLAY saat impact ══════════ */}
          {showFlash && (
            <div className="absolute inset-0 bg-white/70 pointer-events-none animate-[warFlash_0.6s_ease-out_forwards]" />
          )}
        </div>
      )}

      {/* ══════════ MODAL PERBANDINGAN PASUKAN (Fase 'comparison') ══════════ */}
      {phase === 'comparison' && (
        <PerbandinganPasukan
          attackerName={attacker.country}
          attackerIso={attacker.iso || 'cn'}
          attackerPower={attackerPower}
          attackerDetail={attacker}
          targetName={target.country}
          targetIso={target.iso || 'un'}
          targetPower={targetPower}
          targetDetail={target}
          onStartBattle={handleStartBattle}
          onAutoResult={handleAutoResult}
          onClose={onClose}
        />
      )}

      {/* ══════════ PAGE WAR HALAMAN SEDANG DALAM PENGEMBANGAN (Fase 'battle_page') ══════════ */}
      {phase === 'battle_page' && (
        <PageWar
          attackerName={attacker.country}
          targetName={target.country}
          onAutoResult={handleAutoResult}
          onClose={onClose}
        />
      )}

      {/* ══════════ HUD HEADER & PROGRESS BAR (HANYA SAAT FASE TRAVEL) ══════════ */}
      {phase === 'travel' && (
        <div className="fixed inset-0 z-[150] pointer-events-none font-sans select-none overflow-hidden">
          {/* ── HEADER HUD ── */}
          <div className="absolute top-4 left-0 right-0 p-4 sm:p-6 flex items-start justify-between gap-4 pointer-events-none">
            <div className="flex items-center gap-3 pointer-events-auto bg-[#0a1a1a]/95 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-[#FF2D55]/40 shadow-2xl">
              <div className="p-2 rounded-xl bg-[#FF2D55]/20 border border-[#FF2D55]/50">
                <Swords className="h-5 w-5 text-[#FF2D55]" />
              </div>
              <div>
                <h1 className="text-xs sm:text-sm font-black text-[#FF2D55] uppercase tracking-widest leading-none">
                  Operasi Militer Aktif
                </h1>
                <p className="text-[10px] text-[#6B8A8A] font-bold uppercase tracking-widest mt-1">
                  Pasukan Menuju -&gt; {target.capital || target.country}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 pointer-events-auto">
              <button
                onClick={handleSkip}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#0A1A1A]/95 hover:bg-[#0F2424] backdrop-blur-md border border-[#FF2D55]/40 text-[#FF2D55] text-[10px] font-black uppercase tracking-widest cursor-pointer transition-colors shadow-xl"
              >
                <FastForward className="h-3.5 w-3.5" />
                Percepat
              </button>
              <button
                onClick={onClose}
                className="p-2.5 rounded-xl bg-[#0A1A1A]/95 hover:bg-[#0F2424] backdrop-blur-md border border-[#FF2D55]/40 text-[#FF2D55] transition-colors cursor-pointer shadow-xl"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* ── HUD BAWAH (PROGRESS BAR) ── */}
          <div className="absolute bottom-24 sm:bottom-28 left-0 right-0 p-4 flex justify-center pointer-events-none">
            <div className="w-full max-w-xl bg-[#0A1A1A]/95 backdrop-blur-md border border-[#FF2D55]/40 rounded-2xl p-4 pointer-events-auto shadow-2xl">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-[#00FFAA]" />
                  <span className="text-[10px] font-black text-[#00FFAA] uppercase tracking-widest">
                    {attacker.capital} ({attacker.country})
                  </span>
                </div>
                <span className="text-[10px] font-bold text-[#6B8A8A] uppercase tracking-widest">
                  {Math.round(progress * 100)}% · ETA{' '}
                  {Math.max(0, Math.round((warPath.durationMs * (1 - progress)) / 1000))}s
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-[#FF2D55] uppercase tracking-widest">
                    {target.capital} ({target.country})
                  </span>
                  <Flag className="h-4 w-4 text-[#FF2D55]" />
                </div>
              </div>
              <div className="h-2.5 bg-[#050B0B] rounded-full overflow-hidden border border-[#FF2D55]/30">
                <div
                  className="h-full bg-gradient-to-r from-[#00FFAA] via-[#FFEB3B] to-[#FF2D55] transition-[width] duration-100 ease-linear"
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════ LAYAR HASIL PERTEMPURAN (Fase 'result') ══════════ */}
      {phase === 'result' && result && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm pointer-events-auto animate-[warFadeIn_0.4s_ease-out]">
          <div className="w-full max-w-lg bg-[#0A1A1A] border border-[#00FFAA]/30 rounded-3xl overflow-hidden shadow-[0_0_80px_rgba(0,255,170,0.2)] font-sans select-none">
            {/* Header hasil */}
            <div
              className={`p-6 text-center border-b ${
                result === 'win'
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
                className={`text-xl font-black uppercase tracking-widest ${
                  result === 'win' ? 'text-[#00FFAA]' : 'text-[#FF2D55]'
                }`}
              >
                {result === 'win' ? 'Kemenangan Mutlak!' : 'Pasukan Terpukul Mundur'}
              </h2>
              <p className="text-xs text-[#E0E0E0] mt-2 leading-relaxed">
                {result === 'win' ? (
                  <>
                    Pasukan <strong className="text-white">{attacker.country}</strong>{' '}
                    berhasil menembus benteng pertahanan{' '}
                    <strong className="text-white">{target.country}</strong>!
                  </>
                ) : (
                  <>
                    Pasukan <strong className="text-white">{attacker.country}</strong>{' '}
                    gagal menembus pertahanan{' '}
                    <strong className="text-white">{target.country}</strong>.
                  </>
                )}
              </p>
            </div>

            {/* Skor */}
            <div className="grid grid-cols-2 divide-x divide-[#00FFAA]/10 border-b border-[#00FFAA]/10">
              <div className="p-4 text-center">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#6B8A8A] mb-1">
                  Skor Penyerang
                </p>
                <p className="text-lg font-black text-[#00FFAA]">
                  {battleOutcome?.attackerScore.toLocaleString()}
                </p>
              </div>
              <div className="p-4 text-center">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#6B8A8A] mb-1">
                  Skor Bertahan
                </p>
                <p className="text-lg font-black text-[#FF2D55]">
                  {battleOutcome?.targetScore.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Opsi aksi */}
            <div className="p-5 space-y-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#6B8A8A] mb-2">
                {result === 'win' ? 'Pilih Aneksasi atau Opsi Taktis:' : 'Pilihan:'}
              </p>

              {result === 'win' ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <ActionButton
                    icon={<Flag className="h-5 w-5" />}
                    title="Aneksasi"
                    desc="Caplok & integrasikan wilayah target"
                    accent="#00FFAA"
                    onClick={() => handleAction('annex')}
                  />
                  <ActionButton
                    icon={<Trophy className="h-5 w-5" />}
                    title="Jarah SDA"
                    desc="Rampas sumber daya tanpa mencaplok"
                    accent="#FFEB3B"
                    onClick={() => handleAction('loot')}
                  />
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
