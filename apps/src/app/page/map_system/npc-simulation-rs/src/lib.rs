use serde_json::{Map, Value};
use std::collections::HashMap;

pub fn is_valid_date(date: &str) -> bool {
    let Some((year, month, day)) = parse_date(date) else {
        return false;
    };

    let days_in_month = match month {
        1 | 3 | 5 | 7 | 8 | 10 | 12 => 31,
        4 | 6 | 9 | 11 => 30,
        2 if is_leap_year(year) => 29,
        2 => 28,
        _ => return false,
    };

    day > 0 && day <= days_in_month
}

pub fn next_date(date: &str) -> Result<String, String> {
    let Some((year, month, day)) = parse_date(date) else {
        return Err(format!("Invalid simulation date: {date}"));
    };
    if !is_valid_date(date) {
        return Err(format!("Invalid simulation date: {date}"));
    }

    let days_in_month = match month {
        1 | 3 | 5 | 7 | 8 | 10 | 12 => 31,
        4 | 6 | 9 | 11 => 30,
        2 if is_leap_year(year) => 29,
        2 => 28,
        _ => unreachable!("date was validated"),
    };

    let (next_year, next_month, next_day) = if day < days_in_month {
        (year, month, day + 1)
    } else if month < 12 {
        (year, month + 1, 1)
    } else {
        (
            year.checked_add(1)
                .ok_or_else(|| "Simulation date exceeds supported range.".to_string())?,
            1,
            1,
        )
    };

    Ok(format!("{next_year:04}-{next_month:02}-{next_day:02}"))
}

pub fn for_each_simulation_day<F>(
    last_simulated_date: &str,
    current_date: &str,
    mut simulate_day: F,
) -> Result<(), String>
where
    F: FnMut(&str, &str),
{
    if !is_valid_date(last_simulated_date) {
        return Err(format!(
            "Invalid last simulated date: {last_simulated_date}"
        ));
    }
    if !is_valid_date(current_date) {
        return Err(format!("Invalid current date: {current_date}"));
    }
    if current_date <= last_simulated_date {
        return Ok(());
    }

    let mut previous_date = last_simulated_date.to_string();
    while previous_date.as_str() < current_date {
        let simulation_date = next_date(&previous_date)?;
        simulate_day(&simulation_date, &previous_date);
        previous_date = simulation_date;
    }
    Ok(())
}

pub fn mutable_country_state(country: &Value) -> Map<String, Value> {
    let Some(country) = country.as_object() else {
        return Map::new();
    };

    country
        .iter()
        .filter(|(key, _)| {
            matches!(
                key.as_str(),
                "anggaran"
                    | "jumlah_penduduk"
                    | "accumulated_births"
                    | "accumulated_deaths"
                    | "laju_pertumbuhan"
                    | "food_supply_ratio"
                    | "food_deficit_tier"
                    | "housing_fulfillment"
                    | "housing_deficit_tier"
                    | "overpop_tier"
                    | "health_tier"
                    | "population_status"
            ) || key.starts_with("inventory_")
                || key.starts_with("last_update_date_")
        })
        .map(|(key, value)| (key.clone(), value.clone()))
        .collect()
}

#[derive(Clone, Debug)]
pub struct ResourceRules {
    pub is_banned: bool,
    pub ban_finished_at: Option<String>,
    pub production_bonus_multiplier: f64,
    pub external_production_multiplier: f64,
}

impl Default for ResourceRules {
    fn default() -> Self {
        Self {
            is_banned: false,
            ban_finished_at: None,
            production_bonus_multiplier: 1.0,
            external_production_multiplier: 1.0,
        }
    }
}

#[derive(Debug, Default, PartialEq)]
pub struct MaterialProductionResult {
    pub has_updates: bool,
    pub updates: Map<String, Value>,
}

