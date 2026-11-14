"use client";
import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import NotebookModalWrapper, { MENU_INFO_MODAL_VISIBILITY_EVENT } from "../../../NotebookModalWrapper";
import RootInfoModalHeader from "@/app/page/root_modals_design_menu/RootInfoModalHeader";
import { isMobilePhone, useViewportMode } from "@/app/hooks/useViewportMode";
import { getInfraCapacityDetails } from "../logic/infraCapacityHelper";
import { rootBorderRadius } from "@/app/page/root_modals_design_menu/rootBorderRadius";
import { rootModalTypography } from "@/app/page/root_modals_design_menu/rootModalTypography";
import {
  getWaktuPembangunanBarakMiliterBonusPercent,
  getWaktuPembangunanGudangSenjataBonusPercent,
  getWaktuPembangunanHangarTankBonusPercent,
  getWaktuPembangunanPangkalanUdaraBonusPercent,
  getWaktuPembangunanPangkalanLautBonusPercent,
  getKapasitasBarakMiliterBonusPercent,
  getKapasitasGudangSenjataBonusPercent,
  getKapasitasHangarTankBonusPercent,
  getKapasitasPangkalanUdaraBonusPercent,
  getKapasitasPangkalanLautBonusPercent,
} from "@/app/page/bonus_logic";

interface InfoInfrastrukturModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedItem: any;
  formatNumber: (value: unknown) => string;
  getNestedValue: (obj: any, key: string) => number;
  countryDetail: any;
}

