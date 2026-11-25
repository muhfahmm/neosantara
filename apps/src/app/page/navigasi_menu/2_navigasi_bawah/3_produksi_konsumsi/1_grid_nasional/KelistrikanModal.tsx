"use client";
import RootTable from "@/app/page/root_modals_design_menu/RootTable";
import React, { useCallback, useMemo, useState, useEffect } from "react";
import {
  Zap,
  BatteryCharging,
  MapPin,
  ChevronUp,
  ChevronDown,
  Info,
} from "lucide-react";

import DetailKonsumsiTerestimasiModal from "./DetailKonsumsiTerestimasiModal";
import NotebookModalWrapper from "../../NotebookModalWrapper";
import RootModalCloseButton from "@/app/page/root_modals_design_menu/RootModalCloseButton";
import RootModalSearchToolbar from "@/app/page/root_modals_design_menu/RootModalSearchToolbar";
import {
  calculateActualElectricityProduction,
  ELECTRICITY_PLANT_KEYS,
  formatElectricityMW,
  getCountryConsumptionBreakdown,
  logElectricityProductionCalculation,
} from "./consumptionLogic";
import { applyNpcCountrySimulationState } from "@/app/logic/npc_country_simulation/npcCountrySimulation";
import MenuInfoModal from "@/app/page/navigasi_menu/2_navigasi_bawah/MenuInfoModal";
import { useLanguage } from "@/app/page/paused_menu/terjemahan_paused_menu/languageLogic";
import { getLocalizedCountryName } from "@/app/logic/countryNameLogic";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  countryDetail: any;
  setCountryDetail: (detail: any) => void;
  metadata: any;
  prefetchedAllCountries?: any[];
  onNavigateToMenu?: (category: string, itemKey: string) => void;
}

interface SortConfig {
  key: 'name' | 'production' | 'consumption' | 'balance';
  direction: 'asc' | 'desc';
}

