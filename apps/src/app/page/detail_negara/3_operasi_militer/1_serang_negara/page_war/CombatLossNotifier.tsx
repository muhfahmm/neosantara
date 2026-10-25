'use client';

import React, { memo } from 'react';
import { Skull, ShieldAlert, Swords, AlertTriangle } from 'lucide-react';
import { formatUnitQuantity } from './units/warUnitComposition';

export interface CombatLossEvent {
  id: string;
  side: 'user' | 'enemy';
  unitLabel: string;
  lostAmount: number;
  remainingAmount: number;
  attackerLabel?: string;
  timestamp: number;
}

interface CombatLossNotifierProps {
  losses: CombatLossEvent[];
  onDismiss?: (id: string) => void;
}

export const CombatLossNotifier = memo(function CombatLossNotifier({
  losses,
}: CombatLossNotifierProps) {
  const [activeLosses, setActiveLosses] = React.useState<CombatLossEvent[]>([]);

  // Perbarui dan otomatis sembunyikan notifikasi setelah 3 detik (3000ms)
  React.useEffect(() => {
    if (!losses || losses.length === 0) {
      setActiveLosses([]);
      return;
    }

    const now = Date.now();
    // Hanya ambil notifikasi yang berumur kurang dari 3000ms
    const recent = losses.filter((l) => now - l.timestamp < 3000);
    setActiveLosses(recent.slice(-4));

    const timer = setInterval(() => {
      const current = Date.now();
      setActiveLosses((prev) => prev.filter((l) => current - l.timestamp < 3000));
    }, 400);

    return () => clearInterval(timer);
  }, [losses]);

  if (activeLosses.length === 0) return null;

  return (
    <div
      className="pointer-events-none absolute right-4 top-20 z-50 flex flex-col gap-2 max-w-sm sm:max-w-md"
      aria-live="polite"
    >
      {activeLosses.map((loss) => {
        const isUserLoss = loss.side === 'user';
        const isEliminated = loss.remainingAmount <= 0;

        return (
          <div
            key={loss.id}
            className={`pointer-events-auto flex items-center gap-3 rounded-xl border p-3 shadow-2xl backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-right-8 ${
              isUserLoss
                ? 'border-rose-500/60 bg-rose-950/85 text-rose-100 shadow-rose-900/30'
                : 'border-emerald-500/60 bg-slate-900/90 text-emerald-100 shadow-emerald-900/30'
            }`}
          >
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${
                isUserLoss
                  ? 'border-rose-400/50 bg-rose-500/20 text-rose-400'
                  : 'border-emerald-400/50 bg-emerald-500/20 text-emerald-400'
              }`}
            >
              {isEliminated ? (
                <Skull className="h-5 w-5 animate-pulse" />
              ) : isUserLoss ? (
                <ShieldAlert className="h-5 w-5" />
              ) : (
                <Swords className="h-5 w-5" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs font-black tracking-wider uppercase">
                  {isUserLoss ? '⚠️ KERUGIAN PASUKAN KITA' : '💥 SERANGAN TELAK KE MUSUH'}
                </span>
                <span className="rounded bg-black/40 px-1.5 py-0.5 font-mono text-[10px] font-bold text-amber-300">
                  -{formatUnitQuantity(loss.lostAmount)}
                </span>
              </div>

              <p className="mt-0.5 text-xs text-gray-200 truncate">
                {isEliminated ? (
                  <span className="font-bold text-rose-300">
                    Batalyon {loss.unitLabel} telah hancur sepenuhnya!
                  </span>
                ) : (
                  <>
                    <span className="font-bold text-white">{loss.unitLabel}</span> tersisa{' '}
                    <span className="font-bold text-yellow-300">
                      {formatUnitQuantity(loss.remainingAmount)}
                    </span>{' '}
                    personel/kendaraan.
                  </>
                )}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
});

export default CombatLossNotifier;
