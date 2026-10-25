import type { UnitIconProps } from "../unitIconProps";

export default function ApcIfv({ color }: UnitIconProps) {
  return (
    <g color={color}>
      <defs>
        <linearGradient id="apc-hull-top" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#82958a" />
          <stop offset="45%" stopColor={color} />
          <stop offset="100%" stopColor="#293c35" />
        </linearGradient>

        <linearGradient id="apc-hull-side" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#52685b" />
          <stop offset="100%" stopColor="#1b2924" />
        </linearGradient>

        <linearGradient id="apc-armor" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#9aaa9a" />
          <stop offset="35%" stopColor={color} />
          <stop offset="100%" stopColor="#34483b" />
        </linearGradient>

        <linearGradient id="apc-track" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#38443d" />
          <stop offset="50%" stopColor="#111a17" />
          <stop offset="100%" stopColor="#465149" />
        </linearGradient>

        <linearGradient id="apc-glass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#b5ded8" />
          <stop offset="50%" stopColor="#477d7b" />
          <stop offset="100%" stopColor="#142f32" />
        </linearGradient>

        <linearGradient id="apc-barrel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#849188" />
          <stop offset="50%" stopColor="#46574d" />
          <stop offset="100%" stopColor="#1d2923" />
        </linearGradient>

        <filter id="apc-shadow" x="-30%" y="-30%" width="160%" height="170%">
          <feGaussianBlur stdDeviation="1.1" />
        </filter>
      </defs>

      {/* Ground shadow */}
      <ellipse
        cx="25"
        cy="25.5"
        rx="21"
        ry="4"
        fill="#000"
        opacity=".3"
        filter="url(#apc-shadow)"
      />

      {/* Tracks */}
      <path
        d="M7 17.5 11 12.5 34 13.5 43 18 43 24.5 39 28 10 26.5 5 23Z"
        fill="#101814"
        stroke="#66746a"
        strokeWidth=".7"
      />

      <path
        d="M7 18 11.5 14 33.5 15 40.5 18.5 40.5 23.5 37.5 26 10 24.5 7 22Z"
        fill="url(#apc-track)"
        stroke="#899389"
        strokeWidth=".45"
      />

      {/* Track tread details */}
      {Array.from({ length: 11 }, (_, i) => (
        <path
          key={`tread-${i}`}
          d={`M${9 + i * 2.8} ${16.2 + Math.sin(i * 0.25) * 0.15}
             l1.7 .1 -.3 1.1 -1.7-.1Z`}
          fill="#879087"
          opacity=".7"
        />
      ))}

      {Array.from({ length: 11 }, (_, i) => (
        <path
          key={`lower-tread-${i}`}
          d={`M${8.5 + i * 2.8} 24.1 l1.7 .1 -.5 1.1 -1.6-.1Z`}
          fill="#89948a"
          opacity=".65"
        />
      ))}

      {/* Road wheels */}
      {[11, 16.5, 22, 27.5, 33, 38].map((cx, i) => (
        <g key={`wheel-${cx}`}>
          <ellipse
            cx={cx}
            cy={21.7 - (i < 2 ? 0.2 : 0)}
            rx="2.25"
            ry="3.1"
            fill="#111a16"
            stroke="#7d897f"
            strokeWidth=".55"
          />
          <ellipse
            cx={cx}
            cy="21.7"
            rx="1.45"
            ry="2.15"
            fill="#46574c"
            stroke="#17231c"
            strokeWidth=".45"
          />
          <ellipse
            cx={cx - 0.35}
            cy="21.1"
            rx=".65"
            ry="1.1"
            fill="#9aa397"
            opacity=".65"
          />
          <circle cx={cx} cy="21.8" r=".55" fill="#18241c" />
        </g>
      ))}

      {/* Main lower hull */}
      <path
        d="M7 15 12 10.5 32 11.5 40 16.5 43 19.5 39 23 10 21.5 5 19Z"
        fill="url(#apc-hull-side)"
        stroke="#18271e"
        strokeWidth=".65"
      />

      {/* Upper hull roof */}
      <path
        d="M7 14.8 13 8.5 32 9.5 40.5 14.7 36.5 19 11 17.7Z"
        fill="url(#apc-hull-top)"
        stroke="#18271e"
        strokeWidth=".65"
      />

      {/* Top armor highlights */}
      <path
        d="M13 8.5 32 9.5 40.5 14.7 36.5 15.5 15 12Z"
        fill="#c1cbbb"
        opacity=".16"
      />
      <path
        d="M8.5 14.6 13.2 9.2 30 10.1"
        fill="none"
        stroke="#c6d2c4"
        strokeWidth=".65"
        opacity=".75"
      />

      {/* Sloped front armor */}
      <path
        d="M32 9.5 40.5 14.7 43 18.5 38 19.2 34.5 15.8Z"
        fill="#819184"
        stroke="#293b30"
        strokeWidth=".6"
      />
      <path
        d="M35 11.5 40.5 15.2 41.7 17.4 38.6 16.7Z"
        fill="#bac5b8"
        opacity=".28"
      />

      {/* Side armor skirts */}
      <path
        d="M11 17.2 36.8 18.6 36.2 21.1 10.8 19.8Z"
        fill="url(#apc-armor)"
        stroke="#17261d"
        strokeWidth=".55"
      />

      <path
        d="M12 18.1 17 18.4 16.5 20 11.7 19.7Z
           M18 18.4 23 18.7 22.5 20.3 17.5 20Z
           M24 18.8 29 19.1 28.5 20.6 23.5 20.3Z
           M30 19.1 35.5 19.3 35 20.8 29.5 20.6Z"
        fill="#26382d"
        stroke="#91a092"
        strokeWidth=".35"
      />

      {/* Side access panel */}
      <path
        d="M17.5 14.1 24 14.5 23.7 17.5 17.3 17.1Z"
        fill="#405347"
        stroke="#a1b09f"
        strokeWidth=".45"
      />
      <path
        d="M18.5 14.8 18.4 16.5 M23 15 22.9 16.8"
        stroke="#19271e"
        strokeWidth=".45"
      />

      {/* Vision blocks */}
      <path
        d="M12 11.1 15.5 11.4 15 13.2 11.5 12.9Z"
        fill="url(#apc-glass)"
        stroke="#25382f"
        strokeWidth=".45"
      />
      <path
        d="M12.5 11.5 14.5 11.7"
        stroke="#d7eeea"
        strokeWidth=".45"
      />

      {/* Turret base ring */}
      <path
        d="M17 10.5 20 7.4 30.5 8 34.5 10.6 31 13.2 20 12.8Z"
        fill="#25362c"
        stroke="#111c16"
        strokeWidth=".65"
      />
      <path
        d="M19 10.1 21.2 8.4 30.3 8.9 32.5 10.6 30.7 11.9 21 11.4Z"
        fill="#6b7d6e"
        stroke="#a2afa0"
        strokeWidth=".4"
      />

      {/* Main turret */}
      <path
        d="M18.5 8.8 22 5.5 30.5 6.1 34 8.5 32 11.1 22 10.7Z"
        fill="url(#apc-armor)"
        stroke="#1a291f"
        strokeWidth=".65"
      />

      {/* Turret top plate */}
      <path
        d="M22 5.5 24.5 4.7 31.5 5.9 30.5 6.8Z"
        fill="#b3c0af"
        opacity=".65"
      />
      <path
        d="M20.2 8.6 23 6.3 29.8 6.7"
        fill="none"
        stroke="#d0d8c9"
        strokeWidth=".55"
        opacity=".7"
      />

      {/* Commander hatch */}
      <path
        d="M23 5.9 25.2 4.8 28.7 5.4 26.5 6.9Z"
        fill="#34473a"
        stroke="#b4c0ae"
        strokeWidth=".45"
      />
      <path
        d="M24 5.8 25.5 5.3 27.5 5.7"
        stroke="#aebdad"
        strokeWidth=".4"
      />

      {/* Optics */}
      <path
        d="M29 7.3 31.5 7.7 30.9 9 28.5 8.7Z"
        fill="url(#apc-glass)"
        stroke="#20332a"
        strokeWidth=".45"
      />
      <circle cx="30" cy="8.1" r=".35" fill="#d5f7ef" />

      {/* Gun mantlet */}
      <path
        d="M30.5 8.4 34 8.8 35 10.2 32.8 11.1 30.2 10.2Z"
        fill="#34483b"
        stroke="#18251d"
        strokeWidth=".5"
      />

      {/* Cannon barrel */}
      <path
        d="M33.5 9.1 43.5 10.2 43.5 11.6 33.4 10.8Z"
        fill="url(#apc-barrel)"
        stroke="#15221a"
        strokeWidth=".55"
      />
      <path
        d="M35 9.5 42.8 10.5"
        stroke="#b6c2b4"
        strokeWidth=".45"
        opacity=".7"
      />
      <path
        d="M42.7 10.1 45 10.2 45 11.9 42.7 11.7Z"
        fill="#18231c"
        stroke="#839084"
        strokeWidth=".45"
      />
      <path
        d="M43.1 10.6 44.8 10.7"
        stroke="#a0aea0"
        strokeWidth=".4"
      />

      {/* Front headlights */}
      <path
        d="M39.4 16.1 41.1 16.7 41.5 17.6 39.8 17.2Z"
        fill="#e1d5a1"
        stroke="#3a4435"
        strokeWidth=".35"
      />
      <path
        d="M37.7 16.5 38.7 16.9 39 17.7 38 17.4Z"
        fill="#a4c3b6"
      />

      {/* Antenna */}
      <path
        d="M21.2 5.7 20.7 2.8"
        stroke="#1b281f"
        strokeWidth=".45"
      />
      <circle cx="20.7" cy="2.8" r=".35" fill="#b4c0ae" />

      {/* Bolts and armor details */}
      {[
        [13, 18.3],
        [16.5, 18.5],
        [24, 18.8],
        [31, 19.2],
        [35, 19.3],
        [38, 16.1],
      ].map(([cx, cy], i) => (
        <circle
          key={`bolt-${i}`}
          cx={cx}
          cy={cy}
          r=".25"
          fill="#c2ccbd"
        />
      ))}

      {/* Small tactical marking */}
      <path
        d="M25 15.1 28 15.2 27.7 16.7 24.7 16.6Z"
        fill="#d0c99d"
        opacity=".8"
      />

      {/* Final edge highlights */}
      <path
        d="M8 15.1 12.9 9.1 19 9.4
           M32 10 39.8 14.9"
        fill="none"
        stroke="#d0d9ca"
        strokeWidth=".45"
        opacity=".65"
      />
    </g>
  );
}