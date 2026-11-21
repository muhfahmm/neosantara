"use client"

import { useState, useMemo, useEffect } from "react";
import {
  Info, BookOpen, Heart, MapPin,
  Wheat, Home, Library, Hospital, Landmark, CheckCircle, Sprout, Globe, Zap, ShieldCheck,
  AlertTriangle, Lightbulb, CheckCircle2, Star
} from "lucide-react";
import {
  calculateKesejahteraan,
  getKesejahteraanBreakdown,
  type KesejahteraanIndex,
} from "@/app/logic/kesejahteraanCalculator";
import {
  calculateKesehatanScore,
  calculateKeterbukaanScore,
  calculateListrikScore,
  calculatePanganScore,
  calculateHunianScore,
} from "@/app/logic/kepuasanCalculator";
import { fetchBuildingMetadata } from "@/lib/buildingMetadata";
import { getEducationResearchModifier } from "@/app/page/downgrade_logic";
import { isMemberOfInterpol, getInterpolCrimeRiskModifier, isMemberOfWHO, getWHOPandemicRiskModifier } from "@/app/page/bonus_logic";
import {
  EPIDEMIC_BASE_CHANCE_PERCENT,
  getMonthlyOutbreakChancePercent,
  getPandemicBaseChancePercentByYear,
} from "@/app/page/menus/inbox/logic/6_notifikasi_bencana/2_wabah_penyakit/wabahLogic";
import NaikkanKesejahteraanTab from "./NaikkanKesejahteraanTab";
import RootModalCloseButton from "@/app/page/root_modals_design_menu/RootModalCloseButton";
import { RootModalTabs } from "@/app/page/root_modals_design_menu/RootModalTabs";
import RootInfoModalHeader from "@/app/page/root_modals_design_menu/RootInfoModalHeader";
import { rootModalTypography } from "@/app/page/root_modals_design_menu/rootModalTypography";
import NotebookModalWrapper from "../../NotebookModalWrapper";
import { useLanguage } from "@/app/page/paused_menu/terjemahan_paused_menu/languageLogic";

// ── Kelas CSS untuk Scrollbar (Tailwind Murni) ──
const scrollbarDark = "root-modal-util-62ec13c825";

interface IndeksKesejahteraanModalProps {
  isOpen: boolean;
  onClose: () => void;
  countryDetail: any;
  setCountryDetail?: (detail: any) => void;
  selectedCountry: any;
  metrics?: any;
  setActiveMenu?: (menu: string) => void;
  onOpenTempatUmum?: (tab: string) => void;
  onOpenIndustriPangan?: () => void;
  currentDate?: Date | string;
  initialTab?: "statistik" | "naikkan";
}

