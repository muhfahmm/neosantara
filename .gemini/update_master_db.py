import re

# Read current updated database_hunian_permukiman.sql
with open('json/semua_fitur_negara/1_pembangunan/2_tempat_umum/2_hunian_permukiman/database_hunian_permukiman.sql', 'r', encoding='utf-8') as f:
    hunian_sql = f.read()

# Read db_presiden_simulator.sql
with open('db_presiden_simulator.sql', 'r', encoding='utf-8') as f:
    db_master = f.read()

section_header = "-- SECTION: json/semua_fitur_negara/1_pembangunan/2_tempat_umum/2_hunian_permukiman/database_hunian_permukiman.sql"

# Clean up any misplaced previous appends if any
if section_header in db_master:
    # remove old occurrence if exists
    pattern = re.escape(section_header) + r".*?(?=(-- ========================================================|\Z))"
    db_master = re.sub(pattern, "", db_master, flags=re.DOTALL)

# Format section cleanly
new_section = f"-- ========================================================\n{section_header}\n-- ========================================================\n\n{hunian_sql}\n\n"

# Insert before SET FOREIGN_KEY_CHECKS = 1; at the very end
if "SET FOREIGN_KEY_CHECKS = 1;" in db_master:
    # Replace the last occurrence of SET FOREIGN_KEY_CHECKS = 1;
    idx = db_master.rfind("SET FOREIGN_KEY_CHECKS = 1;")
    db_master_updated = db_master[:idx] + new_section + db_master[idx:]
else:
    db_master_updated = db_master + "\n" + new_section

with open('db_presiden_simulator.sql', 'w', encoding='utf-8') as f:
    f.write(db_master_updated)

print("db_presiden_simulator.sql successfully updated at root!")
