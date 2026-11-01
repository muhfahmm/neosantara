'use client';

import React, { type ComponentType, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { initializeRouteMathRust } from '../routeMathRust';
import {
  buildCapitalPoint,
  getQuadraticMotion,
  getMapRouteGeometry,
} from '../path-war';
import {
  estimateTravelTime,
  getSimulationDayPosition,
  getSimulationMillisecondsPerDay,
  isSimulationTimePaused,
  subscribeRouteAnimation,
} from '../time_logic';

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

export interface DiplomacyPathProps {
  senderCountry: string;
  targetCountry: string;
  laneIndex?: number;
  laneCount?: number;
  onArrive: () => void;
  onProgress?: (progress: number) => void;
  isPlayerAttacker?: boolean;
}

export interface DiplomacyPathMetadata {
  kind: DiplomacyPathKind;
  document: string;
  accent: string;
  Icon: DiplomacyPathIcon;
  Vehicle: DiplomacyPathVehicle;
}

export type DiplomacyPathIcon = ComponentType<{ accent: string }>;
export type DiplomacyPathVehicle = ComponentType<{ accent: string }>;

interface DiplomacyPathAnimationProps extends DiplomacyPathProps {
  kind: DiplomacyPathKind;
  accent: string;
  Vehicle: DiplomacyPathVehicle;
}


/* ============================================================
 * KOMPONEN UTAMA ANIMASI
 * ============================================================ */
export default function DiplomacyPathAnimation({
  kind,
  accent,
  Vehicle,
  senderCountry,
  targetCountry,
  laneIndex = 0,
  laneCount = 1,
  onArrive,
  onProgress,
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

  const overlay = (
    <div className={`fixed inset-0 ${kind === 'serang-negara' ? 'z-[100000020]' : 'z-10'} pointer-events-none overflow-hidden select-none`}>
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
          stroke={accent}
          strokeWidth="9"
          opacity=".14"
          strokeLinecap="round"
          filter={`url(#diplo-blur-${kind})`}
        />
        {/* Rute — garis utama dashed */}
        <path
          ref={routeRef}
          fill="none"
          stroke={accent}
          strokeWidth="3.2"
          strokeDasharray="14 10"
          strokeLinecap="round"
          className="diplomacy-route-dash"
        />

        {/* Marker asal */}
        <circle
          ref={startRef}
          r="8"
          fill={accent}
          style={{ filter: `drop-shadow(0 0 6px ${accent})` }}
        />

        {/* Marker target + pulse */}
        <circle
          ref={pulseRef}
          r="26"
          fill="none"
          stroke={accent}
          strokeWidth="1.5"
          className="diplomacy-target-pulse"
        />
        <circle
          ref={endRef}
          r="8"
          fill={accent}
          style={{ filter: `drop-shadow(0 0 6px ${accent})` }}
        />

        {/* MOBIL 3D */}
        <g ref={vehicleRef} style={{ willChange: 'transform' }}>
          <Vehicle accent={accent} />
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

  if (kind === 'serang-negara' && typeof document !== 'undefined') {
    return createPortal(overlay, document.body);
  }

  return overlay;
}