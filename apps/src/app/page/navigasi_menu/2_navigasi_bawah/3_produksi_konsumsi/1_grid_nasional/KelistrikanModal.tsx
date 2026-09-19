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
      <div className="bg-[#FAF6EE] border-2 sm:border-3 border-[#C4B49C] rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans pointer-events-auto shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,0,0,0.03)_0%,transparent_100%)] pointer-events-none" />

        {/* HEADER */}
        <div className="px-8 py-6 border-b-2 border-[#C4B49C]/30 flex items-center justify-between bg-[#FAF6EE] relative z-10">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#5c3c10]/10 rounded-xl border border-[#5c3c10]/20">
                <Zap className="h-6 w-6 text-[#5c3c10]" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[#5c3c10] tracking-tight leading-none uppercase">Grid Kelistrikan Nasional</h2>
                <p className="text-xs text-[#8b7e66]">Sinkronisasi data dengan modul produksi utama</p>
              </div>
            </div>

            <div className="flex items-center gap-4 ml-8 pl-8 border-l-2 border-[#C4B49C]/30">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-300 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-emerald-700" />
                  <span className="text-[11px] font-black text-emerald-700 uppercase tracking-wider">Produksi</span>
                  <span className="text-[11px] font-black text-emerald-700">{totalCapacityMW > 0 ? totalCapacityMW.toLocaleString('id-ID') : '0'} MW</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 border border-rose-300 rounded-lg">
                  <TrendingDown className="h-4 w-4 text-rose-700" />
                  <span className="text-[11px] font-black text-rose-700 uppercase tracking-wider">Konsumsi</span>
                  <span className="text-[11px] font-black text-rose-700">{estimatedConsumptionMW > 0 ? estimatedConsumptionMW.toLocaleString('id-ID') : '0'} MW</span>
                </div>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 sm:p-2.5 rounded-xl border-2 border-[#C4B49C] bg-transparent text-[#8b7e66] hover:text-[#5c3c10] hover:bg-black/5 active:bg-black/10 transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1.5 shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 min-h-0 overflow-y-auto p-8 bg-[#FAF6EE]/40 relative z-10 no-scrollbar">

          {/* TAB NAVIGASI */}
          <div className="bg-[#e4dac3]/40 p-1 rounded-xl border border-[#C4B49C]/40 inline-flex mb-6 shadow-sm">
            <button
              onClick={() => setActiveTab("user")}
              className={`px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${
                activeTab === "user" ? "bg-[#5c3c10] text-[#FAF6EE] shadow-md shadow-[#5c3c10]/20" : "text-[#8b7e66] hover:text-[#5c3c10]"
              }`}
            >
              Neraca User
            </button>
            <button
              onClick={() => setActiveTab("global")}
              className={`px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${
                activeTab === "global" ? "bg-[#5c3c10] text-[#FAF6EE] shadow-md shadow-[#5c3c10]/20" : "text-[#8b7e66] hover:text-[#5c3c10]"
              }`}
            >
              Neraca {allCountries.length || 207} Negara
            </button>
          </div>

          {/* TAB NERACA USER */}
          {activeTab === "user" && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-[1.25fr_0.95fr] gap-4">
                {/* KOLOM KIRI: STATISTIK GRID */}
                <div className="bg-[#e4dac3]/25 border-2 border-[#C4B49C]/40 p-4 rounded-2xl shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-3 rounded-2xl bg-[#c77a00]/10 text-[#c77a00]">
                      <BatteryCharging className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-[#5c3c10] uppercase tracking-wide">Statistik Grid</h3>
                      <p className="text-[10px] text-[#8b7e66] uppercase tracking-wider">Ringkasan kapasitas dan beban listrik nasional</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <div className="bg-emerald-50 border-2 border-emerald-300 p-3 rounded-2xl">
                      <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700">✓ Total Produksi Listrik</p>
                      <p className="text-2xl font-black text-emerald-700 mt-3">{totalCapacityMW.toLocaleString('id-ID')} MW</p>
                    </div>
                    <div className="bg-rose-50 border-2 border-rose-300 p-3 rounded-2xl">
                      <p className="text-[10px] font-black uppercase tracking-widest text-rose-700">✗ Konsumsi Terestimasi</p>
                      <p className="text-2xl font-black text-rose-700 mt-3">{estimatedConsumptionMW.toLocaleString('id-ID')} MW</p>
                    </div>
                    <div className={`p-3 rounded-2xl border-2 ${balanceMW >= 0 ? 'bg-emerald-50 border-emerald-300' : 'bg-rose-50 border-rose-300'}`}>
                      <p className={`text-[10px] font-black uppercase tracking-widest ${balanceMW >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>Neraca Daya</p>
                      <p className={`text-2xl font-black mt-3 ${balanceMW >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {balanceMW >= 0 ? '+' : '-'}{Math.abs(balanceMW).toLocaleString('id-ID')} MW
                      </p>
                    </div>
                    <div className="bg-[#FAF6EE] border-2 border-[#C4B49C]/30 p-3 rounded-2xl">
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#5c3c10]">Kas Anggaran Negara</p>
                      <p className="text-2xl font-black text-[#2e261a] mt-3">{anggaran.toLocaleString('id-ID')}</p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-[#FAF6EE] border border-[#C4B49C]/30 p-3 rounded-2xl">
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#5c3c10]">Jumlah Sumber Energi Aktif</p>
                      <p className="text-lg font-black text-[#2e261a] mt-2">{totalSources}</p>
                    </div>
                    <div className="bg-[#FAF6EE] border border-[#C4B49C]/30 p-3 rounded-2xl">
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#5c3c10]">Perkiraan Beban Warga</p>
                      <p className="text-lg font-black text-[#2e261a] mt-2">{((countryDetail?.jumlah_penduduk ?? 0) / 1000000).toFixed(1)} Juta Jiwa</p>
                    </div>
                  </div>
                </div>

                {/* KOLOM KANAN: RINGKASAN SUMBER DAYA */}
                <div className="bg-[#FAF6EE] border-2 border-[#C4B49C]/40 p-6 rounded-2xl shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-2xl bg-[#5c3c10]/10 text-[#5c3c10]">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-[#5c3c10] uppercase tracking-wide">Ringkasan Sumber Daya</h3>
                      <p className="text-[10px] text-[#8b7e66] uppercase tracking-wider">Detail berdasarkan data metadata</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {powerSources.length > 0 ? powerSources.map((source) => (
                      <div key={source.key} className="flex items-center justify-between gap-3 p-4 bg-[#FAF6EE] border border-[#C4B49C]/20 rounded-2xl">
                        <div>
                          <p className="text-sm font-black text-[#5c3c10] uppercase tracking-wide">{source.label}</p>
                          <p className="text-[10px] text-[#8b7e66]">{source.desc}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-black text-[#2e261a]">{(source.value * source.unitProduction).toLocaleString('id-ID')} MW</p>
                          <p className="text-[10px] text-[#8b7e66]">{source.value > 0 ? `${source.value} unit` : 'Tidak tersedia'}</p>
                        </div>
                      </div>
                    )) : (
                      <div className="rounded-2xl border border-[#C4B49C]/20 bg-[#FAF6EE] p-4 text-sm text-[#8b7e66]">
                        Data pembangkit listrik tidak tersedia.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 🔥 INDEKS KEPUASAN LISTRIK */}
              <div className="mt-6 p-5 rounded-xl border-3 border-[#5c3c10]/40 bg-gradient-to-r from-amber-50 to-amber-100/70 shadow-md">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-black text-[#5c3c10] uppercase tracking-widest">
                    Indeks Kepuasan Rakyat (Listrik)
                  </span>
                  <span className="text-3xl font-black text-amber-700">
                    {electricitySatisfaction} / 100
                  </span>
                </div>
                <div className="w-full h-3 bg-gray-200 rounded-full mt-3 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-600 transition-all duration-200"
                    style={{ width: `${electricitySatisfaction}%` }}
                  />
                </div>
                <p className="text-[10px] text-amber-700 font-bold mt-3">
                  {electricitySatisfaction >= 80
                    ? "✅ Produksi listrik mencukupi, hampir tidak ada pemadaman."
                    : electricitySatisfaction >= 50
                    ? "⚠️ Kebutuhan listrik terpenuhi namun masih rawan defisit."
                    : "🔴 Defisit listrik parah, sering terjadi pemadaman bergilir."}
                </p>
                <div className="mt-2 grid grid-cols-2 gap-2 text-[10px] text-amber-800/80">
                  <div>Rasio produksi/konsumsi: <span className="font-bold">
                    {estimatedConsumptionMW > 0 ? (totalCapacityMW / estimatedConsumptionMW).toFixed(2) : 'N/A'}
                  </span></div>
                  <div>Neraca daya: <span className={`font-bold ${balanceMW >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {balanceMW >= 0 ? '+' : '-'}{Math.abs(balanceMW).toLocaleString('id-ID')} MW
                  </span></div>
                </div>
              </div>
            </>
          )}

          {/* TAB NERACA GLOBAL */}
          {activeTab === "global" && (
            <div className="bg-[#FAF6EE] border-2 border-[#C4B49C]/40 p-6 rounded-2xl shadow-sm w-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-2xl bg-[#5c3c10]/10 text-[#5c3c10]">
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#5c3c10] uppercase tracking-wide">Neraca {allCountries.length || 207} Negara</h3>
                  <p className="text-[10px] text-[#8b7e66] uppercase tracking-wider">Data produksi, konsumsi, dan neraca daya listrik global</p>
                </div>
              </div>

              <div className="mb-4 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-[#8b7e66] pointer-events-none" />
                <input
                  type="text"
                  placeholder="Cari nama negara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border-2 border-[#C4B49C]/40 bg-[#FAF6EE] text-[#5c3c10] placeholder-[#8b7e66] focus:outline-none focus:border-[#5c3c10] focus:ring-2 focus:ring-[#5c3c10]/20 transition-all font-semibold text-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-3 text-[#8b7e66] hover:text-[#5c3c10] transition-colors"
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="overflow-x-auto border border-[#C4B49C]/30 rounded-xl bg-[#FAF6EE]/50 shadow-sm max-h-[60vh] overflow-y-auto">
                <table className="w-full text-xs">
                  <thead className="bg-[#5c3c10]/5 border-b-2 border-[#C4B49C]/30 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left font-black text-[#5c3c10] uppercase tracking-wider">No</th>
                      <th
                        onClick={() => handleSort('name')}
                        className="px-4 py-3 text-left font-black text-[#5c3c10] uppercase tracking-wider cursor-pointer hover:bg-[#5c3c10]/10 transition-colors"
                      >
                        Negara <SortIndicator column="name" />
                      </th>
                      <th
                        onClick={() => handleSort('production')}
                        className="px-4 py-3 text-right font-black text-emerald-700 uppercase tracking-wider cursor-pointer hover:bg-emerald-700/10 transition-colors"
                      >
                        Produksi (MW) <SortIndicator column="production" />
                      </th>
                      <th
                        onClick={() => handleSort('consumption')}
                        className="px-4 py-3 text-right font-black text-rose-700 uppercase tracking-wider cursor-pointer hover:bg-rose-700/10 transition-colors"
                      >
                        Konsumsi (MW) <SortIndicator column="consumption" />
                      </th>
                      <th
                        onClick={() => handleSort('balance')}
                        className="px-4 py-3 text-right font-black text-[#5c3c10] uppercase tracking-wider cursor-pointer hover:bg-[#5c3c10]/10 transition-colors"
                      >
                        Neraca Daya <SortIndicator column="balance" />
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#C4B49C]/20">
                    {allCountries.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-6 text-center text-xs font-bold text-[#8b7e66]">
                          📡 Memuat data {globalElectricityData.length || 207} negara...
                        </td>
                      </tr>
                    ) : filteredData.length > 0 ? (
                      filteredData.map((country, rowIndex) => {
                        const isUserCountry = country.isUser;
                        return (
                          <tr
                            key={`country-${country.index}-${rowIndex}`}
                            className={`transition-colors ${
                              isUserCountry
                                ? 'bg-emerald-100/80 hover:bg-emerald-200/80 font-black border-l-4 border-l-emerald-600'
                                : rowIndex % 2 === 0
                                ? 'bg-[#FAF6EE]'
                                : 'bg-[#e4dac3]/10 hover:bg-[#e4dac3]/20'
                            }`}
                          >
                            <td className={`px-4 py-3 font-bold ${isUserCountry ? 'text-emerald-900 font-black' : 'text-[#8b7e66]'}`}>
                              {country.index}
                            </td>
                            <td className={`px-4 py-3 font-bold ${isUserCountry ? 'text-emerald-900 font-black flex items-center gap-2' : 'text-[#5c3c10]'}`}>
                              <span>{country.name}</span>
                              {isUserCountry && (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[9px] font-black uppercase tracking-wider shadow-sm">
                                  Negara Anda
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 font-bold text-emerald-700 text-right">
                              {isNaN(country.production) || country.production <= 0 ? '0' : country.production.toLocaleString('id-ID')}
                            </td>
                            <td className="px-4 py-3 font-bold text-rose-700 text-right">
                              {isNaN(country.consumption) || country.consumption <= 0 ? '0' : country.consumption.toLocaleString('id-ID')}
                            </td>
                            <td className={`px-4 py-3 font-black text-right ${country.balance >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                              {isNaN(country.balance) ? '0' : (country.balance >= 0 ? '+' : '-') + Math.abs(country.balance).toLocaleString('id-ID')}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-4 py-6 text-center text-xs font-bold text-[#8b7e66]">
                          {searchQuery ? `Tidak ada negara yang cocok dengan "${searchQuery}"` : 'Tidak ada data tersedia'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {filteredData.length > 0 && (
                <div className="mt-4 p-4 bg-[#e4dac3]/20 border border-[#C4B49C]/30 rounded-lg text-xs text-[#8b7e66]">
                  <p className="font-bold">📊 Total: {filteredData.length} negara {searchQuery && `(difilter dari ${globalElectricityData.length})`}</p>
                  <p className="mt-1">Produksi: <span className="font-black text-emerald-700">{filteredData.reduce((sum, c) => sum + c.production, 0).toLocaleString('id-ID')} MW</span></p>
                  <p>Konsumsi: <span className="font-black text-rose-700">{filteredData.reduce((sum, c) => sum + c.consumption, 0).toLocaleString('id-ID')} MW</span></p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}