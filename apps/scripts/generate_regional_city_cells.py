import json
import math
import os
import re
import sys
import unicodedata
from collections import defaultdict


ADMIN1_PATH = sys.argv[1] if len(sys.argv) > 1 else "ne_10m_admin_1.json"
OUTPUT_PATH = "apps/public/city_province_cells.json"
TARGET_ISOS = {
    "az", "bf", "fr", "gb", "hu", "it", "lv", "mk", "mt", "ph", "si", "ug", "vn",
}
PRECISION = 5
SIMPLIFY_EPSILON = 0.002

MKD_REGION_MAP = {
    "Strumitsa": "Southeastern", "Gevgelija": "Southeastern", "Bogdanci": "Southeastern",
    "Valandovo": "Southeastern", "Doiran": "Southeastern", "Novo Selo": "Southeastern",
    "Radovis": "Southeastern", "Bosilovo": "Southeastern", "Vasilevo": "Southeastern",
    "Konche": "Southeastern", "Jegunovce": "Polog", "Tearce": "Polog", "Tetovo": "Polog",
    "Brvenica": "Polog", "Zelino": "Polog", "Vrapciste": "Polog", "Bogovinje": "Polog",
    "Skopje": "Skopje", "Aerodrom": "Skopje", "Butel": "Skopje", "Gazi Baba": "Skopje",
    "Gjorce Petrov": "Skopje", "Karpos": "Skopje", "Kisela Voda": "Skopje",
    "Saraj": "Skopje", "Centar": "Skopje", "Cucer-Sandevo": "Skopje",
    "Ilinden": "Skopje", "Petrovec": "Skopje", "Sopiste": "Skopje",
    "Studenicani": "Skopje", "Zelenikovo": "Skopje",
}


def normalize_key(value):
    value = unicodedata.normalize("NFD", str(value or "")).lower()
    value = re.sub(r"[\u0300-\u036f]", "", value)
    return re.sub(r"[^a-z0-9]", "", value)


def city_id(city):
    iso = (city.get("iso") or "").lower()
    name = city.get("capital") or ""
    return f"{iso}:{name}"


def simplify(points, epsilon):
    if len(points) <= 2:
        return points
    keep = [False] * len(points)
    keep[0] = keep[-1] = True
    stack = [(0, len(points) - 1)]
    while stack:
        start, end = stack.pop()
        if end <= start + 1:
            continue
        x1, y1 = points[start]
        x2, y2 = points[end]
        dx, dy = x2 - x1, y2 - y1
        norm = math.hypot(dx, dy)
        max_distance, index = 0.0, -1
        for i in range(start + 1, end):
            x0, y0 = points[i]
            distance = (
                math.hypot(x0 - x1, y0 - y1)
                if norm == 0
                else abs(dy * x0 - dx * y0 + x2 * y1 - y2 * x1) / norm
            )
            if distance > max_distance:
                max_distance, index = distance, i
        if max_distance > epsilon and index != -1:
            keep[index] = True
            stack.extend(((start, index), (index, end)))
    return [point for point, keep_point in zip(points, keep) if keep_point]


def dissolve_rings(rings):
    edge_count = defaultdict(int)
    for ring in rings:
        points = [(round(point[0], PRECISION), round(point[1], PRECISION)) for point in ring]
        for start, end in zip(points, points[1:]):
            if start != end:
                edge_count[(start, end)] += 1

    adjacency = defaultdict(list)
    for (start, end), count in edge_count.items():
        boundary_count = count - edge_count.get((end, start), 0)
        if boundary_count > 0:
            adjacency[start].extend([end] * boundary_count)

    result = []
    for start in list(adjacency):
        while adjacency[start]:
            next_point = adjacency[start].pop()
            ring = [start, next_point]
            current = next_point
            while current in adjacency and adjacency[current]:
                current = adjacency[current].pop()
                ring.append(current)
                if current == start:
                    break
            if ring[0] == ring[-1] and len(ring) >= 4:
                simplified = simplify(ring, SIMPLIFY_EPSILON)
                if len(simplified) >= 4:
                    result.append([[round(x, 5), round(y, 5)] for x, y in simplified])
    return result


