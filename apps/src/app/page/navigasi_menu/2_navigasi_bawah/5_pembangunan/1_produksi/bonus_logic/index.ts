import { getIslamProductionMultiplier } from "./agama_bonus_logic/islam";
import { getShintoElectricityProductionMultiplier } from "./agama_bonus_logic/shinto";

export function getProductionBonusMultiplier(
  countryDetail: Record<string, unknown> | null | undefined,
  resourceKey: string
): number {
  const religion = countryDetail?.religion
    ?? countryDetail?.agama_utama
    ?? countryDetail?.agama;
  if (String(religion || "").trim().toLowerCase() === "islam") {
    return getIslamProductionMultiplier(resourceKey);
  }
  if (String(religion || "").trim().toLowerCase() === "shinto") {
    return getShintoElectricityProductionMultiplier(resourceKey);
  }
  return 1;
}
