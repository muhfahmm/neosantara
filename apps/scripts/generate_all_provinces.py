"""Ekstrak batas internal provinsi (Admin-1) secara topologis.

Langkah:
1. Cocokkan sisi (edge) poligon pada koordinat ASLI (tanpa simplifikasi), sehingga sisi
   bersama antar dua provinsi bertetangga pasti ditemukan.
2. Sisi yang dipakai >= 2 poligon dalam negara yang sama = batas internal provinsi.
3. Rangkai sisi menjadi polyline panjang yang berhenti hanya di persimpangan (derajat != 2)
   atau ujung buntu, sehingga garis tidak terputus di tengah jalan.
4. Simplifikasi tiap rantai (ujung dipertahankan) -> persimpangan tetap menyambung.
"""
import json
import math
import os
import time
import urllib.request

PREC = 5
EPS = 0.002  # derajat (~200 m)

url = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_1_states_provinces.geojson"
t0 = time.time()
req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
with urllib.request.urlopen(req, timeout=120) as resp:
    data = json.loads(resp.read().decode("utf-8"))
print(f"Dataset dimuat {time.time()-t0:.1f}s, feature: {len(data['features'])}")


def rp(pt):
    return (round(pt[0], PREC), round(pt[1], PREC))


def simplify(points, eps):
    """Douglas-Peucker iteratif (tanpa rekursi), ujung selalu dipertahankan."""
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


# Kelompokkan ring per negara
country_rings = {}
for feat in data["features"]:
    props = feat.get("properties") or {}
    country = props.get("admin") or props.get("adm0_a3") or props.get("ADMIN") or "?"
    geom = feat.get("geometry")
    if not geom:
        continue
    rings = country_rings.setdefault(country, [])
    if geom["type"] == "Polygon":
        rings.extend(geom["coordinates"])
    elif geom["type"] == "MultiPolygon":
        for poly in geom["coordinates"]:
            rings.extend(poly)

lines_out = []
for country, rings in country_rings.items():
    edge_count = {}
    for ring in rings:
        pts = [rp(p) for p in ring]
        for a, b in zip(pts, pts[1:]):
            if a == b:
                continue
            k = (a, b) if a < b else (b, a)
            edge_count[k] = edge_count.get(k, 0) + 1

    adj = {}
    for (a, b), c in edge_count.items():
        if c >= 2:
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

    # 1) mulai dari simpul persimpangan / ujung buntu (derajat != 2)
    for node in list(adj.keys()):
        if len(adj[node]) == 2:
            continue
        for nb in list(adj[node]):
            if ekey(node, nb) in visited:
                continue
            lines_out.append(walk(node, nb))
    # 2) sisa: loop tertutup murni
    for node in list(adj.keys()):
        for nb in list(adj[node]):
            if ekey(node, nb) in visited:
                continue
            lines_out.append(walk(node, nb))

print(f"Rantai garis sebelum simplifikasi: {len(lines_out)}")

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
print(f"Selesai: {len(features)} garis, {os.path.getsize(out_path)//1024} KB")
