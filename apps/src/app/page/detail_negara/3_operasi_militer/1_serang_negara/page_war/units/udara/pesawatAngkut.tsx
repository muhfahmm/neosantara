import { useId } from "react";
import type { UnitIconProps } from "../unitIconProps";

export default function PesawatAngkut({ color }: UnitIconProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const u = (n: string) => `trans-${uid}-${n}`;
  const baseColor = color ?? "#53674f";

  return (
    <g color={baseColor} strokeLinejoin="round" strokeLinecap="round">
      <defs>
        <filter id={u("soft")} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="1.5" />
        </filter>
        <linearGradient id={u("bodyTop")} x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0" stopColor="currentColor" stopOpacity="1" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.7" />
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
      <ellipse cx="24" cy="28" rx="20" ry="5" fill="#020617" opacity=".6" filter={`url(#${u("soft")})`} />

      {/* Main Wings (High Aspect Ratio) */}
      <path d="M20 12 L4 16 L4 18 L21 17 Z" fill={`url(#${u("bodyTop")})`} stroke="#020617" strokeWidth=".4" />
      <path d="M28 12 L44 16 L44 18 L27 17 Z" fill={`url(#${u("bodyTop")})`} stroke="#020617" strokeWidth=".4" />
      
      <path d="M21 17 L4 18 L5 19 L22 19 Z" fill={`url(#${u("bodySide")})`} stroke="#020617" strokeWidth=".4" />
      <path d="M27 17 L44 18 L43 19 L26 19 Z" fill={`url(#${u("bodySide")})`} stroke="#020617" strokeWidth=".4" />

      {/* T-Tail (Horizontal Stabilizer di atas) */}
      <path d="M21 25 L14 25 L14 26 L22 26 Z" fill={`url(#${u("bodyTop")})`} stroke="#020617" strokeWidth=".3" />
      <path d="M27 25 L34 25 L34 26 L26 26 Z" fill={`url(#${u("bodyTop")})`} stroke="#020617" strokeWidth=".3" />

      {/* Vertical Tail (Fin Besar) */}
      <path d="M22 25 L22 18 L23 18 L24 25 Z" fill={`url(#${u("bodySide")})`} stroke="#020617" strokeWidth=".4" />
      <path d="M23 18 L24 18" stroke="#f8fafc" strokeOpacity=".4" strokeWidth=".3" />

      {/* Fuselage (Tebal dan Besar) */}
      <path d="M21 5 L27 5 L29 25 L19 25 Z" fill={`url(#${u("bodyTop")})`} stroke="#020617" strokeWidth=".5" />
      <path d="M21 5 L19 25 L18 25 L20 7 Z" fill={`url(#${u("bodySide")})`} stroke="#020617" strokeWidth=".4" />
      <path d="M27 5 L29 25 L30 25 L28 7 Z" fill={`url(#${u("bodySide")})`} stroke="#020617" strokeWidth=".4" />

      {/* Nose & Cockpit (Tumpul / Bulat) */}
      <path d="M21 5 Q24 0 27 5 Z" fill={`url(#${u("bodyTop")})`} stroke="#020617" strokeWidth=".4" />
      <path d="M21 5 Q24 0 24 5 Z" fill={`url(#${u("bodySide")})`} stroke="#020617" strokeWidth=".3" />
      <path d="M22 3.5 L26 3.5 L26 7 L22 7 Z" fill={`url(#${u("glass")})`} stroke="#020617" strokeWidth=".3" />
      <path d="M22.5 4 L25.5 4" stroke="#f8fafc" strokeOpacity=".6" strokeWidth=".3" />

      {/* Engines (4 x Turbofan) */}
      {[8, 12, 36, 40].map((x, i) => (
        <g key={`engine-${i}`}>
          <path d={`M${x} 15 L${x + 2} 15 L${x + 2} 19 L${x} 19 Z`} fill={`url(#${u("bodySide")})`} stroke="#020617" strokeWidth=".3" />
          <ellipse cx={x + 1} cy="15" rx="1" ry=".4" fill="#1e293b" stroke="#020617" strokeWidth=".2" />
          <path d={`M${x} 15 L${x + 2} 15`} stroke="#f8fafc" strokeOpacity=".5" strokeWidth=".3" />
        </g>
      ))}

      {/* Landing Gear Pods (Sponson) */}
      <path d="M18 20 L20 20 L20 24 L18 24 Z" fill="#1e293b" stroke="#020617" strokeWidth=".3" />
      <path d="M28 20 L30 20 L30 24 L28 24 Z" fill="#1e293b" stroke="#020617" strokeWidth=".3" />

      {/* Cargo Ramp (Belakang) */}
      <path d="M19 24 L29 24 L27 27 L21 27 Z" fill="#334155" stroke="#020617" strokeWidth=".4" />
      <path d="M21 25 L27 25" stroke="#f8fafc" strokeOpacity=".3" strokeWidth=".3" />

      {/* Rim Light */}
      <path d="M21 5 Q24 0 27 5" fill="none" stroke="#f8fafc" strokeOpacity=".6" strokeWidth=".4" />
      <path d="M20 12 L4 16" fill="none" stroke="#f8fafc" strokeOpacity=".5" strokeWidth=".4" />
      <path d="M28 12 L44 16" fill="none" stroke="#f8fafc" strokeOpacity=".5" strokeWidth=".4" />
    </g>
  );
}