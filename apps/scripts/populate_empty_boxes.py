"""
SISTEM PENEMPATAN KOTA BESAR 1-KOTA-PER-KOTAK PROVINSI:
1. Membaca batas-batas poligon provinsi/region yang dibuat di peta (provinces_units).
2. Memeriksa kotak/poligon mana yang SUDAH memiliki Ibukota Negara (Capital).
3. Kotak yang sudah ada Ibukota TIDAK boleh dipasangi kota lagi (karena sudah ada ibukota di kotak tersebut!).
4. Untuk SETIAP KOTAK YANG MASIH KOSONG, cari kota berpopulasi terbesar yang terletak tepat di DALAM kotak tersebut (Point in Polygon).
5. Jika kotak tidak memiliki kota bernama di dataset, gunakan centroid titik tengah kotak tersebut sebagai kota representatif.
6. Hasilnya: Tepat ada 1 pin kota/ibukota di setiap kotak/wilayah perbatasan, tanpa ada kotak kosong dan tanpa tumpang-tindih dengan ibukota!
"""
import urllib.request
import json
import math
import os
import time

t0 = time.time()
print("1. Memuat dataset kota besar dunia (Populated Places)...")
url_cities = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_populated_places.geojson"
req = urllib.request.Request(url_cities, headers={"User-Agent": "Mozilla/5.0"})
with urllib.request.urlopen(req, timeout=90) as resp:
    cities_data = json.loads(resp.read().decode("utf-8"))

cities_by_country = {}
for f in cities_data['features']:
    p = f['properties']
    c = p.get('ADM0NAME') or p.get('SOV0NAME') or '?'
    pop = p.get('POP_MAX') or 0
    name = p.get('NAME') or 'City'
    pt = f['geometry']['coordinates']
    is_cap = (p.get('FEATURECLA') == 'Admin-0 capital' or p.get('CAPITAL') == 1)
    cities_by_country.setdefault(c, []).append({
        'pop': pop,
        'name': name,
        'pt': pt,
        'is_cap': is_cap
    })

print("2. Memuat dataset batas wilayah provinsi...")
url_prov = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_1_states_provinces.geojson"
req2 = urllib.request.Request(url_prov, headers={"User-Agent": "Mozilla/5.0"})
with urllib.request.urlopen(req2, timeout=120) as resp:
    prov_data = json.loads(resp.read().decode("utf-8"))

# Baca daftar ibukota resmi dari map-data.ts
with open('apps/src/app/page/map_system/map-data.ts', 'r', encoding='utf-8') as f:
    text = f.read()
idx = text.find('export const CAPITALS_DATA =')
end_idx = text.find('];', idx)
capitals_json_str = text[idx + len('export const CAPITALS_DATA ='):end_idx + 1]
existing_capitals = json.loads(capitals_json_str)

iso_to_color = {c['iso'].lower(): c.get('color', '#3b82f6') for c in existing_capitals}
iso_to_country = {c['iso'].lower(): c.get('country', '') for c in existing_capitals}

# Point in polygon
def pt_in_ring(ring, pt):
    x, y = pt[0], pt[1]
    inside = False
    j = len(ring) - 1
    for i in range(len(ring)):
        xi, yi = ring[i][0], ring[i][1]
        xj, yj = ring[j][0], ring[j][1]
        if ((yi > y) != (yj > y)) and (x < (xj - xi) * (y - yi) / (yj - yi) + xi):
            inside = not inside
        j = i
    return inside

def pt_in_geom(geom, pt):
    t = geom['type']
    coords = geom['coordinates']
    if t == 'Polygon':
        if not pt_in_ring(coords[0], pt): return False
        for h in coords[1:]:
            if pt_in_ring(h, pt): return False
        return True
    elif t == 'MultiPolygon':
        for poly in coords:
            if pt_in_ring(poly[0], pt):
                in_hole = False
                for h in poly[1:]:
                    if pt_in_ring(h, pt):
                        in_hole = True
                        break
                if not in_hole:
                    return True
        return False
    return False

def get_centroid(geom):
    coords = geom.get('coordinates', [])
    t = geom.get('type')
    pts = []
    if t == 'Polygon':
        for r in coords: pts.extend(r)
    elif t == 'MultiPolygon':
        for poly in coords:
            for r in poly: pts.extend(r)
    if not pts:
        return (0.0, 0.0)
    sx = sum(p[0] for p in pts)
    sy = sum(p[1] for p in pts)
    return (sx / len(pts), sy / len(pts))