pub fn calculate_daily_material_production(
    country: &Value,
    metadata: &Value,
    current_date: &str,
    fallback_last_update_date: &str,
    resource_rules: &HashMap<String, ResourceRules>,
) -> MaterialProductionResult {
    let (Some(country), Some(metadata)) = (country.as_object(), metadata.as_object()) else {
        return MaterialProductionResult::default();
    };
    if metadata.is_empty() || !is_valid_date(current_date) {
        return MaterialProductionResult::default();
    }

    let population = safe_population_number(country.get("jumlah_penduduk"));
    let mut result = MaterialProductionResult::default();

    for (resource_key, building_metadata) in metadata {
        let building_count = js_number(country.get(resource_key));
        let rule = resource_rules
            .get(resource_key)
            .cloned()
            .unwrap_or_default();
        let food_consumption = food_consumption_per_capita(resource_key);
        let is_food_commodity = food_consumption.is_some();
        if building_count == 0.0 && !(rule.is_banned && is_food_commodity) {
            continue;
        }

        let building_metadata =
            find_building_metadata(metadata, resource_key).or(Some(building_metadata));
        let production = building_metadata
            .and_then(|entry| entry.get("produksi"))
            .filter(|value| js_truthy(value))
            .map(|value| js_number(Some(value)));
        if !rule.is_banned && production.is_none() {
            continue;
        }

        let build_date_key = format!("build_date_{resource_key}");
        let build_date = country
            .get(&build_date_key)
            .filter(|value| js_truthy(value))
            .and_then(Value::as_str)
            .unwrap_or(fallback_last_update_date);
        let last_update_key = format!("last_update_date_{resource_key}");
        let last_update_date = country
            .get(&last_update_key)
            .filter(|value| js_truthy(value))
            .and_then(Value::as_str)
            .unwrap_or(build_date);
        let inventory_key = format!("inventory_{resource_key}");

        let production_ban_start = rule
            .ban_finished_at
            .as_deref()
            .filter(|date| !date.is_empty())
            .unwrap_or(last_update_date);
        let effective_last_update = if rule.is_banned && production_ban_start > last_update_date {
            production_ban_start
        } else {
            last_update_date
        };
        let days_passed = elapsed_days(effective_last_update, current_date);
        if days_passed <= 0 {
            if country
                .get(&last_update_key)
                .is_none_or(|value| !js_truthy(value))
            {
                result.updates.insert(
                    last_update_key,
                    Value::String(effective_last_update.to_string()),
                );
                result.has_updates = true;
            }
            continue;
        }

        let current_stock = js_number(country.get(&inventory_key));
        if rule.is_banned {
            let daily_consumption = food_consumption
                .map(|per_capita| calculate_consumption(population, per_capita))
                .unwrap_or(0.0);
            result.updates.insert(
                inventory_key,
                json_number((current_stock - daily_consumption * days_passed as f64).max(0.0)),
            );
            result
                .updates
                .insert(last_update_key, Value::String(current_date.to_string()));
            result.has_updates = true;
            continue;
        }

        let production_multiplier =
            rule.production_bonus_multiplier * rule.external_production_multiplier;
        let daily_amount = if let Some(per_capita) = food_consumption {
            let daily_production =
                production.unwrap_or(0.0) * building_count * production_multiplier;
            let daily_consumption = calculate_consumption(population, per_capita);
            (daily_production - daily_consumption).max(0.0)
        } else {
            production.unwrap_or(0.0) * building_count * production_multiplier
        };
        result.updates.insert(
            inventory_key,
            json_number(current_stock + daily_amount * days_passed as f64),
        );
        result
            .updates
            .insert(last_update_key, Value::String(current_date.to_string()));
        result.has_updates = true;
    }

    result
}

fn find_building_metadata<'a>(
    metadata: &'a Map<String, Value>,
    resource_key: &str,
) -> Option<&'a Value> {
    metadata
        .get(resource_key)
        .or_else(|| {
            metadata
                .values()
                .find(|entry| entry.get("dataKey").and_then(Value::as_str) == Some(resource_key))
        })
        .or_else(|| {
            metadata.iter().find_map(|(key, entry)| {
                (key.ends_with(&format!("_{resource_key}")) || key == &format!("1_{resource_key}"))
                    .then_some(entry)
            })
        })
}

fn food_consumption_per_capita(resource_key: &str) -> Option<f64> {
    Some(match resource_key {
        "ayam_unggas" => 0.15,
        "sapi_potong" => 0.08,
        "sapi_perah" => 0.12,
        "domba_kambing" => 0.05,
        "padi" | "beras" => 0.35,
        "gandum" => 0.24,
        "jagung" => 0.18,
        "sayur" => 0.30,
        "umbi" => 0.20,
        "kedelai" => 0.15,
        "kelapa_sawit" => 0.10,
        "kopi" => 0.05,
        "teh" => 0.06,
        "kakao" => 0.04,
        "tebu" => 0.15,
        "karet" => 0.02,
        "udang" => 0.08,
        "ikan" => 0.25,
        "mutiara" => 0.01,
        "air_mineral" => 0.05,
        "garam" => 0.0005,
        "gula" => 0.0015,
        "roti" => 0.18,
        "pengolahan_daging" => 0.10,
        "mie_instan" => 0.25,
        "minyak_goreng" => 0.10,
        "susu" => 0.15,
        _ => return None,
    })
}

