import countryPathMap from "../../../../../map_system/country-paths.json";
import { isCountryAnnexed } from "../pbbVotingEligibility";

export type ResolusiVotingStats = {
  supporters: number;
  opponents: number;
  hasDiplomaticRelation: boolean;
};

type VotingCountryData = {
  id: number;
  name: string;
  iso: string;
  continent: string;
};

const normalizeName = (value?: string | null): string => {
  if (!value) return "";
  return String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
};

const findCountryPath = (countryName: string): string | null => {
  const normalizedTarget = normalizeName(countryName);
  for (const [key, path] of Object.entries(countryPathMap as Record<string, string>)) {
    if (normalizeName(key) === normalizedTarget) {
      return path;
    }
  }
  return null;
};

const fetchEmbassyList = async (userCountryPath: string): Promise<string[]> => {
  try {
    const res = await fetch(`/api/country-data?path=${encodeURIComponent(userCountryPath)}`);
    if (!res.ok) return [];
    const data = await res.json();
    if (!data || !Array.isArray(data.embassies)) return [];
    return data.embassies
      .filter((embassy: any) => embassy && embassy.mitra)
      .map((embassy: any) => String(embassy.mitra));
  } catch (error) {
    console.error("resolusiPBB_logic: failed to fetch embassy data", error);
    return [];
  }
};

export const calculateResolusiVoting = async (
  userCountryName: string,
  targetCountryName: string,
  countries: VotingCountryData[]
): Promise<ResolusiVotingStats> => {
  const normalizedUserCountry = normalizeName(userCountryName);
  const normalizedTargetCountry = normalizeName(targetCountryName);

  const userCountryPath = findCountryPath(userCountryName);
  if (!userCountryPath) {
    return { supporters: 0, opponents: 0, hasDiplomaticRelation: false };
  }

  const embassyNames = await fetchEmbassyList(userCountryPath);
  const embassySet = new Set(embassyNames.map(normalizeName));
  const hasDiplomaticRelation = embassySet.has(normalizedTargetCountry);

  const annexedStore = (typeof window !== 'undefined' ? (window as any).neosantara_annexed_countries : {}) || {};
  const isAnnexed = (cName: string, isoCode?: string) => {
    const norm = normalizeName(cName);
    const isoNorm = isoCode ? String(isoCode).toLowerCase().trim() : '';
    return Boolean(
      annexedStore[cName] ||
      annexedStore[norm] ||
      (isoNorm && annexedStore[isoNorm])
    );
  };

  const excludedNames = new Set([normalizedUserCountry, normalizedTargetCountry]);

  const supporters = countries.reduce((count, country: { id: number; name: string; iso: string; continent: string }) => {
    const name = normalizeName(country.name);
    if (excludedNames.has(name) || isAnnexed(country.name, country.iso) || isCountryAnnexed(country.name, country.iso)) return count;
    if (embassySet.has(name)) return count + 1;
    return count;
  }, 0);

  const nonDiplomaticCount = countries.reduce((count, country: { id: number; name: string; iso: string; continent: string }) => {
    const name = normalizeName(country.name);
    if (excludedNames.has(name) || isAnnexed(country.name, country.iso) || isCountryAnnexed(country.name, country.iso)) return count;
    if (!embassySet.has(name)) return count + 1;
    return count;
  }, 0);

  return {
    supporters,
    opponents: nonDiplomaticCount + (isCountryAnnexed(targetCountryName) ? 0 : 1),
    hasDiplomaticRelation,
  };
};
