"use client";
import React, { useMemo, useState } from "react";
import { Binoculars, ChevronUp, ChevronDown } from "lucide-react";
import { getArmadaPowerSummary } from "../../4_armada/logic/armadaLogic";
import KonfirmasiSpionaseModals from "../modals_konfirmasi/konfirmasiSpionaseModals";
// 🔥 Import COUNTRIES_DATA untuk meng-enrich ISO
import { COUNTRIES_DATA } from "@/app/page/map_system/map-data";

type RankingRow = {
  countryName: string;
  totalPower: number;
  darat: number;
  laut: number;
  udara: number;
  iso?: string; // 🔥 Tambahkan field ISO
};

const formatNumber = (value: unknown) => {
  const numeric = Number(value ?? 0);
  return Number.isFinite(numeric) ? numeric.toLocaleString("id-ID") : "0";
};

// 🔥 Fungsi pencarian ISO (cari dari COUNTRIES_DATA terlebih dahulu)
const extractISO = (country: any, countryName: string): string => {
  if (!country || typeof country !== "object") return "";
  
  // 1. Coba cari dari COUNTRIES_DATA menggunakan nama negara
  if (COUNTRIES_DATA && Array.isArray(COUNTRIES_DATA)) {
    const mapData = COUNTRIES_DATA.find((c: any) => 
      c.country && c.country.toLowerCase().trim() === countryName.toLowerCase().trim()
    );
    if (mapData?.iso && typeof mapData.iso === 'string') {
      return mapData.iso.trim().toLowerCase().slice(0, 2);
    }
  }
  
  // 2. Jika belum ketemu, coba dari property negara
  const possibleKeys = ['iso', 'iso2', 'iso_code', 'code', 'country_code', 'kode_negara', 'alpha2Code', 'cca2'];
  for (const key of possibleKeys) {
    if (country[key] && typeof country[key] === 'string') return country[key].trim().toLowerCase().slice(0, 2);
  }
  return "";
};

interface SpionaseProps {
  prefetchedAllCountries?: any[];
  countryDetail?: any; // 🔥 Tambahkan prop untuk negara user
  onAction: (targetCountry: any) => void;
}

