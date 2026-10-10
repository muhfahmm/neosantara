import { normalizeResearchLevels } from "../../researchCardLevelBonus";

export const KURSI_TETAP_DEWAN_PBB_RESEARCH_ID = "kursi_tetap_dewan_pbb";
export const KURSI_TETAP_DEWAN_PBB_LEGACY_ID = "kursi_dewan_keamanan";

/**
 * Memeriksa apakah suatu negara telah meneliti/membuka "Kursi Tetap Dewan Keamanan PBB".
 */
export function hasPermanentSecurityCouncilSeatResearch(
  countryDetail: Record<string, unknown> | null | undefined
): boolean {
  if (!countryDetail) return false;

  const completedResearch = Array.isArray(countryDetail.completed_research)
    ? (countryDetail.completed_research as string[])
    : [];

  return (
    completedResearch.includes(KURSI_TETAP_DEWAN_PBB_RESEARCH_ID) ||
    completedResearch.includes(KURSI_TETAP_DEWAN_PBB_LEGACY_ID)
  );
}
