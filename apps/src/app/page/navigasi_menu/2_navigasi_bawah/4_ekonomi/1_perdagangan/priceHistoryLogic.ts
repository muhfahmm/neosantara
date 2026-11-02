import {
  calculateGlobalTension,
  combinedEventFactor,
  createDailyShockEvent,
  isMarketEvent,
  pruneMarketEvents,
  type MarketEvent,
} from './marketEventsLogic.ts';
import {
  backgroundVolume,
  baseVolume,
  getMedianVolume,
  getVolumeBucket,
  getVolumeBuckets,
  type VolumeBucket,
} from './tradeVolumeLedger.ts';

export interface PriceCandle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  netFlow?: number;
}

interface DayCandleOptions {
  volumeBuckets?: readonly VolumeBucket[];
  globalProduction?: number;
  events?: readonly MarketEvent[];
  baselineVolume?: number;
}

export type PriceTimeRange = '1d' | '1w' | '1m' | '6m' | '1y';
export type CandleBucketSize = number | 'day' | 'week' | 'month';

export interface StoredPriceHistory {
  version: 2;
  lastSimDay: number;
  candles: PriceCandle[];
  lastVolumeSignature?: string;
}

export interface TradeMarketPriceState {
  updatedAt: string;
  prices: Record<string, number>;
  basePriceState: Record<string, number>;
}

export interface CandlePriceProfile {
  volatility: number;
  drift: number;
}

export const PRICE_TIME_RANGES = [
  { label: '1H', value: '1d' },
  { label: '1M', value: '1w' },
  { label: '1B', value: '1m' },
  { label: '6B', value: '6m' },
  { label: '1T', value: '1y' },
] as const satisfies readonly { label: string; value: PriceTimeRange }[];

export const DEFAULT_MARKET_PRICES: Record<string, number> = {
  uranium: 8000, batu_bara: 100, minyak_bumi: 150, gas_alam: 120, garam: 50,
  litium: 3000, logam_tanah_jarang: 5000, bijih_besi: 800,
  pabrik_semikonduktor: 4000, pabrik_mesin: 10000, pabrik_besi: 10000,
  semen_beton: 300, kayu: 200, ayam_unggas: 60, sapi_perah: 200,
  sapi_potong: 180, domba_kambing: 150, padi: 80, gandum: 90, jagung: 70,
  sayur: 100, umbi: 60, kedelai: 120, kelapa_sawit: 130, kopi: 300,
  teh: 250, kakao: 350, tebu: 100, karet: 200,
  udang: 500, mutiara: 1000, ikan: 300, air_mineral: 50,
  gula: 150, roti: 200, pengolahan_daging: 250, mie_instan: 180, minyak_goreng: 220,
  susu: 160,
};

const DAY_MS = 24 * 60 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;
const HISTORY_DAYS = 366;
const MARKET_PRICES_KEY = 'tradeMarketPrices';
const PRICE_HISTORIES_KEY = 'tradePriceHistories';

const CANDLE_PROFILES: Record<string, CandlePriceProfile> = {
  uranium: { volatility: 0.065, drift: 0.0008 },
  litium: { volatility: 0.075, drift: 0.001 },
  logam_tanah_jarang: { volatility: 0.07, drift: 0.0009 },
  minyak_bumi: { volatility: 0.055, drift: 0.0007 },
  gas_alam: { volatility: 0.06, drift: 0.0008 },
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isPriceCandle(value: unknown): value is PriceCandle {
  if (!isRecord(value)) return false;
  return Number.isFinite(value.time)
    && Number.isFinite(value.open)
    && Number.isFinite(value.high)
    && Number.isFinite(value.low)
    && Number.isFinite(value.close)
    && Number.isFinite(value.volume)
    && (value.netFlow === undefined || (
      Number.isFinite(value.netFlow) && Number(value.netFlow) >= -1 && Number(value.netFlow) <= 1
    ));
}

function getDayIndex(date: Date): number {
  return Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / DAY_MS);
}

