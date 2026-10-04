export class MapEngine {
    static __wrap(ptr) {
        const obj = Object.create(MapEngine.prototype);
        obj.__wbg_ptr = ptr;
        MapEngineFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        MapEngineFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_mapengine_free(ptr, 0);
    }
    /**
     * @param {number} mouse_x
     * @param {number} mouse_y
     * @returns {any}
     */
    get_country_at(mouse_x, mouse_y) {
        const ret = wasm.mapengine_get_country_at(this.__wbg_ptr, mouse_x, mouse_y);
        return ret;
    }
    /**
     * @returns {any}
     */
    get_menu_options() {
        const ret = wasm.mapengine_get_menu_options(this.__wbg_ptr);
        return ret;
    }
    /**
     * @param {number} x
     * @param {number} y
     */
    handle_mouse_down(x, y) {
        wasm.mapengine_handle_mouse_down(this.__wbg_ptr, x, y);
    }
    /**
     * @param {number} x
     * @param {number} y
     */
    handle_mouse_move(x, y) {
        wasm.mapengine_handle_mouse_move(this.__wbg_ptr, x, y);
    }
    handle_mouse_up() {
        wasm.mapengine_handle_mouse_up(this.__wbg_ptr);
    }
    /**
     * @param {number} delta_y
     * @param {number} mouse_x
     * @param {number} mouse_y
     */
    handle_wheel(delta_y, mouse_x, mouse_y) {
        wasm.mapengine_handle_wheel(this.__wbg_ptr, delta_y, mouse_x, mouse_y);
    }
    /**
     * @param {CanvasRenderingContext2D} ctx
     * @param {number} width
     * @param {number} height
     * @returns {MapEngine}
     */
    static new(ctx, width, height) {
        const ret = wasm.mapengine_new(ctx, width, height);
        return MapEngine.__wrap(ret);
    }
    render() {
        wasm.mapengine_render(this.__wbg_ptr);
    }
    /**
     * @param {any[]} capitals
     */
    set_capitals(capitals) {
        const ptr0 = passArrayJsValueToWasm0(capitals, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.mapengine_set_capitals(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @param {any[]} countries
     */
    set_countries(countries) {
        const ptr0 = passArrayJsValueToWasm0(countries, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.mapengine_set_countries(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @param {string} geojson_str
     */
    set_data(geojson_str) {
        const ptr0 = passStringToWasm0(geojson_str, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.mapengine_set_data(this.__wbg_ptr, ptr0, len0);
    }
}
if (Symbol.dispose) MapEngine.prototype[Symbol.dispose] = MapEngine.prototype.free;

/**
 * @param {string} canvas_id
 * @returns {Promise<void>}
 */
export function start_map_engine(canvas_id) {
    const ptr0 = passStringToWasm0(canvas_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.start_map_engine(ptr0, len0);
    return ret;
}
export function __wbg_Error_bce6d499ff0a4aff(arg0, arg1) {
    const ret = Error(getStringFromWasm0(arg0, arg1));
    return ret;
}
export function __wbg___wbindgen_boolean_get_2304fb8c853028c8(arg0) {
    const v = arg0;
    const ret = typeof(v) === 'boolean' ? v : undefined;
    return isLikeNone(ret) ? 0xFFFFFF : ret ? 1 : 0;
}
export function __wbg___wbindgen_debug_string_edece8177ad01481(arg0, arg1) {
    const ret = debugString(arg1);
    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
}
export function __wbg___wbindgen_in_07056af4f902c445(arg0, arg1) {
    const ret = arg0 in arg1;
    return ret;
}
export function __wbg___wbindgen_is_function_5cd60d5cf78b4eef(arg0) {
    const ret = typeof(arg0) === 'function';
    return ret;
}
export function __wbg___wbindgen_is_object_b4593df85baada48(arg0) {
    const val = arg0;
    const ret = typeof(val) === 'object' && val !== null;
    return ret;
}
export function __wbg___wbindgen_is_undefined_35bb9f4c7fd651d5(arg0) {
    const ret = arg0 === undefined;
    return ret;
}
export function __wbg___wbindgen_jsval_loose_eq_0ad77b7717db155c(arg0, arg1) {
    const ret = arg0 == arg1;
    return ret;
}
export function __wbg___wbindgen_number_get_f73a1244370fcc2c(arg0, arg1) {
    const obj = arg1;
    const ret = typeof(obj) === 'number' ? obj : undefined;
    getDataViewMemory0().setFloat64(arg0 + 8 * 1, isLikeNone(ret) ? 0 : ret, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, !isLikeNone(ret), true);
}
export function __wbg___wbindgen_string_get_d109740c0d18f4d7(arg0, arg1) {
    const obj = arg1;
    const ret = typeof(obj) === 'string' ? obj : undefined;
    var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len1 = WASM_VECTOR_LEN;
    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
}
export function __wbg___wbindgen_throw_9c31b086c2b26051(arg0, arg1) {
    throw new Error(getStringFromWasm0(arg0, arg1));
}
export function __wbg__wbg_cb_unref_3fa391f3fcdb55f8(arg0) {
    arg0._wbg_cb_unref();
}
export function __wbg_addEventListener_aedacff123afaebd() { return handleError(function (arg0, arg1, arg2, arg3) {
    arg0.addEventListener(getStringFromWasm0(arg1, arg2), arg3);
}, arguments); }
export function __wbg_beginPath_0362b3134ed67152(arg0) {
    arg0.beginPath();
}
export function __wbg_call_dfde26266607c996() { return handleError(function (arg0, arg1, arg2) {
    const ret = arg0.call(arg1, arg2);
    return ret;
}, arguments); }
export function __wbg_closePath_ab8775c8f9ce941f(arg0) {
    arg0.closePath();
}
export function __wbg_deltaY_9bad500402885525(arg0) {
    const ret = arg0.deltaY;
    return ret;
}
export function __wbg_document_3540635616a18455(arg0) {
    const ret = arg0.document;
    return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
}
export function __wbg_error_a6fa202b58aa1cd3(arg0, arg1) {
    let deferred0_0;
    let deferred0_1;
    try {
        deferred0_0 = arg0;
        deferred0_1 = arg1;
        console.error(getStringFromWasm0(arg0, arg1));
    } finally {
        wasm.__wbindgen_free(deferred0_0, deferred0_1, 1);
    }
}
export function __wbg_fetch_872c7c4b806963cc(arg0, arg1, arg2) {
    const ret = arg0.fetch(getStringFromWasm0(arg1, arg2));
    return ret;
}
export function __wbg_fillRect_4f7134801b257e68(arg0, arg1, arg2, arg3, arg4) {
    if (typeof window !== 'undefined') {
        (window)._neosantara_feature_index = 0;
    }
    arg0.fillRect(arg1, arg2, arg3, arg4);
}
export function __wbg_fillText_b32475d6cb52486d() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
    arg0.fillText(getStringFromWasm0(arg1, arg2), arg3, arg4);
}, arguments); }
export function __wbg_fill_48694a86c0e175cf(arg0) {
    arg0.fill();
}
export function __wbg_getContext_e1463ff7aa682d57() { return handleError(function (arg0, arg1, arg2) {
    const ret = arg0.getContext(getStringFromWasm0(arg1, arg2));
    return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
}, arguments); }
export function __wbg_getElementById_78449141d07cd8ef(arg0, arg1, arg2) {
    const ret = arg0.getElementById(getStringFromWasm0(arg1, arg2));
    return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
}
let currentFeatureProps = null;

export function __wbg_get_with_ref_key_6412cf3094599694(arg0, arg1) {
    if (arg0 && typeof arg0 === 'object' && ('ISO_A2' in arg0 || 'NAME' in arg0 || 'ADMIN' in arg0)) {
        currentFeatureProps = arg0;
    }
    const ret = arg0[arg1];
    return ret;
}
export function __wbg_instanceof_ArrayBuffer_53db37b06f6b9afe(arg0) {
    let result;
    try {
        result = arg0 instanceof ArrayBuffer;
    } catch (_) {
        result = false;
    }
    const ret = result;
    return ret;
}
export function __wbg_instanceof_CanvasRenderingContext2d_d4be74cff7165c1e(arg0) {
    let result;
    try {
        result = arg0 instanceof CanvasRenderingContext2D;
    } catch (_) {
        result = false;
    }
    const ret = result;
    return ret;
}
export function __wbg_instanceof_HtmlCanvasElement_a02da0a417f1bf3f(arg0) {
    let result;
    try {
        result = arg0 instanceof HTMLCanvasElement;
    } catch (_) {
        result = false;
    }
    const ret = result;
    return ret;
}
export function __wbg_instanceof_Response_ecfc823e8fb354e2(arg0) {
    let result;
    try {
        result = arg0 instanceof Response;
    } catch (_) {
        result = false;
    }
    const ret = result;
    return ret;
}
export function __wbg_instanceof_Uint8Array_abd07d4bd221d50b(arg0) {
    let result;
    try {
        result = arg0 instanceof Uint8Array;
    } catch (_) {
        result = false;
    }
    const ret = result;
    return ret;
}
export function __wbg_instanceof_Window_faa5cf994f49cca7(arg0) {
    let result;
    try {
        result = arg0 instanceof Window;
    } catch (_) {
        result = false;
    }
    const ret = result;
    return ret;
}
export function __wbg_isArray_94898ed3aad6947b(arg0) {
    const ret = Array.isArray(arg0);
    return ret;
}
export function __wbg_json_6aafb7ebb4d3e61b() { return handleError(function (arg0) {
    const ret = arg0.json();
    return ret;
}, arguments); }
export function __wbg_length_56fcd3e2b7e0299d(arg0) {
    const ret = arg0.length;
    return ret;
}
export function __wbg_lineTo_72d6b123d28ab168(arg0, arg1, arg2) {
    arg0.lineTo(arg1, arg2);
}
export function __wbg_moveTo_11bf5a977e6b8610(arg0, arg1, arg2) {
    arg0.moveTo(arg1, arg2);
}
export function __wbg_new_227d7c05414eb861() {
    const ret = new Error();
    return ret;
}
export function __wbg_new_310879b66b6e95e1() {
    const ret = new Array();
    return ret;
}
export function __wbg_new_7ddec6de44ff8f5d(arg0) {
    const ret = new Uint8Array(arg0);
    return ret;
}
export function __wbg_new_typed_c072c4ce9a2a0cdf(arg0, arg1) {
    try {
        var state0 = {a: arg0, b: arg1};
        var cb0 = (arg0, arg1) => {
            const a = state0.a;
            state0.a = 0;
            try {
                return wasm_bindgen__convert__closures_____invoke__h41cf2b6b20971daf(a, state0.b, arg0, arg1);
            } finally {
                state0.a = a;
            }
        };
        const ret = new Promise(cb0);
        return ret;
    } finally {
        state0.a = 0;
    }
}
export function __wbg_offsetHeight_c6bc611825eefbb2(arg0) {
    const ret = arg0.offsetHeight;
    return ret;
}
export function __wbg_offsetWidth_a3a2466cbed54d24(arg0) {
    const ret = arg0.offsetWidth;
    return ret;
}
export function __wbg_offsetX_33e541f377c3ef38(arg0) {
    const ret = arg0.offsetX;
    return ret;
}
export function __wbg_offsetY_79c8223b1054870e(arg0) {
    const ret = arg0.offsetY;
    return ret;
}
export function __wbg_preventDefault_077a15ca7e97dc5a(arg0) {
    arg0.preventDefault();
}
export function __wbg_prototypesetcall_5f9bdc8d75e07276(arg0, arg1, arg2) {
    Uint8Array.prototype.set.call(getArrayU8FromWasm0(arg0, arg1), arg2);
}
export function __wbg_queueMicrotask_78d584b53af520f5(arg0) {
    const ret = arg0.queueMicrotask;
    return ret;
}
export function __wbg_queueMicrotask_b39ea83c7f01971a(arg0) {
    queueMicrotask(arg0);
}
export function __wbg_requestAnimationFrame_0ed67cfff9dd8396() { return handleError(function (arg0, arg1) {
    const ret = arg0.requestAnimationFrame(arg1);
    return ret;
}, arguments); }
export function __wbg_resolve_d17db9352f5a220e(arg0) {
    const ret = Promise.resolve(arg0);
    return ret;
}
export function __wbg_setTransform_f58d3fff89c964b4() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6) {
    arg0.setTransform(arg1, arg2, arg3, arg4, arg5, arg6);
}, arguments); }
export function __wbg_set_78ea6a19f4818587(arg0, arg1, arg2) {
    arg0[arg1 >>> 0] = arg2;
}
export function __wbg_set_fillStyle_24e3cfb685552e88(arg0, arg1) {
    let finalColor = arg1;

    if (arg1 === '#1e3a8a') {
        if (typeof window !== 'undefined') {
            (window)._neosantara_feature_index = 0;
        }
    } else if (arg1 !== '#fbbf24' && arg1 !== 'white') {
        if (typeof window !== 'undefined') {
            const win = window;
            const features = win.neosantara_world_geojson_features;
            let idx = win._neosantara_feature_index || 0;

            if (features && Array.isArray(features) && idx < features.length) {
                const currentFeature = features[idx];
                win._neosantara_feature_index = idx + 1;

                if (arg1 !== '#10b981' && win.neosantara_country_color_overrides && currentFeature && currentFeature.properties) {
                    const overrides = win.neosantara_country_color_overrides;
                    const props = currentFeature.properties;
                    const iso = (props.ISO_A2 || props.ISO_A3 || '').toLowerCase().trim();
                    const name = (props.NAME || props.ADMIN || props.NAME_LONG || props.GEOUNIT || '').toLowerCase().trim();

                    let overrideColor = null;

                    for (const [key, color] of Object.entries(overrides)) {
                        const k = key.toLowerCase().trim();
                        if (
                            k === iso ||
                            k === name ||
                            (k === 'afganistan' && name.includes('afghan')) ||
                            (k.includes('afgan') && name.includes('afghan')) ||
                            (name && k.length > 3 && (name.includes(k) || k.includes(name)))
                        ) {
                            overrideColor = color;
                            break;
                        }
                    }

                    if (overrideColor) {
                        finalColor = overrideColor;
                    }
                }
            }
        }
    }

    arg0.fillStyle = finalColor;
}
export function __wbg_set_font_7d34a66f4488295e(arg0, arg1, arg2) {
    arg0.font = getStringFromWasm0(arg1, arg2);
}
export function __wbg_set_height_bdd58e6b04e88cca(arg0, arg1) {
    arg0.height = arg1 >>> 0;
}
export function __wbg_set_lineWidth_e101692cb4fcf2b8(arg0, arg1) {
    arg0.lineWidth = arg1;
}
export function __wbg_set_shadowBlur_2b0b17774538964f(arg0, arg1) {
    arg0.shadowBlur = arg1;
}
export function __wbg_set_shadowColor_fd19b74a10546ec5(arg0, arg1, arg2) {
    arg0.shadowColor = getStringFromWasm0(arg1, arg2);
}
export function __wbg_set_strokeStyle_eec3895cecafc875(arg0, arg1) {
    arg0.strokeStyle = arg1;
}
export function __wbg_set_width_25112eb6bf1148df(arg0, arg1) {
    arg0.width = arg1 >>> 0;
}
export function __wbg_slice_82cd168f40b6b26b(arg0, arg1) {
    const ret = arg1.slice();
    const ptr1 = passArrayJsValueToWasm0(ret, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
}
export function __wbg_stack_3b0d974bbf31e44f(arg0, arg1) {
    const ret = arg1.stack;
    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
}
export function __wbg_static_accessor_GLOBAL_THIS_02344c9b09eb08a9() {
    const ret = typeof globalThis === 'undefined' ? null : globalThis;
    return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
}
export function __wbg_static_accessor_GLOBAL_ac6d4ac874d5cd54() {
    const ret = typeof global === 'undefined' ? null : global;
    return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
}
export function __wbg_static_accessor_SELF_9b2406c23aeb2023() {
    const ret = typeof self === 'undefined' ? null : self;
    return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
}
export function __wbg_static_accessor_WINDOW_b34d2126934e16ba() {
    const ret = typeof window === 'undefined' ? null : window;
    return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
}
export function __wbg_stroke_82139a335b371e81(arg0) {
    arg0.stroke();
}
export function __wbg_text_99930d92d5f1b540() { return handleError(function (arg0) {
    const ret = arg0.text();
    return ret;
}, arguments); }
export function __wbg_then_837494e384b37459(arg0, arg1) {
    const ret = arg0.then(arg1);
    return ret;
}
export function __wbg_then_bd927500e8905df2(arg0, arg1, arg2) {
    const ret = arg0.then(arg1, arg2);
    return ret;
}
export function __wbindgen_cast_0000000000000001(arg0, arg1) {
    // Cast intrinsic for `Closure(Closure { owned: true, function: Function { arguments: [Externref], shim_idx: 80, ret: Result(Unit), inner_ret: Some(Result(Unit)) }, mutable: true }) -> Externref`.
    const ret = makeMutClosure(arg0, arg1, wasm_bindgen__convert__closures_____invoke__hb45d559da7412429);
    return ret;
}
export function __wbindgen_cast_0000000000000002(arg0, arg1) {
    // Cast intrinsic for `Closure(Closure { owned: true, function: Function { arguments: [NamedExternref("MouseEvent")], shim_idx: 26, ret: Unit, inner_ret: Some(Unit) }, mutable: true }) -> Externref`.
    const ret = makeMutClosure(arg0, arg1, wasm_bindgen__convert__closures_____invoke__h9ae7a73f08418505);
    return ret;
}
export function __wbindgen_cast_0000000000000003(arg0, arg1) {
    // Cast intrinsic for `Closure(Closure { owned: true, function: Function { arguments: [NamedExternref("WheelEvent")], shim_idx: 26, ret: Unit, inner_ret: Some(Unit) }, mutable: true }) -> Externref`.
    const ret = makeMutClosure(arg0, arg1, wasm_bindgen__convert__closures_____invoke__h9ae7a73f08418505_2);
    return ret;
}
export function __wbindgen_cast_0000000000000004(arg0, arg1) {
    // Cast intrinsic for `Closure(Closure { owned: true, function: Function { arguments: [], shim_idx: 29, ret: Unit, inner_ret: Some(Unit) }, mutable: true }) -> Externref`.
    const ret = makeMutClosure(arg0, arg1, wasm_bindgen__convert__closures_____invoke__h7c7843953cea6124);
    return ret;
}
export function __wbindgen_cast_0000000000000005(arg0, arg1) {
    // Cast intrinsic for `Ref(String) -> Externref`.
    const ret = getStringFromWasm0(arg0, arg1);
    return ret;
}
export function __wbindgen_init_externref_table() {
    const table = wasm.__wbindgen_externrefs;
    const offset = table.grow(4);
    table.set(0, undefined);
    table.set(offset + 0, undefined);
    table.set(offset + 1, null);
    table.set(offset + 2, true);
    table.set(offset + 3, false);
}
function wasm_bindgen__convert__closures_____invoke__h7c7843953cea6124(arg0, arg1) {
    wasm.wasm_bindgen__convert__closures_____invoke__h7c7843953cea6124(arg0, arg1);
}

function wasm_bindgen__convert__closures_____invoke__h9ae7a73f08418505(arg0, arg1, arg2) {
    wasm.wasm_bindgen__convert__closures_____invoke__h9ae7a73f08418505(arg0, arg1, arg2);
}

function wasm_bindgen__convert__closures_____invoke__h9ae7a73f08418505_2(arg0, arg1, arg2) {
    wasm.wasm_bindgen__convert__closures_____invoke__h9ae7a73f08418505_2(arg0, arg1, arg2);
}

function wasm_bindgen__convert__closures_____invoke__hb45d559da7412429(arg0, arg1, arg2) {
    const ret = wasm.wasm_bindgen__convert__closures_____invoke__hb45d559da7412429(arg0, arg1, arg2);
    if (ret[1]) {
        throw takeFromExternrefTable0(ret[0]);
    }
}

function wasm_bindgen__convert__closures_____invoke__h41cf2b6b20971daf(arg0, arg1, arg2, arg3) {
    wasm.wasm_bindgen__convert__closures_____invoke__h41cf2b6b20971daf(arg0, arg1, arg2, arg3);
}

const MapEngineFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_mapengine_free(ptr, 1));

function addToExternrefTable0(obj) {
    const idx = wasm.__externref_table_alloc();
    wasm.__wbindgen_externrefs.set(idx, obj);
    return idx;
}

const CLOSURE_DTORS = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(state => wasm.__wbindgen_destroy_closure(state.a, state.b));

function debugString(val) {
    // primitive types
    const type = typeof val;
    if (type == 'number' || type == 'boolean' || val == null) {
        return  `${val}`;
    }
    if (type == 'string') {
        return `"${val}"`;
    }
    if (type == 'symbol') {
        const description = val.description;
        if (description == null) {
            return 'Symbol';
        } else {
            return `Symbol(${description})`;
        }
    }
    if (type == 'function') {
        const name = val.name;
        if (typeof name == 'string' && name.length > 0) {
            return `Function(${name})`;
        } else {
            return 'Function';
        }
    }
    // objects
    if (Array.isArray(val)) {
        const length = val.length;
        let debug = '[';
        if (length > 0) {
            debug += debugString(val[0]);
        }
        for(let i = 1; i < length; i++) {
            debug += ', ' + debugString(val[i]);
        }
        debug += ']';
        return debug;
    }
    // Test for built-in
    const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
    let className;
    if (builtInMatches && builtInMatches.length > 1) {
        className = builtInMatches[1];
    } else {
        // Failed to match the standard '[object ClassName]'
        return toString.call(val);
    }
    if (className == 'Object') {
        // we're a user defined class or Object
        // JSON.stringify avoids problems with cycles, and is generally much
        // easier than looping through ownProperties of `val`.
        try {
            return 'Object(' + JSON.stringify(val) + ')';
        } catch (_) {
            return 'Object';
        }
    }
    // errors
    if (val instanceof Error) {
        return `${val.name}: ${val.message}\n${val.stack}`;
    }
    // TODO we could test for more things here, like `Set`s and `Map`s.
    return className;
}

function getArrayU8FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getUint8ArrayMemory0().subarray(ptr / 1, ptr / 1 + len);
}

let cachedDataViewMemory0 = null;
function getDataViewMemory0() {
    if (cachedDataViewMemory0 === null || cachedDataViewMemory0.buffer.detached === true || (cachedDataViewMemory0.buffer.detached === undefined && cachedDataViewMemory0.buffer !== wasm.memory.buffer)) {
        cachedDataViewMemory0 = new DataView(wasm.memory.buffer);
    }
    return cachedDataViewMemory0;
}

function getStringFromWasm0(ptr, len) {
    return decodeText(ptr >>> 0, len);
}

let cachedUint8ArrayMemory0 = null;
function getUint8ArrayMemory0() {
    if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
        cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8ArrayMemory0;
}

function handleError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        const idx = addToExternrefTable0(e);
        wasm.__wbindgen_exn_store(idx);
    }
}

