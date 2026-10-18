'use client';

import React from 'react';
import DiplomacyPathAnimation from './diplomacy-path-animation';

interface SerangNegaraPathProps {
  senderCountry: string;
  targetCountry: string;
  laneIndex?: number;
  laneCount?: number;
  onProgress?: (progress: number) => void;
  onArrive: () => void;
  isPlayerAttacker?: boolean;
}

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
      kind="serang-negara"
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
