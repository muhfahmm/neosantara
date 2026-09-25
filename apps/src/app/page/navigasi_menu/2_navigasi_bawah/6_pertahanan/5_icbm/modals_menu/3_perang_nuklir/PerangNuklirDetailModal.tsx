"use client"
import React, { useMemo } from "react";
import { X, Radiation } from "lucide-react";
import { getArmadaPowerSummary } from "../../../4_armada/logic/armadaLogic";

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
  return Number.isFinite(numeric) ? numeric.toLocaleString("id-ID") : "0";
};

export default function PerangNuklirDetailModal({ isOpen, onClose, countryDetail, prefetchedAllCountries, onAction }: PerangNuklirDetailModalProps) {
  const rawRankings = useMemo(() => {
    const source = Array.isArray(prefetchedAllCountries) ? prefetchedAllCountries : [];
    return source.map((country: any) => {
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
    const sortableItems = [...rawRankings];
    sortableItems.sort((a, b) => {
      if (a.totalPower !== b.totalPower) {
        return b.totalPower - a.totalPower;
      }
      return a.countryName.localeCompare(b.countryName, "id", { sensitivity: "base" });
    });
    return sortableItems;
  }, [rawRankings]);

  if (!isOpen) return null;  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none">
      <div className="bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans pointer-events-auto shadow-2xl">
        
        {/* Header Modal */}
        <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-[#00FFAA]/30 flex items-center justify-between bg-[#0A1A1A] relative z-10 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-[#0F2424] rounded-xl border border-[#00FFAA]/30">
              <Radiation className="h-4 w-4 sm:h-5 sm:w-5 text-rose-500 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base sm:text-xl font-bold text-[#00FFAA] tracking-tight leading-none uppercase">Perang Nuklir Strategis</h2>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#6B8A8A] mt-1">Ranking kekuatan militer 207 negara</p>
            </div>
          </div>

          <button 
            onClick={onClose} 
            className="p-1.5 lg:p-2 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] text-[#6B8A8A] hover:text-[#00FFAA] hover:border-[#00FFAA] transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1 shadow-sm"
          >
            <span className="text-[10px] lg:text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 bg-[#0F2424] custom-scrollbar flex flex-col gap-4">
          <div className="overflow-hidden border border-[#00FFAA]/20 rounded-2xl bg-[#0A1A1A] shadow-inner flex flex-col flex-1">
            <div className="overflow-y-auto custom-scrollbar flex-1">
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
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
