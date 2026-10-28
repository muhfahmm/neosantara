with open('apps/src/app/page/map_system/map-system.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

target = """                await start_map_engine(
                    "map-canvas",
                    rawGeojsonStr,
                    COUNTRIES_DATA,
                    CAPITALS_DATA
                );
                set_map_horizontal_wrap(true);
                wasmModule.set_capitals_on_map(getCapitalFlagsForCurrentTerritories());
                syncFeatureColors();"""

replacement = """                await start_map_engine(
                    "map-canvas",
                    rawGeojsonStr,
                    COUNTRIES_DATA,
                    CAPITALS_DATA
                );
                set_map_horizontal_wrap(true);
                wasmModule.set_capitals_on_map(getCapitalFlagsForCurrentTerritories());

                // Muat batas provinsi putus-putus ke dalam map engine secara asynchronous
                fetch('/provinces_lines.geojson', { cache: 'force-cache' })
                    .then(res => res.ok ? res.text() : null)
                    .then(provText => {
                        if (provText && wasmModule.set_provinces_on_map) {
                            wasmModule.set_provinces_on_map(provText);
                        }
                    })
                    .catch(err => console.warn('Pemuatan garis provinsi notice:', err));

                syncFeatureColors();"""

assert target in text, "Target not found in map-system.tsx"
text = text.replace(target, replacement, 1)

with open('apps/src/app/page/map_system/map-system.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("Successfully linked provinces_lines to map-system.tsx")

