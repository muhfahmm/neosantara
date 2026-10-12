import { CAPITALS_DATA, COUNTRIES_DATA } from '../map_system/map-data';

export const GAME_DAYS_PER_1000_KM = 1;

export type SupportedContinent =
  | 'Asia'
  | 'Afrika'
  | 'Eropa'
  | 'Oceania'
  | 'Amerika Utara'
  | 'Amerika Selatan';

export interface TravelEstimate {
  distanceKm: number;
  days: number;
  originContinent: SupportedContinent;
  destinationContinent: SupportedContinent;
}

interface CountryLocation {
  name: string;
  latitude: number;
  longitude: number;
  continent: SupportedContinent;
}

export interface SimulationClock {
  getCurrentDate: () => Date;
  getDayProgress: () => number;
  getMillisecondsPerDay: () => number;
  getIsPaused: () => boolean;
}

const COUNTRY_ALIASES: Record<string, string> = {
  brasil: 'brazil',
  brazil: 'brazil',
  tiongkok: 'china',
  china: 'china',
};

const normalizeCountryName = (name: unknown) => {
  const normalized = String(name || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
  return COUNTRY_ALIASES[normalized] || normalized;
};

const resolveContinent = (continent: unknown): SupportedContinent | null => {
  const normalized = String(continent || '').toLowerCase().replace(/[^a-z]/g, '');
  if (normalized === 'asia') return 'Asia';
  if (normalized === 'africa' || normalized === 'afrika') return 'Afrika';
  if (normalized === 'europe' || normalized === 'eropa') return 'Eropa';
  if (normalized === 'oceania' || normalized === 'australia') return 'Oceania';
  if (normalized === 'northamerica') return 'Amerika Utara';
  if (normalized === 'southamerica') return 'Amerika Selatan';
  return null;
};

const getCountryLocation = (countryName: string): CountryLocation | null => {
  const normalizedName = normalizeCountryName(countryName);
  const country = COUNTRIES_DATA.find(item => normalizeCountryName(item.country) === normalizedName);
  const capital = CAPITALS_DATA.find(item => normalizeCountryName(item.country) === normalizedName);
  const latitude = capital?.lat ?? country?.latitude ?? country?.lat;
  const longitude = capital?.lng ?? country?.longitude ?? country?.lng;
  const continent = resolveContinent(country?.continent);

  if (
    !country ||
    !continent ||
    typeof latitude !== 'number' ||
    typeof longitude !== 'number' ||
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude)
  ) {
    return null;
  }

  return { name: country.country, latitude, longitude, continent };
};

const getGreatCircleDistanceKm = (origin: CountryLocation, destination: CountryLocation) => {
  const radians = (degrees: number) => degrees * Math.PI / 180;
  const latitudeDifference = radians(destination.latitude - origin.latitude);
  const longitudeDifference = radians(destination.longitude - origin.longitude);
  const originLatitude = radians(origin.latitude);
  const destinationLatitude = radians(destination.latitude);
  const haversine = Math.sin(latitudeDifference / 2) ** 2 +
    Math.cos(originLatitude) * Math.cos(destinationLatitude) *
    Math.sin(longitudeDifference / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
};

export const estimateTravelTime = (originCountry: string, destinationCountry: string): TravelEstimate | null => {
  const origin = getCountryLocation(originCountry);
  const destination = getCountryLocation(destinationCountry);
  if (!origin || !destination) return null;

  const distanceKm = getGreatCircleDistanceKm(origin, destination);
  return {
    distanceKm,
    days: Math.max(1, Math.ceil(distanceKm / (1000 * GAME_DAYS_PER_1000_KM))),
    originContinent: origin.continent,
    destinationContinent: destination.continent,
  };
};

const getSimulationClock = (): SimulationClock | null => {
  if (typeof window === 'undefined') return null;
  const manager = (window as Window & { neosantara_time_controller?: SimulationClock }).neosantara_time_controller;
  if (
    !manager ||
    typeof manager.getCurrentDate !== 'function' ||
    typeof manager.getDayProgress !== 'function' ||
    typeof manager.getMillisecondsPerDay !== 'function' ||
    typeof manager.getIsPaused !== 'function'
  ) {
    return null;
  }
  return manager;
};

const getDateDayNumber = (date: Date) =>
  Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000;

export const getSimulationDayPosition = (): number | null => {
  const clock = getSimulationClock();
  if (!clock) return null;
  const dayProgress = clock.getIsPaused() ? 0 : clock.getDayProgress();
  return getDateDayNumber(clock.getCurrentDate()) + Math.min(1, Math.max(0, dayProgress));
};

export const getSimulationMillisecondsPerDay = () => getSimulationClock()?.getMillisecondsPerDay() ?? null;

export const isSimulationTimePaused = () => getSimulationClock()?.getIsPaused() ?? true;
