'use client';

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
  const resultColor = succeeded ? 'text-[#00FFAA]' : 'text-red-400';

  return (
    <div className="fixed inset-0 z-[200001] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="missionary-result-title"
        className="w-full max-w-[440px] rounded-2xl border border-[#00FFAA]/30 bg-[#0F2424] p-6 text-center shadow-2xl"
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
          <p className="mt-1 text-2xl font-black text-[#00FFAA]">{successChance}%</p>
        </div>
        <p className="mb-6 text-sm text-white">{message}</p>
        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-lg bg-[#00FFAA] px-4 py-3 text-xs font-black uppercase text-[#0A1A1A] transition-colors hover:bg-[#00D991]"
        >
          Tutup
        </button>
      </div>
    </div>
  );
}
