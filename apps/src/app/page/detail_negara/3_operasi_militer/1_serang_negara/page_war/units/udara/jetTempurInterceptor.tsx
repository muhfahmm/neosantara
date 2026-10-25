import { useId } from "react";
import type { UnitIconProps } from "../unitIconProps";

export default function JetTempurInterceptor({ color }: UnitIconProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const u = (n: string) => `int-${uid}-${n}`;
  const baseColor = color ?? "#53674f";

  return (
    <g color={baseColor} strokeLinejoin="round" strokeLinecap="round">
      <defs>
        <filter id={u("soft")} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="1.5" />
        </filter>
        <linearGradient id={u("bodyTop")} x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0" stopColor="currentColor" stopOpacity="1" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.65" />
        </linearGradient>
        <linearGradient id={u("bodySide")} x1="0" y1="0" x2="0.15" y2="1">
          <stop offset="0" stopColor="currentColor" stopOpacity="0.9" />
          <stop offset="1" stopColor="#020617" stopOpacity="0.8" />
        </linearGradient>
        <linearGradient id={u("glass")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6ee7f0" />
          <stop offset="1" stopColor="#0e7490" />
        </linearGradient>
        <radialGradient id={u("afterburner")} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#f8fafc" />
          <stop offset="0.3" stopColor="#60a5fa" />
          <stop offset="1" stopColor="#f97316" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Ground Shadow */}
      <ellipse cx="24" cy="30" rx="18" ry="5" fill="#020617" opacity=".6" filter={`url(#${u("soft")})`} />

      {/* Twin Exhaust Afterburners */}
      <circle cx="20" cy="25" r="2" fill={`url(#${u("afterburner")})`} />
      <circle cx="28" cy="25" r="2" fill={`url(#${u("afterburner")})`} />
      <ellipse cx="20" cy="24" rx="1.2" ry=".8" fill="#1e293b" stroke="#020617" strokeWidth=".3" />
      <ellipse cx="28" cy="24" rx="1.2" ry=".8" fill="#1e293b" stroke="#020617" strokeWidth=".3" />

      {/* Main Wings (Swept) */}
      <path d="M20 14 L4 22 L4 24 L21 18 Z" fill={`url(#${u("bodyTop")})`} stroke="#020617" strokeWidth=".4" />
      <path d="M28 14 L44 22 L44 24 L27 18 Z" fill={`url(#${u("bodyTop")})`} stroke="#020617" strokeWidth=".4" />
      
      <path d="M21 18 L4 24 L6 25 L22 20 Z" fill={`url(#${u("bodySide")})`} stroke="#020617" strokeWidth=".4" />
      <path d="M27 18 L44 24 L42 25 L26 20 Z" fill={`url(#${u("bodySide")})`} stroke="#020617" strokeWidth=".4" />

      {/* Horizontal Stabilizers (Ekor) */}
      <path d="M21 23 L16 27 L18 28 L22 24 Z" fill={`url(#${u("bodyTop")})`} stroke="#020617" strokeWidth=".4" />
      <path d="M27 23 L32 27 L30 28 L26 24 Z" fill={`url(#${u("bodyTop")})`} stroke="#020617" strokeWidth=".4" />

      {/* Twin Vertical Tails */}
      <path d="M20 22 L18 18 L19 18 L21 22 Z" fill={`url(#${u("bodySide")})`} stroke="#020617" strokeWidth=".4" />
      <path d="M28 22 L30 18 L29 18 L27 22 Z" fill={`url(#${u("bodySide")})`} stroke="#020617" strokeWidth=".4" />

      {/* Fuselage */}
      <path d="M22 6 L26 6 L28 24 L20 24 Z" fill={`url(#${u("bodyTop")})`} stroke="#020617" strokeWidth=".5" />
      <path d="M22 6 L20 24 L19 24 L21 8 Z" fill={`url(#${u("bodySide")})`} stroke="#020617" strokeWidth=".4" />
      <path d="M26 6 L28 24 L29 24 L27 8 Z" fill={`url(#${u("bodySide")})`} stroke="#020617" strokeWidth=".4" />

      {/* Nose & Radar Dome */}
      <path d="M22 6 L24 1 L26 6 Z" fill={`url(#${u("bodyTop")})`} stroke="#020617" strokeWidth=".4" />
      <path d="M22 6 L24 1 L24 6 Z" fill={`url(#${u("bodySide")})`} stroke="#020617" strokeWidth=".3" />

      {/* Cockpit Canopy */}
      <path d="M23 5 L25 5 L26 10 L22 10 Z" fill={`url(#${u("glass")})`} stroke="#020617" strokeWidth=".3" />
      <path d="M23.5 6 L24.5 6" stroke="#f8fafc" strokeOpacity=".6" strokeWidth=".4" />

      {/* Air Intakes (Samping kokpit) */}
      <path d="M21 11 L19 11 L19 16 L21 15 Z" fill="#020617" stroke="#020617" strokeWidth=".3" />
      <path d="M27 11 L29 11 L29 16 L27 15 Z" fill="#020617" stroke="#020617" strokeWidth=".3" />

      {/* Underwing Missiles (AAM) */}
      {[8, 40].map((x, i) => (
        <g key={`missile-${i}`}>
          <path d={`M${x} 22 L${x + 2} 22 L${x + 2} 25 L${x} 25 Z`} fill="#475569" stroke="#020617" strokeWidth=".2" />
          <path d={`M${x} 22 L${x + 1} 20 L${x + 2} 22 Z`} fill="#94a3b8" />
        </g>
      ))}
      
      {/* Centerline Drop Tank / Missile */}
      <rect x="23" y="20" width="2" height="5" rx=".5" fill="#475569" stroke="#020617" strokeWidth=".2" />

      {/* Rim Light */}
      <path d="M22 6 L24 1 L26 6" fill="none" stroke="#f8fafc" strokeOpacity=".5" strokeWidth=".4" />
      <path d="M20 14 L4 22" fill="none" stroke="#f8fafc" strokeOpacity=".4" strokeWidth=".3" />
      <path d="M28 14 L44 22" fill="none" stroke="#f8fafc" strokeOpacity=".4" strokeWidth=".3" />
    </g>
  );
}