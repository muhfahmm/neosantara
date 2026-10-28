"""
Sistem Agregasi Geometris Otomatis (Auto-Regionalizer):
Menyaring dan mengelompokkan subdivisi wilayah negara-negara kecil di seluruh dunia:
- Menjaga negara kecil agar hanya memiliki 4 sampai 7 wilayah provinsi/region utama.
- Menghapus ribuan garis perbatasan mikro (kotamadya, distrik kota, desa, dsb).
- Menghasilkan batas antar provinsi yang bersih, mulus, dan proporsional di seluruh dunia.
"""
import urllib.request
import json
import math
import os
import time

PREC = 5
EPS = 0.002

url = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_1_states_provinces.geojson"
print("Mengunduh dataset admin-1...")
t0 = time.time()
req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
with urllib.request.urlopen(req, timeout=120) as resp:
    data = json.loads(resp.read().decode("utf-8"))
print(f"Data selesai diunduh dalam {time.time()-t0:.1f}s, feature: {len(data['features'])}")

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

def get_bbox(geom):
    coords = geom.get('coordinates', [])
    t = geom.get('type')
    pts = []
    if t == 'Polygon':
        for r in coords: pts.extend(r)
    elif t == 'MultiPolygon':
        for poly in coords:
            for r in poly: pts.extend(r)
    if not pts:
        return (0.0, 0.0, 0.0, 0.0)
    xs = [p[0] for p in pts]
    ys = [p[1] for p in pts]
    return (min(xs), min(ys), max(xs), max(ys))

# Kelompokkan features per negara
country_features = {}
for f in data['features']:
    props = f.get('properties') or {}
    country = props.get('admin') or props.get('adm0_a3') or props.get('ADMIN') or '?'
    country_features.setdefault(country, []).append(f)

# K-Means clustering spatial untuk mengelompokkan unit kotamadya berdekatan menjadi K wilayah makro
def cluster_units_kmeans(units_info, k):
    # units_info: list of (idx, (cx, cy))
    if len(units_info) <= k:
        return {idx: f"cluster_{i}" for i, (idx, _) in enumerate(units_info)}
    
    # Inisialisasi centroid terdistribusi (K-means++)
    centroids = [units_info[0][1]]
    for _ in range(1, k):
        best_pt = None
        max_dist = -1
        for _, pt in units_info:
            d = min(math.hypot(pt[0]-c[0], pt[1]-c[1]) for c in centroids)
            if d > max_dist:
                max_dist = d
                best_pt = pt
        centroids.append(best_pt or units_info[len(centroids)][1])

    assignments = {}
    for _ in range(15): # 15 iterasi
        clusters = [[] for _ in range(k)]
        for idx, pt in units_info:
            best_c = 0
            best_d = math.hypot(pt[0]-centroids[0][0], pt[1]-centroids[0][1])
            for ci in range(1, k):
                d = math.hypot(pt[0]-centroids[ci][0], pt[1]-centroids[ci][1])
                if d < best_d:
                    best_d = d
                    best_c = ci
            assignments[idx] = f"macro_reg_{best_c}"
            clusters[best_c].append(pt)
        # Update centroid
        for ci in range(k):
            if clusters[ci]:
                mx = sum(p[0] for p in clusters[ci]) / len(clusters[ci])
                my = sum(p[1] for p in clusters[ci]) / len(clusters[ci])
                centroids[ci] = (mx, my)

    return assignments

# Proses setiap negara
country_units = {} # country -> { unit_id -> [rings] }

for country, feats in country_features.items():
    if not feats:
        continue

    # Hitung bounding box total negara
    all_bboxes = [get_bbox(f.get('geometry') or {}) for f in feats]
    min_x = min(b[0] for b in all_bboxes)
    min_y = min(b[1] for b in all_bboxes)
    max_x = max(b[2] for b in all_bboxes)
    max_y = max(b[3] for b in all_bboxes)
    span_area = (max_x - min_x) * (max_y - min_y) # perkiraan luas derajat kuadrat
    unit_count = len(feats)

    # Cek apakah negara ini memiliki data 'region' resmi yang valid
    macro_regions = set()
    for f in feats:
        r = f.get('properties', {}).get('region') or f.get('properties', {}).get('region_cod')
        if r:
            macro_regions.add(r)

    # Strategi penentuan cluster:
    # 1. Jika negara memiliki 'region' resmi dengan jumlah proporsional (antara 3 s/d 25 region), gunakan itu!
    # 2. Jika negara kecil (span_area < 50) dan unit_count > 7 (seperti Montenegro 21, Kosovo 30, Moldova 40, Swiss 26, dsb),
    #    cluster unit-unitnya menjadi K = 5 s/d 7 provinsi utama!
    # 3. Jika negara sedang tapi unit_count sangat besar (> 35), cluster menjadi K = 6 s/d 12 region utama!

    use_official_region = 3 <= len(macro_regions) <= 25 and (len(macro_regions) < unit_count * 0.6)
    
    use_spatial_cluster = False
    target_k = 5

    if not use_official_region:
        if span_area < 40 and unit_count > 7:
            # Negara kecil (Montenegro, Kosovo, Swiss, Moldova, Burundi, dsb) -> 5 sampai 7 batas
            use_spatial_cluster = True
            target_k = min(7, max(4, round(math.sqrt(unit_count))))
        elif unit_count > 35:
            # Negara dengan kotamadya padat (Uganda, Latvia, dsb tanpa region yang pas)
            use_spatial_cluster = True
            target_k = min(12, max(6, round(math.sqrt(unit_count * 1.5))))

    cluster_map = {}
    if use_spatial_cluster:
        units_info = []
        for i, f in enumerate(feats):
            c_pt = get_centroid(f.get('geometry') or {})
            units_info.append((i, c_pt))
        cluster_map = cluster_units_kmeans(units_info, target_k)

    country_units[country] = {}
    for i, f in enumerate(feats):
        props = f.get('properties') or {}
        geom = f.get('geometry')
        if not geom:
            continue

        if use_official_region:
            uid = props.get('region') or props.get('region_cod') or props.get('name') or str(i)
        elif use_spatial_cluster:
            uid = cluster_map.get(i, str(i))
        else:
            uid = props.get('name') or props.get('gns_name') or str(i)

        country_units[country].setdefault(uid, [])
        if geom['type'] == 'Polygon':
            country_units[country][uid].extend(geom['coordinates'])
        elif geom['type'] == 'MultiPolygon':
            for poly in geom['coordinates']:
                country_units[country][uid].extend(poly)

print(f"Total negara yang diproses: {len(country_units)}")
for c in ['Montenegro', 'Kosovo', 'Slovenia', 'Uganda', 'Moldova', 'Switzerland', 'Bulgaria', 'Croatia']:
    if c in country_units:
        print(f"  {c}: dirasionalisasi menjadi {len(country_units[c])} wilayah provinsi utama!")

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
        # Edge yang membatasi 2 provinsi berbeda dalam negara yang sama
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

print(f"Total garis batas antar-provinsi bersih: {len(lines_out)}")

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

