"use client"
import RootInfoModalHeader from '@/app/page/root_modals_design_menu/RootInfoModalHeader';
import React, { useState, useEffect, useRef } from "react";
import { Binoculars, Eye, Target, ChevronDown, UserPlus } from "lucide-react";
import { getSpionaseSuccessChance } from "@/app/page/detail_negara/3_operasi_militer/2_spionase/logic/spionaseLogic";
import NotebookModalWrapper from "../../../NotebookModalWrapper";
import TravelFuelCostPanel from "@/app/page/navigasi_menu/2_navigasi_bawah/3_produksi_konsumsi/fuelLogic/TravelFuelCostPanel";
import type { TravelFuelStatus } from "@/app/page/navigasi_menu/2_navigasi_bawah/3_produksi_konsumsi/fuelLogic/travelFuelLogic";
import { getCovertPersonnel, recruitPersonnel, COVERT_PERSONNEL_UPDATED_EVENT } from "@/app/page/detail_negara/3_operasi_militer/covertPersonnelStorage";
import { SPIONASE_TARGET_OPTIONS } from "@/app/page/detail_negara/3_operasi_militer/2_spionase/spionaseTargetOptions";
import RekrutMataMataModal from "@/app/page/detail_negara/3_operasi_militer/2_spionase/RekrutMataMataModal";

interface KonfirmasiSpionaseModalsProps {
  isOpen: boolean;
  onClose: () => void;
  targetCountry: any;
  playerCountryDetail?: Record<string, unknown> | null;
  currentBudget: number;
  updatePlayerCountryDetail: (updater: (previous: Record<string, unknown> | null) => Record<string, unknown> | null) => void;
  travelFuelStatus?: TravelFuelStatus;
  onConfirm: (operationTarget?: string) => void;
}

