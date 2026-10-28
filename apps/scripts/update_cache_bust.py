with open('apps/src/app/page/map_system/map-system.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

target = "fetch('/provinces_lines.geojson', { cache: 'force-cache' })"
replacement = "fetch(`/provinces_lines.geojson?v=${Date.now()}`)"

assert target in text, "Target fetch not found"
text = text.replace(target, replacement, 1)

with open('apps/src/app/page/map_system/map-system.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("Updated fetch in map-system.tsx to bypass browser cache")

