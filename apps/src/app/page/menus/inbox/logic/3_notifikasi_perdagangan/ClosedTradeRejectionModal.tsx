'use client';

import SharedModalCloseButton from '@/app/page/root_modals_design_menu/ModalCloseButton';
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
        <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-rose-500/30 flex items-center justify-between bg-root-canvas relative z-10 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1 sm:p-1.5 bg-rose-950/40 rounded-lg border border-rose-500/30 shrink-0">
              <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-rose-400" />
            </div>
            <h2 className="text-sm sm:text-base font-bold text-rose-400 tracking-tight leading-none uppercase">
              Akses Perdagangan Ditolak
            </h2>
          </div>
          
          {/* 🔥 PERBAIKAN: Tombol Tutup disamakan ukurannya dengan modal sebelumnya */}
          <SharedModalCloseButton
            onClick={onClose} 
            className="p-1.5 lg:p-2 rounded-xl border border-rose-500/30 bg-root-surface text-rose-400 hover:bg-rose-500 hover:text-white transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1 shadow-sm shrink-0"
            appearance="custom">
            <span className="text-[10px] lg:text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
            <X className="h-4 w-4" />
          </SharedModalCloseButton>
        </div>

        {/* BODY CONTENT */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-root-canvas/80 relative z-10 custom-scrollbar">
          
          <div className="max-w-2xl mx-auto space-y-4">
            
            {/* Ringkasan penolakan dan langkah yang disarankan */}
            <div className="space-y-3">
              <h3 className="text-center text-base sm:text-lg font-black uppercase tracking-wide text-rose-400">
                Akses Pasar Global Ditolak
              </h3>
              <div className="space-y-2 text-left text-xs sm:text-sm leading-relaxed text-[#A7C4C4]">
                <p>
                  Akses negara Anda ke pasar perdagangan global dibatasi karena skor sentralisasi melewati ambang 85.
                </p>
                {partnerCountry && (
                  <p>
                    Tawaran perdagangan dari <span className="font-bold text-white">{partnerCountry}</span> tidak dapat diratifikasi.
                  </p>
                )}
              </div>
              <div className="rounded-lg border border-amber-400/20 bg-amber-950/20 px-3 py-2.5">
                <span className="mb-1 block text-[10px] font-black uppercase tracking-wider text-amber-300">
                  Tindakan yang disarankan
                </span>
                <p className="text-xs leading-relaxed text-[#D4E1E1]">
                  Turunkan tingkat nasionalisasi atau sesuaikan ideologi dan agama hingga skor sentralisasi di bawah 85.
                </p>
              </div>
            </div>

            {/* Metric Stats Box */}
            <div className="grid grid-cols-2 gap-2 rounded-lg border border-rose-500/20 bg-root-surface p-3 text-xs shadow-sm">
              <div className="flex flex-col">
                <span className="text-root-subtle text-[10px] uppercase font-bold">Skor Sentralisasi</span>
                <strong className="text-rose-400 font-black text-sm">{centralizationScore.toFixed(1)}</strong>
              </div>
              <div className="flex flex-col">
                <span className="text-root-subtle text-[10px] uppercase font-bold">Rata-rata Nasionalisasi</span>
                <strong className="text-root-text font-bold text-sm">{averageNationalization.toFixed(1)}%</strong>
              </div>
              <div className="flex flex-col">
                <span className="text-root-subtle text-[10px] uppercase font-bold">Mod. Ideologi</span>
                <strong className="text-root-text font-bold text-sm">×{ideologyModifier.toFixed(2)}</strong>
              </div>
              <div className="flex flex-col">
                <span className="text-root-subtle text-[10px] uppercase font-bold">Mod. Agama</span>
                <strong className="text-root-text font-bold text-sm">×{religionModifier.toFixed(2)}</strong>
              </div>
            </div>

            {/* Reasons List */}
            {reasons.length > 0 && (
              <div className="rounded-lg border border-rose-500/20 bg-root-surface p-3 shadow-sm">
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

        {/* FOOTER ACTIONS */}
        <div className="px-4 py-2.5 border-t border-root-accent/20 bg-root-canvas flex justify-center shrink-0 relative z-10">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-1.5 rounded-lg font-black text-[11px] uppercase tracking-wider cursor-pointer transition-all bg-rose-500/20 border border-rose-500/50 text-rose-400 hover:bg-rose-500/30 active:scale-95 shadow-sm"
          >
            Mengerti
          </button>
        </div>

      </div>
    </NotebookModalWrapper>
  );
}