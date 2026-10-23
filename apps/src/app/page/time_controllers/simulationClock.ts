type SimulationClockWasm = typeof import('../../../wasm/simulation-clock/simulation_clock.js');

let wasmClock: SimulationClockWasm | null = null;
let initialization: Promise<void> | null = null;

export function initializeSimulationClock(): Promise<void> {
    if (!initialization) {
        initialization = import('../../../wasm/simulation-clock/simulation_clock.js')
            .then(async (module) => {
                await module.default();
                wasmClock = module;
            })
            .catch((error: unknown) => {
                initialization = null;
                throw error;
            });
    }

    return initialization;
}

export function shiftSimulationDate(year: number, month: number, day: number, offset: number): string {
    if (!wasmClock) {
        throw new Error('Rust simulation clock has not been initialized');
    }
    return wasmClock.shift_date(year, month, day, offset);
}

export function formatSimulationDate(year: number, month: number, day: number): string {
    if (!wasmClock) {
        throw new Error('Rust simulation clock has not been initialized');
    }
    return wasmClock.format_date(year, month, day);
}
