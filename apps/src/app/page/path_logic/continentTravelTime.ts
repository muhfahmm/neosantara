export type SupportedContinent =
  | 'Asia'
  | 'Afrika'
  | 'Eropa'
  | 'Oceania'
  | 'Amerika Selatan'
  | 'Amerika Utara';

export const CONTINENT_TRAVEL_DAYS: Record<
  SupportedContinent,
  Record<SupportedContinent, number>
> = {
  Asia: {
    Asia: 60,
    Afrika: 120,
    Eropa: 90,
    Oceania: 100,
    'Amerika Selatan': 170,
    'Amerika Utara': 150,
  },
  Afrika: {
    Asia: 120,
    Afrika: 60,
    Eropa: 80,
    Oceania: 140,
    'Amerika Selatan': 130,
    'Amerika Utara': 130,
  },
  Eropa: {
    Asia: 90,
    Afrika: 80,
    Eropa: 60,
    Oceania: 150,
    'Amerika Selatan': 120,
    'Amerika Utara': 90,
  },
  Oceania: {
    Asia: 100,
    Afrika: 140,
    Eropa: 150,
    Oceania: 60,
    'Amerika Selatan': 160,
    'Amerika Utara': 140,
  },
  'Amerika Selatan': {
    Asia: 170,
    Afrika: 130,
    Eropa: 120,
    Oceania: 160,
    'Amerika Selatan': 60,
    'Amerika Utara': 80,
  },
  'Amerika Utara': {
    Asia: 150,
    Afrika: 130,
    Eropa: 90,
    Oceania: 140,
    'Amerika Selatan': 80,
    'Amerika Utara': 60,
  },
};

const EARTH_RADIUS_KM = 6371;
const MAX_ROUTE_DISTANCE_KM = Math.PI * EARTH_RADIUS_KM;
const MIN_FALLBACK_TRAVEL_DAYS = 60;
const MAX_FALLBACK_TRAVEL_DAYS = 170;

export const getTravelDaysBetweenContinents = (
  origin: SupportedContinent,
  destination: SupportedContinent,
): number => CONTINENT_TRAVEL_DAYS[origin][destination];

export const getFallbackTravelDaysFromDistance = (distanceKm: number): number => {
  if (!Number.isFinite(distanceKm) || distanceKm < 0) {
    throw new RangeError('Travel distance must be a non-negative finite number');
  }

  const distanceRatio = Math.min(
    1,
    distanceKm / MAX_ROUTE_DISTANCE_KM,
  );
  return MIN_FALLBACK_TRAVEL_DAYS + Math.round(
    distanceRatio * (MAX_FALLBACK_TRAVEL_DAYS - MIN_FALLBACK_TRAVEL_DAYS),
  );
};
