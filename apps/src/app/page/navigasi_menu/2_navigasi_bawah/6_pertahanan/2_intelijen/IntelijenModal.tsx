"use client"
import React, { useEffect, useRef, useState } from "react";
import { Eye, Bomb } from "lucide-react";
import NotebookModalWrapper from "../../NotebookModalWrapper";
import RootModalCloseButton from "@/app/page/root_modals_design_menu/RootModalCloseButton";
import RootModalTabs from "@/app/page/root_modals_design_menu/RootModalTabs";
import { rootModalTypography } from "@/app/page/root_modals_design_menu/rootModalTypography";
import Spionase from "./table_menu/1_tabel_spionase";
import Sabotase from "./table_menu/2_tabel_sabotase";
import CovertOperationResultModal from "@/app/page/detail_negara/3_operasi_militer/CovertOperationResultModal";
import {
  resolveCovertOperation,
  type CovertOperationResult,
  type CovertOperationType,
} from "@/app/page/detail_negara/3_operasi_militer/covertOperationLogic";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  countryDetail: any;
  setCountryDetail: (detail: any) => void;
  prefetchedAllCountries?: any[]; // 🔥 Tambahkan prop ini!
}

export default function IntelijenModal({ isOpen, onClose, countryDetail, setCountryDetail, prefetchedAllCountries }: ModalProps) {
  const [activeTab, setActiveTab] = useState<'spionase' | 'sabotase'>('spionase');
  const [covertOperationResult, setCovertOperationResult] = useState<CovertOperationResult | null>(null);
  const pendingCovertOperationsRef = useRef(new Map<string, CovertOperationType>());

  useEffect(() => {
    const handleCovertOperationArrival = (event: Event) => {
      const path = (event as CustomEvent<{ pathId?: string; targetCountry?: string }>).detail;
      const operation = path?.pathId ? pendingCovertOperationsRef.current.get(path.pathId) : undefined;
      if (!path?.pathId || !operation || !path.targetCountry) return;

      pendingCovertOperationsRef.current.delete(path.pathId);
      const result = resolveCovertOperation(operation, countryDetail);
      setCovertOperationResult({ operation, targetCountry: path.targetCountry, ...result });
    };

    window.addEventListener('neosantara_covert_operation_arrived', handleCovertOperationArrival);
    return () => window.removeEventListener('neosantara_covert_operation_arrived', handleCovertOperationArrival);
  }, [countryDetail]);

  if (!isOpen) return null;

  const anggaran = countryDetail?.anggaran || 0;
  const launchCovertOperation = (operation: CovertOperationType, targetCountry: string) => {
    const pathId = `covert-${operation}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    pendingCovertOperationsRef.current.set(pathId, operation);
    window.dispatchEvent(new CustomEvent('neosantara_diplomacy_path', {
      detail: {
        pathId,
        kind: operation,
        senderCountry: countryDetail?.country || countryDetail?.nama_negara || countryDetail?.name_id,
        targetCountry,
      },
    }));
  };

  // 🔥 Logika aksi untuk Spionase
  const handleSpionaseAction = (target: any) => {
    if (anggaran < 10000000) {
      alert("Kas negara tidak mencukupi untuk misi spionase!");
      return;
    }
    setCountryDetail({
      ...countryDetail,
      anggaran: anggaran - 10000000
    });
    launchCovertOperation('spionase', target.countryName);
  };

  // 🔥 Logika aksi untuk Sabotase
  const handleSabotaseAction = (target: any) => {
    if (anggaran < 20000000) {
      alert("Kas negara tidak mencukupi untuk operasi sabotase!");
      return;
    }
    setCountryDetail({
      ...countryDetail,
      anggaran: anggaran - 20000000
    });
    launchCovertOperation('sabotase', target.countryName);
  };

  return (
    <>
      <NotebookModalWrapper onClose={onClose}>
        <div className="flex flex-col h-full overflow-hidden">

          {/* HEADER MODAL */}
          <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-[#00FFAA]/20 flex items-center justify-between bg-[#0A1A1A] relative z-10 gap-2 shrink-0">
          <div className="flex min-w-0 items-center gap-3 lg:gap-6">
            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
              <div className="p-1 sm:p-1.5 bg-[#0F2424] rounded-lg border border-[#00FFAA]/30 shrink-0">
                {activeTab === 'spionase' ? (
                  <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-[#00FFAA] animate-pulse" />
                ) : (
                  <Bomb className="h-4 w-4 sm:h-5 sm:w-5 text-orange-400 animate-pulse" />
                )}
              </div>
              <div className="min-w-0">
                <h2 className={rootModalTypography.title}>
                  {activeTab === 'spionase' ? 'Badan Intelijen & Sandi Negara' : 'Divisi Operasi Khusus'}
                </h2>
              </div>
            </div>

            {/* 2 TAB MENU - dipindah ke header */}
            <div className="hidden sm:block">
              <RootModalTabs
                compact
                items={[
                  { label: "Spionase", isActive: activeTab === "spionase", onClick: () => setActiveTab("spionase") },
                  { label: "Sabotase", isActive: activeTab === "sabotase", onClick: () => setActiveTab("sabotase") },
                ]}
              />
            </div>
          </div>

          <RootModalCloseButton onClick={onClose} />
        </div>

        {/* BODY MODAL */}
        <div className="flex-1 min-h-0 overflow-hidden p-6 bg-[#0F2424] relative z-10 no-scrollbar flex flex-col">
          <div className="w-full flex-1 min-h-0 flex flex-col gap-4">

            {/* 2 TAB MENU - tampilan mobile */}
            <div className="sm:hidden">
              <RootModalTabs
                className="w-full [&>button]:flex-1"
                items={[
                  { label: "Spionase", isActive: activeTab === "spionase", onClick: () => setActiveTab("spionase") },
                  { label: "Sabotase", isActive: activeTab === "sabotase", onClick: () => setActiveTab("sabotase") },
                ]}
              />
            </div>

            {/* RENDER KOMPONEN TABEL TERPISAH */}
            <div className="w-full flex-1 min-h-0 overflow-hidden border border-[#00FFAA]/20 rounded-xl bg-[#0A1A1A] shadow-sm">
              <div className="h-full min-h-0 overflow-hidden">
                {activeTab === 'spionase' && (
                  <Spionase
                    prefetchedAllCountries={prefetchedAllCountries}
                    countryDetail={countryDetail}
                    onAction={handleSpionaseAction}
                  />
                )}
                {activeTab === 'sabotase' && (
                  <Sabotase
                    prefetchedAllCountries={prefetchedAllCountries}
                    countryDetail={countryDetail}
                    onAction={handleSabotaseAction}
                  />
                )}
              </div>
            </div>

          </div>
        </div>
        </div>
      </NotebookModalWrapper>

      <CovertOperationResultModal
        result={covertOperationResult}
        onClose={() => setCovertOperationResult(null)}
      />
    </>
  );
}