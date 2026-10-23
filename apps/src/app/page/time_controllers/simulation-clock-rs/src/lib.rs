use wasm_bindgen::prelude::*;

const MONTH_NAMES: [&str; 12] = [
    "Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des",
];

fn is_leap_year(year: i64) -> bool {
    year.rem_euclid(4) == 0 && (year.rem_euclid(100) != 0 || year.rem_euclid(400) == 0)
}

fn days_in_month(year: i64, month: i64) -> i64 {
    match month {
        1 | 3 | 5 | 7 | 8 | 10 | 12 => 31,
        4 | 6 | 9 | 11 => 30,
        2 if is_leap_year(year) => 29,
        2 => 28,
        _ => 0,
    }
}

fn days_from_civil(year: i64, month: i64, day: i64) -> i64 {
    let adjusted_year = year - i64::from(month <= 2);
    let era = adjusted_year.div_euclid(400);
    let year_of_era = adjusted_year - era * 400;
    let adjusted_month = month + if month > 2 { -3 } else { 9 };
    let day_of_year = (153 * adjusted_month + 2) / 5 + day - 1;
    let day_of_era = year_of_era * 365 + year_of_era / 4 - year_of_era / 100 + day_of_year;
    era * 146_097 + day_of_era
}

fn civil_from_days(days: i64) -> (i64, i64, i64) {
    let era = days.div_euclid(146_097);
    let day_of_era = days - era * 146_097;
    let year_of_era =
        (day_of_era - day_of_era / 1_460 + day_of_era / 36_524 - day_of_era / 146_096) / 365;
    let mut year = year_of_era + era * 400;
    let day_of_year = day_of_era - (365 * year_of_era + year_of_era / 4 - year_of_era / 100);
    let month_prime = (5 * day_of_year + 2) / 153;
    let day = day_of_year - (153 * month_prime + 2) / 5 + 1;
    let month = month_prime + if month_prime < 10 { 3 } else { -9 };
    year += i64::from(month <= 2);
    (year, month, day)
}

fn validate_date(year: i32, month: i32, day: i32) -> Result<(), &'static str> {
    let month = i64::from(month) + 1;
    let day = i64::from(day);
    if !(1..=12).contains(&month) || !(1..=days_in_month(i64::from(year), month)).contains(&day) {
        return Err("Invalid simulation date");
    }
    Ok(())
}

fn shift_date_inner(year: i32, month: i32, day: i32, offset: i32) -> Result<String, &'static str> {
    validate_date(year, month, day)?;
    let days =
        days_from_civil(i64::from(year), i64::from(month) + 1, i64::from(day)) + i64::from(offset);
    let (year, month, day) = civil_from_days(days);
    Ok(format!("{year},{},{day}", month - 1))
}

#[wasm_bindgen]
pub fn shift_date(year: i32, month: i32, day: i32, offset: i32) -> Result<String, JsValue> {
    shift_date_inner(year, month, day, offset).map_err(JsValue::from_str)
}

fn format_date_inner(year: i32, month: i32, day: i32) -> Result<String, &'static str> {
    validate_date(year, month, day)?;
    Ok(format!("{day} {}, {year}", MONTH_NAMES[month as usize]))
}

#[wasm_bindgen]
pub fn format_date(year: i32, month: i32, day: i32) -> Result<String, JsValue> {
    format_date_inner(year, month, day).map_err(JsValue::from_str)
}

#[cfg(test)]
mod tests {
    use super::{civil_from_days, days_from_civil, format_date_inner, shift_date_inner};

    #[test]
    fn advances_across_leap_day() {
        assert_eq!(shift_date_inner(2024, 1, 28, 1).unwrap(), "2024,1,29");
        assert_eq!(shift_date_inner(2024, 1, 29, 1).unwrap(), "2024,2,1");
    }

    #[test]
    fn crosses_month_and_year_boundaries_in_both_directions() {
        assert_eq!(shift_date_inner(2026, 9, 31, 1).unwrap(), "2026,10,1");
        assert_eq!(shift_date_inner(2026, 0, 1, -1).unwrap(), "2025,11,31");
    }

    #[test]
    fn rejects_invalid_calendar_dates() {
        assert!(shift_date_inner(2025, 1, 29, 1).is_err());
    }

    #[test]
    fn preserves_the_calendar_display_format() {
        assert_eq!(format_date_inner(2026, 9, 31).unwrap(), "31 Okt, 2026");
    }

    #[test]
    fn civil_conversion_round_trips_before_epoch() {
        let days = days_from_civil(1900, 1, 1);
        assert_eq!(civil_from_days(days), (1900, 1, 1));
    }
}
