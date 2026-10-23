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
        
        {/* HEADER - Lebih tipis */}
        <div className="px-4 py-2 border-b border-rose-500/30 flex items-center justify-between bg-[#0A1A1A] relative z-10 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-rose-950/40 rounded-lg border border-rose-500/30 shrink-0">
              <AlertTriangle className="h-4 w-4 text-rose-400" />
            </div>
            <h2 className="text-sm sm:text-base font-bold text-rose-400 tracking-tight leading-none uppercase">
              Akses Perdagangan Ditolak
            </h2>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 rounded-lg border border-rose-500/30 bg-[#0F2424] text-rose-400 hover:bg-rose-500 hover:text-white transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1"
          >
            <span className="text-[10px] font-semibold tracking-wider pl-1">Tutup</span>
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* BODY CONTENT - Lebih padat, ikon besar dihapus */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-[#0A1A1A]/80 relative z-10 custom-scrollbar">
          
          <div className="max-w-2xl mx-auto space-y-4">
            
            {/* Teks Utama */}
            <div className="text-center">
              <h3 className="text-base sm:text-lg font-black uppercase tracking-wide text-rose-400 mb-1">
                Akses Pasar Global Ditolak
              </h3>
              <p className="text-xs sm:text-sm text-[#A7C4C4] leading-relaxed">
                Negara Anda terisolasi dari Pasar Perdagangan Global karena skor sentralisasi melewati ambang blokir.
                {partnerCountry ? ` Tawaran dari ${partnerCountry} tidak dapat diratifikasi.` : ''} Turunkan nasionalisasi atau ubah ideologi/agama agar skor di bawah 85.
              </p>
            </div>

            {/* Metric Stats Box - Grid dibuat lebih padat */}
            <div className="grid grid-cols-2 gap-2 rounded-lg border border-rose-500/20 bg-[#0F2424] p-3 text-xs shadow-sm">
              <div className="flex flex-col">
                <span className="text-[#6B8A8A] text-[10px] uppercase font-bold">Skor Sentralisasi</span>
                <strong className="text-rose-400 font-black text-sm">{centralizationScore.toFixed(1)}</strong>
              </div>
              <div className="flex flex-col">
                <span className="text-[#6B8A8A] text-[10px] uppercase font-bold">Rata-rata Nasionalisasi</span>
                <strong className="text-[#E0E0E0] font-bold text-sm">{averageNationalization.toFixed(1)}%</strong>
              </div>
              <div className="flex flex-col">
                <span className="text-[#6B8A8A] text-[10px] uppercase font-bold">Mod. Ideologi</span>
                <strong className="text-[#E0E0E0] font-bold text-sm">×{ideologyModifier.toFixed(2)}</strong>
              </div>
              <div className="flex flex-col">
                <span className="text-[#6B8A8A] text-[10px] uppercase font-bold">Mod. Agama</span>
                <strong className="text-[#E0E0E0] font-bold text-sm">×{religionModifier.toFixed(2)}</strong>
              </div>
            </div>

            {/* Reasons List - Dibuat lebih rapat */}
            {reasons.length > 0 && (
              <div className="rounded-lg border border-rose-500/20 bg-[#0F2424] p-3 shadow-sm">
                <span className="block font-bold text-rose-400 mb-1.5 text-[10px] uppercase tracking-wider">
                  Alasan Penolakan:
                </span>
                <ul className="space-y-1">
                  {reasons.map((r, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs">
                      <span className="text-rose-400 font-bold leading-none mt-0.5 text-[10px]">✕</span>
                      <span className="leading-snug text-[#A7C4C4]">{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

          </div>
        </div>

        {/* FOOTER ACTIONS - Lebih tipis */}
        <div className="px-4 py-2.5 border-t border-[#00FFAA]/20 bg-[#0A1A1A] flex justify-center shrink-0 relative z-10">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-1.5 rounded-lg font-black text-[11px] uppercase tracking-wider cursor-pointer transition-all bg-rose-500/20 border border-rose-500/50 text-rose-400 hover:bg-rose-500/30 active:scale-95"
          >
            Mengerti
          </button>
        </div>

      </div>
    </NotebookModalWrapper>
  );
}