export default function KelistrikanModal({ isOpen, onClose, countryDetail, setCountryDetail, metadata, prefetchedAllCountries, onNavigateToMenu }: ModalProps) {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<"user" | "global">("user");
  const [allCountries, setAllCountries] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'production', direction: 'desc' });
  const [isDetailKonsumsiOpen, setIsDetailKonsumsiOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (prefetchedAllCountries && prefetchedAllCountries.length > 0) {
      setAllCountries(prefetchedAllCountries.map(country => applyNpcCountrySimulationState(country)));
      return;
    }
    if (allCountries.length > 0) return;
    (async () => {
      try {
        const res = await fetch('/api/country-data?all=true', { cache: 'no-store' });
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setAllCountries(data.map(country => applyNpcCountrySimulationState(country)));
        }
      } catch (error) {
        console.error('Error fetching all countries data:', error);
      }
    })();
  }, [isOpen, prefetchedAllCountries, allCountries.length]);

  const findMeta = useCallback((key: string) => {
    if (!metadata) return undefined;
    if (metadata[key]) return metadata[key];
    for (const k of Object.keys(metadata)) {
      const entry = metadata[k];
      if (!entry) continue;
      if (entry.dataKey === key) return entry;
      if (k.endsWith(`_${key}`) || k === `1_${key}`) return entry;
    }
    return undefined;
  }, [metadata]);

  const productionCalculation = useMemo(
    () => isOpen ? calculateActualElectricityProduction(countryDetail, metadata) : null,
    [isOpen, countryDetail, metadata],
  );
  useEffect(() => {
    if (productionCalculation) {
      logElectricityProductionCalculation(productionCalculation, "modal");
    }
  }, [productionCalculation]);

  const powerSources = useMemo(() => {
    if (!productionCalculation) return [];
    return ELECTRICITY_PLANT_KEYS
      .map((key) => {
        const bMeta = findMeta(key);
        const count = Number(countryDetail?.[key]) || 0;
        const unitProduction = Number(bMeta?.produksi) || 0;
        const plantProduction = productionCalculation.perPlant[key];

        return {
          key,
          label: t(`navigation_electricity_grid.plantLabels.${key}`),
          desc: t(`navigation_electricity_grid.plantDescriptions.${key}`),
          value: count,
          unitProduction,
          actualProduction: plantProduction.actual,
          fuelShortage: plantProduction.fuelShortage,
        };
      })
      .filter((source) => source.value > 0 || source.unitProduction > 0);
  }, [
    countryDetail,
    findMeta,
    productionCalculation,
    t,
  ]);

  const totalCapacityMW = productionCalculation?.actualTotal ?? 0;

  const userBuildingConsumption = useMemo(
    () => isOpen && countryDetail
      ? getCountryConsumptionBreakdown(countryDetail, metadata).totalAllBreakdownConsumption
      : 0,
    [isOpen, countryDetail, metadata],
  );
  const populationDemand = 0;
  const estimatedConsumptionMW = Math.max(0, userBuildingConsumption + populationDemand);
  const balanceMW = totalCapacityMW - estimatedConsumptionMW;

  // --- HITUNG INDEKS KEPUASAN LISTRIK ---
  const electricitySatisfaction = (() => {
    const production = totalCapacityMW;
    const consumption = estimatedConsumptionMW;
    if (consumption <= 0) return 100;
    const coverage = Math.min(1, Math.max(0, production / consumption));
    return Math.round(coverage * 100);
  })();

  const globalElectricityData = useMemo(() => {
    if (!isOpen || activeTab !== "global") return [];
    return allCountries.map((country, index) => {
      const calculation = calculateActualElectricityProduction(country, metadata);
      const totalProduction = calculation.actualTotal;
      const buildingConsumption = getCountryConsumptionBreakdown(country, metadata).totalAllBreakdownConsumption;
      const totalConsumption = buildingConsumption > 0
        ? buildingConsumption
        : totalProduction * 0.7;
      const consumption = Math.max(0, totalConsumption);
      const balance = totalProduction - consumption;
      const userCountryName = (countryDetail?.name_id || countryDetail?.nama || countryDetail?.country || countryDetail?.name_en || '').toLowerCase().trim();
      let rawName = country?.name_id || country?.name_en || country?.nama || country?.country;
      if (!rawName && country?.__fileName) {
        rawName = country.__fileName
          .replace(/^\d+_/, '')
          .replace(/\.(ts|js|json)$/i, '')
          .replace(/_/g, ' ')
          .replace(/\b\w/g, (char: string) => char.toUpperCase());
      }
      const sourceName = rawName || 'Unknown';
      const name = getLocalizedCountryName(sourceName, language);
      const isUser = Boolean(
        userCountryName && (
          sourceName.toLowerCase().trim() === userCountryName ||
          country?.name_id?.toLowerCase().trim() === userCountryName ||
          country?.name_en?.toLowerCase().trim() === userCountryName ||
          country?.country?.toLowerCase().trim() === userCountryName
        )
      );
      return {
        index: index + 1,
        name,
        production: Number.isFinite(totalProduction) ? totalProduction : 0,
        consumption: Number.isFinite(consumption) ? consumption : 0,
        balance: Math.abs(balance) < 0.01 || !Number.isFinite(balance) ? 0 : balance,
        isUser,
      };
    }).sort((a, b) => b.production - a.production);
  }, [isOpen, activeTab, allCountries, countryDetail, metadata, language]);

  const sortedData = useMemo(() => [...globalElectricityData].sort((a, b) => {
    let aValue: string | number;
    let bValue: string | number;
    switch (sortConfig.key) {
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'consumption':
        aValue = a.consumption;
        bValue = b.consumption;
        break;
      case 'balance':
        aValue = a.balance;
        bValue = b.balance;
        break;
      default:
        aValue = a.production;
        bValue = b.production;
    }
    if (sortConfig.direction === 'asc') return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
    return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
  }), [globalElectricityData, sortConfig]);

  const filteredData = useMemo(() => searchQuery.trim() === ''
    ? sortedData
    : sortedData.filter(country => country.name.toLowerCase().includes(searchQuery.toLowerCase())), [searchQuery, sortedData]);

  const handleSort = (column: SortConfig['key']) => {
    setSortConfig(current => ({
      key: column,
      direction: current.key === column && current.direction === 'desc' ? 'asc' : 'desc',
    }));
  };

  const SortIndicator = ({ column }: { column: SortConfig['key'] }) => (
    sortConfig.key === column
      ? sortConfig.direction === 'asc'
        ? <ChevronUp className={"root-modal-util-53f28dd949"} />
        : <ChevronDown className={"root-modal-util-53f28dd949"} />
      : <span className={"root-modal-util-b5b1d5164b"}>⇅</span>
  );

  // Simpan indeks ke countryDetail
  useEffect(() => {
    if (isOpen && setCountryDetail && countryDetail) {
      setCountryDetail({
        ...countryDetail,
        satisfaction: {
          ...(countryDetail?.satisfaction || {}),
          electricity: electricitySatisfaction,
        }
      });
    }
  }, [isOpen, electricitySatisfaction]);

  if (!isOpen) return null;

  const gridTabItems = [
    {
      label: t("navigation_electricity_grid.tabs.user"),
      isActive: activeTab === "user",
      onClick: () => setActiveTab("user"),
    },
    {
      label: t("navigation_electricity_grid.tabs.global", { count: allCountries.length || 212 }),
      isActive: activeTab === "global",
      onClick: () => setActiveTab("global"),
    },
  ];

  return (
    <>
      <NotebookModalWrapper onClose={onClose}>
        <div className={"root-modal-util-b74379da23"}>
          {/* HEADER */}
          <div className={"satisfaction-modal-header root-modal-util-9462ce2345"}>
            <div className={"satisfaction-modal-header-main root-modal-util-020752a5a2 no-scrollbar"}>
              <div className={"root-modal-util-08dfbca033"}>
                <div className={"root-modal-util-739d92b232"}>
                  <Zap aria-hidden="true" className={"root-modal-util-d252947d10"} />
                </div>
                <h2 className={"root-modal-util-6b4648c53a root-modal-util-c2385a463d"}>
                  {t("navigation_electricity_grid.title")}
                </h2>
              </div>
            </div>
            <div className={"root-modal-util-08dfbca033"}>
              <button type="button" onClick={() => setIsInfoOpen(true)} title={t("navigation_electricity_grid.infoButton")} aria-label={t("navigation_electricity_grid.infoButton")} className={"root-modal-info-button root-modal-util-1697100c43"}>
                <Info aria-hidden="true" />
              </button>
              <RootModalCloseButton onClick={onClose} />
            </div>
          </div>

          <div className={"satisfaction-modal-summary root-modal-util-6614545ce3"}>
            <RootModalSearchToolbar
              layout="default"
              className="!w-full !border-0 !bg-transparent !px-0 !py-0"
              searchContainerClassName="xl:!w-[35%] xl:!max-w-none xl:!flex-none"
              showSearch={activeTab === "global"}
              items={gridTabItems}
              searchValue={searchQuery}
              onSearchChange={setSearchQuery}
              searchPlaceholder={t("navigation_electricity_grid.searchPlaceholder")}
              searchAriaLabel={t("navigation_electricity_grid.searchAriaLabel")}
            />
          </div>

          {/* BODY (SCROLLBAR HIJAU DITERAPKAN DI SINI) */}
          <div className={"root-no-scrollbar-glow root-modal-util-e7871a31f6"}>

            {activeTab === "user" ? (
              <div className={"root-modal-util-b392992219"}>
                
                {/* KOTAK 1: STATISTIK GRID (Memanjang ke kanan-kiri) */}
                <div className={`root-modal-util-d5020ca04d root-modal-util-5f22e64f22`}>
                  <div className={"grid-national-statistics-heading root-modal-util-663523d1b1"}>
                    <div className={"root-modal-util-08dfbca033"}>
                      <div className={"root-modal-util-63608157d8"}>
                        <BatteryCharging className={"root-modal-util-dca7f530c4"} />
                      </div>
                      <h3 className={"root-modal-util-9361ef65fc"}>{t("navigation_electricity_grid.statsTitle")}</h3>
                    </div>
                  </div>
                  {/* Grid Card di dalamnya memanjang ke samping (3 kolom) */}
                  <div className={"root-modal-util-4d7d412dd7"}>
                    <div className={`root-modal-util-aa624b5175 root-modal-util-5f22e64f22`}>
                      <p className={"root-modal-util-14d6efe9ef"}>✓ {t("navigation_electricity_grid.totalProduction")}</p>
                      <p className={"root-modal-util-2db284c577"}>
                        {formatElectricityMW(totalCapacityMW, language)} MW
                      </p>
                    </div>
                    
                    <div
                      onClick={() => setIsDetailKonsumsiOpen(true)}
                      className={`root-modal-util-3131d60355 root-modal-util-5f22e64f22 root-modal-util-1421381c23 group`}
                    >
                      <div className={"root-modal-util-d27e953630"}>
                        <p className={"root-modal-util-14d6efe9ef"}>✗ {t("navigation_electricity_grid.estimatedConsumption")}</p>
                        <span className={"root-modal-util-cd303386bb"}>{t("navigation_electricity_grid.detail")} →</span>
                      </div>
                      <p className={"root-modal-util-7a65e083b3"}>
                        {formatElectricityMW(estimatedConsumptionMW, language)} MW
                      </p>
                    </div>

                    <div className={`root-modal-util-024d155129 root-modal-util-5f22e64f22 root-modal-util-ca6bcd4b6f ${balanceMW > 0 ? "root-modal-util-cd2557c9de" :
                        balanceMW < 0 ? "root-modal-util-dd75883325" :
                          "root-modal-util-75a5b41106"
                      }`}>
                      <p className={`root-modal-util-67abd46500 ${balanceMW > 0 ? "root-modal-util-edbfd1c508" :
                          balanceMW < 0 ? "root-modal-util-35f302741d" :
                            "root-modal-util-8d44cef396"
                        }`}>{t("navigation_electricity_grid.powerBalance")}</p>
                      <p className={`root-modal-util-b71689d5a3 ${balanceMW > 0 ? "root-modal-util-edbfd1c508" :
                          balanceMW < 0 ? "root-modal-util-35f302741d" :
                            "root-modal-util-8d44cef396"
                        }`}>
                        {balanceMW > 0 ? '+' : balanceMW < 0 ? '-' : ''}{formatElectricityMW(Math.abs(balanceMW), language)} MW
                      </p>
                    </div>
                  </div>
                </div>

                {/* KOTAK 2: RINGKASAN SUMBER DAYA (Di Bawah, Berbentuk Grid) */}
                <div className={`root-modal-util-d5020ca04d root-modal-util-5f22e64f22`}>
                  <div className={"root-modal-util-663523d1b1"}>
                    <div className={"root-modal-util-63608157d8"}>
                      <MapPin className={"root-modal-util-dca7f530c4"} />
                    </div>
                    <div>
                      <h3 className={"root-modal-util-9361ef65fc"}>{t("navigation_electricity_grid.sourcesTitle")}</h3>
                    </div>
                  </div>

                  {/* Card Sumber Daya dibuat Grid (2 atau 3 kolom) */}
                  <div className={"root-modal-util-8c2b246bdb"}>
                    {powerSources.length > 0 ? powerSources.map((source) => (
                      <div key={source.key} className={`root-modal-util-cec1a1bbae root-modal-util-5f22e64f22`}>
                        <div className={"root-modal-util-7e0b7cdf1a"}>
                          <p className={"root-modal-util-6d83314579"}>{source.label}</p>
                          <p className={"root-modal-util-aec36fe708"}>{source.desc}</p>
                        </div>
                        <div className={"root-modal-util-4a90ed8d74"}>
                          <p className={"root-modal-util-8b089e3b8c"}>
                            {formatElectricityMW(source.actualProduction, language)} MW
                          </p>
                          <p className={"root-modal-util-d8fb0b4a8a"}>
                            {source.fuelShortage
                              ? t("navigation_electricity_grid.fuelShortage")
                              : source.value > 0 ? `${source.value} ${t("navigation_electricity_grid.unit")}` : t("navigation_electricity_grid.unavailable")}
                          </p>
                        </div>
                      </div>
                    )) : (
                      <div className={`root-modal-util-a6e25069d7 root-modal-util-5f22e64f22 root-modal-util-8ff7188727`}>
                        {t("navigation_electricity_grid.noPlants")}
                      </div>
                    )}
                  </div>
                </div>

              </div>
            ) : (
              <div className={`root-modal-util-d5020ca04d root-modal-util-5f22e64f22`}>
                <div className={`root-no-scrollbar-glow overflow-y-auto overflow-x-hidden border border-root-accent/20 bg-root-surface max-h-[60vh] root-modal-util-5f22e64f22 root-modal-util-4e8f3fa2d1`}>
                  <RootTable className="w-full table-fixed text-[10px] sm:text-xs">
                    <thead className={"root-modal-util-ecea3fcb79"}>
                      <tr className={"root-modal-util-48bed30924"}>
                        <th className="w-10 sm:w-12 px-1.5 sm:px-2.5 py-2 text-left font-black uppercase tracking-wider text-root-accent">{t("navigation_electricity_grid.table.number")}</th>
                        <th
                          onClick={() => handleSort('name')}
                          className="w-[34%] sm:w-[32%] cursor-pointer px-1.5 sm:px-2.5 py-2 text-left font-black uppercase tracking-wider text-root-accent hover:bg-root-surface"
                        >
                          {t("navigation_electricity_grid.table.country")} <SortIndicator column="name" />
                        </th>
                        <th
                          onClick={() => handleSort('production')}
                          className="w-[22%] cursor-pointer px-1.5 sm:px-2.5 py-2 text-right font-black uppercase tracking-wider text-emerald-400 hover:bg-emerald-950/40"
                        >
                          {t("navigation_electricity_grid.table.production")} <SortIndicator column="production" />
                        </th>
                        <th
                          onClick={() => handleSort('consumption')}
                          className="w-[22%] cursor-pointer px-1.5 sm:px-2.5 py-2 text-right font-black uppercase tracking-wider text-rose-400 hover:bg-rose-950/40"
                        >
                          {t("navigation_electricity_grid.table.consumption")} <SortIndicator column="consumption" />
                        </th>
                        <th
                          onClick={() => handleSort('balance')}
                          className="w-[22%] cursor-pointer px-1.5 sm:px-2.5 py-2 text-right font-black uppercase tracking-wider text-root-accent hover:bg-root-surface"
                        >
                          {t("navigation_electricity_grid.table.powerBalance")} <SortIndicator column="balance" />
                        </th>
                      </tr>
                    </thead>
                    <tbody className={"root-modal-util-67ebe98090"}>
                      {allCountries.length === 0 ? (
                        <tr>
                          <td colSpan={5} className={"root-modal-util-fe9e2d64f9"}>
                            {t("navigation_electricity_grid.table.loading")}
                          </td>
                        </tr>
                      ) : filteredData.length > 0 ? (
                        filteredData.map((country, rowIndex) => (
                          <tr
                            key={`${country.name}-${rowIndex}`}
                            className={country.isUser ? "root-modal-util-73b452f399" : "root-modal-util-4ecd8bae5f"}
                          >
                            <td className={`px-1.5 sm:px-2.5 py-2 font-bold ${country.isUser ? "root-modal-util-edbfd1c508" : "root-modal-util-2717107f89"}`}>
                              {rowIndex + 1}
                            </td>
                            <td className={`px-1.5 sm:px-2.5 py-2 font-bold truncate ${country.isUser ? "root-modal-util-edbfd1c508" : "root-modal-util-070a7f2c69"}`} title={country.name}>
                              <span>{country.name}</span>
                              {country.isUser && <span className={"root-modal-util-13dc0814cd"}>{t("navigation_electricity_grid.table.userCountry")}</span>}
                            </td>
                            <td className="px-1.5 sm:px-2.5 py-2 text-right font-bold text-emerald-400 truncate">
                              {country.production <= 0 ? "0" : country.production.toLocaleString(language, { maximumFractionDigits: 2 })}
                            </td>
                            <td className="px-1.5 sm:px-2.5 py-2 text-right font-bold text-rose-400 truncate">
                              {country.consumption <= 0 ? "0" : country.consumption.toLocaleString(language, { maximumFractionDigits: 2 })}
                            </td>
                            <td className={`px-1.5 sm:px-2.5 py-2 text-right font-black truncate ${country.balance > 0.01 ? "root-modal-util-edbfd1c508" : country.balance < -0.01 ? "root-modal-util-35f302741d" : "root-modal-util-8d44cef396"}`}>
                              {country.balance === 0 ? "0" : `${country.balance > 0 ? "+" : "-"}${Math.abs(country.balance).toLocaleString(language, { maximumFractionDigits: 2 })}`}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className={"root-modal-util-fe9e2d64f9"}>
                            {t("navigation_electricity_grid.table.noResults")}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </RootTable>
                </div>
              </div>
            )}

          </div>
        </div>
      </NotebookModalWrapper>

      <MenuInfoModal
        isOpen={isInfoOpen}
        onClose={() => setIsInfoOpen(false)}
        title={t("navigation_electricity_grid.infoTitle")}
        description={t("navigation_electricity_grid.infoDescription")}
      >
        <div className="root-satisfaction-index root-modal-util-c624fd55b4 root-modal-util-5f22e64f22 mt-4">
          <div className="root-modal-util-56e6b92b69">
            <span className="root-satisfaction-index-title root-modal-util-84cf691742">
              {t("navigation_electricity_grid.satisfactionIndex")}
            </span>
            <span className="root-satisfaction-index-value root-modal-util-ca525b9094">
              {electricitySatisfaction} / 100
            </span>
          </div>
          <div className="root-modal-util-b0f44f38ef">
            <div
              className="root-modal-progress-fill root-modal-util-0131747055"
              style={{ "--root-modal-progress-value": `${electricitySatisfaction}%` } as React.CSSProperties}
            />
          </div>
        </div>
      </MenuInfoModal>

      <DetailKonsumsiTerestimasiModal
        isOpen={isDetailKonsumsiOpen}
        onClose={() => setIsDetailKonsumsiOpen(false)}
        countryDetail={countryDetail}
        metadata={metadata}
        estimatedConsumptionMW={estimatedConsumptionMW}
        onNavigateToMenu={(category, itemKey) => {
          setIsDetailKonsumsiOpen(false);
          onClose();
          onNavigateToMenu?.(category, itemKey);
        }}
      />

    </>
  );
}