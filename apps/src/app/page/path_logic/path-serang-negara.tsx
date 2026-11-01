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
  <g transform="scale(1.45)">
    <circle r="36" fill={accent} opacity=".18" className="diplomacy-glyph-glow" />
    <ellipse cx="1" cy="3" rx="27" ry="15" fill="#000000" opacity=".45" />

    <rect x="-21" y="-13" width="42" height="6.5" rx="2" fill="#3A0714" />
    <rect x="-21" y="-13" width="42" height="1.8" rx=".9" fill="#8B1030" />
    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(index => (
      <rect key={`far-track-${index}`} x={-19 + index * 4.1} y="-12.3" width="2.4" height="5" fill="#1A0208" opacity=".55" />
    ))}
    <rect x="-21" y="6.5" width="42" height="6.5" rx="2" fill="#3A0714" />
    <rect x="-21" y="6.5" width="42" height="1.8" rx=".9" fill="#8B1030" />
    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(index => (
      <rect key={`near-track-${index}`} x={-19 + index * 4.1} y="7.3" width="2.4" height="5" fill="#1A0208" opacity=".55" />
    ))}

    {[-16, -10, -4, 2, 8, 14].map(x => (
      <g key={`road-wheel-${x}`}>
        <circle cx={x} cy="-10.5" r="1.6" fill="#6B1020" />
        <circle cx={x} cy="10.5" r="1.6" fill="#6B1020" />
      </g>
    ))}
    {[-18, 18].map(x => (
      <g key={`sprocket-${x}`}>
        <circle cx={x} cy="-10" r="2.6" fill="#B71C3A" stroke="#3A0714" strokeWidth=".5" />
        <circle cx={x} cy="10" r="2.6" fill="#B71C3A" stroke="#3A0714" strokeWidth=".5" />
      </g>
    ))}

    <path d="M-21,-6 L-19,-6.5 L18,-6.5 L21,-3.5 L21,3.5 L18,6.5 L-19,6.5 L-21,6 Z" fill={accent} stroke="#6B1020" strokeWidth=".9" />
    <path d="M-19,-6 L18,-6 L20,-3 L-20,-3 Z" fill="#FF5C7E" opacity=".55" />
    <path d="M18,-6.5 L21,-3.5 L21,3.5 L18,6.5 L19,3 L19,-3 Z" fill="#FF7096" opacity=".7" />
    <path d="M-21,-6 L-19,-6.5 L-19,6.5 L-21,6 Z" fill="#B71C3A" />
    <path d="M-14,-6 L-14,6 M13,-6 L13,6" stroke="#6B1020" strokeWidth=".5" opacity=".55" />
    <circle cx="19.5" cy="-4.2" r=".9" fill="#FFE5EC" />
    <circle cx="19.5" cy="4.2" r=".9" fill="#FFE5EC" />

    <ellipse cx="-2" cy="0" rx="10.5" ry="7" fill="#B71C3A" />
    <path d="M-10,-4 L6,-4.5 L9,-2 L9,2 L6,4.5 L-10,4 L-12,2 L-12,-2 Z" fill={accent} stroke="#6B1020" strokeWidth=".7" />
    <path d="M-10,-3.5 L6,-4 L8.5,-1.5 L-11,-1.5 Z" fill="#FF7096" opacity=".5" />
    <path d="M6,-4.5 L9,-2 L9,2 L6,4.5 L8,2 L8,-2 Z" fill="#B71C3A" opacity=".7" />
    <circle cx="-5" cy="-1" r="2.2" fill="#D01A42" stroke="#6B1020" strokeWidth=".5" />
    <circle cx="-5" cy="-1" r="1.1" fill="#FF7096" opacity=".6" />
    <circle cx="-5" cy="-1" r=".5" fill="#6B1020" />
    <circle cx="1" cy="1.5" r="1.3" fill="#D01A42" stroke="#6B1020" strokeWidth=".4" />
    <circle cx="1" cy="1.5" r=".5" fill="#B71C3A" />

    <rect x="8" y="-2.5" width="4" height="5" rx="1" fill="#B71C3A" stroke="#6B1020" strokeWidth=".5" />
    <rect x="11" y="-1.3" width="19" height="2.6" fill="#D01A42" />
    <rect x="11" y="-1.3" width="19" height=".9" fill="#FF7096" opacity=".55" />
    <rect x="11" y=".7" width="19" height=".6" fill="#6B1020" opacity=".5" />
    <rect x="19" y="-1.8" width="3" height="3.6" rx=".7" fill="#B71C3A" stroke="#6B1020" strokeWidth=".3" />
    <rect x="30" y="-2" width="4.5" height="4" rx=".8" fill="#3A0714" stroke="#1A0208" strokeWidth=".4" />
    <rect x="30" y="-2" width="4.5" height="1.2" rx=".4" fill="#B71C3A" />
    <ellipse cx="34.5" cy="0" rx=".6" ry="1.6" fill="#1A0208" />
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
