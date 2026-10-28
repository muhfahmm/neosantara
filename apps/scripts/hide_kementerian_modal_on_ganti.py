with open('apps/src/app/page/navigasi_menu/2_navigasi_bawah/9_kementrian/KementerianModal.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace(
"""      {/* ========== MODAL UTAMA ========== */}
      <NotebookModalWrapper onClose={onClose}>""",
"""      {/* ========== MODAL UTAMA ========== */}
      {!isGantiIbukotaOpen && (
        <NotebookModalWrapper onClose={onClose}>"""
)

text = text.replace(
"""        </div>
      </NotebookModalWrapper>

      {ministerDepartment && (""",
"""        </div>
      </NotebookModalWrapper>
      )}

      {ministerDepartment && ("""
)

with open('apps/src/app/page/navigasi_menu/2_navigasi_bawah/9_kementrian/KementerianModal.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("Updated KementerianModal to hide when isGantiIbukotaOpen is true")

