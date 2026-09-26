"use client";

import { useState, useEffect } from "react";
import { X, Heart, Coins, Sparkles, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import DanaTidakCukupModal from "../../1_kepuasan/2_naikkan_kepuasan/DanaTidakCukupModal";

interface NaikkanKesejahteraanTabProps {
  countryDetail: any;
  setCountryDetail: (detail: any) => void;
  selectedCountry: any;
  currentDate?: string | Date;
}

export default function NaikkanKesejahteraanTab({
  countryDetail,
  setCountryDetail,
  selectedCountry,
  currentDate,
}: NaikkanKesejahteraanTabProps) {
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isDanaTidakCukupOpen, setIsDanaTidakCukupOpen] = useState(false);
  const [pendingCost, setPendingCost] = useState(0);
  const [pendingTitle, setPendingTitle] = useState("");

  const countryName = selectedCountry?.country || "Indonesia";
  const anggaran = countryDetail?.anggaran || 0;

  // Helper untuk menambah hari
  const addDays = (dateString: string, days: number): string => {
    const [y, m, d] = dateString.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() + days);
    const yy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yy}-${mm}-${dd}`;
  };

  // Mendapatkan tanggal saat ini dalam format YYYY-MM-DD
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
  // DATA INISIATIF KESEJAHTERAAN
  // ==========================================
  const initiatives = [
    {
      id: "bantuan_tunai",
      title: "Bantuan Tunai Langsung (BLT)",
      desc: "Distribusikan bantuan uang tunai langsung kepada keluarga miskin.",
      cost: 40000,
      boost: 4,
      duration: 7,
      icon: Coins,
      color: "text-emerald-600",
      bg: "bg-emerald-800/10",
    },
    {
      id: "subsidi_pangan",
      title: "Subsidi Bahan Pangan Pokok",
      desc: "Menurunkan harga beras, minyak, dan telur di pasar lokal.",
      cost: 75000,
      boost: 8,
      duration: 30,
      icon: Sparkles,
      color: "text-emerald-600",
      bg: "bg-emerald-800/10",
    },
    {
      id: "beasiswa_sosial",
      title: "Beasiswa Siswa Kurang Mampu",
      desc: "Bebaskan biaya sekolah dan perlengkapan untuk anak sekolah.",
      cost: 120000,
      boost: 12,
      duration: 7,
      icon: Sparkles,
      color: "text-emerald-600",
      bg: "bg-emerald-800/10",
    },
    {
      id: "jaminan_kesehatan",
      title: "Kartu Jaminan Kesehatan Rakyat",
      desc: "Subsidi penuh untuk perawatan medis dasar bagi masyarakat berpenghasilan rendah.",
      cost: 250000,
      boost: 18,
      duration: 30,
      icon: Heart,
      color: "text-emerald-600",
      bg: "bg-emerald-800/10",
    },
    {
      id: "renovasi_pemukiman",
      title: "Bedah Rumah & Sanitasi Layak",
      desc: "Renovasi hunian kumuh menjadi rumah tinggal layak huni dengan air bersih gratis.",
      cost: 600000,
      boost: 25,
      duration: 14,
      icon: Sparkles,
      color: "text-emerald-600",
      bg: "bg-emerald-800/10",
    },
    {
      id: "pasar_murah_nasional",
      title: "Pasar Murah & Sembako Nasional",
      desc: "Gelar operasi pasar sembako murah serentak untuk meningkatkan daya beli.",
      cost: 1000000,
      boost: 35,
      duration: 20,
      icon: Sparkles,
      color: "text-emerald-600",
      bg: "bg-emerald-800/10",
    },
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

  const handleLaunchInitiative = (init: typeof initiatives[0]) => {
    if (anggaran < init.cost) {
      setPendingCost(init.cost);
      setPendingTitle(init.title);
      setIsDanaTidakCukupOpen(true);
      return;
    }

    const safeDateString = getSafeDateString();
    const endStr = addDays(safeDateString, init.duration);

    // Struktur konstruksi inisiatif baru
    const newConstruction = {
      id: `${init.id}_${Date.now()}`,
      type: "event",
      name: init.title,
      cost: init.cost,
      boost: init.boost,
      startDate: safeDateString,
      endDate: endStr,
      progress: 0,
      targetDays: init.duration,
      buildingKey: init.id,
      category: "Kesejahteraan", // Tandai kategori agar tau ini boost kesejahteraan
    };

    const newConstructions = [...(countryDetail.ongoingConstructions || []), newConstruction];
    const newAnggaran = Math.max(0, anggaran - init.cost);

    setCountryDetail({
      ...countryDetail,
      anggaran: newAnggaran,
      ongoingConstructions: newConstructions,
    });

    setFeedback({
      type: "success",
      message: `Inisiatif "${init.title}" berhasil diluncurkan! Target selesai: ${formatBadgeDate(endStr)}.`,
    });
  };

  // Run event completion check on date changes (khusus inisiatif kesejahteraan)
  useEffect(() => {
    if (!countryDetail || !currentDate) return;

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

    const completedEvents = newConstructions.filter((c) => {
      if (c.type !== "event" || c.category !== "Kesejahteraan") return false;
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
      console.log('[NaikkanKesejahteraanTab] Completed events found:', completedEvents);
      completedEvents.forEach((c) => {
        const boost = Number(c.boost) || 0;
        // Bantuan sosial kesejahteraan langsung meningkatkan indeks_kesejahteraan / kepuasan dasar secara permanen
        newDetail.kesejahteraan_index = Math.min(100, (newDetail.kesejahteraan_index ?? 50) + boost);
        // Simpan ke bonus agar terhitung permanen di auto-refresh
        newDetail.kesejahteraan_bonus = (newDetail.kesejahteraan_bonus ?? 0) + boost;
        // Sinkronisasi dengan field kesejahteraan
        newDetail.kesejahteraan = Math.min(100, (newDetail.kesejahteraan ?? 50) + boost);
      });

      const completedIds = completedEvents.map((c) => c.id);
      newConstructions = newConstructions.filter((c) => !completedIds.includes(c.id));
      newDetail.ongoingConstructions = newConstructions;
      updated = true;
    }

    if (updated) {
      console.log('[NaikkanKesejahteraanTab] Updating countryDetail with completed events! New details:', {
        kesejahteraan_bonus: newDetail.kesejahteraan_bonus,
        kesejahteraan: newDetail.kesejahteraan
      });
      setCountryDetail(newDetail);
    }
  }, [currentDate, countryDetail]);

  const ongoingEvents = (countryDetail.ongoingConstructions || []).filter(
    (c: any) => c.type === "event" && c.category === "Kesejahteraan"
  );

  return (
    <div className="space-y-6">

      {feedback && (
        <div className={`p-4 rounded-xl border flex items-start gap-3 relative ${
          feedback.type === "success" ? "bg-[#0F2424] border-emerald-500/40 text-emerald-400" : "bg-[#0F2424] border-rose-500/40 text-rose-400"
        }`}>
          {feedback.type === "success" ? <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" /> : <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />}
          <div className="flex-1 text-xs font-bold leading-relaxed">{feedback.message}</div>
          <button onClick={() => setFeedback(null)} className="text-inherit hover:opacity-75 absolute right-3 top-3">✕</button>
        </div>
      )}

      {/* Daftar Program Bansos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {initiatives.map((init) => {
          const isLaunched = ongoingEvents.some((c: any) => c.buildingKey === init.id);
          const Icon = init.icon;

          return (
            <div
              key={init.id}
              className={`rounded-xl p-5 border bg-[#0A1A1A] flex flex-col justify-between space-y-4 relative overflow-hidden transition-all duration-200 ${
                isLaunched ? "border-amber-500/60" : "border-[#00FFAA]/20 hover:border-[#00FFAA]/50"
              }`}
            >
              {isLaunched && (
                <div className="absolute top-0 right-0 bg-amber-500/10 text-amber-400 px-3 py-1 text-[9px] font-black uppercase tracking-wider rounded-bl-lg border-l border-b border-amber-500/40 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Sedang Berjalan
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-[#00FFAA]/10 border border-[#00FFAA]/30">
                    <Icon className="h-5 w-5 text-[#00FFAA]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-[#E0E0E0] leading-none">{init.title}</h4>
                    <p className="text-[10px] text-emerald-400 font-bold mt-1">Boost Kesejahteraan: +{init.boost}%</p>
                  </div>
                </div>
                <p className="text-xs text-[#6B8A8A] font-medium leading-relaxed">{init.desc}</p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#00FFAA]/10">
                <div className="text-[10px] text-[#6B8A8A] font-bold">
                  <p>Biaya: <span className="font-black text-[#00FFAA]">{init.cost.toLocaleString("id-ID")} EM</span></p>
                  <p>Durasi: <span className="font-black text-[#E0E0E0]">{init.duration} hari</span></p>
                </div>

                <button
                  onClick={() => handleLaunchInitiative(init)}
                  disabled={isLaunched}
                  className={`px-4 py-2 rounded-lg font-black text-[10px] uppercase tracking-wider transition-all duration-150 ${
                    isLaunched
                      ? "bg-[#0F2424] text-[#6B8A8A] cursor-not-allowed border border-[#00FFAA]/10"
                      : "bg-[#00FFAA] text-[#0A1A1A] hover:bg-[#00FFAA]/80 cursor-pointer"
                  }`}
                >
                  {isLaunched ? "Aktif" : "Luncurkan"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dana tidak cukup modal overlay */}
      <DanaTidakCukupModal
        isOpen={isDanaTidakCukupOpen}
        onClose={() => setIsDanaTidakCukupOpen(false)}
        requiredCost={pendingCost}
        currentBudget={anggaran}
        actionName={pendingTitle}
      />
    </div>
  );
}
