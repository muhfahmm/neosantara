import { getIslamProductionMultiplier } from "./agama_bonus_logic/islam";
import { getShintoElectricityProductionMultiplier } from "./agama_bonus_logic/shinto";
import { getCommunismProductionMultiplier } from "./ideologi_bonus_logic/komunisme";
import { getNationalismProductionMultiplier } from "./ideologi_bonus_logic/nasionalisme";

export function getProductionBonusMultiplier(
  countryDetail: Record<string, unknown> | null | undefined,
  resourceKey: string
): number {
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
  return religiousMultiplier * ideologyMultiplier * nationalismMultiplier;
}
