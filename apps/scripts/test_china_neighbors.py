import json
import re

with open('apps/public/world.geojson', 'r', encoding='utf-8') as f:
    world = json.load(f)

with open('apps/src/app/page/map_system/map-data.ts', 'r', encoding='utf-8') as f:
    text = f.read()

idx = text.find('export const COUNTRIES_DATA')
end_idx = text.find('];', idx)
countries = json.loads(text[idx + len('export const COUNTRIES_DATA: CountryData[] ='):end_idx + 1])

with open('json/4_database_hubungan_antar_negara/database_hubungan_antar_negara.pg.sql', 'r', encoding='utf-8', errors='ignore') as f:
    sql = f.read()

# Parse relations from China in SQL
matches = re.findall(r"'china',\s*\d+,\s*'([^']+)',\s*(\d+)\),?", sql)
db_relations = {m[0].strip().lower(): int(m[1]) for m in matches}

def normalizeKey(val):
    if not val:
        return ''
    return re.sub(r'[^a-z0-9]', '', str(val).lower())

def colorForRelation(relation):
    if relation <= 25: return '#f87171' # red
    if relation <= 40: return '#fb7185' # pink/red
    if relation <= 65: return '#facc15' # yellow
    if relation <= 80: return '#4ade80' # light green
    return '#00FFAA' # cyan

features = world.get('features', [])

for idx, f in enumerate(features):
    props = f.get('properties', {})
    isoKeys = [props.get('ISO_A2'), props.get('ISO_A2_EH'), props.get('ISO_A3'), props.get('ISO_A3_EH')]
    isoKeys = [normalizeKey(k) for k in isoKeys if k]

    nameKeys = [props.get('NAME'), props.get('ADMIN'), props.get('NAME_LONG'), props.get('GEOUNIT'), props.get('NAME_ID'), props.get('NAME_EN'), props.get('NAME_IND')]
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

    name = props.get('NAME') or props.get('ADMIN')
    if name in ['Russia', 'Mongolia', 'India', 'Kazakhstan']:
        c_country = matched_candidate['country'] if matched_candidate else 'UNKNOWN'
        db_score = db_relations.get(c_country.lower())
        color = colorForRelation(db_score) if db_score is not None else 'NO_SCORE'
        print(f"Feature '{name}': matched '{c_country}', DB relation = {db_score}, Color = {color}")

