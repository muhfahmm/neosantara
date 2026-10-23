use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct Input {
    countries: Vec<Country>,
    user_country_name: String,
    current_cursor: Option<f64>,
    date_str: String,
    event_count: Option<f64>,
}

#[derive(Deserialize)]
struct Country {
    id: serde_json::Value,
    country: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct NewsItem {
    id: String,
    #[serde(rename = "type")]
    news_type: &'static str,
    category: &'static str,
    country_name: String,
    headline: &'static str,
    content: String,
    timestamp: String,
    date_str: String,
}

#[derive(Serialize)]
struct ResultData {
    news: Vec<NewsItem>,
    #[serde(rename = "nextCursor")]
    next_cursor: usize,
}

const EVENT_TYPES: [&str; 8] = [
    "pakta_non_agresi",
    "aliansi_pertahanan",
    "perjanjian_dagang",
    "kontrak_penelitian",
    "sanksi_ekonomi",
    "krisis_ekonomi",
    "pajak_baru",
    "program_nuklir",
];

fn create_news(
    id: String,
    news_type: &'static str,
    country_name: &str,
    date_str: &str,
    headline: &'static str,
    content: String,
) -> NewsItem {
    let category = match news_type {
        "krisis_ekonomi" | "pajak_baru" => "ekonomi_keuangan",
        "program_nuklir" => "pencapaian_militer",
        _ => "diplomasi",
    };
    NewsItem {
        id,
        news_type,
        category,
        country_name: country_name.to_owned(),
        headline,
        content,
        timestamp: date_str.to_owned(),
        date_str: date_str.to_owned(),
    }
}

fn generate(input: Input) -> ResultData {
    let normalized_user_country = input.user_country_name.trim().to_lowercase();
    let npc_countries: Vec<&Country> = input
        .countries
        .iter()
        .filter(|country| country.country.trim().to_lowercase() != normalized_user_country)
        .collect();
    if npc_countries.is_empty() {
        return ResultData {
            news: Vec::new(),
            next_cursor: 0,
        };
    }

    let cursor = input
        .current_cursor
        .filter(|value| value.is_finite())
        .unwrap_or(0.0)
        .floor() as i64;
    let start = cursor.rem_euclid(npc_countries.len() as i64) as usize;
    let requested_count = input.event_count.unwrap_or(3.0);
    if !requested_count.is_finite() || requested_count <= 0.0 {
        return ResultData {
            news: Vec::new(),
            next_cursor: 0,
        };
    }
    let count = (requested_count.floor() as usize).min(npc_countries.len());
    if count == 0 {
        return ResultData {
            news: Vec::new(),
            next_cursor: start,
        };
    }

    let mut news = Vec::with_capacity(count);
    for offset in 0..count {
        let country_index = (start + offset) % npc_countries.len();
        let actor = npc_countries[country_index];
        let partner = npc_countries[(country_index + 1) % npc_countries.len()];
        let news_type = EVENT_TYPES[(start + offset) % EVENT_TYPES.len()];
        let id = format!(
            "world-news-{}-{}-{}",
            input.date_str,
            actor
                .id
                .as_str()
                .map_or_else(|| actor.id.to_string(), str::to_owned),
            news_type
        );

        let (headline, content) = match news_type {
            "pakta_non_agresi" => (
                "Pakta Non-Agresi Baru Disepakati",
                format!(
                    "Dalam simulasi geopolitik, {} dan {} menyepakati pakta non-agresi untuk meredakan ketegangan bilateral.",
                    actor.country, partner.country
                ),
            ),
            "aliansi_pertahanan" => (
                "Aliansi Pertahanan Baru Terbentuk",
                format!(
                    "{} dan {} membentuk aliansi pertahanan dalam perkembangan diplomatik simulasi.",
                    actor.country, partner.country
                ),
            ),
            "perjanjian_dagang" => (
                "Perjanjian Dagang Bilateral Ditandatangani",
                format!(
                    "{} dan {} menandatangani perjanjian dagang untuk memperluas kerja sama ekonomi.",
                    actor.country, partner.country
                ),
            ),
            "kontrak_penelitian" => (
                "Kerja Sama Penelitian Internasional Dimulai",
                format!(
                    "{} dan {} memulai kontrak penelitian bersama untuk mengembangkan kerja sama ilmu pengetahuan dan teknologi.",
                    actor.country, partner.country
                ),
            ),
            "sanksi_ekonomi" => (
                "Sanksi Ekonomi Diberlakukan",
                format!(
                    "{} memberlakukan sanksi ekonomi terhadap {} di tengah meningkatnya ketegangan bilateral.",
                    actor.country, partner.country
                ),
            ),
            "krisis_ekonomi" => (
                "Tekanan Fiskal Melanda",
                format!(
                    "{} menghadapi tekanan fiskal dalam simulasi ekonomi, mendorong pemerintah meninjau kembali prioritas anggaran.",
                    actor.country
                ),
            ),
            "pajak_baru" => (
                "Kebijakan Pajak Baru Diumumkan",
                format!(
                    "{} mengumumkan penyesuaian kebijakan pajak sebagai bagian dari strategi ekonomi nasional.",
                    actor.country
                ),
            ),
            _ => (
                "Program Nuklir Nasional Diumumkan",
                format!(
                    "{} mengumumkan dimulainya program nuklir nasional dalam perkembangan pertahanan simulasi.",
                    actor.country
                ),
            ),
        };

        news.push(create_news(
            id,
            news_type,
            &actor.country,
            &input.date_str,
            headline,
            content,
        ));
    }

    ResultData {
        news,
        next_cursor: (start + count) % npc_countries.len(),
    }
}

#[wasm_bindgen]
pub fn generate_world_news_events(input_json: &str) -> Result<String, JsValue> {
    let input: Input = serde_json::from_str(input_json)
        .map_err(|error| JsValue::from_str(&format!("Invalid Rust news input: {error}")))?;
    serde_json::to_string(&generate(input)).map_err(|error| {
        JsValue::from_str(&format!("Could not serialize Rust news output: {error}"))
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    fn country(id: u64, name: &str) -> Country {
        Country {
            id: serde_json::json!(id),
            country: name.to_owned(),
        }
    }

    #[test]
    fn generates_news_for_npc_countries_and_skips_the_player() {
        let result = generate(Input {
            countries: vec![country(1, " User "), country(2, "A"), country(3, "B")],
            user_country_name: "user".to_owned(),
            current_cursor: Some(0.0),
            date_str: "2026-01-02".to_owned(),
            event_count: Some(3.0),
        });

        assert_eq!(result.news.len(), 2);
        assert_eq!(
            result.news[0].id,
            "world-news-2026-01-02-2-pakta_non_agresi"
        );
        assert_eq!(result.news[0].country_name, "A");
        assert_eq!(result.news[1].news_type, "aliansi_pertahanan");
        assert_eq!(result.next_cursor, 0);
    }

    #[test]
    fn wraps_negative_cursors_and_caps_event_count() {
        let result = generate(Input {
            countries: vec![country(1, "A"), country(2, "B"), country(3, "C")],
            user_country_name: "none".to_owned(),
            current_cursor: Some(-1.0),
            date_str: "2026-01-02".to_owned(),
            event_count: Some(2.9),
        });

        assert_eq!(result.news.len(), 2);
        assert_eq!(result.news[0].country_name, "C");
        assert_eq!(result.next_cursor, 1);
    }

    #[test]
    fn returns_empty_result_when_no_npc_country_is_available() {
        let result = generate(Input {
            countries: vec![country(1, "Player")],
            user_country_name: "Player".to_owned(),
            current_cursor: Some(0.0),
            date_str: "2026-01-02".to_owned(),
            event_count: Some(3.0),
        });

        assert!(result.news.is_empty());
        assert_eq!(result.next_cursor, 0);
    }

    #[test]
    fn preserves_cursor_when_fractional_event_count_rounds_down_to_zero() {
        let result = generate(Input {
            countries: vec![country(1, "A"), country(2, "B")],
            user_country_name: "none".to_owned(),
            current_cursor: Some(1.0),
            date_str: "2026-01-02".to_owned(),
            event_count: Some(0.5),
        });

        assert!(result.news.is_empty());
        assert_eq!(result.next_cursor, 1);
    }
}
