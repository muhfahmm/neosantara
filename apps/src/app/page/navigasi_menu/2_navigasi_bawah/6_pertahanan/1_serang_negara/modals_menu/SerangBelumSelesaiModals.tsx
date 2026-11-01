'use client';

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle } from 'lucide-react';

interface SerangBelumSelesaiModalsProps {
  isOpen: boolean;
  onClose: () => void;
  ongoingTarget: string;
  ongoingCity?: string;
  requestedTarget?: string;
}

export default function SerangBelumSelesaiModals({
  isOpen,
  onClose,
  ongoingTarget,
  ongoingCity,
  requestedTarget,
}: SerangBelumSelesaiModalsProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    closeButtonRef.current?.focus();
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || typeof document === 'undefined') return null;

  const targetLabel = `${ongoingTarget}${ongoingCity ? ` (${ongoingCity})` : ''}`;

  return createPortal(
    // 🔥 PERBAIKAN: Menghapus bg-black/70 & backdrop-blur-md, menggunakan pointer-events-none pada wrapper
    <div className="fixed inset-0 z-[100000001] flex items-center justify-center p-4 font-sans text-white pointer-events-none">
      
      {/* 🔥 PERBAIKAN: Container lebih lebar (max-w-2xl) dan panjang (min-h-[450px]) */}
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="attack-in-progress-title"
        className="w-full max-w-2xl min-h-[450px] flex flex-col bg-[#0F2424] border border-rose-500/40 rounded-2xl p-6 sm:p-8 shadow-[0_0_40px_rgba(255,45,85,0.15)] relative pointer-events-auto"
      >
        
        {/* Header */}
        <div className="flex items-center justify-start border-b border-rose-500/20 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg border border-rose-500/30 bg-rose-500/10 shrink-0">
              <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-rose-400" aria-hidden="true" />
            </div>
            <h2
              id="attack-in-progress-title"
              className="text-xl sm:text-2xl font-black uppercase tracking-wide text-rose-400"
            >
              Serangan Masih Berjalan
            </h2>
          </div>
        </div>

        {/* Body Content */}
        <div className="flex-1 flex flex-col space-y-4">
          <p className="text-sm sm:text-base leading-relaxed text-[#E0E0E0]">
            Pasukan Anda sedang bergerak menuju <strong className="text-white">{targetLabel}</strong>.
            {' '}Selesaikan serangan tersebut sampai pasukan tiba dan hasil pertempuran diproses
            sebelum menyerang <strong className="text-white">{requestedTarget ?? 'negara lain'}</strong>.
          </p>
        </div>

        {/* Footer Action */}
        <div className="flex justify-end mt-6 pt-4 border-t border-rose-500/20">
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2 rounded-xl bg-[#00FFAA] hover:bg-[#00e699] border border-[#00FFAA] text-[#0A1A1A] font-black text-[11px] sm:text-xs uppercase tracking-widest transition-all duration-150 cursor-pointer shadow hover:shadow-md active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00FFAA]"
          >
            Mengerti
          </button>
        </div>

      </div>
    </div>,
    document.body,
  );
}