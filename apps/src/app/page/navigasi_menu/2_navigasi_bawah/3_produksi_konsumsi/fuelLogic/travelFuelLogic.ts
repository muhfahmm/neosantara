import { getMaterialStock } from "../../5_pembangunan/build_logic/materialStockLogic.ts";
import { CAPITALS_DATA } from "../../../../map_system/map-data.ts";

export type TravelFuelType =
  | "non-aggression-pact"
  | "defense-alliance"
  | "trade-agreement"
  | "research-contract"
  | "spionase"
  | "sabotase"
  | "military-attack";

export interface TravelFuelRate {
  country_slug: string;
  target_country_slug: string;
  konsumsi_minyak: number;
  multipliers?: Partial<Record<TravelFuelType, number>>;
}

export interface TravelFuelLogEntry {
  id: string;
  date: string;
  targetCountry: string;
  travelType: TravelFuelType;
  amount: number;
}

export interface TravelFuelStatus {
  cost: number | null;
  stock: number;
  remaining: number;
  ok: boolean;
  loading: boolean;
  fallback: boolean;
  dailyPowerPlantNeed: number;
  belowDailyPowerPlantNeed: boolean;
}

const EARTH_RADIUS_KM = 6371;
const FALLBACK_MINIMUM_OIL = 2500;
const FALLBACK_OIL_PER_1000_KM = 500;
const MAX_TRAVEL_OIL = 10000;

const normalizeCountrySlug = (value: string): string =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

const coordinatesByCountry = new Map(
  CAPITALS_DATA
    .filter(
      (country) =>
        typeof country.lat === "number" &&
        typeof country.lng === "number",
    )
    .map((country) => [
      normalizeCountrySlug(country.country),
      { latitude: country.lat, longitude: country.lng },
    ] as const),
);

export function getTravelDistanceKm(originCountry: string, targetCountry: string): number | null {
  const origin = coordinatesByCountry.get(normalizeCountrySlug(originCountry));
  const target = coordinatesByCountry.get(normalizeCountrySlug(targetCountry));
  if (!origin || !target) return null;

  const radians = (degrees: number) => degrees * Math.PI / 180;
  const latitudeDifference = radians(target.latitude - origin.latitude);
  const longitudeDifference = radians(target.longitude - origin.longitude);
  const originLatitude = radians(origin.latitude);
  const targetLatitude = radians(target.latitude);
  const haversine =
    Math.sin(latitudeDifference / 2) ** 2 +
    Math.cos(originLatitude) *
      Math.cos(targetLatitude) *
      Math.sin(longitudeDifference / 2) ** 2;

  return EARTH_RADIUS_KM * 2 * Math.atan2(
    Math.sqrt(haversine),
    Math.sqrt(1 - haversine),
  );
}

export function getTravelOilCost(
  playerCountry: string,
  targetCountry: string,
  travelType: TravelFuelType,
  rates?: TravelFuelRate | null,
): number | null {
  const originSlug = normalizeCountrySlug(playerCountry);
  const targetSlug = normalizeCountrySlug(targetCountry);
  const distanceKm = getTravelDistanceKm(playerCountry, targetCountry);
  if (distanceKm === null) return null;

  const configuredMultiplier = rates?.multipliers?.[travelType] ?? 1;
  const multiplier = Number.isFinite(configuredMultiplier) && configuredMultiplier >= 0
    ? configuredMultiplier
    : 1;
  if (
    rates &&
    rates.country_slug === originSlug &&
    rates.target_country_slug === targetSlug &&
    Number.isFinite(rates.konsumsi_minyak) &&
    rates.konsumsi_minyak >= 0
  ) {
    return Math.round(rates.konsumsi_minyak * multiplier);
  }

  const fallbackCost = Math.max(
    FALLBACK_MINIMUM_OIL,
    Math.ceil(distanceKm / 1000 * FALLBACK_OIL_PER_1000_KM * multiplier),
  );
  return Math.min(MAX_TRAVEL_OIL, fallbackCost);
}

export function checkTravelFuel(
  countryDetail: Record<string, unknown> | null | undefined,
  cost: number,
): { ok: boolean; stock: number; remaining: number } {
  const stock = getMaterialStock(countryDetail, "minyak_bumi");
  const validCost = Number.isFinite(cost) && cost >= 0 ? cost : Number.POSITIVE_INFINITY;
  return {
    ok: stock >= validCost,
    stock,
    remaining: Math.max(0, stock - validCost),
  };
}

export function consumeTravelFuel<T extends Record<string, unknown>>(
  countryDetail: T,
  cost: number,
  entry: TravelFuelLogEntry,
): T {
  const existingLog = Array.isArray(countryDetail.travelFuelLog)
    ? countryDetail.travelFuelLog as TravelFuelLogEntry[]
    : [];
  if (existingLog.some((item) => item?.id === entry.id)) return countryDetail;

  const { ok, stock } = checkTravelFuel(countryDetail, cost);
  if (!ok) return countryDetail;

  return {
    ...countryDetail,
    inventory_minyak_bumi: Math.max(0, stock - cost),
    travelFuelLog: [...existingLog, { ...entry, amount: cost }],
  };
}

export function getTravelOilConsumptionThisMonth(
  countryDetail: Record<string, unknown> | null | undefined,
  currentDate: Date | string = new Date(),
): number {
  const date = currentDate instanceof Date
    ? currentDate
    : new Date(`${currentDate.slice(0, 10)}T00:00:00`);
  if (!Number.isFinite(date.getTime())) return 0;
  const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  const log = Array.isArray(countryDetail?.travelFuelLog)
    ? countryDetail.travelFuelLog as TravelFuelLogEntry[]
    : [];

  return log.reduce((total, entry) => {
    if (
      typeof entry?.date === "string" &&
      entry.date.slice(0, 7) === month &&
      Number.isFinite(entry.amount) &&
      entry.amount > 0
    ) {
      return total + entry.amount;
    }
    return total;
  }, 0);
}

export function getTravelFuelStatus(
  countryDetail: Record<string, unknown> | null | undefined,
  cost: number | null,
  loading = false,
  fallback = false,
): TravelFuelStatus {
  const { ok, stock, remaining } = checkTravelFuel(countryDetail, cost ?? Number.POSITIVE_INFINITY);
  const dailyPowerPlantNeed = Math.max(
    0,
    Number(countryDetail?.pembangkit_listrik_tenaga_uap) || 0,
  ) * 5;

  return {
    cost,
    stock,
    remaining,
    ok: !loading && cost !== null && ok,
    loading,
    fallback,
    dailyPowerPlantNeed,
    belowDailyPowerPlantNeed: dailyPowerPlantNeed > 0 && remaining < dailyPowerPlantNeed,
  };
}
