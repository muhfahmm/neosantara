import { COUNTRIES_DATA } from '@/app/page/map_system/map-data';

const normalizeCountryName = (value: unknown) => String(value || '')
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^\p{L}\p{N}]/gu, '');

// Data map uses some English names while other game data uses Indonesian names.
const INDONESIAN_COUNTRY_NAMES: Record<string, string> = {
  afghanistan: 'Afganistan', algeria: 'Aljazair', brazil: 'Brasil',
  cambodia: 'Kamboja', cameroon: 'Kamerun', canada: 'Kanada', czechrepublic: 'Ceko',
  democraticrepublicofthecongo: 'Republik Demokratik Kongo', egypt: 'Mesir',
  france: 'Prancis', germany: 'Jerman', greece: 'Yunani', hungary: 'Hungaria',
  iceland: 'Islandia', ireland: 'Irlandia', italy: 'Italia', japan: 'Jepang',
  netherlands: 'Belanda', newzealand: 'Selandia Baru', philippines: 'Filipina',
  republicofthecongo: 'Republik Kongo', russia: 'Rusia', saudiarabia: 'Arab Saudi',
  southafrica: 'Afrika Selatan', southkorea: 'Korea Selatan', spain: 'Spanyol',
  sweden: 'Swedia', switzerland: 'Swiss', syria: 'Suriah', turkey: 'Turki',
  unitedarabemirates: 'Uni Emirat Arab', unitedkingdom: 'Inggris',
  unitedstates: 'Amerika Serikat', unitedstatesofamerica: 'Amerika Serikat',
};

export function getDisplayCountryName(value: unknown): string {
  const rawName = String(value || '').trim();
  return INDONESIAN_COUNTRY_NAMES[normalizeCountryName(rawName)] || rawName;
}

const COUNTRY_ISO_BY_NAME = new Map<string, string>();
const COUNTRY_ISO_BY_INDONESIAN_NAME = new Map<string, string>();
const COUNTRY_NAME_SOURCES = new Map<string, string>();

for (const country of COUNTRIES_DATA) {
  const iso = String(country.iso || '').trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(iso)) continue;
  COUNTRY_ISO_BY_NAME.set(normalizeCountryName(country.country), iso);
  COUNTRY_ISO_BY_INDONESIAN_NAME.set(normalizeCountryName(country.country), iso);
  COUNTRY_NAME_SOURCES.set(country.country, iso);
}

for (const [sourceName, indonesianName] of Object.entries(INDONESIAN_COUNTRY_NAMES)) {
  const iso = COUNTRY_ISO_BY_INDONESIAN_NAME.get(normalizeCountryName(indonesianName));
  if (iso) {
    COUNTRY_ISO_BY_NAME.set(sourceName, iso);
    COUNTRY_NAME_SOURCES.set(sourceName, iso);
  }
}

const COUNTRY_DISPLAY_NAME_CANDIDATES = new Map<string, Set<string>>();
const COUNTRY_DISPLAY_NAME_LOCALES = ['id', 'en', 'ar', 'de', 'es', 'ja', 'ko', 'zh-CN'];
const COUNTRY_DISPLAY_NAME_FORMATTERS = COUNTRY_DISPLAY_NAME_LOCALES.map(
  locale => new Intl.DisplayNames([locale], { type: 'region' })
);
const COUNTRY_DISPLAY_NAMES_BY_ISO = new Map<string, string[]>();
for (const country of COUNTRIES_DATA) {
  const iso = String(country.iso || '').trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(iso)) continue;
  const displayNames = new Set<string>();
  for (const formatter of COUNTRY_DISPLAY_NAME_FORMATTERS) {
    const displayName = formatter.of(iso);
    if (!displayName || displayName.toUpperCase() === iso) continue;
    displayNames.add(displayName);
    const normalized = normalizeCountryName(displayName);
    if (!normalized) continue;
    const candidates = COUNTRY_DISPLAY_NAME_CANDIDATES.get(normalized) || new Set<string>();
    candidates.add(iso);
    COUNTRY_DISPLAY_NAME_CANDIDATES.set(normalized, candidates);
  }
  COUNTRY_DISPLAY_NAMES_BY_ISO.set(iso, Array.from(displayNames));
}

for (const [normalized, candidates] of COUNTRY_DISPLAY_NAME_CANDIDATES) {
  if (candidates.size !== 1) continue;
  const iso = Array.from(candidates)[0];
  COUNTRY_ISO_BY_NAME.set(normalized, iso);
}

for (const [iso, displayNames] of COUNTRY_DISPLAY_NAMES_BY_ISO) {
  for (const displayName of displayNames) {
    const normalized = normalizeCountryName(displayName);
    if (normalized && COUNTRY_ISO_BY_NAME.get(normalized) === iso) {
      COUNTRY_NAME_SOURCES.set(displayName, iso);
    }
  }
}

export function isGlobalCountryTarget(value: unknown): boolean {
  const normalized = normalizeCountryName(value);
  return [
    'global',
    'globalworldwide',
    'world',
    'worldwide',
    'dunia',
    'seluruhdunia',
    'seluruhduniaglobal',
    'weltweit',
    'todoelmundo',
    'todoelmundoglobal',
    'العالمبأسره',
    '全世界',
    '전세계',
    '全球',
  ].includes(normalized);
}

export function getLocalizedCountryName(value: unknown, locale?: string): string {
  const rawName = String(value || '').trim();
  if (!rawName || isGlobalCountryTarget(rawName)) return rawName;

  const normalized = normalizeCountryName(rawName);
  const iso = /^[a-z]{2}$/i.test(rawName) ? rawName.toUpperCase() : COUNTRY_ISO_BY_NAME.get(normalized);
  if (!iso) return getDisplayCountryName(rawName);

  const activeLocale = locale
    || (typeof document !== 'undefined' && document.documentElement.lang)
    || 'id';
  const localized = new Intl.DisplayNames([activeLocale], { type: 'region' }).of(iso);
  return localized && localized.toUpperCase() !== iso ? localized : getDisplayCountryName(rawName);
}

export function localizeCountryNamesInText(value: string, locale?: string): string {
  const activeLocale = locale
    || (typeof document !== 'undefined' && document.documentElement.lang)
    || 'id';
  const displayNames = new Intl.DisplayNames([activeLocale], { type: 'region' });
  const replacements = [...COUNTRY_NAME_SOURCES.entries()]
    .map(([source, iso]) => [source, displayNames.of(iso) || source] as const)
    .filter(([source, localized]) => normalizeCountryName(source) !== normalizeCountryName(localized))
    .sort(([first], [second]) => second.length - first.length);

  return replacements.reduce((text, [source, localized]) => {
    const escaped = source.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return text.replace(new RegExp(`(^|[^\\p{L}\\p{N}])${escaped}(?=$|[^\\p{L}\\p{N}])`, 'giu'), (_match, prefix: string) => `${prefix}${localized}`);
  }, value);
}
