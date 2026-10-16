"use client"
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
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
  Siren,
  Ambulance,
  Building2,
  Handshake,
  Banknote,
  Coins,
  ShieldAlert,
  Ship,
} from "lucide-react";
import { calculateCountryNetBalance, getDepartmentLevel } from "@/app/logic/economic_logic/treasuryUpdater";
import { CABINET_DEPARTMENT_IMAGES, LEVEL_UP_COST, MAX_CABINET_LEVEL } from "@/app/logic/economic_logic/departments";
import { generateKabinetChangeNotification } from "@/app/page/menus/inbox/logic/13_notifikasi_kabinet/kabinetChangeLogic";
import PilihMenteriModal, { type MinisterCandidateDepartment } from "./PilihMenteriModal";
import { applyReformasiBirokrasiToUpgradeCost } from "@/app/page/bonus_logic";

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

// ==================== KONFIGURASI EFEK PER KEMENTERIAN ====================
const MINISTRY_EFFECTS: Record<string, { stat: string; perLevel: number; unit: string; label: string }> = {
  infrastruktur: { stat: "infrastruktur", perLevel: 0.01, unit: "%", label: "Kecepatan Pembangunan" },
  pendidikan: { stat: "produksi_pangan_sda", perLevel: 0.01, unit: "%", label: "Produksi Pangan & Sumber Daya Alam" },
  sains: { stat: "kecepatan_riset", perLevel: -0.01, unit: "%", label: "Waktu Riset (Lebih Cepat)" },
  kesehatan: { stat: "kematian_pandemi", perLevel: -0.01, unit: "%", label: "Kematian Akibat Pandemi & Epidemi" },
  olahraga: { stat: "efektivitas_acara_kepuasan", perLevel: 0.01, unit: "%", label: "Efektivitas Peningkatan Kepuasan Acara" },
  kehakiman: { stat: "kriminalitas", perLevel: -0.01, unit: "%", label: "Tingkat Kriminalitas" },
  pertahanan: { stat: "militer", perLevel: 0.01, unit: "%", label: "Kekuatan Militer (Darat/Laut/Udara)" },
  "luar-negeri": { stat: "peluang_perjanjian", perLevel: 0.01, unit: "%", label: "Peluang Perjanjian dengan Negara Lain" },
  kebudayaan: { stat: "penurunan_peringkat_presiden", perLevel: -0.01, unit: "%", label: "Penurunan Peringkat Presiden" },
  pariwisata: { stat: "pendapatan_wisata", perLevel: 0.01, unit: "%", label: "Pendapatan dari Tempat Wisata" },
  lingkungan: { stat: "kerusakan_bencana", perLevel: -0.01, unit: "%", label: "Peluang & Dampak Kerusakan Bencana Alam" },
  perumahan: { stat: "kapasitas_perumahan", perLevel: 0.01, unit: "%", label: "Kapasitas Perumahan" },
  pembangunan: { stat: "infrastruktur", perLevel: 0.01, unit: "%", label: "Kecepatan Pembangunan" },
  perdagangan: { stat: "perdagangan", perLevel: 0.01, unit: "%", label: "Harga Jual (+1%) & Beli (-1%)" },
  keuangan: { stat: "pajak", perLevel: 0.01, unit: "%", label: "Penerimaan Pajak" },
  // Keamanan
  polisi: { stat: "kriminalitas", perLevel: -0.01, unit: "%", label: "Tingkat Kriminalitas" },
  "garda-nasional": { stat: "separatisme", perLevel: -0.01, unit: "%", label: "Separatisme di Wilayah Kependudukan" },
  "komandan-angkatan-darat": { stat: "militer_darat", perLevel: 0.01, unit: "%", label: "Kekuatan Darat" },
  "komandan-armada": { stat: "militer_laut", perLevel: 0.01, unit: "%", label: "Kekuatan Laut" },
  // Layanan
  "layanan-darurat": { stat: "kematian_bencana", perLevel: -0.01, unit: "%", label: "Jumlah Kematian Akibat Bencana Alam" },
  "bank-sentral": { stat: "batas_aman_pinjaman", perLevel: 0.01, unit: "%", label: "Batas Aman Pinjaman" },
};

