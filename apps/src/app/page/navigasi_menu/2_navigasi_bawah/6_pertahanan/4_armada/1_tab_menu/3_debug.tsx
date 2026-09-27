"use client";
import React, { useState, useEffect, useMemo } from "react";
import { Search, ChevronUp, ChevronDown, Swords, Ship, Plane, Shield, Globe } from "lucide-react";
import { getInfraCapacityDetails } from "../logic/infraCapacityHelper";
import { COUNTRIES_DATA } from "@/app/page/map_system/map-data";

interface TabProps {
  countryDetail: any;
  setCountryDetail?: (detail: any) => void;
  onCapacityFull?: (infraKey: string) => void;
  highlightKey?: string | null;
  onGotoProduction?: (tab: string, key: string) => void;
  currentDate?: string | Date;
}

type CountryCapacityRow = {
  rank: number;
  countryName: string;
  daratUsed: number;
  daratTotal: number;
  daratDisplay: string;
  lautUsed: number;
  lautTotal: number;
  lautDisplay: string;
  udaraUsed: number;
  udaraTotal: number;
  udaraDisplay: string;
  totalUsed: number;
  totalCapacity: number;
  totalDisplay: string;
  iso: string;
};

const formatNumber = (value: unknown) => {
  const numeric = Number(value ?? 0);
  return Number.isFinite(numeric) ? numeric.toLocaleString("id-ID") : "0";
};

