import { useId } from "react";
import type { UnitIconProps } from "../unitIconProps";

export default function Korvet({ color }: UnitIconProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const u = (n: string) => `corv-${uid}-${n}`;
  const baseColor = color ?? "#53674f";

  return (
    <g color={baseColor} strokeLinejoin="round" strokeLinecap="round">
      <defs>
        <filter id={u("soft")} x="-40%" y="-140%" width="180%" height="380%">
          <feGaussianBlur stdDeviation="1.2" />
        </filter>
        <linearGradient id={u("deck")} x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0" stopColor="currentColor" stopOpacity="1" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.65" />
        </linearGradient>
        <linearGradient id={u("hullSide")} x1="0" y1="0" x2="0.12" y2="1">
          <stop offset="0" stopColor="currentColor" stopOpacity="0.85" />
          <stop offset="1" stopColor="#020617" stopOpacity="0.9" />
        </linearGradient>
        <linearGradient id={u("super")} x1="0" y1="0" x2="0.7" y2="1">
          <stop offset="0" stopColor="currentColor" stopOpacity="1" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.7" />
        </linearGradient>
        <linearGradient id={u("glass")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6ee7f0" />
          <stop offset="1" stopColor="#0e7490" />
        </linearGradient>
      </defs>

      {/* Water Wake */}
      <ellipse cx="24" cy="26" rx="21" ry="3.5" fill="#020617" opacity=".6" filter={`url(#${u("soft")})`} />
      <path d="M2 25 Q12 28 24 27 Q36 28 46 25" fill="none" stroke="#94a3b8" strokeOpacity=".3" strokeWidth=".5" />

      {/* Hull (Stealth Angled) */}
      <path d="M6 19 L10 14 L42 15 L46 19 L43 24 L10 24 Z" fill={`url(#${u("hullSide")})`} stroke="#020617" strokeWidth=".6" />
      <path d="M7 23 L10 24 L43 24 L44 22 Z" fill="#020617" opacity=".8" />

      {/* Deck */}
      <path d="M10 14 L42 15 L46 19 L12 19 Z" fill={`url(#${u("deck")})`} stroke="#020617" strokeWidth=".5" />

      {/* Main Gun (76mm Super Rapid) */}
      <g transform="translate(39 14.5)">
        <path d="M-1.5 0 L1 -0.5 L1.5 1 L-1.5 1.5 Z" fill="#475569" stroke="#020617" strokeWidth=".3" />
        <path d="M1 -0.5 L5 -1 L5 -0.5 L1 0 Z" fill="#020617" strokeWidth=".3" />
        <circle cx="0" cy="0.5" r=".8" fill={`url(#${u("deck")})`} stroke="#020617" strokeWidth=".2" />
      </g>

      {/* VLS (Vertical Launch System) */}
      {[0, 1].map(row => (
        [0, 1, 2, 3].map(col => (
          <rect key={`vls-${row}-${col}`} x={33 + col * 1.2} y={14.5 + row * 1.2} width="1" height="1" rx=".15"
            fill="#1e293b" stroke="#020617" strokeWidth=".2" />
        ))
      ))}

      {/* Superstructure (Stealth Enclosed Mast) */}
      <path d="M20 14 L24 9 L30 9.5 L33 14 Z" fill={`url(#${u("super")})`} stroke="#020617" strokeWidth=".5" />
      <path d="M20 14 L24 9 L24 12.5 L20 17 Z" fill={`url(#${u("hullSide")})`} stroke="#020617" strokeWidth=".5" />
      <path d="M30 9.5 L33 14 L33 17 L30 13 Z" fill={`url(#${u("hullSide")})`} stroke="#020617" strokeWidth=".5" />

      {/* Bridge Windows */}
      <path d="M22 12 L26 11 L28 11.5 L25 13 Z" fill={`url(#${u("glass")})`} stroke="#020617" strokeWidth=".3" />
      <path d="M22.5 11.5 L25 11" stroke="#f8fafc" strokeOpacity=".6" strokeWidth=".3" />

      {/* Enclosed Radar Mast */}
      <path d="M25 9 L27 6 L29 6.5 L28 9 Z" fill={`url(#${u("super")})`} stroke="#020617" strokeWidth=".4" />
      <circle cx="27.5" cy="6.5" r=".5" fill="#94a3b8" stroke="#020617" strokeWidth=".2" />

      {/* Anti-Ship Missile Launchers (Kotak di belakang) */}
      <g transform="translate(14 14.5)">
        {/* Launcher 1 */}
        <path d="M0 0 L3 0.5 L3 2 L0 1.5 Z" fill="#475569" stroke="#020617" strokeWidth=".3" />
        <path d="M0 0 L1 -0.5 L3 0" fill="#64748b" stroke="#020617" strokeWidth=".2" />
        <circle cx="2.5" cy="1.2" r=".3" fill="#020617" />
        {/* Launcher 2 */}
        <path d="M0 1.5 L3 2 L3 3.5 L0 3 Z" fill="#475569" stroke="#020617" strokeWidth=".3" />
        <circle cx="2.5" cy="2.7" r=".3" fill="#020617" />
      </g>

      {/* CIWS (Close-In Weapon System) di atas hanggar */}
      <circle cx="13" cy="13" r=".8" fill="#475569" stroke="#020617" strokeWidth=".2" />
      <path d="M13 13 L13 11.5" stroke="#020617" strokeWidth=".4" />

      {/* Helipad (Buritan) */}
      <circle cx="10" cy="16.5" r="2" fill="none" stroke="#f8fafc" strokeOpacity=".4" strokeWidth=".4" />
      <path d="M9 16.5 L11 16.5 M10 15.5 L10 17.5" stroke="#f8fafc" strokeOpacity=".6" strokeWidth=".4" />

      {/* Rim Light */}
      <path d="M10 14 L42 15 L46 19" fill="none" stroke="#f8fafc" strokeOpacity=".4" strokeWidth=".5" />
      <path d="M20 14 L24 9 L30 9.5" fill="none" stroke="#f8fafc" strokeOpacity=".5" strokeWidth=".4" />
    </g>
  );
}