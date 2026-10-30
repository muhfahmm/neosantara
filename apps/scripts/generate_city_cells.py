import json, math, re, os
from collections import defaultdict

print("1. Loading datasets...")
with open("ne_10m_admin_1.json", "r", encoding="utf-8") as f:
    admin1 = json.load(f)["features"]

with open("apps/src/app/page/map_system/major_cities.json", "r", encoding="utf-8") as f:
    major_cities = json.load(f)

with open("apps/src/app/page/map_system/map-data.ts", "r", encoding="utf-8") as f:
    ts_text = f.read()

capitals_match = re.search(r"export const CAPITALS_DATA = (\[.*?\]);", ts_text, re.DOTALL)
capitals = json.loads(capitals_match.group(1)) if capitals_match else []

all_cities = {}
for c in capitals:
    iso = (c.get("iso") or "").lower()
    city_name = c.get("capital") or ""
    city_id = f"{iso}_{city_name}".lower().replace(" ", "_").replace("-", "_").replace(".", "").replace("'", "")
    all_cities[city_id] = {
        "city_id": city_id,
        "city_name": city_name,
        "iso": iso,
        "country": c.get("country") or "",
        "lat": float(c.get("latitude") or c.get("lat") or 0),
        "lng": float(c.get("longitude") or c.get("lng") or 0)
    }

for c in major_cities:
    iso = (c.get("iso") or "").lower()
    city_name = c.get("capital") or ""
    city_id = f"{iso}_{city_name}".lower().replace(" ", "_").replace("-", "_").replace(".", "").replace("'", "")
    if city_id not in all_cities:
        all_cities[city_id] = {
            "city_id": city_id,
            "city_name": city_name,
            "iso": iso,
            "country": c.get("country") or "",
            "lat": float(c.get("latitude") or c.get("lat") or 0),
            "lng": float(c.get("longitude") or c.get("lng") or 0)
        }

print(f"Total cities: {len(all_cities)}")

PREC = 4
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

def dissolve_rings(rings):
    edge_count = {}
    for ring in rings:
        pts = [rp(p) for p in ring]
        for a, b in zip(pts, pts[1:]):
            if a == b: continue
            edge_count[(a, b)] = edge_count.get((a, b), 0) + 1
    
    boundary_edges = []
    for (a, b), cnt in edge_count.items():
        opp = edge_count.get((b, a), 0)
        if cnt > opp:
            for _ in range(cnt - opp):
                boundary_edges.append((a, b))
    
    adj = defaultdict(list)
    for a, b in boundary_edges:
        adj[a].append(b)
    
    result_rings = []
    for start in list(adj.keys()):
        while adj[start]:
            nxt = adj[start].pop()
            cur_ring = [start, nxt]
            cur = nxt
            while cur in adj and adj[cur]:
                step = adj[cur].pop()
                cur_ring.append(step)
                cur = step
                if cur == start:
                    break
            if cur_ring[0] == cur_ring[-1] and len(cur_ring) >= 4:
                result_rings.append(cur_ring)
    return result_rings

# Group admin1 by iso
admin_by_iso = {}
for f in admin1:
    p = f.get("properties") or {}
    iso = (p.get("iso_a2") or "").lower()
    if not iso or iso == "-99":
        iso = (p.get("adm0_a3") or "").lower()
    admin_by_iso.setdefault(iso, []).append(f)

# Group cities by iso
cities_by_iso = {}
for c in all_cities.values():
    cities_by_iso.setdefault(c["iso"], []).append(c)

city_cells_result = {}

for iso, country_cities in cities_by_iso.items():
    feats = admin_by_iso.get(iso, [])
    if not feats:
        continue
    
    city_rings = defaultdict(list)
    for f in feats:
        geom = f.get("geometry")
        if not geom:
            continue
        coords = geom.get("coordinates", [])
        pts = []
        if geom["type"] == "Polygon":
            for r in coords: pts.extend(r)
        elif geom["type"] == "MultiPolygon":
            for poly in coords:
                for r in poly: pts.extend(r)
        if not pts:
            continue
        cx = sum(p[0] for p in pts) / len(pts)
        cy = sum(p[1] for p in pts) / len(pts)

        closest = min(country_cities, key=lambda c: (c["lng"] - cx)**2 + (c["lat"] - cy)**2)
        target_id = closest["city_id"]

        if geom["type"] == "Polygon":
            for r in coords: city_rings[target_id].append(r)
        elif geom["type"] == "MultiPolygon":
            for poly in coords:
                for r in poly: city_rings[target_id].append(r)

    for cid, rings in city_rings.items():
        if not rings:
            continue
        dissolved = dissolve_rings(rings)
        if not dissolved:
            # Fallback to largest input ring
            largest_ring = max(rings, key=lambda r: len(r))
            dissolved = [largest_ring]
        
        # Pick the largest ring as the primary polygon boundary
        main_ring = max(dissolved, key=lambda r: len(r))
        simp = simplify(main_ring, 0.005)
        if len(simp) >= 3:
            city_cells_result[cid] = [[round(p[0], 4), round(p[1], 4)] for p in simp]

print(f"Generated province polygon cells for {len(city_cells_result)} cities.")
out_path = "apps/public/city_province_cells.json"
with open(out_path, "w", encoding="utf-8") as f:
    json.dump(city_cells_result, f, separators=(",", ":"))

size_kb = os.path.getsize(out_path) // 1024
print(f"Saved {out_path} ({size_kb} KB)")

