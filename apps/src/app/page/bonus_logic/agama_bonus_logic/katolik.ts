export const CATHOLIC_UN_VOTE_BONUS = 10;

export function applyCatholicVoteBonus(baseVotes: number, religion: unknown): number {
  const normalizedReligion = String(religion || "").trim().toLowerCase();
  return baseVotes + (
    normalizedReligion === "katolik"
      ? CATHOLIC_UN_VOTE_BONUS
      : 0
  );
}
