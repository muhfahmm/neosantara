import { loadActiveSecurityCouncilItems } from "./keamananPBBUILogic";
import { isPassedResolutionActive, normalizePbbCountryName } from "../../1_resolusi_PBB/logic/resolusiPBBUILogic";

export function isCountryUnderFullBlockade(countryName: string): boolean {
  const targetCountry = normalizePbbCountryName(countryName);
  if (!targetCountry) return false;

  return loadActiveSecurityCouncilItems().some(item =>
    item.type === "full" &&
    normalizePbbCountryName(item.target.name) === targetCountry &&
    isPassedResolutionActive(item)
  );
}
