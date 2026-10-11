import { getDepartmentLevel } from "@/app/logic/economic_logic/treasuryUpdater";

const MINISTER_TIER_BONUS_PERCENT = [0, 5, 10, 15, 20, 50];

export function getCabinetMinistryBonusPercent(
  countryDetail: Record<string, unknown> | null | undefined,
  departmentId: string
): number {
  if (!countryDetail) return 0;

  const ministerTier = Number(countryDetail[`menteri_${departmentId}`]) || 0;
  const ministerBonus = MINISTER_TIER_BONUS_PERCENT[ministerTier] ?? 0;
  return getDepartmentLevel(countryDetail, departmentId) + ministerBonus;
}
