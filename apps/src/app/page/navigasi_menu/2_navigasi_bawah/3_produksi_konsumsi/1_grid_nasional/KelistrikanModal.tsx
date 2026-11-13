"use client";
import React, { useState, useEffect } from "react";
import {
  Zap,
  BatteryCharging,
  MapPin,
  Search,
  ChevronUp,
  ChevronDown,
  Info,
  X,
} from "lucide-react";

import DetailKonsumsiTerestimasiModal from "./DetailKonsumsiTerestimasiModal";
import NotebookModalWrapper from "../../NotebookModalWrapper";
import RootInfoModalHeader from "@/app/page/root_modals_design_menu/RootInfoModalHeader";
import RootModalTabs from "@/app/page/root_modals_design_menu/RootModalTabs";
import {
  calculateActualElectricityProduction,
  ELECTRICITY_PLANT_KEYS,
  formatElectricityMW,
  getCountryConsumptionBreakdown,
  logElectricityProductionCalculation,
} from "./consumptionLogic";
import { applyNpcCountrySimulationState } from "@/app/logic/npc_country_simulation/npcCountrySimulation";
import MenuInfoModal from "@/app/page/navigasi_menu/2_navigasi_bawah/MenuInfoModal";

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

const POWER_SOURCE_DESCRIPTIONS: Record<string, string> = {
  "pembangkit_listrik_tenaga_nuklir": "Pembangkit Listrik Tenaga Nuklir (PLTN)",
  "pembangkit_listrik_tenaga_air": "Pembangkit Listrik Tenaga Air (PLTA)",
  "pembangkit_listrik_tenaga_surya": "Pembangkit Listrik Tenaga Surya (PLTS)",
  "pembangkit_listrik_tenaga_uap": "Pembangkit Listrik Tenaga Uap (PLTU)",
  "pembangkit_listrik_tenaga_gas": "Pembangkit Listrik Tenaga Gas (PLTG)",
  "pembangkit_listrik_tenaga_angin": "Pembangkit Listrik Tenaga Bayu (PLTB)",
  "pembangkit_listrik_tenaga_panas_bumi": "Pembangkit Listrik Tenaga Panas Bumi (PLTP)",
  "pembangkit_listrik_tenaga_hidrogen": "Pembangkit Listrik Tenaga Hidrogen (PLTH)",
  "pembangkit_listrik_tenaga_gelombang_laut": "Pembangkit Listrik Tenaga Gelombang Laut (PLTGL)",
  "pembangkit_listrik_tenaga_fusi_nuklir": "Pembangkit Listrik Tenaga Fusi Nuklir (PLTFN)",
};