// Fungsi untuk mendapatkan deskripsi efek berdasarkan level
const getEffectDescription = (deptId: string, level: number, ministerTier = 0): string => {
  const config = MINISTRY_EFFECTS[deptId];
  if (!config) return "Tidak ada efek spesifik";
  const ministerBonus = ministerTier > 0
    ? [0, 5, 10, 15, 20, 50][ministerTier] / 100
    : 0;
  const totalEffect = config.perLevel * level + Math.sign(config.perLevel) * ministerBonus;
  const sign = totalEffect >= 0 ? "+" : "";

  if (deptId === "perdagangan") {
    const val = (Math.abs(totalEffect) * 100).toFixed(1);
    return `Harga Jual +${val}% & Harga Beli -${val}%`;
  }

  return `${sign}${(totalEffect * 100).toFixed(1)}% ${config.label}`;
};

const MAX_LEVEL = MAX_CABINET_LEVEL; // sumber: departments.ts

const KEMENTERIAN: Department[] = [
  {
    id: "infrastruktur",
    name: "Kementerian Infrastruktur",
    icon: Truck,
    baseIncomeCost: 100,
    description: "Mengelola pembangunan jalan, jembatan, dan proyek infrastruktur nasional.",
    effects: ["Kecepatan Pembangunan: +1% per level"],
  },
  {
    id: "pendidikan",
    name: "Kementerian Pendidikan",
    icon: BookOpen,
    baseIncomeCost: 100,
    description: "Mengatur kurikulum, sekolah, serta peningkatan produktivitas pangan dan sumber daya alam.",
    effects: ["Meningkatkan Produksi Pangan dan Sumber Daya Alam: +1% per level"],
  },
  {
    id: "sains",
    name: "Sains dan Penelitian",
    icon: Microscope,
    baseIncomeCost: 100,
    description: "Mendanai riset teknologi, inovasi nasional, dan efisiensi waktu penelitian.",
    effects: ["Mengurangi Kecepatan/Waktu Riset: -1% per level"],
  },
  {
    id: "kesehatan",
    name: "Kementerian Kesehatan",
    icon: HeartPulse,
    baseIncomeCost: 100,
    description: "Mengelola rumah sakit, vaksinasi, serta penanggulangan wabah dan pandemi.",
    effects: ["Mengurangi Kematian Akibat Pandemi dan Epidemi: -1% per level"],
  },
  {
    id: "olahraga",
    name: "Kementerian Olahraga",
    icon: Trophy,
    baseIncomeCost: 100,
    description: "Mengembangkan fasilitas olahraga nasional dan meningkatkan persentase efek pada program menaikkan kepuasan.",
    effects: ["Efektivitas Peningkatan Kepuasan Acara: +1% per level"],
  },
  {
    id: "kehakiman",
    name: "Kementerian Kehakiman",
    icon: Gavel,
    baseIncomeCost: 100,
    description: "Menjaga penegakan hukum dan sistem peradilan negara.",
    effects: ["Tingkat Kriminalitas: -1% per level"],
  },
  {
    id: "pertahanan",
    name: "Kementerian Pertahanan",
    icon: Shield,
    baseIncomeCost: 100,
    description: "Mengatur kekuatan militer dan pertahanan nasional.",
    effects: ["Kekuatan Militer: +1% per level (darat/laut/udara)"],
  },
  {
    id: "luar-negeri",
    name: "Kementerian Luar Negeri",
    icon: Globe2,
    baseIncomeCost: 100,
    description: "Mengatur hubungan diplomatik dan kerja sama antar negara.",
    effects: ["Meningkatkan Peluang Perjanjian dengan Negara Lain: +1% per level"],
  },
  {
    id: "kebudayaan",
    name: "Kementerian Kebudayaan",
    icon: Palette,
    baseIncomeCost: 100,
    description: "Melestarikan budaya, identitas nasional, dan reputasi kepemimpinan.",
    effects: ["Menurunkan Penurunan Peringkat Presiden: -1% per level"],
  },
  {
    id: "pariwisata",
    name: "Kementerian Pariwisata",
    icon: Plane,
    baseIncomeCost: 100,
    description: "Mengembangkan sektor wisata dan mengoptimalkan devisa destinasi.",
    effects: ["Pendapatan dari Tempat Wisata: +1% per level"],
  },
  {
    id: "lingkungan",
    name: "Kementerian Lingkungan Hidup",
    icon: Leaf,
    baseIncomeCost: 100,
    description: "Mengelola kelestarian alam dan mitigasi risiko bencana hidrometeorologi serta geologi.",
    effects: ["Mengurangi Peluang & Dampak Kerusakan Bencana Alam: -1% per level"],
  },
  {
    id: "perumahan",
    name: "Kementerian Perumahan",
    icon: Home,
    baseIncomeCost: 100,
    description: "Mengatur penyediaan tempat tinggal dan perluasan kapasitas hunian permukiman.",
    effects: ["Kapasitas Perumahan: +1% per level"],
  },
  {
    id: "pembangunan",
    name: "Kementerian Pembangunan",
    icon: Building2,
    baseIncomeCost: 100,
    description: "Mengawasi proyek pembangunan nasional skala besar dan tata ruang wilayah.",
    effects: ["Kecepatan Pembangunan: +1% per level"],
  },
  {
    id: "perdagangan",
    name: "Kementerian Perdagangan",
    icon: Handshake,
    baseIncomeCost: 100,
    description: "Mengatur kebijakan ekspor-impor dan hubungan dagang antar negara.",
    effects: [
      "Harga Jual: +1% per level",
      "Harga Beli: -1% per level",
    ],
  },
  {
    id: "keuangan",
    name: "Kementerian Keuangan",
    icon: Banknote,
    baseIncomeCost: 100,
    description: "Mengelola anggaran negara, pajak, dan kebijakan fiskal nasional.",
    effects: ["Penerimaan Pajak: +1% per level"],
  },
];

