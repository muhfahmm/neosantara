export interface NpcMaterialWorkerCountry {
  country_slug?: string;
  slug?: string;
  [key: string]: unknown;
}

export interface NpcMaterialWorkerRules {
  is_banned?: boolean;
  ban_finished_at?: string | null;
  production_bonus_multiplier?: number;
  external_production_multiplier?: number;
  industrial_consumption_per_day?: number;
}

export interface NpcMaterialWorkerInput {
  current_date: string;
  fallback_date: string;
  metadata: Record<string, unknown>;
  countries: NpcMaterialWorkerCountry[];
  resource_rules?: Record<string, Record<string, NpcMaterialWorkerRules>>;
}

export interface NpcMaterialWorkerResult {
  slug: string;
  updates: Record<string, unknown>;
}

export interface NpcDailyMetricsWorkerCountry {
  slug: string;
  months_passed: number;
  low_sector_count: number;
  satisfaction: number;
  sector_deficit_month_counter: number;
  sector_deficit_kepuasan_penalty: number;
  openness_score: number;
  president_rating: number;
  rating_month_counter: number;
  last_rating_threshold: number;
  rating_bonus_multiplier: number;
  kesejahteraan: number;
  kesejahteraan_decay: number;
  kesejahteraan_month_counter: number;
  last_kesejahteraan_threshold: number;
}

export interface NpcDailyMetricsWorkerResult {
  slug: string;
  updates: Record<string, number>;
}

export interface FoodMetricsWorkerInput {
  population: number;
  commodities: Array<{
    key: string;
    production: number;
    consumption_per_capita: number;
    include_in_deficit: boolean;
  }>;
  groups: Array<{
    weight: number;
    commodity_families: string[][];
  }>;
}

export interface FoodMetricsWorkerResult {
  foodRatio: number;
  foodDeficitCount: number;
  foodSurplusRatio: number;
}

interface WorkerResponse {
  id: number;
  result?: string;
  error?: string;
}

interface WorkerRequest {
  id: number;
  action: 'materials' | 'daily_metrics' | 'food_metrics';
  input: unknown;
}

interface PendingRequest {
  resolve: (result: string) => void;
  reject: (error: Error) => void;
}

function isNpcMaterialWorkerResult(value: unknown): value is NpcMaterialWorkerResult {
  return typeof value === 'object' &&
    value !== null &&
    'slug' in value &&
    typeof value.slug === 'string' &&
    'updates' in value &&
    typeof value.updates === 'object' &&
    value.updates !== null &&
    !Array.isArray(value.updates);
}

let worker: Worker | null = null;
let nextRequestId = 0;
const pendingRequests = new Map<number, PendingRequest>();
const projectedMetadataCache = new WeakMap<object, Record<string, unknown>>();

function projectMaterialMetadata(metadata: Record<string, unknown>): Record<string, unknown> {
  const cached = projectedMetadataCache.get(metadata);
  if (cached) return cached;

  const projected = Object.fromEntries(
    Object.entries(metadata).map(([key, entry]) => {
      if (typeof entry !== 'object' || entry === null || Array.isArray(entry)) {
        return [key, entry];
      }
      const metadataEntry = entry as Record<string, unknown>;
      return [key, {
        ...(metadataEntry.produksi !== undefined ? { produksi: metadataEntry.produksi } : {}),
        ...(metadataEntry.dataKey !== undefined ? { dataKey: metadataEntry.dataKey } : {}),
      }];
    }),
  );
  projectedMetadataCache.set(metadata, projected);
  return projected;
}

function projectMaterialCountries(
  countries: NpcMaterialWorkerCountry[],
  metadata: Record<string, unknown>,
): NpcMaterialWorkerCountry[] {
  const resourceKeys = Object.keys(metadata);
  return countries.map(country => {
    const projected: NpcMaterialWorkerCountry = {
      country_slug: country.country_slug,
      slug: country.slug,
      jumlah_penduduk: country.jumlah_penduduk,
    };
    for (const key of resourceKeys) {
      for (const field of [key, `build_date_${key}`, `inventory_${key}`, `last_update_date_${key}`]) {
        if (Object.prototype.hasOwnProperty.call(country, field)) {
          projected[field] = country[field];
        }
      }
    }
    return projected;
  });
}

