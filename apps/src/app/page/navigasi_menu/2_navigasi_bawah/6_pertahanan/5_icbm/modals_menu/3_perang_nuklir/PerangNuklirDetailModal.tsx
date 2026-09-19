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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none">
      <div className="bg-[#FAF6EE] border-2 sm:border-3 border-[#C4B49C] rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans pointer-events-auto shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,0,0,0.03)_0%,transparent_100%)] pointer-events-none" />
        <div className="px-6 py-4 border-b-2 border-[#C4B49C]/30 flex items-center justify-between bg-[#FAF6EE] relative z-10 shrink-0">
          <div className="flex items-center gap-5">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#5c3c10] tracking-tight leading-none uppercase">Perang Nuklir</h2>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#8b7e66] mt-1">Ranking kekuatan militer 207 negara</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 sm:p-2.5 rounded-xl border-2 border-[#C4B49C] bg-transparent text-[#8b7e66] hover:text-[#5c3c10] hover:bg-black/5 active:bg-black/10 transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1.5 shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto p-8 bg-[#FAF6EE]/40 relative z-10 no-scrollbar flex flex-col items-center">
          <div className="w-full max-w-5xl">
            <div className="overflow-hidden rounded-2xl border-2 border-[#C4B49C]/40 bg-white/80 shadow-sm">
              <div className="max-h-[60vh] overflow-auto">
                <table className="min-w-full text-left text-[11px]">
                  <thead className="sticky top-0 z-10 bg-[#5c3c10] text-[#FAF6EE] uppercase tracking-[0.18em]">
                    <tr>
                      <th className="px-3 py-3 font-black">Rank</th>
                      <th className="px-3 py-3 font-black">Negara</th>
                      <th className="px-3 py-3 font-black">Darat</th>
                      <th className="px-3 py-3 font-black">Laut</th>
                      <th className="px-3 py-3 font-black">Udara</th>
                      <th className="px-3 py-3 font-black">Total Kekuatan</th>
                      <th className="px-3 py-3 font-black text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rankings.length > 0 ? (
                      rankings.map((row, index) => {
                        const selectedCountryName = countryDetail?.country || countryDetail?.nama_negara || countryDetail?.name_id || countryDetail?.name_en || "Negara";
                        const isUserCountry = row.countryName.toLowerCase().trim() === selectedCountryName.toLowerCase().trim();
                        
                        return (
                          <tr 
                            key={`${row.countryName}-${index}`} 
                            className={`border-b border-[#C4B49C]/25 transition-colors ${
                              isUserCountry
                                ? 'bg-emerald-100/80 hover:bg-emerald-200/80 border-l-4 border-l-emerald-600'
                                : 'odd:bg-[#FBF7EE] even:bg-white/60 hover:bg-[#e4dac3]/30'
                            }`}
                          >
                            <td className={`px-3 py-2 font-black ${isUserCountry ? 'text-emerald-900' : 'text-[#5c3c10]'}`}>{index + 1}</td>
                            <td className={`px-3 py-2 font-bold ${isUserCountry ? 'text-emerald-900' : 'text-[#5c3c10]'}`}>{row.countryName}</td>
                            <td className="px-3 py-2 text-[#5c3c10]">{formatNumber(row.darat)}</td>
                            <td className="px-3 py-2 text-[#5c3c10]">{formatNumber(row.laut)}</td>
                            <td className="px-3 py-2 text-[#5c3c10]">{formatNumber(row.udara)}</td>
                            <td className={`px-3 py-2 font-black ${isUserCountry ? 'text-emerald-600' : 'text-rose-700'}`}>{formatNumber(row.totalPower)}</td>
                            <td className="px-3 py-2 text-center">
                              <button
                                onClick={() => onAction?.(row)}
                                className="p-1.5 rounded-lg bg-orange-600/10 text-orange-700 hover:bg-orange-600 hover:text-white border border-orange-600/30 transition-all cursor-pointer"
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
                        <td colSpan={7} className="px-4 py-8 text-center text-[#8b7e66]">
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
    </div>
  );
}
