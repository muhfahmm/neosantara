with open('apps/src/app/page/map_system/map-data-rs/src/map.rs', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Optimalisasi Level of Detail agar presisi 100% tanpa titik yang dipangkas
old_lods = """            let min_distance = match level {
                0 => 0.6,
                1 => 0.15,
                _ => 0.012,
            };"""
new_lods = """            let min_distance = match level {
                0 => 0.18,
                1 => 0.02,
                _ => 0.0,
            };"""
assert old_lods in text, "old_lods not found"
text = text.replace(old_lods, new_lods, 1)

# 2. Tingkatkan resolusi raster map cache dari 2.0x menjadi 3.0x untuk ketajaman tinggi di zoom out
old_raster = "const RASTER_SCALE: f64 = 2.0;"
new_raster = "const RASTER_SCALE: f64 = 3.0;"
assert old_raster in text, "old_raster not found"
text = text.replace(old_raster, new_raster, 1)

# 3. Di trace_feature, jangan buang pulau atau teluk kecil (pertahankan pantai riil)
old_trace = """        let min_d = 0.6 / self.scale;
        for poly in &f.polys {
            for ring in poly {
                let b = &ring.bbox;
                if (b[2] - b[0]) < min_d * 1.5 && (b[3] - b[1]) < min_d * 1.5 {
                    continue;
                }
                if !bbox_hits(b, vx0, vy0, vx1, vy1) {
                    continue;
                }
                let (mut lx, mut ly) = (0.0, 0.0);
                for (i, &(x, y)) in ring.pts.iter().enumerate() {
                    if i == 0 {
                        self.ctx.move_to(x, y);
                        lx = x;
                        ly = y;
                    } else if (x - lx).abs() >= min_d || (y - ly).abs() >= min_d {
                        self.ctx.line_to(x, y);
                        lx = x;
                        ly = y;
                    }
                }
                self.ctx.close_path();
            }
        }"""

new_trace = """        let min_d = 0.06 / self.scale;
        for poly in &f.polys {
            for ring in poly {
                let b = &ring.bbox;
                if !bbox_hits(b, vx0, vy0, vx1, vy1) {
                    continue;
                }
                let (mut lx, mut ly) = (0.0, 0.0);
                for (i, &(x, y)) in ring.pts.iter().enumerate() {
                    if i == 0 {
                        self.ctx.move_to(x, y);
                        lx = x;
                        ly = y;
                    } else if min_d == 0.0 || (x - lx).abs() >= min_d || (y - ly).abs() >= min_d {
                        self.ctx.line_to(x, y);
                        lx = x;
                        ly = y;
                    }
                }
                self.ctx.close_path();
            }
        }"""
assert old_trace in text, "old_trace not found"
text = text.replace(old_trace, new_trace, 1)

# 4. Batas negara dan lautan lebih kontras dan tajam
old_styles = """                bg: JsValue::from_str("#1e3a8a"),
                sel_fill: JsValue::from_str("#00FFAA"),
                sel_stroke: JsValue::from_str("#34d399"),
                stroke: JsValue::from_str("rgba(255, 255, 255, 0.6)"),"""

new_styles = """                bg: JsValue::from_str("#0f244a"),
                sel_fill: JsValue::from_str("#00FFAA"),
                sel_stroke: JsValue::from_str("#34d399"),
                stroke: JsValue::from_str("rgba(255, 255, 255, 0.75)"),"""
assert old_styles in text, "old_styles not found"
text = text.replace(old_styles, new_styles, 1)

with open('apps/src/app/page/map_system/map-data-rs/src/map.rs', 'w', encoding='utf-8') as f:
    f.write(text)

print("Berhasil mengoptimalkan map.rs")

