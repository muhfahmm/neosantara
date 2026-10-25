import { useId } from "react";
import type { UnitIconProps } from "../unitIconProps";

export default function HelikopterSerang({ color }: UnitIconProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const u = (n: string) => `heli-${uid}-${n}`;
  const baseColor = color ?? "#53674f";

  return (
    <g color={baseColor} strokeLinejoin="round" strokeLinecap="round">
      <defs>
        <filter id={u("soft")} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="1.2" />
        </filter>
        <filter id={u("rotorBlur")} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="0.8" />
        </filter>
        <linearGradient id={u("bodyTop")} x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0" stopColor="currentColor" stopOpacity="1" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.6" />
        </linearGradient>
        <linearGradient id={u("bodySide")} x1="0" y1="0" x2="0.15" y2="1">
          <stop offset="0" stopColor="currentColor" stopOpacity="0.9" />
          <stop offset="1" stopColor="#020617" stopOpacity="0.85" />
        </linearGradient>
        <linearGradient id={u("glass")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6ee7f0" />
          <stop offset="1" stopColor="#0e7490" />
        </linearGradient>
      </defs>

      {/* Ground Shadow */}
      <ellipse cx="24" cy="28" rx="14" ry="5" fill="#020617" opacity=".7" filter={`url(#${u("soft")})`} />

      {/* Tail Boom & Fenestron / Tail Rotor */}
      <path d="M10 17 L24 18 L24 20 L10 19 Z" fill={`url(#${u("bodySide")})`} stroke="#020617" strokeWidth=".4" />
      <path d="M10 17 L8 12 L9 12 L12 18 Z" fill={`url(#${u("bodyTop")})`} stroke="#020617" strokeWidth=".4" />
      <circle cx="9.5" cy="14.5" r="2" fill="none" stroke="#020617" strokeWidth=".6" />
      <path d="M9.5 14.5 L11.5 14.5 M9.5 14.5 L7.5 14.5 M9.5 14.5 L9.5 16.5 M9.5 14.5 L9.5 12.5" stroke="#94a3b8" strokeWidth=".4" filter={`url(#${u("rotorBlur")})`} />

      {/* Stub Wings (Sayap Pendek) */}
      <path d="M22 18 L16 18 L14 19 L22 20 Z" fill={`url(#${u("bodyTop")})`} stroke="#020617" strokeWidth=".3" />
      <path d="M22 18 L28 18 L30 19 L22 20 Z" fill={`url(#${u("bodyTop")})`} stroke="#020617" strokeWidth=".3" />

      {/* Weapon Pods & Missiles */}
      {[15, 29].map((x, i) => (
        <g key={`weapon-${i}`}>
          <rect x={x - 1} y="18.5" width="2" height="1.5" rx=".3" fill="#1e293b" stroke="#020617" strokeWidth=".2" />
          <rect x={x - 0.8} y="20" width="1.6" height="2.5" rx=".2" fill="#475569" stroke="#020617" strokeWidth=".2" />
          <circle cx={x} cy="22.5" r=".3" fill="#020617" />
        </g>
      ))}

      {/* Main Fuselage (Tandem Cockpit) */}
      <path d="M22 18 L18 14 L26 12 L32 16 L30 20 L22 20 Z" fill={`url(#${u("bodyTop")})`} stroke="#020617" strokeWidth=".5" />
      <path d="M18 14 L22 18 L22 20 L18 16 Z" fill={`url(#${u("bodySide")})`} stroke="#020617" strokeWidth=".4" />
      
      {/* Tandem Canopy (Kaca Kokpit Belakang & Depan) */}
      <path d="M19 14 L22 13 L24 15 L21 16 Z" fill={`url(#${u("glass")})`} stroke="#020617" strokeWidth=".3" />
      <path d="M23 13 L26 12 L28 14 L25 15 Z" fill={`url(#${u("glass")})`} stroke="#020617" strokeWidth=".3" />
      <path d="M20 14.5 L22 14" stroke="#f8fafc" strokeOpacity=".6" strokeWidth=".3" />
      <path d="M24 13.5 L26 13" stroke="#f8fafc" strokeOpacity=".6" strokeWidth=".3" />

      {/* 30mm Chain Gun (Meriam di bawah hidung) */}
      <path d="M30 16 L31 20" stroke="#020617" strokeWidth=".8" />
      <circle cx="31" cy="20" r=".8" fill="#475569" stroke="#020617" strokeWidth=".2" />

      {/* Engine Exhausts */}
      <path d="M18 12 L16 10 L18 9 L20 11 Z" fill="#1e293b" stroke="#020617" strokeWidth=".3" />
      <path d="M26 12 L24 10 L26 9 L28 11 Z" fill="#1e293b" stroke="#020617" strokeWidth=".3" />
      <circle cx="17" cy="10.5" r=".4" fill="#f97316" opacity=".7" />
      <circle cx="25" cy="10.5" r=".4" fill="#f97316" opacity=".7" />

      {/* Main Rotor Mast */}
      <circle cx="24" cy="14" r="1.5" fill="#334155" stroke="#020617" strokeWidth=".3" />
      <circle cx="24" cy="14" r=".6" fill="#94a3b8" />

      {/* Main Rotor Blades (Spinning Effect) */}
      <g filter={`url(#${u("rotorBlur")})`}>
        <ellipse cx="24" cy="14" rx="22" ry="3" fill="none" stroke="#94a3b8" strokeWidth="1.5" opacity=".5" />
        <path d="M24 14 L46 14 M24 14 L2 14 M24 14 L40 7 M24 14 L8 21" stroke="#cbd5e1" strokeWidth=".8" opacity=".6" />
        <path d="M24 14 L46 14 M24 14 L2 14" stroke="#f8fafc" strokeWidth=".3" opacity=".8" />
      </g>

      {/* Rim Light */}
      <path d="M18 14 L26 12 L32 16" fill="none" stroke="#f8fafc" strokeOpacity=".4" strokeWidth=".4" />
    </g>
  );
}