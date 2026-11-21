"use client";
import RootTable, { RootTableHeader, RootTableHeadCell, RootTableRow, RootTableCell } from "@/app/page/root_modals_design_menu/RootTable";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Bomb, Flame, ChevronUp, ChevronDown } from "lucide-react";
import { getArmadaPowerSummary } from "../../4_armada/logic/armadaLogic";
import KonfirmasiSabotaseModals from "../modals_konfirmasi/konfirmasiSabotaseModals";
import { getTravelFuelStatus } from "@/app/page/navigasi_menu/2_navigasi_bawah/3_produksi_konsumsi/fuelLogic/travelFuelLogic";
import { useTravelFuelQuote } from "@/app/page/navigasi_menu/2_navigasi_bawah/3_produksi_konsumsi/fuelLogic/useTravelFuelQuote";
import { getLocalizedCountryName } from "@/app/logic/countryNameLogic";
// 🔥 Import COUNTRIES_DATA untuk meng-enrich ISO
import { COUNTRIES_DATA } from "@/app/page/map_system/map-data";
import { useLanguage } from "@/app/page/paused_menu/terjemahan_paused_menu/languageLogic";

type RankingRow = {
  countryName: string;
  totalPower: number;
  darat: number;
  laut: number;
  udara: number;
  iso?: string; // 🔥 Tambahkan field ISO
};

