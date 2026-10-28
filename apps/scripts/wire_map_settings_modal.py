P = 'apps/src/app/page/map_system/map-system.tsx'
code = open(P, 'r', encoding='utf-8').read()

# 1. Import MapSettingsModal dan getMapDisplaySettings
old_imp = "import { MapSettingsModal } from './MapSettingsModal';"
if old_imp not in code:
    code = code.replace(
        "import MAJOR_CITIES_DATA from './major_cities.json';",
        "import MAJOR_CITIES_DATA from './major_cities.json';\nimport { MapSettingsModal } from './MapSettingsModal';\nimport { getMapDisplaySettings, type MapDisplaySettings } from './mapSettingsLogic';"
    )

# 2. Update getCapitalFlagsForCurrentTerritories agar membaca showMajorCities dan showCapitals
old_fn = """function getCapitalFlagsForCurrentTerritories() {
    const annexedCountries = typeof window === 'undefined'
        ? {}
        : ((window as Window & { neosantara_annexed_countries?: AnnexedTerritories })
            .neosantara_annexed_countries || {});
    const normalizeKey = (value: unknown) =>
        String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '');

    const combinedCities = [...CAPITALS_DATA, ...(MAJOR_CITIES_DATA as typeof CAPITALS_DATA)];
    return combinedCities.map(capital => {"""

new_fn = """function getCapitalFlagsForCurrentTerritories(settingsOverride?: MapDisplaySettings) {
    const annexedCountries = typeof window === 'undefined'
        ? {}
        : ((window as Window & { neosantara_annexed_countries?: AnnexedTerritories })
            .neosantara_annexed_countries || {});
    const normalizeKey = (value: unknown) =>
        String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '');

    const settings = settingsOverride || getMapDisplaySettings();
    let citiesPool: typeof CAPITALS_DATA = [];
    if (settings.showCapitals) {
        citiesPool = citiesPool.concat(CAPITALS_DATA);
    }
    if (settings.showMajorCities) {
        citiesPool = citiesPool.concat(MAJOR_CITIES_DATA as typeof CAPITALS_DATA);
    }

    return citiesPool.map(capital => {"""

assert old_fn in code, "old_fn not found"
code = code.replace(old_fn, new_fn, 1)

# 3. Tambahkan state isMapSettingsOpen di dalam MapSystem
old_state = "const [isPresidentMenuOpen, setIsPresidentMenuOpen] = useState(false);"
new_state = "const [isPresidentMenuOpen, setIsPresidentMenuOpen] = useState(false);\n    const [isMapSettingsModalOpen, setIsMapSettingsModalOpen] = useState(false);"
assert old_state in code, "old_state not found"
code = code.replace(old_state, new_state, 1)

# 4. Tambahkan listener event 'neosantara_map_settings_changed'
old_event_hook = """                syncFeatureColors();
                window.addEventListener('map_feature_colors_dirty', scheduleFeatureColorSync);"""

new_event_hook = """                syncFeatureColors();
                
                // Sinkronkan setting tampilan peta awal ke engine
                const initialMapSettings = getMapDisplaySettings();
                wasmModule.set_show_province_borders_on_map?.(initialMapSettings.showProvinceBorders);
                wasmModule.set_capitals_on_map(getCapitalFlagsForCurrentTerritories(initialMapSettings));

                // Listener ketika user mengubah preferensi tampilan peta
                const handleMapSettingsChange = (e: Event) => {
                    const nextSettings = (e as CustomEvent)?.detail as MapDisplaySettings;
                    if (!nextSettings) return;
                    wasmModule.set_show_province_borders_on_map?.(nextSettings.showProvinceBorders);
                    wasmModule.set_capitals_on_map(getCapitalFlagsForCurrentTerritories(nextSettings));
                };
                window.addEventListener('neosantara_map_settings_changed', handleMapSettingsChange);

                window.addEventListener('map_feature_colors_dirty', scheduleFeatureColorSync);"""

assert old_event_hook in code, "old_event_hook not found"
code = code.replace(old_event_hook, new_event_hook, 1)

# 5. Pasang tombol Layer / Pengaturan Tampilan di floating toolbar kontrol peta
old_gear = """                                <Settings
                                    className="w-3.5 h-3.5 xl:w-4.5 xl:h-4.5 text-[#00FFAA]"
                                    style={{ animation: 'spin 8s linear infinite' }}
                                />
                            </div>
                        </div>"""

new_gear = """                                <Settings
                                    className="w-3.5 h-3.5 xl:w-4.5 xl:h-4.5 text-[#00FFAA]"
                                    style={{ animation: 'spin 8s linear infinite' }}
                                />
                            </div>
                            {/* Tombol Pengaturan Layer Batas Negara / Kota */}
                            <button
                                type="button"
                                onClick={() => setIsMapSettingsModalOpen(true)}
                                title="Pengaturan Tampilan Batas Peta"
                                className="flex items-center justify-center w-6 h-6 xl:w-8 xl:h-8 rounded-md xl:rounded-lg bg-[#0A1A1A] border border-[#00FFAA]/40 hover:bg-[#00FFAA]/20 hover:border-[#00FFAA] text-[#00FFAA] transition-all cursor-pointer shadow-[0_0_10px_rgba(0,255,170,0.2)]"
                            >
                                <Globe className="w-3.5 h-3.5 xl:w-4 xl:h-4" />
                            </button>
                        </div>"""

assert old_gear in code, "old_gear not found"
code = code.replace(old_gear, new_gear, 1)

# 6. Render MapSettingsModal di JSX modal
old_modal_render = """            <GameMenuModal
                isOpen={isPresidentMenuOpen}
                onClose={() => setIsPresidentMenuOpen(false)}
                onSaveGameClick={openSaveModal}
                onRestartClick={() => setIsRestartConfirmOpen(true)}
            />"""

new_modal_render = """            <GameMenuModal
                isOpen={isPresidentMenuOpen}
                onClose={() => setIsPresidentMenuOpen(false)}
                onSaveGameClick={openSaveModal}
                onRestartClick={() => setIsRestartConfirmOpen(true)}
            />

            {/* Modal Pengaturan Tampilan Peta (Batas Negara vs Kota) */}
            <MapSettingsModal
                isOpen={isMapSettingsModalOpen}
                onClose={() => setIsMapSettingsModalOpen(false)}
            />"""

assert old_modal_render in code, "old_modal_render not found"
code = code.replace(old_modal_render, new_modal_render, 1)

open(P, 'w', encoding='utf-8').write(code)
print("Berhasil memasang MapSettingsModal ke map-system.tsx!")

