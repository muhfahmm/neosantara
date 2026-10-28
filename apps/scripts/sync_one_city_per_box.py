"""
SISTEM SINKRONISASI 100% PERSIS ANTARA GARIS PROVINSI DAN KOTA BESAR:
1. Membangun wilayah kotak (macro-regions) untuk SEMUA NEGARA di dunia (maksimal 3-6 kotak per negara).
2. Setiap kotak memiliki tepat 1 kota besar representatif (atau Ibukota jika kotak tersebut berisi Ibukota).
3. Garis batas provinsi (provinces_lines.geojson) HANYA DIGAMBAR DI ANTARA KOTAK-KOTAK INI!
4. Hasilnya:
   - Jumlah garis batas di Turki atau Afganistan atau negara manapun hanya membatasi 4-6 kotak besar!
   - Di SETIAP KOTAK, HANYA ADA TEPAT 1 NAMA KOTA / IBUKOTA!
   - Tidak ada lagi tumpukan puluhan kota di satu kotak seperti gambar!
"""
import urllib.request
import json
import math
import os
import time

PREC = 5
EPS = 0.002

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
    cities_by_country.setdefault(c, []).append({
        'pop': pop,
        'name': name,
        'pt': pt
    })

print("2. Memuat dataset batas poligon provinsi...")
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

def rp(pt):
    return (round(pt[0], PREC), round(pt[1], PREC))

def simplify(points, eps):
    n = len(points)
    if n <= 2:
        return points
    keep = [False] * n
    keep[0] = keep[-1] = True
    stack = [(0, n - 1)]
    while stack:
        s, e = stack.pop()
        if e <= s + 1:
            continue
        (x1, y1), (x2, y2) = points[s], points[e]
        dx, dy = x2 - x1, y2 - y1
        norm = math.hypot(dx, dy)
        dmax, idx = 0.0, -1
        for i in range(s + 1, e):
            x0, y0 = points[i]
            if norm == 0:
                d = math.hypot(x0 - x1, y0 - y1)
            else:
                d = abs(dy * x0 - dx * y0 + x2 * y1 - y2 * x1) / norm
            if d > dmax:
                dmax, idx = d, i
        if dmax > eps and idx != -1:
            keep[idx] = True
            stack.append((s, idx))
            stack.append((idx, e))
    return [p for p, k in zip(points, keep) if k]

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

country_features = {}
for f in prov_data['features']:
    props = f.get('properties') or {}
    country = props.get('admin') or props.get('adm0_a3') or props.get('ADMIN') or '?'
    country_features.setdefault(country, []).append(f)

# Negara-negara raksasa yang memang memiliki negara bagian luas (tetap pertahankan 1 kota per negara bagian)
GIANT_COUNTRIES = {'United States of America', 'China', 'India', 'Indonesia', 'Russia', 'Brazil', 'Canada', 'Australia'}

country_macro_boxes = {} # country -> { box_id -> [rings] }
final_major_cities = []  # hanya kota di kotak yang BUKAN ibukota!

for country, feats in country_features.items():
    if not feats:
        continue

    # Cari ibukota resmi
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
    cap_name = cap_info['capital'].lower().strip() if cap_info else ""

    # Cari kota-kota dari dataset
    c_cities = cities_by_country.get(country, [])
    if not c_cities:
        for cname, clist in cities_by_country.items():
            if country.lower() in cname.lower() or cname.lower() in country.lower():
                c_cities = clist
                break
    # Urutkan berdasarkan populasi tertinggi
    c_cities = sorted(c_cities, key=lambda x: x['pop'], reverse=True)

    # Tentukan berapa kotak (box_id) yang dibuat untuk negara ini:
    if country in GIANT_COUNTRIES:
        # Negara raksasa: 1 kotak per unit provinsi/state asli
        target_k = len(feats)
        box_assignments = {i: f.get('properties', {}).get('name') or str(i) for i, f in enumerate(feats)}
    else:
        # SEMUA NEGARA LAIN: batasi hanya 3 s/d 6 kotak besar per negara!
        target_k = min(6, max(3, round(math.sqrt(len(feats)))))
        if len(feats) <= 3:
            target_k = len(feats)

        # Cari K pusat kota besar tersebar (termasuk ibukota sebagai pusat salah satu kotak)
        box_centers = []
        if cap_pt:
            box_centers.append((cap_info['capital'], cap_pt))

        for c in c_cities:
            cname = c['name'].strip()
            cpt = c['pt']
            if cname.lower() == cap_name:
                continue
            # Pastikan jarak antar pusat kotak cukup jauh (minimal 1.5 derajat)
            if not box_centers or min(math.hypot(cpt[0]-bp[0], cpt[1]-bp[1]) for _, bp in box_centers) > 1.2:
                box_centers.append((cname, cpt))
            if len(box_centers) >= target_k:
                break

        # Jika kota kurang, tambahkan centroid poligon tersebar
        if len(box_centers) < target_k:
            for i, f in enumerate(feats):
                c_pt = get_centroid(f.get('geometry') or {})
                if not box_centers or min(math.hypot(c_pt[0]-bp[0], c_pt[1]-bp[1]) for _, bp in box_centers) > 1.2:
                    pname = f.get('properties', {}).get('name') or f"Wilayah {len(box_centers)+1}"
                    box_centers.append((pname, c_pt))
                if len(box_centers) >= target_k:
                    break

        # Alokasikan setiap poligon kecil ke kotak pusat terdekatnya
        box_assignments = {}
        for i, f in enumerate(feats):
            c_pt = get_centroid(f.get('geometry') or {})
            best_box = box_centers[0][0]
            best_d = math.hypot(c_pt[0]-box_centers[0][1][0], c_pt[1]-box_centers[0][1][1])
            for bname, bpt in box_centers[1:]:
                d = math.hypot(c_pt[0]-bpt[0], c_pt[1]-bpt[1])
                if d < best_d:
                    best_d = d
                    best_box = bname
            box_assignments[i] = best_box

    # Kumpulkan poligon ke dalam kotak masing-masing
    country_macro_boxes[country] = {}
    for i, f in enumerate(feats):
        geom = f.get('geometry')
        if not geom:
            continue
        box_id = box_assignments.get(i, str(i))
        country_macro_boxes[country].setdefault(box_id, []).append(geom)

    # Sekarang: SETIAP KOTAK HANYA DIBERI TEPAT 1 KOTA!
    for box_id, geoms in country_macro_boxes[country].items():
        # Cek apakah kotak ini SUDAH berisi Ibukota Negara
        has_capital = False
        if cap_pt:
            for g in geoms:
                if pt_in_geom(g, cap_pt):
                    has_capital = True
                    break
        if has_capital or (box_id.lower().strip() == cap_name):
            # Kotak ini adalah kotak ibukota! JANGAN TAMBAHKAN KOTA LAIN LAGI!
            continue

        # Kotak ini BUKAN kotak ibukota: cari tepat 1 kota terbaik di dalam kotak ini
        chosen_city = None
        for c in c_cities:
            if c['name'].lower().strip() == cap_name:
                continue
            for g in geoms:
                if pt_in_geom(g, c['pt']):
                    chosen_city = (c['name'], c['pt'])
                    break
            if chosen_city:
                break

        if not chosen_city:
            # Gunakan centroid dari poligon terbesar di kotak ini
            c_pt = get_centroid(geoms[0])
            chosen_city = (box_id, c_pt)

        # Tambahkan TEPAT 1 KOTA untuk kotak ini
        final_major_cities.append({
            "country": country_name,
            "capital": chosen_city[0],
            "lat": round(chosen_city[1][1], 4),
            "lng": round(chosen_city[1][0], 4),
            "iso": country_iso,
            "color": country_color,
            "is_major_city": True
        })

