P = 'apps/src/app/page/map_system/map-system.tsx'
code = open(P, 'r', encoding='utf-8').read()

target = """                    <div className="flex items-center justify-between mb-2 xl:mb-3.5">
                        {/* Settings gear inside container */}
                        <div className="flex items-center gap-1.5 xl:gap-2">
                            <div className="flex items-center justify-center w-6 h-6 xl:w-8 xl:h-8 rounded-md xl:rounded-lg bg-[#0A1A1A] border border-[#00FFAA]/30 relative">
                                <Settings
                                    className="w-3.5 h-3.5 xl:w-4.5 xl:h-4.5 text-[#00FFAA]"
                                    style={{ animation: 'spin 8s linear infinite' }}
                                />
                            </div>
                            {/* Tombol Pengaturan Layer Batas Negara / Kota */}
                            <button
                                type="button"
                                onClick={() => setIsPresidentMenuOpen(true)}
                                title="Pengaturan Tampilan Batas Peta"
                                className="flex items-center justify-center w-6 h-6 xl:w-8 xl:h-8 rounded-md xl:rounded-lg bg-[#0A1A1A] border border-[#00FFAA]/40 hover:bg-[#00FFAA]/20 hover:border-[#00FFAA] text-[#00FFAA] transition-all cursor-pointer shadow-[0_0_10px_rgba(0,255,170,0.2)]"
                            >
                                <Globe className="w-3.5 h-3.5 xl:w-4 xl:h-4" />
                            </button>
                        </div>

                        {/* Calendar date label */}"""

replacement = """                    <div className="flex items-center justify-end mb-2 xl:mb-3.5">
                        {/* Calendar date label */}"""

assert target in code, "target not found in map-system.tsx"
code = code.replace(target, replacement, 1)

open(P, 'w', encoding='utf-8').write(code)
print("Berhasil menghapus icon gerigi (Settings) dan bola dunia (Globe) dari floating time controller!")

