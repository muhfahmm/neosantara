import math

lines = []
with open('json/semua_fitur_negara/0_profiles/database_profiles_negara.sql', 'r', encoding='utf-8') as f:
    for line in f:
        line = line.strip()
        if line.startswith('('):
            if line.endswith(';'):
                line = line[1:-1]
            elif line.endswith(','):
                line = line[1:-1]
            else:
                line = line[1:]
            
            parts = []
            curr = []
            in_q = False
            for c in line:
                if c == "'" and (not curr or curr[-1] != '\\'):
                    in_q = not in_q
                    curr.append(c)
                elif c == ',' and not in_q:
                    parts.append(''.join(curr).strip())
                    curr = []
                else:
                    curr.append(c)
            if curr:
                parts.append(''.join(curr).strip())
            
            p_id = int(parts[0])
            slug = parts[1].strip("'")
            name_id = parts[2].strip("'")
            pop = int(parts[8])
            
            r_subsidi = math.ceil(pop / 8)
            apartemen = math.ceil(r_subsidi * 0.064)
            mansion = math.ceil(r_subsidi * 0.1)
            
            lines.append((p_id, name_id, slug, r_subsidi, apartemen, mansion))

print('Total processed:', len(lines))

out_sql = []
out_sql.append('-- database_hunian_permukiman SQL Export')
out_sql.append(f'-- Total {len(lines)} Negara')
out_sql.append('-- Data dihitung dari database_profiles_negara dengan rumus:')
out_sql.append('-- rumah_subsidi = CEIL(jumlah_penduduk / 8)')
out_sql.append('-- apartemen     = CEIL(rumah_subsidi * 0.064)')
out_sql.append('-- mansion       = CEIL(rumah_subsidi * 0.1)')
out_sql.append('')
out_sql.append('DROP TABLE IF EXISTS database_hunian_permukiman;')
out_sql.append('CREATE TABLE IF NOT EXISTS database_hunian_permukiman (')
out_sql.append('    id INT PRIMARY KEY,')
out_sql.append('    country VARCHAR(100) NOT NULL,')
out_sql.append('    country_slug VARCHAR(100) NOT NULL,')
out_sql.append('    rumah_subsidi INT NOT NULL DEFAULT 0,')
out_sql.append('    apartemen INT NOT NULL DEFAULT 0,')
out_sql.append('    mansion INT NOT NULL DEFAULT 0')
out_sql.append(');')
out_sql.append('')
out_sql.append('INSERT INTO database_hunian_permukiman (')
out_sql.append('    id, country, country_slug, rumah_subsidi, apartemen, mansion')
out_sql.append(') VALUES')

rows_formatted = []
for item in lines:
    p_id, name_id, slug, r_sub, ap, man = item
    name_id_clean = name_id.replace("'", "''")
    rows_formatted.append(f"    ({p_id}, '{name_id_clean}', '{slug}', {r_sub}, {ap}, {man})")

out_sql.append(',\n'.join(rows_formatted) + ';')

sql_content = '\n'.join(out_sql) + '\n'

with open('json/semua_fitur_negara/1_pembangunan/2_tempat_umum/2_hunian_permukiman/database_hunian_permukiman.sql', 'w', encoding='utf-8') as f:
    f.write(sql_content)

print('Successfully written database_hunian_permukiman.sql')
