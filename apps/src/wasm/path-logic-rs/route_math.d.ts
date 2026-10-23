/* tslint:disable */
/* eslint-disable */

export function great_circle_distance_km(origin_latitude: number, origin_longitude: number, target_latitude: number, target_longitude: number): number;

export function project_map_point(latitude: number, longitude: number, rect_left: number, rect_top: number, rect_width: number, rect_height: number, canvas_width: number, canvas_height: number, scale: number, offset_x: number, offset_y: number, world_css_width: number, window_width: number): Float64Array;

export function project_route_geometry(origin_latitude: number, origin_longitude: number, target_latitude: number, target_longitude: number, rect_left: number, rect_top: number, rect_width: number, rect_height: number, canvas_width: number, canvas_height: number, scale: number, offset_x: number, offset_y: number, world_css_width: number, window_width: number, curvature: number): Float64Array;

export function quadratic_motion(start_x: number, start_y: number, control_x: number, control_y: number, end_x: number, end_y: number, progress: number): Float64Array;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly great_circle_distance_km: (a: number, b: number, c: number, d: number) => number;
    readonly project_map_point: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: number, l: number, m: number) => [number, number];
    readonly project_route_geometry: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: number, l: number, m: number, n: number, o: number, p: number) => [number, number];
    readonly quadratic_motion: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => [number, number];
    readonly __wbindgen_externrefs: WebAssembly.Table;
    readonly __wbindgen_free: (a: number, b: number, c: number) => void;
    readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