def feature_polygons(geometry):
    if geometry["type"] == "Polygon":
        return [geometry["coordinates"]]
    if geometry["type"] == "MultiPolygon":
        return geometry["coordinates"]
    return []


def ring_area_centroid(ring):
    area_twice = 0.0
    centroid_x = 0.0
    centroid_y = 0.0
    for (x1, y1), (x2, y2) in zip(ring, ring[1:]):
        cross = x1 * y2 - x2 * y1
        area_twice += cross
        centroid_x += (x1 + x2) * cross
        centroid_y += (y1 + y2) * cross
    if abs(area_twice) < 1e-12:
        return None
    return (
        centroid_x / (3.0 * area_twice),
        centroid_y / (3.0 * area_twice),
        area_twice / 2.0,
    )


def feature_area_centroid(geometry):
    weighted_x = 0.0
    weighted_y = 0.0
    total_area = 0.0
    for polygon in feature_polygons(geometry):
        if not polygon:
            continue
        for index, ring in enumerate(polygon):
            centroid = ring_area_centroid(ring)
            if not centroid:
                continue
            area = abs(centroid[2]) * (1 if index == 0 else -1)
            weighted_x += centroid[0] * area
            weighted_y += centroid[1] * area
            total_area += area
    if total_area <= 1e-12:
        return None
    return weighted_x / total_area, weighted_y / total_area, total_area


def distance_km(point_a, point_b):
    lon_a, lat_a = point_a
    lon_b, lat_b = point_b
    mean_latitude = math.radians((lat_a + lat_b) / 2)
    dx = math.radians(lon_b - lon_a) * math.cos(mean_latitude)
    dy = math.radians(lat_b - lat_a)
    return 6371 * math.hypot(dx, dy)


def contains_point(ring, longitude, latitude):
    inside = False
    previous = len(ring) - 1
    for index, (x1, y1) in enumerate(ring):
        x2, y2 = ring[previous]
        if (y1 > latitude) != (y2 > latitude):
            crossing_x = (x2 - x1) * (latitude - y1) / (y2 - y1) + x1
            if longitude < crossing_x:
                inside = not inside
        previous = index
    return inside


def point_in_feature(geometry, longitude, latitude):
    for polygon in feature_polygons(geometry):
        if not polygon or not contains_point(polygon[0], longitude, latitude):
            continue
        if not any(contains_point(hole, longitude, latitude) for hole in polygon[1:]):
            return True
    return False


def get_region_key(properties):
    country = properties.get("admin") or properties.get("adm0_a3") or properties.get("ADMIN")
    name = properties.get("name") or properties.get("gns_name") or "unknown"
    region = properties.get("region") or properties.get("region_cod")
    if country in ("Macedonia", "North Macedonia"):
        region = MKD_REGION_MAP.get(name, region or "Central")
    elif not region:
        region = name
    return str(region or name)


with open(ADMIN1_PATH, "r", encoding="utf-8") as source:
    admin_features = json.load(source)["features"]

with open("apps/src/app/page/map_system/major_cities.json", "r", encoding="utf-8") as source:
    major_cities = json.load(source)

with open("apps/src/app/page/map_system/map-data.ts", "r", encoding="utf-8") as source:
    map_data = source.read()

capitals_match = re.search(r"export const CAPITALS_DATA = (\[.*?\]);", map_data, re.DOTALL)
capitals = json.loads(capitals_match.group(1)) if capitals_match else []

cities = {}
all_cities = {}
for city in capitals + major_cities:
    iso = (city.get("iso") or "").lower()
    name = city.get("capital") or ""
    if not iso or not name:
        continue
    latitude = float(city.get("latitude") or city.get("lat") or 0)
    longitude = float(city.get("longitude") or city.get("lng") or 0)
    if not math.isfinite(latitude) or not math.isfinite(longitude):
        continue
    if latitude == 0 and longitude == 0:
        continue
    city_key = normalize_key(city_id(city))
    city_data = {
        "name": name,
        "iso": iso,
        "lng": longitude,
        "lat": latitude,
    }
    all_cities[city_key] = city_data
    if iso in TARGET_ISOS:
        cities.setdefault(iso, {})[city_key] = city_data