export default function InfoInfrastrukturModal({
  isOpen,
  onClose,
  selectedItem,
  formatNumber,
  getNestedValue,
  countryDetail,
}: InfoInfrastrukturModalProps) {
  const viewportMode = useViewportMode();
  const useRootPortal = isMobilePhone(viewportMode);

  useEffect(() => {
    if (!isOpen || !selectedItem || !useRootPortal) return;
    window.dispatchEvent(new CustomEvent(MENU_INFO_MODAL_VISIBILITY_EVENT, {
      detail: { isOpen: true },
    }));
    return () => {
      window.dispatchEvent(new CustomEvent(MENU_INFO_MODAL_VISIBILITY_EVENT, {
        detail: { isOpen: false },
      }));
    };
  }, [isOpen, selectedItem, useRootPortal]);

  if (!isOpen || !selectedItem) return null;

  const itemKey = selectedItem?.dataKey || (typeof selectedItem?.key === "string" ? selectedItem.key.replace(/^\d+_/, "") : selectedItem?.key);
  const value = getNestedValue(countryDetail, itemKey);

  const capacityDetail = getInfraCapacityDetails(itemKey, countryDetail);

  let discountPct = 0;
  let capacityBonusPct = 0;
  let waktuResearchTitle = "";
  let capacityResearchTitle = "";

  if (itemKey === "barak") {
    discountPct = getWaktuPembangunanBarakMiliterBonusPercent(countryDetail);
    capacityBonusPct = getKapasitasBarakMiliterBonusPercent(countryDetail);
    waktuResearchTitle = "Pos Pertahanan Perbatasan";
    capacityResearchTitle = "Kapal Korvet Siluman";
  } else if (itemKey === "gudang_senjata") {
    discountPct = getWaktuPembangunanGudangSenjataBonusPercent(countryDetail);
    capacityBonusPct = getKapasitasGudangSenjataBonusPercent(countryDetail);
    waktuResearchTitle = "Senapan Serbu Presisi";
    capacityResearchTitle = "Komando Siber Ofensif";
  } else if (itemKey === "hangar_tank") {
    discountPct = getWaktuPembangunanHangarTankBonusPercent(countryDetail);
    capacityBonusPct = getKapasitasHangarTankBonusPercent(countryDetail);
    waktuResearchTitle = "Tank Tempur Komposit";
    capacityResearchTitle = "Artileri Roket Otonom";
  } else if (itemKey === "pangkalan_udara") {
    discountPct = getWaktuPembangunanPangkalanUdaraBonusPercent(countryDetail);
    capacityBonusPct = getKapasitasPangkalanUdaraBonusPercent(countryDetail);
    waktuResearchTitle = "Drone Pengintai Taktis";
    capacityResearchTitle = "Kapal Selam Modern";
  } else if (itemKey === "pangkalan_laut") {
    discountPct = getWaktuPembangunanPangkalanLautBonusPercent(countryDetail);
    capacityBonusPct = getKapasitasPangkalanLautBonusPercent(countryDetail);
    waktuResearchTitle = "Radar Pesisir Pantai";
    capacityResearchTitle = "Helikopter Tempur";
  }

  const bonusParts: string[] = [];
  if (discountPct > 0) {
    bonusParts.push(`Waktu Pembangunan berkurang ${discountPct}% oleh bonus penelitian ${waktuResearchTitle}`);
  }
  if (capacityBonusPct > 0) {
    bonusParts.push(`Kapasitas bertambah ${capacityBonusPct}% oleh bonus penelitian ${capacityResearchTitle}`);
  }

  const rawWaktu = Number(selectedItem?.waktu_pembangunan) || 0;
  const effectiveWaktu = discountPct > 0 ? Math.max(1, Math.floor(rawWaktu * (1 - discountPct / 100))) : rawWaktu;

  if (typeof document === "undefined") return null;

  const modal = (
    <NotebookModalWrapper
      onClose={onClose}
      zIndexClass={useRootPortal ? "z-[200]" : undefined}
      hideWhenInfoModalOpen={!useRootPortal}
    >
      <div className="root-modal-util-b74379da23 defense-unit-info-modal">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,255,170,0.03)_0%,transparent_100%)] pointer-events-none" />

        <RootInfoModalHeader
          title={selectedItem?.label ?? ""}
          titleId="defense-unit-info-title"
          onClose={onClose}
          size="standard"
        />

        {/* Body */}
        <div className={`defense-unit-info-content min-h-0 flex-1 overflow-y-auto p-4 sm:p-5 bg-root-surface relative z-10 space-y-4 custom-scrollbar ${rootModalTypography.body}`}>
          {bonusParts.length > 0 && (
            <div className={`border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs font-bold text-emerald-300 ${rootBorderRadius.card}`}>
              Infrastruktur ini ditingkatkan: {bonusParts.join(" dan ")}.
            </div>
          )}
          {selectedItem?.deskripsi && (
            <div className={`defense-unit-info-card bg-root-canvas p-4 border border-root-accent/20 ${rootBorderRadius.card}`}>
              <p className="defense-unit-info-label text-[12px] font-bold text-root-subtle mb-1">Deskripsi</p>
              <p className="text-sm font-semibold text-root-text">{selectedItem.deskripsi}</p>
            </div>
          )}

          <div className="defense-unit-info-metrics grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className={`defense-unit-info-card bg-root-canvas p-4 border border-root-accent/20 ${rootBorderRadius.card}`}>
              <p className="defense-unit-info-label text-sm font-bold text-root-subtle mb-1">Jumlah Fasilitas</p>
              <p className="defense-unit-info-value text-xl font-black text-root-text">
                {formatNumber(value)} unit
              </p>
            </div>

            {capacityDetail && (
              <div className={`defense-unit-info-card bg-root-canvas p-4 border border-root-accent/20 ${rootBorderRadius.card}`}>
                <p className="defense-unit-info-label text-sm font-bold text-root-subtle mb-1">Status Kapasitas Terpakai</p>
                <p className={`defense-unit-info-value text-xl font-black ${capacityDetail.isFull ? "text-rose-400" : "text-root-accent"}`}>
                  {formatNumber(capacityDetail.used)} / {formatNumber(capacityDetail.totalCapacity)}
                </p>
                <div className="text-[10px] text-root-subtle mt-1 flex items-center gap-1 flex-wrap font-medium">
                  {capacityDetail.capacityBonusPct > 0 ? (
                    <>
                      <span>(</span>
                      <span className="text-red-400 line-through">{formatNumber(capacityDetail.baseCapacityPerUnit)}</span>
                      <span className="text-root-accent font-bold">{formatNumber(capacityDetail.capacityPerUnit)}</span>
                      <span>{capacityDetail.unitLabel} / 1 {selectedItem?.label})</span>
                      <span className="text-root-accent font-bold bg-root-surface px-1.5 py-0.5 rounded border border-root-accent/30">
                        +{capacityDetail.capacityBonusPct}% Riset
                      </span>
                    </>
                  ) : (
                    <span>
                      ({formatNumber(capacityDetail.capacityPerUnit)} {capacityDetail.unitLabel} / 1 {selectedItem?.label})
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {capacityDetail && capacityDetail.supportedUnits && capacityDetail.supportedUnits.length > 0 && (
            <div className={`defense-unit-info-card bg-root-canvas p-4 border border-root-accent/20 ${rootBorderRadius.card}`}>
              <p className="defense-unit-info-label text-[12px] font-bold text-root-accent uppercase tracking-wider mb-2">
                🛡️ Jenis Armada yang Ditampung:
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {capacityDetail.supportedUnits.map((unitName, index) => (
                  <li key={index} className="flex items-center gap-2 bg-root-surface px-3 py-1.5 rounded-lg border border-root-accent/10 text-white font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-root-accent"></span>
                    {unitName}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="defense-unit-info-power-grid grid grid-cols-2 gap-4">
            <div className={`defense-unit-info-card bg-root-canvas p-4 border border-root-accent/20 ${rootBorderRadius.card}`}>
              <p className="defense-unit-info-label text-[12px] font-bold text-root-subtle mb-1">Biaya Pembangunan</p>
              <p className="defense-unit-info-value text-base font-black text-root-accent">
                {formatNumber(selectedItem?.biaya_pembangunan)} NEO
              </p>
            </div>
            <div className="defense-unit-info-card bg-root-canvas p-4 rounded-xl border border-root-accent/20">
              <p className="defense-unit-info-label text-[12px] font-bold text-root-subtle mb-1">Waktu Pembangunan</p>
              {discountPct > 0 ? (
                <div className="defense-unit-info-value flex items-center gap-2 text-base font-black">
                  <span className="text-red-400 line-through text-sm">{rawWaktu} Hari</span>
                  <span className="text-root-accent">{effectiveWaktu} Hari</span>
                </div>
              ) : (
                <p className="defense-unit-info-value text-base font-black text-white">
                  {rawWaktu} Hari
                </p>
              )}
            </div>
          </div>
        </div>

      </div>
    </NotebookModalWrapper>
  );

  return useRootPortal ? createPortal(modal, document.body) : modal;
}