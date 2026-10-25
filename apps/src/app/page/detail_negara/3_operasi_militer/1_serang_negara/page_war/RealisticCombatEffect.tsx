'use client';

import React, { memo, useMemo } from 'react';

export interface CombatStrike {
  id: string;
  start: { x: number; y: number };
  target: { x: number; y: number };
  weaponType: number; // 0 = Artileri/Roket, 1 = Rudal Udara, 2 = Torpedo Laut, 3 = Meriam Laut, 4 = Tank/Infanteri
  travelMs: number;
}

export const COMBAT_EFFECT_CSS = `
.cb-tracer {
  animation: cb-tracer-anim .35s linear infinite;
}
.cb-missile-smoke {
  animation: cb-smoke-drift .8s ease-out forwards;
}
.cb-muzzle-flash {
  animation: cb-muzzle-pop .32s ease-out forwards;
}
.cb-blast-wave {
  animation: cb-shockwave .65s cubic-bezier(0.1, 0.8, 0.3, 1) forwards;
}
.cb-fireball {
  animation: cb-fireball-pop .55s ease-out forwards;
}
.cb-debris {
  animation: cb-debris-scatter .6s cubic-bezier(0.2, 0.7, 0.4, 1) forwards;
}

@keyframes cb-tracer-anim {
  from { stroke-dashoffset: 0; }
  to { stroke-dashoffset: -72; }
}
@keyframes cb-muzzle-pop {
  0% { transform: scale(0.3); opacity: 1; }
  40% { transform: scale(1.6); opacity: 0.95; }
  100% { transform: scale(2.2); opacity: 0; }
}
@keyframes cb-shockwave {
  0% { r: 6; opacity: 1; stroke-width: 8; }
  50% { opacity: 0.7; stroke-width: 5; }
  100% { r: 68; opacity: 0; stroke-width: 1; }
}
@keyframes cb-fireball-pop {
  0% { transform: scale(0.2); opacity: 1; }
  35% { transform: scale(1.5); opacity: 0.92; }
  75% { transform: scale(2.0); opacity: 0.5; }
  100% { transform: scale(2.4); opacity: 0; }
}
@keyframes cb-smoke-drift {
  0% { transform: scale(0.8) translateY(0); opacity: 0.8; }
  100% { transform: scale(2.2) translateY(-14px); opacity: 0; }
}
@keyframes cb-debris-scatter {
  0% { transform: translate(0, 0) scale(1); opacity: 1; }
  100% { transform: translate(var(--dx), var(--dy)) scale(0.2); opacity: 0; }
}
`;

/**
 * Konfigurasi profil proyektil dan karakteristik senjata realistis
 */
export const WEAPON_PROFILES: Record<number, {
  color: string;
  glowColor: string;
  coreColor: string;
  width: number;
  dash: string;
  isMissile: boolean;
  blastRadius: number;
}> = {
  // 0: Artileri Berat / Howitzer / MLRS (Proyektil eksplosif berdaya hancur tinggi)
  0: {
    color: '#f59e0b',
    glowColor: '#ea580c',
    coreColor: '#fef08a',
    width: 9,
    dash: '24 16',
    isMissile: false,
    blastRadius: 58,
  },
  // 1: Rudal Udara / Anti-Air Missile / Jet Strike (Rudal jet berpemandu dengan ekor asap)
  1: {
    color: '#f43f5e',
    glowColor: '#e11d48',
    coreColor: '#ffe4e6',
    width: 7,
    dash: '34 18',
    isMissile: true,
    blastRadius: 48,
  },
  // 2: Torpedo / Kapal Selam Nuklir
  2: {
    color: '#06b6d4',
    glowColor: '#0891b2',
    coreColor: '#cffafe',
    width: 6,
    dash: '18 16',
    isMissile: false,
    blastRadius: 44,
  },
  // 3: Meriam Kapal Destroyer / Frigate
  3: {
    color: '#fb923c',
    glowColor: '#c2410c',
    coreColor: '#ffedd5',
    width: 8,
    dash: '22 14',
    isMissile: false,
    blastRadius: 52,
  },
  // 4: Tank MBT Main Gun / Senapan Mesin Berat APC / Kaliber Darat
  4: {
    color: '#84cc16',
    glowColor: '#4d7c0f',
    coreColor: '#f7fee7',
    width: 5.5,
    dash: '16 12',
    isMissile: false,
    blastRadius: 40,
  },
  // 5: Rudal Anti-Air Berpemandu (SAM / SPAAG / AAM Interceptor)
  5: {
    color: '#e879f9', // Ungu / magenta elektrik khusus misil pelacak udara
    glowColor: '#c026d3',
    coreColor: '#fdf4ff',
    width: 6.5,
    dash: '40 10', // Jejak misil pelacak yang panjang dan tajam
    isMissile: true,
    blastRadius: 46,
  },
};


/**
 * Komponen Efek Tembakan Tempur Realistis (Realistic Combat Strike Overlay)
 */
export const RealisticCombatEffect = memo(function RealisticCombatEffect({
  strike,
  strikes,
}: {
  strike?: CombatStrike | null;
  strikes?: CombatStrike[];
}) {
  const activeStrikes = useMemo(() => {
    if (strikes && strikes.length > 0) return strikes;
    if (strike) return [strike];
    return [];
  }, [strike, strikes]);

  if (activeStrikes.length === 0) return null;

  return (
    <g pointerEvents="none" className="realistic-combat-effect">
      <defs>
        {/* Glow neon intensif untuk proyektil dan moncong senjata */}
        <filter id="cb-muzzle-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <radialGradient id="cb-fireball-grad">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
          <stop offset="25%" stopColor="#fef08a" stopOpacity="0.95" />
          <stop offset="55%" stopColor="#f97316" stopOpacity="0.85" />
          <stop offset="85%" stopColor="#dc2626" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#1e293b" stopOpacity="0" />
        </radialGradient>
      </defs>

      {activeStrikes.map((s) => (
        <SingleCombatStrike key={s.id} strike={s} />
      ))}
    </g>
  );
});

