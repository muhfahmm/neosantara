"use client";

import RootConstructionConfirmationModal from "@/app/page/root_modals_design_menu/RootConstructionConfirmationModal";
import { HANGAR_TANK_CAPACITY } from "../logic/2_hangar_tank_logic";
import { GUDANG_SENJATA_CAPACITY } from "../logic/3_gudang_senjata_logic";
import { PANGKALAN_LAUT_CAPACITY } from "../logic/4_pangkalan_laut_logic";
import { PANGKALAN_UDARA_CAPACITY } from "../logic/5_pangkalan_udara_logic";
import type { KonfirmasiPembangunanModalProps } from "../construction_support/konfirmasi_pembangunan_types";
import {
  getWaktuPembangunanBarakMiliterBonusPercent,
  getWaktuPembangunanGudangSenjataBonusPercent,
  getWaktuPembangunanHangarTankBonusPercent,
  getWaktuPembangunanPangkalanUdaraBonusPercent,
  getWaktuPembangunanPangkalanLautBonusPercent,
  getKapasitasGudangSenjataBonusPercent,
  getKapasitasHangarTankBonusPercent,
  getKapasitasPangkalanUdaraBonusPercent,
  getKapasitasPangkalanLautBonusPercent,
} from "@/app/page/bonus_logic";
import { calculateMaxBuildQuantity } from "@/app/page/navigasi_menu/2_navigasi_bawah/5_pembangunan/build_logic/build_logic";

