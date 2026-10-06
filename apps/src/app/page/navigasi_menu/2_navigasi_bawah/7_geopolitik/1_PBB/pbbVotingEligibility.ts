export interface PbbVotingCountry {
  name: string;
  iso?: string;
}

const REPLACEMENT_PROPOSERS: PbbVotingCountry[] = [
  { name: "Amerika Serikat", iso: "us" },
  { name: "Inggris", iso: "gb" },
  { name: "Perancis", iso: "fr" },
  { name: "Rusia", iso: "ru" },
  { name: "Jepang", iso: "jp" },
  { name: "India", iso: "in" },
  { name: "Australia", iso: "au" },
  { name: "Jerman", iso: "de" },
  { name: "Brasil", iso: "br" },
];

interface AnnexedCountryInfo {
  attackerCountry?: string;
}

type AnnexedCountryStore = Record<string, AnnexedCountryInfo | string | boolean | null>;

const normalizeCountryKey = (value: string): string => value
  .toLowerCase()
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/[^a-z0-9]+/g, "");

export function getAnnexedCountryStore(): AnnexedCountryStore {
  if (typeof window === "undefined") return {};
  return (window as Window & { neosantara_annexed_countries?: AnnexedCountryStore })
    .neosantara_annexed_countries || {};
}

export function isCountryAnnexed(countryName: string, countryIso?: string): boolean {
  if (typeof window === "undefined") return false;

  const store = getAnnexedCountryStore();
  const normalizedName = normalizeCountryKey(countryName);
  const normalizedIso = countryIso?.trim().toLowerCase() || "";

  return Object.entries(store).some(([key, value]) => {
    const normalizedKey = normalizeCountryKey(key.replace(/^iso_/i, ""));
    const matchesName = Boolean(normalizedName && normalizedKey === normalizedName);
    const matchesIso = Boolean(normalizedIso && key.replace(/^iso_/i, "").trim().toLowerCase() === normalizedIso);
    return (matchesName || matchesIso) && Boolean(value);
  });
}

export function getEligibleReplacementProposer(excludedCountryNames: string[]): PbbVotingCountry | null {
  const excluded = new Set(excludedCountryNames.map(normalizeCountryKey));
  return REPLACEMENT_PROPOSERS.find(country =>
    !excluded.has(normalizeCountryKey(country.name)) &&
    !isCountryAnnexed(country.name, country.iso)
  ) || null;
}

export function getAnnexedCountryCount(
  countries: PbbVotingCountry[],
  excludedCountryName?: string
): number {
  const excludedName = excludedCountryName ? normalizeCountryKey(excludedCountryName) : "";
  return countries.filter(country =>
    normalizeCountryKey(country.name) !== excludedName &&
    isCountryAnnexed(country.name, country.iso)
  ).length;
}

export function clearAnnexedCountryVotes(countryName: string, countryIso?: string): void {
  if (typeof window === "undefined" || !isCountryAnnexed(countryName, countryIso)) return;

  const resolutionKey = "pbb_active_resolutions_v4";
  let changed = false;

  const clearVotes = <T extends {
    status?: string;
    userVote: "yes" | "no" | "abstain" | null;
    voteStats: { supportersCount: number; opponentsCount: number; abstainCount: number };
  }>(items: T[]): T[] => items.map(item => {
    if (!item.userVote || (item.status && item.status !== "voting")) return item;

    const voteStats = { ...item.voteStats };
    if (item.userVote === "yes") voteStats.supportersCount = Math.max(0, voteStats.supportersCount - 1);
    if (item.userVote === "no") voteStats.opponentsCount = Math.max(0, voteStats.opponentsCount - 1);
    if (item.userVote === "abstain") voteStats.abstainCount = Math.max(0, voteStats.abstainCount - 1);
    changed = true;
    return { ...item, userVote: null, voteStats };
  });

  for (const storageKey of [resolutionKey]) {
    try {
      const serialized = window.localStorage.getItem(storageKey);
      if (!serialized) continue;
      const parsed: unknown = JSON.parse(serialized);
      if (Array.isArray(parsed)) {
        window.localStorage.setItem(storageKey, JSON.stringify(clearVotes(parsed)));
      }
    } catch (error) {
      console.error(`Failed to clear annexed-country vote from ${storageKey}:`, error);
    }
  }

  if (changed) {
    window.dispatchEvent(new CustomEvent("pbb_active_resolutions_updated"));
  }
}
