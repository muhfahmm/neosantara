import { useId } from "react";
import type { UnitIconProps } from "../unitIconProps";

export default function KapalSelamNuklir({ color }: UnitIconProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const u = (n: string) => `ssn-${uid}-${n}`;
  const baseColor = color ?? "#53674f";

  return (
    <g color={baseColor} strokeLinejoin="round" strokeLinecap="round">
      <defs>
        <filter id={u("soft")} x="-40%" y="-140%" width="180%" height="380%">
          <feGaussianBlur stdDeviation="1.5" />
        </filter>
        <filter id={u("glow")} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="0.8" />
        </filter>
        <linearGradient id={u("hullTop")} x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0" stopColor="#334155" />
          <stop offset="1" stopColor="#0f172a" />
        </linearGradient>
        <linearGradient id={u("hullBot")} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor="#1e293b" />
          <stop offset="1" stopColor="#020617" />
        </linearGradient>
        <linearGradient id={u("sail")} x1="0" y1="0" x2="0.8" y2="1">
          <stop offset="0" stopColor="currentColor" stopOpacity="0.9" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.4" />
        </linearGradient>
        <radialGradient id={u("underwater")} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#0e7490" stopOpacity="0.2" />
          <stop offset="1" stopColor="#020617" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Underwater glow & shadow */}
      <ellipse cx="24" cy="22" rx="24" ry="10" fill={`url(#${u("underwater")})`} />
      <ellipse cx="24" cy="26" rx="20" ry="4" fill="#020617" opacity=".8" filter={`url(#${u("soft")})`} />

      {/* Submarine Hull (Teardrop shape) */}
      <path d="M2 19 C 10 10, 40 10, 46 18 C 40 26, 10 26, 2 19 Z"
        fill={`url(#${u("hullTop")})`} stroke="#020617" strokeWidth=".6" />
      {/* Hull Bottom / Shadow side */}
      <path d="M2 19 C 10 26, 40 26, 46 18 C 40 23, 10 23, 2 19 Z"
        fill={`url(#${u("hullBot")})`} stroke="#020617" strokeWidth=".4" />

      {/* Waterline highlight */}
      <path d="M4 19 C 12 13, 38 13, 44 18" fill="none" stroke="#94a3b8" strokeOpacity=".4" strokeWidth=".5" />

      {/* Sonar Dome (Haluan) */}
      <path d="M2 19 C 4 17, 6 16, 8 16 C 6 18, 6 20, 8 22 C 6 22, 4 21, 2 19 Z" fill="#0f172a" stroke="#020617" strokeWidth=".4" />

      {/* Sail / Conning Tower */}
      <path d="M18 14 L22 8 L28 8 L32 14 Z" fill={`url(#${u("sail")})`} stroke="#020617" strokeWidth=".5" />
      <path d="M18 14 L22 8 L22 12 L18 18 Z" fill="#1e293b" stroke="#020617" strokeWidth=".4" />

      {/* Dive Planes (Sirip) */}
      <path d="M23 13 L20 13 L22 14 Z" fill="#020617" />
      <path d="M27 13 L30 13 L28 14 Z" fill="#020617" />

      {/* Periscope & Masts */}
      <path d="M23 8 L23 4 M25 8 L25 5 M27 8 L27 6" stroke="#020617" strokeWidth=".5" />
      <rect x="22.5" y="3.5" width="1" height="1" fill="#475569" stroke="#020617" strokeWidth=".2" />
      <circle cx="25" cy="4.5" r=".4" fill="#94a3b8" />

      {/* Limber Holes (Vents) */}
      {[12, 16, 20, 24, 28, 32, 36].map((x) => (
        <path key={`vent-${x}`} d={`M${x} 20 L${x + 1} 20`} stroke="#020617" strokeWidth=".6" />
      ))}

      {/* Pump-Jet Propulsor (Ujung Belakang) */}
      <g transform="translate(46 18)">
        <path d="M0 0 L2 -2 L2 2 Z" fill="#334155" stroke="#020617" strokeWidth=".4" />
        <circle cx="2.5" cy="0" r="1.5" fill="none" stroke="#94a3b8" strokeWidth=".4" />
        <circle cx="2.5" cy="0" r=".6" fill="#020617" />
      </g>

      {/* Nuclear Marking on Sail */}
      <circle cx="27" cy="10" r="1.2" fill="#fde68a" opacity=".8" stroke="#020617" strokeWidth=".2" filter={`url(#${u("glow")})`} />
      <path d="M27 9 L27 11 M26.5 9.5 L27.5 9.5 M26.5 10.5 L27.5 10.5" stroke="#020617" strokeWidth=".2" />

      {/* Bubbles / Wake */}
      <path d="M48 18 Q50 16 52 18" fill="none" stroke="#94a3b8" strokeOpacity=".4" strokeWidth=".4" />
      <path d="M49 20 Q51 19 53 21" fill="none" stroke="#94a3b8" strokeOpacity=".3" strokeWidth=".3" />
    </g>
  );
}