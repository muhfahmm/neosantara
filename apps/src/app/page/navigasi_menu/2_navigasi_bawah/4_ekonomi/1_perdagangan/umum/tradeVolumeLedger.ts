export interface VolumeBucket {
  day: number;
  hour: number;
  buyVolume: number;
  sellVolume: number;
}

export interface TradeRecord {
  commodity: string;
  quantity: number;
  side: 'buy' | 'sell';
  day: number;
  hour: number;
  counterparty?: string;
}

const LEDGER_KEY = 'tradeVolumeLedger';
const RETENTION_DAYS = 400;

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isVolumeBucket(value: unknown): value is VolumeBucket {
  if (!isRecord(value)) return false;
  return Number.isInteger(value.day)
    && Number.isInteger(value.hour)
    && Number(value.hour) >= 0
    && Number(value.hour) < 24
    && Number.isFinite(value.buyVolume)
    && Number(value.buyVolume) >= 0
    && Number.isFinite(value.sellVolume)
    && Number(value.sellVolume) >= 0;
}

export function getVolumeBuckets(gameState: unknown, commodity: string): VolumeBucket[] {
  if (!isRecord(gameState) || !isRecord(gameState[LEDGER_KEY])) return [];
  const value = gameState[LEDGER_KEY][commodity];
  if (!Array.isArray(value)) return [];
  return value.filter(isVolumeBucket).map(bucket => ({ ...bucket }));
}

export function recordTrade(
  gameState: Record<string, unknown>,
  trade: TradeRecord,
): Record<string, unknown> {
  if (!trade.commodity.trim()) throw new RangeError('Trade commodity must not be empty.');
  if (!Number.isFinite(trade.quantity) || trade.quantity <= 0) {
    throw new RangeError('Trade quantity must be a positive finite number.');
  }
  if (!Number.isInteger(trade.day) || !Number.isInteger(trade.hour) || trade.hour < 0 || trade.hour >= 24) {
    throw new RangeError('Trade day and hour must be valid simulation indexes.');
  }

  const currentLedger = isRecord(gameState[LEDGER_KEY]) ? gameState[LEDGER_KEY] : {};
  const storedBuckets = currentLedger[trade.commodity];
  const existing: VolumeBucket[] = Array.isArray(storedBuckets)
    ? storedBuckets.filter(isVolumeBucket).map((bucket: VolumeBucket) => ({ ...bucket }))
    : [];
  const cutoffDay = trade.day - RETENTION_DAYS + 1;
  const retained = existing.filter(bucket => bucket.day >= cutoffDay && bucket.day <= trade.day);
  const current = retained.find(bucket => bucket.day === trade.day && bucket.hour === trade.hour);
  const updated = current
    ? retained.map(bucket => bucket === current
      ? {
        ...bucket,
        buyVolume: bucket.buyVolume + (trade.side === 'buy' ? trade.quantity : 0),
        sellVolume: bucket.sellVolume + (trade.side === 'sell' ? trade.quantity : 0),
      }
      : bucket)
    : [
      ...retained,
      {
        day: trade.day,
        hour: trade.hour,
        buyVolume: trade.side === 'buy' ? trade.quantity : 0,
        sellVolume: trade.side === 'sell' ? trade.quantity : 0,
      },
    ];

  updated.sort((left, right) => left.day - right.day || left.hour - right.hour);
  return {
    ...gameState,
    [LEDGER_KEY]: {
      ...currentLedger,
      [trade.commodity]: updated,
    },
  };
}

function hashSeed(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function seededRandom(seed: number): number {
  let value = seed + 0x6D2B79F5;
  value = Math.imul(value ^ (value >>> 15), value | 1);
  value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
  return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
}

export function baseVolume(commodity: string, globalProduction = 0): number {
  const productionScale = Number.isFinite(globalProduction) && globalProduction > 0
    ? Math.sqrt(globalProduction)
    : 1;
  const commodityScale = 0.9 + seededRandom(hashSeed(`${commodity}|base-volume`)) * 0.2;
  return Math.max(100, 100 * productionScale * commodityScale);
}

export function backgroundVolume(
  commodity: string,
  hourIndex: number,
  globalProduction = 0,
): number {
  const hourOfDay = ((hourIndex % 24) + 24) % 24;
  const daylightPattern = 0.65 + 0.7 * Math.max(0, Math.sin(Math.PI * (hourOfDay - 6) / 14));
  const variation = 0.8 + seededRandom(hashSeed(`${commodity}|${hourIndex}|background`)) * 0.4;
  return baseVolume(commodity, globalProduction) * daylightPattern * variation;
}

export function getVolumeBucket(
  buckets: readonly VolumeBucket[],
  day: number,
  hour: number,
): VolumeBucket | undefined {
  return buckets.find(bucket => bucket.day === day && bucket.hour === hour);
}

export function getMedianVolume(
  buckets: readonly number[],
  fallback: number,
): number {
  if (buckets.length === 0) return Math.max(1, fallback);
  const sorted = [...buckets].filter(Number.isFinite).sort((left, right) => left - right);
  if (sorted.length === 0) return Math.max(1, fallback);
  const middle = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle];
  return Math.max(1, median);
}

export function calculateGlobalProduction(
  countries: readonly Record<string, unknown>[],
  metadata: Record<string, unknown>,
  commodities: readonly string[],
): Record<string, number> {
  const totals: Record<string, number> = Object.fromEntries(commodities.map(commodity => [commodity, 0]));
  for (const country of countries) {
    for (const commodity of commodities) {
      const buildingCount = Number(country[commodity]) || 0;
      const metadataEntry = metadata[commodity];
      const productionRate = isRecord(metadataEntry) ? Number(metadataEntry.produksi) || 0 : 0;
      const accumulatedProduction = Number(country[`production_${commodity}`]) || 0;
      totals[commodity] += buildingCount > 0 && productionRate > 0
        ? buildingCount * productionRate
        : Math.max(0, accumulatedProduction);
    }
  }
  return totals;
}
