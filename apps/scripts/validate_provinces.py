#!/usr/bin/env python3
"""Validate generated provinces.final.json against the game roster and cell data."""

from __future__ import annotations

import argparse
import json
import re
import sys
import unicodedata
from collections import Counter
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[2]
COUNTRY_DATA_PATH = ROOT / "apps/src/app/page/map_system/map-data.ts"
CITY_CELLS_PATH = ROOT / "apps/public/city_province_cells.json"
EXPECTED_COUNTRY_COUNT = 212


def normalize(value: Any) -> str:
    text = unicodedata.normalize("NFD", str(value or "")).lower()
    text = "".join(char for char in text if not unicodedata.combining(char))
    return re.sub(r"[^a-z0-9]", "", text)


def load_game_roster() -> list[dict[str, Any]]:
    source = COUNTRY_DATA_PATH.read_text(encoding="utf-8")
    match = re.search(
        r"export const COUNTRIES_DATA\s*(?::\s*[^=]+)?=\s*(\[.*?\]);",
        source,
        re.DOTALL,
    )
    if not match:
        raise ValueError("Unable to parse COUNTRIES_DATA from map-data.ts")
    roster = json.loads(match.group(1))
    if not isinstance(roster, list):
        raise ValueError("COUNTRIES_DATA must be a JSON array")
    return roster


