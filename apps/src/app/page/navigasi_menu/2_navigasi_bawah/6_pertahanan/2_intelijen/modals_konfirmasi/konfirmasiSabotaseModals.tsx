"use client"
import RootInfoModalHeader from '@/app/page/root_modals_design_menu/RootInfoModalHeader';
import React, { useState, useEffect, useRef } from "react";
import { Bomb, AlertTriangle, Target, ChevronDown, UserPlus } from "lucide-react";
import NotebookModalWrapper from "../../../NotebookModalWrapper";
import TravelFuelCostPanel from "@/app/page/navigasi_menu/2_navigasi_bawah/3_produksi_konsumsi/fuelLogic/TravelFuelCostPanel";
import type { TravelFuelStatus } from "@/app/page/navigasi_menu/2_navigasi_bawah/3_produksi_konsumsi/fuelLogic/travelFuelLogic";
import { getCovertPersonnel, recruitPersonnel, COVERT_PERSONNEL_UPDATED_EVENT } from "@/app/page/detail_negara/3_operasi_militer/covertPersonnelStorage";
import { SABOTASE_TARGET_OPTIONS } from "@/app/page/detail_negara/3_operasi_militer/3_sabotase/sabotaseTargetOptions";
import RekrutPenyabotModal from "@/app/page/detail_negara/3_operasi_militer/3_sabotase/RekrutPenyabotModal";

interface KonfirmasiSabotaseModalsProps {
  isOpen: boolean;
  onClose: () => void;
  targetCountry: { countryName: string };
  currentBudget: number;
  updatePlayerCountryDetail: (updater: (previous: Record<string, unknown> | null) => Record<string, unknown> | null) => void;
  onRecruitModalVisibilityChange: (isOpen: boolean) => void;
  travelFuelStatus?: TravelFuelStatus;
  onConfirm: (operationTarget?: string) => void;
}

export default function KonfirmasiSabotaseModals({
  isOpen,
  onClose,
  targetCountry,
  currentBudget,
  updatePlayerCountryDetail,
  onRecruitModalVisibilityChange,
  travelFuelStatus,
  onConfirm,
}: KonfirmasiSabotaseModalsProps) {
  const [penyabotCount, setPenyabotCount] = useState<number>(() => getCovertPersonnel().penyabot);
  const [isRecruitModalOpen, setIsRecruitModalOpen] = useState(false);
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
  const hasAgent = penyabotCount >= 1;
  const isFuelOk = travelFuelStatus ? travelFuelStatus.ok : true;
  const canLaunch = hasAgent && isFuelOk;
  const selectedTargetOption = SABOTASE_TARGET_OPTIONS.find(t => t.id === selectedTargetId) || SABOTASE_TARGET_OPTIONS[0];
  const handleRecruitConfirm = (count: number, totalCost: number) => {
    if (currentBudget < totalCost) return;
    recruitPersonnel('penyabot', count);
    updatePlayerCountryDetail(previous => {
      if (!previous) return previous;
      return {
        ...previous,
        anggaran: Math.max(0, Number(previous.anggaran || 0) - totalCost),
      };
    });
    setIsRecruitModalOpen(false);
    onRecruitModalVisibilityChange(false);
  };
  const handleClose = () => {
    setIsRecruitModalOpen(false);
    onRecruitModalVisibilityChange(false);
    onClose();
  };
  const handleRecruitModalClose = () => {
    setIsRecruitModalOpen(false);
    onRecruitModalVisibilityChange(false);
  };

  return (
    <>
      <NotebookModalWrapper
        onClose={handleClose}
        compact
        isHidden={isRecruitModalOpen}
        zIndexClass="z-[60]"
      >
      <div className="flex flex-col font-sans animate-in fade-in zoom-in-95 duration-150">
        
        <RootInfoModalHeader
          title={`Konfirmasi Sabotase ${targetName}`}
          onClose={handleClose}
          icon={<Bomb className="text-rose-400" />}
          size="standard"
        />

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

            <div className="w-full rounded-xl border border-rose-500/20 bg-root-canvas p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-lg border border-rose-500/30 bg-root-surface p-2">
                  <Bomb className="h-5 w-5 text-rose-400" />
                </div>
                <div>
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-root-subtle">
                    Personel Sabotase
                  </span>
                  <span className="text-sm font-black text-white">
                    Penyabot: <span className="text-rose-400">{penyabotCount}</span>
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsRecruitModalOpen(true);
                  onRecruitModalVisibilityChange(true);
                }}
                className="flex items-center gap-1.5 rounded-lg border border-rose-500 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-rose-400 transition-colors hover:bg-rose-500/10 cursor-pointer"
              >
                <UserPlus className="h-3.5 w-3.5" />
                Rekrut
              </button>
            </div>
            {travelFuelStatus && <TravelFuelCostPanel status={travelFuelStatus} />}
          </div>
        </div>

        {/* FOOTER */}
        <div className="px-4 sm:px-5 py-3 border-t border-rose-500/30 bg-root-canvas relative z-10 shrink-0 flex items-center justify-end gap-3">
          <button onClick={handleClose} className="px-6 py-2 rounded-xl border border-root-accent/30 bg-root-surface text-root-subtle hover:text-root-accent hover:border-root-accent transition-all font-black text-xs uppercase tracking-wider cursor-pointer">
            Batal
          </button>
          <button
            onClick={() => {
              setIsRecruitModalOpen(false);
              onRecruitModalVisibilityChange(false);
              onConfirm(selectedTargetOption.label);
            }}
            disabled={!canLaunch}
            className="px-6 py-2 rounded-xl bg-rose-600 text-white shadow-lg shadow-rose-900/30 font-black text-xs uppercase tracking-wider hover:bg-rose-500 active:scale-95 transition-all cursor-pointer flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Bomb className="w-4 h-4" />
            {!hasAgent ? "Penyabot Habis" : "Luncurkan Sabotase"}
          </button>
        </div>
        </div>
      </NotebookModalWrapper>
      <RekrutPenyabotModal
        isOpen={isRecruitModalOpen}
        currentPersonnelCount={penyabotCount}
        currentBudget={currentBudget}
        onClose={handleRecruitModalClose}
        onConfirm={handleRecruitConfirm}
      />
    </>
  );
}
