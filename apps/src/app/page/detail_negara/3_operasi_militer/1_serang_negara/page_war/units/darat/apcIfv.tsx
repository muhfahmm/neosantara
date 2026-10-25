import { useId } from "react";
import type { UnitIconProps } from "../unitIconProps";

export default function ApcIfv({ color }: UnitIconProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const u = (n: string) => `apc-${uid}-${n}`;
  const baseColor = color ?? "#53674f";

  // 6 road wheels between idler & drive sprocket
  const roadWheels = [12, 17.5, 23, 28.5, 34, 39];

  return (
    <g color={baseColor} strokeLinejoin="round" strokeLinecap="round">
      <defs>
        {/* ===================== FILTERS ===================== */}
        <filter id={u("soft")} x="-40%" y="-140%" width="180%" height="380%">
          <feGaussianBlur stdDeviation="1.35" />
        </filter>
        <filter id={u("soft2")} x="-40%" y="-140%" width="180%" height="380%">
          <feGaussianBlur stdDeviation="0.55" />
        </filter>

        {/* ===================== HULL ===================== */}
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

        {/* ===================== TURRET ===================== */}
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

        {/* ===================== BARREL & TRACK ===================== */}
        <linearGradient id={u("barrel")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="currentColor" stopOpacity="1" />
          <stop offset="0.3" stopColor="currentColor" stopOpacity="0.82" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.32" />
        </linearGradient>
        <linearGradient id={u("track")} x1="0" y1="0" x2="0.15" y2="1">
          <stop offset="0" stopColor="#1f2937" />
          <stop offset="0.45" stopColor="#0f172a" />
          <stop offset="1" stopColor="#020617" />
        </linearGradient>

        {/* ===================== SKIRT & GLASS ===================== */}
        <linearGradient id={u("skirt")} x1="0" y1="0" x2="0.2" y2="1">
          <stop offset="0" stopColor="currentColor" stopOpacity="0.72" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.28" />
        </linearGradient>
        <linearGradient id={u("glass")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6ee7f0" />
          <stop offset="0.5" stopColor="#22d3ee" />
          <stop offset="1" stopColor="#0e7490" />
        </linearGradient>

        {/* ===================== LIGHTS & MARKINGS ===================== */}
        <radialGradient id={u("headlight")} cx="0.35" cy="0.35" r="0.75">
          <stop offset="0" stopColor="#fffbe6" />
          <stop offset="0.55" stopColor="#fde68a" />
          <stop offset="1" stopColor="#78350f" />
        </radialGradient>
        <linearGradient id={u("marking")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e5e0b8" />
          <stop offset="1" stopColor="#a8a178" />
        </linearGradient>
        <linearGradient id={u("taillight")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fecaca" />
          <stop offset="1" stopColor="#7f1d1d" />
        </linearGradient>
      </defs>

      {/* ===================== GROUND SHADOW ===================== */}
      <ellipse cx="24" cy="28.3" rx="21" ry="2.8"
        fill="#020617" opacity=".55"
        filter={`url(#${u("soft")})`} />

      {/* ===================== TRACK ASSEMBLY ===================== */}
      <path d="M6 14.6 L40.5 12.8 Q43.6 12.6 43.9 15.8 L43.9 21.8 Q43.9 25 40.8 25.1 L9.2 27.8 Q5.2 27.9 5 24.2 L5 17.6 Q5 14.6 6 14.6 Z"
        fill={`url(#${u("track")})`}
        stroke="#020617" strokeOpacity=".7" strokeWidth=".55" />

      {/* Track tread pads — top run */}
      {Array.from({ length: 14 }).map((_, i) => (
        <rect key={`top-tread-${i}`}
          x={7.5 + i * 2.6}
          y={14.3 + Math.sin(i * 0.35) * 0.15}
          width="1.6" height="0.9"
          fill="#64748b" opacity=".55" />
      ))}

      {/* Track tread pads — bottom run */}
      {Array.from({ length: 14 }).map((_, i) => (
        <rect key={`bot-tread-${i}`}
          x={7.5 + i * 2.6}
          y={25.8 + Math.sin(i * 0.35) * 0.15}
          width="1.6" height="0.9"
          fill="#64748b" opacity=".5" />
      ))}

      {/* Track edge highlights */}
      <path d="M7 14.9 L40 13.2 Q42 13 42.3 15.5"
        stroke="#64748b" strokeOpacity=".55" strokeWidth=".6" fill="none" />
      <path d="M8 27.4 L39 25.1"
        stroke="#334155" strokeOpacity=".85" strokeWidth=".55" fill="none" />

      {/* Idler & drive sprocket hint */}
      <circle cx="41" cy="19.2" r="3.6"
        fill="none" stroke="#475569" strokeOpacity=".4" strokeWidth=".5" />
      <circle cx="7.5" cy="21.4" r="3.6"
        fill="none" stroke="#475569" strokeOpacity=".4" strokeWidth=".5" />

      {/* ===================== ROAD WHEELS ===================== */}
      {roadWheels.map((cx, i) => {
        const cy = 21.9 - i * 0.05;
        return (
          <g key={`rw-${i}`}>
            <circle cx={cx} cy={cy} r="3.1" fill="#0b1220" />
            <circle cx={cx} cy={cy} r="3.1" fill="none"
              stroke="#334155" strokeOpacity=".7" strokeWidth=".55" />
            <circle cx={cx} cy={cy} r="1.4" fill="#1e293b" />
            <circle cx={cx} cy={cy} r="0.55" fill="#475569" />
            <circle cx={cx - 0.9} cy={cy - 0.9} r=".4"
              fill="#94a3b8" opacity=".55" />
          </g>
        );
      })}

      {/* ===================== SUSPENSION ARMS ===================== */}
      {roadWheels.slice(0, 5).map((cx, i) => (
        <path key={`susp-${i}`}
          d={`M${cx} 18.5 L${cx + 2} 17.5`}
          stroke="#1e293b" strokeWidth=".55" opacity=".7" />
      ))}

      {/* ===================== LOWER HULL ===================== */}
      <path d="M6.5 15 L11.5 10.8 L31.5 11.2 L40 16.5 L42 19.3 L38.5 22.6 L9 22 L5.4 19.2 Z"
        fill={`url(#${u("hullSide")})`}
        stroke="#020617" strokeOpacity=".6" strokeWidth=".6" />

      {/* ===================== SIDE SKIRT + REACTIVE ARMOR ===================== */}
      <path d="M10.5 18.5 L36.5 17.8 L36.4 21 L10.5 21.5 Z"
        fill={`url(#${u("skirt")})`}
        stroke="#020617" strokeOpacity=".55" strokeWidth=".5" />

      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <path key={`rea-${i}`}
          d={`M${12 + i * 3.5} 18.6 L${14.7 + i * 3.5} 18.55 L${14.6 + i * 3.5} 20.6 L${11.9 + i * 3.5} 20.65 Z`}
          fill="currentColor" fillOpacity="0.4"
          stroke="#020617" strokeOpacity=".5" strokeWidth=".4" />
      ))}

      <path d="M11 18.7 L36 18"
        stroke="#f8fafc" strokeOpacity=".28" strokeWidth=".5" />

      {/* ===================== UPPER HULL ===================== */}
      <path d="M6.5 14.8 L12 8.5 L31.5 9.3 L40 14.5 L36 18.8 L11 18.2 Z"
        fill={`url(#${u("hullTop")})`}
        stroke="#020617" strokeOpacity=".55" strokeWidth=".6" />

      <path d="M8 14.5 L12.8 9.2 L30 9.9"
        stroke="#f8fafc" strokeOpacity=".35" strokeWidth=".5" fill="none" />

      {/* ===================== FRONT GLACIS ===================== */}
      <path d="M31.5 9.3 L40 14.5 L42.2 18.6 L37.5 19.4 L34 15.8 Z"
        fill={`url(#${u("hullFront")})`}
        stroke="#020617" strokeOpacity=".55" strokeWidth=".55" />
      <path d="M34 11 L40 15.2 L41.2 17.5 L38 16.7 Z"
        fill="#f8fafc" fillOpacity=".18" />

      {/* ===================== VISION BLOCKS ===================== */}
      <path d="M11.5 10.4 L15 10.5 L14.7 12.3 L11.2 12.1 Z"
        fill={`url(#${u("glass")})`}
        stroke="#020617" strokeOpacity=".5" strokeWidth=".45" />
      <path d="M12 10.9 L13.8 11"
        stroke="#f8fafc" strokeOpacity=".7" strokeWidth=".45" />
      <path d="M16 10.6 L17.8 10.7 L17.5 12.2 L15.8 12 Z"
        fill={`url(#${u("glass")})`}
        stroke="#020617" strokeOpacity=".5" strokeWidth=".4" />

      {/* Driver hatch */}
      <path d="M14.5 8.8 L19.5 8.9 L19 10.3 L14 10.2 Z"
        fill="currentColor" fillOpacity=".5"
        stroke="#020617" strokeOpacity=".45" strokeWidth=".4" />

      {/* ===================== SIDE ACCESS PANEL ===================== */}
      <path d="M17.5 14.2 L23.8 14.5 L23.5 17.4 L17.3 17.1 Z"
        fill="currentColor" fillOpacity=".35"
        stroke="#020617" strokeOpacity=".5" strokeWidth=".5" />
      <path d="M18.5 14.9 L18.4 16.5 M23 15.1 L22.9 16.8"
        stroke="#020617" strokeOpacity=".55" strokeWidth=".45" />
      <path d="M20 15.7 L20.7 15.7"
        stroke="#94a3b8" strokeOpacity=".7" strokeWidth=".4" />

      {/* ===================== TURRET BASE RING ===================== */}
      <path d="M16.8 10.6 L20 7.4 L30.5 8 L34.6 10.7 L30.8 13 L20 12.6 Z"
        fill="currentColor" fillOpacity=".35"
        stroke="#020617" strokeOpacity=".55" strokeWidth=".6" />
      <path d="M18.8 10 L21 8.4 L30.3 8.9 L32.4 10.5 L30.6 11.8 L20.8 11.3 Z"
        fill="currentColor" fillOpacity=".6"
        stroke="#020617" strokeOpacity=".5" strokeWidth=".4" />

      {/* ===================== MAIN TURRET ===================== */}
      <path d="M18.4 8.9 L21.8 5.5 L30.5 6.1 L34 8.5 L31.8 11 L21.8 10.6 Z"
        fill={`url(#${u("turretSide")})`}
        stroke="#020617" strokeOpacity=".55" strokeWidth=".6" />
      <path d="M30.5 6.1 L34 8.5 L35.4 10.3 L32.2 11 L31.8 11 Z"
        fill={`url(#${u("turretFront")})`}
        stroke="#020617" strokeOpacity=".55" strokeWidth=".55" />
      <path d="M21.8 5.5 L24.3 4.4 L31.5 5.6 L30.5 6.1 Z"
        fill={`url(#${u("turretTop")})`}
        stroke="#020617" strokeOpacity=".5" strokeWidth=".5" />

      <path d="M18.4 8.9 L30.5 6.1"
        stroke="#f8fafc" strokeOpacity=".42" strokeWidth=".55" fill="none" />
      <path d="M30.5 6.1 L34 8.5"
        stroke="#f8fafc" strokeOpacity=".32" strokeWidth=".5" fill="none" />
      <path d="M21.8 5.5 L24.3 4.4"
        stroke="#f8fafc" strokeOpacity=".45" strokeWidth=".5" fill="none" />

      {/* ===================== COMMANDER CUPOLA ===================== */}
      <path d="M22.8 5.9 L25 4.7 L28.6 5.3 L26.4 6.7 Z"
        fill="currentColor" fillOpacity=".55"
        stroke="#020617" strokeOpacity=".5" strokeWidth=".45" />
      <ellipse cx="25.7" cy="5.7" rx="1.9" ry="0.75"
        fill="currentColor" fillOpacity=".82"
        stroke="#020617" strokeOpacity=".5" strokeWidth=".5" />
      <ellipse cx="25.7" cy="5.7" rx=".8" ry=".32"
        fill="#020617" fillOpacity=".45" />
      <path d="M24 5.4 L27.4 5.4"
        stroke="#f8fafc" strokeOpacity=".5" strokeWidth=".45" />

      {/* Panoramic sight on cupola */}
      <rect x="23.2" y="3.9" width="1.8" height="1.1" rx=".3"
        fill="currentColor" fillOpacity=".65"
        stroke="#020617" strokeOpacity=".5" strokeWidth=".4" />
      <rect x="23.5" y="4.1" width="1.2" height=".55" rx=".15"
        fill={`url(#${u("glass")})`} opacity=".9" />

      {/* ===================== SMOKE DISCHARGERS ===================== */}
      {[0, 1, 2].map((i) => (
        <circle key={`smoke-${i}`}
          cx={19 + i * 0.9} cy={8.4} r=".55"
          fill="currentColor" fillOpacity=".7"
          stroke="#020617" strokeOpacity=".55" strokeWidth=".3" />
      ))}

      {/* ===================== ATGM LAUNCHER ===================== */}
      <path d="M27.5 7.2 L33.5 7.6 L33.4 9.4 L27.4 9 Z"
        fill="currentColor" fillOpacity=".55"
        stroke="#020617" strokeOpacity=".5" strokeWidth=".45" />
      <path d="M28 7.5 L28 9 M28.6 7.6 L28.6 9.1 M29.2 7.6 L29.2 9.1"
        stroke="#020617" strokeOpacity=".6" strokeWidth=".35" />
      <circle cx="33" cy="8.5" r="0.6"
        fill="#020617" fillOpacity=".7"
        stroke="#f8fafc" strokeOpacity=".25" strokeWidth=".3" />

      {/* ===================== GUN MANTLET ===================== */}
      <path d="M30.4 8.4 L34 8.8 L35 10.4 L32.8 11.1 L30.2 10.2 Z"
        fill="currentColor" fillOpacity=".9"
        stroke="#020617" strokeOpacity=".55" strokeWidth=".5" />

      {/* ===================== AUTO-CANNON BARREL ===================== */}
      <path d="M33.4 9.1 L43.8 10.4 L43.8 11.8 L33.3 10.9 Z"
        fill={`url(#${u("barrel")})`}
        stroke="#020617" strokeOpacity=".55" strokeWidth=".55" />

      {[35, 37, 39, 41].map((cx, i) => (
        <path key={`sleeve-${i}`}
          d={`M${cx} 9.3 L${cx + 0.4} 9.35 L${cx + 0.4} 11.2 L${cx} 11.15 Z`}
          fill="currentColor" fillOpacity=".75"
          stroke="#020617" strokeOpacity=".5" strokeWidth=".35" />
      ))}

      <path d="M34 9.5 L43 10.6"
        stroke="#f8fafc" strokeOpacity=".4" strokeWidth=".5" />

      {/* Muzzle brake */}
      <rect x="43" y="10.1" width="2.2" height="1.8" rx=".5"
        fill="currentColor" fillOpacity=".85"
        stroke="#020617" strokeOpacity=".6" strokeWidth=".45" />
      <path d="M43.6 10.4 L43.6 11.7 M44.4 10.4 L44.4 11.7"
        stroke="#020617" strokeOpacity=".55" strokeWidth=".4" />
      <ellipse cx="45.1" cy="11.1" rx=".35" ry=".75"
        fill="#020617" fillOpacity=".8"
        stroke="#f8fafc" strokeOpacity=".25" strokeWidth=".3" />

      {/* ===================== COAXIAL MG ===================== */}
      <path d="M31.2 10.3 L34.6 10.6 L34.6 11.1 L31.2 10.9 Z"
        fill="#020617" opacity=".75" />
      <circle cx="34.6" cy="10.85" r="0.25" fill="#1e293b" />

      {/* ===================== OPTICS / SENSORS ===================== */}
      <path d="M29 7.3 L31.4 7.7 L30.9 9 L28.5 8.7 Z"
        fill={`url(#${u("glass")})`}
        stroke="#020617" strokeOpacity=".5" strokeWidth=".45" />
      <circle cx="30" cy="8.1" r="0.35" fill="#d5f7ef" />

      {/* Laser warning receiver */}
      <rect x="20.5" y="6.5" width="1" height="1" rx=".2"
        fill="currentColor" fillOpacity=".7"
        stroke="#020617" strokeOpacity=".5" strokeWidth=".3" />
      <circle cx="21" cy="7" r="0.28" fill="#22d3ee" opacity=".85" />

      {/* ===================== ANTENNA ===================== */}
      <path d="M21.2 5.7 L20.7 2.6"
        stroke="#0f172a" strokeWidth=".5" />
      <circle cx="20.7" cy="2.6" r="0.35" fill="#94a3b8" />
      <circle cx="20.7" cy="2.6" r="0.15" fill="#f8fafc" opacity=".7" />
      <path d="M20.6 5.6 L21.6 5.7 L21.5 6.3 L20.5 6.2 Z"
        fill="currentColor" fillOpacity=".6"
        stroke="#020617" strokeOpacity=".5" strokeWidth=".3" />

      {/* ===================== HEADLIGHTS ===================== */}
      <ellipse cx="39.6" cy="16.6" rx="1.1" ry="0.85"
        fill={`url(#${u("headlight")})`}
        stroke="#020617" strokeOpacity=".6" strokeWidth=".4" />
      <ellipse cx="39.6" cy="16.6" rx="0.6" ry="0.5"
        fill="#fffbe6" opacity=".9" />
      <ellipse cx="38.1" cy="16.8" rx="0.7" ry="0.55"
        fill="#a4c3b6" opacity=".85"
        stroke="#020617" strokeOpacity=".5" strokeWidth=".35" />
      <path d="M38.5 16 L40.8 16.2 M38.5 17.2 L40.8 17.4"
        stroke="#020617" strokeOpacity=".5" strokeWidth=".4" />

      {/* ===================== TAILLIGHT ===================== */}
      <ellipse cx="7.5" cy="16.3" rx="0.8" ry="0.6"
        fill={`url(#${u("taillight")})`}
        stroke="#020617" strokeOpacity=".5" strokeWidth=".35" />

      {/* ===================== FRONT GRILLE ===================== */}
      {[0, 1, 2, 3].map((i) => (
        <path key={`grille-${i}`}
          d={`M${37.5 + i * 0.7} 15.2 L${38.5 + i * 0.7} 16.2`}
          stroke="#020617" strokeOpacity=".6" strokeWidth=".35" />
      ))}

      {/* ===================== TOW HOOKS ===================== */}
      <path d="M38.5 19.2 L39.5 18.4 L40.2 19.5"
        fill="none" stroke="#020617" strokeOpacity=".7" strokeWidth=".55" />
      <path d="M8.5 20.8 L7.5 20 L6.8 21"
        fill="none" stroke="#020617" strokeOpacity=".7" strokeWidth=".55" />

      {/* ===================== STOWAGE BOX ===================== */}
      <path d="M25 15.2 L29.5 15.4 L29.4 17.6 L24.9 17.4 Z"
        fill="currentColor" fillOpacity=".45"
        stroke="#020617" strokeOpacity=".5" strokeWidth=".5" />
      <path d="M25.5 15.5 L25.5 17.3 M28.8 15.6 L28.8 17.5"
        stroke="#020617" strokeOpacity=".5" strokeWidth=".35" />

      {/* ===================== CAMO NETTING ===================== */}
      <path d="M9.5 12.8 Q10.5 11.5 11.8 11.4 L12.2 12.8 Z"
        fill="currentColor" fillOpacity=".55"
        stroke="#020617" strokeOpacity=".4" strokeWidth=".3" />
      <path d="M10 12.1 L11.5 12"
        stroke="#f8fafc" strokeOpacity=".3" strokeWidth=".3" />

      {/* ===================== BOLTS & RIVETS ===================== */}
      {[
        [12, 13.8], [17, 14], [22, 14.2], [27, 14.4], [32, 14.6], [35, 14.8],
        [12.5, 19.2], [20, 19.5], [28, 19.7], [34, 19.8],
        [20, 6.8], [27.5, 7], [30.5, 7.1],
      ].map(([cx, cy], i) => (
        <circle key={`bolt-${i}`} cx={cx} cy={cy} r=".24"
          fill="#94a3b8" opacity=".7" />
      ))}

      {/* ===================== TACTICAL MARKING ===================== */}
      <path d="M15.5 15.3 L20.5 15.6 L20.3 16.8 L15.3 16.5 Z"
        fill={`url(#${u("marking")})`} opacity=".85" />

      {/* ===================== PANEL LINES ===================== */}
      <path d="M11 11.8 L11 15.5 M35 15 L35 18.2 M22.8 10.6 L22.8 14.2"
        stroke="#020617" strokeOpacity=".35" strokeWidth=".4" />
      <path d="M8 15.5 L38 15.5 M9 17.8 L36.5 17.4"
        stroke="#020617" strokeOpacity=".25" strokeWidth=".4" />

      {/* ===================== FINAL RIM LIGHTS ===================== */}
      <path d="M6.5 14.8 L12 8.5 L31.5 9.3 L40 14.5"
        fill="none" stroke="#f8fafc" strokeOpacity=".32" strokeWidth=".55" />
      <path d="M18.4 8.9 L21.8 5.5 L30.5 6.1 L34 8.5"
        fill="none" stroke="#f8fafc" strokeOpacity=".28" strokeWidth=".5" />
      <path d="M33.5 9.2 L43.5 10.4"
        fill="none" stroke="#f8fafc" strokeOpacity=".35" strokeWidth=".45" />
    </g>
  );
}