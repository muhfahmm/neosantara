// 1_konfirmasi_armada_aktif_modal.tsx
"use client";
import React, { useEffect, useState } from "react";
import { X, Hammer, Eye, EyeOff, Calendar } from "lucide-react";
import { BARAK_TO_SOLDIERS_MULTIPLIER } from "../logic/1_barak_logic";
import { HANGAR_TANK_CAPACITY } from "../logic/2_hangar_tank_logic";
import { GUDANG_SENJATA_CAPACITY } from "../logic/3_gudang_senjata_logic";
import { PANGKALAN_LAUT_CAPACITY } from "../logic/4_pangkalan_laut_logic";
import { PANGKALAN_UDARA_CAPACITY } from "../logic/5_pangkalan_udara_logic";
import { KonfirmasiPembangunanModalProps } from "../requirements_logic/konfirmasi_pembangunan_types";
import { calculateRecruitmentDays } from "../logic/recruitmentLogic";

export default function KonfirmasiArmadaAktifModal({
  isOpen,
  onClose,
  buildingLabel,
  buildingDescription,
  cost,
  waktuPembangunan,
  dampakKepuasan,
  produksiPerHari,
  produksiLabel,
  requirements,
  materialStocks,
  anggaran,
  missingMaterials,
  onConfirm,
  onMaterialClick,
  loadingMetadata,
  isDisabled = false,
  capacityType = "infanteri",
  currentCapacity = 0,
  maxCapacity = 10000,
  currentBarakCount = 0,
  currentTankCount = 0,
  currentApcCount = 0,
  currentHangarCount = 0,
  currentArtileriCount = 0,
  currentRoketCount = 0,
  currentPertahanUdaraCount = 0,
  currentKendaraanTaktisCount = 0,
  currentGudangCount = 0,
  kapalIndukCount = 0,
  kapalIndukNuklirCount = 0,
  kapalDestroyerCount = 0,
  kapalKorvetCount = 0,
  kapalSelamNuklirCount = 0,
  kapalSelamRegulerCount = 0,
  kapalRanjauCount = 0,
  kapalLogistikCount = 0,
  currentPangkalanLautCount = 0,
  jetTemturSilamanCount = 0,
  jetTemturInterceptorCount = 0,
  pesawatPengebomCount = 0,
  helikopterSerangCount = 0,
  pesawatPengintaiCount = 0,
  droneIntaiUavCount = 0,
  droneKamikazeCount = 0,
  pesawatAngkutCount = 0,
  currentPangkalanUdaraCount = 0,
  onNavigateToInfra,
  infraKeyToHighlight,
  unitDataKey = "pasukan_infanteri",
  currentGameDate = new Date().toISOString(),
}: KonfirmasiPembangunanModalProps & { unitDataKey?: string; currentGameDate?: string }) {
  const [showMaterialGrid, setShowMaterialGrid] = useState(true);
  const [buildAmount, setBuildAmount] = useState<number>(capacityType === "infanteri" ? 10000 : 1);
  const [estimatedDays, setEstimatedDays] = useState<number>(0);
  const [completionDate, setCompletionDate] = useState<string>("");

  const hasMissingMaterials = missingMaterials.length > 0;

  // 🔥 Biaya per-unit (dari metadata) — ini yang SEBELUMNYA dipakai sebagai
  // "Biaya Pembangunan" secara statis, padahal itu cuma biaya SATU unit.
  const costPerUnit = Number(cost) || 0;

  // 🔥 Total biaya = biaya per-unit × jumlah unit yang mau dibangun.
  // Untuk infanteri, sesuai desain yang sudah ada sebelumnya, perekrutan
  // pasukan tidak dikenakan biaya EM dari kas negara (hanya kapasitas
  // barak yang berlaku) — jadi totalCost untuk infanteri = 0.
  const totalCost = capacityType === "infanteri" ? 0 : costPerUnit * (buildAmount || 0);

  const isAnggaranCukup = anggaran >= totalCost;

  // Hitung infanteri saat ini
  const safeCurrentInfanteriCount = typeof currentCapacity === 'number'
    ? currentCapacity
    : (currentBarakCount * BARAK_TO_SOLDIERS_MULTIPLIER);
  const remainingInfanteriCapacity = Math.max(0, maxCapacity - safeCurrentInfanteriCount);

  // Fungsi untuk mendapatkan sisa kapasitas berdasarkan tipe (infra: hangar,
  // gudang senjata, pangkalan laut/udara, dst — TIDAK memperhitungkan uang)
  const getRemainingCapacity = (): number => {
    switch (capacityType) {
      case "infanteri":
        return remainingInfanteriCapacity;
      case "hangar_tank": {
        const totalVehicles = currentTankCount + currentApcCount;
        const maxHangar = currentHangarCount * HANGAR_TANK_CAPACITY;
        return Math.max(0, maxHangar - totalVehicles);
      }
      case "gudang_senjata": {
        const totalWeapons = currentArtileriCount + currentRoketCount + currentPertahanUdaraCount + currentKendaraanTaktisCount;
        const maxGudang = currentGudangCount * GUDANG_SENJATA_CAPACITY;
        return Math.max(0, maxGudang - totalWeapons);
      }
      case "pangkalan_laut": {
        const totalKapal = kapalIndukCount + kapalIndukNuklirCount + kapalDestroyerCount + kapalKorvetCount +
                           kapalSelamNuklirCount + kapalSelamRegulerCount + kapalRanjauCount + kapalLogistikCount;
        const maxPangkalan = currentPangkalanLautCount * PANGKALAN_LAUT_CAPACITY;
        return Math.max(0, maxPangkalan - totalKapal);
      }
      case "pangkalan_udara": {
        const totalPesawat = jetTemturSilamanCount + jetTemturInterceptorCount + pesawatPengebomCount + helikopterSerangCount +
                             pesawatPengintaiCount + droneIntaiUavCount + droneKamikazeCount + pesawatAngkutCount;
        const maxPangkalan = currentPangkalanUdaraCount * PANGKALAN_UDARA_CAPACITY;
        return Math.max(0, maxPangkalan - totalPesawat);
      }
      default:
        return 0;
    }
  };

  // 🔥 BARU: berapa unit yang MASIH SANGGUP DIBAYAR oleh kas negara,
  // terlepas dari kapasitas infra. Infanteri dikecualikan (tidak berbiaya
  // di alur ini), dan biaya 0/negatif dianggap tidak terbatas dana.
  const getMaxAffordableQuantity = (): number => {
    if (capacityType === "infanteri") return Infinity;
    if (!costPerUnit || costPerUnit <= 0) return Infinity;
    return Math.floor(anggaran / costPerUnit);
  };

  // 🔥 Batas efektif = mana yang lebih kecil antara sisa kapasitas infra
  // DAN jumlah yang masih terjangkau oleh kas negara. Sekarang jumlah unit
  // yang bisa dibangun tidak lagi cuma dibatasi slot Hangar/Gudang/
  // Pangkalan, tapi juga oleh uang kas negara.
  const getEffectiveMaxBuildable = (): number => {
    const rem = getRemainingCapacity();
    const affordable = getMaxAffordableQuantity();
    return Math.min(rem, affordable);
  };

  const remaining = getRemainingCapacity();
  const effectiveMaxBuildable = getEffectiveMaxBuildable();
  const capacityFull = remaining <= 0 && (capacityType !== "infanteri" || safeCurrentInfanteriCount >= maxCapacity);
  const budgetLimited = capacityType !== "infanteri" && effectiveMaxBuildable < remaining;

  // Batasi buildAmount agar tidak melebihi kapasitas MAUPUN kemampuan bayar
  useEffect(() => {
    const effectiveMax = getEffectiveMaxBuildable();
    if (effectiveMax <= 0) {
      setBuildAmount(0);
    } else if (buildAmount > effectiveMax) {
      setBuildAmount(Math.max(1, effectiveMax));
    }
  }, [capacityType, currentTankCount, currentApcCount, currentArtileriCount, currentRoketCount, currentPertahanUdaraCount, currentKendaraanTaktisCount, kapalIndukCount, kapalIndukNuklirCount, kapalDestroyerCount, kapalKorvetCount, kapalSelamNuklirCount, kapalSelamRegulerCount, kapalRanjauCount, kapalLogistikCount, jetTemturSilamanCount, jetTemturInterceptorCount, pesawatPengebomCount, helikopterSerangCount, pesawatPengintaiCount, droneIntaiUavCount, droneKamikazeCount, pesawatAngkutCount, currentBarakCount, currentCapacity, maxCapacity, anggaran, costPerUnit]);

  // Hitung estimasi waktu dan tanggal selesai
  useEffect(() => {
    if (buildAmount <= 0) {
      setEstimatedDays(0);
      setCompletionDate("");
      return;
    }

    let days = 0;
    if (capacityType === "infanteri") {
      // Logika rekrutmen infanteri
      days = calculateRecruitmentDays(buildAmount) || 1;
    } else {
      // Untuk unit non-infanteri: waktu pembangunan per unit * jumlah unit
      // waktuPembangunan dikirim dari parent (berasal dari JSON)
      const timePerUnit = waktuPembangunan || 1;
      days = Math.ceil(timePerUnit * buildAmount);
    }

    setEstimatedDays(days);
    const start = new Date(currentGameDate);
    const end = new Date(start);
    end.setDate(end.getDate() + days);
    setCompletionDate(end.toISOString());
  }, [buildAmount, capacityType, currentGameDate, waktuPembangunan]);

  if (!isOpen) return null;

  // ====== LOGIKA KAPASITAS UNTUK DITAMPILKAN ======
  let capacityDisplay = "";
  let warningText = "";
  let capacityInfoComponent = null;

  // Infanteri
  if (capacityType === "infanteri") {
    const used = safeCurrentInfanteriCount;
    const total = maxCapacity;
    capacityDisplay = `${used.toLocaleString('id-ID')} / ${total.toLocaleString('id-ID')}`;
    warningText = `Kapasitas Infanteri sudah penuh (${total.toLocaleString('id-ID')} pasukan). Anda harus membangun Barak baru untuk menambah Infanteri lebih banyak.`;
    capacityInfoComponent = (
      <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-4 space-y-2">
        <p className="text-xs font-bold text-emerald-900">Detail Kapasitas Barak:</p>
        <div className="text-xs text-emerald-800 space-y-1">
          <div className="flex justify-between"><span>Infanteri Saat Ini:</span><span className="font-bold">{used.toLocaleString('id-ID')} pasukan</span></div>
          <div className="flex justify-between"><span>Jumlah Barak:</span><span className="font-bold">{currentBarakCount} unit</span></div>
          <div className="flex justify-between border-t border-emerald-200 pt-1 mt-1"><span>Kapasitas Total:</span><span className="font-bold text-emerald-900">{total.toLocaleString('id-ID')} pasukan</span></div>
          <div className="flex justify-between"><span>Sisa Kapasitas:</span><span className={`font-bold ${remaining <= 0 ? 'text-rose-600' : 'text-emerald-600'}`}>{Math.max(0, remaining).toLocaleString('id-ID')} pasukan</span></div>
        </div>
      </div>
    );
  }

  // Hangar Tank
  else if (capacityType === "hangar_tank") {
    const totalVehicles = currentTankCount + currentApcCount;
    const maxHangar = currentHangarCount * HANGAR_TANK_CAPACITY;
    capacityDisplay = `${totalVehicles.toLocaleString('id-ID')} / ${maxHangar.toLocaleString('id-ID')}`;
    warningText = `Kapasitas Hangar Tank sudah penuh (${currentHangarCount} hangar × ${HANGAR_TANK_CAPACITY.toLocaleString('id-ID')} = ${maxHangar.toLocaleString('id-ID')} unit). Anda harus membangun Hangar Tank baru untuk menambah Tank/APC lebih banyak.`;
    capacityInfoComponent = (
      <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4 space-y-2">
        <p className="text-xs font-bold text-amber-900">🚜 Detail Kapasitas Hangar Tank:</p>
        <div className="text-xs text-amber-800 space-y-1">
          <div className="flex justify-between"><span>Tank Tempur Utama:</span><span className="font-bold">{currentTankCount?.toLocaleString('id-ID')} unit</span></div>
          <div className="flex justify-between"><span>APC / IFV:</span><span className="font-bold">{currentApcCount?.toLocaleString('id-ID')} unit</span></div>
          <div className="flex justify-between"><span>Total Kendaraan:</span><span className="font-bold">{totalVehicles.toLocaleString('id-ID')} unit</span></div>
          <div className="flex justify-between"><span>Jumlah Hangar:</span><span className="font-bold">{currentHangarCount} unit</span></div>
          <div className="flex justify-between border-t border-amber-200 pt-1 mt-1"><span>Kapasitas Total:</span><span className="font-bold text-amber-900">{maxHangar.toLocaleString('id-ID')} unit</span></div>
          <div className="flex justify-between"><span>Sisa Kapasitas:</span><span className={`font-bold ${remaining <= 0 ? 'text-rose-600' : 'text-emerald-600'}`}>{Math.max(0, remaining).toLocaleString('id-ID')} unit</span></div>
        </div>
      </div>
    );
  }

  // Gudang Senjata
  else if (capacityType === "gudang_senjata") {
    const totalWeapons = currentArtileriCount + currentRoketCount + currentPertahanUdaraCount + currentKendaraanTaktisCount;
    const maxGudang = currentGudangCount * GUDANG_SENJATA_CAPACITY;
    capacityDisplay = `${totalWeapons.toLocaleString('id-ID')} / ${maxGudang.toLocaleString('id-ID')}`;
    warningText = `Kapasitas Gudang Senjata sudah penuh (${currentGudangCount} gudang × ${GUDANG_SENJATA_CAPACITY.toLocaleString('id-ID')} = ${maxGudang.toLocaleString('id-ID')} unit). Anda harus membangun Gudang Senjata baru untuk menambah Senjata lebih banyak.`;
    capacityInfoComponent = (
      <div className="bg-purple-50/80 border border-purple-200 rounded-xl p-4 space-y-2">
        <p className="text-xs font-bold text-purple-900">💣 Detail Kapasitas Gudang Senjata:</p>
        <div className="text-xs text-purple-800 space-y-1">
          <div className="flex justify-between"><span>Artileri Berat:</span><span className="font-bold">{currentArtileriCount?.toLocaleString('id-ID')} unit</span></div>
          <div className="flex justify-between"><span>Sistem Peluncur Roket:</span><span className="font-bold">{currentRoketCount?.toLocaleString('id-ID')} unit</span></div>
          <div className="flex justify-between"><span>Pertahanan Udara Mobile:</span><span className="font-bold">{currentPertahanUdaraCount?.toLocaleString('id-ID')} unit</span></div>
          <div className="flex justify-between"><span>Kendaraan Taktis:</span><span className="font-bold">{currentKendaraanTaktisCount?.toLocaleString('id-ID')} unit</span></div>
          <div className="flex justify-between"><span>Total Senjata:</span><span className="font-bold">{totalWeapons.toLocaleString('id-ID')} unit</span></div>
          <div className="flex justify-between"><span>Jumlah Gudang:</span><span className="font-bold">{currentGudangCount} unit</span></div>
          <div className="flex justify-between border-t border-purple-200 pt-1 mt-1"><span>Kapasitas Total:</span><span className="font-bold text-purple-900">{maxGudang.toLocaleString('id-ID')} unit</span></div>
          <div className="flex justify-between"><span>Sisa Kapasitas:</span><span className={`font-bold ${remaining <= 0 ? 'text-rose-600' : 'text-emerald-600'}`}>{Math.max(0, remaining).toLocaleString('id-ID')} unit</span></div>
        </div>
      </div>
    );
  }

  // Pangkalan Laut
  else if (capacityType === "pangkalan_laut") {
    const totalKapal = kapalIndukCount + kapalIndukNuklirCount + kapalDestroyerCount + kapalKorvetCount +
                       kapalSelamNuklirCount + kapalSelamRegulerCount + kapalRanjauCount + kapalLogistikCount;
    const maxPangkalan = currentPangkalanLautCount * PANGKALAN_LAUT_CAPACITY;
    capacityDisplay = `${totalKapal.toLocaleString('id-ID')} / ${maxPangkalan.toLocaleString('id-ID')}`;
    warningText = `Kapasitas Pangkalan Laut sudah penuh (${currentPangkalanLautCount} pangkalan × ${PANGKALAN_LAUT_CAPACITY.toLocaleString('id-ID')} = ${maxPangkalan.toLocaleString('id-ID')} unit). Anda harus membangun Pangkalan Laut baru untuk menambah Kapal lebih banyak.`;
    capacityInfoComponent = (
      <div className="bg-sky-50/80 border border-sky-200 rounded-xl p-4 space-y-2">
        <p className="text-xs font-bold text-sky-900">⚓ Detail Kapasitas Pangkalan Laut:</p>
        <div className="text-xs text-sky-800 space-y-1">
          <div className="flex justify-between"><span>Kapal Induk:</span><span className="font-bold">{kapalIndukCount?.toLocaleString('id-ID')} unit</span></div>
          <div className="flex justify-between"><span>Kapal Induk Nuklir:</span><span className="font-bold">{kapalIndukNuklirCount?.toLocaleString('id-ID')} unit</span></div>
          <div className="flex justify-between"><span>Kapal Destroyer:</span><span className="font-bold">{kapalDestroyerCount?.toLocaleString('id-ID')} unit</span></div>
          <div className="flex justify-between"><span>Kapal Korvet:</span><span className="font-bold">{kapalKorvetCount?.toLocaleString('id-ID')} unit</span></div>
          <div className="flex justify-between"><span>Kapal Selam Nuklir:</span><span className="font-bold">{kapalSelamNuklirCount?.toLocaleString('id-ID')} unit</span></div>
          <div className="flex justify-between"><span>Kapal Selam Reguler:</span><span className="font-bold">{kapalSelamRegulerCount?.toLocaleString('id-ID')} unit</span></div>
          <div className="flex justify-between"><span>Kapal Ranjau:</span><span className="font-bold">{kapalRanjauCount?.toLocaleString('id-ID')} unit</span></div>
          <div className="flex justify-between"><span>Kapal Logistik:</span><span className="font-bold">{kapalLogistikCount?.toLocaleString('id-ID')} unit</span></div>
          <div className="flex justify-between"><span>Total Kapal:</span><span className="font-bold">{totalKapal.toLocaleString('id-ID')} unit</span></div>
          <div className="flex justify-between"><span>Jumlah Pangkalan:</span><span className="font-bold">{currentPangkalanLautCount} unit</span></div>
          <div className="flex justify-between border-t border-sky-200 pt-1 mt-1"><span>Kapasitas Total:</span><span className="font-bold text-sky-900">{maxPangkalan.toLocaleString('id-ID')} unit</span></div>
          <div className="flex justify-between"><span>Sisa Kapasitas:</span><span className={`font-bold ${remaining <= 0 ? 'text-rose-600' : 'text-emerald-600'}`}>{Math.max(0, remaining).toLocaleString('id-ID')} unit</span></div>
        </div>
      </div>
    );
  }

  // Pangkalan Udara
  else if (capacityType === "pangkalan_udara") {
    const totalPesawat = jetTemturSilamanCount + jetTemturInterceptorCount + pesawatPengebomCount + helikopterSerangCount +
                         pesawatPengintaiCount + droneIntaiUavCount + droneKamikazeCount + pesawatAngkutCount;
    const maxPangkalan = currentPangkalanUdaraCount * PANGKALAN_UDARA_CAPACITY;
    capacityDisplay = `${totalPesawat.toLocaleString('id-ID')} / ${maxPangkalan.toLocaleString('id-ID')}`;
    warningText = `Kapasitas Pangkalan Udara sudah penuh (${currentPangkalanUdaraCount} pangkalan × ${PANGKALAN_UDARA_CAPACITY.toLocaleString('id-ID')} = ${maxPangkalan.toLocaleString('id-ID')} unit). Anda harus membangun Pangkalan Udara baru untuk menambah Pesawat lebih banyak.`;
    capacityInfoComponent = (
      <div className="bg-indigo-50/80 border border-indigo-200 rounded-xl p-4 space-y-2">
        <p className="text-xs font-bold text-indigo-900">✈️ Detail Kapasitas Pangkalan Udara:</p>
        <div className="text-xs text-indigo-800 space-y-1">
          <div className="flex justify-between"><span>Jet Tempur Siluman:</span><span className="font-bold">{jetTemturSilamanCount?.toLocaleString('id-ID')} unit</span></div>
          <div className="flex justify-between"><span>Jet Tempur Interceptor:</span><span className="font-bold">{jetTemturInterceptorCount?.toLocaleString('id-ID')} unit</span></div>
          <div className="flex justify-between"><span>Pesawat Pengebom:</span><span className="font-bold">{pesawatPengebomCount?.toLocaleString('id-ID')} unit</span></div>
          <div className="flex justify-between"><span>Helikopter Serang:</span><span className="font-bold">{helikopterSerangCount?.toLocaleString('id-ID')} unit</span></div>
          <div className="flex justify-between"><span>Pesawat Pengintai:</span><span className="font-bold">{pesawatPengintaiCount?.toLocaleString('id-ID')} unit</span></div>
          <div className="flex justify-between"><span>Drone Intai UAV:</span><span className="font-bold">{droneIntaiUavCount?.toLocaleString('id-ID')} unit</span></div>
          <div className="flex justify-between"><span>Drone Kamikaze:</span><span className="font-bold">{droneKamikazeCount?.toLocaleString('id-ID')} unit</span></div>
          <div className="flex justify-between"><span>Pesawat Angkut:</span><span className="font-bold">{pesawatAngkutCount?.toLocaleString('id-ID')} unit</span></div>
          <div className="flex justify-between"><span>Total Pesawat:</span><span className="font-bold">{totalPesawat.toLocaleString('id-ID')} unit</span></div>
          <div className="flex justify-between"><span>Jumlah Pangkalan:</span><span className="font-bold">{currentPangkalanUdaraCount} unit</span></div>
          <div className="flex justify-between border-t border-indigo-200 pt-1 mt-1"><span>Kapasitas Total:</span><span className="font-bold text-indigo-900">{maxPangkalan.toLocaleString('id-ID')} unit</span></div>
          <div className="flex justify-between"><span>Sisa Kapasitas:</span><span className={`font-bold ${remaining <= 0 ? 'text-rose-600' : 'text-emerald-600'}`}>{Math.max(0, remaining).toLocaleString('id-ID')} unit</span></div>
        </div>
      </div>
    );
  }

  const handleNavigateToInfra = () => {
    if (onNavigateToInfra) {
      const infraKey =
        capacityType === "infanteri" ? "barak" :
        capacityType === "hangar_tank" ? "hangar_tank" :
        capacityType === "gudang_senjata" ? "gudang_senjata" :
        capacityType === "pangkalan_laut" ? "pangkalan_laut" :
        "pangkalan_udara";
      onNavigateToInfra(infraKey);
    }
    onClose();
  };

  const handleConfirmClick = () => {
    if (buildAmount <= 0) {
      alert("Jumlah unit harus lebih dari 0.");
      return;
    }
    if (capacityType !== "infanteri" && !isAnggaranCukup) {
      alert("Kas negara tidak cukup untuk membangun unit sejumlah ini.");
      return;
    }
    onConfirm(buildAmount);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none">
      <div className="bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans animate-in fade-in zoom-in-95 duration-150 pointer-events-auto shadow-2xl">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#00FFAA]/30 flex items-center justify-between bg-[#0A1A1A] relative z-10 shrink-0">
          <div className="flex items-center gap-3 text-[#E0E0E0]">
            <div className="p-2.5 bg-[#0F2424] rounded-xl border border-[#00FFAA]/30">
              <Hammer className="h-5 w-5 text-[#00FFAA]" />
            </div>
            <h3 className="text-base font-black uppercase tracking-wider">Perekrutan / Pembangunan Militer</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 sm:p-2.5 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] text-[#6B8A8A] hover:text-[#00FFAA] hover:border-[#00FFAA] transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1.5 shadow-sm"
          >
            <span className="text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 relative z-10 flex-1 overflow-y-auto space-y-4 text-xs font-semibold text-[#E0E0E0] custom-scrollbar bg-[#0F2424]">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-lg font-black text-[#00FFAA] uppercase tracking-wider">{buildingLabel}</h4>
              {capacityDisplay && (
                <div className="text-sm font-black text-[#00FFAA] bg-[#0A1A1A] px-3 py-1 rounded-lg border border-[#00FFAA]/30 shadow-sm">
                  {capacityDisplay}
                </div>
              )}
            </div>
            <p className="text-xs text-[#6B8A8A]">{buildingDescription || 'Tidak ada deskripsi tersedia.'}</p>
          </div>

          {/* Detail Kapasitas */}
          {capacityInfoComponent && (
            <div className="bg-[#0A1A1A] border border-[#00FFAA]/30 rounded-xl p-4 space-y-2 text-[#E0E0E0]">
              {capacityInfoComponent}
            </div>
          )}

          {/* ========== PERINGATAN KAPASITAS PENUH ========== */}
          {capacityFull && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl p-4 space-y-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-500/20 text-rose-400 font-black border border-rose-500/40">!</div>
                <div>
                  <p className="text-sm font-black uppercase tracking-wider text-rose-400">
                    {capacityType === "infanteri" ? "Kapasitas Infanteri Penuh" :
                     capacityType === "hangar_tank" ? "Kapasitas Hangar Tank Penuh" :
                     capacityType === "gudang_senjata" ? "Kapasitas Gudang Senjata Penuh" :
                     capacityType === "pangkalan_laut" ? "Kapasitas Pangkalan Laut Penuh" :
                     "Kapasitas Pangkalan Udara Penuh"}
                  </p>
                  <p className="text-xs leading-relaxed text-[#E0E0E0] mt-1.5">{warningText}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleNavigateToInfra}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#00FFAA] px-4 py-3 text-xs font-black uppercase text-[#0A1A1A] transition hover:bg-[#00FFAA]/80 cursor-pointer shadow-md"
              >
                Buka Tab Infrastruktur dan Sorot {
                  capacityType === "infanteri" ? "Barak" :
                  capacityType === "hangar_tank" ? "Hangar Tank" :
                  capacityType === "gudang_senjata" ? "Gudang Senjata" :
                  capacityType === "pangkalan_laut" ? "Pangkalan Laut" :
                  "Pangkalan Udara"
                }
              </button>
            </div>
          )}

          {/* PERINGATAN KAS NEGARA TIDAK CUKUP */}
          {!capacityFull && capacityType !== "infanteri" && !isAnggaranCukup && buildAmount > 0 && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl p-4 space-y-2 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-500/20 text-rose-400 font-black border border-rose-500/40">!</div>
                <div>
                  <p className="text-sm font-black uppercase tracking-wider text-rose-400">Kas Negara Tidak Cukup</p>
                  <p className="text-xs leading-relaxed text-[#E0E0E0] mt-1">
                    Total biaya pembangunan ({totalCost.toLocaleString('id-ID')} EM) melebihi kas negara saat ini ({anggaran.toLocaleString('id-ID')} EM). Kurangi jumlah unit atau tunggu kas negara bertambah.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ========== INPUT JUMLAH ========== */}
          <div className="bg-[#0A1A1A] border border-[#00FFAA]/20 rounded-xl p-4 space-y-3 text-xs text-[#E0E0E0]">
            <label className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-black uppercase tracking-wider text-[#6B8A8A]">
                  {capacityType === "infanteri" ? "Jumlah Pasukan yang Direkrut" : "Jumlah Unit yang Dibangun"}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const effectiveMax = getEffectiveMaxBuildable();
                    setBuildAmount(effectiveMax > 0 ? effectiveMax : 0);
                  }}
                  disabled={capacityFull || effectiveMaxBuildable <= 0}
                  className="px-3 py-1 bg-[#0F2424] hover:bg-[#00FFAA]/20 text-[#00FFAA] text-[10px] font-black uppercase rounded-lg transition-colors cursor-pointer border border-[#00FFAA]/30 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Maks
                </button>
              </div>
              <input
                type="number"
                min={0}
                step={capacityType === "infanteri" ? 1000 : 1}
                value={buildAmount}
                onChange={(event) => {
                  const value = Number(event.target.value);
                  const safeValue = Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
                  const effectiveMax = getEffectiveMaxBuildable();
                  setBuildAmount(Math.min(safeValue, effectiveMax));
                }}
                className="w-full rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] px-3.5 py-2.5 text-sm text-[#E0E0E0] focus:outline-none focus:border-[#00FFAA] font-bold"
                disabled={capacityFull || effectiveMaxBuildable <= 0}
              />
            </label>
            <p className="text-[10px] text-[#6B8A8A]">
              Maksimal: {Math.max(0, effectiveMaxBuildable).toLocaleString('id-ID')} {capacityType === "infanteri" ? "pasukan" : "unit"}.
            </p>
            {budgetLimited && (
              <p className="text-[10px] font-bold text-amber-400">
                ⚠️ Dibatasi oleh kas negara — sisa slot infra masih {Math.max(0, remaining).toLocaleString('id-ID')} unit, tapi kas negara hanya cukup untuk {Math.max(0, getMaxAffordableQuantity()).toLocaleString('id-ID')} unit.
              </p>
            )}
          </div>

          {/* ========== ESTIMASI WAKTU & TANGGAL SELESAI ========== */}
          {estimatedDays > 0 && !capacityFull && (
            <div className="bg-[#0A1A1A] border border-emerald-500/30 rounded-xl p-3.5 space-y-2 mt-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span>Estimasi Waktu Pembangunan</span>
              </div>
              <div className="space-y-1 text-xs text-[#E0E0E0]">
                <div className="flex justify-between">
                  <span className="text-[#6B8A8A]">Waktu Dibutuhkan:</span>
                  <span className="font-bold text-emerald-400">{estimatedDays} hari</span>
                </div>
                {completionDate && (
                  <div className="flex justify-between border-t border-[#00FFAA]/10 pt-1 mt-1">
                    <span className="text-[#6B8A8A]">Selesai Tanggal:</span>
                    <span className="font-bold text-emerald-400">
                      {new Date(completionDate).toLocaleDateString('id-ID', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========== BIAYA & MATERIAL ========== */}
          <div className="bg-[#0A1A1A] border border-[#00FFAA]/20 rounded-xl p-4 space-y-2.5 text-xs text-[#E0E0E0]">
            {capacityType === "infanteri" ? (
              <div className="flex justify-between font-bold">
                <span className="text-[#6B8A8A]">Biaya Pembangunan:</span>
                <span className="text-[#00FFAA] font-black">
                  {loadingMetadata ? 'Memuat...' : `${costPerUnit.toLocaleString('id-ID')} EM`}
                </span>
              </div>
            ) : (
              <>
                <div className="flex justify-between">
                  <span className="text-[#6B8A8A]">Biaya per Unit:</span>
                  <span className="text-[#E0E0E0] font-bold">
                    {loadingMetadata ? 'Memuat...' : `${costPerUnit.toLocaleString('id-ID')} EM`}
                  </span>
                </div>
                <div className="flex justify-between font-bold">
                  <span className="text-[#6B8A8A]">Total Biaya ({buildAmount.toLocaleString('id-ID')} unit):</span>
                  <span className={isAnggaranCukup ? "text-[#00FFAA] font-black" : "text-rose-400 font-black"}>
                    {loadingMetadata ? 'Memuat...' : `${totalCost.toLocaleString('id-ID')} EM`}
                  </span>
                </div>
              </>
            )}

            {waktuPembangunan !== undefined && capacityType !== "infanteri" && (
              <div className="flex justify-between">
                <span className="text-[#6B8A8A]">Waktu Pembangunan per Unit:</span>
                <span className="text-[#E0E0E0] font-bold">{waktuPembangunan} Hari</span>
              </div>
            )}

            {capacityType !== "infanteri" && (
              requirements && requirements.length > 0 ? (
                <div className="space-y-3 text-xs pt-1">
                  <div className="flex items-center justify-between">
                    <div className="font-black uppercase tracking-wider text-[#00FFAA]">Material Dibutuhkan</div>
                    <button
                      onClick={() => setShowMaterialGrid(!showMaterialGrid)}
                      className="flex items-center gap-1.5 px-2.5 py-1 bg-[#0F2424] border border-[#00FFAA]/30 rounded-lg text-[#6B8A8A] hover:text-[#00FFAA] transition-all cursor-pointer"
                    >
                      {showMaterialGrid ? (
                        <>
                          <EyeOff className="h-3 w-3" />
                          <span className="text-[9px] font-bold uppercase">Sembunyikan</span>
                        </>
                      ) : (
                        <>
                          <Eye className="h-3 w-3" />
                          <span className="text-[9px] font-bold uppercase">Tampilkan</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div
                    className={`grid grid-cols-4 gap-2 overflow-hidden transition-all duration-500 ease-in-out ${
                      showMaterialGrid ? 'max-h-[1500px] opacity-100 mt-2' : 'max-h-0 opacity-0 mt-0'
                    }`}
                  >
                    {requirements.map((material) => {
                      const stock = materialStocks[material.resourceKey] ?? 0;
                      const isStockZero = stock <= 0;

                      return (
                        <button
                          key={`${material.resourceKey}-${material.group}`}
                          type="button"
                          onClick={() => onMaterialClick(material.resourceKey, material.label)}
                          className={`flex flex-col items-center justify-center rounded-xl p-2.5 min-h-[50px] cursor-pointer border transition-all ${
                            isStockZero ? 'border-rose-500/40 bg-rose-500/10 text-rose-300 hover:border-rose-500' : 'border-[#00FFAA]/30 bg-[#0F2424] hover:border-[#00FFAA]'
                          }`}
                        >
                          <div className="font-bold text-[10px] text-center text-[#E0E0E0]">{material.label}</div>
                          {material.amount !== undefined && (
                            <div className="text-[9px] uppercase tracking-wider text-[#6B8A8A] mt-1">
                              x{material.amount}
                            </div>
                          )}
                          <div className={`text-[10px] font-black mt-0.5 ${isStockZero ? 'text-rose-400' : 'text-emerald-400'}`}>
                            {stock.toLocaleString('id-ID')}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-[#6B8A8A]">Tidak ada material yang dibutuhkan untuk bangunan ini.</div>
              )
            )}
          </div>

          <div className="flex justify-between items-center text-xs font-black pt-1">
            <span className="text-[#6B8A8A]">Kas Negara Saat Ini:</span>
            <span className="text-[#00FFAA]">{anggaran.toLocaleString('id-ID')} EM</span>
          </div>

          {capacityType !== "infanteri" && buildAmount > 0 && (
            <div className="flex justify-between items-center text-xs font-bold pt-1">
              <span className="text-[#6B8A8A]">Sisa Kas Setelah Pembangunan:</span>
              <span className={isAnggaranCukup ? "text-emerald-400 font-black" : "text-rose-400 font-black"}>
                {(anggaran - totalCost).toLocaleString('id-ID')} EM
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#0A1A1A] border-t border-[#00FFAA]/20 flex gap-3 relative z-10 shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-[#00FFAA]/30 text-[#6B8A8A] bg-[#0F2424] hover:text-[#00FFAA] hover:border-[#00FFAA] text-xs font-black uppercase cursor-pointer transition-all text-center shadow-sm"
          >
            Batal
          </button>
          <button
            onClick={handleConfirmClick}
            disabled={capacityFull || buildAmount <= 0 || (capacityType !== "infanteri" && (hasMissingMaterials || !isAnggaranCukup || loadingMetadata || isDisabled))}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase transition-all text-center cursor-pointer shadow-md ${
              capacityFull || buildAmount <= 0 ? 'bg-[#0F2424] text-[#6B8A8A] border border-[#00FFAA]/20 cursor-not-allowed opacity-60' :
              (capacityType !== "infanteri" && (hasMissingMaterials || !isAnggaranCukup || loadingMetadata || isDisabled)) ? 'bg-[#0F2424] text-[#6B8A8A] border border-[#00FFAA]/20 cursor-not-allowed opacity-60' :
              'bg-[#00FFAA] text-[#0A1A1A] border border-[#00FFAA] hover:bg-[#00FFAA]/80'
            }`}
          >
            {capacityFull ? 'Kapasitas Penuh' :
             buildAmount <= 0 ? 'Masukkan Jumlah' :
             capacityType !== "infanteri" && hasMissingMaterials ? 'Material Kurang' :
             capacityType !== "infanteri" && !isAnggaranCukup ? 'Dana Tidak Cukup' :
             (capacityType === "infanteri" ? 'Mulai Perekrutan' : 'Mulai Pembangunan')}
          </button>
        </div>
      </div>
    </div>
  );
}