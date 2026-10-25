import { useId } from "react";
import type { UnitIconProps } from "../unitIconProps";

export default function KapalSelamReguler({ color }: UnitIconProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const u = (n: string) => `ssk-${uid}-${n}`;
  const baseColor = color ?? "#53674f";

  return (
    <g color={baseColor} strokeLinejoin="round" strokeLinecap="round">
      <defs>
        <filter id={u("soft")} x="-40%" y="-140%" width="180%" height="380%">
          <feGaussianBlur stdDeviation="1.5" />
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
      </defs>

      {/* Water Wake & Shadow */}
      <ellipse cx="24" cy="26" rx="20" ry="4" fill="#020617" opacity=".7" filter={`url(#${u("soft")})`} />
      <path d="M2 26 Q12 29 24 28 Q36 29 48 26" fill="none" stroke="#94a3b8" strokeOpacity=".3" strokeWidth=".5" />

      {/* Hull */}
      <path d="M4 19 C 10 11, 38 12, 44 18 C 38 25, 10 26, 4 19 Z"
        fill={`url(#${u("hullTop")})`} stroke="#020617" strokeWidth=".6" />
      <path d="M4 19 C 10 26, 38 25, 44 18 C 38 22, 10 23, 4 19 Z"
        fill={`url(#${u("hullBot")})`} stroke="#020617" strokeWidth=".4" />

      {/* Anechoic Tile Texture (Grid Lines) */}
      <path d="M8 17 C 15 13, 35 14, 41 17" fill="none" stroke="#475569" strokeOpacity=".3" strokeWidth=".3" strokeDasharray="1 1" />
      <path d="M10 20 C 15 23, 35 23, 40 20" fill="none" stroke="#1e293b" strokeOpacity=".5" strokeWidth=".3" strokeDasharray="1 1" />

      {/* Sail */}
      <path d="M20 14 L24 8 L28 8 L31 14 Z" fill={`url(#${u("sail")})`} stroke="#020617" strokeWidth=".5" />
      <path d="M20 14 L24 8 L24 12 L20 17 Z" fill="#1e293b" stroke="#020617" strokeWidth=".4" />
      
      {/* Periscopes & Snorkel */}
      <path d="M24 8 L24 4 M26 8 L26 5 M28 8 L28 6" stroke="#020617" strokeWidth=".5" />
      <rect x="23.5" y="3.5" width="1" height="1" fill="#475569" stroke="#020617" strokeWidth=".2" />

      {/* Bow Sonar Array */}
      <path d="M4 19 C 5 18, 7 17.5, 8 17.5 C 6 19, 6 19, 8 20.5 C 7 20.5, 5 20, 4 19 Z" fill="#020617" />

      {/* Traditional Propeller (Baling-baling) */}
      <g transform="translate(44 18)">
        <circle cx="0" cy="0" r="1" fill="#475569" stroke="#020617" strokeWidth=".3" />
        {/* Propeller Blades */}
        <path d="M0 0 L2 -3 L0.5 -1 Z" fill="#94a3b8" stroke="#020617" strokeWidth=".2" />
        <path d="M0 0 L-2 2 L-0.5 1 Z" fill="#94a3b8" stroke="#020617" strokeWidth=".2" />
        <path d="M0 0 L2 2 L0.5 1 Z" fill="#94a3b8" stroke="#020617" strokeWidth=".2" />
        <path d="M0 0 L-2 -2 L-0.5 -1 Z" fill="#94a3b8" stroke="#020617" strokeWidth=".2" />
        <circle cx="0" cy="0" r=".4" fill="#020617" />
      </g>

      {/* Rudder / Stern Planes */}
      <path d="M42 18 L45 15" stroke="#020617" strokeWidth=".6" />
      <path d="M42 18 L45 21" stroke="#020617" strokeWidth=".6" />
      <path d="M42 18 L45 18" stroke="#020617" strokeWidth=".4" />

      {/* Towed Array Sonar (Kabel di buritan) */}
      <path d="M45 18 Q48 18 50 16" fill="none" stroke="#94a3b8" strokeOpacity=".6" strokeWidth=".3" strokeDasharray="1 1" />

      {/* Rim Light */}
      <path d="M4 19 C 10 11, 38 12, 44 18" fill="none" stroke="#f8fafc" strokeOpacity=".3" strokeWidth=".4" />
      <path d="M20 14 L24 8 L28 8" fill="none" stroke="#f8fafc" strokeOpacity=".5" strokeWidth=".4" />
    </g>
  );
}