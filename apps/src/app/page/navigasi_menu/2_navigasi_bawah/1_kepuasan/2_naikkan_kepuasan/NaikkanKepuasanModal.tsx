"use client";

import { useState, useEffect } from "react";
import { X, Smile, Coins, Sparkles, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import DanaTidakCukupModal from "./DanaTidakCukupModal";

interface NaikkanKepuasanModalProps {
  isOpen: boolean;
  onClose: () => void;
  setActiveMenu?: (menu: string) => void;
  countryDetail: any;
  setCountryDetail: (detail: any) => void;
  selectedCountry: any;
  presidentRating?: number;
  setPresidentRating?: (rating: number) => void;
  // 🔥 Tambahkan currentDate opsional untuk penjadwalan
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

  if (!isOpen) return null;

  const countryName = selectedCountry?.country || "Indonesia";
  const anggaran = countryDetail?.anggaran || 0;
  const kepuasan = countryDetail?.kepuasan ?? 50.0;

  // 🔥 Helper untuk menambah hari (sama dengan yang ada di komponen lain)
  const addDays = (dateString: string, days: number): string => {
    const [y, m, d] = dateString.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() + days);
    const yy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yy}-${mm}-${dd}`;
  };

  // 🔥 Mendapatkan tanggal saat ini dalam format YYYY-MM-DD
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

  // ==========================================
  // DATA INISIATIF (DENGAN DURASI)
  // ==========================================
  const initiatives = [
    {
      id: "konser",
      title: "Konser",
      desc: "Sponsori konser musik untuk meningkatkan kebahagiaan warga.",
      cost: 25000,
      boost: 5,
      duration: 1, // 1 hari
      icon: Sparkles,
      color: "text-amber-600",
      bg: "bg-amber-800/10",
    },
    {
      id: "festival",
      title: "Festival",
      desc: "Sponsori festival budaya untuk meningkatkan kegembiraan rakyat.",
      cost: 50000,
      boost: 10,
      duration: 3, // 3 hari
      icon: Sparkles,
      color: "text-amber-600",
      bg: "bg-amber-800/10",
    },
    {
      id: "karnaval",
      title: "Karnaval",
      desc: "Sponsori karnaval besar untuk meningkatkan semangat komunitas.",
      cost: 150000,
      boost: 15,
      duration: 3, // 3 hari
      icon: Sparkles,
      color: "text-amber-600",
      bg: "bg-amber-800/10",
    },
    {
      id: "piala_davis",
      title: "Piala Davis",
      desc: "Sponsori turnamen tenis Piala Davis untuk meningkatkan kebanggaan nasional.",
      cost: 400000,
      boost: 30,
      duration: 7, // 7 hari (asumsi, bisa disesuaikan)
      icon: Sparkles,
      color: "text-amber-600",
      bg: "bg-amber-800/10",
    },
    {
      id: "piala_dunia_rugbi",
      title: "Piala Dunia Rugbi",
      desc: "Sponsori Piala Dunia Rugbi untuk meningkatkan semangat olahraga.",
      cost: 500000,
      boost: 50,
      duration: 14, // 14 hari (asumsi)
      icon: Sparkles,
      color: "text-amber-600",
      bg: "bg-amber-800/10",
    },
    {
      id: "olimpiade",
      title: "Olimpiade",
      desc: "Sponsori Olimpiade untuk meningkatkan prestise internasional.",
      cost: 1500000,
      boost: 75,
      duration: 40, // 40 hari
      icon: Sparkles,
      color: "text-amber-600",
      bg: "bg-amber-800/10",
    },
    {
      id: "piala_dunia_fifa",
      title: "Piala Dunia FIFA",
      desc: "Sponsori Piala Dunia FIFA untuk meningkatkan kebanggaan nasional.",
      cost: 2500000,
      boost: 100,
      duration: 30, // 30 hari
      icon: Sparkles,
      color: "text-amber-600",
      bg: "bg-amber-800/10",
    },
    {
      id: "balap_f1",
      title: "Balap F1",
      desc: "Sponsori balapan Formula 1 untuk meningkatkan gengsi dan pariwisata nasional.",
      cost: 800000,
      boost: 40,
      duration: 3, // 3 hari
      icon: Sparkles,
      color: "text-amber-600",
      bg: "bg-amber-800/10",
    },
  ];

  // helper to format date same as BaseProduksiGrid
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

  // 🔥 Logika penyelesaian acara (seperti TempatUmumModal)
  useState(() => {
    // We can use a React useEffect to run every time currentDate, countryDetail, or presidentRating changes
  });

  // Run event completion check on date changes
  useState(() => {});
  
  // Real implementation of completion check:
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

    // Filter events that have ended
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
        // Boost kepuasan
        const boost = Number(c.boost) || 0;
        newDetail.kepuasan = Math.min(100, parseFloat(((newDetail.kepuasan ?? 50) + boost).toFixed(1)));
        
        // Boost rating presiden
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

  // Run whenever currentDate changes or modal opens
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

    // 🔥 Persiapkan data acara yang akan dijalankan
    const currentDateStr = getSafeDateString();
    const endDateStr = addDays(currentDateStr, duration);

    // 🔥 Update countryDetail: kurangi uang (kepuasan TIDAK naik instan)
    const updatedDetail = {
      ...countryDetail,
      anggaran: nextAnggaran,
    };

    // 🔥 Tambahkan ke ongoingConstructions
    if (!updatedDetail.ongoingConstructions) {
      updatedDetail.ongoingConstructions = [];
    }
    updatedDetail.ongoingConstructions.push({
      id: `event_${Date.now()}`,
      buildingKey: itemId, // Gunakan itemId (misal "konser")
      title: title, // Nama acara
      startDate: currentDateStr,
      endDate: endDateStr,
      type: "event",
      boost: boost, // Simpan rating/kepuasan boost di objek
      quantity: 1,
      cost: cost,
    });

    setCountryDetail(updatedDetail);

    setFeedback({
      type: "success",
      message: `Presiden meluncurkan program ${title}! Anggaran berkurang -${cost.toLocaleString('id-ID')} EM. Acara berlangsung selama ${duration} hari dan akan selesai serta meningkatkan kepuasan pada ${formatBadgeDate(endDateStr)}.`,
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

            <div className="flex items-center bg-[#0A1A1A] p-0.5 sm:p-1 rounded-lg border border-[#00FFAA]/30 backdrop-blur-md">
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
          </div>

          <button onClick={onClose} className="p-1.5 lg:p-2 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] text-[#6B8A8A] hover:text-[#00FFAA] hover:border-[#00FFAA] transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1 shadow-sm">
            <span className="text-[10px] lg:text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Treasury Bar */}
        <div className="px-4 sm:px-6 py-2 bg-[#0A1A1A] border-b border-[#00FFAA]/20 flex flex-wrap items-center justify-between gap-2 relative z-10 shrink-0">
          <div className="flex items-center gap-2">
            <Coins className="h-4 w-4 text-[#00FFAA] shrink-0" />
            <span className="text-[10px] sm:text-xs font-bold text-[#6B8A8A] uppercase tracking-wide">
              Anggaran Kas Negara:
            </span>
            <span className="text-xs sm:text-sm font-black text-[#00FFAA]">
              {anggaran.toLocaleString("id-ID")}
            </span>
          </div>
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

                return (
                  <div
                    key={item.id}
                    className="relative bg-[#0F2424] border border-[#00FFAA]/20 p-2.5 lg:p-3.5 2xl:p-5 rounded-xl 2xl:rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3 lg:gap-4 2xl:gap-5 transition-all hover:border-[#00FFAA]/50"
                  >
                    {/* Badge Tanggal Selesai */}
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
                          <span className="bg-[#00FFAA]/10 text-[#00FFAA] border border-[#00FFAA]/30 px-1.5 lg:px-2 py-0.5 rounded-full text-[8px] lg:text-[9px] font-black uppercase tracking-wider">
                            +{item.boost}% Kepuasan
                          </span>
                        </div>
                        <p className="text-[10px] lg:text-xs text-[#6B8A8A] font-semibold leading-snug lg:leading-relaxed max-w-xl">
                          {item.desc}
                        </p>
                        {/* 🔥 Tampilkan durasi */}
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
                        onClick={() => handleInitiative(item.cost, item.boost, item.title, item.duration, item.id)}
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