fn calculate_consumption(population: f64, per_capita: f64) -> f64 {
    population / 1000.0 * per_capita
}

fn safe_population_number(value: Option<&Value>) -> f64 {
    match value {
        None | Some(Value::Null) => 0.0,
        Some(Value::Number(value)) => value.as_f64().unwrap_or(0.0),
        Some(Value::String(value)) => {
            let compact = value
                .trim()
                .chars()
                .filter(|character| !character.is_whitespace())
                .map(|character| if character == ',' { '.' } else { character })
                .collect::<String>();
            let (numeric, multiplier) = if let Some(numeric) = compact
                .strip_suffix('M')
                .or_else(|| compact.strip_suffix('m'))
            {
                (numeric, 1_000_000.0)
            } else if let Some(numeric) = compact
                .strip_suffix('K')
                .or_else(|| compact.strip_suffix('k'))
            {
                (numeric, 1_000.0)
            } else {
                (compact.as_str(), 1.0)
            };
            let normalized = numeric
                .chars()
                .filter(|character| character.is_ascii_digit() || matches!(character, '.' | '-'))
                .collect::<String>();
            normalized
                .parse::<f64>()
                .map(|population| population * multiplier)
                .unwrap_or(0.0)
        }
        Some(value) => js_number(Some(value)),
    }
}

fn elapsed_days(start_date: &str, end_date: &str) -> i64 {
    if !is_valid_date(start_date) || !is_valid_date(end_date) {
        return 0;
    }
    (civil_day_number(end_date) - civil_day_number(start_date)).max(0)
}

fn civil_day_number(date: &str) -> i64 {
    let (year, month, day) = parse_date(date).expect("validated date");
    let mut year = year as i64;
    let month = month as i64;
    let day = day as i64;
    year -= i64::from(month <= 2);
    let era = year.div_euclid(400);
    let year_of_era = year - era * 400;
    let adjusted_month = month + if month > 2 { -3 } else { 9 };
    let day_of_year = (153 * adjusted_month + 2) / 5 + day - 1;
    let day_of_era = year_of_era * 365 + year_of_era / 4 - year_of_era / 100 + day_of_year;
    era * 146_097 + day_of_era
}

fn js_number(value: Option<&Value>) -> f64 {
    match value {
        None | Some(Value::Null) => 0.0,
        Some(Value::Bool(value)) => f64::from(u8::from(*value)),
        Some(Value::Number(value)) => value.as_f64().unwrap_or(0.0),
        Some(Value::String(value)) => value.trim().parse::<f64>().unwrap_or(0.0),
        _ => 0.0,
    }
}

fn js_truthy(value: &Value) -> bool {
    match value {
        Value::Null => false,
        Value::Bool(value) => *value,
        Value::Number(value) => value.as_f64().is_some_and(|number| number != 0.0),
        Value::String(value) => !value.is_empty(),
        Value::Array(_) | Value::Object(_) => true,
    }
}

fn json_number(value: f64) -> Value {
    serde_json::Number::from_f64(value)
        .map(Value::Number)
        .unwrap_or(Value::Null)
}

fn parse_date(date: &str) -> Option<(u32, u32, u32)> {
    let mut parts = date.split('-');
    let year = parts.next()?.parse::<u32>().ok()?;
    let month = parts.next()?.parse::<u32>().ok()?;
    let day = parts.next()?.parse::<u32>().ok()?;
    if parts.next().is_some() || date.len() != 10 {
        return None;
    }
    Some((year, month, day))
}

fn is_leap_year(year: u32) -> bool {
    year.is_multiple_of(4) && (!year.is_multiple_of(100) || year.is_multiple_of(400))
}

#[cfg(test)]
mod tests {
    use super::{
        calculate_daily_material_production, for_each_simulation_day, is_valid_date,
        mutable_country_state, next_date, ResourceRules,
    };
    use serde_json::json;
    use std::collections::HashMap;

