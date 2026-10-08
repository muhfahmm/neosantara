import { getIslamProductionMultiplier } from "./agama_bonus_logic/islam";
import { getShintoElectricityProductionMultiplier } from "./agama_bonus_logic/shinto";
import { getCommunismProductionMultiplier } from "./ideologi_bonus_logic/komunisme";
import { getNationalismProductionMultiplier } from "./ideologi_bonus_logic/nasionalisme";

import { getFAOProductionMultiplier, isMemberOfFAO } from "./organisasi_bonus_logic/organisasi_pbb/fao";
import { getILOProductionMultiplier, isMemberOfILO } from "./organisasi_bonus_logic/organisasi_pbb/ilo";
import { getOKIFoodProductionMultiplier, isMemberOfOKI } from "./organisasi_bonus_logic/organisasi_regional/oki";
import { PRODUCTION_BAN_CATEGORIES } from "../navigasi_menu/2_navigasi_bawah/7_geopolitik/1_PBB/1_resolusi_PBB/logic/productionBanCatalog";

const RESEARCH_CARD_LEVEL_BONUS = [0, 2, 5, 8, 12, 15];
const RESEARCH_CARDS_BY_PRODUCTION_SECTOR: Record<string, string[]> = {
  manufaktur: ["otomasi_industri", "manufaktur_material", "manufaktur_terintegrasi", "manufaktur_lanjut"],
  peternakan: ["peternakan_modern", "peternakan_genetika", "peternakan_otomatis", "peternakan_berkelanjutan"],
  agrikultur: ["pertanian_presisi", "perkebunan_komoditas", "agrikultur_cerdas", "agrikultur_tangguh"],
  perikanan: ["perikanan_modern", "perikanan_pascapanen", "perikanan_cerdas", "perikanan_berkelanjutan"],
  "olahan pangan": ["pengolahan_pangan", "pengawetan_pangan", "pangan_efisien", "industri_pangan_terpadu"],
};

const RESEARCH_SECTOR_BY_PRODUCT = new Map<string, string>();
for (const category of PRODUCTION_BAN_CATEGORIES) {
  if (!Object.prototype.hasOwnProperty.call(RESEARCH_CARDS_BY_PRODUCTION_SECTOR, category.id)) continue;
  for (const product of category.products) {
    RESEARCH_SECTOR_BY_PRODUCT.set(product, category.id);
  }
}

function getResearchProductionMultiplier(
  countryDetail: Record<string, unknown> | null | undefined,
  resourceKey: string
): number {
  const normalizedResourceKey = resourceKey.trim().toLowerCase().replace(/^\d+_/, "");
  const sector = RESEARCH_SECTOR_BY_PRODUCT.get(normalizedResourceKey);
  if (!sector || !countryDetail) return 1;

  const completedResearch = Array.isArray(countryDetail.completed_research)
    ? countryDetail.completed_research
    : [];
  const researchLevels = countryDetail.research_levels && typeof countryDetail.research_levels === "object"
    ? countryDetail.research_levels as Record<string, unknown>
    : {};

  const sectorBonusPercent = RESEARCH_CARDS_BY_PRODUCTION_SECTOR[sector].reduce((total, researchId) => {
    if (!completedResearch.includes(researchId)) return total;
    const storedLevel = Number(researchLevels[researchId]) || 1;
    const level = Math.min(RESEARCH_CARD_LEVEL_BONUS.length - 1, Math.max(1, Math.floor(storedLevel)));
    const levelBonus = RESEARCH_CARD_LEVEL_BONUS[level];
    return total + 2 * (1 + levelBonus / 100);
  }, 0);

  return 1 + sectorBonusPercent / 100;
}

