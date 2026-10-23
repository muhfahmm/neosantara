import initializeWasm, { select_daily_notifications } from '../../../../../wasm/menu-inbox-rust/inbox_simulation.js';

interface WorkerRequest {
  id: number;
  input: unknown;
}

interface WorkerResponse {
  id: number;
  result?: string;
  error?: string;
}

const workerScope = self as typeof self & {
  onmessage: ((event: MessageEvent<WorkerRequest>) => void) | null;
  postMessage: (message: WorkerResponse) => void;
};

let wasmInitialization: Promise<unknown> | null = null;

workerScope.onmessage = async ({ data }) => {
  try {
    wasmInitialization ??= initializeWasm().catch((error: unknown) => {
      wasmInitialization = null;
      throw error;
    });
    await wasmInitialization;
    workerScope.postMessage({
      id: data.id,
      result: select_daily_notifications(JSON.stringify(data.input)),
    });
  } catch (error) {
    workerScope.postMessage({
      id: data.id,
      error: error instanceof Error ? error.message : String(error),
    });
  }
};
