import { gameStateStorage } from '@/app/logic/gameStateStorage';
export function addPlayerDiamonds(amount: number): number {
  if (typeof window === 'undefined' || amount <= 0) return 0;
  try {
    const saved = gameStateStorage.getItem('player_diamonds');
    const current = saved !== null ? parseInt(saved, 10) || 0 : 500;
    const nextTotal = current + amount;
    gameStateStorage.setItem('player_diamonds', nextTotal.toString());
    window.dispatchEvent(new CustomEvent('player_diamonds_updated', {
      detail: { diamonds: nextTotal, added: amount },
    }));
    return nextTotal;
  } catch {
    return 0;
  }
}
