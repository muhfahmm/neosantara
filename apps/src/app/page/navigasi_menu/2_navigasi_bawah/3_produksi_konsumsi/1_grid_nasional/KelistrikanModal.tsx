"use client";
import React, { useState, useEffect } from "react";
import {
  X,
  Zap,
  BatteryCharging,
  MapPin,
  TrendingUp,
  TrendingDown,
  Search,
  ArrowUpDown,
  ChevronUp,
  ChevronDown
} from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  countryDetail: any;
  setCountryDetail: (detail: any) => void;
  metadata: any;
  prefetchedAllCountries?: any[];
}

interface SortConfig {
  key: 'name' | 'production' | 'consumption' | 'balance';
  direction: 'asc' | 'desc';
}

const SOURCE_ORDER = [
  "pembangkit_listrik_tenaga_nuklir",
  "pembangkit_listrik_tenaga_air",
  "pembangkit_listrik_tenaga_surya",
  "pembangkit_listrik_tenaga_uap",
  "pembangkit_listrik_tenaga_gas",
  "pembangkit_listrik_tenaga_angin"
];

export default function KelistrikanModal({ isOpen, onClose, countryDetail, setCountryDetail, metadata, prefetchedAllCountries }: ModalProps) {
  const [activeTab, setActiveTab] = useState<"user" | "global">("user");
  const [allCountries, setAllCountries] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'production', direction: 'desc' });

  useEffect(() => {
    if (isOpen && allCountries.length === 0) {
      if (prefetchedAllCountries && prefetchedAllCountries.length > 0) {
        setAllCountries(prefetchedAllCountries);
        return;
      }
      (async () => {
        try {
          const res = await fetch('/api/country-data?all=true', { cache: 'no-store' });
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setAllCountries(data);
          }
        } catch (error) {
          console.error('Error fetching all countries data:', error);
        }
      })();
    }
  }, [isOpen, prefetchedAllCountries]);

  if (!isOpen) return null;

  const findMeta = (key: string) => {
    if (!metadata) return undefined;
    if (metadata[key]) return metadata[key];
    for (const k of Object.keys(metadata)) {
      const entry = metadata[k];
      if (!entry) continue;
      if (entry.dataKey === key) return entry;
      if (k.endsWith(`_${key}`) || k === `1_${key}`) return entry;
    }
    return undefined;
  };

  const anggaran = countryDetail?.anggaran || 0;

  const powerSources = SOURCE_ORDER
    .map((key) => {
      const bMeta = findMeta(key);
      const count = Number(countryDetail?.[key]) || 0;
      const unitProduction = Number(bMeta?.produksi) || 0;
      return {
        key,
        label: bMeta?.label || key.replace(/_/g, " ").replace(/\b\w/g, (ch) => ch.toUpperCase()),
        desc: bMeta?.desc || "Sumber energi listrik nasional.",
        value: count,
        unitProduction: unitProduction,
      };
    })
    .filter((source) => source.value > 0 || source.unitProduction > 0);

  const totalCapacityMW = powerSources.reduce((sum, source) => sum + (source.value * source.unitProduction), 0);
  const totalSources = powerSources.filter((source) => source.value > 0).length;

  const calculateBuildingElectricityConsumption = (country: any) => {
    if (!metadata || !country) return 0;
    let totalBuildingConsumption = 0;
    Object.keys(metadata).forEach((key) => {
      const bMeta = metadata[key];
      const konsumsi = Number(bMeta?.konsumsi_listrik) || 0;
      if (konsumsi <= 0) return;
      const possibleKeys = [
        key,
        bMeta?.dataKey,
        key.replace(/^\d+_/, ''),
        bMeta?.dataKey ? bMeta.dataKey.replace(/^\d+_/, '') : undefined,
      ].filter(Boolean) as string[];
      let count = 0;
      for (const pKey of possibleKeys) {
        if (country[pKey] !== undefined && country[pKey] !== null) {
          count = Number(country[pKey]) || 0;
          break;
        }
      }
      if (count > 0) {
        totalBuildingConsumption += count * konsumsi;
      }
    });
    return totalBuildingConsumption;
  };

  const userBuildingConsumption = calculateBuildingElectricityConsumption(countryDetail);
  const populationDemand = 0;
  const estimatedConsumptionMW = Math.max(0, Math.round(userBuildingConsumption + populationDemand));
  const balanceMW = totalCapacityMW - estimatedConsumptionMW;

  // --- HITUNG INDEKS KEPUASAN LISTRIK ---
  const electricitySatisfaction = (() => {
    const production = totalCapacityMW;
    const consumption = estimatedConsumptionMW;
    if (consumption <= 0) return 50; // default jika tidak ada data
    const ratio = Math.min(production / consumption, 2); // batasi maks 2
    let score = (ratio / 2) * 100; // petakan 0..2 ke 0..100
    score = Math.min(100, Math.max(1, Math.round(score)));
    return score;
  })();

  // Simpan indeks ke countryDetail
  useEffect(() => {
    if (setCountryDetail && countryDetail) {
      setCountryDetail({
        ...countryDetail,
        satisfaction: {
          ...(countryDetail?.satisfaction || {}),
          electricity: electricitySatisfaction,
        }
      });
    }
  }, [electricitySatisfaction]);

  // --- Logika global (sama) ---
  const calculateCountryElectricity = (country: any) => {
    const totalProduction = SOURCE_ORDER.reduce((sum, key) => {
      const bMeta = findMeta(key);
      const count = Number(country?.[key]) || 0;
      const unitProduction = Number(bMeta?.produksi) || 0;
      const result = sum + (count * unitProduction);
      return isNaN(result) ? sum : result;
    }, 0);

    const buildingConsumption = calculateBuildingElectricityConsumption(country);
    const population = Number(country?.jumlah_penduduk) || 0;
    const populationDemand = 0;
    const totalConsumptionCalc = buildingConsumption > 0
      ? buildingConsumption + populationDemand
      : (totalProduction * 0.7) + populationDemand;
    const consumption = Math.max(0, Math.round(totalConsumptionCalc));
    const balance = totalProduction - consumption;

    return {
      totalProduction: isNaN(totalProduction) ? 0 : totalProduction,
      consumption: isNaN(consumption) ? 0 : consumption,
      balance: isNaN(balance) ? 0 : balance,
    };
  };

  const userCountryName = (countryDetail?.name_id || countryDetail?.nama || countryDetail?.country || countryDetail?.name_en || '').toLowerCase().trim();

  const globalElectricityData = allCountries
    .map((country, index) => {
      const { totalProduction, consumption, balance } = calculateCountryElectricity(country);
      let rawName = country?.name_id || country?.name_en || country?.nama || country?.country;
      if (!rawName && country?.__fileName) {
        rawName = country.__fileName
          .replace(/^\d+_/, '')
          .replace(/\.(ts|js|json)$/i, '')
          .replace(/_/g, ' ')
          .replace(/\b\w/g, (char: string) => char.toUpperCase());
      }
      const countryName = rawName || 'Unknown';
      const isUser = Boolean(
        userCountryName && (
          countryName.toLowerCase().trim() === userCountryName ||
          (country?.name_id && country.name_id.toLowerCase().trim() === userCountryName) ||
          (country?.name_en && country.name_en.toLowerCase().trim() === userCountryName) ||
          (country?.country && country.country.toLowerCase().trim() === userCountryName)
        )
      );
      return {
        index: index + 1,
        name: countryName,
        production: totalProduction,
        consumption,
        balance,
        isUser,
      };
    })
    .sort((a, b) => b.production - a.production);

  let sortedData = [...globalElectricityData].sort((a, b) => {
    let aVal: any, bVal: any;
    switch (sortConfig.key) {
      case 'name': aVal = a.name.toLowerCase(); bVal = b.name.toLowerCase(); break;
      case 'production': aVal = a.production; bVal = b.production; break;
      case 'consumption': aVal = a.consumption; bVal = b.consumption; break;
      case 'balance': aVal = a.balance; bVal = b.balance; break;
      default: return 0;
    }
    if (sortConfig.direction === 'asc') return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
    else return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
  });

  const filteredData = searchQuery.trim() === ''
    ? sortedData
    : sortedData.filter(country =>
        country.name.toLowerCase().includes(searchQuery.toLowerCase())
      );

  const handleSort = (column: SortConfig['key']) => {
    if (sortConfig.key === column) {
      setSortConfig({
        key: column,
        direction: sortConfig.direction === 'asc' ? 'desc' : 'asc'
      });
    } else {
      setSortConfig({
        key: column,
        direction: 'desc'
      });
    }
  };

  const SortIndicator = ({ column }: { column: SortConfig['key'] }) => {
    if (sortConfig.key !== column) {
      return <span className="text-[#8b7e66]/30 ml-1 text-xs">⇅</span>;
    }
    if (sortConfig.direction === 'asc') {
      return <ChevronUp className="h-3 w-3 ml-1 inline text-emerald-700" />;
    }
    return <ChevronDown className="h-3 w-3 ml-1 inline text-emerald-700" />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none">
      <div className="bg-[#0F2424]/90 backdrop-blur-md border border-[#00FFAA]/30 rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans pointer-events-auto">

        {/* HEADER */}
        <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-[#00FFAA]/20 flex items-center justify-between bg-[#0A1A1A] relative z-10 gap-2 shrink-0 rounded-t-2xl">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1 sm:p-1.5 bg-[#0F2424] rounded-lg border border-[#00FFAA]/30 shrink-0">
              <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-[#00FFAA]" />
            </div>
            <div>
              <h2 className="text-base sm:text-xl font-bold text-[#00FFAA] tracking-tight leading-none uppercase">Grid Kelistrikan Nasional</h2>
            </div>
          </div>

            <div className="hidden sm:flex items-center gap-2.5 lg:gap-4 ml-4 lg:ml-8 pl-4 lg:pl-8 border-l border-[#00FFAA]/20">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-2.5 lg:px-3 py-1 lg:py-1.5 bg-[#0F2424] border border-[#00FFAA]/30 rounded-lg">
                  <TrendingUp className="h-3.5 w-3.5 lg:h-4 lg:w-4 text-[#00FFAA]" />
                  <span className="text-[9px] lg:text-[11px] font-black text-[#00FFAA] uppercase tracking-wider">Produksi</span>
                  <span className="text-[9px] lg:text-[11px] font-black text-[#00FFAA]">{totalCapacityMW > 0 ? totalCapacityMW.toLocaleString('id-ID') : '0'} MW</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-2.5 lg:px-3 py-1 lg:py-1.5 bg-[#0F2424] border border-rose-500/30 rounded-lg">
                  <TrendingDown className="h-3.5 w-3.5 lg:h-4 lg:w-4 text-rose-400" />
                  <span className="text-[9px] lg:text-[11px] font-black text-rose-400 uppercase tracking-wider">Konsumsi</span>
                  <span className="text-[9px] lg:text-[11px] font-black text-rose-400">{estimatedConsumptionMW > 0 ? estimatedConsumptionMW.toLocaleString('id-ID') : '0'} MW</span>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 lg:p-2 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] text-[#6B8A8A] hover:text-[#00FFAA] hover:border-[#00FFAA] transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1 shadow-sm">
              <span className="text-[10px] lg:text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
              <X className="h-4 w-4" />
            </button>
          </div>

        {/* BODY */}
        <div className="flex-1 min-h-0 overflow-y-auto p-3.5 lg:p-5 2xl:p-8 bg-[#0A1A1A]/80 relative z-10 custom-scrollbar">

          {/* TAB NAVIGASI */}
          <div className="bg-[#0A1A1A] p-1 rounded-xl border border-[#00FFAA]/30 inline-flex mb-3.5 lg:mb-5 2xl:mb-6">
            <button
              onClick={() => setActiveTab("user")}
              className={`px-3.5 lg:px-4.5 2xl:px-6 py-1.5 lg:py-2 2xl:py-2.5 rounded-lg text-[10px] lg:text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${
                activeTab === "user" ? "bg-[#00FFAA] text-[#0A1A1A]" : "text-[#6B8A8A] hover:text-[#E0E0E0]"
              }`}
            >
              Neraca User
            </button>
            <button
              onClick={() => setActiveTab("global")}
              className={`px-3.5 lg:px-4.5 2xl:px-6 py-1.5 lg:py-2 2xl:py-2.5 rounded-lg text-[10px] lg:text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${
                activeTab === "global" ? "bg-[#00FFAA] text-[#0A1A1A]" : "text-[#6B8A8A] hover:text-[#E0E0E0]"
              }`}
            >
              Neraca {allCountries.length || 207} Negara
            </button>
          </div>

          {/* TAB NERACA USER */}
          {activeTab === "user" && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-[1.25fr_0.95fr] gap-3 lg:gap-4">
                {/* KOLOM KIRI: STATISTIK GRID */}
                <div className="bg-[#0A1A1A] border border-[#00FFAA]/20 p-3 lg:p-3.5 2xl:p-4 rounded-xl 2xl:rounded-2xl">
                  <div className="flex items-center gap-2.5 lg:gap-3 mb-2.5 lg:mb-3">
                    <div className="p-2 lg:p-2.5 2xl:p-3 rounded-xl 2xl:rounded-2xl bg-[#00FFAA]/10 text-[#00FFAA] border border-[#00FFAA]/30">
                      <BatteryCharging className="h-4 w-4 lg:h-5 lg:w-5" />
                    </div>
                    <div>
                      <h3 className="text-xs lg:text-sm 2xl:text-base font-black text-[#00FFAA] uppercase tracking-wide">Statistik Grid</h3>
                      <p className="text-[9px] lg:text-[10px] text-[#6B8A8A] uppercase tracking-wider">Ringkasan kapasitas dan beban listrik nasional</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-2.5 lg:gap-3">
                    <div className="bg-emerald-950/40 border border-emerald-500/30 p-2.5 lg:p-3 rounded-xl 2xl:rounded-2xl">
                      <p className="text-[8px] lg:text-[9px] 2xl:text-[10px] font-black uppercase tracking-widest text-emerald-400">✓ Total Produksi Listrik</p>
                      <p className="text-lg lg:text-xl 2xl:text-2xl font-black text-emerald-400 mt-1.5 lg:mt-2 2xl:mt-3">{totalCapacityMW.toLocaleString('id-ID')} MW</p>
                    </div>
                    <div className="bg-rose-950/40 border border-rose-500/30 p-2.5 lg:p-3 rounded-xl 2xl:rounded-2xl">
                      <p className="text-[8px] lg:text-[9px] 2xl:text-[10px] font-black uppercase tracking-widest text-rose-400">✗ Konsumsi Terestimasi</p>
                      <p className="text-lg lg:text-xl 2xl:text-2xl font-black text-rose-400 mt-1.5 lg:mt-2 2xl:mt-3">{estimatedConsumptionMW.toLocaleString('id-ID')} MW</p>
                    </div>
                    <div className={`p-2.5 lg:p-3 rounded-xl 2xl:rounded-2xl border ${balanceMW >= 0 ? 'bg-emerald-950/40 border-emerald-500/30' : 'bg-rose-950/40 border-rose-500/30'}`}>
                      <p className={`text-[8px] lg:text-[9px] 2xl:text-[10px] font-black uppercase tracking-widest ${balanceMW >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>Neraca Daya</p>
                      <p className={`text-lg lg:text-xl 2xl:text-2xl font-black mt-1.5 lg:mt-2 2xl:mt-3 ${balanceMW >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {balanceMW >= 0 ? '+' : '-'}{Math.abs(balanceMW).toLocaleString('id-ID')} MW
                      </p>
                    </div>
                    <div className="bg-[#0F2424] border border-[#00FFAA]/20 p-3 rounded-2xl">
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#6B8A8A]">Kas Anggaran Negara</p>
                      <p className="text-2xl font-black text-[#00FFAA] mt-3">{anggaran.toLocaleString('id-ID')}</p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-[#0F2424] border border-[#00FFAA]/20 p-3 rounded-2xl">
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#6B8A8A]">Jumlah Sumber Energi Aktif</p>
                      <p className="text-lg font-black text-[#E0E0E0] mt-2">{totalSources}</p>
                    </div>
                    <div className="bg-[#0F2424] border border-[#00FFAA]/20 p-3 rounded-2xl">
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#6B8A8A]">Perkiraan Beban Warga</p>
                      <p className="text-lg font-black text-[#E0E0E0] mt-2">{((countryDetail?.jumlah_penduduk ?? 0) / 1000000).toFixed(1)} Juta Jiwa</p>
                    </div>
                  </div>
                </div>

                {/* KOLOM KANAN: RINGKASAN SUMBER DAYA */}
                <div className="bg-[#0A1A1A] border border-[#00FFAA]/20 p-6 rounded-2xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-2xl bg-[#00FFAA]/10 text-[#00FFAA] border border-[#00FFAA]/30">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-[#00FFAA] uppercase tracking-wide">Ringkasan Sumber Daya</h3>
                      <p className="text-[10px] text-[#6B8A8A] uppercase tracking-wider">Detail berdasarkan data metadata</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {powerSources.length > 0 ? powerSources.map((source) => (
                      <div key={source.key} className="flex items-center justify-between gap-3 p-4 bg-[#0F2424] border border-[#00FFAA]/20 rounded-2xl">
                        <div>
                          <p className="text-sm font-black text-[#E0E0E0] uppercase tracking-wide">{source.label}</p>
                          <p className="text-[10px] text-[#6B8A8A]">{source.desc}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-black text-[#00FFAA]">{(source.value * source.unitProduction).toLocaleString('id-ID')} MW</p>
                          <p className="text-[10px] text-[#6B8A8A]">{source.value > 0 ? `${source.value} unit` : 'Tidak tersedia'}</p>
                        </div>
                      </div>
                    )) : (
                      <div className="rounded-2xl border border-[#00FFAA]/20 bg-[#0F2424] p-4 text-sm text-[#6B8A8A]">
                        Data pembangkit listrik tidak tersedia.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* INDEKS KEPUASAN LISTRIK */}
              <div className="mt-6 p-5 rounded-xl border border-[#00FFAA]/30 bg-[#0A1A1A]">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-black text-[#00FFAA] uppercase tracking-widest">
                    Indeks Kepuasan Rakyat (Listrik)
                  </span>
                  <span className="text-3xl font-black text-[#00FFAA]">
                    {electricitySatisfaction} / 100
                  </span>
                </div>
                <div className="w-full h-3 bg-[#0F2424] rounded-full mt-3 overflow-hidden border border-[#00FFAA]/20">
                  <div
                    className="h-full rounded-full bg-[#00FFAA] transition-all duration-200"
                    style={{ width: `${electricitySatisfaction}%` }}
                  />
                </div>
                <p className="text-[10px] text-[#00FFAA] font-bold mt-3">
                  {electricitySatisfaction >= 80
                    ? "✅ Produksi listrik mencukupi, hampir tidak ada pemadaman."
                    : electricitySatisfaction >= 50
                    ? "⚠️ Kebutuhan listrik terpenuhi namun masih rawan defisit."
                    : "🔴 Defisit listrik parah, sering terjadi pemadaman bergilir."}
                </p>
                <div className="mt-2 grid grid-cols-2 gap-2 text-[10px] text-[#6B8A8A]">
                  <div>Rasio produksi/konsumsi: <span className="font-bold text-[#00FFAA]">
                    {estimatedConsumptionMW > 0 ? (totalCapacityMW / estimatedConsumptionMW).toFixed(2) : 'N/A'}
                  </span></div>
                  <div>Neraca daya: <span className={`font-bold ${balanceMW >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {balanceMW >= 0 ? '+' : '-'}{Math.abs(balanceMW).toLocaleString('id-ID')} MW
                  </span></div>
                </div>
              </div>
            </>
          )}

          {/* TAB NERACA GLOBAL */}
          {activeTab === "global" && (
            <div className="bg-[#0A1A1A] border border-[#00FFAA]/20 p-6 rounded-2xl w-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-2xl bg-[#00FFAA]/10 text-[#00FFAA] border border-[#00FFAA]/30">
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#00FFAA] uppercase tracking-wide">Neraca {allCountries.length || 207} Negara</h3>
                  <p className="text-[10px] text-[#6B8A8A] uppercase tracking-wider">Data produksi, konsumsi, dan neraca daya listrik global</p>
                </div>
              </div>

              <div className="mb-4 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-[#6B8A8A] pointer-events-none" />
                <input
                  type="text"
                  placeholder="Cari nama negara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#00FFAA]/30 bg-[#0F2424] text-[#E0E0E0] placeholder-[#6B8A8A] focus:outline-none focus:border-[#00FFAA] transition-all font-semibold text-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-3 text-[#6B8A8A] hover:text-[#00FFAA] transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="overflow-x-auto border border-[#00FFAA]/20 rounded-xl bg-[#0F2424] max-h-[60vh] overflow-y-auto no-scrollbar">
                <table className="w-full text-xs">
                  <thead className="bg-[#0A1A1A] border-b border-[#00FFAA]/20 sticky top-0 text-[10px] sm:text-xs">
                    <tr>
                      <th className="px-2.5 sm:px-3 py-2 text-left font-black text-[#00FFAA] uppercase tracking-wider">No</th>
                      <th
                        onClick={() => handleSort('name')}
                        className="px-2.5 sm:px-3 py-2 text-left font-black text-[#00FFAA] uppercase tracking-wider cursor-pointer hover:bg-[#00FFAA]/10 transition-colors"
                      >
                        Negara <SortIndicator column="name" />
                      </th>
                      <th
                        onClick={() => handleSort('production')}
                        className="px-2.5 sm:px-3 py-2 text-right font-black text-emerald-400 uppercase tracking-wider cursor-pointer hover:bg-emerald-950/40 transition-colors"
                      >
                        Produksi (MW) <SortIndicator column="production" />
                      </th>
                      <th
                        onClick={() => handleSort('consumption')}
                        className="px-2.5 sm:px-3 py-2 text-right font-black text-rose-400 uppercase tracking-wider cursor-pointer hover:bg-rose-950/40 transition-colors"
                      >
                        Konsumsi (MW) <SortIndicator column="consumption" />
                      </th>
                      <th
                        onClick={() => handleSort('balance')}
                        className="px-2.5 sm:px-3 py-2 text-right font-black text-[#00FFAA] uppercase tracking-wider cursor-pointer hover:bg-[#00FFAA]/10 transition-colors"
                      >
                        Neraca Daya <SortIndicator column="balance" />
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#00FFAA]/10 bg-[#0F2424]">
                    {allCountries.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-6 text-center text-xs font-bold text-[#6B8A8A]">
                          📡 Memuat data {globalElectricityData.length || 207} negara...
                        </td>
                      </tr>
                    ) : filteredData.length > 0 ? (
                      filteredData.map((country, rowIndex) => {
                        const isUserCountry = country.isUser;
                        return (
                          <tr
                            key={`country-${country.index}-${rowIndex}`}
                            className={`transition-colors hover:bg-[#00FFAA]/5 ${
                              isUserCountry
                                ? 'bg-emerald-950/50 font-black border-l-4 border-l-emerald-400'
                                : 'bg-[#0F2424]'
                            }`}
                          >
                            <td className={`px-4 py-3 font-bold ${isUserCountry ? 'text-emerald-400 font-black' : 'text-[#6B8A8A]'}`}>
                              {country.index}
                            </td>
                            <td className={`px-4 py-3 font-bold ${isUserCountry ? 'text-emerald-400 font-black flex items-center gap-2' : 'text-[#E0E0E0]'}`}>
                              <span>{country.name}</span>
                              {isUserCountry && (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-[#0A1A1A] text-[9px] font-black uppercase tracking-wider">
                                  Negara Anda
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 font-bold text-emerald-400 text-right">
                              {isNaN(country.production) || country.production <= 0 ? '0' : country.production.toLocaleString('id-ID')}
                            </td>
                            <td className="px-4 py-3 font-bold text-rose-400 text-right">
                              {isNaN(country.consumption) || country.consumption <= 0 ? '0' : country.consumption.toLocaleString('id-ID')}
                            </td>
                            <td className={`px-4 py-3 font-black text-right ${country.balance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {isNaN(country.balance) ? '0' : (country.balance >= 0 ? '+' : '-') + Math.abs(country.balance).toLocaleString('id-ID')}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-4 py-6 text-center text-xs font-bold text-[#6B8A8A]">
                          {searchQuery ? `Tidak ada negara yang cocok dengan "${searchQuery}"` : 'Tidak ada data tersedia'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {filteredData.length > 0 && (
                <div className="mt-4 p-4 bg-[#0F2424] border border-[#00FFAA]/20 rounded-lg text-xs text-[#6B8A8A]">
                  <p className="font-bold text-[#E0E0E0]">Total: {filteredData.length} negara {searchQuery && `(difilter dari ${globalElectricityData.length})`}</p>
                  <p className="mt-1">Produksi: <span className="font-black text-emerald-400">{filteredData.reduce((sum, c) => sum + c.production, 0).toLocaleString('id-ID')} MW</span></p>
                  <p>Konsumsi: <span className="font-black text-rose-400">{filteredData.reduce((sum, c) => sum + c.consumption, 0).toLocaleString('id-ID')} MW</span></p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}