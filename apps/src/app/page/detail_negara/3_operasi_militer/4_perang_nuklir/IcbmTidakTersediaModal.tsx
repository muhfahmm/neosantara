'use client';

import { AlertTriangle, X } from 'lucide-react';
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
      className="fixed inset-0 z-[100000002] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="icbm-unavailable-title"
    >
      <section className="w-full max-w-lg overflow-hidden rounded-2xl border border-rose-400/40 bg-[#0d161a] text-white shadow-[0_0_40px_rgba(244,63,94,0.15)]">
        <header className="flex items-center justify-between border-b border-rose-400/20 bg-[#14232a] px-5 py-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 shrink-0 text-rose-400" />
            <h2
              id="icbm-unavailable-title"
              className="text-sm font-black uppercase tracking-wider text-rose-300"
            >
              ICBM Tidak Tersedia
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-[#8ab0b8] transition-colors hover:bg-white/5 hover:text-white"
            aria-label="Tutup"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="space-y-5 p-6">
          <p className="text-sm leading-relaxed text-[#b8cbd0]">
            Negara Anda belum memiliki rudal ICBM siap diluncurkan. Serangan nuklir
            tidak dapat dikonfirmasi sebelum setidaknya satu ICBM tersedia.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl bg-rose-600 py-3 text-sm font-black uppercase tracking-wider text-white transition-colors hover:bg-rose-500"
          >
            Mengerti
          </button>
        </div>
      </section>
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
