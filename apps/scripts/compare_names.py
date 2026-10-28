import json
import re

with open('apps/src/app/page/map_system/map-data.ts', 'r', encoding='utf-8') as f:
    text = f.read()

idx = text.find('export const COUNTRIES_DATA')
end_idx = text.find('];', idx)
countries = json.loads(text[idx + len('export const COUNTRIES_DATA: CountryData[] ='):end_idx + 1])

with open('json/4_database_hubungan_antar_negara/database_hubungan_antar_negara.pg.sql', 'r', encoding='utf-8', errors='ignore') as f:
    sql = f.read()

matches = re.findall(r"'([a-z0-9_]+)',\s*\d+,\s*'([^']+)'", sql)
db_targets = set(m[1].strip().lower() for m in matches)
db_sources = set(m[0].strip().lower() for m in matches)

print(f"Total COUNTRIES_DATA: {len(countries)}")
print(f"Total DB targets: {len(db_targets)}")
print(f"Total DB sources: {len(db_sources)}")

unmatched = []
for c in countries:
    name = c['country'].strip().lower()
    if name not in db_targets:
        unmatched.append((c['iso'], c['country']))

print(f"Unmatched countries ({len(unmatched)}):")
for iso, name in unmatched:
    print(f"  {iso}: '{name}'")

