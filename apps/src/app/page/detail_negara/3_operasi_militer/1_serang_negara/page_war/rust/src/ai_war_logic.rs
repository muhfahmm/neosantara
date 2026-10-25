use wasm_bindgen::prelude::*;

/// Mengecek apakah sebuah titik (x, y) telah melewati batas tengah ke wilayah musuh.
/// Untuk peta darat: batas tengah X berkisar ~3150-3240. Jika player menyerang ke kanan (X > boundary_x),
/// maka unit player masuk ke wilayah pertahanan lawan.
/// map_type: "land" | "sea"
/// player_side: "attacker" (player di barat/kiri bergerak ke timur/kanan) atau "defender"
#[wasm_bindgen]
pub fn check_boundary_cross(
    unit_x: f64,
    unit_y: f64,
    map_type: &str,
    player_side: &str,
) -> bool {
    let boundary_x = match map_type {
        "sea" => 4400.0,
        _ => {
            // Evaluasi kurva garis tengah land war:
            // x berkisar antara 3040 - 3240 tergantung y
            let t = (unit_y / 2400.0).clamp(0.0, 1.0);
            3160.0 + (t * std::f64::consts::PI * 2.0).sin() * 80.0
        }
    };

    if player_side == "attacker" {
        unit_x > boundary_x
    } else {
        unit_x < boundary_x
    }
}

/// Menghitung respon AI / musuh saat unit penyerang terdeteksi melintasi garis perbatasan.
/// Mengembalikan Float64Array berisi perintah respon dan formasi unit perlawanan:
/// [
///   should_scramble (1.0 | 0.0),
///   alert_level (1.0 = Kuning, 2.0 = Oranye, 3.0 = Merah/Kritis),
///   spawn_infantry_count,
///   spawn_tank_count,
///   spawn_apc_count,
///   spawn_origin_x,
///   spawn_origin_y,
///   intercept_target_x,
///   intercept_target_y
/// ]
#[wasm_bindgen]
pub fn calculate_ai_border_response(
    invader_x: f64,
    invader_y: f64,
    invader_group: &str,
    map_type: &str,
    player_side: &str,
    threat_quantity: f64,
) -> Vec<f64> {
    let is_incursion = check_boundary_cross(invader_x, invader_y, map_type, player_side);
    if !is_incursion {
        return vec![0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0];
    }

    // Hitung level ancaman berdasarkan seberapa jauh invasi masuk dan jenis grup unit
    let (hq_x, hq_y, base_x, base_y) = if map_type == "sea" {
        (6600.0, 3050.0, 7250.0, 3530.0)
    } else {
        (5700.0, 1880.0, 5150.0, 1350.0)
    };

    let dist_to_hq = (invader_x - hq_x).hypot(invader_y - hq_y);
    let alert_level = if dist_to_hq < 1200.0 {
        3.0 // Merah: Dekat markas besar musuh
    } else if dist_to_hq < 2200.0 {
        2.0 // Oranye: Mengancam pangkalan / barak militer
    } else {
        1.0 // Kuning: Baru melewati batas tengah
    };

    // Proporsi pasukan reaksi cepat (QRF - Quick Reaction Force) musuh
    let mult = (threat_quantity / 10000.0).clamp(1.0, 5.0) * alert_level;
    let (inf_cnt, tank_cnt, apc_cnt) = match invader_group {
        "udara" => {
            // Jika pesawat user masuk, AI mengerahkan kendaraan tempur anti-udara/taktis & pertahanan darat
            (25000.0 * mult, 60.0 * mult, 120.0 * mult)
        }
        "darat" => {
            // Jika infanteri/tank user masuk, musuh memobilisasi tank tempur & barak infanteri
            (40000.0 * mult, 140.0 * mult, 90.0 * mult)
        }
        _ => {
            (20000.0 * mult, 50.0 * mult, 50.0 * mult)
        }
    };

    // Titik keluar pasukan musuh (dari Barak Militer musuh atau HQ musuh)
    let spawn_x = base_x;
    let spawn_y = base_y;

    // Koordinat intersepsi musuh diarahkan ke posisi invader
    let intercept_x = invader_x + 80.0;
    let intercept_y = invader_y;

    vec![
        1.0, // should_scramble
        alert_level,
        inf_cnt.round(),
        tank_cnt.round(),
        apc_cnt.round(),
        spawn_x,
        spawn_y,
        intercept_x,
        intercept_y,
    ]
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_boundary_detection() {
        // Pada land map, x > 3300 berada di wilayah musuh untuk attacker
        assert!(check_boundary_cross(3500.0, 1000.0, "land", "attacker"));
        assert!(!check_boundary_cross(2800.0, 1000.0, "land", "attacker"));
    }

    #[test]
    fn test_ai_response_scramble() {
        let resp = calculate_ai_border_response(4200.0, 1200.0, "udara", "land", "attacker", 50000.0);
        assert_eq!(resp[0], 1.0); // Scramble triggered
        assert!(resp[1] >= 1.0);  // Alert level set
        assert!(resp[2] > 0.0);   // Infantry spawned
        assert!(resp[3] > 0.0);   // Tanks spawned
    }
}