export default function Spionase({ prefetchedAllCountries, countryDetail, onAction }: SpionaseProps) {
  const [sortConfig, setSortConfig] = useState<{ key: keyof RankingRow; direction: 'asc' | 'desc' } | null>({
    key: 'totalPower',
    direction: 'desc'
  });

  const [selectedTarget, setSelectedTarget] = useState<RankingRow | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const rawRankings = useMemo(() => {
    const source = Array.isArray(prefetchedAllCountries) ? prefetchedAllCountries : [];
    return source.map((country: any) => {
      const summary = getArmadaPowerSummary(country);
      const groupTotals = summary.totals.groups;
      const countryName = country?.nama_negara || country?.country || country?.name_id || country?.name_en || "Negara";
      const iso = extractISO(country, countryName); // 🔥 Ambil ISO dengan nama negara sebagai parameter

      return {
        countryName,
        totalPower: summary.totals.totalPower,
        darat: groupTotals?.darat?.power ?? 0,
        laut: groupTotals?.laut?.power ?? 0,
        udara: groupTotals?.udara?.power ?? 0,
        iso, // 🔥 Simpan ISO
      };
    });
  }, [prefetchedAllCountries]);

  const rankings = useMemo(() => {
    let sortableItems = [...rawRankings];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (typeof a[sortConfig.key] === 'string') {
          const aVal = a[sortConfig.key] as string;
          const bVal = b[sortConfig.key] as string;
          if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
          if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
          return 0;
        } else {
          const aVal = a[sortConfig.key] as number;
          const bVal = b[sortConfig.key] as number;
          if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
          if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
          return 0;
        }
      });
    }
    return sortableItems;
  }, [rawRankings, sortConfig]);

  const handleSort = (key: keyof RankingRow) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortArrow = (key: keyof RankingRow) => {
    if (sortConfig?.key !== key) return <span className="text-[#8b7e66]/40 ml-1 text-xs font-normal">⇅</span>;
    if (sortConfig.direction === 'asc') return <ChevronUp className="h-3 w-3 ml-1 inline text-[#5c3c10]" />;
    return <ChevronDown className="h-3 w-3 ml-1 inline text-[#5c3c10]" />;
  };

  const handleOpenModal = (row: RankingRow) => {
    setSelectedTarget(row);
    setIsModalOpen(true);
  };

  return (
    <div className="w-full">
      <div className="overflow-hidden border border-[#C4B49C]/30 rounded-xl bg-[#FAF6EE]/50 shadow-sm">
        <div className="max-h-[50vh] overflow-auto">
          <table className="w-full text-xs">
            <thead className="bg-[#efe7d8] border-b-2 border-[#C4B49C]/40 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 text-left font-black text-[#5c3c10] uppercase tracking-wider w-12">Rank</th>
                <th className="px-4 py-3 text-left font-black text-[#5c3c10] uppercase tracking-wider cursor-pointer hover:bg-[#5c3c10]/10 transition-colors" onClick={() => handleSort('countryName')}>
                  Negara{getSortArrow('countryName')}
                </th>
                <th className="px-4 py-3 text-right font-black text-[#5c3c10] uppercase tracking-wider cursor-pointer hover:bg-[#5c3c10]/10 transition-colors" onClick={() => handleSort('darat')}>
                  Darat{getSortArrow('darat')}
                </th>
                <th className="px-4 py-3 text-right font-black text-[#5c3c10] uppercase tracking-wider cursor-pointer hover:bg-[#5c3c10]/10 transition-colors" onClick={() => handleSort('laut')}>
                  Laut{getSortArrow('laut')}
                </th>
                <th className="px-4 py-3 text-right font-black text-[#5c3c10] uppercase tracking-wider cursor-pointer hover:bg-[#5c3c10]/10 transition-colors" onClick={() => handleSort('udara')}>
                  Udara{getSortArrow('udara')}
                </th>
                <th className="px-4 py-3 text-right font-black text-[#5c3c10] uppercase tracking-wider cursor-pointer hover:bg-[#5c3c10]/10 transition-colors" onClick={() => handleSort('totalPower')}>
                  Total Kekuatan{getSortArrow('totalPower')}
                </th>
                <th className="px-4 py-3 text-center font-black text-[#5c3c10] uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {rankings.map((row, index) => {
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
                    
                    {/* 🔥 KOLOM NEGARA DENGAN BENDERA */}
                    <td className={`px-3 py-2 font-bold ${isUserCountry ? 'text-emerald-900' : 'text-[#5c3c10]'}`}>
                      <div className="flex items-center gap-2 min-h-[20px]">
                        {row.iso && row.iso.length === 2 ? (
                          <img
                            src={`https://flagcdn.com/w20/${row.iso.toLowerCase()}.png`}
                            alt={row.countryName}
                            className="w-5 h-4 object-cover rounded-sm border border-[#5c3c10]/10 shadow-sm flex-shrink-0"
                            onError={(e) => (e.target as HTMLImageElement).style.display = "none"}
                          />
                        ) : (
                          <div className="w-5 h-4 rounded-sm bg-[#e4dac3] border border-[#5c3c10]/20 flex-shrink-0" />
                        )}
                        <span>{row.countryName}</span>
                      </div>
                    </td>

                    <td className="px-3 py-2 text-[#5c3c10]">{formatNumber(row.darat)}</td>
                    <td className="px-3 py-2 text-[#5c3c10]">{formatNumber(row.laut)}</td>
                    <td className="px-3 py-2 text-[#5c3c10]">{formatNumber(row.udara)}</td>
                    <td className={`px-3 py-2 font-black ${isUserCountry ? 'text-emerald-600' : 'text-rose-700'}`}>{formatNumber(row.totalPower)}</td>
                    <td className="px-3 py-2 text-center">
                      <button
                        onClick={() => handleOpenModal(row)}
                        className="p-1.5 rounded-lg bg-indigo-600/10 text-indigo-700 hover:bg-indigo-600 hover:text-white border border-indigo-600/30 transition-all cursor-pointer"
                        title="Luncurkan misi spionase"
                      >
                        <Binoculars className="w-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selectedTarget && (
        <KonfirmasiSpionaseModals
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          targetCountry={selectedTarget}
          onConfirm={() => {
            setIsModalOpen(false);
            onAction(selectedTarget);
          }}
        />
      )}
    </div>
  );
}