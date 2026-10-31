'use client';

import { AlertTriangle } from 'lucide-react';
import { createPortal } from 'react-dom';

interface IcbmTidakTersediaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function IcbmTidakTersediaModal({
  isOpen,
  onClose,
}: IcbmTidakTersediaModalProps) {
  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100000002] flex items-center justify-center p-4 font-sans text-white pointer-events-none"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="icbm-unavailable-title"
    >
      <div className="w-full max-w-2xl min-h-[450px] flex flex-col bg-[#0F2424] border border-rose-500/40 rounded-2xl p-6 sm:p-8 shadow-[0_0_40px_rgba(225,29,72,0.15)] relative pointer-events-auto">
        
        {/* Header (Tombol Tutup dihapus) */}
        <div className="flex items-center justify-start border-b border-rose-500/20 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg border border-rose-500/30 bg-rose-500/10 shrink-0">
              <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-rose-400" />
            </div>
            <h2
              id="icbm-unavailable-title"
              className="text-xl sm:text-2xl font-black uppercase tracking-wide text-rose-400"
            >
              ICBM Tidak Tersedia
            </h2>
          </div>
        </div>

        {/* Body Content */}
        <div className="flex-1 flex flex-col space-y-4">
          <p className="text-sm sm:text-base leading-relaxed text-[#E0E0E0]">
            Negara Anda belum memiliki rudal ICBM siap diluncurkan. Serangan nuklir
            tidak dapat dikonfirmasi sebelum setidaknya satu ICBM tersedia.
          </p>
        </div>

        {/* Footer Action */}
        <div className="flex justify-end mt-6 pt-4 border-t border-rose-500/20">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-[11px] sm:text-xs uppercase tracking-widest transition-all duration-150 cursor-pointer shadow hover:shadow-md active:scale-[0.98]"
          >
            Mengerti
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
}

function parseLocalDate(value: string | Date | null | undefined): Date | null {
  if (!value) return null;
  const parsed = value instanceof Date
    ? new Date(value.getFullYear(), value.getMonth(), value.getDate())
    : new Date(`${value.slice(0, 10)}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function getReadyIcbmCount(
  countryDetail: Record<string, unknown> | null | undefined,
  currentDate?: string | Date
): number {
  if (!countryDetail) return 0;

  const source = countryDetail as Record<string, any>;
  const baseCount = Math.max(
    0,
    Number(source.icbm_jumlah) || 0,
    Number(source.icbm) || 0
  );
  const task = source.icbmBuildTask;
  if (!task || typeof task !== 'object') {
    return Math.max(0, baseCount - (Number(source.icbm_consumed) || 0));
  }

  const quantity = Math.max(0, Number(task.quantity) || 0);
  if (task.completed) {
    return Math.max(0, Math.max(baseCount, quantity) - (Number(source.icbm_consumed) || 0));
  }

  const startDate = parseLocalDate(task.startDate);
  const endDate = parseLocalDate(task.endDate);
  const now = parseLocalDate(currentDate) || new Date();
  const deliveredCount = Math.max(0, Number(task.deliveredUnits) || 0);
  let completedCount = 0;

  if (startDate && endDate && quantity > 0) {
    const durationDays = Math.max(
      0,
      Math.round((endDate.getTime() - startDate.getTime()) / 86_400_000)
    );
    const unitDurationDays = Math.max(1, Math.round(durationDays / quantity));

    for (let index = 0; index < quantity; index += 1) {
      const deliveryDate = new Date(startDate);
      deliveryDate.setDate(deliveryDate.getDate() + unitDurationDays * (index + 1));
      if (deliveryDate <= now) completedCount += 1;
    }
  }

  const readyCount = Math.max(baseCount, deliveredCount, completedCount);
  return Math.max(0, readyCount - (Number(source.icbm_consumed) || 0));
}