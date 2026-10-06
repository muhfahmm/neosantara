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
    <div className="fixed inset-0 z-[200001] flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="missionary-result-title"
        className="bg-[#0F2424] border-2 sm:border-3 border-[#00FFAA]/30 rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col items-center justify-center relative font-sans pointer-events-auto shadow-2xl p-6 sm:p-10 text-center"
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
