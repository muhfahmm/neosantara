"use client"
import React, { useState, useEffect, useRef, useMemo } from "react";
import { 
  X, FileText, Plus, CheckCircle, ChevronDown, Users, ThumbsUp, ThumbsDown, 
  Clock, Swords, ShieldBan, Coins, Bomb, Package 
} from "lucide-react";
import { COUNTRIES_DATA } from "../../../../../map_system/map-data";
import { calculateResolusiVoting } from "../voting_logic/resolusiPBB_logic";

// 🔥 PERBAIKAN: Hapus ekstensi .tsx di bagian import
import CountryTargetModal from "./2_negara_target";
import CountryListModal from "./3_jumlah_suara";

interface ResolusiPBBProps {
  selectedCountry: any;
}

interface CountryOption {
  id: number;
  name: string;
  iso: string;
  continent: string;
}

// Helper function yang diekspor agar bisa digunakan file lain
export const renderFlag = (iso: string | undefined, altName: string, size: "sm" | "md" = "md") => {
  if (!iso || iso.length !== 2) return null;
  const wClass = size === "sm" ? "w-5 h-3.5" : "w-6 h-4";
  return (
    <div className={`${wClass} rounded-sm overflow-hidden border border-[#5c3c10]/20 flex-shrink-0 shadow-sm bg-[#e4dac3] relative flex items-center justify-center`}>
      <img
        src={`https://flagcdn.com/w80/${iso.toLowerCase()}.png`}
        alt={altName}
        className="w-full h-full object-cover absolute inset-0"
        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
      />
    </div>
  );
};

