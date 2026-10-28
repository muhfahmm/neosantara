with open('apps/src/app/page/map_system/map-data-rs/src/map.rs', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Styles
old_styles_struct = """struct Styles {
    bg: JsValue,
    sel_fill: JsValue,
    sel_stroke: JsValue,
    stroke: JsValue,
    white: JsValue,
    flag_bg: JsValue,
    flag_text: JsValue,
    label_outline: JsValue,
}"""

new_styles_struct = """struct Styles {
    bg: JsValue,
    sel_fill: JsValue,
    sel_stroke: JsValue,
    stroke: JsValue,
    province_stroke: JsValue,
    white: JsValue,
    flag_bg: JsValue,
    flag_text: JsValue,
    label_outline: JsValue,
}"""
assert old_styles_struct in code, "styles struct not found"
code = code.replace(old_styles_struct, new_styles_struct, 1)

# In Styles init:
old_styles_init = """                sel_stroke: JsValue::from_str("#34d399"),
                stroke: JsValue::from_str("rgba(255, 255, 255, 0.75)"),
                white: JsValue::from_str("white"),"""

new_styles_init = """                sel_stroke: JsValue::from_str("#34d399"),
                stroke: JsValue::from_str("rgba(255, 255, 255, 0.75)"),
                province_stroke: JsValue::from_str("rgba(255, 255, 255, 0.45)"),
                white: JsValue::from_str("white"),"""
assert old_styles_init in code, "styles init not found"
code = code.replace(old_styles_init, new_styles_init, 1)

# 2. Add cached_provinces_path to MapEngine struct
old_struct_field = """    capitals: Vec<CachedCapital>,
    capital_flags: Vec<(String, HtmlImageElement)>,"""

new_struct_field = """    capitals: Vec<CachedCapital>,
    capital_flags: Vec<(String, HtmlImageElement)>,
    cached_provinces_path: Option<Path2d>,"""
assert old_struct_field in code, "struct field not found"
code = code.replace(old_struct_field, new_struct_field, 1)

# In MapEngine::new fields init:
old_init_field = """            capitals: Vec::new(),
            capital_flags: Vec::new(),"""

new_init_field = """            capitals: Vec::new(),
            capital_flags: Vec::new(),
            cached_provinces_path: None,"""
assert old_init_field in code, "init field not found"
code = code.replace(old_init_field, new_init_field, 1)

# 3. Add set_provinces_data method
set_prov_method = """    pub fn set_provinces_data(&mut self, geojson_str: &str) {
        let Ok(GeoJson::FeatureCollection(fc)) = geojson_str.parse::<GeoJson>() else {
            return;
        };
        let (w, h) = (self.width, self.height);
        let proj = |c: &[f64]| -> (f64, f64) {
            (((c[0] + 180.0) / 360.0) * w, ((90.0 - c[1]) / 180.0) * h)
        };
        let path = match Path2d::new() {
            Ok(p) => p,
            Err(_) => return,
        };
        for feat in fc.features {
            let Some(geom) = feat.geometry else { continue; };
            match geom.value {
                Value::LineString(line) => {
                    let mut first = true;
                    for pt in line {
                        if pt.len() < 2 { continue; }
                        let (x, y) = proj(&pt);
                        if first {
                            path.move_to(x, y);
                            first = false;
                        } else {
                            path.line_to(x, y);
                        }
                    }
                }
                Value::MultiLineString(lines) => {
                    for line in lines {
                        let mut first = true;
                        for pt in line {
                            if pt.len() < 2 { continue; }
                            let (x, y) = proj(&pt);
                            if first {
                                path.move_to(x, y);
                                first = false;
                            } else {
                                path.line_to(x, y);
                            }
                        }
                    }
                }
                _ => {}
            }
        }
        self.cached_provinces_path = Some(path);
        self.dirty = true;
    }
"""
code = code.replace("    pub fn set_data(&mut self, geojson_str: &str) {", set_prov_method + "\n    pub fn set_data(&mut self, geojson_str: &str) {", 1)

# 4. Draw dashed province borders in render loop
draw_provinces_call = """            // Garis batas antar-provinsi putus-putus (dashed border) saat zoom >= 1.5
            if self.scale >= 1.5 {
                if let Some(prov_path) = &self.cached_provinces_path {
                    let dash_array = js_sys::Array::new();
                    dash_array.push(&JsValue::from_f64((3.5 / self.scale).clamp(1.5, 4.0)));
                    dash_array.push(&JsValue::from_f64((3.5 / self.scale).clamp(1.5, 4.0)));
                    let _ = self.ctx.set_line_dash(&dash_array);
                    self.ctx.set_stroke_style(&self.styles.province_stroke);
                    self.ctx.set_line_width((0.6 / self.scale).clamp(0.2, 0.8));
                    self.ctx.stroke_with_path(prov_path);
                    let empty_dash = js_sys::Array::new();
                    let _ = self.ctx.set_line_dash(&empty_dash);
                }
            }
"""
code = code.replace("            self.draw_capitals(vx0, vy0, vx1, vy1, true, animating);", draw_provinces_call + "            self.draw_capitals(vx0, vy0, vx1, vy1, true, animating);", 1)

# 5. Export set_provinces_on_map
export_func = """#[wasm_bindgen]
pub fn set_provinces_on_map(provinces_geojson: String) {
    ACTIVE_ENGINE.with(|global_engine| {
        if let Some(engine) = global_engine.borrow().as_ref() {
            engine.borrow_mut().set_provinces_data(&provinces_geojson);
        }
    });
}
"""
code = code.replace("#[wasm_bindgen]\npub fn set_capitals_on_map(capitals: Vec<JsValue>) {", export_func + "\n#[wasm_bindgen]\npub fn set_capitals_on_map(capitals: Vec<JsValue>) {", 1)

with open('apps/src/app/page/map_system/map-data-rs/src/map.rs', 'w', encoding='utf-8') as f:
    f.write(code)

print("Berhasil menambahkan batas provinsi putus-putus ke map.rs!")

