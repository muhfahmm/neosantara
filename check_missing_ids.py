import json
import re

with open('apps/src/app/page/paused_menu/terjemahan_paused_menu/id/side_menu/pencapaian/pencapaian.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

items = data.get('items', {})

with open('apps/src/app/page/menus/mission/pencapaianModals.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Match achievement definitions: id: 'xxx' inside ACHIEVEMENT_DEFINITIONS
pattern = re.compile(r"id:\s*'([a-zA-Z0-9_]+)'")
matches = pattern.findall(text)

missing = []
for m in matches:
    if m not in items and not m.startswith('bangun_'):
        missing.append(m)

print("Unique matches:", len(set(matches)))
print("Missing in items:", list(set(missing)))
