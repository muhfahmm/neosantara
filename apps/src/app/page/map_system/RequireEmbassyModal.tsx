'use client';

import SharedModalCloseButton from '@/app/page/root_modals_design_menu/ModalCloseButton';
import React from 'react';
import NotebookModalWrapper from "@/app/page/navigasi_menu/2_navigasi_bawah/NotebookModalWrapper";
import { Building2, X, ArrowRight } from 'lucide-react';
import { COUNTRIES_DATA } from '@/app/page/map_system/map-data';

interface RequireEmbassyModalProps {
  isOpen: boolean;
  partnerName: string | null;
  onClose: () => void;
  onProceedToDetail: (partnerName: string) => void;
}

export function RequireEmbassyModal({
  isOpen,
  partnerName,
  onClose,
  onProceedToDetail
}: RequireEmbassyModalProps) {
  if (!isOpen || !partnerName) return null;

  const foundCountry = COUNTRIES_DATA?.find(
    c => c.country?.toLowerCase().trim() === partnerName?.toLowerCase().trim()
  );
  const iso = foundCountry?.iso?.toLowerCase() || '';

  return (
    <NotebookModalWrapper compact maxWidthClass="max-w-md" zIndexClass="z-[300]">
      <div className="relative w-full overflow-hidden flex flex-col font-sans pointer-events-auto">
        
        {/* Glow Accent Header */}


        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-root-accent/20 pb-4 mb-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-root-accent/10 border border-root-accent/40 flex items-center justify-center text-root-accent shrink-0 shadow">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold text-root-accent bg-root-accent/10 px-2 py-0.5 rounded border border-root-accent/30 uppercase tracking-wider">
                Diplomasi Syarat
              </span>
              <h3 className="text-base font-bold text-white uppercase tracking-tight leading-snug mt-0.5">
                Kedutaan Besar Diperlukan
              </h3>
            </div>
          </div>
          <SharedModalCloseButton
            onClick={onClose}
            className="p-1.5 rounded-lg border border-root-accent/20 bg-root-canvas text-root-accent/70 hover:text-root-accent hover:bg-root-accent/10 transition-all cursor-pointer"
           appearance="custom">
            <X className="w-4 h-4" />
          </SharedModalCloseButton>
        </div>

        {/* Body Content */}
        <div className="space-y-4 relative z-10">
          {/* Flag & Country Badge */}
          <div className="bg-root-canvas border border-root-accent/30 rounded-xl p-3.5 flex items-center gap-3">
            <div className="w-10 h-7 rounded overflow-hidden border border-root-accent/30 bg-[#051111] shrink-0 shadow">
              {iso ? (
                <img
                  src={`https://flagcdn.com/w80/${iso}.png`}
                  alt={partnerName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-root-accent">🌐</div>
              )}
            </div>
            <div>
              <div className="text-[10px] font-bold text-[#A0C0C0] uppercase">Negara Pengaju Hubungan</div>
              <div className="text-sm font-extrabold text-root-accent uppercase tracking-wide">{partnerName}</div>
            </div>
          </div>

          <p className="text-xs text-root-text leading-relaxed">
            Lapor Presiden! Untuk secara resmi menerima penawaran Hubungan Perdagangan dari <strong className="text-root-accent">{partnerName}</strong>, pemerintah kita wajib memiliki <strong className="text-root-accent">Kedutaan Besar</strong> di negara tersebut.
          </p>

          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-[11px] text-amber-300 font-medium leading-normal flex items-start gap-2">
            <span className="text-base leading-none">⚠️</span>
            <span>Anda akan dialihkan ke menu <strong>Detail Negara {partnerName}</strong> untuk mendirikan Kedutaan Besar.</span>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex items-center gap-3 mt-6 relative z-10 pt-2 border-t border-root-accent/15">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl border border-root-accent/30 bg-root-canvas text-[#A0C0C0] hover:text-white hover:bg-root-accent/10 transition-all font-bold text-xs uppercase tracking-wider cursor-pointer text-center"
          >
            Batal
          </button>
          <button
            onClick={() => onProceedToDetail(partnerName)}
            className="flex-1 py-2.5 px-4 rounded-xl bg-root-accent hover:bg-root-accent/80 text-root-canvas transition-all font-extrabold text-xs uppercase tracking-wider cursor-pointer shadow-[0_0_15px_rgba(0,255,170,0.4)] flex items-center justify-center gap-1.5"
          >
            <span>Buka Detail Negara</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </NotebookModalWrapper>
  );
}