# Kelompokkan poligon per negara
country_features = {}
for f in prov_data['features']:
    props = f.get('properties') or {}
    country = props.get('admin') or props.get('adm0_a3') or props.get('ADMIN') or '?'
    country_features.setdefault(country, []).append(f)

# Buat daftar kota besar per kotak provinsi yang kosong
major_cities = []

for country, feats in country_features.items():
    if not feats:
        continue

    # Cari data ibukota negara ini dari existing_capitals
    cap_info = None
    for cap in existing_capitals:
        if cap['country'].lower().strip() == country.lower().strip() or country.lower().strip() in cap['country'].lower().strip():
            cap_info = cap
            break
    if not cap_info:
        for cap in existing_capitals:
            iso = feats[0].get('properties', {}).get('iso_a2', '').lower()
            if iso and cap['iso'].lower() == iso:
                cap_info = cap
                break

    country_iso = cap_info['iso'].lower() if cap_info else feats[0].get('properties', {}).get('iso_a2', '').lower()
    country_name = cap_info['country'] if cap_info else country
    country_color = iso_to_color.get(country_iso, '#3b82f6')
    cap_pt = (cap_info['lng'], cap_info['lat']) if cap_info else None

    # Cari kota-kota yang tersedia untuk negara ini
    c_cities = cities_by_country.get(country, [])
    if not c_cities:
        for cname, clist in cities_by_country.items():
            if country.lower() in cname.lower() or cname.lower() in country.lower():
                c_cities = clist
                break

    # Urutkan kota berdasarkan populasi terbesar
    c_cities = sorted(c_cities, key=lambda x: x['pop'], reverse=True)

    # Identifikasi setiap kotak (provinsi) di negara ini
    # Jika sebuah negara punya kota khusus seperti 'Almaty City' atau 'Astana' yang menempel,
    # skip poligon kota kecil yang terpisah jika itu sudah ibukota
    used_city_names = set()
    if cap_info:
        used_city_names.add(cap_info['capital'].lower().strip())

    for f in feats:
        geom = f.get('geometry')
        if not geom:
            continue
        pname = f.get('properties', {}).get('name') or ''

        # 1. Cek apakah KOTAK INI SUDAH MEMILIKI IBUKOTA NEGARA
        if cap_pt and pt_in_geom(geom, cap_pt):
            # Kotak ini sudah ada Ibukota Negaranya! Jangan letakkan kota lain di sini!
            continue

        # Cek jika centroid sangat dekat dengan ibukota (misal distrik ibukota itu sendiri)
        centroid = get_centroid(geom)
        if cap_pt and math.hypot(centroid[0]-cap_pt[0], centroid[1]-cap_pt[1]) < 0.6:
            continue

        # 2. Kotak ini KOSONG! Cari kota terbesar di DALAM kotak ini
        chosen_city = None
        for c in c_cities:
            cname = c['name'].strip()
            if cname.lower() in used_city_names:
                continue
            if pt_in_geom(geom, c['pt']):
                chosen_city = c
                break

        # Jika ada kota di dalam kotak ini:
        if chosen_city:
            used_city_names.add(chosen_city['name'].lower().strip())
            major_cities.append({
                "country": country_name,
                "capital": chosen_city['name'],
                "lat": round(chosen_city['pt'][1], 4),
                "lng": round(chosen_city['pt'][0], 4),
                "iso": country_iso,
                "color": country_color,
                "is_major_city": True
            })
        else:
            # Jika kotak provinsi luas tapi tidak memiliki nama kota di database,
            # gunakan nama provinsi tersebut di titik tengah (centroid) kotak!
            if pname and pname.lower().strip() not in used_city_names:
                used_city_names.add(pname.lower().strip())
                major_cities.append({
                    "country": country_name,
                    "capital": pname,
                    "lat": round(centroid[1], 4),
                    "lng": round(centroid[0], 4),
                    "iso": country_iso,
                    "color": country_color,
                    "is_major_city": True
                })

print(f"Total kota besar yang ditempatkan (1 di setiap kotak kosong): {len(major_cities)}")

out_path = 'apps/src/app/page/map_system/major_cities.json'
with open(out_path, 'w', encoding='utf-8') as f:
    json.dump(major_cities, f, indent=2, ensure_ascii=False)

print(f"File sukses disimpan ke {out_path}!")

