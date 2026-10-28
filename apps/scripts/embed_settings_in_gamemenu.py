with open('apps/src/app/page/navbar/GameMenuModal.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

target_imp = "import { KeywordModal } from '../keyword/keyword';"
repl_imp = "import { KeywordModal } from '../keyword/keyword';\nimport { MapSettingsSection } from './settings/MapSettingsSection';"
assert target_imp in text, "target_imp not found"
text = text.replace(target_imp, repl_imp, 1)

target_res = """                                        <select
                                            value={resolution}
                                            onChange={(e) => setResolution(e.target.value)}
                                            className="w-full bg-[#0A1A1A] border border-[#00FFAA]/30 rounded px-3 py-2 text-xs font-bold text-[#E0E0E0] focus:outline-none focus:border-[#00FFAA] cursor-pointer transition-colors"
                                        >
                                            <option value="1920x1080">1920 x 1080 (16:9)</option>
                                            <option value="1600x900">1600 x 900 (16:9)</option>
                                            <option value="1280x720">1280 x 720 (16:9)</option>
                                        </select>
                                    </div>"""

repl_res = """                                        <select
                                            value={resolution}
                                            onChange={(e) => setResolution(e.target.value)}
                                            className="w-full bg-[#0A1A1A] border border-[#00FFAA]/30 rounded px-3 py-2 text-xs font-bold text-[#E0E0E0] focus:outline-none focus:border-[#00FFAA] cursor-pointer transition-colors"
                                        >
                                            <option value="1920x1080">1920 x 1080 (16:9)</option>
                                            <option value="1600x900">1600 x 900 (16:9)</option>
                                            <option value="1280x720">1280 x 720 (16:9)</option>
                                        </select>
                                    </div>

                                    {/* Pengaturan Peta (Batas Negara vs Kota) */}
                                    <MapSettingsSection />"""

assert target_res in text, "target_res not found"
text = text.replace(target_res, repl_res, 1)

with open('apps/src/app/page/navbar/GameMenuModal.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("Berhasil mengintegrasikan MapSettingsSection ke dalam GameMenuModal!")

