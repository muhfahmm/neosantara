P = 'apps/src/app/page/map_system/map-system.tsx'
code = open(P, 'r', encoding='utf-8').read()

# 1. Import major_cities.json
old_import = "import { COUNTRIES_DATA, CAPITALS_DATA } from './map-data';"
new_import = "import { COUNTRIES_DATA, CAPITALS_DATA } from './map-data';\nimport MAJOR_CITIES_DATA from './major_cities.json';"
assert old_import in code, "old_import not found"
code = code.replace(old_import, new_import, 1)

# 2. Gabungkan CAPITALS_DATA dan MAJOR_CITIES_DATA pada inisialisasi dan getCapitalFlagsForCurrentTerritories
# Buat ALL_CITIES_LIST
old_func = """function getCapitalFlagsForCurrentTerritories() {
    const annexedCountries = typeof window === 'undefined'
        ? {}
        : ((window as Window & { neosantara_annexed_countries?: AnnexedTerritories })
            .neosantara_annexed_countries || {});
    const normalizeKey = (value: unknown) =>
        String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '');

    return CAPITALS_DATA.map(capital => {"""

new_func = """function getCapitalFlagsForCurrentTerritories() {
    const annexedCountries = typeof window === 'undefined'
        ? {}
        : ((window as Window & { neosantara_annexed_countries?: AnnexedTerritories })
            .neosantara_annexed_countries || {});
    const normalizeKey = (value: unknown) =>
        String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '');

    const combinedCities = [...CAPITALS_DATA, ...(MAJOR_CITIES_DATA as typeof CAPITALS_DATA)];
    return combinedCities.map(capital => {"""

assert old_func in code, "old_func not found"
code = code.replace(old_func, new_func, 1)

# 3. Pada start_map_engine pass combinedCities juga
old_start = """                await start_map_engine(
                    "map-canvas",
                    rawGeojsonStr,
                    COUNTRIES_DATA,
                    CAPITALS_DATA
                );"""

new_start = """                const allMapCities = [...CAPITALS_DATA, ...(MAJOR_CITIES_DATA as typeof CAPITALS_DATA)];
                await start_map_engine(
                    "map-canvas",
                    rawGeojsonStr,
                    COUNTRIES_DATA,
                    allMapCities
                );"""

assert old_start in code, "old_start not found"
code = code.replace(old_start, new_start, 1)

open(P, 'w', encoding='utf-8').write(code)
print("Berhasil mengintegrasikan kota-kota besar kotak perbatasan ke map-system.tsx!")

