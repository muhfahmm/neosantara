import initializeWasm, {
  advance_npc_daily_metrics,
  simulate_npc_materials,
} from '../../../wasm/npc-simulation/npc_simulation.js';

interface WorkerRequest {
  id: number;
  action: 'materials' | 'daily_metrics';
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
    const result = data.action === 'daily_metrics'
      ? advance_npc_daily_metrics(JSON.stringify(data.input))
      : data.action === 'materials'
        ? simulate_npc_materials(JSON.stringify(data.input))
        : undefined;
    if (!result) {
      throw new Error(`Unknown Rust NPC worker action: ${String(data.action)}`);
    }
    workerScope.postMessage({
      id: data.id,
      result,
    });
  } catch (error) {
    workerScope.postMessage({
      id: data.id,
      error: error instanceof Error ? error.message : String(error),
    });
  }
};
