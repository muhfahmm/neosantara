"""
Sistem Pembagian Wilayah Berbasis Kota-Kota Besar (Major City-Centered Regions):
1. Mengunduh dataset kota besar dunia (Populated Places).
2. Memilih 3 sampai 6 kota besar terpenting / berpopulasi tertinggi untuk setiap negara di Eropa & dunia.
3. Mengelompokkan seluruh subdivisi (poligon) negara tersebut ke kota besar terdekatnya (Nearest Major City Voronoi/Centroid Allocation).
4. Hasilnya: Setiap negara hanya memiliki beberapa wilayah luas yang berpusat di kota-kota besarnya saja!
   Garis-garis batas kecil yang ruwet dan padat di Eropa (Jerman, Prancis, Polandia, Spanyol, Italia, Inggris, dsb)
   hilang total dan menjadi bersih, hanya membatasi kota-kota besar utama!
"""
import urllib.request
import json
import math
import os
import time

PREC = 5
EPS = 0.002

t0 = time.time()
print("1. Mengunduh data kota besar dunia (Populated Places)...")
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
    cities_by_country.setdefault(c, []).append((pop, name, pt))

print(f"   Data kota berhasil dimuat ({len(cities_data['features'])} kota).")

print("2. Mengunduh data batas wilayah (States/Provinces)...")
url_prov = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_1_states_provinces.geojson"
req2 = urllib.request.Request(url_prov, headers={"User-Agent": "Mozilla/5.0"})
with urllib.request.urlopen(req2, timeout=120) as resp:
    prov_data = json.loads(resp.read().decode("utf-8"))
print(f"   Data batas wilayah dimuat ({len(prov_data['features'])} unit).")

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

country_features = {}
for f in prov_data['features']:
    props = f.get('properties') or {}
    country = props.get('admin') or props.get('adm0_a3') or props.get('ADMIN') or '?'
    country_features.setdefault(country, []).append(f)

# Negara-negara Eropa dan negara lain yang padat garisnya
EUROPE_AND_DENSE = {
    'Germany', 'France', 'Poland', 'Spain', 'Italy', 'United Kingdom', 'Romania', 'Ukraine',
    'Czechia', 'Austria', 'Hungary', 'Slovakia', 'Belarus', 'Greece', 'Portugal', 'Sweden',
    'Norway', 'Finland', 'Ireland', 'Lithuania', 'Latvia', 'Estonia', 'Belgium', 'Netherlands',
    'Denmark', 'Switzerland', 'Croatia', 'Slovenia', 'Bosnia and Herzegovina', 'Republic of Serbia',
    'Bulgaria', 'Moldova', 'Montenegro', 'Kosovo', 'Macedonia', 'North Macedonia', 'Albania',
    'Turkey', 'Algeria', 'Uganda', 'Philippines', 'Vietnam', 'Thailand', 'Burkina Faso', 'Guinea'
}

country_units = {}

for country, feats in country_features.items():
    if not feats:
        continue

    # Tentukan berapa kota besar maksimal untuk negara ini:
    # Negara besar (Rusia, Tiongkok, AS, Brasil, India, Indonesia) tetap pertahankan provinsi/negara bagian resminya
    # Negara-negara Eropa & negara padat lainnya dipetakan ke 3 - 6 kota besar saja!
    is_dense_target = country in EUROPE_AND_DENSE or len(feats) > 15
    is_giant = country in {'United States of America', 'China', 'India', 'Indonesia', 'Russia', 'Brazil', 'Canada', 'Australia'}

    if is_dense_target and not is_giant:
        # Ambil daftar kota besar resmi negara ini
        raw_cities = cities_by_country.get(country, [])
        if not raw_cities:
            # Fallback jika nama negara sedikit berbeda
            for c_name, c_list in cities_by_country.items():
                if country.lower() in c_name.lower() or c_name.lower() in country.lower():
                    raw_cities = c_list
                    break

        # Urutkan berdasarkan populasi kota, ambil 4 sampai 6 kota terpenting
        sorted_cities = sorted(raw_cities, key=lambda x: x[0], reverse=True)
        max_cities = 6 if len(feats) > 25 else 4
        # Pastikan jarak antar kota yang dipilih tidak terlalu menumpuk
        chosen_cities = []
        for pop, cname, pt in sorted_cities:
            if not chosen_cities:
                chosen_cities.append((cname, pt))
            else:
                # Cek jarak ke kota yang sudah terpilih
                min_d = min(math.hypot(pt[0]-cp[0], pt[1]-cp[1]) for _, cp in chosen_cities)
                if min_d > 0.8: # jarak spasial minimal agar kota terdistribusi ke berbagai penjuru negara
                    chosen_cities.append((cname, pt))
            if len(chosen_cities) >= max_cities:
                break

        if len(chosen_cities) < 2:
            # Jika kota di dataset kurang, ambil 4-5 centroid tersebar
            centroids = [get_centroid(f.get('geometry') or {}) for f in feats]
            chosen_cities = [(f"Region_{i+1}", centroids[min(i*len(centroids)//4, len(centroids)-1)]) for i in range(4)]

        # Petakan setiap poligon/subdivisi ke kota besar terdekatnya!
        country_units[country] = {}
        for f in feats:
            geom = f.get('geometry')
            if not geom:
                continue
            c_pt = get_centroid(geom)
            # Cari kota terdekat
            best_city = chosen_cities[0][0]
            best_dist = math.hypot(c_pt[0]-chosen_cities[0][1][0], c_pt[1]-chosen_cities[0][1][1])
            for cname, cpt in chosen_cities[1:]:
                d = math.hypot(c_pt[0]-cpt[0], c_pt[1]-cpt[1])
                if d < best_dist:
                    best_dist = d
                    best_city = cname

            country_units[country].setdefault(best_city, [])
            if geom['type'] == 'Polygon':
                country_units[country][best_city].extend(geom['coordinates'])
            elif geom['type'] == 'MultiPolygon':
                for poly in geom['coordinates']:
                    country_units[country][best_city].extend(poly)
    else:
        # Negara besar atau negara yang sudah proporsional tetap memakai data provinsi utamanya
        country_units[country] = {}
        for i, f in enumerate(feats):
            props = f.get('properties') or {}
            geom = f.get('geometry')
            if not geom:
                continue
            uid = props.get('name') or props.get('gns_name') or str(i)
            country_units[country].setdefault(uid, [])
            if geom['type'] == 'Polygon':
                country_units[country][uid].extend(geom['coordinates'])
            elif geom['type'] == 'MultiPolygon':
                for poly in geom['coordinates']:
                    country_units[country][uid].extend(poly)

print(f"3. Mengekstrak garis batas antar-wilayah kota besar...")
lines_out = []

for country, units in country_units.items():
    if len(units) <= 1:
        continue

    edge_units = {}
    for unit_id, rings in units.items():
        for ring in rings:
            pts = [rp(p) for p in ring]
            for a, b in zip(pts, pts[1:]):
                if a == b:
                    continue
                k = (a, b) if a < b else (b, a)
                edge_units.setdefault(k, set()).add(unit_id)

    adj = {}
    for edge, shared_units in edge_units.items():
        # Edge yang membatasi 2 wilayah kota besar yang berbeda!
        if len(shared_units) >= 2:
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

print(f"   Total garis batas bersih yang diekstrak: {len(lines_out)}")

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
print(f"SELESAI! File disimpan ke {out_path} ({size_kb} KB, {len(features)} garis)")

