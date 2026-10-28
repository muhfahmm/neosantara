import re

P = 'apps/src/app/page/map_system/map-data-rs/src/map.rs'
code = open(P, 'r', encoding='utf-8').read()

# 1. Struct ProvLine + helper
prov_struct = '''/// Satu garis batas provinsi: titik sudah diproyeksi + bbox untuk viewport culling + path cache per LOD.
struct ProvLine {
    pts: Vec<(f64, f64)>,
    bbox: [f64; 4],
    coarse: Option<Path2d>,
    fine: RefCell<Option<Path2d>>,
}

impl ProvLine {
    fn path(&self, coarse: bool) -> Option<Path2d> {
        if coarse {
            return self.coarse.clone();
        }
        let mut fine = self.fine.borrow_mut();
        if fine.is_none() {
            *fine = build_line_path(&self.pts, 0.004);
        }
        fine.clone()
    }
}

fn build_line_path(pts: &[(f64, f64)], min_distance: f64) -> Option<Path2d> {
    let path = Path2d::new().ok()?;
    let (fx, fy) = *pts.first()?;
    path.move_to(fx, fy);
    let (mut lx, mut ly) = (fx, fy);
    let last = pts.len() - 1;
    for (i, &(x, y)) in pts.iter().enumerate().skip(1) {
        if i == last || (x - lx).abs() >= min_distance || (y - ly).abs() >= min_distance {
            path.line_to(x, y);
            lx = x;
            ly = y;
        }
    }
    Some(path)
}

struct FillBatch {'''
assert 'struct FillBatch {' in code
code = code.replace('struct FillBatch {', prov_struct, 1)

# 2. field + init
assert '    cached_provinces_path: Option<Path2d>,' in code
code = code.replace('    cached_provinces_path: Option<Path2d>,', '    province_lines: Vec<ProvLine>,', 1)
assert '            cached_provinces_path: None,' in code
code = code.replace('            cached_provinces_path: None,', '            province_lines: Vec::new(),', 1)

# 3. set_provinces_data baru
new_fn = '''    pub fn set_provinces_data(&mut self, geojson_str: &str) {
        let Ok(GeoJson::FeatureCollection(fc)) = geojson_str.parse::<GeoJson>() else {
            return;
        };
        let (w, h) = (self.width, self.height);
        let proj = |c: &[f64]| -> (f64, f64) {
            (((c[0] + 180.0) / 360.0) * w, ((90.0 - c[1]) / 180.0) * h)
        };
        let mut lines: Vec<ProvLine> = Vec::new();
        let mut push_line = |raw: &[Vec<f64>]| {
            let pts: Vec<(f64, f64)> = raw.iter().filter(|p| p.len() >= 2).map(|p| proj(p)).collect();
            if pts.len() < 2 {
                return;
            }
            let mut bbox = bbox_empty();
            for &(x, y) in &pts {
                bbox[0] = bbox[0].min(x);
                bbox[1] = bbox[1].min(y);
                bbox[2] = bbox[2].max(x);
                bbox[3] = bbox[3].max(y);
            }
            let coarse = build_line_path(&pts, 0.25);
            lines.push(ProvLine { pts, bbox, coarse, fine: RefCell::new(None) });
        };
        for feat in fc.features {
            let Some(geom) = feat.geometry else { continue; };
            match geom.value {
                Value::LineString(line) => push_line(&line),
                Value::MultiLineString(ls) => {
                    for line in ls {
                        push_line(&line);
                    }
                }
                _ => {}
            }
        }
        self.province_lines = lines;
        self.dirty = true;
    }

'''
m = re.search(r'    pub fn set_provinces_data\(.*?\n    \}\n\n(?=    pub fn set_data)', code, re.S)
assert m, 'set_provinces_data not found'
code = code[:m.start()] + new_fn + code[m.end():]

# 4. blok render provinsi
draw_new = '''            // Garis batas provinsi: viewport culling per garis + LOD + tanpa dash saat kamera bergerak
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
            }
'''
m = re.search(r'            // Garis batas antar-provinsi putus-putus.*?\n(?=            self\.draw_capitals\(vx0, vy0, vx1, vy1, true, animating\);)', code, re.S)
assert m, 'draw block not found'
code = code[:m.start()] + draw_new + code[m.end():]

# 5. LOD level 2 negara: buang titik < ~0.15px pada zoom maksimum (tak terlihat)
old = '                _ => 0.0,'
assert old in code
code = code.replace(old, '                _ => 0.003,', 1)

open(P, 'w', encoding='utf-8').write(code)
print('OK')

