'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import { initializeRouteMathRust } from './routeMathRust';
import {
  buildCapitalPoint,
  getQuadraticMotion,
  getMapRouteGeometry,
} from './path-war';
import {
  estimateTravelTime,
  getSimulationDayPosition,
  getSimulationMillisecondsPerDay,
  isSimulationTimePaused,
  subscribeRouteAnimation,
} from './time_logic';

export type DiplomacyPathKind =
  | 'non-aggression-pact'
  | 'defense-alliance'
  | 'trade-agreement'
  | 'research-contract'
  | 'aid-delivery'
  | 'spionase'
  | 'sabotase'
  | 'icbm'
  | 'serang-negara';

interface DiplomacyPathAnimationProps {
  kind: DiplomacyPathKind;
  senderCountry: string;
  targetCountry: string;
  laneIndex?: number;
  laneCount?: number;
  onArrive: () => void;
  onProgress?: (progress: number) => void;
  isPlayerAttacker?: boolean;
}

const PATH_DETAILS: Record<DiplomacyPathKind, { accent: string }> = {
  // Sebelumnya #00FFAA (Hijau), diubah menjadi Cyan Terang agar kontras dengan peta hijau
  'non-aggression-pact': { accent: '#00E5FF' }, 
  'defense-alliance': { accent: '#A78BFA' },
  'trade-agreement': { accent: '#FBBF24' },
  'research-contract': { accent: '#FB7185' },
  'aid-delivery': { accent: '#38BDF8' },
  // Sebelumnya #A3E635 (Hijau Limau), diubah menjadi Oranye
  spionase: { accent: '#F97316' }, 
  sabotase: { accent: '#F43F5E' },
  icbm: { accent: '#EF4444' },
  'serang-negara': { accent: '#FF2D55' },
};

/* ============================================================
 * KOMPONEN MOBIL 3D (TOP-DOWN VIEW)
 * ============================================================ */
function CarGlyph({ kind, accent }: { kind: DiplomacyPathKind; accent: string }) {
  return (
    <g>
      {/* Aura glow di bawah mobil */}
      <circle r="28" fill={accent} opacity=".14" className="diplomacy-glyph-glow" />

      {/* Bayangan mobil (Contact shadow) */}
      <ellipse cx="0" cy="4" rx="26" ry="11" fill="#000" opacity=".45" />

      {/* Ban Mobil (Wheels) */}
      <rect x="-16" y="-9.5" width="7.5" height="3.5" rx="1.5" fill="#111" />
      <rect x="-16" y="6" width="7.5" height="3.5" rx="1.5" fill="#111" />
      <rect x="10" y="-9.5" width="7.5" height="3.5" rx="1.5" fill="#111" />
      <rect x="10" y="6" width="7.5" height="3.5" rx="1.5" fill="#111" />

      {/* Badan Mobil Utama (Chassis) */}
      <path
        d="M -22,-6 L 16,-6 C 22,-6 25,-3 25,0 C 25,3 22,6 16,6 L -22,6 C -25,6 -26,3 -26,0 C -26,-3 -25,-6 -22,-6 Z"
        fill={accent}
      />
      {/* Highlight 3D (Atas) */}
      <path
        d="M -22,-6 L 16,-6 C 22,-6 25,-3 25,0 L -26,0 Z"
        fill="#ffffff"
        opacity=".22"
      />
      {/* Shadow 3D (Bawah) */}
      <path
        d="M -22,6 L 16,6 C 22,6 25,3 25,0 L -26,0 Z"
        fill="#000000"
        opacity=".25"
      />

      {/* Kabin / Atap Mobil */}
      <path
        d="M -10,-5 L 9,-5 C 12,-5 14,-2 14,0 C 14,2 12,5 9,5 L -10,5 C -13,5 -14,2 -14,0 C -14,-2 -13,-5 -10,-5 Z"
        fill={accent}
      />
      {/* Highlight Atap */}
      <path
        d="M -10,-5 L 9,-5 C 12,-5 14,-2 14,0 L -14,0 Z"
        fill="#ffffff"
        opacity=".35"
      />

      {/* Kaca Depan */}
      <path d="M 10,-4 L 12.5,-1 L 12.5,1 L 10,4 Z" fill="#0A1A1A" opacity=".85" />
      {/* Kaca Belakang */}
      <path d="M -11,-4 L -13.5,-1 L -13.5,1 L -11,4 Z" fill="#0A1A1A" opacity=".85" />
      
      {/* ==== LAMBANG DI ATAP MOBIL ==== */}
      <g transform="translate(0 0) scale(0.55)">
        {kind === 'non-aggression-pact' && (
          <>
            <circle cx="-3" cy="0" r="5" fill="none" stroke="#fff" strokeWidth="2" />
            <circle cx="3" cy="0" r="5" fill="none" stroke="#fff" strokeWidth="2" opacity=".8" />
          </>
        )}
        {kind === 'defense-alliance' && (
          <path d="M0,-6 L5,-3 L5,2 Q5,6 0,7 Q-5,6 -5,2 L-5,-3 Z" fill="none" stroke="#fff" strokeWidth="2" strokeLinejoin="round" />
        )}
        {kind === 'trade-agreement' && (
          <>
            <rect x="-4" y="-4" width="8" height="8" rx="1.5" fill="none" stroke="#fff" strokeWidth="2" />
            <path d="M-4,-1 L0,2 L4,-1" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </>
        )}
        {kind === 'research-contract' && (
          <>
            <circle cx="0" cy="0" r="1.8" fill="#fff" />
            <ellipse rx="7" ry="2.5" fill="none" stroke="#fff" strokeWidth="1.5" />
            <ellipse rx="7" ry="2.5" fill="none" stroke="#fff" strokeWidth="1.5" transform="rotate(60)" />
            <ellipse rx="7" ry="2.5" fill="none" stroke="#fff" strokeWidth="1.5" transform="rotate(-60)" />
          </>
        )}
        {/* Default Emblem (Untuk misi lain seperti bantuan, spionase, dll) */}
        {!['non-aggression-pact', 'defense-alliance', 'trade-agreement', 'research-contract'].includes(kind) && (
          <path d="M0,-5 L2,0 L7,0 L3,3 L5,8 L0,5 L-5,8 L-3,3 L-7,0 L-2,0 Z" fill="#fff" opacity=".8" />
        )}
      </g>

      {/* Lampu Depan (Headlights) */}
      <path d="M 23,-4 L 25.5,-2 L 25.5,-1 L 23,0 Z" fill="#ffffff" opacity=".95" />
      <path d="M 23,4 L 25.5,2 L 25.5,1 L 23,0 Z" fill="#ffffff" opacity=".95" />

      {/* Lampu Belakang (Taillights) */}
      <path d="M -26,-4 L -24,-2 L -24,-1 L -26,0 Z" fill="#FF2D55" opacity=".9" />
      <path d="M -26,4 L -24,2 L -24,1 L -26,0 Z" fill="#FF2D55" opacity=".9" />
    </g>
  );
}

