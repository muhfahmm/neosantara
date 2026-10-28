with open('apps/src/app/page/map_system/map-system.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace(
"""            if (isTargetCapital) {
                capital = { ...capital, is_capital: true, is_major_city: false } as typeof item;
            } else if (normalizeKey(capital.country) === normalizeKey('indonesia') || normalizeKey(capital.country) === normalizeKey(customCapitalName)) {
                // Jika kota lain di negara yang sama sebelumnya adalah ibukota default (misal Jakarta)
                if (capital.capital.toLowerCase() === 'jakarta' || !('is_major_city' in capital)) {
                    capital = { ...capital, is_capital: false, is_major_city: true } as typeof item;
                }
            }""",
"""            if (isTargetCapital) {
                capital = { ...capital, is_capital: true, is_major_city: false } as any;
            } else if (normalizeKey(capital.country) === normalizeKey('indonesia') || normalizeKey(capital.country) === normalizeKey(customCapitalName)) {
                // Jika kota lain di negara yang sama sebelumnya adalah ibukota default (misal Jakarta)
                if (capital.capital.toLowerCase() === 'jakarta' || !('is_major_city' in capital)) {
                    capital = { ...capital, is_capital: false, is_major_city: true } as any;
                }
            }"""
)

with open('apps/src/app/page/map_system/map-system.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("Fixed cast in map-system.tsx")

