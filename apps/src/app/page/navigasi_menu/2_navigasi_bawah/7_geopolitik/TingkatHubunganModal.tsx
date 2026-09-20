"use client"
import React, { useState } from "react";
import { X, Globe, Search, Info } from "lucide-react";
import { COUNTRIES_DATA } from "@/app/page/map_system/map-data";
import { getRelationValue } from "@/../../json/database_hubungan_antar_negara/relationsRegistry";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCountry?: any;
  countryDetail?: any;
}

const normalizeContinent = (continent: any) => {
  if (typeof continent !== 'string') return 'Lainnya';
  const value = continent.trim().toLowerCase();
  if (value === 'asia') return 'Asia';
  if (value === 'africa' || value === 'afrika') return 'Africa';
  if (value === 'europe' || value === 'eropa') return 'Europe';
  if (value === 'north america' || value === 'amerika utara') return 'North America';
  if (value === 'south america' || value === 'amerika selatan') return 'South America';
  if (value === 'oceania' || value === 'oseania' || value === 'australia') return 'Oceania';
  return continent || 'Lainnya';
};

export default function TingkatHubunganModal({ isOpen, onClose, selectedCountry, countryDetail }: ModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({
    key: 'no',
    direction: 'asc',
  });
  
  const [isLegendOpen, setIsLegendOpen] = useState(false);

  if (!isOpen) return null;

  const playerCountryName = selectedCountry?.country || countryDetail?.country || countryDetail?.nama_negara || countryDetail?.name_id || "Indonesia";
  const normPlayer = playerCountryName.toLowerCase().trim();

  // Filter 206 negara (kecuali negara user)
  const allTargetCountries = COUNTRIES_DATA.filter(
    (c) => c.country.toLowerCase().trim() !== normPlayer
  ).map((c, idx) => {
    return {
      no: idx + 1,
      name: c.country,
      continent: normalizeContinent(c.continent),
      relation: getRelationValue(playerCountryName, c.country),
    };
  });

  // Logika 5 warna & alias hubungan
  const getRelationBadge = (value: number) => {
    if (value >= 81 && value <= 100) {
      return { 
        alias: 'Sangat Baik', 
        className: 'bg-emerald-100 text-emerald-800 border-emerald-300' 
      };
    }
    if (value >= 66 && value <= 80) {
      return { 
        alias: 'Baik', 
        className: 'bg-green-100 text-green-800 border-green-300' 
      };
    }
    if (value >= 41 && value <= 65) {
      return { 
        alias: 'Netral', 
        className: 'bg-yellow-100 text-yellow-800 border-yellow-300' 
      };
    }
    if (value >= 26 && value <= 40) {
      return { 
        alias: 'Buruk', 
        className: 'bg-rose-100 text-rose-800 border-rose-300' 
      };
    }
    if (value >= 0 && value <= 25) {
      return { 
        alias: 'Sangat Buruk', 
        className: 'bg-red-100 text-red-800 border-red-300' 
      };
    }
    return { 
      alias: 'Tidak Diketahui', 
      className: 'bg-gray-100 text-gray-800 border-gray-300' 
    };
  };

  const handleSort = (key: string) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc',
    }));
  };

  const renderSortArrow = (key: string) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? ' ▲' : ' ▼';
  };

  let rows = allTargetCountries;

  if (searchQuery.trim() !== '') {
    const q = searchQuery.toLowerCase();
    rows = rows.filter(
      (item) => item.name.toLowerCase().includes(q) || item.continent.toLowerCase().includes(q)
    );
  }

  const sortedRows = [...rows].sort((a, b) => {
    const key = sortConfig.key as keyof typeof a;
    const aVal = a[key];
    const bVal = b[key];
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortConfig.direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    } else {
      return sortConfig.direction === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    }
  });

  // Hitung jumlah negara untuk setiap kategori berdasarkan data asli (allTargetCountries)
  const countByCategory = {
    sangatBuruk: allTargetCountries.filter(c => c.relation >= 0 && c.relation <= 25).length,
    buruk: allTargetCountries.filter(c => c.relation >= 26 && c.relation <= 40).length,
    netral: allTargetCountries.filter(c => c.relation >= 41 && c.relation <= 65).length,
    baik: allTargetCountries.filter(c => c.relation >= 66 && c.relation <= 80).length,
    sangatBaik: allTargetCountries.filter(c => c.relation >= 81 && c.relation <= 100).length,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none">
      <div className="bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans pointer-events-auto shadow-2xl">
        
        {/* HEADER */}
        <div className="px-6 py-4 border-b border-[#00FFAA]/30 flex items-center justify-between bg-[#0A1A1A] relative z-10 shrink-0">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#0F2424] rounded-xl border border-[#00FFAA]/30">
                <Globe className="h-6 w-6 text-[#00FFAA] animate-pulse" />
              </div>
              <div>
                <h2 className="text-xl font-black text-[#00FFAA] tracking-wider uppercase">Tingkat Hubungan Diplomatik</h2>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] text-[#6B8A8A] hover:text-[#00FFAA] hover:border-[#00FFAA] transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1.5"
          >
            <span className="text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* BODY TABEL */}
        <div className="flex-1 min-h-0 flex flex-col p-6 bg-[#0F2424] relative z-10">
          <div className="flex justify-between items-center gap-3 mb-4 flex-shrink-0">
            <button
              onClick={() => setIsLegendOpen(true)}
              className="px-4 py-2 rounded-lg bg-[#0A1A1A] border border-[#00FFAA]/30 text-[#00FFAA] text-[10px] font-black uppercase tracking-wider hover:bg-[#00FFAA]/10 transition-all cursor-pointer flex items-center gap-2"
            >
              <Info className="h-3.5 w-3.5 text-[#00FFAA]" />
              Legenda Hubungan
            </button>

            <div className="relative">
              <input
                type="text"
                placeholder="Cari negara / benua..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-lg bg-[#0A1A1A] border border-[#00FFAA]/30 text-xs font-bold text-[#E0E0E0] outline-none focus:border-[#00FFAA] w-52 transition-all placeholder:text-[#6B8A8A]"
              />
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#6B8A8A]" />
            </div>
          </div>

          <div className="flex-1 min-h-0 bg-[#0A1A1A] border border-[#00FFAA]/20 rounded-xl overflow-hidden shadow-sm flex flex-col">
            <div className="flex-1 min-h-0 overflow-y-auto">
              <table className="min-w-full table-auto border-separate border-spacing-0 text-left">
                <thead className="sticky top-0 z-10 bg-[#0F2424]">
                  <tr className="border-b border-[#00FFAA]/20">
                    <th className="px-4 py-3 border-b border-[#00FFAA]/20 text-center cursor-pointer hover:bg-[#00FFAA]/10 transition text-[10px] text-[#00FFAA] font-black uppercase tracking-wider w-16" onClick={() => handleSort('no')}>No{renderSortArrow('no')}</th>
                    <th className="px-4 py-3 border-b border-[#00FFAA]/20 cursor-pointer hover:bg-[#00FFAA]/10 transition text-[10px] text-[#00FFAA] font-black uppercase tracking-wider" onClick={() => handleSort('name')}>Nama Negara{renderSortArrow('name')}</th>
                    <th className="px-4 py-3 border-b border-[#00FFAA]/20 cursor-pointer hover:bg-[#00FFAA]/10 transition text-[10px] text-[#00FFAA] font-black uppercase tracking-wider" onClick={() => handleSort('continent')}>Benua{renderSortArrow('continent')}</th>
                    <th className="px-4 py-3 border-b border-[#00FFAA]/20 text-center cursor-pointer hover:bg-[#00FFAA]/10 transition text-[10px] text-[#00FFAA] font-black uppercase tracking-wider" onClick={() => handleSort('relation')}>Tingkat Hubungan{renderSortArrow('relation')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#00FFAA]/10">
                  {sortedRows.length === 0 ? (
                    <tr>
                      <td className="px-4 py-6 text-center text-sm font-bold text-[#6B8A8A]" colSpan={4}>
                        Tidak ada data yang cocok dengan pencarian "{searchQuery}".
                      </td>
                    </tr>
                  ) : (
                    sortedRows.map((row, index) => {
                      const { alias, className } = getRelationBadge(row.relation);
                      return (
                        <tr key={`${row.name}-${index}`} className="hover:bg-[#00FFAA]/5 transition-colors">
                          <td className="px-4 py-3 text-center text-xs font-bold text-[#6B8A8A]">{row.no}</td>
                          <td className="px-4 py-3 text-xs font-bold text-[#E0E0E0]">{row.name}</td>
                          <td className="px-4 py-3 text-xs font-bold text-[#6B8A8A]">{row.continent}</td>
                          <td className="px-4 py-3 text-center text-xs font-bold">
                            <span className="inline-block px-3 py-0.5 rounded-md border font-black text-xs shadow-sm bg-[#0F2424] border-[#00FFAA]/30 text-[#00FFAA]">
                              {row.relation} - {alias}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* MODAL LEGENDA WARNA HUBUNGAN DENGAN JUMLAH NEGARA */}
        {isLegendOpen && (
          <div className="absolute inset-0 bg-black/60 z-30 flex items-center justify-center p-8 pointer-events-auto backdrop-blur-sm rounded-2xl">
            <div className="bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl max-w-lg w-full p-8 shadow-2xl relative">
              <button
                onClick={() => setIsLegendOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-[#6B8A8A] hover:text-[#00FFAA] transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
              
              <h3 className="text-lg font-bold text-[#E0E0E0] uppercase tracking-wide mb-4">
                Indikator Hubungan Diplomatik
              </h3>
              <div className="space-y-3 mb-6">
                {/* 0 - 25 */}
                <div className="flex items-center justify-between border-b border-[#00FFAA]/15 pb-2">
                  <span className="text-sm font-bold text-[#E0E0E0]">0 - 25</span>
                  <div className="flex items-center gap-3">
                    <span className="inline-block px-3 py-1 rounded-md bg-red-500/15 text-red-400 border border-red-500/30 font-bold text-xs">
                      Sangat Buruk
                    </span>
                    <span className="text-xs font-semibold text-[#6B8A8A] w-20 text-right">
                      ({countByCategory.sangatBuruk} negara)
                    </span>
                  </div>
                </div>

                {/* 26 - 40 */}
                <div className="flex items-center justify-between border-b border-[#00FFAA]/15 pb-2">
                  <span className="text-sm font-bold text-[#E0E0E0]">26 - 40</span>
                  <div className="flex items-center gap-3">
                    <span className="inline-block px-3 py-1 rounded-md bg-rose-500/15 text-rose-400 border border-rose-500/30 font-bold text-xs">
                      Buruk
                    </span>
                    <span className="text-xs font-semibold text-[#6B8A8A] w-20 text-right">
                      ({countByCategory.buruk} negara)
                    </span>
                  </div>
                </div>

                {/* 41 - 65 */}
                <div className="flex items-center justify-between border-b border-[#00FFAA]/15 pb-2">
                  <span className="text-sm font-bold text-[#E0E0E0]">41 - 65</span>
                  <div className="flex items-center gap-3">
                    <span className="inline-block px-3 py-1 rounded-md bg-yellow-500/15 text-yellow-400 border border-yellow-500/30 font-bold text-xs">
                      Netral
                    </span>
                    <span className="text-xs font-semibold text-[#6B8A8A] w-20 text-right">
                      ({countByCategory.netral} negara)
                    </span>
                  </div>
                </div>

                {/* 66 - 80 */}
                <div className="flex items-center justify-between border-b border-[#00FFAA]/15 pb-2">
                  <span className="text-sm font-bold text-[#E0E0E0]">66 - 80</span>
                  <div className="flex items-center gap-3">
                    <span className="inline-block px-3 py-1 rounded-md bg-green-500/15 text-green-400 border border-green-500/30 font-bold text-xs">
                      Baik
                    </span>
                    <span className="text-xs font-semibold text-[#6B8A8A] w-20 text-right">
                      ({countByCategory.baik} negara)
                    </span>
                  </div>
                </div>

                {/* 81 - 100 */}
                <div className="flex items-center justify-between border-b border-[#00FFAA]/15 pb-2">
                  <span className="text-sm font-bold text-[#E0E0E0]">81 - 100</span>
                  <div className="flex items-center gap-3">
                    <span className="inline-block px-3 py-1 rounded-md bg-[#00FFAA]/15 text-[#00FFAA] border border-[#00FFAA]/30 font-bold text-xs">
                      Sangat Baik
                    </span>
                    <span className="text-xs font-semibold text-[#6B8A8A] w-20 text-right">
                      ({countByCategory.sangatBaik} negara)
                    </span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => setIsLegendOpen(false)}
                className="w-full py-2.5 rounded-xl bg-[#00FFAA] text-[#0A1A1A] text-xs font-black uppercase tracking-widest hover:bg-[#00FFAA]/80 transition-all cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}