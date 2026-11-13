"use client"

import dynamic from "next/dynamic";
import { useState, useEffect, useMemo, type CSSProperties } from "react";
import { Users, Info, ShieldAlert, BadgeDollarSign, Users2, ChevronRight, Clock } from "lucide-react";
import NotebookModalWrapper from "../NotebookModalWrapper";
import RootModalCloseButton from "@/app/page/root_modals_design_menu/RootModalCloseButton";
import {
  calculateSectoralSatisfaction,
  calculateGeneralSatisfaction,
  calculateLifeExpectancy,
  calculateSecurityLevel,
  calculateDailyBirths,
  calculateDailyDeaths,
  calculateHomelessCount,
  calculateDailyPopulationChange,
  type PopulationSectoral,
} from "@/app/logic/populations_logic/population_logic";

const DetailKelahiranModal = dynamic(() => import("./kelahiran_modals/DetailKelahiranModal"), { ssr: false });
const DetailKematianModal = dynamic(() => import("./kematian_modals/DetailKematianModal"), { ssr: false });
const TempatUmumModal = dynamic(() => import("../5_pembangunan/2_tempat_umum/TempatUmumModal"), { ssr: false });
const IndeksKesejahteraanModal = dynamic(() => import("./indeks_kesejahteraan_modals/IndeksKesejahteraanModal"), { ssr: false });
const TunawismaDetailModal = dynamic(() => import("./tunawisma_modals/TunawismaDetailModal"), { ssr: false });
import {
  HINDU_POPULATION_GROWTH_BONUS,
} from "@/app/page/bonus_logic/agama_bonus_logic/hindu";
import { SOCIALISM_BIRTH_RATE_BONUS } from "@/app/page/bonus_logic/ideologi_bonus_logic/sosialisme";
import { calculateTaxPopulationImpact } from "@/app/logic/economic_logic/2_tax_logic/taxPopulationImpact";
import { calculateEconomicPopulationImpact } from "@/app/logic/economic_logic/economicPopulationImpact";
import { calculatePopulationPolicyImpact } from "@/app/logic/populations_logic/populationPolicyImpact";
import MenuInfoModal from "@/app/page/navigasi_menu/2_navigasi_bawah/MenuInfoModal";
import { parseActiveEspionageEffects } from "@/app/page/detail_negara/3_operasi_militer/covertEffectsLogic";

// ==============================
// Tipe data yang diharapkan dari countryDetail
// ==============================
interface CountryDetail {
  jumlah_penduduk: number;
  rata_rata_pajak?: number;
  living_cost_index?: number;
  kesejahteraan_index?: number;
  indeks_ketahanan_pangan?: number;
  surplus_listrik?: number;
  tingkat_hunian_layak?: number;
  harapan_hidup?: number;
  tingkat_keamanan?: number;
  inisiatif_aktif?: { nama: string; boost: number }[];
  jumlah_rumah_sakit?: number;
  jumlah_klinik?: number;
  program_insentif_anak?: boolean;
  angka_pernikahan?: number;
  tingkat_pendidikan?: number;
}

interface RingkasanPopulasiModalProps {
  isOpen: boolean;
  onClose: () => void;
  countryDetail: any;
  selectedCountry: any;
  setActiveMenu?: (menu: string) => void;
  onOpenArmadaTab?: (tab: 'aktif' | 'infrastruktur') => void;
  onOpenTempatUmum?: (tab: string) => void;
  initialOpenKesejahteraan?: boolean;
  initialKesejahteraanTab?: "statistik" | "naikkan";
  setCountryDetail?: (detail: any) => void;
  currentDate?: Date | string;
  metadata?: Record<string, any>;
}

// ==============================
// Fungsi Penghitung Kepuasan Sektoral
// ==============================
function hitungKepuasanSektoral(detail: CountryDetail): PopulationSectoral {
  return calculateSectoralSatisfaction(detail);
}