export function getProductionBonusMultiplier(
  countryDetail: Record<string, unknown> | null | undefined,
  resourceKey: string
): number {
  const countryName = String(countryDetail?.country || countryDetail?.nama || "").trim();
  const religion = countryDetail?.religion
    ?? countryDetail?.agama_utama
    ?? countryDetail?.agama;
  const religiousMultiplier = String(religion || "").trim().toLowerCase() === "islam"
    ? getIslamProductionMultiplier(resourceKey)
    : String(religion || "").trim().toLowerCase() === "shinto"
      ? getShintoElectricityProductionMultiplier(resourceKey)
      : 1;
  const ideologyMultiplier = getCommunismProductionMultiplier(
    resourceKey,
    countryDetail?.ideology
  );
  const nationalismMultiplier = getNationalismProductionMultiplier(
    resourceKey,
    countryDetail?.ideology
  );
  const faoMultiplier = getFAOProductionMultiplier(countryName, resourceKey);
  const iloMultiplier = getILOProductionMultiplier(countryName, resourceKey);
  const okiMultiplier = getOKIFoodProductionMultiplier(countryName, resourceKey);
  const researchMultiplier = getResearchProductionMultiplier(countryDetail, resourceKey);

  return religiousMultiplier * ideologyMultiplier * nationalismMultiplier * faoMultiplier * iloMultiplier * okiMultiplier * researchMultiplier;
}

// Organisasi PBB
export { isMemberOfInterpol, getInterpolCrimeRiskModifier } from "./organisasi_bonus_logic/organisasi_pbb/interpol";
export { isMemberOfWHO, getWHOPandemicRiskModifier } from "./organisasi_bonus_logic/organisasi_pbb/who";
export { isMemberOfUNESCO, getUNESCOResearchModifier } from "./organisasi_bonus_logic/organisasi_pbb/unesco";
export { isMemberOfWTO, getWTOSellPriceMultiplier, getWTOBuyPriceMultiplier } from "./organisasi_bonus_logic/organisasi_pbb/wto";
export { isMemberOfFAO, getFAOProductionMultiplier } from "./organisasi_bonus_logic/organisasi_pbb/fao";
export { isMemberOfILO, getILOProductionMultiplier } from "./organisasi_bonus_logic/organisasi_pbb/ilo";
export { isMemberOfITU, getITUResearchModifier } from "./organisasi_bonus_logic/organisasi_pbb/itu";
export { isMemberOfWMO, getWMODisasterRiskModifier } from "./organisasi_bonus_logic/organisasi_pbb/wmo";

// Organisasi Regional
export { isMemberOfASEAN, getASEANBuildSpeedModifier } from "./organisasi_bonus_logic/organisasi_regional/asean";
export { isMemberOfEU, getEUTaxRevenueMultiplier } from "./organisasi_bonus_logic/organisasi_regional/eu";
export { isMemberOfLigaArab, getLigaArabUNVoteBonus } from "./organisasi_bonus_logic/organisasi_regional/liga_arab";
export { isMemberOfUniAfrika, getUniAfrikaBuildSpeedModifier } from "./organisasi_bonus_logic/organisasi_regional/uni_afrika";
export { isMemberOfOKI, getOKIFoodProductionMultiplier } from "./organisasi_bonus_logic/organisasi_regional/oki";
export { isMemberOfBRICS, getBRICSTaxRevenueMultiplier } from "./organisasi_bonus_logic/organisasi_regional/brics";
export { isMemberOfNATO, getNATOMilitaryMultiplier } from "./organisasi_bonus_logic/organisasi_regional/nato";
export { isMemberOfOPEC, getOPECSellPriceMultiplier, getOPECBuyPriceMultiplier } from "./organisasi_bonus_logic/organisasi_regional/opec";
export { isMemberOfG20, getG20TaxRevenueMultiplier } from "./organisasi_bonus_logic/organisasi_regional/g20";

import { getASEANBuildSpeedModifier } from "./organisasi_bonus_logic/organisasi_regional/asean";
import { getUniAfrikaBuildSpeedModifier } from "./organisasi_bonus_logic/organisasi_regional/uni_afrika";

export function getBuildSpeedModifier(countryName: string): number {
  return getASEANBuildSpeedModifier(countryName) + getUniAfrikaBuildSpeedModifier(countryName);
}

export function getEffectiveBuildTime(baseDays: number, countryName: string): number {
  const speedBonus = getBuildSpeedModifier(countryName);
  if (speedBonus <= 0 || !baseDays) return baseDays;
  const mult = 1 + (speedBonus / 100);
  return Math.max(1, Math.ceil(baseDays / mult));
}
