export const RESEARCH_CARD_LEVEL_BONUS = [0, 2, 4, 7, 10, 15];

export function normalizeResearchLevels(value: unknown): Record<string, unknown> {
  let researchLevels = value;

  if (typeof researchLevels === "string") {
    try {
      researchLevels = JSON.parse(researchLevels);
    } catch (error) {
      console.error("Unable to parse saved research levels", error);
      return {};
    }
  }

  if (!researchLevels || typeof researchLevels !== "object" || Array.isArray(researchLevels)) {
    return {};
  }

  return researchLevels as Record<string, unknown>;
}

export function getResearchCardLevel(researchLevels: unknown, researchId: string): number {
  const storedLevel = Number(normalizeResearchLevels(researchLevels)[researchId]);
  if (!Number.isFinite(storedLevel) || storedLevel < 1) return 1;

  return Math.min(RESEARCH_CARD_LEVEL_BONUS.length - 1, Math.floor(storedLevel));
}

export function getResearchCardBonus(level: number): number {
  if (!Number.isFinite(level) || level < 1) return 0;

  const normalizedLevel = Math.min(
    RESEARCH_CARD_LEVEL_BONUS.length - 1,
    Math.floor(level)
  );
  return RESEARCH_CARD_LEVEL_BONUS[normalizedLevel];
}
