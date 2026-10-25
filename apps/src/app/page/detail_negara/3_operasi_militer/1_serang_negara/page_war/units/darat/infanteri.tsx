import type { UnitIconProps } from "../unitIconProps";

export default function Infanteri({ color }: UnitIconProps) {
  const soldiers = [
    { x: 9, y: 7, s: 0.88 },
    { x: 20, y: 4.8, s: 1 },
    { x: 32, y: 7, s: 0.9 },
  ];

  return (
    <g color={color}>
      <defs>
        <linearGradient id="inf-armor" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#a9b9a4" />
          <stop offset=".4" stopColor={color} />
          <stop offset="1" stopColor="#26372c" />
        </linearGradient>
        <linearGradient id="inf-gear" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#657b68" />
          <stop offset="1" stopColor="#24372a" />
        </linearGradient>
        <linearGradient id="inf-skin" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#d3ad85" />
          <stop offset="1" stopColor="#70523a" />
        </linearGradient>
      </defs>

      <ellipse cx="24" cy="28" rx="20" ry="2.5" fill="#000" opacity=".2" />

      {soldiers.map(({ x, y, s }, i) => (
        <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
          {/* Legs */}
          <path d="M-3 15 -4 22 -6 25 -3 26 0 22 1 17Z"
            fill="#26372c" stroke="#17231c" strokeWidth=".45" />
          <path d="M1 16 3 21 2 25 5 26 6 23 5 16Z"
            fill="url(#inf-armor)" stroke="#17231c" strokeWidth=".45" />
          <path d="M-6 24 -3 24.5 -2 26 -7 26Z M2 24 5 24 7 26 2 26Z"
            fill="#111a15" />

          {/* Backpack */}
          <path d="M-4 7 -7 8 -7 14 -4 16 -2 13Z"
            fill="#304333" stroke="#17251b" strokeWidth=".5" />

          {/* Torso */}
          <path d="M-3 7 -1 6 3 7 5 12 3 17 -4 16 -5 11Z"
            fill="url(#inf-armor)" stroke="#1d2a20" strokeWidth=".55" />
          <path d="M-2 8 2 8 3 14 -2 14Z"
            fill="url(#inf-gear)" stroke="#19251c" strokeWidth=".4" />

          {/* Armor pouches */}
          {[-2, 0, 2].map((px) => (
            <rect key={px} x={px - .5} y="10" width="1.5" height="2"
              rx=".3" fill="#a1ad8d" stroke="#26362a" strokeWidth=".35" />
          ))}

          {/* Arms */}
          <path d="M-3 8 -6 10 -5 14 -3 14 -2 11Z"
            fill="url(#inf-armor)" stroke="#1d2a20" strokeWidth=".45" />
          <path d="M3 8 5 10 7 12 6 14 4 13 1 11Z"
            fill="url(#inf-armor)" stroke="#1d2a20" strokeWidth=".45" />

          {/* Head */}
          <path d="M-2 3 -1 1 2 1 3 4 2 7 -1 7 -2 5Z"
            fill="url(#inf-skin)" />
          <path d="M-3 3 -2 0 1 -1 4 1 4 3 1 2 -2 3Z"
            fill="#29392d" stroke="#17231c" strokeWidth=".5" />
          <path d="M-2 1 1 0 3 1"
            fill="none" stroke="#a4b29c" strokeWidth=".45" />

          {/* Helmet-mounted optics */}
          <path d="M1 3 3 3.2 3 4.5 1 4.3Z" fill="#344c43" />
        </g>
      ))}

      {/* Foreground rifle */}
      <g transform="rotate(-13 22 16)">
        <path d="M8 14.5 24 14.5 24 15.7 8 15.7Z"
          fill="#17221b" stroke="#7b8975" strokeWidth=".35" />
        <path d="M17 15.5 18 18 20 18 20 15.5Z" fill="#29372b" />
        <path d="M10 14.2 12 14.2 12 16 10 16Z" fill="#84907a" />
        <path d="M23 14.1 29 14.1 29 15.1 23 15.1Z" fill="#56665a" />
        <path d="M28 14 31 14.1 31 15.1 28 15Z" fill="#111a15" />
      </g>

      {/* Soft ground contact */}
      <path d="M5 27.5 Q24 30 43 27.5"
        fill="none" stroke="#a6b59e" strokeWidth=".45" opacity=".4" />
    </g>
  );
}