admin_by_iso = defaultdict(list)
for feature in admin_features:
    properties = feature.get("properties") or {}
    iso = (properties.get("iso_a2") or "").lower()
    if not iso or iso == "-99":
        iso = (properties.get("adm0_a3") or "").lower()
    if iso in TARGET_ISOS and feature.get("geometry"):
        admin_by_iso[iso].append(feature)

output_regions = {}
output_city_regions = {}
for iso, features in admin_by_iso.items():
    region_features = defaultdict(list)
    for feature in features:
        region_features[get_region_key(feature.get("properties") or {})].append(feature)

    city_groups = defaultdict(list)
    for region_name, members in region_features.items():
        region_id = f"{iso}:{normalize_key(region_name)}"
        raw_rings = []
        cities_in_region = set()
        weighted_x = 0.0
        weighted_y = 0.0
        total_area = 0.0
        for feature in members:
            geometry = feature["geometry"]
            for polygon in feature_polygons(geometry):
                raw_rings.extend(polygon)
            centroid = feature_area_centroid(geometry)
            if centroid:
                weighted_x += centroid[0] * centroid[2]
                weighted_y += centroid[1] * centroid[2]
                total_area += centroid[2]
            for key, city in all_cities.items():
                if point_in_feature(geometry, city["lng"], city["lat"]):
                    cities_in_region.add(key)

        dissolved = dissolve_rings(raw_rings)
        if not dissolved:
            raise RuntimeError(f"Unable to dissolve region {iso}:{region_name}")
        output_regions[region_id] = dissolved

        country_cities_in_region = {
            key for key in cities_in_region if all_cities[key]["iso"] == iso
        }
        if country_cities_in_region:
            cities_in_region = country_cities_in_region

        if not cities_in_region and total_area > 0 and cities.get(iso):
            center = (weighted_x / total_area, weighted_y / total_area)
            nearest_country_city = min(
                cities[iso],
                key=lambda key: (
                    distance_km(
                        center,
                        (cities[iso][key]["lng"], cities[iso][key]["lat"]),
                    )
                ),
            )
            country_distance = distance_km(
                center,
                (
                    cities[iso][nearest_country_city]["lng"],
                    cities[iso][nearest_country_city]["lat"],
                ),
            )
            nearest_global_city = min(
                all_cities,
                key=lambda key: distance_km(
                    center,
                    (all_cities[key]["lng"], all_cities[key]["lat"]),
                ),
            )
            global_distance = distance_km(
                center,
                (
                    all_cities[nearest_global_city]["lng"],
                    all_cities[nearest_global_city]["lat"],
                ),
            )
            if (
                all_cities[nearest_global_city]["iso"] != iso
                and country_distance > 1000
                and global_distance < 250
            ):
                cities_in_region.add(nearest_global_city)
            else:
                cities_in_region.add(nearest_country_city)

        for city_key in cities_in_region:
            city_groups[city_key].append(region_id)

    for key, region_ids in city_groups.items():
        output_city_regions[key] = sorted(set(region_ids))

if os.path.exists(OUTPUT_PATH):
    with open(OUTPUT_PATH, encoding="utf-8") as source:
        existing_data = json.load(source)
    city_cells = existing_data.get("cityCells", existing_data)
    if not isinstance(city_cells, dict):
        raise ValueError(f"Expected cityCells object in {OUTPUT_PATH}")
else:
    city_cells = {}

regional_city_keys = {normalize_key(city_key) for city_key in output_city_regions}
city_cells = {
    city_key: cells
    for city_key, cells in city_cells.items()
    if normalize_key(city_key) not in regional_city_keys
}
result = {
    "cityCells": city_cells,
    "regions": output_regions,
    "cityRegions": output_city_regions,
}
os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
with open(OUTPUT_PATH, "w", encoding="utf-8") as destination:
    json.dump(result, destination, separators=(",", ":"), ensure_ascii=False)

print(
    f"Saved {OUTPUT_PATH}: {len(output_regions)} regions, "
    f"{len(output_city_regions)} city assignments, "
    f"{os.path.getsize(OUTPUT_PATH) // 1024} KB"
)
