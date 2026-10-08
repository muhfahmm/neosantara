const MILITARY_RESEARCH_LEVEL_BONUS = [0, 2, 5, 8, 12, 15];

const MILITARY_RESEARCH_UNITS: Record<string, string[]> = {
  tank_generasi_baru: ["tank_tempur_utama"],
  drone_otonom: ["drone_intai_uav"],
  senjata_infanteri: ["pasukan_infanteri"],
  radar_pesisir: ["kapal_destroyer"],
  benteng_perbatasan: ["apc_ifv"],
  kapal_stealth: ["kapal_korvet"],
  artileri_presisi: ["artileri_berat"],
  kapal_selam_diesel: ["kapal_selam_regular"],
  helikopter_serang: ["helikopter_serang"],
  jet_siluman: ["jet_tempur_siluman"],
  satelit_mata_mata: ["pesawat_pengintai"],
  rudal_jelajah: ["sistem_peluncur_roket"],
  sistem_sam: ["pertahanan_udara_mobile"],
  pasukan_khusus: ["kendaraan_taktis"],
  rudal_hipersonik: ["pesawat_pengebom"],
  program_nuklir: ["kapal_induk_nuklir"],
  kapal_induk: ["kapal_induk"],
  laser_defensif: ["drone_kamikaze"],
  baju_baja_eksoskeleton: ["jet_tempur_interceptor"],
  pertahanan_nuklir: ["kapal_selam_nuklir"],
  senjata_orbit: ["kapal_ranjau"],
  komando_otonom_ai: ["kapal_logistik"],
  pasukan_kloning: ["pesawat_angkut"],
};

export function getMilitaryResearchBaseBonus(researchId: string): number | undefined {
  return getMilitaryResearchLevelBonus(researchId, 1);
}

export function getMilitaryResearchLevelBonus(researchId: string, level: number): number | undefined {
  if (!MILITARY_RESEARCH_UNITS[researchId]) return undefined;
  const normalizedLevel = Math.min(
    MILITARY_RESEARCH_LEVEL_BONUS.length - 1,
    Math.max(1, Math.floor(level))
  );
  return MILITARY_RESEARCH_LEVEL_BONUS[normalizedLevel];
}

const RESEARCH_BY_UNIT = new Map<string, string[]>();
for (const [researchId, unitKeys] of Object.entries(MILITARY_RESEARCH_UNITS)) {
  for (const unitKey of unitKeys) {
    const researchIds = RESEARCH_BY_UNIT.get(unitKey) ?? [];
    researchIds.push(researchId);
    RESEARCH_BY_UNIT.set(unitKey, researchIds);
  }
}

export function getMilitaryResearchStrengthMultiplier(
  countryDetail: Record<string, unknown> | null | undefined,
  unitKey: string
): number {
  if (!countryDetail) return 1;

  const researchIds = RESEARCH_BY_UNIT.get(unitKey);
  if (!researchIds) return 1;

  const completedResearch = Array.isArray(countryDetail.completed_research)
    ? countryDetail.completed_research
    : [];
  const researchLevels =
    countryDetail.research_levels && typeof countryDetail.research_levels === "object"
      ? countryDetail.research_levels as Record<string, unknown>
      : {};

  const bonusPercent = researchIds.reduce((total, researchId) => {
    if (!completedResearch.includes(researchId)) return total;
    const storedLevel = Number(researchLevels[researchId]) || 1;
    return total + (getMilitaryResearchLevelBonus(researchId, storedLevel) ?? 0);
  }, 0);

  const cappedBonusPercent = Math.min(MILITARY_RESEARCH_LEVEL_BONUS.at(-1) ?? 15, bonusPercent);
  return 1 + cappedBonusPercent / 100;
}
