with open('apps/src/app/page/navigasi_menu/2_navigasi_bawah/9_kementrian/KementerianModal.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

target = """      {ministerDepartment && (
        <PilihMenteriModal
          department={ministerDepartment}
          availableNetIncome={availableNetIncome}
          hiredTier={Number(countryDetail?.[`menteri_${ministerDepartment.id}`]) || 0}
          onClose={() => setMinisterDepartment(null)}
          onHire={(tier, cost) => hireMinister(ministerDepartment, tier, cost)}
        />
      )}"""

replacement = """      {ministerDepartment && (
        <PilihMenteriModal
          department={ministerDepartment}
          availableNetIncome={availableNetIncome}
          hiredTier={Number(countryDetail?.[`menteri_${ministerDepartment.id}`]) || 0}
          onClose={() => setMinisterDepartment(null)}
          onHire={(tier, cost) => hireMinister(ministerDepartment, tier, cost)}
        />
      )}

      {/* ========== MODAL GANTI IBUKOTA ========== */}
      <GantiIbukotaModal
        isOpen={isGantiIbukotaOpen}
        onClose={() => setIsGantiIbukotaOpen(false)}
        countryDetail={countryDetail}
        setCountryDetail={setCountryDetail}
        currentDate={currentDate}
      />"""

text = text.replace(target, replacement)

with open('apps/src/app/page/navigasi_menu/2_navigasi_bawah/9_kementrian/KementerianModal.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("Added GantiIbukotaModal render to KementerianModal.tsx")

