import { useId } from "react";
import type { UnitIconProps } from "../unitIconProps";

export default function DroneIntaiUav({ color }: UnitIconProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const u = (n: string) => `uav-${uid}-${n}`;
  const baseColor = color ?? "#53674f";

  return (
    <g color={baseColor} strokeLinejoin="round" strokeLinecap="round">
      <defs>
        <filter id={u("soft")} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="1.2" />
        </filter>
        <linearGradient id={u("bodyTop")} x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0" stopColor="currentColor" stopOpacity="1" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.7" />
        </linearGradient>
        <linearGradient id={u("bodySide")} x1="0" y1="0" x2="0.15" y2="1">
          <stop offset="0" stopColor="currentColor" stopOpacity="0.9" />
          <stop offset="1" stopColor="#020617" stopOpacity="0.8" />
        </linearGradient>
        <linearGradient id={u("glass")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6ee7f0" />
          <stop offset="1" stopColor="#0e7490" />
        </linearGradient>
        <linearGradient id={u("lens")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f8fafc" />
          <stop offset="0.5" stopColor="#22d3ee" />
          <stop offset="1" stopColor="#0f172a" />
        </linearGradient>
      </defs>

      {/* Ground Shadow */}
      <ellipse cx="24" cy="26" rx="16" ry="4" fill="#020617" opacity=".6" filter={`url(#${u("soft")})`} />

      {/* Pusher Propeller (Buritan) */}
      <g transform="translate(9 17)">
        <circle cx="0" cy="0" r="1.5" fill="#1e293b" stroke="#020617" strokeWidth=".3" />
        <path d="M0 0 L-2 -4 M0 0 L-2 4" stroke="#94a3b8" strokeWidth=".8" opacity=".6" />
        <path d="M0 0 L-2 -4 M0 0 L-2 4" stroke="#f8fafc" strokeWidth=".3" opacity=".9" />
      </g>

      {/* Rear Fuselage & V-Tail */}
      <path d="M9 17 L20 16 L24 17 L20 18 L9 18 Z" fill={`url(#${u("bodySide")})`} stroke="#020617" strokeWidth=".4" />
      <path d="M13 17 L11 11 L13 10 L15 16 Z" fill={`url(#${u("bodySide")})`} stroke="#020617" strokeWidth=".4" />
      <path d="M13 17 L11 23 L13 24 L15 18 Z" fill={`url(#${u("bodyTop")})`} stroke="#020617" strokeWidth=".4" />
      <path d="M13 17 L11 11" stroke="#f8fafc" strokeOpacity=".5" strokeWidth=".3" />

      {/* Main Wings (Long, High Aspect Ratio) */}
      <path d="M20 16 L4 14 L4 15 L20 17 Z" fill={`url(#${u("bodyTop")})`} stroke="#020617" strokeWidth=".4" />
      <path d="M20 17 L4 19 L4 20 L20 18 Z" fill={`url(#${u("bodySide")})`} stroke="#020617" strokeWidth=".4" />
      
      <path d="M20 16 L36 14 L36 15 L20 17 Z" fill={`url(#${u("bodyTop")})`} stroke="#020617" strokeWidth=".4" />
      <path d="M20 17 L36 19 L36 20 L20 18 Z" fill={`url(#${u("bodySide")})`} stroke="#020617" strokeWidth=".4" />

      {/* Wing Pylons & Hellfire Missiles */}
      {[8, 12, 28, 32].map((x, i) => (
        <g key={`pylon-${i}`}>
          <path d={`M${x} 15.5 L${x + 1} 16 L${x} 17 Z`} fill="#1e293b" stroke="#020617" strokeWidth=".2" />
          <rect x={x - 0.5} y="16.5" width="2" height="0.8" rx=".2" fill="#475569" stroke="#020617" strokeWidth=".2" />
        </g>
      ))}

      {/* Front Fuselage */}
      <path d="M20 16 L32 16 L35 18 L32 19 L20 18 Z" fill={`url(#${u("bodyTop")})`} stroke="#020617" strokeWidth=".5" />
      <path d="M20 18 L32 19 L35 18" fill="none" stroke="#020617" strokeWidth=".4" />

      {/* Cockpit / Satcom Dome (Hidung) */}
      <path d="M30 16 L34 17 L36 18 L34 19 L30 19 Z" fill={`url(#${u("bodyTop")})`} stroke="#020617" strokeWidth=".4" />
      <path d="M31 16.5 L34 17.5" stroke="#f8fafc" strokeOpacity=".4" strokeWidth=".3" />
      
      {/* Sensor Ball (MTS-B) di bawah hidung */}
      <circle cx="33" cy="20" r="1.8" fill="#0f172a" stroke="#020617" strokeWidth=".4" />
      <circle cx="33.5" cy="19.5" r="0.8" fill={`url(#${u("lens")})`} />
      <circle cx="33.5" cy="19.5" r="0.3" fill="#f8fafc" opacity=".8" />

      {/* Pitot Tube */}
      <path d="M36 18 L39 18" stroke="#94a3b8" strokeWidth=".4" />
      <circle cx="39" cy="18" r=".3" fill="#020617" />

      {/* Antennas & Blister */}
      <path d="M24 16 L24 14.5" stroke="#020617" strokeWidth=".4" />
      <circle cx="24" cy="14.5" r=".4" fill="#475569" />
      <path d="M22 16.5 L22 15" stroke="#020617" strokeWidth=".3" />

      {/* Nav Lights */}
      <circle cx="4" cy="14.5" r=".4" fill="#ef4444" />
      <circle cx="36" cy="14.5" r=".4" fill="#22c55e" />
    </g>
  );
}