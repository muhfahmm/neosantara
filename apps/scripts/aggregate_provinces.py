import urllib.request
import json
import math
import os
import time

PREC = 5
EPS = 0.002

url = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_1_states_provinces.geojson"
print("Mengunduh dataset admin 1...")
req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
with urllib.request.urlopen(req, timeout=120) as resp:
    data = json.loads(resp.read().decode("utf-8"))

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

# Mapping wilayah statistik resmi Makedonia Utara (8 wilayah resmi):
MKD_REGION_MAP = {
    'Strumitsa': 'Southeastern', 'Gevgelija': 'Southeastern', 'Bogdanci': 'Southeastern', 'Valandovo': 'Southeastern',
    'Doiran': 'Southeastern', 'Novo Selo': 'Southeastern', 'Radovis': 'Southeastern', 'Bosilovo': 'Southeastern', 'Vasilevo': 'Southeastern', 'Konche': 'Southeastern',
    'Jegunovce': 'Polog', 'Tearce': 'Polog', 'Tetovo': 'Polog', 'Brvenica': 'Polog', 'Zelino': 'Polog', 'Vrapciste': 'Polog', 'Bogovinje': 'Polog',
    'Skopje': 'Skopje', 'Aerodrom': 'Skopje', 'Butel': 'Skopje', 'Gazi Baba': 'Skopje', 'Gjorce Petrov': 'Skopje', 'Karpos': 'Skopje',
    'Kisela Voda': 'Skopje', 'Saraj': 'Skopje', 'Centar': 'Skopje', 'Cucer-Sandevo': 'Skopje', 'Ilinden': 'Skopje', 'Petrovec': 'Skopje',
    'Sopiste': 'Skopje', 'Studenicani': 'Skopje', 'Zelenikovo': 'Skopje'
}

AGGREGATE_COUNTRIES = {
    'Slovenia', 'Uganda', 'Macedonia', 'North Macedonia', 'Latvia', 'Malta',
    'United Kingdom', 'Italy', 'France', 'Philippines', 'Azerbaijan', 'Burkina Faso',
    'Hungary', 'Vietnam'
}

country_units = {}

for feat in data["features"]:
    props = feat.get("properties") or {}
    country = props.get("admin") or props.get("adm0_a3") or props.get("ADMIN") or "?"
    geom = feat.get("geometry")
    if not geom:
        continue
        
    unit_id = props.get("name") or props.get("gns_name") or str(id(feat))
    if country in AGGREGATE_COUNTRIES:
        macro_region = props.get("region") or props.get("region_cod")
        if country in ('Macedonia', 'North Macedonia'):
            unit_name = props.get("name") or ""
            macro_region = MKD_REGION_MAP.get(unit_name, macro_region or 'Central')
        if macro_region:
            unit_id = macro_region

    country_units.setdefault(country, {}).setdefault(unit_id, [])
    if geom["type"] == "Polygon":
        country_units[country][unit_id].extend(geom["coordinates"])
    elif geom["type"] == "MultiPolygon":
        for poly in geom["coordinates"]:
            country_units[country][unit_id].extend(poly)

print(f"Total negara: {len(country_units)}")
for c in ['Slovenia', 'Uganda', 'Macedonia', 'Latvia', 'Malta']:
    if c in country_units:
        print(f"  {c}: kini menjadi {len(country_units[c])} wilayah provinsi/region!")

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

print(f"Total garis batas antar-provinsi makro yang diekstrak: {len(lines_out)}")

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
print(f"SUKSES! File bersih dan teragregasi disimpan ke {out_path} ({size_kb} KB, {len(features)} garis)")

