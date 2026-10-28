use geojson::{GeoJson, Value};
use serde::Deserialize;
use std::cell::RefCell;
use std::rc::Rc;
use wasm_bindgen::prelude::*;
use wasm_bindgen::JsCast;
use web_sys::{
    CanvasRenderingContext2d, HtmlCanvasElement, HtmlImageElement, MouseEvent, Path2d,
    PointerEvent, WheelEvent,
};

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
    #[serde(default)]
    is_major_city: Option<bool>,
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
    paths: RefCell<[Option<Path2d>; 3]>,
    iso: String, // lowercase
    fill: JsValue,
    override_fill: Option<JsValue>,
}

impl CachedFeature {
    fn get_path(&self, detail_level: usize) -> Option<Path2d> {
        let level = detail_level.min(2);
        let mut paths = self.paths.borrow_mut();
        if paths[level].is_none() {
            let min_distance = match level {
                0 => 0.18,
                1 => 0.02,
                _ => 0.003,
            };
            paths[level] = build_cached_path(&self.polys, min_distance);
        }
        paths[level].clone()
    }
}

/// Satu garis batas provinsi: titik sudah diproyeksi + bbox untuk viewport culling + path cache per LOD.
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

struct FillBatch {
    style: JsValue,
    path: Path2d,
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
    is_capital: bool,
}

struct Styles {
    bg: JsValue,
    sel_fill: JsValue,
    sel_stroke: JsValue,
    stroke: JsValue,
    province_stroke: JsValue,
    white: JsValue,
    capital_text: JsValue,
    city_text: JsValue,
    flag_bg: JsValue,
    flag_text: JsValue,
    label_outline: JsValue,
}

fn continent_color(continent: &str) -> &'static str {
    match continent {
        // Palet benua diselaraskan dengan estetika geopolitik nyata:
        "Asia" => "#2e7d32",           // Hijau zamrud teritorial Asia
        "Africa" => "#d97706",         // Amber / terracotta khas benua Afrika
        "Europe" => "#2563eb",         // Biru kobalt diplomatik Eropa
        "North America" => "#0d9488",  // Teal / Cyan kehijauan Amerika Utara
        "South America" => "#ea580c",  // Oranye hangat Amerika Selatan
        "Oceania" => "#0284c7",        // Sky cyan maritim Oceania
        "Antarctica" => "#e2e8f0",     // Putih es / glacier Antartika
        _ => "#475569",
    }
}

fn bbox_empty() -> [f64; 4] {
    [f64::MAX, f64::MAX, f64::MIN, f64::MIN]
}

fn bbox_hits(b: &[f64; 4], x0: f64, y0: f64, x1: f64, y1: f64) -> bool {
    !(b[2] < x0 || b[0] > x1 || b[3] < y0 || b[1] > y1)
}

fn build_cached_path(polys: &[Vec<Ring>], min_distance: f64) -> Option<Path2d> {
    let path = match Path2d::new() {
        Ok(path) => path,
        Err(_) => return None,
    };

    for polygon in polys {
        for ring in polygon {
            let Some(&(first_x, first_y)) = ring.pts.first() else {
                continue;
            };
            path.move_to(first_x, first_y);
            let (mut last_x, mut last_y) = (first_x, first_y);
            for &(x, y) in ring.pts.iter().skip(1) {
                if min_distance == 0.0
                    || (x - last_x).abs() >= min_distance
                    || (y - last_y).abs() >= min_distance
                {
                    path.line_to(x, y);
                    last_x = x;
                    last_y = y;
                }
            }
            path.close_path();
        }
    }
    Some(path)
}

