import type { UnitIconProps } from "../unitIconProps";

export default function PertahananUdaraMobile({ color }: UnitIconProps) {
  return (
    <g color={color}>
      <defs>
        <linearGradient id="pa-body" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#aab9a2" />
          <stop offset=".45" stopColor={color} />
          <stop offset="1" stopColor="#27392c" />
        </linearGradient>
        <linearGradient id="pa-radar" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#b5c1b1" />
          <stop offset=".45" stopColor="#687b68" />
          <stop offset="1" stopColor="#26382b" />
        </linearGradient>
        <linearGradient id="pa-glass" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#b9e1dc" />
          <stop offset="1" stopColor="#27494a" />
        </linearGradient>
      </defs>

      <ellipse cx="24" cy="27" rx="20" ry="2.7" fill="#000" opacity=".24" />

      {/* Chassis */}
      <path d="M5 19 42 19 43 24 6 24Z"
        fill="#17231b" stroke="#101812" strokeWidth=".6" />

      {/* Wheels */}
      {[11, 17, 33, 39].map((x) => (
        <g key={x}>
          <ellipse cx={x} cy="23" rx="2.8" ry="3.4"
            fill="#101713" stroke="#7b897a" strokeWidth=".5" />
          <ellipse cx={x} cy="23" rx="1.65" ry="2.2"
            fill="#4b5e4c" stroke="#19261c" strokeWidth=".45" />
          <circle cx={x} cy="23" r=".6" fill="#b6c2b2" />
        </g>
      ))}

      {/* Vehicle body */}
      <path d="M6 18 10 12 18 11 23 16 23 21 6 21Z"
        fill="url(#pa-body)" stroke="#1b291f" strokeWidth=".6" />
      <path d="M10.5 12.8 16.8 12.2 20 16.3 9 16.5Z"
        fill="url(#pa-glass)" stroke="#24392d" strokeWidth=".5" />
      <path d="M11 13.2 14 12.9 13 15.3"
        stroke="#e1f0e7" strokeWidth=".45" opacity=".8" />

      {/* Equipment deck */}
      <path d="M21 17 40 17 42 20 21 21Z"
        fill="#50644e" stroke="#1c2a20" strokeWidth=".55" />

      {/* Rotating radar pedestal */}
      <path d="M22 17 24 14 30 14 33 17 30 19 23 19Z"
        fill="#344637" stroke="#1a271d" strokeWidth=".55" />

      {/* Radar housing */}
      <path d="M23 12 27 9 33 10 35 13 31 16 25 15Z"
        fill="url(#pa-radar)" stroke="#1b291e" strokeWidth=".65" />
      <path d="M23 12 27 9 33 10 35 13 29 12Z"
        fill="#d0d9c7" opacity=".3" />

      {/* Radar dish */}
      <path d="M25 9 29 3 34 5 31 11Z"
        fill="url(#pa-radar)" stroke="#1c2b20" strokeWidth=".65" />
      <path d="M26 8.7 29.2 4.1 32.7 5.4 30.5 9.5Z"
        fill="#a9b8a5" opacity=".65" />
      <path d="M27 8 29.5 4.8"
        stroke="#dbe2d5" strokeWidth=".5" opacity=".8" />

      {/* Radar surface grid */}
      <path d="M27.5 5.3 31.7 6.6 M26.7 6.5 31 7.9"
        stroke="#455b49" strokeWidth=".4" />

      {/* Missile canisters */}
      <path d="M33 11 36 9.5 38 10.5 35 12Z"
        fill="#71836e" stroke="#26382a" strokeWidth=".45" />
      <path d="M35 12 38 10.5 39 18 36 19Z"
        fill="url(#pa-body)" stroke="#1c2a20" strokeWidth=".5" />
      <path d="M33 11 34 17.8 36 19 35 12Z"
        fill="#405541" stroke="#1b281e" strokeWidth=".45" />

      {/* Canister end caps */}
      <path d="M33 11 36 9.5 38 10.5 35 12Z"
        fill="#202d22" stroke="#a4b29b" strokeWidth=".4" />
      <path d="M35.5 12.2 37.5 11.2"
        stroke="#c4cebb" strokeWidth=".4" />

      {/* Stabilizer and equipment panels */}
      <path d="M24 17.5 28 17.7 28 19.1 24 19Z"
        fill="#26382a" stroke="#a3b19a" strokeWidth=".35" />
      <path d="M29 17.5 31 17.5 31 18.7 29 18.7Z"
        fill="#b2bfaa" opacity=".65" />

      {/* Antenna */}
      <path d="M23.5 12 22.7 6"
        stroke="#26372a" strokeWidth=".4" />
      <circle cx="22.7" cy="6" r=".35" fill="#c3cebb" />

      {/* Vehicle lights */}
      <path d="M19.5 17 21 17.5 21 18.3 19.5 18Z"
        fill="#e5d8a2" />

      {/* Fine panel details */}
      <path d="M7 18.5 10.5 13"
        stroke="#d3ddcb" strokeWidth=".5" opacity=".65" />
      {[12, 16, 24, 30, 37].map((x, i) => (
        <circle key={i} cx={x} cy={19.5} r=".25" fill="#c4cebc" />
      ))}
    </g>
  );
}