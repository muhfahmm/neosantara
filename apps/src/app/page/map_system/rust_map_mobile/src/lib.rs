use serde::{Deserialize, Serialize};
use std::cell::RefCell;
use wasm_bindgen::prelude::*;
use wasm_bindgen::JsCast;
use web_sys::{CanvasRenderingContext2d, HtmlCanvasElement, Path2d};

#[derive(Deserialize, Serialize, Clone)]
pub struct SimplifiedPolygon {
    pub iso: String,
    pub color: String,
    pub points: Vec<(f32, f32)>, // [x, y] normalized 0.0 .. 1.0
}

struct CachedMobileFeature {
    iso: String,
    color: JsValue,
    path: Path2d,
    bbox: (f32, f32, f32, f32), // (min_x, min_y, max_x, max_y)
}

thread_local! {
    static MOBILE_FEATURES: RefCell<Vec<CachedMobileFeature>> = RefCell::new(Vec::new());
    static ACTIVE_CANVAS_ID: RefCell<String> = RefCell::new(String::new());
}

#[wasm_bindgen]
pub fn init_panic_hook() {
    console_error_panic_hook::set_once();
}

/// Decimate dense polygon rings for mobile GPU/CPU performance
pub fn decimate_ring(points: &[(f32, f32)], tolerance_sq: f32) -> Vec<(f32, f32)> {
    if points.len() <= 8 {
        return points.to_vec();
    }
    let mut out = Vec::with_capacity(points.len() / 2 + 2);
    let mut last = points[0];
    out.push(last);

    for &pt in &points[1..points.len() - 1] {
        let dx = pt.0 - last.0;
        let dy = pt.1 - last.1;
        if dx * dx + dy * dy >= tolerance_sq {
            out.push(pt);
            last = pt;
        }
    }
    if let Some(&end) = points.last() {
        out.push(end);
    }
    out
}

/// Prebuild cached Path2d geometry for mobile canvas
#[wasm_bindgen]
pub fn load_mobile_polygons(polygons_js: JsValue, width: f32, height: f32) -> Result<usize, JsValue> {
    let polygons: Vec<SimplifiedPolygon> = serde_wasm_bindgen::from_value(polygons_js)?;
    let mut cached = Vec::with_capacity(polygons.len());

    for poly in polygons {
        let simplified = decimate_ring(&poly.points, 0.000002);
        if simplified.len() < 3 {
            continue;
        }
        let path = Path2d::new()?;
        let mut min_x = f32::MAX;
        let mut min_y = f32::MAX;
        let mut max_x = f32::MIN;
        let mut max_y = f32::MIN;

        for (i, &(nx, ny)) in simplified.iter().enumerate() {
            let x = nx * width;
            let y = ny * height;
            if x < min_x { min_x = x; }
            if y < min_y { min_y = y; }
            if x > max_x { max_x = x; }
            if y > max_y { max_y = y; }
            if i == 0 {
                path.move_to(x as f64, y as f64);
            } else {
                path.line_to(x as f64, y as f64);
            }
        }
        path.close_path();

        cached.push(CachedMobileFeature {
            iso: poly.iso.to_lowercase(),
            color: JsValue::from_str(&poly.color),
            path,
            bbox: (min_x, min_y, max_x, max_y),
        });
    }

    let count = cached.len();
    MOBILE_FEATURES.with(|f| {
        *f.borrow_mut() = cached;
    });

    Ok(count)
}

/// Inisialisasi cepat khusus mobile: merender poligon yang sudah di-cache ke Path2d
#[wasm_bindgen]
pub fn render_mobile_map_instant(
    canvas_id: &str,
    width: f64,
    height: f64,
    selected_iso: Option<String>,
) -> Result<bool, JsValue> {
    let window = web_sys::window().ok_or("No window")?;
    let document = window.document().ok_or("No document")?;
    let canvas = document
        .get_element_by_id(canvas_id)
        .ok_or("Canvas element not found")?
        .dyn_into::<HtmlCanvasElement>()?;

    canvas.set_width(width as u32);
    canvas.set_height(height as u32);

    let ctx = canvas
        .get_context("2d")?
        .ok_or("No 2d context")?
        .dyn_into::<CanvasRenderingContext2d>()?;

    // Background laut
    ctx.set_fill_style_str("#0b192c");
    ctx.fill_rect(0.0, 0.0, width, height);

    let selected_iso_lower = selected_iso.map(|s| s.to_lowercase());
    let w_f32 = width as f32;
    let h_f32 = height as f32;

    MOBILE_FEATURES.with(|features_ref| {
        let features = features_ref.borrow();
        ctx.set_stroke_style_str("#022c22");
        ctx.set_line_width(0.75);

        for feat in features.iter() {
            let (min_x, min_y, max_x, max_y) = feat.bbox;
            if max_x < 0.0 || min_x > w_f32 || max_y < 0.0 || min_y > h_f32 {
                continue;
            }
            if let Some(ref sel) = selected_iso_lower {
                if &feat.iso == sel {
                    ctx.set_fill_style_str("#10b981");
                } else {
                    ctx.set_fill_style(&feat.color);
                }
            } else {
                ctx.set_fill_style(&feat.color);
            }
            ctx.fill_with_path_2d(&feat.path);
            ctx.stroke_with_path_2d(&feat.path);
        }
    });

    ACTIVE_CANVAS_ID.with(|id| {
        *id.borrow_mut() = canvas_id.to_string();
    });

    Ok(true)
}