/* ============================================================
 * KOMPONEN UTAMA ANIMASI
 * ============================================================ */
export default function DiplomacyPathAnimation({
  kind,
  senderCountry,
  targetCountry,
  laneIndex = 0,
  laneCount = 1,
  onArrive,
  onProgress,
  isPlayerAttacker,
}: DiplomacyPathAnimationProps) {
  const onArriveRef = useRef(onArrive);
  const onProgressRef = useRef(onProgress);
  const routeRef = useRef<SVGPathElement>(null);
  const glowRouteRef = useRef<SVGPathElement>(null);
  const startRef = useRef<SVGCircleElement>(null);
  const endRef = useRef<SVGCircleElement>(null);
  const pulseRef = useRef<SVGCircleElement>(null);
  const vehicleRef = useRef<SVGGElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const geometryRef = useRef<ReturnType<typeof getMapRouteGeometry> | null>(null);

  const sender = useMemo(() => buildCapitalPoint(senderCountry), [senderCountry]);
  const target = useMemo(() => buildCapitalPoint(targetCountry), [targetCountry]);
  const travelEstimate = useMemo(
    () => estimateTravelTime(senderCountry, targetCountry),
    [senderCountry, targetCountry]
  );
  
  const details = PATH_DETAILS[kind];
  const laneOffset = laneIndex - (laneCount - 1) / 2;
  const routeCurvature = -0.14 + laneOffset * 0.07;
  const lastReportedProgress = useRef(-1);

  useEffect(() => {
    onArriveRef.current = onArrive;
  }, [onArrive]);

  useEffect(() => {
    onProgressRef.current = onProgress;
  }, [onProgress]);

  useEffect(() => {
    if (!sender || !target || !travelEstimate) {
      if (sender && target && !travelEstimate) {
        console.error('[DiplomacyPath] No country coordinates found for route', { senderCountry, targetCountry });
      }
      return;
    }
    void initializeRouteMathRust();
    let lastFrame = performance.now();
    let elapsedDays = 0;
    let completed = false;
    let lastPath = '';
    lastReportedProgress.current = -1;
    const startingDayPosition = getSimulationDayPosition();

    let cachedWinWidth = typeof window !== 'undefined' ? window.innerWidth : 1;
    let cachedWinHeight = typeof window !== 'undefined' ? window.innerHeight : 1;
    if (svgRef.current) {
      svgRef.current.setAttribute('viewBox', `0 0 ${cachedWinWidth} ${cachedWinHeight}`);
    }

    const onResize = () => {
      cachedWinWidth = window.innerWidth;
      cachedWinHeight = window.innerHeight;
      if (svgRef.current) {
        svgRef.current.setAttribute('viewBox', `0 0 ${cachedWinWidth} ${cachedWinHeight}`);
      }
    };
    window.addEventListener('resize', onResize, { passive: true });

    const updateRoute = (now: number) => {
      const delta = now - lastFrame;
      lastFrame = now;
      const isPaused = isSimulationTimePaused();
      const currentDayPosition = getSimulationDayPosition();
      if (startingDayPosition !== null && currentDayPosition !== null) {
        elapsedDays = Math.max(elapsedDays, currentDayPosition - startingDayPosition);
      } else if (!isPaused) {
        const millisecondsPerDay = getSimulationMillisecondsPerDay() ?? 2500;
        elapsedDays += delta / millisecondsPerDay;
      }

      const { start, end, control, path } = geometryRef.current || getMapRouteGeometry(
        sender.lat, sender.lng, target.lat, target.lng, routeCurvature
      );
      const progress = Math.min(1, elapsedDays / travelEstimate.days);
      const progressPercent = Math.floor(progress * 100);
      if (progressPercent !== lastReportedProgress.current) {
        lastReportedProgress.current = progressPercent;
        onProgressRef.current?.(progress);
      }
      const vehicle = getQuadraticMotion(start, control, end, progress);

      if (path !== lastPath) {
        lastPath = path;
        routeRef.current?.setAttribute('d', path);
        glowRouteRef.current?.setAttribute('d', path);
        startRef.current?.setAttribute('cx', String(start.x));
        startRef.current?.setAttribute('cy', String(start.y));
        endRef.current?.setAttribute('cx', String(end.x));
        endRef.current?.setAttribute('cy', String(end.y));
        pulseRef.current?.setAttribute('cx', String(end.x));
        pulseRef.current?.setAttribute('cy', String(end.y));
      }
      vehicleRef.current?.setAttribute(
        'transform',
        `translate(${vehicle.x} ${vehicle.y}) rotate(${vehicle.angle * 180 / Math.PI})`
      );

      if (progress >= 1) {
        if (!completed) {
          completed = true;
          onArriveRef.current();
        }
        return;
      }
    };

    geometryRef.current = getMapRouteGeometry(sender.lat, sender.lng, target.lat, target.lng, routeCurvature);
    const unsubscribe = subscribeRouteAnimation(updateRoute);
    const onCamera = () => {
      geometryRef.current = getMapRouteGeometry(sender.lat, sender.lng, target.lat, target.lng, routeCurvature);
      updateRoute(performance.now());
    };
    window.addEventListener('neosantara_map_camera', onCamera);
    return () => {
      unsubscribe();
      window.removeEventListener('neosantara_map_camera', onCamera);
      window.removeEventListener('resize', onResize);
    };
  }, [sender, target, senderCountry, targetCountry, travelEstimate, routeCurvature]);

  if (!sender || !target || !travelEstimate) return null;

  return (
    <div className="fixed inset-0 z-10 pointer-events-none overflow-hidden select-none">
      <svg ref={svgRef} className="absolute inset-0 h-full w-full" viewBox="0 0 1 1">
        <defs>
          <filter id={`diplo-blur-${kind}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" />
          </filter>
        </defs>

        {/* Rute — soft glow blur */}
        <path
          ref={glowRouteRef}
          fill="none"
          stroke={details.accent}
          strokeWidth="9"
          opacity=".14"
          strokeLinecap="round"
          filter={`url(#diplo-blur-${kind})`}
        />
        {/* Rute — garis utama dashed */}
        <path
          ref={routeRef}
          fill="none"
          stroke={details.accent}
          strokeWidth="3.2"
          strokeDasharray="14 10"
          strokeLinecap="round"
          className="diplomacy-route-dash"
        />

        {/* Marker asal */}
        <circle
          ref={startRef}
          r="8"
          fill={details.accent}
          style={{ filter: `drop-shadow(0 0 6px ${details.accent})` }}
        />

        {/* Marker target + pulse */}
        <circle
          ref={pulseRef}
          r="26"
          fill="none"
          stroke={details.accent}
          strokeWidth="1.5"
          className="diplomacy-target-pulse"
        />
        <circle
          ref={endRef}
          r="8"
          fill={details.accent}
          style={{ filter: `drop-shadow(0 0 6px ${details.accent})` }}
        />

        {/* MOBIL 3D */}
        <g ref={vehicleRef} style={{ willChange: 'transform' }}>
          <CarGlyph kind={kind} accent={details.accent} />
        </g>
      </svg>

      <style jsx>{`
        .diplomacy-route-dash {
          animation: diplomacyRouteDash 900ms linear infinite;
        }
        .diplomacy-target-pulse {
          animation: diplomacyTargetPulse 1.5s ease-out infinite;
          transform-box: fill-box;
          transform-origin: center;
        }
        .diplomacy-glyph-glow {
          animation: diplomacyGlyphGlow 2.6s ease-in-out infinite;
          transform-box: fill-box;
          transform-origin: center;
        }
        @keyframes diplomacyRouteDash {
          to { stroke-dashoffset: -24; }
        }
        @keyframes diplomacyTargetPulse {
          0%   { opacity: .7; transform: scale(.45); }
          100% { opacity: 0;  transform: scale(1.7); }
        }
        @keyframes diplomacyGlyphGlow {
          0%, 100% { opacity: .12; }
          50%      { opacity: .28; }
        }
      `}</style>
    </div>
  );
}