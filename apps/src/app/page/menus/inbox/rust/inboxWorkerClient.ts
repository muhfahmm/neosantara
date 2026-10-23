interface WorkerResponse {
  id: number;
  result?: string;
  error?: string;
}

interface PendingRequest {
  resolve: (result: unknown[]) => void;
  reject: (error: Error) => void;
}

let worker: Worker | null = null;
let nextRequestId = 0;
const pendingRequests = new Map<number, PendingRequest>();

function getWorker(): Worker {
  if (worker) return worker;

  worker = new Worker(new URL('./inbox.worker.ts', import.meta.url), { type: 'module' });
  worker.addEventListener('message', (event: MessageEvent<WorkerResponse>) => {
    const request = pendingRequests.get(event.data.id);
    if (!request) return;
    pendingRequests.delete(event.data.id);
    if (event.data.error) {
      request.reject(new Error(event.data.error));
    } else if (!event.data.result) {
      request.reject(new Error('Rust inbox worker returned an empty result.'));
    } else {
      try {
        const result: unknown = JSON.parse(event.data.result);
        if (!Array.isArray(result)) throw new Error('Rust inbox worker returned an invalid result.');
        request.resolve(result);
      } catch (error) {
        request.reject(error instanceof Error ? error : new Error(String(error)));
      }
    }
  });
  worker.addEventListener('error', event => {
    rejectPendingRequests(new Error(`Rust inbox worker failed: ${event.message}`));
  });
  worker.addEventListener('messageerror', () => {
    rejectPendingRequests(new Error('Rust inbox worker returned an unreadable message.'));
  });
  return worker;
}

function rejectPendingRequests(error: Error): void {
  for (const request of pendingRequests.values()) request.reject(error);
  pendingRequests.clear();
  worker?.terminate();
  worker = null;
}

export function selectDailyNotificationsInRust<T>(
  candidates: T[],
  seed: number,
  maxCount = 2,
): Promise<T[]> {
  const requestWorker = getWorker();
  const id = ++nextRequestId;
  return new Promise((resolve, reject) => {
    pendingRequests.set(id, {
      resolve: result => resolve(result as T[]),
      reject,
    });
    try {
      requestWorker.postMessage({
        id,
        input: {
          candidates,
          seed: Math.max(0, Math.floor(seed)),
          max_count: Math.max(0, Math.floor(maxCount)),
        },
      });
    } catch (error) {
      pendingRequests.delete(id);
      reject(error instanceof Error ? error : new Error(String(error)));
    }
  });
}
