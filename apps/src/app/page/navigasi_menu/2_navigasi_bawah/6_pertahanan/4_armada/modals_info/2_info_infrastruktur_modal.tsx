"use client";
import React from "react";
import { X } from "lucide-react";
import { getInfraCapacityDetails } from "../logic/infraCapacityHelper";
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

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none">
      <div className="bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-145px)] flex flex-col relative font-sans animate-in fade-in zoom-in-95 duration-150 pointer-events-auto shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,255,170,0.03)_0%,transparent_100%)] pointer-events-none" />

        {/* Header */}
        <div className="px-6 py-4 border-b border-[#00FFAA]/30 flex items-center justify-between bg-[#0A1A1A] relative z-10 shrink-0">
          <h3 className="font-black text-[#00FFAA] uppercase tracking-wider text-xl">{selectedItem?.label}</h3>
          <button 
            onClick={onClose} 
            className="p-2 sm:p-2.5 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] text-[#6B8A8A] hover:text-[#00FFAA] hover:border-[#00FFAA] transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1.5 shadow-sm"
          >
            <span className="text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#0F2424] relative z-10 space-y-4 text-xs font-semibold text-[#E0E0E0] custom-scrollbar">
          {bonusParts.length > 0 && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs font-bold text-emerald-300">
              Infrastruktur ini ditingkatkan: {bonusParts.join(" dan ")}.
            </div>
          )}
          {selectedItem?.deskripsi && (
            <div className="bg-[#0A1A1A] p-4 rounded-xl border border-[#00FFAA]/20">
              <p className="text-[12px] font-bold text-[#6B8A8A] mb-1">Deskripsi</p>
              <p className="text-sm font-semibold text-[#E0E0E0]">{selectedItem.deskripsi}</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#0A1A1A] p-4 rounded-xl border border-[#00FFAA]/20">
              <p className="text-[12px] font-bold text-[#6B8A8A] mb-1">Jumlah Fasilitas</p>
              <p className="text-xl font-black text-white">
                {formatNumber(value)} unit
              </p>
            </div>

            {capacityDetail && (
              <div className="bg-[#0A1A1A] p-4 rounded-xl border border-[#00FFAA]/20">
                <p className="text-[12px] font-bold text-[#6B8A8A] mb-1">Status Kapasitas Terpakai</p>
                <p className={`text-xl font-black ${capacityDetail.isFull ? "text-rose-400" : "text-[#00FFAA]"}`}>
                  {formatNumber(capacityDetail.used)} / {formatNumber(capacityDetail.totalCapacity)}
                </p>
                <div className="text-[10px] text-[#6B8A8A] mt-1 flex items-center gap-1 flex-wrap font-medium">
                  {capacityDetail.capacityBonusPct > 0 ? (
                    <>
                      <span>(</span>
                      <span className="text-red-400 line-through">{formatNumber(capacityDetail.baseCapacityPerUnit)}</span>
                      <span className="text-[#00FFAA] font-bold">{formatNumber(capacityDetail.capacityPerUnit)}</span>
                      <span>{capacityDetail.unitLabel} / 1 {selectedItem?.label})</span>
                      <span className="text-[#00FFAA] font-bold bg-[#0F2424] px-1.5 py-0.5 rounded border border-[#00FFAA]/30">
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
            <div className="bg-[#0A1A1A] p-4 rounded-xl border border-[#00FFAA]/20">
              <p className="text-[12px] font-bold text-[#00FFAA] uppercase tracking-wider mb-2">
                🛡️ Jenis Armada yang Ditampung:
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {capacityDetail.supportedUnits.map((unitName, index) => (
                  <li key={index} className="flex items-center gap-2 bg-[#0F2424] px-3 py-1.5 rounded-lg border border-[#00FFAA]/10 text-white font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00FFAA]"></span>
                    {unitName}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#0A1A1A] p-4 rounded-xl border border-[#00FFAA]/20">
              <p className="text-[12px] font-bold text-[#6B8A8A] mb-1">Biaya Pembangunan</p>
              <p className="text-base font-black text-[#00FFAA]">
                {formatNumber(selectedItem?.biaya_pembangunan)} NEO
              </p>
            </div>
            <div className="bg-[#0A1A1A] p-4 rounded-xl border border-[#00FFAA]/20">
              <p className="text-[12px] font-bold text-[#6B8A8A] mb-1">Waktu Pembangunan</p>
              {discountPct > 0 ? (
                <div className="flex items-center gap-2 text-base font-black">
                  <span className="text-red-400 line-through text-sm">{rawWaktu} Hari</span>
                  <span className="text-[#00FFAA]">{effectiveWaktu} Hari</span>
                </div>
              ) : (
                <p className="text-base font-black text-white">
                  {rawWaktu} Hari
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="bg-[#0A1A1A] p-4 rounded-xl border border-[#00FFAA]/20">
              <p className="text-[12px] font-bold text-[#6B8A8A] mb-1">Tenaga Kerja</p>
              <p className="text-base font-black text-white">
                {formatNumber(selectedItem?.lowongan_kerja || selectedItem?.kekuatan || 0)} orang
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#0A1A1A] border-t border-[#00FFAA]/20 flex justify-end relative z-10 shrink-0">
          <button 
            onClick={onClose} 
            className="px-6 py-2.5 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] text-[#6B8A8A] hover:text-white text-[10px] font-black uppercase cursor-pointer hover:bg-[#1A3838] transition-all text-center"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
