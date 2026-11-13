"use client"

import { useState, useMemo, useEffect } from "react";
import {
  Info, TrendingUp, TrendingDown, BookOpen, Heart, MapPin,
  Wheat, Home, Library, Hospital, Landmark, CheckCircle, Sprout, Globe, Zap, ShieldCheck,
  Minus, AlertTriangle, Lightbulb, CheckCircle2, Star
} from "lucide-react";
import {
  calculateKesejahteraan,
  getKesejahteraanStatus,
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
import NotebookModalWrapper from "../../NotebookModalWrapper";

// ── Kelas CSS untuk Scrollbar (Tailwind Murni) ──
const scrollbarDark = "root-modal-util-62ec13c825";

const scrollbarInner = "root-modal-util-0a361b9445";

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
  const status = getKesejahteraanStatus(overallScore);

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

  const getTrendIcon = (trend: 'naik' | 'turun' | 'stabil') => {
    switch (trend) {
      case 'naik':
        return <TrendingUp className={"root-modal-util-0da45f160d"} />;
      case 'turun':
        return <TrendingDown className={"root-modal-util-8297eefa73"} />;
      default:
        return <Minus className={"root-modal-util-f93163651e"} />;
    }
  };

  return (
    <>
      <NotebookModalWrapper onClose={onClose} zIndexClass="z-[70]">
        <div className={"root-modal-util-4644119199"}>
          {/* Header */}
          <div className={"satisfaction-modal-header root-modal-util-9462ce2345"}>
            <div className={"satisfaction-modal-header-main root-modal-util-020752a5a2 no-scrollbar"}>
              <div className={"root-modal-util-08dfbca033"}>
                <div className={"root-modal-util-739d92b232"}>
                  <MapPin className={"root-modal-util-d252947d10"} />
                </div>
                <h2 className={`root-modal-util-6b4648c53a root-modal-util-c2385a463d`}>
                  Kesejahteraan
                </h2>
              </div>

            </div>

            <RootModalCloseButton onClick={onClose} />
          </div>

          {/* Content (Scrollable) */}
          <div className={`root-modal-util-02dd6794b4 ${scrollbarDark}`}>
            <div className={"root-modal-enter root-modal-fade-in root-modal-util-844322115e"}>
              <div className={"root-modal-util-6d5b89fc13"}>
                <div className={`welfare-modal-score-card root-modal-util-5f22e64f22 root-modal-util-c7fc9dfef1`}>
                  <div className={"welfare-modal-score-content root-modal-util-619d6b1c3c"}>
                    <div>
                      <p className={"root-modal-util-cb863dc36d"}>Indeks Kesejahteraan Keseluruhan</p>
                      <div className={"root-modal-util-e6bf4398f0"}>
                        <span className={"root-modal-util-9392c390b5"}>{overallScore}</span>
                        <span className={"root-modal-util-ed90095d77"}>/100</span>
                      </div>
                      <p className={"root-modal-util-80b1941b5e"}>{status}</p>
                    </div>
                    <div className={"welfare-modal-score-controls"}>
                      <RootModalTabs
                        className={"satisfaction-modal-tabs"}
                        compact
                        items={[
                          {
                            label: "Statistik",
                            isActive: activeTab === "statistik",
                            onClick: () => setActiveTab("statistik"),
                            onPointerDown: () => setActiveTab("statistik"),
                          },
                          {
                            label: "Naikkan Kesejahteraan",
                            isActive: activeTab === "naikkan",
                            onClick: () => setActiveTab("naikkan"),
                            onPointerDown: () => setActiveTab("naikkan"),
                          },
                        ]}
                      />
                      <div className={"root-modal-util-39e1d08950"}>
                        {getTrendIcon(kesejahteraan.trend)}
                        <span className={"root-modal-util-be9ac43ed4"}>{kesejahteraan.trend}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {activeTab === "statistik" ? (
                  <div className={"root-modal-util-6f7e013d64"}>
                    {/* Breakdown Komponen */}
                    <h3 className={"root-modal-util-8c1ba2cf8a"}>
                      <span className={"root-modal-util-308fa49d4e"}></span>
                      Breakdown Sektor & Layanan Dasar
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
                              <p className={"root-modal-util-bfc85419bc"}>Kelistrikan</p>
                              <p className={"root-modal-util-ff4a95d9d4"}>Cakupan pasokan</p>
                            </div>
                          </div>
                          <span className={`root-modal-util-d385c0a7e6 ${listrikColor.text}`}>{listrikActualScore}</span>
                        </div>
                        <p className={"root-modal-util-12e912b2e4"}>
                          Indeks kecukupan listrik: <span className={"root-modal-util-da18d116be"}>{listrikActualScore}/100</span>
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
                                  <p className={"root-modal-util-bfc85419bc"}>Pendidikan</p>
                                  <p className={"root-modal-util-ff4a95d9d4"}>35% Bobot</p>
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
                              <p>• Fasilitas: <span className={"root-modal-util-da18d116be"}>{currentPendidikan.toLocaleString("id-ID")}</span> unit</p>
                              <p>• Target: <span className={"root-modal-util-da18d116be"}>{targetPendidikan.toLocaleString("id-ID")}</span> unit</p>
                              {neededPendidikan > 0 ? (
                                <p className={"root-modal-util-02fffef823"}>
                                  • Kurang: <span className={"root-modal-util-7fbb85697d"}>+{neededPendidikan.toLocaleString("id-ID")}</span> unit
                                </p>
                              ) : (
                                <p className={"root-modal-util-69c630ecae"}>
                                  <CheckCircle2 className={"root-modal-util-326a1fe33b"} /> Target tercapai
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
                                  <p className={"root-modal-util-bfc85419bc"}>Kesehatan</p>
                                  <p className={"root-modal-util-ff4a95d9d4"}>40% Bobot</p>
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
                              <p>• Skor: <span className={"root-modal-util-da18d116be"}>{kesehatanActualScore}/100</span></p>
                              <div className={"root-modal-util-d58dbd7f1c"}>
                                <p>• Epidemi: <span className={"root-modal-util-cb014ce7f3"}>{risikoEpidemiPercent}%/thn ({risikoEpidemiBulanan.toLocaleString("id-ID", { maximumFractionDigits: 2 })}%/bln)</span></p>
                                <p>• Pandemi: <span className={"root-modal-util-cb014ce7f3"}>{risikoPandemiPercent}%/thn ({risikoPandemiBulanan.toLocaleString("id-ID", { maximumFractionDigits: 2 })}%/bln)</span></p>
                                {isWHOMember && (
                                  <span className={"root-modal-util-8de47573c6"}>WHO -5%</span>
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
                              <p className={"root-modal-util-bfc85419bc"}>Infrastruktur</p>
                              <p className={"root-modal-util-ff4a95d9d4"}>25% Bobot</p>
                            </div>
                          </div>
                          <span className={`root-modal-util-d385c0a7e6 ${tempatUmumColor.text}`}>{infrastrukturActualScore}</span>
                        </div>
                        <p className={"root-modal-util-12e912b2e4"}>
                          Skor transportasi & infrastruktur: <span className={"root-modal-util-da18d116be"}>{infrastrukturActualScore}/100</span>
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
                                  <p className={"root-modal-util-bfc85419bc"}>Penegakan Hukum</p>
                                  <p className={"root-modal-util-ff4a95d9d4"}>Kepuasan Rakyat</p>
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
                              <p>• Skor Hukum: <span className={"root-modal-util-da18d116be"}>{lawScore}/100</span></p>
                              <div className={"root-modal-util-d58dbd7f1c"}>
                                <p>• Risiko Kriminal: <span className={"root-modal-util-cb014ce7f3"}>{securityRiskPercent}%</span></p>
                                {isInterpolMember && (
                                  <span className={"root-modal-util-8de47573c6"}>Interpol -5%</span>
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
                              <p className={"root-modal-util-bfc85419bc"}>Pangan</p>
                              <p className={"root-modal-util-ff4a95d9d4"}>Kepuasan Rakyat</p>
                            </div>
                          </div>
                          <span className={`root-modal-util-d385c0a7e6 ${panganColor.text}`}>{panganActualScore}</span>
                        </div>
                        <div className={"root-modal-util-f99ad0a975"}>
                          <p>• Indeks: <span className={"root-modal-util-da18d116be"}>{panganActualScore}/100</span></p>
                          {panganActualScore < 100 ? (
                            <p className={"root-modal-util-02fffef823"}>Tingkatkan produksi pangan</p>
                          ) : (
                            <p className={"root-modal-util-69c630ecae"}><CheckCircle2 className={"root-modal-util-326a1fe33b"} /> Terpenuhi 100%</p>
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
                              <p className={"root-modal-util-bfc85419bc"}>Hunian</p>
                              <p className={"root-modal-util-ff4a95d9d4"}>Kepuasan Rakyat</p>
                            </div>
                          </div>
                          <span className={`root-modal-util-d385c0a7e6 ${hunianColor.text}`}>{hunianActualScore}</span>
                        </div>
                        <div className={"root-modal-util-f99ad0a975"}>
                          <p>• Indeks: <span className={"root-modal-util-da18d116be"}>{hunianActualScore}/100</span></p>
                          {hunianActualScore < 100 ? (
                            <p className={"root-modal-util-02fffef823"}>Tambah rumah subsidi</p>
                          ) : (
                            <p className={"root-modal-util-69c630ecae"}><CheckCircle2 className={"root-modal-util-326a1fe33b"} /> Terpenuhi 100%</p>
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
                              <p className={"root-modal-util-bfc85419bc"}>Keterbukaan</p>
                              <p className={"root-modal-util-ff4a95d9d4"}>HAM & Kebebasan</p>
                            </div>
                          </div>
                          <span className={`root-modal-util-d385c0a7e6 ${keterbukaanColor.text}`}>{keterbukaanActualScore}</span>
                        </div>
                        <div className={"root-modal-util-f99ad0a975"}>
                          <p>• Indeks: <span className={"root-modal-util-da18d116be"}>{keterbukaanActualScore}/100</span></p>
                          {keterbukaanActualScore < 100 ? (
                            <p className={"root-modal-util-02fffef823"}>Jamin kebebasan pers</p>
                          ) : (
                            <p className={"root-modal-util-69c630ecae"}><CheckCircle2 className={"root-modal-util-326a1fe33b"} /> Optimal 100%</p>
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
        <div className={"root-modal-util-f5ce218781"}>
          <div
            onClick={(e) => e.stopPropagation()}
            className={`root-modal-util-3443dcd9d5 ${scrollbarInner}`}
          >
            <RootModalCloseButton
              onClick={() => setShowPendidikanInfoModal(false)}
              className={"root-modal-util-9f672f28d8"}
            />

            <div className={"root-modal-util-c9149b7c89"}>
              <div className={"root-modal-util-e50e0a173e"}>
                <Library className={"root-modal-util-a8600f1bbf"} />
              </div>
              <div>
                <h3 className={"root-modal-util-cffa11fbe4"}>Pengaruh Poin Pendidikan</h3>
                <p className={"root-modal-util-2a2ce278e0"}>Efek Kecepatan Riset & Panduan Strategis</p>
              </div>
            </div>

            {(() => {
              const eduModifier = getEducationResearchModifier(pendidikanActualScore);
              return (
                <div className={"root-modal-util-f8b3c1b860"}>
                  <div className={"root-modal-util-38ae88ec05"}>
                    <div className={"root-modal-util-336d1f1d8f"}>
                      <span className={"root-modal-util-c5fc255da3"}>Poin Saat Ini:</span>
                      <span className={"root-modal-util-569f745188"}>{pendidikanActualScore} / 100</span>
                    </div>
                    <div className={`root-modal-util-94239ed579 ${eduModifier.isPenalty ? "root-modal-util-8a6983338b" : "root-modal-util-5f01ac7ec5"}`}>
                      <span>Waktu Riset:</span>
                      <span className={"root-modal-util-e45589f405"}>{eduModifier.label}</span>
                    </div>
                  </div>

                  <div className={"root-modal-util-5a2508227c"}>
                    <p className={"root-modal-util-f02c422297"}>Skala Efek:</p>
                    <div className={"root-modal-util-4d27ab2ea5"}>
                      {[
                        { range: '0-25', effect: '+25% Waktu', penalty: true, isCurrent: pendidikanActualScore <= 25 },
                        { range: '26-40', effect: '+20% Waktu', penalty: true, isCurrent: pendidikanActualScore >= 26 && pendidikanActualScore <= 40 },
                        { range: '41-65', effect: '+15% Waktu', penalty: true, isCurrent: pendidikanActualScore >= 41 && pendidikanActualScore <= 65 },
                        { range: '66-80', effect: '-5% Waktu', penalty: false, isCurrent: pendidikanActualScore >= 66 && pendidikanActualScore <= 80 },
                        { range: '81-100', effect: '-10% Waktu', penalty: false, isCurrent: pendidikanActualScore >= 81 },
                      ].map((tier, idx) => (
                        <div key={idx} className={`root-modal-util-ad24a432b1 ${tier.isCurrent ? (tier.penalty ? "root-modal-util-67755adf0d" : "root-modal-util-958da07d7a") : "root-modal-util-e53d8041e6"}`}>
                          <span className={"root-modal-util-c4ffe894c4"}>{tier.range} Poin</span>
                          <span className={"root-modal-util-16ece4f30e"}>{tier.effect} {tier.isCurrent && <Star className={"root-modal-util-66c05d1d5e"} />}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className={"root-modal-util-609d307c0d"}>
                    <p className={"root-modal-util-31afa83c1d"}><Info className={"root-modal-util-326a1fe33b"} /> Petunjuk:</p>
                    {eduModifier.isPenalty ? (
                      <div className={"root-modal-util-afef770b5b"}>
                        <p className={"root-modal-util-b64f7344df"}><AlertTriangle className={"root-modal-util-80ba67b58c"} /><span>Pendidikan rendah! Waktu riset +{eduModifier.percentageChange}% lebih lambat.</span></p>
                        <p className={"root-modal-util-9d069da587"}><Lightbulb className={"root-modal-util-80ba67b58c"} /><span>Segera bangun fasilitas hingga skor &gt;65 poin!</span></p>
                      </div>
                    ) : (
                      <div className={"root-modal-util-afef770b5b"}>
                        <p className={"root-modal-util-08fbb6b90c"}><CheckCircle2 className={"root-modal-util-80ba67b58c"} /><span>Pendidikan baik! Efisiensi riset {eduModifier.percentageChange}%.</span></p>
                        <p className={"root-modal-util-9d069da587"}><Lightbulb className={"root-modal-util-80ba67b58c"} /><span>Tingkatkan ke 81-100 poin untuk maksimal.</span></p>
                      </div>
                    )}
                  </div>

                  <button onClick={() => { setShowPendidikanInfoModal(false); onOpenTempatUmum?.('pendidikan'); if (!onOpenTempatUmum) setActiveMenu?.("Menu:TempatUmum"); onClose(); }} className={"root-modal-util-b0fb4ac7fe"}>
                    <Library className={"root-modal-util-0bfbea3268"} /> Bangun Fasilitas Pendidikan
                  </button>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* MODAL INFO KESEHATAN */}
      {showKesehatanInfoModal && (
        <div className={"root-modal-util-f5ce218781"}>
          <div
            onClick={(e) => e.stopPropagation()}
            className={`root-modal-util-3443dcd9d5 ${scrollbarInner}`}
          >
            <RootModalCloseButton
              onClick={() => setShowKesehatanInfoModal(false)}
              className={"root-modal-util-9f672f28d8"}
            />

            <div className={"root-modal-util-c9149b7c89"}>
              <div className={"root-modal-util-e50e0a173e"}>
                <Hospital className={"root-modal-util-a8600f1bbf"} />
              </div>
              <div>
                <h3 className={"root-modal-util-cffa11fbe4"}>Pengaruh Pelayanan Kesehatan</h3>
                <p className={"root-modal-util-2a2ce278e0"}>Risiko Wabah & Panduan Layanan Medis</p>
              </div>
            </div>

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
                      <span className={"root-modal-util-c5fc255da3"}>Skor Saat Ini:</span>
                      <span className={"root-modal-util-569f745188"}>{kesehatanActualScore} / 100</span>
                    </div>
                    <div className={`root-modal-util-94239ed579 ${isPenalty ? "root-modal-util-8a6983338b" : "root-modal-util-5f01ac7ec5"}`}>
                      <div className={"root-modal-util-e2eedc5718"}>
                        <p className={"root-modal-util-33481acba8"}><span>Epidemi:</span><span className={"root-modal-util-7fbb85697d"}>{risikoEpidemiPercent}%/thn ({risikoEpidemiBulanan.toLocaleString("id-ID", { maximumFractionDigits: 2 })}%/bln)</span></p>
                        <p className={"root-modal-util-33481acba8"}><span>Pandemi:</span><span className={"root-modal-util-7fbb85697d"}>{risikoPandemiPercent}%/thn ({risikoPandemiBulanan.toLocaleString("id-ID", { maximumFractionDigits: 2 })}%/bln)</span></p>
                      </div>
                      {isWHOMember && <span className={"root-modal-util-54ee19d77c"}>WHO -5%</span>}
                    </div>
                  </div>

                  <div className={"root-modal-util-5a2508227c"}>
                    <p className={"root-modal-util-f02c422297"}>Skala Kesehatan & Wabah:</p>
                    <div className={"root-modal-util-4d27ab2ea5"}>
                      {[
                        { range: '0-25', effect: 'Kritis! 75-100%', penalty: true, isCurrent: kesehatanActualScore <= 25 },
                        { range: '26-40', effect: 'Tinggi! 60-74%', penalty: true, isCurrent: kesehatanActualScore >= 26 && kesehatanActualScore <= 40 },
                        { range: '41-65', effect: 'Sedang. 35-59%', penalty: true, isCurrent: kesehatanActualScore >= 41 && kesehatanActualScore <= 65 },
                        { range: '66-80', effect: 'Baik. 20-34%', penalty: false, isCurrent: kesehatanActualScore >= 66 && kesehatanActualScore <= 80 },
                        { range: '81-100', effect: 'Sangat Baik! 0-19%', penalty: false, isCurrent: kesehatanActualScore >= 81 },
                      ].map((tier, idx) => (
                        <div key={idx} className={`root-modal-util-ad24a432b1 ${tier.isCurrent ? (tier.penalty ? "root-modal-util-67755adf0d" : "root-modal-util-958da07d7a") : "root-modal-util-e53d8041e6"}`}>
                          <span className={"root-modal-util-c4ffe894c4"}>{tier.range} Poin</span>
                          <span className={"root-modal-util-16ece4f30e"}>{tier.effect} {tier.isCurrent && <Star className={"root-modal-util-66c05d1d5e"} />}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className={"root-modal-util-609d307c0d"}>
                    <p className={"root-modal-util-31afa83c1d"}><Info className={"root-modal-util-326a1fe33b"} /> Petunjuk:</p>
                    {isPenalty ? (
                      <div className={"root-modal-util-afef770b5b"}>
                        <p className={"root-modal-util-b64f7344df"}><AlertTriangle className={"root-modal-util-80ba67b58c"} /><span>Kesehatan Rentan! Risiko wabah tinggi.</span></p>
                        <p className={"root-modal-util-9d069da587"}><Lightbulb className={"root-modal-util-80ba67b58c"} /><span>Bangun fasilitas kesehatan &gt;65 poin.</span></p>
                      </div>
                    ) : (
                      <div className={"root-modal-util-afef770b5b"}>
                        <p className={"root-modal-util-08fbb6b90c"}><CheckCircle2 className={"root-modal-util-80ba67b58c"} /><span>Kesehatan Baik! Risiko wabah rendah.</span></p>
                        <p className={"root-modal-util-9d069da587"}><Lightbulb className={"root-modal-util-80ba67b58c"} /><span>Pertahankan & capai 81-100 poin.</span></p>
                      </div>
                    )}
                  </div>

                  <button onClick={() => { setShowKesehatanInfoModal(false); onOpenTempatUmum?.('kesehatan'); if (!onOpenTempatUmum) setActiveMenu?.("Menu:TempatUmum"); onClose(); }} className={"root-modal-util-b0fb4ac7fe"}>
                    <Hospital className={"root-modal-util-0bfbea3268"} /> Bangun Fasilitas Kesehatan
                  </button>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* MODAL INFO PENEGAKAN HUKUM */}
      {showPenegakanHukumInfoModal && (
        <div className={"root-modal-util-f5ce218781"}>
          <div
            onClick={(e) => e.stopPropagation()}
            className={`root-modal-util-3443dcd9d5 ${scrollbarInner}`}
          >
            <RootModalCloseButton
              onClick={() => setShowPenegakanHukumInfoModal(false)}
              className={"root-modal-util-9f672f28d8"}
            />

            <div className={"root-modal-util-c9149b7c89"}>
              <div className={"root-modal-util-e50e0a173e"}>
                <ShieldCheck className={"root-modal-util-a8600f1bbf"} />
              </div>
              <div>
                <h3 className={"root-modal-util-cffa11fbe4"}>Pengaruh Penegakan Hukum</h3>
                <p className={"root-modal-util-2a2ce278e0"}>Risiko Kriminalitas & Panduan Hukum</p>
              </div>
            </div>

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
                      <span className={"root-modal-util-c5fc255da3"}>Skor Saat Ini:</span>
                      <span className={"root-modal-util-569f745188"}>{lawScore} / 100</span>
                    </div>
                    <div className={`root-modal-util-94239ed579 ${isPenalty ? "root-modal-util-8a6983338b" : "root-modal-util-5f01ac7ec5"}`}>
                      <span>Risiko Kriminal:</span>
                      <div className={"root-modal-util-2ad094a613"}>
                        <span className={"root-modal-util-e45589f405"}>{securityRiskPercent}%</span>
                        {isInterpolMember && <span className={"root-modal-util-c3a2883716"}>Interpol -5%</span>}
                      </div>
                    </div>
                  </div>

                  <div className={"root-modal-util-5a2508227c"}>
                    <p className={"root-modal-util-f02c422297"}>Skala Penegakan Hukum:</p>
                    <div className={"root-modal-util-4d27ab2ea5"}>
                      {[
                        { range: '0-25', effect: 'Krisis! Kriminal Tinggi', penalty: true, isCurrent: lawScore <= 25 },
                        { range: '26-40', effect: 'Rawan! Meningkat', penalty: true, isCurrent: lawScore >= 26 && lawScore <= 40 },
                        { range: '41-65', effect: 'Sedang. Perlu Ditingkatkan', penalty: true, isCurrent: lawScore >= 41 && lawScore <= 65 },
                        { range: '66-80', effect: 'Aman. Stabil', penalty: false, isCurrent: lawScore >= 66 && lawScore <= 80 },
                        { range: '81-100', effect: 'Sangat Aman! Minimal', penalty: false, isCurrent: lawScore >= 81 },
                      ].map((tier, idx) => (
                        <div key={idx} className={`root-modal-util-ad24a432b1 ${tier.isCurrent ? (tier.penalty ? "root-modal-util-67755adf0d" : "root-modal-util-958da07d7a") : "root-modal-util-e53d8041e6"}`}>
                          <span className={"root-modal-util-c4ffe894c4"}>{tier.range} Poin</span>
                          <span className={"root-modal-util-16ece4f30e"}>{tier.effect} {tier.isCurrent && <Star className={"root-modal-util-66c05d1d5e"} />}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className={"root-modal-util-609d307c0d"}>
                    <p className={"root-modal-util-31afa83c1d"}><Info className={"root-modal-util-326a1fe33b"} /> Petunjuk:</p>
                    {isPenalty ? (
                      <div className={"root-modal-util-afef770b5b"}>
                        <p className={"root-modal-util-b64f7344df"}><AlertTriangle className={"root-modal-util-80ba67b58c"} /><span>Hukum Lemah! Kriminalitas tinggi.</span></p>
                        <p className={"root-modal-util-9d069da587"}><Lightbulb className={"root-modal-util-80ba67b58c"} /><span>Bangun Pos Polisi, Pengadilan, dll &gt;65 poin.</span></p>
                      </div>
                    ) : (
                      <div className={"root-modal-util-afef770b5b"}>
                        <p className={"root-modal-util-08fbb6b90c"}><CheckCircle2 className={"root-modal-util-80ba67b58c"} /><span>Hukum Baik! Risiko kriminal rendah.</span></p>
                        <p className={"root-modal-util-9d069da587"}><Lightbulb className={"root-modal-util-80ba67b58c"} /><span>Pertahankan & capai 81-100 poin.</span></p>
                      </div>
                    )}
                  </div>

                  <button onClick={() => { setShowPenegakanHukumInfoModal(false); onOpenTempatUmum?.('penegakan_hukum'); if (!onOpenTempatUmum) setActiveMenu?.("Menu:TempatUmum"); onClose(); }} className={"root-modal-util-b0fb4ac7fe"}>
                    <ShieldCheck className={"root-modal-util-0bfbea3268"} /> Bangun Sarana Hukum
                  </button>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </>
  );
}