'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FlaskConical, X, Banknote, Shield, Globe2, Info } from 'lucide-react';
import { ATHEISM_RESEARCH_SPEED_BONUS } from '@/app/page/bonus_logic/agama_bonus_logic/ateisme';
import {
  calculateEducationPoints,
  getEducationResearchModifier,
  getResearchContractDurationReduction,
} from '@/app/page/downgrade_logic';
import { isMemberOfUNESCO, isMemberOfITU } from '@/app/page/bonus_logic';

export type SelectionCategoryKey = 'ekonomi' | 'militer' | 'diplomasi';

interface PenelitianSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCategory: (category: SelectionCategoryKey) => void;
  religion?: unknown;
  countryDetail?: any;
}

export default function PenelitianSelectionModal({
  isOpen,
  onClose,
  onSelectCategory,
  religion,
  countryDetail,
}: PenelitianSelectionModalProps) {
  const [mounted, setMounted] = useState(false);
  const hasAtheismResearchBonus = String(religion || '').trim().toLowerCase() === 'ateisme';
  const countryName = countryDetail?.country || '';
  const isUNESCOMember = isMemberOfUNESCO(countryName);
  const isITUMember = isMemberOfITU(countryName);

  const educationPoints = calculateEducationPoints(countryDetail);
  const educationModifier = getEducationResearchModifier(educationPoints);
  const researchContracts = Array.isArray(countryDetail?.researchContracts) ? countryDetail.researchContracts : [];
  const contractBonus = getResearchContractDurationReduction(researchContracts);
  const contractBonusLabel = `KONTRAK PENELITIAN (${contractBonus.count} NEGARA): -${contractBonus.percentage.toFixed(1)}% DURASI`;
  const renderResearchContractBonus = () => (
    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-sky-500/10 text-sky-300 border border-sky-500/30 mb-1.5">
      {contractBonusLabel}
    </span>
  );

  const [showBonusModal, setShowBonusModal] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[250] flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none">
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans pointer-events-auto shadow-2xl p-6 sm:p-8 items-center text-center justify-center overflow-y-auto custom-scrollbar"
      >
        {/* BUTTON INFO / BONUS RISET (DISAMPING KIRI) */}
        <button
          onClick={() => setShowBonusModal(!showBonusModal)}
          className="absolute top-4 left-4 p-1.5 lg:p-2 rounded-xl border border-[#00FFAA]/30 bg-[#0A1A1A] text-[#6B8A8A] hover:text-[#00FFAA] hover:border-[#00FFAA] transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1.5 shadow-sm z-30"
          title="Lihat Bonus & Modifier Riset"
        >
          <Info className="h-4 w-4 text-[#00FFAA]" />
          <span className="text-[10px] lg:text-xs font-semibold uppercase tracking-widest pr-1">Bonus Riset</span>
        </button>

        {/* BUTTON TUTUP */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 lg:p-2 rounded-xl border border-[#00FFAA]/30 bg-[#0A1A1A] text-[#6B8A8A] hover:text-[#00FFAA] hover:border-[#00FFAA] transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1 shadow-sm z-30"
          title="Tutup Modal"
        >
          <span className="text-[10px] lg:text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
          <X className="h-4 w-4" />
        </button>

        {/* MODAL / POPOVER BONUS & MODIFIER RISET */}
        {showBonusModal && (
          <div className="absolute inset-0 bg-[#0A1A1A]/95 z-40 p-6 sm:p-8 flex flex-col items-center justify-center text-left animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setShowBonusModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] text-[#6B8A8A] hover:text-[#00FFAA] transition-all"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="w-full max-w-md bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#00FFAA]/20">
                <Info className="w-5 h-5 text-[#00FFAA]" />
                <h3 className="text-base font-black text-[#00FFAA] uppercase tracking-wider">
                  Daftar Bonus & Modifier Riset
                </h3>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0A1A1A] border border-[#00FFAA]/20">
                  <span className="font-semibold text-gray-300">Keanggotaan UNESCO:</span>
                  <span className={`font-bold uppercase px-2 py-0.5 rounded text-[10px] ${
                    isUNESCOMember ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-gray-800 text-gray-400'
                  }`}>
                    {isUNESCOMember ? 'Aktif (+5% Riset Sains)' : 'Tidak Aktif'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0A1A1A] border border-[#00FFAA]/20">
                  <span className="font-semibold text-gray-300">Keanggotaan ITU:</span>
                  <span className={`font-bold uppercase px-2 py-0.5 rounded text-[10px] ${
                    isITUMember ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-gray-800 text-gray-400'
                  }`}>
                    {isITUMember ? 'Aktif (+5% Kecepatan Riset)' : 'Tidak Aktif'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0A1A1A] border border-[#00FFAA]/20">
                  <span className="font-semibold text-gray-300">Efek Pendidikan ({educationPoints} Poin):</span>
                  <span className={`font-bold uppercase px-2 py-0.5 rounded text-[10px] ${
                    educationModifier.isPenalty
                      ? 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
                      : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                  }`}>
                    {educationModifier.label.toUpperCase()}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0A1A1A] border border-[#00FFAA]/20">
                  <span className="font-semibold text-gray-300">Agama Ateisme:</span>
                  <span className={`font-bold uppercase px-2 py-0.5 rounded text-[10px] ${
                    hasAtheismResearchBonus ? 'bg-rose-500/10 text-rose-300 border border-rose-500/30' : 'bg-gray-800 text-gray-400'
                  }`}>
                    {hasAtheismResearchBonus ? 'Aktif (Durasi -15%)' : 'Tidak Aktif'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0A1A1A] border border-[#00FFAA]/20">
                  <span className="font-semibold text-gray-300">Kontrak Penelitian:</span>
                  <span className="font-bold uppercase px-2 py-0.5 rounded text-[10px] bg-sky-500/10 text-sky-300 border border-sky-500/30">
                    {contractBonus.count} Negara (-{contractBonus.percentage.toFixed(1)}%)
                  </span>
                </div>
              </div>

              <button
                onClick={() => setShowBonusModal(false)}
                className="w-full mt-5 py-2.5 rounded-xl bg-[#00FFAA] text-[#0A1A1A] font-black text-xs uppercase tracking-wider hover:bg-[#00FFAA]/80 transition-all cursor-pointer"
              >
                Mengerti
              </button>
            </div>
          </div>
        )}

        <div className="w-16 h-16 rounded-2xl bg-[#0A1A1A] border-2 border-[#00FFAA]/50 flex items-center justify-center mb-4 shadow-inner">
          <FlaskConical className="w-8 h-8 text-[#00FFAA] animate-pulse" />
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-[#00FFAA] uppercase tracking-wide mb-1">
          Fokus Utama Penelitian
        </h2>
        <p className="text-xs sm:text-sm text-[#6B8A8A] font-semibold mb-8 max-w-md">
          Pilih sektor riset strategis nasional yang ingin Anda akses terlebih dahulu.
        </p>

        {/* 3 CARD HORIZONTAL */}
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 mt-2">
          {/* CARD 1: EKONOMI */}
          {(() => {
            const slot = countryDetail?.active_research_by_category?.ekonomi || (
              countryDetail?.active_research && String(countryDetail.active_research).includes('otomasi') || String(countryDetail.active_research).includes('manufaktur') || String(countryDetail.active_research).includes('peternakan') || String(countryDetail.active_research).includes('agrikultur') || String(countryDetail.active_research).includes('perikanan') || String(countryDetail.active_research).includes('pangan')
                ? { endDate: countryDetail.active_research_end_date }
                : null
            );
            const endDateStr = slot?.endDate;
            const formattedDate = (() => {
              if (!endDateStr) return '';
              const [y, m, d] = String(endDateStr).split('-').map(Number);
              const date = new Date(y, m - 1, d);
              if (isNaN(date.getTime())) return endDateStr;
              const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];
              return `${d} ${monthNames[date.getMonth()]}, ${date.getFullYear()}`;
            })();

            return (
              <div className="relative group h-full">
                {formattedDate && (
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-20 bg-[#0A1A1A] text-[#00FFAA] text-[10px] font-bold px-2 py-1 border border-[#00FFAA]/30 rounded-sm shadow-md tracking-wider whitespace-nowrap">
                    {formattedDate}
                  </div>
                )}
                <button
                  onClick={() => onSelectCategory('ekonomi')}
                  className="w-full group flex flex-col items-center justify-between text-center p-6 rounded-2xl bg-[#0A1A1A] border border-[#00FFAA]/30 hover:border-[#00FFAA] hover:bg-[#00FFAA]/10 active:scale-[0.98] transition-all cursor-pointer shadow-md h-full min-h-[220px]"
                >
                  <div className="flex flex-col items-center w-full">
                    <div className="p-3.5 rounded-xl bg-[#0F2424] border border-[#00FFAA]/40 text-[#00FFAA] group-hover:bg-[#00FFAA] group-hover:text-[#0A1A1A] transition-all shrink-0 mb-4 shadow-sm">
                      <Banknote className="w-7 h-7" />
                    </div>

                    <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-md bg-[#00FFAA]/15 text-[#00FFAA] border border-[#00FFAA]/30 mb-3 tracking-wider">
                      Produksi & Pajak
                    </span>

                    <h3 className="text-sm font-black text-white uppercase tracking-wider group-hover:text-[#00FFAA] transition-colors leading-tight">
                      Riset Ekonomi & Industri
                    </h3>
                  </div>
                </button>
              </div>
            );
          })()}

          {/* CARD 2: MILITER */}
          {(() => {
            const slot = countryDetail?.active_research_by_category?.militer;
            const endDateStr = slot?.endDate;
            const formattedDate = (() => {
              if (!endDateStr) return '';
              const [y, m, d] = String(endDateStr).split('-').map(Number);
              const date = new Date(y, m - 1, d);
              if (isNaN(date.getTime())) return endDateStr;
              const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];
              return `${d} ${monthNames[date.getMonth()]}, ${date.getFullYear()}`;
            })();

            return (
              <div className="relative group h-full">
                {formattedDate && (
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-20 bg-[#0A1A1A] text-[#00FFAA] text-[10px] font-bold px-2 py-1 border border-[#00FFAA]/30 rounded-sm shadow-md tracking-wider whitespace-nowrap">
                    {formattedDate}
                  </div>
                )}
                <button
                  onClick={() => onSelectCategory('militer')}
                  className="w-full group flex flex-col items-center justify-between text-center p-6 rounded-2xl bg-[#0A1A1A] border border-[#00FFAA]/30 hover:border-[#00FFAA] hover:bg-[#00FFAA]/10 active:scale-[0.98] transition-all cursor-pointer shadow-md h-full min-h-[220px]"
                >
                  <div className="flex flex-col items-center w-full">
                    <div className="p-3.5 rounded-xl bg-[#0F2424] border border-[#00FFAA]/40 text-[#00FFAA] group-hover:bg-[#00FFAA] group-hover:text-[#0A1A1A] transition-all shrink-0 mb-4 shadow-sm">
                      <Shield className="w-7 h-7" />
                    </div>

                    <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-md bg-[#00FFAA]/15 text-[#00FFAA] border border-[#00FFAA]/30 mb-3 tracking-wider">
                      Alutsista & Siber
                    </span>

                    <h3 className="text-sm font-black text-white uppercase tracking-wider group-hover:text-[#00FFAA] transition-colors leading-tight">
                      Riset Militer & Pertahanan
                    </h3>
                  </div>
                </button>
              </div>
            );
          })()}

          {/* CARD 3: DIPLOMASI */}
          {(() => {
            const slot = countryDetail?.active_research_by_category?.diplomasi;
            const endDateStr = slot?.endDate;
            const formattedDate = (() => {
              if (!endDateStr) return '';
              const [y, m, d] = String(endDateStr).split('-').map(Number);
              const date = new Date(y, m - 1, d);
              if (isNaN(date.getTime())) return endDateStr;
              const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];
              return `${d} ${monthNames[date.getMonth()]}, ${date.getFullYear()}`;
            })();

            return (
              <div className="relative group h-full">
                {formattedDate && (
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-20 bg-[#0A1A1A] text-[#00FFAA] text-[10px] font-bold px-2 py-1 border border-[#00FFAA]/30 rounded-sm shadow-md tracking-wider whitespace-nowrap">
                    {formattedDate}
                  </div>
                )}
                <button
                  onClick={() => onSelectCategory('diplomasi')}
                  className="w-full group flex flex-col items-center justify-between text-center p-6 rounded-2xl bg-[#0A1A1A] border border-[#00FFAA]/30 hover:border-[#00FFAA] hover:bg-[#00FFAA]/10 active:scale-[0.98] transition-all cursor-pointer shadow-md h-full min-h-[220px]"
                >
                  <div className="flex flex-col items-center w-full">
                    <div className="p-3.5 rounded-xl bg-[#0F2424] border border-[#00FFAA]/40 text-[#00FFAA] group-hover:bg-[#00FFAA] group-hover:text-[#0A1A1A] transition-all shrink-0 mb-4 shadow-sm">
                      <Globe2 className="w-7 h-7" />
                    </div>

                    <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-md bg-[#00FFAA]/15 text-[#00FFAA] border border-[#00FFAA]/30 mb-3 tracking-wider">
                      Geopolitik & Spionase
                    </span>

                    <h3 className="text-sm font-black text-white uppercase tracking-wider group-hover:text-[#00FFAA] transition-colors leading-tight">
                      Riset Diplomasi & Intelijen
                    </h3>
                  </div>
                </button>
              </div>
            );
          })()}
        </div>
      </div>
    </div>,
    document.body
  );
}