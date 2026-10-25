use wasm_bindgen::prelude::*;

const LAND_SPEED: f64 = 360.0;
const NAVAL_SPEED: f64 = 240.0;
const AIR_SPEED: f64 = 720.0;

fn speed_for(group: &str) -> f64 {
    match group {
        "laut" => NAVAL_SPEED,
        "udara" => AIR_SPEED,
        _ => LAND_SPEED,
    }
}

#[wasm_bindgen]
pub fn prepare_unit_movement(
    target_x: f64,
    target_y: f64,
    world_width: f64,
    world_height: f64,
    group: &str,
) -> Vec<f64> {
    let x = if target_x.is_finite() {
        target_x.clamp(0.0, world_width.max(0.0))
    } else {
        0.0
    };
    let y = if target_y.is_finite() {
        target_y.clamp(0.0, world_height.max(0.0))
    } else {
        0.0
    };

    vec![x, y, speed_for(group)]
}

#[wasm_bindgen]
pub fn step_unit_movement(
    start_x: f64,
    start_y: f64,
    target_x: f64,
    target_y: f64,
    elapsed_ms: f64,
    delta_ms: f64,
    speed: f64,
    group: &str,
) -> Vec<f64> {
    let sx = finite_or_zero(start_x);
    let sy = finite_or_zero(start_y);
    let tx = finite_or_zero(target_x);
    let ty = finite_or_zero(target_y);
    let distance = (tx - sx).hypot(ty - sy);
    let effective_speed = if speed.is_finite() && speed > 0.0 {
        speed.min(speed_for(group))
    } else {
        speed_for(group)
    };
    let duration_ms = distance / effective_speed * 1000.0;
    let elapsed =
        (finite_or_zero(elapsed_ms) + finite_or_zero(delta_ms).max(0.0)).clamp(0.0, duration_ms);

    if distance <= f64::EPSILON || duration_ms <= f64::EPSILON || elapsed >= duration_ms {
        return vec![tx, ty, duration_ms, 1.0];
    }

    let progress = elapsed / duration_ms;
    let eased = progress * progress * (3.0 - 2.0 * progress);
    let arc = match group {
        "udara" => distance * 0.12 * (std::f64::consts::PI * progress).sin(),
        "laut" => distance * 0.035 * (std::f64::consts::PI * progress).sin(),
        // Unit darat: Garis lurus militer yang stabil dan realistis (tanpa kurva roller coaster)
        _ => distance * 0.003 * ((progress * 8.0).sin()),
    };
    let perpendicular_x = -(ty - sy) / distance;
    let perpendicular_y = (tx - sx) / distance;

    vec![
        sx + (tx - sx) * eased + perpendicular_x * arc,
        sy + (ty - sy) * eased + perpendicular_y * arc,
        elapsed,
        0.0,
    ]
}

fn finite_or_zero(value: f64) -> f64 {
    if value.is_finite() {
        value
    } else {
        0.0
    }
}

#[cfg(test)]
mod tests {
    use super::{prepare_unit_movement, step_unit_movement};

    #[test]
    fn targets_are_clamped_to_the_map() {
        assert_eq!(
            prepare_unit_movement(-50.0, 2500.0, 6400.0, 2400.0, "darat"),
            vec![0.0, 2400.0, 360.0],
        );
    }

    #[test]
    fn air_units_travel_faster_than_ground_and_naval_units() {
        let ground = step_unit_movement(0.0, 0.0, 360.0, 0.0, 0.0, 500.0, 360.0, "darat");
        let naval = step_unit_movement(0.0, 0.0, 360.0, 0.0, 0.0, 500.0, 240.0, "laut");
        let air = step_unit_movement(0.0, 0.0, 360.0, 0.0, 0.0, 500.0, 720.0, "udara");

        assert!(air[0] > ground[0]);
        assert!(ground[0] > naval[0]);
    }

    #[test]
    fn movement_finishes_at_the_requested_destination() {
        let result = step_unit_movement(20.0, 30.0, 380.0, 30.0, 0.0, 5000.0, 360.0, "darat");

        assert_eq!(result, vec![380.0, 30.0, 1000.0, 1.0]);
    }
}
