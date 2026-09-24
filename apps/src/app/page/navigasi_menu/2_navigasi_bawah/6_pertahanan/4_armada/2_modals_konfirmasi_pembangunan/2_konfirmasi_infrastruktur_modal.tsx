"use client";
import React, { useState } from "react";
import { X, Hammer, Eye, EyeOff } from "lucide-react";
import { BARAK_TO_SOLDIERS_MULTIPLIER } from "../logic/1_barak_logic";
import { HANGAR_TANK_CAPACITY } from "../logic/2_hangar_tank_logic";
import { GUDANG_SENJATA_CAPACITY } from "../logic/3_gudang_senjata_logic";
import { PANGKALAN_LAUT_CAPACITY } from "../logic/4_pangkalan_laut_logic";
import { PANGKALAN_UDARA_CAPACITY } from "../logic/5_pangkalan_udara_logic";
import { KonfirmasiPembangunanModalProps } from "../requirements_logic/konfirmasi_pembangunan_types";

export default function KonfirmasiInfrastrukturModal({
  isOpen,
  onClose,
  buildingLabel,
  buildingDescription,
  cost,
  waktuPembangunan,
  dampakKepuasan,
  produksiPerHari,
  produksiLabel,
  konsumsiListrik,
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
}: KonfirmasiPembangunanModalProps) {
  const [showMaterialGrid, setShowMaterialGrid] = useState(true);
  const [buildQuantity, setBuildQuantity] = useState<number>(1);
  const [selectedMaterialKey, setSelectedMaterialKey] = useState<string | null>(null);

  // Reset selection when modal opens/closes
  React.useEffect(() => {
    if (!isOpen) {
      setSelectedMaterialKey(null);
      setBuildQuantity(1);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const totalCost = cost * buildQuantity;
  const totalTime = waktuPembangunan !== undefined ? waktuPembangunan * buildQuantity : undefined;
  const hasMissingMaterials = missingMaterials.length > 0;
  const isAnggaranCukup = anggaran >= totalCost;

  // 🔥 LOGIC KAPASITAS INFANTERI
  let infanteriCapacityFull = false;
  let infanteriCapacityDisplay = "";
  let infanteriWarningText = "";
  
  if (capacityType === "infanteri") {
    const isInfanteriPenuh = currentCapacity >= maxCapacity;
    infanteriCapacityFull = currentBarakCount > 0 && isInfanteriPenuh;
    infanteriCapacityDisplay = `${currentCapacity.toLocaleString('id-ID')} / ${maxCapacity.toLocaleString('id-ID')}`;
    infanteriWarningText = `Kapasitas Infanteri sudah penuh (${maxCapacity.toLocaleString('id-ID')} pasukan). Anda harus membangun Barak baru untuk menambah Infanteri lebih banyak.`;
  }

  // 🔥 LOGIC KAPASITAS HANGAR TANK
  let hangarTankCapacityFull = false;
  let hangarTankCapacityDisplay = "";
  let hangarTankWarningText = "";
  
  if (capacityType === "hangar_tank") {
    const totalVehicles = currentTankCount + currentApcCount;
    const maxHangarCapacity = currentHangarCount * HANGAR_TANK_CAPACITY;
    const isHangarPenuh = totalVehicles >= maxHangarCapacity;
    hangarTankCapacityFull = currentHangarCount > 0 && isHangarPenuh;
    hangarTankCapacityDisplay = `${totalVehicles.toLocaleString('id-ID')} / ${maxHangarCapacity.toLocaleString('id-ID')}`;
    hangarTankWarningText = `Kapasitas Hangar Tank sudah penuh (${currentHangarCount} hangar × ${HANGAR_TANK_CAPACITY.toLocaleString('id-ID')} = ${maxHangarCapacity.toLocaleString('id-ID')} unit). Anda harus membangun Hangar Tank baru untuk menambah Tank/APC lebih banyak.`;
  }

  // 🔥 LOGIC KAPASITAS GUDANG SENJATA
  let gudangSenjataCapacityFull = false;
  let gudangSenjataCapacityDisplay = "";
  let gudangSenjataCapacityWarningText = "";
  
  if (capacityType === "gudang_senjata") {
    const totalWeapons = currentArtileriCount + currentRoketCount + currentPertahanUdaraCount + currentKendaraanTaktisCount;
    const maxGudangCapacity = currentGudangCount * GUDANG_SENJATA_CAPACITY;
    const isGudangPenuh = totalWeapons >= maxGudangCapacity;
    gudangSenjataCapacityFull = currentGudangCount > 0 && isGudangPenuh;
    gudangSenjataCapacityDisplay = `${totalWeapons.toLocaleString('id-ID')} / ${maxGudangCapacity.toLocaleString('id-ID')}`;
    gudangSenjataCapacityWarningText = `Kapasitas Gudang Senjata sudah penuh (${currentGudangCount} gudang × ${GUDANG_SENJATA_CAPACITY.toLocaleString('id-ID')} = ${maxGudangCapacity.toLocaleString('id-ID')} unit). Anda harus membangun Gudang Senjata baru untuk menambah Senjata lebih banyak.`;
  }

  // 🔥 LOGIC KAPASITAS PANGKALAN LAUT
  let pangkalanLautCapacityFull = false;
  let pangkalanLautCapacityDisplay = "";
  let pangkalanLautCapacityWarningText = "";
  
  if (capacityType === "pangkalan_laut") {
    const totalKapal = kapalIndukCount + kapalIndukNuklirCount + kapalDestroyerCount + kapalKorvetCount + 
                       kapalSelamNuklirCount + kapalSelamRegulerCount + kapalRanjauCount + kapalLogistikCount;
    const maxPangkalanLautCapacity = currentPangkalanLautCount * PANGKALAN_LAUT_CAPACITY;
    const isPangkalanLautPenuh = totalKapal >= maxPangkalanLautCapacity;
    pangkalanLautCapacityFull = currentPangkalanLautCount > 0 && isPangkalanLautPenuh;
    pangkalanLautCapacityDisplay = `${totalKapal.toLocaleString('id-ID')} / ${maxPangkalanLautCapacity.toLocaleString('id-ID')}`;
    pangkalanLautCapacityWarningText = `Kapasitas Pangkalan Laut sudah penuh (${currentPangkalanLautCount} pangkalan × ${PANGKALAN_LAUT_CAPACITY.toLocaleString('id-ID')} = ${maxPangkalanLautCapacity.toLocaleString('id-ID')} unit). Anda harus membangun Pangkalan Laut baru untuk menambah Kapal lebih banyak.`;
  }

  // 🔥 LOGIC KAPASITAS PANGKALAN UDARA
  let pangkalanUdaraCapacityFull = false;
  let pangkalanUdaraCapacityDisplay = "";
  let pangkalanUdaraCapacityWarningText = "";
  
  if (capacityType === "pangkalan_udara") {
    const totalPesawat = jetTemturSilamanCount + jetTemturInterceptorCount + pesawatPengebomCount + helikopterSerangCount + 
                         pesawatPengintaiCount + droneIntaiUavCount + droneKamikazeCount + pesawatAngkutCount;
    const maxPangkalanUdaraCapacity = currentPangkalanUdaraCount * PANGKALAN_UDARA_CAPACITY;
    const isPangkalanUdaraPenuh = totalPesawat >= maxPangkalanUdaraCapacity;
    pangkalanUdaraCapacityFull = currentPangkalanUdaraCount > 0 && isPangkalanUdaraPenuh;
    pangkalanUdaraCapacityDisplay = `${totalPesawat.toLocaleString('id-ID')} / ${maxPangkalanUdaraCapacity.toLocaleString('id-ID')}`;
    pangkalanUdaraCapacityWarningText = `Kapasitas Pangkalan Udara sudah penuh (${currentPangkalanUdaraCount} pangkalan × ${PANGKALAN_UDARA_CAPACITY.toLocaleString('id-ID')} = ${maxPangkalanUdaraCapacity.toLocaleString('id-ID')} unit). Anda harus membangun Pangkalan Udara baru untuk menambah Pesawat lebih banyak.`;
  }

  const capacityFull = infanteriCapacityFull || hangarTankCapacityFull || gudangSenjataCapacityFull || pangkalanLautCapacityFull || pangkalanUdaraCapacityFull;
  const capacityDisplay = infanteriCapacityDisplay || hangarTankCapacityDisplay || gudangSenjataCapacityDisplay || pangkalanLautCapacityDisplay || pangkalanUdaraCapacityDisplay;
  const warningText = infanteriWarningText || hangarTankWarningText || gudangSenjataCapacityWarningText || pangkalanLautCapacityWarningText || pangkalanUdaraCapacityWarningText;

  // 🔥 Fungsi kalkulasi jumlah bangunan maksimal
  const calculateMaxBuildings = (): number => {
    let maxByBudget = Math.floor(anggaran / cost);
    if (maxByBudget < 1) return 1;

    // Cek batasan berdasarkan material
    let maxByMaterials = Infinity;
    for (const req of requirements) {
      const availableStock = materialStocks[req.resourceKey] ?? 0;
      const costPerBuilding = req.amount ?? 0;
      if (costPerBuilding > 0) {
        const maxForThisMaterial = Math.floor(availableStock / costPerBuilding);
        maxByMaterials = Math.min(maxByMaterials, maxForThisMaterial);
      }
    }

    if (maxByMaterials === Infinity) {
      maxByMaterials = maxByBudget;
    }

    return Math.max(1, Math.min(maxByBudget, maxByMaterials));
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none">
      <div className="bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans animate-in fade-in zoom-in-95 duration-150 pointer-events-auto shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,255,170,0.03)_0%,transparent_100%)] pointer-events-none" />

        {/* Header */}
        <div className="px-6 py-4 border-b border-[#00FFAA]/20 flex items-center justify-between bg-[#0A1A1A] relative z-10 shrink-0">
          <div className="flex items-center gap-2 text-[#00FFAA]">
            <Hammer className="h-5 w-5" />
            <h3 className="text-base font-bold uppercase tracking-wide">Pembangunan Infrastruktur Militer</h3>
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
        <div className="p-6 relative z-10 flex-1 overflow-y-auto space-y-4 text-[#E0E0E0]">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-lg font-black text-white">{buildingLabel}</h4>
              {capacityDisplay && (
                <div className="text-sm font-black text-[#00FFAA] bg-[#0A1A1A] px-3 py-1 rounded-lg border border-[#00FFAA]/30">
                  {capacityDisplay}
                </div>
              )}
            </div>
            <p className="text-xs text-[#6B8A8A]">{buildingDescription || 'Tidak ada deskripsi tersedia.'}</p>
          </div>

          {/* ================= DETAIL KAPASITAS PER JENIS ================= */}

          {/* 🔵 BARAK / INFANTERI: WARNA HIJAU */}
          {capacityType === "infanteri" && (
            <div className="bg-[#0A1A1A]/80 border border-[#00FFAA]/30 rounded-xl p-4 space-y-2">
              <p className="text-xs font-bold text-[#00FFAA]">📊 Detail Kapasitas Barak:</p>
              <div className="text-xs text-[#E0E0E0] space-y-1">
                <div className="flex justify-between">
                  <span className="text-[#6B8A8A]">Infanteri Saat Ini:</span>
                  <span className="font-bold text-white">{currentCapacity?.toLocaleString('id-ID')} pasukan</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B8A8A]">Jumlah Barak:</span>
                  <span className="font-bold text-white">{currentBarakCount} unit</span>
                </div>
                <div className="flex justify-between border-t border-[#00FFAA]/20 pt-1 mt-1">
                  <span className="text-[#6B8A8A]">Kapasitas Total:</span>
                  <span className="font-bold text-[#00FFAA]">{maxCapacity?.toLocaleString('id-ID')} pasukan</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B8A8A]">Sisa Kapasitas:</span>
                  <span className={`font-bold ${(maxCapacity - currentCapacity) <= 0 ? 'text-rose-400' : 'text-[#00FFAA]'}`}>
                    {Math.max(0, (maxCapacity - currentCapacity))?.toLocaleString('id-ID')} pasukan
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 🟠 HANGAR TANK: WARNA AMBER */}
          {capacityType === "hangar_tank" && (
            <div className="bg-[#0A1A1A]/80 border border-[#00FFAA]/30 rounded-xl p-4 space-y-2">
              <p className="text-xs font-bold text-[#00FFAA]">🚜 Detail Kapasitas Hangar Tank:</p>
              <div className="text-xs text-[#E0E0E0] space-y-1">
                <div className="flex justify-between">
                  <span className="text-[#6B8A8A]">Tank Tempur Utama:</span>
                  <span className="font-bold text-white">{currentTankCount?.toLocaleString('id-ID')} unit</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B8A8A]">APC / IFV:</span>
                  <span className="font-bold text-white">{currentApcCount?.toLocaleString('id-ID')} unit</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B8A8A]">Total Kendaraan:</span>
                  <span className="font-bold text-white">{(currentTankCount + currentApcCount)?.toLocaleString('id-ID')} unit</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B8A8A]">Jumlah Hangar:</span>
                  <span className="font-bold text-white">{currentHangarCount} unit</span>
                </div>
                <div className="flex justify-between border-t border-[#00FFAA]/20 pt-1 mt-1">
                  <span className="text-[#6B8A8A]">Kapasitas Total:</span>
                  <span className="font-bold text-[#00FFAA]">{(currentHangarCount * HANGAR_TANK_CAPACITY)?.toLocaleString('id-ID')} unit</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B8A8A]">Sisa Kapasitas:</span>
                  <span className={`font-bold ${(currentHangarCount * HANGAR_TANK_CAPACITY - currentTankCount - currentApcCount) <= 0 ? 'text-rose-400' : 'text-[#00FFAA]'}`}>
                    {Math.max(0, (currentHangarCount * HANGAR_TANK_CAPACITY - currentTankCount - currentApcCount))?.toLocaleString('id-ID')} unit
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 🟣 GUDANG SENJATA: WARNA UNGU */}
          {capacityType === "gudang_senjata" && (
            <div className="bg-[#0A1A1A]/80 border border-[#00FFAA]/30 rounded-xl p-4 space-y-2">
              <p className="text-xs font-bold text-[#00FFAA]">💣 Detail Kapasitas Gudang Senjata:</p>
              <div className="text-xs text-[#E0E0E0] space-y-1">
                <div className="flex justify-between">
                  <span className="text-[#6B8A8A]">Artileri Berat:</span>
                  <span className="font-bold text-white">{currentArtileriCount?.toLocaleString('id-ID')} unit</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B8A8A]">Sistem Peluncur Roket:</span>
                  <span className="font-bold text-white">{currentRoketCount?.toLocaleString('id-ID')} unit</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B8A8A]">Pertahanan Udara Mobile:</span>
                  <span className="font-bold text-white">{currentPertahanUdaraCount?.toLocaleString('id-ID')} unit</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B8A8A]">Kendaraan Taktis:</span>
                  <span className="font-bold text-white">{currentKendaraanTaktisCount?.toLocaleString('id-ID')} unit</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B8A8A]">Total Senjata:</span>
                  <span className="font-bold text-white">{(currentArtileriCount + currentRoketCount + currentPertahanUdaraCount + currentKendaraanTaktisCount)?.toLocaleString('id-ID')} unit</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B8A8A]">Jumlah Gudang:</span>
                  <span className="font-bold text-white">{currentGudangCount} unit</span>
                </div>
                <div className="flex justify-between border-t border-[#00FFAA]/20 pt-1 mt-1">
                  <span className="text-[#6B8A8A]">Kapasitas Total:</span>
                  <span className="font-bold text-[#00FFAA]">{(currentGudangCount * GUDANG_SENJATA_CAPACITY)?.toLocaleString('id-ID')} unit</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B8A8A]">Sisa Kapasitas:</span>
                  <span className={`font-bold ${(currentGudangCount * GUDANG_SENJATA_CAPACITY - currentArtileriCount - currentRoketCount - currentPertahanUdaraCount - currentKendaraanTaktisCount) <= 0 ? 'text-rose-400' : 'text-[#00FFAA]'}`}>
                    {Math.max(0, (currentGudangCount * GUDANG_SENJATA_CAPACITY - currentArtileriCount - currentRoketCount - currentPertahanUdaraCount - currentKendaraanTaktisCount))?.toLocaleString('id-ID')} unit
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 🔵 PANGKALAN LAUT: WARNA BIRU LANGIT (SKY) */}
          {capacityType === "pangkalan_laut" && (
            <div className="bg-[#0A1A1A]/80 border border-[#00FFAA]/30 rounded-xl p-4 space-y-2">
              <p className="text-xs font-bold text-[#00FFAA]">⚓ Detail Kapasitas Pangkalan Laut:</p>
              <div className="text-xs text-[#E0E0E0] space-y-1">
                <div className="flex justify-between"><span className="text-[#6B8A8A]">Kapal Induk:</span><span className="font-bold text-white">{kapalIndukCount?.toLocaleString('id-ID')} unit</span></div>
                <div className="flex justify-between"><span className="text-[#6B8A8A]">Kapal Induk Nuklir:</span><span className="font-bold text-white">{kapalIndukNuklirCount?.toLocaleString('id-ID')} unit</span></div>
                <div className="flex justify-between"><span className="text-[#6B8A8A]">Kapal Destroyer:</span><span className="font-bold text-white">{kapalDestroyerCount?.toLocaleString('id-ID')} unit</span></div>
                <div className="flex justify-between"><span className="text-[#6B8A8A]">Kapal Korvet:</span><span className="font-bold text-white">{kapalKorvetCount?.toLocaleString('id-ID')} unit</span></div>
                <div className="flex justify-between"><span className="text-[#6B8A8A]">Kapal Selam Nuklir:</span><span className="font-bold text-white">{kapalSelamNuklirCount?.toLocaleString('id-ID')} unit</span></div>
                <div className="flex justify-between"><span className="text-[#6B8A8A]">Kapal Selam Reguler:</span><span className="font-bold text-white">{kapalSelamRegulerCount?.toLocaleString('id-ID')} unit</span></div>
                <div className="flex justify-between"><span className="text-[#6B8A8A]">Kapal Ranjau:</span><span className="font-bold text-white">{kapalRanjauCount?.toLocaleString('id-ID')} unit</span></div>
                <div className="flex justify-between"><span className="text-[#6B8A8A]">Kapal Logistik:</span><span className="font-bold text-white">{kapalLogistikCount?.toLocaleString('id-ID')} unit</span></div>
                <div className="flex justify-between"><span className="text-[#6B8A8A]">Total Kapal:</span><span className="font-bold text-white">{(kapalIndukCount + kapalIndukNuklirCount + kapalDestroyerCount + kapalKorvetCount + kapalSelamNuklirCount + kapalSelamRegulerCount + kapalRanjauCount + kapalLogistikCount)?.toLocaleString('id-ID')} unit</span></div>
                <div className="flex justify-between"><span className="text-[#6B8A8A]">Jumlah Pangkalan:</span><span className="font-bold text-white">{currentPangkalanLautCount} unit</span></div>
                <div className="flex justify-between border-t border-[#00FFAA]/20 pt-1 mt-1">
                  <span className="text-[#6B8A8A]">Kapasitas Total:</span>
                  <span className="font-bold text-[#00FFAA]">{(currentPangkalanLautCount * PANGKALAN_LAUT_CAPACITY)?.toLocaleString('id-ID')} unit</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B8A8A]">Sisa Kapasitas:</span>
                  <span className={`font-bold ${(currentPangkalanLautCount * PANGKALAN_LAUT_CAPACITY - kapalIndukCount - kapalIndukNuklirCount - kapalDestroyerCount - kapalKorvetCount - kapalSelamNuklirCount - kapalSelamRegulerCount - kapalRanjauCount - kapalLogistikCount) <= 0 ? 'text-rose-400' : 'text-[#00FFAA]'}`}>
                    {Math.max(0, (currentPangkalanLautCount * PANGKALAN_LAUT_CAPACITY - kapalIndukCount - kapalIndukNuklirCount - kapalDestroyerCount - kapalKorvetCount - kapalSelamNuklirCount - kapalSelamRegulerCount - kapalRanjauCount - kapalLogistikCount))?.toLocaleString('id-ID')} unit
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 🟦 PANGKALAN UDARA: WARNA INDIGO */}
          {capacityType === "pangkalan_udara" && (
            <div className="bg-[#0A1A1A]/80 border border-[#00FFAA]/30 rounded-xl p-4 space-y-2">
              <p className="text-xs font-bold text-[#00FFAA]">✈️ Detail Kapasitas Pangkalan Udara:</p>
              <div className="text-xs text-[#E0E0E0] space-y-1">
                <div className="flex justify-between"><span className="text-[#6B8A8A]">Jet Tempur Siluman:</span><span className="font-bold text-white">{jetTemturSilamanCount?.toLocaleString('id-ID')} unit</span></div>
                <div className="flex justify-between"><span className="text-[#6B8A8A]">Jet Tempur Interceptor:</span><span className="font-bold text-white">{jetTemturInterceptorCount?.toLocaleString('id-ID')} unit</span></div>
                <div className="flex justify-between"><span className="text-[#6B8A8A]">Pesawat Pengebom:</span><span className="font-bold text-white">{pesawatPengebomCount?.toLocaleString('id-ID')} unit</span></div>
                <div className="flex justify-between"><span className="text-[#6B8A8A]">Helikopter Serang:</span><span className="font-bold text-white">{helikopterSerangCount?.toLocaleString('id-ID')} unit</span></div>
                <div className="flex justify-between"><span className="text-[#6B8A8A]">Pesawat Pengintai:</span><span className="font-bold text-white">{pesawatPengintaiCount?.toLocaleString('id-ID')} unit</span></div>
                <div className="flex justify-between"><span className="text-[#6B8A8A]">Drone Intai UAV:</span><span className="font-bold text-white">{droneIntaiUavCount?.toLocaleString('id-ID')} unit</span></div>
                <div className="flex justify-between"><span className="text-[#6B8A8A]">Drone Kamikaze:</span><span className="font-bold text-white">{droneKamikazeCount?.toLocaleString('id-ID')} unit</span></div>
                <div className="flex justify-between"><span className="text-[#6B8A8A]">Pesawat Angkut:</span><span className="font-bold text-white">{pesawatAngkutCount?.toLocaleString('id-ID')} unit</span></div>
                <div className="flex justify-between"><span className="text-[#6B8A8A]">Total Pesawat:</span><span className="font-bold text-white">{(jetTemturSilamanCount + jetTemturInterceptorCount + pesawatPengebomCount + helikopterSerangCount + pesawatPengintaiCount + droneIntaiUavCount + droneKamikazeCount + pesawatAngkutCount)?.toLocaleString('id-ID')} unit</span></div>
                <div className="flex justify-between"><span className="text-[#6B8A8A]">Jumlah Pangkalan:</span><span className="font-bold text-white">{currentPangkalanUdaraCount} unit</span></div>
                <div className="flex justify-between border-t border-[#00FFAA]/20 pt-1 mt-1">
                  <span className="text-[#6B8A8A]">Kapasitas Total:</span>
                  <span className="font-bold text-[#00FFAA]">{(currentPangkalanUdaraCount * PANGKALAN_UDARA_CAPACITY)?.toLocaleString('id-ID')} unit</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B8A8A]">Sisa Kapasitas:</span>
                  <span className={`font-bold ${(currentPangkalanUdaraCount * PANGKALAN_UDARA_CAPACITY - jetTemturSilamanCount - jetTemturInterceptorCount - pesawatPengebomCount - helikopterSerangCount - pesawatPengintaiCount - droneIntaiUavCount - droneKamikazeCount - pesawatAngkutCount) <= 0 ? 'text-rose-400' : 'text-[#00FFAA]'}`}>
                    {Math.max(0, (currentPangkalanUdaraCount * PANGKALAN_UDARA_CAPACITY - jetTemturSilamanCount - jetTemturInterceptorCount - pesawatPengebomCount - helikopterSerangCount - pesawatPengintaiCount - droneIntaiUavCount - droneKamikazeCount - pesawatAngkutCount))?.toLocaleString('id-ID')} unit
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Panel Biaya & Material */}
          <div className="bg-[#0A1A1A]/60 border border-[#00FFAA]/20 rounded-xl p-4 space-y-2.5 text-xs text-[#E0E0E0]">
            <div className="flex justify-between font-bold">
              <span className="text-[#6B8A8A]">Biaya Pembangunan (Total):</span>
              <span className="text-[#00FFAA]">
                {loadingMetadata ? 'Memuat...' : `${totalCost.toLocaleString('id-ID')} EM`}
              </span>
            </div>
            <div className="flex justify-between text-xs text-[#6B8A8A]">
              <span>Biaya per bangunan:</span>
              <span className="text-white">{cost.toLocaleString('id-ID')} EM</span>
            </div>

            <div className="bg-[#0A1A1A] border border-[#00FFAA]/30 rounded-xl p-4 mt-3 text-xs text-[#E0E0E0]">
              <label className="flex flex-col gap-2">
                <span className="font-black uppercase tracking-[0.2em] text-[#00FFAA]">Jumlah Bangunan</span>
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    min={1}
                    step={1}
                    value={buildQuantity}
                    onChange={(event) => {
                      const value = Number(event.target.value);
                      setBuildQuantity(Number.isFinite(value) ? Math.max(1, Math.floor(value)) : 1);
                    }}
                    className="flex-1 rounded-xl border border-[#00FFAA]/40 bg-[#0F2424] px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#00FFAA]"
                  />
                  <button
                    type="button"
                    onClick={() => setBuildQuantity(calculateMaxBuildings())}
                    className="px-4 py-2 rounded-xl bg-[#00FFAA] hover:bg-[#00FFAA]/80 text-[#0A1A1A] text-[10px] font-black uppercase cursor-pointer transition-all shadow-sm hover:shadow-md"
                  >
                    Maks
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      localStorage.clear();
                      sessionStorage.clear();
                      window.location.href = window.location.href;
                    }}
                    className="px-4 py-2 rounded-xl bg-[#1A3838] hover:bg-[#254D4D] text-[#6B8A8A] border border-[#00FFAA]/20 text-[10px] font-black uppercase cursor-pointer transition-all shadow-sm hover:shadow-md"
                  >
                    Reset
                  </button>
                </div>
              </label>
            </div>

            {waktuPembangunan !== undefined && (
              <>
                <div className="flex justify-between">
                  <span className="text-[#6B8A8A]">Estimasi Waktu Pembangunan per bangunan:</span>
                  <span className="text-white font-semibold">{waktuPembangunan} Hari</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B8A8A]">Estimasi Waktu Pembangunan Total:</span>
                  <span className="text-white font-semibold">{totalTime} Hari</span>
                </div>
              </>
            )}

            {produksiPerHari !== undefined && (
              <div className="flex justify-between">
                <span className="text-[#6B8A8A]">Produksi {produksiLabel || ''} per hari:</span>
                <span className="text-[#00FFAA] font-bold">+{produksiPerHari.toLocaleString('id-ID')}</span>
              </div>
            )}

            {dampakKepuasan !== undefined && (
              <div className="flex justify-between">
                <span className="text-[#6B8A8A]">Dampak ke Kepuasan:</span>
                <span className="text-[#00FFAA] font-bold">+{dampakKepuasan.toFixed(1)}</span>
              </div>
            )}

            {/* Kondisional Listrik */}
            {konsumsiListrik !== undefined && konsumsiListrik !== null && (
              <>
                <div className="flex justify-between">
                  <span className="text-[#6B8A8A]">Konsumsi Listrik per bangunan:</span>
                  <span className="text-white font-semibold">{konsumsiListrik} MW</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B8A8A]">Konsumsi Listrik Total ({buildQuantity} unit):</span>
                  <span className="text-white font-semibold">{(konsumsiListrik * buildQuantity).toFixed(4).replace(/\.?0+$/, '')} MW</span>
                </div>
              </>
            )}

            {requirements && requirements.length > 0 ? (
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <div className="font-black uppercase tracking-[0.2em] text-[#00FFAA]">Material Dibutuhkan</div>
                  <button
                    onClick={() => setShowMaterialGrid(!showMaterialGrid)}
                    className="flex items-center gap-1.5 px-2 py-1 bg-[#0A1A1A] border border-[#00FFAA]/30 rounded-lg text-[#00FFAA] hover:bg-[#00FFAA]/10 transition-all cursor-pointer"
                  >
                    {showMaterialGrid ? (
                      <>
                        <EyeOff className="h-3 w-3" />
                        <span className="text-[8px] font-bold uppercase">Sembunyikan</span>
                      </>
                    ) : (
                      <>
                        <Eye className="h-3 w-3" />
                        <span className="text-[8px] font-bold uppercase">Tampilkan</span>
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
                    const requiredAmount = (material.amount ?? 0) * buildQuantity;
                    const materialKey = `${material.resourceKey}-${material.group}`;
                    const isSelected = selectedMaterialKey === materialKey;

                    return (
                      <button
                        key={materialKey}
                        type="button"
                        onClick={() => {
                          setSelectedMaterialKey(materialKey);
                          onMaterialClick(material.resourceKey, material.label);
                        }}
                        className={`flex flex-col items-center justify-center border rounded-xl p-2.5 min-h-[50px] cursor-pointer hover:border-[#00FFAA] transition-all ${
                          isSelected
                            ? 'border-[#00FFAA] bg-[#00FFAA]/10 text-white'
                            : isStockZero
                            ? 'border-red-500/50 bg-red-950/30 text-red-300'
                            : 'border-[#00FFAA]/30 bg-[#0A1A1A] text-white'
                        }`}
                      >
                        <div className="font-bold text-[10px] text-center">{material.label}</div>
                        {material.amount !== undefined && (
                          <div className="text-[9px] uppercase tracking-[0.15em] text-[#6B8A8A] mt-1">
                            x{requiredAmount.toLocaleString('id-ID')}
                          </div>
                        )}
                        <div className={`text-[10px] font-black mt-0.5 ${isStockZero ? 'text-red-400' : 'text-[#00FFAA]'}`}>
                          {stock.toLocaleString('id-ID')}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-[#6B8A8A]">Tidak ada material yang dibutuhkan untuk bangunan ini.</div>
            )}
          </div>

          <div className="flex justify-between items-center text-xs font-black text-[#E0E0E0] pt-1">
            <span className="text-[#6B8A8A]">Kas Negara Saat Ini:</span>
            <span className="text-[#00FFAA] font-bold">{anggaran.toLocaleString('id-ID')} EM</span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#0A1A1A] border-t border-[#00FFAA]/20 flex gap-3 relative z-10 shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] text-[#6B8A8A] hover:text-white text-[10px] font-black uppercase cursor-pointer hover:bg-[#1A3838] transition-all text-center"
          >
            Batal
          </button>
          <button
            onClick={() => onConfirm(buildQuantity)}
            disabled={loadingMetadata || hasMissingMaterials || !isAnggaranCukup || isDisabled || buildQuantity <= 0}
            className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all text-center cursor-pointer ${
              hasMissingMaterials || !isAnggaranCukup || loadingMetadata || isDisabled
                ? 'bg-[#1A3838] text-[#6B8A8A] border border-[#00FFAA]/10 cursor-not-allowed opacity-60'
                : 'bg-[#00FFAA] text-[#0A1A1A] font-extrabold hover:bg-[#00FFAA]/90 hover:shadow-lg shadow-[#00FFAA]/20'
            }`}
          >
            {hasMissingMaterials ? 'Material Kurang' : !isAnggaranCukup ? 'Dana Tidak Cukup' : 'Mulai Pembangunan'}
          </button>
        </div>
      </div>
    </div>
  );
}