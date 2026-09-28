"use client"
import React, { useState, useEffect } from "react";
import { X, TrendingUp, Search, User, ChevronUp, ChevronDown } from "lucide-react";
import {
  calculateTotalTaxIncome,
  calculateGoldIncome,
  calculateTotalMinistryCostPerDay,
} from "@/app/logic/economic_logic/treasuryUpdater";
import { calculateGoldMiningDailyProduction } from "@/app/logic/economic_logic/goldIncome";
import { INITIAL_SUBSIDY_ITEMS, calculateSubsidySummary } from "../8_kebijakan_subsidi/logic/logikaSubsidi";
import { COUNTRIES_DATA } from '@/app/page/map_system/map-data';
import { getRelationValue } from '@/../../json/database_hubungan_antar_negara/relationsRegistry';
import { PROFILES_DATA } from '@/../../json/semua_fitur_negara/0_profiles/index';
import { DATABASE_PAJAK_NEGARA } from '@/../../json/database_pajak_negara/index';
import { DATABASE_ALOKASI_SUBSIDI } from '@/../../json/database_alokasi_subsidi/index';
import { DATABASE_LEVEL_KABINET } from '@/../../json/database_level_kabinet/index';

const getNormalizedSlug = (detail: any) => {
  if (!detail) return '';
  const raw = String(detail.country_slug || detail.slug || detail.id || detail.country || detail.name_id || '').toLowerCase().trim();
  return raw.replace(/[\s-]+/g, '_');
};

const getTaxData = (detail: any) => {
  if (!detail) return {};
  const slug = getNormalizedSlug(detail);
  const stripped = slug.replace(/^republik_/, '').replace(/^republic_of_/, '');
  return DATABASE_PAJAK_NEGARA[slug] || DATABASE_PAJAK_NEGARA[stripped] || {};
};

const getSubsidyData = (detail: any) => {
  if (!detail) return {};
  const slug = getNormalizedSlug(detail);
  const stripped = slug.replace(/^republik_/, '').replace(/^republic_of_/, '');
  const dashSlug = slug.replace(/_/g, '-');
  const dashStripped = stripped.replace(/_/g, '-');
  return (
    DATABASE_ALOKASI_SUBSIDI[slug] ||
    DATABASE_ALOKASI_SUBSIDI[dashSlug] ||
    DATABASE_ALOKASI_SUBSIDI[stripped] ||
    DATABASE_ALOKASI_SUBSIDI[dashStripped] ||
    {}
  );
};

const getKabinetData = (detail: any) => {
  if (!detail) return {};
  const slug = getNormalizedSlug(detail);
  const stripped = slug.replace(/^republik_/, '').replace(/^republic_of_/, '');
  const dashSlug = slug.replace(/_/g, '-');
  const dashStripped = stripped.replace(/_/g, '-');
  return (
    DATABASE_LEVEL_KABINET[slug] ||
    DATABASE_LEVEL_KABINET[dashSlug] ||
    DATABASE_LEVEL_KABINET[stripped] ||
    DATABASE_LEVEL_KABINET[dashStripped] ||
    {}
  );
};

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  countryDetail: any;
  selectedCountry: any;
  prefetchedAllCountries?: any[];
}

const computeTaxValue = (detail: any) => {
  const taxData = getTaxData(detail);
  const formattedDetail = {
    ...detail,
    pajak: detail?.pajak || {
      ppn: { tarif: taxData.tarif_ppn ?? 10 },
      korporasi: { tarif: taxData.tarif_korporasi ?? 22 },
      penghasilan: { tarif: taxData.tarif_penghasilan ?? 15 },
      bea_cukai: { tarif: taxData.tarif_bea_cukai ?? 15 },
      lingkungan: { tarif: taxData.tarif_lingkungan ?? 5 },
    },
    income_tax: detail?.income_tax ?? taxData.tarif_penghasilan,
    corporate: detail?.corporate ?? taxData.tarif_korporasi,
    ppn: detail?.ppn ?? taxData.tarif_ppn,
    cigarette_tax: detail?.cigarette_tax ?? taxData.tarif_bea_cukai,
    environment_tax: detail?.environment_tax ?? taxData.tarif_lingkungan,
  };
  return calculateTotalTaxIncome(formattedDetail);
};

const computeGoldValue = (detail: any) => {
  const emasCount = typeof detail?.emas === 'number' ? detail.emas : 0;
  return calculateGoldMiningDailyProduction({ ...detail, emas: emasCount });
};

const computeMinistryCost = (detail: any) => {
  const kabData = getKabinetData(detail);
  const merged = { ...kabData, ...detail };
  return calculateTotalMinistryCostPerDay(merged);
};