function isLikeNone(x) {
    return x === undefined || x === null;
}

function makeMutClosure(arg0, arg1, f) {
    const state = { a: arg0, b: arg1, cnt: 1 };
    const real = (...args) => {

        // First up with a closure we increment the internal reference
        // count. This ensures that the Rust closure environment won't
        // be deallocated while we're invoking it.
        state.cnt++;
        const a = state.a;
        state.a = 0;
        try {
            return f(a, state.b, ...args);
        } finally {
            state.a = a;
            real._wbg_cb_unref();
        }
    };
    real._wbg_cb_unref = () => {
        if (--state.cnt === 0) {
            wasm.__wbindgen_destroy_closure(state.a, state.b);
            state.a = 0;
            CLOSURE_DTORS.unregister(state);
        }
    };
    CLOSURE_DTORS.register(real, state, state);
    return real;
}

function passArrayJsValueToWasm0(array, malloc) {
    const ptr = malloc(array.length * 4, 4) >>> 0;
    for (let i = 0; i < array.length; i++) {
        const add = addToExternrefTable0(array[i]);
        getDataViewMemory0().setUint32(ptr + 4 * i, add, true);
    }
    WASM_VECTOR_LEN = array.length;
    return ptr;
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

function takeFromExternrefTable0(idx) {
    const value = wasm.__wbindgen_externrefs.get(idx);
    wasm.__externref_table_dealloc(idx);
    return value;
}

let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
cachedTextDecoder.decode();
const MAX_SAFARI_DECODE_BYTES = 2146435072;
let numBytesDecoded = 0;
function decodeText(ptr, len) {
    numBytesDecoded += len;
    if (numBytesDecoded >= MAX_SAFARI_DECODE_BYTES) {
        cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
        cachedTextDecoder.decode();
        numBytesDecoded = len;
    }
    return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
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


let wasm;
export function __wbg_set_wasm(val) {
    wasm = val;
}
