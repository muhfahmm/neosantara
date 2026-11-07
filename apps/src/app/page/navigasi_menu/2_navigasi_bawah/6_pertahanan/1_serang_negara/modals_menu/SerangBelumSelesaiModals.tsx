'use client';

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle } from 'lucide-react';
import NotebookModalWrapper from '../../../NotebookModalWrapper';

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
    <NotebookModalWrapper
      onClose={onClose}
      compact
      zIndexClass="z-[100000001]"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="attack-in-progress-title"
        className="w-full flex flex-col border border-rose-500/40 rounded-r-xl font-sans text-white"
      >
        
        {/* Header */}
        <div className="flex items-center justify-start border-b border-rose-500/20 bg-root-canvas p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg border border-rose-500/30 bg-rose-500/10 shrink-0">
              <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-rose-400" aria-hidden="true" />
            </div>
            <h2
              id="attack-in-progress-title"
              className="text-lg sm:text-xl font-black uppercase tracking-wide text-rose-400"
            >
              Serangan Masih Berjalan
            </h2>
          </div>
        </div>

        {/* Body Content */}
        <div className="flex flex-col space-y-4 bg-root-surface p-4">
          <p className="text-sm leading-relaxed text-root-text">
            Pasukan Anda sedang bergerak menuju <strong className="text-white">{targetLabel}</strong>.
            {' '}Selesaikan serangan tersebut sampai pasukan tiba dan hasil pertempuran diproses
            sebelum menyerang <strong className="text-white">{requestedTarget ?? 'negara lain'}</strong>.
          </p>
        </div>

        {/* Footer Action */}
        <div className="flex justify-end border-t border-rose-500/20 bg-root-canvas p-4">
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2 rounded-xl bg-root-accent hover:bg-root-accent/85 border border-root-accent text-root-accent-ink font-black text-[11px] sm:text-xs uppercase tracking-widest transition-all duration-150 cursor-pointer shadow hover:shadow-md active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-root-accent"
          >
            Mengerti
          </button>
        </div>

      </div>
    </NotebookModalWrapper>,
    document.body,
  );
}