function hashSeed(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function mulberry32(seed: number): () => number {
  return () => {
    let value = seed += 0x6D2B79F5;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function roundPrice(value: number): number {
  return Math.max(0.01, Math.round(value * 100) / 100);
}

function generateCandle(
  country: string,
  commodity: string,
  hourIndex: number,
  open: number,
  profile: CandlePriceProfile,
  anchorClose?: number,
): PriceCandle {
  const seed = hashSeed(`${country.trim().toLowerCase()}|${commodity.trim().toLowerCase()}|${hourIndex}`);
  const random = mulberry32(seed);
  const sigma = profile.volatility * 0.25;
  const close = roundPrice(anchorClose ?? open * Math.exp((random() - 0.5) * 2 * sigma));
  const upperShadow = random() * profile.volatility * open * 0.6;
  const lowerShadow = random() * profile.volatility * open * 0.6;
  const high = roundPrice(Math.max(open, close) + upperShadow);
  const low = roundPrice(Math.min(open, close) - lowerShadow);

  return {
    time: hourIndex * HOUR_MS,
    open: roundPrice(open),
    high: Math.max(high, close, open),
    low: Math.min(low, close, open),
    close,
    volume: Math.round(backgroundVolume(commodity, hourIndex) * 100) / 100,
  };
}

export function generateSeededCandle(
  country: string,
  commodity: string,
  hourIndex: number,
  open: number,
  profile: CandlePriceProfile = getProfile(commodity),
): PriceCandle {
  return generateCandle(country, commodity, hourIndex, open, profile);
}

function getProfile(commodity: string): CandlePriceProfile {
  return CANDLE_PROFILES[commodity] || { volatility: 0.04, drift: 0.001 };
}

function isStoredPriceHistory(value: unknown): value is StoredPriceHistory {
  if (
    !isRecord(value)
    || value.version !== 2
    || !Number.isInteger(value.lastSimDay)
    || !Array.isArray(value.candles)
    || value.candles.length === 0
    || !value.candles.every(isPriceCandle)
  ) return false;

  const closes = value.candles.map(candle => (candle as PriceCandle).close);
  const minClose = Math.min(...closes);
  const maxClose = Math.max(...closes);
  return minClose > 0 && maxClose / minClose <= 20;
}

export function getPriceHistoryKey(country: string, commodity: string): string {
  return `${country.trim().toLowerCase()}::${commodity.trim().toLowerCase()}`;
}

export function getStoredPriceHistory(
  gameState: unknown,
  country: string,
  commodity: string,
): StoredPriceHistory | null {
  if (!isRecord(gameState) || !isRecord(gameState[PRICE_HISTORIES_KEY])) return null;
  const value = gameState[PRICE_HISTORIES_KEY][getPriceHistoryKey(country, commodity)];
  if (!isStoredPriceHistory(value)) return null;
  return value;
}

export function getTradeMarketPriceState(gameState: unknown): TradeMarketPriceState | null {
  if (!isRecord(gameState)) return null;
  const stored = gameState[MARKET_PRICES_KEY];
  if (!isRecord(stored) || typeof stored.updatedAt !== 'string' || !isRecord(stored.prices)) return null;

  const prices: Record<string, number> = { ...DEFAULT_MARKET_PRICES };
  const basePriceState: Record<string, number> = { ...DEFAULT_MARKET_PRICES };
  for (const [key, value] of Object.entries(stored.prices)) {
    if (typeof value === 'number' && Number.isFinite(value) && value > 0) prices[key] = value;
  }
  const storedBasePrices = isRecord(stored.basePriceState) ? stored.basePriceState : stored.prices;
  for (const [key, value] of Object.entries(storedBasePrices)) {
    if (typeof value === 'number' && Number.isFinite(value) && value > 0) basePriceState[key] = value;
  }
  return { updatedAt: stored.updatedAt, prices, basePriceState };
}

export function getTradeMarketPrices(gameState: unknown): Record<string, number> {
  return getTradeMarketPriceState(gameState)?.prices || DEFAULT_MARKET_PRICES;
}

export function createDailyMarketPriceFactors(date: Date = new Date()): Record<string, number> {
  const day = getDayIndex(date);
  return Object.fromEntries(Object.keys(DEFAULT_MARKET_PRICES).map(key => [
    key,
    getDailyRandom('global-market', key, day),
  ]));
}

function updateMarketPrices(
  basePriceState: Record<string, number>,
  randomFactors: Record<string, number>,
  events: readonly MarketEvent[],
  day: number,
): Pick<TradeMarketPriceState, 'prices' | 'basePriceState'> {
  const nextPrices: Record<string, number> = {};
  const nextBasePriceState: Record<string, number> = {};
  const globalTension = calculateGlobalTension(events, day);
  for (const key of Object.keys(DEFAULT_MARKET_PRICES)) {
    const defaultPrice = DEFAULT_MARKET_PRICES[key] || 100;
    const oldBasePrice = basePriceState[key] || defaultPrice;
    const factor = Number.isFinite(randomFactors[key])
      ? randomFactors[key]
      : getDailyRandom('global-market', key, day);
    const randomWalk = 1 + (factor - 0.5) * 0.05 * (1 + 1.5 * globalTension);
    const meanReversion = Math.exp(0.03 * Math.log(defaultPrice / oldBasePrice));
    const nextBasePrice = roundPrice(Math.min(
      defaultPrice * 3,
      Math.max(defaultPrice * 0.3, oldBasePrice * randomWalk * meanReversion),
    ));
    nextBasePriceState[key] = nextBasePrice;
    nextPrices[key] = roundPrice(nextBasePrice * combinedEventFactor(events, key, day));
  }
  return { prices: nextPrices, basePriceState: nextBasePriceState };
}

function getStoredMarketEvents(gameState: Record<string, unknown>): MarketEvent[] {
  return Array.isArray(gameState.tradeMarketEvents)
    ? gameState.tradeMarketEvents.filter(isMarketEvent)
    : [];
}

function getStoredGlobalProduction(gameState: Record<string, unknown>): Record<string, number> {
  const stored = gameState.globalCommodityProduction;
  if (!isRecord(stored)) return {};
  return Object.fromEntries(Object.entries(stored).filter(
    (entry): entry is [string, number] => typeof entry[1] === 'number' && Number.isFinite(entry[1]) && entry[1] >= 0,
  ));
}

function getVolumeSignature(
  commodity: string,
  day: number,
  volumeBuckets: readonly VolumeBucket[],
  globalProduction: number,
  events: readonly MarketEvent[],
): string {
  return JSON.stringify({
    dayBuckets: volumeBuckets.filter(bucket => bucket.day === day),
    globalProduction,
    eventFactors: events.map(event => [event.id, combinedEventFactor([event], commodity, day)]),
  });
}

function getVolumeBaseline(
  candles: readonly PriceCandle[],
  commodity: string,
  day: number,
  globalProduction: number,
): number {
  const recentVolumes = candles.slice(-90 * 24).map(candle => candle.volume);
  if (recentVolumes.length > 0) return getMedianVolume(recentVolumes, baseVolume(commodity, globalProduction));
  const background = Array.from({ length: 90 * 24 }, (_, index) =>
    backgroundVolume(commodity, (day - 90) * 24 + index, globalProduction),
  );
  return getMedianVolume(background, baseVolume(commodity, globalProduction));
}

function prepareMarketEvents(gameState: Record<string, unknown>, day: number): MarketEvent[] {
  const events = getStoredMarketEvents(gameState);
  const shockEvent = createDailyShockEvent(day);
  if (shockEvent && !events.some(event => event.id === shockEvent.id)) events.push(shockEvent);
  return pruneMarketEvents(events, day);
}

function getDailyRandom(country: string, commodity: string, dayIndex: number): number {
  const seed = hashSeed(`${country.trim().toLowerCase()}|${commodity.trim().toLowerCase()}|d|${dayIndex}`);
  return mulberry32(seed)();
}

function getPreviousDailyClose(
  country: string,
  commodity: string,
  dayIndex: number,
  nextClose: number,
  basePrice: number,
): number {
  const random = getDailyRandom(country, commodity, dayIndex);
  const dailyMarketFactor = 1 + (random - 0.5) * 0.05;
  const meanReversion = Math.exp(0.03 * Math.log(basePrice / nextClose));
  return roundPrice(Math.min(
    3 * basePrice,
    Math.max(0.3 * basePrice, nextClose / dailyMarketFactor * meanReversion),
  ));
}

function buildBackfillDailyCloses(
  country: string,
  commodity: string,
  firstDay: number,
  currentDay: number,
  currentPrice: number,
  basePrice: number,
): Map<number, number> {
  const closes = new Map<number, number>([[currentDay, roundPrice(currentPrice)]]);
  for (let day = currentDay - 1; day >= firstDay - 1; day -= 1) {
    const nextClose = closes.get(day + 1);
    if (nextClose === undefined) throw new Error(`Missing daily close for simulation day ${day + 1}.`);
    closes.set(day, getPreviousDailyClose(country, commodity, day, nextClose, basePrice));
  }
  return closes;
}

export function buildDayCandles(
  country: string,
  commodity: string,
  day: number,
  openPrice: number,
  targetClose: number,
  profile: CandlePriceProfile,
  options: DayCandleOptions = {},
): PriceCandle[] {
  const open = roundPrice(openPrice);
  const close = roundPrice(targetClose);
  const volumeBuckets = options.volumeBuckets || [];
  const events = options.events || [];
  const globalProduction = options.globalProduction || 0;
  const volumes: number[] = [];
  const netFlows: number[] = [];
  const base = baseVolume(commodity, globalProduction);
  for (let hour = 0; hour < 24; hour += 1) {
    const hourIndex = day * 24 + hour;
    const trade = getVolumeBucket(volumeBuckets, day, hour);
    const buyVolume = trade?.buyVolume || 0;
    const sellVolume = trade?.sellVolume || 0;
    const eventVolumeFactor = 1 + Math.abs(combinedEventFactor(events, commodity, day) - 1);
    const background = backgroundVolume(commodity, hourIndex, globalProduction) * eventVolumeFactor;
    const total = background + buyVolume + sellVolume;
    volumes.push(total);
    netFlows.push((buyVolume - sellVolume) / Math.max(total, 1));
  }
  const baselineVolume = options.baselineVolume
    ? Math.max(1, options.baselineVolume)
    : getMedianVolume(
      Array.from({ length: 90 * 24 }, (_, index) => backgroundVolume(
        commodity,
        (day - 90) * 24 + index,
        globalProduction,
      )),
      base,
    );
  const walks: number[] = [];
  let walk = 0;

  for (let hour = 0; hour < 24; hour += 1) {
    const hourIndex = day * 24 + hour;
    const random = mulberry32(hashSeed(
      `${country.trim().toLowerCase()}|${commodity.trim().toLowerCase()}|${hourIndex}`,
    ));
    const relVolume = volumes[hour] / baselineVolume;
    const volumeScale = Math.min(2.5, Math.max(0.5, Math.sqrt(relVolume)));
    const sigma = profile.volatility * 0.25 * volumeScale;
    const trade = getVolumeBucket(volumeBuckets, day, hour);
    const netBuy = (trade?.buyVolume || 0) - (trade?.sellVolume || 0);
    const impact = Math.sign(netBuy) * Math.min(
      Math.log(1.08),
      0.005 * Math.sqrt(Math.abs(netBuy) / Math.max(base, 1)),
    );
    walk += (random() - 0.5) * 2 * sigma + impact;
    walks.push(walk);
  }

  const candles: PriceCandle[] = [];
  const logOpen = Math.log(open);
  const logClose = Math.log(close);
  for (let hour = 0; hour < 24; hour += 1) {
    const hourIndex = day * 24 + hour;
    const random = mulberry32(hashSeed(
      `${country.trim().toLowerCase()}|${commodity.trim().toLowerCase()}|${hourIndex}`,
    ));
    random();
    const progress = (hour + 1) / 24;
    const logPrice = logOpen + (logClose - logOpen) * progress + walks[hour] - walks[23] * progress;
    const candleOpen = hour === 0 ? open : candles[hour - 1].close;
    const unclampedClose = hour === 23 ? close : Math.exp(logPrice);
    const candleClose = hour === 23
      ? close
      : roundPrice(Math.min(candleOpen * 1.08, Math.max(candleOpen * 0.92, unclampedClose)));
    const relVolume = volumes[hour] / baselineVolume;
    const shadowScale = Math.min(2.2, Math.max(0.4, Math.sqrt(relVolume)));
    const upperShadow = random() * profile.volatility * candleOpen * 0.6 * shadowScale;
    const lowerShadow = random() * profile.volatility * candleOpen * 0.6 * shadowScale;
    const high = roundPrice(Math.max(candleOpen, candleClose) + upperShadow);
    const low = roundPrice(Math.min(candleOpen, candleClose) - lowerShadow);

    candles.push({
      time: hourIndex * HOUR_MS,
      open: candleOpen,
      high: Math.max(high, candleOpen, candleClose),
      low: Math.min(low, candleOpen, candleClose),
      close: candleClose,
      volume: Math.round(volumes[hour] * 100) / 100,
      netFlow: Math.min(1, Math.max(-1, netFlows[hour])),
    });
  }

  return candles;
}

function createBackfill(
  country: string,
  commodity: string,
  currentDay: number,
  currentPrice: number,
  initialPrice: number,
  profile: CandlePriceProfile,
  baseCurrentPrice: number = currentPrice,
  volumeOptions: DayCandleOptions = {},
  volumeSignature = '',
): StoredPriceHistory {
  const firstDay = currentDay - HISTORY_DAYS + 1;
  const dailyCloses = buildBackfillDailyCloses(
    country,
    commodity,
    firstDay,
    currentDay,
    baseCurrentPrice,
    initialPrice,
  );
  const candles: PriceCandle[] = [];
  const globalProduction = volumeOptions.globalProduction || 0;
  const baselineVolume = getVolumeBaseline([], commodity, currentDay, globalProduction);
  const candleOptions = { ...volumeOptions, baselineVolume };
  for (let day = firstDay; day < currentDay; day += 1) {
    const open = dailyCloses.get(day - 1);
    const close = dailyCloses.get(day);
    if (open === undefined || close === undefined) {
      throw new Error(`Missing backfill price for simulation day ${day}.`);
    }
    candles.push(...buildDayCandles(country, commodity, day, open, close, profile, {
      ...candleOptions,
      events: [],
    }));
  }
  const finalDayOpen = dailyCloses.get(currentDay - 1);
  if (finalDayOpen === undefined) {
    throw new Error(`Missing backfill opening price for simulation day ${currentDay}.`);
  }
  candles.push(...buildDayCandles(country, commodity, currentDay, finalDayOpen, currentPrice, profile, {
    ...candleOptions,
    events: [],
  }));

  return { version: 2, lastSimDay: currentDay, candles, lastVolumeSignature: volumeSignature };
}

function appendSimulationDays(
  history: StoredPriceHistory,
  country: string,
  commodity: string,
  currentDay: number,
  currentPrice: number,
  profile: CandlePriceProfile,
  volumeOptions: DayCandleOptions,
  volumeSignature: string,
): StoredPriceHistory {
  if (currentDay <= history.lastSimDay || history.candles.length === 0) return history;

  const candles = [...history.candles];
  const firstDay = history.lastSimDay + 1;
  const previousClose = candles[candles.length - 1].close;
  const dayCount = currentDay - history.lastSimDay;
  const dailyCloses = new Map<number, number>([[currentDay, roundPrice(currentPrice)]]);

  if (dayCount === 1) {
    dailyCloses.set(firstDay, roundPrice(currentPrice));
  } else {
    const startLog = Math.log(previousClose);
    const endLog = Math.log(roundPrice(currentPrice));
    const sigma = 0.05 / Math.sqrt(3);
    const walks: number[] = [];
    let walk = 0;
    for (let day = firstDay; day <= currentDay; day += 1) {
      walk += (getDailyRandom(country, commodity, day) - 0.5) * 2 * sigma;
      walks.push(walk);
    }
    for (let day = firstDay; day <= currentDay; day += 1) {
      if (day === currentDay) continue;
      const progress = (day - history.lastSimDay) / dayCount;
      const bridge = walks[day - firstDay] - walks[walks.length - 1] * progress;
      dailyCloses.set(day, roundPrice(Math.exp(startLog + (endLog - startLog) * progress + bridge)));
    }
  }

  let open = previousClose;
  const baselineVolume = getVolumeBaseline(history.candles, commodity, currentDay, volumeOptions.globalProduction || 0);
  for (let day = firstDay; day <= currentDay; day += 1) {
    const close = dailyCloses.get(day);
    if (close === undefined) throw new Error(`Missing simulation price for day ${day}.`);
    candles.push(...buildDayCandles(country, commodity, day, open, close, profile, {
      ...volumeOptions,
      baselineVolume,
    }));
    open = close;
  }

  return { version: 2, lastSimDay: currentDay, candles, lastVolumeSignature: volumeSignature };
}

function aggregateKey(time: number, bucketSize: CandleBucketSize): string | number {
  if (typeof bucketSize === 'number') {
    if (!Number.isFinite(bucketSize) || bucketSize <= 0) {
      throw new RangeError('Candle bucket size must be a positive number of hours.');
    }
    return Math.floor(time / (bucketSize * HOUR_MS));
  }

  const date = new Date(time);
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  if (bucketSize === 'month') return `${year}-${month}`;
  if (bucketSize === 'week') {
    const day = Math.floor(Date.UTC(year, month, date.getUTCDate()) / DAY_MS);
    return Math.floor((day + 4) / 7);
  }
  return `${year}-${month}-${date.getUTCDate()}`;
}

export function aggregateCandles(
  hourly: readonly PriceCandle[],
  bucketSize: CandleBucketSize,
): PriceCandle[] {
  if (hourly.length === 0) return [];
  const sorted = [...hourly].sort((a, b) => a.time - b.time);
  const buckets = new Map<string | number, PriceCandle>();

  for (const candle of sorted) {
    const key = aggregateKey(candle.time, bucketSize);
    const bucket = buckets.get(key);
    if (!bucket) {
      buckets.set(key, { ...candle });
      continue;
    }
    bucket.high = Math.max(bucket.high, candle.high);
    bucket.low = Math.min(bucket.low, candle.low);
    bucket.close = candle.close;
    if (bucket.netFlow !== undefined || candle.netFlow !== undefined) {
      const combinedVolume = bucket.volume + candle.volume;
      bucket.netFlow = combinedVolume > 0
        ? ((bucket.netFlow || 0) * bucket.volume + (candle.netFlow || 0) * candle.volume) / combinedVolume
        : 0;
    }
    bucket.volume += candle.volume;
  }

  return Array.from(buckets.values()).sort((a, b) => a.time - b.time);
}

function getRangeStart(date: Date, range: PriceTimeRange): Date {
  const start = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  if (range === '1d') return start;
  if (range === '1w') {
    start.setUTCDate(start.getUTCDate() - 6);
    return start;
  }
  if (range === '1m') {
    const dayCount = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    start.setUTCDate(start.getUTCDate() - dayCount + 1);
    return start;
  }
  if (range === '6m') {
    const dayCount = Array.from({ length: 6 }, (_, index) => {
      const monthDate = new Date(date.getFullYear(), date.getMonth() - index + 1, 0);
      return monthDate.getDate();
    }).reduce((sum, days) => sum + days, 0);
    start.setUTCDate(start.getUTCDate() - dayCount + 1);
    return start;
  }
  const dayCount = (date.getFullYear() % 4 === 0
    && (date.getFullYear() % 100 !== 0 || date.getFullYear() % 400 === 0)) ? 366 : 365;
  start.setUTCDate(start.getUTCDate() - dayCount + 1);
  return start;
}

export function getCandlesForRange(
  hourly: readonly PriceCandle[],
  range: PriceTimeRange,
  currentDate: Date,
): PriceCandle[] {
  const calendarDayStart = Date.UTC(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    currentDate.getDate(),
  );
  const startTime = getRangeStart(currentDate, range).getTime();
  const endTime = calendarDayStart + DAY_MS;
  const visible = hourly.filter(candle => candle.time >= startTime && candle.time < endTime);
  if (range === '1d') return visible;
  if (range === '6m') return aggregateCandles(visible, 'week');
  if (range === '1y') return aggregateCandles(visible, 'month');
  return aggregateCandles(visible, 'day');
}

export function getCandlesForAllRanges(
  hourly: readonly PriceCandle[],
  currentDate: Date,
): Record<PriceTimeRange, PriceCandle[]> {
  return {
    '1d': getCandlesForRange(hourly, '1d', currentDate),
    '1w': getCandlesForRange(hourly, '1w', currentDate),
    '1m': getCandlesForRange(hourly, '1m', currentDate),
    '6m': getCandlesForRange(hourly, '6m', currentDate),
    '1y': getCandlesForRange(hourly, '1y', currentDate),
  };
}

export function updateTradePriceHistory(
  gameState: Record<string, unknown>,
  options: {
    country: string;
    commodity: string;
    currentDate: Date;
    randomFactors: Record<string, number>;
    candleProfile?: CandlePriceProfile;
    globalProduction?: Record<string, number>;
    currentPrice?: number;
  },
): Record<string, unknown> {
  const dayLabel = [
    options.currentDate.getFullYear(),
    String(options.currentDate.getMonth() + 1).padStart(2, '0'),
    String(options.currentDate.getDate()).padStart(2, '0'),
  ].join('-');
  const existingMarketState = getTradeMarketPriceState(gameState);
  const currentDay = getDayIndex(options.currentDate);
  const isNewMarketDay = existingMarketState?.updatedAt !== dayLabel;
  const events = isNewMarketDay
    ? prepareMarketEvents(gameState, currentDay)
    : getStoredMarketEvents(gameState);
  const volumeBuckets = getVolumeBuckets(gameState, options.commodity);
  const globalProduction = options.globalProduction?.[options.commodity]
    ?? getStoredGlobalProduction(gameState)[options.commodity]
    ?? 0;
  const volumeOptions: DayCandleOptions = {
    volumeBuckets,
    globalProduction,
    events,
  };
  const volumeSignature = `${getVolumeSignature(
    options.commodity,
    currentDay,
    volumeBuckets,
    globalProduction,
    events,
  )}|${options.currentPrice ?? ''}`;
  const marketState: TradeMarketPriceState = existingMarketState?.updatedAt === dayLabel
    ? existingMarketState
    : {
      updatedAt: dayLabel,
      ...updateMarketPrices(
        existingMarketState?.basePriceState || existingMarketState?.prices || DEFAULT_MARKET_PRICES,
        options.randomFactors,
        events,
        currentDay,
      ),
    };

  const histories = isRecord(gameState[PRICE_HISTORIES_KEY])
    ? gameState[PRICE_HISTORIES_KEY]
    : {};
  const historyKey = getPriceHistoryKey(options.country, options.commodity);
  let nextHistory = getStoredPriceHistory(gameState, options.country, options.commodity);
  const currentPrice = Number.isFinite(options.currentPrice) && Number(options.currentPrice) > 0
    ? Number(options.currentPrice)
    : marketState.prices[options.commodity];
  if (options.commodity && currentPrice > 0) {
    nextHistory = nextHistory
      ? appendSimulationDays(
        nextHistory,
        options.country,
        options.commodity,
        currentDay,
        currentPrice,
        options.candleProfile || getProfile(options.commodity),
        volumeOptions,
        volumeSignature,
      )
      : createBackfill(
        options.country,
        options.commodity,
        currentDay,
        currentPrice,
        DEFAULT_MARKET_PRICES[options.commodity] || currentPrice,
        options.candleProfile || getProfile(options.commodity),
        existingMarketState?.basePriceState[options.commodity]
          || DEFAULT_MARKET_PRICES[options.commodity]
          || currentPrice,
        { ...volumeOptions, events: [] },
        volumeSignature,
      );
    if (nextHistory.lastSimDay === currentDay && nextHistory.lastVolumeSignature !== volumeSignature) {
      const currentDayCandles = nextHistory.candles.slice(-24);
      if (currentDayCandles.length === 24) {
        const previousCandles = nextHistory.candles.slice(0, -24);
        const baselineVolume = getVolumeBaseline(
          previousCandles,
          options.commodity,
          currentDay,
          globalProduction,
        );
        nextHistory = {
          ...nextHistory,
          candles: [
            ...previousCandles,
            ...buildDayCandles(
              options.country,
              options.commodity,
              currentDay,
              currentDayCandles[0].open,
              currentPrice,
              options.candleProfile || getProfile(options.commodity),
              { ...volumeOptions, baselineVolume },
            ),
          ],
          lastVolumeSignature: volumeSignature,
        };
      }
    }
  }

  const historyWasUpdated = nextHistory !== getStoredPriceHistory(gameState, options.country, options.commodity);
  const marketWasUpdated = existingMarketState?.updatedAt !== marketState.updatedAt;
  const eventsWereUpdated = isNewMarketDay
    && JSON.stringify(gameState.tradeMarketEvents || []) !== JSON.stringify(events);
  if (!marketWasUpdated && !historyWasUpdated && !eventsWereUpdated) return gameState;

  return {
    ...gameState,
    [MARKET_PRICES_KEY]: marketState,
    ...(isNewMarketDay ? { tradeMarketEvents: events } : {}),
    ...(historyWasUpdated
      ? { [PRICE_HISTORIES_KEY]: { ...histories, [historyKey]: nextHistory } }
      : {}),
  };
}

export function advanceTradePriceHistoriesForSimulationDay(
  gameState: Record<string, unknown>,
  currentDate: Date,
  randomFactors: Record<string, number>,
  globalProduction?: Record<string, number>,
): Record<string, unknown> {
  const dayLabel = [
    currentDate.getFullYear(),
    String(currentDate.getMonth() + 1).padStart(2, '0'),
    String(currentDate.getDate()).padStart(2, '0'),
  ].join('-');
  const existingMarketState = getTradeMarketPriceState(gameState);
  const currentDay = getDayIndex(currentDate);
  const isNewMarketDay = existingMarketState?.updatedAt !== dayLabel;
  const events = isNewMarketDay
    ? prepareMarketEvents(gameState, currentDay)
    : getStoredMarketEvents(gameState);
  const production = globalProduction || getStoredGlobalProduction(gameState);
  const marketState: TradeMarketPriceState = existingMarketState?.updatedAt === dayLabel
    ? existingMarketState
    : {
      updatedAt: dayLabel,
      ...updateMarketPrices(
        existingMarketState?.basePriceState || existingMarketState?.prices || DEFAULT_MARKET_PRICES,
        randomFactors,
        events,
        currentDay,
      ),
    };

  const existingHistories = isRecord(gameState[PRICE_HISTORIES_KEY])
    ? gameState[PRICE_HISTORIES_KEY]
    : {};
  const histories = { ...existingHistories };
  const playerCountry = String(gameState.country || gameState.nama || '').trim().toLowerCase();
  let historyWasUpdated = false;

  if (playerCountry) {
    for (const [historyKey, value] of Object.entries(existingHistories)) {
      const [country, commodity] = historyKey.split('::');
      if (country !== playerCountry || !commodity) continue;
      const currentPrice = marketState.prices[commodity];
      if (!currentPrice) continue;
      const volumeBuckets = getVolumeBuckets(gameState, commodity);
      const commodityProduction = production[commodity] || 0;
      const volumeOptions: DayCandleOptions = {
        volumeBuckets,
        globalProduction: commodityProduction,
        events,
      };
      const volumeSignature = getVolumeSignature(
        commodity,
        currentDay,
        volumeBuckets,
        commodityProduction,
        events,
      );

      const nextHistory = isStoredPriceHistory(value)
        ? appendSimulationDays(
          value,
          country,
          commodity,
          currentDay,
          currentPrice,
          getProfile(commodity),
          volumeOptions,
          volumeSignature,
        )
        : createBackfill(
          country,
          commodity,
          currentDay,
          currentPrice,
          DEFAULT_MARKET_PRICES[commodity] || currentPrice,
          getProfile(commodity),
          existingMarketState?.basePriceState[commodity]
            || DEFAULT_MARKET_PRICES[commodity]
            || currentPrice,
          { ...volumeOptions, events: [] },
          volumeSignature,
        );
      if (nextHistory !== value) {
        histories[historyKey] = nextHistory;
        historyWasUpdated = true;
      }
    }
  }

  const marketWasUpdated = existingMarketState?.updatedAt !== marketState.updatedAt;
  const eventsWereUpdated = isNewMarketDay
    && JSON.stringify(gameState.tradeMarketEvents || []) !== JSON.stringify(events);
  const productionWasUpdated = globalProduction !== undefined
    && JSON.stringify(gameState.globalCommodityProduction || {}) !== JSON.stringify(production);
  if (!marketWasUpdated && !historyWasUpdated && !eventsWereUpdated && !productionWasUpdated) return gameState;

  return {
    ...gameState,
    [MARKET_PRICES_KEY]: marketState,
    ...(globalProduction !== undefined ? { globalCommodityProduction: production } : {}),
    ...(isNewMarketDay ? { tradeMarketEvents: events } : {}),
    ...(historyWasUpdated ? { [PRICE_HISTORIES_KEY]: histories } : {}),
  };
}
