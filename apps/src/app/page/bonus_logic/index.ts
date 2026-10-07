import { getIslamProductionMultiplier } from "./agama_bonus_logic/islam";
import { getShintoElectricityProductionMultiplier } from "./agama_bonus_logic/shinto";
import { getCommunismProductionMultiplier } from "./ideologi_bonus_logic/komunisme";
import { getNationalismProductionMultiplier } from "./ideologi_bonus_logic/nasionalisme";

import { getFAOProductionMultiplier, isMemberOfFAO } from "./organisasi_bonus_logic/organisasi_pbb/fao";
import { getILOProductionMultiplier, isMemberOfILO } from "./organisasi_bonus_logic/organisasi_pbb/ilo";
import { getOKIFoodProductionMultiplier, isMemberOfOKI } from "./organisasi_bonus_logic/organisasi_regional/oki";

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

  return religiousMultiplier * ideologyMultiplier * nationalismMultiplier * faoMultiplier * iloMultiplier * okiMultiplier;
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

