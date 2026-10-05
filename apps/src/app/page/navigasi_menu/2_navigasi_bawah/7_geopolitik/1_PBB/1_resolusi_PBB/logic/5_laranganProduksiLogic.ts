import {
  ActiveResolutionItem,
  isPassedResolutionActive,
  loadActiveResolutions,
} from "./resolusiPBBUILogic";
import { getProductionBanProduct } from "./productionBanCatalog";
import { isGoldResource } from "../../2_keamanan_PBB/logic/3_blokadeEkonomi";

export function getActiveProductionBanForResource(resourceKey: string): ActiveResolutionItem | undefined {
  if (isGoldResource(resourceKey)) return undefined;
  if (!getProductionBanProduct(resourceKey)) return undefined;

  return loadActiveResolutions().find(resolution =>
    resolution.type === "production_ban" &&
    resolution.productKey === resourceKey &&
    isPassedResolutionActive(resolution)
  );
}
