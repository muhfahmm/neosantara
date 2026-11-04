"use client";
import React from "react";
import { createPortal } from "react-dom";

import NotebookModalWrapper from "@/app/page/navigasi_menu/2_navigasi_bawah/NotebookModalWrapper";
import TravelFuelCostPanel from "@/app/page/navigasi_menu/2_navigasi_bawah/3_produksi_konsumsi/fuelLogic/TravelFuelCostPanel";
import type { TravelFuelStatus } from "@/app/page/navigasi_menu/2_navigasi_bawah/3_produksi_konsumsi/fuelLogic/travelFuelLogic";
interface BuildTradeModalProps {
  isOpen: boolean;
  countryName?: string | null;
  chancePercent?: number;
  onClose: () => void;
  onConfirm: () => void;
  travelFuelStatus?: TravelFuelStatus;
}

export default function BuildTradeModal({ isOpen, countryName, onClose, onConfirm, travelFuelStatus }: BuildTradeModalProps) {
  if (!isOpen) return null;

  const modalContent = (
    <NotebookModalWrapper compact maxWidthClass="max-w-xl" zIndexClass="z-[100000001]">
      {/* Container Modal Lebih Lebar dan Panjang */}
      <div className="w-full flex flex-col p-4 sm:p-5 font-sans text-white">
        
        {/* Area Konten */}
        <div className="flex-1">
          <h3 className="text-xl sm:text-2xl font-black text-root-accent tracking-wide uppercase mb-6 border-b border-root-accent/20 pb-4">
            Konfirmasi Perjanjian Dagang
          </h3>
          
          <p className="text-sm sm:text-base text-root-text mb-6 leading-relaxed">
            Apakah Anda ingin mengajukan perjanjian dagang kepada <strong className="text-white">{countryName}</strong>? Ini akan membuka jalur perdagangan antara kedua negara jika diterima.
          </p>
          {travelFuelStatus && <TravelFuelCostPanel status={travelFuelStatus} />}
          
          {/* 🔥 PERBAIKAN: Blok Peluang Diterima telah dihapus */}
        </div>

        {/* Area Tombol di bagian paling bawah (Diperkecil) */}
        <div className="flex flex-col sm:flex-row gap-3 justify-end mt-6 pt-4 border-t border-root-accent/20">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 bg-root-canvas hover:bg-[#142A2A] border border-root-accent/30 rounded-xl py-2 text-center text-root-text font-black text-[11px] sm:text-xs tracking-widest uppercase transition-all duration-150 cursor-pointer shadow hover:shadow-md"
          >
            Batal
          </button>

          <button
            onClick={() => { onConfirm(); onClose(); }}
            disabled={travelFuelStatus ? !travelFuelStatus.ok : false}
            className="w-full sm:w-auto px-6 bg-root-accent hover:bg-[#00e699] border border-root-accent rounded-xl py-2 text-center text-root-canvas font-black text-[11px] sm:text-xs tracking-widest uppercase transition-all duration-150 cursor-pointer shadow hover:shadow-md active:scale-[0.98]"
          >
            Jalin Perjanjian
          </button>
        </div>

      </div>
    </NotebookModalWrapper>
  );

  if (typeof window !== "undefined") {
    return createPortal(modalContent, document.body);
  }

  return modalContent;
}