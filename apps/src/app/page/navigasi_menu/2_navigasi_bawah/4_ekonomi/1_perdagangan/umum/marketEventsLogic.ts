export type MarketEventKind =
  | 'war'
  | 'embargo'
  | 'disaster'
  | 'pandemic'
  | 'economic_crisis'
  | 'discovery'
  | 'shock';

export type CommodityClass =
  | 'energi'
  | 'pangan'
  | 'mineral_strategis'
  | 'manufaktur'
  | 'logam_dasar'
  | 'olahan';

export type MarketEvent = {
  id: string;
  kind: MarketEventKind;
  startDay: number;
  halfLifeDays: number;
  magnitude: number;
  affected: Record<string, number>;
  sourceCountries?: string[];
};

export interface MarketProducer {
  country: string;
  production: Record<string, number>;
}

const COMMODITY_CLASS_ENTRIES: Record<CommodityClass, readonly string[]> = {
  energi: ['batu_bara', 'minyak_bumi', 'gas_alam'],
  pangan: [
    'ayam_unggas', 'sapi_perah', 'sapi_potong', 'domba_kambing', 'padi', 'gandum',
    'jagung', 'sayur', 'umbi', 'kedelai', 'kelapa_sawit', 'kopi', 'teh', 'kakao',
    'tebu', 'udang', 'ikan', 'air_mineral',
  ],
  mineral_strategis: ['uranium', 'litium', 'logam_tanah_jarang', 'mutiara'],
  manufaktur: ['pabrik_semikonduktor', 'pabrik_mesin', 'pabrik_besi'],
  logam_dasar: ['bijih_besi', 'garam'],
  olahan: [
    'semen_beton', 'kayu', 'gula', 'roti', 'pengolahan_daging', 'mie_instan', 'minyak_goreng', 'susu',
  ],
};

export const COMMODITY_CLASS: Record<string, CommodityClass> = Object.fromEntries(
  Object.entries(COMMODITY_CLASS_ENTRIES).flatMap(([commodityClass, commodities]) =>
    commodities.map(commodity => [commodity, commodityClass as CommodityClass]),
  ),
);

const EVENT_KINDS: readonly MarketEventKind[] = [
  'war', 'embargo', 'disaster', 'pandemic', 'economic_crisis', 'discovery', 'shock',
];
export const SENSITIVITY: Record<MarketEventKind, Record<CommodityClass, number>> = {
  war: {
    energi: 1,
    pangan: 0.25,
    mineral_strategis: 0.75,
    manufaktur: 0.15,
    logam_dasar: 0.35,
    olahan: 0.15,
  },
  embargo: {
    energi: 0.8,
    pangan: 0.45,
    mineral_strategis: 0.7,
    manufaktur: 0.45,
    logam_dasar: 0.55,
    olahan: 0.35,
  },
  disaster: {
    energi: 0.1,
    pangan: 0.8,
    mineral_strategis: 0.1,
    manufaktur: 0.1,
    logam_dasar: 0.1,
    olahan: 0.45,
  },
  pandemic: {
    energi: 0.2,
    pangan: 0.35,
    mineral_strategis: 0.2,
    manufaktur: 0.6,
    logam_dasar: 0.2,
    olahan: 0.45,
  },
  economic_crisis: {
    energi: 0.4,
    pangan: 0.2,
    mineral_strategis: 0.45,
    manufaktur: 0.7,
    logam_dasar: 0.45,
    olahan: 0.5,
  },
  discovery: {
    energi: 0.6,
    pangan: 0.15,
    mineral_strategis: 0.75,
    manufaktur: 0.1,
    logam_dasar: 0.55,
    olahan: 0.1,
  },
  shock: {
    energi: 0.8,
    pangan: 0.8,
    mineral_strategis: 0.6,
    manufaktur: 0.4,
    logam_dasar: 0.5,
    olahan: 0.55,
  },
};