export default function KelistrikanModal({ isOpen, onClose, countryDetail, setCountryDetail, metadata, prefetchedAllCountries, onNavigateToMenu }: ModalProps) {
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

  if (!isOpen) return null;

  const findMeta = (key: string) => {
    if (!metadata) return undefined;
    if (metadata[key]) return metadata[key];
    for (const k of Object.keys(metadata)) {
      const entry = metadata[k];
      if (!entry) continue;
      if (entry.dataKey === key) return entry;
      if (k.endsWith(`_${key}`) || k === `1_${key}`) return entry;
    }
    return undefined;
  };

  const productionCalculation = calculateActualElectricityProduction(countryDetail, metadata);
  logElectricityProductionCalculation(productionCalculation, "modal");
  const powerSources = ELECTRICITY_PLANT_KEYS
    .map((key) => {
      const bMeta = findMeta(key);
      const count = Number(countryDetail?.[key]) || 0;
      const unitProduction = Number(bMeta?.produksi) || 0;
      const plantProduction = productionCalculation.perPlant[key];

      return {
        key,
        label: bMeta?.label || key.replace(/_/g, " ").replace(/\b\w/g, (ch) => ch.toUpperCase()),
        desc: POWER_SOURCE_DESCRIPTIONS[key] || bMeta?.desc || "Sumber energi listrik nasional.",
        value: count,
        unitProduction,
        actualProduction: plantProduction.actual,
        fuelShortage: plantProduction.fuelShortage,
      };
    })
    .filter((source) => source.value > 0 || source.unitProduction > 0);

  const totalCapacityMW = productionCalculation.actualTotal;

  const calculateBuildingElectricityConsumption = (country: any) => {
    if (!country) return 0;
    return getCountryConsumptionBreakdown(country, metadata).totalAllBreakdownConsumption;
  };

  const userBuildingConsumption = calculateBuildingElectricityConsumption(countryDetail);
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

  const globalElectricityData = activeTab === "global"
    ? allCountries.map((country, index) => {
      const calculation = calculateActualElectricityProduction(country, metadata);
      const totalProduction = calculation.actualTotal;
      const buildingConsumption = calculateBuildingElectricityConsumption(country);
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
      const name = rawName || 'Unknown';
      const isUser = Boolean(
        userCountryName && (
          name.toLowerCase().trim() === userCountryName ||
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
    }).sort((a, b) => b.production - a.production)
    : [];

  const sortedData = [...globalElectricityData].sort((a, b) => {
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
  });

  const filteredData = searchQuery.trim() === ''
    ? sortedData
    : sortedData.filter(country => country.name.toLowerCase().includes(searchQuery.toLowerCase()));

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
    if (setCountryDetail && countryDetail) {
      setCountryDetail({
        ...countryDetail,
        satisfaction: {
          ...(countryDetail?.satisfaction || {}),
          electricity: electricitySatisfaction,
        }
      });
    }
  }, [electricitySatisfaction]);

  return (
    <>
      {!isInfoOpen && <NotebookModalWrapper onClose={onClose}>
        <div className={"root-modal-util-35cc3749b1"}>
          {/* HEADER */}
          <RootInfoModalHeader
            title="Grid Nasional"
            onClose={onClose}
            size="standard"
            icon={<Zap aria-hidden="true" className={"root-modal-util-08cc358851"} />}
            centerContent={
              <RootModalTabs
                className={"satisfaction-modal-tabs root-modal-util-3f7356eee3"}
                items={[
                  {
                    label: "Neraca User",
                    isActive: activeTab === "user",
                    onClick: () => setActiveTab("user"),
                    className: "!px-1 !py-1 !text-[8px] !tracking-normal sm:!px-2 sm:!text-[9px]",
                  },
                  {
                    label: `Neraca ${allCountries.length || 212} Negara`,
                    isActive: activeTab === "global",
                    onClick: () => setActiveTab("global"),
                    className: "!px-1 !py-1 !text-[8px] !tracking-normal sm:!px-2 sm:!text-[9px]",
                  },
                ]}
              />
            }
            actions={
              <button type="button" onClick={() => setIsInfoOpen(true)} title="Informasi grid kelistrikan nasional" aria-label="Informasi grid kelistrikan nasional" className={"root-modal-info-button root-modal-util-be617bb95e"}>
                <Info className={"root-modal-util-ce72f65c94"} />
              </button>
            }
          />

          {/* BODY (SCROLLBAR HIJAU DITERAPKAN DI SINI) */}
          <div className={"root-no-scrollbar-glow root-modal-util-e7871a31f6"}>

            {activeTab === "user" ? (
              <div className={"root-modal-util-b392992219"}>
                
                {/* KOTAK 1: STATISTIK GRID (Memanjang ke kanan-kiri) */}
                <div className={`root-modal-util-d5020ca04d root-modal-util-5f22e64f22`}>
                  <div className={"root-modal-util-663523d1b1"}>
                    <div className={"root-modal-util-63608157d8"}>
                      <BatteryCharging className={"root-modal-util-dca7f530c4"} />
                    </div>
                    <div>
                      <h3 className={"root-modal-util-9361ef65fc"}>Statistik Grid</h3>
                    </div>
                    </div>
                  {/* Grid Card di dalamnya memanjang ke samping (3 kolom) */}
                  <div className={"root-modal-util-4d7d412dd7"}>
                    <div className={`root-modal-util-aa624b5175 root-modal-util-5f22e64f22`}>
                      <p className={"root-modal-util-14d6efe9ef"}>✓ Total Produksi Listrik</p>
                      <p className={"root-modal-util-2db284c577"}>
                        {formatElectricityMW(totalCapacityMW)} MW
                      </p>
                    </div>
                    
                    <div
                      onClick={() => setIsDetailKonsumsiOpen(true)}
                      className={`root-modal-util-3131d60355 root-modal-util-5f22e64f22 root-modal-util-1421381c23 group`}
                    >
                      <div className={"root-modal-util-d27e953630"}>
                        <p className={"root-modal-util-14d6efe9ef"}>✗ Konsumsi Terestimasi</p>
                        <span className={"root-modal-util-cd303386bb"}>Detail →</span>
                      </div>
                      <p className={"root-modal-util-7a65e083b3"}>
                        {formatElectricityMW(estimatedConsumptionMW)} MW
                      </p>
                    </div>

                    <div className={`root-modal-util-024d155129 root-modal-util-5f22e64f22 root-modal-util-ca6bcd4b6f ${balanceMW > 0 ? "root-modal-util-cd2557c9de" :
                        balanceMW < 0 ? "root-modal-util-dd75883325" :
                          "root-modal-util-75a5b41106"
                      }`}>
                      <p className={`root-modal-util-67abd46500 ${balanceMW > 0 ? "root-modal-util-edbfd1c508" :
                          balanceMW < 0 ? "root-modal-util-35f302741d" :
                            "root-modal-util-8d44cef396"
                        }`}>Neraca Daya</p>
                      <p className={`root-modal-util-b71689d5a3 ${balanceMW > 0 ? "root-modal-util-edbfd1c508" :
                          balanceMW < 0 ? "root-modal-util-35f302741d" :
                            "root-modal-util-8d44cef396"
                        }`}>
                        {balanceMW > 0 ? '+' : balanceMW < 0 ? '-' : ''}{formatElectricityMW(Math.abs(balanceMW))} MW
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
                      <h3 className={"root-modal-util-9361ef65fc"}>Ringkasan Sumber Daya</h3>
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
                            {formatElectricityMW(source.actualProduction)} MW
                          </p>
                          <p className={"root-modal-util-d8fb0b4a8a"}>
                            {source.fuelShortage
                              ? "Bahan bakar kurang — tidak berproduksi"
                              : source.value > 0 ? `${source.value} unit` : 'Tidak tersedia'}
                          </p>
                        </div>
                      </div>
                    )) : (
                      <div className={`root-modal-util-a6e25069d7 root-modal-util-5f22e64f22 root-modal-util-8ff7188727`}>
                        Data pembangkit listrik tidak tersedia.
                      </div>
                    )}
                  </div>
                </div>

                {/* KOTAK 3: INDEKS KEPUASAN LISTRIK */}
                <div className={`root-satisfaction-index root-modal-util-c624fd55b4 root-modal-util-5f22e64f22`}>
                  <div className={"root-modal-util-56e6b92b69"}>
                    <span className={"root-satisfaction-index-title root-modal-util-84cf691742"}>
                      Indeks Kepuasan Rakyat (Listrik)
                    </span>
                    <span className={"root-satisfaction-index-value root-modal-util-ca525b9094"}>
                      {electricitySatisfaction} / 100
                    </span>
                  </div>
                  <div className={"root-modal-util-b0f44f38ef"}>
                    <div
                      className={"root-modal-progress-fill root-modal-util-0131747055"}
                      style={{ "--root-modal-progress-value": `${electricitySatisfaction}%` } as React.CSSProperties}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className={`root-modal-util-d5020ca04d root-modal-util-5f22e64f22`}>
                <div className={"root-modal-util-46b5b1836b"}>
                  <Search className={"root-modal-util-91f313a187"} />
                  <input
                    type="text"
                    placeholder="Cari nama negara..."
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    className={"root-modal-util-7e81aff836"}
                  />
                </div>
                <div className={`root-no-scrollbar-glow root-modal-util-21ad3142af root-modal-util-5f22e64f22 root-modal-util-4e8f3fa2d1 `}>
                  <table className={"root-modal-util-a1e9cf0ef6"}>
                    <thead className={"root-modal-util-ecea3fcb79"}>
                      <tr className={"root-modal-util-48bed30924"}>
                        <th className={"root-modal-util-503f70b539"}>No</th>
                        <th
                          onClick={() => handleSort('name')}
                          className={"root-modal-util-3a1e0e892a"}
                        >
                          Negara <SortIndicator column="name" />
                        </th>
                        <th
                          onClick={() => handleSort('production')}
                          className={"root-modal-util-927b9c2a7f"}
                        >
                          Produksi (MW) <SortIndicator column="production" />
                        </th>
                        <th
                          onClick={() => handleSort('consumption')}
                          className={"root-modal-util-5a4276aa31"}
                        >
                          Konsumsi (MW) <SortIndicator column="consumption" />
                        </th>
                        <th
                          onClick={() => handleSort('balance')}
                          className={"root-modal-util-913d8c7381"}
                        >
                          Neraca Daya <SortIndicator column="balance" />
                        </th>
                      </tr>
                    </thead>
                    <tbody className={"root-modal-util-67ebe98090"}>
                      {allCountries.length === 0 ? (
                        <tr>
                          <td colSpan={5} className={"root-modal-util-fe9e2d64f9"}>
                            Memuat data negara...
                          </td>
                        </tr>
                      ) : filteredData.length > 0 ? (
                        filteredData.map((country, rowIndex) => (
                          <tr
                            key={`${country.name}-${rowIndex}`}
                            className={country.isUser ? "root-modal-util-73b452f399" : "root-modal-util-4ecd8bae5f"}
                          >
                            <td className={`root-modal-util-3b24a321dd ${country.isUser ? "root-modal-util-edbfd1c508" : "root-modal-util-2717107f89"}`}>
                              {rowIndex + 1}
                            </td>
                            <td className={`root-modal-util-3b24a321dd ${country.isUser ? "root-modal-util-edbfd1c508" : "root-modal-util-070a7f2c69"}`}>
                              <span>{country.name}</span>
                              {country.isUser && <span className={"root-modal-util-13dc0814cd"}>Negara Anda</span>}
                            </td>
                            <td className={"root-modal-util-f444102e27"}>
                              {country.production <= 0 ? "0" : country.production.toLocaleString("id-ID", { maximumFractionDigits: 2 })}
                            </td>
                            <td className={"root-modal-util-05ad91ba15"}>
                              {country.consumption <= 0 ? "0" : country.consumption.toLocaleString("id-ID", { maximumFractionDigits: 2 })}
                            </td>
                            <td className={`root-modal-util-ee36968489 ${country.balance > 0.01 ? "root-modal-util-edbfd1c508" : country.balance < -0.01 ? "root-modal-util-35f302741d" : "root-modal-util-8d44cef396"}`}>
                              {country.balance === 0 ? "0" : `${country.balance > 0 ? "+" : "-"}${Math.abs(country.balance).toLocaleString("id-ID", { maximumFractionDigits: 2 })}`}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className={"root-modal-util-fe9e2d64f9"}>
                            Tidak ada negara yang cocok dengan pencarian.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        </div>
      </NotebookModalWrapper>}

      <MenuInfoModal
        isOpen={isInfoOpen}
        onClose={() => setIsInfoOpen(false)}
        title="Informasi Grid Kelistrikan Nasional"
        description="Pantau neraca daya negara Anda atau bandingkan produksi, konsumsi, dan neraca listrik dengan negara lain."
      />

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