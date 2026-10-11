import { getCabinetMinistryBonusPercent } from "./ministryBonusUtils";

export function getKementerianPembangunanBuildSpeedBonusPercent(
  countryDetail: Record<string, unknown> | null | undefined
): number {
  return getCabinetMinistryBonusPercent(countryDetail, "pembangunan");
}
