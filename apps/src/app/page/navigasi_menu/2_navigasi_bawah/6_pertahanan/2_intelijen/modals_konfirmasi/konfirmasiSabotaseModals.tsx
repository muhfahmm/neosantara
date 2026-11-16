"use client"
import SharedModalCloseButton from '@/app/page/root_modals_design_menu/ModalCloseButton';
import React, { useState, useEffect, useRef } from "react";
import { X, Bomb, AlertTriangle, Target, ChevronDown } from "lucide-react";
import { getSabotaseSuccessChance } from "@/app/page/detail_negara/3_operasi_militer/3_sabotase/logic/sabotaseLogic";
import NotebookModalWrapper from "../../../NotebookModalWrapper";
import TravelFuelCostPanel from "@/app/page/navigasi_menu/2_navigasi_bawah/3_produksi_konsumsi/fuelLogic/TravelFuelCostPanel";
import type { TravelFuelStatus } from "@/app/page/navigasi_menu/2_navigasi_bawah/3_produksi_konsumsi/fuelLogic/travelFuelLogic";
import { getCovertPersonnel, COVERT_PERSONNEL_UPDATED_EVENT } from "@/app/page/detail_negara/3_operasi_militer/covertPersonnelStorage";
import { SABOTASE_TARGET_OPTIONS } from "@/app/page/detail_negara/3_operasi_militer/3_sabotase/sabotaseTargetOptions";

interface KonfirmasiSabotaseModalsProps {
  isOpen: boolean;
  onClose: () => void;
  targetCountry: any;
  playerCountryDetail?: Record<string, unknown> | null;
  travelFuelStatus?: TravelFuelStatus;
  onConfirm: (operationTarget?: string) => void;
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
  const [selectedTargetId, setSelectedTargetId] = useState<string>(SABOTASE_TARGET_OPTIONS[0].id);
  const [isTargetDropdownOpen, setIsTargetDropdownOpen] = useState<boolean>(false);
  const targetDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const syncPersonnel = () => {
      setPenyabotCount(getCovertPersonnel().penyabot);
    };
    syncPersonnel();
    window.addEventListener(COVERT_PERSONNEL_UPDATED_EVENT, syncPersonnel);
    return () => window.removeEventListener(COVERT_PERSONNEL_UPDATED_EVENT, syncPersonnel);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setIsTargetDropdownOpen(false);
      setSelectedTargetId(SABOTASE_TARGET_OPTIONS[0].id);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (targetDropdownRef.current && !targetDropdownRef.current.contains(e.target as Node)) {
        setIsTargetDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isOpen || !targetCountry) return null;

  const targetName = targetCountry.countryName || "Target";
  const successChance = getSabotaseSuccessChance(playerCountryDetail);
  const hasAgent = penyabotCount >= 1;
  const isFuelOk = travelFuelStatus ? travelFuelStatus.ok : true;
  const canLaunch = hasAgent && isFuelOk;
  const selectedTargetOption = SABOTASE_TARGET_OPTIONS.find(t => t.id === selectedTargetId) || SABOTASE_TARGET_OPTIONS[0];

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
          <div className="w-full max-w-lg space-y-5">
            <div className="flex justify-center">
              <div className="p-5 rounded-full bg-root-canvas border border-rose-500/30 shadow-inner">
                <AlertTriangle className="w-16 h-16 text-rose-400" />
              </div>
            </div>

            <div className="text-center space-y-1">
              <p className="text-lg font-black text-rose-400 uppercase tracking-wider">
                Lancarkan Operasi Khusus!
              </p>
              <p className="text-xs text-root-subtle font-medium leading-relaxed max-w-lg mx-auto">
                Kirim tim operasi khusus untuk melumpuhkan fasilitas vital di negara <span className="text-root-text font-bold">{targetName}</span>.
              </p>
            </div>

            {/* DROPDOWN TARGET FASILITAS SABOTASE */}
            <div className="relative text-left" ref={targetDropdownRef}>
              <div className="text-[11px] font-bold uppercase tracking-wider text-root-subtle mb-1.5 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-rose-400" />
                <span>Target Fasilitas Sabotase</span>
              </div>
              <button
                type="button"
                onClick={() => setIsTargetDropdownOpen(!isTargetDropdownOpen)}
                className="w-full h-11 bg-root-canvas hover:bg-[#142A2A] border border-rose-500/30 rounded-xl px-4 flex items-center justify-between text-white transition-colors cursor-pointer text-left"
              >
                <div className="flex flex-col truncate pr-2">
                  <span className="font-bold text-xs text-rose-400 truncate">
                    {selectedTargetOption.label}
                  </span>
                </div>
                <ChevronDown className={`w-4 h-4 text-rose-400 transition-transform duration-200 shrink-0 ${isTargetDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isTargetDropdownOpen && (
                <div className="absolute left-0 right-0 top-full mt-2 max-h-52 overflow-y-auto bg-root-canvas border border-rose-500/30 rounded-xl shadow-2xl z-50 divide-y divide-rose-500/10">
                  {SABOTASE_TARGET_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setSelectedTargetId(opt.id);
                        setIsTargetDropdownOpen(false);
                      }}
                      className={`w-full px-4 py-2.5 text-left hover:bg-rose-500/10 transition-colors ${
                        selectedTargetId === opt.id ? 'bg-rose-500/20 border-l-4 border-rose-500' : ''
                      }`}
                    >
                      <div className={`text-xs font-bold ${selectedTargetId === opt.id ? 'text-rose-400' : 'text-root-text'}`}>
                        {opt.label}
                      </div>
                      <div className="text-[11px] text-root-subtle mt-0.5 leading-snug">
                        {opt.description}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-root-canvas border border-rose-500/20 p-4 rounded-xl shadow-sm flex flex-col items-center">
              <p className="text-[10px] font-black uppercase tracking-wider text-root-subtle mb-1">Target Operasi</p>
              <p className="text-base font-black text-rose-400">{targetName}</p>
              <p className="text-xs text-root-subtle mt-1">
                Kekuatan Militer: <span className="font-black text-root-text">{targetCountry?.totalPower?.toLocaleString("id-ID", { maximumFractionDigits: 0 }) || "Tidak diketahui"}</span>
              </p>
              <p className="text-xs text-root-subtle mt-1.5">
                Peluang keberhasilan: <span className="font-black text-rose-400">{successChance}%</span>
              </p>
              <div className="mt-2.5 pt-2.5 border-t border-rose-500/10 w-full flex justify-between items-center text-xs">
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
            onClick={() => onConfirm(selectedTargetOption.label)}
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
