import { useId } from "react";
import type { UnitIconProps } from "../unitIconProps";

export default function Destroyer({ color }: UnitIconProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const u = (n: string) => `ddg-${uid}-${n}`;
  const baseColor = color ?? "#53674f";

  return (
    <g color={baseColor} strokeLinejoin="round" strokeLinecap="round">
      <defs>
        <filter id={u("soft")} x="-40%" y="-140%" width="180%" height="380%">
          <feGaussianBlur stdDeviation="1.2" />
        </filter>
        <filter id={u("glow")} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="0.6" />
        </filter>

        {/* Hull Gradients */}
        <linearGradient id={u("deck")} x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0" stopColor="currentColor" stopOpacity="1" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.65" />
        </linearGradient>
        <linearGradient id={u("hullSide")} x1="0" y1="0" x2="0.12" y2="1">
          <stop offset="0" stopColor="currentColor" stopOpacity="0.85" />
          <stop offset="0.5" stopColor="currentColor" stopOpacity="0.45" />
          <stop offset="1" stopColor="#020617" stopOpacity="0.9" />
        </linearGradient>
        
        {/* Superstructure */}
        <linearGradient id={u("superTop")} x1="0" y1="0" x2="0.7" y2="1">
          <stop offset="0" stopColor="currentColor" stopOpacity="1" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.7" />
        </linearGradient>
        <linearGradient id={u("superSide")} x1="0" y1="0" x2="0.15" y2="1">
          <stop offset="0" stopColor="currentColor" stopOpacity="0.9" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.3" />
        </linearGradient>

        {/* Glass & Radar */}
        <linearGradient id={u("glass")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6ee7f0" stopOpacity="0.9" />
          <stop offset="1" stopColor="#0e7490" stopOpacity="0.8" />
        </linearGradient>
        <linearGradient id={u("aesa")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#94a3b8" />
          <stop offset="1" stopColor="#334155" />
        </linearGradient>
        <linearGradient id={u("water")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#020617" stopOpacity="0" />
          <stop offset="0.5" stopColor="#020617" stopOpacity="0.4" />
          <stop offset="1" stopColor="#020617" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Water Wake / Shadow */}
      <ellipse cx="24" cy="26" rx="22" ry="4.5" fill="#020617" opacity=".6" filter={`url(#${u("soft")})`} />
      <path d="M2 25 Q10 28 24 27 Q38 28 48 25" fill="none" stroke="#94a3b8" strokeOpacity=".3" strokeWidth=".5" />
      <path d="M6 27 Q15 30 24 29 Q33 30 44 27" fill="none" stroke="#94a3b8" strokeOpacity=".2" strokeWidth=".4" />

      {/* Hull Side (Waterline to Deck) */}
      <path d="M5 20 L12 14 L41 14 L46 19 L44 23 L9 23 Z"
        fill={`url(#${u("hullSide")})`} stroke="#020617" strokeWidth=".6" />
      
      {/* Waterline anti-fouling paint (dark band) */}
      <path d="M7 22 L9 23 L44 23 L45 21 Z"
        fill="#020617" opacity=".8" />

      {/* Deck */}
      <path d="M12 14 L41 14 L46 19 L15 19 Z"
        fill={`url(#${u("deck")})`} stroke="#020617" strokeWidth=".6" />
      <path d="M13 15 L40 15 L44 18" fill="none" stroke="#f8fafc" strokeOpacity=".3" strokeWidth=".4" />

      {/* Bow */}
      <path d="M41 14 L46 19 L48 22 L45 23 L44 19 Z"
        fill={`url(#${u("superSide")})`} stroke="#020617" strokeWidth=".5" />

      {/* Anchor detail */}
      <path d="M43 18 L44 18.5 L43.5 19.5" fill="none" stroke="#020617" strokeWidth=".4" />

      {/* ==================== FORE DECK ==================== */}
      {/* Main Gun (5-inch) */}
      <path d="M37 13 L39 12.5 L40 14 L38 14.5 Z"
        fill={`url(#${u("superTop")})`} stroke="#020617" strokeWidth=".4" />
      <path d="M39 13 L43 13.2 L43 13.8 L39 13.6 Z"
        fill="#475569" stroke="#020617" strokeWidth=".3" />
      <circle cx="38.5" cy="13.5" r="1" fill="currentColor" opacity=".8" stroke="#020617" strokeWidth=".3" />

      {/* Vertical Launch System (VLS) - Fore */}
      {[0, 1, 2].map(row => (
        [0, 1, 2, 3].map(col => (
          <rect key={`vls-${row}-${col}`} 
            x={30 + col * 1.2} y={13.5 + row * 1.2} width="1" height="1" rx=".15"
            fill="#1e293b" stroke="#020617" strokeWidth=".2" />
        ))
      ))}
      <path d="M29.5 13 L34.5 13 L34.5 17.5 L29.5 17.5 Z" fill="none" stroke="#f8fafc" strokeOpacity=".2" strokeWidth=".3" />

      {/* ==================== SUPERSTRUCTURE ==================== */}
      {/* Main Block (Stealth angled) */}
      <path d="M18 13 L22 8 L32 8 L35 13 Z"
        fill={`url(#${u("superTop")})`} stroke="#020617" strokeWidth=".5" />
      <path d="M18 13 L22 8 L22 12.5 L18 16 Z"
        fill={`url(#${u("superSide")})`} stroke="#020617" strokeWidth=".5" />
      <path d="M35 13 L32 8 L32 12 L35 16 Z"
        fill={`url(#${u("superSide")})`} stroke="#020617" strokeWidth=".5" />

      {/* Bridge Windows */}
      <path d="M20 11 L24 9.5 L24 11 L20 12.5 Z"
        fill={`url(#${u("glass")})`} stroke="#020617" strokeWidth=".3" />
      <path d="M25 9.5 L29 9.5 L29 11 L25 11 Z"
        fill={`url(#${u("glass")})`} stroke="#020617" strokeWidth=".3" />
      <path d="M20.5 11.2 L23.5 10" stroke="#f8fafc" strokeOpacity=".6" strokeWidth=".3" />

      {/* AESA Radar Panels (Phased Array) */}
      <path d="M22.5 9.5 L25 8.5 L26 10 L23.5 11 Z"
        fill={`url(#${u("aesa")})`} stroke="#020617" strokeWidth=".3" />
      <path d="M23 9.8 L25 9" stroke="#f8fafc" strokeOpacity=".4" strokeWidth=".2" />

      {/* Mast & Radars */}
      <path d="M26 8 L26 4.5" stroke="#020617" strokeWidth=".6" />
      <path d="M26 4.5 L28 4.5" stroke="#020617" strokeWidth=".4" />
      <rect x="25.5" y="4" width="3" height="1" fill="#475569" stroke="#020617" strokeWidth=".2" />
      <circle cx="27" cy="4.5" r="1.2" fill="currentColor" opacity=".7" stroke="#020617" strokeWidth=".3" />
      {/* Radar Spinning (Glow) */}
      <circle cx="27" cy="4.5" r="1.8" fill="none" stroke="#22d3ee" strokeOpacity=".4" strokeWidth=".4" filter={`url(#${u("glow")})`} />

      {/* ==================== AFT DECK (Helipad) ==================== */}
      {/* Hangar */}
      <path d="M14 13 L18 13 L18 16.5 L14 16.5 Z"
        fill={`url(#${u("superSide")})`} stroke="#020617" strokeWidth=".4" />
      
      {/* CIWS (Close-In Weapon System) */}
      <circle cx="15" cy="12.5" r="1" fill="#475569" stroke="#020617" strokeWidth=".3" />
      <path d="M15 12.5 L15 10.5" stroke="#020617" strokeWidth=".5" />
      <circle cx="15" cy="10.5" r=".4" fill="#94a3b8" />

      {/* Helicopter Landing Pad */}
      <circle cx="9" cy="16.5" r="2.5" fill="none" stroke="#f8fafc" strokeOpacity=".4" strokeWidth=".4" strokeDasharray="1 1" />
      <path d="M8 16.5 L10 16.5 M9 15.5 L9 17.5" stroke="#f8fafc" strokeOpacity=".6" strokeWidth=".4" />

      {/* Antennas */}
      <path d="M18 13 L17 9" stroke="#020617" strokeWidth=".4" />
      <circle cx="17" cy="9" r=".3" fill="#94a3b8" />
      <path d="M33 13 L34 10" stroke="#020617" strokeWidth=".4" />
      <circle cx="34" cy="10" r=".3" fill="#94a3b8" />
    </g>
  );
}