function hashSeed(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function seededRandom(seed: number): () => number {
  return () => {
    let value = seed += 0x6D2B79F5;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function normalizedCountry(country: string): string {
  return country.trim().toLowerCase();
}

function eventStrength(event: MarketEvent, day: number): number {
  if (day < event.startDay || event.halfLifeDays <= 0) return 0;
  const age = day - event.startDay;
  const rampDays = Math.min(3, Math.max(1, Math.ceil(event.halfLifeDays * 0.15)));
  const onset = Math.min(1, (age + 1) / rampDays);
  return event.magnitude * onset * 0.5 ** (age / event.halfLifeDays);
}

export function eventFactor(event: MarketEvent, commodity: string, day: number): number {
  const commodityClass = COMMODITY_CLASS[commodity];
  const affected = event.affected[commodity];
  if (!commodityClass || !Number.isFinite(affected) || affected === 0) return 1;
  return 1 + eventStrength(event, day) * SENSITIVITY[event.kind][commodityClass] * affected;
}

export function combinedEventFactor(
  events: readonly MarketEvent[],
  commodity: string,
  day: number,
): number {
  const product = events.reduce(
    (factor, event) => factor * eventFactor(event, commodity, day),
    1,
  );
  return Math.min(2.5, Math.max(0.4, product));
}

export function calculateGlobalTension(events: readonly MarketEvent[], day: number): number {
  const totalStrength = events.reduce((total, event) => (
    total + Math.abs(eventStrength(event, day))
  ), 0);
  return Math.min(1, totalStrength / 2);
}

export function pruneMarketEvents(events: readonly MarketEvent[], day: number): MarketEvent[] {
  return events.filter(event => {
    if (day < event.startDay) return true;
    return Object.keys(event.affected).some(commodity =>
      Math.abs(eventFactor(event, commodity, day) - 1) >= 0.01,
    );
  });
}

function producerShare(
  countryNames: readonly string[],
  commodity: string,
  producers: readonly MarketProducer[],
): number {
  const participants = new Set(countryNames.map(normalizedCountry));
  let globalProduction = 0;
  let participantProduction = 0;
  for (const producer of producers) {
    const output = Number(producer.production[commodity]);
    if (!Number.isFinite(output) || output <= 0) continue;
    globalProduction += output;
    if (participants.has(normalizedCountry(producer.country))) participantProduction += output;
  }
  return globalProduction > 0 ? Math.min(1, participantProduction / globalProduction) : 0;
}

export function buildWarEvent(
  attacker: string,
  target: string,
  day: number,
  producers: readonly MarketProducer[],
): MarketEvent {
  const sourceCountries = [attacker.trim(), target.trim()];
  const affected: Record<string, number> = {};
  for (const [commodity, commodityClass] of Object.entries(COMMODITY_CLASS)) {
    const share = producerShare(sourceCountries, commodity, producers);
    if (share > 0) affected[commodity] = share;
    if (SENSITIVITY.war[commodityClass] === 0) delete affected[commodity];
  }

  const countriesForId = sourceCountries.map(normalizedCountry).sort();
  return {
    id: `war:${countriesForId.join(':')}:${day}`,
    kind: 'war',
    startDay: day,
    halfLifeDays: 14,
    magnitude: 1,
    affected,
    sourceCountries,
  };
}

export function buildEmbargoEvent(
  target: string,
  day: number,
  producers: readonly MarketProducer[],
  eventId?: string,
): MarketEvent {
  const affected: Record<string, number> = {};
  for (const commodity of Object.keys(COMMODITY_CLASS)) {
    const share = producerShare([target], commodity, producers);
    if (share > 0) affected[commodity] = share;
  }
  return {
    id: eventId || `embargo:${normalizedCountry(target)}:${day}`,
    kind: 'embargo',
    startDay: day,
    halfLifeDays: 24,
    magnitude: 0.8,
    affected,
    sourceCountries: [target.trim()],
  };
}

export function registerMarketEvent(
  gameState: Record<string, unknown>,
  event: MarketEvent,
): Record<string, unknown> {
  const existing = Array.isArray(gameState.tradeMarketEvents)
    ? gameState.tradeMarketEvents.filter(isMarketEvent)
    : [];
  if (existing.some(item => item.id === event.id)) return gameState;
  return { ...gameState, tradeMarketEvents: [...existing, event] };
}

export function createDailyShockEvent(day: number): MarketEvent | null {
  const random = seededRandom(hashSeed(`market-shock:${day}`));
  if (random() >= 0.02) return null;

  const scenario = Math.floor(random() * 3);
  const candidates = scenario === 0
    ? ['padi', 'gandum', 'jagung', 'kedelai', 'kelapa_sawit']
    : scenario === 1
      ? ['minyak_bumi', 'gas_alam', 'batu_bara']
      : ['uranium', 'litium', 'logam_tanah_jarang'];
  const commodity = candidates[Math.floor(random() * candidates.length)];
  const direction = scenario === 2 ? -1 : 1;
  const eventKind: MarketEventKind = scenario === 2 ? 'discovery' : 'shock';
  return {
    id: `${eventKind}:${day}:${commodity}`,
    kind: eventKind,
    startDay: day,
    halfLifeDays: scenario === 0 ? 20 : 28,
    magnitude: scenario === 2 ? 0.45 : 0.4,
    affected: { [commodity]: direction },
  };
}

export function isMarketEvent(value: unknown): value is MarketEvent {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
  const event = value as Partial<MarketEvent>;
  return typeof event.id === 'string'
    && EVENT_KINDS.includes(event.kind as MarketEventKind)
    && Number.isInteger(event.startDay)
    && typeof event.halfLifeDays === 'number'
    && Number.isFinite(event.halfLifeDays)
    && event.halfLifeDays > 0
    && Number.isFinite(event.magnitude)
    && event.affected !== null
    && typeof event.affected === 'object'
    && !Array.isArray(event.affected)
    && Object.values(event.affected).every(value => typeof value === 'number' && Number.isFinite(value));
}
