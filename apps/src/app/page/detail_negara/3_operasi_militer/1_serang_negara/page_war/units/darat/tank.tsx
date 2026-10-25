import { useId } from "react";
import type { UnitIconProps } from "../unitIconProps";

export default function Tank({ color }: UnitIconProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const u = (n: string) => `tank-${uid}-${n}`;

  return (
    <g
      color={color ?? "#53674f"}
      strokeLinejoin="round"
      strokeLinecap="round"
    >
      <defs>
        {/* Shadow blur */}
        <filter
          id={u("soft")}
          x="-40%"
          y="-140%"
          width="180%"
          height="380%"
        >
          <feGaussianBlur stdDeviation="1.15" />
        </filter>

        {/* Hull gradients */}
        <linearGradient
          id={u("hullTop")}
          x1="0"
          y1="0"
          x2="0.6"
          y2="1"
        >
          <stop offset="0" stopColor="currentColor" stopOpacity="1" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.62" />
        </linearGradient>

        <linearGradient
          id={u("hullSide")}
          x1="0"
          y1="0"
          x2="0.12"
          y2="1"
        >
          <stop offset="0" stopColor="currentColor" stopOpacity="0.92" />
          <stop offset="0.42" stopColor="currentColor" stopOpacity="0.58" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.2" />
        </linearGradient>

        <linearGradient
          id={u("hullFront")}
          x1="0"
          y1="0"
          x2="1"
          y2="0.5"
        >
          <stop offset="0" stopColor="currentColor" stopOpacity="1" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.5" />
        </linearGradient>

        {/* Turret gradients */}
        <linearGradient
          id={u("turretTop")}
          x1="0"
          y1="0"
          x2="0.7"
          y2="1"
        >
          <stop offset="0" stopColor="currentColor" stopOpacity="1" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.68" />
        </linearGradient>

        <linearGradient
          id={u("turretSide")}
          x1="0"
          y1="0"
          x2="0.15"
          y2="1"
        >
          <stop offset="0" stopColor="currentColor" stopOpacity="0.85" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.22" />
        </linearGradient>

        <linearGradient
          id={u("turretFront")}
          x1="0"
          y1="0"
          x2="1"
          y2="0.4"
        >
          <stop offset="0" stopColor="currentColor" stopOpacity="0.95" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.48" />
        </linearGradient>

        {/* Gun barrel gradient */}
        <linearGradient
          id={u("barrel")}
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop offset="0" stopColor="currentColor" stopOpacity="1" />
          <stop offset="0.3" stopColor="currentColor" stopOpacity="0.82" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.32" />
        </linearGradient>

        {/* Track gradient */}
        <linearGradient
          id={u("track")}
          x1="0"
          y1="0"
          x2="0.15"
          y2="1"
        >
          <stop offset="0" stopColor="#1f2937" />
          <stop offset="0.45" stopColor="#0f172a" />
          <stop offset="1" stopColor="#020617" />
        </linearGradient>
      </defs>

      {/* Ground shadow */}
      <ellipse
        cx="23"
        cy="38.4"
        rx="18.5"
        ry="2.9"
        fill="#020617"
        opacity=".55"
        filter={`url(#${u("soft")})`}
      />

      {/* Hull: top plate */}
      <path
        d="M5 20.5 L28.5 20.5 L32.5 15 L9 15 Z"
        fill={`url(#${u("hullTop")})`}
        stroke="#020617"
        strokeOpacity=".5"
        strokeWidth=".55"
      />

      {/* Front glacis */}
      <path
        d="M28.5 20.5 L32.5 15 L36.5 22.5 L32.5 28 Z"
        fill={`url(#${u("hullFront")})`}
        stroke="#020617"
        strokeOpacity=".5"
        strokeWidth=".55"
      />

      {/* Side armour */}
      <path
        d="M5 20.5 L28.5 20.5 L32.5 28 L5 28 Z"
        fill={`url(#${u("hullSide")})`}
        stroke="#020617"
        strokeOpacity=".5"
        strokeWidth=".55"
      />

      {/* Engine deck grille */}
      <path
        d="M7.6 19.3 L15.4 19.3 L19.4 13.8 L11.6 13.8 Z"
        fill="#020617"
        opacity=".32"
      />

      {[0, 1, 2, 3].map((i) => (
        <path
          key={`grille-${i}`}
          d={`M${8.1 + i * 2.1} 19.1 L${12.1 + i * 2.1} 13.6`}
          stroke="#f8fafc"
          strokeOpacity=".3"
          strokeWidth=".5"
        />
      ))}

      {/* Hull side details */}
      <path
        d="M6 22.4 L27.6 22.4"
        stroke="#f8fafc"
        strokeOpacity=".18"
        strokeWidth=".6"
      />

      <path
        d="M5.6 26.5 L31.6 26.5"
        stroke="#020617"
        strokeOpacity=".45"
        strokeWidth=".6"
      />

      {/* Side stowage box */}
      <path
        d="M11 23.2 L18.5 23.2 L18.5 25.9 L11 25.9 Z"
        fill="currentColor"
        fillOpacity=".35"
        stroke="#020617"
        strokeOpacity=".45"
        strokeWidth=".5"
      />

      <path
        d="M11.6 24.3 L17.9 24.3"
        stroke="#f8fafc"
        strokeOpacity=".25"
        strokeWidth=".5"
      />

      {/* Side skirt ribs */}
      {[21, 24.4, 27.6].map((x) => (
        <path
          key={`rib-${x}`}
          d={`M${x} 22.6 L${x + 0.9} 27.2`}
          stroke="#020617"
          strokeOpacity=".3"
          strokeWidth=".5"
        />
      ))}

      {/* Front plate: driver's visor */}
      <path
        d="M29.7 19.4 L32.6 16.4 L33.1 17.4 L30.1 20.4 Z"
        fill="#020617"
        opacity=".55"
      />

      {/* Headlights */}
      <circle
        cx="32.2"
        cy="19.5"
        r=".72"
        fill="#f8fafc"
        fillOpacity=".85"
      />

      <circle
        cx="32.2"
        cy="19.5"
        r=".72"
        fill="none"
        stroke="#020617"
        strokeOpacity=".5"
        strokeWidth=".4"
      />

      <circle
        cx="33.6"
        cy="17.7"
        r=".72"
        fill="#f8fafc"
        fillOpacity=".85"
      />

      <circle
        cx="33.6"
        cy="17.7"
        r=".72"
        fill="none"
        stroke="#020617"
        strokeOpacity=".5"
        strokeWidth=".4"
      />

      {/* Tow hook */}
      <path
        d="M30.4 26.2 L31.6 25.2 L32.4 26.4"
        fill="none"
        stroke="#020617"
        strokeOpacity=".55"
        strokeWidth=".7"
      />

      {/* Track assembly */}
      <path
        d="M7 27.4 L30.5 26.6 Q34.2 26.4 35 30 L35.4 33 Q35.7 36.2 32.2 36.5 L8.6 37.3 Q4.6 37.5 4.4 33.6 L4.2 30.6 Q4.1 27.6 7 27.4 Z"
        fill={`url(#${u("track")})`}
        stroke="#020617"
        strokeOpacity=".7"
        strokeWidth=".55"
      />

      {/* Road wheels */}
      {[9.8, 15, 20.2, 25.4, 30.6].map((cx, i) => {
        const cy = 32.5 - i * 0.13;

        return (
          <g key={`wheel-${i}`}>
            <circle cx={cx} cy={cy} r="3" fill="#0b1220" />

            <circle
              cx={cx}
              cy={cy}
              r="3"
              fill="none"
              stroke="#334155"
              strokeOpacity=".7"
              strokeWidth=".55"
            />

            <circle
              cx={cx}
              cy={cy}
              r="1.35"
              fill="#1e293b"
            />

            <circle
              cx={cx}
              cy={cy}
              r=".5"
              fill="#475569"
            />
          </g>
        );
      })}

      {/* Track highlights */}
      <path
        d="M7.8 28.3 L30.3 27.5 Q32.6 27.4 33.3 29.5"
        fill="none"
        stroke="#64748b"
        strokeOpacity=".5"
        strokeWidth=".7"
      />

      <path
        d="M8.8 36.4 L32 35.6"
        stroke="#334155"
        strokeOpacity=".85"
        strokeWidth=".6"
      />

      {/* Turret: side */}
      <path
        d="M8 19.4 L26 19.4 L24.6 13.85 L10.2 13.85 Z"
        fill={`url(#${u("turretSide")})`}
        stroke="#020617"
        strokeOpacity=".5"
        strokeWidth=".55"
      />

      {/* Turret: front */}
      <path
        d="M26 19.4 L30 13.9 L27.8 9.45 L24.6 13.85 Z"
        fill={`url(#${u("turretFront")})`}
        stroke="#020617"
        strokeOpacity=".5"
        strokeWidth=".55"
      />

      {/* Turret: top */}
      <path
        d="M10.2 13.85 L24.6 13.85 L27.8 9.45 L13.4 9.45 Z"
        fill={`url(#${u("turretTop")})`}
        stroke="#020617"
        strokeOpacity=".5"
        strokeWidth=".55"
      />

      {/* Turret edge highlights */}
      <path
        d="M10.2 13.85 L24.6 13.85"
        stroke="#f8fafc"
        strokeOpacity=".5"
        strokeWidth=".65"
      />

      <path
        d="M24.6 13.85 L27.8 9.45"
        stroke="#f8fafc"
        strokeOpacity=".35"
        strokeWidth=".6"
      />

      {/* Commander cupola */}
      <path
        d="M14.4 12.1 L14.4 13.3 A2.6 1.7 0 0 0 19.6 13.3 L19.6 12.1 Z"
        fill="currentColor"
        fillOpacity=".45"
      />

      <ellipse
        cx="17"
        cy="12.1"
        rx="2.6"
        ry="1.7"
        fill="currentColor"
        fillOpacity=".82"
        stroke="#020617"
        strokeOpacity=".5"
        strokeWidth=".5"
      />

      <ellipse
        cx="17"
        cy="12.1"
        rx="1.15"
        ry=".72"
        fill="#020617"
        fillOpacity=".4"
      />

      {/* Roof hatch */}
      <path
        d="M20.6 12.6 L23.2 12.6 L24.4 10.9 L21.8 10.9 Z"
        fill="currentColor"
        fillOpacity=".5"
        stroke="#020617"
        strokeOpacity=".4"
        strokeWidth=".45"
      />

      {/* Turret side panel */}
      <path
        d="M9.3 18.2 L24.9 18.2"
        stroke="#020617"
        strokeOpacity=".35"
        strokeWidth=".5"
      />

      {/* Gun mantlet */}
      <rect
        x="25.8"
        y="11.8"
        width="3.6"
        height="4.9"
        rx="1.3"
        fill="currentColor"
        fillOpacity=".9"
        stroke="#020617"
        strokeOpacity=".55"
        strokeWidth=".5"
      />

      {/* Barrel */}
      <path
        d="M28 12.5 H41.2 V15.9 H28 Z"
        fill={`url(#${u("barrel")})`}
        stroke="#020617"
        strokeOpacity=".55"
        strokeWidth=".5"
      />

      {/* Bore evacuator */}
      <rect
        x="31.8"
        y="11.95"
        width="3.2"
        height="4.5"
        rx="1.15"
        fill="currentColor"
        fillOpacity=".82"
        stroke="#020617"
        strokeOpacity=".45"
        strokeWidth=".5"
      />

      {/* Muzzle brake */}
      <rect
        x="38.4"
        y="11.85"
        width="3.7"
        height="4.7"
        rx=".9"
        fill="currentColor"
        fillOpacity=".88"
        stroke="#020617"
        strokeOpacity=".6"
        strokeWidth=".5"
      />

      <path
        d="M39.4 12.4 V16"
        stroke="#020617"
        strokeOpacity=".45"
        strokeWidth=".5"
      />

      <path
        d="M40.8 12.4 V16"
        stroke="#020617"
        strokeOpacity=".45"
        strokeWidth=".5"
      />

      {/* Muzzle face */}
      <ellipse
        cx="42.1"
        cy="14.2"
        rx=".85"
        ry="1.6"
        fill="#020617"
        fillOpacity=".75"
        stroke="#f8fafc"
        strokeOpacity=".25"
        strokeWidth=".4"
      />

      {/* Barrel highlight */}
      <path
        d="M28.2 12.75 H38.2"
        stroke="#f8fafc"
        strokeOpacity=".4"
        strokeWidth=".55"
      />

      {/* Final rim light */}
      <path
        d="M5 20.5 L28.5 20.5 L32.5 15"
        fill="none"
        stroke="#f8fafc"
        strokeOpacity=".28"
        strokeWidth=".6"
      />
    </g>
  );
}