export const formatCountryName = (name: string) => {
  return name
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export default function ResolusiPBB({ selectedCountry }: ResolusiPBBProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [selectedType, setSelectedType] = useState<string>("war_ban");
  const [selectedDuration, setSelectedDuration] = useState<string>("1 bulan");
  const [selectedTarget, setSelectedTarget] = useState<CountryOption | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<string>("Kayu");

  const [isCountryModalOpen, setIsCountryModalOpen] = useState(false);
  const [activeContinent, setActiveContinent] = useState<string>("");

  const [isDurationOpen, setIsDurationOpen] = useState(false);
  const [isProductOpen, setIsProductOpen] = useState(false);
  
  const [isSupportersModalOpen, setIsSupportersModalOpen] = useState(false);
  const [isOpponentsModalOpen, setIsOpponentsModalOpen] = useState(false);

  const durationRef = useRef<HTMLDivElement>(null);
  const productRef = useRef<HTMLDivElement>(null);

  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [allies, setAllies] = useState<CountryOption[]>([]);
  
  const [voteStats, setVoteStats] = useState<{ supporters: CountryOption[], opponents: CountryOption[], hasDiplomaticRelation: boolean }>({
    supporters: [],
    opponents: [],
    hasDiplomaticRelation: false
  });

  const RESOLUTION_ACTIONS = [
    { id: 'war_ban', icon: Swords, label: 'Larangan Perang', desc: 'Dilarang menyerang negara ini selama periode yang dipilih.' },
    { id: 'arms_embargo', icon: ShieldBan, label: 'Embargo Penjualan Senjata', desc: 'Perdagangan senjata dilarang selama periode yang dipilih.' },
    { id: 'economic_embargo', icon: Coins, label: 'Embargo Ekonomi', desc: 'Perdagangan ekonomi dilarang selama periode yang dipilih.' },
    { id: 'military_invasion', icon: Bomb, label: 'Resolusi Invasi', desc: 'Resolusi memungkinkan negara diinvasi tanpa kecaman oleh negara lain.' },
    { id: 'production_ban', icon: Package, label: 'Larangan Produksi', desc: 'Produksi produk yang dipilih dihentikan selama periode yang dipilih.' },
  ];

  const DURATION_OPTIONS = ['1 bulan', '3 bulan', '6 bulan', '9 bulan', '1 tahun'];
  const PRODUCT_OPTIONS = ['Kayu', 'Semen', 'Baja', 'Mobil', 'Senjata'];

  useEffect(() => {
    if (COUNTRIES_DATA && Array.isArray(COUNTRIES_DATA)) {
      const formatted = COUNTRIES_DATA.filter((c) => c.country && c.iso).map((c) => ({
        id: c.id,
        name: formatCountryName(c.country),
        iso: c.iso.toLowerCase(),
        continent: c.continent || 'Lainnya'
      }));
      setCountries(formatted);
    } else {
      setCountries([{ id: 0, name: "Indonesia (Fallback)", iso: "id", continent: "Asia" }]);
    }
  }, []);

  const groupedCountries = useMemo<Record<string, CountryOption[]>>(() => {
    return countries.reduce((acc, country) => {
      const continent = country.continent || 'Lainnya';
      if (!acc[continent]) acc[continent] = [];
      acc[continent].push(country);
      return acc;
    }, {} as Record<string, CountryOption[]>);
  }, [countries]);

  useEffect(() => {
    const keys = Object.keys(groupedCountries);
    if (keys.length > 0 && !activeContinent) {
      setActiveContinent(keys[0]);
    }
  }, [groupedCountries, activeContinent]);

  useEffect(() => {
    const safeCountries = Array.isArray(countries) ? countries : [];
    if (safeCountries.length === 0) return;
    const userCountryId = selectedCountry?.id || 0;
    const seed = (userCountryId * 31 + 7) % safeCountries.length;
    const totalAllies = Math.floor(20 + (seed % 20));
    const alliesList: any[] = [];
    const usedIndices = new Set();
    usedIndices.add(userCountryId);
    let attempts = 0;
    while (alliesList.length < totalAllies && attempts < 1000) {
      const randomIndex = (seed + attempts * 13) % safeCountries.length;
      if (!usedIndices.has(randomIndex)) {
        usedIndices.add(randomIndex);
        alliesList.push(safeCountries[randomIndex]);
      }
      attempts++;
    }
    setAllies(alliesList);
  }, [countries, selectedCountry]);

  useEffect(() => {
    if (!selectedTarget || !selectedCountry || countries.length === 0) {
      setVoteStats({ supporters: [], opponents: [], hasDiplomaticRelation: false });
      return;
    }

    (async () => {
      const result = await calculateResolusiVoting(
        selectedCountry.country,
        selectedTarget.name,
        countries
      ) ?? { supporters: [], opponents: [], hasDiplomaticRelation: false };

      let supportersList: CountryOption[] = [];
      let opponentsList: CountryOption[] = [];
      
      const rawSupporters = result?.supporters ?? [];
      const rawOpponents = result?.opponents ?? [];

      if (typeof rawSupporters === 'number') {
        const isTargetAlly = allies.some(ally => ally.id === selectedTarget.id);
        if (isTargetAlly) {
          supportersList = countries.filter(c => !allies.some(ally => ally.id === c.id) && c.id !== selectedTarget.id);
          opponentsList = allies.filter(c => c.id !== selectedTarget.id);
        } else {
          supportersList = allies;
          opponentsList = countries.filter(c => !allies.some(ally => ally.id === c.id) && c.id !== selectedTarget.id);
        }
      } else if (Array.isArray(rawSupporters)) {
        supportersList = rawSupporters;
        opponentsList = Array.isArray(rawOpponents) ? rawOpponents : [];
      } else {
        supportersList = [];
        opponentsList = [];
      }

      setVoteStats({
        supporters: supportersList,
        opponents: opponentsList,
        hasDiplomaticRelation: result?.hasDiplomaticRelation || false
      });
    })();
  }, [selectedTarget, selectedCountry, countries, allies]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (durationRef.current && !durationRef.current.contains(event.target as Node)) setIsDurationOpen(false);
      if (productRef.current && !productRef.current.contains(event.target as Node)) setIsProductOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const isAnyModalOpen = showCreateModal || isCountryModalOpen || isSupportersModalOpen || isOpponentsModalOpen;
    if (isAnyModalOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflowY = 'hidden';
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflowY = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0', 10) * -1);
      }
    }
  }, [showCreateModal, isCountryModalOpen, isSupportersModalOpen, isOpponentsModalOpen]);

  const isProductionBan = selectedType === 'production_ban';

  const handleSubmitResolution = () => {
    if (isProductionBan) {
      alert(`Resolusi berhasil diajukan!\n\nJenis: Larangan Produksi\nDurasi: ${selectedDuration}\nProduk: ${selectedProduct}`);
      setShowCreateModal(false);
      return;
    }
    if (!selectedTarget) {
      alert("Harap lengkapi Jenis Resolusi, Durasi, dan Negara Target!");
      return;
    }
    const activeAction = RESOLUTION_ACTIONS.find(a => a.id === selectedType);
    const supportersCount = voteStats.supporters.length;
    const opponentsCount = voteStats.opponents.length;
    const passed = supportersCount > opponentsCount;
    
    alert(
      `Resolusi berhasil diajukan!\n\n` +
      `Jenis: ${activeAction?.label}\n` +
      `Durasi: ${selectedDuration}\n` +
      `Target: ${selectedTarget.name}\n\n` +
      `Hasil Prakiraan Voting:\n` +
      `✅ Setuju: ${supportersCount} negara (Hubungan Dagang)\n` +
      `❌ Menolak: ${opponentsCount} negara\n` +
      `Hasil Akhir: ${passed ? "✅ RESOLUSI DISAHKAN" : "❌ RESOLUSI GAGAL"}`
    );
    setShowCreateModal(false);
  };

  // 🔥 Logika Toggle (Unselect jika klik negara yang sama)
  const handleSelectTarget = (country: CountryOption) => {
    // Jika negara yang diklik sama dengan yang sudah dipilih, batalkan pilihan (unselect) menjadi null
    if (selectedTarget?.id === country.id) {
      setSelectedTarget(null);
    } else {
      // Jika berbeda, set ke negara baru
      setSelectedTarget(country);
    }
    // Tutup modal
    setIsCountryModalOpen(false);
  };

  return (
    <div className="space-y-4 relative">
      
      {/* UI Utama: Halaman Kosong Elegan */}
      <div className="bg-white/70 border border-[#C4B49C]/30 p-10 rounded-xl shadow-sm flex flex-col items-center justify-center text-center space-y-4 min-h-[300px]">
        <div className="p-3 rounded-full bg-[#5c3c10]/10 border border-[#5c3c10]/20">
          <FileText className="h-8 w-8 text-[#5c3c10]" />
        </div>
        <div>
          <h3 className="text-lg font-black text-[#5c3c10] uppercase tracking-tight">Belum Ada Resolusi Aktif</h3>
          <p className="text-xs text-[#8b7e66] mt-1 max-w-md">
            Mulailah dengan mengajukan rancangan resolusi baru untuk dibahas oleh negara-negara anggota Majelis Umum.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="mt-4 px-6 py-3 rounded-xl bg-gradient-to-b from-[#ffe07d] via-[#fcae1e] to-[#c77a00] text-[#5c3c10] border-2 border-[#1e2f3d]/15 shadow-lg shadow-[#fcae1e]/20 text-sm font-black uppercase tracking-wider flex items-center gap-2 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="h-5 w-5" />
          Buat Resolusi Baru
        </button>
      </div>

      {/* 🔥 MODAL UTAMA AJUKAN RESOLUSI */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none">
          <div className="bg-[#FAF6EE] border-2 sm:border-3 border-[#C4B49C] rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative pointer-events-auto shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            
            <div className="px-6 py-4 border-b-2 border-[#C4B49C]/30 flex items-center justify-between bg-[#FAF6EE] relative z-10 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600/10 rounded-xl border border-blue-600/20">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-[#5c3c10] uppercase tracking-tight">Resolusi Sidang Umum</h3>
                  <p className="text-xs text-[#8b7e66] font-bold mt-0.5">Pilih aksi, durasi, dan target resolusi Anda.</p>
                </div>
              </div>
              <button onClick={() => { setShowCreateModal(false); }} className="p-2 sm:p-2.5 rounded-xl border-2 border-[#C4B49C] bg-transparent text-[#8b7e66] hover:text-[#5c3c10] hover:bg-black/5 active:bg-black/10 transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1.5 shadow-sm">
                <span className="text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 p-8 bg-[#FAF6EE]/40 relative z-10 flex flex-col items-center justify-center overflow-y-auto no-scrollbar">
              <div className="w-full max-w-4xl space-y-8">
                
                <div>
                  <div className="flex flex-wrap justify-center items-center gap-6">
                    {RESOLUTION_ACTIONS.map((action) => {
                      const Icon = action.icon;
                      const isActive = selectedType === action.id;
                      return (
                        <button
                          key={action.id}
                          onClick={() => setSelectedType(action.id)}
                          className={`p-2 rounded-xl border-2 transition-all cursor-pointer flex flex-col items-center justify-center w-20 h-20 group ${
                            isActive
                              ? 'border-[#367d7a] bg-[#367d7a]/10 shadow-sm text-[#367d7a]'
                              : 'border-transparent text-[#8b7e66] hover:border-[#C4B49C]/50 hover:bg-[#e4dac3]/40'
                          }`}
                          title={action.label}
                        >
                          <Icon className={`w-8 h-8 ${isActive ? 'fill-[#367d7a]/20' : ''}`} />
                          <span className="text-[10px] font-bold mt-1.5 text-center leading-tight">{action.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {selectedType && (
                  <div className="text-center">
                    <h3 className="text-2xl font-black text-[#2e261a] uppercase tracking-tight">
                      {RESOLUTION_ACTIONS.find(a => a.id === selectedType)?.label}
                    </h3>
                    <p className="text-sm text-[#8b7e66] mt-2 leading-relaxed max-w-2xl mx-auto">
                      {RESOLUTION_ACTIONS.find(a => a.id === selectedType)?.desc}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-[10px] font-black text-[#5c3c10] uppercase tracking-wider mb-2">Pilih durasi:</p>
                    <div className="relative" ref={durationRef}>
                      <button type="button" onClick={() => setIsDurationOpen(!isDurationOpen)} className="w-full flex items-center justify-between gap-3 px-5 py-4 rounded-xl bg-[#367d7a] text-white border border-[#285e5c] shadow-md hover:brightness-110 transition-all cursor-pointer">
                        <span className="text-sm font-bold">{selectedDuration}</span>
                        <div className="flex items-center gap-1"><Clock className="w-4 h-4 text-white/70" /></div>
                      </button>
                      {isDurationOpen && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-[#C4B49C]/50 rounded-xl shadow-xl z-30 overflow-hidden">
                          {DURATION_OPTIONS.map((dur) => (
                            <button key={dur} onClick={() => { setSelectedDuration(dur); setIsDurationOpen(false); }} className={`w-full px-5 py-3 text-left text-sm font-bold transition-colors cursor-pointer hover:bg-[#e4dac3]/50 ${selectedDuration === dur ? 'bg-[#367d7a]/10 text-[#367d7a]' : 'text-[#5c3c10]'}`}>{dur}</button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-black text-[#5c3c10] uppercase tracking-wider mb-2">
                      {isProductionBan ? "Pilih produk:" : "Pilih negara:"}
                    </p>
                    
                    {isProductionBan ? (
                      <div className="relative" ref={productRef}>
                        <button type="button" onClick={() => setIsProductOpen(!isProductOpen)} className="w-full flex items-center justify-between gap-3 px-5 py-4 rounded-xl bg-[#367d7a] text-white border border-[#285e5c] shadow-md hover:brightness-110 transition-all cursor-pointer">
                          <span className="text-sm font-bold">{selectedProduct}</span>
                          <ChevronDown className={`w-4 h-4 text-white/70 transition-transform ${isProductOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {isProductOpen && (
                          <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-[#C4B49C]/50 rounded-xl shadow-xl z-30 overflow-hidden">
                            {PRODUCT_OPTIONS.map((prod) => (
                              <button key={prod} onClick={() => { setSelectedProduct(prod); setIsProductOpen(false); }} className="w-full px-5 py-3 text-left text-sm font-bold transition-colors cursor-pointer hover:bg-[#e4dac3]/50 border-b border-[#C4B49C]/10 last:border-b-0">{prod}</button>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <button 
                        type="button"
                        onClick={() => setIsCountryModalOpen(true)}
                        className="w-full flex items-center justify-between gap-3 px-5 py-4 rounded-xl bg-[#367d7a] text-white border border-[#285e5c] shadow-md hover:brightness-110 transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-3 truncate">
                          {selectedTarget ? (
                            <>
                              {renderFlag(selectedTarget.iso, selectedTarget.name, "sm")}
                              <span className="text-sm font-bold truncate">{selectedTarget.name}</span>
                            </>
                          ) : (
                            <span className="text-sm font-bold opacity-80">-- Pilih Negara --</span>
                          )}
                        </div>
                        <ChevronDown className="w-4 h-4 text-white/70" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-center gap-4">
                  <span className="text-sm font-bold text-[#8b7e66]">Durasi pemungutan suara:</span>
                  <div className="flex items-center gap-2"><span className="text-sm font-bold text-[#5c3c10]">30 h.</span><Clock className="w-4 h-4 text-[#8b7e66]" /></div>
                </div>

                <div className="p-6 rounded-2xl bg-[#e4dac3]/30 border-2 border-[#C4B49C]/50 shadow-inner">
                  <p className="text-center text-[11px] font-black text-[#8b7e66] uppercase tracking-wider mb-4">Perkiraan Jumlah Suara</p>
                  <div className="flex justify-between items-center px-4 max-w-sm mx-auto gap-3">
                    <button
                      onClick={() => { if (voteStats.supporters.length > 0) setIsSupportersModalOpen(true); }}
                      className={`flex flex-col items-center w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 shadow-sm ${
                        voteStats.supporters.length === 0
                          ? 'border-emerald-100 bg-emerald-50/30 opacity-50 cursor-not-allowed'
                          : 'border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100/80 hover:border-emerald-400 hover:shadow-md active:scale-95 cursor-pointer'
                      }`}
                      title={voteStats.supporters.length === 0 ? "Tidak ada negara yang mendukung" : "Lihat daftar negara pendukung"}
                    >
                      <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Setuju</span>
                      <span className="text-2xl font-black text-emerald-700 mt-0.5">
                        {voteStats.supporters.length}
                      </span>
                    </button>

                    <button
                      onClick={() => { if (voteStats.opponents.length > 0) setIsOpponentsModalOpen(true); }}
                      className={`flex flex-col items-center w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 shadow-sm ${
                        voteStats.opponents.length === 0
                          ? 'border-rose-100 bg-rose-50/30 opacity-50 cursor-not-allowed'
                          : 'border-rose-200 bg-rose-50/60 hover:bg-rose-100/80 hover:border-rose-400 hover:shadow-md active:scale-95 cursor-pointer'
                      }`}
                      title={voteStats.opponents.length === 0 ? "Tidak ada negara yang menentang" : "Lihat daftar negara penentang"}
                    >
                      <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider">Menentang</span>
                      <span className="text-2xl font-black text-rose-700 mt-0.5">
                        {voteStats.opponents.length}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-4 px-8 py-6 border-t-2 border-[#C4B49C]/30 bg-[#FAF6EE] relative z-10 shrink-0">
              <button onClick={() => { setShowCreateModal(false); }} className="px-8 py-3 rounded-xl border-2 border-[#C4B49C] bg-transparent text-[#8b7e66] hover:text-[#5c3c10] hover:bg-black/5 transition-all font-black text-xs uppercase tracking-wider cursor-pointer">Batal</button>
              <button onClick={handleSubmitResolution} className="px-8 py-3 rounded-xl bg-[#367d7a] text-white font-black text-xs uppercase tracking-wider shadow-md hover:brightness-110 active:scale-95 transition-all cursor-pointer">Tambahkan</button>
            </div>

          </div>
        </div>
      )}

      {/* 🔥 MODAL PILIH NEGARA TARGET */}
      <CountryTargetModal
        isOpen={isCountryModalOpen}
        onClose={() => setIsCountryModalOpen(false)}
        countries={countries}
        groupedCountries={groupedCountries}
        activeContinent={activeContinent}
        setActiveContinent={setActiveContinent}
        selectedCountry={selectedCountry}
        onSelectTarget={handleSelectTarget}
        renderFlag={renderFlag}
      />

      {/* 🔥 MODAL DAFTAR NEGARA SETUJU & MENENTANG */}
      <CountryListModal
        isOpen={isSupportersModalOpen}
        onClose={() => setIsSupportersModalOpen(false)}
        title="Negara yang Mendukung"
        countries={voteStats.supporters}
        renderFlag={renderFlag}
      />
      <CountryListModal
        isOpen={isOpponentsModalOpen}
        onClose={() => setIsOpponentsModalOpen(false)}
        title="Negara yang Menentang"
        countries={voteStats.opponents}
        renderFlag={renderFlag}
      />

    </div>
  );
}