// ==============================
// Fungsi Penghitung Metrik Demografi Dinamis
// ==============================
export function hitungDemografi(
  detail: CountryDetail,
  countryName?: string,
  metadata: Record<string, any> = {},
  currentDate?: Date | string
) {
  const populasi = detail.jumlah_penduduk || 10_000_000;

  const detailWithDefaults = {
    ...detail,
  };

  const sektoral = hitungKepuasanSektoral(detailWithDefaults);
  const kepuasanUmum = calculateGeneralSatisfaction(detailWithDefaults);
  const lifeExpectancy = calculateLifeExpectancy(detailWithDefaults, kepuasanUmum);
  const securityLevel = calculateSecurityLevel(detailWithDefaults, kepuasanUmum);

  const dailyBirths = calculateDailyBirths(
    populasi,
    kepuasanUmum, 0,
    detail.jumlah_rumah_sakit ?? 0,
    detail.jumlah_klinik ?? 0,
    detail.program_insentif_anak ?? false,
    detail.angka_pernikahan ?? 0.05,
    detail.tingkat_pendidikan ?? 0.5,
    detailWithDefaults
  );

  const metrics = calculateDailyPopulationChange(detailWithDefaults, countryName, metadata, currentDate);
  const totalDailyDelta = metrics.netDailyChange;
  const totalMonthlyGrowthPercent = ((totalDailyDelta * 30) / populasi) * 100;
  const homelessCount = calculateHomelessCount(populasi, sektoral.hunian, detailWithDefaults);

  return {
    ...metrics,
    populasi,
    totalDailyDelta,
    totalMonthlyGrowthPercent,
    sektoral,
  };
}

