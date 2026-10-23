import { CAPITALS_DATA, COUNTRIES_DATA } from '../map_system/map-data';
import { greatCircleDistanceKmRust } from './routeMathRust';

/**
 * Konstanta lama dipertahankan agar import lama tidak rusak.
 * Namun tidak lagi dipakai untuk menghitung durasi perjalanan.
 */
export const GAME_DAYS_PER_1000_KM = 1;

export const MIN_TRAVEL_DAYS = 90;
export const MAX_TRAVEL_DAYS = 120;

const EARTH_RADIUS_KM = 6371;
const MAX_GREAT_CIRCLE_DISTANCE_KM = Math.PI * EARTH_RADIUS_KM;

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

type AnimationSubscriber = (now: number) => void;
const animationSubscribers = new Set<AnimationSubscriber>();
let animationFrameId: number | null = null;
let pauseListenerInstalled = false;

const scheduleRouteAnimationFrame = () => {
  if (
    animationFrameId === null &&
    animationSubscribers.size > 0 &&
    !isSimulationTimePaused()
  ) {
    animationFrameId = requestAnimationFrame(runAnimationFrame);
  }
};

const runAnimationFrame = (now: number) => {
  animationFrameId = null;
  animationSubscribers.forEach(callback => callback(now));
  scheduleRouteAnimationFrame();
};

const handleSimulationClockState = () => {
  if (isSimulationTimePaused()) {
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
    animationSubscribers.forEach(callback => callback(performance.now()));
    return;
  }
  scheduleRouteAnimationFrame();
};

// One RAF drives active routes; paused routes only refresh when the camera moves.
export const subscribeRouteAnimation = (callback: AnimationSubscriber) => {
  animationSubscribers.add(callback);
  if (typeof window !== 'undefined') {
    if (!pauseListenerInstalled) {
      window.addEventListener('neosantara:simulation-clock-state', handleSimulationClockState);
      pauseListenerInstalled = true;
    }
    callback(performance.now());
    scheduleRouteAnimationFrame();
  }
  return () => {
    animationSubscribers.delete(callback);
    if (animationSubscribers.size === 0) {
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
      if (pauseListenerInstalled && typeof window !== 'undefined') {
        window.removeEventListener('neosantara:simulation-clock-state', handleSimulationClockState);
        pauseListenerInstalled = false;
      }
    }
  };
};

const COUNTRY_ALIASES: Record<string, string> = {
  brasil: 'brazil',
  brazil: 'brazil',
  tiongkok: 'china',
  china: 'china',
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const normalizeCountryName = (name: unknown) => {
  const normalized = String(name || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

  return COUNTRY_ALIASES[normalized] || normalized;
};

const capitalLocationsByCountry = new Map(
  CAPITALS_DATA
    .filter(item => typeof item.lat === 'number' && typeof item.lng === 'number')
    .map(item => [normalizeCountryName(item.country), item] as const),
);
const countriesByName = new Map(
  COUNTRIES_DATA.map(item => [normalizeCountryName(item.country), item] as const),
);

const resolveContinent = (continent: unknown): SupportedContinent | null => {
  const normalized = String(continent || '')
    .toLowerCase()
    .replace(/[^a-z]/g, '');

  if (normalized === 'asia') return 'Asia';
  if (normalized === 'africa' || normalized === 'afrika') return 'Afrika';
  if (normalized === 'europe' || normalized === 'eropa') return 'Eropa';
  if (normalized === 'oceania' || normalized === 'australia') return 'Oceania';

  if (
    normalized === 'northamerica' ||
    normalized === 'amerikautara'
  ) {
    return 'Amerika Utara';
  }

  if (
    normalized === 'southamerica' ||
    normalized === 'amerikaselatan'
  ) {
    return 'Amerika Selatan';
  }

  return null;
};

const getCountryLocation = (countryName: string): CountryLocation | null => {
  const normalizedName = normalizeCountryName(countryName);
  const country = countriesByName.get(normalizedName);
  const capital = capitalLocationsByCountry.get(normalizedName);

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

  return {
    name: country.country,
    latitude,
    longitude,
    continent,
  };
};

const getGreatCircleDistanceKm = (
  origin: CountryLocation,
  destination: CountryLocation
) => {
  const rustDistance = greatCircleDistanceKmRust(
    origin.latitude,
    origin.longitude,
    destination.latitude,
    destination.longitude,
  );
  if (rustDistance !== null) return rustDistance;

  const radians = (degrees: number) => (degrees * Math.PI) / 180;

  const latitudeDifference = radians(
    destination.latitude - origin.latitude
  );
  const longitudeDifference = radians(
    destination.longitude - origin.longitude
  );

  const originLatitude = radians(origin.latitude);
  const destinationLatitude = radians(destination.latitude);

  const haversine =
    Math.sin(latitudeDifference / 2) ** 2 +
    Math.cos(originLatitude) *
      Math.cos(destinationLatitude) *
      Math.sin(longitudeDifference / 2) ** 2;

  return (
    EARTH_RADIUS_KM *
    2 *
    Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine))
  );
};

export const estimateTravelTime = (
  originCountry: string,
  destinationCountry: string
): TravelEstimate | null => {
  const origin = getCountryLocation(originCountry);
  const destination = getCountryLocation(destinationCountry);

  if (!origin || !destination) return null;

  const distanceKm = getGreatCircleDistanceKm(origin, destination);

  /**
   * Normalisasi jarak ke rentang 0–1 berdasarkan jarak great-circle
   * maksimum di permukaan Bumi.
   */
  const normalizedDistance = clamp(
    distanceKm / MAX_GREAT_CIRCLE_DISTANCE_KM,
    0,
    1
  );

  /**
   * Skalakan ke rentang 90–120 hari game.
   */
  const days = clamp(
    Math.round(
      MIN_TRAVEL_DAYS +
        normalizedDistance * (MAX_TRAVEL_DAYS - MIN_TRAVEL_DAYS)
    ),
    MIN_TRAVEL_DAYS,
    MAX_TRAVEL_DAYS
  );

  return {
    distanceKm,
    days,
    originContinent: origin.continent,
    destinationContinent: destination.continent,
  };
};

const getSimulationClock = (): SimulationClock | null => {
  if (typeof window === 'undefined') return null;

  const manager = (
    window as Window & {
      neosantara_time_controller?: SimulationClock;
    }
  ).neosantara_time_controller;

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

  return (
    getDateDayNumber(clock.getCurrentDate()) +
    Math.min(1, Math.max(0, dayProgress))
  );
};

export const getSimulationMillisecondsPerDay = () =>
  getSimulationClock()?.getMillisecondsPerDay() ?? null;

export const isSimulationTimePaused = () =>
  getSimulationClock()?.getIsPaused() ?? true;
