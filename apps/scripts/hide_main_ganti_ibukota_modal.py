with open('apps/src/app/page/navigasi_menu/2_navigasi_bawah/9_kementrian/2_ganti_ibukota/GantiIbukotaModal.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace(
"""  return (
    <>
      <NotebookModalWrapper onClose={onClose} zIndexClass="z-[70]">""",
"""  return (
    <>
      {!selectedTargetCity && (
        <NotebookModalWrapper onClose={onClose} zIndexClass="z-[70]">"""
)

text = text.replace(
"""        </div>
      </NotebookModalWrapper>

      {/* Modal Konfirmasi Pergantian */}""",
"""        </div>
      </NotebookModalWrapper>
      )}

      {/* Modal Konfirmasi Pergantian */}"""
)

with open('apps/src/app/page/navigasi_menu/2_navigasi_bawah/9_kementrian/2_ganti_ibukota/GantiIbukotaModal.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("Updated GantiIbukotaModal to hide when selectedTargetCity is set")

