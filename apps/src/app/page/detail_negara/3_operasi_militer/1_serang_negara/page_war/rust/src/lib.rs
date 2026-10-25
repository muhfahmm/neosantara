use wasm_bindgen::prelude::*;

fn clamp(value: f64, min: f64, max: f64) -> f64 {
    value.max(min).min(max)
}

fn clamp_view(
    x: f64,
    y: f64,
    width: f64,
    aspect: f64,
    min_width: f64,
    max_width: f64,
    world_width: f64,
    world_height: f64,
) -> [f64; 4] {
    let safe_aspect = if aspect.is_finite() && aspect > 0.0 {
        aspect
    } else {
        1.0
    };
    let safe_max_width = max_width.max(min_width);
    let width = clamp(width, min_width, safe_max_width);
    let height = width / safe_aspect;
    let x = clamp(x, 0.0, (world_width - width).max(0.0));
    let y = if height >= world_height {
        (world_height - height) / 2.0
    } else {
        clamp(y, 0.0, world_height - height)
    };

    [x, y, width, height]
}

fn view_scale(
    box_width: f64,
    box_height: f64,
    view_width: f64,
    view_height: f64,
) -> (f64, f64, f64) {
    let scale = (box_width / view_width).min(box_height / view_height);
    let offset_x = (box_width - view_width * scale) / 2.0;
    let offset_y = (box_height - view_height * scale) / 2.0;
    (scale, offset_x, offset_y)
}

#[wasm_bindgen]
pub fn zoom_view(
    x: f64,
    y: f64,
    width: f64,
    height: f64,
    box_width: f64,
    box_height: f64,
    pointer_x: f64,
    pointer_y: f64,
    factor: f64,
    min_width: f64,
    max_width: f64,
    world_width: f64,
    world_height: f64,
) -> Vec<f64> {
    if box_width <= 0.0 || box_height <= 0.0 || width <= 0.0 || height <= 0.0 {
        return vec![x, y, width, height];
    }

    let (scale, offset_x, offset_y) = view_scale(box_width, box_height, width, height);
    let zoom_factor = if factor.is_finite() && factor > 0.0 {
        factor
    } else {
        1.0
    };
    let next_width = width / zoom_factor;
    let next_height = next_width / (box_width / box_height);
    let next_scale = (box_width / next_width).min(box_height / next_height);
    let world_x = x + (pointer_x - offset_x) / scale;
    let world_y = y + (pointer_y - offset_y) / scale;
    let next_x = world_x - (pointer_x - offset_x) / next_scale;
    let next_y = world_y - (pointer_y - offset_y) / next_scale;

    clamp_view(
        next_x,
        next_y,
        next_width,
        box_width / box_height,
        min_width,
        max_width,
        world_width,
        world_height,
    )
    .to_vec()
}

#[wasm_bindgen]
pub fn pan_view(
    x: f64,
    y: f64,
    width: f64,
    height: f64,
    box_width: f64,
    box_height: f64,
    delta_x: f64,
    delta_y: f64,
    min_width: f64,
    max_width: f64,
    world_width: f64,
    world_height: f64,
) -> Vec<f64> {
    if box_width <= 0.0 || box_height <= 0.0 || width <= 0.0 || height <= 0.0 {
        return vec![x, y, width, height];
    }

    let (scale, _, _) = view_scale(box_width, box_height, width, height);
    clamp_view(
        x - delta_x / scale,
        y - delta_y / scale,
        width,
        box_width / box_height,
        min_width,
        max_width,
        world_width,
        world_height,
    )
    .to_vec()
}

#[cfg(test)]
mod tests {
    use super::{pan_view, zoom_view};

    #[test]
    fn zoom_keeps_the_world_point_under_the_cursor() {
        let result = zoom_view(
            200.0, 100.0, 800.0, 400.0, 800.0, 400.0, 300.0, 150.0, 2.0, 100.0, 1600.0, 2000.0,
            1000.0,
        );

        assert_eq!(result, vec![350.0, 175.0, 400.0, 200.0]);
    }

    #[test]
    fn panning_is_clamped_to_world_bounds() {
        let result = pan_view(
            0.0, 0.0, 800.0, 400.0, 800.0, 400.0, 200.0, 100.0, 100.0, 1600.0, 2000.0, 1000.0,
        );

        assert_eq!(result, vec![0.0, 0.0, 800.0, 400.0]);
    }
}
