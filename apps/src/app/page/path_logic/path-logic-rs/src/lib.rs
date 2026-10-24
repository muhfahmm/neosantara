use wasm_bindgen::prelude::*;

const EARTH_RADIUS_KM: f64 = 6371.0;

fn route_control_point(
    start_x: f64,
    start_y: f64,
    end_x: f64,
    end_y: f64,
    curvature: f64,
) -> (f64, f64) {
    let dx = end_x - start_x;
    let dy = end_y - start_y;
    let distance = (dx * dx + dy * dy).sqrt().max(1.0);
    let midpoint_x = (start_x + end_x) / 2.0;
    let midpoint_y = (start_y + end_y) / 2.0;
    (
        midpoint_x - (dy / distance) * curvature * distance,
        midpoint_y + (dx / distance) * curvature * distance,
    )
}

#[wasm_bindgen]
pub fn project_map_point(
    latitude: f64,
    longitude: f64,
    rect_left: f64,
    rect_top: f64,
    rect_width: f64,
    rect_height: f64,
    canvas_width: f64,
    canvas_height: f64,
    scale: f64,
    offset_x: f64,
    offset_y: f64,
    world_css_width: f64,
    window_width: f64,
) -> Vec<f64> {
    let canvas_width = canvas_width.max(1.0);
    let canvas_height = canvas_height.max(1.0);
    let x = (longitude + 180.0) / 360.0 * canvas_width;
    let y = (90.0 - latitude) / 180.0 * canvas_height;
    let mut screen_x = rect_left + (x * scale + offset_x) * (rect_width / canvas_width);
    let screen_y = rect_top + (y * scale + offset_y) * (rect_height / canvas_height);

    if world_css_width > 0.0 {
        let shift_copies = ((window_width / 2.0 - screen_x) / world_css_width).round();
        screen_x += shift_copies * world_css_width;
    }
    vec![screen_x, screen_y]
}

#[wasm_bindgen]
pub fn project_route_geometry(
    origin_latitude: f64,
    origin_longitude: f64,
    target_latitude: f64,
    target_longitude: f64,
    rect_left: f64,
    rect_top: f64,
    rect_width: f64,
    rect_height: f64,
    canvas_width: f64,
    canvas_height: f64,
    scale: f64,
    offset_x: f64,
    offset_y: f64,
    world_css_width: f64,
    window_width: f64,
    curvature: f64,
) -> Vec<f64> {
    let canvas_width = canvas_width.max(1.0);
    let canvas_height = canvas_height.max(1.0);
    let project = |latitude: f64, longitude: f64| {
        let x = (longitude + 180.0) / 360.0 * canvas_width;
        let y = (90.0 - latitude) / 180.0 * canvas_height;
        (
            rect_left + (x * scale + offset_x) * (rect_width / canvas_width),
            rect_top + (y * scale + offset_y) * (rect_height / canvas_height),
        )
    };

    let (mut start_x, start_y) = project(origin_latitude, origin_longitude);
    let (mut end_x, end_y) = project(target_latitude, target_longitude);
    if world_css_width > 0.0 {
        let mut difference = end_x - start_x;
        difference = (difference + world_css_width / 2.0).rem_euclid(world_css_width)
            - world_css_width / 2.0;
        end_x = start_x + difference;
        let route_center = (start_x + end_x) / 2.0;
        let shift =
            ((window_width / 2.0 - route_center) / world_css_width).round() * world_css_width;
        start_x += shift;
        end_x += shift;
    }

    let (control_x, control_y) = route_control_point(start_x, start_y, end_x, end_y, curvature);
    vec![start_x, start_y, end_x, end_y, control_x, control_y]
}

