"use client"
import React, { useState, useEffect } from "react";
import { TrendingUp, Search, User, ChevronUp, ChevronDown, Info } from "lucide-react";
import NotebookModalWrapper from "../../NotebookModalWrapper";
import MenuInfoModal from "@/app/page/navigasi_menu/2_navigasi_bawah/MenuInfoModal";
import RootModalCloseButton from "@/app/page/root_modals_design_menu/RootModalCloseButton";
import { rootBorderRadius } from "@/app/page/root_modals_design_menu/rootBorderRadius";
import { rootModalTypography } from "@/app/page/root_modals_design_menu/rootModalTypography";
import {
  calculateTotalTaxIncome,
  calculateGoldIncome,
  calculateTotalMinistryCostPerDay,
  getCommercialTotalIncome,
  getTourismTotalIncome,
  calculateActiveSubsidyCost,
} from "@/app/logic/economic_logic/treasuryUpdater";
import { COUNTRIES_DATA } from '@/app/page/map_system/map-data';
import { applyNpcCountrySimulationState } from '@/app/logic/npc_country_simulation/npcCountrySimulation';
import { getRelationValue } from '../../../../../../../../json/4_database_hubungan_antar_negara/relationsRegistry';

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
  return calculateGoldIncome({ ...detail, emas: emasCount });
};

const computeMinistryCost = (detail: any) => {
  const kabData = getKabinetData(detail);
  const merged = { ...kabData, ...detail };
  return calculateTotalMinistryCostPerDay(merged);
};

