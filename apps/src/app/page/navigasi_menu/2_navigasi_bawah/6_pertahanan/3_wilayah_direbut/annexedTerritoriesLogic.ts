export interface AnnexedTerritory {
  name: string;
  iso: string;
  fullyAnnexed: boolean;
  cities: string[];
}

interface CountryRecord {
  country: string;
  iso: string;
}

interface AnnexationRecord {
  attackerCountry?: string;
}

interface CityOwnershipRecord {
  cityId?: string;
  cityName?: string;
  countryIso?: string;
  ownerCountry?: string;
}

const normalizeCountryName = (value: string) =>
  value
    .trim()
    .toLocaleLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");

export function getAnnexedTerritories(
  playerCountryName: string,
  annexedStore: Record<string, AnnexationRecord | undefined>,
  cityOwners: Record<string, CityOwnershipRecord | undefined>,
  countries: readonly CountryRecord[],
): AnnexedTerritory[] {
  const playerKey = normalizeCountryName(playerCountryName);
  if (!playerKey) return [];

  const countryByAlias = new Map<string, CountryRecord>();
  const countryByIso = new Map<string, CountryRecord>();
  countries.forEach(country => {
    const isoKey = normalizeCountryName(country.iso);
    countryByAlias.set(normalizeCountryName(country.country), country);
    countryByAlias.set(isoKey, country);
    countryByIso.set(isoKey, country);
  });

  const playerCountry = countryByAlias.get(playerKey);
  const playerAliases = new Set([
    playerKey,
    ...(playerCountry
      ? [normalizeCountryName(playerCountry.country), normalizeCountryName(playerCountry.iso)]
      : []),
  ]);
  const isPlayer = (countryName: string | undefined) =>
    Boolean(countryName && playerAliases.has(normalizeCountryName(countryName)));
  const findCountry = (key: string) => {
    const normalizedKey = normalizeCountryName(key);
    return countryByAlias.get(normalizedKey) || countryByAlias.get(normalizedKey.replace(/^iso/, ""));
  };
  const territories = new Map<string, AnnexedTerritory>();

  Object.entries(annexedStore).forEach(([targetKey, record]) => {
    if (!isPlayer(record?.attackerCountry)) return;
    const country = findCountry(targetKey);
    if (!country || isPlayer(country.country)) return;
    territories.set(normalizeCountryName(country.iso), {
      name: country.country,
      iso: country.iso.toLowerCase(),
      fullyAnnexed: true,
      cities: [],
    });
  });

  Object.values(cityOwners).forEach(city => {
    if (
      !city?.cityId ||
      city.cityId.toLocaleLowerCase().startsWith("region:") ||
      !city.cityName?.trim() ||
      !isPlayer(city.ownerCountry)
    ) return;

    const country = countryByIso.get(normalizeCountryName(city.countryIso || ""));
    if (!country || isPlayer(country.country)) return;

    const key = normalizeCountryName(country.iso);
    const territory = territories.get(key) || {
      name: country.country,
      iso: country.iso.toLowerCase(),
      fullyAnnexed: false,
      cities: [],
    };
    if (territory.fullyAnnexed) return;

    if (!territory.cities.some(name => normalizeCountryName(name) === normalizeCountryName(city.cityName || ""))) {
      territory.cities.push(city.cityName.trim());
    }
    territories.set(key, territory);
  });

  return [...territories.values()]
    .map(territory => ({
      ...territory,
      cities: territory.cities.sort((a, b) => a.localeCompare(b)),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
