#!/usr/bin/env python3
"""Build a cautious game-country ADM1 inventory from ISO and Natural Earth data."""

from __future__ import annotations

import argparse
import json
import math
import re
import sys
import unicodedata
import urllib.request
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[2]
ISO_CODES_REVISION = "53b1c294240bcfb7429bbc225b9caeb9bf2128b3"
NATURAL_EARTH_REVISION = "ca96624a56bd078437bca8184e78163e5039ad19"
ISO_3166_1_URL = (
    "https://raw.githubusercontent.com/sailfishos-mirror/iso-codes/"
    f"{ISO_CODES_REVISION}/data/iso_3166-1.json"
)
ISO_3166_2_URL = (
    "https://raw.githubusercontent.com/sailfishos-mirror/iso-codes/"
    f"{ISO_CODES_REVISION}/data/iso_3166-2.json"
)
NATURAL_EARTH_ADMIN1_URL = (
    "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/"
    f"{NATURAL_EARTH_REVISION}/geojson/ne_10m_admin_1_states_provinces.geojson"
)
COUNTRY_DATA_PATH = ROOT / "apps/src/app/page/map_system/map-data.ts"
MAJOR_CITIES_PATH = ROOT / "apps/src/app/page/map_system/major_cities.json"
CITY_CELLS_PATH = ROOT / "apps/public/city_province_cells.json"

# These are explicit corrections of duplicate/misassigned ISO-2 values in the
# game roster. They are reported as conflicts rather than silently accepted.
GAME_COUNTRY_CODE_OVERRIDES = {
    "sudanselatan": ("SS", "Game roster uses SD, which is already assigned to Sudan."),
    "samoaamerika": ("AS", "Game roster uses WS, which is already assigned to Samoa."),
}

SOURCES = [
    {
        "name": "ISO 3166-1 and ISO 3166-2 data (iso-codes mirror)",
        "url": f"https://github.com/sailfishos-mirror/iso-codes/tree/{ISO_CODES_REVISION}",
        "upstream": "https://salsa.debian.org/iso-codes-team/iso-codes",
        "revision": ISO_CODES_REVISION,
        "license": "LGPL-2.1-or-later; see upstream LICENSES",
    },
    {
        "name": "Natural Earth Admin 1 - States, Provinces",
        "url": NATURAL_EARTH_ADMIN1_URL,
        "revision": NATURAL_EARTH_REVISION,
        "license": "Public domain",
    },
    {
        "name": "Game country roster and city markers",
        "files": [
            "apps/src/app/page/map_system/map-data.ts",
            "apps/src/app/page/map_system/major_cities.json",
        ],
    },
]


def normalize(value: Any) -> str:
    text = unicodedata.normalize("NFD", str(value or "")).lower()
    text = "".join(char for char in text if not unicodedata.combining(char))
    return re.sub(r"[^a-z0-9]", "", text)


def is_explicitly_below_adm1(subdivision_type: Any) -> bool:
    type_key = normalize(subdivision_type)
    return any(
        marker in type_key
        for marker in (
            "secondorder",
            "thirdorder",
            "secondlevel",
            "thirdlevel",
            "adm2",
            "adm3",
            "level2",
            "level3",
        )
    )


def download_json(url: str) -> Any:
    request = urllib.request.Request(
        url,
        headers={"User-Agent": "Neosantara-province-data-builder/1.0"},
    )
    with urllib.request.urlopen(request, timeout=180) as response:
        return json.load(response)


def load_json(path: str | None, url: str) -> Any:
    return download_json(url) if path is None else json.loads(Path(path).read_text(encoding="utf-8"))


def parse_exported_array(source: str, export_name: str) -> list[dict[str, Any]]:
    match = re.search(
        rf"export const {re.escape(export_name)}\s*(?::\s*[^=]+)?=\s*(\[.*?\]);",
        source,
        re.DOTALL,
    )
    if not match:
        raise ValueError(f"Unable to parse {export_name} from map-data.ts")
    result = json.loads(match.group(1))
    if not isinstance(result, list):
        raise ValueError(f"{export_name} must be a JSON array")
    return result


def load_game_data() -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    source = COUNTRY_DATA_PATH.read_text(encoding="utf-8")
    countries = parse_exported_array(source, "COUNTRIES_DATA")
    capitals = parse_exported_array(source, "CAPITALS_DATA")
    major_cities = json.loads(MAJOR_CITIES_PATH.read_text(encoding="utf-8"))
    if not isinstance(major_cities, list):
        raise ValueError("major_cities.json must contain an array")
    return countries, capitals + major_cities


def coordinate_positions(value: Any):
    if (
        isinstance(value, list)
        and len(value) >= 2
        and isinstance(value[0], (int, float))
        and isinstance(value[1], (int, float))
    ):
        yield float(value[0]), float(value[1])
        return
    if isinstance(value, list):
        for child in value:
            yield from coordinate_positions(child)


def geometry_bbox(geometry: dict[str, Any]) -> tuple[float, float, float, float] | None:
    points = list(coordinate_positions(geometry.get("coordinates")))
    if not points:
        return None
    longitudes = [point[0] for point in points]
    latitudes = [point[1] for point in points]
    return min(longitudes), min(latitudes), max(longitudes), max(latitudes)