const formatNumber = (num: number) => num.toLocaleString('id-ID', { maximumFractionDigits: 2 });

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
      return prefetchedAllCountries.map((rawCountry, idx) => {
        const c = applyNpcCountrySimulationState(rawCountry);
        return {
          ...c,
          __displayName: getDisplayName(c),
          continent: normalizeContinent(c.__continent || c.continent || getContinentFromOrder(idx + 1)),
          __fileOrder: idx + 1,
          __loaded: true,
        };
      });
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
      const processed = prefetchedAllCountries.map((rawCountry, idx) => {
        const c = applyNpcCountrySimulationState(rawCountry);
        return {
          ...c,
          __displayName: getDisplayName(c),
          continent: normalizeContinent(c.__continent || c.continent || getContinentFromOrder(idx + 1)),
          __fileOrder: idx + 1,
          __loaded: true,
        };
      });
      cachedAllCountries = processed;
      setAllCountries(processed);
    } else {
      fetch('/api/country-data?all=true')
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            const processed = data.map((rawCountry: any, idx: number) => {
              const c = applyNpcCountrySimulationState(rawCountry);
              return {
                ...c,
                __displayName: getDisplayName(c),
                continent: normalizeContinent(c.__continent || c.continent || getContinentFromOrder(idx + 1)),
                __fileOrder: idx + 1,
                __loaded: true,
              };
            });
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
    if (sortConfig.key !== key) return <span className="text-root-subtle/40 ml-1 text-xs font-normal">⇅</span>;
    if (sortConfig.direction === 'asc') return <ChevronUp className="h-3 w-3 ml-1 inline text-root-accent" />;
    return <ChevronDown className="h-3 w-3 ml-1 inline text-root-accent" />;
  };

  const renderSkeleton = (w = "w-16") => (
    <span className={`inline-block ${w} h-3.5 bg-root-subtle/20 animate-pulse rounded-md align-middle`} />
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
      const tourism = isLoaded ? getTourismTotalIncome(targetDetail) : 0;
      const tourismCount = isLoaded ? (targetDetail.total_tempat_wisata ?? (Array.isArray(targetDetail.tempat_wisata) ? targetDetail.tempat_wisata.length : 0)) : 0;
      const pdb = tax + gold + commercial + tourism;
      const dewanKabinetCost = isLoaded ? computeMinistryCost(targetDetail) : 0;
      const subsidyCost = isLoaded ? calculateActiveSubsidyCost(targetDetail) : 0;
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
          <td className="px-4 py-6 text-center text-sm font-bold text-root-subtle" colSpan={3}>
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
          className={`pdb-table-row transition-colors ${isPlayer
              ? 'bg-root-accent/20 border-l-4 border-l-root-accent font-bold'
              : `${rankStyle.rowBg} ${rankStyle.rowBorder}`
            }`}
        >
          {/* ✅ KOLOM NOMOR DENGAN BADGE BERWARNA */}
          <td className="w-[15%] px-1 sm:px-1.5 py-1.5 lg:py-2 text-center border-b border-root-accent/10 whitespace-nowrap">
            <span
              className={`pdb-rank-badge inline-flex items-center justify-center min-w-[24px] h-[20px] px-1.5 rounded-md font-black text-[10px] sm:text-[11px] ${isPlayer ? 'bg-root-accent text-root-canvas' : rankStyle.noBadge
                }`}
            >
              {rank}
            </span>
          </td>
          <td className="w-[45%] px-1.5 sm:px-2 lg:px-2 py-1.5 lg:py-2 text-[10px] sm:text-[11px] lg:text-xs font-bold text-root-text border-b border-root-accent/10 truncate">
            {isPlayer ? (
              <div className="flex items-center gap-1 text-root-accent font-black truncate">
                <User className="w-3.5 h-3.5 text-root-accent flex-shrink-0" />
                <span className="truncate">{row.name}</span>
                <span className="bg-root-accent text-root-canvas text-[8px] px-1 py-0.2 rounded-full font-black uppercase tracking-wider flex-shrink-0 shadow-sm">
                  Anda
                </span>
              </div>
            ) : (
              <span className="truncate block">{row.name}</span>
            )}
          </td>
          <td className={`w-[40%] px-1 sm:px-1.5 py-1.5 lg:py-2 text-right font-black text-[10px] sm:text-[11px] lg:text-xs border-b border-root-accent/10 whitespace-nowrap ${row.isLoaded ? (row.net >= 0 ? 'text-emerald-400' : 'text-rose-400') : ''}`} title={`Total Pemasukan: ${formatNumber(row.pdb)} NEO (Pajak: ${formatNumber(row.tax)} + Emas: ${formatNumber(row.gold)} + Komersial: ${formatNumber(row.commercial)} + Wisata: ${formatNumber(row.tourism)}) - Total Pengeluaran: ${formatNumber(row.totalPengeluaran)} NEO = Netto: ${formatNumber(row.net)} NEO`}>
            {row.isLoaded ? `${row.net >= 0 ? '+' : ''}${formatNumber(row.net)}` : renderSkeleton("w-14")}
          </td>
        </tr>
      );
    });
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col space-y-1 sm:space-y-2">
      <div className="pdb-search-row flex justify-between items-center gap-3 flex-shrink-0 flex-wrap">
        <div className="relative">
          <input
            type="text"
            placeholder="Cari negara / benua..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 pr-3 py-1 rounded-lg bg-root-canvas border border-root-accent/30 text-xs sm:text-sm font-bold text-root-text outline-none focus:border-root-accent w-40 sm:w-48 transition-all placeholder:text-root-subtle"
          />
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-root-subtle" />
        </div>
      </div>

      <div className={`flex min-h-0 flex-1 flex-col overflow-hidden border border-root-accent/30 bg-root-canvas ${rootBorderRadius.card}`}>
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden neon-scrollbar">
          <table className="w-full table-fixed text-xs text-left">
            <thead className="pdb-table-header bg-root-canvas border-b border-root-accent/30 sticky top-0 z-10">
              <tr>
                <th className="w-[15%] px-1 py-2 text-[9px] sm:text-[10px] lg:text-[11px] font-black text-root-accent uppercase tracking-wider text-center leading-tight">No</th>
                <th className="w-[45%] px-1 py-2 text-[9px] sm:text-[10px] lg:text-[11px] font-black text-root-accent uppercase tracking-wider cursor-pointer hover:bg-root-surface transition-colors leading-tight" onClick={() => handleSort('name')}>Nama Negara{renderSortArrow('name')}</th>
                <th className="w-[40%] px-1 py-2 text-[9px] sm:text-[10px] lg:text-[11px] font-black text-root-accent uppercase tracking-wider text-right cursor-pointer hover:bg-root-surface transition-colors leading-tight" onClick={() => handleSort('net')}>Netto PDB{renderSortArrow('net')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-root-accent/10">{renderAllRows()}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// --- KOMPONEN UTAMA PDB MODAL ---
export default function PDBModal({ isOpen, onClose, countryDetail, selectedCountry, prefetchedAllCountries }: ModalProps) {
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  if (!isOpen) return null;
  const countryName = selectedCountry?.country || countryDetail?.country || countryDetail?.nama_negara || countryDetail?.name_id || "Indonesia";

  return (
    <>
    {!isInfoOpen && <NotebookModalWrapper onClose={onClose} frameClassName="pdb-modal-frame">
      <div className="flex flex-col h-full overflow-hidden">
        <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-root-accent/20 flex items-center justify-between bg-root-canvas relative z-10 gap-2 shrink-0">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <div className="p-1 sm:p-1.5 bg-root-surface rounded-lg border border-root-accent/30 shrink-0">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-root-accent" />
            </div>
            <div className="min-w-0">
              <h2 className={rootModalTypography.title}>Produk Domestik Bruto (PDB)</h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setIsInfoOpen(true)} title="Informasi PDB" aria-label="Informasi PDB" className="flex shrink-0 cursor-pointer items-center justify-center rounded-full border border-root-accent/50 bg-root-canvas p-1 text-root-accent transition-all hover:bg-root-accent hover:text-root-canvas">
              <Info className="h-3.5 w-3.5" />
            </button>
            <RootModalCloseButton onClick={onClose} />
          </div>
        </div>

        <div className="pdb-modal-body flex-1 min-h-0 flex flex-col p-4 lg:p-6 bg-root-surface relative z-10">
          <AllCountriesGDP playerCountryName={countryName} playerCountryDetail={countryDetail} prefetchedAllCountries={prefetchedAllCountries} />
        </div>
      </div>
    </NotebookModalWrapper>}
    <MenuInfoModal
      isOpen={isInfoOpen}
      onClose={() => setIsInfoOpen(false)}
      title="Informasi Produk Domestik Bruto"
      fillContent
    >
      <div className={`flex min-h-full flex-col justify-between gap-3 ${rootModalTypography.body}`}>
        <p className={`${rootModalTypography.body} ${rootModalTypography.muted}`}>
          PDB mengukur kekuatan ekonomi makro kedaulatan {countryName}. Daftar merangking negara berdasarkan netto PDB.
        </p>

        <section className={`space-y-2 border border-root-accent/20 bg-root-canvas p-3 ${rootBorderRadius.card}`}>
          <h3 className="font-black uppercase tracking-wide text-root-accent">Kategori Peringkat Negara</h3>
          <div className="grid gap-2 sm:grid-cols-3">
            <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-2">
              <span className="h-3 w-3 shrink-0 rounded-sm border border-emerald-500/60 bg-emerald-500/30" />
              <span className="font-bold text-emerald-300">Kaya (1–30)</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-2">
              <span className="h-3 w-3 shrink-0 rounded-sm border border-amber-500/60 bg-amber-500/30" />
              <span className="font-bold text-amber-300">Berkembang (31–130)</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 p-2">
              <span className="h-3 w-3 shrink-0 rounded-sm border border-rose-500/60 bg-rose-500/30" />
              <span className="font-bold text-rose-300">Miskin (131–207)</span>
            </div>
          </div>
        </section>

        <section className={`space-y-2 border border-emerald-500/25 bg-emerald-500/5 p-3 ${rootBorderRadius.card}`}>
          <h3 className="font-black uppercase tracking-wide text-emerald-300">Income (Pemasukan)</h3>
          <div className="grid gap-2 sm:grid-cols-2">
            <div><strong className="text-root-accent">Total Pajak:</strong> pemasukan dari pajak negara.</div>
            <div><strong className="text-amber-300">Emas:</strong> pemasukan dari produksi emas.</div>
            <div><strong className="text-emerald-300">Komersial:</strong> pemasukan dari pusat belanja, hotel, dan grosir tekstil.</div>
            <div><strong className="text-sky-300">Wisata:</strong> pemasukan dari tempat wisata.</div>
          </div>
        </section>

        <section className={`space-y-2 border border-rose-500/25 bg-rose-500/5 p-3 ${rootBorderRadius.card}`}>
          <h3 className="font-black uppercase tracking-wide text-rose-300">Outcome (Pengeluaran)</h3>
          <div className="grid gap-2 sm:grid-cols-2">
            <div><strong className="text-rose-300">Pengeluaran Subsidi:</strong> biaya seluruh subsidi aktif.</div>
            <div><strong className="text-rose-300">Pengeluaran Kabinet:</strong> biaya kementerian dan kabinet.</div>
          </div>
        </section>

        <section className={`border border-root-accent/30 bg-root-accent/5 p-3 ${rootBorderRadius.card}`}>
          <h3 className="font-black uppercase tracking-wide text-root-accent">Netto PDB</h3>
          <p className="mt-1">Netto PDB = total pemasukan (pajak + emas + komersial + wisata) − total pengeluaran (subsidi + kabinet). Nilai positif ditampilkan hijau, sedangkan nilai negatif ditampilkan merah.</p>
        </section>
      </div>
    </MenuInfoModal>
    </>
  );
}