const formatNumber = (value: unknown, locale: string) => {
  const numeric = Number(value ?? 0);
  return Number.isFinite(numeric) ? numeric.toLocaleString(locale, { maximumFractionDigits: 0 }) : "0";
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

interface SabotaseProps {
  prefetchedAllCountries?: any[];
  countryDetail?: any; // 🔥 Tambahkan prop untuk negara user
  updatePlayerCountryDetail: (updater: (previous: Record<string, unknown> | null) => Record<string, unknown> | null) => void;
  onRecruitModalVisibilityChange: (isOpen: boolean) => void;
  onConfirmationModalVisibilityChange: (isOpen: boolean) => void;
  onAction: (targetCountry: RankingRow, cost: number, tripId: string, operationTarget: string, personnelCount: number) => void;
  searchQuery: string;
}

export default function Sabotase({ prefetchedAllCountries, countryDetail, updatePlayerCountryDetail, onRecruitModalVisibilityChange, onConfirmationModalVisibilityChange, onAction, searchQuery }: SabotaseProps) {
  const { t, language } = useLanguage();
  const tr = (key: string, params?: Record<string, string | number>) =>
    t(`navigation_defense_sabotage.${key}`, params);
  const fallbackCountry = tr('menu.targetFallback');
  const [sortConfig, setSortConfig] = useState<{ key: keyof RankingRow; direction: 'asc' | 'desc' } | null>({
    key: 'totalPower',
    direction: 'desc'
  });

  const [selectedTarget, setSelectedTarget] = useState<RankingRow | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const tripIdRef = useRef<string | null>(null);
  const playerCountryName = String(
    countryDetail?.country || countryDetail?.nama_negara || countryDetail?.name_id || "",
  );
  const travelFuelQuote = useTravelFuelQuote(
    playerCountryName,
    selectedTarget?.countryName ?? "",
    "sabotase",
    isModalOpen,
  );
  const travelFuelStatus = getTravelFuelStatus(
    countryDetail,
    travelFuelQuote.cost,
    travelFuelQuote.loading,
    travelFuelQuote.fallback,
  );

  useEffect(() => {
    if (isModalOpen && !tripIdRef.current) {
      tripIdRef.current = `travel-sabotase-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    } else if (!isModalOpen) {
      tripIdRef.current = null;
    }
  }, [isModalOpen]);

  const rawRankings = useMemo(() => {
    const playerName = String(
      countryDetail?.country || countryDetail?.nama_negara || countryDetail?.name_id || countryDetail?.name_en || "",
    ).toLowerCase().trim();
    const source = (Array.isArray(prefetchedAllCountries) ? prefetchedAllCountries : []).map(country => {
      const countryName = String(
        country?.nama_negara || country?.country || country?.name_id || country?.name_en || "",
      ).toLowerCase().trim();
      return playerName && countryName === playerName ? { ...country, ...countryDetail } : country;
    });
    const annexedStore = (typeof window !== 'undefined' ? (window as any).neosantara_annexed_countries : {}) || {};

    return source
      .filter((country: any) => {
        const countryName = country?.nama_negara || country?.country || country?.name_id || country?.name_en || "";
        const raw = String(countryName).trim();
        const norm = raw.toLowerCase();
        const clean = norm.replace(/[^a-z0-9]/g, '');
        const iso = extractISO(country, countryName);

        if (annexedStore[raw] || annexedStore[norm] || (clean && annexedStore[clean])) return false;
        if (iso && (annexedStore[iso] || annexedStore[`iso_${iso}`])) return false;
        return true;
      })
      .map((country: any) => {
        const summary = getArmadaPowerSummary(country);
        const groupTotals = summary.totals.groups;
        const countryName = country?.nama_negara || country?.country || country?.name_id || country?.name_en || fallbackCountry;
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
  }, [prefetchedAllCountries, countryDetail, fallbackCountry]);

  const rankings = useMemo(() => {
    let sortableItems = [...rawRankings];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      sortableItems = sortableItems.filter(item =>
        item.countryName.toLowerCase().includes(q) ||
        getLocalizedCountryName(item.iso || item.countryName, language).toLowerCase().includes(q)
      );
    }
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
  }, [rawRankings, sortConfig, searchQuery, language]);

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
    const selectedCountryName = countryDetail?.country || countryDetail?.nama_negara || countryDetail?.name_id || countryDetail?.name_en || "";
    if (row.countryName.toLowerCase().trim() === selectedCountryName.toLowerCase().trim()) return;
    setSelectedTarget(row);
    setIsModalOpen(true);
    onConfirmationModalVisibilityChange(true);
  };

  const handleCloseConfirmation = () => {
    setIsModalOpen(false);
    onConfirmationModalVisibilityChange(false);
  };

  return (
    <div className="flex h-full min-h-0 w-full flex-col">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-root-accent/20 bg-root-canvas shadow-sm">
        <div className="intelijen-table-viewport min-h-0 flex-1 overflow-auto">
          <RootTable className="intelijen-table w-full text-xs md:text-[10px] lg:text-[11px] 2xl:text-xs">
            <RootTableHeader className="whitespace-nowrap">
              <tr>
                <RootTableHeadCell className="w-10">{tr('table.number')}</RootTableHeadCell>
                <RootTableHeadCell className="cursor-pointer hover:bg-root-accent/10 transition-colors" onClick={() => handleSort('countryName')}>
                {tr('table.country')}{getSortArrow('countryName')}
                </RootTableHeadCell>
                <RootTableHeadCell className="text-right cursor-pointer hover:bg-root-accent/10 transition-colors" onClick={() => handleSort('darat')}>
                {tr('table.land')}{getSortArrow('darat')}
                </RootTableHeadCell>
                <RootTableHeadCell className="text-right cursor-pointer hover:bg-root-accent/10 transition-colors" onClick={() => handleSort('laut')}>
                {tr('table.sea')}{getSortArrow('laut')}
                </RootTableHeadCell>
                <RootTableHeadCell className="text-right cursor-pointer hover:bg-root-accent/10 transition-colors" onClick={() => handleSort('udara')}>
                {tr('table.air')}{getSortArrow('udara')}
                </RootTableHeadCell>
                <RootTableHeadCell className="text-right cursor-pointer hover:bg-root-accent/10 transition-colors" onClick={() => handleSort('totalPower')}>
                {tr('table.totalPower')}{getSortArrow('totalPower')}
                </RootTableHeadCell>
                <RootTableHeadCell className="text-center">{tr('table.actions')}</RootTableHeadCell>
              </tr>
            </RootTableHeader>
            <tbody className="divide-y divide-root-accent/10">
              {rankings.map((row, index) => {
                const selectedCountryName = countryDetail?.country || countryDetail?.nama_negara || countryDetail?.name_id || countryDetail?.name_en || fallbackCountry;
                const isUserCountry = row.countryName.toLowerCase().trim() === selectedCountryName.toLowerCase().trim();
                const displayName = getLocalizedCountryName(row.iso || row.countryName, language);
                
                return (
                  <RootTableRow 
                    key={`${row.countryName}-${index}`} 
                    isActive={isUserCountry}
                  >
                    <RootTableCell className={`font-black ${isUserCountry ? 'text-root-accent' : 'text-root-text'}`}>{index + 1}</RootTableCell>
                    
                    <RootTableCell className={`font-bold ${isUserCountry ? 'text-root-accent' : 'text-root-text'}`}>
                      <div className="flex items-center gap-2 min-h-[20px] min-w-0">
                        {row.iso && row.iso.length === 2 ? (
                          <img
                            src={`https://flagcdn.com/w20/${row.iso.toLowerCase()}.png`}
                            alt={displayName}
                            className="w-5 h-4 object-cover rounded-sm border border-root-accent/20 shadow-sm shrink-0"
                            onError={(e) => (e.target as HTMLImageElement).style.display = "none"}
                          />
                        ) : (
                          <div className="w-5 h-4 rounded-sm bg-root-surface border border-root-accent/20 shrink-0" />
                        )}
                        <span className="truncate">{displayName}</span>
                      </div>
                    </RootTableCell>

                    <RootTableCell isNumeric className="text-root-text">{formatNumber(row.darat, language)}</RootTableCell>
                    <RootTableCell isNumeric className="text-root-text">{formatNumber(row.laut, language)}</RootTableCell>
                    <RootTableCell isNumeric className="text-root-text">{formatNumber(row.udara, language)}</RootTableCell>
                    <RootTableCell isNumeric className={`font-black ${isUserCountry ? 'text-root-accent' : 'text-rose-400'}`}>{formatNumber(row.totalPower, language)}</RootTableCell>
                    <RootTableCell className="text-center">
                      {!isUserCountry && (
                        <button
                          type="button"
                          onClick={() => handleOpenModal(row)}
                          className="p-1.5 rounded-lg border transition-all bg-orange-500/10 text-orange-400 hover:bg-orange-500 hover:text-white border-orange-500/30 cursor-pointer"
                          title={tr('table.actionTitle')}
                          aria-label={tr('table.actionAria', { country: displayName })}
                        >
                          <Bomb className="w-4 h-4" />
                        </button>
                      )}
                    </RootTableCell>
                  </RootTableRow>
                );
              })}
            </tbody>
          </RootTable>
        </div>
      </div>

      {selectedTarget && typeof document !== "undefined" && createPortal(
        <KonfirmasiSabotaseModals
          isOpen={isModalOpen}
          onClose={handleCloseConfirmation}
          targetCountry={selectedTarget}
          currentBudget={Number(countryDetail?.anggaran) || 0}
          updatePlayerCountryDetail={updatePlayerCountryDetail}
          onRecruitModalVisibilityChange={onRecruitModalVisibilityChange}
          travelFuelStatus={travelFuelStatus}
          onConfirm={(operationTarget, personnelCount) => {
            if (!travelFuelStatus.ok || travelFuelQuote.cost === null || !tripIdRef.current) return;
            setIsModalOpen(false);
            onConfirmationModalVisibilityChange(false);
            onAction(selectedTarget, travelFuelQuote.cost, tripIdRef.current, operationTarget, personnelCount);
          }}
        />,
        document.body,
      )}
    </div>
  );
}