const KEAMANAN: Department[] = [
  {
    id: "polisi",
    name: "Polisi",
    icon: Siren,
    baseIncomeCost: 100,
    description: "Menjaga ketertiban umum dan penegakan hukum sehari-hari.",
    effects: ["Tingkat Kriminalitas: -1% per level"],
  },
  {
    id: "garda-nasional",
    name: "Garda Nasional",
    icon: Shield,
    baseIncomeCost: 100,
    description: "Pasukan penjaga stabilitas dalam negeri dan penanganan separatisme di wilayah kependudukan.",
    effects: ["Mengurangi Separatisme di Wilayah Kependudukan: -1% per level"],
  },
  {
    id: "komandan-angkatan-darat",
    name: "Komandan Angkatan Darat",
    icon: ShieldAlert,
    baseIncomeCost: 100,
    description: "Memimpin kekuatan militer darat negara dalam pertahanan wilayah.",
    effects: ["Kekuatan Militer Darat: +1% per level"],
  },
  {
    id: "komandan-armada",
    name: "Komandan Armada",
    icon: Ship,
    baseIncomeCost: 100,
    description: "Memimpin kekuatan angkatan laut dan menjaga perairan negara.",
    effects: ["Kekuatan Militer Laut: +1% per level"],
  },
];

const LAYANAN: Department[] = [
  {
    id: "layanan-darurat",
    name: "Layanan Darurat",
    icon: Ambulance,
    baseIncomeCost: 100,
    description: "Menangani respons cepat evakuasi medis dan mitigasi korban jiwa bencana alam.",
    effects: ["Mengurangi Jumlah Kematian Akibat Bencana Alam: -1% per level"],
  },
  {
    id: "bank-sentral",
    name: "Kepala Bank Sentral",
    icon: Coins,
    baseIncomeCost: 100,
    description: "Mengendalikan kebijakan moneter, kapasitas pinjaman nasional, dan rasio batas aman utang negara.",
    effects: ["Meningkatkan Jumlah Batas Aman Pinjaman: +1% per level"],
  },
];

