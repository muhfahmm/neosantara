'use client';

import { AlertTriangle, X } from 'lucide-react';
import { createPortal } from 'react-dom';

interface SeranganMasihBerlangsungModalProps {
  isOpen: boolean;
  countryName: string;
  onClose: () => void;
}

export default function SeranganMasihBerlangsungModal({
  isOpen,
  countryName,
  onClose,
}: SeranganMasihBerlangsungModalProps) {
  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    // 🔥 PERBAIKAN: Menghapus bg-black/70 & backdrop-blur-md, menggunakan pointer-events-none
    <div
      className="fixed inset-0 z-[100000001] flex items-center justify-center p-4 font-sans text-white pointer-events-none"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="attack-in-progress-title"
    >
      <div className="w-full max-w-lg max-h-[calc(100dvh-2rem)] overflow-y-auto flex flex-col bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl shadow-2xl relative pointer-events-auto">
        
        <div className="flex items-center justify-between border-b border-amber-400/20 bg-[#0A1A1A] px-5 sm:px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg border border-amber-400/30 bg-amber-500/10 shrink-0">
              <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-amber-400" />
            </div>
            <h2
              id="attack-in-progress-title"
              className="text-base sm:text-lg font-black uppercase tracking-wide text-amber-300"
            >
              Serangan Masih Berlangsung
            </h2>
          </div>
          
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#6B8A8A] transition-colors hover:text-amber-400 cursor-pointer shrink-0"
            aria-label="Tutup"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 p-5 sm:p-6">
          <p className="text-sm leading-relaxed text-[#E0E0E0]">
            Negara Anda sedang menjalankan operasi militer terhadap{' '}
            <strong className="text-white">{countryName}</strong>. Anda tidak dapat
            melancarkan serangan kedua ke negara yang sama sebelum operasi ini selesai.
          </p>
          <p className="text-sm leading-relaxed text-[#6B8A8A]">
            Tunggu hingga hasil perang ditentukan dan pilih tindakan untuk mengakhiri
            operasi yang sedang berlangsung.
          </p>
        </div>

        <div className="flex justify-end border-t border-amber-400/20 bg-[#0A1A1A] p-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-[#0A1A1A] font-black text-[11px] sm:text-xs uppercase tracking-widest transition-all duration-150 cursor-pointer shadow hover:shadow-md active:scale-[0.98]"
          >
            Mengerti
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
}