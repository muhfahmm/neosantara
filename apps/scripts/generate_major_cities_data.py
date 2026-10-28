import urllib.request
import json
import math
import os

print("1. Memuat kota besar dunia...")
url_cities = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_populated_places.geojson"
req = urllib.request.Request(url_cities, headers={"User-Agent": "Mozilla/5.0"})
with urllib.request.urlopen(req, timeout=90) as resp:
    cities_data = json.loads(resp.read().decode("utf-8"))

cities_by_country = {}
for f in cities_data['features']:
    p = f['properties']
    c = p.get('ADM0NAME') or p.get('SOV0NAME') or '?'
    iso = (p.get('ISO_A2') or '').lower()
    pop = p.get('POP_MAX') or 0
    name = p.get('NAME') or 'City'
    pt = f['geometry']['coordinates']
    is_cap = (p.get('FEATURECLA') == 'Admin-0 capital' or p.get('CAPITAL') == 1)
    cities_by_country.setdefault(c, []).append((pop, name, pt, iso, is_cap))

# Baca daftar ibukota negara yang sudah ada di map-data.ts
with open('apps/src/app/page/map_system/map-data.ts', 'r', encoding='utf-8') as f:
    text = f.read()
idx = text.find('export const CAPITALS_DATA =')
end_idx = text.find('];', idx)
capitals_json_str = text[idx + len('export const CAPITALS_DATA ='):end_idx + 1]
existing_capitals = json.loads(capitals_json_str)

existing_cap_names = set(c['capital'].lower().strip() for c in existing_capitals)
iso_to_color = {c['iso'].lower(): c.get('color', '#3b82f6') for c in existing_capitals}
iso_to_country = {c['iso'].lower(): c.get('country', '') for c in existing_capitals}

major_cities = []

EUROPE_AND_TARGETS = {
    'Germany', 'France', 'Poland', 'Spain', 'Italy', 'United Kingdom', 'Romania', 'Ukraine',
    'Czechia', 'Austria', 'Hungary', 'Slovakia', 'Belarus', 'Greece', 'Portugal', 'Sweden',
    'Norway', 'Finland', 'Ireland', 'Lithuania', 'Latvia', 'Estonia', 'Belgium', 'Netherlands',
    'Denmark', 'Switzerland', 'Croatia', 'Slovenia', 'Bosnia and Herzegovina', 'Republic of Serbia',
    'Bulgaria', 'Moldova', 'Montenegro', 'Kosovo', 'Macedonia', 'North Macedonia', 'Albania',
    'Turkey', 'Algeria', 'Uganda', 'Philippines', 'Vietnam', 'Thailand', 'Indonesia', 'United States of America',
    'China', 'India', 'Japan', 'South Korea', 'Australia', 'Canada', 'Brazil', 'Mexico', 'Argentina',
    'Morocco', 'Egypt', 'South Africa', 'Saudi Arabia', 'Iran', 'Pakistan', 'Kazakhstan'
}

for country, clist in cities_by_country.items():
    matched = False
    for target in EUROPE_AND_TARGETS:
        if target.lower() in country.lower() or country.lower() in target.lower():
            matched = True
            break
    if not matched:
        continue

    non_capitals = [c for c in clist if c[1].lower().strip() not in existing_cap_names and not c[4]]
    non_capitals.sort(key=lambda x: x[0], reverse=True)

    selected_for_country = []
    max_k = 5 if len(clist) > 30 else 3

    for pop, name, pt, iso, _ in non_capitals:
        country_iso = iso
        if not country_iso or country_iso == '-99':
            for cap in existing_capitals:
                if cap['country'].lower() in country.lower():
                    country_iso = cap['iso'].lower()
                    break

        if not country_iso:
            continue

        cap_for_c = [cap for cap in existing_capitals if cap['iso'].lower() == country_iso]
        if cap_for_c:
            d_cap = math.hypot(pt[0]-cap_for_c[0]['lng'], pt[1]-cap_for_c[0]['lat'])
            if d_cap < 0.9:
                continue

        min_d_other = min([math.hypot(pt[0]-cp[0], pt[1]-cp[1]) for _, _, cp, _, _ in selected_for_country], default=999)
        if min_d_other < 1.1:
            continue

        selected_for_country.append((pop, name, pt, country_iso, False))
        if len(selected_for_country) >= max_k:
            break

    for pop, name, pt, iso, _ in selected_for_country:
        major_cities.append({
            "country": iso_to_country.get(iso, country),
            "capital": name,
            "lat": round(pt[1], 4),
            "lng": round(pt[0], 4),
            "iso": iso,
            "color": iso_to_color.get(iso, "#3b82f6"),
            "is_major_city": True
        })

print(f"Total kota besar yang diekstrak: {len(major_cities)}")

out_path = 'apps/src/app/page/map_system/major_cities.json'
with open(out_path, 'w', encoding='utf-8') as f:
    json.dump(major_cities, f, indent=2, ensure_ascii=False)

print(f"Berhasil disimpan ke {out_path}!")