// ==============================
// Komponen Modal
// ==============================
export default function RingkasanPopulasiModal({
  isOpen,
  onClose,
  countryDetail,
  selectedCountry,
  setActiveMenu,
  onOpenArmadaTab,
  onOpenTempatUmum,
  initialOpenKesejahteraan,
  initialKesejahteraanTab,
  setCountryDetail,
  currentDate,
  metadata = {},
}: RingkasanPopulasiModalProps) {

  const [isDetailBirthOpen, setIsDetailBirthOpen] = useState(false);
  const [isDetailDeathOpen, setIsDetailDeathOpen] = useState(false);
  const [isTempatUmumOpen, setIsTempatUmumOpen] = useState(false);
  const [tempatUmumActiveTab, setTempatUmumActiveTab] = useState<string>("infrastruktur");
  const [isKesejahteraanOpen, setIsKesejahteraanOpen] = useState(Boolean(initialOpenKesejahteraan));
  const [isTunawismaOpen, setIsTunawismaOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  // Hitung metrik demografi secara sinkron
  const countryName = selectedCountry?.country;
  const metrics = useMemo(() => {
    if (!countryDetail) return null;
    return hitungDemografi(countryDetail, countryName, metadata, currentDate);
  }, [countryDetail, countryName, metadata, currentDate]);

  if (!isOpen) return null;

  const kesejahteraanModal = isKesejahteraanOpen ? (
    <IndeksKesejahteraanModal
      isOpen={isKesejahteraanOpen}
      onClose={() => {
        if (initialOpenKesejahteraan) {
          onClose();
          return;
        }
        setIsKesejahteraanOpen(false);
      }}
      countryDetail={countryDetail}
      setCountryDetail={setCountryDetail}
      selectedCountry={selectedCountry}
      metrics={metrics}
      setActiveMenu={setActiveMenu}
      currentDate={currentDate}
      initialTab={initialKesejahteraanTab}
      onOpenTempatUmum={(tabId: string) => {
        if (onOpenTempatUmum) {
          onOpenTempatUmum(tabId);
        } else {
          setTempatUmumActiveTab(tabId);
          setIsTempatUmumOpen(true);
        }
        setIsKesejahteraanOpen(false);
      }}
      onOpenIndustriPangan={() => {
        setActiveMenu?.("Menu:IndustriPangan");
        setIsKesejahteraanOpen(false);
      }}
    />
  ) : null;

  if (isKesejahteraanOpen && initialOpenKesejahteraan) {
    return kesejahteraanModal;
  }

  if (!metrics) {
    return (
      <div className={"root-modal-util-e506b543f2"}>
        <div className={"modal-responsive-shell root-modal-util-00e18d5f33"}>
          <div className={"satisfaction-modal-header root-modal-util-9462ce2345"}>
            <div className={"satisfaction-modal-header-main root-modal-util-020752a5a2 no-scrollbar"}>
              <div className={"root-modal-util-08dfbca033"}>
                <div className={"root-modal-util-739d92b232"}>
                  <Users2 aria-hidden="true" className={"root-modal-util-d252947d10"} />
                </div>
                <h2 className={"root-modal-util-6b4648c53a root-modal-util-c2385a463d"}>
                  Kependudukan
                </h2>
              </div>
            </div>
            <RootModalCloseButton onClick={onClose} />
          </div>
          <div className={"root-modal-util-ba14ec0ad8"} role="status" aria-live="polite">
            <div className={"root-modal-util-f9009b6328"}>
              <span className={"root-modal-util-7bb8d7d0aa"} />
              Menyiapkan ringkasan populasi...
            </div>
          </div>
        </div>
      </div>
    );
  }

  const {
    populasi,
    dailyBirths,
    dailyDeaths,
    totalDailyDelta,
    totalMonthlyGrowthPercent,
    homelessCount,
    populationStatus,
  } = metrics;
  const totalBirthsAndDeaths = dailyBirths + dailyDeaths;
  const birthShare = totalBirthsAndDeaths > 0 ? (dailyBirths / totalBirthsAndDeaths) * 100 : 0;
  const deathShare = totalBirthsAndDeaths > 0 ? (dailyDeaths / totalBirthsAndDeaths) * 100 : 0;
  const taxImpact = calculateTaxPopulationImpact(countryDetail);
  const economicImpact = calculateEconomicPopulationImpact(countryDetail);
  const populationPolicyImpact = calculatePopulationPolicyImpact(
    taxImpact.monthlyModifierPercent,
    economicImpact.totalMonthlyModifierPercent,
  );
  const totalPolicyMonthlyModifier =
    populationPolicyImpact.totalMonthlyModifierPercent;
  const estimatedPolicyDailyChange = Math.round(
    populasi * (totalPolicyMonthlyModifier / 100) / 30,
  );
  const estimatedPolicyMonthlyChange = Math.round(
    populasi * totalPolicyMonthlyModifier / 100,
  );
  const policyImpactColor = "root-modal-util-04f32edb66";
  const formatModifier = (value: number) =>
    `${value > 0 ? "+" : ""}${value.toFixed(2)}%`;
  const formatPeople = (value: number) =>
    `${value > 0 ? "+" : ""}${value.toLocaleString("id-ID")} jiwa`;
    
  const activePandemic = Array.isArray(countryDetail?.active_outbreaks)
    ? countryDetail.active_outbreaks.find((outbreak: any) =>
        !outbreak.isHandled && String(outbreak.category || "").toLowerCase().includes("pandemi")
      )
    : null;
  const activeEspionageEffect = parseActiveEspionageEffects(countryDetail?.active_disaster_effects)
    .sort((first, second) => second.remainingDays - first.remainingDays)[0];
  const pandemicCost = Math.max(0, Number(activePandemic?.korban) || 0);
  const pandemicDeaths = Math.max(0, Number(activePandemic?.perkiraanKematian) || 0);
  const canTreatPandemic = Number(countryDetail?.anggaran || 0) >= pandemicCost;
  
  // Perhitungan sisa hari pandemi
  const getRemainingDays = () => {
    if (!activePandemic || !activePandemic.startDate || !activePandemic.durationDays) return null;
    
    let current: Date;
    if (!currentDate) {
      current = new Date();
    } else if (typeof currentDate === 'string') {
      current = new Date(currentDate);
    } else {
      current = currentDate;
    }
    
    const start = new Date(activePandemic.startDate);
    
    if (isNaN(start.getTime()) || isNaN(current.getTime())) return null;

    const startMidnight = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const currentMidnight = new Date(current.getFullYear(), current.getMonth(), current.getDate());

    const diffTime = currentMidnight.getTime() - startMidnight.getTime();
    const elapsedDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    const duration = Number(activePandemic.durationDays) || 0;
    const remaining = duration - elapsedDays;
    
    return Math.max(0, remaining);
  };

  const remainingPandemicDays = getRemainingDays();

  const treatPandemic = () => {
    if (!activePandemic || !canTreatPandemic || !setCountryDetail) return;
    setCountryDetail((prev: any) => ({
      ...prev,
      anggaran: Math.max(0, Number(prev?.anggaran || 0) - pandemicCost),
      jumlah_penduduk: Math.max(0, Number(prev?.jumlah_penduduk || 0) + pandemicDeaths),
      active_outbreaks: Array.isArray(prev?.active_outbreaks)
        ? prev.active_outbreaks.map((outbreak: any) =>
            outbreak.id === activePandemic.id ? { ...outbreak, isHandled: true } : outbreak
          )
        : prev?.active_outbreaks,
    }));
  };

  const activeCountryName = countryName || "Indonesia";
  const populationPolicyImpactContent = (
    <section
      aria-label="Perhitungan dampak kebijakan ekonomi terhadap populasi"
      className={`root-modal-util-5f22e64f22 root-modal-util-35d227f918 `}
    >
      <div className={"root-modal-util-979863afec"}>
        <h3 className={"root-modal-util-9361ef65fc"}>
          Perhitungan Dampak Kebijakan ke Populasi
        </h3>
        <div className={"root-modal-util-308fc069e4"}>
          <p className={`${policyImpactColor} root-modal-util-5e563e2e22 `}>
            {formatModifier(totalPolicyMonthlyModifier)}
          </p>
        </div>
      </div>

      <div className={"root-modal-util-15b68ca001"}>
        {[
          { label: "Pajak", detail: `Beban ${taxImpact.burden.toFixed(1)}%`, modifier: populationPolicyImpact.taxMonthlyModifierPercent },
          { label: "Harga pokok", detail: `Kepuasan ${economicImpact.priceScore.toFixed(0)}/100`, modifier: economicImpact.priceMonthlyModifierPercent * populationPolicyImpact.scaleFactor },
          { label: "Sistem ekonomi", detail: `Skor ${economicImpact.policyScore.toFixed(0)}/100`, modifier: economicImpact.systemMonthlyModifierPercent * populationPolicyImpact.scaleFactor },
          { label: "Subsidi", detail: `Dukungan ${economicImpact.subsidyScore.toFixed(0)}/100`, modifier: economicImpact.subsidyMonthlyModifierPercent * populationPolicyImpact.scaleFactor },
        ].map((item) => (
          <div
            key={item.label}
            className={`root-modal-util-5f22e64f22 root-modal-util-f27e9555f7 `}
          >
            <p className={"root-modal-util-14d6efe9ef"}>{item.label}</p>
            <p className={`root-modal-util-04f32edb66 root-modal-util-35febc0dce `}>{item.detail}</p>
            <p className={`root-modal-util-04f32edb66 root-modal-util-d554c43cfb `}>
              {formatModifier(item.modifier)} / bln
            </p>
          </div>
        ))}
      </div>

      {populationPolicyImpact.wasCapped && (
        <p className={"root-modal-util-ede89a3918"}>
          Modifier gabungan dibatasi maksimal ±0,75% per bulan.
        </p>
      )}

      <div className={"root-modal-util-9fb6bbc497"}>
        <div className={`root-modal-util-5f22e64f22 root-modal-util-f27e9555f7 `}>
          <p className={"root-modal-util-14d6efe9ef"}>Estimasi dampak harian</p>
          <p className={`${policyImpactColor} root-modal-util-43728c6ebf `}>
            {formatPeople(estimatedPolicyDailyChange)}
          </p>
        </div>
        <div className={`root-modal-util-5f22e64f22 root-modal-util-f27e9555f7 `}>
          <p className={"root-modal-util-14d6efe9ef"}>Estimasi dampak bulanan</p>
          <p className={`${policyImpactColor} root-modal-util-43728c6ebf `}>
            {formatPeople(estimatedPolicyMonthlyChange)}
          </p>
        </div>
      </div>
    </section>
  );

  return (
    <>
      {!isInfoOpen && <NotebookModalWrapper onClose={onClose} isHidden={isKesejahteraanOpen}>
        <div className={"root-modal-util-b74379da23"}>
          <div className={"satisfaction-modal-header root-modal-util-9462ce2345"}>
            <div className={"satisfaction-modal-header-main root-modal-util-020752a5a2 no-scrollbar"}>
              <div className={"root-modal-util-08dfbca033"}>
                <div className={"root-modal-util-739d92b232"}>
                  <Users2 aria-hidden="true" className={"root-modal-util-d252947d10"} />
                </div>
                <h2 className={"root-modal-util-6b4648c53a root-modal-util-c2385a463d"}>
                  Kependudukan
                </h2>
              </div>
            </div>
            <div className={"root-modal-util-08dfbca033"}>
              <button
                type="button"
                onClick={() => setIsInfoOpen(true)}
                title="Informasi kependudukan"
                aria-label="Informasi kependudukan"
                className={"root-modal-info-button root-modal-util-1697100c43"}
              >
                <Info aria-hidden="true" />
              </button>
              <RootModalCloseButton onClick={onClose} />
            </div>
          </div>

        <div className={"root-modal-util-03954a8dc4 custom-scrollbar"}>

        {/* ============ SUMMARY CARDS ============ */}
        <div className={"root-modal-util-3d27351158"}>
          <div className={"population-summary-grid root-modal-util-0178524ccb"}>
            {/* Total Populasi */}
            <div className={`population-summary-card root-modal-util-ef77e14e02 root-modal-util-5f22e64f22 root-modal-util-a3833573dd `}>
              <div className={"root-modal-util-2ac8b605c3"}>
                <Users className={"root-modal-util-dd9e5c184a"} />
              </div>
              <div className={"population-summary-text root-modal-util-3b4c716cd4"}>
                <p className={`root-modal-util-14d6efe9ef root-modal-util-e82ae8be04`}>Total Populasi</p>
                <p className={`population-summary-value root-modal-util-04f32edb66 root-modal-util-1f576198ed `}>
                  <span className={"population-summary-number"}>{populasi.toLocaleString('id-ID', { maximumFractionDigits: 2 })}</span>
                  <span className={"root-modal-util-89dacfbf44"}>JIWA</span>
                </p>
              </div>
            </div>

            {/* Tunawisma */}
            <div
              className={`population-summary-card group root-modal-util-ef77e14e02 root-modal-util-5f22e64f22 root-modal-util-eef2dbcee8 `}
              onClick={() => setIsTunawismaOpen(true)}
            >
              <div className={"root-modal-util-85d02ce91c"}>
                <div className={"root-modal-util-758830936e"}>
                  <ShieldAlert className={"root-modal-util-389f7e7cc1"} />
                </div>
                <div className={"population-summary-text root-modal-util-3b4c716cd4"}>
                  <p className={`root-modal-util-14d6efe9ef root-modal-util-e82ae8be04`}>Tunawisma</p>
                  <p className={`population-summary-value root-modal-util-04f32edb66 root-modal-util-1f576198ed `}>
                    <span className={"population-summary-number"}>{homelessCount.toLocaleString('id-ID', { maximumFractionDigits: 2 })}</span>
                    <span className={"root-modal-util-89dacfbf44"}>JIWA</span>
                  </p>
                </div>
              </div>
              <ChevronRight className={"population-summary-chevron root-modal-util-3535e4faba"} />
            </div>

            {/* Kesejahteraan */}
            <div
              className={`population-summary-card group root-modal-util-ef77e14e02 root-modal-util-5f22e64f22 root-modal-util-5cf4d7e533 `}
              onClick={() => {
                setIsKesejahteraanOpen(true);
              }}
            >
              <div className={"root-modal-util-85d02ce91c"}>
                <div className={"root-modal-util-f03c15adbc"}>
                  <BadgeDollarSign className={"root-modal-util-dd9e5c184a"} />
                </div>
                <div className={"population-summary-text root-modal-util-3b4c716cd4"}>
                  <p className={`root-modal-util-14d6efe9ef root-modal-util-e82ae8be04`}>Kesejahteraan</p>
                  <p className={`population-summary-value root-modal-util-04f32edb66 root-modal-util-1f576198ed `}>
                    <span className={"population-summary-number"}>{countryDetail?.kesejahteraan !== undefined ? Math.round(Number(countryDetail.kesejahteraan)) : 50}</span>
                    <span className={"root-modal-util-5738bd9779"}>INDX</span>
                  </p>
                </div>
              </div>
              <ChevronRight className={"population-summary-chevron root-modal-util-278a4b7da6"} />
            </div>
          </div>
        </div>

        {/* ============ CONTENT AREA ============ */}
        <div className={"root-modal-util-2e92dbbd9a"}>
          <div className={"root-modal-util-1adf0b2971 root-modal-enter root-modal-fade-in"}>

            {/* Informasi Demografi */}
            <div className={`root-modal-util-815c1f66a3 root-modal-util-5f22e64f22 root-modal-util-2845c975bf `}>
              <h3 className={`root-modal-util-9361ef65fc root-modal-util-6cfc7e6ab3 `}>
                <Info className={"root-modal-util-3e8ca13a1c"} />
                Informasi Demografi
              </h3>
              <div className={`root-modal-util-8ff7188727 root-modal-util-1a8cbfedf4 `}>
                {/* 3 Card Sejajar: Kelahiran, Kematian, Pertumbuhan */}
                <div className={"root-modal-util-c3d860ca48"}>
                  <div
                    className={`group root-modal-util-3451683673 root-modal-util-5f22e64f22 root-modal-util-06208616b8 `}
                    onClick={() => setIsDetailBirthOpen(true)}
                  >
                    <div className={"root-modal-util-145b76d2b1"}>
                      <p className={"root-modal-util-14d6efe9ef"}>Angka Kelahiran Harian</p>
                      <p className={"root-modal-util-3ac23452ed"}>+{dailyBirths.toLocaleString('id-ID', { maximumFractionDigits: 2 })}</p>
                    </div>
                    <ChevronRight className={"root-modal-util-dd3d200219"} />
                  </div>
                  <div
                    className={`group root-modal-util-3451683673 root-modal-util-5f22e64f22 root-modal-util-94a8ce26ef `}
                    onClick={() => setIsDetailDeathOpen(true)}
                  >
                    <div className={"root-modal-util-145b76d2b1"}>
                      <p className={"root-modal-util-14d6efe9ef"}>Angka Kematian Harian</p>
                      <p className={"root-modal-util-2dd074bccf"}>-{dailyDeaths.toLocaleString('id-ID', { maximumFractionDigits: 2 })}</p>
                    </div>
                    <ChevronRight className={"root-modal-util-a7d56a73b0"} />
                  </div>
                  <div
                    className={`root-modal-util-5f22e64f22 root-modal-util-fc926a3906 ${totalMonthlyGrowthPercent >= 0 ? "root-modal-util-c2db1cca90" : "root-modal-util-e9a647a894"} root-modal-util-fb153a3e4d `}
                  >
                    <div className={"root-modal-util-145b76d2b1"}>
                      <p className={"root-modal-util-14d6efe9ef"}>Pertumbuhan Populasi</p>
                      <p className={`root-modal-util-04f32edb66 root-modal-util-66fd6b5b6b `}>
                        {totalMonthlyGrowthPercent >= 0 ? '+' : ''}{totalMonthlyGrowthPercent.toFixed(2)}%<span className={"root-modal-util-8769eee0db"}>/ bulan</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Perbandingan Kelahiran vs Kematian */}
                <div className={"root-modal-util-a7cd7a5d10"}>
                  <div className={`root-modal-util-14d6efe9ef root-modal-util-34d63445f0 `}>
                    <span>Perbandingan kelahiran &amp; kematian</span>
                    <div className={"root-modal-util-09b2adf189"}>
                      <span className={"root-modal-util-edbfd1c508"}>Kelahiran {birthShare.toFixed(1)}%</span>
                      <span className={"root-modal-util-35f302741d"}>Kematian {deathShare.toFixed(1)}%</span>
                    </div>
                  </div>
                  <div
                    role="img"
                    aria-label={`Perbandingan harian: kelahiran ${birthShare.toFixed(1)}%, kematian ${deathShare.toFixed(1)}%`}
                    className={"root-modal-util-3feef48a6a"}
                  >
                    <div
                      className={"root-modal-progress-fill root-modal-util-c8282c7b6a"}
                      style={{ "--root-modal-progress-value": `${birthShare}%` } as CSSProperties}
                    />
                    <div
                      className={"root-modal-progress-fill root-modal-util-f53ed9fb52"}
                      style={{ "--root-modal-progress-value": `${deathShare}%` } as CSSProperties}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Pandemic Section */}
            {activeEspionageEffect && (
              <section className={`root-modal-util-5f22e64f22 root-modal-util-3550b6cc81 `} aria-label="Efek spionase aktif">
                <div className={"root-modal-util-6d820b6d38"}>
                  <div className={"root-modal-util-9b8c2cda10"}>
                    <ShieldAlert className={"root-modal-util-3a33b9b074"} />
                  </div>
                  <div>
                    <div className={"root-modal-util-edc71f0dcc"}>
                      <p className={"root-modal-util-14d6efe9ef"}>Efek Spionase Aktif</p>
                      <span className={"root-modal-util-a85f41c475"}>
                        <Clock className={"root-modal-util-2797a07007"} />
                        Sisa {activeEspionageEffect.remainingDays} hari game
                      </span>
                    </div>
                    <h3 className={`root-modal-util-04f32edb66 root-modal-util-dbcbe995b4 `}>Kekuatan & HP militer ×{activeEspionageEffect.multiplier.toFixed(2)}</h3>
                    <p className={"root-modal-util-ff67d08b4e"}>Jumlah pasukan dan alutsista tidak berubah. Efek pulih otomatis saat durasi habis.</p>
                  </div>
                </div>
              </section>
            )}

            {activePandemic && (
              <section className={`root-modal-util-5f22e64f22 root-modal-util-1db77bfde1 `} aria-label="Pandemi aktif">
                <div className={"root-modal-util-21539036a3"}>
                  <div className={"root-modal-util-6d820b6d38"}>
                    <div className={"root-modal-util-679d69ab9b"}>
                      <ShieldAlert className={"root-modal-util-3a33b9b074"} />
                    </div>
                    <div>
                      <div className={"root-modal-util-6cfc7e6ab3"}>
                        <p className={"root-modal-util-14d6efe9ef"}>Pandemi Aktif</p>
                        {remainingPandemicDays !== null && (
                          <span className={"root-modal-util-d93c6d1885"}>
                            <Clock className={"root-modal-util-2797a07007"} />
                            Sisa {remainingPandemicDays} Hari
                          </span>
                        )}
                      </div>
                      <h3 className={`root-modal-util-04f32edb66 root-modal-util-dbcbe995b4 `}>{activePandemic.eventName || "Pandemi global"}</h3>
                      <p className={"root-modal-util-ff67d08b4e"}>Tangani sekarang: pulihkan {pandemicDeaths.toLocaleString("id-ID")} jiwa.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={!canTreatPandemic || !setCountryDetail}
                    onClick={treatPandemic}
                    className={"root-modal-util-e0468dc83b"}
                  >
                    Tangani · {pandemicCost.toLocaleString("id-ID")} NEO
                  </button>
                </div>
                {!canTreatPandemic && <p className={"root-modal-util-3844ce614c"}>Kas negara tidak mencukupi.</p>}
              </section>
            )}

          </div>
        </div>
        </div>
      </div>
    </NotebookModalWrapper>}

    <MenuInfoModal
      isOpen={isInfoOpen}
      onClose={() => setIsInfoOpen(false)}
      title="Informasi Kependudukan"
    >
      {populationPolicyImpactContent}
    </MenuInfoModal>

      {/* ============ RENDER MODAL DETAIL ============ */}
      {isDetailBirthOpen && <DetailKelahiranModal
        isOpen={isDetailBirthOpen}
        onClose={() => setIsDetailBirthOpen(false)}
        countryDetail={countryDetail}
        selectedCountry={selectedCountry}
        dailyBirths={dailyBirths}
        dailyDeaths={dailyDeaths}
        netDailyChange={totalDailyDelta}
        onOpenTempatUmum={(tabId: string) => {
          setTempatUmumActiveTab(tabId);
          setIsTempatUmumOpen(true);
          setIsDetailBirthOpen(false);
        }}
      />}

      {isDetailDeathOpen && <DetailKematianModal
        isOpen={isDetailDeathOpen}
        onClose={() => setIsDetailDeathOpen(false)}
        countryDetail={countryDetail}
        selectedCountry={selectedCountry}
        dailyDeaths={dailyDeaths}
        homelessCount={homelessCount}
        onOpenTempatUmum={(tabId: string) => {
          setTempatUmumActiveTab(tabId);
          setIsTempatUmumOpen(true);
          setIsDetailDeathOpen(false);
        }}
        onOpenIndustriPangan={() => {
          setActiveMenu?.("Menu:IndustriPangan");
        }}
        onOpenArmada={(tabId) => {
          if (tabId === 'aktif' || tabId === 'infrastruktur') {
            onOpenArmadaTab?.(tabId);
          } else {
            onOpenArmadaTab?.('aktif');
          }
        }}
      />}

      {isTempatUmumOpen && <TempatUmumModal
        isOpen={true}
        onClose={() => setIsTempatUmumOpen(false)}
        countryDetail={countryDetail}
        setCountryDetail={(updated) => {
          // Update countryDetail melalui parent jika diperlukan
        }}
        initialTab={tempatUmumActiveTab}
      />}

      {kesejahteraanModal}

      {isTunawismaOpen && <TunawismaDetailModal
        isOpen={isTunawismaOpen}
        onClose={() => setIsTunawismaOpen(false)}
        countryDetail={countryDetail}
        selectedCountry={selectedCountry}
        homelessCount={homelessCount}
      />}
    </>
  );
}