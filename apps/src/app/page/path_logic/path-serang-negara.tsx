'use client';

import React from 'react';
import DiplomacyPathAnimation, { type DiplomacyPathMetadata, type DiplomacyPathProps, type DiplomacyPathVehicle } from './diplomasi/diplomacy-path-animation';

type SerangNegaraPathProps = DiplomacyPathProps;

function SerangNegaraIcon() {
  return (
    <>
      <path d="M-6,-5 L-1,0 L-6,5 M6,-5 L1,0 L6,5" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </>
  );
}

const SerangNegaraVehicle: DiplomacyPathVehicle = ({ accent }) => (
  <g>
    <circle r="28" fill={accent} opacity=".14" className="diplomacy-glyph-glow" /><ellipse cx="0" cy="4" rx="26" ry="11" fill="#000" opacity=".45" />
    <rect x="-16" y="-9.5" width="7.5" height="3.5" rx="1.5" fill="#111" /><rect x="-16" y="6" width="7.5" height="3.5" rx="1.5" fill="#111" />
    <rect x="10" y="-9.5" width="7.5" height="3.5" rx="1.5" fill="#111" /><rect x="10" y="6" width="7.5" height="3.5" rx="1.5" fill="#111" />
    <path d="M-22,-6 L16,-6 C22,-6 25,-3 25,0 C25,3 22,6 16,6 L-22,6 C-25,6 -26,3 -26,0 C-26,-3 -25,-6 -22,-6 Z" fill={accent} />
    <path d="M-22,-6 L16,-6 C22,-6 25,-3 25,0 L-26,0 Z" fill="#fff" opacity=".22" /><path d="M-22,6 L16,6 C22,6 25,3 25,0 L-26,0 Z" fill="#000" opacity=".25" />
    <path d="M-10,-5 L9,-5 C12,-5 14,-2 14,0 C14,2 12,5 9,5 L-10,5 C-13,5 -14,2 -14,0 C-14,-2 -13,-5 -10,-5 Z" fill={accent} /><path d="M-10,-5 L9,-5 C12,-5 14,-2 14,0 L-14,0 Z" fill="#fff" opacity=".35" />
    <path d="M10,-4 L12.5,-1 L12.5,1 L10,4 Z M-11,-4 L-13.5,-1 L-13.5,1 L-11,4 Z" fill="#0A1A1A" opacity=".85" />
    <g transform="scale(.55)"><SerangNegaraIcon /></g>
    <path d="M23,-4 L25.5,-2 L25.5,-1 L23,0 Z M23,4 L25.5,2 L25.5,1 L23,0 Z" fill="#fff" opacity=".95" /><path d="M-26,-4 L-24,-2 L-24,-1 L-26,0 Z M-26,4 L-24,2 L-24,1 L-26,0 Z" fill="#FF2D55" opacity=".9" />
  </g>
);

export const PATH_METADATA: DiplomacyPathMetadata = {
  kind: 'serang-negara',
  document: 'Serangan Militer',
  accent: '#FF2D55',
  Icon: SerangNegaraIcon,
  Vehicle: SerangNegaraVehicle,
};

/**
 * Path Animation untuk serangan militer antar negara (Serang Negara)
 * Menggunakan base DiplomacyPathAnimation dengan kind='serang-negara'
 * 
 * Digunakan untuk menampilkan:
 * - Armada militer yang bergerak dari attacker ke target
 * - Animasi di atas peta dunia
 * - Progress tracking di Pelacakan Aktivitas
 */
export default function SerangNegaraPath({
  senderCountry,
  targetCountry,
  laneIndex = 0,
  laneCount = 1,
  onProgress,
  onArrive,
  isPlayerAttacker,
}: SerangNegaraPathProps) {
  return (
    <DiplomacyPathAnimation
      kind={PATH_METADATA.kind}
      accent={PATH_METADATA.accent}
      Vehicle={PATH_METADATA.Vehicle}
      senderCountry={senderCountry}
      targetCountry={targetCountry}
      laneIndex={laneIndex}
      laneCount={laneCount}
      onProgress={onProgress}
      onArrive={onArrive}
      isPlayerAttacker={isPlayerAttacker}
    />
  );
}
