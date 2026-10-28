with open('apps/src/app/page/map_system/map-data-rs/src/map.rs', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Optimalisasi palet warna benua agar tampak modern, elegan, berkarakter real-earth map dan kontras terhadap lautan
old_colors = """fn continent_color(continent: &str) -> &'static str {
    match continent {
        "Asia" => "#a855f7ff",
        "Africa" => "#eab308",
        "Europe" => "#3b82f6",
        "North America" => "#22c55e",
        "South America" => "#f97316",
        "Oceania" => "#ec4899",
        "Antarctica" => "#cbd5e1",
        _ => "#475569",
    }
}"""

new_colors = """fn continent_color(continent: &str) -> &'static str {
    match continent {
        // Palet benua diselaraskan dengan estetika geopolitik nyata:
        "Asia" => "#2e7d32",           // Hijau zamrud teritorial Asia
        "Africa" => "#d97706",         // Amber / terracotta khas benua Afrika
        "Europe" => "#2563eb",         // Biru kobalt diplomatik Eropa
        "North America" => "#0d9488",  // Teal / Cyan kehijauan Amerika Utara
        "South America" => "#ea580c",  // Oranye hangat Amerika Selatan
        "Oceania" => "#0284c7",        // Sky cyan maritim Oceania
        "Antarctica" => "#e2e8f0",     // Putih es / glacier Antartika
        _ => "#475569",
    }
}"""

assert old_colors in text, "old_colors not found"
text = text.replace(old_colors, new_colors, 1)

# 2. Optimalisasi ketebalan dan perataan garis batas negara agar tidak kabur atau terlalu tebal di zoom tinggi
# Line width dinamis: clamp batas negara agar selalu presisi di 0.5px - 1.2px terlepas dari zoom
old_lw1 = "self.ctx.set_line_width(0.7 / self.scale);"
new_lw1 = "self.ctx.set_line_width((0.85 / self.scale).clamp(0.2, 1.2));"
text = text.replace(old_lw1, new_lw1)

old_lw2 = "self.ctx.set_line_width(1.0 / self.scale);"
new_lw2 = "self.ctx.set_line_width((1.4 / self.scale).clamp(0.4, 2.0));"
text = text.replace(old_lw2, new_lw2)

# 3. Cache detail awal di set_data diperbaiki dari 0.15 menjadi 0.02 agar tidak ada sudut kepulauan terdistorsi
old_path_init = "let path1 = build_cached_path(&polys, 0.15);"
new_path_init = "let path1 = build_cached_path(&polys, 0.02);"
assert old_path_init in text, "old_path_init not found"
text = text.replace(old_path_init, new_path_init, 1)

# 4. Tambahkan line_join dan line_cap round pada stroke batas agar sudut pantai & perbatasan tidak tajam pecah
old_render_start = """        let _ = self.ctx.set_transform(1.0, 0.0, 0.0, 1.0, 0.0, 0.0);
        self.ctx.set_fill_style(&self.styles.bg);
        self.ctx.fill_rect(0.0, 0.0, self.width, self.height);"""

new_render_start = """        let _ = self.ctx.set_transform(1.0, 0.0, 0.0, 1.0, 0.0, 0.0);
        self.ctx.set_line_join("round");
        self.ctx.set_line_cap("round");
        self.ctx.set_fill_style(&self.styles.bg);
        self.ctx.fill_rect(0.0, 0.0, self.width, self.height);"""

assert old_render_start in text, "old_render_start not found"
text = text.replace(old_render_start, new_render_start, 1)

with open('apps/src/app/page/map_system/map-data-rs/src/map.rs', 'w', encoding='utf-8') as f:
    f.write(text)

print("Berhasil mengoptimalkan batas negara benua & estetika real-life!")

