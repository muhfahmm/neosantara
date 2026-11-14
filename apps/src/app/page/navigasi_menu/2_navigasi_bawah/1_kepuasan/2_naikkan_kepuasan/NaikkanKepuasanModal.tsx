"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Smile,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Clock,
  Info,
  BarChart3,
  PartyPopper,
  Lightbulb,
} from "lucide-react";
import DanaTidakCukupModal from "./DanaTidakCukupModal";
import NotebookModalWrapper from "../../NotebookModalWrapper";
import RootModalTabs from "@/app/page/root_modals_design_menu/RootModalTabs";
import RootModalCloseButton from "@/app/page/root_modals_design_menu/RootModalCloseButton";
import MenuInfoModal from "@/app/page/navigasi_menu/2_navigasi_bawah/MenuInfoModal";
import {
  applyDiplomasiAcaraSatisfactionBonus,
  applyKementerianOlahragaSatisfactionBoost,
  getKementerianOlahragaEventSatisfactionBonusPercent,
  isSportEvent,
} from "@/app/page/bonus_logic";

interface NaikkanKepuasanModalProps {
  isOpen: boolean;
  onClose: () => void;
  setActiveMenu?: (menu: string) => void;
  countryDetail: any;
  setCountryDetail: (detail: any) => void;
  selectedCountry: any;
  presidentRating?: number;
  setPresidentRating?: (rating: number) => void;
  currentDate?: string | Date;
}

