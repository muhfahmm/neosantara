'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import {
  buildCapitalPoint,
  getMapRouteGeometry,
  pointOnQuadraticBezier,
  tangentOnQuadraticBezier,
} from './path-war';
import {
  estimateTravelTime,
  getSimulationDayPosition,
  getSimulationMillisecondsPerDay,
  isSimulationTimePaused,
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
  'non-aggression-pact': {
    accent: '#00FFAA',
  },
  'defense-alliance': {
    accent: '#A78BFA',
  },
  'trade-agreement': {
    accent: '#FBBF24',
  },
  'research-contract': {
    accent: '#FB7185',
  },
  'aid-delivery': {
    accent: '#38BDF8',
  },
  spionase: {
    accent: '#A3E635',
  },
  sabotase: {
    accent: '#F43F5E',
  },
  icbm: {
    accent: '#EF4444',
  },
  'serang-negara': {
    accent: '#FF2D55',
  },
};

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
    let frame = 0;
    let lastFrame = performance.now();
    let elapsedDays = 0;
    let completed = false;
    let lastPath = '';
    lastReportedProgress.current = -1;
    const startingDayPosition = getSimulationDayPosition();

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

      const { start, end, control, path } = getMapRouteGeometry(
        sender.lat,
        sender.lng,
        target.lat,
        target.lng,
        routeCurvature
      );
      const progress = Math.min(1, elapsedDays / travelEstimate.days);
      const progressPercent = Math.floor(progress * 100);
      if (progressPercent !== lastReportedProgress.current) {
        lastReportedProgress.current = progressPercent;
        onProgressRef.current?.(progress);
      }
      const vehicle = pointOnQuadraticBezier(start, control, end, progress);
      const angle = tangentOnQuadraticBezier(start, control, end, progress) * 180 / Math.PI;

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
      if (routeRef.current) routeRef.current.style.animationPlayState = isPaused ? 'paused' : 'running';
      if (pulseRef.current) pulseRef.current.style.animationPlayState = isPaused ? 'paused' : 'running';
      vehicleRef.current?.setAttribute('transform', `translate(${vehicle.x} ${vehicle.y}) rotate(${angle})`);
      if (svgRef.current) svgRef.current.setAttribute('viewBox', `0 0 ${window.innerWidth} ${window.innerHeight}`);

      if (progress >= 1) {
        if (!completed) {
          completed = true;
          onArriveRef.current();
        }
        return;
      }
      frame = requestAnimationFrame(updateRoute);
    };

    frame = requestAnimationFrame(updateRoute);
    const onCamera = () => {
      cancelAnimationFrame(frame);
      updateRoute(performance.now());
    };
    window.addEventListener('neosantara_map_camera', onCamera);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('neosantara_map_camera', onCamera);
    };
  }, [sender, target, senderCountry, targetCountry, travelEstimate, routeCurvature]);

  if (!sender || !target || !travelEstimate) return null;

  return (
    <div className="fixed inset-0 z-10 pointer-events-none overflow-hidden select-none">
      <svg ref={svgRef} className="absolute inset-0 h-full w-full" viewBox="0 0 1 1">
        <defs>
          <filter id="diplomacy-path-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <path ref={glowRouteRef} fill="none" stroke={details.accent} strokeWidth="10" opacity=".18" />
        <path ref={routeRef} fill="none" stroke={details.accent} strokeWidth="4" strokeDasharray="16 11" className="diplomacy-route-dash" />
        <circle ref={startRef} r="10" fill={details.accent} />
        <circle ref={pulseRef} r="30" fill="none" stroke={details.accent} strokeWidth="2" className="diplomacy-target-pulse" />
        <circle ref={endRef} r="10" fill={details.accent} />
        <g ref={vehicleRef}>
          <circle r="27" fill={details.accent} opacity=".18" />
          <rect x="-23" y="-10" width="46" height="20" rx="5" fill={details.accent} />
          <path d="M-14 -10 L-6 -20 H11 L18 -10Z" fill={details.accent} />
          <path d="M-4 -17 H8 V-11 H-8Z" fill="#0A1A1A" opacity=".82" />
          <circle cx="-13" cy="11" r="5" fill="#071313" />
          <circle cx="13" cy="11" r="5" fill="#071313" />
        </g>
      </svg>
      <style jsx>{`
        .diplomacy-route-dash { animation: diplomacyRouteDash 900ms linear infinite; }
        .diplomacy-target-pulse { animation: diplomacyTargetPulse 1.5s ease-out infinite; transform-box: fill-box; transform-origin: center; }
        @keyframes diplomacyRouteDash { to { stroke-dashoffset: -27; } }
        @keyframes diplomacyTargetPulse { 0% { opacity: .7; transform: scale(.45); } 100% { opacity: 0; transform: scale(1.7); } }
      `}</style>
    </div>
  );
}