#[wasm_bindgen]
pub fn quadratic_motion(
    start_x: f64,
    start_y: f64,
    control_x: f64,
    control_y: f64,
    end_x: f64,
    end_y: f64,
    progress: f64,
) -> Vec<f64> {
    let progress = progress.clamp(0.0, 1.0);
    let inverse = 1.0 - progress;
    let x = inverse * inverse * start_x
        + 2.0 * inverse * progress * control_x
        + progress * progress * end_x;
    let y = inverse * inverse * start_y
        + 2.0 * inverse * progress * control_y
        + progress * progress * end_y;
    let tangent_x = 2.0 * inverse * (control_x - start_x) + 2.0 * progress * (end_x - control_x);
    let tangent_y = 2.0 * inverse * (control_y - start_y) + 2.0 * progress * (end_y - control_y);
    vec![x, y, tangent_y.atan2(tangent_x)]
}

/// Zero-allocation in-place quadratic motion writing directly into a shared Float64Array buffer:
/// out[0] = x
/// out[1] = y
/// out[2] = angle_deg (in degrees, ready for SVG transform)
#[wasm_bindgen]
pub fn quadratic_motion_fast(
    start_x: f64,
    start_y: f64,
    control_x: f64,
    control_y: f64,
    end_x: f64,
    end_y: f64,
    progress: f64,
    out: &mut [f64],
) {
    if out.len() < 3 {
        return;
    }
    let progress = progress.clamp(0.0, 1.0);
    let inverse = 1.0 - progress;
    let x = inverse * inverse * start_x
        + 2.0 * inverse * progress * control_x
        + progress * progress * end_x;
    let y = inverse * inverse * start_y
        + 2.0 * inverse * progress * control_y
        + progress * progress * end_y;
    let tangent_x = 2.0 * inverse * (control_x - start_x) + 2.0 * progress * (end_x - control_x);
    let tangent_y = 2.0 * inverse * (control_y - start_y) + 2.0 * progress * (end_y - control_y);
    out[0] = x;
    out[1] = y;
    out[2] = tangent_y.atan2(tangent_x) * 180.0 / std::f64::consts::PI;
}

#[wasm_bindgen]
pub fn great_circle_distance_km(
    origin_latitude: f64,
    origin_longitude: f64,
    target_latitude: f64,
    target_longitude: f64,
) -> f64 {
    let radians = std::f64::consts::PI / 180.0;
    let latitude_difference = (target_latitude - origin_latitude) * radians;
    let longitude_difference = (target_longitude - origin_longitude) * radians;
    let origin_latitude = origin_latitude * radians;
    let target_latitude = target_latitude * radians;
    let haversine = (latitude_difference / 2.0).sin().powi(2)
        + origin_latitude.cos()
            * target_latitude.cos()
            * (longitude_difference / 2.0).sin().powi(2);
    EARTH_RADIUS_KM * 2.0 * haversine.sqrt().atan2((1.0 - haversine).max(0.0).sqrt())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn projects_map_point_and_wraps_it_to_nearest_world_copy() {
        let point = project_map_point(
            0.0, 0.0, 10.0, 20.0, 360.0, 180.0, 360.0, 180.0, 1.0, 0.0, 0.0, 360.0, 720.0,
        );
        assert_eq!(point, vec![190.0, 110.0]);
    }

    #[test]
    fn chooses_short_route_across_antimeridian() {
        let route = project_route_geometry(
            0.0, 170.0, 0.0, -170.0, 0.0, 0.0, 360.0, 180.0, 360.0, 180.0, 1.0, 0.0, 0.0, 360.0,
            180.0, 0.18,
        );
        assert!(route[2] - route[0] > 0.0);
        assert!((route[2] - route[0]).abs() < 30.0);
    }

    #[test]
    fn quadratic_motion_returns_point_and_direction() {
        let motion = quadratic_motion(0.0, 0.0, 50.0, 100.0, 100.0, 0.0, 0.5);
        assert_eq!(motion[0], 50.0);
        assert_eq!(motion[1], 50.0);
        assert!(motion[2].abs() < 1e-12);
    }

    #[test]
    fn great_circle_distance_is_zero_for_identical_points() {
        assert_eq!(great_circle_distance_km(12.0, 34.0, 12.0, 34.0), 0.0);
    }
}
