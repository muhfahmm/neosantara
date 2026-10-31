import re

with open('apps/src/app/page/map_system/map-data.ts', 'r', encoding='utf-8') as f:
    text = f.read()

matches = re.findall(r'\{\s*"id":\s*(\d+),\s*"country":\s*"([^"]+)",[^}]*"color":\s*"([^"]+)"', text)
for mid, mcountry, mcolor in matches:
    if 'korea' in mcountry.lower():
        print(f'{mid}: {mcountry} -> {mcolor}')
