"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Globe,
  Lock,
  Unlock,
  Shield,
  Tv,
  Plane,
  Users,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Sparkles,
  Info,
} from "lucide-react";
import { fetchDoktrinKeterbukaanFromDb } from "@/../../json/database_doktrin_keterbukaan/index";

interface DoktrinKeterbukaanSectionProps {
  countryDetail?: Record<string, any> | null;
}

interface DoctrineIndicator {
  key: string;
  name: string;
  category: "civil" | "media" | "global";
  desc: string;
  lowLabel: string;
  highLabel: string;
  icon: React.ElementType;
}

const DOCTRINE_INDICATORS: DoctrineIndicator[] = [
  // 1. Kebebasan Sipil & HAM
  {
    key: "speechScore",
    name: "Kebebasan Berpendapat & Berekspresi",
    category: "civil",
    desc: "Tingkat perlindungan hukum terhadap kritik, kebebasan berbicara, dan beropini publik",
    lowLabel: "Sensor Keras (Otoriter)",
    highLabel: "Bebas Penuh (Demokratis)",
    icon: Users,
  },
  {
    key: "religionScore",
    name: "Toleransi & Kebebasan Beragama",
    category: "civil",
    desc: "Jaminan kebebasan beribadah, kesetaraan hak penganut agama dan keyakinan minoritas",
    lowLabel: "Agama Tunggal Wajib",
    highLabel: "Pluralisme & Sekuler Terbuka",
    icon: Shield,
  },
  {
    key: "demoScore",
    name: "Hak Berdemonstrasi & Berserikat",
    category: "civil",
    desc: "Izin melakukan unjuk rasa damai, pembentukan serikat pekerja dan organisasi masyarakat",
    lowLabel: "Dilarang Total",
    highLabel: "Dilindungi Konstitusi",
    icon: Users,
  },
  {
    key: "transparencyScore",
    name: "Transparansi & Akuntabilitas Publik",
    category: "civil",
    desc: "Keterbukaan anggaran belanja negara, dokumen kebijakan publik, dan audit kekayaan pejabat",
    lowLabel: "Rahasia Negara Mutlak",
    highLabel: "Open Government Data",
    icon: Eye,
  },

  // 2. Media & Informasi
  {
    key: "mediaScore",
    name: "Kebebasan Pers & Penyiaran",
    category: "media",
    desc: "Kemerdekaan jurnalis, stasiun televisi, dan media cetak independen tanpa sensor sepihak",
    lowLabel: "Media Monopoli Negara",
    highLabel: "Pers Independen Bebas",
    icon: Tv,
  },
  {
    key: "internetScore",
    name: "Keterbukaan Internet & Digital",
    category: "media",
    desc: "Akses jaringan internet tanpa pemblokiran sewenang-wenang dan kebebasan platform digital",
    lowLabel: "Intranet Tertutup (Firewall)",
    highLabel: "Internet Netral & Terbuka",
    icon: Globe,
  },

  // 3. Perbatasan & Geopolitik
  {
    key: "borderScore",
    name: "Kebijakan Imigrasi & Perbatasan",
    category: "global",
    desc: "Kemudahan masuknya warga asing, turis mancanegara, dan penerimaan visa kunjungan",
    lowLabel: "Perbatasan Tertutup Ketat",
    highLabel: "Bebas Visa Global",
    icon: Plane,
  },
  {
    key: "tradeScore",
    name: "Keterbukaan Perdagangan Luar Negeri",
    category: "global",
    desc: "Tarif impor rendah, kemudahan ekspor produk, serta iklim investasi perusahaan global",
    lowLabel: "Proteksionisme Autarki",
    highLabel: "Pasar Bebas Multilateral",
    icon: Scale,
  },
  {
    key: "diplomacyScore",
    name: "Diplomasi & Kerja Sama Internasional",
    category: "global",
    desc: "Partisipasi aktif dalam organisasi internasional, pakta perdamaian, dan traktat global",
    lowLabel: "Isolasionis Mandiri",
    highLabel: "Integrasi Global Aktif",
    icon: Globe,
  },
];

