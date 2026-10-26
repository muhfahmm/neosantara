/* @ts-self-types="./war_map_viewport.d.ts" */

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
 * @param {number} invader_x
 * @param {number} invader_y
 * @param {string} invader_group
 * @param {string} map_type
 * @param {string} player_side
 * @param {number} threat_quantity
 * @returns {Float64Array}
 */
export function calculate_ai_border_response(invader_x, invader_y, invader_group, map_type, player_side, threat_quantity) {
    const ptr0 = passStringToWasm0(invader_group, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(map_type, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passStringToWasm0(player_side, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len2 = WASM_VECTOR_LEN;
    const ret = wasm.calculate_ai_border_response(invader_x, invader_y, ptr0, len0, ptr1, len1, ptr2, len2, threat_quantity);
    var v4 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
    return v4;
}

/**
 * @param {number} strength
 * @param {string} group
 * @param {string} kind
 * @returns {number}
 */
export function calculate_attack_radius(strength, group, kind) {
    const ptr0 = passStringToWasm0(group, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(kind, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.calculate_attack_radius(strength, ptr0, len0, ptr1, len1);
    return ret;
}

/**
 * Mengecek apakah sebuah titik (x, y) telah melewati batas tengah ke wilayah musuh.
 * Untuk peta darat: batas tengah X berkisar ~3150-3240. Jika player menyerang ke kanan (X > boundary_x),
 * maka unit player masuk ke wilayah pertahanan lawan.
 * map_type: "land" | "sea"
 * player_side: "attacker" (player di barat/kiri bergerak ke timur/kanan) atau "defender"
 * @param {number} unit_x
 * @param {number} unit_y
 * @param {string} map_type
 * @param {string} player_side
 * @returns {boolean}
 */
export function check_boundary_cross(unit_x, unit_y, map_type, player_side) {
    const ptr0 = passStringToWasm0(map_type, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(player_side, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.check_boundary_cross(unit_x, unit_y, ptr0, len0, ptr1, len1);
    return ret !== 0;
}

/**
 * @param {number} origin_x
 * @param {number} origin_y
 * @param {number} target_x
 * @param {number} target_y
 * @param {number} radius
 * @returns {boolean}
 */
export function is_target_in_attack_range(origin_x, origin_y, target_x, target_y, radius) {
    const ret = wasm.is_target_in_attack_range(origin_x, origin_y, target_x, target_y, radius);
    return ret !== 0;
}

/**
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 * @param {number} box_width
 * @param {number} box_height
 * @param {number} delta_x
 * @param {number} delta_y
 * @param {number} min_width
 * @param {number} max_width
 * @param {number} world_width
 * @param {number} world_height
 * @returns {Float64Array}
 */
export function pan_view(x, y, width, height, box_width, box_height, delta_x, delta_y, min_width, max_width, world_width, world_height) {
    const ret = wasm.pan_view(x, y, width, height, box_width, box_height, delta_x, delta_y, min_width, max_width, world_width, world_height);
    var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
    return v1;
}

/**
 * @param {number} strength
 * @param {string} group
 * @param {string} kind
 * @returns {Float64Array}
 */
export function prepare_unit_attack(strength, group, kind) {
    const ptr0 = passStringToWasm0(group, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(kind, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.prepare_unit_attack(strength, ptr0, len0, ptr1, len1);
    var v3 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
    return v3;
}

/**
 * @param {number} target_x
 * @param {number} target_y
 * @param {number} world_width
 * @param {number} world_height
 * @param {string} group
 * @returns {Float64Array}
 */
export function prepare_unit_movement(target_x, target_y, world_width, world_height, group) {
    const ptr0 = passStringToWasm0(group, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.prepare_unit_movement(target_x, target_y, world_width, world_height, ptr0, len0);
    var v2 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
    return v2;
}

/**
 * Satu langkah easing menuju view target. Lebar diinterpolasi di ruang log (zoom terasa seragam),
 * pusat view diinterpolasi linear. Hasil: [x, y, w, h, selesai(1.0|0.0)].
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 * @param {number} target_x
 * @param {number} target_y
 * @param {number} target_width
 * @param {number} target_height
 * @param {number} dt_ms
 * @param {number} time_constant_ms
 * @returns {Float64Array}
 */
export function smooth_view(x, y, width, height, target_x, target_y, target_width, target_height, dt_ms, time_constant_ms) {
    const ret = wasm.smooth_view(x, y, width, height, target_x, target_y, target_width, target_height, dt_ms, time_constant_ms);
    var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
    return v1;
}

/**
 * @param {number} start_x
 * @param {number} start_y
 * @param {number} target_x
 * @param {number} target_y
 * @param {number} elapsed_ms
 * @param {number} delta_ms
 * @param {number} speed
 * @param {string} group
 * @param {string} kind
 * @returns {Float64Array}
 */
export function step_unit_movement(start_x, start_y, target_x, target_y, elapsed_ms, delta_ms, speed, group, kind) {
    const ptr0 = passStringToWasm0(group, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(kind, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.step_unit_movement(start_x, start_y, target_x, target_y, elapsed_ms, delta_ms, speed, ptr0, len0, ptr1, len1);
    var v3 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
    return v3;
}

/**
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 * @param {number} box_width
 * @param {number} box_height
 * @param {number} pointer_x
 * @param {number} pointer_y
 * @param {number} factor
 * @param {number} min_width
 * @param {number} max_width
 * @param {number} world_width
 * @param {number} world_height
 * @returns {Float64Array}
 */
export function zoom_view(x, y, width, height, box_width, box_height, pointer_x, pointer_y, factor, min_width, max_width, world_width, world_height) {
    const ret = wasm.zoom_view(x, y, width, height, box_width, box_height, pointer_x, pointer_y, factor, min_width, max_width, world_width, world_height);
    var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
    return v1;
}
function __wbg_get_imports() {
    const import0 = {
        __proto__: null,
        __wbindgen_init_externref_table: function() {
            const table = wasm.__wbindgen_externrefs;
            const offset = table.grow(4);
            table.set(0, undefined);
            table.set(offset + 0, undefined);
            table.set(offset + 1, null);
            table.set(offset + 2, true);
            table.set(offset + 3, false);
        },
    };
    return {
        __proto__: null,
        "./war_map_viewport_bg.js": import0,
    };
}

function getArrayF64FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getFloat64ArrayMemory0().subarray(ptr / 8, ptr / 8 + len);
}

let cachedFloat64ArrayMemory0 = null;
function getFloat64ArrayMemory0() {
    if (cachedFloat64ArrayMemory0 === null || cachedFloat64ArrayMemory0.byteLength === 0) {
        cachedFloat64ArrayMemory0 = new Float64Array(wasm.memory.buffer);
    }
    return cachedFloat64ArrayMemory0;
}

let cachedUint8ArrayMemory0 = null;
function getUint8ArrayMemory0() {
    if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
        cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8ArrayMemory0;
}

function passStringToWasm0(arg, malloc, realloc) {
    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length, 1) >>> 0;
        getUint8ArrayMemory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len, 1) >>> 0;

    const mem = getUint8ArrayMemory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }
    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
        const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);
        const ret = cachedTextEncoder.encodeInto(arg, view);

        offset += ret.written;
        ptr = realloc(ptr, len, offset, 1) >>> 0;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

const cachedTextEncoder = new TextEncoder();

if (!('encodeInto' in cachedTextEncoder)) {
    cachedTextEncoder.encodeInto = function (arg, view) {
        const buf = cachedTextEncoder.encode(arg);
        view.set(buf);
        return {
            read: arg.length,
            written: buf.length
        };
    };
}

let WASM_VECTOR_LEN = 0;

let wasmModule, wasmInstance, wasm;
function __wbg_finalize_init(instance, module) {
    wasmInstance = instance;
    wasm = instance.exports;
    wasmModule = module;
    cachedFloat64ArrayMemory0 = null;
    cachedUint8ArrayMemory0 = null;
    wasm.__wbindgen_start();
    return wasm;
}

async function __wbg_load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (!module.ok) {
            throw new Error(`failed to fetch Wasm: ${module.status} ${module.statusText} fetching '${module.url}'`);
        }

        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);
            } catch (e) {
                const validResponse = expectedResponseType(module.type);

                if (validResponse && module.headers.get('Content-Type') !== 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else { throw e; }
            }
        }

        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);
    } else {
        const instance = await WebAssembly.instantiate(module, imports);

        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };
        } else {
            return instance;
        }
    }

    function expectedResponseType(type) {
        switch (type) {
            case 'basic': case 'cors': case 'default': return true;
        }
        return false;
    }
}

function initSync(module) {
    if (wasm !== undefined) return wasm;


    if (module !== undefined) {
        if (Object.getPrototypeOf(module) === Object.prototype) {
            ({module} = module)
        } else {
            console.warn('using deprecated parameters for `initSync()`; pass a single object instead')
        }
    }

    const imports = __wbg_get_imports();
    if (!(module instanceof WebAssembly.Module)) {
        module = new WebAssembly.Module(module);
    }
    const instance = new WebAssembly.Instance(module, imports);
    return __wbg_finalize_init(instance, module);
}

async function __wbg_init(module_or_path) {
    if (wasm !== undefined) return wasm;


    if (module_or_path !== undefined) {
        if (Object.getPrototypeOf(module_or_path) === Object.prototype) {
            ({module_or_path} = module_or_path)
        } else {
            console.warn('using deprecated parameters for the initialization function; pass a single object instead')
        }
    }

    if (module_or_path === undefined) {
        module_or_path = new URL('war_map_viewport_bg.wasm', import.meta.url);
    }
    const imports = __wbg_get_imports();

    if (typeof module_or_path === 'string' || (typeof Request === 'function' && module_or_path instanceof Request) || (typeof URL === 'function' && module_or_path instanceof URL)) {
        module_or_path = fetch(module_or_path);
    }

    const { instance, module } = await __wbg_load(await module_or_path, imports);

    return __wbg_finalize_init(instance, module);
}

export { initSync, __wbg_init as default };