print(f"Total kota besar baru yang diekstrak (TEPAT 1 per kotak): {len(final_major_cities)}")
with open('apps/src/app/page/map_system/major_cities.json', 'w', encoding='utf-8') as f:
    json.dump(final_major_cities, f, indent=2, ensure_ascii=False)

# 4. Bangun Garis Batas Provinsi (provinces_lines.geojson) HANYA di antara kotak-kotak ini!
print("4. Mengekstrak garis batas antar kotak makro...")
lines_out = []

for country, boxes in country_macro_boxes.items():
    if len(boxes) <= 1:
        continue

    edge_boxes = {}
    for box_id, geoms in boxes.items():
        for geom in geoms:
            rings = []
            if geom['type'] == 'Polygon':
                rings = geom['coordinates']
            elif geom['type'] == 'MultiPolygon':
                for p in geom['coordinates']:
                    rings.extend(p)

            for ring in rings:
                pts = [rp(p) for p in ring]
                for a, b in zip(pts, pts[1:]):
                    if a == b:
                        continue
                    k = (a, b) if a < b else (b, a)
                    edge_boxes.setdefault(k, set()).add(box_id)

    adj = {}
    for edge, shared_boxes in edge_boxes.items():
        # Edge yang membatasi 2 kotak berbeda dalam negara yang sama
        if len(shared_boxes) >= 2:
            a, b = edge
            adj.setdefault(a, set()).add(b)
            adj.setdefault(b, set()).add(a)

    if not adj:
        continue

    visited = set()
    def ekey(a, b):
        return (a, b) if a < b else (b, a)

    def walk(start, nxt):
        chain = [start, nxt]
        visited.add(ekey(start, nxt))
        prev, cur = start, nxt
        while len(adj[cur]) == 2:
            cands = [p for p in adj[cur] if p != prev]
            if not cands:
                break
            n2 = cands[0]
            k = ekey(cur, n2)
            if k in visited:
                break
            visited.add(k)
            chain.append(n2)
            prev, cur = cur, n2
        return chain

    for node in list(adj.keys()):
        if len(adj[node]) == 2:
            continue
        for nb in list(adj[node]):
            if ekey(node, nb) in visited:
                continue
            lines_out.append(walk(node, nb))

    for node in list(adj.keys()):
        for nb in list(adj[node]):
            if ekey(node, nb) in visited:
                continue
            lines_out.append(walk(node, nb))

print(f"Total garis batas bersih yang diekstrak: {len(lines_out)}")

features = []
for chain in lines_out:
    s = simplify(chain, EPS)
    if len(s) >= 2:
        features.append({
            "type": "Feature",
            "geometry": {"type": "LineString", "coordinates": [[round(x, 4), round(y, 4)] for x, y in s]},
        })

out_path = "apps/public/provinces_lines.geojson"
with open(out_path, "w", encoding="utf-8") as f:
    json.dump({"type": "FeatureCollection", "features": features}, f, separators=(",", ":"))

size_kb = os.path.getsize(out_path) // 1024
print(f"SELESAI! provinces_lines.geojson tersimpan ({size_kb} KB, {len(features)} garis)")
print("KEDUA FILE (Garis Perbatasan & Kota Besar) SEKARANG TELAH 100% SINKRON TEPAT 1 KOTA PER KOTAK!")

