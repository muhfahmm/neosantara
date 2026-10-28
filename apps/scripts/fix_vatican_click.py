P = 'apps/src/app/page/map_system/map-data-rs/src/map.rs'
code = open(P, 'r', encoding='utf-8').read()

# 1. Saat set_data, urutkan self.features dari yang area bbox-nya terkecil ke terbesar!
# Dengan demikian negara mikro / enclave (Vatikan, San Marino, Monako, Lesotho, Liechtenstein, dll)
# SELALU dievaluasi dan dicocokkan lebih dulu daripada negara induk raksasa yang melingkupinya (Italia, Afrika Selatan, Prancis)!
old_set_features = "        self.features = out;\n        self.rebuild_feature_grid();"
new_set_features = """        // Urutkan features berdasarkan luas bbox (terkecil dulu).
        // Hal ini sangat penting untuk enclave & microstates (seperti Vatikan & San Marino di dalam Italia,
        // Lesotho di dalam Afrika Selatan, Monako di Prancis) agar saat diklik, negara kecil yang ada di dalam
        // selalu terdeteksi lebih dulu sebelum poligon negara besar di luarnya!
        out.sort_by(|a, b| {
            let area_a = (a.bbox[2] - a.bbox[0]) * (a.bbox[3] - a.bbox[1]);
            let area_b = (b.bbox[2] - b.bbox[0]) * (b.bbox[3] - b.bbox[1]);
            area_a.partial_cmp(&area_b).unwrap_or(std::cmp::Ordering::Equal)
        });
        self.features = out;
        self.rebuild_feature_grid();"""

assert old_set_features in code, "old_set_features not found"
code = code.replace(old_set_features, new_set_features, 1)

# 2. Perbaiki get_country_at agar mendukung:
# a. Prioritas deteksi titik ibukota/enclave terdekat untuk microstates (Vatikan, Monako, San Marino, dsb) jika klik dekat dengan pin/pusatnya
# b. Hole detection: jika poligon memiliki inner ring (hole), titik yang berada di dalam hole diabaikan oleh negara besar tersebut!
old_get_country = """    pub fn get_country_at(&self, mouse_x: f64, mouse_y: f64) -> JsValue {
        // Titik klik dalam koordinat dunia (sama dengan koordinat cache)
        let mut wx = (mouse_x - self.offset_x) / self.scale;
        if self.horizontal_wrap {
            wx = wx.rem_euclid(self.width);
        }
        let wy = (mouse_y - self.offset_y) / self.scale;

        // 1. Polygon-based detection (bbox dulu, O(1) per negara)
        for f in &self.features {
            if f.bbox[0] > wx || f.bbox[2] < wx || f.bbox[1] > wy || f.bbox[3] < wy {
                continue;
            }
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
                    (mouse_x - screen_x + world_width / 2.0).rem_euclid(world_width)
                        - world_width / 2.0
                } else {
                    mouse_x - screen_x
                };
                let dy = mouse_y - screen_y;
                if (dx * dx + dy * dy).sqrt() <= hit_threshold {
                    return c.raw.clone();
                }
            }
        }
        JsValue::NULL
    }"""

new_get_country = """    pub fn get_country_at(&self, mouse_x: f64, mouse_y: f64) -> JsValue {
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
            return c.raw.clone();
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
                    return c.raw.clone();
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
                    return c.raw.clone();
                }
            }
        }
        JsValue::NULL
    }"""

assert old_get_country in code, "old_get_country not found"
code = code.replace(old_get_country, new_get_country, 1)

open(P, 'w', encoding='utf-8').write(code)
print("Berhasil memperbarui deteksi klik Vatikan & enclave di map.rs!")

