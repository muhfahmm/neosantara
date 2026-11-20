import os
import re

logic_dir = 'apps/src/app/page/menus/inbox/logic'

files_with_indonesian = []

# Indonesian common words to flag
id_words = [
    'pilih', 'tutup', 'batal', 'setuju', 'tolak', 'kembali', 'lanjut', 'simpan',
    'aparat', 'dialog', 'tuntutan', 'abaikan', 'opsi', 'tindakan', 'solusi',
    'bantuan', 'darurat', 'krisis', 'defisit', 'peringatan', 'lapor', 'menteri',
    'rakyat', 'presiden', 'negara', 'kementerian', 'militer', 'pajak', 'ekonomi',
    'anggaran', 'dana', 'biaya', 'dampak', 'kepuasan', 'peringkat', 'kebijakan',
    'stabil', 'turun', 'naik', 'sukses', 'gagal', 'konfirmasi', 'lihat', 'buka',
    'peringatan', 'perhatian', 'status', 'aksi', 'respon', 'reaksi'
]

# regex to find JSX text or string literals that might be Indonesian
for root, dirs, files in os.walk(logic_dir):
    for f in files:
        if f.endswith(('.tsx', '.ts')) and not f.endswith('.d.ts'):
            p = os.path.join(root, f)
            content = open(p, 'r', encoding='utf-8').read()
            
            # Look for lines with hardcoded Indonesian words not inside t('...')
            lines = content.splitlines()
            flagged_lines = []
            for idx, line in enumerate(lines):
                # skip comments or imports
                stripped = line.strip()
                if stripped.startswith('//') or stripped.startswith('/*') or stripped.startswith('*') or stripped.startswith('import '):
                    continue
                # check if line has JSX text or string literals with Indonesian words
                # simple heuristic: contains quotes or JSX tags with Indonesian words
                for w in id_words:
                    pattern = rf'\b{w}\b'
                    if re.search(pattern, line, re.IGNORECASE):
                        # check if it's already using t('
                        if 't(' not in line or re.search(rf'["\'>][^"\'<]*\b{w}\b[^"\'<]*["\'<]', line, re.IGNORECASE):
                            flagged_lines.append((idx + 1, line.strip()))
                            break
            
            if flagged_lines:
                files_with_indonesian.append((p, flagged_lines))

print(f"Total files flagged: {len(files_with_indonesian)}\n")
for p, lines in files_with_indonesian:
    print(f"=== {p} ({len(lines)} flagged lines) ===")
    for lno, ltext in lines[:15]:
        print(f"  L{lno}: {ltext[:100]}")
    if len(lines) > 15:
        print(f"  ... and {len(lines) - 15} more lines")
    print()
