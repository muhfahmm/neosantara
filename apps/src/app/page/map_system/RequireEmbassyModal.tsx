'use client';

import React from 'react';
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
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 animate-in fade-in duration-200">
      <div className="bg-[#0F2424] border-2 border-[#00FFAA]/40 rounded-2xl p-6 sm:p-7 shadow-[0_0_50px_rgba(0,255,170,0.2)] max-w-md w-full relative overflow-hidden flex flex-col font-sans">
        
        {/* Glow Accent Header */}
        <div className="absolute -top-12 -left-12 w-36 h-36 bg-[#00FFAA]/10 rounded-full blur-2xl pointer-events-none" />

        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-[#00FFAA]/20 pb-4 mb-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00FFAA]/10 border border-[#00FFAA]/40 flex items-center justify-center text-[#00FFAA] shrink-0 shadow">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold text-[#00FFAA] bg-[#00FFAA]/10 px-2 py-0.5 rounded border border-[#00FFAA]/30 uppercase tracking-wider">
                Diplomasi Syarat
              </span>
              <h3 className="text-base font-bold text-white uppercase tracking-tight leading-snug mt-0.5">
                Kedutaan Besar Diperlukan
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border border-[#00FFAA]/20 bg-[#0A1A1A] text-[#00FFAA]/70 hover:text-[#00FFAA] hover:bg-[#00FFAA]/10 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Content */}
        <div className="space-y-4 relative z-10">
          {/* Flag & Country Badge */}
          <div className="bg-[#0A1A1A] border border-[#00FFAA]/30 rounded-xl p-3.5 flex items-center gap-3">
            <div className="w-10 h-7 rounded overflow-hidden border border-[#00FFAA]/30 bg-[#051111] shrink-0 shadow">
              {iso ? (
                <img
                  src={`https://flagcdn.com/w80/${iso}.png`}
                  alt={partnerName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-[#00FFAA]">🌐</div>
              )}
            </div>
            <div>
              <div className="text-[10px] font-bold text-[#A0C0C0] uppercase">Negara Pengaju Hubungan</div>
              <div className="text-sm font-extrabold text-[#00FFAA] uppercase tracking-wide">{partnerName}</div>
            </div>
          </div>

          <p className="text-xs text-[#E0E0E0] leading-relaxed">
            Lapor Presiden! Untuk secara resmi menerima penawaran Hubungan Perdagangan dari <strong className="text-[#00FFAA]">{partnerName}</strong>, pemerintah kita wajib memiliki <strong className="text-[#00FFAA]">Kedutaan Besar</strong> di negara tersebut.
          </p>

          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-[11px] text-amber-300 font-medium leading-normal flex items-start gap-2">
            <span className="text-base leading-none">⚠️</span>
            <span>Anda akan dialihkan ke menu <strong>Detail Negara {partnerName}</strong> untuk mendirikan Kedutaan Besar.</span>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex items-center gap-3 mt-6 relative z-10 pt-2 border-t border-[#00FFAA]/15">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl border border-[#00FFAA]/30 bg-[#0A1A1A] text-[#A0C0C0] hover:text-white hover:bg-[#00FFAA]/10 transition-all font-bold text-xs uppercase tracking-wider cursor-pointer text-center"
          >
            Batal
          </button>
          <button
            onClick={() => onProceedToDetail(partnerName)}
            className="flex-1 py-2.5 px-4 rounded-xl bg-[#00FFAA] hover:bg-[#00FFAA]/80 text-[#0A1A1A] transition-all font-extrabold text-xs uppercase tracking-wider cursor-pointer shadow-[0_0_15px_rgba(0,255,170,0.4)] flex items-center justify-center gap-1.5"
          >
            <span>Buka Detail Negara</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}