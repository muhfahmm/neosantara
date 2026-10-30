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
        const ptr0 = passArrayJsValueToWasm0(colors, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.mapengine_set_feature_colors(this.__wbg_ptr, ptr0, len0, beat_selected);
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
        var ptr0 = isLikeNone(iso) ? 0 : passStringToWasm0(iso, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        wasm.mapengine_set_selected_country(this.__wbg_ptr, ptr0, len0, should_center);
    }
    /**
     * @param {boolean} show
     */
    set_show_province_borders(show) {
        wasm.mapengine_set_show_province_borders(this.__wbg_ptr, show);
    }
    /**
     * Batasi kerja render ke 60 FPS maksimum, terlepas dari refresh rate layar.
     * @param {number} now_ms
     */
    tick(now_ms) {
        wasm.mapengine_tick(this.__wbg_ptr, now_ms);
    }
}
if (Symbol.dispose) MapEngine.prototype[Symbol.dispose] = MapEngine.prototype.free;

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
    const ptr0 = passArrayJsValueToWasm0(colors, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    wasm.set_feature_colors_on_map(ptr0, len0, beat_selected);
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
    const ptr0 = passStringToWasm0(iso, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    wasm.set_selected_country_on_map(ptr0, len0, should_center);
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
    const ptr0 = passStringToWasm0(canvas_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(world_text, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.start_map_engine(ptr0, len0, ptr1, len1, countries_json, capitals_json);
    if (ret[1]) {
        throw takeFromExternrefTable0(ret[0]);
    }
}
export function __wbg_Error_30c8987f7c2ed4e2(arg0, arg1) {
    const ret = Error(getStringFromWasm0(arg0, arg1));
    return ret;
}
export function __wbg_String_8564e559799eccda(arg0, arg1) {
    const ret = String(arg1);
    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
}
export function __wbg___wbindgen_boolean_get_5b446f51afd21013(arg0) {
    const v = arg0;
    const ret = typeof(v) === 'boolean' ? v : undefined;
    return isLikeNone(ret) ? 0xFFFFFF : ret ? 1 : 0;
}
export function __wbg___wbindgen_debug_string_4687d8d8c2017d52(arg0, arg1) {
    const ret = debugString(arg1);
    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
}
export function __wbg___wbindgen_in_92f62ee1427d9e49(arg0, arg1) {
    const ret = arg0 in arg1;
    return ret;
}
export function __wbg___wbindgen_is_object_3c45d4f2dde4e749(arg0) {
    const val = arg0;
    const ret = typeof(val) === 'object' && val !== null;
    return ret;
}
export function __wbg___wbindgen_is_undefined_8865fb403f8fe9d8(arg0) {
    const ret = arg0 === undefined;
    return ret;
}
export function __wbg___wbindgen_jsval_loose_eq_677f21e468d6b461(arg0, arg1) {
    const ret = arg0 == arg1;
    return ret;
}
export function __wbg___wbindgen_number_get_2e0e7dee9f701a71(arg0, arg1) {
    const obj = arg1;
    const ret = typeof(obj) === 'number' ? obj : undefined;
    getDataViewMemory0().setFloat64(arg0 + 8 * 1, isLikeNone(ret) ? 0 : ret, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, !isLikeNone(ret), true);
}
export function __wbg___wbindgen_string_get_0380ccaa2f57f0d9(arg0, arg1) {
    const obj = arg1;
    const ret = typeof(obj) === 'string' ? obj : undefined;
    var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len1 = WASM_VECTOR_LEN;
    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
}
export function __wbg___wbindgen_throw_41e9ee4f547fc59a(arg0, arg1) {
    throw new Error(getStringFromWasm0(arg0, arg1));
}
export function __wbg__wbg_cb_unref_dcc1a90847f04c41(arg0) {
    arg0._wbg_cb_unref();
}
export function __wbg_addEventListener_4d0db17c671ea324() { return handleError(function (arg0, arg1, arg2, arg3) {
    arg0.addEventListener(getStringFromWasm0(arg1, arg2), arg3);
}, arguments); }
export function __wbg_addPath_f809650bb62cdb4e(arg0, arg1) {
    arg0.addPath(arg1);
}
export function __wbg_assign_e39d243f5fbe1e2d(arg0, arg1) {
    const ret = Object.assign(arg0, arg1);
    return ret;
}
export function __wbg_beginPath_8598d895c13f1c86(arg0) {
    arg0.beginPath();
}
export function __wbg_button_1aa380c7ca420cd1(arg0) {
    const ret = arg0.button;
    return ret;
}
export function __wbg_buttons_de1e6c7f6de70736(arg0) {
    const ret = arg0.buttons;
    return ret;
}
export function __wbg_clip_29f22936ddd324c5(arg0, arg1) {
    arg0.clip(arg1);
}
export function __wbg_closePath_355eb6da179dd9c2(arg0) {
    arg0.closePath();
}
export function __wbg_closePath_d04f68c32d33fd65(arg0) {
    arg0.closePath();
}
export function __wbg_complete_e501182ac1c4e1e3(arg0) {
    const ret = arg0.complete;
    return ret;
}
export function __wbg_createElement_74049073a11f9c31() { return handleError(function (arg0, arg1, arg2) {
    const ret = arg0.createElement(getStringFromWasm0(arg1, arg2));
    return ret;
}, arguments); }
export function __wbg_deltaY_7abc8fc9878d0002(arg0) {
    const ret = arg0.deltaY;
    return ret;
}
export function __wbg_document_9854e03c05fc8834(arg0) {
    const ret = arg0.document;
    return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
}
export function __wbg_drawImage_6f841fbe7ccefe78() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5) {
    arg0.drawImage(arg1, arg2, arg3, arg4, arg5);
}, arguments); }
export function __wbg_drawImage_93d4867540340235() { return handleError(function (arg0, arg1, arg2, arg3) {
    arg0.drawImage(arg1, arg2, arg3);
}, arguments); }
export function __wbg_drawImage_c0004b34389582f6() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5) {
    arg0.drawImage(arg1, arg2, arg3, arg4, arg5);
}, arguments); }
export function __wbg_ellipse_59ddb84ea8ee8ce1() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7) {
    arg0.ellipse(arg1, arg2, arg3, arg4, arg5, arg6, arg7);
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
export function __wbg_error_a30e98d44009f1bb(arg0, arg1) {
    console.error(arg0, arg1);
}
export function __wbg_error_c9cf3fc2064683a9(arg0) {
    console.error(arg0);
}
export function __wbg_fillRect_0ef59adb9acb7d06(arg0, arg1, arg2, arg3, arg4) {
    arg0.fillRect(arg1, arg2, arg3, arg4);
}
export function __wbg_fillText_1bcec8b81ad73bd0() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
    arg0.fillText(getStringFromWasm0(arg1, arg2), arg3, arg4);
}, arguments); }
export function __wbg_fill_f0d54143515aa271(arg0, arg1) {
    arg0.fill(arg1);
}
export function __wbg_fill_fc5e02a06cc26e92(arg0) {
    arg0.fill();
}
export function __wbg_getContext_635e36719cad2623() { return handleError(function (arg0, arg1, arg2) {
    const ret = arg0.getContext(getStringFromWasm0(arg1, arg2));
    return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
}, arguments); }
export function __wbg_getElementById_cc94972b404e4eaa(arg0, arg1, arg2) {
    const ret = arg0.getElementById(getStringFromWasm0(arg1, arg2));
    return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
}
export function __wbg_get_with_ref_key_6412cf3094599694(arg0, arg1) {
    const ret = arg0[arg1];
    return ret;
}
export function __wbg_instanceof_ArrayBuffer_a99f175873e5d9b8(arg0) {
    let result;
    try {
        result = arg0 instanceof ArrayBuffer;
    } catch (_) {
        result = false;
    }
    const ret = result;
    return ret;
}
export function __wbg_instanceof_CanvasRenderingContext2d_769208c72dcbf5e6(arg0) {
    let result;
    try {
        result = arg0 instanceof CanvasRenderingContext2D;
    } catch (_) {
        result = false;
    }
    const ret = result;
    return ret;
}
export function __wbg_instanceof_HtmlCanvasElement_0a30c11fbbf41841(arg0) {
    let result;
    try {
        result = arg0 instanceof HTMLCanvasElement;
    } catch (_) {
        result = false;
    }
    const ret = result;
    return ret;
}
export function __wbg_instanceof_HtmlImageElement_1e066996b10acb3d(arg0) {
    let result;
    try {
        result = arg0 instanceof HTMLImageElement;
    } catch (_) {
        result = false;
    }
    const ret = result;
    return ret;
}
export function __wbg_instanceof_Object_67a83cdc00c5d141(arg0) {
    let result;
    try {
        result = arg0 instanceof Object;
    } catch (_) {
        result = false;
    }
    const ret = result;
    return ret;
}
export function __wbg_instanceof_Uint8Array_828cef2aaacafc31(arg0) {
    let result;
    try {
        result = arg0 instanceof Uint8Array;
    } catch (_) {
        result = false;
    }
    const ret = result;
    return ret;
}
export function __wbg_instanceof_Window_82d71df4eddf88bc(arg0) {
    let result;
    try {
        result = arg0 instanceof Window;
    } catch (_) {
        result = false;
    }
    const ret = result;
    return ret;
}
export function __wbg_isArray_e15a2ff68ffdbef2(arg0) {
    const ret = Array.isArray(arg0);
    return ret;
}
export function __wbg_isPrimary_bb4c000cc7c51110(arg0) {
    const ret = arg0.isPrimary;
    return ret;
}
export function __wbg_length_7f3c00c40364105e(arg0) {
    const ret = arg0.length;
    return ret;
}
export function __wbg_lineTo_59bac085a9b24af7(arg0, arg1, arg2) {
    arg0.lineTo(arg1, arg2);
}
export function __wbg_lineTo_63fac7d60279d95e(arg0, arg1, arg2) {
    arg0.lineTo(arg1, arg2);
}
export function __wbg_moveTo_037e3deefec91ae1(arg0, arg1, arg2) {
    arg0.moveTo(arg1, arg2);
}
export function __wbg_moveTo_d67728da324b2594(arg0, arg1, arg2) {
    arg0.moveTo(arg1, arg2);
}
export function __wbg_naturalWidth_c4c567dc88a9ee9a(arg0) {
    const ret = arg0.naturalWidth;
    return ret;
}
export function __wbg_new_1dbf7428bba60a42(arg0) {
    const ret = new Uint8Array(arg0);
    return ret;
}
export function __wbg_new_227d7c05414eb861() {
    const ret = new Error();
    return ret;
}
export function __wbg_new_617a8cdb8bb1130e() {
    const ret = new Object();
    return ret;
}
export function __wbg_new_a75d812182e1ebdf() { return handleError(function () {
    const ret = new Path2D();
    return ret;
}, arguments); }
export function __wbg_new_ee2291f50781bf1d() {
    const ret = new Array();
    return ret;
}
export function __wbg_offsetHeight_427aaf53442f1586(arg0) {
    const ret = arg0.offsetHeight;
    return ret;
}
export function __wbg_offsetWidth_1d736667aa04ab3a(arg0) {
    const ret = arg0.offsetWidth;
    return ret;
}
export function __wbg_offsetX_b0de594206675079(arg0) {
    const ret = arg0.offsetX;
    return ret;
}
export function __wbg_offsetY_bd621e751c6da59b(arg0) {
    const ret = arg0.offsetY;
    return ret;
}
export function __wbg_pointerId_1b91f6b6c8f92501(arg0) {
    const ret = arg0.pointerId;
    return ret;
}
export function __wbg_preventDefault_af59afb0f0a02e20(arg0) {
    arg0.preventDefault();
}
export function __wbg_prototypesetcall_bc27214492979395(arg0, arg1, arg2) {
    Uint8Array.prototype.set.call(getArrayU8FromWasm0(arg0, arg1), arg2);
}
export function __wbg_requestAnimationFrame_7b526ab7aa550c74() { return handleError(function (arg0, arg1) {
    const ret = arg0.requestAnimationFrame(arg1);
    return ret;
}, arguments); }
export function __wbg_restore_c93ba7571816b182(arg0) {
    arg0.restore();
}
export function __wbg_save_f32554f1747071d1(arg0) {
    arg0.save();
}
export function __wbg_setPointerCapture_a53e23b7bccef290() { return handleError(function (arg0, arg1) {
    arg0.setPointerCapture(arg1);
}, arguments); }
export function __wbg_setTransform_fa787a8f0adc1ade() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6) {
    arg0.setTransform(arg1, arg2, arg3, arg4, arg5, arg6);
}, arguments); }
export function __wbg_set_145a351398b48c65() { return handleError(function (arg0, arg1, arg2) {
    const ret = Reflect.set(arg0, arg1, arg2);
    return ret;
}, arguments); }
export function __wbg_set_bea140a88be9b277(arg0, arg1, arg2) {
    arg0[arg1 >>> 0] = arg2;
}
export function __wbg_set_crossOrigin_b9b1e3d0df5666f2(arg0, arg1, arg2) {
    arg0.crossOrigin = arg1 === 0 ? undefined : getStringFromWasm0(arg1, arg2);
}
export function __wbg_set_fillStyle_27f88552f4d2ab31(arg0, arg1) {
    arg0.fillStyle = arg1;
}
export function __wbg_set_font_1f60a05a2544a2ff(arg0, arg1, arg2) {
    arg0.font = getStringFromWasm0(arg1, arg2);
}
export function __wbg_set_height_c9789c1c77eaedff(arg0, arg1) {
    arg0.height = arg1 >>> 0;
}
export function __wbg_set_lineCap_c9b7bdd3b7f5ce74(arg0, arg1, arg2) {
    arg0.lineCap = getStringFromWasm0(arg1, arg2);
}
export function __wbg_set_lineJoin_c1780f2096e6f970(arg0, arg1, arg2) {
    arg0.lineJoin = getStringFromWasm0(arg1, arg2);
}
export function __wbg_set_lineWidth_cc15473552c60c9c(arg0, arg1) {
    arg0.lineWidth = arg1;
}
export function __wbg_set_src_e0fe5ef5d5c648aa(arg0, arg1, arg2) {
    arg0.src = getStringFromWasm0(arg1, arg2);
}
export function __wbg_set_strokeStyle_a36f39be93a6cebc(arg0, arg1) {
    arg0.strokeStyle = arg1;
}
export function __wbg_set_textAlign_1bda1733d57574ed(arg0, arg1, arg2) {
    arg0.textAlign = getStringFromWasm0(arg1, arg2);
}
export function __wbg_set_textBaseline_d5ba548751584f49(arg0, arg1, arg2) {
    arg0.textBaseline = getStringFromWasm0(arg1, arg2);
}
export function __wbg_set_width_b0e1267db4b196b5(arg0, arg1) {
    arg0.width = arg1 >>> 0;
}
export function __wbg_slice_6da4cdc5d543fcd0(arg0, arg1) {
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
export function __wbg_static_accessor_GLOBAL_266715b9d96ba635() {
    const ret = typeof global === 'undefined' ? null : global;
    return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
}
export function __wbg_static_accessor_GLOBAL_THIS_10fb7dc1ae063179() {
    const ret = typeof globalThis === 'undefined' ? null : globalThis;
    return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
}
export function __wbg_static_accessor_SELF_0b583911f537483a() {
    const ret = typeof self === 'undefined' ? null : self;
    return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
}
export function __wbg_static_accessor_WINDOW_d7f903d1508cbdc4() {
    const ret = typeof window === 'undefined' ? null : window;
    return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
}
export function __wbg_strokeRect_c6e73405ca787ae9(arg0, arg1, arg2, arg3, arg4) {
    arg0.strokeRect(arg1, arg2, arg3, arg4);
}
export function __wbg_strokeText_acf127bdbf1ec111() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
    arg0.strokeText(getStringFromWasm0(arg1, arg2), arg3, arg4);
}, arguments); }
export function __wbg_stroke_385d731098398489(arg0) {
    arg0.stroke();
}
export function __wbg_stroke_9ae8af85392be555(arg0, arg1) {
    arg0.stroke(arg1);
}
export function __wbindgen_generic_0000000000000001(arg0, arg1) {
    // Cast intrinsic for `Closure(Closure { owned: true, function: Function { arguments: [F64], shim_idx: 45, ret: Unit, inner_ret: Some(Unit) }, mutable: true }) -> Externref`.
    const ret = makeMutClosure(arg0, arg1, wasm_bindgen_cf9ba172f8892477___convert__closures_____invoke___f64______true_);
    return ret;
}
export function __wbindgen_generic_0000000000000002(arg0, arg1) {
    // Cast intrinsic for `Closure(Closure { owned: true, function: Function { arguments: [NamedExternref("MouseEvent")], shim_idx: 41, ret: Unit, inner_ret: Some(Unit) }, mutable: true }) -> Externref`.
    const ret = makeMutClosure(arg0, arg1, wasm_bindgen_cf9ba172f8892477___convert__closures_____invoke___web_sys_e80ecc0df794c569___features__gen_MouseEvent__MouseEvent______true_);
    return ret;
}
export function __wbindgen_generic_0000000000000003(arg0, arg1) {
    // Cast intrinsic for `Closure(Closure { owned: true, function: Function { arguments: [NamedExternref("PointerEvent")], shim_idx: 41, ret: Unit, inner_ret: Some(Unit) }, mutable: true }) -> Externref`.
    const ret = makeMutClosure(arg0, arg1, wasm_bindgen_cf9ba172f8892477___convert__closures_____invoke___web_sys_e80ecc0df794c569___features__gen_MouseEvent__MouseEvent______true__29);
    return ret;
}
export function __wbindgen_generic_0000000000000004(arg0, arg1) {
    // Cast intrinsic for `Closure(Closure { owned: true, function: Function { arguments: [NamedExternref("WheelEvent")], shim_idx: 41, ret: Unit, inner_ret: Some(Unit) }, mutable: true }) -> Externref`.
    const ret = makeMutClosure(arg0, arg1, wasm_bindgen_cf9ba172f8892477___convert__closures_____invoke___web_sys_e80ecc0df794c569___features__gen_MouseEvent__MouseEvent______true__30);
    return ret;
}
export function __wbindgen_generic_0000000000000005(arg0, arg1) {
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
function wasm_bindgen_cf9ba172f8892477___convert__closures_____invoke___web_sys_e80ecc0df794c569___features__gen_MouseEvent__MouseEvent______true_(arg0, arg1, arg2) {
    wasm.wasm_bindgen_cf9ba172f8892477___convert__closures_____invoke___web_sys_e80ecc0df794c569___features__gen_MouseEvent__MouseEvent______true_(arg0, arg1, arg2);
}

function wasm_bindgen_cf9ba172f8892477___convert__closures_____invoke___web_sys_e80ecc0df794c569___features__gen_MouseEvent__MouseEvent______true__29(arg0, arg1, arg2) {
    wasm.wasm_bindgen_cf9ba172f8892477___convert__closures_____invoke___web_sys_e80ecc0df794c569___features__gen_MouseEvent__MouseEvent______true__29(arg0, arg1, arg2);
}

function wasm_bindgen_cf9ba172f8892477___convert__closures_____invoke___web_sys_e80ecc0df794c569___features__gen_MouseEvent__MouseEvent______true__30(arg0, arg1, arg2) {
    wasm.wasm_bindgen_cf9ba172f8892477___convert__closures_____invoke___web_sys_e80ecc0df794c569___features__gen_MouseEvent__MouseEvent______true__30(arg0, arg1, arg2);
}

function wasm_bindgen_cf9ba172f8892477___convert__closures_____invoke___f64______true_(arg0, arg1, arg2) {
    wasm.wasm_bindgen_cf9ba172f8892477___convert__closures_____invoke___f64______true_(arg0, arg1, arg2);
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
