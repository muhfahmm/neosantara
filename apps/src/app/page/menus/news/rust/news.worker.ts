import initializeWasm, { generate_world_news_events } from '../../../../../wasm/menu-news-rust/news_simulation.js';

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
      result: generate_world_news_events(JSON.stringify(data.input)),
    });
  } catch (error) {
    workerScope.postMessage({
      id: data.id,
      error: error instanceof Error ? error.message : String(error),
    });
  }
};
