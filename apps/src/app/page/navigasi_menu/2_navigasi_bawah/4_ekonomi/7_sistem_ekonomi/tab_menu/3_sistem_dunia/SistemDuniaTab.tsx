// Path: d:\project-sendiri\em\apps\src\app\page\navigasi_menu\2_navigasi_bawah\4_ekonomi\7_sistem_ekonomi\tab_menu\3_sistem_dunia\SistemDuniaTab.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { ChevronUp, ChevronDown, User } from "lucide-react";
import { COUNTRIES_DATA } from "@/app/page/map_system/map-data";
import { getEconomicSystemDetails } from "../../logic/logikaSistemEkonomi";

interface Props {
  countryDetail?: any;
}

interface TableRow {
  no: number;
  country: string;
  iso: string;
  spektrumVal: number;
  system: string;
  category: "Terpusat" | "Campuran" | "Pasar Bebas";
  isPlayer: boolean;
}

export default function SistemDuniaTab({ countryDetail }: Props) {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof TableRow;
    direction: "asc" | "desc";
  }>({
    key: "country",
    direction: "asc",
  });

  const [dbData, setDbData] = useState<any[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    fetch("/api/sistem-ekonomi?all=true")
      .then((res) => res.json())
      .then((data) => {
        if (isMounted) {
          if (Array.isArray(data) && data.length > 0) {
            setDbData(data);
          } else {
            setDbData([]);
          }
        }
      })
      .catch(() => {
        if (isMounted) setDbData([]);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const playerCountryName = countryDetail?.country || countryDetail?.nama_negara || countryDetail?.name_id || "";

  // Prepare full list based on DB data (empty if DB returns no data)
  const countriesDataList = useMemo(() => {
    if (!dbData || dbData.length === 0) return [];

    return dbData.map((c: any, index: number) => {
      const countryName = c?.country_name || c?.country || c?.nama_negara || "Negara";
      let iso = c?.iso || "";

      if (!iso) {
        const mapData = COUNTRIES_DATA.find(
          (item: any) =>
            item.country &&
            item.country.toLowerCase().trim() === countryName.toLowerCase().trim()
        );
        if (mapData?.iso) {
          iso = mapData.iso;
        }
      }

      const isPlayer =
        playerCountryName &&
        countryName.toLowerCase().trim() === playerCountryName.toLowerCase().trim();

      const sliderVal = c?.spektrum_val ?? (isPlayer && countryDetail?.sistem_ekonomi_val !== undefined ? countryDetail.sistem_ekonomi_val : 50);
      const details = getEconomicSystemDetails(sliderVal);

      return {
        no: index + 1,
        country: countryName,
        iso: iso || "id",
        spektrumVal: sliderVal,
        system: c?.system_title || details.title,
        category: c?.category || details.category,
        isPlayer,
      } as TableRow;
    });
  }, [dbData, playerCountryName, countryDetail]);

  // Sorting Handler
  const handleSort = (key: keyof TableRow) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const getSortArrow = (key: keyof TableRow) => {
    if (sortConfig?.key !== key) {
      return <span className="text-[#6B8A8A]/40 ml-1 text-xs font-normal">⇅</span>;
    }
    if (sortConfig.direction === "asc") {
      return <ChevronUp className="h-3 w-3 ml-1 inline text-[#00FFAA]" />;
    }
    return <ChevronDown className="h-3 w-3 ml-1 inline text-[#00FFAA]" />;
  };

  // Priority mapping for clean category sorting
  const categoryPriority: Record<string, number> = {
    Terpusat: 1,
    Campuran: 2,
    "Pasar Bebas": 3,
  };

  // Sorted Array
  const sortedRankings = useMemo(() => {
    const list = [...countriesDataList];
    if (!sortConfig) return list;

    return list.sort((a, b) => {
      const key = sortConfig.key;

      if (key === "category") {
        const priorityA = categoryPriority[a.category] || 99;
        const priorityB = categoryPriority[b.category] || 99;
        if (priorityA !== priorityB) {
          return sortConfig.direction === "asc"
            ? priorityA - priorityB
            : priorityB - priorityA;
        }
        return a.country.localeCompare(b.country);
      }

      const aVal = a[key];
      const bVal = b[key];

      if (typeof aVal === "number" && typeof bVal === "number") {
        if (aVal !== bVal) {
          return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal;
        }
        return a.country.localeCompare(b.country);
      }

      const cmp = String(aVal).localeCompare(String(bVal));
      if (cmp !== 0) {
        return sortConfig.direction === "asc" ? cmp : -cmp;
      }
      return a.country.localeCompare(b.country);
    });
  }, [countriesDataList, sortConfig]);

  return (
    <div className="w-full space-y-4">
      {/* KETERANGAN TABLE */}
      <div className="text-xs font-semibold text-[#6B8A8A] leading-relaxed">
        Tabel 207 negara berdasarkan sistem ekonomi yang diterapkan. Klik header kolom untuk mengurutkan data.
      </div>

      {/* CONTAINER TABEL SAMA DENGAN SERANG NEGARA */}
      <div className="w-full overflow-hidden border border-[#00FFAA]/20 rounded-xl bg-[#0A1A1A] shadow-sm">
        <div className="max-h-[52vh] overflow-auto no-scrollbar">
          <table className="w-full text-xs text-left border-collapse">
            
            {/* TH HEADER DENGAN OPTIMALISASI LEBAR KOLOM */}
            <thead className="bg-[#0F2424] border-b border-[#00FFAA]/20 sticky top-0 z-10">
              <tr>
                <th className="px-3 py-3 text-left font-black text-[#00FFAA] uppercase tracking-wider w-14 shrink-0">
                  Rank
                </th>

                <th 
                  className="px-3 py-3 text-left font-black text-[#00FFAA] uppercase tracking-wider cursor-pointer hover:bg-[#00FFAA]/10 transition-colors w-48 sm:w-56 shrink-0"
                  onClick={() => handleSort("country")}
                >
                  <div className="flex items-center gap-1">
                    <span>Negara</span>
                    {getSortArrow("country")}
                  </div>
                </th>

                <th 
                  className="px-3 py-3 text-center font-black text-[#00FFAA] uppercase tracking-wider cursor-pointer hover:bg-[#00FFAA]/10 transition-colors"
                  onClick={() => handleSort("system")}
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Sistem Ekonomi</span>
                    {getSortArrow("system")}
                  </div>
                </th>

                <th 
                  className="px-4 py-3 text-right font-black text-[#00FFAA] uppercase tracking-wider cursor-pointer hover:bg-[#00FFAA]/10 transition-colors w-36 shrink-0"
                  onClick={() => handleSort("category")}
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Kategori</span>
                    {getSortArrow("category")}
                  </div>
                </th>
              </tr>
            </thead>

            {/* TBODY ROW DENGAN ISO BENDERA & HANDLER KOSONG/LOADING */}
            <tbody className="divide-y divide-[#00FFAA]/10">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-xs font-bold text-[#6B8A8A]">
                    Memuat data sistem ekonomi dunia dari database…
                  </td>
                </tr>
              ) : sortedRankings.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-xs font-bold text-[#6B8A8A]">
                    Data sistem ekonomi dunia belum tersedia di database.
                  </td>
                </tr>
              ) : (
                sortedRankings.map((row, index) => {
                  return (
                    <tr
                      key={`${row.country}-${index}`}
                      className={`transition-colors ${
                        row.isPlayer
                          ? "bg-[#00FFAA]/10 hover:bg-[#00FFAA]/20 border-l-4 border-l-[#00FFAA]"
                          : "hover:bg-[#00FFAA]/5"
                      }`}
                    >
                      <td className={`px-2.5 lg:px-4 py-2 lg:py-2.5 font-black text-[10px] sm:text-[11px] lg:text-xs ${row.isPlayer ? "text-[#00FFAA]" : "text-[#E0E0E0]"}`}>
                        {index + 1}
                      </td>

                      <td className={`px-2.5 lg:px-4 py-2 lg:py-2.5 font-bold text-[10px] sm:text-[11px] lg:text-xs ${row.isPlayer ? "text-[#00FFAA]" : "text-[#E0E0E0]"}`}>
                        <div className="flex items-center gap-2 lg:gap-2.5">
                          {row.iso ? (
                            <img
                              src={`https://flagcdn.com/w20/${row.iso.toLowerCase()}.png`}
                              alt={row.country}
                              className="w-4 h-3 lg:w-5 lg:h-4 object-cover rounded-sm border border-[#00FFAA]/20 shadow-sm flex-shrink-0"
                              onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
                            />
                          ) : (
                            <div className="w-4 h-3 lg:w-5 lg:h-4 rounded-sm bg-[#0F2424] border border-[#00FFAA]/20 flex-shrink-0" />
                          )}
                          <span>{row.country}</span>
                          {row.isPlayer && (
                            <span className="flex items-center gap-1 px-1.5 lg:px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[8px] lg:text-[9px] font-black uppercase tracking-wider ml-1">
                              <User className="w-2.5 h-2.5" /> Anda
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-2.5 lg:px-4 py-2 lg:py-2.5 text-center font-semibold text-[10px] sm:text-[11px] lg:text-xs text-[#6B8A8A]">
                        <div className="flex items-center justify-center gap-1.5 lg:gap-2">
                          <span>{row.system}</span>
                          <span className="px-1.5 lg:px-2 py-0.5 rounded bg-[#0F2424] border border-[#00FFAA]/20 text-[9px] lg:text-[10px] font-mono font-bold text-[#00FFAA]">
                            {row.spektrumVal}%
                          </span>
                        </div>
                      </td>

                      <td className="px-2.5 lg:px-4 py-2 lg:py-2.5 text-right whitespace-nowrap">
                        <span
                          className={`inline-block px-2.5 lg:px-3 py-0.5 lg:py-1 rounded-full text-[9px] lg:text-[10px] font-black uppercase border shadow-sm ${
                            row.category === "Terpusat"
                              ? "bg-rose-500/15 text-rose-400 border-rose-500/30"
                              : row.category === "Campuran"
                              ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                              : "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                          }`}
                        >
                          {row.category}
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
  );
}
