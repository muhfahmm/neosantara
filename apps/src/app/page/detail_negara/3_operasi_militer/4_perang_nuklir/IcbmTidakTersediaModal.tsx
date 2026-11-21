'use client';

import RootInfoModalHeader from '@/app/page/root_modals_design_menu/RootInfoModalHeader';
import { AlertTriangle } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useIcbmMenuTranslation } from '@/app/page/paused_menu/terjemahan_paused_menu/useIcbmMenuTranslation';

interface IcbmTidakTersediaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function IcbmTidakTersediaModal({
  isOpen,
  onClose,
}: IcbmTidakTersediaModalProps) {
  const { translate } = useIcbmMenuTranslation();
  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100000002] flex items-center justify-center p-4 font-sans text-white pointer-events-none"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="icbm-unavailable-title"
    >
      <div className="modal-responsive-shell overflow-y-auto flex flex-col bg-root-surface border border-root-accent/30 rounded-2xl shadow-2xl relative pointer-events-auto">
        <RootInfoModalHeader
          title={translate("war.unavailableTitle")}
          titleId="icbm-unavailable-title"
          onClose={onClose}
          icon={<AlertTriangle />}
          size="standard"
        />

        <div className="p-5 sm:p-6">
          <p className="text-sm sm:text-base leading-relaxed text-root-text">
            {translate("war.unavailableMessage")}
          </p>
        </div>

        <div className="flex justify-end border-t border-rose-500/20 bg-root-canvas p-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-[11px] sm:text-xs uppercase tracking-widest transition-all duration-150 cursor-pointer shadow hover:shadow-md active:scale-[0.98]"
          >
            {translate("war.unavailableAction")}
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