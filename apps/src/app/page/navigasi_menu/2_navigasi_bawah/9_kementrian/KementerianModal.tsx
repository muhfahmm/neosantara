"use client"
import React, { useState, useEffect } from "react";
import {
  X,
  Landmark,
  Info,
  Hammer,
  Truck,
  BookOpen,
  Microscope,
  HeartPulse,
  Trophy,
  Gavel,
  Shield,
  Globe2,
  Palette,
  Plane,
  Leaf,
  Home,
  ShieldCheck,
  Siren,
  Ambulance,
  Building2,
  Handshake,
  Banknote,
  Coins,
  ShieldAlert,
  Ship,
} from "lucide-react";
import { calculateCountryNetBalance } from "@/app/logic/economic_logic/treasuryUpdater";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  countryDetail: any;
  setCountryDetail: (detail: any) => void;
  resetTrigger?: boolean;
}

interface Department {
  id: string;
  name: string;
  icon: React.ElementType;
  baseIncomeCost: number;
  description: string;
  effects: string[];
}

const LEVEL_UP_COST = [0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000];
const MAX_LEVEL = 10;

const KEMENTERIAN: Department[] = [
  {
    id: "infrastruktur",
    name: "Kementerian Infrastruktur",
    icon: Truck,
    baseIncomeCost: 100,
    description: "Mengelola pembangunan jalan, jembatan, dan proyek infrastruktur nasional.",
    effects: ["Meningkatkan produktivitas ekonomi jangka panjang", "Mempercepat distribusi barang antar wilayah", "Menurunkan biaya logistik nasional"],
  },
  {
    id: "pendidikan",
    name: "Kementerian Pendidikan",
    icon: BookOpen,
    baseIncomeCost: 100,
    description: "Mengatur kurikulum, sekolah, dan kualitas sumber daya manusia.",
    effects: ["Meningkatkan kualitas tenaga kerja", "Menambah pendapatan pajak jangka panjang", "Menurunkan angka pengangguran"],
  },
  {
    id: "sains",
    name: "Sains dan Penelitian",
    icon: Microscope,
    baseIncomeCost: 100,
    description: "Mendanai riset teknologi dan inovasi nasional.",
    effects: ["Membuka teknologi/industri baru", "Meningkatkan efisiensi produksi", "Menambah daya saing global"],
  },
  {
    id: "kesehatan",
    name: "Kementerian Kesehatan",
    icon: HeartPulse,
    baseIncomeCost: 100,
    description: "Mengelola rumah sakit, vaksinasi, dan kebijakan kesehatan publik.",
    effects: ["Menurunkan risiko wabah penyakit", "Meningkatkan tingkat kepuasan rakyat", "Meningkatkan harapan hidup populasi"],
  },
  {
    id: "olahraga",
    name: "Kementerian Olahraga",
    icon: Trophy,
    baseIncomeCost: 100,
    description: "Mengembangkan fasilitas olahraga dan prestasi atlet nasional.",
    effects: ["Meningkatkan popularitas & citra negara", "Menambah pendapatan dari event olahraga", "Meningkatkan kepuasan rakyat"],
  },
  {
    id: "kehakiman",
    name: "Kementerian Kehakiman",
    icon: Gavel,
    baseIncomeCost: 100,
    description: "Menjaga penegakan hukum dan sistem peradilan negara.",
    effects: ["Menurunkan tingkat kriminalitas & korupsi", "Meningkatkan kepercayaan investor", "Menambah pendapatan dari denda hukum"],
  },
  {
    id: "pertahanan",
    name: "Kementerian Pertahanan",
    icon: Shield,
    baseIncomeCost: 100,
    description: "Mengatur kekuatan militer dan pertahanan nasional.",
    effects: ["Meningkatkan kekuatan militer", "Menurunkan risiko invasi/konflik", "Menambah biaya pemeliharaan militer"],
  },
  {
    id: "luar-negeri",
    name: "Kementerian Luar Negeri",
    icon: Globe2,
    baseIncomeCost: 100,
    description: "Mengatur hubungan diplomatik dengan negara lain.",
    effects: ["Meningkatkan peluang kerja sama & hibah", "Meningkatkan reputasi internasional", "Membuka akses perdagangan baru"],
  },
  {
    id: "kebudayaan",
    name: "Kementerian Kebudayaan",
    icon: Palette,
    baseIncomeCost: 100,
    description: "Melestarikan budaya dan identitas nasional.",
    effects: ["Meningkatkan kepuasan rakyat", "Menambah daya tarik pariwisata"],
  },
  {
    id: "pariwisata",
    name: "Kementerian Pariwisata",
    icon: Plane,
    baseIncomeCost: 100,
    description: "Mengembangkan sektor wisata dan promosi destinasi.",
    effects: ["Menambah pendapatan devisa negara", "Membuka lapangan kerja baru"],
  },
  {
    id: "lingkungan",
    name: "Kementerian Lingkungan Hidup",
    icon: Leaf,
    baseIncomeCost: 100,
    description: "Mengelola kebijakan lingkungan dan sumber daya alam.",
    effects: ["Menurunkan risiko bencana alam", "Meningkatkan keberlanjutan sumber daya", "Mempengaruhi pajak lingkungan"],
  },
  {
    id: "perumahan",
    name: "Kementerian Perumahan",
    icon: Home,
    baseIncomeCost: 100,
    description: "Mengatur pembangunan perumahan rakyat dan tata kota.",
    effects: ["Menurunkan angka backlog perumahan", "Meningkatkan kepuasan rakyat"],
  },
  {
    id: "pembangunan",
    name: "Kementerian Pembangunan",
    icon: Building2,
    baseIncomeCost: 100,
    description: "Mengawasi proyek pembangunan nasional skala besar dan tata ruang wilayah.",
    effects: ["Mempercepat pembangunan fasilitas umum", "Meningkatkan nilai investasi properti nasional", "Menambah lapangan kerja konstruksi"],
  },
  {
    id: "perdagangan",
    name: "Kementerian Perdagangan",
    icon: Handshake,
    baseIncomeCost: 100,
    description: "Mengatur kebijakan ekspor-impor dan hubungan dagang antar negara.",
    effects: ["Meningkatkan pendapatan dari bea cukai", "Membuka akses pasar ekspor baru", "Menstabilkan harga barang domestik"],
  },
  {
    id: "keuangan",
    name: "Kementerian Keuangan",
    icon: Banknote,
    baseIncomeCost: 100,
    description: "Mengelola anggaran negara, pajak, dan kebijakan fiskal nasional.",
    effects: ["Meningkatkan efisiensi pengumpulan pajak", "Menurunkan risiko defisit anggaran", "Meningkatkan kepercayaan investor terhadap fiskal negara"],
  },
];

