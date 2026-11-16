"use client"
import SharedModalCloseButton from '@/app/page/root_modals_design_menu/ModalCloseButton';
import React, { useState, useEffect } from "react";
import { X, Bomb, AlertTriangle } from "lucide-react";
import { getCovertOperationSuccessChance } from "@/app/page/detail_negara/3_operasi_militer/covertOperationLogic";
import NotebookModalWrapper from "../../../NotebookModalWrapper";
import TravelFuelCostPanel from "@/app/page/navigasi_menu/2_navigasi_bawah/3_produksi_konsumsi/fuelLogic/TravelFuelCostPanel";
import type { TravelFuelStatus } from "@/app/page/navigasi_menu/2_navigasi_bawah/3_produksi_konsumsi/fuelLogic/travelFuelLogic";
import { getCovertPersonnel, COVERT_PERSONNEL_UPDATED_EVENT } from "@/app/page/detail_negara/3_operasi_militer/covertPersonnelStorage";

interface KonfirmasiSabotaseModalsProps {
  isOpen: boolean;
  onClose: () => void;
  targetCountry: any;
  playerCountryDetail?: Record<string, unknown> | null;
  travelFuelStatus?: TravelFuelStatus;
  onConfirm: () => void;
}

export default function KonfirmasiSabotaseModals({
  isOpen,
  onClose,
  targetCountry,
  playerCountryDetail,
  travelFuelStatus,
  onConfirm,
}: KonfirmasiSabotaseModalsProps) {
  const [penyabotCount, setPenyabotCount] = useState<number>(() => getCovertPersonnel().penyabot);

  useEffect(() => {
    const syncPersonnel = () => {
      setPenyabotCount(getCovertPersonnel().penyabot);
    };
    syncPersonnel();
    window.addEventListener(COVERT_PERSONNEL_UPDATED_EVENT, syncPersonnel);
    return () => window.removeEventListener(COVERT_PERSONNEL_UPDATED_EVENT, syncPersonnel);
  }, [isOpen]);

  if (!isOpen || !targetCountry) return null;

  const targetName = targetCountry.countryName || "Target";
  const successChance = getCovertOperationSuccessChance('sabotase', playerCountryDetail);
  const hasAgent = penyabotCount >= 1;
  const isFuelOk = travelFuelStatus ? travelFuelStatus.ok : true;
  const canLaunch = hasAgent && isFuelOk;

  return (
    <NotebookModalWrapper
      onClose={onClose}
      compact
      zIndexClass="z-[60]"
    >
      <div className="flex flex-col font-sans animate-in fade-in zoom-in-95 duration-150">
        
        {/* HEADER */}
        <div className="px-4 sm:px-5 py-3 border-b border-rose-500/30 flex items-center justify-between bg-root-canvas relative z-10 shrink-0">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-root-surface rounded-xl border border-rose-500/30">
                <Bomb className="h-6 w-6 text-rose-400 animate-pulse" />
              </div>
              <div>
                <h2 className="text-xl font-black text-rose-400 tracking-wider uppercase">Konfirmasi Sabotase</h2>
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
              <div className="p-5 rounded-full bg-root-canvas border border-rose-500/30 shadow-inner">
                <AlertTriangle className="w-16 h-16 text-rose-400" />
              </div>
            </div>

            <div className="text-center space-y-2">
              <p className="text-lg font-black text-rose-400 uppercase tracking-wider">
                Lancarkan Operasi Khusus!
              </p>
            </div>

            <div className="bg-root-canvas border border-rose-500/20 p-4 rounded-xl shadow-sm flex flex-col items-center">
              <p className="text-[10px] font-black uppercase tracking-wider text-root-subtle mb-1">Target Operasi</p>
              <p className="text-base font-black text-rose-400">{targetName}</p>
              <p className="text-xs text-root-subtle mt-1">
                Kekuatan Militer: <span className="font-black text-root-text">{targetCountry?.totalPower?.toLocaleString("id-ID", { maximumFractionDigits: 0 }) || "Tidak diketahui"}</span>
              </p>
              <p className="text-xs text-root-subtle mt-2">
                Peluang keberhasilan: <span className="font-black text-rose-400">{successChance}%</span>
              </p>
              <div className="mt-3 pt-3 border-t border-rose-500/10 w-full flex justify-between items-center text-xs">
                <span className="text-root-subtle">Penyabot Dibutuhkan:</span>
                <span className="font-bold text-root-text">1 personel</span>
              </div>
              <div className="w-full flex justify-between items-center text-xs mt-1">
                <span className="text-root-subtle">Penyabot Tersedia:</span>
                <span className={`font-bold ${hasAgent ? 'text-rose-400' : 'text-rose-400'}`}>{penyabotCount} personel</span>
              </div>
            </div>
            {travelFuelStatus && <TravelFuelCostPanel status={travelFuelStatus} />}
          </div>
        </div>

        {/* FOOTER */}
        <div className="px-4 sm:px-5 py-3 border-t border-rose-500/30 bg-root-canvas relative z-10 shrink-0 flex items-center justify-end gap-3">
          <button onClick={onClose} className="px-6 py-2 rounded-xl border border-root-accent/30 bg-root-surface text-root-subtle hover:text-root-accent hover:border-root-accent transition-all font-black text-xs uppercase tracking-wider cursor-pointer">
            Batal
          </button>
          <button
            onClick={onConfirm}
            disabled={!canLaunch}
            className="px-6 py-2 rounded-xl bg-rose-600 text-white shadow-lg shadow-rose-900/30 font-black text-xs uppercase tracking-wider hover:bg-rose-500 active:scale-95 transition-all cursor-pointer flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Bomb className="w-4 h-4" />
            {!hasAgent ? "Penyabot Habis" : "Luncurkan Sabotase"}
          </button>
        </div>
      </div>
      </NotebookModalWrapper>
  );
}
