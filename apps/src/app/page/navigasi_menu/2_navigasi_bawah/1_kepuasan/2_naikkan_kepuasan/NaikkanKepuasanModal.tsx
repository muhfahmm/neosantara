"use client";

import { useState, useEffect } from "react";
import { X, Smile, Coins, Sparkles, AlertCircle, CheckCircle2, Clock, Info, BarChart3, PartyPopper, Lightbulb } from "lucide-react";
import DanaTidakCukupModal from "./DanaTidakCukupModal";
import { getDiplomasiAcaraBonusPercent, applyDiplomasiAcaraSatisfactionBonus } from "@/app/page/bonus_logic";

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
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isDanaTidakCukupOpen, setIsDanaTidakCukupOpen] = useState(false);
  const [pendingCost, setPendingCost] = useState(0);
  const [pendingTitle, setPendingTitle] = useState("");
  const [showInfoModal, setShowInfoModal] = useState(false);

  if (!isOpen) return null;

  const countryName = selectedCountry?.country || "Indonesia";
  const anggaran = countryDetail?.anggaran || 0;
  const kepuasan = countryDetail?.kepuasan ?? 50.0;

  const addDays = (dateString: string, days: number): string => {
    const [y, m, d] = dateString.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() + days);
    const yy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yy}-${mm}-${dd}`;
  };

  const getSafeDateString = (): string => {
    if (currentDate) {
      const d = currentDate instanceof Date ? currentDate : new Date(currentDate);
      if (!isNaN(d.getTime())) {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
      }
    }
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const initiatives = [
    { id: "konser", title: "Konser", cost: 25000, boost: 5, duration: 1, icon: Sparkles, color: "text-amber-600", bg: "bg-amber-800/10" },
    { id: "festival", title: "Festival", cost: 50000, boost: 10, duration: 3, icon: Sparkles, color: "text-amber-600", bg: "bg-amber-800/10" },
    { id: "karnaval", title: "Karnaval", cost: 150000, boost: 15, duration: 3, icon: Sparkles, color: "text-amber-600", bg: "bg-amber-800/10" },
    { id: "piala_davis", title: "Piala Davis", cost: 400000, boost: 30, duration: 7, icon: Sparkles, color: "text-amber-600", bg: "bg-amber-800/10" },
    { id: "piala_dunia_rugbi", title: "Piala Dunia Rugbi", cost: 500000, boost: 50, duration: 14, icon: Sparkles, color: "text-amber-600", bg: "bg-amber-800/10" },
    { id: "olimpiade", title: "Olimpiade", cost: 1500000, boost: 75, duration: 40, icon: Sparkles, color: "text-amber-600", bg: "bg-amber-800/10" },
    { id: "piala_dunia_fifa", title: "Piala Dunia FIFA", cost: 2500000, boost: 100, duration: 30, icon: Sparkles, color: "text-amber-600", bg: "bg-amber-800/10" },
    { id: "balap_f1", title: "Balap F1", cost: 800000, boost: 40, duration: 3, icon: Sparkles, color: "text-amber-600", bg: "bg-amber-800/10" },
  ];

  const formatBadgeDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      const [y, m, d] = dateString.split('-').map(Number);
      const date = new Date(y, m - 1, d);
      if (isNaN(date.getTime())) return dateString;
      const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
      const parts = new Intl.DateTimeFormat('id-ID', options).formatToParts(date);
      const day = parts.find((p) => p.type === 'day')?.value || '';
      const month = parts.find((p) => p.type === 'month')?.value || '';
      const year = parts.find((p) => p.type === 'year')?.value || '';
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
      now = new Date(safeDateString + 'T00:00:00');
      if (isNaN(now.getTime())) throw new Error('Invalid date');
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
        endDate = new Date(c.endDate + 'T00:00:00');
        if (isNaN(endDate.getTime())) throw new Error('Invalid endDate');
      } catch {
        return false;
      }
      return endDate <= now;
    });

    if (completedEvents.length > 0) {
      completedEvents.forEach((c) => {
        const boost = Number(c.boost) || 0;
        newDetail.kepuasan = Math.min(100, parseFloat(((newDetail.kepuasan ?? 50) + boost).toFixed(1)));
        const ratingBoost = boost;
        newPresidentRating = Math.min(100, newPresidentRating + ratingBoost);
      });

      const completedIds = completedEvents.map((c) => c.id);
      newConstructions = newConstructions.filter((c) => !completedIds.includes(c.id));
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

  const handleInitiative = (cost: number, boost: number, title: string, duration: number, itemId: string) => {
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

    setFeedback({
      type: "success",
      message: `Presiden meluncurkan program ${title}! Anggaran berkurang -${cost.toLocaleString('id-ID')} NEO. Acara berlangsung selama ${duration} hari dan akan selesai serta meningkatkan kepuasan pada ${formatBadgeDate(endDateStr)}.`,
    });
    setTimeout(() => setFeedback(null), 6000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none">
      <div className="bg-[#0F2424]/90 backdrop-blur-md border border-[#00FFAA]/30 rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans pointer-events-auto">

        {/* Header */}
        <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-[#00FFAA]/20 flex items-center justify-between bg-[#0A1A1A] relative z-10 gap-2 shrink-0 rounded-t-2xl">
          <div className="flex items-center gap-3 sm:gap-6 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="p-1 sm:p-1.5 bg-[#0F2424] rounded-lg border border-[#00FFAA]/30 shrink-0">
                <Smile className="h-4 w-4 sm:h-5 sm:w-5 text-[#00FFAA]" />
              </div>
              <div>
                <h2 className="text-base sm:text-xl font-bold text-[#00FFAA] tracking-tight leading-none uppercase">Kepuasan Rakyat</h2>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <div className="flex items-center bg-[#0A1A1A] p-0.5 sm:p-1 rounded-lg border border-[#00FFAA]/30">
                <button
                  onClick={() => setActiveMenu?.("Dashboard:Kepuasan")}
                  className="px-3 py-1 rounded-md text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all text-[#6B8A8A] hover:text-[#E0E0E0] cursor-pointer"
                >
                  Statistik
                </button>
                <button
                  className="px-3 py-1 rounded-md text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all bg-[#00FFAA] text-[#0A1A1A] cursor-pointer"
                >
                  Naikkan Peringkat
                </button>
              </div>

              <button
                onClick={() => setShowInfoModal(true)}
                title="Lihat penjelasan setiap tab"
                className="p-1.5 sm:p-2 rounded-lg border border-[#00FFAA]/30 bg-[#0A1A1A] text-[#6B8A8A] hover:text-[#00FFAA] hover:border-[#00FFAA] transition-all cursor-pointer flex items-center justify-center shrink-0"
              >
                <Info className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </button>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 lg:p-2 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] text-[#6B8A8A] hover:text-[#00FFAA] hover:border-[#00FFAA] transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1 shadow-sm">
            <span className="text-[10px] lg:text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Treasury Bar */}
        <div className="px-4 sm:px-6 py-2 bg-[#0A1A1A] border-b border-[#00FFAA]/20 flex flex-wrap items-center justify-between gap-2 relative z-10 shrink-0">
          <div className="flex items-center gap-2">
            <Smile className="h-4 w-4 text-[#00FFAA] shrink-0" />
            <span className="text-[10px] sm:text-xs font-bold text-[#6B8A8A] uppercase tracking-wide">
              Kepuasan Sipil:
            </span>
            <span className="text-xs sm:text-sm font-black text-[#00FFAA]">
              {Math.round(kepuasan)}%
            </span>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 bg-[#0A1A1A]/80 relative z-10 custom-scrollbar">
          <div className="space-y-6 animate-in fade-in duration-500">
            {feedback && (
              <div
                className={`p-4 rounded-xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 ${
                  feedback.type === "success"
                    ? "bg-[#00FFAA]/10 border-[#00FFAA]/30 text-[#00FFAA]"
                    : "bg-rose-500/10 border-rose-500/30 text-rose-400"
                }`}
              >
                {feedback.type === "success" ? (
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-[#00FFAA]" />
                ) : (
                  <AlertCircle className="h-5 w-5 shrink-0 text-rose-400" />
                )}
                <p className="text-xs font-bold">{feedback.message}</p>
              </div>
            )}

            <div className="grid grid-cols-1 gap-2.5 lg:gap-3.5 2xl:gap-4">
              {initiatives.map((item) => {
                const Icon = item.icon;
                const ongoingEvents = (countryDetail?.ongoingConstructions || []).filter(
                  (c: any) => c.type === "event" && c.buildingKey === item.id
                );
                const isEventOngoing = ongoingEvents.length > 0;
                const lastEndDate = isEventOngoing ? ongoingEvents[ongoingEvents.length - 1].endDate : null;

                const baseBoost = item.boost;
                const boostedBoost = applyDiplomasiAcaraSatisfactionBonus(baseBoost, countryDetail);
                const hasAcaraResearchBonus = boostedBoost > baseBoost;

                return (
                  <div
                    key={item.id}
                    className="relative bg-[#0F2424] border border-[#00FFAA]/20 p-2.5 lg:p-3.5 2xl:p-5 rounded-xl 2xl:rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3 lg:gap-4 2xl:gap-5 transition-all hover:border-[#00FFAA]/50"
                  >
                    {isEventOngoing && (
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20 bg-[#0A1A1A] text-[#00FFAA] text-[9px] font-bold px-2 py-0.5 border border-[#00FFAA]/40 rounded-sm tracking-wider whitespace-nowrap uppercase">
                        Selesai: {formatBadgeDate(lastEndDate)}
                      </div>
                    )}

                    <div className="flex items-start gap-2.5 lg:gap-3.5 2xl:gap-4">
                      <div className="p-2 lg:p-2.5 2xl:p-3.5 rounded-lg 2xl:rounded-xl bg-[#0A1A1A] border border-[#00FFAA]/20 text-[#00FFAA] shrink-0">
                        <Icon className="w-4 h-4 lg:w-5 lg:h-5 2xl:w-6 2xl:h-6" />
                      </div>
                      <div className="space-y-0.5 lg:space-y-1">
                        <div className="flex items-center gap-2 lg:gap-3">
                          <h4 className="text-xs lg:text-sm 2xl:text-md font-black text-[#E0E0E0] uppercase tracking-wide leading-none">
                            {item.title}
                          </h4>
                          {hasAcaraResearchBonus ? (
                            <span className="bg-[#00FFAA]/10 border border-[#00FFAA]/30 px-1.5 lg:px-2 py-0.5 rounded-full text-[8px] lg:text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5">
                              <span className="text-rose-400 line-through">+{baseBoost}%</span>
                              <span className="text-emerald-400">+{boostedBoost}% Kepuasan</span>
                            </span>
                          ) : (
                            <span className="bg-[#00FFAA]/10 text-[#00FFAA] border border-[#00FFAA]/30 px-1.5 lg:px-2 py-0.5 rounded-full text-[8px] lg:text-[9px] font-black uppercase tracking-wider">
                              +{baseBoost}% Kepuasan
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-[9px] lg:text-[10px] text-[#6B8A8A] font-medium mt-0.5 lg:mt-1">
                          <Clock className="w-3 h-3 lg:w-3.5 lg:h-3.5 text-[#00FFAA]" />
                          <span>Durasi: {item.duration} hari</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-center md:items-end gap-1.5 lg:gap-2 shrink-0">
                      <div className="text-right">
                        <p className="text-[8px] lg:text-[10px] text-[#6B8A8A] font-black uppercase tracking-wider text-center md:text-right leading-none">
                          Biaya Alokasi
                        </p>
                        <p className="text-xs lg:text-sm font-black text-[#00FFAA] mt-0.5 lg:mt-1">
                          {item.cost.toLocaleString("id-ID")}
                        </p>
                      </div>
                      <button
                        onClick={() => handleInitiative(item.cost, boostedBoost, item.title, item.duration, item.id)}
                        disabled={isEventOngoing}
                        className={`px-3.5 py-1.5 lg:px-4 lg:py-2 2xl:px-6 2xl:py-2.5 rounded-lg 2xl:rounded-xl font-black text-[10px] lg:text-xs uppercase transition-all ${
                          isEventOngoing
                            ? "bg-[#0A1A1A] text-[#6B8A8A] border border-[#6B8A8A]/30 cursor-not-allowed opacity-60"
                            : "bg-[#00FFAA] text-[#0A1A1A] border border-[#00FFAA] hover:brightness-110 active:scale-95 cursor-pointer"
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

      {/* MODAL INFO — tanpa backdrop */}
      {showInfoModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none">
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative shadow-2xl pointer-events-auto"
          >
            {/* Header Modal */}
            <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-[#00FFAA]/20 flex items-center justify-between bg-[#0A1A1A] shrink-0 rounded-t-2xl">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="p-1.5 sm:p-2 rounded-lg bg-[#00FFAA]/10 border border-[#00FFAA]/30">
                  <Info className="h-4 w-4 sm:h-5 sm:w-5 text-[#00FFAA]" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-[#00FFAA] uppercase tracking-wider leading-none">
                    Panduan Menu Kepuasan
                  </h3>
                  <p className="text-[10px] sm:text-xs text-[#6B8A8A] font-semibold mt-1">
                    Penjelasan setiap tab di atas
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowInfoModal(false)}
                className="p-1.5 lg:p-2 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] text-[#6B8A8A] hover:text-[#00FFAA] hover:border-[#00FFAA] transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1 shadow-sm"
              >
                <span className="text-[10px] lg:text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body Modal */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#0F2424] custom-scrollbar space-y-4">
              {/* Tab 1: Statistik */}
              <div className="p-4 sm:p-5 rounded-xl bg-[#0A1A1A] border border-sky-500/30">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-sky-500/10 border border-sky-500/30">
                    <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-sky-400" />
                  </div>
                  <h4 className="text-xs sm:text-sm font-black text-sky-300 uppercase tracking-widest">
                    Tab Statistik
                  </h4>
                </div>
                <p className="text-[11px] sm:text-xs text-[#E0E0E0] font-semibold leading-relaxed">
                  Menampilkan <strong className="text-sky-300">dashboard lengkap</strong> kondisi kepuasan rakyat saat ini. Berisi grafik historis, faktor-faktor yang mempengaruhi kepuasan (ekonomi, keamanan, layanan publik), serta proyeksi tren beberapa hari ke depan.
                </p>
                <p className="text-[10px] sm:text-[11px] text-[#6B8A8A] font-medium mt-2.5 italic">
                  Cocok untuk: analisis mendalam sebelum mengambil keputusan strategis.
                </p>
              </div>

              {/* Tab 2: Naikkan Peringkat */}
              <div className="p-4 sm:p-5 rounded-xl bg-[#0A1A1A] border border-[#00FFAA]/50">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-[#00FFAA]/10 border border-[#00FFAA]/30">
                    <PartyPopper className="h-4 w-4 sm:h-5 sm:w-5 text-[#00FFAA]" />
                  </div>
                  <h4 className="text-xs sm:text-sm font-black text-[#00FFAA] uppercase tracking-widest">
                    Tab Naikkan Peringkat
                  </h4>
                </div>
                <p className="text-[11px] sm:text-xs text-[#E0E0E0] font-semibold leading-relaxed">
                  Menampilkan daftar <strong className="text-[#00FFAA]">acara & program publik</strong> yang bisa presiden luncurkan untuk meningkatkan kepuasan rakyat. Setiap acara punya biaya, durasi, dan boost kepuasan tersendiri.
                </p>
                <ul className="text-[10px] sm:text-[11px] text-[#6B8A8A] font-medium mt-2.5 space-y-1.5 list-disc list-inside">
                  <li>Acara berjalan sesuai durasi, boost kepuasan berlaku setelah selesai.</li>
                  <li>Satu acara hanya bisa aktif satu kali dalam satu waktu.</li>
                  <li>Bonus riset <strong className="text-[#00FFAA]">Diplomasi Acara</strong> dapat meningkatkan boost secara signifikan.</li>
                </ul>
              </div>

              {/* Info Ekstra — Tips */}
              <div className="p-3 sm:p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5">
                <div className="p-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 shrink-0">
                  <Lightbulb className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-400" />
                </div>
                <p className="text-[10px] sm:text-[11px] text-amber-200 font-semibold leading-relaxed">
                  <strong>Tips:</strong> Cek tab <strong>Statistik</strong> dulu untuk melihat kondisi kepuasan saat ini, lalu pilih acara yang paling cocok di tab <strong>Naikkan Peringkat</strong>.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 border-t border-[#00FFAA]/20 bg-[#0A1A1A] shrink-0">
              <button
                onClick={() => setShowInfoModal(false)}
                className="w-full py-2.5 sm:py-3 rounded-xl bg-[#00FFAA] text-[#0A1A1A] font-black text-xs sm:text-sm uppercase tracking-widest hover:bg-[#00FFAA]/80 transition-all cursor-pointer"
              >
                Mengerti
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Dana Tidak Cukup */}
      <DanaTidakCukupModal
        isOpen={isDanaTidakCukupOpen}
        onClose={() => setIsDanaTidakCukupOpen(false)}
        requiredCost={pendingCost}
        currentBudget={anggaran}
        actionName={`Sponsori ${pendingTitle}`}
      />
    </div>
  );
}