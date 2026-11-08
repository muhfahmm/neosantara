// MAPLOAD-DBG-TEMP: Diagnostic tracer for map loading stages on mobile
export interface StageRecord {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'success' | 'error';
  startMs: number;
  durationMs?: number;
  info?: string;
  error?: string;
}

class MapLoadTracker {
  private stages = new Map<string, StageRecord>();
  private listeners = new Set<(stages: StageRecord[]) => void>();

  constructor() {
    if (typeof window !== 'undefined') {
      (window as any).__mapLoadTracker = this;
    }
  }

  subscribe(listener: (stages: StageRecord[]) => void) {
    this.listeners.add(listener);
    listener(this.getAll());
    return () => this.listeners.delete(listener);
  }

  getAll(): StageRecord[] {
    return Array.from(this.stages.values());
  }

  private notify() {
    const list = this.getAll();
    this.listeners.forEach((l) => l(list));
  }

  async runStage<T>(name: string, fn: (signal: AbortSignal) => Promise<T>, timeoutMs = 20000): Promise<T> {
    const id = `${name}_${Date.now()}`;
    const controller = new AbortController();
    const startMs = performance.now();

    const record: StageRecord = {
      id,
      name,
      status: 'running',
      startMs,
    };
    this.stages.set(id, record);
    this.notify();

    const timer = setTimeout(() => {
      controller.abort(new Error(`Timeout ${timeoutMs}ms pada tahap [${name}]`));
    }, timeoutMs);

    try {
      const result = await fn(controller.signal);
      record.status = 'success';
      record.durationMs = Math.round(performance.now() - startMs);
      clearTimeout(timer);
      this.notify();
      return result;
    } catch (err: any) {
      clearTimeout(timer);
      record.status = 'error';
      record.durationMs = Math.round(performance.now() - startMs);
      record.error = err instanceof Error ? err.message : String(err);
      this.notify();
      throw err;
    }
  }

  setStageInfo(name: string, info: string) {
    const match = Array.from(this.stages.values()).reverse().find((s) => s.name === name);
    if (match) {
      match.info = info;
      this.notify();
    }
  }
}

export const mapTracker = new MapLoadTracker();

