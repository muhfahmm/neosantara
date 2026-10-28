with open('apps/src/app/page/map_system/map-data-rs/src/map.rs', 'r', encoding='utf-8') as f:
    text = f.read()

helper_method = """    fn build_country_result(&self, c: &CachedCountry, wx: f64, wy: f64) -> JsValue {
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

        if let Ok(obj) = js_sys::Object::assign(&js_sys::Object::new(), raw_val).dyn_into::<js_sys::Object>() {
            if let Some((cap, _)) = nearest_city {
                let _ = js_sys::Reflect::set(&obj, &JsValue::from_str("selected_city"), &JsValue::from_str(&cap.name));
                let _ = js_sys::Reflect::set(&obj, &JsValue::from_str("is_capital"), &JsValue::from_bool(cap.is_capital));
            }
            obj.into()
        } else {
            raw_val.clone()
        }
    }

    pub fn get_country_at(&self, mouse_x: f64, mouse_y: f64) -> JsValue {"""

text = text.replace(
    "    pub fn get_country_at(&self, mouse_x: f64, mouse_y: f64) -> JsValue {",
    helper_method,
    1
)

# Now in get_country_at:
# Replace the 3 returns:
# 1) if let Some((c, _)) = best_micro { return c.raw.clone(); }
# -> if let Some((c, _)) = best_micro { return self.build_country_result(c, wx, wy); }

text = text.replace(
    "if let Some((c, _)) = best_micro {\n            return c.raw.clone();\n        }",
    "if let Some((c, _)) = best_micro {\n            return self.build_country_result(c, wx, wy);\n        }"
)

# 2) if let Some(c) = self.countries.iter().find(|c| c.iso == f.iso) {\n                    return c.raw.clone();\n                }
# -> if let Some(c) = self.countries.iter().find(|c| c.iso == f.iso) {\n                    return self.build_country_result(c, wx, wy);\n                }
text = text.replace(
    "if let Some(c) = self.countries.iter().find(|c| c.iso == f.iso) {\n                    return c.raw.clone();\n                }",
    "if let Some(c) = self.countries.iter().find(|c| c.iso == f.iso) {\n                    return self.build_country_result(c, wx, wy);\n                }"
)

# 3) Fallback
text = text.replace(
    "if (dx * dx + dy * dy).sqrt() <= hit_threshold {\n                    return c.raw.clone();\n                }",
    "if (dx * dx + dy * dy).sqrt() <= hit_threshold {\n                    return self.build_country_result(c, wx, wy);\n                }"
)

with open('apps/src/app/page/map_system/map-data-rs/src/map.rs', 'w', encoding='utf-8') as f:
    f.write(text)

print("Finished modifying map.rs")

