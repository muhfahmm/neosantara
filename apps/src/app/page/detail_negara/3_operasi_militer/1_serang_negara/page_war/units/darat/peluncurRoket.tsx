import type { UnitIconProps } from "../unitIconProps";

export default function PeluncurRoket({ color }: UnitIconProps) {
  return (
    <g color={color}>
      <defs>
        <linearGradient id="pr-body" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#b0bda5" />
          <stop offset=".45" stopColor={color} />
          <stop offset="1" stopColor="#26392b" />
        </linearGradient>
        <linearGradient id="pr-pod" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#82927e" />
          <stop offset="1" stopColor="#28392d" />
        </linearGradient>
        <linearGradient id="pr-tube" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#9ba998" />
          <stop offset=".45" stopColor="#485b4b" />
          <stop offset="1" stopColor="#1c2920" />
        </linearGradient>
      </defs>

      <ellipse cx="24" cy="27" rx="20" ry="2.7" fill="#000" opacity=".24" />

      {/* Chassis and wheels */}
      <path d="M5 19 43 19 42 24 6 24Z"
        fill="#1b271e" stroke="#101812" strokeWidth=".6" />
      {[11, 17, 33, 39].map((x) => (
        <g key={x}>
          <circle cx={x} cy="23.2" r="3" fill="#101713" stroke="#7c897b" strokeWidth=".45" />
          <circle cx={x} cy="23.2" r="1.65" fill="#4b5e4b" stroke="#1b281e" strokeWidth=".45" />
          <circle cx={x} cy="23.2" r=".55" fill="#bac4b5" />
        </g>
      ))}

      {/* Truck cab */}
      <path d="M6 18 10 12 17 12 21 17 21 21 6 21Z"
        fill="url(#pr-body)" stroke="#1c2a20" strokeWidth=".6" />
      <path d="M10.5 13 15.8 13 18.7 17 9 16.8Z"
        fill="#294847" stroke="#1a302d" strokeWidth=".5" />
      <path d="M11 13.5 14.5 13.5 13.5 15.8"
        stroke="#c4e1d7" strokeWidth=".45" opacity=".8" />

      {/* Chassis deck */}
      <path d="M18 17 41 17 43 20 20 21Z"
        fill="#53664f" stroke="#1a281d" strokeWidth=".55" />

      {/* Launcher support platform */}
      <path d="M18 17 22 14 36 15 40 18 37 20 21 19.5Z"
        fill="#293a2d" stroke="#17241a" strokeWidth=".6" />
      <path d="M21 16 24 11 31 12 35 16 33 18 24 17.5Z"
        fill="#657763" stroke="#243528" strokeWidth=".55" />

      {/* Rocket pod housing */}
      <path d="M12 7 35 5 39 8 38 16 16 17 12 13Z"
        fill="url(#pr-pod)" stroke="#19271d" strokeWidth=".7" />
      <path d="M12 7 35 5 39 8 16 10Z"
        fill="#b3c0aa" opacity=".4" />
      <path d="M16 10 39 8 38 16 16 17Z"
        fill="url(#pr-body)" stroke="#26382a" strokeWidth=".5" />

      {/* Individual launch tubes */}
      {[17, 22, 27, 32].map((x, i) => (
        <g key={x}>
          <path d={`M${x} 7.2 l.4 7.2 2.8-.2 -.4-7.2Z`}
            fill="url(#pr-tube)" stroke="#26362a" strokeWidth=".45" />
          <ellipse cx={x + .9} cy="7.3" rx="1.6" ry=".85"
            fill="#18251c" stroke="#a4b29c" strokeWidth=".4" />
          <ellipse cx={x + .9} cy="7.3" rx=".85" ry=".43"
            fill="#090f0c" />
          <path d={`M${x - .2} 9 l2.5-.2`}
            stroke="#d1d8c8" strokeWidth=".35" opacity=".55" />
        </g>
      ))}

      {/* Rear pod plate */}
      <path d="M16 10 38 8 38 9.2 16 11.3Z"
        fill="#27382b" />
      <path d="M17 14.7 37 13.5"
        stroke="#24352a" strokeWidth=".65" />

      {/* Hydraulic elevation mechanism */}
      <path d="M25 17 27 12 29 12.5 28 18Z"
        fill="#364738" stroke="#1c291e" strokeWidth=".45" />
      <path d="M28 17 32 16.8"
        stroke="#a5b29c" strokeWidth=".65" />

      {/* Rear lights */}
      <path d="M38.5 18.2 40 18.5 40 19.5 38.5 19.3Z"
        fill="#bd6651" />

      {/* Armor highlights */}
      <path d="M13 7.5 34.5 5.8"
        stroke="#d0d9c9" strokeWidth=".5" opacity=".7" />
      <path d="M7 18.3 10.5 12.7"
        stroke="#e0e4d7" strokeWidth=".5" opacity=".65" />

      {/* Panel bolts */}
      {[19, 24, 29, 34].map((x) => (
        <circle key={x} cx={x} cy="15.5" r=".25" fill="#d0d7c9" />
      ))}
    </g>
  );
}