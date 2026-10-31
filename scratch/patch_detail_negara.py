import sys

with open('apps/src/app/page/detail_negara/detail_negara.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("\r\n", "\n")

old_flag_logic = """  const attackerCountryName = annexedInfo?.attackerCountry;
  if (attackerCountryName) {
    const attackerData = COUNTRIES_DATA?.find(
      (c) => c.country?.toLowerCase().trim() === attackerCountryName.toLowerCase().trim()
    );
    if (attackerData?.iso) {
      displayIso = attackerData.iso;
    } else if (annexedInfo.attackerIso) {
      displayIso = annexedInfo.attackerIso;
    }
  }"""

new_flag_logic = """  const attackerCountryName = annexedInfo?.attackerCountry;
  let rulerIso = "";
  if (attackerCountryName) {
    const attackerData = COUNTRIES_DATA?.find(
      (c) => c.country?.toLowerCase().trim() === attackerCountryName.toLowerCase().trim()
    );
    if (attackerData?.iso) {
      rulerIso = attackerData.iso;
    } else if (annexedInfo.attackerIso) {
      rulerIso = annexedInfo.attackerIso;
    }
    displayIso = rulerIso || originalIso;
  }"""

if old_flag_logic not in content:
    print("Error: old_flag_logic not found!")
    sys.exit(1)

content = content.replace(old_flag_logic, new_flag_logic, 1)

old_header_render = """              <div className="flex items-center gap-2 mt-1">
                {renderFlagHeader(displayIso, displayCountryName)}

                {/* 👈 TAMBAHKAN BENDERA PBB DI SINI */}
                {annexedInfo?.isPbbOccupied && ("""

new_header_render = """              <div className="flex items-center gap-2 mt-1">
                {/* Tampilkan 2 bendera jika wilayah dianeksasi (Bendera Penakluk & Bendera Wilayah Asli) */}
                {rulerIso && originalIso && rulerIso.toLowerCase() !== originalIso.toLowerCase() ? (
                  <>
                    {renderFlagHeader(rulerIso, attackerCountryName || "Penguasa")}
                    {renderFlagHeader(originalIso, countryName || "Wilayah Asli")}
                  </>
                ) : (
                  renderFlagHeader(displayIso, displayCountryName)
                )}

                {/* 👈 TAMBAHKAN BENDERA PBB DI SINI */}
                {annexedInfo?.isPbbOccupied && ("""

if old_header_render not in content:
    print("Error: old_header_render not found!")
    sys.exit(1)

content = content.replace(old_header_render, new_header_render, 1)

with open('apps/src/app/page/detail_negara/detail_negara.tsx', 'w', encoding='utf-8', newline='\r\n') as f:
    f.write(content)

print("detail_negara.tsx successfully updated!")

