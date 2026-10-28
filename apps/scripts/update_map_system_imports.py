P = 'apps/src/app/page/map_system/map-system.tsx'
code = open(P, 'r', encoding='utf-8').read()

# 1. Update import path mapSettingsLogic
code = code.replace(
    "import { getMapDisplaySettings, type MapDisplaySettings } from './mapSettingsLogic';",
    "import { getMapDisplaySettings, type MapDisplaySettings } from '../navbar/settings/mapSettingsLogic';"
)

# 2. Hapus import dan modal lama MapSettingsModal jika ada
code = code.replace("import { MapSettingsModal } from './MapSettingsModal';\n", "")
code = code.replace("""            {/* Modal Pengaturan Tampilan Peta (Batas Negara vs Kota) */}
            <MapSettingsModal
                isOpen={isMapSettingsModalOpen}
                onClose={() => setIsMapSettingsModalOpen(false)}
            />""", "")

# 3. Ganti tombol layer di toolbar agar membuka langsung GameMenuModal subview options atau membuka modal menu
# Buka menu pengaturan presiden yang sudah ada
code = code.replace(
    'onClick={() => setIsMapSettingsModalOpen(true)}',
    'onClick={() => setIsPresidentMenuOpen(true)}'
)

open(P, 'w', encoding='utf-8').write(code)
print("Berhasil memperbarui map-system.tsx ke navbar/settings!")