def validate_dataset(
    dataset: dict[str, Any], project_root: Path = ROOT
) -> list[str]:
    errors: list[str] = []
    meta = dataset.get("meta")
    countries = dataset.get("countries")
    unmapped = dataset.get("unmapped")
    if not isinstance(meta, dict):
        return ["meta must be an object."]
    if not isinstance(countries, list):
        return ["countries must be an array."]
    if not isinstance(unmapped, dict):
        return ["unmapped must be an object."]

    try:
        roster = load_game_roster()
        city_data = json.loads(
            (project_root / "apps/public/city_province_cells.json").read_text(
                encoding="utf-8"
            )
        )
    except (OSError, ValueError, json.JSONDecodeError) as error:
        return [f"Unable to load source data for validation: {error}"]

    if len(roster) != EXPECTED_COUNTRY_COUNT:
        errors.append(
            f"Game roster has {len(roster)} records; expected {EXPECTED_COUNTRY_COUNT}."
        )
    if meta.get("totalCountries") != len(roster):
        errors.append(
            f"meta.totalCountries is {meta.get('totalCountries')}; roster has {len(roster)}."
        )
    if len(countries) != len(roster):
        errors.append(
            f"countries has {len(countries)} records; roster has {len(roster)}."
        )

    expected_country_ids = {
        f"game:{country.get('id', '')}:"
        f"{str(country.get('iso') or '').upper()}:"
        f"{normalize(country.get('country') or '')}"
        for country in roster
    }
    actual_country_ids = [
        country.get("countryId") for country in countries if isinstance(country, dict)
    ]
    if len(actual_country_ids) != len(set(actual_country_ids)):
        errors.append("Duplicate countryId values found.")
    actual_game_ids = [
        str(country.get("gameId"))
        for country in countries
        if isinstance(country, dict)
    ]
    if len(actual_game_ids) != len(set(actual_game_ids)):
        errors.append("Duplicate numeric gameId values found.")
    expected_game_ids = [str(country.get("id", "")) for country in roster]
    if len(expected_game_ids) != len(set(expected_game_ids)):
        errors.append("Game roster contains duplicate numeric IDs.")
    if set(actual_game_ids) != set(expected_game_ids):
        errors.append("Dataset gameId values do not match the game roster.")
    if set(actual_country_ids) != expected_country_ids:
        missing = sorted(expected_country_ids - set(actual_country_ids))
        extra = sorted(set(actual_country_ids) - expected_country_ids)
        errors.append(f"Country roster mismatch; missing={missing[:5]}, extra={extra[:5]}.")

    province_total = 0
    all_province_ids: Counter[str] = Counter()
    assigned_city_cells: Counter[str] = Counter()
    assigned_regions: Counter[str] = Counter()
    for country in countries:
        if not isinstance(country, dict):
            errors.append("Country entry must be an object.")
            continue
        country_id = country.get("countryId")
        provinces = country.get("provinces")
        if not isinstance(provinces, list):
            errors.append(f"{country_id}: provinces must be an array.")
            continue
        province_total += len(provinces)
        if country.get("provinceCount") != len(provinces):
            errors.append(
                f"{country_id}: provinceCount={country.get('provinceCount')} "
                f"but provinces.length={len(provinces)}."
            )
        if country.get("finalProvinceCount") != len(provinces):
            errors.append(
                f"{country_id}: finalProvinceCount={country.get('finalProvinceCount')} "
                f"but provinces.length={len(provinces)}."
            )
        if country.get("resolution") not in {
            "auto-natural-earth",
            "auto-iso-filtered",
            "manual-review",
        }:
            errors.append(f"{country_id}: invalid or missing resolution.")
        if not isinstance(country.get("resolutionReason"), str) or not country.get(
            "resolutionReason"
        ):
            errors.append(f"{country_id}: resolutionReason must be a non-empty string.")
        local_ids: set[str] = set()
        for province in provinces:
            if not isinstance(province, dict):
                errors.append(f"{country_id}: province entry must be an object.")
                continue
            province_id = province.get("id")
            if not isinstance(province_id, str) or not province_id:
                errors.append(f"{country_id}: province ID must be a non-empty string.")
                continue
            if province_id in local_ids:
                errors.append(f"{country_id}: duplicate province ID {province_id}.")
            local_ids.add(province_id)
            all_province_ids[province_id] += 1
            for field, counts in (
                ("cityCellIds", assigned_city_cells),
                ("regionIds", assigned_regions),
            ):
                references = province.get(field)
                if not isinstance(references, list):
                    errors.append(f"{country_id}/{province_id}: {field} must be an array.")
                    continue
                for reference in references:
                    if not isinstance(reference, str):
                        errors.append(
                            f"{country_id}/{province_id}: {field} values must be strings."
                        )
                    else:
                        counts[reference] += 1
            mapping_methods = province.get("cityCellMappingMethods")
            city_cell_ids = province.get("cityCellIds")
            allowed_mapping_methods = {
                "point-in-polygon",
                "nearest-boundary-within-25km",
                "exact-normalized-name",
            }
            if not isinstance(mapping_methods, dict):
                errors.append(
                    f"{country_id}/{province_id}: cityCellMappingMethods must be an object."
                )
            elif isinstance(city_cell_ids, list):
                if set(mapping_methods) != set(city_cell_ids):
                    errors.append(
                        f"{country_id}/{province_id}: mapping methods must cover exactly cityCellIds."
                    )
                if any(method not in allowed_mapping_methods for method in mapping_methods.values()):
                    errors.append(
                        f"{country_id}/{province_id}: unsupported city-cell mapping method."
                    )
        if country.get("noSubdivision"):
            if len(provinces) != 1 or provinces[0].get("type") != "noSubdivision":
                errors.append(
                    f"{country_id}: noSubdivision requires exactly one placeholder province."
                )
        elif any(province.get("type") == "noSubdivision" for province in provinces):
            errors.append(f"{country_id}: unexpected noSubdivision placeholder.")
        if country.get("status") not in {"verified", "conflict", "unverified"}:
            errors.append(f"{country_id}: invalid status {country.get('status')!r}.")

    duplicate_global_ids = [province_id for province_id, count in all_province_ids.items() if count > 1]
    if duplicate_global_ids:
        errors.append(f"Duplicate province IDs across countries: {duplicate_global_ids[:10]}.")
    if meta.get("totalProvinces") != province_total:
        errors.append(
            f"meta.totalProvinces={meta.get('totalProvinces')} but total records={province_total}."
        )
    if meta.get("totalFinalProvinces") != province_total:
        errors.append(
            f"meta.totalFinalProvinces={meta.get('totalFinalProvinces')} "
            f"but total records={province_total}."
        )
    expected_resolution_counts = Counter(country.get("resolution") for country in countries)
    if meta.get("resolutionCounts") != {
        key: expected_resolution_counts[key]
        for key in ("auto-natural-earth", "auto-iso-filtered", "manual-review")
    }:
        errors.append("meta.resolutionCounts does not match country resolutions.")

    expected_city_cells = set(city_data.get("cityCells", {}))
    expected_regions = set(city_data.get("regions", {}))
    for name, assigned, expected in (
        ("cityCell", assigned_city_cells, expected_city_cells),
        ("region", assigned_regions, expected_regions),
    ):
        unmapped_items = unmapped.get("cityCells" if name == "cityCell" else "regions")
        if not isinstance(unmapped_items, list):
            errors.append(f"unmapped list for {name} must be an array.")
            continue
        unmapped_ids = [
            item.get("id") for item in unmapped_items if isinstance(item, dict)
        ]
        if len(unmapped_ids) != len(unmapped_items):
            errors.append(f"Every unmapped {name} must have an object with an id.")
        if any(
            not isinstance(item, dict)
            or not isinstance(item.get("reason"), str)
            or not item.get("reason")
            for item in unmapped_items
        ):
            errors.append(f"Every unmapped {name} must have a non-empty reason.")
        if len(unmapped_ids) != len(set(unmapped_ids)):
            errors.append(f"Duplicate unmapped {name} IDs found.")
        counts = assigned + Counter(unmapped_ids)
        missing = sorted(expected - set(counts))
        unexpected = sorted(set(counts) - expected)
        repeated = sorted(reference for reference, count in counts.items() if count != 1)
        if missing or unexpected or repeated:
            errors.append(
                f"{name} coverage invalid; missing={missing[:10]}, "
                f"unexpected={unexpected[:10]}, not-exactly-once={repeated[:10]}."
            )

    expected_status_counts = Counter(country.get("status") for country in countries)
    if meta.get("statusCounts") != {
        key: expected_status_counts[key]
        for key in ("verified", "conflict", "unverified")
    }:
        errors.append("meta.statusCounts does not match country statuses.")
    if meta.get("unmappedCityCellCount") != len(unmapped.get("cityCells", [])):
        errors.append("meta.unmappedCityCellCount does not match unmapped.cityCells.")
    if meta.get("unmappedRegionCount") != len(unmapped.get("regions", [])):
        errors.append("meta.unmappedRegionCount does not match unmapped.regions.")
    if meta.get("cityCellCount") != len(expected_city_cells):
        errors.append("meta.cityCellCount does not match source cityCells.")
    if meta.get("regionGeometryCount") != len(expected_regions):
        errors.append("meta.regionGeometryCount does not match source regions.")
    if meta.get("mappedCityCellCount") != len(expected_city_cells) - len(unmapped.get("cityCells", [])):
        errors.append("meta.mappedCityCellCount does not match cityCell coverage.")
    if meta.get("mappedRegionCount") != len(expected_regions) - len(unmapped.get("regions", [])):
        errors.append("meta.mappedRegionCount does not match region coverage.")
    mapping_method_counts: Counter[str] = Counter()
    for country in countries:
        for province in country.get("provinces", []):
            mapping_method_counts.update(
                province.get("cityCellMappingMethods", {}).values()
            )
    expected_mapping_method_counts = {
        method: mapping_method_counts[method]
        for method in (
            "point-in-polygon",
            "nearest-boundary-within-25km",
            "exact-normalized-name",
        )
    }
    if meta.get("cityCellMappingMethodCounts") != expected_mapping_method_counts:
        errors.append("meta.cityCellMappingMethodCounts does not match province mappings.")
    return errors


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--data",
        default=str(ROOT / "data/provinces.final.json"),
        help="Path to generated provinces.final.json.",
    )
    args = parser.parse_args()
    try:
        dataset = json.loads(Path(args.data).read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        print(f"Unable to read {args.data}: {error}", file=sys.stderr)
        return 1
    errors = validate_dataset(dataset)
    if errors:
        print("Province dataset validation failed:")
        for error in errors:
            print(f"- {error}")
        return 1
    print(
        "Province dataset validation passed: "
        f"{dataset['meta']['totalCountries']} countries, "
        f"{dataset['meta']['totalFinalProvinces']} final province records, "
        f"{dataset['meta']['unmappedCityCellCount']} unmapped cityCells, "
        f"{dataset['meta']['unmappedRegionCount']} unmapped regions."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
