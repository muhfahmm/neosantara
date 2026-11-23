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
     * @returns {any}
     */
    get_perf_stats() {
        const ret = wasm.mapengine_get_perf_stats(this.__wbg_ptr);
        return ret;
    }
    /**
     * @param {number} x
     * @param {number} y
     * @param {number} pointer_id
     */
    handle_mouse_down(x, y, pointer_id) {
        wasm.mapengine_handle_mouse_down(this.__wbg_ptr, x, y, pointer_id);
    }
    /**
     * @param {number} x
     * @param {number} y
     * @param {number} buttons
     * @param {number} pointer_id
     */
    handle_mouse_move(x, y, buttons, pointer_id) {
        wasm.mapengine_handle_mouse_move(this.__wbg_ptr, x, y, buttons, pointer_id);
    }
    handle_mouse_up() {
        wasm.mapengine_handle_mouse_up(this.__wbg_ptr);
    }
    /**
     * @param {number} pointer_id
     * @param {number} x
     * @param {number} y
     */
    handle_touch_down(pointer_id, x, y) {
        wasm.mapengine_handle_touch_down(this.__wbg_ptr, pointer_id, x, y);
    }
    /**
     * @param {number} pointer_id
     * @param {number} x
     * @param {number} y
     */
    handle_touch_move(pointer_id, x, y) {
        wasm.mapengine_handle_touch_move(this.__wbg_ptr, pointer_id, x, y);
    }
    /**
     * @param {number} pointer_id
     */
    handle_touch_up(pointer_id) {
        wasm.mapengine_handle_touch_up(this.__wbg_ptr, pointer_id);
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
    /**
     * @param {number} delta_x
     * @param {number} delta_y
     */
    pan_by(delta_x, delta_y) {
        wasm.mapengine_pan_by(this.__wbg_ptr, delta_x, delta_y);
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
     * @param {any[]} cities
     */
    set_city_ownership(cities) {
        const ptr0 = passArrayJsValueToWasm0(cities, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.mapengine_set_city_ownership(this.__wbg_ptr, ptr0, len0);
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
    /**
     * Warna override per feature (indeks sama dengan urutan GeoJSON). null/undefined = tanpa override.
     * @param {any[]} colors
     * @param {boolean} beat_selected
     */
    set_feature_colors(colors, beat_selected) {
        const val2 = +beat_selected;
        const ptr0 = passArrayJsValueToWasm0(colors, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.mapengine_set_feature_colors(this.__wbg_ptr, ptr0, len0, val2);
    }
    /**
     * @param {boolean} enabled
     */
    set_horizontal_wrap(enabled) {
        wasm.mapengine_set_horizontal_wrap(this.__wbg_ptr, enabled);
    }
    /**
     * Parse GeoJSON sekali, proyeksikan semua titik & hitung bbox (cache).
     * @param {string} geojson_str
     */
    set_provinces_data(geojson_str) {
        const ptr0 = passStringToWasm0(geojson_str, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.mapengine_set_provinces_data(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @param {string | null | undefined} iso
     * @param {boolean} should_center
     */
    set_selected_country(iso, should_center) {
        const val2 = +should_center;
        var ptr0 = isLikeNone(iso) ? 0 : passStringToWasm0(iso, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        wasm.mapengine_set_selected_country(this.__wbg_ptr, ptr0, len0, val2);
    }
    /**
     * @param {boolean} show
     */
    set_show_province_borders(show) {
        wasm.mapengine_set_show_province_borders(this.__wbg_ptr, show);
    }
    /**
     * @param {number} now_ms
     */
    tick(now_ms) {
        wasm.mapengine_tick(this.__wbg_ptr, now_ms);
    }
}
if (Symbol.dispose) MapEngine.prototype[Symbol.dispose] = MapEngine.prototype.free;

export function end_map_pan_on_map() {
    wasm.end_map_pan_on_map();
}

/**
 * @param {number} mouse_x
 * @param {number} mouse_y
 * @returns {any}
 */
export function get_country_at_on_map(mouse_x, mouse_y) {
    const ret = wasm.get_country_at_on_map(mouse_x, mouse_y);
    return ret;
}

/**
 * @returns {any}
 */
export function get_perf_stats_on_map() {
    const ret = wasm.get_perf_stats_on_map();
    return ret;
}

/**
 * @param {number} delta_x
 * @param {number} delta_y
 */
export function pan_map_by_on_map(delta_x, delta_y) {
    wasm.pan_map_by_on_map(delta_x, delta_y);
}

/**
 * @param {any[]} capitals
 */
export function set_capitals_on_map(capitals) {
    const ptr0 = passArrayJsValueToWasm0(capitals, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    wasm.set_capitals_on_map(ptr0, len0);
}

/**
 * @param {any[]} cities
 */
export function set_city_ownership_on_map(cities) {
    const ptr0 = passArrayJsValueToWasm0(cities, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    wasm.set_city_ownership_on_map(ptr0, len0);
}

/**
 * @param {any[]} colors
 * @param {boolean} beat_selected
 */
export function set_feature_colors_on_map(colors, beat_selected) {
    const val2 = +beat_selected;
    const ptr0 = passArrayJsValueToWasm0(colors, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    wasm.set_feature_colors_on_map(ptr0, len0, val2);
}

/**
 * @param {boolean} enabled
 */
export function set_map_horizontal_wrap(enabled) {
    wasm.set_map_horizontal_wrap(enabled);
}

/**
 * @param {string} provinces_geojson
 */
export function set_provinces_on_map(provinces_geojson) {
    const ptr0 = passStringToWasm0(provinces_geojson, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    wasm.set_provinces_on_map(ptr0, len0);
}

/**
 * @param {string} iso
 * @param {boolean} should_center
 */
export function set_selected_country_on_map(iso, should_center) {
    const val2 = +should_center;
    const ptr0 = passStringToWasm0(iso, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    wasm.set_selected_country_on_map(ptr0, len0, val2);
}

/**
 * @param {boolean} show
 */
export function set_show_province_borders_on_map(show) {
    wasm.set_show_province_borders_on_map(show);
}

/**
 * @param {string} canvas_id
 * @param {string} world_text
 * @param {any} countries_json
 * @param {any} capitals_json
 */
export function start_map_engine(canvas_id, world_text, countries_json, capitals_json) {
    let ptr0, len0, ptr1, len1;
    try {
        ptr0 = passStringToWasm0(canvas_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        len0 = WASM_VECTOR_LEN;
        ptr1 = passStringToWasm0(world_text, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        len1 = WASM_VECTOR_LEN;
    } catch (e) {
        if (ptr1) { wasm.__wbindgen_free(ptr1, len1 * 1, 1); }
        if (ptr0) { wasm.__wbindgen_free(ptr0, len0 * 1, 1); }
        throw e;
    }
    const ret = wasm.start_map_engine(ptr0, len0, ptr1, len1, countries_json, capitals_json);
    if (ret[1]) {
        throw takeFromExternrefTable0(ret[0]);
    }
}

/**
 * @param {number} factor
 * @param {number} x
 * @param {number} y
 */
export function zoom_map_at_on_map(factor, x, y) {
    wasm.zoom_map_at_on_map(factor, x, y);
}
export function __wbg_Error_208446807d0d1e30(arg0, arg1) {
    const ret = Error(getStringFromWasm0(arg0, arg1));
    return ret;
}
export function __wbg_String_8564e559799eccda(arg0, arg1) {
    const ret = String(arg1);
    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    getDataViewMemory0().setInt32((arg0 >>> 0) + 4 * 1, len1, true);
    getDataViewMemory0().setInt32((arg0 >>> 0) + 4 * 0, ptr1, true);
}
export function __wbg___wbindgen_boolean_get_4f1baf9a00be3c74(arg0) {
    const v = arg0;
    const ret = typeof(v) === 'boolean' ? v : undefined;
    return isLikeNone(ret) ? 0xFFFFFF : ret ? 1 : 0;
}
export function __wbg___wbindgen_debug_string_f249a2a76caa9a55(arg0, arg1) {
    const ret = debugString(arg1);
    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    getDataViewMemory0().setInt32((arg0 >>> 0) + 4 * 1, len1, true);
    getDataViewMemory0().setInt32((arg0 >>> 0) + 4 * 0, ptr1, true);
}
export function __wbg___wbindgen_in_3f58a9d3b3a7eed2(arg0, arg1) {
    const ret = arg0 in arg1;
    return ret;
}
export function __wbg___wbindgen_is_function_741ff2bb612836f5(arg0) {
    const ret = typeof(arg0) === 'function';
    return ret;
}
export function __wbg___wbindgen_is_null_c22311b1cc228e3a(arg0) {
    const ret = arg0 === null;
    return ret;
}
export function __wbg___wbindgen_is_object_8b968c3ab8e96595(arg0) {
    const val = arg0;
    const ret = typeof(val) === 'object' && val !== null;
    return ret;
}
export function __wbg___wbindgen_is_string_fc456fee5d3317de(arg0) {
    const ret = typeof(arg0) === 'string';
    return ret;
}
export function __wbg___wbindgen_is_undefined_be5b34249ff1fc15(arg0) {
    const ret = arg0 === undefined;
    return ret;
}
export function __wbg___wbindgen_jsval_loose_eq_b2f214e2e4b30e36(arg0, arg1) {
    const ret = arg0 == arg1;
    return ret;
}
export function __wbg___wbindgen_number_get_934b640d0889af78(arg0, arg1) {
    const obj = arg1;
    const ret = typeof(obj) === 'number' ? obj : undefined;
    getDataViewMemory0().setFloat64((arg0 >>> 0) + 8 * 1, isLikeNone(ret) ? 0 : ret, true);
    getDataViewMemory0().setInt32((arg0 >>> 0) + 4 * 0, !isLikeNone(ret), true);
}
export function __wbg___wbindgen_string_get_7ce8eee7fd327545(arg0, arg1) {
    const obj = arg1;
    const ret = typeof(obj) === 'string' ? obj : undefined;
    var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len1 = WASM_VECTOR_LEN;
    getDataViewMemory0().setInt32((arg0 >>> 0) + 4 * 1, len1, true);
    getDataViewMemory0().setInt32((arg0 >>> 0) + 4 * 0, ptr1, true);
}
export function __wbg___wbindgen_throw_4c88d8bf264fd984(arg0, arg1) {
    throw new Error(getStringFromWasm0(arg0, arg1));
}
export function __wbg__wbg_cb_unref_09736879a3f67559(arg0) {
    arg0._wbg_cb_unref();
}
export function __wbg_addEventListener_847fd86b8c33ec43() { return handleError(function (arg0, arg1, arg2, arg3) {
    arg0.addEventListener(getStringFromWasm0(arg1, arg2), arg3);
}, arguments); }
export function __wbg_addPath_a72e9092cc82f03d(arg0, arg1) {
    arg0.addPath(arg1);
}
export function __wbg_assign_6b6bb30388088072(arg0, arg1) {
    const ret = Object.assign(arg0, arg1);
    return ret;
}
export function __wbg_beginPath_ab690dc0c7efe6dc(arg0) {
    arg0.beginPath();
}
export function __wbg_call_40b008ba32f73991() { return handleError(function (arg0, arg1) {
    const ret = arg0.call(arg1);
    return ret;
}, arguments); }
export function __wbg_clip_5b100ab85eecdabe(arg0, arg1) {
    arg0.clip(arg1);
}
export function __wbg_closePath_c46e6736d1f46cf8(arg0) {
    arg0.closePath();
}
export function __wbg_closePath_e9e11e034c5d75a3(arg0) {
    arg0.closePath();
}
export function __wbg_complete_0e7a92600338e7ab(arg0) {
    const ret = arg0.complete;
    return ret;
}
export function __wbg_createElement_de4a31ed2fb252be() { return handleError(function (arg0, arg1, arg2) {
    const ret = arg0.createElement(getStringFromWasm0(arg1, arg2));
    return ret;
}, arguments); }
export function __wbg_deltaY_37dc0a54748a91f4(arg0) {
    const ret = arg0.deltaY;
    return ret;
}
export function __wbg_document_3b5c3071b43e97ee(arg0) {
    const ret = arg0.document;
    return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
}
export function __wbg_done_57e08d0be6e30c02(arg0) {
    const ret = arg0.done;
    return ret;
}
export function __wbg_drawImage_115d33dadf38c151() { return handleError(function (arg0, arg1, arg2, arg3) {
    arg0.drawImage(arg1, arg2, arg3);
}, arguments); }
export function __wbg_drawImage_47077eeae8f1a73d() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5) {
    arg0.drawImage(arg1, arg2, arg3, arg4, arg5);
}, arguments); }
export function __wbg_drawImage_677012fa94c227b5() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5) {
    arg0.drawImage(arg1, arg2, arg3, arg4, arg5);
}, arguments); }
export function __wbg_error_757e9472f8410341(arg0, arg1) {
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
export function __wbg_error_9b95f63d905893d2(arg0, arg1) {
    console.error(arg0, arg1);
}
export function __wbg_error_d1fc0193610e0e39(arg0) {
    console.error(arg0);
}
export function __wbg_fillRect_e1f0b9915220348b(arg0, arg1, arg2, arg3, arg4) {
    arg0.fillRect(arg1, arg2, arg3, arg4);
}
export function __wbg_fillText_89d353a9ad9f4a1a() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
    arg0.fillText(getStringFromWasm0(arg1, arg2), arg3, arg4);
}, arguments); }
export function __wbg_fill_0f2da6eee5a2e8d4(arg0, arg1) {
    arg0.fill(arg1);
}
export function __wbg_fill_cb36fe21a8d46cd7(arg0) {
    arg0.fill();
}
export function __wbg_getContext_d93f904b714852ae() { return handleError(function (arg0, arg1, arg2) {
    const ret = arg0.getContext(getStringFromWasm0(arg1, arg2));
    return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
}, arguments); }
export function __wbg_getElementById_7ee213db584f37b0(arg0, arg1, arg2) {
    const ret = arg0.getElementById(getStringFromWasm0(arg1, arg2));
    return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
}
export function __wbg_get_635eea311fa1a291() { return handleError(function (arg0, arg1) {
    const ret = Reflect.get(arg0, arg1);
    return ret;
}, arguments); }
export function __wbg_get_unchecked_e6325ad374eff861(arg0, arg1) {
    const ret = arg0[arg1 >>> 0];
    return ret;
}
export function __wbg_get_with_ref_key_fc601247060b7204(arg0, arg1) {
    const ret = arg0[arg1];
    return ret;
}
export function __wbg_innerWidth_3bc249efddc56481() { return handleError(function (arg0) {
    const ret = arg0.innerWidth;
    return ret;
}, arguments); }
export function __wbg_instanceof_ArrayBuffer_12cdaa4161423e6b(arg0) {
    let result;
    try {
        result = arg0 instanceof ArrayBuffer;
    } catch (_) {
        result = false;
    }
    const ret = result;
    return ret;
}
export function __wbg_instanceof_CanvasRenderingContext2d_72a60be8aaadecab(arg0) {
    let result;
    try {
        result = arg0 instanceof CanvasRenderingContext2D;
    } catch (_) {
        result = false;
    }
    const ret = result;
    return ret;
}
export function __wbg_instanceof_HtmlCanvasElement_89f280683e987b9e(arg0) {
    let result;
    try {
        result = arg0 instanceof HTMLCanvasElement;
    } catch (_) {
        result = false;
    }
    const ret = result;
    return ret;
}
export function __wbg_instanceof_HtmlImageElement_f22acd64d72ae23a(arg0) {
    let result;
    try {
        result = arg0 instanceof HTMLImageElement;
    } catch (_) {
        result = false;
    }
    const ret = result;
    return ret;
}
export function __wbg_instanceof_Object_97e16a01fd368661(arg0) {
    let result;
    try {
        result = arg0 instanceof Object;
    } catch (_) {
        result = false;
    }
    const ret = result;
    return ret;
}
export function __wbg_instanceof_Uint8Array_d7aeb0dcb3108fea(arg0) {
    let result;
    try {
        result = arg0 instanceof Uint8Array;
    } catch (_) {
        result = false;
    }
    const ret = result;
    return ret;
}
export function __wbg_instanceof_Window_5cf453f5639aa1a2(arg0) {
    let result;
    try {
        result = arg0 instanceof Window;
    } catch (_) {
        result = false;
    }
    const ret = result;
    return ret;
}
export function __wbg_isArray_bcf1376d0d732d08(arg0) {
    const ret = Array.isArray(arg0);
    return ret;
}
export function __wbg_iterator_e4c5e8f68ada7b58() {
    const ret = Symbol.iterator;
    return ret;
}
export function __wbg_length_186163212ffe79c3(arg0) {
    const ret = arg0.length;
    return ret;
}
export function __wbg_length_b03a0fabb109b1e9(arg0) {
    const ret = arg0.length;
    return ret;
}
export function __wbg_lineTo_91262b25fb37c461(arg0, arg1, arg2) {
    arg0.lineTo(arg1, arg2);
}
export function __wbg_lineTo_e60c405378be56e2(arg0, arg1, arg2) {
    arg0.lineTo(arg1, arg2);
}
export function __wbg_moveTo_b4cd3b0b7e1585a5(arg0, arg1, arg2) {
    arg0.moveTo(arg1, arg2);
}
export function __wbg_moveTo_e3a818287297890a(arg0, arg1, arg2) {
    arg0.moveTo(arg1, arg2);
}
export function __wbg_naturalWidth_c3b5a9ac32cd185e(arg0) {
    const ret = arg0.naturalWidth;
    return ret;
}
export function __wbg_navigator_c17f443a6fe5d38d(arg0) {
    const ret = arg0.navigator;
    return ret;
}
export function __wbg_new_13de428334042d26(arg0) {
    const ret = new Uint8Array(arg0);
    return ret;
}
export function __wbg_new_37eb45aaf5eeb820() {
    const ret = new Array();
    return ret;
}
export function __wbg_new_7075786089b89c5e() {
    const ret = new Map();
    return ret;
}
export function __wbg_new_bb74001155cb8ca8() {
    const ret = new Error();
    return ret;
}
export function __wbg_new_cd4348290afae586() {
    const ret = new Object();
    return ret;
}
export function __wbg_new_ce9305e65f078649() { return handleError(function () {
    const ret = new Path2D();
    return ret;
}, arguments); }
export function __wbg_next_178c1651c11432b3(arg0) {
    const ret = arg0.next;
    return ret;
}
export function __wbg_next_af5ac6a08bb0a717() { return handleError(function (arg0) {
    const ret = arg0.next();
    return ret;
}, arguments); }
export function __wbg_now_043d245551b22f9c(arg0) {
    const ret = arg0.now();
    return ret;
}
export function __wbg_offsetHeight_91ca9e2be23502e5(arg0) {
    const ret = arg0.offsetHeight;
    return ret;
}
export function __wbg_offsetWidth_ec7d4ad6adc7e29d(arg0) {
    const ret = arg0.offsetWidth;
    return ret;
}
export function __wbg_offsetX_b3f88f70dc639385(arg0) {
    const ret = arg0.offsetX;
    return ret;
}
export function __wbg_offsetY_8037bf2718ef7393(arg0) {
    const ret = arg0.offsetY;
    return ret;
}
export function __wbg_performance_50e6a3f8dc80bbca(arg0) {
    const ret = arg0.performance;
    return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
}
export function __wbg_preventDefault_cfb06b02e7406899(arg0) {
    arg0.preventDefault();
}
export function __wbg_prototypesetcall_13162965d1fe7aa3(arg0, arg1, arg2) {
    Uint8Array.prototype.set.call(getArrayU8FromWasm0(arg0, arg1), arg2);
}
export function __wbg_requestAnimationFrame_9ba49d36a19ca83c() { return handleError(function (arg0, arg1) {
    const ret = arg0.requestAnimationFrame(arg1);
    return ret;
}, arguments); }
export function __wbg_restore_f322d9dcee2d3472(arg0) {
    arg0.restore();
}
export function __wbg_save_1375b4c2f3596b8b(arg0) {
    arg0.save();
}
export function __wbg_setTransform_ee8f5d076fcdec0f() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6) {
    arg0.setTransform(arg1, arg2, arg3, arg4, arg5, arg6);
}, arguments); }
export function __wbg_set_2793479888329cb6() { return handleError(function (arg0, arg1, arg2) {
    const ret = Reflect.set(arg0, arg1, arg2);
    return ret;
}, arguments); }
export function __wbg_set_8282f7e0d2d01336(arg0, arg1, arg2) {
    const ret = arg0.set(arg1, arg2);
    return ret;
}
export function __wbg_set_crossOrigin_eaf70f07e764020a(arg0, arg1, arg2) {
    arg0.crossOrigin = arg1 === 0 ? undefined : getStringFromWasm0(arg1, arg2);
}
export function __wbg_set_d2d33b52458e984a(arg0, arg1, arg2) {
    arg0[arg1 >>> 0] = arg2;
}
export function __wbg_set_e4b9a833d288759a(arg0, arg1, arg2) {
    arg0[arg1] = arg2;
}
export function __wbg_set_fillStyle_f2819d67645a21ba(arg0, arg1) {
    arg0.fillStyle = arg1;
}
export function __wbg_set_font_aa0c0c514c73a5fa(arg0, arg1, arg2) {
    arg0.font = getStringFromWasm0(arg1, arg2);
}
export function __wbg_set_height_ae0610d318c3428c(arg0, arg1) {
    arg0.height = arg1 >>> 0;
}
export function __wbg_set_lineCap_e73c68b48b40a360(arg0, arg1, arg2) {
    arg0.lineCap = getStringFromWasm0(arg1, arg2);
}
export function __wbg_set_lineJoin_c9ff5021d8b8197a(arg0, arg1, arg2) {
    arg0.lineJoin = getStringFromWasm0(arg1, arg2);
}
export function __wbg_set_lineWidth_12f039d09cd36dad(arg0, arg1) {
    arg0.lineWidth = arg1;
}
export function __wbg_set_src_da602cd25f3603f8(arg0, arg1, arg2) {
    arg0.src = getStringFromWasm0(arg1, arg2);
}
export function __wbg_set_strokeStyle_c0ecdaf8c4f0942f(arg0, arg1) {
    arg0.strokeStyle = arg1;
}
export function __wbg_set_textAlign_0a32c51401892c11(arg0, arg1, arg2) {
    arg0.textAlign = getStringFromWasm0(arg1, arg2);
}
export function __wbg_set_textBaseline_ff2e3c5c84684b23(arg0, arg1, arg2) {
    arg0.textBaseline = getStringFromWasm0(arg1, arg2);
}
export function __wbg_set_width_5f89a551b5472887(arg0, arg1) {
    arg0.width = arg1 >>> 0;
}
export function __wbg_slice_984d22ab53865879(arg0, arg1) {
    const ret = arg1.slice();
    const ptr1 = passArrayJsValueToWasm0(ret, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    getDataViewMemory0().setInt32((arg0 >>> 0) + 4 * 1, len1, true);
    getDataViewMemory0().setInt32((arg0 >>> 0) + 4 * 0, ptr1, true);
}
export function __wbg_stack_575c4e0918581b9c(arg0, arg1) {
    const ret = arg1.stack;
    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    getDataViewMemory0().setInt32((arg0 >>> 0) + 4 * 1, len1, true);
    getDataViewMemory0().setInt32((arg0 >>> 0) + 4 * 0, ptr1, true);
}
export function __wbg_static_accessor_GLOBAL_THIS_003ee833af9699fc() {
    const ret = typeof globalThis === 'undefined' ? undefined : globalThis;
    return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
}
export function __wbg_static_accessor_GLOBAL_e4293fb22cbe77da() {
    const ret = typeof global === 'undefined' ? undefined : global;
    return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
}
export function __wbg_static_accessor_SELF_53bb20457401453d() {
    const ret = typeof self === 'undefined' ? undefined : self;
    return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
}
export function __wbg_static_accessor_WINDOW_b5e0810bfecb7feb() {
    const ret = typeof window === 'undefined' ? undefined : window;
    return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
}
export function __wbg_strokeRect_92ff808375332184(arg0, arg1, arg2, arg3, arg4) {
    arg0.strokeRect(arg1, arg2, arg3, arg4);
}
export function __wbg_strokeText_f92a37fdafaa444f() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
    arg0.strokeText(getStringFromWasm0(arg1, arg2), arg3, arg4);
}, arguments); }
export function __wbg_stroke_19fa3f3ec093bc25(arg0) {
    arg0.stroke();
}
export function __wbg_stroke_d0000fc205da5c3e(arg0, arg1) {
    arg0.stroke(arg1);
}
export function __wbg_userAgent_a20b4771d027eeaa() { return handleError(function (arg0, arg1) {
    const ret = arg1.userAgent;
    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    getDataViewMemory0().setInt32((arg0 >>> 0) + 4 * 1, len1, true);
    getDataViewMemory0().setInt32((arg0 >>> 0) + 4 * 0, ptr1, true);
}, arguments); }
export function __wbg_value_e0f328965e184931(arg0) {
    const ret = arg0.value;
    return ret;
}
export function __wbindgen_generic_0000000000000001(arg0, arg1) {
    // Cast intrinsic for `Closure(Closure { owned: true, function: Function { arguments: [F64], shim_idx: 26, ret: Unit, inner_ret: Some(Unit) }, mutable: true }) -> Externref`.
    const ret = makeMutClosure(arg0, arg1, wasm_bindgen_3c9eef736fb71b8c___convert__closures_____invoke___f64______true_);
    return ret;
}
export function __wbindgen_generic_0000000000000002(arg0, arg1) {
    // Cast intrinsic for `Closure(Closure { owned: true, function: Function { arguments: [NamedExternref("MouseEvent")], shim_idx: 23, ret: Unit, inner_ret: Some(Unit) }, mutable: true }) -> Externref`.
    const ret = makeMutClosure(arg0, arg1, wasm_bindgen_3c9eef736fb71b8c___convert__closures_____invoke___web_sys_f8766af5db251e07___features__gen_MouseEvent__MouseEvent______true_);
    return ret;
}
export function __wbindgen_generic_0000000000000003(arg0, arg1) {
    // Cast intrinsic for `Closure(Closure { owned: true, function: Function { arguments: [NamedExternref("WheelEvent")], shim_idx: 23, ret: Unit, inner_ret: Some(Unit) }, mutable: true }) -> Externref`.
    const ret = makeMutClosure(arg0, arg1, wasm_bindgen_3c9eef736fb71b8c___convert__closures_____invoke___web_sys_f8766af5db251e07___features__gen_MouseEvent__MouseEvent______true__38);
    return ret;
}
export function __wbindgen_generic_0000000000000004(arg0) {
    // Cast intrinsic for `F64 -> Externref`.
    const ret = arg0;
    return ret;
}
export function __wbindgen_generic_0000000000000005(arg0) {
    // Cast intrinsic for `I64 -> Externref`.
    const ret = arg0;
    return ret;
}
export function __wbindgen_generic_0000000000000006(arg0, arg1) {
    // Cast intrinsic for `Ref(String) -> Externref`.
    const ret = getStringFromWasm0(arg0, arg1);
    return ret;
}
export function __wbindgen_generic_0000000000000007(arg0) {
    // Cast intrinsic for `U64 -> Externref`.
    const ret = BigInt.asUintN(64, arg0);
    return ret;
}
export function __wbindgen_init_externref_table() {
    const table = wasm.__wbindgen_externrefs;
    table.set(0, undefined);
    table.set(1024, undefined);
    table.set(1025, null);
    table.set(1026, true);
    table.set(1027, false);
}
function wasm_bindgen_3c9eef736fb71b8c___convert__closures_____invoke___web_sys_f8766af5db251e07___features__gen_MouseEvent__MouseEvent______true_(arg0, arg1, arg2) {
    wasm.wasm_bindgen_3c9eef736fb71b8c___convert__closures_____invoke___web_sys_f8766af5db251e07___features__gen_MouseEvent__MouseEvent______true_(arg0, arg1, arg2);
}

function wasm_bindgen_3c9eef736fb71b8c___convert__closures_____invoke___web_sys_f8766af5db251e07___features__gen_MouseEvent__MouseEvent______true__38(arg0, arg1, arg2) {
    wasm.wasm_bindgen_3c9eef736fb71b8c___convert__closures_____invoke___web_sys_f8766af5db251e07___features__gen_MouseEvent__MouseEvent______true__38(arg0, arg1, arg2);
}

function wasm_bindgen_3c9eef736fb71b8c___convert__closures_____invoke___f64______true_(arg0, arg1, arg2) {
    wasm.wasm_bindgen_3c9eef736fb71b8c___convert__closures_____invoke___f64______true_(arg0, arg1, arg2);
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
    switch (typeof val) {
        // primitive types
        case 'number':
        case 'boolean':
        case 'undefined':
        return `${val}`;
        case 'string':
        return JSON.stringify(val);
        case 'bigint':
        return `${val}n`;
        case 'symbol':
        return val.description !== undefined
            ? `Symbol(${val.description})`
            : 'Symbol';
        case 'function':
        return typeof val.name === 'string' && val.name !== ''
            ? `Function(${val.name})`
            : 'Function';
        case 'object': {
            if (val === null) {
                return 'null';
            }
            // objects
            if (Array.isArray(val)) {
                return '[' + Array.from(val, debugString).join(', ') + ']';
            }
            // errors
            if (val instanceof Error) {
                return `${val.name}: ${val.message}\n${val.stack}`;
            }

            const toStringOutput = toString.call(val);
            // Test for built-in
            const className = /\[object ([^\]]+)\]/.exec(toStringOutput)?.[1];

            // Failed to match the standard '[object ClassName]'
            if (className === undefined) {
                return toStringOutput;
            }
            if (className === 'Object') {
                // we're a user defined class or Object
                // JSON.stringify avoids problems with cycles, and is generally much
                // easier than looping through ownProperties of `val`.
                try {
                    return 'Object(' + JSON.stringify(val) + ')';
                } catch (_) {
                    return 'Object';
                }
            }
            // TODO we could test for more things here, like `Set`s and `Map`s.
            return className;
        }
        // Per MDN: 'This list of values is exhaustive.'
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/typeof#description
    }
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
    ptr = ptr >>> 0;
    return decodeText(getUint8ArrayMemory0().subarray(ptr, ptr + len));
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

let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true });
cachedTextDecoder.decode();
const MAX_SAFARI_DECODE_BYTES = 2146435072;
let numBytesDecoded = 0;
function decodeText(bytes) {
    numBytesDecoded += bytes.length;
    if (numBytesDecoded >= MAX_SAFARI_DECODE_BYTES) {
        cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true });
        cachedTextDecoder.decode();
        numBytesDecoded = bytes.length;
    }
    return cachedTextDecoder.decode(bytes);
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
