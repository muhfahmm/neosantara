import { useId } from "react";
import type { UnitIconProps } from "../unitIconProps";

export default function Infanteri({ color }: UnitIconProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const u = (n: string) => `inf-${uid}-${n}`;
  const baseColor = color ?? "#53674f";

  const soldiers = [
    { x: 8.5,  y: 6.8, s: 0.86, flip: false },
    { x: 20,   y: 4.2, s: 1.0,  flip: false },
    { x: 31.8, y: 6.8, s: 0.9,  flip: true  },
  ];

  return (
    <g color={baseColor} strokeLinejoin="round" strokeLinecap="round">
      <defs>
        {/* ===================== FILTERS ===================== */}
        <filter id={u("soft")}  x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="1.0" />
        </filter>
        <filter id={u("soft2")} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="0.45" />
        </filter>

        {/* ===================== HELMET ===================== */}
        <linearGradient id={u("helmet")} x1="0.1" y1="0" x2="0.7" y2="1">
          <stop offset="0"    stopColor="currentColor" stopOpacity="1" />
          <stop offset="0.55" stopColor="currentColor" stopOpacity="0.78" />
          <stop offset="1"    stopColor="currentColor" stopOpacity="0.4" />
        </linearGradient>
        <linearGradient id={u("helmetBack")} x1="0" y1="0" x2="0.15" y2="1">
          <stop offset="0" stopColor="currentColor" stopOpacity="0.65" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.28" />
        </linearGradient>

        {/* ===================== BODY ARMOR ===================== */}
        <linearGradient id={u("vest")} x1="0" y1="0" x2="0.8" y2="1">
          <stop offset="0"   stopColor="currentColor" stopOpacity="0.95" />
          <stop offset="0.6" stopColor="currentColor" stopOpacity="0.66" />
          <stop offset="1"   stopColor="currentColor" stopOpacity="0.32" />
        </linearGradient>
        <linearGradient id={u("vestSide")} x1="0" y1="0" x2="0.2" y2="1">
          <stop offset="0" stopColor="currentColor" stopOpacity="0.8" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.35" />
        </linearGradient>

        {/* ===================== PANTS / BOOTS ===================== */}
        <linearGradient id={u("pants")} x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0" stopColor="currentColor" stopOpacity="0.72" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.3" />
        </linearGradient>
        <linearGradient id={u("boot")} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor="#1a2420" />
          <stop offset="1" stopColor="#080d0a" />
        </linearGradient>

        {/* ===================== SKIN / GLOVE ===================== */}
        <linearGradient id={u("skin")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0"    stopColor="#d8b48c" />
          <stop offset="0.55" stopColor="#b8916a" />
          <stop offset="1"    stopColor="#7a5a3e" />
        </linearGradient>
        <linearGradient id={u("glove")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2c332e" />
          <stop offset="1" stopColor="#101714" />
        </linearGradient>

        {/* ===================== RIFLE ===================== */}
        <linearGradient id={u("rifle")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0"   stopColor="#3a403b" />
          <stop offset="0.4" stopColor="#1e2420" />
          <stop offset="1"   stopColor="#0a0f0c" />
        </linearGradient>
        <linearGradient id={u("rifleAccent")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7a8680" />
          <stop offset="1" stopColor="#3a403b" />
        </linearGradient>

        {/* ===================== LENS / WEBBING / POUCH / PACK ===================== */}
        <linearGradient id={u("lens")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0"   stopColor="#6ee7f0" />
          <stop offset="0.5" stopColor="#22d3ee" />
          <stop offset="1"   stopColor="#0e7490" />
        </linearGradient>
        <linearGradient id={u("strap")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4a5348" />
          <stop offset="1" stopColor="#222a24" />
        </linearGradient>
        <linearGradient id={u("pouch")} x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0" stopColor="currentColor" stopOpacity="0.85" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.4" />
        </linearGradient>
        <linearGradient id={u("pack")} x1="0" y1="0" x2="0.8" y2="1">
          <stop offset="0" stopColor="currentColor" stopOpacity="0.7" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.25" />
        </linearGradient>
      </defs>

      {/* Ground contact line */}
      <path
        d="M2.5 31 Q20 33.8 42 31"
        fill="none" stroke="#a6b59e" strokeWidth="0.45" opacity="0.4"
      />

      {soldiers.map(({ x, y, s, flip }, i) => (
        <g
          key={i}
          transform={`translate(${x} ${y}) scale(${s * (flip ? -1 : 1)} ${s})`}
        >
          {/* === ground shadow per-soldier === */}
          <ellipse cx="0" cy="26.2" rx="6.5" ry="1.6"
            fill="#020617" opacity="0.45"
            filter={`url(#${u("soft")})`} />

          {/* ===================== BACKPACK ===================== */}
          <path d="M-5.5 9.5 L-6.8 10 L-7.2 14.5 L-6 16.5 L-4 15 L-3.5 11 Z"
            fill={`url(#${u("pack")})`} stroke="#0d1511" strokeWidth="0.45" />
          <path d="M-6.2 11.5 L-5 11.2 M-6.4 13.2 L-5 13 M-6.2 15 L-4.8 14.8"
            stroke="#0d1511" strokeWidth="0.3" opacity="0.6" />
          <ellipse cx="-5.5" cy="9.3" rx="2.4" ry="1"
            fill={`url(#${u("pouch")})`} stroke="#0d1511" strokeWidth="0.35" />

          {/* ===================== REAR LEG ===================== */}
          <path d="M-2.8 16 L-3.8 19.5 L-4.3 22.5 L-2.3 23 L-1.2 19.6 L-0.8 16.4 Z"
            fill={`url(#${u("pants")})`} stroke="#0d1a12" strokeWidth="0.4" />
          <path d="M-3.9 19 L-3.4 20.6 L-2.1 20.4 L-2.3 18.9 Z"
            fill="#1c2620" stroke="#0a0f0b" strokeWidth="0.35" />
          <path d="M-3.5 17.4 L-2 17.2 L-1.9 18.6 L-3.4 18.8 Z"
            fill="currentColor" fillOpacity="0.32"
            stroke="#0d1511" strokeWidth="0.3" />
          <path d="M-4.4 22.3 L-2.2 22.9 L-1.9 24.6 L-5 24.9 Z"
            fill={`url(#${u("boot")})`} stroke="#050806" strokeWidth="0.4" />
          <path d="M-4.9 24.4 L-2 24.2"
            stroke="#3a4540" strokeWidth="0.45" opacity="0.6" />

          {/* ===================== FRONT LEG ===================== */}
          <path d="M0.5 16 L1 19.8 L1.3 23 L3 22.8 L3 19.4 L2.8 16.2 Z"
            fill={`url(#${u("pants")})`} stroke="#0d1a12" strokeWidth="0.4" />
          <path d="M0.8 19 L1.8 20.5 L3 20.2 L2.8 18.7 Z"
            fill="#1c2620" stroke="#0a0f0b" strokeWidth="0.35" />
          <path d="M1.2 17.4 L2.6 17.2 L2.7 18.7 L1.3 18.9 Z"
            fill="currentColor" fillOpacity="0.32"
            stroke="#0d1511" strokeWidth="0.3" />
          <path d="M1.2 22.7 L3 22.5 L3.2 24.6 L0.8 24.8 Z"
            fill={`url(#${u("boot")})`} stroke="#050806" strokeWidth="0.4" />
          <path d="M1 24.4 L3.1 24.2"
            stroke="#3a4540" strokeWidth="0.45" opacity="0.6" />

          {/* ===================== TORSO / PLATE CARRIER ===================== */}
          <path d="M-3.6 8 L-2.5 6.8 L1.8 6.8 L3.4 8.2 L3.2 14.5 L2 16.3 L-2.8 16.3 L-4 14.4 Z"
            fill={`url(#${u("vest")})`} stroke="#0d1511" strokeWidth="0.5" />
          <path d="M-3.6 8 L-4 14.4 L-2.8 16.3 L-2.4 14.5 L-2.6 9.5 Z"
            fill={`url(#${u("vestSide")})`} opacity="0.85" />
          <path d="M-2 8.2 L2.5 8.2 L2.6 12.8 L-1.6 13 L-2.2 11 Z"
            fill="currentColor" fillOpacity="0.42"
            stroke="#0d1511" strokeWidth="0.35" />
          <path d="M-1.8 8.4 L2.3 8.4"
            stroke="#f8fafc" strokeOpacity="0.35" strokeWidth="0.4" />
          <path d="M-1.5 9.6 L2.2 9.6 M-1.6 11 L2.2 11 M-1.8 12.4 L2 12.4"
            stroke="#0d1511" strokeOpacity="0.45" strokeWidth="0.35" />

          <rect x="-1.2" y="9.8" width="1.5" height="1.6" rx="0.3"
            fill={`url(#${u("pouch")})`} stroke="#0d1511" strokeWidth="0.3" />
          <rect x="0.4"  y="9.8" width="1.4" height="1.6" rx="0.3"
            fill={`url(#${u("pouch")})`} stroke="#0d1511" strokeWidth="0.3" />
          <rect x="-0.5" y="11.6" width="1.6" height="1.4" rx="0.3"
            fill={`url(#${u("pouch")})`} stroke="#0d1511" strokeWidth="0.3" />
          <rect x="-2.4" y="9.6" width="1.1" height="1.4" rx="0.25"
            fill={`url(#${u("pouch")})`} stroke="#0d1511" strokeWidth="0.3" />

          {/* belt + buckle + hip pouches */}
          <path d="M-3.4 15.5 L2.5 15.5 L2.7 16.6 L-3.5 16.6 Z"
            fill={`url(#${u("strap")})`} stroke="#0d1511" strokeWidth="0.35" />
          <rect x="-0.6" y="15.7" width="1.1" height="0.7" rx="0.15"
            fill="#8a958c" stroke="#0d1511" strokeWidth="0.25" />
          <path d="M-4.2 16 L-2.9 16 L-2.9 17.6 L-4.1 17.5 Z"
            fill={`url(#${u("pouch")})`} stroke="#0d1511" strokeWidth="0.3" />
          <path d="M2.2 16 L3.4 16.1 L3.5 17.6 L2.2 17.6 Z"
            fill={`url(#${u("pouch")})`} stroke="#0d1511" strokeWidth="0.3" />

          {/* shoulder straps */}
          <path d="M-1.6 7 L-1.2 8.4 M0.8 7 L0.6 8.4"
            stroke="#0d1511" strokeOpacity="0.55" strokeWidth="0.45" />

          {/* ===================== REAR ARM ===================== */}
          <path d="M-3.4 8.4 L-4.2 9.6 L-4.4 11.4 L-3.2 12 L-2.8 10 Z"
            fill={`url(#${u("vest")})`} stroke="#0d1511" strokeWidth="0.4" />
          <path d="M-3.8 8 L-4.6 8.6 L-4.5 9.8 L-3.4 9.4 Z"
            fill="currentColor" fillOpacity="0.55"
            stroke="#0d1511" strokeWidth="0.35" />
          <path d="M-4.2 11.4 L-2.4 12.4 L0.2 13.8 L0.6 14.9 L-2.6 13.8 L-4.4 12.6 Z"
            fill={`url(#${u("vest")})`} stroke="#0d1511" strokeWidth="0.4" />
          <path d="M0.3 13.8 L1.7 14.1 L1.9 15.5 L0.5 15.6 Z"
            fill={`url(#${u("glove")})`} stroke="#050806" strokeWidth="0.35" />

          {/* ===================== HEAD / FACE ===================== */}
          <path d="M-1.6 6 L1.4 6 L1.6 7.2 L-1.7 7.2 Z"
            fill={`url(#${u("skin")})`} stroke="#3d2a1a" strokeWidth="0.3" opacity="0.95" />
          <path d="M-1.6 6 L0.6 6 L0.6 7.2 L-1.7 7.2 Z"
            fill="#000" opacity="0.18" />

          <path d="M-2 2.6 L2.6 2.4 L3 4 L2.6 5.6 L1.4 6.3 L-1.6 6.3 L-2.4 5.4 Z"
            fill={`url(#${u("skin")})`} stroke="#4a3320" strokeWidth="0.35" />
          <path d="M-2.4 3.4 L-1.8 5.4 L-1.6 6.3 L-2.4 5.4 Z"
            fill="#000" opacity="0.16" />
          <path d="M0.6 5.4 L2 5 L1.6 6.3 L-0.4 6.3 Z"
            fill="#000" opacity="0.12" />

          {/* ear */}
          <path d="M-1.7 4.2 L-2.3 4.4 L-2.1 5.4 L-1.5 5.2 Z"
            fill={`url(#${u("skin")})`} stroke="#4a3320" strokeWidth="0.25" />
          {/* nose */}
          <path d="M2.5 4 L3.4 4.2 L3.3 4.9 L2.5 5 Z"
            fill={`url(#${u("skin")})`} stroke="#4a3320" strokeWidth="0.25" />
          {/* eye + highlight */}
          <ellipse cx="1.4" cy="4" rx="0.55" ry="0.32" fill="#f8fafc" />
          <circle  cx="1.55" cy="4" r="0.28" fill="#0a0f0c" />
          <circle  cx="1.65" cy="3.92" r="0.1" fill="#f8fafc" />
          <path d="M0.7 3.6 L2 3.55" stroke="#2a1c10" strokeWidth="0.3" />

          {/* ===================== HELMET ===================== */}
          <path d="M-3.4 3.4 Q-3.6 0.4 0 0.2 Q3.6 0.4 3.6 2.8 L3.4 3.6 Q0 2.6 -3.4 3.4 Z"
            fill={`url(#${u("helmetBack")})`} />
          <path d="M-3.6 3.6 Q-4 0.6 0 0.3 Q4 0.6 4 3.4 L4.2 4.3 Q0 5.2 -4 4.3 Z"
            fill={`url(#${u("helmet")})`} stroke="#0d1511" strokeWidth="0.45" />
          <path d="M-4.2 4.2 L4.2 4.2 L4.6 4.9 L-4.5 4.9 Z"
            fill="currentColor" fillOpacity="0.5"
            stroke="#0d1511" strokeWidth="0.35" />
          <path d="M-4.2 4.3 L4.2 4.3"
            stroke="#f8fafc" strokeOpacity="0.4" strokeWidth="0.4" />
          <path d="M-2.2 1.2 Q0 0.6 2.4 1.3"
            fill="none" stroke="#f8fafc" strokeOpacity="0.32" strokeWidth="0.5" />
          <path d="M-3.8 2.4 L-4.2 3.6 L-3.6 3.6 L-3.2 2.4 Z"
            fill="#1c2620" stroke="#0d1511" strokeWidth="0.3" />

          {/* NVG mount */}
          <rect x="0.5" y="1.1" width="1.6" height="1" rx="0.3"
            fill="#1c2620" stroke="#0d1511" strokeWidth="0.3" />
          {/* goggles on helmet */}
          <path d="M-2.6 2.2 Q0 1.6 2.6 2.2 L2.8 3 Q0 2.4 -2.8 3 Z"
            fill={`url(#${u("lens")})`} stroke="#0d1511" strokeWidth="0.3" />
          <path d="M-2.8 2.6 L-3.8 2.8 M2.8 2.6 L3.9 2.9"
            stroke="#0d1511" strokeWidth="0.4" />
          <path d="M-1.8 2.1 L0.2 2.0"
            stroke="#f8fafc" strokeOpacity="0.7" strokeWidth="0.35" />
          {/* helmet side lamp */}
          <circle cx="-3.4" cy="2" r="0.4" fill="#1c2620" stroke="#0d1511" strokeWidth="0.25" />
          <circle cx="-3.4" cy="2" r="0.2" fill="#22d3ee" opacity="0.8" />

          {/* ===================== FRONT ARM ===================== */}
          <path d="M2.4 7.6 L3.8 8.2 L4 9.6 L2.8 9.4 Z"
            fill="currentColor" fillOpacity="0.6"
            stroke="#0d1511" strokeWidth="0.35" />
          <path d="M2.8 8 L4.4 9 L4.8 10.8 L3.6 11.2 Z"
            fill={`url(#${u("vest")})`} stroke="#0d1511" strokeWidth="0.4" />
          <path d="M3.6 10.4 L4.8 10.6 L4.9 11.6 L3.7 11.7 Z"
            fill="#1c2620" stroke="#0a0f0b" strokeWidth="0.3" />
          <path d="M3.6 11.4 L4.8 11.4 L6.6 12.8 L6.9 13.9 L4.6 13.2 L3.6 12.4 Z"
            fill={`url(#${u("vest")})`} stroke="#0d1511" strokeWidth="0.4" />
          <path d="M5.9 12.5 L7.3 12.7 L7.6 14.3 L6.2 14.2 Z"
            fill={`url(#${u("glove")})`} stroke="#050806" strokeWidth="0.35" />

          {/* ===================== RIFLE ===================== */}
          <g transform="translate(0.5 13) rotate(-6)">
            <path d="M-2.2 0.2 L-0.4 0.2 L-0.4 2 L-2.4 2.3 L-3 1.4 Z"
              fill={`url(#${u("rifle")})`} stroke="#050806" strokeWidth="0.35" />
            <path d="M-3.2 0.9 L-2.5 0.9 L-2.6 2.2 L-3.2 2.2 Z"
              fill="#1c2620" stroke="#050806" strokeWidth="0.3" />
            <path d="M-0.5 0.2 L3.6 0.2 L3.7 1.8 L-0.5 1.9 Z"
              fill={`url(#${u("rifle")})`} stroke="#050806" strokeWidth="0.35" />
            <path d="M0.2 1.8 L1 1.8 L0.7 3.6 L-0.1 3.5 Z"
              fill="#1c2620" stroke="#050806" strokeWidth="0.3" />
            <path d="M1.2 1.9 L2.2 1.9 L2.2 2.7 L1.4 2.6"
              fill="none" stroke="#050806" strokeWidth="0.3" />
            <path d="M1.9 1.8 L3 1.8 L3.4 4.6 L2.1 4.8 Z"
              fill={`url(#${u("rifle")})`} stroke="#050806" strokeWidth="0.35" />
            <path d="M2.1 2.2 L2.8 2.2"
              stroke="#5a635c" strokeWidth="0.3" opacity="0.7" />
            <path d="M3.6 0.2 L7.2 0.2 L7.2 1.9 L3.7 1.8 Z"
              fill={`url(#${u("rifle")})`} stroke="#050806" strokeWidth="0.35" />
            <path d="M4.1 0.7 L4.1 1.4 M4.7 0.7 L4.7 1.4 M5.3 0.7 L5.3 1.4 M5.9 0.7 L5.9 1.4 M6.5 0.7 L6.5 1.4"
              stroke="#050806" strokeOpacity="0.7" strokeWidth="0.35" />
            <path d="M7.2 0.6 L9.8 0.6 L9.8 1.4 L7.2 1.4 Z"
              fill={`url(#${u("rifleAccent")})`} stroke="#050806" strokeWidth="0.3" />
            <path d="M9.6 0.5 L10.4 0.5 L10.4 1.5 L9.6 1.5 Z"
              fill="#1c2620" stroke="#050806" strokeWidth="0.3" />
            {/* optic */}
            <path d="M0.8 -0.6 L3 -0.6 L3 0.2 L0.8 0.2 Z"
              fill="#1c2620" stroke="#050806" strokeWidth="0.3" />
            <ellipse cx="3" cy="-0.2" rx="0.3" ry="0.35"
              fill={`url(#${u("lens")})`} stroke="#050806" strokeWidth="0.2" />
            <path d="M1.4 0 L1.4 -0.2 M2.6 0 L2.6 -0.2"
              stroke="#050806" strokeWidth="0.3" />
            <rect x="-0.2" y="-0.3" width="0.4" height="0.5"
              fill="#1c2620" stroke="#050806" strokeWidth="0.2" />
            <path d="M-0.4 0.5 L-0.6 0.5 L-0.6 1.1 L-0.4 1.1"
              fill="none" stroke="#050806" strokeWidth="0.3" />
            <path d="M-1.6 1.6 Q-0.5 2.6 0.6 2.1"
              fill="none" stroke="#222a24" strokeWidth="0.3" />
            <path d="M-0.3 0.4 L3.4 0.4"
              stroke="#f8fafc" strokeOpacity="0.28" strokeWidth="0.4" />
            <path d="M3.9 0.4 L7 0.4"
              stroke="#f8fafc" strokeOpacity="0.25" strokeWidth="0.4" />
          </g>

          {/* ===================== FINAL RIM LIGHT ===================== */}
          <path d="M-3.6 3 Q-3.8 1 0 0.5"
            fill="none" stroke="#f8fafc" strokeOpacity="0.4" strokeWidth="0.5" />
          <path d="M2.6 7.8 L3.8 8.4"
            stroke="#f8fafc" strokeOpacity="0.3" strokeWidth="0.4" />
          <path d="M-5 24.6 L3.4 24.4"
            stroke="#000" strokeOpacity="0.4" strokeWidth="0.8"
            filter={`url(#${u("soft2")})`} />
        </g>
      ))}
    </g>
  );
}