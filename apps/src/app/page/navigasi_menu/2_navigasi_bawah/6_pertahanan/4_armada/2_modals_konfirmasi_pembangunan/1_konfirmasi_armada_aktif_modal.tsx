// 1_konfirmasi_armada_aktif_modal.tsx
"use client";
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Hammer, Eye, EyeOff, Calendar } from "lucide-react";
import { BARAK_TO_SOLDIERS_MULTIPLIER } from "../logic/1_barak_logic";
import { HANGAR_TANK_CAPACITY } from "../logic/2_hangar_tank_logic";
import { GUDANG_SENJATA_CAPACITY } from "../logic/3_gudang_senjata_logic";
import { PANGKALAN_LAUT_CAPACITY } from "../logic/4_pangkalan_laut_logic";
import { PANGKALAN_UDARA_CAPACITY } from "../logic/5_pangkalan_udara_logic";
import { KonfirmasiPembangunanModalProps } from "../construction_support/konfirmasi_pembangunan_types";
import { calculateRecruitmentDays } from "../logic/recruitmentLogic";
import NotebookModalWrapper from "../../../NotebookModalWrapper";
import RootModalCloseButton from "@/app/page/root_modals_design_menu/RootModalCloseButton";
import { useMilitaryMenuTranslation } from "@/app/page/paused_menu/terjemahan_paused_menu/useMilitaryMenuTranslation";

