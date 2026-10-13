import {
  isPassedResolutionActive,
  loadActiveResolutions,
  normalizePbbCountryName,
  type ActiveResolutionItem,
} from "./resolusiPBBUILogic";

const isGlobalTarget = (targetName: string): boolean => {
  const target = normalizePbbCountryName(targetName);
  return target.includes("global") || target.includes("dunia");
};

export function getActiveArmsSalesEmbargoForBuyer(
  buyerCountry: string,
): ActiveResolutionItem | undefined {
  const buyer = normalizePbbCountryName(buyerCountry);
  if (!buyer) return undefined;

  return loadActiveResolutions().find(resolution =>
    resolution.type === "arms_embargo" &&
    isPassedResolutionActive(resolution) &&
    (isGlobalTarget(resolution.target.name) ||
      normalizePbbCountryName(resolution.target.name) === buyer)
  );
}

export function isArmsSaleEmbargoActive(
  _sellerCountry: string,
  buyerCountry: string,
): boolean {
  return Boolean(getActiveArmsSalesEmbargoForBuyer(buyerCountry));
}
