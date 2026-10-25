import { useId } from "react";
import type { UnitIconProps } from "../unitIconProps";

export default function KapalInduk({ color }: UnitIconProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const u = (n: string) => `cv-${uid}-${n}`;
  const baseColor = color ?? "#53674f";

  return (
    <g color={baseColor} strokeLinejoin="round" strokeLinecap="round">
      <defs>
        <filter id={u("soft")} x="-40%" y="-140%" width="180%" height="380%">
          <feGaussianBlur stdDeviation="1.4" />
        </filter>
        <linearGradient id={u("deck")} x1="0" y1="0" x2="0.8" y2="1">
          <stop offset="0" stopColor="#1e293b" />
          <stop offset="0.5" stopColor="#334155" />
          <stop offset="1" stopColor="#0f172a" />
        </linearGradient>
        <linearGradient id={u("hullSide")} x1="0" y1="0" x2="0.12" y2="1">
          <stop offset="0" stopColor="currentColor" stopOpacity="0.9" />
          <stop offset="0.6" stopColor="currentColor" stopOpacity="0.5" />
          <stop offset="1" stopColor="#020617" stopOpacity="0.9" />
        </linearGradient>
        <linearGradient id={u("island")} x1="0" y1="0" x2="0.7" y2="1">
          <stop offset="0" stopColor="currentColor" stopOpacity="1" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.6" />
        </linearGradient>
        <linearGradient id={u("glass")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6ee7f0" stopOpacity="0.9" />
          <stop offset="1" stopColor="#0e7490" stopOpacity="0.8" />
        </linearGradient>
        <linearGradient id={u("marking")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f8fafc" stopOpacity="0.8" />
          <stop offset="1" stopColor="#f8fafc" stopOpacity="0.2" />
        </linearGradient>
      </defs>

      {/* Water Wake */}
      <ellipse cx="24" cy="27" rx="23" ry="4.5" fill="#020617" opacity=".6" filter={`url(#${u("soft")})`} />
      <path d="M1 26 Q12 29 24 28 Q36 29 49 26" fill="none" stroke="#94a3b8" strokeOpacity=".3" strokeWidth=".5" />
      
      {/* Hull Side */}
      <path d="M4 19 L8 13 L44 15 L47 19 L45 24 L8 24 Z"
        fill={`url(#${u("hullSide")})`} stroke="#020617" strokeWidth=".6" />
      
      {/* Waterline Band */}
      <path d="M6 23 L8 24 L45 24 L46 22 Z" fill="#020617" opacity=".8" />

      {/* Flight Deck (Angled & Ski Jump) */}
      <path d="M8 13 L44 15 L47 19 L12 20 Z"
        fill={`url(#${u("deck")})`} stroke="#020617" strokeWidth=".6" />
      
      {/* Ski Jump (Ramp at Bow) */}
      <path d="M44 15 L47 19 L48 16 Q45 12 44 15 Z"
        fill={`url(#${u("deck")})`} stroke="#020617" strokeWidth=".5" />
      <path d="M44 15 Q46 13 48 16" fill="none" stroke="#f8fafc" strokeOpacity=".4" strokeWidth=".4" />

      {/* Landing Strip Markings (Dashed) */}
      <path d="M15 16.5 L43 17.5" stroke={`url(#${u("marking")})`} strokeWidth=".5" strokeDasharray="2 2" />
      <path d="M10 18 L44 19" stroke={`url(#${u("marking")})`} strokeWidth=".3" strokeDasharray="1 1" />

      {/* Deck Elevators (Hangar access) */}
      <rect x="30" y="15.5" width="3" height="2" rx=".2" fill="none" stroke="#f8fafc" strokeOpacity=".4" strokeWidth=".4" />
      <rect x="14" y="14.5" width="3" height="2" rx=".2" fill="none" stroke="#f8fafc" strokeOpacity=".4" strokeWidth=".4" />

      {/* ==================== ISLAND SUPERSTRUCTURE ==================== */}
      {/* Main Island Block */}
      <path d="M22 14 L26 8 L32 8.5 L35 13 L29 15 Z"
        fill={`url(#${u("island")})`} stroke="#020617" strokeWidth=".5" />
      <path d="M22 14 L26 8 L26 12 L22 16 Z"
        fill={`url(#${u("hullSide")})`} stroke="#020617" strokeWidth=".5" />

      {/* Bridge Windows */}
      <path d="M24 12 L27 10 L30 10.5 L27 12.5 Z"
        fill={`url(#${u("glass")})`} stroke="#020617" strokeWidth=".3" />
      <path d="M24.5 11.5 L26.5 10.2" stroke="#f8fafc" strokeOpacity=".6" strokeWidth=".3" />

      {/* Radar Tower / Mast */}
      <path d="M27 8 L27 4" stroke="#020617" strokeWidth=".6" />
      <rect x="26.5" y="4" width="2" height="1.5" fill="#475569" stroke="#020617" strokeWidth=".2" />
      <circle cx="27.5" cy="4.5" r=".8" fill="currentColor" opacity=".8" stroke="#020617" strokeWidth=".3" />
      
      {/* CIWS on Island */}
      <circle cx="30" cy="9" r=".8" fill="#475569" stroke="#020617" strokeWidth=".2" />
      <path d="M30 9 L30 7.5" stroke="#020617" strokeWidth=".4" />

      {/* ==================== AIRCRAFT ON DECK ==================== */}
      {/* Jet 1 (Taking off from ski jump) */}
      <g transform="translate(42 14.5) rotate(-15) scale(0.8)">
        <path d="M0 0 L4 0 L5 1 L0 1 Z" fill="#94a3b8" />
        <path d="M1 0 L2 -1.5 L3 -1.5 L2.5 0 Z" fill="#64748b" />
        <path d="M1 1 L2 2.5 L3 2.5 L2.5 1 Z" fill="#64748b" />
        <path d="M0.5 0.5 L1.5 0.5" stroke="#f8fafc" strokeWidth=".3" />
      </g>

      {/* Jet 2 (On deck) */}
      <g transform="translate(25 16) rotate(5) scale(0.8)">
        <path d="M0 0 L4 0 L5 1 L0 1 Z" fill="#94a3b8" />
        <path d="M1 0 L2 -1.5 L3 -1.5 L2.5 0 Z" fill="#64748b" />
        <path d="M1 1 L2 2.5 L3 2.5 L2.5 1 Z" fill="#64748b" />
        <path d="M0.5 0.5 L1.5 0.5" stroke="#f8fafc" strokeWidth=".3" />
      </g>
      
      {/* Jet 3 (On deck far) */}
      <g transform="translate(15 15.5) rotate(10) scale(0.6)">
        <path d="M0 0 L4 0 L5 1 L0 1 Z" fill="#94a3b8" />
        <path d="M1 0 L2 -1.5 L3 -1.5 L2.5 0 Z" fill="#64748b" />
        <path d="M1 1 L2 2.5 L3 2.5 L2.5 1 Z" fill="#64748b" />
      </g>

      {/* Deck vehicles / tugs */}
      <rect x="36" y="17" width="1.5" height="1" fill="#fde68a" opacity=".8" />
      <rect x="20" y="16.5" width="1.5" height="1" fill="#fde68a" opacity=".8" />

      {/* Antennas */}
      <path d="M25 8 L23 5" stroke="#020617" strokeWidth=".4" />
      <circle cx="23" cy="5" r=".3" fill="#94a3b8" />
    </g>
  );
}