const KEAMANAN: Department[] = [
  {
    id: "dinas-keamanan",
    name: "Dinas Keamanan",
    icon: ShieldCheck,
    baseIncomeCost: 100,
    description: "Mengoordinasikan intelijen dan keamanan dalam negeri.",
    effects: ["Menurunkan risiko terorisme & sabotase", "Meningkatkan stabilitas politik"],
  },
  {
    id: "polisi",
    name: "Polisi",
    icon: Siren,
    baseIncomeCost: 100,
    description: "Menjaga ketertiban umum dan penegakan hukum sehari-hari.",
    effects: ["Menurunkan tingkat kriminalitas", "Meningkatkan rasa aman masyarakat"],
  },
  {
    id: "garda-nasional",
    name: "Garda Nasional",
    icon: Shield,
    baseIncomeCost: 100,
    description: "Pasukan cadangan untuk keadaan darurat dan bencana.",
    effects: ["Mempercepat respons saat krisis internal", "Menambah kekuatan cadangan militer"],
  },
  {
    id: "komandan-angkatan-darat",
    name: "Komandan Angkatan Darat",
    icon: ShieldAlert,
    baseIncomeCost: 100,
    description: "Memimpin kekuatan militer darat negara dalam pertahanan wilayah.",
    effects: ["Meningkatkan kekuatan tempur darat", "Menurunkan risiko invasi darat", "Mempercepat respons terhadap konflik internal"],
  },
  {
    id: "komandan-armada",
    name: "Komandan Armada",
    icon: Ship,
    baseIncomeCost: 100,
    description: "Memimpin kekuatan angkatan laut dan menjaga perairan negara.",
    effects: ["Meningkatkan kekuatan militer laut", "Mengamankan jalur perdagangan laut", "Menurunkan risiko pembajakan & pelanggaran wilayah maritim"],
  },
];

