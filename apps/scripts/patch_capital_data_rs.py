with open('apps/src/app/page/map_system/map-data-rs/src/map.rs', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Add is_capital to CapitalData
text = text.replace(
"""#[derive(Deserialize)]
struct CapitalData {
    capital: String,
    lat: f64,
    lng: f64,
    iso: String,
    #[serde(default)]
    is_major_city: Option<bool>,
}""",
"""#[derive(Deserialize)]
struct CapitalData {
    capital: String,
    lat: f64,
    lng: f64,
    iso: String,
    #[serde(default)]
    is_major_city: Option<bool>,
    #[serde(default)]
    is_capital: Option<bool>,
}"""
)

# 2. Update is_capital determination in set_capitals
text = text.replace(
"""                let is_capital = !c.is_major_city.unwrap_or(false);""",
"""                let is_capital = c.is_capital.unwrap_or_else(|| !c.is_major_city.unwrap_or(false));"""
)

with open('apps/src/app/page/map_system/map-data-rs/src/map.rs', 'w', encoding='utf-8') as f:
    f.write(text)

print("Updated CapitalData in map.rs")

