with open('json/4_database_hubungan_antar_negara/database_hubungan_antar_negara.pg.sql', 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

import re
matches = re.findall(r"'china',\s*\d+,\s*'([^']+)',\s*(\d+)\),?", text)
print("Relations from China count:", len(matches))
for target, rel in matches:
    if target in ['russia', 'rusia', 'mongolia', 'north korea', 'korea utara', 'united states', 'amerika serikat', 'japan', 'jepang', 'india', 'indonesia', 'vietnam', 'taiwan']:
        print(f"China -> {target}: {rel}")

