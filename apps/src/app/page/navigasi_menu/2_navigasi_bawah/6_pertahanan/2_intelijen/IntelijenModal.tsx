"use client"
import React, { useEffect, useRef, useState } from "react";
import { X, Eye, Bomb } from "lucide-react";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none">
      <div className="bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans pointer-events-auto shadow-2xl">

        {/* HEADER MODAL */}
        <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-[#00FFAA]/20 flex items-center justify-between bg-[#0A1A1A] relative z-10 gap-2 shrink-0 rounded-t-2xl">
          <div className="flex items-center gap-4 lg:gap-8">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1 sm:p-1.5 bg-[#0F2424] rounded-lg border border-[#00FFAA]/30 shrink-0">
                {activeTab === 'spionase' ? (
                  <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-[#00FFAA] animate-pulse" />
                ) : (
                  <Bomb className="h-4 w-4 sm:h-5 sm:w-5 text-orange-400 animate-pulse" />
                )}
              </div>
              <div>
                <h2 className="text-base sm:text-xl font-bold text-[#00FFAA] tracking-tight leading-none uppercase">
                  {activeTab === 'spionase' ? 'Badan Intelijen & Sandi Negara' : 'Divisi Operasi Khusus'}
                </h2>
              </div>
            </div>

            {/* 2 TAB MENU - dipindah ke header */}
            <div className="hidden sm:flex items-center gap-1 ml-4 lg:ml-8 pl-4 lg:pl-8 border-l border-[#00FFAA]/30">
              <button
                onClick={() => setActiveTab('spionase')}
                className={`px-4 lg:px-5 py-1.5 rounded-lg text-[10px] lg:text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${
                  activeTab === 'spionase'
                    ? 'bg-[#00FFAA] text-[#0A1A1A] shadow-md shadow-[#00FFAA]/20'
                    : 'text-[#6B8A8A] hover:text-[#00FFAA]'
                }`}
              >
                Spionase
              </button>
              <button
                onClick={() => setActiveTab('sabotase')}
                className={`px-4 lg:px-5 py-1.5 rounded-lg text-[10px] lg:text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${
                  activeTab === 'sabotase'
                    ? 'bg-[#00FFAA] text-[#0A1A1A] shadow-md shadow-[#00FFAA]/20'
                    : 'text-[#6B8A8A] hover:text-[#00FFAA]'
                }`}
              >
                Sabotase
              </button>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 lg:p-2 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] text-[#6B8A8A] hover:text-[#00FFAA] hover:border-[#00FFAA] transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1 shadow-sm">
            <span className="text-[10px] lg:text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* BODY MODAL */}
        <div className="flex-1 min-h-0 overflow-y-auto p-6 bg-[#0F2424] relative z-10 no-scrollbar flex flex-col items-center">
          <div className="w-full space-y-4">

            {/* 2 TAB MENU - tampilan mobile */}
            <div className="flex sm:hidden bg-[#0A1A1A] p-1 rounded-xl border border-[#00FFAA]/20 w-full shadow-sm">
              <button
                onClick={() => setActiveTab('spionase')}
                className={`flex-1 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                  activeTab === 'spionase'
                    ? 'bg-[#00FFAA] text-[#0A1A1A] shadow-md shadow-[#00FFAA]/20'
                    : 'text-[#6B8A8A] hover:text-[#00FFAA]'
                }`}
              >
                Spionase
              </button>
              <button
                onClick={() => setActiveTab('sabotase')}
                className={`flex-1 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                  activeTab === 'sabotase'
                    ? 'bg-[#00FFAA] text-[#0A1A1A] shadow-md shadow-[#00FFAA]/20'
                    : 'text-[#6B8A8A] hover:text-[#00FFAA]'
                }`}
              >
                Sabotase
              </button>
            </div>

            {/* RENDER KOMPONEN TABEL TERPISAH */}
            <div className="w-full overflow-hidden border border-[#00FFAA]/20 rounded-xl bg-[#0A1A1A] shadow-sm">
              <div className="max-h-[52vh] overflow-auto">
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

      <CovertOperationResultModal
        result={covertOperationResult}
        onClose={() => setCovertOperationResult(null)}
      />
    </div>
  );
}