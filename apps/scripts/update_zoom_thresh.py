with open('apps/src/app/page/map_system/map-data-rs/src/map.rs', 'r', encoding='utf-8') as f:
    code = f.read()

# Ubah threshold zoom dari 1.5 ke 1.15 agar batas provinsi sudah langsung terlihat di level negara
old_zoom = "if self.scale >= 1.5 {"
new_zoom = "if self.scale >= 1.15 {"
assert old_zoom in code, "old_zoom not found"
code = code.replace(old_zoom, new_zoom, 1)

with open('apps/src/app/page/map_system/map-data-rs/src/map.rs', 'w', encoding='utf-8') as f:
    f.write(code)

print("Zoom threshold provinsi disesuaikan ke >= 1.15")

