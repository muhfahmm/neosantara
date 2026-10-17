"use client"
import React, { useMemo, useState, useEffect } from "react";
import { X, Radiation, Search, Rocket, ShieldAlert } from "lucide-react";
import { getArmadaPowerSummary } from "../../../4_armada/logic/armadaLogic";

export interface DatabaseIcbmRow {
  country_id: number;
  country_slug: string;
  country_name: string;
  iso: string;
  icbm_status: boolean;
  icbm_jumlah: number;
}

interface PerangNuklirDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  countryDetail?: any; // 🔥 Tambahkan prop untuk negara user
  prefetchedAllCountries?: any[];
  onAction?: (targetCountry: any) => void;
}

type RankingRow = {
  countryName: string;
  totalPower: number;
  darat: number;
  laut: number;
  udara: number;
};

const formatNumber = (value: unknown) => {
  const numeric = Number(value ?? 0);
  return Number.isFinite(numeric) ? numeric.toLocaleString("id-ID", { maximumFractionDigits: 0 }) : "0";
};

export default function PerangNuklirDetailModal({ isOpen, onClose, countryDetail, prefetchedAllCountries, onAction }: PerangNuklirDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'ranking' | 'icbm_owners'>('ranking');
  const [searchQuery, setSearchQuery] = useState("");
  const [icbmList, setIcbmList] = useState<DatabaseIcbmRow[]>([]);
  const [isLoadingIcbm, setIsLoadingIcbm] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setIsLoadingIcbm(true);
    fetch('/api/icbm-data')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) {
          setIcbmList(data);
        }
      })
      .catch((err) => {
        console.error('Gagal mengambil data ICBM:', err);
      })
      .finally(() => {
        setIsLoadingIcbm(false);
      });
  }, [isOpen]);

  const rawRankings = useMemo(() => {
    const source = Array.isArray(prefetchedAllCountries) ? prefetchedAllCountries : [];
    const annexedStore = (typeof window !== 'undefined' ? (window as any).neosantara_annexed_countries : {}) || {};

    return source
      .filter((country: any) => {
        const countryName = country?.nama_negara || country?.country || country?.name_id || country?.name_en || "";
        const raw = String(countryName).trim();
        const norm = raw.toLowerCase();
        const clean = norm.replace(/[^a-z0-9]/g, '');
        const iso = String(country?.iso || country?.iso_code || '').toLowerCase().trim();

        if (annexedStore[raw] || annexedStore[norm] || (clean && annexedStore[clean])) return false;
        if (iso && (annexedStore[iso] || annexedStore[`iso_${iso}`])) return false;
        return true;
      })
      .map((country: any) => {
        const summary = getArmadaPowerSummary(country);
        const groupTotals = summary.totals.groups;
        const countryName = country?.nama_negara || country?.country || country?.name_id || country?.name_en || "Negara";

        return {
          countryName,
          totalPower: summary.totals.totalPower,
          darat: groupTotals?.darat?.power ?? 0,
          laut: groupTotals?.laut?.power ?? 0,
          udara: groupTotals?.udara?.power ?? 0,
        };
      });
  }, [prefetchedAllCountries]);

  const rankings = useMemo(() => {
    let sortableItems = [...rawRankings];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      sortableItems = sortableItems.filter((item) =>
        item.countryName.toLowerCase().includes(query)
      );
    }

    sortableItems.sort((a, b) => {
      if (a.totalPower !== b.totalPower) {
        return b.totalPower - a.totalPower;
      }
      return a.countryName.localeCompare(b.countryName, "id", { sensitivity: "base" });
    });
    return sortableItems;
  }, [rawRankings, searchQuery]);

  // 🔥 Filter data negara pemilik ICBM (icbm_status = true) + pencarian
  const filteredIcbmOwners = useMemo(() => {
    let list = icbmList.filter((item) => item.icbm_status === true);

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      list = list.filter((item) =>
        item.country_name.toLowerCase().includes(query) ||
        item.country_slug.toLowerCase().includes(query) ||
        item.iso.toLowerCase().includes(query)
      );
    }

    // Urutkan berdasarkan jumlah ICBM terbanyak
    return list.sort((a, b) => b.icbm_jumlah - a.icbm_jumlah);
  }, [icbmList, searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none">
      <div className="bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans pointer-events-auto shadow-2xl">
        
        {/* Header Modal */}
        <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-[#00FFAA]/30 flex flex-wrap items-center justify-between bg-[#0A1A1A] relative z-10 shrink-0 gap-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-[#0F2424] rounded-xl border border-[#00FFAA]/30">
              <Radiation className="h-4 w-4 sm:h-5 sm:w-5 text-rose-500 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base sm:text-xl font-bold text-[#00FFAA] tracking-tight leading-none uppercase">Perang Nuklir Strategis</h2>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#6B8A8A] mt-1">
                {activeTab === 'ranking'
                  ? `Ranking kekuatan militer ${rankings.length} negara`
                  : `Daftar negara berkemampuan ICBM global (${filteredIcbmOwners.length} negara)`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-1 max-w-xs justify-end">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#00FFAA]/60" />
              <input
                type="text"
                placeholder={activeTab === 'ranking' ? "Cari negara..." : "Cari negara ICBM..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0F2424] border border-[#00FFAA]/30 rounded-xl pl-8 pr-3 py-1.5 text-xs text-[#00FFAA] placeholder-[#6B8A8A] focus:outline-none focus:border-[#00FFAA] transition-all"
              />
            </div>

            <button 
              onClick={onClose} 
              className="p-1.5 lg:p-2 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] text-[#6B8A8A] hover:text-[#00FFAA] hover:border-[#00FFAA] transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1 shadow-sm shrink-0"
            >
              <span className="text-[10px] lg:text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-4 sm:px-6 pt-3 pb-2 bg-[#0A1A1A] border-b border-[#00FFAA]/20 flex items-center justify-between">
          <div className="bg-[#0F2424] p-1 rounded-xl border border-[#00FFAA]/20 inline-flex shadow-sm gap-1">
            <button
              onClick={() => setActiveTab('ranking')}
              className={`px-4 sm:px-5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'ranking'
                  ? 'bg-[#00FFAA] text-[#0A1A1A] font-black shadow-md'
                  : 'text-[#E0E0E0] hover:text-[#00FFAA]'
              }`}
            >
              <Radiation className="w-3.5 h-3.5" />
              Ranking Kekuatan Militer
            </button>
            <button
              onClick={() => setActiveTab('icbm_owners')}
              className={`px-4 sm:px-5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'icbm_owners'
                  ? 'bg-[#00FFAA] text-[#0A1A1A] font-black shadow-md'
                  : 'text-[#E0E0E0] hover:text-[#00FFAA]'
              }`}
            >
              <Rocket className="w-3.5 h-3.5 text-rose-500" />
              Negara Pemilik ICBM
              <span className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                activeTab === 'icbm_owners' ? 'bg-[#0A1A1A] text-[#00FFAA]' : 'bg-[#00FFAA]/20 text-[#00FFAA]'
              }`}>
                {filteredIcbmOwners.length}
              </span>
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 bg-[#0F2424] custom-scrollbar flex flex-col gap-4">
          <div className="overflow-hidden border border-[#00FFAA]/20 rounded-2xl bg-[#0A1A1A] shadow-inner flex flex-col flex-1">
            <div className="overflow-y-auto custom-scrollbar flex-1">
              {activeTab === 'ranking' ? (
                /* TAB 1: RANKING KEKUATAN MILITER */
                <table className="w-full text-xs">
                  <thead className="bg-[#0A1A1A] text-[#00FFAA] border-b border-[#00FFAA]/20 sticky top-0 z-10">
                    <tr>
                      <th className="sticky top-0 z-10 bg-[#0A1A1A] px-3 py-2 text-left text-[9px] sm:text-[10px] font-black uppercase tracking-wider whitespace-nowrap">Rank</th>
                      <th className="sticky top-0 z-10 bg-[#0A1A1A] px-3 py-2 text-left text-[9px] sm:text-[10px] font-black uppercase tracking-wider whitespace-nowrap">Negara</th>
                      <th className="sticky top-0 z-10 bg-[#0A1A1A] px-3 py-2 text-right text-[9px] sm:text-[10px] font-black uppercase tracking-wider whitespace-nowrap">Darat</th>
                      <th className="sticky top-0 z-10 bg-[#0A1A1A] px-3 py-2 text-right text-[9px] sm:text-[10px] font-black uppercase tracking-wider whitespace-nowrap">Laut</th>
                      <th className="sticky top-0 z-10 bg-[#0A1A1A] px-3 py-2 text-right text-[9px] sm:text-[10px] font-black uppercase tracking-wider whitespace-nowrap">Udara</th>
                      <th className="sticky top-0 z-10 bg-[#0A1A1A] px-3 py-2 text-right text-[9px] sm:text-[10px] font-black uppercase tracking-wider whitespace-nowrap">Total Kekuatan</th>
                      <th className="sticky top-0 z-10 bg-[#0A1A1A] px-3 py-2 text-center text-[9px] sm:text-[10px] font-black uppercase tracking-wider whitespace-nowrap">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#00FFAA]/10 text-xs font-bold text-[#E0E0E0]">
                    {rankings.length > 0 ? (
                      rankings.map((row, index) => {
                        const selectedCountryName = countryDetail?.country || countryDetail?.nama_negara || countryDetail?.name_id || countryDetail?.name_en || "Negara";
                        const isUserCountry = row.countryName.toLowerCase().trim() === selectedCountryName.toLowerCase().trim();
                        
                        return (
                          <tr 
                            key={`${row.countryName}-${index}`} 
                            className={`transition-colors ${
                              isUserCountry
                                ? 'bg-[#00FFAA]/10 border-l-4 border-l-[#00FFAA]'
                                : 'hover:bg-[#0F2424]'
                            }`}
                          >
                            <td className="px-3 py-2 text-[#6B8A8A]">#{index + 1}</td>
                            <td className="px-3 py-2 font-black text-[#E0E0E0]">
                              {row.countryName} {isUserCountry && <span className="text-[10px] text-[#00FFAA] ml-1">(Anda)</span>}
                            </td>
                            <td className="px-3 py-2 text-right text-[#6B8A8A]">{formatNumber(row.darat)}</td>
                            <td className="px-3 py-2 text-right text-[#6B8A8A]">{formatNumber(row.laut)}</td>
                            <td className="px-3 py-2 text-right text-[#6B8A8A]">{formatNumber(row.udara)}</td>
                            <td className="px-3 py-2 text-right text-[#00FFAA] font-black">{formatNumber(row.totalPower)}</td>
                            <td className="px-3 py-2 text-center">
                              <button
                                onClick={() => onAction?.(row)}
                                disabled={isUserCountry}
                                className={`p-1.5 rounded-lg transition-all ${
                                  isUserCountry 
                                    ? 'bg-[#6B8A8A]/20 text-[#6B8A8A] cursor-not-allowed' 
                                    : 'bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white border border-rose-500/30 cursor-pointer'
                                }`}
                                title="Deklarasikan perang nuklir"
                              >
                                <Radiation className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-[#6B8A8A]">
                          Data negara belum tersedia.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              ) : (
                /* TAB 2: NEGARA PEMILIK ICBM (DARI DATABASE_ICBM) */
                <table className="w-full text-xs">
                  <thead className="bg-[#0A1A1A] text-[#00FFAA] border-b border-[#00FFAA]/20 sticky top-0 z-10">
                    <tr>
                      <th className="sticky top-0 z-10 bg-[#0A1A1A] px-3 py-2.5 text-left text-[9px] sm:text-[10px] font-black uppercase tracking-wider whitespace-nowrap">No</th>
                      <th className="sticky top-0 z-10 bg-[#0A1A1A] px-3 py-2.5 text-left text-[9px] sm:text-[10px] font-black uppercase tracking-wider whitespace-nowrap">Negara</th>
                      <th className="sticky top-0 z-10 bg-[#0A1A1A] px-3 py-2.5 text-center text-[9px] sm:text-[10px] font-black uppercase tracking-wider whitespace-nowrap">Kode ISO</th>
                      <th className="sticky top-0 z-10 bg-[#0A1A1A] px-3 py-2.5 text-center text-[9px] sm:text-[10px] font-black uppercase tracking-wider whitespace-nowrap">Status ICBM</th>
                      <th className="sticky top-0 z-10 bg-[#0A1A1A] px-3 py-2.5 text-right text-[9px] sm:text-[10px] font-black uppercase tracking-wider whitespace-nowrap">Perkiraan Hulu Ledak / Peluncur</th>
                      <th className="sticky top-0 z-10 bg-[#0A1A1A] px-3 py-2.5 text-center text-[9px] sm:text-[10px] font-black uppercase tracking-wider whitespace-nowrap">Level Ancaman</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#00FFAA]/10 text-xs font-bold text-[#E0E0E0]">
                    {isLoadingIcbm ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-[#00FFAA]">
                          Memuat data negara berkemampuan ICBM...
                        </td>
                      </tr>
                    ) : filteredIcbmOwners.length > 0 ? (
                      filteredIcbmOwners.map((row, idx) => {
                        const selectedCountryName = countryDetail?.country || countryDetail?.nama_negara || countryDetail?.name_id || countryDetail?.name_en || "Negara";
                        const isUserCountry = row.country_name.toLowerCase().trim() === selectedCountryName.toLowerCase().trim() ||
                                              row.country_slug.toLowerCase().trim() === (countryDetail?.country_slug || "").toLowerCase().trim();

                        return (
                          <tr 
                            key={row.country_id}
                            className={`transition-colors ${
                              isUserCountry
                                ? 'bg-[#00FFAA]/10 border-l-4 border-l-[#00FFAA]'
                                : 'hover:bg-[#0F2424]'
                            }`}
                          >
                            <td className="px-3 py-2.5 text-[#6B8A8A]">#{idx + 1}</td>
                            <td className="px-3 py-2.5 font-black text-[#E0E0E0] flex items-center gap-2">
                              <Rocket className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                              <span>{row.country_name}</span>
                              {isUserCountry && <span className="text-[10px] text-[#00FFAA] ml-1 font-bold">(Anda)</span>}
                            </td>
                            <td className="px-3 py-2.5 text-center uppercase tracking-widest text-[#6B8A8A] font-mono">
                              {row.iso}
                            </td>
                            <td className="px-3 py-2.5 text-center">
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-500/20 text-rose-400 border border-rose-500/30">
                                <ShieldAlert className="w-3 h-3" />
                                AKTIF
                              </span>
                            </td>
                            <td className="px-3 py-2.5 text-right font-black text-[#00FFAA] text-sm">
                              {formatNumber(row.icbm_jumlah)} <span className="text-[10px] font-normal text-[#6B8A8A]">Unit</span>
                            </td>
                            <td className="px-3 py-2.5 text-center">
                              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-[#0A1A1A] border border-[#00FFAA]/30 text-[#00FFAA]">
                                {row.icbm_jumlah >= 300 ? 'Level V (Superpower)' : row.icbm_jumlah >= 10 ? 'Level III (Regional)' : 'Level II (Terkonfirmasi)'}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-[#6B8A8A]">
                          Tidak ditemukan negara dengan status ICBM.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