export default function NaikkanKepuasanModal({
  isOpen,
  onClose,
  setActiveMenu,
  countryDetail,
  setCountryDetail,
  selectedCountry,
  presidentRating = 50,
  setPresidentRating,
  currentDate,
}: NaikkanKepuasanModalProps) {
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [isDanaTidakCukupOpen, setIsDanaTidakCukupOpen] = useState(false);
  const [pendingCost, setPendingCost] = useState(0);
  const [pendingTitle, setPendingTitle] = useState("");
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [isMenuInfoOpen, setIsMenuInfoOpen] = useState(false);
  const [activeMissionId, setActiveMissionId] = useState<string | null>(null);
  const [highlightedEventId, setHighlightedEventId] = useState<string | null>(
    null
  );

  useEffect(() => {
    if (typeof window !== "undefined" && isOpen) {
      const currentActive = localStorage.getItem(
        "presiden_simulator_active_mission"
      );
      setActiveMissionId(currentActive);

      // Misi format: 'event_konser', 'event_festival', dll.
      if (currentActive && currentActive.startsWith("event_")) {
        const evId = currentActive.replace("event_", "");
        setHighlightedEventId(evId);
        const timer = setTimeout(() => {
          setHighlightedEventId(null);
        }, 6000);
        return () => clearTimeout(timer);
      }

      const handleActiveUpdate = (e: any) => {
        const newActive =
          e.detail?.cardId ??
          localStorage.getItem("presiden_simulator_active_mission");
        setActiveMissionId(newActive);
        if (newActive && newActive.startsWith("event_")) {
          setHighlightedEventId(newActive.replace("event_", ""));
          setTimeout(() => {
            setHighlightedEventId(null);
          }, 6000);
        }
      };

      window.addEventListener("mission_active_updated", handleActiveUpdate);
      return () =>
        window.removeEventListener("mission_active_updated", handleActiveUpdate);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const countryName = selectedCountry?.country || "Indonesia";
  const anggaran = countryDetail?.anggaran || 0;
  const kepuasan = countryDetail?.kepuasan ?? 50.0;

  const addDays = (dateString: string, days: number): string => {
    const [y, m, d] = dateString.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() + days);
    const yy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yy}-${mm}-${dd}`;
  };

  const getSafeDateString = (): string => {
    if (currentDate) {
      const d = currentDate instanceof Date ? currentDate : new Date(currentDate);
      if (!isNaN(d.getTime())) {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${y}-${m}-${day}`;
      }
    }
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const initiatives = [
    {
      id: "konser",
      title: "Konser",
      cost: 25000,
      boost: 5,
      duration: 1,
      image:
        "/images/game/population/satisfaction-events/satisfaction-event-asset-01.svg",
    },
    {
      id: "festival",
      title: "Festival",
      cost: 50000,
      boost: 10,
      duration: 3,
      image:
        "/images/game/population/satisfaction-events/satisfaction-event-asset-02.svg",
    },
    {
      id: "karnaval",
      title: "Karnaval",
      cost: 150000,
      boost: 15,
      duration: 3,
      image:
        "/images/game/population/satisfaction-events/satisfaction-event-asset-03.svg",
    },
    {
      id: "piala_davis",
      title: "Piala Davis",
      cost: 400000,
      boost: 30,
      duration: 7,
      image:
        "/images/game/population/satisfaction-events/satisfaction-event-asset-04.svg",
    },
    {
      id: "piala_dunia_rugbi",
      title: "Piala Dunia Rugbi",
      cost: 500000,
      boost: 50,
      duration: 14,
      image:
        "/images/game/population/satisfaction-events/satisfaction-event-asset-05.svg",
    },
    {
      id: "olimpiade",
      title: "Olimpiade",
      cost: 1500000,
      boost: 75,
      duration: 40,
      image:
        "/images/game/population/satisfaction-events/satisfaction-event-asset-06.svg",
    },
    {
      id: "piala_dunia_fifa",
      title: "Piala Dunia FIFA",
      cost: 2500000,
      boost: 100,
      duration: 30,
      image:
        "/images/game/population/satisfaction-events/satisfaction-event-asset-07.svg",
    },
    {
      id: "balap_f1",
      title: "Balap F1",
      cost: 800000,
      boost: 40,
      duration: 3,
      image:
        "/images/game/population/satisfaction-events/satisfaction-event-asset-08.svg",
    },
  ];

  const formatBadgeDate = (dateString: string) => {
    if (!dateString) return "";
    try {
      const [y, m, d] = dateString.split("-").map(Number);
      const date = new Date(y, m - 1, d);
      if (isNaN(date.getTime())) return dateString;
      const options: Intl.DateTimeFormatOptions = {
        day: "numeric",
        month: "short",
        year: "numeric",
      };
      const parts = new Intl.DateTimeFormat("id-ID", options).formatToParts(
        date
      );
      const day = parts.find((p) => p.type === "day")?.value || "";
      const month = parts.find((p) => p.type === "month")?.value || "";
      const year = parts.find((p) => p.type === "year")?.value || "";
      return `${day} ${month}, ${year}`;
    } catch {
      return dateString;
    }
  };

  const checkCompletion = () => {
    if (!isOpen || !countryDetail || !currentDate) return;

    const safeDateString = getSafeDateString();
    let now: Date;
    try {
      now = new Date(safeDateString + "T00:00:00");
      if (isNaN(now.getTime())) throw new Error("Invalid date");
    } catch {
      now = new Date();
    }

    const ongoing = countryDetail.ongoingConstructions || [];
    let updated = false;
    let newConstructions = [...ongoing];
    let newDetail = { ...countryDetail };
    let newPresidentRating = presidentRating;

    const completedEvents = newConstructions.filter((c) => {
      if (c.type !== "event") return false;
      let endDate: Date;
      try {
        endDate = new Date(c.endDate + "T00:00:00");
        if (isNaN(endDate.getTime())) throw new Error("Invalid endDate");
      } catch {
        return false;
      }
      return endDate <= now;
    });

    if (completedEvents.length > 0) {
      completedEvents.forEach((c) => {
        const boost = Number(c.boost) || 0;
        newDetail.kepuasan = Math.min(
          100,
          parseFloat(((newDetail.kepuasan ?? 50) + boost).toFixed(1))
        );
        const ratingBoost = boost;
        newPresidentRating = Math.min(100, newPresidentRating + ratingBoost);
      });

      const completedIds = completedEvents.map((c) => c.id);
      newConstructions = newConstructions.filter(
        (c) => !completedIds.includes(c.id)
      );
      newDetail.ongoingConstructions = newConstructions;
      updated = true;
    }

    if (updated) {
      setCountryDetail(newDetail);
      if (setPresidentRating) {
        setPresidentRating(newPresidentRating);
      }
    }
  };

  useEffect(() => {
    checkCompletion();
  }, [currentDate, isOpen, countryDetail]);

  const handleInitiative = (
    cost: number,
    boost: number,
    title: string,
    duration: number,
    itemId: string
  ) => {
    if (anggaran < cost) {
      setPendingCost(cost);
      setPendingTitle(title);
      setIsDanaTidakCukupOpen(true);
      setFeedback(null);
      return;
    }

    const nextAnggaran = anggaran - cost;
    const currentDateStr = getSafeDateString();
    const endDateStr = addDays(currentDateStr, duration);

    const updatedDetail = {
      ...countryDetail,
      anggaran: nextAnggaran,
    };

    if (!updatedDetail.ongoingConstructions) {
      updatedDetail.ongoingConstructions = [];
    }
    updatedDetail.ongoingConstructions.push({
      id: `event_${Date.now()}`,
      buildingKey: itemId,
      title: title,
      startDate: currentDateStr,
      endDate: endDateStr,
      type: "event",
      boost: boost,
      quantity: 1,
      cost: cost,
    });

    setCountryDetail(updatedDetail);

    // Tandai penyelesaian misi jika pemain sedang menjalankan misi event / kepuasan
    if (typeof window !== "undefined") {
      try {
        const activeMission = localStorage.getItem(
          "presiden_simulator_active_mission"
        );
        const rawList = localStorage.getItem(
          "presiden_simulator_claimable_missions"
        );
        const list: string[] = rawList ? JSON.parse(rawList) : [];
        const targetMissionId = activeMission || `event_${itemId}`;
        if (targetMissionId && !list.includes(targetMissionId)) {
          list.push(targetMissionId);
          localStorage.setItem(
            "presiden_simulator_claimable_missions",
            JSON.stringify(list)
          );
          window.dispatchEvent(
            new CustomEvent("mission_claimable_updated", {
              detail: { cardId: targetMissionId, claimableList: list },
            })
          );
        }
      } catch {}
    }

    setFeedback({
      type: "success",
      message: `Presiden meluncurkan program ${title}! Anggaran berkurang -${cost.toLocaleString(
        "id-ID",
        { maximumFractionDigits: 2 }
      )} NEO. Acara berlangsung selama ${duration} hari dan akan selesai serta meningkatkan kepuasan pada ${formatBadgeDate(
        endDateStr
      )}.`,
    });
    setTimeout(() => setFeedback(null), 6000);
  };

  return (
    <>
      {!isDanaTidakCukupOpen && !isMenuInfoOpen && (
      <NotebookModalWrapper onClose={onClose}>
        <div className={"root-modal-util-52b6b298fe"}>
          
          {/* ============ HEADER ============ */}
          <div className={"satisfaction-modal-header root-modal-util-4450f1d9ee"}>
            
            {/* Container Kiri: Judul + Tabs */}
            <div className={"satisfaction-modal-header-main root-modal-util-020752a5a2 no-scrollbar"}>
              {/* Judul */}
              <div className={"root-modal-util-08dfbca033"}>
                <div className={"root-modal-util-acd42b9a36"}>
                  <Smile className={"root-modal-util-ea2c28151c"} />
                </div>
                <h2 className={`root-modal-util-6b4648c53a root-modal-util-c2385a463d`}>
                  Kepuasan Rakyat
                </h2>
              </div>

            </div>

            {/* Tombol Tutup */}
            <div className={"root-modal-util-08dfbca033"}>
              <button type="button" onClick={() => setIsMenuInfoOpen(true)} title="Informasi peningkatan kepuasan rakyat" aria-label="Informasi peningkatan kepuasan rakyat" className={"root-modal-info-button root-modal-util-1697100c43"}>
                <Info aria-hidden="true" />
              </button>
              <RootModalCloseButton
                onClick={onClose}
              />
            </div>
          </div>

          {/* ============ TREASURY BAR (Info Button Dipindah ke Sini) ============ */}
          <div className={"satisfaction-modal-summary root-modal-util-6614545ce3"}>
            
            {/* Teks Kepuasan Sipil */}
            <div className={"root-modal-util-6cfc7e6ab3"}>
              <Smile className={"root-modal-util-00f4ec4a9a"} />
              <span className={`root-modal-util-14d6efe9ef root-modal-util-614c0c7dff `}>
                Kepuasan Sipil:
              </span>
              <span className={`root-modal-util-04f32edb66 root-modal-util-4457a4d3a8 `}>
                {Math.round(kepuasan)}%
              </span>
            </div>

            <div className={"satisfaction-modal-summary-controls"}>
              <RootModalTabs
                className={"satisfaction-modal-tabs"}
                compact
                items={[
                  {
                    label: "Statistik",
                    isActive: false,
                    onClick: () => setActiveMenu?.("Dashboard:Kepuasan"),
                    onPointerDown: () => setActiveMenu?.("Dashboard:Kepuasan"),
                  },
                  { label: "Naikkan Peringkat", isActive: true },
                ]}
              />
              <button
                onClick={() => setShowInfoModal(true)}
                title="Lihat penjelasan setiap tab"
                className={"root-modal-util-02d83a46d0"}
              >
                <Info className={"root-modal-util-371862382d"} />
              </button>
            </div>
          </div>

          {/* ============ CONTENT ============ */}
          <div className={"satisfaction-modal-content root-modal-util-9c388aeac4"}>
            <div className={"satisfaction-modal-content-body root-modal-enter root-modal-fade-in root-modal-util-baefc15ea1"}>
              {feedback && (
                <div
                  className={`root-modal-enter root-modal-fade-in root-modal-slide-in-from-top root-modal-util-f865538322 root-modal-util-5f22e64f22 root-modal-util-038752cbd9 ${
                    feedback.type === "success"
                      ? "root-modal-util-a3d19e0b6c"
                      : "root-modal-util-a0161aecc0"
                  }`}
                >
                  {feedback.type === "success" ? (
                    <CheckCircle2 className={"root-modal-util-5ccff2d0cd"} />
                  ) : (
                    <AlertCircle className={"root-modal-util-5ccff2d0cd"} />
                  )}
                  <p className={"root-modal-util-5ff788eca1"}>{feedback.message}</p>
                </div>
              )}

              <div className={"satisfaction-initiative-grid root-modal-util-8e438a7c62"}>
                {initiatives.map((item) => {
                  const ongoingEvents = (
                    countryDetail?.ongoingConstructions || []
                  ).filter(
                    (c: any) =>
                      c.type === "event" && c.buildingKey === item.id
                  );
                  const isEventOngoing = ongoingEvents.length > 0;
                  const lastEndDate = isEventOngoing
                    ? ongoingEvents[ongoingEvents.length - 1].endDate
                    : null;

                  const baseBoost = item.boost;
                  const afterResearchBoost =
                    applyDiplomasiAcaraSatisfactionBonus(
                      baseBoost,
                      countryDetail
                    );
                  const boostedBoost =
                    applyKementerianOlahragaSatisfactionBoost(
                      afterResearchBoost,
                      item.id,
                      countryDetail
                    );
                  const hasAcaraBonus = boostedBoost > baseBoost;
                  const isSport = isSportEvent(item.id);
                  const olahragaBonusPercent =
                    getKementerianOlahragaEventSatisfactionBonusPercent(
                      countryDetail
                    );

                  const isHighlighted = highlightedEventId === item.id;

                  return (
                    <div
                      key={item.id}
                      id={`event-card-${item.id}`}
                      className={`satisfaction-initiative-card root-modal-util-680f06f549 root-modal-util-5f22e64f22 root-modal-util-85e89a7bff ${
                        isHighlighted
                          ? "root-modal-util-9ae319bd64"
                          : "root-modal-util-39ea4195cd"
                      }`}
                    >
                      {isHighlighted && (
                        <div className={"root-modal-util-85c56ed520"}>
                          <Sparkles className={"root-modal-util-315860d6d0"} />
                          Target Misi Aktif
                        </div>
                      )}

                      {isEventOngoing && (
                        <div className={"root-modal-util-29ccb89328"}>
                          Selesai: {formatBadgeDate(lastEndDate)}
                        </div>
                      )}

                      <div className={"root-modal-util-08f6b562f1"}>
                        <div className={"root-modal-util-012fbd121f"}>
                          <Image
                            src={item.image}
                            alt=""
                            width={56}
                            height={56}
                            className={"root-modal-util-b01f3b864b"}
                          />
                        </div>
                        <div className={"root-modal-util-18f938c67d"}>
                          <div className={"root-modal-util-59587856d1"}>
                            <h4 className={"root-modal-util-73429ab601"}>
                              {item.title}
                            </h4>
                            {hasAcaraBonus ? (
                              <span className={"root-modal-util-2c476ec378"}>
                                <span className={"root-modal-util-f4ccadceff"}>
                                  +{baseBoost}%
                                </span>
                                <span className={"root-modal-util-070a7f2c69"}>
                                  +{boostedBoost}% Kepuasan
                                </span>
                              </span>
                            ) : (
                              <span className={"root-modal-util-d613bb47ed"}>
                                +{baseBoost}% Kepuasan
                              </span>
                            )}
                            {isSport && olahragaBonusPercent > 0 && (
                              <span className={"root-modal-util-c5483046dc"}>
                                +Kem. Olahraga (
                                {olahragaBonusPercent.toFixed(0)}%)
                              </span>
                            )}
                          </div>
                          <div className={`root-modal-util-34a3521642 root-modal-util-8866ac9a30 `}>
                            <Clock className={"root-modal-util-01ac82f339"} />
                            <span className={"root-modal-util-3d9a1150e3"}>Durasi: {item.duration} hari</span>
                          </div>
                        </div>
                      </div>

                      <div className={"root-modal-util-bf998e0d1f"}>
                        <button
                          onClick={() =>
                            handleInitiative(
                              item.cost,
                              boostedBoost,
                              item.title,
                              item.duration,
                              item.id
                            )
                          }
                          disabled={isEventOngoing}
                          className={`root-modal-util-f84136093d ${
                            isEventOngoing
                              ? "root-modal-util-c73aa553ea"
                              : "root-modal-util-3685ff24fe hover:brightness-110"
                          }`}
                        >
                          {isEventOngoing ? "Sedang Berlangsung" : "Pilih Acara"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </NotebookModalWrapper>
      )}

      {/* ============ MODAL INFO ============ */}
      {showInfoModal && !isDanaTidakCukupOpen && (
        <NotebookModalWrapper
          onClose={() => setShowInfoModal(false)}
          zIndexClass="z-[300]"
        >
          <div className={"root-modal-util-52b6b298fe"}>
            {/* Header Modal Info */}
            <div className={"root-modal-util-4450f1d9ee"}>
              <div className={"root-modal-util-c0541482fd"}>
                <div className={"root-modal-util-6576a8ca47"}>
                  <Info className={"root-modal-util-ea2c28151c"} />
                </div>
                <div>
                  <h3 className={`root-modal-util-9361ef65fc root-modal-util-9c33c69aca `}>
                    Panduan Menu Kepuasan
                  </h3>
                  <p className={`root-modal-util-34a3521642 root-modal-util-b0a0972263 `}>
                    Penjelasan setiap tab di atas
                  </p>
                </div>
              </div>

              <RootModalCloseButton onClick={() => setShowInfoModal(false)} />
            </div>

            {/* Body Modal Info */}
            <div className={"root-modal-util-64d21c5606"}>
              {/* Tab 1: Statistik */}
              <div className={`root-modal-util-5f22e64f22 root-modal-util-3c137e5152 `}>
                <div className={"root-modal-util-48530515e1"}>
                  <div className={"root-modal-util-b51ae17988"}>
                    <BarChart3 className={"root-modal-util-ea2c28151c"} />
                  </div>
                  <h4 className={`root-modal-util-9361ef65fc root-modal-util-1ebbaf6952 `}>
                    Tab Statistik
                  </h4>
                </div>
                <p className={"root-modal-util-27a7c73979"}>
                  Menampilkan{" "}
                  <strong className={"root-modal-util-070a7f2c69"}>dashboard lengkap</strong>{" "}
                  kondisi kepuasan rakyat saat ini. Berisi grafik historis,
                  faktor-faktor yang mempengaruhi kepuasan (ekonomi, keamanan,
                  layanan publik), serta proyeksi tren beberapa hari ke depan.
                </p>
                <p className={`root-modal-util-34a3521642 root-modal-util-c8845f1281 `}>
                  Cocok untuk: analisis mendalam sebelum mengambil keputusan
                  strategis.
                </p>
              </div>

              {/* Tab 2: Naikkan Peringkat */}
              <div className={`root-modal-util-5f22e64f22 root-modal-util-83186b6486 `}>
                <div className={"root-modal-util-48530515e1"}>
                  <div className={"root-modal-util-07c8e7670b"}>
                    <PartyPopper className={"root-modal-util-ea2c28151c"} />
                  </div>
                  <h4 className={`root-modal-util-9361ef65fc root-modal-util-1ebbaf6952 `}>
                    Tab Naikkan Peringkat
                  </h4>
                </div>
                <p className={"root-modal-util-27a7c73979"}>
                  Menampilkan daftar{" "}
                  <strong className={"root-modal-util-070a7f2c69"}>
                    acara & program publik
                  </strong>{" "}
                  yang bisa presiden luncurkan untuk meningkatkan kepuasan
                  rakyat. Setiap acara punya biaya, durasi, dan boost kepuasan
                  tersendiri.
                </p>
                <ul className={`root-modal-util-34a3521642 root-modal-util-7678944519 `}>
                  <li>
                    Acara berjalan sesuai durasi, boost kepuasan berlaku setelah
                    selesai.
                  </li>
                  <li>Satu acara hanya bisa aktif satu kali dalam satu waktu.</li>
                  <li>
                    Bonus riset{" "}
                    <strong className={"root-modal-util-070a7f2c69"}>Diplomasi Acara</strong>{" "}
                    dapat meningkatkan boost secara signifikan.
                  </li>
                </ul>
              </div>

              {/* Tips */}
              <div className={`root-modal-util-00911ae1e9 root-modal-util-5f22e64f22 root-modal-util-a31a206dc8 `}>
                <div className={"root-modal-util-b9edd2710c"}>
                  <Lightbulb className={"root-modal-util-378483ea7a"} />
                </div>
                <p className={`root-modal-util-8ff7188727 root-modal-util-cb351c8e19 `}>
                  <strong>Tips:</strong> Cek tab <strong>Statistik</strong> dulu
                  untuk melihat kondisi kepuasan saat ini, lalu pilih acara yang
                  paling cocok di tab <strong>Naikkan Peringkat</strong>.
                </p>
              </div>
            </div>

            {/* Footer Modal Info */}
            <div className={"root-modal-util-9812891ca5"}>
              <button
                onClick={() => setShowInfoModal(false)}
                className={"root-modal-util-c21ef9bab6"}
              >
                Mengerti
              </button>
            </div>
          </div>
        </NotebookModalWrapper>
      )}

      <MenuInfoModal
        isOpen={isMenuInfoOpen}
        onClose={() => setIsMenuInfoOpen(false)}
        title="Informasi Peningkatan Kepuasan Rakyat"
        description="Pilih acara atau inisiatif untuk meningkatkan kepuasan rakyat. Periksa biaya dan durasinya sebelum memulai; dampak kepuasan diterapkan setelah kegiatan selesai. Tab Statistik membantu menilai kondisi sebelum memilih program."
      />

      {/* ============ Modal Dana Tidak Cukup ============ */}
      <DanaTidakCukupModal
        isOpen={isDanaTidakCukupOpen}
        onClose={() => setIsDanaTidakCukupOpen(false)}
        requiredCost={pendingCost}
        currentBudget={anggaran}
        actionName={`Sponsori ${pendingTitle}`}
      />
    </>
  );
}