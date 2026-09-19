"use client"
import React, { useState, useEffect, useRef, useMemo } from "react";
import { 
  X, Shield, Angry, Smile, Banknote, Anchor, Lock, Package, 
  ChevronDown, Clock, FileText, Plus, Users
} from "lucide-react";
import { COUNTRIES_DATA } from "../../../../../map_system/map-data";
import { calculateKeamananVoting } from "../voting_logic/keamananPBB_logic";

interface KeamananPBBProps {
  selectedCountry: any;
}

interface CountryOption {
  id: number;
  name: string;
  iso: string;
  continent: string;
}

const RESOLUTION_ACTIONS = [
  { id: 'military', icon: Angry, label: 'Invasi Militer', desc: 'Semua tentara bersatu dari semua negara menyerang negara yang dipilih.' },
  { id: 'support', icon: Smile, label: 'Dukung Negara', desc: 'Dukungan kepada negara yang dipilih meningkatkan hubungan diplomatiknya dengan semua negara lain sebesar 10 unit.' },
  { id: 'economic', icon: Banknote, label: 'Blokade Ekonomi', desc: 'Selama periode yang dipilih, produksi pabrik dan tambang berkurang sebesar 50%.' },
  { id: 'naval', icon: Anchor, label: 'Blokade Laut', desc: 'Selama periode yang dipilih, produksi pabrik dan tambang berkurang sebesar 25%.' },
  { id: 'full', icon: Lock, label: 'Blokade Penuh', desc: 'Selama periode yang dipilih, negara ini tidak dapat menandatangani kontrak apa pun atau berdagang.' },
  { id: 'treasure', icon: Package, label: 'Bantuan Logistik', desc: 'Memberikan bantuan sumber daya dan logistik ke negara yang dipilih.' },
];

const DURATION_OPTIONS = ['1 bulan', '3 bulan', '6 bulan', '9 bulan', '1 tahun'];