export default function KonfirmasiArmadaAktifModal({
  isOpen,
  onClose,
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
  const { language, translate: tr } = useMilitaryMenuTranslation();
  const formatNumber = (value: number) =>
    value.toLocaleString(language, { maximumFractionDigits: 2 });
  const facilityKey = capacityType === "infanteri"
    ? "barak"
    : capacityType;
  const facilityLabel = tr(`infrastructure.${facilityKey}.title`);
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
  // pasukan tidak dikenakan biaya NEO dari kas negara (hanya kapasitas
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
  let capacityInfoComponent = null;

  // Infanteri
  if (capacityType === "infanteri") {
    const used = safeCurrentInfanteriCount;
    const total = maxCapacity;
    capacityDisplay = `${formatNumber(used)} / ${formatNumber(total)}`;
    capacityInfoComponent = (
      <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-4 space-y-2">
        <p className="text-xs font-bold text-emerald-900">{tr("capacityDetails.infantryTitle")}:</p>
        <div className="text-xs text-emerald-800 space-y-1">
          <div className="flex justify-between"><span>{tr("capacityDetails.currentInfantry")}:</span><span className="font-bold">{formatNumber(used)} {tr("units.troops")}</span></div>
          <div className="flex justify-between"><span>{tr("capacityDetails.barracksCount")}:</span><span className="font-bold">{formatNumber(currentBarakCount)} {tr("units.unit")}</span></div>
          <div className="flex justify-between border-t border-emerald-200 pt-1 mt-1"><span>{tr("capacityDetails.totalCapacity")}:</span><span className="font-bold text-emerald-900">{formatNumber(total)} {tr("units.troops")}</span></div>
          <div className="flex justify-between"><span>{tr("capacityDetails.remainingCapacity")}:</span><span className={`font-bold ${remaining <= 0 ? 'text-rose-600' : 'text-emerald-600'}`}>{formatNumber(Math.max(0, remaining))} {tr("units.troops")}</span></div>
        </div>
      </div>
    );
  }

  // Hangar Tank
  else if (capacityType === "hangar_tank") {
    const totalVehicles = currentTankCount + currentApcCount;
    const maxHangar = currentHangarCount * HANGAR_TANK_CAPACITY;
    capacityDisplay = `${formatNumber(totalVehicles)} / ${formatNumber(maxHangar)}`;
    capacityInfoComponent = (
      <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4 space-y-2">
        <p className="text-xs font-bold text-amber-900">🚜 {tr("capacityDetails.hangarTitle")}:</p>
        <div className="text-xs text-amber-800 space-y-1">
          <div className="flex justify-between"><span>{tr("capacityDetails.tank")}:</span><span className="font-bold">{formatNumber(currentTankCount)} {tr("units.unit")}</span></div>
          <div className="flex justify-between"><span>{tr("capacityDetails.apc")}:</span><span className="font-bold">{formatNumber(currentApcCount)} {tr("units.unit")}</span></div>
          <div className="flex justify-between"><span>{tr("capacityDetails.totalVehicles")}:</span><span className="font-bold">{formatNumber(totalVehicles)} {tr("units.unit")}</span></div>
          <div className="flex justify-between"><span>{tr("capacityDetails.hangarCount")}:</span><span className="font-bold">{formatNumber(currentHangarCount)} {tr("units.unit")}</span></div>
          <div className="flex justify-between border-t border-amber-200 pt-1 mt-1"><span>{tr("capacityDetails.totalCapacity")}:</span><span className="font-bold text-amber-900">{formatNumber(maxHangar)} {tr("units.unit")}</span></div>
          <div className="flex justify-between"><span>{tr("capacityDetails.remainingCapacity")}:</span><span className={`font-bold ${remaining <= 0 ? 'text-rose-600' : 'text-emerald-600'}`}>{formatNumber(Math.max(0, remaining))} {tr("units.unit")}</span></div>
        </div>
      </div>
    );
  }

  // Gudang Senjata
  else if (capacityType === "gudang_senjata") {
    const totalWeapons = currentArtileriCount + currentRoketCount + currentPertahanUdaraCount + currentKendaraanTaktisCount;
    const maxGudang = currentGudangCount * GUDANG_SENJATA_CAPACITY;
    capacityDisplay = `${formatNumber(totalWeapons)} / ${formatNumber(maxGudang)}`;
    capacityInfoComponent = (
      <div className="bg-purple-50/80 border border-purple-200 rounded-xl p-4 space-y-2">
        <p className="text-xs font-bold text-purple-900">💣 {tr("capacityDetails.warehouseTitle")}:</p>
        <div className="text-xs text-purple-800 space-y-1">
          <div className="flex justify-between"><span>{tr("capacityDetails.artillery")}:</span><span className="font-bold">{formatNumber(currentArtileriCount)} {tr("units.unit")}</span></div>
          <div className="flex justify-between"><span>{tr("capacityDetails.rockets")}:</span><span className="font-bold">{formatNumber(currentRoketCount)} {tr("units.unit")}</span></div>
          <div className="flex justify-between"><span>{tr("capacityDetails.mobileAirDefense")}:</span><span className="font-bold">{formatNumber(currentPertahanUdaraCount)} {tr("units.unit")}</span></div>
          <div className="flex justify-between"><span>{tr("capacityDetails.tacticalVehicles")}:</span><span className="font-bold">{formatNumber(currentKendaraanTaktisCount)} {tr("units.unit")}</span></div>
          <div className="flex justify-between"><span>{tr("capacityDetails.totalWeapons")}:</span><span className="font-bold">{formatNumber(totalWeapons)} {tr("units.unit")}</span></div>
          <div className="flex justify-between"><span>{tr("capacityDetails.warehouseCount")}:</span><span className="font-bold">{formatNumber(currentGudangCount)} {tr("units.unit")}</span></div>
          <div className="flex justify-between border-t border-purple-200 pt-1 mt-1"><span>{tr("capacityDetails.totalCapacity")}:</span><span className="font-bold text-purple-900">{formatNumber(maxGudang)} {tr("units.unit")}</span></div>
          <div className="flex justify-between"><span>{tr("capacityDetails.remainingCapacity")}:</span><span className={`font-bold ${remaining <= 0 ? 'text-rose-600' : 'text-emerald-600'}`}>{formatNumber(Math.max(0, remaining))} {tr("units.unit")}</span></div>
        </div>
      </div>
    );
  }

  // Pangkalan Laut
  else if (capacityType === "pangkalan_laut") {
    const totalKapal = kapalIndukCount + kapalIndukNuklirCount + kapalDestroyerCount + kapalKorvetCount +
                       kapalSelamNuklirCount + kapalSelamRegulerCount + kapalRanjauCount + kapalLogistikCount;
    const maxPangkalan = currentPangkalanLautCount * PANGKALAN_LAUT_CAPACITY;
    capacityDisplay = `${formatNumber(totalKapal)} / ${formatNumber(maxPangkalan)}`;
    capacityInfoComponent = (
      <div className="bg-sky-50/80 border border-sky-200 rounded-xl p-4 space-y-2">
        <p className="text-xs font-bold text-sky-900">⚓ {tr("capacityDetails.navalTitle")}:</p>
        <div className="text-xs text-sky-800 space-y-1">
          <div className="flex justify-between"><span>{tr("capacityDetails.carrier")}:</span><span className="font-bold">{formatNumber(kapalIndukCount)} {tr("units.unit")}</span></div>
          <div className="flex justify-between"><span>{tr("capacityDetails.nuclearCarrier")}:</span><span className="font-bold">{formatNumber(kapalIndukNuklirCount)} {tr("units.unit")}</span></div>
          <div className="flex justify-between"><span>{tr("capacityDetails.destroyer")}:</span><span className="font-bold">{formatNumber(kapalDestroyerCount)} {tr("units.unit")}</span></div>
          <div className="flex justify-between"><span>{tr("capacityDetails.corvette")}:</span><span className="font-bold">{formatNumber(kapalKorvetCount)} {tr("units.unit")}</span></div>
          <div className="flex justify-between"><span>{tr("capacityDetails.nuclearSubmarine")}:</span><span className="font-bold">{formatNumber(kapalSelamNuklirCount)} {tr("units.unit")}</span></div>
          <div className="flex justify-between"><span>{tr("capacityDetails.regularSubmarine")}:</span><span className="font-bold">{formatNumber(kapalSelamRegulerCount)} {tr("units.unit")}</span></div>
          <div className="flex justify-between"><span>{tr("capacityDetails.minelayer")}:</span><span className="font-bold">{formatNumber(kapalRanjauCount)} {tr("units.unit")}</span></div>
          <div className="flex justify-between"><span>{tr("capacityDetails.logisticsShip")}:</span><span className="font-bold">{formatNumber(kapalLogistikCount)} {tr("units.unit")}</span></div>
          <div className="flex justify-between"><span>{tr("capacityDetails.totalShips")}:</span><span className="font-bold">{formatNumber(totalKapal)} {tr("units.unit")}</span></div>
          <div className="flex justify-between"><span>{tr("capacityDetails.navalBaseCount")}:</span><span className="font-bold">{formatNumber(currentPangkalanLautCount)} {tr("units.unit")}</span></div>
          <div className="flex justify-between border-t border-sky-200 pt-1 mt-1"><span>{tr("capacityDetails.totalCapacity")}:</span><span className="font-bold text-sky-900">{formatNumber(maxPangkalan)} {tr("units.unit")}</span></div>
          <div className="flex justify-between"><span>{tr("capacityDetails.remainingCapacity")}:</span><span className={`font-bold ${remaining <= 0 ? 'text-rose-600' : 'text-emerald-600'}`}>{formatNumber(Math.max(0, remaining))} {tr("units.unit")}</span></div>
        </div>
      </div>
    );
  }

  // Pangkalan Udara
  else if (capacityType === "pangkalan_udara") {
    const totalPesawat = jetTemturSilamanCount + jetTemturInterceptorCount + pesawatPengebomCount + helikopterSerangCount +
                         pesawatPengintaiCount + droneIntaiUavCount + droneKamikazeCount + pesawatAngkutCount;
    const maxPangkalan = currentPangkalanUdaraCount * PANGKALAN_UDARA_CAPACITY;
    capacityDisplay = `${formatNumber(totalPesawat)} / ${formatNumber(maxPangkalan)}`;
    capacityInfoComponent = (
      <div className="bg-indigo-50/80 border border-indigo-200 rounded-xl p-4 space-y-2">
        <p className="text-xs font-bold text-indigo-900">✈️ {tr("capacityDetails.airbaseTitle")}:</p>
        <div className="text-xs text-indigo-800 space-y-1">
          <div className="flex justify-between"><span>{tr("capacityDetails.stealthFighter")}:</span><span className="font-bold">{formatNumber(jetTemturSilamanCount)} {tr("units.unit")}</span></div>
          <div className="flex justify-between"><span>{tr("capacityDetails.interceptor")}:</span><span className="font-bold">{formatNumber(jetTemturInterceptorCount)} {tr("units.unit")}</span></div>
          <div className="flex justify-between"><span>{tr("capacityDetails.bomber")}:</span><span className="font-bold">{formatNumber(pesawatPengebomCount)} {tr("units.unit")}</span></div>
          <div className="flex justify-between"><span>{tr("capacityDetails.attackHelicopter")}:</span><span className="font-bold">{formatNumber(helikopterSerangCount)} {tr("units.unit")}</span></div>
          <div className="flex justify-between"><span>{tr("capacityDetails.reconAircraft")}:</span><span className="font-bold">{formatNumber(pesawatPengintaiCount)} {tr("units.unit")}</span></div>
          <div className="flex justify-between"><span>{tr("capacityDetails.uav")}:</span><span className="font-bold">{formatNumber(droneIntaiUavCount)} {tr("units.unit")}</span></div>
          <div className="flex justify-between"><span>{tr("capacityDetails.kamikazeDrone")}:</span><span className="font-bold">{formatNumber(droneKamikazeCount)} {tr("units.unit")}</span></div>
          <div className="flex justify-between"><span>{tr("capacityDetails.transportAircraft")}:</span><span className="font-bold">{formatNumber(pesawatAngkutCount)} {tr("units.unit")}</span></div>
          <div className="flex justify-between"><span>{tr("capacityDetails.totalAircraft")}:</span><span className="font-bold">{formatNumber(totalPesawat)} {tr("units.unit")}</span></div>
          <div className="flex justify-between"><span>{tr("capacityDetails.airbaseCount")}:</span><span className="font-bold">{formatNumber(currentPangkalanUdaraCount)} {tr("units.unit")}</span></div>
          <div className="flex justify-between border-t border-indigo-200 pt-1 mt-1"><span>{tr("capacityDetails.totalCapacity")}:</span><span className="font-bold text-indigo-900">{formatNumber(maxPangkalan)} {tr("units.unit")}</span></div>
          <div className="flex justify-between"><span>{tr("capacityDetails.remainingCapacity")}:</span><span className={`font-bold ${remaining <= 0 ? 'text-rose-600' : 'text-emerald-600'}`}>{formatNumber(Math.max(0, remaining))} {tr("units.unit")}</span></div>
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
      alert(tr("confirmation.enterQuantity"));
      return;
    }
    if (capacityType !== "infanteri" && !isAnggaranCukup) {
      alert(tr("confirmation.errorBudget"));
      return;
    }
    onConfirm(buildAmount);
  };

  const modal = (
    <NotebookModalWrapper
      onClose={onClose}
      zIndexClass="z-[70]"
      contentSized={true}
      frameClassName="menu-info-content-sized-frame"
    >
      <div className={`root-modal-util-b74379da23 defense-confirm-modal menu-info-content-sized-dialog ${capacityType === "infanteri" ? "defense-recruitment-confirm-modal" : ""}`}>
        
        <div className="satisfaction-modal-header root-modal-util-9462ce2345">
          <div className="satisfaction-modal-header-main root-modal-util-020752a5a2 no-scrollbar">
            <div className="root-modal-util-08dfbca033">
              <div className="root-modal-util-739d92b232">
                <Hammer aria-hidden="true" className="root-modal-util-d252947d10 text-root-accent" />
              </div>
              <h2 className="root-modal-util-6b4648c53a root-modal-util-c2385a463d">
                {tr("confirmation.title")}
              </h2>
            </div>
          </div>
          <div className="root-modal-util-08dfbca033">
            <RootModalCloseButton onClick={onClose} />
          </div>
        </div>

        {/* Body */}
        <div className="defense-confirm-content min-h-0 flex-1 overflow-y-auto p-4 sm:p-5 lg:p-6 relative z-10 space-y-4 text-xs font-semibold text-root-text custom-scrollbar bg-root-surface">
          {capacityDisplay && (
            <div className="defense-confirm-intro flex justify-end">
              <div className="defense-confirm-capacity text-sm font-black text-root-accent bg-root-canvas px-3 py-1 rounded-lg border border-root-accent/30 shadow-sm">
                {capacityDisplay}
              </div>
            </div>
          )}

          {/* ========== PERINGATAN KAPASITAS PENUH ========== */}
          {capacityFull && (
            <div className="defense-confirm-warning bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl p-4 space-y-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-500/20 text-rose-400 font-black border border-rose-500/40">!</div>
                <div>
                  <p className="text-sm font-black uppercase tracking-wider text-rose-400">
                    {tr("confirmation.capacityFullTitle")}
                  </p>
                  <p className="text-xs leading-relaxed text-root-text mt-1.5">
                    {tr("confirmation.capacityFullWarning", { facility: facilityLabel })}
                  </p>
                  {capacityInfoComponent}
                </div>
              </div>
              <button
                type="button"
                onClick={handleNavigateToInfra}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-root-accent px-4 py-3 text-xs font-black uppercase text-root-canvas transition hover:bg-root-accent/80 cursor-pointer shadow-md"
              >
                {tr("confirmation.openInfrastructure", { facility: facilityLabel })}
              </button>
            </div>
          )}

          {/* PERINGATAN KAS NEGARA TIDAK CUKUP */}
          {!capacityFull && capacityType !== "infanteri" && !isAnggaranCukup && buildAmount > 0 && (
            <div className="defense-confirm-warning bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl p-4 space-y-2 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-500/20 text-rose-400 font-black border border-rose-500/40">!</div>
                <div>
                  <p className="text-sm font-black uppercase tracking-wider text-rose-400">{tr("confirmation.budgetWarningTitle")}</p>
                  <p className="text-xs leading-relaxed text-root-text mt-1">
                    {tr("confirmation.budgetWarning", {
                      total: formatNumber(totalCost),
                      budget: formatNumber(anggaran),
                    })}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ========== INPUT JUMLAH ========== */}
          <div className="defense-confirm-input-card bg-root-canvas border border-root-accent/20 rounded-xl p-4 space-y-3 text-xs text-root-text">
            <label className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="defense-confirm-input-label font-black uppercase tracking-wider text-root-subtle">
                  {tr(capacityType === "infanteri" ? "confirmation.quantityRecruit" : "confirmation.quantityUnits")}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const effectiveMax = getEffectiveMaxBuildable();
                    setBuildAmount(effectiveMax > 0 ? effectiveMax : 0);
                  }}
                  disabled={capacityFull || effectiveMaxBuildable <= 0}
                  className="px-3 py-1 bg-root-surface hover:bg-root-accent/20 text-root-accent text-[10px] font-black uppercase rounded-lg transition-colors cursor-pointer border border-root-accent/30 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {tr("confirmation.maximum")}
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
                className="defense-confirm-amount-input w-full rounded-xl border border-root-accent/30 bg-root-surface px-3.5 py-2.5 text-sm text-root-text focus:outline-none focus:border-root-accent font-bold"
                disabled={capacityFull || effectiveMaxBuildable <= 0}
              />
            </label>
            <p className="defense-confirm-amount-hint text-[10px] text-root-subtle">
              {tr("confirmation.maximumHint", {
                max: formatNumber(Math.max(0, effectiveMaxBuildable)),
                unit: tr(capacityType === "infanteri" ? "units.troops" : "units.unit"),
              })}
            </p>
          </div>

          {/* ========== ESTIMASI WAKTU & TANGGAL SELESAI ========== */}
          {estimatedDays > 0 && !capacityFull && (
            <div className="defense-confirm-estimate bg-root-canvas border border-emerald-500/30 rounded-xl p-3.5 space-y-2 mt-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span>{tr("confirmation.timeEstimate")}</span>
              </div>
              <div className="space-y-1 text-xs text-root-text">
                <div className="flex justify-between">
                  <span className="text-root-subtle">{tr("confirmation.timeNeeded")}:</span>
                  <span className="font-bold text-emerald-400">{formatNumber(estimatedDays)} {tr("confirmation.days")}</span>
                </div>
              </div>
            </div>
          )}

          {/* ========== BIAYA & MATERIAL ========== */}
          <div className="defense-confirm-cost-card bg-root-canvas border border-root-accent/20 rounded-xl p-4 space-y-2.5 text-xs text-root-text">
            {capacityType === "infanteri" ? (
              <div className="flex justify-between font-bold">
                <span className="text-root-subtle">{tr("confirmation.constructionCost")}:</span>
                <span className="text-root-accent font-black">
                  {loadingMetadata ? tr("confirmation.loading") : `${formatNumber(costPerUnit)} NEO`}
                </span>
              </div>
            ) : (
              <>
                <div className="flex justify-between">
                  <span className="text-root-subtle">{tr("confirmation.unitCost")}:</span>
                  <span className="text-root-text font-bold">
                    {loadingMetadata ? tr("confirmation.loading") : `${formatNumber(costPerUnit)} NEO`}
                  </span>
                </div>
                <div className="flex justify-between font-bold">
                  <span className="text-root-subtle">{tr("confirmation.totalCost", { count: formatNumber(buildAmount) })}</span>
                  <span className={isAnggaranCukup ? "text-root-accent font-black" : "text-rose-400 font-black"}>
                    {loadingMetadata ? tr("confirmation.loading") : `${formatNumber(totalCost)} NEO`}
                  </span>
                </div>
              </>
            )}

            {waktuPembangunan !== undefined && capacityType !== "infanteri" && (
              <div className="flex justify-between">
                <span className="text-root-subtle">{tr("confirmation.timePerUnit")}</span>
                <span className="text-root-text font-bold">{formatNumber(waktuPembangunan)} {tr("confirmation.days")}</span>
              </div>
            )}

            {capacityType !== "infanteri" && (
              requirements && requirements.length > 0 ? (
                <div className="space-y-3 text-xs pt-1">
                  <div className="flex items-center justify-between">
                    <div className="font-black uppercase tracking-wider text-root-accent">{tr("confirmation.materials")}</div>
                    <button
                      onClick={() => setShowMaterialGrid(!showMaterialGrid)}
                      className="flex items-center gap-1.5 px-2.5 py-1 bg-root-surface border border-root-accent/30 rounded-lg text-root-subtle hover:text-root-accent transition-all cursor-pointer"
                    >
                      {showMaterialGrid ? (
                        <>
                          <EyeOff className="h-3 w-3" />
                          <span className="text-[9px] font-bold uppercase">{tr("confirmation.hide")}</span>
                        </>
                      ) : (
                        <>
                          <Eye className="h-3 w-3" />
                          <span className="text-[9px] font-bold uppercase">{tr("confirmation.show")}</span>
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
                          onClick={() => onMaterialClick(material.resourceKey, tr(`materials.${material.resourceKey}`))}
                          className={`flex flex-col items-center justify-center rounded-xl p-2.5 min-h-[50px] cursor-pointer border transition-all ${
                            isStockZero ? 'border-rose-500/40 bg-rose-500/10 text-rose-300 hover:border-rose-500' : 'border-root-accent/30 bg-root-surface hover:border-root-accent'
                          }`}
                        >
                          <div className="font-bold text-[10px] text-center text-root-text">{tr(`materials.${material.resourceKey}`)}</div>
                          {material.amount !== undefined && (
                            <div className="text-[9px] uppercase tracking-wider text-root-subtle mt-1">
                              x{material.amount}
                            </div>
                          )}
                          <div className={`text-[10px] font-black mt-0.5 ${isStockZero ? 'text-rose-400' : 'text-emerald-400'}`}>
                            {formatNumber(stock)}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-root-subtle">{tr("confirmation.noMaterials")}</div>
              )
            )}
          </div>



        </div>

        {/* Footer */}
        <div className="defense-confirm-footer p-4 bg-root-canvas border-t border-root-accent/20 flex gap-3 relative z-10 shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-root-accent/30 text-root-subtle bg-root-surface hover:text-root-accent hover:border-root-accent text-xs font-black uppercase cursor-pointer transition-all text-center shadow-sm"
          >
            {tr("confirmation.cancel")}
          </button>
          <button
            onClick={handleConfirmClick}
            disabled={capacityFull || buildAmount <= 0 || (capacityType !== "infanteri" && (hasMissingMaterials || !isAnggaranCukup || loadingMetadata || isDisabled))}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase transition-all text-center cursor-pointer shadow-md ${
              capacityFull || buildAmount <= 0 ? 'bg-root-surface text-root-subtle border border-root-accent/20 cursor-not-allowed opacity-60' :
              (capacityType !== "infanteri" && (hasMissingMaterials || !isAnggaranCukup || loadingMetadata || isDisabled)) ? 'bg-root-surface text-root-subtle border border-root-accent/20 cursor-not-allowed opacity-60' :
              'bg-root-accent text-root-canvas border border-root-accent hover:bg-root-accent/80'
            }`}
          >
            {capacityFull ? tr("confirmation.capacityFull") :
             buildAmount <= 0 ? tr("confirmation.enterQuantity") :
             capacityType !== "infanteri" && hasMissingMaterials ? tr("confirmation.materialsShortage") :
             capacityType !== "infanteri" && !isAnggaranCukup ? tr("confirmation.insufficientFunds") :
             tr(capacityType === "infanteri" ? "confirmation.startRecruitment" : "confirmation.startConstruction")}
          </button>
        </div>
      </div>
    </NotebookModalWrapper>
  );

  return typeof document === "undefined" ? null : createPortal(modal, document.body);
}