const computeSubsidyCost = (detail: any) => {
  if (!detail || typeof detail !== 'object') return 424;
  if (typeof detail?.total_subsidy_cost === 'number') {
    return detail.total_subsidy_cost;
  }
  const subData = getSubsidyData(detail) as Record<string, any>;
  const subsidyStates = detail?.subsidy_states as Record<string, boolean> | undefined;

  const items = INITIAL_SUBSIDY_ITEMS.map((item) => {
    const dbValue = subData[item.id];
    const isSub = subsidyStates
      ? (subsidyStates[item.id] ?? (dbValue !== undefined ? dbValue : item.isSubsidized))
      : (detail[item.id] ?? detail[item.id.toLowerCase()] ?? (dbValue !== undefined ? dbValue : item.isSubsidized));
    const normalizedIsSub = (isSub === 0 || isSub === "0" || isSub === false || isSub === "false") ? false : Boolean(isSub);
    return { ...item, isSubsidized: normalizedIsSub };
  });
  return calculateSubsidySummary(items).totalCost;
};

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
  const profileMap = new Map<string, any>();
  PROFILES_DATA.forEach((p) => {
    const k1 = p.country_slug.toLowerCase().trim();
    const k2 = p.name_id.toLowerCase().trim();
    const k3 = p.name_en.toLowerCase().trim();
    profileMap.set(k1, p);
    profileMap.set(k2, p);
    profileMap.set(k3, p);
    profileMap.set(k1.replace(/_/g, ' '), p);
    profileMap.set(k1.replace(/_/g, '-'), p);
    profileMap.set(k2.replace(/[\s-]+/g, '_'), p);
  });

  return COUNTRIES_DATA.map((c, idx) => {
    const rawName = c.country.toLowerCase().trim();
    const stripped = rawName.replace(/^republik\s+/, '').replace(/^republic of\s+/, '').trim();
    const p =
      profileMap.get(rawName) ||
      profileMap.get(rawName.replace(/[\s-]+/g, '_')) ||
      profileMap.get(rawName.replace(/[\s_]+/g, '-')) ||
      profileMap.get(stripped) ||
      profileMap.get(stripped.replace(/[\s-]+/g, '_')) ||
      profileMap.get(stripped.replace(/[\s_]+/g, '-')) ||
      {};
    const kabData = getKabinetData(p.country_slug ? p : c);

    return {
      ...c,
      ...p,
      ...kabData,
      __displayName: c.country,
      continent: normalizeContinent(c.continent),
      __fileOrder: idx + 1,
      __loaded: true,
    };
  });
};

let cachedAllCountries: any[] = getInitialCountriesData();

