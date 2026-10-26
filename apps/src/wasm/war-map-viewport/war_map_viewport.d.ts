/* tslint:disable */
/* eslint-disable */

/**
 * Menghitung respon AI / musuh saat unit penyerang terdeteksi melintasi garis perbatasan.
 * Mengembalikan Float64Array berisi perintah respon dan formasi unit perlawanan:
 * [
 *   should_scramble (1.0 | 0.0),
 *   alert_level (1.0 = Kuning, 2.0 = Oranye, 3.0 = Merah/Kritis),
 *   spawn_infantry_count,
 *   spawn_tank_count,
 *   spawn_apc_count,
 *   spawn_origin_x,
 *   spawn_origin_y,
 *   intercept_target_x,
 *   intercept_target_y
 * ]
 */
export function calculate_ai_border_response(invader_x: number, invader_y: number, invader_group: string, map_type: string, player_side: string, threat_quantity: number): Float64Array;

export function calculate_attack_radius(strength: number, group: string, kind: string): number;

/**
 * Mengecek apakah sebuah titik (x, y) telah melewati batas tengah ke wilayah musuh.
 * Untuk peta darat: batas tengah X berkisar ~3150-3240. Jika player menyerang ke kanan (X > boundary_x),
 * maka unit player masuk ke wilayah pertahanan lawan.
 * map_type: "land" | "sea"
 * player_side: "attacker" (player di barat/kiri bergerak ke timur/kanan) atau "defender"
 */
export function check_boundary_cross(unit_x: number, unit_y: number, map_type: string, player_side: string): boolean;

export function is_target_in_attack_range(origin_x: number, origin_y: number, target_x: number, target_y: number, radius: number): boolean;

export function pan_view(x: number, y: number, width: number, height: number, box_width: number, box_height: number, delta_x: number, delta_y: number, min_width: number, max_width: number, world_width: number, world_height: number): Float64Array;

export function prepare_unit_attack(strength: number, group: string, kind: string): Float64Array;

export function prepare_unit_movement(target_x: number, target_y: number, world_width: number, world_height: number, group: string): Float64Array;

/**
 * Satu langkah easing menuju view target. Lebar diinterpolasi di ruang log (zoom terasa seragam),
 * pusat view diinterpolasi linear. Hasil: [x, y, w, h, selesai(1.0|0.0)].
 */
export function smooth_view(x: number, y: number, width: number, height: number, target_x: number, target_y: number, target_width: number, target_height: number, dt_ms: number, time_constant_ms: number): Float64Array;

export function step_unit_movement(start_x: number, start_y: number, target_x: number, target_y: number, elapsed_ms: number, delta_ms: number, speed: number, group: string, kind: string): Float64Array;

export function zoom_view(x: number, y: number, width: number, height: number, box_width: number, box_height: number, pointer_x: number, pointer_y: number, factor: number, min_width: number, max_width: number, world_width: number, world_height: number): Float64Array;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly calculate_ai_border_response: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number) => [number, number];
    readonly calculate_attack_radius: (a: number, b: number, c: number, d: number, e: number) => number;
    readonly check_boundary_cross: (a: number, b: number, c: number, d: number, e: number, f: number) => number;
    readonly is_target_in_attack_range: (a: number, b: number, c: number, d: number, e: number) => number;
    readonly pan_view: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: number, l: number) => [number, number];
    readonly prepare_unit_attack: (a: number, b: number, c: number, d: number, e: number) => [number, number];
    readonly prepare_unit_movement: (a: number, b: number, c: number, d: number, e: number, f: number) => [number, number];
    readonly smooth_view: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number) => [number, number];
    readonly step_unit_movement: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: number) => [number, number];
    readonly zoom_view: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: number, l: number, m: number) => [number, number];
    readonly __wbindgen_externrefs: WebAssembly.Table;
    readonly __wbindgen_malloc: (a: number, b: number) => number;
    readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
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