export default function KonfirmasiInfrastrukturModal({
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
  countryDetail,
  selectedBuildingKey,
}: KonfirmasiPembangunanModalProps) {
  let capacityDisplay = "";
  switch (capacityType) {
    case "infanteri":
      capacityDisplay = `${currentCapacity.toLocaleString("id-ID", { maximumFractionDigits: 2 })} / ${maxCapacity.toLocaleString("id-ID", { maximumFractionDigits: 2 })}`;
      break;
    case "hangar_tank": {
      const totalVehicles = currentTankCount + currentApcCount;
      const effectiveCapacity = Math.round(
        HANGAR_TANK_CAPACITY *
          (1 + getKapasitasHangarTankBonusPercent(countryDetail) / 100)
      );
      capacityDisplay = `${totalVehicles.toLocaleString("id-ID", { maximumFractionDigits: 2 })} / ${(currentHangarCount * effectiveCapacity).toLocaleString("id-ID", { maximumFractionDigits: 2 })}`;
      break;
    }
    case "gudang_senjata": {
      const totalWeapons =
        currentArtileriCount +
        currentRoketCount +
        currentPertahanUdaraCount +
        currentKendaraanTaktisCount;
      const effectiveCapacity = Math.round(
        GUDANG_SENJATA_CAPACITY *
          (1 + getKapasitasGudangSenjataBonusPercent(countryDetail) / 100)
      );
      capacityDisplay = `${totalWeapons.toLocaleString("id-ID", { maximumFractionDigits: 2 })} / ${(currentGudangCount * effectiveCapacity).toLocaleString("id-ID", { maximumFractionDigits: 2 })}`;
      break;
    }
    case "pangkalan_laut": {
      const totalShips =
        kapalIndukCount +
        kapalIndukNuklirCount +
        kapalDestroyerCount +
        kapalKorvetCount +
        kapalSelamNuklirCount +
        kapalSelamRegulerCount +
        kapalRanjauCount +
        kapalLogistikCount;
      const effectiveCapacity = Math.round(
        PANGKALAN_LAUT_CAPACITY *
          (1 + getKapasitasPangkalanLautBonusPercent(countryDetail) / 100)
      );
      capacityDisplay = `${totalShips.toLocaleString("id-ID", { maximumFractionDigits: 2 })} / ${(currentPangkalanLautCount * effectiveCapacity).toLocaleString("id-ID", { maximumFractionDigits: 2 })}`;
      break;
    }
    case "pangkalan_udara": {
      const totalAircraft =
        jetTemturSilamanCount +
        jetTemturInterceptorCount +
        pesawatPengebomCount +
        helikopterSerangCount +
        pesawatPengintaiCount +
        droneIntaiUavCount +
        droneKamikazeCount +
        pesawatAngkutCount;
      const effectiveCapacity = Math.round(
        PANGKALAN_UDARA_CAPACITY *
          (1 + getKapasitasPangkalanUdaraBonusPercent(countryDetail) / 100)
      );
      capacityDisplay = `${totalAircraft.toLocaleString("id-ID", { maximumFractionDigits: 2 })} / ${(currentPangkalanUdaraCount * effectiveCapacity).toLocaleString("id-ID", { maximumFractionDigits: 2 })}`;
      break;
    }
  }

  let constructionDiscountPercent = 0;
  if (selectedBuildingKey === "barak" || capacityType === "infanteri") {
    constructionDiscountPercent =
      getWaktuPembangunanBarakMiliterBonusPercent(countryDetail);
  } else if (selectedBuildingKey === "gudang_senjata" || capacityType === "gudang_senjata") {
    constructionDiscountPercent =
      getWaktuPembangunanGudangSenjataBonusPercent(countryDetail);
  } else if (selectedBuildingKey === "hangar_tank" || capacityType === "hangar_tank") {
    constructionDiscountPercent =
      getWaktuPembangunanHangarTankBonusPercent(countryDetail);
  } else if (selectedBuildingKey === "pangkalan_udara" || capacityType === "pangkalan_udara") {
    constructionDiscountPercent =
      getWaktuPembangunanPangkalanUdaraBonusPercent(countryDetail);
  } else if (selectedBuildingKey === "pangkalan_laut" || capacityType === "pangkalan_laut") {
    constructionDiscountPercent =
      getWaktuPembangunanPangkalanLautBonusPercent(countryDetail);
  }

  const rawTimePerBuilding =
    waktuPembangunan !== undefined && constructionDiscountPercent > 0
      ? waktuPembangunan * (1 - constructionDiscountPercent / 100)
      : waktuPembangunan;
  const effectiveTimePerBuilding =
    rawTimePerBuilding !== undefined && constructionDiscountPercent > 0
      ? Math.max(1, Math.floor(rawTimePerBuilding))
      : waktuPembangunan;
  const maxQuantity = calculateMaxBuildQuantity(
    cost,
    anggaran,
    requirements,
    materialStocks
  );

  return (
    <RootConstructionConfirmationModal
      isOpen={isOpen}
      onClose={onClose}
      title="Pembangunan Infrastruktur Militer"
      capacityDisplay={capacityDisplay}
      cost={cost}
      budget={anggaran}
      requirements={requirements}
      materialStocks={materialStocks}
      maxQuantity={maxQuantity}
      onConfirm={onConfirm}
      onMaterialClick={onMaterialClick}
      loading={loadingMetadata}
      disabled={isDisabled}
      quantityAction={() => (
        <button
          type="button"
          onClick={() => {
            localStorage.clear();
            sessionStorage.clear();
            window.location.href = window.location.href;
          }}
          className="shrink-0 cursor-pointer rounded-xl border border-root-accent/20 bg-[#1A3838] px-4 py-2 text-[10px] font-black uppercase text-root-subtle shadow-sm transition-all hover:bg-[#254D4D] hover:shadow-md"
        >
          Reset
        </button>
      )}
      detailContent={(quantity) => (
        <>
          {waktuPembangunan !== undefined && (
            <>
              <div className="flex justify-between gap-3">
                <span className="text-root-muted">Estimasi Waktu Pembangunan per bangunan:</span>
                <span className="flex items-center gap-2 font-semibold">
                  {constructionDiscountPercent > 0 && (
                    <span className="text-red-400 line-through text-xs">{waktuPembangunan} Hari</span>
                  )}
                  <span className={constructionDiscountPercent > 0 ? "text-root-accent" : "text-root-text"}>
                    {effectiveTimePerBuilding} Hari
                  </span>
                </span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-root-muted">Estimasi Waktu Pembangunan Total:</span>
                <span className="flex items-center gap-2 font-semibold">
                  {constructionDiscountPercent > 0 && (
                    <span className="text-red-400 line-through text-xs">
                      {waktuPembangunan * quantity} Hari
                    </span>
                  )}
                  <span className={constructionDiscountPercent > 0 ? "text-root-accent" : "text-root-text"}>
                    {effectiveTimePerBuilding !== undefined
                      ? effectiveTimePerBuilding * quantity
                      : 0} Hari
                  </span>
                </span>
              </div>
            </>
          )}
          {produksiPerHari !== undefined && (
            <div className="flex justify-between gap-3">
              <span className="text-root-muted">Produksi {produksiLabel || ""} per hari:</span>
              <span className="font-bold text-root-accent">
                +{produksiPerHari.toLocaleString("id-ID", { maximumFractionDigits: 2 })}
              </span>
            </div>
          )}
          {dampakKepuasan !== undefined && (
            <div className="flex justify-between gap-3">
              <span className="text-root-muted">Dampak ke Kepuasan:</span>
              <span className="font-bold text-root-accent">+{dampakKepuasan.toFixed(1)}</span>
            </div>
          )}
        </>
      )}
      showCurrentBalance={false}
    />
  );
}
