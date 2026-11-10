import type { CountryProfileSummary } from '@/lib/countryProfileSummaryRegistry';

export type InfluenceCountry = Pick<
  CountryProfileSummary,
  'country_slug' | 'name_id' | 'name_en' | 'religion' | 'ideology'
>;

export type AnnexedCountryRecord = {
  attackerCountry?: string;
  isPbbOccupied?: boolean;
};

export type AnnexedCountryStore = Record<string, AnnexedCountryRecord>;

export type VictoryCount = {
  same: number;
  total: number;
  percent: number;
};

export type NationInfluenceResults = {
  faith: VictoryCount;
  ideology: VictoryCount;
};

export type PlayerCountryInfluence = {
  country_slug?: string;
  country?: string;
  name_id?: string;
  name_en?: string;
  religion?: string;
  ideology?: string;
};

export type ArmadaPowerSummaryLike = {
  totals: {
    totalPower: number;
    groups: Partial<Record<'darat' | 'laut' | 'udara', { power: number }>>;
  };
};

export type MilitaryPowerCardTotals = {
  totalPower: number;
  darat: number;
  laut: number;
  udara: number;
};

const faithSynonyms: Record<string, string> = {
  ateisme: 'ateisme',
  atheism: 'ateisme',
  buddha: 'buddha',
  buddhism: 'buddha',
  hindu: 'hindu',
  hinduism: 'hindu',
  islam: 'islam',
  katolik: 'katolik',
  'katolik roma': 'katolik',
  'roma katolik': 'katolik',
  catholic: 'katolik',
  'roman catholic': 'katolik',
  protestan: 'protestan',
  'kristen protestan': 'protestan',
  protestant: 'protestan',
  'protestant christian': 'protestan',
  'kristen ortodoks': 'kristen ortodoks',
  ortodoks: 'kristen ortodoks',
  orthodox: 'kristen ortodoks',
  'orthodox christian': 'kristen ortodoks',
  shinto: 'shinto',
  yahudi: 'yahudi',
  judaism: 'yahudi',
};

const ideologySynonyms: Record<string, string> = {
  demokrasi: 'demokrasi',
  democracy: 'demokrasi',
  monarki: 'monarki',
  monarchy: 'monarki',
  kapitalisme: 'kapitalisme',
  capitalism: 'kapitalisme',
  sosialisme: 'sosialisme',
  socialism: 'sosialisme',
  komunisme: 'komunisme',
  communism: 'komunisme',
  nasionalisme: 'nasionalisme',
  nationalism: 'nasionalisme',
  konservatisme: 'konservatisme',
  conservatism: 'konservatisme',
  liberalisme: 'liberalisme',
  liberalism: 'liberalisme',
};

const influenceCache = new Map<string, NationInfluenceResults>();

function normalizeText(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeCountryKey(value: unknown): string {
  return normalizeText(value).replace(/[^a-z0-9]/g, '');
}

function normalizeValue(value: unknown, synonyms: Record<string, string>): string | null {
  const normalized = normalizeText(value);
  if (!normalized || normalized === '-') return null;
  return synonyms[normalized] || normalized;
}

export function normalizeFaith(value: unknown): string | null {
  return normalizeValue(value, faithSynonyms);
}

export function normalizeIdeology(value: unknown): string | null {
  return normalizeValue(value, ideologySynonyms);
}

function getCountryKeys(country: {
  country_slug?: string;
  name_id?: string;
  name_en?: string;
}): string[] {
  return [country.country_slug, country.name_id, country.name_en]
    .map(normalizeCountryKey)
    .filter(Boolean);
}

function getExcludedCountryKeys(annexedCountries: AnnexedCountryStore): Set<string> {
  const excluded = new Set<string>();
  Object.entries(annexedCountries).forEach(([key, record]) => {
    if (record.attackerCountry && !record.isPbbOccupied) {
      const normalizedKey = normalizeCountryKey(key.replace(/^iso[_-]?/i, ''));
      if (normalizedKey) excluded.add(normalizedKey);
    }
  });
  return excluded;
}

function createVictoryCount(
  playerValue: string | null,
  allCountries: readonly InfluenceCountry[],
  playerKeys: Set<string>,
  excludedCountryKeys: Set<string>,
  field: 'religion' | 'ideology',
  normalize: (value: unknown) => string | null
): VictoryCount {
  let same = 0;
  let total = 0;

  allCountries.forEach(country => {
    const keys = getCountryKeys(country);
    if (keys.some(key => playerKeys.has(key) || excludedCountryKeys.has(key))) return;
    const value = normalize(country[field]);
    if (!value) return;
    total += 1;
    if (playerValue && value === playerValue) same += 1;
  });

  return {
    same,
    total,
    percent: total > 0 ? Math.round((same / total) * 1000) / 10 : 0,
  };
}

export function computeFaithVictory(
  playerCountry: PlayerCountryInfluence,
  allCountries: readonly InfluenceCountry[],
  annexedCountries: AnnexedCountryStore = {}
): VictoryCount {
  const playerKeys = new Set(getCountryKeys(playerCountry));
  const excludedCountryKeys = getExcludedCountryKeys(annexedCountries);
  return createVictoryCount(
    normalizeFaith(playerCountry.religion),
    allCountries,
    playerKeys,
    excludedCountryKeys,
    'religion',
    normalizeFaith
  );
}

export function computeIdeologyVictory(
  playerCountry: PlayerCountryInfluence,
  allCountries: readonly InfluenceCountry[],
  annexedCountries: AnnexedCountryStore = {}
): VictoryCount {
  const playerKeys = new Set(getCountryKeys(playerCountry));
  const excludedCountryKeys = getExcludedCountryKeys(annexedCountries);
  return createVictoryCount(
    normalizeIdeology(playerCountry.ideology),
    allCountries,
    playerKeys,
    excludedCountryKeys,
    'ideology',
    normalizeIdeology
  );
}

export function computeNationInfluence(
  playerCountry: PlayerCountryInfluence,
  allCountries: readonly InfluenceCountry[],
  annexedCountries: AnnexedCountryStore = {}
): NationInfluenceResults {
  const cacheKey = JSON.stringify([
    playerCountry,
    allCountries,
    annexedCountries,
  ]);
  const cached = influenceCache.get(cacheKey);
  if (cached) return cached;

  const result = {
    faith: computeFaithVictory(playerCountry, allCountries, annexedCountries),
    ideology: computeIdeologyVictory(playerCountry, allCountries, annexedCountries),
  };
  if (influenceCache.size >= 32) influenceCache.clear();
  influenceCache.set(cacheKey, result);
  return result;
}

export function getMilitaryPowerCardTotals(
  summary: ArmadaPowerSummaryLike
): MilitaryPowerCardTotals {
  return {
    totalPower: summary.totals.totalPower,
    darat: summary.totals.groups.darat?.power ?? 0,
    laut: summary.totals.groups.laut?.power ?? 0,
    udara: summary.totals.groups.udara?.power ?? 0,
  };
}
