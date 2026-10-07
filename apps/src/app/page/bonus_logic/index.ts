import { getIslamProductionMultiplier } from "./agama_bonus_logic/islam";
import { getShintoElectricityProductionMultiplier } from "./agama_bonus_logic/shinto";
import { getCommunismProductionMultiplier } from "./ideologi_bonus_logic/komunisme";
import { getNationalismProductionMultiplier } from "./ideologi_bonus_logic/nasionalisme";

import { getFAOProductionMultiplier, isMemberOfFAO } from "./organisasi_bonus_logic/organisasi_pbb/fao";
import { getILOProductionMultiplier, isMemberOfILO } from "./organisasi_bonus_logic/organisasi_pbb/ilo";

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

  return religiousMultiplier * ideologyMultiplier * nationalismMultiplier * faoMultiplier * iloMultiplier;
}

export { isMemberOfInterpol, getInterpolCrimeRiskModifier } from "./organisasi_bonus_logic/organisasi_pbb/interpol";
export { isMemberOfWHO, getWHOPandemicRiskModifier } from "./organisasi_bonus_logic/organisasi_pbb/who";
export { isMemberOfUNESCO, getUNESCOResearchModifier } from "./organisasi_bonus_logic/organisasi_pbb/unesco";
export { isMemberOfWTO, getWTOSellPriceMultiplier, getWTOBuyPriceMultiplier } from "./organisasi_bonus_logic/organisasi_pbb/wto";
export { isMemberOfFAO, getFAOProductionMultiplier } from "./organisasi_bonus_logic/organisasi_pbb/fao";
export { isMemberOfILO, getILOProductionMultiplier } from "./organisasi_bonus_logic/organisasi_pbb/ilo";
export { isMemberOfITU, getITUResearchModifier } from "./organisasi_bonus_logic/organisasi_pbb/itu";
export { isMemberOfWMO, getWMODisasterRiskModifier } from "./organisasi_bonus_logic/organisasi_pbb/wmo";







