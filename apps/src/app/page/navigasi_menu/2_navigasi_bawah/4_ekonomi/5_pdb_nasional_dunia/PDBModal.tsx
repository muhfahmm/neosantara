"use client"
import React, { useState, useEffect } from "react";
import { X, TrendingUp, Search, User, ChevronUp, ChevronDown } from "lucide-react";
import {
  calculateTotalTaxIncome,
  calculateGoldIncome,
  calculateTotalMinistryCostPerDay,
} from "@/app/logic/economic_logic/treasuryUpdater";
import { COUNTRIES_DATA } from '@/app/page/map_system/map-data';
import { getRelationValue } from '@/../../json/database_hubungan_antar_negara/relationsRegistry';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  countryDetail: any;
  selectedCountry: any;
}

// --- HELPER GLOBAL UNTUK DATA SEMUA NEGARA (DIPINDAHKAN) ---
const LEVEL_UP_COST = [0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000];

const formatNumber = (num: number) => num.toLocaleString('id-ID');

const getDisplayName = (detail: any) =>
  detail?.name_id || detail?.nama_negara || detail?.country || detail?.country_name || detail?.__fileName || 'Unknown';

const extractFileOrder = (fileName: any) => {
  if (typeof fileName !== 'string') return NaN;
  const match = fileName.match(/^(\d+)/);
  return match ? Number(match[1]) : NaN;
};

const getContinentFromOrder = (order: number) => {
  if (Number.isNaN(order)) return 'Lainnya';
  if (order >= 1 && order <= 51) return 'Africa';
  if (order >= 54 && order <= 102) return 'Asia';
  if (order >= 103 && order <= 151) return 'Europe';
  if (order >= 152 && order <= 178) return 'North America';
  if (order >= 179 && order <= 194) return 'Oceania';
  if (order >= 195 && order <= 207) return 'South America';
  return 'Lainnya';
};

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

const getInitialCountriesData = () => {
  return COUNTRIES_DATA.map((c, idx) => {
    return {
      ...c,
      __displayName: c.country,
      continent: normalizeContinent(c.continent),
      __fileOrder: idx + 1,
      __loaded: false,
    };
  });
};

let cachedAllCountries: any[] = getInitialCountriesData();
let cachedDataVersion: number | null = null;

