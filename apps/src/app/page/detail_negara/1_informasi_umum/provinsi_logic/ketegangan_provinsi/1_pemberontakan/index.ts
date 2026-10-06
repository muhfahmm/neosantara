export interface RebellionResolution {
  occurred: boolean;
  tensionIncrease: number;
  referendumRequired: boolean;
}

export function getProvinceRebellionChance(tension: number): number {
  if (tension >= 100) return 0;
  return tension >= 90 ? 25 : tension >= 81 ? 5 : tension >= 66 ? 1 : 0;
}

export function resolveProvinceRebellion(tension: number): RebellionResolution {
  if (tension >= 100) {
    return { occurred: false, tensionIncrease: 0, referendumRequired: false };
  }

  const rebellionChance = getProvinceRebellionChance(tension);
  if (rebellionChance === 0 || Math.random() * 100 >= rebellionChance) {
    return { occurred: false, tensionIncrease: 0, referendumRequired: false };
  }

  const requestedIncrease = 10 + Math.floor(Math.random() * 21);
  const tensionIncrease = Math.min(100 - tension, requestedIncrease);
  const nextTension = tension + tensionIncrease;
  return {
    occurred: true,
    tensionIncrease,
    referendumRequired: nextTension >= 100
  };
}