export default function DoktrinKeterbukaanSection({
  countryDetail,
}: DoktrinKeterbukaanSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [dbData, setDbData] = useState<Record<string, any> | null>(null);

  const countryName =
    countryDetail?.country ||
    countryDetail?.nama_negara ||
    countryDetail?.name_id ||
    countryDetail?.name_en ||
    "Negara";

  useEffect(() => {
    fetchDoktrinKeterbukaanFromDb(countryName).then((res: any) => {
      if (res) setDbData(res);
    });
  }, [countryName]);

  const scores = useMemo(() => {
    const getVal = (key: string, def: number) => {
      if (countryDetail?.[key] !== undefined && countryDetail?.[key] !== null) {
        const v = Number(countryDetail[key]);
        if (!Number.isNaN(v)) return v;
      }
      if (dbData?.[key] !== undefined && dbData?.[key] !== null) {
        const v = Number(dbData[key]);
        if (!Number.isNaN(v)) return v;
      }
      // snake_case fallback
      const snake = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
      if (dbData?.[snake] !== undefined && dbData?.[snake] !== null) {
        const v = Number(dbData[snake]);
        if (!Number.isNaN(v)) return v;
      }
      return def;
    };

    return {
      speechScore: getVal("speechScore", 50),
      religionScore: getVal("religionScore", 60),
      demoScore: getVal("demoScore", 45),
      transparencyScore: getVal("transparencyScore", 55),
      mediaScore: getVal("mediaScore", 50),
      internetScore: getVal("internetScore", 60),
      borderScore: getVal("borderScore", 40),
      tradeScore: getVal("tradeScore", 60),
      diplomacyScore: getVal("diplomacyScore", 55),
    };
  }, [countryDetail, dbData]);

  const overallScore = useMemo(() => {
    const list = Object.values(scores);
    return Math.round(list.reduce((acc, v) => acc + v, 0) / list.length);
  }, [scores]);

  const regime = useMemo(() => {
    if (overallScore <= 20) {
      return {
        label: "Negara Terisolasi Total (Autarki)",
        color: "bg-rose-950/80 text-rose-300 border-rose-500/50",
        badge: "Tipe Tertutup / Otoriter Ekstrem",
        desc: "Negara memutus hubungan dengan dunia luar, mengontrol ketat pers, agama, demonstrasi, internet, perbatasan, dan autarki ekonomi.",
      };
    } else if (overallScore <= 40) {
      return {
        label: "Negara Proteksionis & Terbatas",
        color: "bg-amber-950/80 text-amber-300 border-amber-500/50",
        badge: "Tipe Terbatas",
        desc: "Pemerintah membatasi arus imigrasi dan menyaring media publik serta memperketat izin demonstrasi masyarakat.",
      };
    } else if (overallScore <= 60) {
      return {
        label: "Negara Moderat & Campuran",
        color: "bg-cyan-950/80 text-cyan-300 border-cyan-500/50",
        badge: "Tipe Moderat",
        desc: "Menyeimbangkan antara kebebasan sipil, ketertiban hukum publik, dan keterbukaan ekonomi hubungan internasional.",
      };
    } else if (overallScore <= 80) {
      return {
        label: "Negara Terbuka & Demokratis",
        color: "bg-emerald-950/80 text-emerald-300 border-emerald-500/50",
        badge: "Tipe Demokratis",
        desc: "Kebebasan pers & beragama terjamin, perbatasan terbuka, internet bebas, dan transparansi pemerintah yang sangat tinggi.",
      };
    } else {
      return {
        label: "Negara Globalis & Terbuka Penuh",
        color: "bg-teal-950/80 text-[#00FFAA] border-[#00FFAA]/50",
        badge: "Tipe Kosmopolitan",
        desc: "Jaminan penuh kebebasan pers, perbatasan bebas, internet terbuka mutlak, dan integrasi pasar global tanpa hambatan.",
      };
    }
  }, [overallScore]);

  const getScoreColor = (val: number) => {
    if (val <= 25) return "text-rose-400";
    if (val <= 40) return "text-amber-400";
    if (val <= 65) return "text-yellow-400";
    if (val <= 80) return "text-emerald-400";
    return "text-[#00FFAA]";
  };

  const getBarGradient = (val: number) => {
    if (val <= 25) return "from-rose-600 to-rose-500";
    if (val <= 40) return "from-rose-500 to-amber-500";
    if (val <= 65) return "from-amber-500 to-yellow-400";
    if (val <= 80) return "from-emerald-500 to-emerald-400";
    return "from-[#00FFAA] to-[#10B981]";
  };

  const filteredIndicators = useMemo(() => {
    if (selectedCategory === "all") return DOCTRINE_INDICATORS;
    return DOCTRINE_INDICATORS.filter((it) => it.category === selectedCategory);
  }, [selectedCategory]);

  return (
    <div className="space-y-6">
      {/* 1. HERO BANNER INDEKS KETERBUKAAN */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0F2826] via-[#0A1F1E] to-[#041211] p-5 sm:p-7 border border-[#00FFAA]/30 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-[#00FFAA]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00FFAA]/15 border border-[#00FFAA]/30 text-[#00FFAA] text-xs font-black tracking-wider uppercase">
              <Globe className="w-3.5 h-3.5" />
              <span>Doktrin & Keterbukaan Negara</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
              {regime.label}
            </h1>
            <p className="text-xs sm:text-sm text-[#A0D4C2] leading-relaxed">{regime.desc}</p>
          </div>

          {/* INDEKS OVERALL CARD */}
          <div className="bg-[#031510]/80 backdrop-blur-md border-2 border-[#00FFAA]/40 rounded-2xl p-4 sm:p-5 flex items-center gap-4 min-w-[260px] shadow-lg">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#00FFAA]/30 to-[#00FFAA]/5 border border-[#00FFAA]/50 flex items-center justify-center shrink-0">
              <Sparkles className="w-7 h-7 text-[#00FFAA]" />
            </div>
            <div>
              <span className="text-[10px] font-black tracking-wider uppercase text-[#6B8A8A]">
                Indeks Keterbukaan
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-[#00FFAA]">
                  {overallScore}
                </span>
                <span className="text-xs font-bold text-gray-300">/ 100</span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border inline-block mt-1 ${regime.color}`}>
                {regime.badge}
              </span>
            </div>
          </div>
        </div>

        {/* PROGRESS SPEKTRUM NASIONAL */}
        <div className="mt-6 pt-5 border-t border-[#00FFAA]/20 space-y-2">
          <div className="flex justify-between text-[11px] font-bold uppercase">
            <span className="flex items-center gap-1.5 text-rose-400">
              <Lock className="w-3.5 h-3.5" /> Tertutup Total (0%)
            </span>
            <span className="flex items-center gap-1.5 text-[#00FFAA]">
              Terbuka Penuh (100%) <Unlock className="w-3.5 h-3.5" />
            </span>
          </div>

          <div className="h-3 w-full bg-[#051714] rounded-full overflow-hidden border border-[#00FFAA]/20 p-0.5">
            <div
              className="h-full bg-gradient-to-r from-rose-600 via-amber-500 via-yellow-400 to-[#00FFAA] rounded-full transition-all duration-500 relative"
              style={{ width: `${Math.max(5, Math.min(100, overallScore))}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. FILTER KATEGORI */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar bg-[#0A1A1A] p-2.5 rounded-xl border border-[#00FFAA]/20">
        {[
          { id: "all", label: "Semua Indikator (9)", icon: Globe },
          { id: "civil", label: "Kebebasan Sipil & HAM (4)", icon: Users },
          { id: "media", label: "Media & Informasi (2)", icon: Tv },
          { id: "global", label: "Perbatasan & Geopolitik (3)", icon: Plane },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = selectedCategory === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id)}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                isActive
                  ? "bg-[#00FFAA] text-[#0A1A1A] shadow-md font-black"
                  : "bg-[#0F2424] text-[#A0C0C0] hover:text-[#00FFAA] border border-[#00FFAA]/20"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. GRID 9 INDIKATOR DOKTRIN */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredIndicators.map((item) => {
          const Icon = item.icon;
          const val = (scores as Record<string, number>)[item.key] ?? 50;
          const scoreColor = getScoreColor(val);
          const barGradient = getBarGradient(val);

          return (
            <div
              key={item.key}
              className="bg-[#0A1A1A] rounded-2xl p-5 border border-[#00FFAA]/20 hover:border-[#00FFAA]/50 transition-all flex flex-col justify-between group shadow-lg"
            >
              <div>
                <div className="flex items-start justify-between gap-2.5 mb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#00FFAA]/10 border border-[#00FFAA]/20 flex items-center justify-center shrink-0 text-[#00FFAA]">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-white group-hover:text-[#00FFAA] transition-colors leading-tight">
                        {item.name}
                      </h3>
                      <span className="text-[9px] font-black uppercase text-[#6B8A8A] tracking-wider">
                        {item.category === "civil"
                          ? "Sipil & HAM"
                          : item.category === "media"
                          ? "Media & Digital"
                          : "Geopolitik & Perbatasan"}
                      </span>
                    </div>
                  </div>
                  <span className={`text-lg font-black ${scoreColor} shrink-0`}>
                    {val}
                    <span className="text-[10px] text-gray-500 font-semibold">/100</span>
                  </span>
                </div>

                <p className="text-xs text-gray-300 leading-relaxed mb-4">{item.desc}</p>
              </div>

              {/* PROGRESS BAR & SPEKTRUM NILAI */}
              <div className="space-y-1.5 pt-2 border-t border-[#00FFAA]/10">
                <div className="flex justify-between text-[10px] font-semibold text-gray-400">
                  <span className="truncate max-w-[120px]">{item.lowLabel}</span>
                  <span className="truncate max-w-[120px] text-right">{item.highLabel}</span>
                </div>

                <div className="h-2 w-full bg-[#0F2424] rounded-full overflow-hidden border border-[#00FFAA]/20">
                  <div
                    className={`h-full bg-gradient-to-r ${barGradient} transition-all duration-300`}
                    style={{ width: `${Math.max(4, Math.min(100, val))}%` }}
                  />
                </div>

                <div className="flex items-center justify-between pt-1 text-[10px]">
                  <span className="text-[#6B8A8A]">Status Regulasi</span>
                  <span className={`font-bold flex items-center gap-1 ${scoreColor}`}>
                    <CheckCircle2 className="w-3 h-3" />
                    {val >= 70
                      ? "Terbuka & Bebas"
                      : val >= 45
                      ? "Moderat Berimbang"
                      : "Dibatasi Regulasi"}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