const formatCountryName = (name: string) => {
  return name
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const renderFlag = (iso: string | undefined, altName: string, size: "sm" | "md" = "md") => {
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

export default function KeamananPBB({ selectedCountry }: KeamananPBBProps) {
  const [isResolusiModalOpen, setIsResolusiModalOpen] = useState(false);
  const [isMembershipOpen, setIsMembershipOpen] = useState(false);

  const [selectedType, setSelectedType] = useState<string>("military");
  const [selectedDuration, setSelectedDuration] = useState<string>("1 bulan");
  const [selectedTarget, setSelectedTarget] = useState<CountryOption | null>(null);
  
  const [isDurationOpen, setIsDurationOpen] = useState(false);
  const durationRef = useRef<HTMLDivElement>(null);

  const [isCountryModalOpen, setIsCountryModalOpen] = useState(false);
  const [activeContinent, setActiveContinent] = useState<string>("");

  // 🔥 State untuk modal daftar pendukung / penentang
  const [isSupportersModalOpen, setIsSupportersModalOpen] = useState(false);
  const [isOpponentsModalOpen, setIsOpponentsModalOpen] = useState(false);

  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [allies, setAllies] = useState<CountryOption[]>([]);

  // 🔥 Ubah voteStats menjadi array negara
  const [voteStats, setVoteStats] = useState<{ supporters: CountryOption[], opponents: CountryOption[], hasDiplomaticRelation: boolean }>({
    supporters: [],
    opponents: [],
    hasDiplomaticRelation: false
  });

  const permanentMembers = [
    { iso: 'us', name: 'Amerika Serikat' },
    { iso: 'gb', name: 'Inggris' },
    { iso: 'fr', name: 'Perancis' },
    { iso: 'ru', name: 'Rusia' },
    { iso: 'cn', name: 'China' },
  ];
  const nonPermanentMembers = [
    { iso: 'br', name: 'Brazil' },
    { iso: 'jp', name: 'Jepang' },
    { iso: 'in', name: 'India' },
    { iso: 'de', name: 'Jerman' },
    { iso: 'za', name: 'Afrika Selatan' },
    { iso: 'eg', name: 'Mesir' },
    { iso: 'mx', name: 'Meksiko' },
    { iso: 'id', name: 'Indonesia' },
    { iso: 'pl', name: 'Polandia' },
    { iso: 'au', name: 'Australia' },
  ];

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

  // 🔥 Logika voting dengan konversi angka ke array negara
  useEffect(() => {
    if (!selectedTarget || !selectedCountry || countries.length === 0) {
      setVoteStats({ supporters: [], opponents: [], hasDiplomaticRelation: false });
      return;
    }

    (async () => {
      const result = await calculateKeamananVoting(
        selectedCountry.country,
        selectedTarget.name,
        countries
      ) ?? { supporters: 0, opponents: 0, hasDiplomaticRelation: false };

      let supportersList: CountryOption[] = [];
      let opponentsList: CountryOption[] = [];

      // Jika result.supporters berupa angka, gunakan logika aliansi
      if (typeof result.supporters === 'number') {
        const isTargetAlly = allies.some(ally => ally.id === selectedTarget.id);
        if (isTargetAlly) {
          // Target adalah teman: negara lain (bukan teman) mendukung, teman menolak
          supportersList = countries.filter(c => !allies.some(ally => ally.id === c.id) && c.id !== selectedTarget.id);
          opponentsList = allies.filter(c => c.id !== selectedTarget.id);
        } else {
          // Target bukan teman: teman mendukung, negara lain menolak
          supportersList = allies;
          opponentsList = countries.filter(c => !allies.some(ally => ally.id === c.id) && c.id !== selectedTarget.id);
        }
      } else {
        // Jika sudah berupa array (fallback)
        supportersList = Array.isArray(result.supporters) ? result.supporters : [];
        opponentsList = Array.isArray(result.opponents) ? result.opponents : [];
      }

      setVoteStats({
        supporters: supportersList,
        opponents: opponentsList,
        hasDiplomaticRelation: result.hasDiplomaticRelation || false
      });
    })();
  }, [selectedTarget, selectedCountry, countries, allies]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (durationRef.current && !durationRef.current.contains(event.target as Node)) setIsDurationOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 🔥 Scroll Lock (termasuk modal baru)
  useEffect(() => {
    const isAnyModalOpen = isResolusiModalOpen || isCountryModalOpen || isSupportersModalOpen || isOpponentsModalOpen;
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
  }, [isResolusiModalOpen, isCountryModalOpen, isSupportersModalOpen, isOpponentsModalOpen]);

  const handleSubmit = () => {
    if (!selectedTarget) {
      alert("Silakan pilih negara target terlebih dahulu!");
      return;
    }
    const activeAction = RESOLUTION_ACTIONS.find(a => a.id === selectedType);
    alert(`Resolusi berhasil diajukan ke Dewan Keamanan!\n\nJenis: ${activeAction?.label}\nDurasi: ${selectedDuration}\nTarget: ${selectedTarget.name}\nPrakiraan Suara: ${voteStats.supporters.length} Setuju, ${voteStats.opponents.length} Menentang.`);
    
    setIsResolusiModalOpen(false);
    setSelectedTarget(null);
  };

  // 🔥 Komponen modal daftar negara (DIUBAH MENJADI FULL WIDTH & 2 KOLOM)
  const CountryListModal = ({ 
    isOpen, 
    onClose, 
    title, 
    countries: countryList 
  }: { 
    isOpen: boolean; 
    onClose: () => void; 
    title: string; 
    countries: CountryOption[] 
  }) => {
    if (!isOpen) return null;
    return (
      <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-transparent pointer-events-none">
        <div className="bg-[#FAF6EE] border-4 border-[#C4B49C] rounded-2xl w-full max-w-6xl h-[84vh] overflow-hidden shadow-2xl flex flex-col relative pointer-events-auto animate-in fade-in zoom-in-95 duration-150">
          <div className="px-8 py-6 border-b-2 border-[#C4B49C]/30 flex items-center justify-between bg-[#FAF6EE] relative z-10 shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600/10 rounded-xl border border-blue-600/20">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-[#5c3c10] uppercase tracking-tight">{title}</h3>
                <p className="text-xs text-[#8b7e66] font-bold mt-0.5">
                  {countryList.length} negara terdaftar
                </p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="p-2.5 rounded-xl border-2 border-[#C4B49C] bg-transparent text-[#8b7e66] hover:text-[#5c3c10] hover:bg-black/5 active:bg-black/10 transition-all cursor-pointer font-black text-xs uppercase flex items-center gap-1.5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]"
            >
              <span className="text-[10px] font-black uppercase tracking-widest pl-1">Tutup</span>
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-8 bg-[#FAF6EE]/40 relative z-10 no-scrollbar flex flex-col items-center">
            <div className="w-full">
              {countryList.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-[#8b7e66] font-bold text-lg">Belum ada negara dalam daftar ini.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
                  {countryList.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center gap-4 p-3 rounded-xl border-2 border-[#C4B49C]/30 bg-white hover:border-[#5c3c10] transition-all w-full"
                    >
                      {renderFlag(c.iso, c.name)}
                      <span className="text-sm font-bold text-[#5c3c10]">
                        {c.name}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center justify-end gap-4 px-8 py-6 border-t-2 border-[#C4B49C]/30 bg-[#FAF6EE] relative z-10 shrink-0">
            <button 
              onClick={onClose} 
              className="px-8 py-3 rounded-xl border-2 border-[#C4B49C] bg-transparent text-[#8b7e66] hover:text-[#5c3c10] hover:bg-black/5 transition-all font-black text-xs uppercase tracking-wider cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 w-full">
      
      {/* Keanggotaan Dewan Keamanan */}
      <div className="bg-white/70 border border-[#C4B49C]/30 rounded-xl shadow-sm overflow-hidden">
        <button onClick={() => setIsMembershipOpen(!isMembershipOpen)} className="w-full flex items-center justify-between px-6 py-4 bg-[#FAF6EE]/80 border-b border-[#C4B49C]/30 cursor-pointer hover:bg-[#e4dac3]/40 transition-colors">
          <div className="flex items-center gap-3"><Shield className="h-5 w-5 text-[#5c3c10]" /><h4 className="text-sm font-black text-[#5c3c10] uppercase">Keanggotaan Dewan Keamanan PBB</h4><div className="flex gap-2 ml-2"><span className="text-[10px] font-bold bg-amber-600/10 text-amber-700 px-2 py-1 rounded-lg border border-amber-600/20">5 Tetap</span><span className="text-[10px] font-bold bg-blue-600/10 text-blue-700 px-2 py-1 rounded-lg border border-blue-600/20">10 Tidak Tetap</span></div></div>
          <ChevronDown className={`h-5 w-5 text-[#5c3c10] transition-transform duration-500 ease-in-out ${isMembershipOpen ? 'rotate-180' : 'rotate-0'}`} />
        </button>
        <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isMembershipOpen ? 'max-h-[1500px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="p-6 bg-white/70 border-t border-[#C4B49C]/20">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 bg-[#FAF6EE]/80 border border-[#C4B49C]/20 rounded-xl p-4 shadow-sm">
                <div className="flex justify-between items-center border-b border-[#C4B49C]/20 pb-2 mb-3"><span className="text-[10px] font-black text-amber-700 uppercase tracking-wider">Anggota Tetap</span><span className="text-[8px] font-black text-rose-600 bg-rose-600/10 px-2 py-0.5 rounded border border-rose-600/20">Hak Veto</span></div>
                <div className="grid grid-cols-2 gap-3">{permanentMembers.map((m) => (<div key={m.iso} className="bg-gradient-to-br from-[#fbf8ef] to-[#f2ebd7] border-2 border-[#c7ab79] p-3 rounded-lg flex flex-col items-center text-center relative shadow-sm"><div className="absolute -top-2 -right-2 bg-amber-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-lg uppercase tracking-wider shadow-sm">Veto</div>{renderFlag(m.iso, m.name)}<span className="text-[10px] font-black text-[#5c3c10] mt-1 leading-tight">{m.name}</span></div>))}</div>
              </div>
              <div className="flex-1 bg-[#FAF6EE]/80 border border-[#C4B49C]/20 rounded-xl p-4 shadow-sm">
                <div className="border-b border-[#C4B49C]/20 pb-2 mb-3"><span className="text-[10px] font-black text-blue-700 uppercase tracking-wider">Anggota Tidak Tetap</span></div>
                <div className="grid grid-cols-2 gap-3">{nonPermanentMembers.map((m) => (<div key={m.iso} className="bg-white border border-[#C4B49C]/30 p-3 rounded-lg flex flex-col items-center text-center shadow-sm hover:bg-[#e4dac3]/20 transition-colors">{renderFlag(m.iso, m.name)}<span className="text-[10px] font-bold text-[#5c3c10] mt-1 leading-tight">{m.name}</span></div>))}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* UI Utama: Halaman Kosong Elegan */}
      <div className="bg-white/70 border border-[#C4B49C]/30 p-10 rounded-xl shadow-sm flex flex-col items-center justify-center text-center space-y-4 min-h-[300px] mt-4">
        <div className="p-3 rounded-full bg-[#5c3c10]/10 border border-[#5c3c10]/20">
          <FileText className="h-8 w-8 text-[#5c3c10]" />
        </div>
        <div>
          <h3 className="text-lg font-black text-[#5c3c10] uppercase tracking-tight">Belum Ada Resolusi Aktif</h3>
          <p className="text-xs text-[#8b7e66] mt-1 max-w-md">
            Mulailah dengan mengajukan rancangan resolusi baru untuk dibahas oleh negara-negara anggota Dewan Keamanan PBB.
          </p>
        </div>
        <button
          onClick={() => setIsResolusiModalOpen(true)}
          className="mt-4 px-6 py-3 rounded-xl bg-gradient-to-b from-[#ffe07d] via-[#fcae1e] to-[#c77a00] text-[#5c3c10] border-2 border-[#1e2f3d]/15 shadow-lg shadow-[#fcae1e]/20 text-sm font-black uppercase tracking-wider flex items-center gap-2 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="h-5 w-5" />
          Buat Resolusi Baru
        </button>
      </div>

      {/* Modal Buat Resolusi (Besar) */}
      {isResolusiModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none">
          <div className="bg-[#FAF6EE] border-2 sm:border-3 border-[#C4B49C] rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative pointer-events-auto shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b-2 border-[#C4B49C]/30 flex items-center justify-between bg-[#FAF6EE] relative z-10 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600/10 rounded-xl border border-blue-600/20">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-[#5c3c10] uppercase tracking-tight">Resolusi Dewan Keamanan</h3>
                  <p className="text-xs text-[#8b7e66] font-bold mt-0.5">Pilih aksi, durasi, dan target resolusi Anda.</p>
                </div>
              </div>
              <button onClick={() => setIsResolusiModalOpen(false)} className="p-2 sm:p-2.5 rounded-xl border-2 border-[#C4B49C] bg-transparent text-[#8b7e66] hover:text-[#5c3c10] hover:bg-black/5 active:bg-black/10 transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1.5 shadow-sm">
                <span className="text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 p-8 bg-[#FAF6EE]/40 relative z-10 flex flex-col items-center justify-center overflow-y-auto custom-scrollbar pr-2">
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
                    <p className="text-[10px] font-black text-[#5c3c10] uppercase tracking-wider mb-2">Pilih negara:</p>
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
                  </div>
                </div>

                <div className="flex items-center justify-center gap-4">
                  <span className="text-sm font-bold text-[#8b7e66]">Durasi pemungutan suara:</span>
                  <div className="flex items-center gap-2"><span className="text-sm font-bold text-[#5c3c10]">30 h.</span><Clock className="w-4 h-4 text-[#8b7e66]" /></div>
                </div>

                {/* 🔥 Kotak Perkiraan Suara - DITAMBAHKAN LOGIKA NON-AKTIF JIKA 0 */}
                <div className="p-6 rounded-2xl bg-[#e4dac3]/30 border-2 border-[#C4B49C]/50 shadow-inner">
                  <p className="text-center text-[11px] font-black text-[#8b7e66] uppercase tracking-wider mb-4">Perkiraan Jumlah Suara</p>
                  <div className="flex justify-between items-center px-4 max-w-sm mx-auto gap-3">
                    
                    {/* Tombol Setuju - Tidak bisa diklik jika 0 */}
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

                    {/* Tombol Menentang - Tidak bisa diklik jika 0 */}
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
              <button onClick={() => setIsResolusiModalOpen(false)} className="px-8 py-3 rounded-xl border-2 border-[#C4B49C] bg-transparent text-[#8b7e66] hover:text-[#5c3c10] hover:bg-black/5 transition-all font-black text-xs uppercase tracking-wider cursor-pointer">Batal</button>
              <button onClick={handleSubmit} className="px-8 py-3 rounded-xl bg-[#367d7a] text-white font-black text-xs uppercase tracking-wider shadow-md hover:brightness-110 active:scale-95 transition-all cursor-pointer">Tambahkan</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Pilih Negara (Besar) */}
      {isCountryModalOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-transparent pointer-events-none">
          <div className="bg-[#FAF6EE] border-4 border-[#C4B49C] rounded-2xl w-full max-w-6xl h-[84vh] overflow-hidden shadow-2xl flex flex-col relative pointer-events-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="px-8 py-6 border-b-2 border-[#C4B49C]/30 flex items-center justify-between bg-[#FAF6EE] relative z-10 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600/10 rounded-xl border border-blue-600/20">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-[#5c3c10] uppercase tracking-tight">Pilih Negara Target</h3>
                  <p className="text-xs text-[#8b7e66] font-bold mt-0.5">Pilih benua, lalu pilih negara target Anda.</p>
                </div>
              </div>
              <button onClick={() => setIsCountryModalOpen(false)} className="p-2.5 rounded-xl border-2 border-[#C4B49C] bg-transparent text-[#8b7e66] hover:text-[#5c3c10] hover:bg-black/5 active:bg-black/10 transition-all cursor-pointer font-black text-xs uppercase flex items-center gap-1.5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]">
                <span className="text-[10px] font-black uppercase tracking-widest pl-1">Tutup</span>
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 bg-[#FAF6EE]/40 relative z-10 no-scrollbar flex flex-col items-center">
              <div className="w-full max-w-5xl">
                <div className="flex flex-wrap justify-center gap-3 mb-8">
                  {Object.keys(groupedCountries).map((continent) => (
                    <button
                      key={continent}
                      onClick={() => setActiveContinent(continent)}
                      className={`px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                        activeContinent === continent ? 'bg-[#5c3c10] text-[#FAF6EE] shadow-md' : 'bg-white/80 border border-[#C4B49C]/30 text-[#8b7e66] hover:bg-[#e4dac3]/40 hover:border-[#5c3c10]'
                      }`}
                    >
                      {continent} ({groupedCountries[continent].length})
                    </button>
                  ))}
                </div>
                {activeContinent && groupedCountries[activeContinent] && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {groupedCountries[activeContinent].filter(c => c.id !== selectedCountry?.id).map((c) => {
                      const isSelected = selectedTarget?.id === c.id;
                      return (
                        <button
                          key={c.id}
                          // 🔥 PERBAIKAN UNTUK TOGGLE / UNSELECT: Cek apakah ID sama, jika sama set null
                          onClick={() => { setSelectedTarget(prev => prev?.id === c.id ? null : c); setIsCountryModalOpen(false); }}
                          className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all cursor-pointer ${isSelected ? 'bg-[#367d7a]/10 border-[#367d7a] text-[#367d7a] shadow-sm' : 'bg-white border-[#C4B49C]/30 hover:border-[#5c3c10]'}`}
                        >
                          {renderFlag(c.iso, c.name)}
                          <span className={`text-[10px] font-bold mt-2 text-center leading-tight ${isSelected ? 'text-[#367d7a]' : 'text-[#5c3c10]'}`}>{c.name}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center justify-end gap-4 px-8 py-6 border-t-2 border-[#C4B49C]/30 bg-[#FAF6EE] relative z-10 shrink-0">
              <button onClick={() => setIsCountryModalOpen(false)} className="px-8 py-3 rounded-xl border-2 border-[#C4B49C] bg-transparent text-[#8b7e66] hover:text-[#5c3c10] hover:bg-black/5 transition-all font-black text-xs uppercase tracking-wider cursor-pointer">Tutup</button>
            </div>
          </div>
        </div>
      )}

      {/* 🔥 Modal Daftar Negara Setuju & Menentang - SEKARANG FULL WIDTH & 2 KOLOM */}
      <CountryListModal
        isOpen={isSupportersModalOpen}
        onClose={() => setIsSupportersModalOpen(false)}
        title="Negara yang Mendukung"
        countries={voteStats.supporters}
      />
      <CountryListModal
        isOpen={isOpponentsModalOpen}
        onClose={() => setIsOpponentsModalOpen(false)}
        title="Negara yang Menentang"
        countries={voteStats.opponents}
      />

    </div>
  );
}