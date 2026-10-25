import { useId } from "react";
import type { UnitIconProps } from "../unitIconProps";

export default function KapalLogistik({ color }: UnitIconProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const u = (n: string) => `log-${uid}-${n}`;
  const baseColor = color ?? "#53674f";

  return (
    <g color={baseColor} strokeLinejoin="round" strokeLinecap="round">
      <defs>
        <filter id={u("soft")} x="-40%" y="-140%" width="180%" height="380%">
          <feGaussianBlur stdDeviation="1.3" />
        </filter>
        <linearGradient id={u("hullSide")} x1="0" y1="0" x2="0.12" y2="1">
          <stop offset="0" stopColor="currentColor" stopOpacity="0.9" />
          <stop offset="0.6" stopColor="currentColor" stopOpacity="0.5" />
          <stop offset="1" stopColor="#020617" stopOpacity="0.95" />
        </linearGradient>
        <linearGradient id={u("deck")} x1="0" y1="0" x2="0.8" y2="1">
          <stop offset="0" stopColor="currentColor" stopOpacity="1" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.7" />
        </linearGradient>
        <linearGradient id={u("containerTop")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#94a3b8" />
          <stop offset="1" stopColor="#475569" />
        </linearGradient>
        <linearGradient id={u("containerSide")} x1="0" y1="0" x2="0.2" y2="1">
          <stop offset="0" stopColor="#334155" />
          <stop offset="1" stopColor="#0f172a" />
        </linearGradient>
        <linearGradient id={u("containerFront")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#64748b" />
          <stop offset="1" stopColor="#1e293b" />
        </linearGradient>
        <linearGradient id={u("glass")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6ee7f0" />
          <stop offset="1" stopColor="#0e7490" />
        </linearGradient>
      </defs>

      {/* Water Wake */}
      <ellipse cx="24" cy="27" rx="23" ry="4.5" fill="#020617" opacity=".6" filter={`url(#${u("soft")})`} />
      <path d="M1 26 Q12 29 24 28 Q36 29 49 26" fill="none" stroke="#94a3b8" strokeOpacity=".3" strokeWidth=".5" />

      {/* Main Hull */}
      <path d="M4 19 L8 13 L44 15 L47 19 L44 25 L8 25 Z"
        fill={`url(#${u("hullSide")})`} stroke="#020617" strokeWidth=".6" />
      <path d="M6 24 L8 25 L44 25 L45 23 Z" fill="#020617" opacity=".8" />

      {/* Cargo Deck (Main Deck) */}
      <path d="M8 13 L44 15 L47 19 L11 19 Z"
        fill={`url(#${u("deck")})`} stroke="#020617" strokeWidth=".5" />

      {/* Superstructure (Aft/Belakang) */}
      <path d="M10 13 L14 8 L22 9 L26 13 Z" fill={`url(#${u("deck")})`} stroke="#020617" strokeWidth=".5" />
      <path d="M10 13 L14 8 L14 12 L10 16 Z" fill={`url(#${u("hullSide")})`} stroke="#020617" strokeWidth=".5" />
      <path d="M22 9 L26 13 L26 16 L22 12 Z" fill={`url(#${u("hullSide")})`} stroke="#020617" strokeWidth=".5" />
      
      {/* Bridge Windows */}
      <path d="M15 10 L20 10.5 L19 12 L14 11.5 Z" fill={`url(#${u("glass")})`} stroke="#020617" strokeWidth=".3" />
      <path d="M15.5 10.2 L18.5 10.6" stroke="#f8fafc" strokeOpacity=".6" strokeWidth=".3" />

      {/* Radar Mast */}
      <path d="M18 8 L18 4" stroke="#020617" strokeWidth=".6" />
      <rect x="17" y="3.5" width="2" height="1" fill="#475569" stroke="#020617" strokeWidth=".2" />
      <circle cx="18" cy="4" r=".8" fill="currentColor" opacity=".8" stroke="#020617" strokeWidth=".3" />

      {/* Cargo Containers (3D Isometric Boxes) */}
      {[0, 1, 2].map((i) => (
        <g key={`cont-${i}`} transform={`translate(${28 + i * 5} 15)`}>
          {/* Top Face */}
          <path d="M0 0 L3 0.5 L5 -1 L2 -1.5 Z" fill={`url(#${u("containerTop")})`} stroke="#020617" strokeWidth=".3" />
          {/* Side Face */}
          <path d="M0 0 L2 -1.5 L2 1.5 L0 3 Z" fill={`url(#${u("containerSide")})`} stroke="#020617" strokeWidth=".3" />
          {/* Front Face */}
          <path d="M0 0 L3 0.5 L3 3.5 L0 3 Z" fill={`url(#${u("containerFront")})`} stroke="#020617" strokeWidth=".3" />
          {/* Ribs */}
          <path d="M0.5 0.5 L0.5 3.2 M1.5 0.8 L1.5 3.3 M2.5 1 L2.5 3.4" stroke="#020617" strokeOpacity=".5" strokeWidth=".2" />
        </g>
      ))}

      {/* Cargo Cranes */}
      <g transform="translate(24 13)">
        <path d="M0 0 L1 -2 L2 -2 L2 0 Z" fill="#64748b" stroke="#020617" strokeWidth=".3" />
        <path d="M1 -2 L5 -4" stroke="#020617" strokeWidth=".4" />
        <path d="M5 -4 L5 -2" stroke="#020617" strokeWidth=".3" strokeDasharray=".5 .5" />
        <circle cx="1.5" cy="-2" r=".5" fill="currentColor" stroke="#020617" strokeWidth=".2" />
      </g>

      {/* Rim Light */}
      <path d="M8 13 L44 15 L47 19" fill="none" stroke="#f8fafc" strokeOpacity=".4" strokeWidth=".5" />
      <path d="M10 13 L14 8 L22 9" fill="none" stroke="#f8fafc" strokeOpacity=".5" strokeWidth=".4" />
    </g>
  );
}