const LAYANAN: Department[] = [
  {
    id: "layanan-darurat",
    name: "Layanan Darurat",
    icon: Ambulance,
    baseIncomeCost: 100,
    description: "Menangani respons cepat bencana, kecelakaan, dan kondisi darurat.",
    effects: ["Menurunkan angka korban jiwa saat bencana", "Meningkatkan kepuasan rakyat"],
  },
  {
    id: "bank-sentral",
    name: "Kepala Bank Sentral",
    icon: Coins,
    baseIncomeCost: 100,
    description: "Mengendalikan kebijakan moneter, suku bunga, dan stabilitas nilai tukar.",
    effects: ["Mengendalikan tingkat inflasi nasional", "Menstabilkan nilai tukar mata uang", "Mempengaruhi suku bunga pinjaman negara"],
  },
];

type TabKey = "kementerian" | "keamanan" | "layanan";

const TABS: { key: TabKey; label: string; data: Department[] }[] = [
  { key: "kementerian", label: "Kementerian", data: KEMENTERIAN },
  { key: "keamanan", label: "Keamanan", data: KEAMANAN },
  { key: "layanan", label: "Layanan", data: LAYANAN },
];

const getTotalUpgradeCost = (currentLevel: number, targetLevel: number) => {
  let total = 0;
  for (let lvl = currentLevel; lvl < targetLevel; lvl++) {
    total += LEVEL_UP_COST[lvl];
  }
  return total;
};

const getProjectedNetBalance = (detail: any, deptId: string, targetLevel: number) => {
  const projectedDetail = { ...detail, [`level_${deptId}`]: targetLevel };
  return calculateCountryNetBalance(projectedDetail);
};

const canAffordUpgrade = (
  detail: any,
  currentMoney: number,
  dept: Department,
  currentLevel: number,
  targetLevel: number
) => {
  const totalCost = getTotalUpgradeCost(currentLevel, targetLevel);
  const remainingCashAfterUpgrade = currentMoney - totalCost;
  const projectedNetBalance = getProjectedNetBalance(detail, dept.id, targetLevel);

  // Upgrade hanya diperbolehkan jika kas saat ini cukup untuk membayar biaya upgrade
  // dan setelah upgrade pendapatan harian masih tidak negatif.
  if (remainingCashAfterUpgrade < 0) return false;
  return projectedNetBalance >= 0;
};

