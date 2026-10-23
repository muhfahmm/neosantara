/* @ts-self-types="./route_math.d.ts" */

/**
 * @param {number} origin_latitude
 * @param {number} origin_longitude
 * @param {number} target_latitude
 * @param {number} target_longitude
 * @returns {number}
 */
export function great_circle_distance_km(origin_latitude, origin_longitude, target_latitude, target_longitude) {
    const ret = wasm.great_circle_distance_km(origin_latitude, origin_longitude, target_latitude, target_longitude);
    return ret;
}

/**
 * @param {number} latitude
 * @param {number} longitude
 * @param {number} rect_left
 * @param {number} rect_top
 * @param {number} rect_width
 * @param {number} rect_height
 * @param {number} canvas_width
 * @param {number} canvas_height
 * @param {number} scale
 * @param {number} offset_x
 * @param {number} offset_y
 * @param {number} world_css_width
 * @param {number} window_width
 * @returns {Float64Array}
 */
export function project_map_point(latitude, longitude, rect_left, rect_top, rect_width, rect_height, canvas_width, canvas_height, scale, offset_x, offset_y, world_css_width, window_width) {
    const ret = wasm.project_map_point(latitude, longitude, rect_left, rect_top, rect_width, rect_height, canvas_width, canvas_height, scale, offset_x, offset_y, world_css_width, window_width);
    var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
    return v1;
}

/**
 * @param {number} origin_latitude
 * @param {number} origin_longitude
 * @param {number} target_latitude
 * @param {number} target_longitude
 * @param {number} rect_left
 * @param {number} rect_top
 * @param {number} rect_width
 * @param {number} rect_height
 * @param {number} canvas_width
 * @param {number} canvas_height
 * @param {number} scale
 * @param {number} offset_x
 * @param {number} offset_y
 * @param {number} world_css_width
 * @param {number} window_width
 * @param {number} curvature
 * @returns {Float64Array}
 */
export function project_route_geometry(origin_latitude, origin_longitude, target_latitude, target_longitude, rect_left, rect_top, rect_width, rect_height, canvas_width, canvas_height, scale, offset_x, offset_y, world_css_width, window_width, curvature) {
    const ret = wasm.project_route_geometry(origin_latitude, origin_longitude, target_latitude, target_longitude, rect_left, rect_top, rect_width, rect_height, canvas_width, canvas_height, scale, offset_x, offset_y, world_css_width, window_width, curvature);
    var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
    return v1;
}

/**
 * @param {number} start_x
 * @param {number} start_y
 * @param {number} control_x
 * @param {number} control_y
 * @param {number} end_x
 * @param {number} end_y
 * @param {number} progress
 * @returns {Float64Array}
 */
export function quadratic_motion(start_x, start_y, control_x, control_y, end_x, end_y, progress) {
    const ret = wasm.quadratic_motion(start_x, start_y, control_x, control_y, end_x, end_y, progress);
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
        "./route_math_bg.js": import0,
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

let wasmModule, wasmInstance, wasm;
function __wbg_finalize_init(instance, module) {
    wasmInstance = instance;
    wasm = instance.exports;
    wasmModule = module;
    cachedFloat64ArrayMemory0 = null;
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
        module_or_path = new URL('route_math_bg.wasm', import.meta.url);
    }
    const imports = __wbg_get_imports();

    if (typeof module_or_path === 'string' || (typeof Request === 'function' && module_or_path instanceof Request) || (typeof URL === 'function' && module_or_path instanceof URL)) {
        module_or_path = fetch(module_or_path);
    }

    const { instance, module } = await __wbg_load(await module_or_path, imports);

    return __wbg_finalize_init(instance, module);
}

export { initSync, __wbg_init as default };
