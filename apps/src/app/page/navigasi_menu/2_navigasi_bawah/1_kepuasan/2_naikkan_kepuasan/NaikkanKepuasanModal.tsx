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
    <div className="fixed inset-0 z-50 flex items-center justify-center pt-[85px] sm:pt-[95px] pb-[75px] px-4 bg-transparent pointer-events-none">
      <div className="bg-[#FAF6EE] border-2 sm:border-3 border-[#C4B49C] rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-4xl h-full max-h-[calc(100vh-165px)] flex flex-col relative font-sans pointer-events-auto shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,0,0,0.03)_0%,transparent_100%)] pointer-events-none" />

        {/* Header */}
        <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-[#C4B49C]/40 flex items-center justify-between bg-[#FAF6EE] relative z-10 gap-2 shrink-0 rounded-t-2xl">
          <div className="flex items-center gap-3 sm:gap-6 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="p-1 sm:p-1.5 bg-[#5c3c10]/10 rounded-lg border border-[#5c3c10]/20 shrink-0">
                <Smile className="h-4 w-4 sm:h-5 sm:w-5 text-[#5c3c10]" />
              </div>
              <div>
                <h2 className="text-base sm:text-xl font-bold text-[#5c3c10] tracking-tight leading-none uppercase">Kepuasan Rakyat</h2>
              </div>
            </div>

            <div className="flex items-center bg-[#e4dac3]/40 p-0.5 sm:p-1 rounded-lg border border-[#bfae93]/50 backdrop-blur-md">
              <button
                onClick={() => setActiveMenu?.("Dashboard:Kepuasan")}
                className="px-3 py-1 rounded-md text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all text-[#8b7e66] hover:text-[#5c3c10] cursor-pointer"
              >
                Statistik
              </button>
              <button
                className="px-3 py-1 rounded-md text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all bg-[#5c3c10] text-[#FAF6EE] shadow-sm cursor-pointer"
              >
                Naikkan Peringkat
              </button>
            </div>
          </div>

          <button onClick={onClose} className="p-1 sm:p-1.5 rounded-lg border border-[#C4B49C] bg-transparent text-[#8b7e66] hover:text-[#5c3c10] hover:bg-black/5 active:bg-black/10 transition-all cursor-pointer font-black text-xs uppercase flex items-center gap-1 shadow-xs">
            <span className="text-[10px] font-black uppercase tracking-widest pl-1 hidden sm:inline">Tutup</span>
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Treasury Bar */}
        <div className="px-4 sm:px-6 py-2 bg-[#e4dac3]/20 border-b border-[#C4B49C]/20 flex flex-wrap items-center justify-between gap-2 relative z-10 shrink-0">
          <div className="flex items-center gap-2">
            <Coins className="h-4 w-4 text-amber-700 shrink-0" />
            <span className="text-[10px] sm:text-xs font-bold text-[#5c3c10] uppercase tracking-wide">
              Anggaran Kas Negara:
            </span>
            <span className="text-xs sm:text-sm font-black text-[#2e261a]">
              {anggaran.toLocaleString("id-ID")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Smile className="h-4 w-4 text-emerald-700 shrink-0" />
            <span className="text-[10px] sm:text-xs font-bold text-[#5c3c10] uppercase tracking-wide">
              Kepuasan Sipil:
            </span>
            <span className="text-xs sm:text-sm font-black text-[#2e261a]">
              {Math.round(kepuasan)}%
            </span>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 bg-[#FAF6EE]/40 relative z-10 custom-scrollbar">
          <div className="space-y-6 animate-in fade-in duration-500">
            {feedback && (
              <div
                className={`p-4 rounded-xl border-2 flex items-center gap-3 shadow-md animate-in fade-in slide-in-from-top-4 duration-300 ${
                  feedback.type === "success"
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-800"
                    : "bg-rose-500/10 border-rose-500/30 text-rose-800"
                }`}
              >
                {feedback.type === "success" ? (
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-700" />
                ) : (
                  <AlertCircle className="h-5 w-5 shrink-0 text-rose-700" />
                )}
                <p className="text-xs font-bold">{feedback.message}</p>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4">
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
                    className="relative bg-[#FAF6EE] border-2 border-[#C4B49C]/40 p-5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-5 transition-all hover:bg-[#e4dac3]/10 shadow-sm"
                  >
                    {/* Badge Tanggal Selesai */}
                    {isEventOngoing && (
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20 bg-[#2e261a] text-[#FAF6EE] text-[9px] font-bold px-2 py-0.5 border border-[#C4B49C] rounded-sm shadow-md tracking-wider whitespace-nowrap uppercase">
                        Selesai: {formatBadgeDate(lastEndDate)}
                      </div>
                    )}

                    <div className="flex items-start gap-4">
                      <div className={`p-3.5 rounded-xl bg-black/5 border border-black/5 ${item.color} shrink-0`}>
                        <Icon size={24} />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <h4 className="text-md font-black text-[#5c3c10] uppercase tracking-wide leading-none">
                            {item.title}
                          </h4>
                          <span className="bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider">
                            +{item.boost}% Kepuasan
                          </span>
                        </div>
                        <p className="text-xs text-[#8b7e66] font-semibold leading-relaxed max-w-xl">
                          {item.desc}
                        </p>
                        {/* 🔥 Tampilkan durasi */}
                        <div className="flex items-center gap-1.5 text-[10px] text-[#8b7e66] font-medium mt-1">
                          <Clock size={14} className="text-[#8b7e66]" />
                          <span>Durasi: {item.duration} hari</span>
                        </div>
                      </div>
                    </div>
 
                    <div className="flex flex-col items-center md:items-end gap-2 shrink-0">
                      <div className="text-right">
                        <p className="text-[10px] text-[#8b7e66] font-black uppercase tracking-wider text-center md:text-right leading-none">
                          Biaya Alokasi
                        </p>
                        <p className="text-sm font-black text-[#2e261a] mt-1">
                          {item.cost.toLocaleString("id-ID")}
                        </p>
                      </div>
                      <button
                        onClick={() => handleInitiative(item.cost, item.boost, item.title, item.duration, item.id)}
                        disabled={isEventOngoing}
                        className={`px-6 py-2.5 rounded-xl font-black text-xs uppercase shadow-md transition-all ${
                          isEventOngoing
                            ? "bg-gray-300 text-gray-500 border border-gray-400/40 cursor-not-allowed opacity-75"
                            : "bg-gradient-to-b from-[#ffe07d] via-[#fcae1e] to-[#c77a00] text-[#5c3c10] border-2 border-[#1e2f3d]/15 hover:brightness-110 active:scale-95 cursor-pointer"
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