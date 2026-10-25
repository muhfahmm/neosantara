import { useId } from "react";
import type { UnitIconProps } from "../unitIconProps";

export default function PesawatPengebom({ color }: UnitIconProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const u = (n: string) => `bomber-${uid}-${n}`;
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
          <stop offset="1" stopColor="#020617" stopOpacity="0.85" />
        </linearGradient>
        <linearGradient id={u("glass")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6ee7f0" />
          <stop offset="1" stopColor="#0e7490" />
        </linearGradient>
        <linearGradient id={u("engine")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#64748b" />
          <stop offset="0.5" stopColor="#334155" />
          <stop offset="1" stopColor="#0f172a" />
        </linearGradient>
        <radialGradient id={u("exhaust")} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#f97316" stopOpacity="0.8" />
          <stop offset="0.6" stopColor="#f97316" stopOpacity="0.2" />
          <stop offset="1" stopColor="#f97316" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Ground Shadow */}
      <ellipse cx="24" cy="30" rx="22" ry="6" fill="#020617" opacity=".7" filter={`url(#${u("soft")})`} />

      {/* Afterburner Exhausts (4 Engine) */}
      {[14, 18, 30, 34].map((x) => (
        <ellipse key={`exh-${x}`} cx={x} cy="24" rx="1.5" ry="2.5" fill={`url(#${u("exhaust")})`} />
      ))}

      {/* Variable-Sweep Wings (Sayap Sapu) */}
      <path d="M20 12 L2 22 L4 25 L21 17 Z" fill={`url(#${u("bodyTop")})`} stroke="#020617" strokeWidth=".4" />
      <path d="M28 12 L46 22 L44 25 L27 17 Z" fill={`url(#${u("bodyTop")})`} stroke="#020617" strokeWidth=".4" />
      
      <path d="M21 17 L4 25 L6 26 L22 19 Z" fill={`url(#${u("bodySide")})`} stroke="#020617" strokeWidth=".4" />
      <path d="M27 17 L44 25 L42 26 L26 19 Z" fill={`url(#${u("bodySide")})`} stroke="#020617" strokeWidth=".4" />

      {/* Engine Nacelles (4 Pod Mesin) */}
      {[12, 16, 32, 36].map((x, i) => (
        <g key={`nacelle-${i}`}>
          {/* Pod Body */}
          <path d={`M${x} 14 L${x + 2.5} 14 L${x + 2.5} 23 L${x} 23 Z`} fill={`url(#${u("engine")})`} stroke="#020617" strokeWidth=".4" />
          {/* Intake */}
          <ellipse cx={x + 1.25} cy="14" rx="1.25" ry=".5" fill="#1e293b" stroke="#020617" strokeWidth=".3" />
          <path d={`M${x + 0.5} 14 L${x + 2} 14`} stroke="#f8fafc" strokeOpacity=".5" strokeWidth=".3" />
          {/* Afterburner Nozzle */}
          <ellipse cx={x + 1.25} cy="23" rx="1.25" ry=".5" fill="#020617" stroke="#020617" strokeWidth=".3" />
        </g>
      ))}

      {/* Main Fuselage */}
      <path d="M22 4 L26 4 L28 25 L20 25 Z" fill={`url(#${u("bodyTop")})`} stroke="#020617" strokeWidth=".5" />
      <path d="M22 4 L20 25 L19 25 L21 6 Z" fill={`url(#${u("bodySide")})`} stroke="#020617" strokeWidth=".4" />
      <path d="M26 4 L28 25 L29 25 L27 6 Z" fill={`url(#${u("bodySide")})`} stroke="#020617" strokeWidth=".4" />

      {/* Blended Nose & Radar Dome */}
      <path d="M22 4 L24 1 L26 4 Z" fill={`url(#${u("bodyTop")})`} stroke="#020617" strokeWidth=".4" />
      <path d="M22 4 L24 1 L24 5 Z" fill={`url(#${u("bodySide")})`} stroke="#020617" strokeWidth=".3" />

      {/* Cockpit Canopy */}
      <path d="M22.5 5 L25.5 5 L26 9 L22 9 Z" fill={`url(#${u("glass")})`} stroke="#020617" strokeWidth=".3" />
      <path d="M23 6 L24.5 6" stroke="#f8fafc" strokeOpacity=".6" strokeWidth=".4" />

      {/* Tail Fin (Vertical Stabilizer) */}
      <path d="M22 25 L20 18 L22 17 L24 25 Z" fill={`url(#${u("bodyTop")})`} stroke="#020617" strokeWidth=".4" />
      <path d="M22 17 L24 25 L25 25 L23 18 Z" fill={`url(#${u("bodySide")})`} stroke="#020617" strokeWidth=".3" />

      {/* Horizontal Stabilizers */}
      <path d="M21 24 L16 27 L18 28 L22 25 Z" fill={`url(#${u("bodyTop")})`} stroke="#020617" strokeWidth=".3" />
      <path d="M27 24 L32 27 L30 28 L26 25 Z" fill={`url(#${u("bodyTop")})`} stroke="#020617" strokeWidth=".3" />

      {/* Internal Bomb Bay Seams (Rotary Launcher) */}
      <path d="M21 18 L27 18 M21 20 L27 20" stroke="#020617" strokeOpacity=".5" strokeWidth=".4" />
      
      {/* Tactical Panel Lines */}
      <path d="M20 12 L28 12 M19 22 L29 22" stroke="#020617" strokeOpacity=".3" strokeWidth=".3" />

      {/* Rim Light */}
      <path d="M22 4 L24 1 L26 4" fill="none" stroke="#f8fafc" strokeOpacity=".6" strokeWidth=".4" />
      <path d="M20 12 L2 22" fill="none" stroke="#f8fafc" strokeOpacity=".5" strokeWidth=".4" />
      <path d="M28 12 L46 22" fill="none" stroke="#f8fafc" strokeOpacity=".5" strokeWidth=".4" />
    </g>
  );
}