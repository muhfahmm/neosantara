import type { UnitIconProps } from "../unitIconProps";

export default function KendaraanTaktis({ color }: UnitIconProps) {
  return (
    <g color={color}>
      <defs>
        <linearGradient id="kt-body" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#b1c0aa" />
          <stop offset=".4" stopColor={color} />
          <stop offset="1" stopColor="#293c2e" />
        </linearGradient>
        <linearGradient id="kt-side" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#687c67" />
          <stop offset="1" stopColor="#25372a" />
        </linearGradient>
        <linearGradient id="kt-glass" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#b5e1dc" />
          <stop offset="1" stopColor="#25494a" />
        </linearGradient>
      </defs>

      <ellipse cx="24" cy="26.5" rx="20" ry="3" fill="#000" opacity=".23" />

      {/* Chassis */}
      <path d="M5 18 11 12 34 13 43 19 41 24 8 23Z"
        fill="#17221b" stroke="#101813" strokeWidth=".65" />

      {/* Wheels */}
      {[11, 17, 33, 39].map((x, i) => (
        <g key={x}>
          <ellipse cx={x} cy={22.2 - (i < 2 ? .3 : 0)}
            rx="3" ry="3.8" fill="#101713" stroke="#778579" strokeWidth=".5" />
          <ellipse cx={x} cy={22.2 - (i < 2 ? .3 : 0)}
            rx="1.8" ry="2.5" fill="#4b5c4e" stroke="#18251b" strokeWidth=".55" />
          <circle cx={x} cy="22" r=".7" fill="#c0c9b9" />
          <path d={`M${x - 1.2} 20.7 l1.3-.8`}
            stroke="#b5c0b1" strokeWidth=".45" />
        </g>
      ))}

      {/* Lower body */}
      <path d="M6 17.5 11 11 34 12 42 17.5 42 21 8 20Z"
        fill="url(#kt-side)" stroke="#1a281d" strokeWidth=".65" />

      {/* Armored cabin */}
      <path d="M8 17 13 8.5 30 8.5 37 14 40 17.5 36 19.5 10 18.8Z"
        fill="url(#kt-body)" stroke="#1d2b20" strokeWidth=".7" />

      {/* Roof highlights */}
      <path d="M13 8.5 30 8.5 37 14 31 13 16 11Z"
        fill="#c4cfbb" opacity=".22" />
      <path d="M9.5 16.5 14 9.2 27 9.2"
        fill="none" stroke="#d4dfcd" strokeWidth=".6" opacity=".7" />

      {/* Windshield */}
      <path d="M14 10 20 10 20 14.2 11.8 13.7Z"
        fill="url(#kt-glass)" stroke="#263b30" strokeWidth=".6" />
      <path d="M21.2 10 29 10.4 34.5 14.5 21.2 14.2Z"
        fill="url(#kt-glass)" stroke="#263b30" strokeWidth=".6" />
      <path d="M15 10.5 18.5 10.5 17.5 12.7"
        fill="none" stroke="#e0f1e9" strokeWidth=".5" opacity=".8" />

      {/* Door and armor */}
      <path d="M21.5 14.7 30.8 14.9 31.5 18.5 21.5 18Z"
        fill="#405542" stroke="#243729" strokeWidth=".5" />
      <path d="M28.5 15.8 30 15.8"
        stroke="#c0cbb8" strokeWidth=".65" />
      <path d="M12 14.3 19.8 14.8 19.5 18 11 17.6Z"
        fill="#637763" stroke="#26372a" strokeWidth=".45" />

      {/* Roof-mounted weapon station */}
      <path d="M23 9 25 6.5 30 6.5 32 9 30 10.5 24 10Z"
        fill="#344737" stroke="#1a271d" strokeWidth=".5" />
      <circle cx="27.5" cy="8.2" r="1.5" fill="#647765" />
      <path d="M28.5 7.6 36 7.9 36 8.8 28.5 8.5Z"
        fill="#27362a" stroke="#131e17" strokeWidth=".45" />
      <path d="M35.5 7.6 37.5 7.7 37.5 9 35.5 8.9Z"
        fill="#101914" />

      {/* Antenna */}
      <path d="M23.5 7 22.8 3"
        stroke="#26372a" strokeWidth=".4" />
      <circle cx="22.8" cy="3" r=".35" fill="#c0cbbb" />

      {/* Headlights */}
      <path d="M37 15.2 39 16.3 39.2 17.2 37.5 16.7Z"
        fill="#f2dfa3" stroke="#3b4635" strokeWidth=".4" />

      {/* Bumper */}
      <path d="M37 18.2 42 19.1 41.5 20.8 37 20Z"
        fill="#29382d" stroke="#131d16" strokeWidth=".5" />
      <path d="M38 19.1 40.5 19.6"
        stroke="#aab6a4" strokeWidth=".4" />

      {/* Rivets */}
      {[[12, 15], [19, 15.3], [23, 17.7], [30, 17.9], [35, 15.7]].map(
        ([x, y], i) => (
          <circle key={i} cx={x} cy={y} r=".25" fill="#c3cdbd" />
        )
      )}
    </g>
  );
}