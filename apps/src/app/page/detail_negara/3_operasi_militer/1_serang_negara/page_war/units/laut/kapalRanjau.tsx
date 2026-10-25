import { useId } from "react";
import type { UnitIconProps } from "../unitIconProps";

export default function KapalRanjau({ color }: UnitIconProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const u = (n: string) => `ml-${uid}-${n}`;
  const baseColor = color ?? "#53674f";

  return (
    <g color={baseColor} strokeLinejoin="round" strokeLinecap="round">
      <defs>
        <filter id={u("soft")} x="-40%" y="-140%" width="180%" height="380%">
          <feGaussianBlur stdDeviation="1.3" />
        </filter>
        <linearGradient id={u("hullSide")} x1="0" y1="0" x2="0.12" y2="1">
          <stop offset="0" stopColor="currentColor" stopOpacity="0.9" />
          <stop offset="1" stopColor="#020617" stopOpacity="0.9" />
        </linearGradient>
        <linearGradient id={u("deck")} x1="0" y1="0" x2="0.8" y2="1">
          <stop offset="0" stopColor="currentColor" stopOpacity="1" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.7" />
        </linearGradient>
        <linearGradient id={u("glass")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6ee7f0" />
          <stop offset="1" stopColor="#0e7490" />
        </linearGradient>
      </defs>

      {/* Water Wake */}
      <ellipse cx="24" cy="27" rx="22" ry="4" fill="#020617" opacity=".6" filter={`url(#${u("soft")})`} />
      <path d="M2 26 Q12 29 24 28 Q36 29 48 26" fill="none" stroke="#94a3b8" strokeOpacity=".3" strokeWidth=".5" />

      {/* Hull */}
      <path d="M6 19 L10 13 L42 14 L46 19 L43 24 L9 24 Z" fill={`url(#${u("hullSide")})`} stroke="#020617" strokeWidth=".6" />
      <path d="M8 23 L9 24 L43 24 L44 22 Z" fill="#020617" opacity=".8" />

      {/* Main Deck */}
      <path d="M10 13 L42 14 L46 19 L12 19 Z" fill={`url(#${u("deck")})`} stroke="#020617" strokeWidth=".5" />

      {/* Mine Rails (Rel Melengkung di Buritan) */}
      <path d="M12 16 L35 16.5 L33 19 L13 19 Z" fill="none" stroke="#f8fafc" strokeOpacity=".4" strokeWidth=".5" strokeDasharray="1.5 1.5" />
      <path d="M13 17 L34 17.5" fill="none" stroke="#f8fafc" strokeOpacity=".3" strokeWidth=".4" />

      {/* Sea Mines (Ranjau Laut) */}
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={`mine-${i}`} transform={`translate(${15 + i * 4} 16)`}>
          <circle cx="0" cy="0" r="1" fill="#1e293b" stroke="#020617" strokeWidth=".3" />
          <path d="M-1 0 L-1.5 0 M1 0 L1.5 0 M0 -1 L0 -1.5 M0 1 L0 1.5" stroke="#94a3b8" strokeWidth=".3" />
          <circle cx="0" cy="0" r=".3" fill="#fde68a" />
        </g>
      ))}

      {/* Superstructure */}
      <path d="M18 13 L22 8 L28 8.5 L32 13 Z" fill={`url(#${u("deck")})`} stroke="#020617" strokeWidth=".5" />
      <path d="M18 13 L22 8 L22 12 L18 16 Z" fill={`url(#${u("hullSide")})`} stroke="#020617" strokeWidth=".5" />
      
      {/* Bridge Windows */}
      <path d="M20 11 L24 10 L27 10.5 L24 12 Z" fill={`url(#${u("glass")})`} stroke="#020617" strokeWidth=".3" />
      <path d="M20.5 11 L23 10.3" stroke="#f8fafc" strokeOpacity=".6" strokeWidth=".3" />

      {/* Crane for Mines (Kran Pengangkat Ranjau) */}
      <g transform="translate(30 13)">
        <path d="M0 0 L1 -1.5 L2 -1.5 L2 0 Z" fill="#64748b" stroke="#020617" strokeWidth=".3" />
        <path d="M1.5 -1.5 L-2 -4" stroke="#020617" strokeWidth=".5" />
        <path d="M-2 -4 L-2 -2" stroke="#020617" strokeWidth=".3" strokeDasharray=".5 .5" />
      </g>

      {/* Helipad (Tanda Lingkaran) */}
      <circle cx="37" cy="17" r="2" fill="none" stroke="#f8fafc" strokeOpacity=".5" strokeWidth=".4" />
      <path d="M36 17 L38 17 M37 16 L37 18" stroke="#f8fafc" strokeOpacity=".6" strokeWidth=".4" />

      {/* Rim Light */}
      <path d="M10 13 L42 14 L46 19" fill="none" stroke="#f8fafc" strokeOpacity=".4" strokeWidth=".5" />
    </g>
  );
}