export default function KonfirmasiSpionaseModals({
  isOpen,
  onClose,
  targetCountry,
  playerCountryDetail,
  currentBudget,
  updatePlayerCountryDetail,
  travelFuelStatus,
  onConfirm,
}: KonfirmasiSpionaseModalsProps) {
  const [mataMataCount, setMataMataCount] = useState<number>(() => getCovertPersonnel().mataMata);
  const [isRecruitModalOpen, setIsRecruitModalOpen] = useState(false);
  const [selectedTargetId, setSelectedTargetId] = useState<string>(SPIONASE_TARGET_OPTIONS[0].id);
  const [isTargetDropdownOpen, setIsTargetDropdownOpen] = useState<boolean>(false);
  const targetDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const syncPersonnel = () => {
      setMataMataCount(getCovertPersonnel().mataMata);
    };
    syncPersonnel();
    window.addEventListener(COVERT_PERSONNEL_UPDATED_EVENT, syncPersonnel);
    return () => window.removeEventListener(COVERT_PERSONNEL_UPDATED_EVENT, syncPersonnel);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setIsTargetDropdownOpen(false);
      setSelectedTargetId(SPIONASE_TARGET_OPTIONS[0].id);
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
  const successChance = getSpionaseSuccessChance(playerCountryDetail);
  const hasAgent = mataMataCount >= 1;
  const isFuelOk = travelFuelStatus ? travelFuelStatus.ok : true;
  const canLaunch = hasAgent && isFuelOk;
  const selectedTargetOption = SPIONASE_TARGET_OPTIONS.find(t => t.id === selectedTargetId) || SPIONASE_TARGET_OPTIONS[0];
  const handleRecruitConfirm = (count: number, totalCost: number) => {
    if (currentBudget < totalCost) return;
    recruitPersonnel('mataMata', count);
    updatePlayerCountryDetail(previous => {
      if (!previous) return previous;
      return {
        ...previous,
        anggaran: Math.max(0, Number(previous.anggaran || 0) - totalCost),
      };
    });
    setIsRecruitModalOpen(false);
  };
  const handleClose = () => {
    setIsRecruitModalOpen(false);
    onClose();
  };

  return (
    <>
      <NotebookModalWrapper
        onClose={handleClose}
        compact
        zIndexClass="z-[60]"
      >
      <div className="flex flex-col font-sans animate-in fade-in zoom-in-95 duration-150">
        
        <RootInfoModalHeader
          title="Konfirmasi Spionase"
          onClose={handleClose}
          icon={<Eye className="text-root-accent" />}
          size="standard"
        />

        {/* BODY */}
        <div className="p-4 sm:p-5 bg-root-surface relative z-10 neon-scrollbar flex flex-col items-center justify-center">
          <div className="w-full max-w-lg space-y-5">
            <div className="flex justify-center">
              <div className="p-5 rounded-full bg-root-canvas border border-root-accent/30 shadow-inner">
                <Binoculars className="w-16 h-16 text-root-accent" />
              </div>
            </div>

            <div className="text-center space-y-1">
              <p className="text-lg font-black text-root-accent uppercase tracking-wider">
                Luncurkan Misi Intelijen!
              </p>
              <p className="text-xs text-root-subtle font-medium leading-relaxed max-w-lg mx-auto">
                Kirim agen rahasia untuk mengumpulkan data intelijen vital negara <span className="text-root-text font-bold">{targetName}</span>.
              </p>
            </div>

            {/* DROPDOWN TUJUAN OPERASI SPIONASE */}
            <div className="relative text-left" ref={targetDropdownRef}>
              <div className="text-[11px] font-bold uppercase tracking-wider text-root-subtle mb-1.5 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-root-accent" />
                <span>Tujuan Operasi Spionase</span>
              </div>
              <button
                type="button"
                onClick={() => setIsTargetDropdownOpen(!isTargetDropdownOpen)}
                className="w-full h-11 bg-root-canvas hover:bg-[#142A2A] border border-root-accent/30 rounded-xl px-4 flex items-center justify-between text-white transition-colors cursor-pointer text-left"
              >
                <div className="flex flex-col truncate pr-2">
                  <span className="font-bold text-xs text-root-accent truncate">
                    {selectedTargetOption.label}
                  </span>
                </div>
                <ChevronDown className={`w-4 h-4 text-root-accent transition-transform duration-200 shrink-0 ${isTargetDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isTargetDropdownOpen && (
                <div className="absolute left-0 right-0 top-full mt-2 max-h-52 overflow-y-auto bg-root-canvas border border-root-accent/30 rounded-xl shadow-2xl z-50 divide-y divide-root-accent/10">
                  {SPIONASE_TARGET_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setSelectedTargetId(opt.id);
                        setIsTargetDropdownOpen(false);
                      }}
                      className={`w-full px-4 py-2.5 text-left hover:bg-root-accent/10 transition-colors ${
                        selectedTargetId === opt.id ? 'bg-root-accent/20 border-l-4 border-root-accent' : ''
                      }`}
                    >
                      <div className={`text-xs font-bold ${selectedTargetId === opt.id ? 'text-root-accent' : 'text-root-text'}`}>
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

            <div className="bg-root-canvas border border-root-accent/20 p-4 rounded-xl shadow-sm flex flex-col items-center">
              <p className="text-[10px] font-black uppercase tracking-wider text-root-subtle mb-1">Target Misi</p>
              <p className="text-base font-black text-root-accent">{targetName}</p>
              <p className="text-xs text-root-subtle mt-1">
                Kekuatan Militer: <span className="font-black text-root-text">{targetCountry?.totalPower?.toLocaleString("id-ID", { maximumFractionDigits: 0 }) || "Tidak diketahui"}</span>
              </p>
              <p className="text-xs text-root-subtle mt-1.5">
                Peluang keberhasilan: <span className="font-black text-root-accent">{successChance}%</span>
              </p>
              <div className="mt-2.5 pt-2.5 border-t border-root-accent/10 w-full flex justify-between items-center text-xs">
                <span className="text-root-subtle">Mata-Mata Dibutuhkan:</span>
                <span className="font-bold text-root-text">1 personel</span>
              </div>
            </div>
            <div className="w-full rounded-xl border border-root-accent/20 bg-root-canvas p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-lg border border-root-accent/30 bg-root-surface p-2">
                  <Eye className="h-5 w-5 text-root-accent" />
                </div>
                <div>
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-root-subtle">
                    Personel Intelijen
                  </span>
                  <span className="text-sm font-black text-white">
                    Mata-Mata: <span className={hasAgent ? "text-root-accent" : "text-rose-400"}>{mataMataCount}</span>
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsRecruitModalOpen(true)}
                className="flex items-center gap-1.5 rounded-lg border border-root-accent px-4 py-1.5 text-xs font-black uppercase tracking-wider text-root-accent transition-colors hover:bg-root-accent/10 cursor-pointer"
              >
                <UserPlus className="h-3.5 w-3.5" />
                Rekrut
              </button>
            </div>
            {travelFuelStatus && <TravelFuelCostPanel status={travelFuelStatus} />}
          </div>
        </div>

        {/* FOOTER */}
        <div className="px-4 sm:px-5 py-3 border-t border-root-accent/30 bg-root-canvas relative z-10 shrink-0 flex items-center justify-end gap-3">
          <button onClick={handleClose} className="px-6 py-2 rounded-xl border border-root-accent/30 bg-root-surface text-root-subtle hover:text-root-accent hover:border-root-accent transition-all font-black text-xs uppercase tracking-wider cursor-pointer">
            Batal
          </button>
          <button
            onClick={() => {
              setIsRecruitModalOpen(false);
              onConfirm(selectedTargetOption.label);
            }}
            disabled={!canLaunch}
            className="px-6 py-2 rounded-xl bg-root-accent text-root-canvas shadow-lg shadow-root-accent/20 font-black text-xs uppercase tracking-wider hover:bg-root-accent/80 active:scale-95 transition-all cursor-pointer flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Binoculars className="w-4 h-4" />
            {!hasAgent ? "Mata-Mata Habis" : "Luncurkan Misi"}
          </button>
        </div>
        </div>
      </NotebookModalWrapper>
      <RekrutMataMataModal
        isOpen={isRecruitModalOpen}
        currentPersonnelCount={mataMataCount}
        currentBudget={currentBudget}
        onClose={() => setIsRecruitModalOpen(false)}
        onConfirm={handleRecruitConfirm}
      />
    </>
  );
}
