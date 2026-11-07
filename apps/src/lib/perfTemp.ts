// PERF-TEMP: Development-only API profiling helper. Easy to delete; zero impact in production.
import { AsyncLocalStorage } from 'node:async_hooks';

export interface PerfScopeMetrics {
  dbQueries: number;
  dbDurationMs: number;
  fsReads: number;
}

const isDev = process.env.NODE_ENV === 'development';
const storage = isDev ? new AsyncLocalStorage<PerfScopeMetrics>() : null;

export function recordDbQuery(durationMs: number): void {
  if (!storage) return;
  const store = storage.getStore();
  if (store) {
    store.dbQueries += 1;
    store.dbDurationMs += durationMs;
  }
}

export function recordFsRead(): void {
  if (!storage) return;
  const store = storage.getStore();
  if (store) {
    store.fsReads += 1;
  }
}

export async function withPerfTemp<T extends Response>(
  label: string,
  fn: () => Promise<T>,
): Promise<T> {
  if (!storage) {
    return fn();
  }
  const metrics: PerfScopeMetrics = { dbQueries: 0, dbDurationMs: 0, fsReads: 0 };
  const t0 = performance.now();
  const response = await storage.run(metrics, fn);
  const totalMs = Math.round((performance.now() - t0) * 100) / 100;
  let bytes = Number(response.headers.get('content-length') || 0);
  if (!bytes) {
    try {
      const cloned = response.clone();
      const buf = await cloned.arrayBuffer();
      bytes = buf.byteLength;
    } catch {
      bytes = 0;
    }
  }
  console.log(
    `[PERF-TEMP] ${label} | status=${response.status} | duration=${totalMs}ms (db=${Math.round(metrics.dbDurationMs * 100) / 100}ms) | bytes=${bytes} | queries=${metrics.dbQueries} | fsReads=${metrics.fsReads}`,
  );
  return response;
}

