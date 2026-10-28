with open('apps/src/app/page/map_system/map-system.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Update getCapitalFlagsForCurrentTerritories to support player capital override
old_get_capitals = """function getCapitalFlagsForCurrentTerritories(settingsOverride?: MapDisplaySettings) {
    const annexedCountries = typeof window === 'undefined'
        ? {}
        : ((window as Window & { neosantara_annexed_countries?: AnnexedTerritories })
            .neosantara_annexed_countries || {});
    const normalizeKey = (value: unknown) =>
        String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '');

    const settings = settingsOverride || getMapDisplaySettings();
    let citiesPool: typeof CAPITALS_DATA = [];
    if (settings.showCapitals) {
        citiesPool = citiesPool.concat(CAPITALS_DATA);
    }
    if (settings.showMajorCities) {
        citiesPool = citiesPool.concat(MAJOR_CITIES_DATA as typeof CAPITALS_DATA);
    }

    return citiesPool.map(capital => {
        const capitalKeys = new Set([
            normalizeKey(capital.country),
            normalizeKey(capital.iso),
            normalizeKey(`iso_${capital.iso}`)
        ]);
        const annexation = Object.entries(annexedCountries).find(([key]) =>
            capitalKeys.has(normalizeKey(key))
        )?.[1];
        if (!annexation?.attackerCountry) return capital;

        const attackerIso = COUNTRIES_DATA.find(country =>
            normalizeKey(country.country) === normalizeKey(annexation.attackerCountry)
        )?.iso || (
                annexation.attackerIso?.trim().length === 2
                    ? annexation.attackerIso
                    : undefined
            );

        return attackerIso ? { ...capital, iso: attackerIso.toLowerCase() } : capital;
    });
}"""

new_get_capitals = """function getCapitalFlagsForCurrentTerritories(settingsOverride?: MapDisplaySettings) {
    const annexedCountries = typeof window === 'undefined'
        ? {}
        : ((window as Window & { neosantara_annexed_countries?: AnnexedTerritories })
            .neosantara_annexed_countries || {});
    const customCapitalName = typeof window !== 'undefined'
        ? (window as Window & { neosantara_player_capital?: string }).neosantara_player_capital
        : undefined;
    const normalizeKey = (value: unknown) =>
        String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '');

    const settings = settingsOverride || getMapDisplaySettings();
    let citiesPool: typeof CAPITALS_DATA = [];
    if (settings.showCapitals) {
        citiesPool = citiesPool.concat(CAPITALS_DATA);
    }
    if (settings.showMajorCities) {
        citiesPool = citiesPool.concat(MAJOR_CITIES_DATA as typeof CAPITALS_DATA);
    }

    return citiesPool.map(item => {
        let capital = { ...item };
        if (customCapitalName) {
            const isTargetCapital = normalizeKey(capital.capital) === normalizeKey(customCapitalName);
            if (isTargetCapital) {
                capital = { ...capital, is_capital: true, is_major_city: false } as typeof item;
            } else if (normalizeKey(capital.country) === normalizeKey('indonesia') || normalizeKey(capital.country) === normalizeKey(customCapitalName)) {
                // Jika kota lain di negara yang sama sebelumnya adalah ibukota default (misal Jakarta)
                if (capital.capital.toLowerCase() === 'jakarta' || !('is_major_city' in capital)) {
                    capital = { ...capital, is_capital: false, is_major_city: true } as typeof item;
                }
            }
        }

        const capitalKeys = new Set([
            normalizeKey(capital.country),
            normalizeKey(capital.iso),
            normalizeKey(`iso_${capital.iso}`)
        ]);
        const annexation = Object.entries(annexedCountries).find(([key]) =>
            capitalKeys.has(normalizeKey(key))
        )?.[1];
        if (!annexation?.attackerCountry) return capital;

        const attackerIso = COUNTRIES_DATA.find(country =>
            normalizeKey(country.country) === normalizeKey(annexation.attackerCountry)
        )?.iso || (
                annexation.attackerIso?.trim().length === 2
                    ? annexation.attackerIso
                    : undefined
            );

        return attackerIso ? { ...capital, iso: attackerIso.toLowerCase() } : capital;
    });
}"""

text = text.replace(old_get_capitals, new_get_capitals)

# 2. Add event listener for neosantara_capital_changed
old_listener = """            wasmModuleRef.current?.set_capitals_on_map(getCapitalFlagsForCurrentTerritories());
        };
        window.addEventListener('map_territory_color_updated', syncTerritoryColorOverrides);
        return () => window.removeEventListener('map_territory_color_updated', syncTerritoryColorOverrides);"""

new_listener = """            wasmModuleRef.current?.set_capitals_on_map(getCapitalFlagsForCurrentTerritories());
        };
        const handleCapitalChanged = (e: Event) => {
            const newCap = (e as CustomEvent<{ newCapital?: string }>)?.detail?.newCapital;
            if (newCap && typeof window !== 'undefined') {
                (window as Window & { neosantara_player_capital?: string }).neosantara_player_capital = newCap;
            }
            wasmModuleRef.current?.set_capitals_on_map(getCapitalFlagsForCurrentTerritories());
        };
        window.addEventListener('map_territory_color_updated', syncTerritoryColorOverrides);
        window.addEventListener('neosantara_capital_changed', handleCapitalChanged);
        return () => {
            window.removeEventListener('map_territory_color_updated', syncTerritoryColorOverrides);
            window.removeEventListener('neosantara_capital_changed', handleCapitalChanged);
        };"""

text = text.replace(old_listener, new_listener)

with open('apps/src/app/page/map_system/map-system.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("Updated map-system.tsx with capital change event support")

