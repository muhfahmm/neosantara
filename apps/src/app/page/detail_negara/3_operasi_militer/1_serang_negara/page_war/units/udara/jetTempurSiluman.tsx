import { useId } from "react";
import type { UnitIconProps } from "../unitIconProps";

export default function JetTempurSiluman({ color }: UnitIconProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const u = (n: string) => `stealth-${uid}-${n}`;
  const baseColor = color ?? "#53674f";

  return (
    <g color={baseColor} strokeLinejoin="round" strokeLinecap="round">
      <defs>
        <filter id={u("soft")} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="1.5" />
        </filter>
        <linearGradient id={u("bodyTop")} x1="0" y1="0" x2="0.8" y2="1">
          <stop offset="0" stopColor="currentColor" stopOpacity="1" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.6" />
        </linearGradient>
        <linearGradient id={u("bodySide")} x1="0" y1="0" x2="0.15" y2="1">
          <stop offset="0" stopColor="currentColor" stopOpacity="0.9" />
          <stop offset="1" stopColor="#020617" stopOpacity="0.9" />
        </linearGradient>
        <linearGradient id={u("goldGlass")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fde68a" stopOpacity="0.9" />
          <stop offset="0.5" stopColor="#d97706" stopOpacity="0.8" />
          <stop offset="1" stopColor="#78350f" stopOpacity="0.9" />
        </linearGradient>
      </defs>

      {/* Ground Shadow */}
      <ellipse cx="24" cy="28" rx="18" ry="5" fill="#020617" opacity=".6" filter={`url(#${u("soft")})`} />

      {/* Engine Exhausts (Stealth Rectangular) */}
      <rect x="19" y="24" width="3" height="2" rx=".2" fill="#1e293b" stroke="#020617" strokeWidth=".3" />
      <rect x="26" y="24" width="3" height="2" rx=".2" fill="#1e293b" stroke="#020617" strokeWidth=".3" />
      <rect x="19.2" y="24.2" width="2.6" height="1.6" rx=".1" fill="#475569" opacity=".5" />
      <rect x="26.2" y="24.2" width="2.6" height="1.6" rx=".1" fill="#475569" opacity=".5" />

      {/* Main Diamond Wings */}
      <path d="M22 12 L4 22 L6 25 L22 19 Z" fill={`url(#${u("bodyTop")})`} stroke="#020617" strokeWidth=".4" />
      <path d="M26 12 L44 22 L42 25 L26 19 Z" fill={`url(#${u("bodyTop")})`} stroke="#020617" strokeWidth=".4" />
      
      <path d="M22 19 L6 25 L8 26 L23 21 Z" fill={`url(#${u("bodySide")})`} stroke="#020617" strokeWidth=".4" />
      <path d="M26 19 L42 25 L40 26 L25 21 Z" fill={`url(#${u("bodySide")})`} stroke="#020617" strokeWidth=".4" />

      {/* Canted Twin Tails (Miring ke luar) */}
      <path d="M20 21 L16 16 L18 15 L21 20 Z" fill={`url(#${u("bodyTop")})`} stroke="#020617" strokeWidth=".4" />
      <path d="M28 21 L32 16 L30 15 L27 20 Z" fill={`url(#${u("bodyTop")})`} stroke="#020617" strokeWidth=".4" />

      {/* Fuselage (Faceted / Bersudut) */}
      <path d="M22 6 L26 6 L27 24 L21 24 Z" fill={`url(#${u("bodyTop")})`} stroke="#020617" strokeWidth=".5" />
      <path d="M22 6 L21 24 L20 24 L21 8 Z" fill={`url(#${u("bodySide")})`} stroke="#020617" strokeWidth=".4" />
      <path d="M26 6 L27 24 L28 24 L27 8 Z" fill={`url(#${u("bodySide")})`} stroke="#020617" strokeWidth=".4" />

      {/* Stealth Nose (Tumpul) */}
      <path d="M22 6 L24 1 L26 6 Z" fill={`url(#${u("bodyTop")})`} stroke="#020617" strokeWidth=".4" />

      {/* Gold-Tinted Cockpit Canopy */}
      <path d="M22.5 5 L25.5 5 L26 9 L22 9 Z" fill={`url(#${u("goldGlass")})`} stroke="#020617" strokeWidth=".3" />
      <path d="M23 6 L24.5 6" stroke="#fef3c7" strokeOpacity=".8" strokeWidth=".4" />

      {/* Stealth Air Intakes (Bersudut) */}
      <path d="M21 10 L19 10 L19 14 L21 13 Z" fill="#020617" stroke="#020617" strokeWidth=".3" />
      <path d="M27 10 L29 10 L29 14 L27 13 Z" fill="#020617" stroke="#020617" strokeWidth=".3" />

      {/* Internal Weapon Bay Seams (Garis panel) */}
      <path d="M22 15 L26 15 M22 18 L26 18" stroke="#020617" strokeOpacity=".4" strokeWidth=".3" />

      {/* Stealth Panel Lines */}
      <path d="M18 16 L22 14 M30 16 L26 14" stroke="#020617" strokeOpacity=".3" strokeWidth=".3" />

      {/* Rim Light */}
      <path d="M22 6 L24 1 L26 6" fill="none" stroke="#f8fafc" strokeOpacity=".6" strokeWidth=".4" />
      <path d="M22 12 L4 22" fill="none" stroke="#f8fafc" strokeOpacity=".5" strokeWidth=".4" />
      <path d="M26 12 L44 22" fill="none" stroke="#f8fafc" strokeOpacity=".5" strokeWidth=".4" />
    </g>
  );
}