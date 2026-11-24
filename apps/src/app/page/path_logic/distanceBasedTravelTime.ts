const EARTH_RADIUS_KM = 6371;

export const MAX_ROUTE_DISTANCE_KM = Math.PI * EARTH_RADIUS_KM;
export const MIN_DISTANCE_BASED_TRAVEL_DAYS = 120;
export const MAX_DISTANCE_BASED_TRAVEL_DAYS = 180;

export const getDistanceBasedTravelDays = (distanceKm: number): number => {
  if (!Number.isFinite(distanceKm) || distanceKm < 0) {
    throw new RangeError('Travel distance must be a non-negative finite number');
  }

  const distanceRatio = Math.min(
    1,
    distanceKm / MAX_ROUTE_DISTANCE_KM,
  );
  return MIN_DISTANCE_BASED_TRAVEL_DAYS + Math.round(
    distanceRatio * (MAX_DISTANCE_BASED_TRAVEL_DAYS - MIN_DISTANCE_BASED_TRAVEL_DAYS),
  );
};
