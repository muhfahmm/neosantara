with open('apps/src/app/page/map_system/map-data-rs/src/map.rs', 'r', encoding='utf-8') as f:
    text = f.read()

old_fn = """    fn build_country_result(&self, c: &CachedCountry, wx: f64, wy: f64) -> JsValue {
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
    }"""

new_fn = """    fn build_country_result(&self, c: &CachedCountry, wx: f64, wy: f64) -> JsValue {
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
    }"""

text = text.replace(old_fn, new_fn)

with open('apps/src/app/page/map_system/map-data-rs/src/map.rs', 'w', encoding='utf-8') as f:
    f.write(text)

print("Updated build_country_result with dyn_ref")

