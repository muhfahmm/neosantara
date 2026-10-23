use serde::Deserialize;
use serde_json::Value;
use wasm_bindgen::prelude::*;

#[derive(Deserialize)]
struct Input {
    candidates: Vec<Value>,
    seed: u64,
    max_count: Option<usize>,
}

fn is_truthy(value: &Value) -> bool {
    match value {
        Value::Null => false,
        Value::Bool(value) => *value,
        Value::Number(value) => value.as_f64().is_some_and(|number| number != 0.0),
        Value::String(value) => !value.is_empty(),
        Value::Array(_) | Value::Object(_) => true,
    }
}

fn js_string(value: &Value) -> String {
    match value {
        Value::String(value) => value.clone(),
        Value::Null => "null".to_owned(),
        Value::Bool(value) => value.to_string(),
        Value::Number(value) => value.to_string(),
        Value::Array(values) => values.iter().map(js_string).collect::<Vec<_>>().join(","),
        Value::Object(_) => "[object Object]".to_owned(),
    }
}

fn notification_kind(notification: &Value) -> String {
    for key in ["tradeType", "type", "title"] {
        if let Some(value) = notification.get(key) {
            if is_truthy(value) {
                return js_string(value);
            }
        }
    }
    "undefined".to_owned()
}

fn next_random(state: &mut u64) -> u64 {
    if *state == 0 {
        *state = 0x9E37_79B9_7F4A_7C15;
    }
    *state ^= *state >> 12;
    *state ^= *state << 25;
    *state ^= *state >> 27;
    state.wrapping_mul(0x2545_F491_4F6C_DD1D)
}

fn select_notifications(input: Input) -> Vec<Value> {
    let max_count = input.max_count.unwrap_or(2);
    if max_count == 0 {
        return Vec::new();
    }

    let mut candidates: Vec<Value> = input
        .candidates
        .into_iter()
        .filter(|notification| notification.get("id").is_some_and(is_truthy))
        .collect();
    let mut random_state = input.seed;

    for index in (1..candidates.len()).rev() {
        let swap_index = (next_random(&mut random_state) as usize) % (index + 1);
        candidates.swap(index, swap_index);
    }

    let mut used_kinds = Vec::with_capacity(max_count);
    let mut selected = Vec::with_capacity(max_count.min(candidates.len()));
    for notification in candidates {
        let kind = notification_kind(&notification);
        if used_kinds.iter().any(|used| used == &kind) {
            continue;
        }
        used_kinds.push(kind);
        selected.push(notification);
        if selected.len() == max_count {
            break;
        }
    }
    selected
}

#[wasm_bindgen]
pub fn select_daily_notifications(input_json: &str) -> Result<String, JsValue> {
    let input: Input = serde_json::from_str(input_json)
        .map_err(|error| JsValue::from_str(&format!("Invalid Rust inbox input: {error}")))?;
    serde_json::to_string(&select_notifications(input)).map_err(|error| {
        JsValue::from_str(&format!("Could not serialize Rust inbox output: {error}"))
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    fn notification(id: &str, kind: &str) -> Value {
        serde_json::json!({ "id": id, "tradeType": kind, "payload": 123 })
    }

    #[test]
    fn filters_missing_ids_and_limits_unique_notification_kinds() {
        let result = select_notifications(Input {
            candidates: vec![
                serde_json::json!({"title": "invalid"}),
                notification("a", "trade"),
                notification("b", "trade"),
                notification("c", "war"),
            ],
            seed: 17,
            max_count: Some(2),
        });

        assert_eq!(result.len(), 2);
        assert!(result.iter().all(|item| item.get("id").is_some()));
        assert_ne!(notification_kind(&result[0]), notification_kind(&result[1]));
        assert!(result.iter().all(|item| item["payload"] == 123));
    }

    #[test]
    fn returns_no_notifications_when_limit_is_zero() {
        let result = select_notifications(Input {
            candidates: vec![notification("a", "trade")],
            seed: 1,
            max_count: Some(0),
        });

        assert!(result.is_empty());
    }

    #[test]
    fn falls_back_through_notification_kind_fields() {
        assert_eq!(
            notification_kind(&serde_json::json!({
                "tradeType": "",
                "type": "peringkat",
                "title": "ignored"
            })),
            "peringkat"
        );
    }
}
