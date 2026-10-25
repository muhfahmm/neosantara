import { useId } from "react";
import type { UnitIconProps } from "../unitIconProps";

export default function KendaraanTaktis({ color }: UnitIconProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const u = (n: string) => `kt-${uid}-${n}`;
  const baseColor = color ?? "#53674f";

  return (
    <g color={baseColor} strokeLinejoin="round" strokeLinecap="round">
      <defs>
        {/* ===================== FILTERS ===================== */}
        <filter id={u("soft")} x="-40%" y="-140%" width="180%" height="380%">
          <feGaussianBlur stdDeviation="1.3" />
        </filter>
        <filter id={u("soft2")} x="-40%" y="-140%" width="180%" height="380%">
          <feGaussianBlur stdDeviation="0.5" />
        </filter>

        {/* ===================== BODY & CABIN GRADIENTS ===================== */}
        <linearGradient id={u("bodyTop")} x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0" stopColor="currentColor" stopOpacity="1" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.65" />
        </linearGradient>
        <linearGradient id={u("bodySide")} x1="0" y1="0" x2="0.15" y2="1">
          <stop offset="0" stopColor="currentColor" stopOpacity="0.9" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.25" />
        </linearGradient>
        <linearGradient id={u("bodyFront")} x1="0" y1="0" x2="1" y2="0.5">
          <stop offset="0" stopColor="currentColor" stopOpacity="0.95" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.45" />
        </linearGradient>

        {/* ===================== GLASS & LENSES ===================== */}
        <linearGradient id={u("glass")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6ee7f0" stopOpacity="0.9" />
          <stop offset="0.5" stopColor="#22d3ee" stopOpacity="0.6" />
          <stop offset="1" stopColor="#0e7490" stopOpacity="0.9" />
        </linearGradient>
        <linearGradient id={u("lens")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#d5f7ef" />
          <stop offset="1" stopColor="#0e7490" />
        </linearGradient>

        {/* ===================== CHASSIS & TIRES ===================== */}
        <linearGradient id={u("chassis")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1e293b" />
          <stop offset="1" stopColor="#020617" />
        </linearGradient>
        <radialGradient id={u("tire")} cx="0.4" cy="0.4" r="0.75">
          <stop offset="0" stopColor="#334155" />
          <stop offset="0.7" stopColor="#0f172a" />
          <stop offset="1" stopColor="#020617" />
        </radialGradient>
        <linearGradient id={u("rim")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#94a3b8" />
          <stop offset="0.5" stopColor="#475569" />
          <stop offset="1" stopColor="#1e293b" />
        </linearGradient>

        {/* ===================== WEAPON & METAL ===================== */}
        <linearGradient id={u("gunMetal")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#64748b" />
          <stop offset="0.5" stopColor="#334155" />
          <stop offset="1" stopColor="#0f172a" />
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
      {[11.5, 34.5].map((cx, i) => (
        <g key={`bg-wheel-${i}`} opacity=".6">
          <circle cx={cx} cy="22.5" r="3.6" fill="#020617" />
          <circle cx={cx} cy="22.5" r="3.6" fill="none" stroke="#1e293b" strokeWidth=".6" />
          <circle cx={cx} cy="22.5" r="1.5" fill="#0f172a" />
        </g>
      ))}

      {/* ===================== CHASSIS FRAME ===================== */}
      <path d="M6 18.5 L42 18.5 L42 22 L6 22 Z"
        fill={`url(#${u("chassis")})`} stroke="#020617" strokeWidth=".6" />
      
      {/* Suspension Arms */}
      <path d="M11.5 20.5 L16 19.5 M34.5 20.5 L39 19.5"
        stroke="#1e293b" strokeWidth=".8" />
      <path d="M11.5 21 L16 21 M34.5 21 L39 21"
        stroke="#0f172a" strokeWidth=".8" />

      {/* ===================== LOWER HULL / SKID PLATE ===================== */}
      <path d="M6.5 17.5 L10.5 12.5 L33.5 13 L41.5 18.5 L41.5 21 L6.5 21 Z"
        fill={`url(#${u("bodySide")})`} stroke="#020617" strokeWidth=".6" />

      {/* ===================== NEAR-SIDE WHEELS (FOREGROUND) ===================== */}
      {[10.5, 33.5].map((cx, i) => {
        const cy = 22.5;
        return (
          <g key={`fg-wheel-${i}`}>
            {/* Tire Base */}
            <circle cx={cx} cy={cy} r="3.8" fill={`url(#${u("tire")})`} />
            <circle cx={cx} cy={cy} r="3.8" fill="none" stroke="#020617" strokeWidth=".6" />
            
            {/* Tire Tread (Chunky Off-road) */}
            <circle cx={cx} cy={cy} r="3.2" fill="none"
              stroke="#1e293b" strokeWidth="1" strokeDasharray="1.8 1.2" />
            <circle cx={cx} cy={cy} r="3.5" fill="none"
              stroke="#0f172a" strokeWidth=".5" strokeDasharray="1 2" />
              
            {/* Rim */}
            <circle cx={cx} cy={cy} r="1.8" fill={`url(#${u("rim")})`} stroke="#020617" strokeWidth=".4" />
            <circle cx={cx} cy={cy} r="1.2" fill="#1e293b" />
            
            {/* Hub & Lug Nuts */}
            <circle cx={cx} cy={cy} r="0.6" fill="#94a3b8" />
            {[0, 60, 120, 180, 240, 300].map((angle) => (
              <circle key={angle}
                cx={cx + Math.cos((angle * Math.PI) / 180) * 0.9}
                cy={cy + Math.sin((angle * Math.PI) / 180) * 0.9}
                r="0.2" fill="#cbd5e1" />
            ))}
            
            {/* Rim Highlight */}
            <path d={`M${cx - 1.5} ${cy - 1.5} A2 2 0 0 1 ${cx + 1.5} ${cy - 1.5}`}
              fill="none" stroke="#f8fafc" strokeOpacity=".4" strokeWidth=".4" />
          </g>
        );
      })}

      {/* ===================== ARMORED CABIN (MAIN BODY) ===================== */}
      {/* Side Profile / Door Area */}
      <path d="M8 17 L12 8.5 L29 8.5 L36 14.5 L39 17 L36 19.5 L9 18.5 Z"
        fill={`url(#${u("bodySide")})`} stroke="#020617" strokeWidth=".6" />

      {/* Front Glacis (Slanted) */}
      <path d="M36 14.5 L39 17 L41.5 19.5 L38 20.5 L34 17 Z"
        fill={`url(#${u("bodyFront")})`} stroke="#020617" strokeWidth=".6" />
      
      {/* Roof Plate */}
      <path d="M12 8.5 L18 7 L31.5 9.5 L29 8.5 Z"
        fill={`url(#${u("bodyTop")})`} stroke="#020617" strokeWidth=".5" />
      <path d="M12 8.5 L29 8.5 L36 14.5 L18 12 Z"
        fill={`url(#${u("bodyTop")})`} stroke="#020617" strokeWidth=".5" opacity=".8" />

      {/* ===================== WINDSHIELD & WINDOWS ===================== */}
      {/* Front Windshield (Bulletproof) */}
      <path d="M31 10 L35 13.5 L37.5 16 L34.5 16 L29.5 12 Z"
        fill={`url(#${u("glass")})`} stroke="#020617" strokeWidth=".5" />
      <path d="M31.5 10.5 L34.5 13.5"
        stroke="#f8fafc" strokeOpacity=".7" strokeWidth=".5" />
      
      {/* Side Window (Driver) */}
      <path d="M19 9.5 L27.5 10.5 L29 14 L20 13.5 Z"
        fill={`url(#${u("glass")})`} stroke="#020617" strokeWidth=".5" />
      <path d="M20 10 L26 10.8"
        stroke="#f8fafc" strokeOpacity=".6" strokeWidth=".4" />

      {/* Door Panel Lines & Hinges */}
      <path d="M19.5 13.8 L19.5 18.2 M28.5 14.5 L28.5 18.5"
        stroke="#020617" strokeOpacity=".4" strokeWidth=".4" />
      <rect x="23" y="15" width="1.5" height="0.4" rx="0.1"
        fill="#94a3b8" stroke="#020617" strokeWidth=".2" />
      <circle cx="20.2" cy="14.5" r="0.3" fill="#020617" opacity=".6" />
      <circle cx="20.2" cy="16.5" r="0.3" fill="#020617" opacity=".6" />

      {/* Side Armor Plate (Lower) */}
      <path d="M10 17.5 L18 18.5 L18 19.5 L10 19 Z"
        fill="currentColor" fillOpacity=".4" stroke="#020617" strokeWidth=".4" />
      <path d="M29.5 18.5 L35.5 19.2 L35.5 20 L29.5 19.5 Z"
        fill="currentColor" fillOpacity=".4" stroke="#020617" strokeWidth=".4" />

      {/* ===================== ROOF-MOUNTED RWS (REMOTE WEAPON STATION) ===================== */}
      {/* Mount Base */}
      <path d="M22.5 8.5 L25 7.5 L28.5 8 L26.5 9 Z"
        fill="#1e293b" stroke="#020617" strokeWidth=".45" />
      
      {/* Turret Body */}
      <path d="M23 6.5 L26 5.5 L29 6 L30 8 L27 9 L24 8.5 Z"
        fill={`url(#${u("gunMetal")})`} stroke="#020617" strokeWidth=".5" />
      <path d="M23 6.5 L26 5.5 L29 6"
        stroke="#f8fafc" strokeOpacity=".5" strokeWidth=".4" />

      {/* Optics / Camera */}
      <rect x="23.5" y="6.8" width="1.2" height="1.5" rx=".2"
        fill="#0f172a" stroke="#020617" strokeWidth=".3" />
      <circle cx="24.1" cy="7.5" r="0.35" fill={`url(#${u("lens")})`} />
      <circle cx="24.1" cy="7.5" r="0.15" fill="#f8fafc" opacity=".9" />

      {/* Heavy Machine Gun Barrel */}
      <path d="M28.5 6.8 L37 7.5 L37 8.3 L28.5 7.8 Z"
        fill={`url(#${u("gunMetal")})`} stroke="#020617" strokeWidth=".4" />
      <rect x="36" y="7.3" width="1.5" height="1" rx=".2"
        fill="#0f172a" stroke="#020617" strokeWidth=".3" />
      <path d="M29 7.1 L36 7.7"
        stroke="#f8fafc" strokeOpacity=".4" strokeWidth=".3" />

      {/* Ammo Box */}
      <path d="M25 7.5 L27.5 7.8 L27.5 9.5 L25 9.2 Z"
        fill="currentColor" fillOpacity=".7" stroke="#020617" strokeWidth=".4" />
      <path d="M25.5 8 L27 8.2"
        stroke="#f8fafc" strokeOpacity=".3" strokeWidth=".3" />

      {/* ===================== FRONT DETAILS ===================== */}
      {/* Grille */}
      {[0, 1, 2, 3].map((i) => (
        <path key={`grille-${i}`}
          d={`M${37 + i * 0.8} 15.5 L${38 + i * 0.8} 17.5`}
          stroke="#020617" strokeOpacity=".7" strokeWidth=".4" />
      ))}

      {/* Headlights */}
      <ellipse cx="39.5" cy="16.5" rx="0.9" ry="0.7"
        fill={`url(#${u("headlight")})`} stroke="#020617" strokeWidth=".4" />
      <ellipse cx="39.5" cy="16.5" rx="0.4" ry="0.3" fill="#fffbe6" />
      <path d="M38.5 16 L40.5 16 M38.5 17 L40.5 17"
        stroke="#020617" strokeOpacity=".6" strokeWidth=".35" />

      {/* Bumper & Tow Hooks */}
      <path d="M38 19.5 L41.5 20 L41 21.5 L37.5 21 Z"
        fill="#1e293b" stroke="#020617" strokeWidth=".4" />
      <path d="M39 20 L40 20 M39.5 20.5 L40.5 20.5"
        stroke="#f8fafc" strokeOpacity=".4" strokeWidth=".3" />
      <path d="M37.5 21 L36.5 20.5 M40.5 21.5 L41.5 21"
        stroke="#94a3b8" strokeOpacity=".6" strokeWidth=".4" />

      {/* ===================== TAIL DETAILS ===================== */}
      <ellipse cx="7.5" cy="17.5" rx="0.8" ry="0.6"
        fill={`url(#${u("taillight")})`} stroke="#020617" strokeWidth=".3" />
      <path d="M8 19 L9.5 19"
        stroke="#f8fafc" strokeOpacity=".3" strokeWidth=".4" />

      {/* ===================== ANTENNAS & SENSORS ===================== */}
      <path d="M18 8 L17 4"
        stroke="#0f172a" strokeWidth=".5" />
      <circle cx="17" cy="4" r="0.3" fill="#94a3b8" />
      <circle cx="17" cy="4" r="0.15" fill="#f8fafc" opacity=".7" />

      <path d="M29 9 L28.5 5.5"
        stroke="#0f172a" strokeWidth=".4" />
      <circle cx="28.5" cy="5.5" r="0.25" fill="#94a3b8" />

      {/* Side Mirrors */}
      <path d="M32 11 L30 12.5 L30 13.5"
        fill="none" stroke="#020617" strokeWidth=".4" />
      <rect x="29.5" y="12.5" width="0.8" height="1.2" rx=".2"
        fill="#1e293b" stroke="#020617" strokeWidth=".3" />
      <rect x="29.7" y="12.6" width="0.4" height="0.9" fill="#94a3b8" opacity=".5" />

      {/* ===================== BOLTS & RIVETS ===================== */}
      {[
        [12, 15], [18, 15.5], [22, 17.8], [29, 18], [34, 15.5],
        [10, 18], [15, 18.5], [26, 18], [32, 18.5], [37, 18.5],
        [13, 9.5], [22, 8], [28, 9]
      ].map(([cx, cy], i) => (
        <circle key={`rivet-${i}`} cx={cx} cy={cy} r=".25"
          fill="#94a3b8" opacity=".8" />
      ))}

      {/* ===================== FINAL RIM LIGHTS ===================== */}
      <path d="M8 17 L12 8.5 L18 7 L31.5 9.5"
        fill="none" stroke="#f8fafc" strokeOpacity=".4" strokeWidth=".55" />
      <path d="M31 10 L35 13.5 L37.5 16"
        fill="none" stroke="#f8fafc" strokeOpacity=".35" strokeWidth=".5" />
      <path d="M23 6.5 L26 5.5 L29 6"
        fill="none" stroke="#f8fafc" strokeOpacity=".6" strokeWidth=".5" />
      <path d="M28.5 6.8 L37 7.5"
        fill="none" stroke="#f8fafc" strokeOpacity=".5" strokeWidth=".4" />
    </g>
  );
}