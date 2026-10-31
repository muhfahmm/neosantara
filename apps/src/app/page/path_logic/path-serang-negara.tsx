'use client';

import React from 'react';
import DiplomacyPathAnimation, { type DiplomacyPathMetadata, type DiplomacyPathProps } from './diplomacy-path-animation';

type SerangNegaraPathProps = DiplomacyPathProps;

export const PATH_METADATA: DiplomacyPathMetadata = {
  kind: 'serang-negara',
  document: 'Serangan Militer',
  accent: '#FF2D55',
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
