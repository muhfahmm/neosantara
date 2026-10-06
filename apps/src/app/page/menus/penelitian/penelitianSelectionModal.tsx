'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FlaskConical, X, Banknote, Shield, Globe2 } from 'lucide-react';
import { ATHEISM_RESEARCH_SPEED_BONUS } from '@/app/page/navigasi_menu/2_navigasi_bawah/5_pembangunan/1_produksi/bonus_logic/agama_bonus_logic/ateisme';

export type SelectionCategoryKey = 'ekonomi' | 'militer' | 'diplomasi';

interface PenelitianSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCategory: (category: SelectionCategoryKey) => void;
  religion?: unknown;
}

export default function PenelitianSelectionModal({
  isOpen,
  onClose,
  onSelectCategory,
  religion,
}: PenelitianSelectionModalProps) {
  const [mounted, setMounted] = useState(false);
  const hasAtheismResearchBonus = String(religion || '').trim().toLowerCase() === 'ateisme';

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
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 lg:p-2 rounded-xl border border-[#00FFAA]/30 bg-[#0A1A1A] text-[#6B8A8A] hover:text-[#00FFAA] hover:border-[#00FFAA] transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1 shadow-sm"
          title="Tutup Modal"
        >
          <span className="text-[10px] lg:text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
          <X className="h-4 w-4" />
        </button>

        <div className="w-16 h-16 rounded-2xl bg-[#0A1A1A] border-2 border-[#00FFAA]/50 flex items-center justify-center mb-4 shadow-inner">
          <FlaskConical className="w-8 h-8 text-[#00FFAA] animate-pulse" />
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-[#00FFAA] uppercase tracking-wide mb-1">
          Fokus Utama Penelitian
        </h2>
        <p className="text-xs sm:text-sm text-[#6B8A8A] font-semibold mb-6 max-w-md">
          Pilih sektor riset strategis nasional yang ingin Anda akses terlebih dahulu.
        </p>

        {/* 3 CARD HORIZONTAL */}
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* CARD 1: EKONOMI */}
          <button
            onClick={() => onSelectCategory('ekonomi')}
            className="group flex flex-col items-center text-center p-5 rounded-2xl bg-[#0A1A1A] border border-[#00FFAA]/30 hover:border-[#00FFAA] hover:bg-[#00FFAA]/10 active:scale-[0.98] transition-all cursor-pointer shadow-md h-full"
          >
            <div className="p-3 rounded-xl bg-[#0F2424] border border-[#00FFAA]/40 text-[#00FFAA] group-hover:bg-[#00FFAA] group-hover:text-[#0A1A1A] transition-all shrink-0 mb-3">
              <Banknote className="w-6 h-6" />
            </div>

            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-[#00FFAA]/15 text-[#00FFAA] border border-[#00FFAA]/30 mb-2">
              Produksi & Pajak
            </span>
            {hasAtheismResearchBonus && (
              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/30 mb-2">
                Bonus Ateisme: Kecepatan riset +{ATHEISM_RESEARCH_SPEED_BONUS * 100}%
              </span>
            )}

            <h3 className="text-sm font-black text-white uppercase tracking-wider group-hover:text-[#00FFAA] transition-colors mb-2 leading-tight">
              1. Riset Ekonomi & Industri
            </h3>

            <p className="text-[11px] text-[#6B8A8A] font-semibold leading-snug">
              Pengembangan manufaktur, pertambangan, logistik, & efisiensi pendapatan negara.
            </p>
          </button>

          {/* CARD 2: MILITER */}
          <button
            onClick={() => onSelectCategory('militer')}
            className="group flex flex-col items-center text-center p-5 rounded-2xl bg-[#0A1A1A] border border-[#00FFAA]/30 hover:border-[#00FFAA] hover:bg-[#00FFAA]/10 active:scale-[0.98] transition-all cursor-pointer shadow-md h-full"
          >
            <div className="p-3 rounded-xl bg-[#0F2424] border border-[#00FFAA]/40 text-[#00FFAA] group-hover:bg-[#00FFAA] group-hover:text-[#0A1A1A] transition-all shrink-0 mb-3">
              <Shield className="w-6 h-6" />
            </div>

            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-[#00FFAA]/15 text-[#00FFAA] border border-[#00FFAA]/30 mb-2">
              Alutsista & Siber
            </span>
            {hasAtheismResearchBonus && (
              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/30 mb-2">
                Bonus Ateisme: Kecepatan riset +{ATHEISM_RESEARCH_SPEED_BONUS * 100}%
              </span>
            )}

            <h3 className="text-sm font-black text-white uppercase tracking-wider group-hover:text-[#00FFAA] transition-colors mb-2 leading-tight">
              2. Riset Militer & Pertahanan
            </h3>

            <p className="text-[11px] text-[#6B8A8A] font-semibold leading-snug">
              Pengembangan armada darat/laut/udara, perang siber, rudal, & pertahanan nuklir.
            </p>
          </button>

          {/* CARD 3: DIPLOMASI */}
          <button
            onClick={() => onSelectCategory('diplomasi')}
            className="group flex flex-col items-center text-center p-5 rounded-2xl bg-[#0A1A1A] border border-[#00FFAA]/30 hover:border-[#00FFAA] hover:bg-[#00FFAA]/10 active:scale-[0.98] transition-all cursor-pointer shadow-md h-full"
          >
            <div className="p-3 rounded-xl bg-[#0F2424] border border-[#00FFAA]/40 text-[#00FFAA] group-hover:bg-[#00FFAA] group-hover:text-[#0A1A1A] transition-all shrink-0 mb-3">
              <Globe2 className="w-6 h-6" />
            </div>

            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-[#00FFAA]/15 text-[#00FFAA] border border-[#00FFAA]/30 mb-2">
              Geopolitik & Spionase
            </span>
            {hasAtheismResearchBonus && (
              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/30 mb-2">
                Bonus Ateisme: Kecepatan riset +{ATHEISM_RESEARCH_SPEED_BONUS * 100}%
              </span>
            )}

            <h3 className="text-sm font-black text-white uppercase tracking-wider group-hover:text-[#00FFAA] transition-colors mb-2 leading-tight">
              3. Riset Diplomasi & Intelijen
            </h3>

            <p className="text-[11px] text-[#6B8A8A] font-semibold leading-snug">
              Jaringan intelijen internasional, enkripsi kriptografi, & diplomasi PBB.
            </p>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}