export default function IndeksKesejahteraanModal({
  isOpen,
  onClose,
  countryDetail,
  setCountryDetail,
  selectedCountry,
  metrics,
  setActiveMenu,
  onOpenTempatUmum,
  onOpenIndustriPangan,
  currentDate,
  initialTab,
}: IndeksKesejahteraanModalProps) {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<"statistik" | "naikkan">(
    initialTab ?? "statistik",
  );
  const [showPendidikanInfoModal, setShowPendidikanInfoModal] = useState(false);
  const [showKesehatanInfoModal, setShowKesehatanInfoModal] = useState(false);
  const [showPenegakanHukumInfoModal, setShowPenegakanHukumInfoModal] = useState(false);

  const [metadata, setMetadata] = useState<any>(null);
  useEffect(() => {
    if (!isOpen) return;
    fetchBuildingMetadata().then((data) => setMetadata(data || {}));
  }, [isOpen]);

  const kesejahteraan = useMemo(() => {
    if (!countryDetail) return null;
    return calculateKesejahteraan(countryDetail, metadata);
  }, [countryDetail, metadata]);

  const pendidikanActualScore = useMemo(() => {
    if (!countryDetail) return 0;
    const pop = Number(countryDetail.jumlah_penduduk) || 1;
    const keys = ["prasekolah", "dasar", "menengah", "lanjutan", "universitas", "lembaga_pendidikan", "laboratorium", "observatorium", "pusat_penelitian", "pusat_pengembangan"];
    const total = keys.reduce((s, k) => s + (Number(countryDetail[k]) || 0), 0);
    const index = total / pop;
    return Math.min(100, Math.round((index / 0.0001) * 100));
  }, [countryDetail]);

  const kesehatanActualScore = useMemo(() => {
    return calculateKesehatanScore(countryDetail);
  }, [countryDetail]);

  const infrastrukturActualScore = useMemo(() => {
    if (!countryDetail) return 0;
    const pop = Number(countryDetail.jumlah_penduduk) || 1;
    const keys = ["jalur_sepeda", "jalan_raya", "terminal_bus", "stasiun_kereta_api", "kereta_bawah_tanah", "pelabuhan", "bandara", "helipad"];
    const total = keys.reduce((s, k) => s + (Number(countryDetail[k]) || 0), 0);
    const index = total / pop;
    return Math.min(100, Math.round((index / 0.00005) * 100));
  }, [countryDetail]);

  const panganActualScore = useMemo(() => {
    if (!countryDetail) return 1;
    const stored = countryDetail?.satisfaction?.food;
    if (!metadata || Object.keys(metadata).length === 0) return stored !== undefined && stored !== null ? Math.round(Number(stored)) : 0;
    return calculatePanganScore(countryDetail, metadata);
  }, [countryDetail, metadata]);

  const hunianActualScore = useMemo(() => {
    if (!countryDetail) return 1;
    const stored = countryDetail?.satisfaction?.housing;
    if (!metadata || Object.keys(metadata).length === 0) return stored !== undefined && stored !== null ? Math.round(Number(stored)) : 0;
    return calculateHunianScore(countryDetail, metadata);
  }, [countryDetail, metadata]);

  const listrikActualScore = useMemo(() => {
    if (!countryDetail) return 0;
    const stored = countryDetail?.satisfaction?.electricity;
    if (!metadata || Object.keys(metadata).length === 0) return stored !== undefined && stored !== null ? Math.round(Number(stored)) : 50;
    return calculateListrikScore(countryDetail, metadata);
  }, [countryDetail, metadata]);

  const keterbukaanActualScore = useMemo(() => {
    return calculateKeterbukaanScore(countryDetail);
  }, [countryDetail]);

  const overallScore = kesejahteraan?.overallScore ?? 50;

  if (!isOpen || !kesejahteraan) return null;

  const countryName = selectedCountry?.country || "Indonesia";

  const getScoreColor = (score: number) => {
    if (score >= 81) return { bg: "root-modal-util-4ecd8bae5f", border: "root-modal-util-410a4300f8", text: "root-modal-util-edbfd1c508", icon: "root-modal-util-edbfd1c508" };
    if (score >= 61) return { bg: "root-modal-util-4ecd8bae5f", border: "root-modal-util-183470941a", text: "root-modal-util-d21e44fbc2", icon: "root-modal-util-d21e44fbc2" };
    if (score >= 41) return { bg: "root-modal-util-4ecd8bae5f", border: "root-modal-util-5e9a5d9c8f", text: "root-modal-util-ce4daf63b9", icon: "root-modal-util-ce4daf63b9" };
    if (score >= 21) return { bg: "root-modal-util-4ecd8bae5f", border: "root-modal-util-9c0b6bcaa9", text: "root-modal-util-29a9a15f55", icon: "root-modal-util-29a9a15f55" };
    return { bg: "root-modal-util-4ecd8bae5f", border: "root-modal-util-045ad9f672", text: "root-modal-util-35f302741d", icon: "root-modal-util-35f302741d" };
  };

  const scoreColor = getScoreColor(overallScore);
  const pendidikanColor = getScoreColor(pendidikanActualScore);
  const kesehatanColor = getScoreColor(kesehatanActualScore);
  const tempatUmumColor = getScoreColor(infrastrukturActualScore);
  const penegakanHukumColor = getScoreColor(kesejahteraan.penegakanHukumScore);
  const panganColor = getScoreColor(panganActualScore);
  const hunianColor = getScoreColor(hunianActualScore);
  const listrikColor = getScoreColor(listrikActualScore);
  const keterbukaanColor = getScoreColor(keterbukaanActualScore);

  return (
    <>
      <NotebookModalWrapper onClose={onClose} zIndexClass="z-[70]">
        <div className={"root-modal-util-4644119199"}>
          <RootInfoModalHeader
            title={t("navigation_population_welfare.title")}
            icon={<MapPin aria-hidden="true" />}
            onClose={onClose}
            size="standard"
          />

          <div className={"satisfaction-modal-summary root-modal-util-6614545ce3"}>
            <div className={"root-modal-util-6cfc7e6ab3"}>
              <span className={"root-modal-util-14d6efe9ef root-modal-util-614c0c7dff"}>
                {t("navigation_population_welfare.indexLabel")}
              </span>
              <span className={"root-modal-util-04f32edb66 root-modal-util-4457a4d3a8"}>
                {overallScore}/100
              </span>
            </div>
            <div className={"satisfaction-modal-summary-controls flex-wrap"}>
              <RootModalTabs
                className={"satisfaction-modal-tabs"}
                items={[
                  {
                    label: t("navigation_population_welfare.statisticsTab"),
                    isActive: activeTab === "statistik",
                    onClick: () => setActiveTab("statistik"),
                    onPointerDown: () => setActiveTab("statistik"),
                  },
                  {
                    label: t("navigation_population_welfare.increaseTab"),
                    isActive: activeTab === "naikkan",
                    onClick: () => setActiveTab("naikkan"),
                    onPointerDown: () => setActiveTab("naikkan"),
                  },
                ]}
              />
            </div>
          </div>

          {/* Content (Scrollable) */}
          <div className={`root-modal-util-02dd6794b4 ${scrollbarDark}`}>
            <div className={"root-modal-enter root-modal-fade-in root-modal-util-844322115e"}>
              <div className={"root-modal-util-6d5b89fc13"}>
                {activeTab === "statistik" ? (
                  <div className={"root-modal-util-6f7e013d64"}>
                    {/* Breakdown Komponen */}
                    <h3 className={"root-modal-util-8c1ba2cf8a"}>
                      <span className={"root-modal-util-308fa49d4e"}></span>
                      {t("navigation_population_welfare.breakdownTitle")}
                    </h3>

                    <div className={"welfare-breakdown-grid root-modal-util-fcddc39279"}>
                      {/* Kelistrikan */}
                      <div
                        onClick={() => { setActiveMenu?.("Menu:Kelistrikan"); onClose(); }}
                        className={`root-modal-util-5f22e64f22 root-modal-util-ad9dda0691 ${listrikColor.border} ${listrikColor.bg} root-modal-util-432d85ba11 group`}
                      >
                        <div className={"root-modal-util-5beb42c98c"}>
                          <div className={"root-modal-util-6cfc7e6ab3"}>
                            <div className={"root-modal-util-6776d06ef8"}>
                              <Zap className={`root-modal-util-ce72f65c94 ${listrikColor.icon}`} />
                            </div>
                            <div>
                              <p className={"root-modal-util-bfc85419bc"}>{t("navigation_population_welfare.sectors.electricity")}</p>
                              <p className={"root-modal-util-ff4a95d9d4"}>{t("navigation_population_welfare.sectors.supplyCoverage")}</p>
                            </div>
                          </div>
                          <span className={`root-modal-util-d385c0a7e6 ${listrikColor.text}`}>{listrikActualScore}</span>
                        </div>
                        <p className={"root-modal-util-12e912b2e4"}>
                          {t("navigation_population_welfare.sectors.electricityIndex")} <span className={"root-modal-util-da18d116be"}>{listrikActualScore}/100</span>
                        </p>
                      </div>

                      {/* Pendidikan */}
                      {(() => {
                        const pop = Number(countryDetail?.jumlah_penduduk) || 1;
                        const targetPendidikan = Math.ceil(pop * 0.0001);
                        const currentPendidikan = kesejahteraan?.detail?.pendidikan?.totalFacilities ?? 0;
                        const neededPendidikan = Math.max(0, targetPendidikan - currentPendidikan);

                        return (
                          <div
                            onClick={() => { onOpenTempatUmum?.('pendidikan'); if (!onOpenTempatUmum) setActiveMenu?.("Menu:TempatUmum"); onClose(); }}
                            className={`root-modal-util-5f22e64f22 root-modal-util-ad9dda0691 ${pendidikanColor.border} ${pendidikanColor.bg} root-modal-util-432d85ba11 group`}
                          >
                            <div className={"root-modal-util-5beb42c98c"}>
                              <div className={"root-modal-util-6cfc7e6ab3"}>
                                <div className={"root-modal-util-6776d06ef8"}>
                                  <Library className={`root-modal-util-ce72f65c94 ${pendidikanColor.icon}`} />
                                </div>
                                <div>
                                  <p className={"root-modal-util-bfc85419bc"}>{t("navigation_population_welfare.sectors.education")}</p>
                                  <p className={"root-modal-util-ff4a95d9d4"}>{t("navigation_population_welfare.sectors.weight35")}</p>
                                </div>
                              </div>
                              <div className={"root-modal-util-2ad094a613"}>
                                <span className={`root-modal-util-d385c0a7e6 ${pendidikanColor.text}`}>{pendidikanActualScore}</span>
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); setShowPendidikanInfoModal(true); }}
                                  className={"root-modal-util-6aea45735a"}
                                >
                                  <Info className={"root-modal-util-326a1fe33b"} />
                                </button>
                              </div>
                            </div>
                            <div className={"root-modal-util-f99ad0a975"}>
                              <p>• {t("navigation_population_welfare.sectors.facilities")} <span className={"root-modal-util-da18d116be"}>{currentPendidikan.toLocaleString(language)}</span> {t("navigation_population_welfare.sectors.unit")}</p>
                              <p>• {t("navigation_population_welfare.sectors.target")} <span className={"root-modal-util-da18d116be"}>{targetPendidikan.toLocaleString(language)}</span> {t("navigation_population_welfare.sectors.unit")}</p>
                              {neededPendidikan > 0 ? (
                                <p className={"root-modal-util-02fffef823"}>
                                  • {t("navigation_population_welfare.sectors.shortage")} <span className={"root-modal-util-7fbb85697d"}>+{neededPendidikan.toLocaleString(language)}</span> {t("navigation_population_welfare.sectors.unit")}
                                </p>
                              ) : (
                                <p className={"root-modal-util-69c630ecae"}>
                                  <CheckCircle2 className={"root-modal-util-326a1fe33b"} /> {t("navigation_population_welfare.sectors.targetReached")}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })()}

                      {/* Kesehatan */}
                      {(() => {
                        const countryName = selectedCountry?.country || countryDetail?.country || "";
                        const whoModifier = getWHOPandemicRiskModifier(countryName, countryDetail);
                        const isWHOMember = isMemberOfWHO(countryName);
                        const currentDateStr = currentDate instanceof Date
                          ? `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`
                          : typeof currentDate === 'string' ? currentDate : new Date().toISOString().slice(0, 10);
                        const pandemicBase = getPandemicBaseChancePercentByYear(countryDetail, currentDateStr);
                        const risikoEpidemiPercent = Math.max(0, Math.min(100, EPIDEMIC_BASE_CHANCE_PERCENT + whoModifier));
                        const risikoPandemiPercent = Math.max(0, Math.min(100, pandemicBase + whoModifier));
                        const risikoEpidemiBulanan = getMonthlyOutbreakChancePercent(risikoEpidemiPercent);
                        const risikoPandemiBulanan = getMonthlyOutbreakChancePercent(risikoPandemiPercent);

                        return (
                          <div
                            onClick={() => { onOpenTempatUmum?.('kesehatan'); if (!onOpenTempatUmum) setActiveMenu?.("Menu:TempatUmum"); onClose(); }}
                            className={`root-modal-util-5f22e64f22 root-modal-util-ad9dda0691 ${kesehatanColor.border} ${kesehatanColor.bg} root-modal-util-432d85ba11 group`}
                          >
                            <div className={"root-modal-util-5beb42c98c"}>
                              <div className={"root-modal-util-6cfc7e6ab3"}>
                                <div className={"root-modal-util-6776d06ef8"}>
                                  <Hospital className={`root-modal-util-ce72f65c94 ${kesehatanColor.icon}`} />
                                </div>
                                <div>
                                  <p className={"root-modal-util-bfc85419bc"}>{t("navigation_population_welfare.sectors.health")}</p>
                                  <p className={"root-modal-util-ff4a95d9d4"}>{t("navigation_population_welfare.sectors.weight40")}</p>
                                </div>
                              </div>
                              <div className={"root-modal-util-2ad094a613"}>
                                <span className={`root-modal-util-d385c0a7e6 ${kesehatanColor.text}`}>{kesehatanActualScore}</span>
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); setShowKesehatanInfoModal(true); }}
                                  className={"root-modal-util-6aea45735a"}
                                >
                                  <Info className={"root-modal-util-326a1fe33b"} />
                                </button>
                              </div>
                            </div>
                            <div className={"root-modal-util-f99ad0a975"}>
                              <p>• {t("navigation_population_welfare.sectors.score")} <span className={"root-modal-util-da18d116be"}>{kesehatanActualScore}/100</span></p>
                              <div className={"root-modal-util-d58dbd7f1c"}>
                                <p>• {t("navigation_population_welfare.sectors.epidemic")} <span className={"root-modal-util-cb014ce7f3"}>{risikoEpidemiPercent}{t("navigation_population_welfare.sectors.perYear")} ({risikoEpidemiBulanan.toLocaleString(language, { maximumFractionDigits: 2 })}{t("navigation_population_welfare.sectors.perMonth")})</span></p>
                                <p>• {t("navigation_population_welfare.sectors.pandemic")} <span className={"root-modal-util-cb014ce7f3"}>{risikoPandemiPercent}{t("navigation_population_welfare.sectors.perYear")} ({risikoPandemiBulanan.toLocaleString(language, { maximumFractionDigits: 2 })}{t("navigation_population_welfare.sectors.perMonth")})</span></p>
                                {isWHOMember && (
                                  <span className={"root-modal-util-8de47573c6"}>{t("navigation_population_welfare.healthInfo.whoBonus")}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Infrastruktur */}
                      <div
                        onClick={() => { onOpenTempatUmum?.('infrastruktur'); if (!onOpenTempatUmum) setActiveMenu?.("Menu:TempatUmum"); onClose(); }}
                        className={`root-modal-util-5f22e64f22 root-modal-util-ad9dda0691 ${tempatUmumColor.border} ${tempatUmumColor.bg} root-modal-util-432d85ba11 group`}
                      >
                        <div className={"root-modal-util-5beb42c98c"}>
                          <div className={"root-modal-util-6cfc7e6ab3"}>
                            <div className={"root-modal-util-6776d06ef8"}>
                              <Landmark className={`root-modal-util-ce72f65c94 ${tempatUmumColor.icon}`} />
                            </div>
                            <div>
                              <p className={"root-modal-util-bfc85419bc"}>{t("navigation_population_welfare.sectors.infrastructure")}</p>
                              <p className={"root-modal-util-ff4a95d9d4"}>{t("navigation_population_welfare.sectors.weight25")}</p>
                            </div>
                          </div>
                          <span className={`root-modal-util-d385c0a7e6 ${tempatUmumColor.text}`}>{infrastrukturActualScore}</span>
                        </div>
                        <p className={"root-modal-util-12e912b2e4"}>
                          {t("navigation_population_welfare.sectors.transportScore")} <span className={"root-modal-util-da18d116be"}>{infrastrukturActualScore}/100</span>
                        </p>
                      </div>

                      {/* Penegakan Hukum */}
                      {(() => {
                        const lawScore = kesejahteraan.penegakanHukumScore;
                        const healthAndLawScore = (kesehatanActualScore + lawScore) / 2;
                        const baseSecurityRisk = Math.max(0, Math.min(100, Math.round(100 - healthAndLawScore)));
                        const countryName = selectedCountry?.country || countryDetail?.country || "";
                        const interpolModifier = getInterpolCrimeRiskModifier(countryName, countryDetail);
                        const isInterpolMember = isMemberOfInterpol(countryName);
                        const securityRiskPercent = Math.max(0, Math.min(100, baseSecurityRisk + interpolModifier));

                        return (
                          <div
                            onClick={() => { onOpenTempatUmum?.("penegakan_hukum"); if (!onOpenTempatUmum) setActiveMenu?.("Menu:TempatUmum"); onClose(); }}
                            className={`root-modal-util-5f22e64f22 root-modal-util-ad9dda0691 ${penegakanHukumColor.border} ${penegakanHukumColor.bg} root-modal-util-432d85ba11 group`}
                          >
                            <div className={"root-modal-util-5beb42c98c"}>
                              <div className={"root-modal-util-6cfc7e6ab3"}>
                                <div className={"root-modal-util-6776d06ef8"}>
                                  <ShieldCheck className={`root-modal-util-ce72f65c94 ${penegakanHukumColor.icon}`} />
                                </div>
                                <div>
                                  <p className={"root-modal-util-bfc85419bc"}>{t("navigation_population_welfare.sectors.law")}</p>
                                  <p className={"root-modal-util-ff4a95d9d4"}>{t("navigation_population_welfare.sectors.publicSatisfaction")}</p>
                                </div>
                              </div>
                              <div className={"root-modal-util-2ad094a613"}>
                                <span className={`root-modal-util-d385c0a7e6 ${penegakanHukumColor.text}`}>{lawScore}</span>
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); setShowPenegakanHukumInfoModal(true); }}
                                  className={"root-modal-util-6aea45735a"}
                                >
                                  <Info className={"root-modal-util-326a1fe33b"} />
                                </button>
                              </div>
                            </div>
                            <div className={"root-modal-util-f99ad0a975"}>
                              <p>• {t("navigation_population_welfare.sectors.lawScore")} <span className={"root-modal-util-da18d116be"}>{lawScore}/100</span></p>
                              <div className={"root-modal-util-d58dbd7f1c"}>
                                <p>• Risiko Kriminal: <span className={"root-modal-util-cb014ce7f3"}>{securityRiskPercent}%</span></p>
                                {isInterpolMember && (
                                  <span className={"root-modal-util-8de47573c6"}>{t("navigation_population_welfare.lawInfo.interpolBonus")}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Pangan */}
                      <div
                        onClick={() => { onOpenIndustriPangan ? onOpenIndustriPangan() : setActiveMenu?.("Menu:IndustriPangan"); onClose(); }}
                        className={`root-modal-util-5f22e64f22 root-modal-util-ad9dda0691 ${panganColor.border} ${panganColor.bg} root-modal-util-432d85ba11 group`}
                      >
                        <div className={"root-modal-util-5beb42c98c"}>
                          <div className={"root-modal-util-6cfc7e6ab3"}>
                            <div className={"root-modal-util-6776d06ef8"}>
                              <Wheat className={`root-modal-util-ce72f65c94 ${panganColor.icon}`} />
                            </div>
                            <div>
                              <p className={"root-modal-util-bfc85419bc"}>{t("navigation_population_welfare.sectors.food")}</p>
                              <p className={"root-modal-util-ff4a95d9d4"}>{t("navigation_population_welfare.sectors.publicSatisfaction")}</p>
                            </div>
                          </div>
                          <span className={`root-modal-util-d385c0a7e6 ${panganColor.text}`}>{panganActualScore}</span>
                        </div>
                        <div className={"root-modal-util-f99ad0a975"}>
                          <p>• {t("navigation_population_welfare.sectors.index")} <span className={"root-modal-util-da18d116be"}>{panganActualScore}/100</span></p>
                          {panganActualScore < 100 ? (
                            <p className={"root-modal-util-02fffef823"}>{t("navigation_population_welfare.sectors.increaseFoodProduction")}</p>
                          ) : (
                            <p className={"root-modal-util-69c630ecae"}><CheckCircle2 className={"root-modal-util-326a1fe33b"} /> {t("navigation_population_welfare.sectors.fulfilled")}</p>
                          )}
                        </div>
                      </div>

                      {/* Hunian */}
                      <div
                        onClick={() => { setActiveMenu?.("Menu:HunianPermukiman"); onClose(); }}
                        className={`root-modal-util-5f22e64f22 root-modal-util-ad9dda0691 ${hunianColor.border} ${hunianColor.bg} root-modal-util-432d85ba11 group`}
                      >
                        <div className={"root-modal-util-5beb42c98c"}>
                          <div className={"root-modal-util-6cfc7e6ab3"}>
                            <div className={"root-modal-util-6776d06ef8"}>
                              <Home className={`root-modal-util-ce72f65c94 ${hunianColor.icon}`} />
                            </div>
                            <div>
                              <p className={"root-modal-util-bfc85419bc"}>{t("navigation_population_welfare.sectors.housing")}</p>
                              <p className={"root-modal-util-ff4a95d9d4"}>{t("navigation_population_welfare.sectors.publicSatisfaction")}</p>
                            </div>
                          </div>
                          <span className={`root-modal-util-d385c0a7e6 ${hunianColor.text}`}>{hunianActualScore}</span>
                        </div>
                        <div className={"root-modal-util-f99ad0a975"}>
                          <p>• {t("navigation_population_welfare.sectors.index")} <span className={"root-modal-util-da18d116be"}>{hunianActualScore}/100</span></p>
                          {hunianActualScore < 100 ? (
                            <p className={"root-modal-util-02fffef823"}>{t("navigation_population_welfare.sectors.addSubsidizedHomes")}</p>
                          ) : (
                            <p className={"root-modal-util-69c630ecae"}><CheckCircle2 className={"root-modal-util-326a1fe33b"} /> {t("navigation_population_welfare.sectors.fulfilled")}</p>
                          )}
                        </div>
                      </div>

                      {/* Doktrin & Keterbukaan */}
                      <div
                        onClick={() => { setActiveMenu?.("Menu:DoktrinKeterbukaan"); onClose(); }}
                        className={`root-modal-util-5f22e64f22 root-modal-util-ad9dda0691 ${keterbukaanColor.border} ${keterbukaanColor.bg} root-modal-util-432d85ba11 group`}
                      >
                        <div className={"root-modal-util-5beb42c98c"}>
                          <div className={"root-modal-util-6cfc7e6ab3"}>
                            <div className={"root-modal-util-6776d06ef8"}>
                              <Globe className={`root-modal-util-ce72f65c94 ${keterbukaanColor.icon}`} />
                            </div>
                            <div>
                              <p className={"root-modal-util-bfc85419bc"}>{t("navigation_population_welfare.sectors.openness")}</p>
                              <p className={"root-modal-util-ff4a95d9d4"}>{t("navigation_population_welfare.sectors.rightsFreedom")}</p>
                            </div>
                          </div>
                          <span className={`root-modal-util-d385c0a7e6 ${keterbukaanColor.text}`}>{keterbukaanActualScore}</span>
                        </div>
                        <div className={"root-modal-util-f99ad0a975"}>
                          <p>• {t("navigation_population_welfare.sectors.index")} <span className={"root-modal-util-da18d116be"}>{keterbukaanActualScore}/100</span></p>
                          {keterbukaanActualScore < 100 ? (
                            <p className={"root-modal-util-02fffef823"}>{t("navigation_population_welfare.sectors.ensurePressFreedom")}</p>
                          ) : (
                            <p className={"root-modal-util-69c630ecae"}><CheckCircle2 className={"root-modal-util-326a1fe33b"} /> {t("navigation_population_welfare.sectors.optimal")}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <NaikkanKesejahteraanTab
                    countryDetail={countryDetail}
                    setCountryDetail={setCountryDetail || (() => {})}
                    selectedCountry={selectedCountry}
                    currentDate={currentDate}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </NotebookModalWrapper>

      {/* MODAL INFO EFEK POIN PENDIDIKAN */}
      {showPendidikanInfoModal && (
        <NotebookModalWrapper
          onClose={() => setShowPendidikanInfoModal(false)}
          zIndexClass="z-[75]"
        >
          <div className="flex h-full flex-col overflow-hidden">
            <header className="flex shrink-0 items-center justify-between gap-3 border-b border-root-accent/20 bg-root-canvas px-4 py-3 sm:px-6">
              <div className="flex min-w-0 items-center gap-3">
                <span className="shrink-0 rounded-lg border border-root-accent/30 bg-root-surface p-1.5 text-root-accent">
                  <Library className="h-5 w-5" />
                </span>
                <h3 className={`${rootModalTypography.title} min-w-0`}>
                  {t("navigation_population_welfare.educationInfo.title")}
                </h3>
              </div>
              <RootModalCloseButton onClick={() => setShowPendidikanInfoModal(false)} />
            </header>
            <div className="min-h-0 flex-1 overflow-y-auto bg-root-surface p-3 sm:p-4 neon-scrollbar">

            {(() => {
              const eduModifier = getEducationResearchModifier(pendidikanActualScore);
              const researchTimeLabel = eduModifier.percentageChange > 0
                ? t("navigation_population_welfare.educationInfo.researchTimePenalty", {
                    value: eduModifier.percentageChange,
                  })
                : eduModifier.percentageChange < 0
                  ? t("navigation_population_welfare.educationInfo.researchTimeBonus", {
                      value: Math.abs(eduModifier.percentageChange),
                    })
                  : t("navigation_population_welfare.educationInfo.researchTimeNeutral");
              return (
                <div className={"root-modal-util-f8b3c1b860"}>
                  <div className={"root-modal-util-38ae88ec05"}>
                    <div className={"root-modal-util-336d1f1d8f"}>
                      <span className={"root-modal-util-c5fc255da3"}>{t("navigation_population_welfare.educationInfo.currentPoints")}</span>
                      <span className={"root-modal-util-569f745188"}>{pendidikanActualScore} / 100</span>
                    </div>
                    <div className={`root-modal-util-94239ed579 ${eduModifier.isPenalty ? "root-modal-util-8a6983338b" : "root-modal-util-5f01ac7ec5"}`}>
                      <span>{t("navigation_population_welfare.educationInfo.researchTime")}</span>
                      <span className={"root-modal-util-e45589f405"}>{researchTimeLabel}</span>
                    </div>
                  </div>

                  <div className={"root-modal-util-5a2508227c"}>
                    <p className={"root-modal-util-f02c422297"}>{t("navigation_population_welfare.educationInfo.effectScale")}</p>
                    <div className={"root-modal-util-4d27ab2ea5"}>
                      {[
                        { range: '0-25', effect: t("navigation_population_welfare.educationInfo.tiers.veryLow"), penalty: true, isCurrent: pendidikanActualScore <= 25 },
                        { range: '26-40', effect: t("navigation_population_welfare.educationInfo.tiers.low"), penalty: true, isCurrent: pendidikanActualScore >= 26 && pendidikanActualScore <= 40 },
                        { range: '41-65', effect: t("navigation_population_welfare.educationInfo.tiers.belowAverage"), penalty: true, isCurrent: pendidikanActualScore >= 41 && pendidikanActualScore <= 65 },
                        { range: '66-80', effect: t("navigation_population_welfare.educationInfo.tiers.good"), penalty: false, isCurrent: pendidikanActualScore >= 66 && pendidikanActualScore <= 80 },
                        { range: '81-100', effect: t("navigation_population_welfare.educationInfo.tiers.excellent"), penalty: false, isCurrent: pendidikanActualScore >= 81 },
                      ].map((tier, idx) => (
                        <div key={idx} className={`root-modal-util-ad24a432b1 ${tier.isCurrent ? (tier.penalty ? "root-modal-util-67755adf0d" : "root-modal-util-958da07d7a") : "root-modal-util-e53d8041e6"}`}>
                          <span className={"root-modal-util-c4ffe894c4"}>{t("navigation_population_welfare.educationInfo.points", { range: tier.range })}</span>
                          <span className={"root-modal-util-16ece4f30e"}>{tier.effect} {tier.isCurrent && <Star className={"root-modal-util-66c05d1d5e"} />}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className={"root-modal-util-609d307c0d"}>
                    <p className={"root-modal-util-31afa83c1d"}><Info className={"root-modal-util-326a1fe33b"} /> {t("navigation_population_welfare.educationInfo.guidance")}</p>
                    {eduModifier.isPenalty ? (
                      <div className={"root-modal-util-afef770b5b"}>
                        <p className={"root-modal-util-b64f7344df"}><AlertTriangle className={"root-modal-util-80ba67b58c"} /><span>{t("navigation_population_welfare.educationInfo.penalty", { value: eduModifier.percentageChange })}</span></p>
                        <p className={"root-modal-util-9d069da587"}><Lightbulb className={"root-modal-util-80ba67b58c"} /><span>{t("navigation_population_welfare.educationInfo.buildToThreshold")}</span></p>
                      </div>
                    ) : (
                      <div className={"root-modal-util-afef770b5b"}>
                        <p className={"root-modal-util-08fbb6b90c"}><CheckCircle2 className={"root-modal-util-80ba67b58c"} /><span>{t("navigation_population_welfare.educationInfo.bonus", { value: eduModifier.percentageChange })}</span></p>
                        <p className={"root-modal-util-9d069da587"}><Lightbulb className={"root-modal-util-80ba67b58c"} /><span>{t("navigation_population_welfare.educationInfo.maximize")}</span></p>
                      </div>
                    )}
                  </div>

                  <button onClick={() => { setShowPendidikanInfoModal(false); onOpenTempatUmum?.('pendidikan'); if (!onOpenTempatUmum) setActiveMenu?.("Menu:TempatUmum"); onClose(); }} className={"root-modal-util-b0fb4ac7fe"}>
                    <Library className={"root-modal-util-0bfbea3268"} /> {t("navigation_population_welfare.educationInfo.buildButton")}
                  </button>
                </div>
              );
            })()}
          </div>
          </div>
        </NotebookModalWrapper>
      )}

      {/* MODAL INFO KESEHATAN */}
      {showKesehatanInfoModal && (
        <NotebookModalWrapper
          onClose={() => setShowKesehatanInfoModal(false)}
          zIndexClass="z-[75]"
        >
          <div className="flex h-full flex-col overflow-hidden">
            <header className="flex shrink-0 items-center justify-between gap-3 border-b border-root-accent/20 bg-root-canvas px-4 py-3 sm:px-6">
              <div className="flex min-w-0 items-center gap-3">
                <span className="shrink-0 rounded-lg border border-root-accent/30 bg-root-surface p-1.5 text-root-accent">
                  <Hospital className="h-5 w-5" />
                </span>
                <h3 className={`${rootModalTypography.title} min-w-0`}>
                  {t("navigation_population_welfare.healthInfo.title")}
                </h3>
              </div>
              <RootModalCloseButton onClick={() => setShowKesehatanInfoModal(false)} />
            </header>
            <div className="min-h-0 flex-1 overflow-y-auto bg-root-surface p-3 sm:p-4 neon-scrollbar">

            {(() => {
              const countryName = selectedCountry?.country || countryDetail?.country || "";
              const whoModifier = getWHOPandemicRiskModifier(countryName, countryDetail);
              const isWHOMember = isMemberOfWHO(countryName);
              const currentDateStr = currentDate instanceof Date ? `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}` : typeof currentDate === 'string' ? currentDate : new Date().toISOString().slice(0, 10);
              const pandemicBase = getPandemicBaseChancePercentByYear(countryDetail, currentDateStr);
              const risikoEpidemiPercent = Math.max(0, Math.min(100, EPIDEMIC_BASE_CHANCE_PERCENT + whoModifier));
              const risikoPandemiPercent = Math.max(0, Math.min(100, pandemicBase + whoModifier));
              const risikoEpidemiBulanan = getMonthlyOutbreakChancePercent(risikoEpidemiPercent);
              const risikoPandemiBulanan = getMonthlyOutbreakChancePercent(risikoPandemiPercent);
              const isPenalty = kesehatanActualScore <= 65;
              
              return (
                <div className={"root-modal-util-f8b3c1b860"}>
                  <div className={"root-modal-util-38ae88ec05"}>
                    <div className={"root-modal-util-336d1f1d8f"}>
                      <span className={"root-modal-util-c5fc255da3"}>{t("navigation_population_welfare.healthInfo.currentScore")}</span>
                      <span className={"root-modal-util-569f745188"}>{kesehatanActualScore} / 100</span>
                    </div>
                    <div className={`root-modal-util-94239ed579 ${isPenalty ? "root-modal-util-8a6983338b" : "root-modal-util-5f01ac7ec5"}`}>
                      <div className={"root-modal-util-e2eedc5718"}>
                        <p className={"root-modal-util-33481acba8"}><span>{t("navigation_population_welfare.healthInfo.epidemic")}</span><span className={"root-modal-util-7fbb85697d"}>{risikoEpidemiPercent}{t("navigation_population_welfare.healthInfo.perYear")} ({risikoEpidemiBulanan.toLocaleString(language, { maximumFractionDigits: 2 })}{t("navigation_population_welfare.healthInfo.perMonth")})</span></p>
                        <p className={"root-modal-util-33481acba8"}><span>{t("navigation_population_welfare.healthInfo.pandemic")}</span><span className={"root-modal-util-7fbb85697d"}>{risikoPandemiPercent}{t("navigation_population_welfare.healthInfo.perYear")} ({risikoPandemiBulanan.toLocaleString(language, { maximumFractionDigits: 2 })}{t("navigation_population_welfare.healthInfo.perMonth")})</span></p>
                      </div>
                      {isWHOMember && <span className={"root-modal-util-54ee19d77c"}>{t("navigation_population_welfare.healthInfo.whoBonus")}</span>}
                    </div>
                  </div>

                  <div className={"root-modal-util-5a2508227c"}>
                    <p className={"root-modal-util-f02c422297"}>{t("navigation_population_welfare.healthInfo.scale")}</p>
                    <div className={"root-modal-util-4d27ab2ea5"}>
                      {[
                        { range: '0-25', effect: t("navigation_population_welfare.healthInfo.tiers.critical"), penalty: true, isCurrent: kesehatanActualScore <= 25 },
                        { range: '26-40', effect: t("navigation_population_welfare.healthInfo.tiers.high"), penalty: true, isCurrent: kesehatanActualScore >= 26 && kesehatanActualScore <= 40 },
                        { range: '41-65', effect: t("navigation_population_welfare.healthInfo.tiers.moderate"), penalty: true, isCurrent: kesehatanActualScore >= 41 && kesehatanActualScore <= 65 },
                        { range: '66-80', effect: t("navigation_population_welfare.healthInfo.tiers.good"), penalty: false, isCurrent: kesehatanActualScore >= 66 && kesehatanActualScore <= 80 },
                        { range: '81-100', effect: t("navigation_population_welfare.healthInfo.tiers.excellent"), penalty: false, isCurrent: kesehatanActualScore >= 81 },
                      ].map((tier, idx) => (
                        <div key={idx} className={`root-modal-util-ad24a432b1 ${tier.isCurrent ? (tier.penalty ? "root-modal-util-67755adf0d" : "root-modal-util-958da07d7a") : "root-modal-util-e53d8041e6"}`}>
                          <span className={"root-modal-util-c4ffe894c4"}>{t("navigation_population_welfare.healthInfo.points", { range: tier.range })}</span>
                          <span className={"root-modal-util-16ece4f30e"}>{tier.effect} {tier.isCurrent && <Star className={"root-modal-util-66c05d1d5e"} />}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className={"root-modal-util-609d307c0d"}>
                    <p className={"root-modal-util-31afa83c1d"}><Info className={"root-modal-util-326a1fe33b"} /> {t("navigation_population_welfare.healthInfo.guidance")}</p>
                    {isPenalty ? (
                      <div className={"root-modal-util-afef770b5b"}>
                        <p className={"root-modal-util-b64f7344df"}><AlertTriangle className={"root-modal-util-80ba67b58c"} /><span>{t("navigation_population_welfare.healthInfo.penalty")}</span></p>
                        <p className={"root-modal-util-9d069da587"}><Lightbulb className={"root-modal-util-80ba67b58c"} /><span>{t("navigation_population_welfare.healthInfo.buildToThreshold")}</span></p>
                      </div>
                    ) : (
                      <div className={"root-modal-util-afef770b5b"}>
                        <p className={"root-modal-util-08fbb6b90c"}><CheckCircle2 className={"root-modal-util-80ba67b58c"} /><span>{t("navigation_population_welfare.healthInfo.bonus")}</span></p>
                        <p className={"root-modal-util-9d069da587"}><Lightbulb className={"root-modal-util-80ba67b58c"} /><span>{t("navigation_population_welfare.healthInfo.maximize")}</span></p>
                      </div>
                    )}
                  </div>

                  <button onClick={() => { setShowKesehatanInfoModal(false); onOpenTempatUmum?.('kesehatan'); if (!onOpenTempatUmum) setActiveMenu?.("Menu:TempatUmum"); onClose(); }} className={"root-modal-util-b0fb4ac7fe"}>
                    <Hospital className={"root-modal-util-0bfbea3268"} /> {t("navigation_population_welfare.healthInfo.buildButton")}
                  </button>
                </div>
              );
            })()}
          </div>
          </div>
        </NotebookModalWrapper>
      )}

      {/* MODAL INFO PENEGAKAN HUKUM */}
      {showPenegakanHukumInfoModal && (
        <NotebookModalWrapper
          onClose={() => setShowPenegakanHukumInfoModal(false)}
          zIndexClass="z-[75]"
        >
          <div className="flex h-full flex-col overflow-hidden">
            <header className="flex shrink-0 items-center justify-between gap-3 border-b border-root-accent/20 bg-root-canvas px-4 py-3 sm:px-6">
              <div className="flex min-w-0 items-center gap-3">
                <span className="shrink-0 rounded-lg border border-root-accent/30 bg-root-surface p-1.5 text-root-accent">
                  <ShieldCheck className="h-5 w-5" />
                </span>
                <h3 className={`${rootModalTypography.title} min-w-0`}>
                  {t("navigation_population_welfare.lawInfo.title")}
                </h3>
              </div>
              <RootModalCloseButton onClick={() => setShowPenegakanHukumInfoModal(false)} />
            </header>
            <div className="min-h-0 flex-1 overflow-y-auto bg-root-surface p-3 sm:p-4 neon-scrollbar">

            {(() => {
              const lawScore = kesejahteraan.penegakanHukumScore;
              const healthAndLawScore = (kesehatanActualScore + lawScore) / 2;
              const baseSecurityRisk = Math.max(0, Math.min(100, Math.round(100 - healthAndLawScore)));
              const countryName = selectedCountry?.country || countryDetail?.country || "";
              const interpolModifier = getInterpolCrimeRiskModifier(countryName, countryDetail);
              const isInterpolMember = isMemberOfInterpol(countryName);
              const securityRiskPercent = Math.max(0, Math.min(100, baseSecurityRisk + interpolModifier));
              const isPenalty = lawScore <= 65;
              
              return (
                <div className={"root-modal-util-f8b3c1b860"}>
                  <div className={"root-modal-util-38ae88ec05"}>
                    <div className={"root-modal-util-336d1f1d8f"}>
                      <span className={"root-modal-util-c5fc255da3"}>{t("navigation_population_welfare.lawInfo.currentScore")}</span>
                      <span className={"root-modal-util-569f745188"}>{lawScore} / 100</span>
                    </div>
                    <div className={`root-modal-util-94239ed579 ${isPenalty ? "root-modal-util-8a6983338b" : "root-modal-util-5f01ac7ec5"}`}>
                      <span>{t("navigation_population_welfare.lawInfo.crimeRisk")}</span>
                      <div className={"root-modal-util-2ad094a613"}>
                        <span className={"root-modal-util-e45589f405"}>{securityRiskPercent}%</span>
                        {isInterpolMember && <span className={"root-modal-util-c3a2883716"}>{t("navigation_population_welfare.lawInfo.interpolBonus")}</span>}
                      </div>
                    </div>
                  </div>

                  <div className={"root-modal-util-5a2508227c"}>
                    <p className={"root-modal-util-f02c422297"}>{t("navigation_population_welfare.lawInfo.scale")}</p>
                    <div className={"root-modal-util-4d27ab2ea5"}>
                      {[
                        { range: '0-25', effect: t("navigation_population_welfare.lawInfo.tiers.crisis"), penalty: true, isCurrent: lawScore <= 25 },
                        { range: '26-40', effect: t("navigation_population_welfare.lawInfo.tiers.highRisk"), penalty: true, isCurrent: lawScore >= 26 && lawScore <= 40 },
                        { range: '41-65', effect: t("navigation_population_welfare.lawInfo.tiers.moderate"), penalty: true, isCurrent: lawScore >= 41 && lawScore <= 65 },
                        { range: '66-80', effect: t("navigation_population_welfare.lawInfo.tiers.safe"), penalty: false, isCurrent: lawScore >= 66 && lawScore <= 80 },
                        { range: '81-100', effect: t("navigation_population_welfare.lawInfo.tiers.verySafe"), penalty: false, isCurrent: lawScore >= 81 },
                      ].map((tier, idx) => (
                        <div key={idx} className={`root-modal-util-ad24a432b1 ${tier.isCurrent ? (tier.penalty ? "root-modal-util-67755adf0d" : "root-modal-util-958da07d7a") : "root-modal-util-e53d8041e6"}`}>
                          <span className={"root-modal-util-c4ffe894c4"}>{t("navigation_population_welfare.lawInfo.points", { range: tier.range })}</span>
                          <span className={"root-modal-util-16ece4f30e"}>{tier.effect} {tier.isCurrent && <Star className={"root-modal-util-66c05d1d5e"} />}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className={"root-modal-util-609d307c0d"}>
                    <p className={"root-modal-util-31afa83c1d"}><Info className={"root-modal-util-326a1fe33b"} /> {t("navigation_population_welfare.lawInfo.guidance")}</p>
                    {isPenalty ? (
                      <div className={"root-modal-util-afef770b5b"}>
                        <p className={"root-modal-util-b64f7344df"}><AlertTriangle className={"root-modal-util-80ba67b58c"} /><span>{t("navigation_population_welfare.lawInfo.penalty")}</span></p>
                        <p className={"root-modal-util-9d069da587"}><Lightbulb className={"root-modal-util-80ba67b58c"} /><span>{t("navigation_population_welfare.lawInfo.buildToThreshold")}</span></p>
                      </div>
                    ) : (
                      <div className={"root-modal-util-afef770b5b"}>
                        <p className={"root-modal-util-08fbb6b90c"}><CheckCircle2 className={"root-modal-util-80ba67b58c"} /><span>{t("navigation_population_welfare.lawInfo.bonus")}</span></p>
                        <p className={"root-modal-util-9d069da587"}><Lightbulb className={"root-modal-util-80ba67b58c"} /><span>{t("navigation_population_welfare.lawInfo.maximize")}</span></p>
                      </div>
                    )}
                  </div>

                  <button onClick={() => { setShowPenegakanHukumInfoModal(false); onOpenTempatUmum?.('penegakan_hukum'); if (!onOpenTempatUmum) setActiveMenu?.("Menu:TempatUmum"); onClose(); }} className={"root-modal-util-b0fb4ac7fe"}>
                    <ShieldCheck className={"root-modal-util-0bfbea3268"} /> {t("navigation_population_welfare.lawInfo.buildButton")}
                  </button>
                </div>
              );
            })()}
          </div>
          </div>
        </NotebookModalWrapper>
      )}
    </>
  );
}