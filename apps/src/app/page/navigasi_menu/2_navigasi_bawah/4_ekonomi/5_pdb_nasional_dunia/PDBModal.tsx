"use client"
import React, { useState, useEffect } from "react";
import { X, TrendingUp, Search, User, ChevronUp, ChevronDown } from "lucide-react";
import {
  calculateTotalTaxIncome,
  calculateGoldIncome,
  calculateTotalMinistryCostPerDay,
  getCommercialTotalIncome,
} from "@/app/logic/economic_logic/treasuryUpdater";
import { calculateGoldMiningDailyProduction } from "@/app/logic/economic_logic/goldIncome";
import { INITIAL_SUBSIDY_ITEMS, calculateSubsidySummary } from "@/../../json/database_kebijakan_subsidi/index";
import { COUNTRIES_DATA } from '@/app/page/map_system/map-data';
import { getRelationValue } from '@/../../json/database_hubungan_antar_negara/relationsRegistry';

const getNormalizedSlug = (detail: any) => {
  if (!detail) return '';
  const raw = String(detail.country_slug || detail.slug || detail.id || detail.country || detail.name_id || '').toLowerCase().trim();
  return raw.replace(/[\s-]+/g, '_');
};

const getTaxData = (detail: any) => {
  if (!detail) return {};
  if (detail.pajak && typeof detail.pajak === 'object') {
    return {
      tarif_ppn: detail.pajak.ppn?.tarif ?? 0,
      tarif_korporasi: detail.pajak.korporasi?.tarif ?? 0,
      tarif_penghasilan: detail.pajak.penghasilan?.tarif ?? 0,
      tarif_bea_cukai: detail.pajak.bea_cukai?.tarif ?? 0,
      tarif_lingkungan: detail.pajak.lingkungan?.tarif ?? 0,
    };
  }
  return {
    tarif_ppn: detail.ppn ?? detail.tarif_ppn ?? 0,
    tarif_korporasi: detail.corporate ?? detail.tarif_korporasi ?? 0,
    tarif_penghasilan: detail.income_tax ?? detail.tarif_penghasilan ?? 0,
    tarif_bea_cukai: detail.cigarette_tax ?? detail.tarif_bea_cukai ?? 0,
    tarif_lingkungan: detail.environment_tax ?? detail.tarif_lingkungan ?? 0,
  };
};

const getSubsidyData = (detail: any) => {
  if (!detail) return {};
  if (detail.subsidy_states && typeof detail.subsidy_states === 'object') {
    return detail.subsidy_states;
  }
  const subsKeys = ['sub_bbm','sub_listrik','sub_lpg','sub_pdam','sub_pupuk','sub_sembako',
    'sub_bantuan_pangan','sub_pendidikan','sub_bpjs','sub_vaksin','sub_transport_publik',
    'sub_perumahan','sub_ev','sub_kur','sub_pajak_umkm','sub_blt','sub_pensiun','sub_bencana'];
  const result: Record<string, any> = {};
  for (const k of subsKeys) {
    if (detail[k] !== undefined) result[k] = detail[k];
  }
  return result;
};

const getKabinetData = (detail: any) => {
  if (!detail) return {};
  return detail;
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
  return COUNTRIES_DATA.map((c, idx) => ({
    ...c,
    __displayName: c.country,
    continent: normalizeContinent(c.continent),
    __fileOrder: idx + 1,
    __loaded: false,
  }));
};

let cachedAllCountries: any[] = getInitialCountriesData();

// ================================================================
// ✅ HELPER: KATEGORI PERINGKAT & WARNA
// ================================================================
type RankCategory = 'kaya' | 'berkembang' | 'miskin';

const getRankCategory = (rank: number): RankCategory => {
  if (rank <= 30) return 'kaya';       // Peringkat 1-30
  if (rank <= 130) return 'berkembang'; // Peringkat 31-130
  return 'miskin';                      // Peringkat 131+
};

