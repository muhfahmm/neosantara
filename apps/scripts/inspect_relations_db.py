with open('json/4_database_hubungan_antar_negara/database_hubungan_antar_negara.pg.sql', 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

import re
matches = re.findall(r"'([a-z0-9_]+)',\s*\d+,\s*'([^']+)'", text)
sources = set(m[0] for m in matches)
targets = set(m[1] for m in matches)

print("Sources count:", len(sources))
print("Targets count:", len(targets))

print("Sources matching china/cina/tiongkok/mongolia:")
for s in sorted(sources):
    if any(k in s for k in ['chin', 'cina', 'tiong', 'mong']):
        print("  source:", s)

print("Targets matching china/cina/tiongkok/mongolia:")
for t in sorted(targets):
    if any(k in t for k in ['chin', 'cina', 'tiong', 'mong']):
        print("  target:", t)