const SingleCombatStrike = memo(function SingleCombatStrike({ strike }: { strike: CombatStrike }) {
  const profile = WEAPON_PROFILES[strike.weaponType] ?? WEAPON_PROFILES[4];
  const { start, target, travelMs } = strike;

  // Sudut rotasi penembakan (arah peluru/rudal)
  const angleDeg = useMemo(() => {
    return (Math.atan2(target.y - start.y, target.x - start.x) * 180) / Math.PI;
  }, [start, target]);

  // Vektor sebaran serpihan (shrapnel debris) ledakan
  const debrisParticles = useMemo(() => {
    return [
      { dx: '28px', dy: '-28px' },
      { dx: '-32px', dy: '-18px' },
      { dx: '36px', dy: '24px' },
      { dx: '-24px', dy: '34px' },
      { dx: '0px', dy: '-42px' },
      { dx: '-40px', dy: '0px' },
    ];
  }, []);

  return (
    <g key={strike.id}>
      {/* ────────────────── 1. KILATAN MONCONG TEMBAKAN (MUZZLE FLASH) ────────────────── */}
      <g transform={`translate(${start.x} ${start.y}) rotate(${angleDeg})`}>
        {/* Kilatan kerucut api moncong meriam/senjata */}
        <polygon
          className="cb-muzzle-flash"
          points="0,-12 36,0 0,12"
          fill="#fef08a"
          filter="url(#cb-muzzle-glow)"
        />
        <circle className="cb-muzzle-flash" r="18" fill="#ffedd5" opacity="0.9" />
        <circle className="cb-muzzle-flash" r="10" fill="#ffffff" />
      </g>

      {/* ────────────────── 2. TRAIL / BEAM PROYEKTIL & RUDAL ────────────────── */}
      {/* Lapisan 1: Pendar Cahaya Luar (Atmospheric Light Glow) */}
      <path
        d={`M ${start.x} ${start.y} L ${target.x} ${target.y}`}
        fill="none"
        stroke={profile.glowColor}
        strokeWidth={profile.width * 2.8}
        opacity="0.38"
        strokeLinecap="round"
        filter="url(#cb-muzzle-glow)"
      />

      {/* Lapisan 2: Jalur Tracer Berkecepatan Tinggi */}
      <path
        className="cb-tracer"
        d={`M ${start.x} ${start.y} L ${target.x} ${target.y}`}
        fill="none"
        stroke={profile.color}
        strokeWidth={profile.width}
        strokeDasharray={profile.dash}
        strokeLinecap="round"
        style={{ animationDuration: `${Math.max(80, travelMs / 3)}ms` }}
      />

      {/* Lapisan 3: Inti Cahaya Peluru Panas (White-Hot Core) */}
      <path
        className="cb-tracer"
        d={`M ${start.x} ${start.y} L ${target.x} ${target.y}`}
        fill="none"
        stroke={profile.coreColor}
        strokeWidth={Math.max(2, profile.width * 0.45)}
        strokeDasharray={profile.dash}
        strokeLinecap="round"
        style={{ animationDuration: `${Math.max(80, travelMs / 3)}ms` }}
      />

      {/* Jika proyektil berupa rudal: Tambahkan jejak partikel asap di ekor rudal */}
      {profile.isMissile && (
        <g transform={`translate(${(start.x + target.x) / 2} ${(start.y + target.y) / 2})`}>
          <circle className="cb-missile-smoke" r="14" fill="#94a3b8" opacity="0.5" />
          <circle className="cb-missile-smoke" r="8" fill="#e2e8f0" opacity="0.7" style={{ animationDelay: '0.1s' }} />
        </g>
      )}

      {/* ────────────────── 3. LEDAKAN DAMPAK SASARAN (IMPACT BLAST) ────────────────── */}
      <g transform={`translate(${target.x} ${target.y})`}>
        {/* Gelombang kejut (Shockwave ring) */}
        <circle
          className="cb-blast-wave"
          fill="none"
          stroke={profile.coreColor}
        />

        {/* Bola api ledakan (Fireball) */}
        <circle
          className="cb-fireball"
          r={profile.blastRadius}
          fill="url(#cb-fireball-grad)"
          filter="url(#cb-muzzle-glow)"
        />

        {/* Kilatan inti dampak putih terang */}
        <circle
          className="cb-muzzle-flash"
          r={profile.blastRadius * 0.45}
          fill="#ffffff"
          opacity="0.95"
        />

        {/* Serpihan ledakan / Shrapnel Debris melayang */}
        {debrisParticles.map((deb, idx) => (
          <circle
            key={idx}
            className="cb-debris"
            cx="0"
            cy="0"
            r="3.5"
            fill={idx % 2 === 0 ? '#f97316' : '#475569'}
            style={{
              ['--dx' as string]: deb.dx,
              ['--dy' as string]: deb.dy,
              animationDelay: `${idx * 0.04}s`,
            }}
          />
        ))}
      </g>
    </g>
  );
});

export default RealisticCombatEffect;
