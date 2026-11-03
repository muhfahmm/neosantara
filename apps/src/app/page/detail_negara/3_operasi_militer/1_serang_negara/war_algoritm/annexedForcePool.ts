import { getArmadaPowerSummary } from "@/app/page/navigasi_menu/2_navigasi_bawah/6_pertahanan/4_armada/logic/armadaLogic";

type CountryProfile = Record<string, unknown>;
type ArmadaGroup = Record<string, number>;
type ArmadaPool = Record<string, ArmadaGroup>;

const normalizeCountryId = (value: unknown): string => String(value ?? "")
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase()
  .replace(/[^a-z0-9]/g, "");

const getProfileIdentity = (profile: CountryProfile): string =>
  normalizeCountryId(profile.country_slug || profile.iso || profile.country || profile.nama_negara || profile.name_id);

function getAnnexationLedger(profile: CountryProfile): string[] {
  const ledger = profile.annexed_forces_ledger;
  return Array.isArray(ledger)
    ? ledger.filter((entry): entry is string => typeof entry === "string")
    : [];
}

export function mergeAnnexedForces(
  conqueror: CountryProfile,
  annexed: CountryProfile,
  targetLossRatio: number,
): { country: CountryProfile; addedUnits: number; alreadyMerged: boolean } {
  const annexedId = getProfileIdentity(annexed);
  if (!annexedId) {
    return { country: conqueror, addedUnits: 0, alreadyMerged: false };
  }

  const ledger = getAnnexationLedger(conqueror);
  if (ledger.includes(annexedId)) {
    return { country: conqueror, addedUnits: 0, alreadyMerged: true };
  }

  const lossRatio = Number.isFinite(targetLossRatio)
    ? Math.max(0, Math.min(1, targetLossRatio))
    : 0;
  const armadaValue = conqueror.armada;
  const existingArmada = armadaValue && typeof armadaValue === "object" && !Array.isArray(armadaValue)
    ? armadaValue as Record<string, unknown>
    : {};
  const nextArmada: ArmadaPool = {};

  getArmadaPowerSummary(conqueror).breakdown.forEach(unit => {
    const group = nextArmada[unit.groupId] ??= {};
    group[unit.dataKey] = unit.quantity;
  });

  let addedUnits = 0;
  getArmadaPowerSummary(annexed).breakdown.forEach(unit => {
    const survivors = Math.max(0, unit.quantity - Math.round(unit.quantity * lossRatio));
    if (survivors === 0) return;

    const group = nextArmada[unit.groupId] ??= {};
    group[unit.dataKey] = (group[unit.dataKey] || 0) + survivors;
    addedUnits += survivors;
  });

  Object.entries(existingArmada).forEach(([groupName, groupValue]) => {
    if (nextArmada[groupName] || !groupValue || typeof groupValue !== "object" || Array.isArray(groupValue)) return;
    nextArmada[groupName] = { ...(groupValue as ArmadaGroup) };
  });

  return {
    country: {
      ...conqueror,
      armada: nextArmada,
      annexed_forces_ledger: [...ledger, annexedId],
    },
    addedUnits,
    alreadyMerged: false,
  };
}

export function resolveCountryPoolOwner(
  countryId: string,
  annexedTerritories: Record<string, { attackerCountry?: string; attackerIso?: string }>,
): string {
  let owner = countryId;
  const visited = new Set<string>();

  while (true) {
    const ownerKey = normalizeCountryId(owner);
    if (!ownerKey || visited.has(ownerKey)) return owner;
    visited.add(ownerKey);

    const annexation = Object.entries(annexedTerritories).find(([key]) =>
      normalizeCountryId(key) === ownerKey
    )?.[1];
    if (!annexation?.attackerCountry) return owner;
    owner = annexation.attackerCountry;
  }
}
