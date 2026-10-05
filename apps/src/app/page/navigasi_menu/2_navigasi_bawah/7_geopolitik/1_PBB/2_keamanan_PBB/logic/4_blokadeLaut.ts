import { loadActiveSecurityCouncilItems } from "./keamananPBBUILogic";
import { isPassedResolutionActive, normalizePbbCountryName } from "../../1_resolusi_PBB/logic/resolusiPBBUILogic";
import { isEconomicBlockadeProductionResource } from "./3_blokadeEkonomi";

export function getSecurityCouncilNavalBlockadeMultiplier(
  countryName: string,
  resourceKey: string
): number {
  const targetCountry = normalizePbbCountryName(countryName);
  if (!targetCountry || !isEconomicBlockadeProductionResource(resourceKey)) return 1;

  const activeNavalBlockadeCount = loadActiveSecurityCouncilItems().filter(item =>
    item.type === "naval" &&
    normalizePbbCountryName(item.target.name) === targetCountry &&
    isPassedResolutionActive(item)
  ).length;

  return 0.75 ** activeNavalBlockadeCount;
}