def point_in_ring(ring: list[list[float]], longitude: float, latitude: float) -> bool:
    inside = False
    previous = len(ring) - 1
    for index, current in enumerate(ring):
        x1, y1 = current[:2]
        x2, y2 = ring[previous][:2]
        if (y1 > latitude) != (y2 > latitude):
            crossing_x = (x2 - x1) * (latitude - y1) / (y2 - y1) + x1
            if longitude < crossing_x:
                inside = not inside
        previous = index
    return inside


def feature_polygons(geometry: dict[str, Any]) -> list[list[list[list[float]]]]:
    if geometry.get("type") == "Polygon":
        return [geometry.get("coordinates", [])]
    if geometry.get("type") == "MultiPolygon":
        return geometry.get("coordinates", [])
    return []


def point_in_geometry(
    geometry: dict[str, Any], longitude: float, latitude: float
) -> bool:
    for polygon in feature_polygons(geometry):
        if not polygon or not point_in_ring(polygon[0], longitude, latitude):
            continue
        if not any(point_in_ring(hole, longitude, latitude) for hole in polygon[1:]):
            return True
    return False


def point_segment_distance_km(
    longitude: float,
    latitude: float,
    start: list[float],
    end: list[float],
) -> float:
    latitude_scale = 111.32
    longitude_scale = latitude_scale * math.cos(math.radians(latitude))
    px, py = 0.0, 0.0
    ax = (start[0] - longitude) * longitude_scale
    ay = (start[1] - latitude) * latitude_scale
    bx = (end[0] - longitude) * longitude_scale
    by = (end[1] - latitude) * latitude_scale
    dx, dy = bx - ax, by - ay
    length_squared = dx * dx + dy * dy
    if length_squared == 0:
        return math.hypot(ax - px, ay - py)
    fraction = max(0.0, min(1.0, -(ax * dx + ay * dy) / length_squared))
    return math.hypot(ax + fraction * dx, ay + fraction * dy)


def geometry_distance_km(
    geometry: dict[str, Any], longitude: float, latitude: float
) -> float:
    if point_in_geometry(geometry, longitude, latitude):
        return 0.0
    closest = math.inf
    for polygon in feature_polygons(geometry):
        for ring in polygon:
            for start, end in zip(ring, ring[1:]):
                closest = min(
                    closest,
                    point_segment_distance_km(
                        longitude, latitude, start, end
                    ),
                )
    return closest


def point_in_city_cell(
    cell: Any, longitude: float, latitude: float
) -> bool:
    if not isinstance(cell, list) or not cell:
        return False
    if (
        isinstance(cell[0], list)
        and len(cell[0]) >= 2
        and isinstance(cell[0][0], (int, float))
        and isinstance(cell[0][1], (int, float))
    ):
        return point_in_ring(cell, longitude, latitude)
    return any(
        isinstance(ring, list)
        and point_in_ring(ring, longitude, latitude)
        for ring in cell
        if isinstance(ring, list) and ring
    )


def get_feature_country_iso(
    properties: dict[str, Any],
    iso1_by_alpha2: dict[str, dict[str, Any]],
    alpha2_by_alpha3: dict[str, str],
) -> str | None:
    alpha2 = str(properties.get("iso_a2") or "").upper()
    if alpha2 in iso1_by_alpha2:
        return alpha2
    for key in ("adm0_a3", "iso_a3", "gu_a3", "su_a3"):
        alpha3 = str(properties.get(key) or "").upper()
        if alpha3 in alpha2_by_alpha3:
            return alpha2_by_alpha3[alpha3]
    return None


def get_game_country_identity(country: dict[str, Any]) -> tuple[str, str, str]:
    game_id = str(country.get("id", ""))
    game_iso2 = str(country.get("iso") or "").upper()
    name = str(country.get("country") or "")
    code = GAME_COUNTRY_CODE_OVERRIDES.get(normalize(name), (None, ""))[0]
    official_iso2 = code or (game_iso2 if game_iso2 else "")
    country_id = f"game:{game_id}:{game_iso2}:{normalize(name)}"
    return country_id, game_iso2, official_iso2


def marker_coordinates(
    markers: list[dict[str, Any]],
    iso1_by_alpha2: dict[str, dict[str, Any]],
) -> dict[str, list[tuple[str, float, float]]]:
    result: dict[str, list[tuple[str, float, float]]] = defaultdict(list)
    for marker in markers:
        iso2 = str(marker.get("iso") or "").upper()
        if iso2 not in iso1_by_alpha2:
            continue
        name = marker.get("capital")
        try:
            latitude = float(marker.get("latitude", marker.get("lat")))
            longitude = float(marker.get("longitude", marker.get("lng")))
        except (TypeError, ValueError):
            continue
        if (
            not name
            or not math.isfinite(latitude)
            or not math.isfinite(longitude)
            or not -90 <= latitude <= 90
            or not -180 <= longitude <= 180
        ):
            continue
        key = normalize(f"{iso2}:{name}")
        candidate = (iso2, longitude, latitude)
        if candidate not in result[key]:
            result[key].append(candidate)
    return result