fn point_in_ring(ring: &[(f64, f64)], x: f64, y: f64) -> bool {
    if ring.len() < 3 {
        return false;
    }
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
    cached_fill_batches: Vec<FillBatch>,
    cached_outline_path: Option<Path2d>,
    cached_selected_path: Option<Path2d>,
    cached_selected_fill: Option<JsValue>,
    show_province_borders: bool,
    cached_map_canvas: Option<HtmlCanvasElement>,
    cached_capitals_canvas: Option<HtmlCanvasElement>,
    cached_batches_ready: bool,
    cached_capital_labels: Vec<(usize, f64, f64)>,
    cached_capital_labels_scale: f64,
    visible_features: Vec<usize>,
    feature_grid: Vec<Vec<usize>>,
    feature_query_marks: Vec<u32>,
    feature_query_generation: u32,
    countries: Vec<CachedCountry>,
    capitals: Vec<CachedCapital>,
    capital_flags: Vec<(String, HtmlImageElement)>,
    province_lines: Vec<ProvLine>,
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
    last_frame_ms: Option<f64>,
    frame_accumulator_ms: f64,
    frame_counter: u32,
    flags_ready: usize,
    override_beats_selected: bool,
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
            cached_fill_batches: Vec::new(),
            cached_outline_path: Path2d::new().ok(),
            cached_selected_path: Path2d::new().ok(),
            cached_selected_fill: None,
            show_province_borders: true,
            cached_map_canvas: None,
            cached_capitals_canvas: None,
            cached_batches_ready: false,
            cached_capital_labels: Vec::new(),
            cached_capital_labels_scale: f64::NAN,
            visible_features: Vec::with_capacity(256),
            feature_grid: vec![Vec::new(); 36 * 18],
            feature_query_marks: Vec::new(),
            feature_query_generation: 0,
            countries: Vec::new(),
            capitals: Vec::new(),
            capital_flags: Vec::new(),
            province_lines: Vec::new(),
            styles: Styles {
                bg: JsValue::from_str("#0f244a"),
                sel_fill: JsValue::from_str("#00FFAA"),
                sel_stroke: JsValue::from_str("#34d399"),
                stroke: JsValue::from_str("rgba(255, 255, 255, 0.75)"),
                province_stroke: JsValue::from_str("rgba(255, 255, 255, 0.55)"),
                white: JsValue::from_str("white"),
                capital_text: JsValue::from_str("#FFE600"),
                city_text: JsValue::from_str("#CBD5E1"),
                flag_bg: JsValue::from_str("#0f172a"),
                flag_text: JsValue::from_str("#fbbf24"),
                label_outline: JsValue::from_str("rgba(0, 0, 0, 0.90)"),
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
            last_frame_ms: None,
            frame_accumulator_ms: 0.0,
            frame_counter: 0,
            flags_ready: 0,
            override_beats_selected: false,
        }
    }

    /// Parse GeoJSON sekali, proyeksikan semua titik & hitung bbox (cache).
    pub fn set_provinces_data(&mut self, geojson_str: &str) {
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

    pub fn set_data(&mut self, geojson_str: &str) {
        let Ok(GeoJson::FeatureCollection(fc)) = geojson_str.parse::<GeoJson>() else {
            return;
        };
        let (w, h) = (self.width, self.height);
        let proj = |c: &Vec<f64>| -> (f64, f64) {
            (((c[0] + 180.0) / 360.0) * w, ((90.0 - c[1]) / 180.0) * h)
        };
        let build_poly = |poly: &Vec<Vec<Vec<f64>>>, fbox: &mut [f64; 4]| -> Vec<Ring> {
            let mut rings = Vec::new();
            for ring in poly {
                if ring.len() < 2 {
                    continue;
                }
                let mut bbox = bbox_empty();
                let pts: Vec<(f64, f64)> = ring
                    .iter()
                    .filter(|c| c.len() >= 2)
                    .map(|c| {
                        let p = proj(c);
                        bbox[0] = bbox[0].min(p.0);
                        bbox[1] = bbox[1].min(p.1);
                        bbox[2] = bbox[2].max(p.0);
                        bbox[3] = bbox[3].max(p.1);
                        p
                    })
                    .collect();
                if pts.len() < 2 {
                    continue;
                }
                fbox[0] = fbox[0].min(bbox[0]);
                fbox[1] = fbox[1].min(bbox[1]);
                fbox[2] = fbox[2].max(bbox[2]);
                fbox[3] = fbox[3].max(bbox[3]);
                rings.push(Ring { pts, bbox });
            }
            rings
        };

        let mut out = Vec::with_capacity(fc.features.len());
        let mut path_cache_failed = false;
        for feature in &fc.features {
            let props = feature.properties.as_ref();
            let continent = props
                .and_then(|p| p.get("CONTINENT"))
                .and_then(|v| v.as_str())
                .unwrap_or("Unknown");
            let iso = props
                .and_then(|p| p.get("ISO_A2"))
                .and_then(|v| v.as_str())
                .unwrap_or("")
                .to_lowercase();
            let mut fbox = bbox_empty();
            let mut polys = Vec::new();
            if let Some(ref g) = feature.geometry {
                match &g.value {
                    Value::Polygon(p) => polys.push(build_poly(p, &mut fbox)),
                    Value::MultiPolygon(m) => {
                        for p in m {
                            polys.push(build_poly(p, &mut fbox));
                        }
                    }
                    _ => {}
                }
            }
            // Bangun level 1 untuk batch fill awal; level 0 dan 2 dibuat secara lazy saat dibutuhkan
            let path1 = build_cached_path(&polys, 0.02);
            path_cache_failed |= path1.is_none();
            let paths = RefCell::new([None, path1, None]);
            out.push(CachedFeature {
                polys,
                bbox: fbox,
                paths,
                iso,
                fill: JsValue::from_str(continent_color(continent)),
                override_fill: None,
            });
        }
        if path_cache_failed {
            web_sys::console::error_1(
                &"Some map paths could not be cached; using geometry fallback for those features."
                    .into(),
            );
        }
        // Urutkan features berdasarkan luas bbox (terkecil dulu).
        // Hal ini sangat penting untuk enclave & microstates (seperti Vatikan & San Marino di dalam Italia,
        // Lesotho di dalam Afrika Selatan, Monako di Prancis) agar saat diklik, negara kecil yang ada di dalam
        // selalu terdeteksi lebih dulu sebelum poligon negara besar di luarnya!
        out.sort_by(|a, b| {
            let area_a = (a.bbox[2] - a.bbox[0]) * (a.bbox[3] - a.bbox[1]);
            let area_b = (b.bbox[2] - b.bbox[0]) * (b.bbox[3] - b.bbox[1]);
            area_a.partial_cmp(&area_b).unwrap_or(std::cmp::Ordering::Equal)
        });
        self.features = out;
        self.rebuild_feature_grid();
        self.rebuild_draw_batches();
        self.dirty = true;
    }

    fn rebuild_draw_batches(&mut self) {
        let mut fill_batches: Vec<FillBatch> = Vec::new();
        let outline_path = Path2d::new().ok();
        let mut cache_complete = outline_path.is_some();

        for feature in &self.features {
            let style = feature.override_fill.as_ref().unwrap_or(&feature.fill);
            let Some(path) = feature.get_path(1) else {
                cache_complete = false;
                continue;
            };
            if let Some(style_key) = style.as_string() {
                if let Some(batch) = fill_batches
                    .iter_mut()
                    .find(|batch| batch.style.as_string().as_deref() == Some(style_key.as_str()))
                {
                    batch.path.add_path(&path);
                } else {
                    match Path2d::new() {
                        Ok(batch_path) => {
                            batch_path.add_path(&path);
                            fill_batches.push(FillBatch {
                                style: style.clone(),
                                path: batch_path,
                            });
                        }
                        Err(_) => cache_complete = false,
                    }
                }
            } else {
                cache_complete = false;
            }
            if let Some(outline_path) = &outline_path {
                outline_path.add_path(&path);
            }
        }
        self.cached_fill_batches = fill_batches;
        self.cached_outline_path = outline_path;
        self.rebuild_selected_overlay();
        self.cached_batches_ready = cache_complete;
        self.cached_map_canvas = None;
        if !cache_complete {
            web_sys::console::error_1(
                &"Map draw-batch cache could not be completed; using per-feature rendering.".into(),
            );
            return;
        }

        let cached_canvas = web_sys::window()
            .and_then(|window| window.document())
            .and_then(|document| document.create_element("canvas").ok())
            .and_then(|element| element.dyn_into::<HtmlCanvasElement>().ok());
        let Some(canvas) = cached_canvas else {
            web_sys::console::error_1(
                &"Could not create map raster cache; using vector rendering.".into(),
            );
            return;
        };
        const RASTER_SCALE: f64 = 3.0;
        canvas.set_width((self.width * RASTER_SCALE) as u32);
        canvas.set_height((self.height * RASTER_SCALE) as u32);
        let cached_context = canvas
            .get_context("2d")
            .ok()
            .flatten()
            .and_then(|context| context.dyn_into::<CanvasRenderingContext2d>().ok());
        let Some(context) = cached_context else {
            web_sys::console::error_1(
                &"Could not create map raster context; using vector rendering.".into(),
            );
            return;
        };
        let _ = context.set_transform(RASTER_SCALE, 0.0, 0.0, RASTER_SCALE, 0.0, 0.0);

        for batch in &self.cached_fill_batches {
            context.set_fill_style(&batch.style);
            context.fill_with_path_2d(&batch.path);
        }
        self.cached_map_canvas = Some(canvas);
        self.cached_fill_batches.clear();
        self.cached_batches_ready = false;
    }

    fn rebuild_selected_overlay(&mut self) {
        let selected_path = Path2d::new().ok();
        let mut selected_fill = None;
        if let (Some(iso), Some(path)) = (self.selected_lower.as_deref(), selected_path.as_ref()) {
            if let Some(feature) = self.features.iter().find(|feature| feature.iso == iso) {
                if let Some(feature_path) = feature.get_path(1) {
                    path.add_path(&feature_path);
                    selected_fill = Some(
                        if self.override_beats_selected {
                            feature
                                .override_fill
                                .as_ref()
                                .unwrap_or(&self.styles.sel_fill)
                        } else {
                            &self.styles.sel_fill
                        }
                        .clone(),
                    );
                }
            }
        }
        self.cached_selected_path = selected_path;
        self.cached_selected_fill = selected_fill;
    }

    fn rebuild_feature_grid(&mut self) {
        const GRID_COLUMNS: usize = 36;
        const GRID_ROWS: usize = 18;
        self.feature_grid = vec![Vec::new(); GRID_COLUMNS * GRID_ROWS];
        self.feature_query_marks = vec![0; self.features.len()];

        for (feature_index, feature) in self.features.iter().enumerate() {
            let bbox = feature.bbox;
            if bbox[0] > bbox[2] || bbox[1] > bbox[3] {
                continue;
            }
            let min_x = ((bbox[0] / self.width * GRID_COLUMNS as f64).floor() as isize)
                .clamp(0, GRID_COLUMNS as isize - 1) as usize;
            let max_x = (((bbox[2].min(self.width - f64::EPSILON)) / self.width
                * GRID_COLUMNS as f64)
                .floor() as isize)
                .clamp(0, GRID_COLUMNS as isize - 1) as usize;
            let min_y = ((bbox[1] / self.height * GRID_ROWS as f64).floor() as isize)
                .clamp(0, GRID_ROWS as isize - 1) as usize;
            let max_y = (((bbox[3].min(self.height - f64::EPSILON)) / self.height
                * GRID_ROWS as f64)
                .floor() as isize)
                .clamp(0, GRID_ROWS as isize - 1) as usize;

            for y in min_y..=max_y {
                for x in min_x..=max_x {
                    self.feature_grid[y * GRID_COLUMNS + x].push(feature_index);
                }
            }
        }
    }

    fn query_visible_features(
        &mut self,
        x0: f64,
        y0: f64,
        x1: f64,
        y1: f64,
        visible: &mut Vec<usize>,
    ) {
        const GRID_COLUMNS: usize = 36;
        const GRID_ROWS: usize = 18;
        let min_x = ((x0.max(0.0) / self.width * GRID_COLUMNS as f64).floor() as isize)
            .clamp(0, GRID_COLUMNS as isize - 1) as usize;
        let max_x = (((x1.min(self.width - f64::EPSILON)) / self.width * GRID_COLUMNS as f64)
            .floor() as isize)
            .clamp(0, GRID_COLUMNS as isize - 1) as usize;
        let min_y = ((y0.max(0.0) / self.height * GRID_ROWS as f64).floor() as isize)
            .clamp(0, GRID_ROWS as isize - 1) as usize;
        let max_y = (((y1.min(self.height - f64::EPSILON)) / self.height * GRID_ROWS as f64).floor()
            as isize)
            .clamp(0, GRID_ROWS as isize - 1) as usize;

        if x0 > self.width
            || x1 < 0.0
            || y0 > self.height
            || y1 < 0.0
            || min_x > max_x
            || min_y > max_y
        {
            return;
        }

        self.feature_query_generation = self.feature_query_generation.wrapping_add(1);
        if self.feature_query_generation == 0 {
            self.feature_query_marks.fill(0);
            self.feature_query_generation = 1;
        }
        let generation = self.feature_query_generation;
        let (feature_grid, features, marks) = (
            &self.feature_grid,
            &self.features,
            &mut self.feature_query_marks,
        );
        for y in min_y..=max_y {
            for x in min_x..=max_x {
                for &index in &feature_grid[y * GRID_COLUMNS + x] {
                    if marks[index] == generation {
                        continue;
                    }
                    marks[index] = generation;
                    if bbox_hits(&features[index].bbox, x0, y0, x1, y1) {
                        visible.push(index);
                    }
                }
            }
        }
    }

    /// Warna override per feature (indeks sama dengan urutan GeoJSON). null/undefined = tanpa override.
    pub fn set_feature_colors(&mut self, colors: Vec<JsValue>, beat_selected: bool) {
        let mut changed = self.override_beats_selected != beat_selected;
        for (f, c) in self.features.iter_mut().zip(colors.into_iter()) {
            let next_fill = if c.as_string().is_some() {
                Some(c)
            } else {
                None
            };
            let current_color = f.override_fill.as_ref().and_then(JsValue::as_string);
            let next_color = next_fill.as_ref().and_then(JsValue::as_string);
            if current_color != next_color {
                f.override_fill = next_fill;
                changed = true;
            }
        }
        if !changed {
            return;
        }
        self.override_beats_selected = beat_selected;
        self.rebuild_draw_batches();
        self.dirty = true;
    }

    pub fn set_countries(&mut self, countries: Vec<JsValue>) {
        self.countries = countries
            .into_iter()
            .filter_map(|js| {
                let c = serde_wasm_bindgen::from_value::<CountryData>(js.clone()).ok()?;
                Some(CachedCountry {
                    iso: c.iso.to_lowercase(),
                    lat: c.latitude,
                    lng: c.longitude,
                    raw: js,
                })
            })
            .collect();
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
                let iso = capital
                    .iso
                    .rsplit('-')
                    .next()
                    .unwrap_or(&capital.iso)
                    .to_lowercase();
                if iso.len() != 2
                    || self
                        .capital_flags
                        .iter()
                        .any(|(loaded_iso, _)| loaded_iso == &iso)
                {
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
        self.capitals = parsed
            .into_iter()
            .map(|c| {
                let flag_iso = c.iso.rsplit('-').next().unwrap_or(&c.iso).to_string();
                let flag_idx = self
                    .capital_flags
                    .iter()
                    .position(|(i, _)| i == &flag_iso.to_lowercase());
                let is_capital = !c.is_major_city.unwrap_or(false);
                CachedCapital {
                    name: c.capital,
                    x: ((c.lng + 180.0) / 360.0) * w,
                    y: ((90.0 - c.lat) / 180.0) * h,
                    flag_iso,
                    flag_idx,
                    is_capital,
                }
            })
            .collect();
        self.cached_capital_labels.clear();
        self.cached_capital_labels_scale = f64::NAN;
        self.flags_ready = self
            .capital_flags
            .iter()
            .filter(|(_, image)| image.complete() && image.natural_width() > 0)
            .count();
        self.rebuild_capitals_canvas();
        self.dirty = true;
    }

    fn rebuild_capitals_canvas(&mut self) {
        const BLEED: f64 = 8.0;
        let cached_canvas = web_sys::window()
            .and_then(|window| window.document())
            .and_then(|document| document.create_element("canvas").ok())
            .and_then(|element| element.dyn_into::<HtmlCanvasElement>().ok());
        let Some(canvas) = cached_canvas else {
            web_sys::console::error_1(
                &"Could not create capital-flags raster cache; using per-flag rendering.".into(),
            );
            self.cached_capitals_canvas = None;
            return;
        };
        canvas.set_width((self.width + BLEED * 2.0) as u32);
        canvas.set_height((self.height + BLEED * 2.0) as u32);
        let cached_context = canvas
            .get_context("2d")
            .ok()
            .flatten()
            .and_then(|context| context.dyn_into::<CanvasRenderingContext2d>().ok());
        let Some(context) = cached_context else {
            web_sys::console::error_1(
                &"Could not create capital-flags raster context; using per-flag rendering.".into(),
            );
            self.cached_capitals_canvas = None;
            return;
        };
        let _ = context.set_transform(1.0, 0.0, 0.0, 1.0, BLEED, BLEED);
        for capital in &self.capitals {
            let image = capital
                .flag_idx
                .and_then(|index| self.capital_flags.get(index))
                .map(|(_, image)| image);
            Self::draw_capital_flag_on_context(
                &context,
                &self.styles,
                image,
                &capital.flag_iso,
                capital.x,
                capital.y,
                1.0,
                false,
            );
        }
        self.cached_capitals_canvas = Some(canvas);
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
        if self.is_panning {
            self.dirty = true;
        }
        self.is_panning = false;
        self.active_pointer_id = None;
    }

    pub fn set_selected_country(&mut self, iso: Option<String>, should_center: bool) {
        self.selected_lower = iso.as_ref().map(|s| s.to_lowercase());
        self.selected_country_iso = iso;
        self.rebuild_selected_overlay();
        self.dirty = true;

        if let Some(iso_val) = self.selected_lower.clone() {
            if should_center {
                let found = self
                    .countries
                    .iter()
                    .find(|c| c.iso == iso_val)
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

    pub fn set_show_province_borders(&mut self, show: bool) {
        if self.show_province_borders != show {
            self.show_province_borders = show;
            self.dirty = true;
        }
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

    /// Batasi kerja render ke 60 FPS maksimum, terlepas dari refresh rate layar.
    pub fn tick(&mut self, now_ms: f64) {
        const FRAME_INTERVAL_MS: f64 = 1000.0 / 60.0;
        let Some(previous_frame_ms) = self.last_frame_ms.replace(now_ms) else {
            self.render();
            return;
        };
        self.frame_accumulator_ms += (now_ms - previous_frame_ms).max(0.0);
        if self.frame_accumulator_ms < FRAME_INTERVAL_MS {
            return;
        }
        self.frame_accumulator_ms %= FRAME_INTERVAL_MS;
        self.render();
    }

    pub fn render(&mut self) {
        let animating = self.update_camera();
        let detail_level = if self.scale <= 1.0 {
            0
        } else if self.scale < 6.0 {
            1
        } else {
            2
        };

        // Rebuild cache bendera sekali setelah semua image selesai, bukan untuk
        // setiap batch image yang selesai dimuat.
        self.frame_counter = self.frame_counter.wrapping_add(1);
        if self.frame_counter % 20 == 0 {
            let all_flags_settled = self.capital_flags.iter().all(|(_, image)| image.complete());
            if all_flags_settled {
                let ready = self
                    .capital_flags
                    .iter()
                    .filter(|(_, image)| image.natural_width() > 0)
                    .count();
                if ready != self.flags_ready && !self.is_panning {
                    self.flags_ready = ready;
                    self.rebuild_capitals_canvas();
                    self.dirty = true;
                }
            }
        }

        if !self.dirty && !animating {
            return; // Idle: tidak ada yang digambar
        }
        self.dirty = false;

        let _ = self.ctx.set_transform(1.0, 0.0, 0.0, 1.0, 0.0, 0.0);
        self.ctx.set_line_join("round");
        self.ctx.set_line_cap("round");
        self.ctx.set_fill_style(&self.styles.bg);
        self.ctx.fill_rect(0.0, 0.0, self.width, self.height);

        let world_w = self.width * self.scale;
        let first_copy = if self.horizontal_wrap {
            (-self.offset_x / world_w).floor() as i32
        } else {
            0
        };
        let last_copy = if self.horizontal_wrap {
            ((self.width - self.offset_x) / world_w).ceil() as i32 - 1
        } else {
            0
        };

        let mut visible = std::mem::take(&mut self.visible_features);
        for world_copy in first_copy..=last_copy {
            let copy_offset_x = self.offset_x + world_copy as f64 * world_w;
            let _ = self.ctx.set_transform(
                self.scale,
                0.0,
                0.0,
                self.scale,
                copy_offset_x,
                self.offset_y,
            );

            // Viewport dalam koordinat dunia (viewport culling)
            let vx0 = -copy_offset_x / self.scale;
            let vx1 = (self.width - copy_offset_x) / self.scale;
            let vy0 = -self.offset_y / self.scale;
            let vy1 = (self.height - self.offset_y) / self.scale;

            visible.clear();
            self.query_visible_features(vx0, vy0, vx1, vy1, &mut visible);

            let sel = self.selected_lower.as_deref();
            let is_sel = |f: &CachedFeature| sel.map_or(false, |s| !f.iso.is_empty() && f.iso == s);
            // Raster cache hanya untuk overview zoom-out penuh (scale <= 1.25).
            // Di atas 1.25, gunakan vector rendering karena viewport spatial culling membatasi
            // negara yang dirender ke jumlah sangat sedikit (< 20 feature), jauh lebih cepat & tajam.
            let use_raster_cache = self.scale <= 1.25;
            let use_global_batches =
                detail_level == 0 && visible.len() * 4 >= self.features.len() * 3;
            let mut drew_cached_map = false;
            if use_raster_cache {
                if let Some(cached_canvas) = &self.cached_map_canvas {
                    match self.ctx.draw_image_with_html_canvas_element_and_dw_and_dh(
                        cached_canvas,
                        0.0,
                        0.0,
                        self.width,
                        self.height,
                    ) {
                        Ok(()) => {
                            if let (Some(selected), Some(fill)) =
                                (&self.cached_selected_path, &self.cached_selected_fill)
                            {
                                self.ctx.set_fill_style(fill);
                                self.ctx.fill_with_path_2d(selected);
                            }
                            if let Some(outline) = &self.cached_outline_path {
                                self.ctx.set_stroke_style(&self.styles.stroke);
                                self.ctx.set_line_width((0.85 / self.scale).clamp(0.2, 1.2));
                                self.ctx.stroke_with_path(outline);
                            }
                            if let Some(selected) = &self.cached_selected_path {
                                self.ctx.set_stroke_style(&self.styles.sel_stroke);
                                self.ctx.set_line_width((1.4 / self.scale).clamp(0.4, 2.0));
                                self.ctx.stroke_with_path(selected);
                            }
                            drew_cached_map = true;
                        }
                        Err(error) => {
                            web_sys::console::error_2(
                                &"Could not draw map raster cache; using vector rendering.".into(),
                                &error,
                            );
                        }
                    }
                }
            }
            if use_global_batches && !drew_cached_map && self.cached_batches_ready {
                for batch in &self.cached_fill_batches {
                    self.ctx.set_fill_style(&batch.style);
                    self.ctx.fill_with_path_2d(&batch.path);
                }
                if let (Some(selected), Some(fill)) =
                    (&self.cached_selected_path, &self.cached_selected_fill)
                {
                    self.ctx.set_fill_style(fill);
                    self.ctx.fill_with_path_2d(selected);
                }
                self.ctx.set_stroke_style(&self.styles.stroke);
                self.ctx.set_line_width((0.85 / self.scale).clamp(0.2, 1.2));
                if let Some(outline) = &self.cached_outline_path {
                    self.ctx.stroke_with_path(outline);
                }
                if let Some(selected) = &self.cached_selected_path {
                    self.ctx.set_stroke_style(&self.styles.sel_stroke);
                    self.ctx.set_line_width((1.4 / self.scale).clamp(0.4, 2.0));
                    self.ctx.stroke_with_path(selected);
                }
                for &i in &visible {
                    let feature = &self.features[i];
                    if feature.get_path(detail_level).is_some() {
                        continue;
                    }
                    let selected_feature = is_sel(feature);
                    let style = match (selected_feature, feature.override_fill.as_ref()) {
                        (true, Some(override_fill)) if self.override_beats_selected => {
                            override_fill
                        }
                        (true, _) => &self.styles.sel_fill,
                        (false, Some(override_fill)) => override_fill,
                        _ => &feature.fill,
                    };
                    self.ctx.set_fill_style(style);
                    self.ctx.begin_path();
                    self.trace_feature(feature, vx0, vy0, vx1, vy1);
                    self.ctx.fill();
                    self.ctx.set_stroke_style(if selected_feature {
                        &self.styles.sel_stroke
                    } else {
                        &self.styles.stroke
                    });
                    self.ctx.set_line_width(if selected_feature {
                        1.0 / self.scale
                    } else {
                        0.7 / self.scale
                    });
                    self.ctx.begin_path();
                    self.trace_feature(feature, vx0, vy0, vx1, vy1);
                    self.ctx.stroke();
                }
                drew_cached_map = true;
            }
            if !drew_cached_map {
                // Pass 1: Fill visible features
                let mut unselected_visible_paths = Vec::new();
                let mut selected_path_to_draw = None;

                for &i in &visible {
                    let feature = &self.features[i];
                    let selected_feature = is_sel(feature);
                    let style = match (selected_feature, feature.override_fill.as_ref()) {
                        (true, Some(override_fill)) if self.override_beats_selected => {
                            override_fill
                        }
                        (true, _) => &self.styles.sel_fill,
                        (false, Some(override_fill)) => override_fill,
                        _ => &feature.fill,
                    };
                    if let Some(path) = feature.get_path(detail_level) {
                        self.ctx.set_fill_style(style);
                        self.ctx.fill_with_path_2d(&path);
                        if selected_feature {
                            selected_path_to_draw = Some(path);
                        } else {
                            unselected_visible_paths.push(path);
                        }
                    } else {
                        self.ctx.set_fill_style(style);
                        self.ctx.begin_path();
                        self.trace_feature(feature, vx0, vy0, vx1, vy1);
                        self.ctx.fill();
                        self.ctx.set_stroke_style(if selected_feature {
                            &self.styles.sel_stroke
                        } else {
                            &self.styles.stroke
                        });
                        self.ctx.set_line_width(if selected_feature {
                            1.0 / self.scale
                        } else {
                            0.7 / self.scale
                        });
                        self.ctx.begin_path();
                        self.trace_feature(feature, vx0, vy0, vx1, vy1);
                        self.ctx.stroke();
                    }
                }

                // Pass 2: Stroke unselected visible features sekali set stroke style
                if !unselected_visible_paths.is_empty() {
                    self.ctx.set_stroke_style(&self.styles.stroke);
                    self.ctx.set_line_width((0.85 / self.scale).clamp(0.2, 1.2));
                    for path in &unselected_visible_paths {
                        self.ctx.stroke_with_path(path);
                    }
                }

                // Pass 3: Stroke selected feature
                if let Some(sel_path) = selected_path_to_draw {
                    self.ctx.set_stroke_style(&self.styles.sel_stroke);
                    self.ctx.set_line_width((1.4 / self.scale).clamp(0.4, 2.0));
                    self.ctx.stroke_with_path(&sel_path);
                }
            }

            // Garis batas provinsi solid (tidak putus-putus) langsung tersambung mulus
            if self.show_province_borders && self.scale >= 1.15 && !self.province_lines.is_empty() {
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
            }
            self.draw_capitals(vx0, vy0, vx1, vy1, true, animating);
        }
        self.visible_features = visible;
    }

    /// Bangun path dengan culling per-ring + LOD (lewati titik < ~0.6px di layar).
    fn trace_feature(&self, f: &CachedFeature, vx0: f64, vy0: f64, vx1: f64, vy1: f64) {
        let min_d = 0.06 / self.scale;
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
        }
    }

    fn draw_capitals(&mut self, vx0: f64, vy0: f64, vx1: f64, vy1: f64, draw_labels: bool, animating: bool) {
        if self.scale <= 1.0 {
            if let Some(cached_canvas) = &self.cached_capitals_canvas {
                match self
                    .ctx
                    .draw_image_with_html_canvas_element(cached_canvas, -8.0, -8.0)
                {
                    Ok(()) => return,
                    Err(error) => web_sys::console::error_2(
                        &"Could not draw capital-flags raster cache; using per-flag rendering."
                            .into(),
                        &error,
                    ),
                }
            }
        }
        let margin = 40.0 / self.scale;
        let visible_capitals: Vec<_> = self.capitals.iter().filter(|c| {
            c.x >= vx0 - margin && c.x <= vx1 + margin && c.y >= vy0 - margin && c.y <= vy1 + margin
        }).collect();

        for cap in &visible_capitals {
            let image = cap
                .flag_idx
                .and_then(|i| self.capital_flags.get(i))
                .map(|(_, img)| img);
            self.draw_capital_flag(image, &cap.flag_iso, cap.x, cap.y, animating);
        }

        // Label hanya saat zoom cukup; jangan gambar label jika kamera sedang berinterpolasi cepat
        if !draw_labels || self.scale <= 1.2 || animating {
            return;
        }

        // Jangan hitung ulang layout jika perbedaan skala kecil (< 30%)
        let scale_diff_ratio = if self.cached_capital_labels_scale.is_nan() || self.cached_capital_labels_scale <= 0.0 {
            1.0
        } else {
            (self.scale - self.cached_capital_labels_scale).abs() / self.cached_capital_labels_scale
        };

        if self.cached_capital_labels.is_empty() || scale_diff_ratio > 0.3 {
            self.rebuild_capital_label_layout();
        }

        let font_size = (8.0 + (self.scale - 1.0) * 0.5) / self.scale;
        let capital_font_size = (8.8 + (self.scale - 1.0) * 0.5) / self.scale;
        self.ctx.set_line_width(2.5 / self.scale);
        self.ctx.set_stroke_style(&self.styles.label_outline);

        // Render kota biasa terlebih dahulu, kemudian ibukota di atasnya
        for pass_capital in [false, true] {
            if pass_capital {
                self.ctx.set_font(&format!("bold {}px sans-serif", capital_font_size));
                self.ctx.set_fill_style(&self.styles.capital_text);
            } else {
                self.ctx.set_font(&format!("500 {}px sans-serif", font_size));
                self.ctx.set_fill_style(&self.styles.city_text);
            }

            for &(capital_index, x, y) in &self.cached_capital_labels {
                let Some(capital) = self.capitals.get(capital_index) else {
                    continue;
                };
                if capital.is_capital != pass_capital {
                    continue;
                }
                if capital.x < vx0 - margin
                    || capital.x > vx1 + margin
                    || capital.y < vy0 - margin
                    || capital.y > vy1 + margin
                {
                    continue;
                }
                let _ = self.ctx.stroke_text(&capital.name, x, y);
                let _ = self.ctx.fill_text(&capital.name, x, y);
            }
        }
    }

    fn rebuild_capital_label_layout(&mut self) {
        let scale = self.scale;
        let font_size = (8.0 + (scale - 1.0) * 0.5) / scale;
        let text_height = font_size;
        let mut accepted_boxes: Vec<[f64; 4]> = Vec::with_capacity(self.capitals.len());
        let mut labels = Vec::with_capacity(self.capitals.len());

        let mut indices: Vec<usize> = (0..self.capitals.len()).collect();
        indices.sort_by_key(|&idx| if self.capitals[idx].is_capital { 0 } else { 1 });

        for capital_index in indices {
            let capital = &self.capitals[capital_index];
            let text_width = font_size * capital.name.len() as f64 * 0.5;
            let positions = [
                (capital.x + 9.0 / scale, capital.y + 3.0 / scale),
                (capital.x - text_width / 2.0, capital.y - 7.0 / scale),
                (
                    capital.x - text_width / 2.0,
                    capital.y + text_height + 7.0 / scale,
                ),
                (
                    capital.x - text_width - 9.0 / scale,
                    capital.y + 3.0 / scale,
                ),
            ];

            for (x, y) in positions {
                let box_bounds = [
                    x * scale - 1.0,
                    (y - text_height) * scale - 1.0,
                    (x + text_width) * scale + 1.0,
                    y * scale + 1.0,
                ];
                let collides = accepted_boxes.iter().any(|existing| {
                    !(box_bounds[2] < existing[0]
                        || box_bounds[0] > existing[2]
                        || box_bounds[3] < existing[1]
                        || box_bounds[1] > existing[3])
                });
                if collides {
                    continue;
                }

                accepted_boxes.push(box_bounds);
                labels.push((capital_index, x, y));
                break;
            }
        }

        self.cached_capital_labels = labels;
        self.cached_capital_labels_scale = scale;
    }

    fn draw_capital_flag(&self, image: Option<&HtmlImageElement>, iso: &str, x: f64, y: f64, animating: bool) {
        Self::draw_capital_flag_on_context(&self.ctx, &self.styles, image, iso, x, y, self.scale, animating);
    }

    fn draw_capital_flag_on_context(
        context: &CanvasRenderingContext2d,
        styles: &Styles,
        image: Option<&HtmlImageElement>,
        iso: &str,
        x: f64,
        y: f64,
        scale: f64,
        animating: bool,
    ) {
        let width = 14.0 / scale;
        let height = 9.0 / scale;
        let left = x - width / 2.0;
        let top = y - height / 2.0;

        if !animating {
            context.set_fill_style(&styles.flag_bg);
            context.fill_rect(
                left - 1.0 / scale,
                top - 1.0 / scale,
                width + 2.0 / scale,
                height + 2.0 / scale,
            );
        }

        if let Some(image) = image.filter(|flag| flag.complete() && flag.natural_width() > 0) {
            let _ = context
                .draw_image_with_html_image_element_and_dw_and_dh(image, left, top, width, height);
        } else {
            context.set_fill_style(&styles.flag_text);
            context.set_font(&format!("bold {}px sans-serif", 6.0 / scale));
            context.set_text_align("center");
            context.set_text_baseline("middle");
            let _ = context.fill_text(&iso.to_uppercase(), x, y);
            context.set_text_align("start");
            context.set_text_baseline("alphabetic");
        }

        if !animating {
            context.set_stroke_style(&styles.flag_bg);
            context.set_line_width(0.75 / scale);
            context.stroke_rect(left, top, width, height);
        }
    }

    fn project(&self, lng: f64, lat: f64) -> (f64, f64) {
        let x_norm = (lng + 180.0) / 360.0;
        let y_norm = (90.0 - lat) / 180.0;
        (x_norm * self.width, y_norm * self.height)
    }

    fn build_country_result(&self, c: &CachedCountry, wx: f64, wy: f64) -> JsValue {
        let raw_val = &c.raw;
        let mut nearest_city: Option<(&CachedCapital, f64)> = None;
        let c_iso = &c.iso;
        for cap in &self.capitals {
            if cap.flag_iso.to_lowercase() == *c_iso {
                let dx = cap.x - wx;
                let dy = cap.y - wy;
                let dist_sq = dx * dx + dy * dy;
                if nearest_city.is_none() || dist_sq < nearest_city.unwrap().1 {
                    nearest_city = Some((cap, dist_sq));
                }
            }
        }

        if let Some(source_obj) = raw_val.dyn_ref::<js_sys::Object>() {
            let target = js_sys::Object::new();
            let _ = js_sys::Object::assign(&target, source_obj);
            if let Some((cap, _)) = nearest_city {
                let _ = js_sys::Reflect::set(&target, &JsValue::from_str("selected_city"), &JsValue::from_str(&cap.name));
                let _ = js_sys::Reflect::set(&target, &JsValue::from_str("is_capital"), &JsValue::from_bool(cap.is_capital));
            }
            target.into()
        } else {
            raw_val.clone()
        }
    }

    pub fn get_country_at(&self, mouse_x: f64, mouse_y: f64) -> JsValue {
        // Titik klik dalam koordinat dunia (sama dengan koordinat cache)
        let mut wx = (mouse_x - self.offset_x) / self.scale;
        if self.horizontal_wrap {
            wx = wx.rem_euclid(self.width);
        }
        let wy = (mouse_y - self.offset_y) / self.scale;

        // 1. Prioritas Utama untuk Microstates & Enclave (Vatikan, San Marino, Monako, Liechtenstein, dsb):
        // Jika kursor pengguna berada dekat (dalam radius klik 18px layar) dari koordinat Vatikan/microstate,
        // langsung pilih negara mikro tersebut tanpa terhalang atau tertelan oleh poligon Italia!
        let micro_threshold = 22.0;
        let mut best_micro: Option<(&CachedCountry, f64)> = None;
        for c in &self.countries {
            // Deteksi negara mikro / pulau kecil (Vatikan 'va', San Marino 'sm', Monako 'mc', dsb)
            let is_micro = matches!(c.iso.as_str(), "va" | "sm" | "mc" | "li" | "ad" | "mt" | "sg" | "bh" | "tv" | "nr");
            if is_micro {
                if let (Some(lat), Some(lng)) = (c.lat, c.lng) {
                    let (x, y) = self.project(lng, lat);
                    let screen_x = x * self.scale + self.offset_x;
                    let screen_y = y * self.scale + self.offset_y;
                    let dx = if self.horizontal_wrap {
                        let world_width = self.width * self.scale;
                        (mouse_x - screen_x + world_width / 2.0).rem_euclid(world_width)
                            - world_width / 2.0
                    } else {
                        mouse_x - screen_x
                    };
                    let dy = mouse_y - screen_y;
                    let dist = (dx * dx + dy * dy).sqrt();
                    if dist <= micro_threshold {
                        if best_micro.is_none() || dist < best_micro.unwrap().1 {
                            best_micro = Some((c, dist));
                        }
                    }
                }
            }
        }
        if let Some((c, _)) = best_micro {
            return self.build_country_result(c, wx, wy);
        }

        // 2. Polygon-based detection (sudah diurutkan dari area poligon terkecil ke terbesar):
        // Lengkap dengan pengecekan Hole (interior ring): jika klik berada di dalam lubang poligon
        // (contohnya lubang Vatikan & San Marino di daratan Italia), maka Italia TIDAK akan mengklaim klik tersebut!
        for f in &self.features {
            if f.bbox[0] > wx || f.bbox[2] < wx || f.bbox[1] > wy || f.bbox[3] < wy {
                continue;
            }
            let hit = f.polys.iter().any(|poly| {
                let Some(outer) = poly.first() else { return false; };
                if !bbox_hits(&outer.bbox, wx, wy, wx, wy) || !point_in_ring(&outer.pts, wx, wy) {
                    return false;
                }
                // Jika titik berada di dalam salah satu interior hole (cincin ke-2 dst),
                // maka titik tersebut adalah lubang dan BUKAN bagian dari negara ini!
                for hole in poly.iter().skip(1) {
                    if bbox_hits(&hole.bbox, wx, wy, wx, wy) && point_in_ring(&hole.pts, wx, wy) {
                        return false;
                    }
                }
                true
            });
            if hit {
                if let Some(c) = self.countries.iter().find(|c| c.iso == f.iso) {
                    return self.build_country_result(c, wx, wy);
                }
            }
        }

        // 3. Fallback to dot-based detection (for tiny islands & uncaptured coords)
        let hit_threshold = 15.0;
        for c in &self.countries {
            if let (Some(lat), Some(lng)) = (c.lat, c.lng) {
                let (x, y) = self.project(lng, lat);
                let screen_x = x * self.scale + self.offset_x;
                let screen_y = y * self.scale + self.offset_y;
                let dx = if self.horizontal_wrap {
                    let world_width = self.width * self.scale;
                    (mouse_x - screen_x + world_width / 2.0).rem_euclid(world_width)
                        - world_width / 2.0
                } else {
                    mouse_x - screen_x
                };
                let dy = mouse_y - screen_y;
                if (dx * dx + dy * dy).sqrt() <= hit_threshold {
                    return self.build_country_result(c, wx, wy);
                }
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
            engine
                .borrow_mut()
                .set_selected_country(Some(iso), should_center);
        }
    });
}

#[wasm_bindgen]
pub fn set_show_province_borders_on_map(show: bool) {
    ACTIVE_ENGINE.with(|global_engine| {
        if let Some(engine) = global_engine.borrow().as_ref() {
            engine.borrow_mut().set_show_province_borders(show);
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
pub fn set_feature_colors_on_map(colors: Vec<JsValue>, beat_selected: bool) {
    ACTIVE_ENGINE.with(|global_engine| {
        if let Some(engine) = global_engine.borrow().as_ref() {
            engine
                .borrow_mut()
                .set_feature_colors(colors, beat_selected);
        }
    });
}

#[wasm_bindgen]
pub fn set_provinces_on_map(provinces_geojson: String) {
    ACTIVE_ENGINE.with(|global_engine| {
        if let Some(engine) = global_engine.borrow().as_ref() {
            engine.borrow_mut().set_provinces_data(&provinces_geojson);
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
    capitals_json: JsValue,
) -> Result<(), JsValue> {
    console_error_panic_hook::set_once();

    let window = web_sys::window().ok_or("no global window")?;
    let document = window.document().ok_or("no document on window")?;
    let canvas = document
        .get_element_by_id(&canvas_id)
        .ok_or("canvas not found")?;
    let canvas: HtmlCanvasElement = canvas.dyn_into::<HtmlCanvasElement>()?;

    let width = canvas.offset_width() as f64;
    let height = canvas.offset_height() as f64;
    canvas.set_width(width as u32);
    canvas.set_height(height as u32);

    let ctx = canvas
        .get_context("2d")?
        .ok_or("no context")?
        .dyn_into::<CanvasRenderingContext2d>()?;

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
            engine
                .borrow_mut()
                .handle_wheel(e.delta_y(), e.offset_x() as f64, e.offset_y() as f64);
        }) as Box<dyn FnMut(_)>);
        canvas.add_event_listener_with_callback("wheel", closure.as_ref().unchecked_ref())?;
        closure.forget();
    }

    {
        let engine = engine.clone();
        let canvas_for_pointer_capture = canvas.clone();
        let closure = Closure::wrap(Box::new(move |e: PointerEvent| {
            if e.is_primary() && (e.button() == 0 || e.button() == 2) {
                e.prevent_default();
                if let Err(error) = canvas_for_pointer_capture.set_pointer_capture(e.pointer_id()) {
                    web_sys::console::error_2(&"Failed to capture the map pointer.".into(), &error);
                }
                engine.borrow_mut().handle_mouse_down(
                    e.offset_x() as f64,
                    e.offset_y() as f64,
                    e.pointer_id(),
                );
            }
        }) as Box<dyn FnMut(_)>);
        canvas.add_event_listener_with_callback("pointerdown", closure.as_ref().unchecked_ref())?;
        closure.forget();
    }

    {
        let closure = Closure::wrap(Box::new(move |e: MouseEvent| {
            e.prevent_default();
        }) as Box<dyn FnMut(_)>);
        canvas.add_event_listener_with_callback("contextmenu", closure.as_ref().unchecked_ref())?;
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
                engine.borrow_mut().handle_mouse_move(
                    e.offset_x() as f64,
                    e.offset_y() as f64,
                    e.buttons(),
                    e.pointer_id(),
                );
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
        window
            .add_event_listener_with_callback("pointercancel", closure.as_ref().unchecked_ref())?;
        closure.forget();
    }

    // Animation Loop (render hanya jika dirty/animasi; requestAnimationFrame mengatur frame pacing)
    let f = Rc::new(RefCell::new(None::<Closure<dyn FnMut(f64)>>));
    let g = f.clone();
    let engine_render = engine.clone();
    *g.borrow_mut() = Some(Closure::wrap(Box::new(move |now: f64| {
        engine_render.borrow_mut().tick(now);
        let window = web_sys::window().unwrap();
        window
            .request_animation_frame(f.borrow().as_ref().unwrap().as_ref().unchecked_ref())
            .unwrap();
    }) as Box<dyn FnMut(f64)>));

    window.request_animation_frame(g.borrow().as_ref().unwrap().as_ref().unchecked_ref())?;

    Ok(())
}
