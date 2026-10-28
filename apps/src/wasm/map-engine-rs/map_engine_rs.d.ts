/* tslint:disable */
/* eslint-disable */

export class MapEngine {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    get_country_at(mouse_x: number, mouse_y: number): any;
    get_menu_options(): any;
    handle_mouse_down(x: number, y: number, pointer_id: number): void;
    handle_mouse_move(x: number, y: number, buttons: number, pointer_id: number): void;
    handle_mouse_up(): void;
    handle_wheel(delta_y: number, mouse_x: number, mouse_y: number): void;
    static new(ctx: CanvasRenderingContext2D, width: number, height: number): MapEngine;
    render(): void;
    set_capitals(capitals: any[]): void;
    set_countries(countries: any[]): void;
    set_data(geojson_str: string): void;
    /**
     * Warna override per feature (indeks sama dengan urutan GeoJSON). null/undefined = tanpa override.
     */
    set_feature_colors(colors: any[], beat_selected: boolean): void;
    set_horizontal_wrap(enabled: boolean): void;
    /**
     * Parse GeoJSON sekali, proyeksikan semua titik & hitung bbox (cache).
     */
    set_provinces_data(geojson_str: string): void;
    set_selected_country(iso: string | null | undefined, should_center: boolean): void;
    set_show_province_borders(show: boolean): void;
    /**
     * Batasi kerja render ke 60 FPS maksimum, terlepas dari refresh rate layar.
     */
    tick(now_ms: number): void;
}

export function get_country_at_on_map(mouse_x: number, mouse_y: number): any;

export function set_capitals_on_map(capitals: any[]): void;

export function set_feature_colors_on_map(colors: any[], beat_selected: boolean): void;

export function set_map_horizontal_wrap(enabled: boolean): void;

export function set_provinces_on_map(provinces_geojson: string): void;

export function set_selected_country_on_map(iso: string, should_center: boolean): void;

export function set_show_province_borders_on_map(show: boolean): void;

export function start_map_engine(canvas_id: string, world_text: string, countries_json: any, capitals_json: any): void;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly __wbg_mapengine_free: (a: number, b: number) => void;
    readonly get_country_at_on_map: (a: number, b: number) => any;
    readonly mapengine_get_country_at: (a: number, b: number, c: number) => any;
    readonly mapengine_get_menu_options: (a: number) => any;
    readonly mapengine_handle_mouse_down: (a: number, b: number, c: number, d: number) => void;
    readonly mapengine_handle_mouse_move: (a: number, b: number, c: number, d: number, e: number) => void;
    readonly mapengine_handle_mouse_up: (a: number) => void;
    readonly mapengine_handle_wheel: (a: number, b: number, c: number, d: number) => void;
    readonly mapengine_new: (a: any, b: number, c: number) => number;
    readonly mapengine_render: (a: number) => void;
    readonly mapengine_set_capitals: (a: number, b: number, c: number) => void;
    readonly mapengine_set_countries: (a: number, b: number, c: number) => void;
    readonly mapengine_set_data: (a: number, b: number, c: number) => void;
    readonly mapengine_set_feature_colors: (a: number, b: number, c: number, d: number) => void;
    readonly mapengine_set_horizontal_wrap: (a: number, b: number) => void;
    readonly mapengine_set_provinces_data: (a: number, b: number, c: number) => void;
    readonly mapengine_set_selected_country: (a: number, b: number, c: number, d: number) => void;
    readonly mapengine_set_show_province_borders: (a: number, b: number) => void;
    readonly mapengine_tick: (a: number, b: number) => void;
    readonly set_capitals_on_map: (a: number, b: number) => void;
    readonly set_feature_colors_on_map: (a: number, b: number, c: number) => void;
    readonly set_map_horizontal_wrap: (a: number) => void;
    readonly set_provinces_on_map: (a: number, b: number) => void;
    readonly set_selected_country_on_map: (a: number, b: number, c: number) => void;
    readonly set_show_province_borders_on_map: (a: number) => void;
    readonly start_map_engine: (a: number, b: number, c: number, d: number, e: any, f: any) => [number, number];
    readonly wasm_bindgen_cf9ba172f8892477___convert__closures_____invoke___f64______true_: (a: number, b: number, c: number) => void;
    readonly wasm_bindgen_cf9ba172f8892477___convert__closures_____invoke___web_sys_e80ecc0df794c569___features__gen_MouseEvent__MouseEvent______true_: (a: number, b: number, c: any) => void;
    readonly wasm_bindgen_cf9ba172f8892477___convert__closures_____invoke___web_sys_e80ecc0df794c569___features__gen_MouseEvent__MouseEvent______true__27: (a: number, b: number, c: any) => void;
    readonly wasm_bindgen_cf9ba172f8892477___convert__closures_____invoke___web_sys_e80ecc0df794c569___features__gen_MouseEvent__MouseEvent______true__28: (a: number, b: number, c: any) => void;
    readonly __wbindgen_malloc: (a: number, b: number) => number;
    readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
    readonly __wbindgen_exn_store: (a: number) => void;
    readonly __externref_table_alloc: () => number;
    readonly __wbindgen_externrefs: WebAssembly.Table;
    readonly __wbindgen_free: (a: number, b: number, c: number) => void;
    readonly __wbindgen_destroy_closure: (a: number, b: number) => void;
    readonly __externref_table_dealloc: (a: number) => void;
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
