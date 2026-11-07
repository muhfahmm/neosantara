"use client"
import SharedModalCloseButton from '@/app/page/root_modals_design_menu/ModalCloseButton';
import React from "react";
import { X, Binoculars, Eye } from "lucide-react";
import { getCovertOperationSuccessChance } from "@/app/page/detail_negara/3_operasi_militer/covertOperationLogic";
import NotebookModalWrapper from "../../../NotebookModalWrapper";
import TravelFuelCostPanel from "@/app/page/navigasi_menu/2_navigasi_bawah/3_produksi_konsumsi/fuelLogic/TravelFuelCostPanel";
import type { TravelFuelStatus } from "@/app/page/navigasi_menu/2_navigasi_bawah/3_produksi_konsumsi/fuelLogic/travelFuelLogic";

interface KonfirmasiSpionaseModalsProps {
  isOpen: boolean;
  onClose: () => void;
  targetCountry: any;
  playerCountryDetail?: Record<string, unknown> | null;
  travelFuelStatus?: TravelFuelStatus;
  onConfirm: () => void;
}

export default function KonfirmasiSpionaseModals({
  isOpen,
  onClose,
  targetCountry,
  playerCountryDetail,
  travelFuelStatus,
  onConfirm,
}: KonfirmasiSpionaseModalsProps) {
  if (!isOpen || !targetCountry) return null;

  const targetName = targetCountry.countryName || "Target";
  const successChance = getCovertOperationSuccessChance('spionase', playerCountryDetail);

  return (
    <NotebookModalWrapper
      onClose={onClose}
      compact
      zIndexClass="z-[60]"
    >
      <div className="flex flex-col font-sans animate-in fade-in zoom-in-95 duration-150">
        
        {/* HEADER */}
        <div className="px-4 sm:px-5 py-3 border-b border-root-accent/30 flex items-center justify-between bg-root-canvas relative z-10 shrink-0">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-root-surface rounded-xl border border-root-accent/30">
                <Eye className="h-6 w-6 text-root-accent animate-pulse" />
              </div>
              <div>
                <h2 className="text-xl font-black text-root-accent tracking-wider uppercase">Konfirmasi Spionase</h2>
                <p className="text-[11px] font-bold uppercase tracking-widest text-root-subtle mt-0.5">
                  Target: {targetName}
                </p>
              </div>
            </div>
          </div>
          <SharedModalCloseButton onClick={onClose} className="p-2 rounded-xl border border-root-accent/30 bg-root-surface text-root-subtle hover:text-root-accent hover:border-root-accent transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1.5" appearance="custom">
            <span className="text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
            <X className="h-5 w-5" />
          </SharedModalCloseButton>
        </div>

        {/* BODY */}
        <div className="p-4 sm:p-5 bg-root-surface relative z-10 neon-scrollbar flex flex-col items-center justify-center">
          <div className="w-full max-w-lg space-y-6">
            <div className="flex justify-center">
              <div className="p-5 rounded-full bg-root-canvas border border-root-accent/30 shadow-inner">
                <Binoculars className="w-16 h-16 text-root-accent" />
              </div>
            </div>

            <div className="text-center space-y-2">
              <p className="text-lg font-black text-root-accent uppercase tracking-wider">
                Luncurkan Misi Intelijen!
              </p>
              <p className="text-xs text-root-subtle font-medium leading-relaxed max-w-lg mx-auto">
                Kirim agen rahasia untuk mengumpulkan data intelijen vital negara <span className="text-root-text font-bold">{targetName}</span>.
                Biaya operasional diperkirakan sebesar <span className="font-black text-root-accent">10.000.000 NEO</span>.
              </p>
            </div>

            <div className="bg-root-canvas border border-root-accent/20 p-4 rounded-xl shadow-sm flex flex-col items-center">
              <p className="text-[10px] font-black uppercase tracking-wider text-root-subtle mb-1">Target Misi</p>
              <p className="text-base font-black text-root-accent">{targetName}</p>
              <p className="text-xs text-root-subtle mt-1">
                Kekuatan Militer: <span className="font-black text-root-text">{targetCountry?.totalPower?.toLocaleString("id-ID", { maximumFractionDigits: 0 }) || "Tidak diketahui"}</span>
              </p>
              <p className="text-xs text-root-subtle mt-2">
                Peluang keberhasilan: <span className="font-black text-root-accent">{successChance}%</span>
              </p>
            </div>
            {travelFuelStatus && <TravelFuelCostPanel status={travelFuelStatus} />}
          </div>
        </div>

        {/* FOOTER */}
        <div className="px-4 sm:px-5 py-3 border-t border-root-accent/30 bg-root-canvas relative z-10 shrink-0 flex items-center justify-end gap-3">
          <button onClick={onClose} className="px-6 py-2 rounded-xl border border-root-accent/30 bg-root-surface text-root-subtle hover:text-root-accent hover:border-root-accent transition-all font-black text-xs uppercase tracking-wider cursor-pointer">
            Batal
          </button>
          <button
            onClick={onConfirm}
            disabled={travelFuelStatus ? !travelFuelStatus.ok : false}
            className="px-6 py-2 rounded-xl bg-root-accent text-root-canvas shadow-lg shadow-root-accent/20 font-black text-xs uppercase tracking-wider hover:bg-root-accent/80 active:scale-95 transition-all cursor-pointer flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Binoculars className="w-4 h-4" />
            Luncurkan Misi
          </button>
        </div>
      </div>
      </NotebookModalWrapper>
  );
}