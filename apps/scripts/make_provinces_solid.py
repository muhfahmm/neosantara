P = 'apps/src/app/page/map_system/map-data-rs/src/map.rs'
code = open(P, 'r', encoding='utf-8').read()

old_draw = '''            // Garis batas provinsi: viewport culling per garis + LOD + tanpa dash saat kamera bergerak
            if self.scale >= 1.15 && !self.province_lines.is_empty() {
                let moving = self.is_panning || animating;
                let coarse = self.scale < 4.0 || moving;
                let min_screen = 1.0 / self.scale;
                if !moving {
                    let dl = (3.5 / self.scale).clamp(1.5, 4.0);
                    let dash_array = js_sys::Array::new();
                    dash_array.push(&JsValue::from_f64(dl));
                    dash_array.push(&JsValue::from_f64(dl));
                    let _ = self.ctx.set_line_dash(&dash_array);
                }
                self.ctx.set_stroke_style(&self.styles.province_stroke);
                self.ctx.set_line_width((0.6 / self.scale).clamp(0.2, 0.8));
                for pl in &self.province_lines {
                    if !bbox_hits(&pl.bbox, vx0, vy0, vx1, vy1) {
                        continue;
                    }
                    if (pl.bbox[2] - pl.bbox[0]).max(pl.bbox[3] - pl.bbox[1]) < min_screen {
                        continue;
                    }
                    if let Some(p) = pl.path(coarse) {
                        self.ctx.stroke_with_path(&p);
                    }
                }
                if !moving {
                    let _ = self.ctx.set_line_dash(&js_sys::Array::new());
                }
            }'''

new_draw = '''            // Garis batas provinsi solid (tidak putus-putus) langsung tersambung mulus
            if self.scale >= 1.15 && !self.province_lines.is_empty() {
                let moving = self.is_panning || animating;
                let coarse = self.scale < 4.0 || moving;
                let min_screen = 1.0 / self.scale;
                self.ctx.set_stroke_style(&self.styles.province_stroke);
                self.ctx.set_line_width((0.65 / self.scale).clamp(0.25, 0.9));
                for pl in &self.province_lines {
                    if !bbox_hits(&pl.bbox, vx0, vy0, vx1, vy1) {
                        continue;
                    }
                    if (pl.bbox[2] - pl.bbox[0]).max(pl.bbox[3] - pl.bbox[1]) < min_screen {
                        continue;
                    }
                    if let Some(p) = pl.path(coarse) {
                        self.ctx.stroke_with_path(&p);
                    }
                }
            }'''

assert old_draw in code, "old_draw block not found"
code = code.replace(old_draw, new_draw, 1)

# Tingkatkan sedikit opasitas province_stroke agar terlihat jelas tersambung seperti perbatasan negara tapi dengan hirarki visual yang pas
old_style = 'province_stroke: JsValue::from_str("rgba(255, 255, 255, 0.45)"),'
new_style = 'province_stroke: JsValue::from_str("rgba(255, 255, 255, 0.55)"),'
if old_style in code:
    code = code.replace(old_style, new_style, 1)

open(P, 'w', encoding='utf-8').write(code)
print("Berhasil mengubah batas provinsi menjadi garis solid tersambung!")

