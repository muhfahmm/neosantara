import { useId } from "react";
import type { UnitIconProps } from "../unitIconProps";

export default function ArtileriBerat({ color }: UnitIconProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const u = (n: string) => `arty-${uid}-${n}`;

  return (
    <g
      color={color ?? "#53674f"}
      strokeLinejoin="round"
      strokeLinecap="round"
    >
      <defs>
        {/* Soft shadow blur */}
        <filter
          id={u("blur")}
          x="-50%"
          y="-150%"
          width="200%"
          height="400%"
        >
          <feGaussianBlur stdDeviation="1.2" />
        </filter>

        {/* Gun shield */}
        <linearGradient
          id={u("shield")}
          x1="0.1"
          y1="0"
          x2="0.7"
          y2="1"
        >
          <stop offset="0" stopColor="currentColor" stopOpacity="1" />
          <stop offset="0.55" stopColor="currentColor" stopOpacity="0.76" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.48" />
        </linearGradient>

        <linearGradient
          id={u("shieldEdge")}
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop offset="0" stopColor="currentColor" stopOpacity="0.52" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.14" />
        </linearGradient>

        {/* Barrel gradient */}
        <linearGradient
          id={u("barrel")}
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop offset="0" stopColor="currentColor" stopOpacity="0.62" />
          <stop offset="0.22" stopColor="currentColor" stopOpacity="1" />
          <stop offset="0.62" stopColor="currentColor" stopOpacity="0.8" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.3" />
        </linearGradient>

        {/* Near trail */}
        <linearGradient
          id={u("trail")}
          x1="0"
          y1="0"
          x2="0.2"
          y2="1"
        >
          <stop offset="0" stopColor="currentColor" stopOpacity="0.96" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.36" />
        </linearGradient>

        {/* Far trail */}
        <linearGradient
          id={u("trailFar")}
          x1="0"
          y1="0"
          x2="0.2"
          y2="1"
        >
          <stop offset="0" stopColor="currentColor" stopOpacity="0.52" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.18" />
        </linearGradient>

        {/* Wheel tire */}
        <radialGradient
          id={u("tire")}
          cx="0.36"
          cy="0.3"
          r="0.86"
        >
          <stop offset="0" stopColor="#334155" />
          <stop offset="0.58" stopColor="#111827" />
          <stop offset="1" stopColor="#020617" />
        </radialGradient>

        {/* Wheel rim */}
        <linearGradient
          id={u("rim")}
          x1="0.1"
          y1="0"
          x2="0.5"
          y2="1"
        >
          <stop offset="0" stopColor="currentColor" stopOpacity="0.98" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.44" />
        </linearGradient>
      </defs>

      {/* Ground shadow */}
      <ellipse
        cx="24"
        cy="40.6"
        rx="18.8"
        ry="2.9"
        fill="#020617"
        opacity=".5"
        filter={`url(#${u("blur")})`}
      />

      {/* Far trail */}
      <path
        d="M27.4 27.9 L6.4 33.5 L7.2 35.5 L28.0 30.1 Z"
        fill={`url(#${u("trailFar")})`}
        stroke="#020617"
        strokeOpacity=".4"
        strokeWidth=".5"
      />

      {/* Far spade */}
      <path
        d="M7.0 32.9 L5.2 33.9 L5.0 36.3 L6.9 35.2 Z"
        fill={`url(#${u("trailFar")})`}
        stroke="#020617"
        strokeOpacity=".45"
        strokeWidth=".5"
      />

      {/* Far wheel shadow */}
      <ellipse
        cx="15.4"
        cy="38.8"
        rx="4.3"
        ry=".9"
        fill="#020617"
        opacity=".3"
      />

      {/* Far wheel */}
      <g>
        <circle
          cx="15.4"
          cy="33.9"
          r="4.9"
          fill={`url(#${u("tire")})`}
          stroke="#020617"
          strokeOpacity=".6"
          strokeWidth=".5"
        />

        <circle
          cx="15.4"
          cy="33.9"
          r="4.9"
          fill="none"
          stroke="#020617"
          strokeOpacity=".42"
          strokeWidth=".5"
          strokeDasharray="1.2 1.4"
        />

        <circle
          cx="15.4"
          cy="33.9"
          r="3"
          fill={`url(#${u("rim")})`}
          opacity=".62"
        />

        <circle
          cx="15.4"
          cy="33.9"
          r="1.15"
          fill="#0b1220"
        />

        <circle
          cx="15.4"
          cy="33.9"
          r=".45"
          fill="#94a3b8"
          opacity=".65"
        />
      </g>

      {/* Near trail */}
      <path
        d="M28.4 29.4 L9.2 36.4 L10.1 38.8 L29.3 32.0 Z"
        fill={`url(#${u("trail")})`}
        stroke="#020617"
        strokeOpacity=".55"
        strokeWidth=".5"
      />

      <path
        d="M28.3 29.9 L9.5 36.9"
        fill="none"
        stroke="#f8fafc"
        strokeOpacity=".3"
        strokeWidth=".55"
      />

      {/* Near spade */}
      <path
        d="M9.9 35.9 L8.1 37.0 L7.9 39.6 L9.8 38.5 Z"
        fill={`url(#${u("trail")})`}
        stroke="#020617"
        strokeOpacity=".55"
        strokeWidth=".5"
      />

      <path
        d="M9.8 36.2 L8.3 37.2"
        stroke="#f8fafc"
        strokeOpacity=".25"
        strokeWidth=".5"
        fill="none"
      />

      {/* Gun shield: rear edge */}
      <path
        d="M19.6 14.9 L18.4 15.9 L17.7 26.5 L18.9 25.5 Z"
        fill={`url(#${u("shieldEdge")})`}
        stroke="#020617"
        strokeOpacity=".45"
        strokeWidth=".5"
      />

      {/* Gun shield: front face */}
      <path
        d="M19.6 14.9 L27.0 18.6 L26.3 28.7 L18.9 25.5 Z"
        fill={`url(#${u("shield")})`}
        stroke="#020617"
        strokeOpacity=".5"
        strokeWidth=".55"
      />

      {/* Top bevel highlight */}
      <path
        d="M19.6 14.9 L27.0 18.6"
        fill="none"
        stroke="#f8fafc"
        strokeOpacity=".48"
        strokeWidth=".62"
      />

      {/* Horizontal crease */}
      <path
        d="M19.1 20.6 L26.6 24.0"
        fill="none"
        stroke="#020617"
        strokeOpacity=".3"
        strokeWidth=".5"
      />

      {/* Raised centre panel */}
      <path
        d="M20.9 17.6 L25.6 20.3 L25.2 25.6 L20.4 22.7 Z"
        fill="currentColor"
        fillOpacity=".24"
        stroke="#020617"
        strokeOpacity=".28"
        strokeWidth=".45"
      />

      {/* Vision slit */}
      <path
        d="M21.4 19.0 L24.4 20.6"
        fill="none"
        stroke="#020617"
        strokeOpacity=".55"
        strokeWidth=".9"
      />

      {/* Barrel opening in shield */}
      <path
        d="M23.8 22.9 L27.4 24.8 L26.9 27.6 L23.4 25.7 Z"
        fill="#020617"
        opacity=".38"
      />

      {/* Shield rivets: left edge */}
      {[16.5, 18.6, 20.7, 22.8, 24.9].map((y, i) => (
        <circle
          key={`sb${i}`}
          cx={20.4 - i * 0.14}
          cy={y}
          r=".4"
          fill="#020617"
          opacity=".45"
        />
      ))}

      {/* Shield rivets: top edge */}
      {[0, 1, 2, 3].map((i) => {
        const t = 0.2 + i * 0.22;

        return (
          <circle
            key={`tb${i}`}
            cx={19.6 + t * 7.4}
            cy={14.9 + t * 3.7 + 0.8}
            r=".38"
            fill="#020617"
            opacity=".4"
          />
        );
      })}

      {/* Sight box */}
      <path
        d="M20.0 13.5 L22.2 14.6 L22.0 15.8 L19.8 14.7 Z"
        fill="currentColor"
        fillOpacity=".7"
        stroke="#020617"
        strokeOpacity=".5"
        strokeWidth=".45"
      />

      {/* Elevation handwheel */}
      <circle
        cx="27.9"
        cy="27.5"
        r="1.35"
        fill="#0b1220"
        stroke="#020617"
        strokeOpacity=".5"
        strokeWidth=".4"
      />

      <circle
        cx="27.9"
        cy="27.5"
        r="1.35"
        fill="none"
        stroke="currentColor"
        strokeOpacity=".55"
        strokeWidth=".5"
        strokeDasharray=".9 1.1"
      />

      <circle
        cx="27.9"
        cy="27.5"
        r=".42"
        fill="#94a3b8"
        opacity=".6"
      />

      {/* Barrel, recoil cylinders and muzzle brake */}
      <g transform="translate(26.2 24.8) rotate(-39)">
        {/* Recoil cylinder */}
        <rect
          x="0.4"
          y="1.15"
          width="9.4"
          height="1.9"
          rx="0.95"
          fill={`url(#${u("shieldEdge")})`}
          stroke="#020617"
          strokeOpacity=".5"
          strokeWidth=".5"
        />

        <path
          d="M1.2 1.55 H9.0"
          stroke="#f8fafc"
          strokeOpacity=".3"
          strokeWidth=".45"
          fill="none"
        />

        <rect
          x="10.2"
          y="1.35"
          width="5.4"
          height="1.5"
          rx="0.75"
          fill={`url(#${u("shieldEdge")})`}
          stroke="#020617"
          strokeOpacity=".5"
          strokeWidth=".5"
        />

        {/* Mantlet collar */}
        <path
          d="M-0.6 -2.2 L2.4 -2.05 L2.4 2.05 L-0.6 2.2 Z"
          fill={`url(#${u("shieldEdge")})`}
          stroke="#020617"
          strokeOpacity=".55"
          strokeWidth=".5"
        />

        {/* Barrel tube */}
        <path
          d="M0 -1.6 L19.4 -1.05 L19.4 1.05 L0 1.6 Z"
          fill={`url(#${u("barrel")})`}
          stroke="#020617"
          strokeOpacity=".55"
          strokeWidth=".5"
        />

        {/* Reinforcing bands */}
        <path
          d="M2.4 -1.52 L3.6 -1.46 L3.6 1.46 L2.4 1.52 Z"
          fill="#020617"
          opacity=".22"
        />

        <path
          d="M14.2 -1.18 L15.1 -1.15 L15.1 1.15 L14.2 1.18 Z"
          fill="#020617"
          opacity=".25"
        />

        {/* Muzzle brake */}
        <rect
          x="17.6"
          y="-1.8"
          width="3.7"
          height="3.6"
          rx="0.7"
          fill={`url(#${u("barrel")})`}
          stroke="#020617"
          strokeOpacity=".6"
          strokeWidth=".5"
        />

        <path
          d="M18.5 -1.6 V1.6"
          stroke="#020617"
          strokeOpacity=".45"
          strokeWidth=".5"
        />

        <path
          d="M20.3 -1.6 V1.6"
          stroke="#020617"
          strokeOpacity=".45"
          strokeWidth=".5"
        />

        {/* Bore */}
        <ellipse
          cx="21.3"
          cy="0"
          rx="0.5"
          ry="1.5"
          fill="#020617"
          opacity=".85"
        />

        {/* Barrel highlight */}
        <path
          d="M1.0 -1.42 L19.0 -0.92"
          fill="none"
          stroke="#f8fafc"
          strokeOpacity=".45"
          strokeWidth=".55"
        />
      </g>

      {/* Near wheel shadow */}
      <ellipse
        cx="30.6"
        cy="40.3"
        rx="5.5"
        ry="1.1"
        fill="#020617"
        opacity=".42"
      />

      {/* Near wheel */}
      <g>
        <circle
          cx="30.6"
          cy="34.4"
          r="5.9"
          fill={`url(#${u("tire")})`}
          stroke="#020617"
          strokeOpacity=".65"
          strokeWidth=".55"
        />

        <circle
          cx="30.6"
          cy="34.4"
          r="5.9"
          fill="none"
          stroke="#020617"
          strokeOpacity=".45"
          strokeWidth=".55"
          strokeDasharray="1.4 1.6"
        />

        <circle
          cx="30.6"
          cy="34.4"
          r="3.5"
          fill={`url(#${u("rim")})`}
          stroke="#020617"
          strokeOpacity=".5"
          strokeWidth=".5"
        />

        {/* Wheel lugs */}
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const a = (i * Math.PI) / 3 + 0.35;

          return (
            <circle
              key={`lug${i}`}
              cx={30.6 + 2.4 * Math.cos(a)}
              cy={34.4 + 2.4 * Math.sin(a)}
              r="0.42"
              fill="#020617"
              opacity=".65"
            />
          );
        })}

        <circle
          cx="30.6"
          cy="34.4"
          r="1.15"
          fill="#0b1220"
        />

        <circle
          cx="30.6"
          cy="34.4"
          r=".45"
          fill="#94a3b8"
          opacity=".75"
        />

        {/* Tyre highlight */}
        <path
          d="M26.4 30.5 A5.6 5.6 0 0 1 32.5 28.9"
          fill="none"
          stroke="#f8fafc"
          strokeOpacity=".28"
          strokeWidth=".7"
        />
      </g>

      {/* Final rim light */}
      <path
        d="M18.4 15.9 L19.6 14.9 L27.0 18.6"
        fill="none"
        stroke="#f8fafc"
        strokeOpacity=".35"
        strokeWidth=".55"
      />
    </g>
  );
}