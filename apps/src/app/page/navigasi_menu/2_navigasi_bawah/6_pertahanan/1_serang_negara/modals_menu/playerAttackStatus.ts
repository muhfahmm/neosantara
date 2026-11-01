'use client';

import { useEffect, useState } from 'react';

export interface PlayerAttackStatus {
  targetCountry: string;
  targetCityName?: string;
  startedAt: number;
}

declare global {
  interface Window {
    neosantara_player_attack?: PlayerAttackStatus | null;
  }
}

const PLAYER_ATTACK_CHANGED_EVENT = 'neosantara_player_attack_changed';

export function getActivePlayerAttack(): PlayerAttackStatus | null {
  if (typeof window === 'undefined') return null;

  const status = window.neosantara_player_attack;
  if (
    !status ||
    typeof status.targetCountry !== 'string' ||
    !status.targetCountry.trim() ||
    !Number.isFinite(status.startedAt)
  ) {
    return null;
  }

  return status;
}

export function setActivePlayerAttack(status: PlayerAttackStatus | null): void {
  if (typeof window === 'undefined') return;

  window.neosantara_player_attack = status;
  window.dispatchEvent(new CustomEvent(PLAYER_ATTACK_CHANGED_EVENT));
}

export function usePlayerAttackStatus(): PlayerAttackStatus | null {
  const [status, setStatus] = useState<PlayerAttackStatus | null>(null);

  useEffect(() => {
    const updateStatus = () => setStatus(getActivePlayerAttack());
    updateStatus();
    window.addEventListener(PLAYER_ATTACK_CHANGED_EVENT, updateStatus);
    return () => window.removeEventListener(PLAYER_ATTACK_CHANGED_EVENT, updateStatus);
  }, []);

  return status;
}
