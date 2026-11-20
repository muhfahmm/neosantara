import os
import re

logic_dir = 'apps/src/app/page/menus/inbox/logic'
results = []

for root, dirs, files in os.walk(logic_dir):
    for f in files:
        if f.endswith('.tsx'):
            p = os.path.join(root, f)
            content = open(p, 'r', encoding='utf-8').read()
            # check for buttons
            buttons = re.findall(r'<button[^>]*>(.*?)</button>', content, re.DOTALL)
            if buttons:
                results.append((p, buttons))

print(f"Total TSX files with buttons: {len(results)}\n")
for p, btns in results:
    print(f"=== {p} ({len(btns)} buttons) ===")
    for b in btns:
        # clean up button text
        text = re.sub(r'<[^>]+>', ' ', b).strip()
        text = ' '.join(text.split())
        if text:
            print(f"   [BTN]: {text[:80]}")
    print()
