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
import { rootModalTypography } from "@/app/page/root_modals_design_menu/rootModalTypography";
import { rootBorderRadius } from "@/app/page/root_modals_design_menu/rootBorderRadius";
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
        <div className="relative flex h-full flex-col overflow-hidden rounded-xl border border-[#00FFAA]/20 bg-[#0A1A1A]">
          
          {/* ============ HEADER ============ */}
          <div className="relative z-10 flex shrink-0 items-center justify-between gap-2 border-b border-[#00FFAA]/20 bg-[#0A1A1A] px-4 py-2.5 sm:px-6 sm:py-3">
            
            {/* Container Kiri: Judul + Tabs */}
            <div className="flex items-center gap-3 sm:gap-6 overflow-x-auto no-scrollbar whitespace-nowrap">
              {/* Judul */}
              <div className="flex items-center gap-2">
                <div className="shrink-0 rounded-lg border border-[#00FFAA]/30 bg-[#0F2424] p-1 sm:p-1.5">
                  <Smile className="h-4 w-4 text-[#E0E0E0] sm:h-5 sm:w-5" />
                </div>
                <h2 className={`${rootModalTypography.title} leading-none`}>
                  Kepuasan Rakyat
                </h2>
              </div>

              {/* Tabs */}
              <RootModalTabs
                items={[
                  {
                    label: "Statistik",
                    isActive: false,
                    onClick: () => setActiveMenu?.("Dashboard:Kepuasan"),
                  },
                  { label: "Naikkan Peringkat", isActive: true },
                ]}
              />
            </div>

            {/* Tombol Tutup */}
            <div className="flex shrink-0 items-center gap-2">
              <button type="button" onClick={() => setIsMenuInfoOpen(true)} title="Informasi peningkatan kepuasan rakyat" aria-label="Informasi peningkatan kepuasan rakyat" className="flex shrink-0 cursor-pointer items-center justify-center rounded-full border border-[#00FFAA]/50 bg-[#0A1A1A] p-1 text-[#00FFAA] transition-all hover:bg-[#00FFAA] hover:text-[#0A1A1A]">
                <Info className="h-3.5 w-3.5" />
              </button>
              <RootModalCloseButton onClick={onClose} />
            </div>
          </div>

          {/* ============ TREASURY BAR (Info Button Dipindah ke Sini) ============ */}
          <div className="relative z-10 flex shrink-0 items-center justify-between gap-2 border-b border-[#00FFAA]/20 bg-[#0A1A1A] px-4 py-2 sm:px-6">
            
            {/* Teks Kepuasan Sipil */}
            <div className="flex items-center gap-2">
              <Smile className="h-4 w-4 shrink-0 text-[#E0E0E0]" />
              <span className={`${rootModalTypography.label} text-[10px] sm:text-xs`}>
                Kepuasan Sipil:
              </span>
              <span className={`${rootModalTypography.value} text-xs sm:text-sm`}>
                {Math.round(kepuasan)}%
              </span>
            </div>

            {/* Tombol Info (Sejajar dengan Teks di Atas) */}
            <button
              onClick={() => setShowInfoModal(true)}
              title="Lihat penjelasan setiap tab"
              className="flex shrink-0 cursor-pointer items-center justify-center rounded-lg border border-[#00FFAA]/30 bg-[#0F2424] p-1 text-[#E0E0E0] transition-all hover:border-[#00FFAA] sm:p-1.5"
            >
              <Info className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>
          </div>

          {/* ============ CONTENT ============ */}
          <div className="relative z-10 flex-1 overflow-y-auto bg-[#0A1A1A]/80 p-3 sm:p-5
            [&::-webkit-scrollbar]:w-1.5 sm:[&::-webkit-scrollbar]:w-2 
            [&::-webkit-scrollbar-track]:bg-transparent 
            [&::-webkit-scrollbar-track]:rounded-full 
            [&::-webkit-scrollbar-track]:border-l [&::-webkit-scrollbar-track]:border-[#00FFAA]/20
            [&::-webkit-scrollbar-thumb]:bg-gradient-to-b [&::-webkit-scrollbar-thumb]:from-[#00FFAA] [&::-webkit-scrollbar-thumb]:to-[#00B37A]
            [&::-webkit-scrollbar-thumb]:rounded-full 
            [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb]:border-[#0A1A1A]
            hover:[&::-webkit-scrollbar-thumb]:from-[#33FFBB] hover:[&::-webkit-scrollbar-thumb]:to-[#00FFAA]
            [&::-webkit-scrollbar-button]:hidden
          ">
            <div className="animate-in fade-in space-y-4 duration-500">
              {feedback && (
                <div
                  className={`animate-in fade-in slide-in-from-top-4 flex items-center gap-3 ${rootBorderRadius.card} border p-4 duration-300 ${
                    feedback.type === "success"
                      ? "border-[#00FFAA]/30 bg-[#00FFAA]/10 text-[#E0E0E0]"
                      : "border-rose-500/30 bg-rose-500/10 text-[#E0E0E0]"
                  }`}
                >
                  {feedback.type === "success" ? (
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-[#E0E0E0]" />
                  ) : (
                    <AlertCircle className="h-5 w-5 shrink-0 text-[#E0E0E0]" />
                  )}
                  <p className="text-xs font-bold">{feedback.message}</p>
                </div>
              )}

              <div className="grid grid-cols-1 gap-2.5 lg:gap-3">
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
                      className={`relative flex flex-col items-center justify-between gap-2.5 ${rootBorderRadius.card} bg-[#0F2424] p-2.5 transition-all duration-500 md:flex-row lg:gap-3 lg:p-3 ${
                        isHighlighted
                          ? "border-2 border-[#00FFAA] bg-[#122A26] ring-2 ring-[#00FFAA]/50"
                          : "border border-[#00FFAA]/20 hover:border-[#00FFAA]/50"
                      }`}
                    >
                      {isHighlighted && (
                        <div className="absolute left-3 top-0 z-20 flex items-center gap-1 rounded-b-md bg-[#00FFAA] px-2.5 py-0.5 text-[8px] font-black uppercase tracking-widest text-[#0A1A1A]">
                          <Sparkles className="h-2.5 w-2.5" />
                          Target Misi Aktif
                        </div>
                      )}

                      {isEventOngoing && (
                        <div className="absolute -top-3.5 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-sm border border-[#00FFAA]/40 bg-[#0A1A1A] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#E0E0E0]">
                          Selesai: {formatBadgeDate(lastEndDate)}
                        </div>
                      )}

                      <div className="flex items-start gap-2 lg:gap-2.5">
                        <div className="shrink-0">
                          <Image
                            src={item.image}
                            alt=""
                            width={56}
                            height={56}
                            className="h-12 w-12 object-contain lg:h-14 lg:w-14"
                          />
                        </div>
                        <div className="space-y-0.5 lg:space-y-1">
                          <div className="flex flex-wrap items-center gap-2 lg:gap-3">
                            <h4 className="text-xs font-black uppercase leading-none tracking-wide text-[#E0E0E0] lg:text-sm 2xl:text-base">
                              {item.title}
                            </h4>
                            {hasAcaraBonus ? (
                              <span className="flex items-center gap-1.5 rounded-full border border-[#00FFAA]/30 bg-[#00FFAA]/10 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider lg:px-2 lg:text-[9px]">
                                <span className="text-[#AAB6B6] line-through">
                                  +{baseBoost}%
                                </span>
                                <span className="text-[#E0E0E0]">
                                  +{boostedBoost}% Kepuasan
                                </span>
                              </span>
                            ) : (
                              <span className="rounded-full border border-[#00FFAA]/30 bg-[#00FFAA]/10 px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-wider text-[#E0E0E0] lg:px-2 lg:text-[9px]">
                                +{baseBoost}% Kepuasan
                              </span>
                            )}
                            {isSport && olahragaBonusPercent > 0 && (
                              <span className="rounded-md border border-sky-500/30 bg-sky-500/10 px-1.5 py-0.5 text-[7px] font-semibold uppercase tracking-wider text-[#E0E0E0] lg:text-[8px]">
                                +Kem. Olahraga (
                                {olahragaBonusPercent.toFixed(0)}%)
                              </span>
                            )}
                          </div>
                          <div className={`${rootModalTypography.muted} mt-0.5 flex items-center gap-1.5 text-[9px] font-medium lg:mt-1 lg:text-[10px]`}>
                            <Clock className="h-3 w-3 text-[#E0E0E0] lg:h-3.5 lg:w-3.5" />
                            <span>Durasi: {item.duration} hari</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex shrink-0 flex-col items-center gap-1 md:items-end lg:gap-1.5">
                        <div className="text-right">
                          <p className={`${rootModalTypography.label} text-center leading-none md:text-right`}>
                            Biaya Alokasi
                          </p>
                          <p className={`${rootModalTypography.value} mt-0.5 text-xs lg:mt-1 lg:text-sm`}>
                            {item.cost.toLocaleString("id-ID", {
                              maximumFractionDigits: 2,
                            })}
                          </p>
                        </div>
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
                          className={`rounded-lg px-3.5 py-1.5 text-[10px] font-black uppercase transition-all lg:px-4 lg:py-1.5 lg:text-xs ${
                            isEventOngoing
                              ? "cursor-not-allowed border border-[#6B8A8A]/30 bg-[#0A1A1A] text-[#AAB6B6] opacity-60"
                              : "cursor-pointer border border-[#00FFAA] bg-[#00FFAA] text-[#0A1A1A] hover:brightness-110 active:scale-95"
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
          <div className="relative flex h-full flex-col overflow-hidden rounded-xl border border-[#00FFAA]/20 bg-[#0A1A1A]">
            {/* Header Modal Info */}
            <div className="relative z-10 flex shrink-0 items-center justify-between gap-2 border-b border-[#00FFAA]/20 bg-[#0A1A1A] px-4 py-2.5 sm:px-6 sm:py-3">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="shrink-0 rounded-lg border border-[#00FFAA]/30 bg-[#00FFAA]/10 p-1.5 sm:p-2">
                  <Info className="h-4 w-4 text-[#E0E0E0] sm:h-5 sm:w-5" />
                </div>
                <div>
                  <h3 className={`${rootModalTypography.sectionTitle} leading-none sm:text-base`}>
                    Panduan Menu Kepuasan
                  </h3>
                  <p className={`${rootModalTypography.muted} mt-1 text-[10px] font-semibold sm:text-xs`}>
                    Penjelasan setiap tab di atas
                  </p>
                </div>
              </div>

              <RootModalCloseButton onClick={() => setShowInfoModal(false)} />
            </div>

            {/* Body Modal Info */}
            <div className="flex-1 space-y-4 overflow-y-auto bg-[#0F2424] p-4 sm:p-6 lg:p-8
              [&::-webkit-scrollbar]:w-1.5 sm:[&::-webkit-scrollbar]:w-2 
              [&::-webkit-scrollbar-track]:bg-transparent 
              [&::-webkit-scrollbar-track]:rounded-full 
              [&::-webkit-scrollbar-track]:border-l [&::-webkit-scrollbar-track]:border-[#00FFAA]/20
              [&::-webkit-scrollbar-thumb]:bg-gradient-to-b [&::-webkit-scrollbar-thumb]:from-[#00FFAA] [&::-webkit-scrollbar-thumb]:to-[#00B37A]
              [&::-webkit-scrollbar-thumb]:rounded-full 
              [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb]:border-[#0F2424]
              hover:[&::-webkit-scrollbar-thumb]:from-[#33FFBB] hover:[&::-webkit-scrollbar-thumb]:to-[#00FFAA]
              [&::-webkit-scrollbar-button]:hidden
            ">
              {/* Tab 1: Statistik */}
              <div className={`${rootBorderRadius.card} border border-sky-500/30 bg-[#0A1A1A] p-4 sm:p-5`}>
                <div className="mb-3 flex items-center gap-2.5">
                  <div className="rounded-lg border border-sky-500/30 bg-sky-500/10 p-1.5 sm:p-2">
                    <BarChart3 className="h-4 w-4 text-[#E0E0E0] sm:h-5 sm:w-5" />
                  </div>
                  <h4 className={`${rootModalTypography.sectionTitle} tracking-widest sm:text-sm`}>
                    Tab Statistik
                  </h4>
                </div>
                <p className="text-[11px] font-semibold leading-relaxed text-[#E0E0E0] sm:text-xs">
                  Menampilkan{" "}
                  <strong className="text-[#E0E0E0]">dashboard lengkap</strong>{" "}
                  kondisi kepuasan rakyat saat ini. Berisi grafik historis,
                  faktor-faktor yang mempengaruhi kepuasan (ekonomi, keamanan,
                  layanan publik), serta proyeksi tren beberapa hari ke depan.
                </p>
                <p className={`${rootModalTypography.muted} mt-2.5 text-[10px] font-medium italic sm:text-[11px]`}>
                  Cocok untuk: analisis mendalam sebelum mengambil keputusan
                  strategis.
                </p>
              </div>

              {/* Tab 2: Naikkan Peringkat */}
              <div className={`${rootBorderRadius.card} border border-[#00FFAA]/50 bg-[#0A1A1A] p-4 sm:p-5`}>
                <div className="mb-3 flex items-center gap-2.5">
                  <div className="rounded-lg border border-[#00FFAA]/30 bg-[#00FFAA]/10 p-1.5 sm:p-2">
                    <PartyPopper className="h-4 w-4 text-[#E0E0E0] sm:h-5 sm:w-5" />
                  </div>
                  <h4 className={`${rootModalTypography.sectionTitle} tracking-widest sm:text-sm`}>
                    Tab Naikkan Peringkat
                  </h4>
                </div>
                <p className="text-[11px] font-semibold leading-relaxed text-[#E0E0E0] sm:text-xs">
                  Menampilkan daftar{" "}
                  <strong className="text-[#E0E0E0]">
                    acara & program publik
                  </strong>{" "}
                  yang bisa presiden luncurkan untuk meningkatkan kepuasan
                  rakyat. Setiap acara punya biaya, durasi, dan boost kepuasan
                  tersendiri.
                </p>
                <ul className={`${rootModalTypography.muted} mt-2.5 list-inside list-disc space-y-1.5 text-[10px] font-medium sm:text-[11px]`}>
                  <li>
                    Acara berjalan sesuai durasi, boost kepuasan berlaku setelah
                    selesai.
                  </li>
                  <li>Satu acara hanya bisa aktif satu kali dalam satu waktu.</li>
                  <li>
                    Bonus riset{" "}
                    <strong className="text-[#E0E0E0]">Diplomasi Acara</strong>{" "}
                    dapat meningkatkan boost secara signifikan.
                  </li>
                </ul>
              </div>

              {/* Tips */}
              <div className={`flex items-start gap-2.5 ${rootBorderRadius.card} border border-amber-500/30 bg-amber-500/10 p-3 sm:p-4`}>
                <div className="shrink-0 rounded-lg border border-amber-500/40 bg-amber-500/20 p-1.5">
                  <Lightbulb className="h-3.5 w-3.5 text-[#E0E0E0] sm:h-4 sm:w-4" />
                </div>
                <p className={`${rootModalTypography.body} text-[10px] font-semibold sm:text-[11px]`}>
                  <strong>Tips:</strong> Cek tab <strong>Statistik</strong> dulu
                  untuk melihat kondisi kepuasan saat ini, lalu pilih acara yang
                  paling cocok di tab <strong>Naikkan Peringkat</strong>.
                </p>
              </div>
            </div>

            {/* Footer Modal Info */}
            <div className="shrink-0 border-t border-[#00FFAA]/20 bg-[#0A1A1A] px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
              <button
                onClick={() => setShowInfoModal(false)}
                className="w-full cursor-pointer rounded-xl bg-[#00FFAA] py-2.5 text-xs font-black uppercase tracking-widest text-[#0A1A1A] transition-all hover:bg-[#00FFAA]/80 sm:py-3 sm:text-sm"
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