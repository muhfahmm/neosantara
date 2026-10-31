export interface RequestedInvasionOutcomeInput {
  attackerPower: number;
  targetPower: number;
  roll: number;
}

export interface RequestedInvasionOutcome {
  attackerWins: boolean;
  winChance: number;
  message: string;
}

export function resolveRequestedInvasionOutcome({
  attackerPower,
  targetPower,
  roll,
}: RequestedInvasionOutcomeInput): RequestedInvasionOutcome {
  const winChance = attackerPower > targetPower
    ? 0.6
    : attackerPower < targetPower
      ? 0.4
      : 0.5;
  const normalizedRoll = Math.min(1, Math.max(0, roll));

  return {
    attackerWins: normalizedRoll < winChance,
    winChance,
    message: `Peluang kemenangan operasi berbayar: ${Math.round(winChance * 100)}%.`,
  };
}