// --- KOMPONEN DATA NEGARA ---
function AllCountriesGDP({ playerCountryName, playerCountryDetail }: { playerCountryName: string; playerCountryDetail?: any }) {
  const [allCountries, setAllCountries] = useState<any[]>(() => cachedAllCountries || getInitialCountriesData());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({
    key: 'net',
    direction: 'desc',
  });

  const fetchAndProcessAllCountries = async () => {
    const res = await fetch('/api/country-data?all=true', { cache: 'no-store' });
    const data = await res.json();
    if (!Array.isArray(data)) return null;

    const countryToContinentMap = new Map<string, string>();
    COUNTRIES_DATA.forEach((c) => {
      countryToContinentMap.set(c.country.toLowerCase(), c.continent);
    });

    return data.map((country) => {
      const name = getDisplayName(country);
      const listOrder = extractFileOrder(country.__fileName || country.filename || name);
      const continent = normalizeContinent(
        country.__continent ||
        country.continent ||
        countryToContinentMap.get(name.toLowerCase()) ||
        getContinentFromOrder(listOrder)
      );
      return { ...country, __displayName: name, continent, __fileOrder: listOrder, __loaded: true };
    });
  };

  useEffect(() => {
    const prefetch = async () => {
      try {
        const processed = await fetchAndProcessAllCountries();
        if (processed) {
          cachedAllCountries = processed;
          setAllCountries(processed);
        }
      } catch (e) {
        console.warn('Background prefetch failed:', e);
      }
    };
    prefetch();
  }, []);

  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch('/api/country-data-version', { cache: 'no-store' });
        const { version } = await res.json();
        if (cachedDataVersion !== null && version !== cachedDataVersion) {
          cachedDataVersion = version;
          setIsRefreshing(true);
          try {
            const processed = await fetchAndProcessAllCountries();
            if (processed) {
              cachedAllCountries = processed;
              setAllCountries(processed);
            }
          } finally {
            setIsRefreshing(false);
          }
        } else {
          cachedDataVersion = version;
        }
      } catch (e) {
        // abaikan error polling
      }
    };
    poll();
    const interval = setInterval(poll, 3000);
    return () => clearInterval(interval);
  }, []);

  const computeTaxValue = (detail: any) => calculateTotalTaxIncome(detail);
  const computeGoldValue = (detail: any) => calculateGoldIncome(detail);
  const computeMinistryCost = (detail: any) => calculateTotalMinistryCostPerDay(detail);

  const handleSort = (key: string) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc',
    }));
  };

    const renderSortArrow = (key: string) => {
    if (sortConfig.key !== key) return <span className="text-[#6B8A8A]/40 ml-1 text-xs font-normal">⇅</span>;
    if (sortConfig.direction === 'asc') return <ChevronUp className="h-3 w-3 ml-1 inline text-[#00FFAA]" />;
    return <ChevronDown className="h-3 w-3 ml-1 inline text-[#00FFAA]" />;
  };

  const renderSkeleton = (w = "w-16") => (
    <span className={`inline-block ${w} h-3.5 bg-[#6B8A8A]/20 animate-pulse rounded-md align-middle`} />
  );

  const renderAllRows = () => {
    const normPlayerCountry = String(playerCountryName || '').toLowerCase().trim();

    let rows = allCountries.map((country) => {
      const name = country.__displayName || getDisplayName(country);
      const isPlayerCountry = String(name || '').toLowerCase().trim() === normPlayerCountry;

      // Gunakan playerCountryDetail jika ada agar selalu akurat dengan state player real-time
      const targetDetail = (isPlayerCountry && playerCountryDetail) ? playerCountryDetail : country;
      const isLoaded = country.__loaded === true || isPlayerCountry;

      const tax = isLoaded ? computeTaxValue(targetDetail) : 0;
      const gold = isLoaded ? computeGoldValue(targetDetail) : 0;
      const ministry = isLoaded ? computeMinistryCost(targetDetail) : 0;
      const net = tax + gold - ministry;
      const continent = normalizeContinent(targetDetail.continent || country.continent || getContinentFromOrder(country.__fileOrder));
      const hasEkstraksiData = targetDetail.uranium !== undefined || targetDetail.batu_bara !== undefined || targetDetail.minyak_bumi !== undefined || targetDetail.gas_alam !== undefined;
      const buildingCount = isLoaded && hasEkstraksiData && typeof targetDetail.emas === 'number' ? targetDetail.emas : 0;
      const relation = isLoaded ? getRelationValue(playerCountryName, name) : 50;

      return {
        name,
        continent,
        relation,
        tax,
        gold,
        ministry,
        net,
        order: country.__fileOrder,
        buildingCount,
        isLoaded,
      };
    });

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      rows = rows.filter((item) => item.name.toLowerCase().includes(q) || item.continent.toLowerCase().includes(q));
    }

    if (rows.length === 0) {
      return (
        <tr>
          <td className="px-4 py-6 text-center text-sm font-bold text-[#6B8A8A]" colSpan={8}>
            Tidak ada data yang cocok dengan pencarian "{searchQuery}".
          </td>
        </tr>
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

    return sortedRows.map((row, index) => {
      const isPlayer = String(row.name || '').toLowerCase().trim() === normPlayerCountry;

      return (
        <tr
          key={`${row.name}-${index}`}
          className={
            isPlayer
              ? 'bg-[#00FFAA]/15 border-l-4 border-l-[#00FFAA] font-bold'
              : index % 2 === 0
                ? 'bg-[#0F2424]'
                : 'bg-[#0A1A1A]'
          }
        >
          <td className="px-4 py-3 text-xs font-bold text-[#E0E0E0] border-b border-[#00FFAA]/10">
            {isPlayer ? (
              <div className="flex items-center gap-1.5 text-[#00FFAA] font-black">
                <User className="w-4 h-4 text-[#00FFAA] flex-shrink-0" />
                <span>{row.name}</span>
                <span className="bg-[#00FFAA] text-[#0A1A1A] text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider ml-1 shadow-sm">
                  Anda
                </span>
              </div>
            ) : (
              row.name
            )}
          </td>
          <td className={`px-4 py-3 text-xs font-bold border-b border-[#00FFAA]/10 ${isPlayer ? 'text-[#00FFAA] font-black' : 'text-[#6B8A8A]'}`}>
            {row.isLoaded ? row.continent : renderSkeleton("w-14")}
          </td>
          <td className="px-4 py-3 text-center text-xs font-bold border-b border-[#00FFAA]/10">
            {row.isLoaded ? (
              isPlayer ? (
                <span className="inline-block px-2.5 py-0.5 rounded-md bg-[#00FFAA] text-[#0A1A1A] font-black text-xs shadow-sm">
                  100
                </span>
              ) : row.relation >= 75 ? (
                <span className="inline-block px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-extrabold text-xs">
                  {row.relation}
                </span>
              ) : row.relation >= 50 ? (
                <span className="inline-block px-2.5 py-0.5 rounded-md bg-[#0F2424] text-[#E0E0E0] border border-[#00FFAA]/30 font-extrabold text-xs">
                  {row.relation}
                </span>
              ) : (
                <span className="inline-block px-2.5 py-0.5 rounded-md bg-rose-500/20 text-rose-400 border border-rose-500/30 font-extrabold text-xs">
                  {row.relation}
                </span>
              )
            ) : (
              renderSkeleton("w-10")
            )}
          </td>
          <td className="px-4 py-3 text-right font-bold text-xs text-[#E0E0E0] border-b border-[#00FFAA]/10">
            {row.isLoaded ? formatNumber(row.tax) : renderSkeleton("w-14")}
          </td>
          <td className="px-4 py-3 text-right font-bold text-xs text-[#E0E0E0] border-b border-[#00FFAA]/10">
            {row.isLoaded ? (row.buildingCount > 0 ? row.buildingCount : '-') : renderSkeleton("w-8")}
          </td>
          <td className="px-4 py-3 text-right font-bold text-xs text-[#E0E0E0] border-b border-[#00FFAA]/10">
            {row.isLoaded ? formatNumber(row.gold) : renderSkeleton("w-14")}
          </td>
          <td className="px-4 py-3 text-right font-bold text-xs text-[#E0E0E0] border-b border-[#00FFAA]/10">
            {row.isLoaded ? formatNumber(row.ministry) : renderSkeleton("w-14")}
          </td>
          <td className={`px-4 py-3 text-right font-black text-xs border-b border-[#00FFAA]/10 ${row.isLoaded ? (row.net >= 0 ? 'text-emerald-400' : 'text-rose-400') : ''}`}>
            {row.isLoaded ? `${row.net >= 0 ? '+' : ''}${formatNumber(row.net)}` : renderSkeleton("w-16")}
          </td>
        </tr>
      );
    });
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col space-y-4">
      <div className="flex justify-between items-center gap-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[#6B8A8A] font-black uppercase tracking-wider">
            {isRefreshing ? 'Memperbarui data...' : 'Live update aktif'}
          </span>
          <span className={`inline-block w-2 h-2 rounded-full ${isRefreshing ? 'bg-yellow-400 animate-ping' : 'bg-emerald-400'}`} />
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Cari negara / benua..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 pr-3 py-1.5 rounded-lg bg-[#0A1A1A] border border-[#00FFAA]/30 text-sm font-bold text-[#E0E0E0] outline-none focus:border-[#00FFAA] w-48 transition-all placeholder:text-[#6B8A8A]"
          />
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#6B8A8A]" />
        </div>
      </div>

      <div className="flex-1 min-h-0 border border-[#00FFAA]/30 rounded-xl bg-[#0A1A1A] overflow-hidden flex flex-col">
        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#0A1A1A] border-b border-[#00FFAA]/30 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 font-black text-[#00FFAA] uppercase tracking-wider cursor-pointer hover:bg-[#0F2424] transition-colors" onClick={() => handleSort('name')}>Nama Negara{renderSortArrow('name')}</th>
                <th className="px-4 py-3 font-black text-[#00FFAA] uppercase tracking-wider cursor-pointer hover:bg-[#0F2424] transition-colors" onClick={() => handleSort('continent')}>Benua{renderSortArrow('continent')}</th>
                <th className="px-4 py-3 font-black text-[#00FFAA] uppercase tracking-wider text-center cursor-pointer hover:bg-[#0F2424] transition-colors" onClick={() => handleSort('relation')}>Hubungan{renderSortArrow('relation')}</th>
                <th className="px-4 py-3 font-black text-[#00FFAA] uppercase tracking-wider text-right cursor-pointer hover:bg-[#0F2424] transition-colors" onClick={() => handleSort('tax')}>Total Pajak{renderSortArrow('tax')}</th>
                <th className="px-4 py-3 font-black text-[#00FFAA] uppercase tracking-wider text-right cursor-pointer hover:bg-[#0F2424] transition-colors" onClick={() => handleSort('buildingCount')}>Bangunan Emas{renderSortArrow('buildingCount')}</th>
                <th className="px-4 py-3 font-black text-[#00FFAA] uppercase tracking-wider text-right cursor-pointer hover:bg-[#0F2424] transition-colors" onClick={() => handleSort('gold')}>Produksi Emas{renderSortArrow('gold')}</th>
                <th className="px-4 py-3 font-black text-[#00FFAA] uppercase tracking-wider text-right cursor-pointer hover:bg-[#0F2424] transition-colors" onClick={() => handleSort('ministry')}>Pengeluaran{renderSortArrow('ministry')}</th>
                <th className="px-4 py-3 font-black text-[#00FFAA] uppercase tracking-wider text-right cursor-pointer hover:bg-[#0F2424] transition-colors" onClick={() => handleSort('net')}>Netto APBN{renderSortArrow('net')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#00FFAA]/10">{renderAllRows()}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// --- KOMPONEN UTAMA PDB MODAL ---
export default function PDBModal({ isOpen, onClose, countryDetail, selectedCountry }: ModalProps) {
  if (!isOpen) return null;
  const countryName = selectedCountry?.country || countryDetail?.country || countryDetail?.nama_negara || countryDetail?.name_id || "Indonesia";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none">
      <div className="bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans pointer-events-auto">

        <div className="px-6 py-4 border-b border-[#00FFAA]/30 flex items-center justify-between bg-[#0A1A1A] relative z-10 flex-shrink-0">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#0F2424] rounded-xl border border-[#00FFAA]/30">
                <TrendingUp className="h-6 w-6 text-[#00FFAA]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#00FFAA] tracking-tight leading-none uppercase">Produk Domestik Bruto (PDB)</h2>
              </div>
            </div>
          </div>

          <button onClick={onClose} className="p-2 sm:p-2.5 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] text-[#6B8A8A] hover:text-[#00FFAA] transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 min-h-0 flex flex-col p-6 bg-[#0F2424] relative z-10">
          <p className="text-xs text-[#6B8A8A] font-semibold leading-relaxed mb-4 flex-shrink-0">
            PDB mengukur kekuatan ekonomi makro kedaulatan {countryName}. Pertumbuhan positif meningkatkan daya tawar diplomasi Anda.
            <span className="ml-1 text-[#00FFAA] font-black">(Data APBN Seluruh Negara Di Bawah Ini)</span>
          </p>

          {/* --- DATA APBN SEMUA NEGARA YANG DIPINDAHKAN --- */}
          <AllCountriesGDP playerCountryName={countryName} playerCountryDetail={countryDetail} />
        </div>
      </div>
    </div>
  );
}