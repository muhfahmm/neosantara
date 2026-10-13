use wasm_bindgen::prelude::*;
use wasm_bindgen::JsCast;
use web_sys::{CanvasRenderingContext2d, HtmlCanvasElement, HtmlImageElement, PointerEvent, WheelEvent};
use serde::Deserialize;
use geojson::{GeoJson, Value};
use std::rc::Rc;
use std::cell::RefCell;

#[derive(Deserialize)]
struct CountryData {
    iso: String,
    latitude: Option<f64>,
    longitude: Option<f64>,
}

#[derive(Deserialize)]
struct CapitalData {
    capital: String,
    lat: f64,
    lng: f64,
    iso: String,
}

/// Cincin poligon yang sudah diproyeksikan + bounding box (koordinat dunia 0..width/height).
struct Ring {
    pts: Vec<(f64, f64)>,
    bbox: [f64; 4], // min_x, min_y, max_x, max_y
}

/// Feature yang di-cache: titik sudah diproyeksi, bbox, iso & warna sudah dihitung sekali.
struct CachedFeature {
    polys: Vec<Vec<Ring>>,
    bbox: [f64; 4],
    iso: String, // lowercase
    fill: JsValue,
}

struct CachedCountry {
    iso: String, // lowercase
    lat: Option<f64>,
    lng: Option<f64>,
    raw: JsValue,
}

struct CachedCapital {
    name: String,
    x: f64,
    y: f64,
    flag_iso: String,
    flag_idx: Option<usize>,
}

struct Styles {
    bg: JsValue,
    sel_fill: JsValue,
    sel_stroke: JsValue,
    stroke: JsValue,
    white: JsValue,
    flag_bg: JsValue,
    flag_text: JsValue,
    label_outline: JsValue,
}

fn continent_color(continent: &str) -> &'static str {
    match continent {
        "Asia" => "#a855f7", "Africa" => "#eab308", "Europe" => "#3b82f6",
        "North America" => "#22c55e", "South America" => "#f97316",
        "Oceania" => "#ec4899", "Antarctica" => "#cbd5e1", _ => "#475569",
    }
}

fn bbox_empty() -> [f64; 4] {
    [f64::MAX, f64::MAX, f64::MIN, f64::MIN]
}

fn bbox_hits(b: &[f64; 4], x0: f64, y0: f64, x1: f64, y1: f64) -> bool {
    !(b[2] < x0 || b[0] > x1 || b[3] < y0 || b[1] > y1)
}

