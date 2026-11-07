'use client';

import SharedModalCloseButton from '@/app/page/root_modals_design_menu/ModalCloseButton';
import { CheckCircle2, XCircle } from 'lucide-react';

interface MissionaryResultModalProps {
  targetCountry: string;
  succeeded: boolean;
  successChance: number;
  message: string;
  actionLabel: string;
  onClose: () => void;
}

export default function MissionaryResultModal({
  targetCountry,
  succeeded,
  successChance,
  message,
  actionLabel,
  onClose
}: MissionaryResultModalProps) {
  const ResultIcon = succeeded ? CheckCircle2 : XCircle;
  const resultColor = succeeded ? 'text-root-accent' : 'text-red-400';

  return (
    <div className="fixed inset-0 z-[200001] flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="missionary-result-title"
        className="modal-responsive-shell bg-root-surface border-2 sm:border-3 border-root-accent/30 rounded-2xl overflow-hidden flex flex-col items-center justify-center relative font-sans pointer-events-auto shadow-2xl p-6 sm:p-10 text-center"
      >
        <ResultIcon className={`mx-auto mb-3 h-12 w-12 ${resultColor}`} aria-hidden="true" />
        <h3 id="missionary-result-title" className={`mb-2 text-lg font-black uppercase ${resultColor}`}>
          {actionLabel} {succeeded ? 'Berhasil' : 'Gagal'}
        </h3>
        <p className="mb-4 text-sm text-[#B7D5CD]">
          Hasil aksi {actionLabel.toLowerCase()} untuk <strong>{targetCountry}</strong>.
        </p>
        <div className="mb-5 rounded-xl border border-white/10 bg-black/20 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-[#B7D5CD]">Peluang keberhasilan</p>
          <p className="mt-1 text-2xl font-black text-root-accent">{successChance}%</p>
        </div>
        <p className="mb-6 text-sm text-white">{message}</p>
        <SharedModalCloseButton
          type="button"
          onClick={onClose}
          className="w-full rounded-lg bg-root-accent px-4 py-3 text-xs font-black uppercase text-root-canvas transition-colors hover:bg-[#00D991]"
         appearance="custom">
          Tutup
        </SharedModalCloseButton>
      </div>
    </div>
  );
}