export default function KementerianModal({ isOpen, onClose, countryDetail, setCountryDetail, resetTrigger }: ModalProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("kementerian");
  const [levels, setLevels] = useState<Record<string, number>>({});
  const [infoTarget, setInfoTarget] = useState<Department | null>(null);
  const [confirmUpgrade, setConfirmUpgrade] = useState<{
    dept: Department;
    fromLevel: number;
    targetLevel: number;
    cost: number;
  } | null>(null);
  const [confirmDowngrade, setConfirmDowngrade] = useState<{
    dept: Department;
    fromLevel: number;
    targetLevel: number;
  } | null>(null);

  const money = countryDetail?.anggaran ?? 325800;

  useEffect(() => {
    if (resetTrigger) {
      setActiveTab("kementerian");
      setLevels({});
      setInfoTarget(null);
      setConfirmUpgrade(null);
      setConfirmDowngrade(null);
    }
  }, [resetTrigger]);

  if (!isOpen) return null;

  const getLevel = (id: string) => {
    const stored = countryDetail?.[`level_${id}`] as number | undefined;
    return levels[id] ?? stored ?? 1;
  };

  const getNextStepCost = (level: number) => {
    if (level >= MAX_LEVEL) return null;
    return LEVEL_UP_COST[level + 1] ?? 100;
  };

  const getDailyCost = (level: number) => {
    return LEVEL_UP_COST[level] ?? 100;
  };

  const handleLevelBoxClick = (dept: Department, targetLevel: number) => {
    const currentLevel = getLevel(dept.id);

    if (targetLevel === currentLevel) return; // tidak ada aksi

    if (targetLevel > currentLevel) {
      // Upgrade
      if (targetLevel > MAX_LEVEL) return;
      const totalCost = getTotalUpgradeCost(currentLevel, targetLevel);
      const affordable = canAffordUpgrade(countryDetail, money, dept, currentLevel, targetLevel);
      if (!affordable) return;
      setConfirmUpgrade({ dept, fromLevel: currentLevel, targetLevel, cost: totalCost });
    } else if (targetLevel < currentLevel) {
      // Downgrade
      if (targetLevel < 1) return;
      setConfirmDowngrade({ dept, fromLevel: currentLevel, targetLevel });
    }
  };

  const handleConfirmUpgrade = () => {
    if (!confirmUpgrade) return;

    const { dept, targetLevel, cost } = confirmUpgrade;
    const canConfirm = canAffordUpgrade(countryDetail, money, dept, confirmUpgrade.fromLevel, targetLevel);
    if (!canConfirm) return;

    const newAnggaran = money - cost;
    setCountryDetail({
      ...countryDetail,
      anggaran: newAnggaran,
      [`level_${dept.id}`]: targetLevel,
    });

    setLevels((prev) => ({ ...prev, [dept.id]: targetLevel }));

    setConfirmUpgrade(null);
  };

  const handleConfirmDowngrade = () => {
    if (!confirmDowngrade) return;
    const { dept, targetLevel } = confirmDowngrade;
    setCountryDetail({
      ...countryDetail,
      [`level_${dept.id}`]: targetLevel,
    });
    setLevels((prev) => ({ ...prev, [dept.id]: targetLevel }));
    setConfirmDowngrade(null);
  };

  const activeData = TABS.find((t) => t.key === activeTab)?.data ?? [];

  return (
    <>
      {/* ========== MODAL UTAMA ========== */}
      <div className="fixed inset-0 z-50 flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none">
        <div className="bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans pointer-events-auto shadow-2xl">
          
          {/* Header */}
          <div className="px-4 sm:px-8 py-3 sm:py-5 border-b border-[#00FFAA]/20 flex items-center justify-between bg-[#0F2424] relative z-10 flex-wrap gap-2">
            <div className="flex items-center gap-3 sm:gap-8 flex-wrap">
              <div className="flex items-center gap-2.5">
                <Landmark className="h-5 w-5 sm:h-6 sm:w-6 text-[#00FFAA] shrink-0" />
                <div>
                  <h2 className="text-lg sm:text-2xl font-bold text-[#E0E0E0] tracking-tight leading-none uppercase">
                    Dewan Kabinet Menteri
                  </h2>
                </div>
              </div>
              <div className="text-[11px] sm:text-xs font-bold text-[#00FFAA] bg-[#0A1A1A] px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-[#00FFAA]/20">
                Kas: {money.toLocaleString("id-ID")} EM
              </div>
            </div>
            <button onClick={onClose} className="p-2 sm:p-2.5 rounded-xl border border-[#00FFAA]/30 bg-[#0A1A1A] text-[#6B8A8A] hover:text-[#00FFAA] hover:bg-[#00FFAA]/10 transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1.5 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 sm:gap-2 px-4 sm:px-8 pt-3 border-b border-[#00FFAA]/20 relative z-10 overflow-x-auto no-scrollbar bg-[#0A1A1A]">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-3.5 sm:px-4 py-2 text-[11px] sm:text-xs font-bold uppercase tracking-wide rounded-t-lg border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === tab.key
                    ? "border-[#00FFAA] text-[#00FFAA] bg-[#0F2424]"
                    : "border-transparent text-[#6B8A8A] hover:text-[#E0E0E0]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#0F2424] relative z-10 custom-scrollbar">
            <p className="text-[11px] sm:text-xs text-[#6B8A8A] font-semibold leading-relaxed mb-4 sm:mb-6">
              Kelola kabinet pemerintahan tertinggi negara untuk menjaga kinerja pelayanan birokrasi
              Anda tetap berintegritas. Tekan salah satu kotak level untuk melompat langsung ke level
              tersebut — biaya akan dijumlahkan dari semua level yang dilewati. Tekan kotak yang sudah terisi
              untuk menurunkan level (downgrade) dan mengurangi biaya operasional harian.
            </p>

            <div className="space-y-4">
              {activeData.map((dept) => {
                const level = getLevel(dept.id);
                const nextStepCost = getNextStepCost(level);
                const income = getDailyCost(level);
                const Icon = dept.icon;
                const maxed = level >= MAX_LEVEL;

                return (
                  <div
                    key={dept.id}
                    className="bg-[#0A1A1A] border border-[#00FFAA]/20 rounded-xl overflow-hidden shadow-sm"
                  >
                    {/* Header hijau */}
                    <div className="bg-[#0F2424] px-4 py-2.5 flex items-center justify-between border-b border-[#00FFAA]/20">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setInfoTarget(dept)}
                          className="text-[#6B8A8A] hover:text-[#00FFAA] cursor-pointer transition-colors"
                        >
                          <Info className="h-4 w-4" />
                        </button>
                        <span className="text-[#E0E0E0] text-sm font-bold">{dept.name}</span>
                      </div>
                      <span className="text-[#00FFAA] text-[10px] font-bold uppercase bg-[#0A1A1A] px-2 py-0.5 rounded border border-[#00FFAA]/20">
                        Level {level}/{MAX_LEVEL}
                      </span>
                    </div>

                    <div className="p-4 flex items-center gap-4">
                      <div className="h-16 w-16 rounded-lg bg-[#0F2424] border border-[#00FFAA]/30 flex items-center justify-center shrink-0">
                        <Icon className="h-8 w-8 text-[#00FFAA]" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-2 text-[#E0E0E0] font-bold text-sm">
                          <span className="h-3 w-3 rounded-full bg-[#00FFAA] inline-block shadow-[0_0_8px_#00FFAA]" />
                          {income.toLocaleString("id-ID")} EM per hari
                        </div>

                        {/* 10 kotak level - dengan dukungan downgrade */}
                        <div className="flex gap-1">
                          {Array.from({ length: MAX_LEVEL }).map((_, i) => {
                            const boxLevel = i + 1;
                            const filled = boxLevel <= level;
                            const isJumpTarget = boxLevel > level;
                            const jumpCost = isJumpTarget ? getTotalUpgradeCost(level, boxLevel) : 0;
                            const projectedNetBalance = isJumpTarget
                              ? getProjectedNetBalance(countryDetail, dept.id, boxLevel)
                              : 0;
                            const remainingCashAfterUpgrade = isJumpTarget ? money - jumpCost : 0;
                            const willBeDailyNegative = isJumpTarget && projectedNetBalance < 0;
                            const canAffordJump = isJumpTarget && canAffordUpgrade(countryDetail, money, dept, level, boxLevel);

                            return (
                              <button
                                key={i}
                                type="button"
                                onClick={() => handleLevelBoxClick(dept, boxLevel)}
                                disabled={boxLevel === level || (isJumpTarget && !canAffordJump)}
                                title={
                                  boxLevel === level
                                    ? `Level saat ini`
                                    : filled
                                    ? `Klik untuk turun ke level ${boxLevel} (downgrade)`
                                    : canAffordJump
                                    ? `Lompat ke level ${boxLevel}: ${jumpCost.toLocaleString("id-ID")} EM`
                                    : willBeDailyNegative
                                    ? `Upgrade ini akan membuat pendapatan harian menjadi negatif` 
                                    : remainingCashAfterUpgrade < 0
                                    ? `Kas saat ini tidak cukup untuk level ${boxLevel} (butuh ${jumpCost.toLocaleString("id-ID")} EM)`
                                    : `Upgrade ini tidak didukung oleh kas dan pendapatan harian saat ini`
                                }
                                className={`h-4 flex-1 rounded-sm transition-all ${
                                  boxLevel === level
                                    ? "bg-[#00FFAA] cursor-default shadow-[0_0_8px_#00FFAA]"
                                    : filled
                                    ? "bg-[#00FFAA]/70 hover:bg-[#00FFAA] cursor-pointer"
                                    : canAffordJump
                                    ? "bg-[#0F2424] border border-[#00FFAA]/30 hover:border-[#00FFAA] hover:bg-[#00FFAA]/20 cursor-pointer"
                                    : "bg-gray-800 border border-gray-700 cursor-not-allowed opacity-50"
                                }`}
                              />
                            );
                          })}
                        </div>
                      </div>

                      <div
                        title={
                          maxed
                            ? "Level maksimum"
                            : `Upgrade 1 level: ${LEVEL_UP_COST[level + 1]?.toLocaleString("id-ID")} EM`
                        }
                        className={`h-12 w-12 shrink-0 rounded-lg border flex items-center justify-center ${
                          maxed
                            ? "border-[#00FFAA]/10 bg-[#0F2424] text-[#6B8A8A]"
                            : "border-[#00FFAA]/40 bg-[#00FFAA] text-[#0A1A1A] shadow-md"
                        }`}
                      >
                        <Hammer className="h-5 w-5" />
                      </div>
                    </div>

                    {!maxed && (
                      <div className="px-4 pb-3 -mt-1 text-[10px] font-bold text-[#6B8A8A]">
                        Upgrade ke level {level + 1}: <span className="text-[#00FFAA]">{LEVEL_UP_COST[level + 1]?.toLocaleString("id-ID")} EM</span> &nbsp;•&nbsp;
                        Tekan kotak level manapun untuk lompat langsung ke level tersebut
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ========== INFO POPUP ========== */}
      {infoTarget && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm pointer-events-auto"
          onClick={() => setInfoTarget(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl w-full max-w-md p-6 shadow-2xl relative font-sans"
          >
            <button
              onClick={() => setInfoTarget(null)}
              className="absolute top-3 right-3 text-[#6B8A8A] hover:text-[#00FFAA] cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-bold text-[#E0E0E0] mb-2 uppercase">{infoTarget.name}</h3>
            <p className="text-xs text-[#6B8A8A] font-semibold mb-4">{infoTarget.description}</p>
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-wide text-[#00FFAA]">
                Dampak:
              </p>
              <ul className="space-y-1.5">
                {infoTarget.effects.map((effect, i) => (
                  <li key={i} className="text-xs text-[#E0E0E0] font-semibold flex gap-2">
                    <span className="text-[#00FFAA]">•</span>
                    {effect}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ========== CONFIRMATION UPGRADE POPUP ========== */}
      {confirmUpgrade && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm pointer-events-auto"
          onClick={() => setConfirmUpgrade(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl w-full max-w-md p-6 shadow-2xl relative font-sans"
          >
            <button
              onClick={() => setConfirmUpgrade(null)}
              className="absolute top-3 right-3 text-[#6B8A8A] hover:text-[#00FFAA] cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-lg bg-[#0A1A1A] border border-[#00FFAA]/30 flex items-center justify-center shrink-0">
                <confirmUpgrade.dept.icon className="h-6 w-6 text-[#00FFAA]" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#E0E0E0] uppercase leading-none">
                  {confirmUpgrade.dept.name}
                </h3>
                <p className="text-[10px] text-[#6B8A8A] font-semibold mt-1">
                  Level {confirmUpgrade.fromLevel} → {confirmUpgrade.targetLevel}
                  {confirmUpgrade.targetLevel - confirmUpgrade.fromLevel > 1 && (
                    <span className="ml-1 text-[#00FFAA]">
                      (melewati {confirmUpgrade.targetLevel - confirmUpgrade.fromLevel} level)
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Rincian biaya */}
            <div className="bg-[#0A1A1A] border border-[#00FFAA]/20 rounded-lg p-4 mb-4">
              <div className="space-y-1.5 mb-3">
                {Array.from(
                  { length: confirmUpgrade.targetLevel - confirmUpgrade.fromLevel },
                  (_, idx) => confirmUpgrade.fromLevel + idx
                ).map((stepLevel) => (
                  <div key={stepLevel} className="flex justify-between text-[11px] font-bold text-[#6B8A8A]">
                    <span>Biaya dari level {stepLevel} ke {stepLevel + 1}:</span>
                    <span className="text-[#E0E0E0]">
                      {LEVEL_UP_COST[stepLevel + 1].toLocaleString("id-ID")} EM
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center border-t border-[#00FFAA]/20 pt-3 mb-3">
                <span className="text-xs font-bold text-[#6B8A8A] uppercase">Total Biaya:</span>
                <span className="text-lg font-black text-[#00FFAA]">
                  {confirmUpgrade.cost.toLocaleString("id-ID")} EM
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-[#6B8A8A] uppercase">Kas Negara Sekarang:</span>
                <span className="text-lg font-black text-[#E0E0E0]">
                  {money.toLocaleString("id-ID")} EM
                </span>
              </div>
              <div className="border-t border-[#00FFAA]/20 mt-3 pt-3 flex justify-between items-center">
                <span className="text-xs font-bold text-[#6B8A8A] uppercase">Kas Setelah Upgrade:</span>
                <span className="text-lg font-black text-amber-400">
                  {(money - confirmUpgrade.cost).toLocaleString("id-ID")} EM
                </span>
              </div>
            </div>

            <p className="text-xs text-[#6B8A8A] font-semibold mb-6">
              {confirmUpgrade.dept.description}
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setConfirmUpgrade(null)}
                className="flex-1 px-4 py-2.5 rounded-lg border border-[#00FFAA]/30 bg-[#0A1A1A] text-[#6B8A8A] hover:text-[#E0E0E0] active:scale-95 transition-all font-bold text-sm uppercase cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmUpgrade}
                className="flex-1 px-4 py-2.5 rounded-lg bg-[#00FFAA] text-[#0A1A1A] hover:bg-[#00FFAA]/80 active:scale-95 transition-all font-bold text-sm uppercase cursor-pointer shadow-md"
              >
                Upgrade
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========== CONFIRMATION DOWNGRADE POPUP ========== */}
      {confirmDowngrade && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm pointer-events-auto"
          onClick={() => setConfirmDowngrade(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl w-full max-w-md p-6 shadow-2xl relative font-sans"
          >
            <button
              onClick={() => setConfirmDowngrade(null)}
              className="absolute top-3 right-3 text-[#6B8A8A] hover:text-[#00FFAA] cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-lg bg-[#0A1A1A] border border-[#00FFAA]/30 flex items-center justify-center shrink-0">
                <confirmDowngrade.dept.icon className="h-6 w-6 text-[#00FFAA]" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#E0E0E0] uppercase leading-none">
                  {confirmDowngrade.dept.name}
                </h3>
                <p className="text-[10px] text-[#6B8A8A] font-semibold mt-1">
                  Level {confirmDowngrade.fromLevel} → {confirmDowngrade.targetLevel}
                </p>
              </div>
            </div>

            <div className="bg-[#0A1A1A] border border-[#00FFAA]/20 rounded-lg p-4 mb-4">
              <p className="text-xs text-[#6B8A8A] font-semibold mb-2">
                Anda akan menurunkan level departemen ini dari {confirmDowngrade.fromLevel} ke {confirmDowngrade.targetLevel}.
                Biaya operasional harian akan berkurang sesuai level baru.
              </p>
              <div className="flex justify-between items-center text-xs font-bold text-[#E0E0E0] border-t border-[#00FFAA]/20 pt-3">
                <span>Biaya harian saat ini (level {confirmDowngrade.fromLevel}):</span>
                <span className="text-rose-400">- {LEVEL_UP_COST[confirmDowngrade.fromLevel].toLocaleString("id-ID")} EM</span>
              </div>
              <div className="flex justify-between items-center text-xs font-bold text-[#E0E0E0] mt-1">
                <span>Biaya harian baru (level {confirmDowngrade.targetLevel}):</span>
                <span className="text-[#00FFAA]">- {LEVEL_UP_COST[confirmDowngrade.targetLevel].toLocaleString("id-ID")} EM</span>
              </div>
            </div>

            <p className="text-xs text-[#6B8A8A] font-semibold mb-6">
              {confirmDowngrade.dept.description}
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDowngrade(null)}
                className="flex-1 px-4 py-2.5 rounded-lg border border-[#00FFAA]/30 bg-[#0A1A1A] text-[#6B8A8A] hover:text-[#E0E0E0] active:scale-95 transition-all font-bold text-sm uppercase cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmDowngrade}
                className="flex-1 px-4 py-2.5 rounded-lg bg-rose-600 text-white hover:bg-rose-500 active:scale-95 transition-all font-bold text-sm uppercase cursor-pointer border border-rose-500/50 shadow-md"
              >
                Turunkan Level
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}