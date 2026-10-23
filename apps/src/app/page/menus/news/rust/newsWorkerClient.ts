import type { CountryData } from '../../../map_system/map-data';
import type { WorldNewsItemData } from '../logic/worldNewsLogic';

interface WorkerResponse {
  id: number;
  result?: string;
  error?: string;
}

interface PendingRequest {
  resolve: (result: string) => void;
  reject: (error: Error) => void;
}

interface WorldNewsResult {
  news: WorldNewsItemData[];
  nextCursor: number;
}

let worker: Worker | null = null;
let nextRequestId = 0;
const pendingRequests = new Map<number, PendingRequest>();

function isWorldNewsItem(value: unknown): value is WorldNewsItemData {
  if (typeof value !== 'object' || value === null) return false;
  const item = value as Record<string, unknown>;
  return typeof item.id === 'string' &&
    typeof item.type === 'string' &&
    typeof item.category === 'string' &&
    typeof item.headline === 'string' &&
    typeof item.content === 'string' &&
    typeof item.timestamp === 'string' &&
    typeof item.dateStr === 'string' &&
    typeof item.countryName === 'string';
}

function getWorker(): Worker {
  if (worker) return worker;

  worker = new Worker(new URL('./news.worker.ts', import.meta.url), { type: 'module' });
  worker.addEventListener('message', (event: MessageEvent<WorkerResponse>) => {
    const request = pendingRequests.get(event.data.id);
    if (!request) return;
    pendingRequests.delete(event.data.id);
    if (event.data.error) {
      request.reject(new Error(event.data.error));
    } else if (!event.data.result) {
      request.reject(new Error('Rust news worker returned an empty result.'));
    } else {
      request.resolve(event.data.result);
    }
  });
  worker.addEventListener('error', event => {
    rejectPendingRequests(new Error(`Rust news worker failed: ${event.message}`));
  });
  worker.addEventListener('messageerror', () => {
    rejectPendingRequests(new Error('Rust news worker returned an unreadable message.'));
  });
  return worker;
}

function rejectPendingRequests(error: Error): void {
  for (const request of pendingRequests.values()) request.reject(error);
  pendingRequests.clear();
  worker?.terminate();
  worker = null;
}

export function generateWorldNewsEventsInRust(
  countries: CountryData[],
  userCountryName: string,
  currentCursor: number,
  dateStr: string,
  eventCount = 3,
): Promise<WorldNewsResult> {
  const requestWorker = getWorker();
  const id = ++nextRequestId;
  return new Promise((resolve, reject) => {
    pendingRequests.set(id, {
      resolve: result => {
        try {
          const parsed: unknown = JSON.parse(result);
          if (
            typeof parsed !== 'object' ||
            parsed === null ||
            !('news' in parsed) ||
            !Array.isArray(parsed.news) ||
            !parsed.news.every(isWorldNewsItem) ||
            !('nextCursor' in parsed) ||
            typeof parsed.nextCursor !== 'number' ||
            !Number.isInteger(parsed.nextCursor)
          ) {
            throw new Error('Rust news worker returned an invalid result.');
          }
          resolve(parsed as WorldNewsResult);
        } catch (error) {
          reject(error instanceof Error ? error : new Error(String(error)));
        }
      },
      reject,
    });
    try {
      requestWorker.postMessage({
        id,
        input: {
          countries: countries.map(({ id: countryId, country }) => ({ id: countryId, country })),
          userCountryName,
          currentCursor,
          dateStr,
          eventCount,
        },
      });
    } catch (error) {
      pendingRequests.delete(id);
      reject(error instanceof Error ? error : new Error(String(error)));
    }
  });
}
