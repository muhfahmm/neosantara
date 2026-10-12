import { COUNTRIES_DATA } from '@/app/page/map_system/map-data';

const NAME_ALIASES: Record<string, string> = {
  brasil: 'br',
  brazil: 'br',
  tiongkok: 'cn',
  china: 'cn',
};

const normalizeName = (name: unknown) => String(name || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]/g, '');

export const getWarCountryIdentity = (name: unknown, iso?: unknown): string => {
  const normalizedIso = String(iso || '').trim().toLowerCase();
  if (normalizedIso) return normalizedIso;

  const normalizedName = normalizeName(name);
  if (NAME_ALIASES[normalizedName]) return NAME_ALIASES[normalizedName];

  const country = COUNTRIES_DATA.find(item => normalizeName(item.country) === normalizedName);
  return country?.iso.toLowerCase() || normalizedName;
};

export const areSameWarCountry = (
  firstName: unknown,
  secondName: unknown,
  firstIso?: unknown,
  secondIso?: unknown
): boolean => {
  const firstIdentity = getWarCountryIdentity(firstName, firstIso);
  const secondIdentity = getWarCountryIdentity(secondName, secondIso);
  return firstIdentity !== '' && firstIdentity === secondIdentity;
};
