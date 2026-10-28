with open('apps/src/app/page/map_system/map-data-rs/src/map.rs', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Update CapitalData
text = text.replace(
'''#[derive(Deserialize)]
struct CapitalData {
    capital: String,
    lat: f64,
    lng: f64,
    iso: String,
}''',
'''#[derive(Deserialize)]
struct CapitalData {
    capital: String,
    lat: f64,
    lng: f64,
    iso: String,
    #[serde(default)]
    is_major_city: Option<bool>,
}'''
)

# 2. Update CachedCapital
text = text.replace(
'''struct CachedCapital {
    name: String,
    x: f64,
    y: f64,
    flag_iso: String,
    flag_idx: Option<usize>,
}''',
'''struct CachedCapital {
    name: String,
    x: f64,
    y: f64,
    flag_iso: String,
    flag_idx: Option<usize>,
    is_capital: bool,
}'''
)

# 3. Update Styles struct
text = text.replace(
'''struct Styles {
    bg: JsValue,
    sel_fill: JsValue,
    sel_stroke: JsValue,
    stroke: JsValue,
    province_stroke: JsValue,
    white: JsValue,
    flag_bg: JsValue,
    flag_text: JsValue,
    label_outline: JsValue,
}''',
'''struct Styles {
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
}'''
)

# 4. Update Styles initialization
text = text.replace(
'''            styles: Styles {
                bg: JsValue::from_str("#0f244a"),
                sel_fill: JsValue::from_str("#00FFAA"),
                sel_stroke: JsValue::from_str("#34d399"),
                stroke: JsValue::from_str("rgba(255, 255, 255, 0.75)"),
                province_stroke: JsValue::from_str("rgba(255, 255, 255, 0.55)"),
                white: JsValue::from_str("white"),
                flag_bg: JsValue::from_str("#0f172a"),
                flag_text: JsValue::from_str("#fbbf24"),
                label_outline: JsValue::from_str("rgba(0, 0, 0, 0.85)"),
            },''',
'''            styles: Styles {
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
            },'''
)

# 5. Update set_capitals mapping
text = text.replace(
'''                CachedCapital {
                    name: c.capital,
                    x: ((c.lng + 180.0) / 360.0) * w,
                    y: ((90.0 - c.lat) / 180.0) * h,
                    flag_iso,
                    flag_idx,
                }''',
'''                let is_capital = !c.is_major_city.unwrap_or(false);
                CachedCapital {
                    name: c.capital,
                    x: ((c.lng + 180.0) / 360.0) * w,
                    y: ((90.0 - c.lat) / 180.0) * h,
                    flag_iso,
                    flag_idx,
                    is_capital,
                }'''
)

# 6. Prioritize capitals in layout so capital labels are always shown first over major cities
text = text.replace(
'''        for (capital_index, capital) in self.capitals.iter().enumerate() {''',
'''        let mut indices: Vec<usize> = (0..self.capitals.len()).collect();
        indices.sort_by_key(|&idx| if self.capitals[idx].is_capital { 0 } else { 1 });

        for capital_index in indices {
            let capital = &self.capitals[capital_index];'''
)

# 7. Update draw_capitals rendering for font color and style
text = text.replace(
'''        let font_size = (8.0 + (self.scale - 1.0) * 0.5) / self.scale;
        self.ctx
            .set_font(&format!("bold {}px sans-serif", font_size));
        self.ctx.set_line_width(2.5 / self.scale);
        self.ctx.set_stroke_style(&self.styles.label_outline);
        self.ctx.set_fill_style(&self.styles.white);

        for &(capital_index, x, y) in &self.cached_capital_labels {
            let Some(capital) = self.capitals.get(capital_index) else {
                continue;
            };
            if capital.x < vx0 - margin
                || capital.x > vx1 + margin
                || capital.y < vy0 - margin
                || capital.y > vy1 + margin
            {
                continue;
            }
            let _ = self.ctx.stroke_text(&capital.name, x, y);
            let _ = self.ctx.fill_text(&capital.name, x, y);
        }''',
'''        let font_size = (8.0 + (self.scale - 1.0) * 0.5) / self.scale;
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
        }'''
)

with open('apps/src/app/page/map_system/map-data-rs/src/map.rs', 'w', encoding='utf-8') as f:
    f.write(text)

print('Successfully updated map.rs')

