'use client';

import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { NotebookModalWrapper } from '@/app/page/navigasi_menu/2_navigasi_bawah/NotebookModalWrapper'; 

export interface ClosedTradeRejectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  partnerCountry?: string;
  centralizationScore?: number;
  averageNationalization?: number;
  ideologyModifier?: number;
  religionModifier?: number;
  reasons?: string[];
}

export default function ClosedTradeRejectionModal({
  isOpen,
  onClose,
  partnerCountry,
  centralizationScore = 128.1,
  averageNationalization = 85.7,
  ideologyModifier = 1.3,
  religionModifier = 1.15,
  reasons = [
    'Sentralisasi ekonomi ekstrem (skor 128).',
    'Ideologi Komunisme meningkatkan skor sentralisasi.',
    'Agama Ateisme meningkatkan friksi dengan blok dagang internasional.',
  ],
}: ClosedTradeRejectionModalProps) {
  if (!isOpen) return null;

  return (
    <NotebookModalWrapper onClose={onClose} zIndexClass="z-[500000]">
      <div className="flex flex-col h-full overflow-hidden">
        
        {/* HEADER */}
        <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-rose-500/30 flex items-center justify-between bg-[#0A1A1A] relative z-10 gap-2 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1 sm:p-1.5 bg-rose-950/40 rounded-lg border border-rose-500/30 shrink-0">
              <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-rose-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-xl font-bold text-rose-400 tracking-tight leading-none uppercase">
                Akses Perdagangan Ditolak
              </h2>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 lg:p-2 rounded-xl border border-rose-500/30 bg-[#0F2424] text-rose-400 hover:bg-rose-500 hover:text-white transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1 shadow-sm"
          >
            <span className="text-[10px] lg:text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* BODY CONTENT */}
        <div className="flex-1 overflow-y-auto p-3.5 lg:p-5 2xl:p-8 bg-[#0A1A1A]/80 relative z-10 custom-scrollbar flex flex-col items-center justify-center text-center">
          
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mb-5 text-rose-400 shadow-inner shrink-0">
            <AlertTriangle className="w-8 h-8 sm:w-10 sm:h-10 text-rose-400" />
          </div>

          <h3 className="text-lg sm:text-xl lg:text-2xl font-black uppercase tracking-wide text-rose-400 mb-3">
            Akses Pasar Global Ditolak
          </h3>

          <p className="text-sm sm:text-base text-[#A7C4C4] leading-relaxed max-w-2xl mb-6">
            Negara Anda terisolasi dari Pasar Perdagangan Global karena skor sentralisasi
            melewati ambang blokir (sistem negara tertutup).
            {partnerCountry ? ` Tawaran perdagangan dari ${partnerCountry} tidak dapat diratifikasi.` : ''} 
            Turunkan rata-rata nasionalisasi atau ubah ideologi/agama agar skor turun di bawah 85.
          </p>

          {/* Metric Stats Box */}
          <div className="w-full max-w-2xl mb-6 grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 rounded-xl border border-rose-500/20 bg-[#0F2424] p-4 sm:p-5 text-left text-xs sm:text-sm shadow-sm">
            <div className="flex justify-between items-center">
              <span className="text-[#6B8A8A]">Skor sentralisasi</span>
              <strong className="text-rose-400 font-black">{centralizationScore.toFixed(1)}</strong>
            </div>
            <div className="flex justify-between items-center sm:border-l sm:border-rose-500/20 sm:pl-6">
              <span className="text-[#6B8A8A]">Rata-rata nasionalisasi</span>
              <strong className="text-[#E0E0E0] font-bold">{averageNationalization.toFixed(1)}%</strong>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#6B8A8A]">Modifier ideologi</span>
              <strong className="text-[#E0E0E0] font-bold">×{ideologyModifier.toFixed(2)}</strong>
            </div>
            <div className="flex justify-between items-center sm:border-l sm:border-rose-500/20 sm:pl-6">
              <span className="text-[#6B8A8A]">Modifier agama</span>
              <strong className="text-[#E0E0E0] font-bold">×{religionModifier.toFixed(2)}</strong>
            </div>
          </div>

          {/* Reasons List */}
          {reasons.length > 0 && (
            <ul className="w-full max-w-2xl space-y-2 text-left text-xs sm:text-sm text-[#E0E0E0] bg-[#0F2424] p-4 sm:p-5 rounded-xl border border-rose-500/20 shadow-sm">
              <span className="block font-bold text-rose-400 mb-2 border-b border-rose-500/20 pb-2 uppercase tracking-wide">
                Alasan Penolakan:
              </span>
              {reasons.map((r, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="text-rose-400 font-bold leading-none mt-0.5">✕</span>
                  <span className="leading-relaxed text-[#A7C4C4]">{r}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* FOOTER ACTIONS */}
        <div className="px-4 sm:px-6 py-3 border-t border-[#00FFAA]/20 bg-[#0A1A1A] flex justify-center shrink-0 relative z-10">
          <button
            type="button"
            onClick={onClose}
            className="px-8 py-2.5 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider cursor-pointer transition-all bg-rose-500/20 border border-rose-500/50 text-rose-400 hover:bg-rose-500/30 active:scale-95 shadow-sm"
          >
            Mengerti
          </button>
        </div>

      </div>
    </NotebookModalWrapper>
  );
}