def build_dataset(
    iso1_data: dict[str, Any],
    iso2_data: dict[str, Any],
    admin1_data: dict[str, Any],
) -> dict[str, Any]:
    game_countries, game_markers = load_game_data()
    city_data = json.loads(CITY_CELLS_PATH.read_text(encoding="utf-8"))
    city_cells = city_data.get("cityCells", {})
    regions = city_data.get("regions", {})

    iso1_rows = iso1_data.get("3166-1", [])
    iso2_rows = iso2_data.get("3166-2", [])
    iso1_by_alpha2 = {
        row["alpha_2"]: row
        for row in iso1_rows
        if row.get("alpha_2") and row.get("alpha_3")
    }
    alpha2_by_alpha3 = {
        row["alpha_3"]: row["alpha_2"] for row in iso1_by_alpha2.values()
    }
    iso2_by_country: dict[str, dict[str, dict[str, Any]]] = defaultdict(dict)
    for row in iso2_rows:
        code = str(row.get("code") or "").upper()
        if "-" not in code:
            continue
        alpha2 = code.split("-", 1)[0]
        iso2_by_country[alpha2][code] = row

    ne_by_country: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for feature in admin1_data.get("features", []):
        properties = feature.get("properties") or {}
        alpha2 = get_feature_country_iso(
            properties, iso1_by_alpha2, alpha2_by_alpha3
        )
        if alpha2 and feature.get("geometry"):
            feature["_game_iso2"] = alpha2
            feature["_bbox"] = geometry_bbox(feature["geometry"])
            ne_by_country[alpha2].append(feature)

    source_game_code_counts = Counter(
        str(country.get("iso") or "").upper() for country in game_countries
    )
    source_game_id_counts = Counter(str(country.get("id", "")) for country in game_countries)
    markers_by_key = marker_coordinates(game_markers, iso1_by_alpha2)
    output_countries: list[dict[str, Any]] = []
    province_index: dict[str, dict[str, dict[str, Any]]] = {}

    for game_country in game_countries:
        country_id, game_iso2, official_iso2 = get_game_country_identity(game_country)
        resolved_iso2 = official_iso2 if official_iso2 in iso1_by_alpha2 else ""
        official_country = iso1_by_alpha2.get(resolved_iso2)
        iso3 = official_country.get("alpha_3") if official_country else None
        country_name = str(game_country.get("country") or "Unknown")
        iso_name = official_country.get("name") if official_country else None
        iso_codes = iso2_by_country.get(resolved_iso2, {}) if resolved_iso2 else {}
        ne_features = ne_by_country.get(resolved_iso2, []) if resolved_iso2 else []

        ne_by_code: dict[str, list[dict[str, Any]]] = defaultdict(list)
        for feature in ne_features:
            properties = feature.get("properties") or {}
            code = str(properties.get("iso_3166_2") or "").upper()
            if code and resolved_iso2 and code.startswith(f"{resolved_iso2}-"):
                ne_by_code[code].append(feature)
            else:
                fallback = str(properties.get("adm1_code") or "").strip()
                if fallback:
                    ne_by_code[f"NE:{resolved_iso2}:{fallback}"].append(feature)

        province_records: dict[str, dict[str, Any]] = {}
        for code, features in ne_by_code.items():
            iso_record = iso_codes.get(code)
            if iso_record:
                province_id = code
                province_name = iso_record.get("name") or code
                province_type = iso_record.get("type") or "unverified"
                iso_code = code
            else:
                properties = features[0].get("properties") or {}
                fallback = str(properties.get("adm1_code") or code)
                province_id = f"NE:{resolved_iso2}:{fallback}"
                province_name = properties.get("name") or code
                province_type = (
                    properties.get("type_en")
                    or properties.get("type")
                    or "unverified"
                )
                iso_code = None

            province_records[province_id] = {
                "id": province_id,
                "name": province_name,
                "type": province_type,
                "cityCellIds": [],
                "cityCellMappingMethods": {},
                "regionIds": [],
                "isoCode": iso_code,
                "naturalEarthCode": code if not iso_record else None,
                "_features": features,
            }

        iso_code_set = set(iso_codes)
        ne_code_set = {code for code in ne_by_code if not code.startswith("NE:")}
        iso_only_codes = sorted(iso_code_set - ne_code_set)
        ne_only_codes = sorted(
            (ne_code_set - iso_code_set)
            | {
                province_id
                for province_id in province_records
                if province_id.startswith("NE:")
            }
        )
        shared_codes = sorted(iso_code_set & ne_code_set)

        override = GAME_COUNTRY_CODE_OVERRIDES.get(normalize(country_name))
        code_was_corrected = bool(override and game_iso2 != official_iso2)
        shared_types = {
            normalize(iso_codes[code].get("type"))
            for code in shared_codes
            if iso_codes[code].get("type")
        }
        iso_only_entries = [
            {
                "code": code,
                "name": iso_codes[code].get("name"),
                "type": iso_codes[code].get("type"),
            }
            for code in iso_only_codes
        ]
        iso_filtered_codes = sorted(
            code
            for code, entry in iso_codes.items()
            if normalize(entry.get("type")) in shared_types
        )
        iso_filtered_out_entries = [
            entry for entry in iso_only_entries
            if normalize(entry.get("type")) not in shared_types
        ]
        natural_earth_only_entries = [
            {
                "id": province["id"],
                "name": province["name"],
                "naturalEarthCode": province.get("naturalEarthCode"),
                "type": province["type"],
            }
            for province in province_records.values()
            if province.get("isoCode") is None
            and province["type"] != "noSubdivision"
        ]
        natural_earth_name_differences = []
        for code in shared_codes:
            ne_names = sorted(
                {
                    str(properties.get(key))
                    for feature in ne_by_code[code]
                    for properties in [feature.get("properties") or {}]
                    for key in ("name", "name_alt", "name_local")
                    if properties.get(key)
                }
            )
            iso_name_for_code = str(iso_codes[code].get("name") or "")
            if normalize(iso_name_for_code) not in {
                normalize(name) for name in ne_names
            }:
                natural_earth_name_differences.append(
                    {
                        "code": code,
                        "isoName": iso_name_for_code,
                        "naturalEarthNames": ne_names,
                    }
                )
        natural_earth_names_match = all(
            normalize(iso_codes[code].get("name"))
            in {
                normalize(properties.get("name"))
                for feature in ne_by_code[code]
                for properties in [feature.get("properties") or {}]
            }
            for code in shared_codes
        )
        if not official_country:
            status = "unverified"
        elif code_was_corrected or iso_only_codes or ne_only_codes:
            status = "conflict"
        else:
            status = "verified"

        no_subdivision = (
            official_country is not None
            and not iso_code_set
            and not ne_by_code
        )
        if no_subdivision:
            province_records[f"NO-ADM1:{country_id}"] = {
                "id": f"NO-ADM1:{country_id}",
                "name": f"No ADM1 subdivision recorded ({iso_name})",
                "type": "noSubdivision",
                "cityCellIds": [],
                "cityCellMappingMethods": {},
                "regionIds": [],
                "isoCode": None,
                "_features": [],
            }

        if not official_country:
            resolution = "manual-review"
            resolution_reason = (
                "No ISO 3166-1 assignment or matched Natural Earth Admin-1 data; "
                "province count is unverified and no province was invented."
            )
        elif code_was_corrected:
            resolution = "manual-review"
            resolution_reason = (
                "The game roster ISO-2 was corrected by explicit name mapping; "
                "the country identity and subdivisions require confirmation."
            )
        elif not iso_code_set and not ne_by_code:
            resolution = "auto-natural-earth"
            resolution_reason = (
                "Neither source lists an ADM1 candidate; retain one noSubdivision "
                "placeholder as required by the game data contract."
            )
        elif iso_code_set == ne_code_set and not ne_only_codes:
            resolution = "auto-natural-earth"
            if natural_earth_names_match:
                resolution_reason = (
                    "Natural Earth Admin-1 code and name sets match ISO 3166-2 exactly."
                )
            else:
                resolution_reason = (
                    "Natural Earth Admin-1 and ISO 3166-2 code sets match exactly; "
                    "ISO codes verify identity despite source-name variants, and "
                    "Natural Earth names are retained."
                )
        elif (
            ne_code_set
            and ne_code_set.issubset(iso_code_set)
            and not ne_only_codes
            and shared_types
            and iso_filtered_codes == sorted(ne_code_set)
            and len(iso_filtered_out_entries) == len(iso_only_entries)
            and all(
                is_explicitly_below_adm1(entry.get("type"))
                for entry in iso_filtered_out_entries
            )
        ):
            resolution = "auto-iso-filtered"
            resolution_reason = (
                "Natural Earth Admin-1 codes match the retained ISO codes; each "
                "excluded ISO-only type explicitly identifies an ADM2/ADM3-level "
                "entry."
            )
        else:
            resolution = "manual-review"
            resolution_reason = (
                "Natural Earth Admin-1 and ISO 3166-2 do not reconcile by exact code "
                "and name or by a consistent subdivision-type filter; retain Natural "
                "Earth candidates provisionally and review the listed differences."
            )

        final_provinces = [
            {key: value for key, value in province.items() if not key.startswith("_")}
            for province in sorted(
                province_records.values(),
                key=lambda item: (normalize(item["name"]), item["id"]),
            )
        ]
        country_output = {
            "countryId": country_id,
            "gameId": game_country.get("id"),
            "gameIso2": game_iso2 or None,
            "iso2": resolved_iso2 or None,
            "iso3": iso3,
            "name": country_name,
            "isoName": iso_name,
            "provinceCount": len(province_records),
            "finalProvinceCount": len(final_provinces),
            "resolution": resolution,
            "resolutionReason": resolution_reason,
            "noSubdivision": no_subdivision,
            "status": status,
            "sourceComparison": {
                "iso3166_2CodeCount": len(iso_code_set),
                "naturalEarthAdmin1CandidateCount": len(ne_by_code),
                "sharedCodeCount": len(shared_codes),
                "isoOnlyCodes": iso_only_codes,
                "isoOnlyEntries": iso_only_entries,
                "isoFilteredOutEntries": iso_filtered_out_entries,
                "isoFilteredCodeCount": len(iso_filtered_codes),
                "naturalEarthOnlyCodes": ne_only_codes,
                "naturalEarthOnlyEntries": natural_earth_only_entries,
                "naturalEarthNameDifferences": natural_earth_name_differences,
                "gameIso2Corrected": code_was_corrected,
                "gameNumericIdDuplicate": source_game_id_counts[str(game_country.get("id", ""))] > 1,
                "gameIso2Duplicate": source_game_code_counts[game_iso2] > 1,
            },
            "provinces": final_provinces,
        }
        output_countries.append(country_output)
        province_index[country_id] = province_records

    country_by_iso2: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for country in output_countries:
        if country["iso2"]:
            country_by_iso2[country["iso2"]].append(country)

    unmapped_city_cells: list[dict[str, Any]] = []
    city_mapping_method_counts: Counter[str] = Counter()
    for city_cell_id in city_cells:
        cell_key = normalize(city_cell_id)
        marker_candidates = markers_by_key.get(cell_key, [])
        cell_matches = [
            marker
            for marker in marker_candidates
            if point_in_city_cell(city_cells[city_cell_id], marker[1], marker[2])
        ]
        if len(cell_matches) == 1:
            marker_candidates = cell_matches

        exact_matches: set[tuple[str, str]] = set()
        nearest_by_province: dict[tuple[str, str], float] = {}
        for marker_iso2, longitude, latitude in marker_candidates:
            possible_countries = country_by_iso2.get(marker_iso2, [])
            if len(possible_countries) != 1:
                continue
            country = possible_countries[0]
            for province_id, province in province_index[country["countryId"]].items():
                if not province["_features"]:
                    continue
                distance = min(
                    geometry_distance_km(feature["geometry"], longitude, latitude)
                    for feature in province["_features"]
                )
                province_key = (country["countryId"], province_id)
                nearest_by_province[province_key] = min(
                    distance, nearest_by_province.get(province_key, math.inf)
                )
                if distance == 0:
                    exact_matches.add(province_key)

        nearest_matches = [
            (distance, country_id, province_id)
            for (country_id, province_id), distance in nearest_by_province.items()
        ]
        country_id: str | None = None
        province_id: str | None = None
        mapping_method: str | None = None
        if len(exact_matches) == 1:
            country_id, province_id = next(iter(exact_matches))
            mapping_method = "point-in-polygon"
        elif not exact_matches and nearest_matches:
            nearest_matches.sort()
            nearest_distance = nearest_matches[0][0]
            nearest_ties = [
                candidate for candidate in nearest_matches
                if abs(candidate[0] - nearest_distance) <= 0.5
            ]
            if nearest_distance <= 25 and len(nearest_ties) == 1:
                _, country_id, province_id = nearest_ties[0]
                mapping_method = "nearest-boundary-within-25km"

        if not country_id:
            _, separator, city_name = city_cell_id.partition(":")
            possible_iso2 = city_cell_id.partition(":")[0].upper() if separator else ""
            possible_countries = country_by_iso2.get(possible_iso2, [])
            name_matches: set[tuple[str, str]] = set()
            if len(possible_countries) == 1:
                candidate_country = possible_countries[0]
                city_name_key = normalize(city_name)
                for candidate_id, candidate in province_index[candidate_country["countryId"]].items():
                    if city_name_key and city_name_key in {
                        normalize(candidate["name"]),
                        normalize(candidate.get("isoCode")),
                        normalize(candidate.get("naturalEarthCode")),
                    }:
                        name_matches.add((candidate_country["countryId"], candidate_id))
            if len(name_matches) == 1:
                country_id, province_id = next(iter(name_matches))
                mapping_method = "exact-normalized-name"

        if not country_id or not province_id:
            nearest_distance = nearest_matches[0][0] if nearest_matches else None
            if not marker_candidates:
                reason = "No matching game marker with a usable country code and coordinates."
            elif nearest_distance is not None and nearest_distance > 25:
                reason = (
                    f"Nearest ADM1 boundary is {nearest_distance:.1f} km from the marker, "
                    "beyond the 25 km tolerance; likely offshore/outside the source polygons."
                )
            elif len(exact_matches) > 1:
                reason = "Marker falls on/inside multiple ADM1 candidates; nearest distance is ambiguous."
            elif nearest_distance is not None:
                reason = (
                    f"Nearest ADM1 candidates tie within 0.5 km at {nearest_distance:.1f} km; "
                    "no unique province can be selected."
                )
            else:
                reason = "No point-in-polygon or unique exact-name match."
            unmapped_city_cells.append(
                {
                    "id": city_cell_id,
                    "reason": reason,
                    "fallbacksTried": [
                        "exact point-in-polygon",
                        "nearest ADM1 boundary within 25 km",
                        "unique normalized city/province name",
                    ],
                    "nearestDistanceKm": (
                        round(nearest_distance, 2)
                        if nearest_distance is not None and math.isfinite(nearest_distance)
                        else None
                    ),
                }
            )
            continue

        province_index[country_id][province_id]["cityCellIds"].append(city_cell_id)
        province_index[country_id][province_id]["cityCellMappingMethods"][
            city_cell_id
        ] = mapping_method
        city_mapping_method_counts[mapping_method] += 1

    # Region identifiers are synthetic capture groups. Map only by a unique
    # exact normalized ISO subdivision name/code; ambiguous groups stay unmapped.
    region_name_index: dict[tuple[str, str], set[str]] = defaultdict(set)
    for country in output_countries:
        iso2 = country["iso2"]
        if not iso2:
            continue
        for province_id, province in province_index[country["countryId"]].items():
            if province["type"] == "noSubdivision":
                continue
            region_name_index[(iso2, normalize(province["name"]))].add(province_id)
            if province.get("isoCode"):
                region_name_index[(iso2, normalize(province["isoCode"]))].add(province_id)
            if province.get("naturalEarthCode"):
                region_name_index[(iso2, normalize(province["naturalEarthCode"]))].add(province_id)
            for feature in province["_features"]:
                properties = feature.get("properties") or {}
                for key in ("name", "name_alt", "name_local"):
                    raw_name = properties.get(key)
                    if raw_name:
                        region_name_index[(iso2, normalize(raw_name))].add(province_id)

    unmapped_regions: list[dict[str, str]] = []
    for region_id in regions:
        country_prefix, separator, region_name = region_id.partition(":")
        iso2 = country_prefix.upper() if separator else ""
        possible_countries = country_by_iso2.get(iso2, [])
        if len(possible_countries) != 1:
            unmapped_regions.append(
                {"id": region_id, "reason": "Region country code does not uniquely match a game country."}
            )
            continue
        country = possible_countries[0]
        candidates = region_name_index.get((iso2, normalize(region_name)), set())
        if len(candidates) != 1:
            reason = (
                "Region name matches multiple ADM1 candidates."
                if candidates
                else "No exact ISO/Natural Earth ADM1 name or code match."
            )
            unmapped_regions.append({"id": region_id, "reason": reason})
            continue
        province_id = next(iter(candidates))
        province_index[country["countryId"]][province_id]["regionIds"].append(region_id)

    for country in output_countries:
        records = province_index[country["countryId"]]
        country["provinces"] = [
            {key: value for key, value in province.items() if not key.startswith("_")}
            for province in sorted(
                records.values(),
                key=lambda item: (normalize(item["name"]), item["id"]),
            )
        ]
        country["provinceCount"] = len(country["provinces"])

    total_candidate_provinces = sum(country["provinceCount"] for country in output_countries)
    total_final_provinces = sum(
        country["finalProvinceCount"] for country in output_countries
    )
    status_counts = Counter(country["status"] for country in output_countries)
    resolution_counts = Counter(country["resolution"] for country in output_countries)
    roster_identity_counts = Counter(country["countryId"] for country in output_countries)
    if any(count != 1 for count in roster_identity_counts.values()):
        raise ValueError("Generated countryId values are not unique.")

    dataset = {
        "meta": {
            "generatedAt": datetime.now(timezone.utc).isoformat(),
            "sources": SOURCES,
            "totalCountries": len(output_countries),
            "totalProvinces": total_final_provinces,
            "totalCandidateProvinces": total_candidate_provinces,
            "totalFinalProvinces": total_final_provinces,
            "statusCounts": {
                "verified": status_counts["verified"],
                "conflict": status_counts["conflict"],
                "unverified": status_counts["unverified"],
            },
            "resolutionCounts": {
                "auto-natural-earth": resolution_counts["auto-natural-earth"],
                "auto-iso-filtered": resolution_counts["auto-iso-filtered"],
                "manual-review": resolution_counts["manual-review"],
            },
            "provinceCountBasis": (
                "Natural Earth Admin 1 features grouped by ISO 3166-2 code, plus "
                "explicitly identified Natural Earth-only candidates and one "
                "noSubdivision placeholder where both sources list no subdivision. "
                "This is not a definitive official total for countries with conflicts."
            ),
            "hierarchyCaveat": (
                "ISO 3166-2 lists subdivision codes but does not encode a universal "
                "ADM1 hierarchy. Countries whose full ISO code set differs from "
                "Natural Earth Admin 1 are marked conflict; ISO-only codes are not "
                "silently counted as first-level provinces."
            ),
            "regionGeometryNature": (
                "The 150 region shapes are capture groups generated by dissolving "
                "Natural Earth Admin-1 features on the source region/region_cod "
                "attribute (or feature name when absent), then linking city markers. "
                "They are not inherently ADM1 units. Only unique exact name/code "
                "matches are linked; no centroid/overlap guess is treated as identity."
            ),
            "cityCellMappingToleranceKm": 25,
            "cityCellCount": len(city_cells),
            "mappedCityCellCount": len(city_cells) - len(unmapped_city_cells),
            "unmappedCityCellCount": len(unmapped_city_cells),
            "cityCellMappingMethodCounts": {
                method: city_mapping_method_counts[method]
                for method in (
                    "point-in-polygon",
                    "nearest-boundary-within-25km",
                    "exact-normalized-name",
                )
            },
            "regionGeometryCount": len(regions),
            "mappedRegionCount": len(regions) - len(unmapped_regions),
            "unmappedRegionCount": len(unmapped_regions),
        },
        "countries": output_countries,
        "unmapped": {
            "cityCells": unmapped_city_cells,
            "regions": unmapped_regions,
        },
    }
    return dataset


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--iso3166-1", help="Local iso_3166-1.json; downloads pinned source by default.")
    parser.add_argument("--iso3166-2", help="Local iso_3166-2.json; downloads pinned source by default.")
    parser.add_argument("--admin1", help="Local Natural Earth Admin-1 GeoJSON; downloads pinned source by default.")
    parser.add_argument("--output-dir", default=str(ROOT / "data"), help="Output directory (default: repository data/).")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    try:
        iso1_data = load_json(args.iso3166_1, ISO_3166_1_URL)
        iso2_data = load_json(args.iso3166_2, ISO_3166_2_URL)
        admin1_data = load_json(args.admin1, NATURAL_EARTH_ADMIN1_URL)
        dataset = build_dataset(iso1_data, iso2_data, admin1_data)
        from validate_provinces import validate_dataset

        errors = validate_dataset(dataset, ROOT)
        if errors:
            raise ValueError("Validation failed:\n- " + "\n- ".join(errors))

        output_dir = Path(args.output_dir).resolve()
        output_dir.mkdir(parents=True, exist_ok=True)
        output_path = output_dir / "provinces.final.json"
        report_path = output_dir / "manual-review.md"
        temp_output_path = output_path.with_suffix(".json.tmp")
        temp_output_path.write_text(
            json.dumps(dataset, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )
        temp_output_path.replace(output_path)
        report_path.write_text(render_report(dataset), encoding="utf-8")
        print(
            f"Built {output_path}: {dataset['meta']['totalCountries']} countries, "
            f"{dataset['meta']['totalFinalProvinces']} final province records; "
            f"{dataset['meta']['resolutionCounts']}"
        )
        print(
            f"Unmapped references: {dataset['meta']['unmappedCityCellCount']} city cells, "
            f"{dataset['meta']['unmappedRegionCount']} regions"
        )
        print(f"Manual-review report: {report_path}")
        return 0
    except Exception as error:
        print(f"Province data build failed: {error}", file=sys.stderr)
        return 1


def render_report(dataset: dict[str, Any]) -> str:
    countries = dataset["countries"]
    meta = dataset["meta"]
    lines = [
        "# Manual review: final province candidates",
        "",
        f"Generated: {meta['generatedAt']}",
        "",
        "## Summary",
        "",
        f"- Game country records: {meta['totalCountries']}",
        f"- Final province records (including no-subdivision placeholders): {meta['totalFinalProvinces']}",
        f"- Resolution counts: {meta['resolutionCounts']}",
        f"- Status counts: verified {meta['statusCounts']['verified']}, "
        f"conflict {meta['statusCounts']['conflict']}, "
        f"unverified {meta['statusCounts']['unverified']}",
        f"- City cells: {meta['mappedCityCellCount']} mapped, "
        f"{meta['unmappedCityCellCount']} unmapped of {meta['cityCellCount']}",
        f"- City-cell mapping methods: {meta['cityCellMappingMethodCounts']}",
        f"- Region geometries: {meta['mappedRegionCount']} mapped, "
        f"{meta['unmappedRegionCount']} unmapped of {meta['regionGeometryCount']}",
        "",
        "Natural Earth Admin-1 is the primary list and geometry source. Where "
        "automatic checks do not reconcile, the listed Natural Earth count remains "
        "provisional and the country is explicitly marked `manual-review`.",
        "",
        "## Countries",
        "",
        "| Country (game name) | ISO-2 / ISO-3 | ISO 3166-2 codes | Natural Earth ADM1 candidates | Final count | Resolution |",
        "|---|---|---:|---:|---:|---|",
    ]
    for country in countries:
        comparison = country["sourceComparison"]
        code_display = (
            f"{country['iso2']} / {country['iso3']}"
            if country["iso2"]
            else f"unassigned ({country['gameIso2'] or 'no game code'})"
        )
        lines.append(
            f"| {country['name']} | {code_display} | "
            f"{comparison['iso3166_2CodeCount']} | "
            f"{comparison['naturalEarthAdmin1CandidateCount']} | "
            f"{country['finalProvinceCount']} | {country['resolution']} |"
        )

    lines.extend(
        [
            "",
            "## Conflicts and unverified countries",
            "",
        ]
    )
    issues = [country for country in countries if country["resolution"] == "manual-review"]
    if not issues:
        lines.append("None.")
    else:
        for country in issues:
            comparison = country["sourceComparison"]
            lines.append(
                f"- **{country['name']}** (`{country['iso2'] or country['gameIso2']}`; "
                f"`{country['resolution']}`): ISO 3166-2 lists "
                f"{comparison['iso3166_2CodeCount']} codes; Natural Earth Admin 1 "
                f"has {comparison['naturalEarthAdmin1CandidateCount']} candidates "
                f"({comparison['sharedCodeCount']} shared); difference "
                f"{comparison['naturalEarthAdmin1CandidateCount'] - comparison['iso3166_2CodeCount']:+d}. "
                f"Final count {country['finalProvinceCount']} is provisional."
            )
            lines.append(f"  Resolution reason: {country['resolutionReason']}")
            if comparison["gameIso2Corrected"]:
                override = GAME_COUNTRY_CODE_OVERRIDES[normalize(country["name"])]
                lines.append(f"  Game-code correction: {override[1]}")
            if comparison["isoOnlyCodes"]:
                lines.append(
                    "  ISO-only codes (hierarchy/geometry unresolved): "
                    + ", ".join(f"`{code}`" for code in comparison["isoOnlyCodes"])
                    + "."
                )
            if comparison["naturalEarthOnlyCodes"]:
                lines.append(
                    "  Natural Earth-only candidate IDs (no ISO 3166-2 code): "
                    + ", ".join(f"`{code}`" for code in comparison["naturalEarthOnlyCodes"])
                    + "."
                )
            if comparison["isoOnlyEntries"]:
                lines.append(
                    "  ISO-only entries: "
                    + "; ".join(
                        f"`{entry['code']}` {entry['name']} "
                        f"(type: {entry['type'] or 'not supplied'})"
                        for entry in comparison["isoOnlyEntries"]
                    )
                    + "."
                )
            if comparison["naturalEarthOnlyEntries"]:
                lines.append(
                    "  Natural Earth-only entries: "
                    + "; ".join(
                        f"`{entry['id']}` {entry['name']} "
                        f"(NE code: {entry['naturalEarthCode'] or 'none'}; type: {entry['type']})"
                        for entry in comparison["naturalEarthOnlyEntries"]
                    )
                    + "."
                )
            if comparison["naturalEarthNameDifferences"]:
                lines.append(
                    "  Shared-code name differences (code remains the identity key): "
                    + "; ".join(
                        f"`{entry['code']}` ISO {entry['isoName']!r} vs "
                        f"Natural Earth {', '.join(repr(name) for name in entry['naturalEarthNames'])}"
                        for entry in comparison["naturalEarthNameDifferences"]
                    )
                    + "."
                )

    duplicate_ids = defaultdict(list)
    duplicate_codes = defaultdict(list)
    for country in countries:
        duplicate_ids[str(country["gameId"])].append(country["name"])
        if country["gameIso2"]:
            duplicate_codes[country["gameIso2"]].append(country["name"])
    duplicate_id_rows = {key: value for key, value in duplicate_ids.items() if len(value) > 1}
    duplicate_code_rows = {key: value for key, value in duplicate_codes.items() if len(value) > 1}
    lines.extend(["", "## Game roster identifier issues", ""])
    if not duplicate_id_rows and not duplicate_code_rows:
        lines.append("No duplicate numeric game IDs or source ISO-2 values.")
    else:
        for game_id, names in sorted(duplicate_id_rows.items()):
            lines.append(f"- Duplicate game numeric ID `{game_id}`: {', '.join(names)}.")
        for code, names in sorted(duplicate_code_rows.items()):
            lines.append(f"- Duplicate game ISO-2 `{code}`: {', '.join(names)}.")
        lines.append(
            "The output `countryId` is a composite of game ID, source ISO-2, and "
            "normalized game name so all 212 source records remain unique."
        )
        if duplicate_id_rows:
            max_game_id = max(int(country["gameId"]) for country in countries)
            proposed_id = max_game_id + 1
            lines.extend(
                [
                    "",
                    "### Duplicate numeric ID review (no source IDs changed)",
                    "",
                    "The numeric ID is a game/database key and cannot be inferred from ISO. "
                    "Search across `map-data.ts` and SQL seeds found existing database "
                    "uses, so the following is a proposal only; confirm before applying it:",
                    "",
                    "| Current ID | Preserve (provisional) | Reassign (proposal) | Proposed new ID | Evidence / caveat |",
                    "|---:|---|---|---:|---|",
                ]
            )
            retain_first = {
                "70010": "Guadeloupe",
                "70011": "Martinique",
                "70012": "Bonaire, Sint Eustatius dan Saba",
            }
            evidence = {
                "70010": "Economy SQL seed also associates 70010 with Guadeloupe.",
                "70011": "Economy SQL seed also associates 70011 with Martinique.",
                "70012": "SQL seeds associate 70012 with both entries; preserving Bonaire is only a provisional first-roster-row choice.",
            }
            for game_id, names in sorted(duplicate_id_rows.items(), key=lambda item: int(item[0])):
                keeper = retain_first.get(game_id, names[0])
                reassigned = [name for name in names if name != keeper]
                for name in reassigned:
                    lines.append(
                        f"| {game_id} | {keeper} | {name} | {proposed_id} | "
                        f"{evidence.get(game_id, 'ID has no ISO-derived meaning; confirm dependent references.')} |"
                    )
                    proposed_id += 1
            lines.extend(
                [
                    "",
                    "Before changing any IDs, update and migrate all matching seed rows and "
                    "foreign-key/reference data. This report does not apply the proposed IDs.",
                ]
            )

    for title, key in [
        ("Unmapped cityCells", "cityCells"),
        ("Unmapped region geometries", "regions"),
    ]:
        lines.extend(["", f"## {title}", ""])
        items = dataset["unmapped"][key]
        if not items:
            lines.append("None.")
        else:
            for item in items:
                lines.append(f"- `{item['id']}` — {item['reason']}")

    lines.extend(
        [
            "",
            "## Region geometry findings",
            "",
            meta["regionGeometryNature"],
            "",
            "For unmapped region groups, centroid or largest-overlap allocation was "
            "not used to claim administrative identity: a dissolved capture shape may "
            "cover multiple ADM1 units. A centroid/overlap result would only be a "
            "spatial guess, not proof that the region is a province. The unmapped "
            "regions remain explicitly separate until an authoritative mapping exists.",
        ]
    )

    lines.extend(["", "## Provinces without a linked game geometry", ""])
    uncovered_countries = []
    for country in countries:
        uncovered = [
            province for province in country["provinces"]
            if not province["cityCellIds"] and not province["regionIds"]
        ]
        if uncovered:
            codes = ", ".join(
                f"`{province['id']}`" for province in uncovered
            )
            uncovered_countries.append(
                f"- {country['name']}: {len(uncovered)} unlinked province records ({codes})."
            )
    lines.extend(uncovered_countries or ["Every listed province has at least one linked geometry reference."])

    lines.extend(
        [
            "",
            "## Mapping and source limitations",
            "",
            "- CityCell assignment tries exact point-in-polygon, then nearest ADM1 boundary within 25 km (ties within 0.5 km are rejected), then unique normalized name.",
            "- Region assignment is exact normalized name/code only. These region geometries are dissolved capture groups and are not assumed to be administrative provinces.",
            "- ISO-only subdivision codes are reported, not counted as provinces, because the ISO code list does not identify their hierarchy and Natural Earth has no matching ADM1 feature.",
            "- Natural Earth-only features are listed as candidates with internal IDs, are not represented as official ISO province codes, and cause a `conflict` status.",
            "- `noSubdivision: true` means both input datasets contain no subdivision candidate; the single placeholder is not an actual province.",
            "",
            "## Sources",
            "",
        ]
    )
    for source in SOURCES:
        lines.append(f"- {source['name']}: {source.get('url', ', '.join(source.get('files', [])))}")
        if source.get("upstream"):
            lines.append(f"  Upstream: {source['upstream']}")
        if source.get("license"):
            lines.append(f"  License: {source['license']}")
    lines.append("")
    return "\n".join(lines)


if __name__ == "__main__":
    raise SystemExit(main())