type TabKey = "kementerian" | "keamanan" | "layanan";

const TABS: { key: TabKey; label: string; data: Department[] }[] = [
  { key: "kementerian", label: "Kementerian", data: KEMENTERIAN },
  { key: "keamanan", label: "Keamanan", data: KEAMANAN },
  { key: "layanan", label: "Layanan", data: LAYANAN },
];

const getLevelUpCostForStep = (targetLevel: number, countryDetail?: any) => {
  const baseCost = LEVEL_UP_COST[targetLevel] ?? 50;
  return applyReformasiBirokrasiToUpgradeCost(baseCost, countryDetail);
};

const getDepartmentLevelFieldName = (departmentId: string): string => {
  const key = departmentId.replace(/-/g, "_");
  if (KEMENTERIAN.some(department => department.id === departmentId)) return `kem_${key}`;
  if (KEAMANAN.some(department => department.id === departmentId)) return `keamanan_${key}`;
  return `layanan_${key}`;
};

const getTotalUpgradeCost = (currentLevel: number, targetLevel: number, countryDetail?: any) => {
  let total = 0;
  for (let lvl = currentLevel; lvl < targetLevel; lvl++) {
    total += getLevelUpCostForStep(lvl + 1, countryDetail);
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
  const totalCost = getTotalUpgradeCost(currentLevel, targetLevel, detail);
  const remainingCashAfterUpgrade = currentMoney - totalCost;
  const projectedNetBalance = getProjectedNetBalance(detail, dept.id, targetLevel);

  if (remainingCashAfterUpgrade < 0) return false;
  return projectedNetBalance >= 0;
};

export default function KementerianModal({ isOpen, onClose, countryDetail, setCountryDetail, resetTrigger }: ModalProps) {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("kementerian");
  const [levels, setLevels] = useState<Record<string, number>>({});
  const [infoTarget, setInfoTarget] = useState<Department | null>(null);
  const [showGeneralInfo, setShowGeneralInfo] = useState(false);
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
  const [ministerDepartment, setMinisterDepartment] = useState<MinisterCandidateDepartment | null>(null);

  const money = countryDetail?.anggaran ?? 325800;
  const netIncome = calculateCountryNetBalance(countryDetail);
  const availableNetIncome = netIncome -
    (Number(countryDetail?.minister_recruitment_expense_pending) || 0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (resetTrigger) {
      setActiveTab("kementerian");
      setLevels({});
      setInfoTarget(null);
      setShowGeneralInfo(false);
      setConfirmUpgrade(null);
      setConfirmDowngrade(null);
      setMinisterDepartment(null);
    }
  }, [resetTrigger]);

  if (!isOpen || !mounted) return null;

  const getLevel = (id: string) => {
    return levels[id] ?? getDepartmentLevel(countryDetail, id);
  };

  const getNextStepCost = (level: number) => {
    if (level >= MAX_LEVEL) return null;
    return getLevelUpCostForStep(level + 1, countryDetail);
  };

  const getDailyCost = (level: number) => {
    return LEVEL_UP_COST[level] ?? 50;
  };

  const openMinisterCandidates = (dept: Department) => {
    const effect = MINISTRY_EFFECTS[dept.id];
    if (!effect) return;
    setMinisterDepartment({
      id: dept.id,
      name: dept.name,
      effectLabel: effect.label,
      effectDirection: effect.perLevel >= 0 ? 1 : -1,
      icon: dept.icon,
    });
  };

  const hireMinister = (department: MinisterCandidateDepartment, tier: number, cost: number) => {
    if (
      availableNetIncome < cost ||
      Number(countryDetail?.[`menteri_${department.id}`]) > 0
    ) return;
    setCountryDetail({
      ...countryDetail,
      [`menteri_${department.id}`]: tier,
      minister_recruitment_expense_pending:
        (Number(countryDetail?.minister_recruitment_expense_pending) || 0) + cost,
    });
    setMinisterDepartment(null);
  };

  const handleLevelBoxClick = (dept: Department, targetLevel: number) => {
    const currentLevel = getLevel(dept.id);

    if (targetLevel === currentLevel) return;

    if (targetLevel > currentLevel) {
      if (targetLevel > MAX_LEVEL) return;
      const totalCost = getTotalUpgradeCost(currentLevel, targetLevel, countryDetail);
      const affordable = canAffordUpgrade(countryDetail, money, dept, currentLevel, targetLevel);
      if (!affordable) return;
      setConfirmUpgrade({ dept, fromLevel: currentLevel, targetLevel, cost: totalCost });
    } else if (targetLevel < currentLevel) {
      if (targetLevel < 1) return;
      setConfirmDowngrade({ dept, fromLevel: currentLevel, targetLevel });
    }
  };

  const handleConfirmUpgrade = () => {
    if (!confirmUpgrade) return;

    const { dept, fromLevel, targetLevel, cost } = confirmUpgrade;
    const canConfirm = canAffordUpgrade(countryDetail, money, dept, fromLevel, targetLevel);
    if (!canConfirm) return;

    const effectLabel = getEffectDescription(dept.id, targetLevel);
    const dateStr = countryDetail?.current_date || new Date().toISOString().split('T')[0];
    const notif = generateKabinetChangeNotification(dept.id, dept.name, fromLevel, targetLevel, effectLabel, dateStr);

    let newPending = Array.isArray(countryDetail?.pending_notifications) ? [...countryDetail.pending_notifications] : [];
    newPending = [notif, ...newPending];

    const newAnggaran = money - cost;
    setCountryDetail({
      ...countryDetail,
      anggaran: newAnggaran,
      [getDepartmentLevelFieldName(dept.id)]: targetLevel,
      [`level_${dept.id}`]: targetLevel,
      pending_notifications: newPending,
    });

    setLevels((prev) => ({ ...prev, [dept.id]: targetLevel }));
    setConfirmUpgrade(null);
  };

  const handleConfirmDowngrade = () => {
    if (!confirmDowngrade) return;
    const { dept, fromLevel, targetLevel } = confirmDowngrade;

    const effectLabel = getEffectDescription(dept.id, targetLevel);
    const dateStr = countryDetail?.current_date || new Date().toISOString().split('T')[0];
    const notif = generateKabinetChangeNotification(dept.id, dept.name, fromLevel, targetLevel, effectLabel, dateStr);

    let newPending = Array.isArray(countryDetail?.pending_notifications) ? [...countryDetail.pending_notifications] : [];
    newPending = [notif, ...newPending];

    setCountryDetail({
      ...countryDetail,
      [getDepartmentLevelFieldName(dept.id)]: targetLevel,
      [`level_${dept.id}`]: targetLevel,
      pending_notifications: newPending,
    });
    setLevels((prev) => ({ ...prev, [dept.id]: targetLevel }));
    setConfirmDowngrade(null);
  };

  const activeData = TABS.find((t) => t.key === activeTab)?.data ?? [];

  return createPortal(
    <>
      {/* ========== MODAL UTAMA ========== */}
      <div className="fixed inset-0 z-[200] flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 pointer-events-none">
        <div className="bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans pointer-events-auto shadow-2xl">
          
          {/* Header */}
          <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-[#00FFAA]/30 flex items-center justify-between bg-[#0A1A1A] relative z-10 shrink-0">
            <div className="flex items-center gap-3 sm:gap-6 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-[#00FFAA]/10 rounded-lg border border-[#00FFAA]/30">
                  <Landmark className="h-5 w-5 text-[#00FFAA] shrink-0" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-[#E0E0E0] tracking-wide uppercase">
                  Dewan Kabinet Menteri
                </h3>
                <button
                  onClick={() => setShowGeneralInfo(true)}
                  className="p-1 text-[#6B8A8A] hover:text-[#00FFAA] hover:bg-[#00FFAA]/10 rounded-lg transition-colors cursor-pointer"
                  title="Informasi & Panduan Dewan Kabinet"
                >
                  <Info className="h-4 w-4" />
                </button>
              </div>
              <div className="text-[11px] sm:text-xs font-bold text-[#00FFAA] bg-[#0F2424] px-3 py-1 rounded-lg border border-[#00FFAA]/20">
                Kas: {money.toLocaleString("id-ID", { maximumFractionDigits: 2 })} NEO
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 lg:p-2 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] text-[#6B8A8A] hover:text-[#00FFAA] hover:border-[#00FFAA] transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1 shadow-sm shrink-0"
            >
              <span className="text-[10px] lg:text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* BODY LAYOUT WITH LEFT SIDEBAR & RIGHT CONTENT */}
          <div className="flex-1 flex min-h-0 relative z-10">
            {/* LEFT SIDEBAR TABS */}
            <div className="w-44 sm:w-52 lg:w-56 border-r border-[#00FFAA]/30 bg-[#0A1A1A] p-2.5 sm:p-3 flex flex-col gap-2 overflow-y-auto custom-scrollbar shrink-0">
              {TABS.map((tab) => {
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center justify-between w-full px-3.5 py-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      isActive
                        ? "bg-[#00FFAA] border-[#00FFAA] text-[#0A1A1A] font-black shadow-md"
                        : "bg-[#0F2424] border-[#00FFAA]/20 text-[#E0E0E0] hover:border-[#00FFAA]/50 hover:text-[#00FFAA]"
                    }`}
                  >
                    <span className="text-xs font-bold uppercase tracking-wider">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* RIGHT CONTENT AREA */}
            <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#0F2424] relative z-10 custom-scrollbar">
              <div className="space-y-4">
                {activeData.map((dept) => {
                  const level = getLevel(dept.id);
                  const nextStepCost = getNextStepCost(level);
                  const income = getDailyCost(level);
                  const Icon = dept.icon;
                  const maxed = level >= MAX_LEVEL;

                  const hiredMinisterTier = Number(countryDetail?.[`menteri_${dept.id}`]) || 0;
                  const currentEffect = getEffectDescription(dept.id, level, hiredMinisterTier);
                  const nextEffect = !maxed ? getEffectDescription(dept.id, level + 1, hiredMinisterTier) : null;

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
                        <div className="flex h-20 w-20 shrink-0 items-center justify-center">
                          {CABINET_DEPARTMENT_IMAGES[dept.id] ? (
                            <Image
                              src={`/images/game/interface/sub-tabs/kementerian/dewan-kabinet/${CABINET_DEPARTMENT_IMAGES[dept.id]}.svg`}
                              alt=""
                              aria-hidden="true"
                              width={80}
                              height={80}
                              className="h-20 w-20 object-contain"
                            />
                          ) : (
                            <Icon className="h-8 w-8 text-[#00FFAA]" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-2 text-[#E0E0E0] font-bold text-sm">
                            <span className="h-3 w-3 rounded-full bg-[#00FFAA] inline-block shadow-[0_0_8px_#00FFAA]" />
                            {income.toLocaleString("id-ID", { maximumFractionDigits: 2 })} NEO per hari
                          </div>

                          <div className="flex gap-1">
                            {Array.from({ length: MAX_LEVEL }).map((_, i) => {
                              const boxLevel = i + 1;
                              const filled = boxLevel <= level;
                              const isJumpTarget = boxLevel > level;
                              const jumpCost = isJumpTarget ? getTotalUpgradeCost(level, boxLevel, countryDetail) : 0;
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
                                      ? `Lompat ke level ${boxLevel}: ${jumpCost.toLocaleString("id-ID", { maximumFractionDigits: 2 })} NEO`
                                      : willBeDailyNegative
                                      ? `Upgrade ini akan membuat pendapatan harian menjadi negatif` 
                                      : remainingCashAfterUpgrade < 0
                                      ? `Kas saat ini tidak cukup untuk level ${boxLevel} (butuh ${jumpCost.toLocaleString("id-ID", { maximumFractionDigits: 2 })} NEO)`
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

                        <button
                          type="button"
                          onClick={() => openMinisterCandidates(dept)}
                          title={
                            maxed
                              ? "Pilih kandidat menteri"
                              : `Pilih kandidat menteri • Upgrade 1 level: ${getLevelUpCostForStep(level + 1, countryDetail)?.toLocaleString("id-ID", { maximumFractionDigits: 2 })} NEO`
                          }
                          aria-label={`Pilih kandidat menteri untuk ${dept.name}`}
                          className={`h-12 w-12 shrink-0 rounded-lg border flex items-center justify-center cursor-pointer hover:scale-105 transition-transform ${
                            maxed
                              ? "border-[#00FFAA]/10 bg-[#0F2424] text-[#6B8A8A]"
                              : "border-[#00FFAA]/40 bg-[#00FFAA] text-[#0A1A1A] shadow-md"
                          }`}
                        >
                          <Hammer className="h-5 w-5" />
                        </button>
                      </div>

                      <div className="px-4 pb-3 -mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[10px] font-bold">
                        <span className="text-[#00FFAA]">
                          Efek saat ini: <span className="text-[#E0E0E0]">{currentEffect}</span>
                        </span>
                        {!maxed && nextEffect && (
                          <span className="text-[#6B8A8A]">
                            Level berikutnya: <span className="text-[#00FFAA]">{nextEffect}</span>
                          </span>
                        )}
                      </div>

                      {!maxed && (
                        <div className="px-4 pb-3 -mt-1 text-[10px] font-bold text-[#6B8A8A]">
                          Upgrade ke level {level + 1}: <span className="text-[#00FFAA]">{getLevelUpCostForStep(level + 1, countryDetail)?.toLocaleString("id-ID", { maximumFractionDigits: 2 })} NEO</span> &nbsp;•&nbsp;
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
      </div>

      {ministerDepartment && (
        <PilihMenteriModal
          department={ministerDepartment}
          availableNetIncome={availableNetIncome}
          hiredTier={Number(countryDetail?.[`menteri_${ministerDepartment.id}`]) || 0}
          onClose={() => setMinisterDepartment(null)}
          onHire={(tier, cost) => hireMinister(ministerDepartment, tier, cost)}
        />
      )}

      {/* ========== GENERAL PANDUAN POPUP ========== */}
      {showGeneralInfo && (
        <div
          className="fixed inset-0 z-[210] flex items-center justify-center p-4 bg-transparent pointer-events-auto"
          onClick={() => setShowGeneralInfo(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl w-full max-w-md p-6 shadow-2xl relative font-sans"
          >
            <button
              onClick={() => setShowGeneralInfo(false)}
              className="absolute top-3 right-3 text-[#6B8A8A] hover:text-[#00FFAA] cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="p-1.5 bg-[#00FFAA]/10 rounded-lg border border-[#00FFAA]/30">
                <Info className="h-5 w-5 text-[#00FFAA]" />
              </div>
              <h3 className="text-base font-bold text-[#E0E0E0] uppercase">Panduan Dewan Kabinet</h3>
            </div>
            <p className="text-xs text-[#6B8A8A] font-semibold leading-relaxed mb-5">
              Kelola kabinet pemerintahan tertinggi negara untuk menjaga kinerja pelayanan birokrasi Anda tetap berintegritas. Tekan salah satu kotak level untuk melompat langsung ke level tersebut — biaya akan dijumlahkan dari semua level yang dilewati. Tekan kotak yang sudah terisi untuk menurunkan level (downgrade) dan mengurangi biaya operasional harian.
            </p>
            <button
              onClick={() => setShowGeneralInfo(false)}
              className="w-full py-2.5 rounded-xl bg-[#00FFAA] text-[#0A1A1A] font-extrabold text-xs uppercase hover:bg-[#00FFAA]/80 transition-all cursor-pointer shadow-md"
            >
              Mengerti
            </button>
          </div>
        </div>
      )}

      {/* ========== INFO POPUP ========== */}
      {infoTarget && (
        <div
          className="fixed inset-0 z-[210] flex items-center justify-center p-4 bg-transparent pointer-events-auto"
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
          className="fixed inset-0 z-[210] flex items-center justify-center p-4 bg-transparent pointer-events-auto"
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

            <div className="bg-[#0A1A1A] border border-[#00FFAA]/20 rounded-lg p-4 mb-4">
              <div className="space-y-1.5 mb-3">
                {Array.from(
                  { length: confirmUpgrade.targetLevel - confirmUpgrade.fromLevel },
                  (_, idx) => confirmUpgrade.fromLevel + idx
                ).map((stepLevel) => (
                  <div key={stepLevel} className="flex justify-between text-[11px] font-bold text-[#6B8A8A]">
                    <span>Biaya dari level {stepLevel} ke {stepLevel + 1}:</span>
                    <span className="text-[#E0E0E0]">
                      {getLevelUpCostForStep(stepLevel + 1, countryDetail).toLocaleString("id-ID", { maximumFractionDigits: 2 })} NEO
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center border-t border-[#00FFAA]/20 pt-3 mb-3">
                <span className="text-xs font-bold text-[#6B8A8A] uppercase">Total Biaya:</span>
                <span className="text-lg font-black text-[#00FFAA]">
                  {confirmUpgrade.cost.toLocaleString("id-ID", { maximumFractionDigits: 2 })} NEO
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-[#6B8A8A] uppercase">Kas Negara Sekarang:</span>
                <span className="text-lg font-black text-[#E0E0E0]">
                  {money.toLocaleString("id-ID", { maximumFractionDigits: 2 })} NEO
                </span>
              </div>
              <div className="border-t border-[#00FFAA]/20 mt-3 pt-3 flex justify-between items-center">
                <span className="text-xs font-bold text-[#6B8A8A] uppercase">Kas Setelah Upgrade:</span>
                <span className="text-lg font-black text-amber-400">
                  {(money - confirmUpgrade.cost).toLocaleString("id-ID", { maximumFractionDigits: 2 })} NEO
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
          className="fixed inset-0 z-[210] flex items-center justify-center p-4 bg-transparent pointer-events-auto"
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
                <span className="text-rose-400">- {LEVEL_UP_COST[confirmDowngrade.fromLevel].toLocaleString("id-ID", { maximumFractionDigits: 2 })} NEO</span>
              </div>
              <div className="flex justify-between items-center text-xs font-bold text-[#E0E0E0] mt-1">
                <span>Biaya harian baru (level {confirmDowngrade.targetLevel}):</span>
                <span className="text-[#00FFAA]">- {LEVEL_UP_COST[confirmDowngrade.targetLevel].toLocaleString("id-ID", { maximumFractionDigits: 2 })} NEO</span>
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
    </>,
    document.body
  );
}