// --- KOMPONEN DATA NEGARA ---
function AllCountriesGDP({
  playerCountryName,
  playerCountryDetail,
  prefetchedAllCountries,
}: {
  playerCountryName: string;
  playerCountryDetail?: any;
  prefetchedAllCountries?: any[];
}) {
  const [allCountries, setAllCountries] = useState<any[]>(() => {
    if (Array.isArray(prefetchedAllCountries) && prefetchedAllCountries.length > 0) {
      return prefetchedAllCountries.map((c, idx) => ({
        ...c,
        __displayName: getDisplayName(c),
        continent: normalizeContinent(c.__continent || c.continent || getContinentFromOrder(idx + 1)),
        __fileOrder: idx + 1,
        __loaded: true,
      }));
    }
    return cachedAllCountries || getInitialCountriesData();
  });

  const [searchQuery, setSearchQuery] = useState('');
  // ✅ DEFAULT SORT: Netto APBN terbanyak dulu
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({
    key: 'net',
    direction: 'desc',
  });

  useEffect(() => {
    if (Array.isArray(prefetchedAllCountries) && prefetchedAllCountries.length > 0) {
      const processed = prefetchedAllCountries.map((c, idx) => ({
        ...c,
        __displayName: getDisplayName(c),
        continent: normalizeContinent(c.__continent || c.continent || getContinentFromOrder(idx + 1)),
        __fileOrder: idx + 1,
        __loaded: true,
      }));
      cachedAllCountries = processed;
      setAllCountries(processed);
    } else {
      fetch('/api/country-data?all=true')
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            const processed = data.map((c, idx) => ({
              ...c,
              __displayName: getDisplayName(c),
              continent: normalizeContinent(c.__continent || c.continent || getContinentFromOrder(idx + 1)),
              __fileOrder: idx + 1,
              __loaded: true,
            }));
            cachedAllCountries = processed;
            setAllCountries(processed);
          }
        })
        .catch((err) => console.warn('PDBModal: failed to fetch all country data', err));
    }
  }, [prefetchedAllCountries]);

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

      const targetDetail = (isPlayerCountry && playerCountryDetail) ? playerCountryDetail : country;
      const isLoaded = country.__loaded === true || isPlayerCountry;

      const emasCount = typeof targetDetail?.emas === 'number' ? targetDetail.emas : 0;

      const tax = isLoaded ? computeTaxValue(targetDetail) : 0;
      const gold = isLoaded ? computeGoldValue({ ...targetDetail, emas: emasCount }) : 0;
      const pdb = tax + gold; // Total PDB Bruto = Pajak + Produksi Emas
      const dewanKabinetCost = isLoaded ? computeMinistryCost(targetDetail) : 0;
      const subsidyCost = isLoaded ? computeSubsidyCost(targetDetail) : 0;
      const totalPengeluaran = dewanKabinetCost + subsidyCost;
      const net = pdb - totalPengeluaran;
      const continent = normalizeContinent(targetDetail.continent || country.continent || getContinentFromOrder(country.__fileOrder));
      const buildingCount = isLoaded ? emasCount : 0;
      const relation = isLoaded ? getRelationValue(playerCountryName, name) : 50;

      return {
        name,
        continent,
        relation,
        tax,
        gold,
        buildingCount,
        pdb,
        subsidyCost,
        governmentCost: dewanKabinetCost,
        totalPengeluaran,
        net,
        order: country.__fileOrder,
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
          <td className="px-4 py-6 text-center text-sm font-bold text-[#6B8A8A]" colSpan={6}>
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
          <td className="px-1.5 sm:px-2 lg:px-2 py-1.5 lg:py-2 text-[10px] sm:text-[11px] lg:text-xs font-bold text-[#E0E0E0] border-b border-[#00FFAA]/10 truncate">
            {isPlayer ? (
              <div className="flex items-center gap-1 text-[#00FFAA] font-black truncate">
                <User className="w-3.5 h-3.5 text-[#00FFAA] flex-shrink-0" />
                <span className="truncate">{row.name}</span>
                <span className="bg-[#00FFAA] text-[#0A1A1A] text-[8px] px-1 py-0.2 rounded-full font-black uppercase tracking-wider flex-shrink-0 shadow-sm">
                  Anda
                </span>
              </div>
            ) : (
              <span className="truncate block">{row.name}</span>
            )}
          </td>
          <td className="px-1 sm:px-1.5 py-1.5 lg:py-2 text-right font-bold text-[10px] sm:text-[11px] lg:text-xs text-[#E0E0E0] border-b border-[#00FFAA]/10 whitespace-nowrap">
            {row.isLoaded ? formatNumber(row.tax) : renderSkeleton("w-12")}
          </td>
          <td className="px-1 sm:px-1.5 py-1.5 lg:py-2 text-right font-bold text-[10px] sm:text-[11px] lg:text-xs text-amber-300 border-b border-[#00FFAA]/10 whitespace-nowrap">
            {row.isLoaded ? (row.buildingCount > 0 ? `${row.buildingCount} (${formatNumber(row.gold)} EM)` : '0') : renderSkeleton("w-16")}
          </td>
          <td className="px-1 sm:px-1.5 py-1.5 lg:py-2 text-right font-bold text-[10px] sm:text-[11px] lg:text-xs text-rose-400 border-b border-[#00FFAA]/10 whitespace-nowrap" title={`Pengeluaran Subsidi: ${formatNumber(row.subsidyCost)} EM`}>
            {row.isLoaded ? formatNumber(row.subsidyCost) : renderSkeleton("w-12")}
          </td>
          <td className="px-1 sm:px-1.5 py-1.5 lg:py-2 text-right font-bold text-[10px] sm:text-[11px] lg:text-xs text-rose-400 border-b border-[#00FFAA]/10 whitespace-nowrap" title={`Pengeluaran Kabinet: ${formatNumber(row.governmentCost)} EM`}>
            {row.isLoaded ? formatNumber(row.governmentCost) : renderSkeleton("w-12")}
          </td>
          <td className={`px-1 sm:px-1.5 py-1.5 lg:py-2 text-right font-black text-[10px] sm:text-[11px] lg:text-xs border-b border-[#00FFAA]/10 whitespace-nowrap ${row.isLoaded ? (row.net >= 0 ? 'text-emerald-400' : 'text-rose-400') : ''}`} title={`Total Pemasukan: ${formatNumber(row.pdb)} EM - Total Pengeluaran: ${formatNumber(row.totalPengeluaran)} EM = Netto: ${formatNumber(row.net)} EM`}>
            {row.isLoaded ? `${row.net >= 0 ? '+' : ''}${formatNumber(row.net)}` : renderSkeleton("w-14")}
          </td>
        </tr>
      );
    });
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col space-y-3">
      <div className="flex justify-between items-center gap-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[#6B8A8A] font-black uppercase tracking-wider">
            Data APBN Instan (207 Negara)
          </span>
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" />
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Cari negara / benua..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 pr-3 py-1 rounded-lg bg-[#0A1A1A] border border-[#00FFAA]/30 text-xs sm:text-sm font-bold text-[#E0E0E0] outline-none focus:border-[#00FFAA] w-40 sm:w-48 transition-all placeholder:text-[#6B8A8A]"
          />
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#6B8A8A]" />
        </div>
      </div>

      <div className="flex-1 min-h-0 border border-[#00FFAA]/30 rounded-xl bg-[#0A1A1A] overflow-hidden flex flex-col">
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden custom-scrollbar">
          <table className="w-full table-fixed text-xs text-left">
            <thead className="bg-[#0A1A1A] border-b border-[#00FFAA]/30 sticky top-0 z-10">
              <tr>
                <th className="w-[20%] px-1 sm:px-1.5 py-2 text-[9px] sm:text-[10px] lg:text-[11px] font-black text-[#00FFAA] uppercase tracking-wider cursor-pointer hover:bg-[#0F2424] transition-colors leading-tight" onClick={() => handleSort('name')}>Nama Negara{renderSortArrow('name')}</th>
                <th className="w-[14%] px-1 sm:px-1.5 py-2 text-[9px] sm:text-[10px] lg:text-[11px] font-black text-[#00FFAA] uppercase tracking-wider text-right cursor-pointer hover:bg-[#0F2424] transition-colors leading-tight" onClick={() => handleSort('tax')}>Total Pajak{renderSortArrow('tax')}</th>
                <th className="w-[16%] px-1 sm:px-1.5 py-2 text-[9px] sm:text-[10px] lg:text-[11px] font-black text-[#00FFAA] uppercase tracking-wider text-right cursor-pointer hover:bg-[#0F2424] transition-colors leading-tight" onClick={() => handleSort('gold')}>Emas{renderSortArrow('gold')}</th>
                <th className="w-[18%] px-1 sm:px-1.5 py-2 text-[9px] sm:text-[10px] lg:text-[11px] font-black text-rose-400 uppercase tracking-wider text-right cursor-pointer hover:bg-[#0F2424] transition-colors leading-tight" onClick={() => handleSort('subsidyCost')}>Pengeluaran Subsidi{renderSortArrow('subsidyCost')}</th>
                <th className="w-[18%] px-1 sm:px-1.5 py-2 text-[9px] sm:text-[10px] lg:text-[11px] font-black text-rose-400 uppercase tracking-wider text-right cursor-pointer hover:bg-[#0F2424] transition-colors leading-tight" onClick={() => handleSort('governmentCost')}>Pengeluaran Kabinet{renderSortArrow('governmentCost')}</th>
                <th className="w-[14%] px-1 sm:px-1.5 py-2 text-[9px] sm:text-[10px] lg:text-[11px] font-black text-[#00FFAA] uppercase tracking-wider text-right cursor-pointer hover:bg-[#0F2424] transition-colors leading-tight" onClick={() => handleSort('net')}>Netto APBN{renderSortArrow('net')}</th>
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
export default function PDBModal({ isOpen, onClose, countryDetail, selectedCountry, prefetchedAllCountries }: ModalProps) {
  if (!isOpen) return null;
  const countryName = selectedCountry?.country || countryDetail?.country || countryDetail?.nama_negara || countryDetail?.name_id || "Indonesia";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none">
      <div className="bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans pointer-events-auto">

        <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-[#00FFAA]/20 flex items-center justify-between bg-[#0A1A1A] relative z-10 gap-2 shrink-0 rounded-t-2xl">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1 sm:p-1.5 bg-[#0F2424] rounded-lg border border-[#00FFAA]/30 shrink-0">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-[#00FFAA]" />
            </div>
            <div>
              <h2 className="text-base sm:text-xl font-bold text-[#00FFAA] tracking-tight leading-none uppercase">Produk Domestik Bruto (PDB)</h2>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 lg:p-2 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] text-[#6B8A8A] hover:text-[#00FFAA] hover:border-[#00FFAA] transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1 shadow-sm">
            <span className="text-[10px] lg:text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 min-h-0 flex flex-col p-4 lg:p-6 bg-[#0F2424] relative z-10">
          <p className="text-[11px] lg:text-xs text-[#6B8A8A] font-semibold leading-relaxed mb-3 lg:mb-4 flex-shrink-0">
            PDB mengukur kekuatan ekonomi makro kedaulatan {countryName}. Pertumbuhan positif meningkatkan daya tawar diplomasi Anda.
            <span className="ml-1 text-[#00FFAA] font-black">(Data APBN Seluruh Negara Di Bawah Ini)</span>
          </p>

          {/* --- DATA APBN SEMUA NEGARA --- */}
          <AllCountriesGDP playerCountryName={countryName} playerCountryDetail={countryDetail} prefetchedAllCountries={prefetchedAllCountries} />
        </div>
      </div>
    </div>
  );
}