export default function ArmadaDebug({ countryDetail }: TabProps) {
  const [internalCountries, setInternalCountries] = useState<any[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [sortConfig, setSortConfig] = useState<{ key: keyof CountryCapacityRow; direction: 'asc' | 'desc' }>({
    key: 'totalUsed',
    direction: 'desc'
  });

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    fetch('/api/country-data?all=true')
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setInternalCountries(data);
        }
      })
      .catch((err) => console.warn('[ArmadaDebug] Failed to fetch all countries:', err))
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const userCountryName = useMemo(() => {
    return countryDetail?.country || countryDetail?.nama_negara || countryDetail?.name_id || countryDetail?.name_en || "";
  }, [countryDetail]);

  const rawRows = useMemo(() => {
    let source: any[] = [];
    if (Array.isArray(internalCountries) && internalCountries.length > 0) {
      source = internalCountries;
    } else if (Array.isArray(COUNTRIES_DATA) && COUNTRIES_DATA.length > 0) {
      source = COUNTRIES_DATA;
    }

    const calculated = source.map((country: any) => {
      const countryName = country?.nama_negara || country?.country || country?.name_id || country?.name_en || "Negara";

      // Calculate capacities
      const capLaut = getInfraCapacityDetails("pangkalan_laut", country);
      const capUdara = getInfraCapacityDetails("pangkalan_udara", country);
      const barakCap = getInfraCapacityDetails("barak", country);
      const hangarCap = getInfraCapacityDetails("hangar_tank", country);
      const gudangCap = getInfraCapacityDetails("gudang_senjata", country);

      const daratUsed = (barakCap?.used || 0) + (hangarCap?.used || 0) + (gudangCap?.used || 0);
      const daratTotal = (barakCap?.totalCapacity || 0) + (hangarCap?.totalCapacity || 0) + (gudangCap?.totalCapacity || 0);

      const lautUsed = capLaut?.used || 0;
      const lautTotal = capLaut?.totalCapacity || 0;

      const udaraUsed = capUdara?.used || 0;
      const udaraTotal = capUdara?.totalCapacity || 0;

      const totalUsed = daratUsed + lautUsed + udaraUsed;
      const totalCapacity = daratTotal + lautTotal + udaraTotal;

      let iso = "";
      if (COUNTRIES_DATA && Array.isArray(COUNTRIES_DATA)) {
        const mapData = COUNTRIES_DATA.find((c: any) =>
          c.country && c.country.toLowerCase().trim() === countryName.toLowerCase().trim()
        );
        if (mapData?.iso) {
          iso = mapData.iso;
        }
      }
      if (!iso) {
        iso = country?.iso || country?.iso2 || country?.country_code || country?.kode_negara || country?.alpha2Code || country?.cca2 || "";
      }

      return {
        countryName,
        daratUsed,
        daratTotal,
        daratDisplay: `${formatNumber(daratUsed)} / ${formatNumber(daratTotal)}`,
        lautUsed,
        lautTotal,
        lautDisplay: `${formatNumber(lautUsed)} / ${formatNumber(lautTotal)}`,
        udaraUsed,
        udaraTotal,
        udaraDisplay: `${formatNumber(udaraUsed)} / ${formatNumber(udaraTotal)}`,
        totalUsed,
        totalCapacity,
        totalDisplay: `${formatNumber(totalUsed)} / ${formatNumber(totalCapacity)}`,
        iso,
      };
    });

    // Urutkan default berdasarkan totalUsed descending untuk penomoran ranking awal
    calculated.sort((a, b) => b.totalUsed - a.totalUsed);

    return calculated.map((item, index) => ({
      ...item,
      rank: index + 1,
    }));
  }, [internalCountries]);

  const filteredAndSortedRows = useMemo(() => {
    let result = [...rawRows];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(r => r.countryName.toLowerCase().includes(q));
    }

    if (sortConfig) {
      result.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        if (typeof aVal === 'string') {
          return sortConfig.direction === 'asc'
            ? (aVal as string).localeCompare(bVal as string)
            : (bVal as string).localeCompare(aVal as string);
        }
        return sortConfig.direction === 'asc'
          ? (aVal as number) - (bVal as number)
          : (bVal as number) - (aVal as number);
      });
    }

    return result;
  }, [rawRows, searchQuery, sortConfig]);

  const handleSort = (key: keyof CountryCapacityRow) => {
    let direction: 'asc' | 'desc' = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: keyof CountryCapacityRow) => {
    if (sortConfig.key !== key) return <span className="text-[#6B8A8A]/40 ml-1 text-xs">⇅</span>;
    if (sortConfig.direction === 'asc') return <ChevronUp className="h-3 w-3 ml-1 inline text-[#00FFAA]" />;
    return <ChevronDown className="h-3 w-3 ml-1 inline text-[#00FFAA]" />;
  };

  return (
    <div className="space-y-4">
      {/* Header Info & Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#0A1A1A] p-3.5 rounded-xl border border-[#00FFAA]/20">
        <div>
          <h3 className="text-sm font-black text-[#00FFAA] uppercase tracking-wider flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#00FFAA]" />
            Debug Kapasitas Space Militer 207 Negara
          </h3>
          <p className="text-[10px] font-semibold text-[#6B8A8A] mt-0.5">
            Rincian space terpakai vs space tersedia (digunakan / kapasitas) pada Matra Darat, Laut, dan Udara.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#6B8A8A]" />
          <input
            type="text"
            placeholder="Cari negara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0F2424] border border-[#00FFAA]/30 rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#E0E0E0] placeholder-[#6B8A8A] focus:outline-none focus:border-[#00FFAA] transition-colors"
          />
        </div>
      </div>

      {/* Tabel Data */}
      <div className="w-full overflow-hidden border border-[#00FFAA]/20 rounded-xl bg-[#0A1A1A] shadow-sm">
        <div className="max-h-[55vh] overflow-auto custom-scrollbar">
          <table className="w-full text-xs">
            <thead className="bg-[#0A1A1A] border-b border-[#00FFAA]/20 sticky top-0 z-10 text-[10px] sm:text-xs whitespace-nowrap">
              <tr>
                <th
                  className="px-3 py-2 text-left font-black text-[#00FFAA] uppercase tracking-wider w-12 cursor-pointer hover:bg-[#00FFAA]/10 transition-colors"
                  onClick={() => handleSort('rank')}
                >
                  Rank{getSortIcon('rank')}
                </th>
                <th
                  className="px-3 py-2 text-left font-black text-[#00FFAA] uppercase tracking-wider cursor-pointer hover:bg-[#00FFAA]/10 transition-colors"
                  onClick={() => handleSort('countryName')}
                >
                  Negara{getSortIcon('countryName')}
                </th>
                <th
                  className="px-3 py-2 text-right font-black text-[#00FFAA] uppercase tracking-wider cursor-pointer hover:bg-[#00FFAA]/10 transition-colors"
                  onClick={() => handleSort('daratUsed')}
                >
                  <span className="inline-flex items-center gap-1 justify-end">
                    <Swords className="w-3 h-3 text-rose-400 inline" /> Darat (Space)
                  </span>
                  {getSortIcon('daratUsed')}
                </th>
                <th
                  className="px-3 py-2 text-right font-black text-[#00FFAA] uppercase tracking-wider cursor-pointer hover:bg-[#00FFAA]/10 transition-colors"
                  onClick={() => handleSort('lautUsed')}
                >
                  <span className="inline-flex items-center gap-1 justify-end">
                    <Ship className="w-3 h-3 text-cyan-400 inline" /> Laut (Space)
                  </span>
                  {getSortIcon('lautUsed')}
                </th>
                <th
                  className="px-3 py-2 text-right font-black text-[#00FFAA] uppercase tracking-wider cursor-pointer hover:bg-[#00FFAA]/10 transition-colors"
                  onClick={() => handleSort('udaraUsed')}
                >
                  <span className="inline-flex items-center gap-1 justify-end">
                    <Plane className="w-3 h-3 text-indigo-400 inline" /> Udara (Space)
                  </span>
                  {getSortIcon('udaraUsed')}
                </th>
                <th
                  className="px-3 py-2 text-right font-black text-[#00FFAA] uppercase tracking-wider cursor-pointer hover:bg-[#00FFAA]/10 transition-colors"
                  onClick={() => handleSort('totalUsed')}
                >
                  <span className="inline-flex items-center gap-1 justify-end">
                    <Shield className="w-3 h-3 text-[#00FFAA] inline" /> Total Space
                  </span>
                  {getSortIcon('totalUsed')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#00FFAA]/10">
              {isLoading && filteredAndSortedRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-xs font-bold text-[#6B8A8A]">
                    Memuat data 207 negara…
                  </td>
                </tr>
              ) : filteredAndSortedRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-xs font-bold text-[#6B8A8A]">
                    Negara tidak ditemukan.
                  </td>
                </tr>
              ) : (
                filteredAndSortedRows.map((row) => {
                  const isUser = userCountryName && row.countryName.toLowerCase().trim() === userCountryName.toLowerCase().trim();
                  return (
                    <tr
                      key={row.countryName}
                      className={`hover:bg-[#00FFAA]/5 transition-colors ${
                        isUser ? 'bg-[#00FFAA]/10 font-bold border-l-2 border-l-[#00FFAA]' : ''
                      }`}
                    >
                      <td className="px-3 py-2 text-left font-bold text-[#6B8A8A]">
                        #{row.rank}
                      </td>
                      <td className="px-3 py-2 text-left font-bold text-[#E0E0E0]">
                        <div className="flex items-center gap-2">
                          {row.iso ? (
                            <img
                              src={`https://flagcdn.com/w20/${row.iso.toLowerCase()}.png`}
                              alt={row.countryName}
                              className="w-4 h-3 object-cover rounded-sm border border-white/20 shrink-0"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-4 h-3 bg-gray-600 rounded-sm shrink-0" />
                          )}
                          <span className={isUser ? 'text-[#00FFAA] font-black' : ''}>
                            {row.countryName} {isUser && '(Anda)'}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-right font-mono font-bold text-rose-300">
                        {row.daratDisplay}
                      </td>
                      <td className="px-3 py-2 text-right font-mono font-bold text-cyan-300">
                        {row.lautDisplay}
                      </td>
                      <td className="px-3 py-2 text-right font-mono font-bold text-indigo-300">
                        {row.udaraDisplay}
                      </td>
                      <td className="px-3 py-2 text-right font-mono font-black text-[#00FFAA]">
                        {row.totalDisplay}
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
