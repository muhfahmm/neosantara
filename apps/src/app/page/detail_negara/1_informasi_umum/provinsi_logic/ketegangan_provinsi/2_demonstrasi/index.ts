export interface DemonstrationResolution {
  occurred: boolean;
  chance: number;
}

export function getProvinceDemonstrationChance(tension: number): number {
  if (tension >= 100) return 0;
  return tension >= 90 ? 60 : tension >= 81 ? 25 : tension >= 66 ? 10 : 0;
}

export function resolveProvinceDemonstration(tension: number): DemonstrationResolution {
  const chance = getProvinceDemonstrationChance(tension);
  return {
    occurred: chance > 0 && Math.random() * 100 < chance,
    chance
  };
}
