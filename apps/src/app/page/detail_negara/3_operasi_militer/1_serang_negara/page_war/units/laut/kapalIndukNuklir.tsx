import { useId } from "react";
import type { UnitIconProps } from "../unitIconProps";

export default function KapalIndukNuklir({ color }: UnitIconProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const u = (n: string) => `cvn-${uid}-${n}`;
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
        <radialGradient id={u("nuclear")} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fde68a" />
          <stop offset="1" stopColor="#b45309" />
        </radialGradient>
      </defs>

      {/* Water Wake */}
      <ellipse cx="24" cy="27" rx="23" ry="4.5" fill="#020617" opacity=".6" filter={`url(#${u("soft")})`} />
      <path d="M1 26 Q12 29 24 28 Q36 29 49 26" fill="none" stroke="#94a3b8" strokeOpacity=".3" strokeWidth=".5" />
      <path d="M5 28 Q15 30 24 29 Q33 30 45 28" fill="none" stroke="#94a3b8" strokeOpacity=".15" strokeWidth=".4" />

      {/* Hull Side */}
      <path d="M4 19 L8 13 L44 15 L47 19 L45 24 L8 24 Z"
        fill={`url(#${u("hullSide")})`} stroke="#020617" strokeWidth=".6" />
      
      {/* Waterline Band */}
      <path d="M6 23 L8 24 L45 24 L46 22 Z" fill="#020617" opacity=".8" />

      {/* Flight Deck (Flat, Angled Runway) */}
      <path d="M4 14 L44 15 L47 19 L12 20 Z"
        fill={`url(#${u("deck")})`} stroke="#020617" strokeWidth=".6" />
      
      {/* Bow Overhang */}
      <path d="M44 15 L47 19 L48 17 Q46 13 44 15 Z"
        fill={`url(#${u("deck")})`} stroke="#020617" strokeWidth=".5" />

      {/* Angled Landing Strip (Dashed Yellow/White) */}
      <path d="M10 17 L45 18.5" stroke="#fde68a" strokeOpacity=".7" strokeWidth=".5" strokeDasharray="1.5 1.5" />
      <path d="M8 18.5 L45 20" stroke={`url(#${u("marking")})`} strokeWidth=".3" strokeDasharray="1 1" />

      {/* Catapult Tracks (EMALS) */}
      <path d="M35 15.5 L45 16.5" stroke="#f8fafc" strokeOpacity=".5" strokeWidth=".4" />
      <path d="M30 16 L40 17" stroke="#f8fafc" strokeOpacity=".5" strokeWidth=".4" />
      <path d="M20 16.5 L30 17.5" stroke="#f8fafc" strokeOpacity=".5" strokeWidth=".4" />

      {/* Deck Elevators */}
      <rect x="27" y="15" width="4" height="2.5" rx=".2" fill="none" stroke="#f8fafc" strokeOpacity=".4" strokeWidth=".4" />
      <rect x="12" y="14" width="4" height="2.5" rx=".2" fill="none" stroke="#f8fafc" strokeOpacity=".4" strokeWidth=".4" />

      {/* Arresting Wires */}
      {[0, 1, 2, 3].map(i => (
        <path key={`wire-${i}`} d={`M${35 + i * 2} 17.5 L${36 + i * 2} 19`} stroke="#475569" strokeWidth=".4" />
      ))}

      {/* ==================== ISLAND SUPERSTRUCTURE ==================== */}
      {/* Main Island (Starboard side) */}
      <path d="M24 14 L28 8 L34 8.5 L37 13 L31 15 Z"
        fill={`url(#${u("island")})`} stroke="#020617" strokeWidth=".5" />
      <path d="M24 14 L28 8 L28 12 L24 16 Z"
        fill={`url(#${u("hullSide")})`} stroke="#020617" strokeWidth=".5" />

      {/* Bridge Windows */}
      <path d="M26 12 L29 10 L32 10.5 L29 12.5 Z"
        fill={`url(#${u("glass")})`} stroke="#020617" strokeWidth=".3" />
      <path d="M26.5 11.5 L28.5 10.2" stroke="#f8fafc" strokeOpacity=".6" strokeWidth=".3" />

      {/* Nuclear Marking (Subtle on Island) */}
      <circle cx="31" cy="12" r="1.2" fill={`url(#${u("nuclear")})`} stroke="#020617" strokeWidth=".3" opacity=".9" />
      <path d="M31 11 L31 13 M30.5 11.5 L31.5 11.5 M30.5 12.5 L31.5 12.5" stroke="#020617" strokeWidth=".2" />

      {/* Radar Tower / Mast */}
      <path d="M29 8 L29 4" stroke="#020617" strokeWidth=".6" />
      <rect x="28.5" y="4" width="2" height="1.5" fill="#475569" stroke="#020617" strokeWidth=".2" />
      <circle cx="29.5" cy="4.5" r=".8" fill="currentColor" opacity=".8" stroke="#020617" strokeWidth=".3" />
      
      {/* CIWS & Sea Sparrow Launchers */}
      <circle cx="32" cy="9" r=".8" fill="#475569" stroke="#020617" strokeWidth=".2" />
      <path d="M32 9 L32 7.5" stroke="#020617" strokeWidth=".4" />
      <rect x="25" y="9.5" width="1.5" height="1.5" fill="#64748b" stroke="#020617" strokeWidth=".2" />
      <path d="M25.5 9.5 L25.5 11" stroke="#f8fafc" strokeOpacity=".5" strokeWidth=".3" />

      {/* ==================== AIRCRAFT ON DECK ==================== */}
      {/* Jet 1 (On Catapult 1) */}
      <g transform="translate(38 15.5) rotate(-10) scale(0.8)">
        <path d="M0 0 L4 0 L5 1 L0 1 Z" fill="#94a3b8" />
        <path d="M1 0 L2 -1.5 L3 -1.5 L2.5 0 Z" fill="#64748b" />
        <path d="M1 1 L2 2.5 L3 2.5 L2.5 1 Z" fill="#64748b" />
        <path d="M0.5 0.5 L1.5 0.5" stroke="#f8fafc" strokeWidth=".3" />
      </g>
      
      {/* Jet 2 (On Catapult 2) */}
      <g transform="translate(31 16) rotate(-5) scale(0.8)">
        <path d="M0 0 L4 0 L5 1 L0 1 Z" fill="#94a3b8" />
        <path d="M1 0 L2 -1.5 L3 -1.5 L2.5 0 Z" fill="#64748b" />
        <path d="M1 1 L2 2.5 L3 2.5 L2.5 1 Z" fill="#64748b" />
      </g>

      {/* Jet 3 (Landing) */}
      <g transform="translate(20 17) rotate(5) scale(0.8)">
        <path d="M0 0 L4 0 L5 1 L0 1 Z" fill="#94a3b8" />
        <path d="M1 0 L2 -1.5 L3 -1.5 L2.5 0 Z" fill="#64748b" />
        <path d="M1 1 L2 2.5 L3 2.5 L2.5 1 Z" fill="#64748b" />
      </g>

      {/* Jet 4 (Parked) */}
      <g transform="translate(13 15) rotate(10) scale(0.6)">
        <path d="M0 0 L4 0 L5 1 L0 1 Z" fill="#94a3b8" />
        <path d="M1 0 L2 -1.5 L3 -1.5 L2.5 0 Z" fill="#64748b" />
        <path d="M1 1 L2 2.5 L3 2.5 L2.5 1 Z" fill="#64748b" />
      </g>

      {/* E-2 Hawkeye (AEW&C) with Radar Dome */}
      <g transform="translate(16 18.5) rotate(5) scale(0.7)">
        <path d="M0 0 L3 0 L4 0.5 L0 0.5 Z" fill="#94a3b8" />
        <path d="M1 0 L1.5 -1 L2.5 -1 L2 0 Z" fill="#64748b" />
        <circle cx="1.5" cy="-0.8" r="0.8" fill="#475569" stroke="#020617" strokeWidth=".2" />
      </g>

      {/* Deck vehicles / tugs */}
      <rect x="34" y="18" width="1.5" height="1" fill="#fde68a" opacity=".8" />
      <rect x="23" y="17" width="1.5" height="1" fill="#fde68a" opacity=".8" />

      {/* Antennas */}
      <path d="M27 8 L25 5" stroke="#020617" strokeWidth=".4" />
      <circle cx="25" cy="5" r=".3" fill="#94a3b8" />
      <path d="M31 8 L33 5" stroke="#020617" strokeWidth=".4" />
      <circle cx="33" cy="5" r=".3" fill="#94a3b8" />
    </g>
  );
}