fn point_in_ring(ring: &[(f64, f64)], x: f64, y: f64) -> bool {
    if ring.len() < 3 { return false; }
    let mut inside = false;
    let mut j = ring.len() - 1;
    for i in 0..ring.len() {
        let (xi, yi) = ring[i];
        let (xj, yj) = ring[j];
        if ((yi > y) != (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi) {
            inside = !inside;
        }
        j = i;
    }
    inside
}

#[wasm_bindgen]
pub struct MapEngine {
    ctx: CanvasRenderingContext2d,
    width: f64,
    height: f64,
    scale: f64,
    offset_x: f64,
    offset_y: f64,
    features: Vec<CachedFeature>,
    countries: Vec<CachedCountry>,
    capitals: Vec<CachedCapital>,
    capital_flags: Vec<(String, HtmlImageElement)>,
    styles: Styles,
    selected_country_iso: Option<String>,
    selected_lower: Option<String>,
    horizontal_wrap: bool,
    is_panning: bool,
    active_pointer_id: Option<i32>,
    last_mouse_x: f64,
    last_mouse_y: f64,
    target_offset_x: f64,
    target_offset_y: f64,
    target_scale: f64,
    // --- Optimasi render ---
    dirty: bool,
    last_render_ms: f64,
    frame_counter: u32,
    flags_ready: usize,
}

#[wasm_bindgen]
impl MapEngine {
    pub fn new(ctx: CanvasRenderingContext2d, width: f64, height: f64) -> MapEngine {
        MapEngine {
            ctx,
            width,
            height,
            scale: 1.0,
            offset_x: 0.0,
            offset_y: 0.0,
            features: Vec::new(),
            countries: Vec::new(),
            capitals: Vec::new(),
            capital_flags: Vec::new(),
            styles: Styles {
                bg: JsValue::from_str("#1e3a8a"),
                sel_fill: JsValue::from_str("#10b981"),
                sel_stroke: JsValue::from_str("#34d399"),
                stroke: JsValue::from_str("rgba(255, 255, 255, 0.6)"),
                white: JsValue::from_str("white"),
                flag_bg: JsValue::from_str("#0f172a"),
                flag_text: JsValue::from_str("#fbbf24"),
                label_outline: JsValue::from_str("rgba(0, 0, 0, 0.85)"),
            },
            selected_country_iso: None,
            selected_lower: None,
            horizontal_wrap: false,
            is_panning: false,
            active_pointer_id: None,
            last_mouse_x: 0.0,
            last_mouse_y: 0.0,
            target_offset_x: 0.0,
            target_offset_y: 0.0,
            target_scale: 1.0,
            dirty: true,
            last_render_ms: 0.0,
            frame_counter: 0,
            flags_ready: 0,
        }
    }

    /// Parse GeoJSON sekali, proyeksikan semua titik & hitung bbox (cache).
    pub fn set_data(&mut self, geojson_str: &str) {
        let Ok(GeoJson::FeatureCollection(fc)) = geojson_str.parse::<GeoJson>() else { return };
        let (w, h) = (self.width, self.height);
        let proj = |c: &Vec<f64>| -> (f64, f64) {
            (((c[0] + 180.0) / 360.0) * w, ((90.0 - c[1]) / 180.0) * h)
        };
        let build_poly = |poly: &Vec<Vec<Vec<f64>>>, fbox: &mut [f64; 4]| -> Vec<Ring> {
            let mut rings = Vec::new();
            for ring in poly {
                if ring.len() < 2 { continue; }
                let mut bbox = bbox_empty();
                let pts: Vec<(f64, f64)> = ring.iter().filter(|c| c.len() >= 2).map(|c| {
                    let p = proj(c);
                    bbox[0] = bbox[0].min(p.0); bbox[1] = bbox[1].min(p.1);
                    bbox[2] = bbox[2].max(p.0); bbox[3] = bbox[3].max(p.1);
                    p
                }).collect();
                if pts.len() < 2 { continue; }
                fbox[0] = fbox[0].min(bbox[0]); fbox[1] = fbox[1].min(bbox[1]);
                fbox[2] = fbox[2].max(bbox[2]); fbox[3] = fbox[3].max(bbox[3]);
                rings.push(Ring { pts, bbox });
            }
            rings
        };

        let mut out = Vec::with_capacity(fc.features.len());
        for feature in &fc.features {
            let props = feature.properties.as_ref();
            let continent = props.and_then(|p| p.get("CONTINENT")).and_then(|v| v.as_str()).unwrap_or("Unknown");
            let iso = props.and_then(|p| p.get("ISO_A2")).and_then(|v| v.as_str()).unwrap_or("").to_lowercase();
            let mut fbox = bbox_empty();
            let mut polys = Vec::new();
            if let Some(ref g) = feature.geometry {
                match &g.value {
                    Value::Polygon(p) => polys.push(build_poly(p, &mut fbox)),
                    Value::MultiPolygon(m) => {
                        for p in m { polys.push(build_poly(p, &mut fbox)); }
                    }
                    _ => {}
                }
            }
            if polys.is_empty() { continue; }
            out.push(CachedFeature {
                polys,
                bbox: fbox,
                iso,
                fill: JsValue::from_str(continent_color(continent)),
            });
        }
        self.features = out;
        self.dirty = true;
    }

    pub fn set_countries(&mut self, countries: Vec<JsValue>) {
        self.countries = countries.into_iter().filter_map(|js| {
            let c = serde_wasm_bindgen::from_value::<CountryData>(js.clone()).ok()?;
            Some(CachedCountry { iso: c.iso.to_lowercase(), lat: c.latitude, lng: c.longitude, raw: js })
        }).collect();
    }

    pub fn set_capitals(&mut self, capitals: Vec<JsValue>) {
        let mut parsed: Vec<CapitalData> = Vec::new();
        for js in &capitals {
            if let Ok(c) = serde_wasm_bindgen::from_value::<CapitalData>(js.clone()) {
                parsed.push(c);
            }
        }

        if let Some(document) = web_sys::window().and_then(|window| window.document()) {
            for capital in &parsed {
                let iso = capital.iso.rsplit('-').next().unwrap_or(&capital.iso).to_lowercase();
                if iso.len() != 2 || self.capital_flags.iter().any(|(loaded_iso, _)| loaded_iso == &iso) {
                    continue;
                }
                if let Ok(element) = document.create_element("img") {
                    if let Ok(image) = element.dyn_into::<HtmlImageElement>() {
                        image.set_cross_origin(Some("anonymous"));
                        image.set_src(&format!("https://flagcdn.com/w20/{iso}.png"));
                        self.capital_flags.push((iso, image));
                    }
                }
            }
        }

        let (w, h) = (self.width, self.height);
        self.capitals = parsed.into_iter().map(|c| {
            let flag_iso = c.iso.rsplit('-').next().unwrap_or(&c.iso).to_string();
            let flag_idx = self.capital_flags.iter().position(|(i, _)| i == &flag_iso.to_lowercase());
            CachedCapital {
                name: c.capital,
                x: ((c.lng + 180.0) / 360.0) * w,
                y: ((90.0 - c.lat) / 180.0) * h,
                flag_iso,
                flag_idx,
            }
        }).collect();
        self.dirty = true;
    }

    pub fn handle_wheel(&mut self, delta_y: f64, mouse_x: f64, mouse_y: f64) {
        let zoom_speed = 0.001;
        let factor = 1.0 - delta_y * zoom_speed;
        let new_scale = (self.scale * factor).clamp(1.0, 50.0);
        let actual_factor = new_scale / self.scale;
        self.offset_x = mouse_x - (mouse_x - self.offset_x) * actual_factor;
        self.offset_y = mouse_y - (mouse_y - self.offset_y) * actual_factor;
        self.scale = new_scale;
        self.target_scale = new_scale;
        self.target_offset_x = self.offset_x;
        self.target_offset_y = self.offset_y;
        self.apply_clamping();
        self.dirty = true;
    }

    pub fn handle_mouse_down(&mut self, x: f64, y: f64, pointer_id: i32) {
        self.is_panning = true;
        self.active_pointer_id = Some(pointer_id);
        self.last_mouse_x = x;
        self.last_mouse_y = y;
    }

    pub fn handle_mouse_move(&mut self, x: f64, y: f64, buttons: u16, pointer_id: i32) {
        if self.active_pointer_id != Some(pointer_id) {
            return;
        }

        if buttons == 0 {
            self.handle_mouse_up();
            return;
        }

        if self.is_panning {
            self.offset_x += x - self.last_mouse_x;
            self.offset_y += y - self.last_mouse_y;
            self.last_mouse_x = x;
            self.last_mouse_y = y;

            // Sync targets immediately to stop any active lerping
            self.target_offset_x = self.offset_x;
            self.target_offset_y = self.offset_y;
            self.target_scale = self.scale;

            self.apply_clamping();
            self.dirty = true;
        }
    }

    pub fn handle_mouse_up(&mut self) {
        self.is_panning = false;
        self.active_pointer_id = None;
    }

    pub fn set_selected_country(&mut self, iso: Option<String>, should_center: bool) {
        self.selected_lower = iso.as_ref().map(|s| s.to_lowercase());
        self.selected_country_iso = iso;
        self.dirty = true;

        if let Some(iso_val) = self.selected_lower.clone() {
            if should_center {
                let found = self.countries.iter().find(|c| c.iso == iso_val)
                    .and_then(|c| c.lat.zip(c.lng));
                if let Some((lat, lng)) = found {
                    let (px, py) = self.project(lng, lat);

                    let new_scale = 4.0f64.max(self.scale);
                    self.target_scale = new_scale;

                    let world_width = self.width * new_scale;
                    let world_copy = if self.horizontal_wrap {
                        ((self.width / 2.0 - self.offset_x - px * new_scale) / world_width).round()
                    } else {
                        0.0
                    };
                    self.target_offset_x =
                        (self.width / 2.0) - ((px + world_copy * self.width) * new_scale);
                    self.target_offset_y = (self.height / 2.0) - (py * new_scale);
                }
            }
        }
    }

    pub fn get_menu_options(&self) -> JsValue {
        let options = vec!["Mulai Simulasi", "Lanjutkan", "Pengaturan", "Keluar"];
        serde_wasm_bindgen::to_value(&options).unwrap()
    }

    pub fn set_horizontal_wrap(&mut self, enabled: bool) {
        self.horizontal_wrap = enabled;
        self.apply_clamping();
        self.dirty = true;
    }

    fn apply_clamping(&mut self) {
        if self.scale <= 1.0 {
            if !self.horizontal_wrap {
                self.offset_x = 0.0;
            }
            self.offset_y = 0.0;
        } else {
            if !self.horizontal_wrap {
                let min_x = self.width * (1.0 - self.scale);
                self.offset_x = self.offset_x.clamp(min_x, 0.0);
            }
            let min_y = self.height * (1.0 - self.scale);
            self.offset_y = self.offset_y.clamp(min_y, 0.0);
        }
    }

    /// Mengembalikan true jika kamera bergerak (butuh render ulang).
    fn update_camera(&mut self) -> bool {
        let ds = self.target_scale - self.scale;
        let dx = self.target_offset_x - self.offset_x;
        let dy = self.target_offset_y - self.offset_y;
        if ds == 0.0 && dx == 0.0 && dy == 0.0 {
            return false;
        }

        if ds.abs() < 0.001 && dx.abs() < 0.2 && dy.abs() < 0.2 {
            // Snap: hentikan lerp agar loop bisa idle
            self.scale = self.target_scale;
            self.offset_x = self.target_offset_x;
            self.offset_y = self.target_offset_y;
            self.apply_clamping();
            self.target_offset_x = self.offset_x;
            self.target_offset_y = self.offset_y;
            return true;
        }

        let lerp_factor = 0.1;
        self.scale += ds * lerp_factor;
        self.offset_x += dx * lerp_factor;
        self.offset_y += dy * lerp_factor;
        self.apply_clamping();
        true
    }

    /// Dipanggil dari requestAnimationFrame. Throttle ke ~30 FPS saat pan.
    pub fn tick(&mut self, now_ms: f64) {
        if self.is_panning && now_ms - self.last_render_ms < 30.0 {
            return;
        }
        self.last_render_ms = now_ms;
        self.render();
    }

    pub fn render(&mut self) {
        let animating = self.update_camera();

        // Bendera yang selesai dimuat -> render ulang (dicek tiap 20 frame saja)
        self.frame_counter = self.frame_counter.wrapping_add(1);
        if self.frame_counter % 20 == 0 {
            let ready = self.capital_flags.iter().filter(|(_, i)| i.complete() && i.natural_width() > 0).count();
            if ready != self.flags_ready {
                self.flags_ready = ready;
                self.dirty = true;
            }
        }

        if !self.dirty && !animating {
            return; // Idle: tidak ada yang digambar
        }
        self.dirty = false;

        let _ = self.ctx.set_transform(1.0, 0.0, 0.0, 1.0, 0.0, 0.0);
        self.ctx.set_fill_style(&self.styles.bg);
        self.ctx.fill_rect(0.0, 0.0, self.width, self.height);

        let world_w = self.width * self.scale;
        let first_copy = if self.horizontal_wrap { (-self.offset_x / world_w).floor() as i32 } else { 0 };
        let last_copy = if self.horizontal_wrap {
            ((self.width - self.offset_x) / world_w).ceil() as i32 - 1
        } else { 0 };

        let mut visible: Vec<usize> = Vec::with_capacity(self.features.len());
        for world_copy in first_copy..=last_copy {
            let copy_offset_x = self.offset_x + world_copy as f64 * world_w;
            let _ = self.ctx.set_transform(self.scale, 0.0, 0.0, self.scale, copy_offset_x, self.offset_y);

            // Viewport dalam koordinat dunia (viewport culling)
            let vx0 = -copy_offset_x / self.scale;
            let vx1 = (self.width - copy_offset_x) / self.scale;
            let vy0 = -self.offset_y / self.scale;
            let vy1 = (self.height - self.offset_y) / self.scale;

            visible.clear();
            for (i, f) in self.features.iter().enumerate() {
                if bbox_hits(&f.bbox, vx0, vy0, vx1, vy1) { visible.push(i); }
            }

            let sel = self.selected_lower.as_deref();
            let is_sel = |f: &CachedFeature| sel.map_or(false, |s| !f.iso.is_empty() && f.iso == s);

            // Fill
            for &i in &visible {
                let f = &self.features[i];
                self.ctx.set_fill_style(if is_sel(f) { &self.styles.sel_fill } else { &f.fill });
                self.ctx.begin_path();
                self.trace_feature(f, vx0, vy0, vx1, vy1);
                self.ctx.fill();
            }

            // Stroke: satu path batch untuk semua negara biasa, lalu yang terpilih
            self.ctx.set_stroke_style(&self.styles.stroke);
            self.ctx.set_line_width(0.7 / self.scale);
            self.ctx.begin_path();
            for &i in &visible {
                let f = &self.features[i];
                if !is_sel(f) { self.trace_feature(f, vx0, vy0, vx1, vy1); }
            }
            self.ctx.stroke();

            if sel.is_some() {
                self.ctx.set_stroke_style(&self.styles.sel_stroke);
                self.ctx.set_line_width(2.0 / self.scale);
                self.ctx.begin_path();
                for &i in &visible {
                    let f = &self.features[i];
                    if is_sel(f) { self.trace_feature(f, vx0, vy0, vx1, vy1); }
                }
                self.ctx.stroke();
            }

            self.draw_capitals(copy_offset_x, vx0, vy0, vx1, vy1);
        }
    }

    /// Bangun path dengan culling per-ring + LOD (lewati titik < ~0.6px di layar).
    fn trace_feature(&self, f: &CachedFeature, vx0: f64, vy0: f64, vx1: f64, vy1: f64) {
        let min_d = 0.6 / self.scale;
        for poly in &f.polys {
            for ring in poly {
                let b = &ring.bbox;
                if (b[2] - b[0]) < min_d * 1.5 && (b[3] - b[1]) < min_d * 1.5 { continue; }
                if !bbox_hits(b, vx0, vy0, vx1, vy1) { continue; }
                let (mut lx, mut ly) = (0.0, 0.0);
                for (i, &(x, y)) in ring.pts.iter().enumerate() {
                    if i == 0 {
                        self.ctx.move_to(x, y);
                        lx = x; ly = y;
                    } else if (x - lx).abs() >= min_d || (y - ly).abs() >= min_d {
                        self.ctx.line_to(x, y);
                        lx = x; ly = y;
                    }
                }
                self.ctx.close_path();
            }
        }
    }

    fn draw_capitals(&self, copy_offset_x: f64, vx0: f64, vy0: f64, vx1: f64, vy1: f64) {
        let margin = 40.0 / self.scale;
        let visible: Vec<&CachedCapital> = self.capitals.iter()
            .filter(|c| c.x >= vx0 - margin && c.x <= vx1 + margin && c.y >= vy0 - margin && c.y <= vy1 + margin)
            .collect();

        for cap in &visible {
            let image = cap.flag_idx.and_then(|i| self.capital_flags.get(i)).map(|(_, img)| img);
            self.draw_capital_flag(image, &cap.flag_iso, cap.x, cap.y);
        }

        // Label hanya saat zoom cukup; font & outline di-set sekali per frame
        if self.scale <= 1.5 { return; }
        let font_size = (8.0 + (self.scale - 1.0) * 0.5) / self.scale;
        let text_height = font_size;
        self.ctx.set_font(&format!("bold {}px sans-serif", font_size));
        self.ctx.set_line_width(2.5 / self.scale);
        self.ctx.set_stroke_style(&self.styles.label_outline);
        self.ctx.set_fill_style(&self.styles.white);

        let mut drawn_labels: Vec<[f64; 4]> = Vec::new();
        for cap in &visible {
            let (x, y) = (cap.x, cap.y);
            let text_width = font_size * (cap.name.len() as f64) * 0.5;
            let positions = [
                (x + 9.0 / self.scale, y + 3.0 / self.scale),
                (x - text_width / 2.0, y - 7.0 / self.scale),
                (x - text_width / 2.0, y + text_height + 7.0 / self.scale),
                (x - text_width - 9.0 / self.scale, y + 3.0 / self.scale),
            ];

            for (tx, ty) in positions {
                let bx1 = tx * self.scale + copy_offset_x;
                let by1 = (ty - text_height) * self.scale + self.offset_y;
                let bx2 = bx1 + text_width * self.scale;
                let by2 = by1 + text_height * self.scale;
                let p = 1.0;
                let bb = [bx1 - p, by1 - p, bx2 + p, by2 + p];

                if bb[2] < 0.0 || bb[0] > self.width || bb[3] < 0.0 || bb[1] > self.height { break; }

                let collides = drawn_labels.iter().any(|e|
                    !(bb[2] < e[0] || bb[0] > e[2] || bb[3] < e[1] || bb[1] > e[3]));

                if !collides {
                    // Outline murah menggantikan shadow blur
                    let _ = self.ctx.stroke_text(&cap.name, tx, ty);
                    let _ = self.ctx.fill_text(&cap.name, tx, ty);
                    drawn_labels.push(bb);
                    break;
                }
            }
        }
    }

    fn draw_capital_flag(&self, image: Option<&HtmlImageElement>, iso: &str, x: f64, y: f64) {
        let width = 14.0 / self.scale;
        let height = 9.0 / self.scale;
        let left = x - width / 2.0;
        let top = y - height / 2.0;

        self.ctx.set_fill_style(&self.styles.flag_bg);
        self.ctx.fill_rect(
            left - 1.0 / self.scale,
            top - 1.0 / self.scale,
            width + 2.0 / self.scale,
            height + 2.0 / self.scale,
        );

        if let Some(image) = image.filter(|flag| flag.complete() && flag.natural_width() > 0) {
            let _ = self.ctx.draw_image_with_html_image_element_and_dw_and_dh(image, left, top, width, height);
        } else {
            self.ctx.set_fill_style(&self.styles.flag_text);
            self.ctx.set_font(&format!("bold {}px sans-serif", 6.0 / self.scale));
            self.ctx.set_text_align("center");
            self.ctx.set_text_baseline("middle");
            let _ = self.ctx.fill_text(&iso.to_uppercase(), x, y);
            self.ctx.set_text_align("start");
            self.ctx.set_text_baseline("alphabetic");
        }

        self.ctx.set_stroke_style(&self.styles.flag_bg);
        self.ctx.set_line_width(0.75 / self.scale);
        self.ctx.stroke_rect(left, top, width, height);
    }

    fn project(&self, lng: f64, lat: f64) -> (f64, f64) {
        let x_norm = (lng + 180.0) / 360.0;
        let y_norm = (90.0 - lat) / 180.0;
        (x_norm * self.width, y_norm * self.height)
    }

    pub fn get_country_at(&self, mouse_x: f64, mouse_y: f64) -> JsValue {
        // Titik klik dalam koordinat dunia (sama dengan koordinat cache)
        let mut wx = (mouse_x - self.offset_x) / self.scale;
        if self.horizontal_wrap {
            wx = wx.rem_euclid(self.width);
        }
        let wy = (mouse_y - self.offset_y) / self.scale;

        // 1. Polygon-based detection (bbox dulu, O(1) per negara)
        for f in &self.features {
            if f.bbox[0] > wx || f.bbox[2] < wx || f.bbox[1] > wy || f.bbox[3] < wy { continue; }
            let hit = f.polys.iter().any(|poly| {
                poly.first().map_or(false, |outer| {
                    bbox_hits(&outer.bbox, wx, wy, wx, wy) && point_in_ring(&outer.pts, wx, wy)
                })
            });
            if hit {
                if let Some(c) = self.countries.iter().find(|c| c.iso == f.iso) {
                    return c.raw.clone();
                }
            }
        }

        // 2. Fallback to dot-based detection (for tiny islands)
        let hit_threshold = 15.0;
        for c in &self.countries {
            if let (Some(lat), Some(lng)) = (c.lat, c.lng) {
                let (x, y) = self.project(lng, lat);
                let screen_x = x * self.scale + self.offset_x;
                let screen_y = y * self.scale + self.offset_y;
                let dx = if self.horizontal_wrap {
                    let world_width = self.width * self.scale;
                    (mouse_x - screen_x + world_width / 2.0).rem_euclid(world_width) - world_width / 2.0
                } else {
                    mouse_x - screen_x
                };
                let dy = mouse_y - screen_y;
                if (dx * dx + dy * dy).sqrt() <= hit_threshold { return c.raw.clone(); }
            }
        }
        JsValue::NULL
    }
}

thread_local! {
    static ACTIVE_ENGINE: RefCell<Option<Rc<RefCell<MapEngine>>>> = RefCell::new(None);
}

#[wasm_bindgen]
pub fn set_selected_country_on_map(iso: String, should_center: bool) {
    ACTIVE_ENGINE.with(|global_engine| {
        if let Some(engine) = global_engine.borrow().as_ref() {
            engine.borrow_mut().set_selected_country(Some(iso), should_center);
        }
    });
}

#[wasm_bindgen]
pub fn set_map_horizontal_wrap(enabled: bool) {
    ACTIVE_ENGINE.with(|global_engine| {
        if let Some(engine) = global_engine.borrow().as_ref() {
            engine.borrow_mut().set_horizontal_wrap(enabled);
        }
    });
}

#[wasm_bindgen]
pub fn set_capitals_on_map(capitals: Vec<JsValue>) {
    ACTIVE_ENGINE.with(|global_engine| {
        if let Some(engine) = global_engine.borrow().as_ref() {
            engine.borrow_mut().set_capitals(capitals);
        }
    });
}

#[wasm_bindgen]
pub fn get_country_at_on_map(mouse_x: f64, mouse_y: f64) -> JsValue {
    ACTIVE_ENGINE.with(|global_engine| {
        if let Some(engine) = global_engine.borrow().as_ref() {
            engine.borrow().get_country_at(mouse_x, mouse_y)
        } else {
            JsValue::NULL
        }
    })
}

#[wasm_bindgen]
pub fn start_map_engine(
    canvas_id: String, 
    world_text: String, 
    countries_json: JsValue, 
    capitals_json: JsValue
) -> Result<(), JsValue> {
    console_error_panic_hook::set_once();
    
    let window = web_sys::window().ok_or("no global window")?;
    let document = window.document().ok_or("no document on window")?;
    let canvas = document.get_element_by_id(&canvas_id).ok_or("canvas not found")?;
    let canvas: HtmlCanvasElement = canvas.dyn_into::<HtmlCanvasElement>()?;
    
    let width = canvas.offset_width() as f64;
    let height = canvas.offset_height() as f64;
    canvas.set_width(width as u32);
    canvas.set_height(height as u32);
    
    let ctx = canvas.get_context("2d")?.ok_or("no context")?.dyn_into::<CanvasRenderingContext2d>()?;
    
    let engine = Rc::new(RefCell::new(MapEngine::new(ctx, width, height)));
    
    // Store in global thread local for external access
    ACTIVE_ENGINE.with(|global_engine| {
        *global_engine.borrow_mut() = Some(engine.clone());
    });

    // Inisialisasi Data Langsung
    {
        let mut engine_mut = engine.borrow_mut();
        engine_mut.set_data(&world_text);
        engine_mut.set_countries(countries_json.dyn_into::<js_sys::Array>().unwrap().to_vec());
        engine_mut.set_capitals(capitals_json.dyn_into::<js_sys::Array>().unwrap().to_vec());
    }


    // Event Listeners
    {
        let engine = engine.clone();
        let closure = Closure::wrap(Box::new(move |e: WheelEvent| {
            e.prevent_default();
            engine.borrow_mut().handle_wheel(e.delta_y(), e.offset_x() as f64, e.offset_y() as f64);
        }) as Box<dyn FnMut(_)>);
        canvas.add_event_listener_with_callback("wheel", closure.as_ref().unchecked_ref())?;
        closure.forget();
    }
    
    {
        let engine = engine.clone();
        let closure = Closure::wrap(Box::new(move |e: PointerEvent| {
            if e.is_primary() && e.button() == 0 {
                engine.borrow_mut().handle_mouse_down(e.offset_x() as f64, e.offset_y() as f64, e.pointer_id());
            }
        }) as Box<dyn FnMut(_)>);
        canvas.add_event_listener_with_callback("pointerdown", closure.as_ref().unchecked_ref())?;
        closure.forget();
    }
    
    {
        let engine = engine.clone();
        let closure = Closure::wrap(Box::new(move |e: PointerEvent| {
            if e.is_primary() {
                if e.buttons() == 0 {
                    engine.borrow_mut().handle_mouse_up();
                    return;
                }
                engine.borrow_mut().handle_mouse_move(e.offset_x() as f64, e.offset_y() as f64, e.buttons(), e.pointer_id());
            }
        }) as Box<dyn FnMut(_)>);
        canvas.add_event_listener_with_callback("pointermove", closure.as_ref().unchecked_ref())?;
        closure.forget();
    }

    {
        let engine = engine.clone();
        let closure = Closure::wrap(Box::new(move |e: PointerEvent| {
            if e.is_primary() {
                engine.borrow_mut().handle_mouse_up();
            }
        }) as Box<dyn FnMut(_)>);
        canvas.add_event_listener_with_callback("pointerup", closure.as_ref().unchecked_ref())?;
        closure.forget();
    }

    {
        let engine = engine.clone();
        let closure = Closure::wrap(Box::new(move |e: PointerEvent| {
            if e.is_primary() {
                engine.borrow_mut().handle_mouse_up();
            }
        }) as Box<dyn FnMut(_)>);
        canvas.add_event_listener_with_callback("pointerleave", closure.as_ref().unchecked_ref())?;
        closure.forget();
    }

    {
        let engine = engine.clone();
        let closure = Closure::wrap(Box::new(move |e: PointerEvent| {
            if e.is_primary() {
                engine.borrow_mut().handle_mouse_up();
            }
        }) as Box<dyn FnMut(_)>);
        window.add_event_listener_with_callback("pointerup", closure.as_ref().unchecked_ref())?;
        closure.forget();
    }

    {
        let engine = engine.clone();
        let closure = Closure::wrap(Box::new(move |e: PointerEvent| {
            if e.is_primary() {
                engine.borrow_mut().handle_mouse_up();
            }
        }) as Box<dyn FnMut(_)>);
        window.add_event_listener_with_callback("pointercancel", closure.as_ref().unchecked_ref())?;
        closure.forget();
    }

    {
        let engine = engine.clone();
        let canvas_clone = canvas.clone();
        let closure = Closure::wrap(Box::new(move |e: PointerEvent| {
            if e.is_primary() {
                let document = web_sys::window().and_then(|w| w.document()).unwrap();
                let element_at_point = document.element_from_point(e.client_x() as f32, e.client_y() as f32);
                let over_canvas = element_at_point.map_or(false, |target| {
                    target.dyn_ref::<HtmlCanvasElement>().map_or(false, |target_canvas| target_canvas == &canvas_clone)
                });

                if !over_canvas || e.buttons() == 0 {
                    engine.borrow_mut().handle_mouse_up();
                    return;
                }
            }
        }) as Box<dyn FnMut(_)>);
        window.add_event_listener_with_callback("pointermove", closure.as_ref().unchecked_ref())?;
        closure.forget();
    }

    // Animation Loop (render hanya jika dirty/animasi; throttle ditangani engine.tick)
    let f = Rc::new(RefCell::new(None::<Closure<dyn FnMut(f64)>>));
    let g = f.clone();
    let engine_render = engine.clone();
    *g.borrow_mut() = Some(Closure::wrap(Box::new(move |now: f64| {
        engine_render.borrow_mut().tick(now);
        let window = web_sys::window().unwrap();
        window.request_animation_frame(f.borrow().as_ref().unwrap().as_ref().unchecked_ref()).unwrap();
    }) as Box<dyn FnMut(f64)>));

    window.request_animation_frame(g.borrow().as_ref().unwrap().as_ref().unchecked_ref())?;

    Ok(())
}
