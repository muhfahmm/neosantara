import { useId } from "react";
import type { UnitIconProps } from "../unitIconProps";

export default function PesawatPengintai({ color }: UnitIconProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const u = (n: string) => `awacs-${uid}-${n}`;
  const baseColor = color ?? "#53674f";

  return (
    <g color={baseColor} strokeLinejoin="round" strokeLinecap="round">
      <defs>
        <filter id={u("soft")} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="1.5" />
        </filter>
        <filter id={u("radarGlow")} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="0.8" />
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
        <linearGradient id={u("radarDome")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#94a3b8" />
          <stop offset="0.5" stopColor="#334155" />
          <stop offset="1" stopColor="#0f172a" />
        </linearGradient>
        <linearGradient id={u("radarTop")} x1="0" y1="0" x2="0.8" y2="1">
          <stop offset="0" stopColor="#f8fafc" stopOpacity="0.6" />
          <stop offset="1" stopColor="#64748b" stopOpacity="0.4" />
        </linearGradient>
      </defs>

      {/* Ground Shadow */}
      <ellipse cx="24" cy="28" rx="22" ry="5" fill="#020617" opacity=".6" filter={`url(#${u("soft")})`} />

      {/* Main Wings */}
      <path d="M20 14 L2 18 L2 20 L21 19 Z" fill={`url(#${u("bodyTop")})`} stroke="#020617" strokeWidth=".4" />
      <path d="M28 14 L46 18 L46 20 L27 19 Z" fill={`url(#${u("bodyTop")})`} stroke="#020617" strokeWidth=".4" />
      
      <path d="M21 19 L2 20 L3 21 L22 21 Z" fill={`url(#${u("bodySide")})`} stroke="#020617" strokeWidth=".4" />
      <path d="M27 19 L46 20 L45 21 L26 21 Z" fill={`url(#${u("bodySide")})`} stroke="#020617" strokeWidth=".4" />

      {/* 4 Turbofan Engines */}
      {[8, 12, 36, 40].map((x, i) => (
        <g key={`engine-${i}`}>
          <path d={`M${x} 16 L${x + 2} 16 L${x + 2} 20 L${x} 20 Z`} fill={`url(#${u("bodySide")})`} stroke="#020617" strokeWidth=".3" />
          <ellipse cx={x + 1} cy="16" rx="1" ry=".4" fill="#1e293b" stroke="#020617" strokeWidth=".2" />
          <path d={`M${x} 16 L${x + 2} 16`} stroke="#f8fafc" strokeOpacity=".5" strokeWidth=".3" />
          <ellipse cx={x + 1} cy="20" rx="1" ry=".3" fill="#020617" />
        </g>
      ))}

      {/* Main Fuselage (Fat Cylinder) */}
      <path d="M20 6 L28 6 L30 25 L18 25 Z" fill={`url(#${u("bodyTop")})`} stroke="#020617" strokeWidth=".5" />
      <path d="M20 6 L18 25 L17 25 L19 8 Z" fill={`url(#${u("bodySide")})`} stroke="#020617" strokeWidth=".4" />
      <path d="M28 6 L30 25 L31 25 L29 8 Z" fill={`url(#${u("bodySide")})`} stroke="#020617" strokeWidth=".4" />

      {/* Nose & Cockpit */}
      <path d="M20 6 Q24 2 28 6 Z" fill={`url(#${u("bodyTop")})`} stroke="#020617" strokeWidth=".4" />
      <path d="M20 6 Q24 2 24 7 Z" fill={`url(#${u("bodySide")})`} stroke="#020617" strokeWidth=".3" />
      <path d="M21 5 L27 5 L27 8 L21 8 Z" fill={`url(#${u("glass")})`} stroke="#020617" strokeWidth=".3" />
      <path d="M22 5.5 L26 5.5" stroke="#f8fafc" strokeOpacity=".6" strokeWidth=".4" />

      {/* Tail Fin (Vertical Stabilizer) */}
      <path d="M21 25 L21 17 L23 17 L25 25 Z" fill={`url(#${u("bodyTop")})`} stroke="#020617" strokeWidth=".4" />
      <path d="M21 17 L23 17" stroke="#f8fafc" strokeOpacity=".5" strokeWidth=".3" />

      {/* Horizontal Stabilizers */}
      <path d="M20 24 L14 27 L16 28 L21 25 Z" fill={`url(#${u("bodyTop")})`} stroke="#020617" strokeWidth=".3" />
      <path d="M28 24 L34 27 L32 28 L27 25 Z" fill={`url(#${u("bodyTop")})`} stroke="#020617" strokeWidth=".3" />

      {/* Sensor Blisters & Antennas on Fuselage */}
      <rect x="18" y="12" width="1.5" height="4" rx=".3" fill="#1e293b" stroke="#020617" strokeWidth=".2" />
      <rect x="28.5" y="12" width="1.5" height="4" rx=".3" fill="#1e293b" stroke="#020617" strokeWidth=".2" />
      <path d="M19 10 L19 14 M29 10 L29 14" stroke="#020617" strokeWidth=".4" />

      {/* ==================== ROTODOME (RADAR DOME) ==================== */}
      {/* Support Struts (Penyangga) */}
      <path d="M22 10 L22 6 L23 6 L23 10 Z" fill="#475569" stroke="#020617" strokeWidth=".3" />
      <path d="M26 10 L26 6 L25 6 L25 10 Z" fill="#475569" stroke="#020617" strokeWidth=".3" />

      {/* 3D Rotodome / Radar Dish */}
      <g transform="translate(24 5)">
        {/* Bottom Shadow of Dome */}
        <ellipse cx="0" cy="2.5" rx="11" ry="3" fill="#020617" opacity=".5" />
        
        {/* Dome Side (Thick) */}
        <path d="M-11 0 C -11 4, 11 4, 11 0 L 11 2 C 11 6, -11 6, -11 2 Z" 
          fill={`url(#${u("radarDome")})`} stroke="#020617" strokeWidth=".4" />
          
        {/* Dome Top Face */}
        <ellipse cx="0" cy="0" rx="11" ry="3" 
          fill={`url(#${u("radarTop")})`} stroke="#020617" strokeWidth=".5" />
          
        {/* Radar Sweep Effect (Garis Pindai) */}
        <path d="M0 0 L 10 -1.5 A 11 3 0 0 1 8 2 Z" fill="#22d3ee" opacity=".4" filter={`url(#${u("radarGlow")})`} />
        <path d="M0 0 L 10 -1.5" stroke="#f8fafc" strokeOpacity=".8" strokeWidth=".5" />
        
        {/* Center Hub */}
        <circle cx="0" cy="0" r="1.5" fill="#1e293b" stroke="#020617" strokeWidth=".3" />
        <circle cx="0" cy="0" r=".5" fill="#f8fafc" />
        
        {/* Dome Details (Panel Lines) */}
        <path d="M-6 -2.5 A 7 2 0 0 1 6 -2.5" fill="none" stroke="#020617" strokeOpacity=".5" strokeWidth=".3" />
        <path d="M-8 -1 A 9 2.5 0 0 1 8 -1" fill="none" stroke="#020617" strokeOpacity=".4" strokeWidth=".3" />
      </g>

      {/* Rim Light */}
      <path d="M20 6 Q24 2 28 6" fill="none" stroke="#f8fafc" strokeOpacity=".6" strokeWidth=".4" />
      <path d="M20 14 L2 18" fill="none" stroke="#f8fafc" strokeOpacity=".5" strokeWidth=".4" />
      <path d="M28 14 L46 18" fill="none" stroke="#f8fafc" strokeOpacity=".5" strokeWidth=".4" />
    </g>
  );
}