function rejectPendingRequests(error: Error): void {
  for (const request of pendingRequests.values()) {
    request.reject(error);
  }
  pendingRequests.clear();
  worker?.terminate();
  worker = null;
}

function getWorker(): Worker {
  if (worker) return worker;

  worker = new Worker(new URL('./npcSimulation.worker.ts', import.meta.url), { type: 'module' });
  worker.addEventListener('message', (event: MessageEvent<WorkerResponse>) => {
    const request = pendingRequests.get(event.data.id);
    if (!request) return;
    pendingRequests.delete(event.data.id);

    if (event.data.error) {
      request.reject(new Error(event.data.error));
      return;
    }
    if (!event.data.result) {
      request.reject(new Error('Rust NPC worker returned an empty result.'));
      return;
    }
    request.resolve(event.data.result);
  });
  worker.addEventListener('error', (event) => {
    rejectPendingRequests(new Error(`Rust NPC worker failed: ${event.message}`));
  });
  worker.addEventListener('messageerror', () => {
    rejectPendingRequests(new Error('Rust NPC worker returned an unreadable message.'));
  });

  return worker;
}

function requestNpcWorker(action: WorkerRequest['action'], input: unknown): Promise<string> {
  const requestWorker = getWorker();
  const id = ++nextRequestId;
  return new Promise((resolve, reject) => {
    pendingRequests.set(id, { resolve, reject });
    try {
      requestWorker.postMessage({ id, action, input });
    } catch (error) {
      pendingRequests.delete(id);
      reject(error instanceof Error ? error : new Error(String(error)));
    }
  });
}

function parseWorkerResults<T>(
  result: string,
  isResult: (value: unknown) => value is T,
): T[] {
  const results: unknown = JSON.parse(result);
  if (!Array.isArray(results) || !results.every(isResult)) {
    throw new Error('Rust NPC worker returned an invalid result list.');
  }
  return results;
}

export function simulateNpcMaterialsInRust(
  input: NpcMaterialWorkerInput,
): Promise<NpcMaterialWorkerResult[]> {
  const projectedInput: NpcMaterialWorkerInput = {
    ...input,
    metadata: projectMaterialMetadata(input.metadata),
    countries: projectMaterialCountries(input.countries, input.metadata),
  };
  return requestNpcWorker('materials', projectedInput).then(result =>
    parseWorkerResults(result, isNpcMaterialWorkerResult),
  );
}

export function advanceNpcDailyMetricsInRust(
  countries: NpcDailyMetricsWorkerCountry[],
): Promise<NpcDailyMetricsWorkerResult[]> {
  return requestNpcWorker('daily_metrics', { countries }).then(result =>
    parseWorkerResults(result, (value): value is NpcDailyMetricsWorkerResult =>
      typeof value === 'object' &&
      value !== null &&
      'slug' in value &&
      typeof value.slug === 'string' &&
      'updates' in value &&
      typeof value.updates === 'object' &&
      value.updates !== null &&
      !Array.isArray(value.updates) &&
      Object.values(value.updates).every(item => typeof item === 'number'),
    ),
  );
}

export function calculateFoodMetricsInRust(
  input: FoodMetricsWorkerInput,
): Promise<FoodMetricsWorkerResult> {
  return requestNpcWorker('food_metrics', input).then(result => {
    const parsed: unknown = JSON.parse(result);
    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      !('foodRatio' in parsed) ||
      !('foodDeficitCount' in parsed) ||
      !('foodSurplusRatio' in parsed) ||
      typeof parsed.foodRatio !== 'number' ||
      !Number.isFinite(parsed.foodRatio) ||
      typeof parsed.foodDeficitCount !== 'number' ||
      !Number.isInteger(parsed.foodDeficitCount) ||
      typeof parsed.foodSurplusRatio !== 'number' ||
      !Number.isFinite(parsed.foodSurplusRatio)
    ) {
      throw new Error('Rust NPC worker returned invalid food metrics.');
    }
    return {
      foodRatio: parsed.foodRatio,
      foodDeficitCount: parsed.foodDeficitCount,
      foodSurplusRatio: parsed.foodSurplusRatio,
    };
  });
}
