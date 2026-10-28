import json
import re

with open('apps/public/world.geojson', 'r', encoding='utf-8') as f:
    world = json.load(f)

with open('apps/src/app/page/map_system/map-data.ts', 'r', encoding='utf-8') as f:
    text = f.read()

idx = text.find('export const COUNTRIES_DATA')
end_idx = text.find('];', idx)
countries = json.loads(text[idx + len('export const COUNTRIES_DATA: CountryData[] ='):end_idx + 1])

def normalizeKey(val):
    if not val:
        return ''
    return re.sub(r'[^a-z0-9]', '', str(val).lower())

features = world.get('features', [])
print(f"Total features in world.geojson: {len(features)}")

matched_count = 0
unmatched_features = []
matched_countries = set()

for idx, f in enumerate(features):
    props = f.get('properties', {})
    isoKeys = [
        props.get('ISO_A2'), props.get('ISO_A2_EH'),
        props.get('ISO_A3'), props.get('ISO_A3_EH')
    ]
    isoKeys = [normalizeKey(k) for k in isoKeys if k]

    nameKeys = [
        props.get('NAME'), props.get('ADMIN'), props.get('NAME_LONG'),
        props.get('GEOUNIT'), props.get('NAME_ID'), props.get('NAME_EN'),
        props.get('NAME_IND')
    ]
    nameKeys = [normalizeKey(k) for k in nameKeys if k]

    matched_candidate = None
    for candidate in countries:
        c_iso = normalizeKey(candidate.get('iso'))
        c_name = normalizeKey(candidate.get('country'))
        if c_iso in isoKeys or c_name in nameKeys:
            matched_candidate = candidate
            break
        if any(len(n) > 4 and len(c_name) > 4 and (c_name in n or n in c_name) for n in nameKeys):
            matched_candidate = candidate
            break

    if matched_candidate:
        matched_count += 1
        matched_countries.add(matched_candidate['country'])
    else:
        unmatched_features.append((props.get('NAME') or props.get('ADMIN'), isoKeys))

print(f"Matched features: {matched_count} / {len(features)}")
print(f"Unique countries matched: {len(matched_countries)} / {len(countries)}")
if unmatched_features:
    print("Sample unmatched features:", unmatched_features[:10])

