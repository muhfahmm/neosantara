import { useId } from "react";
import type { UnitIconProps } from "../unitIconProps";

export default function PertahananUdaraMobile({ color }: UnitIconProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const u = (n: string) => `pa-${uid}-${n}`;
  const baseColor = color ?? "#53674f";

  // 6 road wheels for a heavy tracked chassis
  const roadWheels = [12, 17, 22, 27, 32, 37];

  return (
    <g color={baseColor} strokeLinejoin="round" strokeLinecap="round">
      <defs>
        {/* ===================== FILTERS ===================== */}
        <filter id={u("soft")} x="-40%" y="-140%" width="180%" height="380%">
          <feGaussianBlur stdDeviation="1.25" />
        </filter>
        <filter id={u("soft2")} x="-40%" y="-140%" width="180%" height="380%">
          <feGaussianBlur stdDeviation="0.45" />
        </filter>

        {/* ===================== HULL & TURRET ===================== */}
        <linearGradient id={u("hullTop")} x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0" stopColor="currentColor" stopOpacity="1" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.62" />
        </linearGradient>
        <linearGradient id={u("hullSide")} x1="0" y1="0" x2="0.12" y2="1">
          <stop offset="0" stopColor="currentColor" stopOpacity="0.92" />
          <stop offset="0.42" stopColor="currentColor" stopOpacity="0.58" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.2" />
        </linearGradient>
        <linearGradient id={u("hullFront")} x1="0" y1="0" x2="1" y2="0.5">
          <stop offset="0" stopColor="currentColor" stopOpacity="1" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.5" />
        </linearGradient>
        
        <linearGradient id={u("turretTop")} x1="0" y1="0" x2="0.7" y2="1">
          <stop offset="0" stopColor="currentColor" stopOpacity="1" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.68" />
        </linearGradient>
        <linearGradient id={u("turretSide")} x1="0" y1="0" x2="0.15" y2="1">
          <stop offset="0" stopColor="currentColor" stopOpacity="0.85" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.22" />
        </linearGradient>
        <linearGradient id={u("turretFront")} x1="0" y1="0" x2="1" y2="0.4">
          <stop offset="0" stopColor="currentColor" stopOpacity="0.95" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.48" />
        </linearGradient>

        {/* ===================== RADAR & MISSILES ===================== */}
        <linearGradient id={u("radarFace")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6ee7f0" stopOpacity="0.8" />
          <stop offset="0.5" stopColor="#22d3ee" stopOpacity="0.5" />
          <stop offset="1" stopColor="#0e7490" stopOpacity="0.9" />
        </linearGradient>
        <linearGradient id={u("radarBack")} x1="0" y1="0" x2="0.5" y2="1">
          <stop offset="0" stopColor="#94a3b8" />
          <stop offset="1" stopColor="#1e293b" />
        </linearGradient>
        
        <linearGradient id={u("missilePod")} x1="0" y1="0" x2="0.8" y2="1">
          <stop offset="0" stopColor="currentColor" stopOpacity="0.9" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.4" />
        </linearGradient>
        <linearGradient id={u("missileTube")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#020617" />
          <stop offset="0.8" stopColor="#0f172a" />
          <stop offset="1" stopColor="#1e293b" />
        </linearGradient>

        {/* ===================== CHASSIS & WHEELS ===================== */}
        <linearGradient id={u("track")} x1="0" y1="0" x2="0.15" y2="1">
          <stop offset="0" stopColor="#1f2937" />
          <stop offset="0.45" stopColor="#0f172a" />
          <stop offset="1" stopColor="#020617" />
        </linearGradient>
        <radialGradient id={u("wheel")} cx="0.4" cy="0.4" r="0.7">
          <stop offset="0" stopColor="#475569" />
          <stop offset="0.7" stopColor="#1e293b" />
          <stop offset="1" stopColor="#020617" />
        </radialGradient>

        {/* ===================== OPTICS & LIGHTS ===================== */}
        <linearGradient id={u("lens")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#d5f7ef" />
          <stop offset="0.5" stopColor="#22d3ee" />
          <stop offset="1" stopColor="#0e7490" />
        </linearGradient>
        <radialGradient id={u("headlight")} cx="0.35" cy="0.35" r="0.75">
          <stop offset="0" stopColor="#fffbe6" />
          <stop offset="1" stopColor="#78350f" />
        </radialGradient>
        <linearGradient id={u("barrel")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#94a3b8" />
          <stop offset="0.5" stopColor="#475569" />
          <stop offset="1" stopColor="#020617" />
        </linearGradient>
      </defs>

      {/* ===================== GROUND SHADOW ===================== */}
      <ellipse cx="24" cy="29.5" rx="21" ry="2.8"
        fill="#020617" opacity=".55" filter={`url(#${u("soft")})`} />

      {/* ===================== TRACK ASSEMBLY ===================== */}
      <path d="M6 16.5 L40.5 14.8 Q43.6 14.6 43.9 17.8 L43.9 24 Q43.9 27.2 40.8 27.3 L9.2 30 Q5.2 30.1 5 26.4 L5 19.6 Q5 16.6 6 16.5 Z"
        fill={`url(#${u("track")})`} stroke="#020617" strokeOpacity=".7" strokeWidth=".55" />

      {/* Track tread pads — top run */}
      {Array.from({ length: 14 }).map((_, i) => (
        <rect key={`top-tread-${i}`} x={7.5 + i * 2.6} y={16.2 + Math.sin(i * 0.35) * 0.15}
          width="1.6" height="0.9" fill="#64748b" opacity=".55" />
      ))}

      {/* Track tread pads — bottom run */}
      {Array.from({ length: 14 }).map((_, i) => (
        <rect key={`bot-tread-${i}`} x={7.5 + i * 2.6} y={28 + Math.sin(i * 0.35) * 0.15}
          width="1.6" height="0.9" fill="#64748b" opacity=".5" />
      ))}

      {/* Track edge highlights */}
      <path d="M7 16.8 L40 15.2 Q42 15 42.3 17.5"
        stroke="#64748b" strokeOpacity=".55" strokeWidth=".6" fill="none" />
      <path d="M8 29.6 L39 27.3"
        stroke="#334155" strokeOpacity=".85" strokeWidth=".55" fill="none" />

      {/* ===================== ROAD WHEELS ===================== */}
      {roadWheels.map((cx, i) => {
        const cy = 22.5 - i * 0.05;
        return (
          <g key={`rw-${i}`}>
            <circle cx={cx} cy={cy} r="3.1" fill={`url(#${u("wheel")})`} />
            <circle cx={cx} cy={cy} r="3.1" fill="none" stroke="#020617" strokeWidth=".55" />
            <circle cx={cx} cy={cy} r="1.4" fill="#0f172a" />
            <circle cx={cx} cy={cy} r="0.55" fill="#94a3b8" />
            <circle cx={cx - 0.9} cy={cy - 0.9} r=".4" fill="#f8fafc" opacity=".4" />
          </g>
        );
      })}

      {/* ===================== LOWER HULL ===================== */}
      <path d="M6.5 17 L11.5 12.8 L31.5 13.2 L40 18.5 L42 21.3 L38.5 24.6 L9 24 L5.4 21.2 Z"
        fill={`url(#${u("hullSide")})`} stroke="#020617" strokeOpacity=".6" strokeWidth=".6" />

      {/* ===================== UPPER HULL ===================== */}
      <path d="M6.5 16.8 L12 10.5 L31.5 11.3 L40 16.5 L36 20.8 L11 20.2 Z"
        fill={`url(#${u("hullTop")})`} stroke="#020617" strokeOpacity=".55" strokeWidth=".6" />

      <path d="M8 16.5 L12.8 11.2 L30 11.9"
        stroke="#f8fafc" strokeOpacity=".35" strokeWidth=".5" fill="none" />

      {/* ===================== FRONT GLACIS ===================== */}
      <path d="M31.5 11.3 L40 16.5 L42.2 20.6 L37.5 21.4 L34 17.8 Z"
        fill={`url(#${u("hullFront")})`} stroke="#020617" strokeOpacity=".55" strokeWidth=".55" />
      <path d="M34 13 L40 17.2 L41.2 19.5 L38 18.7 Z" fill="#f8fafc" fillOpacity=".18" />

      {/* Driver Hatch */}
      <path d="M14 10.8 L18.5 10.9 L18 12.2 L13.5 12.1 Z"
        fill="currentColor" fillOpacity=".5" stroke="#020617" strokeOpacity=".45" strokeWidth=".4" />
      <path d="M15.5 11.5 L17 11.5"
        stroke="#020617" strokeOpacity=".5" strokeWidth=".35" />

      {/* ===================== TURRET BASE ===================== */}
      <path d="M15.8 13.2 L19 9.8 L31.5 10.4 L35.6 13.2 L31.8 15.8 L19 15.4 Z"
        fill="currentColor" fillOpacity=".35" stroke="#020617" strokeOpacity=".55" strokeWidth=".6" />
      <path d="M17.8 12.6 L20 11 L31.3 11.5 L33.4 13.1 L31.6 14.4 L20.8 13.9 Z"
        fill="currentColor" fillOpacity=".6" stroke="#020617" strokeOpacity=".5" strokeWidth=".4" />

      {/* ===================== MAIN TURRET ===================== */}
      <path d="M17.4 11.5 L21 7.8 L31.5 8.4 L35.5 11 L33 13.6 L21 13.2 Z"
        fill={`url(#${u("turretSide")})`} stroke="#020617" strokeOpacity=".55" strokeWidth=".6" />
      <path d="M31.5 8.4 L35.5 11 L37.5 13 L33.5 13.6 L33 13.6 Z"
        fill={`url(#${u("turretFront")})`} stroke="#020617" strokeOpacity=".55" strokeWidth=".55" />
      <path d="M21 7.8 L24 6.5 L32.5 7.8 L31.5 8.4 Z"
        fill={`url(#${u("turretTop")})`} stroke="#020617" strokeOpacity=".5" strokeWidth=".5" />

      <path d="M17.4 11.5 L31.5 8.4"
        stroke="#f8fafc" strokeOpacity=".42" strokeWidth=".55" fill="none" />
      <path d="M31.5 8.4 L35.5 11"
        stroke="#f8fafc" strokeOpacity=".32" strokeWidth=".5" fill="none" />

      {/* ===================== RADAR SYSTEM ===================== */}
      {/* Radar Pedestal / Pivot */}
      <path d="M24.5 7 L26.5 5.5 L29.5 5.8 L31 7 L29 8.5 L26 8.2 Z"
        fill="#475569" stroke="#020617" strokeWidth=".45" />
      <circle cx="27.8" cy="7" r="1.2" fill="#1e293b" stroke="#94a3b8" strokeWidth=".3" />

      {/* Rotating Radar Dish (3D perspective) */}
      <g transform="rotate(-15 27.8 7)">
        {/* Back of the dish */}
        <path d="M27.8 7 L27.8 2 L32.5 1 L32.5 6 Z"
          fill={`url(#${u("radarBack")})`} stroke="#020617" strokeWidth=".5" />
        {/* Front Face / Phased Array */}
        <path d="M27.8 7 L27.8 2 L23.5 1.5 L23.5 6.5 Z"
          fill={`url(#${u("radarFace")})`} stroke="#020617" strokeWidth=".5" />
        {/* Top Edge */}
        <path d="M23.5 1.5 L27.8 2 L32.5 1 L28.2 0.5 Z"
          fill="#94a3b8" stroke="#020617" strokeWidth=".4" />
          
        {/* Radar Grid Lines (Front) */}
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <path key={`rg-${i}`} d={`M${24 + i * 0.6} ${1.7 + i * 0.8} L${24 + i * 0.6} ${6.5 + i * 0.1}`}
            stroke="#f8fafc" strokeOpacity=".3" strokeWidth=".3" />
        ))}
        {[1, 2, 3].map((i) => (
          <path key={`rh-${i}`} d={`M23.5 ${2 + i * 1.2} L27.8 ${2.5 + i * 1.2}`}
            stroke="#f8fafc" strokeOpacity=".3" strokeWidth=".3" />
        ))}
        
        {/* Radar Highlight */}
        <path d="M23.5 1.5 L27.8 2" stroke="#f8fafc" strokeOpacity=".8" strokeWidth=".5" />
      </g>

      {/* ===================== MISSILE PODS ===================== */}
      {/* Left Pod */}
      <g transform="translate(15 9)">
        <path d="M0 2 L3 1 L4 6 L1 7 Z"
          fill={`url(#${u("missilePod")})`} stroke="#020617" strokeWidth=".45" />
        <path d="M1 2.2 L3.2 1.5 L3.8 5.5 L1.5 6.2 Z"
          fill={`url(#${u("missileTube")})`} stroke="#020617" strokeWidth=".3" />
        <ellipse cx="2.4" cy="3.8" rx="0.6" ry="1.2" fill="#020617" stroke="#475569" strokeWidth=".2" />
      </g>

      {/* Right Pod */}
      <g transform="translate(32.5 8.5)">
        <path d="M0 2 L3 1 L4 6 L1 7 Z"
          fill={`url(#${u("missilePod")})`} stroke="#020617" strokeWidth=".45" />
        <path d="M1 2.2 L3.2 1.5 L3.8 5.5 L1.5 6.2 Z"
          fill={`url(#${u("missileTube")})`} stroke="#020617" strokeWidth=".3" />
        <ellipse cx="2.4" cy="3.8" rx="0.6" ry="1.2" fill="#020617" stroke="#475569" strokeWidth=".2" />
      </g>

      {/* ===================== TWIN AUTO-CANNONS ===================== */}
      {/* Gun Mount */}
      <path d="M30.5 11 L33.5 10.5 L35 12 L32 12.5 Z"
        fill="currentColor" fillOpacity=".9" stroke="#020617" strokeWidth=".5" />

      {/* Upper Barrel */}
      <path d="M32.5 11 L43.8 11.2 L43.8 11.8 L32.5 11.8 Z"
        fill={`url(#${u("barrel")})`} stroke="#020617" strokeWidth=".4" />
      <rect x="42.8" y="10.9" width="1.5" height="1.2" rx=".2"
        fill="#1e293b" stroke="#020617" strokeWidth=".3" />
      <path d="M33.5 11.1 L42 11.3" stroke="#f8fafc" strokeOpacity=".5" strokeWidth=".3" />

      {/* Lower Barrel */}
      <path d="M32.5 11.8 L43.8 12.2 L43.8 12.8 L32.5 12.5 Z"
        fill={`url(#${u("barrel")})`} stroke="#020617" strokeWidth=".4" />
      <rect x="42.8" y="11.9" width="1.5" height="1.2" rx=".2"
        fill="#1e293b" stroke="#020617" strokeWidth=".3" />
      <path d="M33.5 12 L42 12.3" stroke="#f8fafc" strokeOpacity=".4" strokeWidth=".3" />

      {/* Ammo Feed / Box */}
      <path d="M28.5 10.5 L31 10 L31.5 12.5 L29 13 Z"
        fill="currentColor" fillOpacity=".6" stroke="#020617" strokeWidth=".4" />

      {/* ===================== OPTICS & SENSORS ===================== */}
      <path d="M20.5 7 L22.5 6.8 L22.5 8.5 L20.5 8.7 Z"
        fill={`url(#${u("lens")})`} stroke="#020617" strokeWidth=".4" />
      <circle cx="21.5" cy="7.7" r="0.35" fill="#f8fafc" opacity=".8" />

      {/* Laser Range Finder */}
      <rect x="19" y="8.5" width="1" height="1.2" rx=".2"
        fill="#1e293b" stroke="#020617" strokeWidth=".3" />
      <circle cx="19.5" cy="9" r="0.2" fill="#22d3ee" />

      {/* ===================== ANTENNA & COMMS ===================== */}
      <path d="M22 6.5 L21.5 3"
        stroke="#0f172a" strokeWidth=".5" />
      <circle cx="21.5" cy="3" r="0.35" fill="#94a3b8" />
      <circle cx="21.5" cy="3" r="0.15" fill="#f8fafc" opacity=".7" />

      <path d="M34 9 L33.5 5.5"
        stroke="#0f172a" strokeWidth=".4" />
      <circle cx="33.5" cy="5.5" r="0.25" fill="#94a3b8" />

      {/* ===================== HEADLIGHTS ===================== */}
      <ellipse cx="39.6" cy="18.6" rx="1.1" ry="0.85"
        fill={`url(#${u("headlight")})`} stroke="#020617" strokeOpacity=".6" strokeWidth=".4" />
      <ellipse cx="39.6" cy="18.6" rx="0.6" ry="0.5" fill="#fffbe6" opacity=".9" />
      <ellipse cx="38.1" cy="18.8" rx="0.7" ry="0.55"
        fill="#a4c3b6" opacity=".85" stroke="#020617" strokeOpacity=".5" strokeWidth=".35" />

      {/* ===================== SIDE SKIRT & ARMOR ===================== */}
      <path d="M10.5 20.5 L36.5 19.8 L36.4 23 L10.5 23.5 Z"
        fill="currentColor" fillOpacity=".4" stroke="#020617" strokeOpacity=".55" strokeWidth=".5" />
      
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <path key={`rea-${i}`} d={`M${12 + i * 3.5} 20.6 L${14.7 + i * 3.5} 20.55 L${14.6 + i * 3.5} 22.6 L${11.9 + i * 3.5} 22.65 Z`}
          fill="currentColor" fillOpacity=".4" stroke="#020617" strokeOpacity=".5" strokeWidth=".4" />
      ))}

      {/* ===================== BOLTS & RIVETS ===================== */}
      {[
        [12, 15.8], [17, 16], [22, 16.2], [27, 16.4], [32, 16.6], [35, 16.8],
        [12.5, 21.2], [20, 21.5], [28, 21.7], [34, 21.8],
        [22, 8], [30.5, 8.5],
      ].map(([cx, cy], i) => (
        <circle key={`bolt-${i}`} cx={cx} cy={cy} r=".24"
          fill="#94a3b8" opacity=".7" />
      ))}

      {/* ===================== FINAL RIM LIGHTS ===================== */}
      <path d="M6.5 16.8 L12 10.5 L31.5 11.3 L40 16.5"
        fill="none" stroke="#f8fafc" strokeOpacity=".32" strokeWidth=".55" />
      <path d="M17.4 11.5 L21 7.8 L31.5 8.4 L35.5 11"
        fill="none" stroke="#f8fafc" strokeOpacity=".28" strokeWidth=".5" />
      <path d="M23.5 1.5 L27.8 2 L32.5 1"
        fill="none" stroke="#f8fafc" strokeOpacity=".6" strokeWidth=".5" />
    </g>
  );
}