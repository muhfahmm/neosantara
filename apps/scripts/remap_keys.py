import json

with open("apps/public/city_province_cells.json", "r", encoding="utf-8") as f:
    cells = json.load(f)

remapped = {}
for k, v in cells.items():
    parts = k.split("_", 1)
    if len(parts) == 2:
        iso, city = parts
        key = f"{iso}:{city}"
        remapped[key] = v
    else:
        remapped[k] = v

with open("apps/public/city_province_cells.json", "w", encoding="utf-8") as f:
    json.dump(remapped, f, separators=(",", ":"))

print("Sample keys:", list(remapped.keys())[:5])
print("Erdenet key:", [k for k in remapped.keys() if "erdenet" in k])

