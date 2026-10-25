import { useId } from "react";
import type { UnitIconProps } from "../unitIconProps";

export default function PeluncurRoket({ color }: UnitIconProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const u = (n: string) => `mlrs-${uid}-${n}`;
  const baseColor = color ?? "#53674f";

  return (
    <g color={baseColor} strokeLinejoin="round" strokeLinecap="round">
      <defs>
        {/* ===================== FILTERS ===================== */}
        <filter id={u("soft")} x="-40%" y="-140%" width="180%" height="380%">
          <feGaussianBlur stdDeviation="1.2" />
        </filter>
        <filter id={u("soft2")} x="-40%" y="-140%" width="180%" height="380%">
          <feGaussianBlur stdDeviation="0.5" />
        </filter>

        {/* ===================== CAB GRADIENTS ===================== */}
        <linearGradient id={u("cabTop")} x1="0" y1="0" x2="0.7" y2="1">
          <stop offset="0" stopColor="currentColor" stopOpacity="1" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.65" />
        </linearGradient>
        <linearGradient id={u("cabFront")} x1="0" y1="0" x2="1" y2="0.4">
          <stop offset="0" stopColor="currentColor" stopOpacity="0.95" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.45" />
        </linearGradient>
        <linearGradient id={u("cabSide")} x1="0" y1="0" x2="0.15" y2="1">
          <stop offset="0" stopColor="currentColor" stopOpacity="0.85" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.25" />
        </linearGradient>

        {/* ===================== POD GRADIENTS ===================== */}
        <linearGradient id={u("podTop")} x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0" stopColor="currentColor" stopOpacity="1" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.7" />
        </linearGradient>
        <linearGradient id={u("podSide")} x1="0" y1="0" x2="0.2" y2="1">
          <stop offset="0" stopColor="currentColor" stopOpacity="0.9" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.35" />
        </linearGradient>
        <linearGradient id={u("podFront")} x1="0" y1="0" x2="1" y2="0.5">
          <stop offset="0" stopColor="currentColor" stopOpacity="0.85" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.4" />
        </linearGradient>
        <linearGradient id={u("tubeInner")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#020617" />
          <stop offset="0.6" stopColor="#0f172a" />
          <stop offset="1" stopColor="#1e293b" />
        </linearGradient>

        {/* ===================== CHASSIS & WHEELS ===================== */}
        <linearGradient id={u("chassis")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1e293b" />
          <stop offset="1" stopColor="#020617" />
        </linearGradient>
        <radialGradient id={u("tire")} cx="0.4" cy="0.4" r="0.7">
          <stop offset="0" stopColor="#334155" />
          <stop offset="0.7" stopColor="#0f172a" />
          <stop offset="1" stopColor="#020617" />
        </radialGradient>
        <linearGradient id={u("rim")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#94a3b8" />
          <stop offset="1" stopColor="#475569" />
        </linearGradient>

        {/* ===================== GLASS & METAL ===================== */}
        <linearGradient id={u("glass")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6ee7f0" />
          <stop offset="0.5" stopColor="#22d3ee" />
          <stop offset="1" stopColor="#0e7490" />
        </linearGradient>
        <linearGradient id={u("hydraulic")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#cbd5e1" />
          <stop offset="0.5" stopColor="#64748b" />
          <stop offset="1" stopColor="#1e293b" />
        </linearGradient>
        <radialGradient id={u("headlight")} cx="0.35" cy="0.35" r="0.75">
          <stop offset="0" stopColor="#fffbe6" />
          <stop offset="0.5" stopColor="#fde68a" />
          <stop offset="1" stopColor="#78350f" />
        </radialGradient>
        <linearGradient id={u("taillight")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fecaca" />
          <stop offset="1" stopColor="#7f1d1d" />
        </linearGradient>
      </defs>

      {/* ===================== GROUND SHADOW ===================== */}
      <ellipse cx="24" cy="28.5" rx="21" ry="2.8" fill="#020617" opacity=".55"
        filter={`url(#${u("soft")})`} />

      {/* ===================== FAR-SIDE WHEELS (BACKGROUND) ===================== */}
      {[10.5, 16.5, 31.5, 37.5].map((cx, i) => (
        <g key={`bg-wheel-${i}`} opacity=".7">
          <circle cx={cx} cy="23" r="3.2" fill="#020617" />
          <circle cx={cx} cy="23" r="3.2" fill="none" stroke="#1e293b" strokeWidth=".6" />
        </g>
      ))}

      {/* ===================== CHASSIS FRAME ===================== */}
      <path d="M5 18.5 L43 18.5 L43 21.5 L5 21.5 Z"
        fill={`url(#${u("chassis")})`}
        stroke="#020617" strokeWidth=".6" />
      <path d="M6 19 L42 19 M6 21 L42 21"
        stroke="#334155" strokeOpacity=".5" strokeWidth=".5" />

      {/* ===================== LAUNCHER BASE (TURNTABLE) ===================== */}
      <path d="M18 18.5 L22 14.5 L38 14.5 L42 18.5 Z"
        fill={`url(#${u("cabTop")})`} stroke="#020617" strokeWidth=".6" />
      <path d="M22 14.5 L24 11 L32 11 L38 14.5 Z"
        fill={`url(#${u("cabSide")})`} stroke="#020617" strokeWidth=".5" />
      <path d="M22 14.5 L38 14.5" stroke="#f8fafc" strokeOpacity=".4" strokeWidth=".5" />

      {/* ===================== HYDRAULIC ELEVATION ARM ===================== */}
      <path d="M29 15 L31 12 L33 12 L32 16 Z"
        fill={`url(#${u("hydraulic")})`}
        stroke="#020617" strokeWidth=".5" />
      <path d="M30 14 L31.5 11.5"
        stroke="#f8fafc" strokeOpacity=".6" strokeWidth=".5" />
      <circle cx="30.5" cy="15.5" r="1" fill="#475569" stroke="#020617" strokeWidth=".4" />
      <circle cx="30.5" cy="15.5" r="0.4" fill="#94a3b8" />
      <circle cx="32" cy="11.5" r="0.8" fill="#475569" stroke="#020617" strokeWidth=".4" />

      {/* ===================== REAR POD STRUCTURE (BACKGROUND) ===================== */}
      {/* Bottom plate of the elevated pod */}
      <path d="M16 12 L38 7 L43 10 L21 15 Z"
        fill="#1e293b" stroke="#020617" strokeWidth=".6" />

      {/* ===================== ROCKET POD (MAIN BODY) ===================== */}
      {/* Pod Side/Left face */}
      <path d="M14 4 L16 12 L21 15 L20 5 Z"
        fill={`url(#${u("podSide")})`} stroke="#020617" strokeWidth=".6" />

      {/* Pod Front Face (where the tubes are) */}
      <path d="M14 4 L35 1 L43 10 L21 15 Z"
        fill={`url(#${u("podFront")})`} stroke="#020617" strokeWidth=".7" />

      {/* Pod Top Face */}
      <path d="M14 4 L35 1 L37 2 L16 5 Z"
        fill={`url(#${u("podTop")})`} stroke="#020617" strokeWidth=".5" />

      {/* Pod Edge Highlights */}
      <path d="M14 4 L35 1 L43 10" fill="none"
        stroke="#f8fafc" strokeOpacity=".6" strokeWidth=".6" />
      <path d="M14 4 L16 12 L21 15" fill="none"
        stroke="#f8fafc" strokeOpacity=".3" strokeWidth=".5" />

      {/* ===================== ROCKET TUBES (3x4 GRID) ===================== */}
      {Array.from({ length: 3 }).map((_, row) =>
        Array.from({ length: 4 }).map((_, col) => {
          // Perspective offset for the grid
          const x = 15.5 + col * 4.8 + row * 1.8;
          const y = 4.5 + col * 1.6 - row * 0.8;
          return (
            <g key={`tube-${row}-${col}`}>
              {/* Outer Rim */}
              <ellipse cx={x} cy={y} rx="2" ry="1.2"
                fill={`url(#${u("podTop")})`}
                stroke="#020617" strokeWidth=".4" />
              {/* Inner Hole */}
              <ellipse cx={x} cy={y} rx="1.4" ry="0.8"
                fill={`url(#${u("tubeInner")})`}
                stroke="#0f172a" strokeWidth=".3" />
              {/* Rocket Tip (slightly visible) */}
              <ellipse cx={x} cy={y + 0.1} rx="0.6" ry="0.35"
                fill="#475569" />
              <ellipse cx={x - 0.2} cy={y} rx="0.2" ry="0.15"
                fill="#f8fafc" opacity=".5" />
              {/* Rim Highlight */}
              <path d={`M${x - 1.8} ${y - 0.2} Q${x} ${y - 1.2} ${x + 1.8} ${y - 0.2}`}
                fill="none" stroke="#f8fafc" strokeOpacity=".4" strokeWidth=".4" />
            </g>
          );
        })
      )}

      {/* Pod Side Details (Ribs) */}
      {[0, 1, 2].map((i) => (
        <path key={`pod-rib-${i}`}
          d={`M${14.8 + i * 2} ${5.5 + i * 1.8} L${16.8 + i * 2} ${12.5 + i * 1.8}`}
          stroke="#020617" strokeOpacity=".5" strokeWidth=".5" />
      ))}

      {/* ===================== ARMORED CAB ===================== */}
      {/* Cab Lower Body / Chassis integration */}
      <path d="M4 18.5 L9 11 L21 12 L21 19 L4 19 Z"
        fill={`url(#${u("cabSide")})`} stroke="#020617" strokeWidth=".6" />

      {/* Cab Front Face (Slanted) */}
      <path d="M4 18.5 L9 11 L14 11 L9 18.5 Z"
        fill={`url(#${u("cabFront")})`} stroke="#020617" strokeWidth=".6" />

      {/* Cab Roof */}
      <path d="M9 11 L14 11 L20 12 L15 12 Z"
        fill={`url(#${u("cabTop")})`} stroke="#020617" strokeWidth=".5" />

      {/* Roof Hatch/Sensor */}
      <rect x="11.5" y="10" width="2.5" height="1" rx=".3"
        fill="currentColor" fillOpacity=".8"
        stroke="#020617" strokeWidth=".4" />
      <rect x="12" y="9.5" width="0.6" height="0.5"
        fill="#475569" stroke="#020617" strokeWidth=".2" />
      <circle cx="12.3" cy="9.3" r="0.2" fill="#22d3ee" opacity=".8" />

      {/* Windshield (Bulletproof Glass) */}
      <path d="M6 15 L10 11.5 L14.5 12 L11 15.5 Z"
        fill={`url(#${u("glass")})`}
        stroke="#020617" strokeWidth=".5" />
      <path d="M6.5 14.5 L9.5 11.8"
        stroke="#f8fafc" strokeOpacity=".6" strokeWidth=".5" />
      {/* Windshield Wipers */}
      <path d="M8 12 L9 14 M11 12 L12 14.5"
        stroke="#020617" strokeWidth=".4" />

      {/* Side Door & Window */}
      <path d="M13 12.5 L18.5 13 L18.5 16 L13 15.5 Z"
        fill={`url(#${u("glass")})`} opacity=".8"
        stroke="#020617" strokeWidth=".4" />
      <path d="M13.5 13 L18 13.4" stroke="#f8fafc" strokeOpacity=".4" strokeWidth=".4" />
      
      {/* Door Handle & Hinges */}
      <rect x="16.5" y="14.5" width="1" height=".3" rx=".1"
        fill="#94a3b8" stroke="#020617" strokeWidth=".2" />
      <path d="M13 13.5 L13.5 13.6 M13 14.5 L13.5 14.6"
        stroke="#020617" strokeOpacity=".6" strokeWidth=".3" />

      {/* Front Grille */}
      {[0, 1, 2].map((i) => (
        <path key={`cab-grille-${i}`}
          d={`M${6 + i * 0.8} 16 L${7 + i * 0.8} 17.5`}
          stroke="#020617" strokeOpacity=".7" strokeWidth=".4" />
      ))}

      {/* Headlights & Guards */}
      <ellipse cx="7.5" cy="17.5" rx="1" ry="0.7"
        fill={`url(#${u("headlight")})`}
        stroke="#020617" strokeWidth=".4" />
      <ellipse cx="7.5" cy="17.5" rx="0.5" ry="0.35" fill="#fffbe6" />
      <path d="M6.5 17 L8.5 17 M6.5 18 L8.5 18"
        stroke="#020617" strokeWidth=".4" />

      {/* Bumper & Tow Hooks */}
      <path d="M4 19 L9 19 L9 20 L4 20 Z"
        fill="#0f172a" stroke="#020617" strokeWidth=".4" />
      <path d="M6 20 L6.5 19.5 M7 20 L7.5 19.5"
        stroke="#f8fafc" strokeOpacity=".4" strokeWidth=".3" />

      {/* Side Mirrors */}
      <path d="M11 13 L9.5 13.5 L9.5 14.5"
        fill="none" stroke="#020617" strokeWidth=".5" />
      <rect x="8.8" y="14" width="0.8" height="1.2" rx=".2"
        fill="#1e293b" stroke="#020617" strokeWidth=".3" />
      <rect x="9" y="14.1" width="0.4" height="0.9" fill="#94a3b8" opacity=".5" />

      {/* ===================== NEAR-SIDE WHEELS (FOREGROUND) ===================== */}
      {[9.5, 15.5, 30.5, 36.5].map((cx, i) => {
        const cy = 23.5;
        return (
          <g key={`fg-wheel-${i}`}>
            {/* Tire */}
            <circle cx={cx} cy={cy} r="3.6" fill={`url(#${u("tire")})`} />
            <circle cx={cx} cy={cy} r="3.6" fill="none" stroke="#020617" strokeWidth=".6" />
            {/* Tire Tread Details */}
            <circle cx={cx} cy={cy} r="3" fill="none"
              stroke="#1e293b" strokeWidth=".8" strokeDasharray="1.5 1.5" />
            {/* Rim */}
            <circle cx={cx} cy={cy} r="1.8" fill={`url(#${u("rim")})`} stroke="#020617" strokeWidth=".4" />
            {/* Hub */}
            <circle cx={cx} cy={cy} r="0.7" fill="#1e293b" />
            {/* Lug Nuts */}
            {[0, 60, 120, 180, 240, 300].map((angle) => (
              <circle key={angle}
                cx={cx + Math.cos((angle * Math.PI) / 180) * 1.2}
                cy={cy + Math.sin((angle * Math.PI) / 180) * 1.2}
                r="0.2" fill="#94a3b8" />
            ))}
            {/* Rim Highlight */}
            <path d={`M${cx - 1.5} ${cy - 1.5} A2 2 0 0 1 ${cx + 1.5} ${cy - 1.5}`}
              fill="none" stroke="#f8fafc" strokeOpacity=".4" strokeWidth=".4" />
          </g>
        );
      })}

      {/* ===================== TAIL LIGHTS & REAR DETAILS ===================== */}
      <ellipse cx="41.5" cy="18" rx="0.8" ry="0.5"
        fill={`url(#${u("taillight")})`}
        stroke="#020617" strokeWidth=".3" />
      <path d="M40 19 L42 19"
        stroke="#f8fafc" strokeOpacity=".3" strokeWidth=".4" />

      {/* ===================== ANTENNA & COMMUNICATIONS ===================== */}
      <path d="M19 12 L18 7"
        stroke="#0f172a" strokeWidth=".5" />
      <circle cx="18" cy="7" r="0.3" fill="#94a3b8" />
      <path d="M16 12 L16.5 9"
        stroke="#0f172a" strokeWidth=".4" />
      <circle cx="16.5" cy="9" r="0.2" fill="#94a3b8" />

      {/* ===================== FINAL RIM LIGHTS ===================== */}
      <path d="M4 18.5 L9 11 L14 11" fill="none"
        stroke="#f8fafc" strokeOpacity=".4" strokeWidth=".5" />
      <path d="M21 12 L38 14.5" fill="none"
        stroke="#f8fafc" strokeOpacity=".3" strokeWidth=".5" />
      <path d="M14 4 L35 1" fill="none"
        stroke="#f8fafc" strokeOpacity=".5" strokeWidth=".6" />
    </g>
  );
}