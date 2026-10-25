use wasm_bindgen::prelude::*;

fn base_attack_range(group: &str, kind: &str) -> f64 {
    match kind {
        "artileriBerat" => 900.0,
        "peluncurRoket" => 1_250.0,
        "pesawatPengebom" | "jetTempurSiluman" => 1_100.0,
        "jetTempurInterceptor" | "droneKamikaze" => 950.0,
        "kapalInduk" | "kapalIndukNuklir" => 1_000.0,
        "kapalSelamNuklir" => 850.0,
        "kapalSelamReguler" | "destroyer" => 750.0,
        "helikopterSerang" => 650.0,
        "pesawatPengintai" | "droneIntaiUav" => 550.0,
        "pesawatAngkut" | "kapalLogistik" => 300.0,
        _ => match group {
            "udara" => 900.0,
            "laut" => 700.0,
            _ => 420.0,
        },
    }
}

#[wasm_bindgen]
pub fn calculate_attack_radius(strength: f64, group: &str, kind: &str) -> f64 {
    let safe_strength = if strength.is_finite() {
        strength.max(0.0)
    } else {
        0.0
    };
    let strength_factor = 1.0 + (safe_strength + 1.0).ln().min(6.0) / 12.0;
    base_attack_range(group, kind) * strength_factor
}

#[wasm_bindgen]
pub fn is_target_in_attack_range(
    origin_x: f64,
    origin_y: f64,
    target_x: f64,
    target_y: f64,
    radius: f64,
) -> bool {
    if !origin_x.is_finite()
        || !origin_y.is_finite()
        || !target_x.is_finite()
        || !target_y.is_finite()
        || !radius.is_finite()
        || radius < 0.0
    {
        return false;
    }

    let dx = target_x - origin_x;
    let dy = target_y - origin_y;
    dx * dx + dy * dy <= radius * radius
}

#[cfg(test)]
mod tests {
    use super::{calculate_attack_radius, is_target_in_attack_range};

    #[test]
    fn stronger_units_have_a_wider_attack_radius() {
        assert!(
            calculate_attack_radius(10_000.0, "darat", "tank")
                > calculate_attack_radius(10.0, "darat", "tank")
        );
    }

    #[test]
    fn artillery_has_a_longer_range_than_standard_ground_units() {
        assert!(
            calculate_attack_radius(100.0, "darat", "artileriBerat")
                > calculate_attack_radius(100.0, "darat", "infanteri")
        );
    }

    #[test]
    fn target_range_uses_world_distance() {
        assert!(is_target_in_attack_range(0.0, 0.0, 3.0, 4.0, 5.0));
        assert!(!is_target_in_attack_range(0.0, 0.0, 3.0, 4.0, 4.9));
    }
}