    #[test]
    fn advances_dates_across_month_year_and_leap_boundaries() {
        assert_eq!(next_date("2024-02-28").unwrap(), "2024-02-29");
        assert_eq!(next_date("2023-02-28").unwrap(), "2023-03-01");
        assert_eq!(next_date("2026-12-31").unwrap(), "2027-01-01");
    }

    #[test]
    fn rejects_invalid_dates() {
        assert!(is_valid_date("2024-02-29"));
        assert!(!is_valid_date("2023-02-29"));
        assert!(!is_valid_date("2026-13-01"));
        assert!(!is_valid_date("2026-1-01"));
    }

    #[test]
    fn visits_each_day_in_order_and_does_not_replay_past_dates() {
        let mut visited = Vec::new();
        for_each_simulation_day("2026-12-30", "2027-01-02", |date, previous| {
            visited.push((date.to_string(), previous.to_string()));
        })
        .unwrap();

        assert_eq!(
            visited,
            vec![
                ("2026-12-31".to_string(), "2026-12-30".to_string()),
                ("2027-01-01".to_string(), "2026-12-31".to_string()),
                ("2027-01-02".to_string(), "2027-01-01".to_string()),
            ]
        );

        let mut called = false;
        for_each_simulation_day("2027-01-02", "2027-01-01", |_, _| called = true).unwrap();
        assert!(!called);
    }

    #[test]
    fn mutable_state_matches_the_existing_persisted_field_allowlist() {
        let country = json!({
            "anggaran": 10,
            "jumlah_penduduk": 20,
            "inventory_beras": 30,
            "last_update_date_beras": "2026-01-02",
            "religion": "Example",
            "country": "Example"
        });
        let state = mutable_country_state(&country);

        assert_eq!(state.len(), 4);
        assert_eq!(state["anggaran"], json!(10));
        assert_eq!(state["inventory_beras"], json!(30));
        assert!(!state.contains_key("religion"));
    }

    #[test]
    fn production_accrues_for_elapsed_days_using_metadata_and_modifiers() {
        let country = json!({
            "jumlah_penduduk": 1000,
            "padi": 2,
            "inventory_padi": 10,
            "build_date_padi": "2026-01-01"
        });
        let metadata = json!({"padi": {"produksi": 4}});
        let rules = HashMap::from([(
            "padi".to_string(),
            ResourceRules {
                production_bonus_multiplier: 1.5,
                external_production_multiplier: 0.5,
                ..ResourceRules::default()
            },
        )]);

        let result = calculate_daily_material_production(
            &country,
            &metadata,
            "2026-01-03",
            "2026-01-02",
            &rules,
        );

        assert!(result.has_updates);
        assert_eq!(result.updates["inventory_padi"], json!(21.3));
        assert_eq!(result.updates["last_update_date_padi"], json!("2026-01-03"));
    }

    #[test]
    fn banned_food_production_consumes_existing_inventory_without_producing() {
        let country = json!({
            "jumlah_penduduk": 1000,
            "inventory_beras": 3,
            "last_update_date_beras": "2026-01-01"
        });
        let metadata = json!({"beras": {"produksi": 10}});
        let rules = HashMap::from([(
            "beras".to_string(),
            ResourceRules {
                is_banned: true,
                ban_finished_at: Some("2026-01-02".to_string()),
                ..ResourceRules::default()
            },
        )]);

        let result = calculate_daily_material_production(
            &country,
            &metadata,
            "2026-01-04",
            "2026-01-01",
            &rules,
        );

        assert!(result.has_updates);
        assert_eq!(result.updates["inventory_beras"], json!(2.3));
        assert_eq!(
            result.updates["last_update_date_beras"],
            json!("2026-01-04")
        );
    }

    #[test]
    fn population_consumption_accepts_the_existing_k_and_m_suffix_format() {
        let country = json!({
            "jumlah_penduduk": "2M",
            "padi": 1,
            "build_date_padi": "2026-01-01"
        });
        let metadata = json!({"padi": {"produksi": 1000}});
        let result = calculate_daily_material_production(
            &country,
            &metadata,
            "2026-01-02",
            "2026-01-01",
            &HashMap::new(),
        );

        assert_eq!(result.updates["inventory_padi"], json!(300.0));
    }
}
