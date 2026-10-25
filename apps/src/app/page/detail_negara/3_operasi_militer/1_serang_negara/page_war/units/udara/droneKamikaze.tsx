import { useId } from "react";
import type { UnitIconProps } from "../unitIconProps";

export default function DroneKamikaze({ color }: UnitIconProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const u = (n: string) => `kam-${uid}-${n}`;
  const baseColor = color ?? "#53674f";

  return (
    <g color={baseColor} strokeLinejoin="round" strokeLinecap="round">
      <defs>
        <filter id={u("soft")} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="1" />
        </filter>
        <linearGradient id={u("bodyTop")} x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0" stopColor="currentColor" stopOpacity="1" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.7" />
        </linearGradient>
        <linearGradient id={u("bodySide")} x1="0" y1="0" x2="0.15" y2="1">
          <stop offset="0" stopColor="currentColor" stopOpacity="0.9" />
          <stop offset="1" stopColor="#020617" stopOpacity="0.8" />
        </linearGradient>
        <linearGradient id={u("lens")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#d5f7ef" />
          <stop offset="1" stopColor="#0e7490" />
        </linearGradient>
      </defs>

      {/* Ground Shadow */}
      <ellipse cx="24" cy="24" rx="18" ry="3" fill="#020617" opacity=".6" filter={`url(#${u("soft")})`} />

      {/* Main Delta Wings */}
      <path d="M24 16 L2 23 L6 24 L24 19 Z" fill={`url(#${u("bodyTop")})`} stroke="#020617" strokeWidth=".4" />
      <path d="M24 16 L46 23 L42 24 L24 19 Z" fill={`url(#${u("bodyTop")})`} stroke="#020617" strokeWidth=".4" />
      
      <path d="M24 19 L6 24 L10 25 L24 21 Z" fill={`url(#${u("bodySide")})`} stroke="#020617" strokeWidth=".4" />
      <path d="M24 19 L42 24 L38 25 L24 21 Z" fill={`url(#${u("bodySide")})`} stroke="#020617" strokeWidth=".4" />

      {/* Fuselage */}
      <path d="M21 10 L27 10 L25 24 L23 24 Z" fill={`url(#${u("bodyTop")})`} stroke="#020617" strokeWidth=".5" />
      <path d="M21 10 L23 24 L23 25 L19 12 Z" fill={`url(#${u("bodySide")})`} stroke="#020617" strokeWidth=".4" />
      <path d="M27 10 L25 24 L25 25 L29 12 Z" fill={`url(#${u("bodySide")})`} stroke="#020617" strokeWidth=".4" />

      {/* Warhead / Nose (Sharp) */}
      <path d="M21 10 L24 2 L27 10 Z" fill={`url(#${u("bodyTop")})`} stroke="#020617" strokeWidth=".5" />
      <path d="M21 10 L24 2 L24 11 Z" fill={`url(#${u("bodySide")})`} stroke="#020617" strokeWidth=".4" />

      {/* Optical Seeker (Sensor di hidung) */}
      <circle cx="24" cy="6" r="1.2" fill="#0f172a" stroke="#020617" strokeWidth=".3" />
      <circle cx="24" cy="6" r=".6" fill={`url(#${u("lens")})`} />
      <circle cx="24" cy="6" r=".2" fill="#f8fafc" />

      {/* Rear Pusher Propeller */}
      <g transform="translate(24 24)">
        <circle cx="0" cy="0" r="1" fill="#1e293b" stroke="#020617" strokeWidth=".3" />
        <path d="M0 0 L-4 -1 M0 0 L4 1" stroke="#94a3b8" strokeWidth=".8" opacity=".6" />
        <path d="M0 0 L-4 -1 M0 0 L4 1" stroke="#f8fafc" strokeWidth=".3" opacity=".9" />
      </g>

      {/* Tail Fins / V-Tail (Kecil di belakang) */}
      <path d="M21 21 L18 18 L19 17 L22 19 Z" fill={`url(#${u("bodyTop")})`} stroke="#020617" strokeWidth=".3" />
      <path d="M27 21 L30 18 L29 17 L26 19 Z" fill={`url(#${u("bodyTop")})`} stroke="#020617" strokeWidth=".3" />

      {/* Rim Light */}
      <path d="M21 10 L24 2 L27 10" fill="none" stroke="#f8fafc" strokeOpacity=".5" strokeWidth=".4" />
      <path d="M24 16 L46 23" fill="none" stroke="#f8fafc" strokeOpacity=".4" strokeWidth=".3" />
    </g>
  );
}