const getRankStyles = (rank: number) => {
  const category = getRankCategory(rank);
  switch (category) {
    case 'kaya':
      return {
        rowBg: 'bg-emerald-950/45',
        rowBorder: 'border-l-4 border-l-emerald-500',
        noBadge: 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/50',
        label: '🟢 Kaya',
        textColor: 'text-emerald-300',
      };
    case 'berkembang':
      return {
        rowBg: 'bg-amber-950/35',
        rowBorder: 'border-l-4 border-l-amber-500',
        noBadge: 'bg-amber-500/25 text-amber-300 border border-amber-500/50',
        label: '🟡 Berkembang',
        textColor: 'text-amber-300',
      };
    case 'miskin':
    default:
      return {
        rowBg: 'bg-rose-950/35',
        rowBorder: 'border-l-4 border-l-rose-500',
        noBadge: 'bg-rose-500/25 text-rose-300 border border-rose-500/50',
        label: '🔴 Miskin',
        textColor: 'text-rose-300',
      };
  }
};
// ================================================================

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
      const commercial = isLoaded ? getCommercialTotalIncome(targetDetail) : 0;
      const commercialCount = isLoaded ? (Number(targetDetail?.mall ?? targetDetail?.pusat_belanja ?? 0) + Number(targetDetail?.hotel ?? 0) + Number(targetDetail?.pusat_grosir_tekstil ?? targetDetail?.pusat_grosir ?? 0)) : 0;
      const tourism = isLoaded ? (targetDetail.total_wisata_penghasilan ?? targetDetail.wisata_penghasilan ?? (Array.isArray(targetDetail.tempat_wisata) ? targetDetail.tempat_wisata.reduce((s: number, i: any) => s + (Number(i?.penghasilan) || 0), 0) : 0)) : 0;
      const tourismCount = isLoaded ? (targetDetail.total_tempat_wisata ?? (Array.isArray(targetDetail.tempat_wisata) ? targetDetail.tempat_wisata.length : 0)) : 0;
      const pdb = tax + gold + commercial + tourism;
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
        commercial,
        commercialCount,
        tourism,
        tourismCount,
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
          <td className="px-4 py-6 text-center text-sm font-bold text-[#6B8A8A]" colSpan={9}>
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
      const rank = index + 1;
      const rankStyle = getRankStyles(rank);

      return (
        <tr
          key={`${row.name}-${index}`}
          className={`transition-colors ${
            isPlayer
              ? 'bg-[#00FFAA]/20 border-l-4 border-l-[#00FFAA] font-bold'
              : `${rankStyle.rowBg} ${rankStyle.rowBorder}`
          }`}
        >
          {/* ✅ KOLOM NOMOR DENGAN BADGE BERWARNA */}
          <td className="px-1 sm:px-1.5 py-1.5 lg:py-2 text-center border-b border-[#00FFAA]/10 whitespace-nowrap">
            <span
              className={`inline-flex items-center justify-center min-w-[24px] h-[20px] px-1.5 rounded-md font-black text-[10px] sm:text-[11px] ${
                isPlayer ? 'bg-[#00FFAA] text-[#0A1A1A]' : rankStyle.noBadge
              }`}
            >
              {rank}
            </span>
          </td>
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
            {row.isLoaded ? (row.buildingCount > 0 ? `${row.buildingCount} (${formatNumber(row.gold)} NEO)` : '0') : renderSkeleton("w-16")}
          </td>
          <td className="px-1 sm:px-1.5 py-1.5 lg:py-2 text-right font-bold text-[10px] sm:text-[11px] lg:text-xs text-emerald-300 border-b border-[#00FFAA]/10 whitespace-nowrap" title={`Penghasilan Komersial (${row.commercialCount} unit): ${formatNumber(row.commercial)} NEO`}>
            {row.isLoaded ? (row.commercialCount > 0 ? `${row.commercialCount} (${formatNumber(row.commercial)} NEO)` : '0') : renderSkeleton("w-14")}
          </td>
          <td className="px-1 sm:px-1.5 py-1.5 lg:py-2 text-right font-bold text-[10px] sm:text-[11px] lg:text-xs text-sky-300 border-b border-[#00FFAA]/10 whitespace-nowrap" title={`Penghasilan Wisata (${row.tourismCount} lokasi): ${formatNumber(row.tourism)} NEO`}>
            {row.isLoaded ? (row.tourismCount > 0 ? `${row.tourismCount} (${formatNumber(row.tourism)} NEO)` : '0') : renderSkeleton("w-14")}
          </td>
          <td className="px-1 sm:px-1.5 py-1.5 lg:py-2 text-right font-bold text-[10px] sm:text-[11px] lg:text-xs text-rose-400 border-b border-[#00FFAA]/10 whitespace-nowrap" title={`Pengeluaran Subsidi: ${formatNumber(row.subsidyCost)} NEO`}>
            {row.isLoaded ? formatNumber(row.subsidyCost) : renderSkeleton("w-12")}
          </td>
          <td className="px-1 sm:px-1.5 py-1.5 lg:py-2 text-right font-bold text-[10px] sm:text-[11px] lg:text-xs text-rose-400 border-b border-[#00FFAA]/10 whitespace-nowrap" title={`Pengeluaran Kabinet: ${formatNumber(row.governmentCost)} NEO`}>
            {row.isLoaded ? formatNumber(row.governmentCost) : renderSkeleton("w-12")}
          </td>
          <td className={`px-1 sm:px-1.5 py-1.5 lg:py-2 text-right font-black text-[10px] sm:text-[11px] lg:text-xs border-b border-[#00FFAA]/10 whitespace-nowrap ${row.isLoaded ? (row.net >= 0 ? 'text-emerald-400' : 'text-rose-400') : ''}`} title={`Total Pemasukan: ${formatNumber(row.pdb)} NEO (Pajak: ${formatNumber(row.tax)} + Emas: ${formatNumber(row.gold)} + Komersial: ${formatNumber(row.commercial)} + Wisata: ${formatNumber(row.tourism)}) - Total Pengeluaran: ${formatNumber(row.totalPengeluaran)} NEO = Netto: ${formatNumber(row.net)} NEO`}>
            {row.isLoaded ? `${row.net >= 0 ? '+' : ''}${formatNumber(row.net)}` : renderSkeleton("w-14")}
          </td>
        </tr>
      );
    });
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col space-y-3">
      <div className="flex justify-between items-center gap-3 flex-shrink-0 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[#6B8A8A] font-black uppercase tracking-wider">
            Data PDB Instan (207 Negara)
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

      {/* ✅ LEGENDA WARNA */}
      <div className="flex items-center gap-3 flex-shrink-0 flex-wrap text-[9px] sm:text-[10px] font-black uppercase tracking-wider">
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm bg-emerald-500/30 border border-emerald-500/60" />
          <span className="text-emerald-300">Kaya (1–30)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm bg-amber-500/30 border border-amber-500/60" />
          <span className="text-amber-300">Berkembang (31–130)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm bg-rose-500/30 border border-rose-500/60" />
          <span className="text-rose-300">Miskin (131–207)</span>
        </div>
      </div>

      <div className="flex-1 min-h-0 border border-[#00FFAA]/30 rounded-xl bg-[#0A1A1A] overflow-hidden flex flex-col">
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden custom-scrollbar">
          <table className="w-full table-fixed text-xs text-left">
            <thead className="bg-[#0A1A1A] border-b border-[#00FFAA]/30 sticky top-0 z-10">
              <tr>
                <th className="w-[3%] px-1 sm:px-1 py-2 text-[9px] sm:text-[10px] lg:text-[11px] font-black text-[#00FFAA] uppercase tracking-wider text-center leading-tight">No</th>
                <th className="w-[15%] px-1 sm:px-1 py-2 text-[9px] sm:text-[10px] lg:text-[11px] font-black text-[#00FFAA] uppercase tracking-wider cursor-pointer hover:bg-[#0F2424] transition-colors leading-tight" onClick={() => handleSort('name')}>Nama Negara{renderSortArrow('name')}</th>
                <th className="w-[11%] px-1 sm:px-1 py-2 text-[9px] sm:text-[10px] lg:text-[11px] font-black text-[#00FFAA] uppercase tracking-wider text-right cursor-pointer hover:bg-[#0F2424] transition-colors leading-tight" onClick={() => handleSort('tax')}>Total Pajak{renderSortArrow('tax')}</th>
                <th className="w-[11%] px-1 sm:px-1 py-2 text-[9px] sm:text-[10px] lg:text-[11px] font-black text-amber-300 uppercase tracking-wider text-right cursor-pointer hover:bg-[#0F2424] transition-colors leading-tight" onClick={() => handleSort('gold')}>Emas{renderSortArrow('gold')}</th>
                <th className="w-[12%] px-1 sm:px-1 py-2 text-[9px] sm:text-[10px] lg:text-[11px] font-black text-emerald-300 uppercase tracking-wider text-right cursor-pointer hover:bg-[#0F2424] transition-colors leading-tight" onClick={() => handleSort('commercial')}>Komersial{renderSortArrow('commercial')}</th>
                <th className="w-[12%] px-1 sm:px-1 py-2 text-[9px] sm:text-[10px] lg:text-[11px] font-black text-sky-300 uppercase tracking-wider text-right cursor-pointer hover:bg-[#0F2424] transition-colors leading-tight" onClick={() => handleSort('tourism')}>Wisata{renderSortArrow('tourism')}</th>
                <th className="w-[12%] px-1 sm:px-1 py-2 text-[9px] sm:text-[10px] lg:text-[11px] font-black text-rose-400 uppercase tracking-wider text-right cursor-pointer hover:bg-[#0F2424] transition-colors leading-tight" onClick={() => handleSort('subsidyCost')}>Pengeluaran Subsidi{renderSortArrow('subsidyCost')}</th>
                <th className="w-[12%] px-1 sm:px-1 py-2 text-[9px] sm:text-[10px] lg:text-[11px] font-black text-rose-400 uppercase tracking-wider text-right cursor-pointer hover:bg-[#0F2424] transition-colors leading-tight" onClick={() => handleSort('governmentCost')}>Pengeluaran Kabinet{renderSortArrow('governmentCost')}</th>
                <th className="w-[12%] px-1 sm:px-1 py-2 text-[9px] sm:text-[10px] lg:text-[11px] font-black text-[#00FFAA] uppercase tracking-wider text-right cursor-pointer hover:bg-[#0F2424] transition-colors leading-tight" onClick={() => handleSort('net')}>Netto PDB{renderSortArrow('net')}</th>
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
            <span className="ml-1 text-[#00FFAA] font-black">(Data PDB Seluruh Negara Di Bawah Ini)</span>
          </p>

          <AllCountriesGDP playerCountryName={countryName} playerCountryDetail={countryDetail} prefetchedAllCountries={prefetchedAllCountries} />
        </div>
      </div>
    </div>
  );
}