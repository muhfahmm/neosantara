with open('apps/src/app/page/map_system/map-system.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

old_logic = """    return citiesPool.map(item => {
        let capital = { ...item };
        if (customCapitalName) {
            const isTargetCapital = normalizeKey(capital.capital) === normalizeKey(customCapitalName);
            if (isTargetCapital) {
                capital = { ...capital, is_capital: true, is_major_city: false } as any;
            } else if (normalizeKey(capital.country) === normalizeKey('indonesia') || normalizeKey(capital.country) === normalizeKey(customCapitalName)) {
                // Jika kota lain di negara yang sama sebelumnya adalah ibukota default (misal Jakarta)
                if (capital.capital.toLowerCase() === 'jakarta' || !('is_major_city' in capital)) {
                    capital = { ...capital, is_capital: false, is_major_city: true } as any;
                }
            }
        }"""

new_logic = """    // Cari nama negara asal dari customCapitalName (misal jika Baotou -> negara 'china')
    let targetCountryKey: string | null = null;
    if (customCapitalName) {
        const found = citiesPool.find(c => normalizeKey(c.capital) === normalizeKey(customCapitalName));
        if (found) {
            targetCountryKey = normalizeKey(found.country);
        }
    }

    return citiesPool.map(item => {
        let capital = { ...item };
        if (customCapitalName && targetCountryKey) {
            if (normalizeKey(capital.country) === targetCountryKey) {
                const isTargetCapital = normalizeKey(capital.capital) === normalizeKey(customCapitalName);
                if (isTargetCapital) {
                    capital = { ...capital, is_capital: true, is_major_city: false } as any;
                } else {
                    capital = { ...capital, is_capital: false, is_major_city: true } as any;
                }
            }
        }"""

text = text.replace(old_logic, new_logic)

with open('apps/src/app/page/map_system/map-system.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("Updated capital override logic in map-system.tsx")

