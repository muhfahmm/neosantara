import { loadActiveSecurityCouncilItems } from "./keamananPBBUILogic";
import { isPassedResolutionActive, normalizePbbCountryName } from "../../1_resolusi_PBB/logic/resolusiPBBUILogic";
import { PRODUCTION_BAN_CATEGORIES } from "../../1_resolusi_PBB/logic/productionBanCatalog";

function normalizeResourceKey(resourceKey: string): string {
  return resourceKey.trim().toLowerCase().replace(/^inventory_/, "");
}

export function isGoldResource(resourceKey: string): boolean {
  const normalizedKey = normalizeResourceKey(resourceKey);
  return normalizedKey === "emas" ||
    normalizedKey === "gold" ||
    normalizedKey === "tambang_emas";
}

const BLOCKADED_SECTOR_RESOURCE_KEYS = new Set<string>([
  ...PRODUCTION_BAN_CATEGORIES
    .filter(category => category.id !== "mineral")
    .flatMap(category => [...category.products]),
  "uranium",
  "batu_bara",
  "minyak_bumi",
  "gas_alam",
  "garam",
  "litium",
  "logam_tanah_jarang",
  "bijih_besi",
  "tembaga",
  "bauksit",
  "nikel",
].filter(resourceKey => !isGoldResource(resourceKey)));

export function isEconomicBlockadeProductionResource(resourceKey: string): boolean {
  const normalizedKey = normalizeResourceKey(resourceKey);
  return !isGoldResource(normalizedKey) &&
    (BLOCKADED_SECTOR_RESOURCE_KEYS.has(normalizedKey) ||
      normalizedKey.startsWith("pabrik_") ||
      normalizedKey.startsWith("tambang_"));
}

export function getSecurityCouncilEconomicBlockadeMultiplier(
  countryName: string,
  resourceKey: string
): number {
  const targetCountry = normalizePbbCountryName(countryName);
  if (!targetCountry || !isEconomicBlockadeProductionResource(resourceKey)) return 1;

  const activeEconomicBlockadeCount = loadActiveSecurityCouncilItems().filter(item =>
      item.type === "economic" &&
      normalizePbbCountryName(item.target.name) === targetCountry &&
      isPassedResolutionActive(item)
    ).length;

  return 0.5 ** activeEconomicBlockadeCount;
}
