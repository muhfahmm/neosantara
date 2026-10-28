P = 'apps/src/app/page/map_system/map-data-rs/src/map.rs'
code = open(P, 'r', encoding='utf-8').read()

# 1. Tambahkan field show_province_borders: bool ke MapEngine
old_engine_struct = "    cached_selected_fill: Option<JsValue>,"
new_engine_struct = "    cached_selected_fill: Option<JsValue>,\n    show_province_borders: bool,"
assert old_engine_struct in code, "old_engine_struct not found"
code = code.replace(old_engine_struct, new_engine_struct, 1)

# In MapEngine::new:
old_engine_init = "            cached_selected_fill: None,"
new_engine_init = "            cached_selected_fill: None,\n            show_province_borders: true,"
assert old_engine_init in code, "old_engine_init not found"
code = code.replace(old_engine_init, new_engine_init, 1)

# In render loop:
old_render_prov = "if self.scale >= 1.15 && !self.province_lines.is_empty() {"
new_render_prov = "if self.show_province_borders && self.scale >= 1.15 && !self.province_lines.is_empty() {"
assert old_render_prov in code, "old_render_prov not found"
code = code.replace(old_render_prov, new_render_prov, 1)

# Add method & wasm export:
new_method = """    pub fn set_show_province_borders(&mut self, show: bool) {
        if self.show_province_borders != show {
            self.show_province_borders = show;
            self.dirty = true;
        }
    }
"""
assert "    pub fn set_horizontal_wrap(&mut self, enabled: bool) {" in code
code = code.replace("    pub fn set_horizontal_wrap(&mut self, enabled: bool) {", new_method + "\n    pub fn set_horizontal_wrap(&mut self, enabled: bool) {", 1)

new_export = """#[wasm_bindgen]
pub fn set_show_province_borders_on_map(show: bool) {
    ACTIVE_ENGINE.with(|global_engine| {
        if let Some(engine) = global_engine.borrow().as_ref() {
            engine.borrow_mut().set_show_province_borders(show);
        }
    });
}
"""
assert "#[wasm_bindgen]\npub fn set_map_horizontal_wrap(enabled: bool) {" in code
code = code.replace("#[wasm_bindgen]\npub fn set_map_horizontal_wrap(enabled: bool) {", new_export + "\n#[wasm_bindgen]\npub fn set_map_horizontal_wrap(enabled: bool) {", 1)

open(P, 'w', encoding='utf-8').write(code)
print("Berhasil menambahkan kontrol show_province_borders ke map.rs!")

