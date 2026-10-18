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

export interface IcbmPathProps {
  senderCountry: string;
  targetCountry: string;
  laneIndex?: number;
  laneCount?: number;
  onArrive: () => void;
  onProgress?: (progress: number) => void;
}

export default function IcbmPath({
  senderCountry,
  targetCountry,
  laneIndex = 0,
  laneCount = 1,
  onArrive,
  onProgress,
}: IcbmPathProps) {
  const onArriveRef = useRef(onArrive);
  const onProgressRef = useRef(onProgress);
  const routeRef = useRef<SVGPathElement>(null);
  const glowRouteRef = useRef<SVGPathElement>(null);
  const startRef = useRef<SVGCircleElement>(null);
  const endRef = useRef<SVGCircleElement>(null);
  const pulseRef = useRef<SVGCircleElement>(null);
  const warheadRef = useRef<SVGGElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const sender = useMemo(() => buildCapitalPoint(senderCountry), [senderCountry]);
  const target = useMemo(() => buildCapitalPoint(targetCountry), [targetCountry]);
  const travelEstimate = useMemo(
    () => estimateTravelTime(senderCountry, targetCountry),
    [senderCountry, targetCountry]
  );

  // Akselerasi ICBM merah menyala
  const accent = '#EF4444'; // Merah cerah
  const glowAccent = '#DC2626'; // Merah neon
  const laneOffset = laneIndex - (laneCount - 1) / 2;
  // Kurva balistik lebih tinggi ke angkasa (-0.28)
  const routeCurvature = -0.28 + laneOffset * 0.08;
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
        console.error('[IcbmPath] Koordinat negara tidak ditemukan', { senderCountry, targetCountry });
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

      const warhead = pointOnQuadraticBezier(start, control, end, progress);
      const angle = (tangentOnQuadraticBezier(start, control, end, progress) * 180) / Math.PI;

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

      warheadRef.current?.setAttribute('transform', `translate(${warhead.x} ${warhead.y}) rotate(${angle})`);
      if (svgRef.current) svgRef.current.setAttribute('viewBox', `0 0 ${window.innerWidth} ${window.innerHeight}`);

      if (progress >= 1) {
        if (!completed) {
          completed = true;
          // Panggil kilatan ledakan keclap putih di koordinat target
          if (typeof window !== 'undefined') {
            window.dispatchEvent(
              new CustomEvent('trigger_icbm_explosion_flash', {
                detail: {
                  x: end.x,
                  y: end.y,
                  targetName: targetCountry,
                },
              })
            );
          }
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
    <div className="fixed inset-0 z-20 pointer-events-none overflow-hidden select-none">
      <svg ref={svgRef} className="absolute inset-0 h-full w-full" viewBox="0 0 1 1">
        <defs>
          <filter id="icbm-path-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Jalur pijar merah tebal */}
        <path
          ref={glowRouteRef}
          fill="none"
          stroke={glowAccent}
          strokeWidth="14"
          opacity=".35"
        />

        {/* Garis putus-putus merah menyala dengan animasi lesatan */}
        <path
          ref={routeRef}
          fill="none"
          stroke={accent}
          strokeWidth="4.5"
          strokeDasharray="14 8"
          className="icbm-route-dash"
        />

        {/* Titik peluncuran awal (Silo Nuklir) */}
        <circle ref={startRef} r="9" fill="#991B1B" stroke="#F87171" strokeWidth="2" />

        {/* Titik sasaran target (Radar target locking) */}
        <circle
          ref={pulseRef}
          r="36"
          fill="none"
          stroke={accent}
          strokeWidth="2.5"
          className="icbm-target-pulse"
        />
        <circle ref={endRef} r="9" fill={accent} stroke="#FFFFFF" strokeWidth="2" />

        {/* Hulu Ledak Rudal Balistik ICBM */}
        <g ref={warheadRef}>
          {/* Efek lidah api roket pendorong di belakang */}
          <polygon points="-32,0 -22,-5 -24,0 -22,5" fill="#F59E0B" opacity=".95" />
          <polygon points="-42,0 -28,-3 -30,0 -28,3" fill="#EF4444" opacity=".8" />
          <circle cx="-24" cy="0" r="10" fill="#FBBF24" opacity=".35" />

          {/* Badan Rudal ICBM */}
          <rect x="-18" y="-5" width="30" height="10" rx="3" fill="#E5E7EB" stroke="#1F2937" strokeWidth="1" />
          {/* Ujung Hulu Ledak Nuklir (Kerah Merah) */}
          <path d="M12 -5 L24 0 L12 5 Z" fill={accent} />
          {/* Sirip Kendali Ekor Rudal */}
          <polygon points="-18,-9 -10,-5 -18,-5" fill="#991B1B" />
          <polygon points="-18,9 -10,5 -18,5" fill="#991B1B" />
          {/* Simbol Radiasi Nuklir kecil di badan rudal */}
          <circle cx="0" cy="0" r="2.5" fill="#DC2626" />
        </g>
      </svg>

      <style jsx>{`
        .icbm-route-dash {
          animation: icbmRouteDash 600ms linear infinite;
        }
        .icbm-target-pulse {
          animation: icbmTargetPulse 1.2s ease-out infinite;
          transform-box: fill-box;
          transform-origin: center;
        }
        @keyframes icbmRouteDash {
          to {
            stroke-dashoffset: -22;
          }
        }
        @keyframes icbmTargetPulse {
          0% {
            opacity: 0.9;
            transform: scale(0.3);
          }
          100% {
            opacity: 0;
            transform: scale(1.9);
          }
        }
      `}</style>
    </div>
  );
}
