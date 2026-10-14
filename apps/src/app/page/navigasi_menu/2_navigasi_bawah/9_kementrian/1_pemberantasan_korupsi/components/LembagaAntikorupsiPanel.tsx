'use client';

import { useState } from 'react';
import { Eye, Hammer, ShieldCheck, UserRoundSearch, X } from 'lucide-react';
import { calculateCountryNetBalance } from '@/app/logic/economic_logic/treasuryUpdater';
import { getDailyMinistryCost } from '@/app/logic/economic_logic/departments';
import {
  canUpgradeCorruptionTrack,
  getCorruptionUpgradeCost,
  type CorruptionUpgradeTrack,
} from '../logic/auditLogic';
import { formatCorruptionCurrency, getCorruptionMetrics, type CorruptionCountryDetail } from '../logic/corruptionLogic';

const MAX_CORRUPTION_LEVEL = 20;

const formatDailyBalance = (value: number) =>
  `${value.toLocaleString('id-ID', { maximumFractionDigits: 2 })} NEO/hari`;

interface LembagaAntikorupsiPanelProps {
  countryDetail: CorruptionCountryDetail;
  busy: boolean;
  currentDate?: Date;
  onUpgradeAgency: (targetLevel: number) => void;
  onImproveProtection: (targetLevel: number) => void;
  onAudit: () => void;
}

export default function LembagaAntikorupsiPanel({
  countryDetail,
  busy,
  currentDate,
  onUpgradeAgency,
  onImproveProtection,
  onAudit,
}: LembagaAntikorupsiPanelProps) {
  const metrics = getCorruptionMetrics(countryDetail);
  const budget = Math.max(0, Number(countryDetail.anggaran) || 0);
  const currentNet = calculateCountryNetBalance(countryDetail);
  const auditCost = Math.max(1_000, Math.round(budget * 0.002));
  const currentMonth = (currentDate ?? new Date()).toISOString().slice(0, 7);
  const [confirmation, setConfirmation] = useState<{
    track: CorruptionUpgradeTrack;
    fromLevel: number;
    targetLevel: number;
  } | null>(null);

  const tracks = [
    {
      id: 'agency' as const,
      title: 'Perkuat lembaga antikorupsi',
      description: 'Tambah kapasitas penyidikan dan tingkatkan efektivitas pemberantasan korupsi.',
      level: metrics.agencyLevel,
      icon: ShieldCheck,
      onUpgrade: onUpgradeAgency,
    },
    {
      id: 'whistleblower' as const,
      title: 'Lindungi pelapor',
      description: 'Dorong pelaporan yang aman dan tingkatkan perlindungan saksi serta pelapor.',
      level: metrics.whistleblowerProtection,
      icon: UserRoundSearch,
      onUpgrade: onImproveProtection,
    },
  ];

  const selectedTrack = confirmation
    ? tracks.find((track) => track.id === confirmation.track) ?? null
    : null;
  const upgradeCost = confirmation
    ? getCorruptionUpgradeCost(countryDetail, confirmation.fromLevel, confirmation.targetLevel)
    : 0;
  const projectedNet = confirmation
    ? currentNet +
      getDailyMinistryCost(confirmation.fromLevel) -
      getDailyMinistryCost(confirmation.targetLevel)
    : currentNet;

  const confirmUpgrade = () => {
    if (!confirmation || !selectedTrack || busy) return;
    if (!canUpgradeCorruptionTrack(countryDetail, confirmation.track, confirmation.targetLevel, currentNet)) return;
    selectedTrack.onUpgrade(confirmation.targetLevel);
    setConfirmation(null);
  };

  return (
    <section className="space-y-4 rounded-2xl border border-[#00FFAA]/20 bg-[#0A1A1A] p-4 sm:p-5">
      <div className="flex items-center gap-3">
        <div className="rounded-xl border border-[#00FFAA]/25 bg-[#00FFAA]/10 p-2 text-[#00FFAA]">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-black text-[#E0E0E0]">Lembaga Antikorupsi & Audit</h3>
          <p className="text-xs text-[#8BA3A3]">Biaya operasional mengikuti level dan mengurangi netto kas harian.</p>
        </div>
      </div>

      {tracks.map(({ id, title, description, level, icon: Icon }) => (
        <article key={id} className="overflow-hidden rounded-xl border border-[#00FFAA]/20 bg-[#0F2424]">
          <header className="flex items-center justify-between gap-3 border-b border-[#00FFAA]/15 px-4 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <Icon className="h-5 w-5 shrink-0 text-[#00FFAA]" />
              <h4 className="truncate text-sm font-bold text-white">{title}</h4>
            </div>
            <span className="shrink-0 rounded border border-[#00FFAA]/20 bg-[#0A1A1A] px-2 py-1 text-[10px] font-bold uppercase text-[#00FFAA]">
              Level {level}/{MAX_CORRUPTION_LEVEL}
            </span>
          </header>

          <div className="space-y-3 p-4">
            <p className="text-xs text-[#8BA3A3]">{description}</p>
            <div className="flex flex-wrap gap-1.5" aria-label={`Pilih level ${title}`}>
              {Array.from({ length: MAX_CORRUPTION_LEVEL }, (_, index) => index + 1).map((targetLevel) => {
                const isCurrent = targetLevel === level;
                const isPrevious = targetLevel < level;
                const canUpgrade = targetLevel > level && canUpgradeCorruptionTrack(countryDetail, id, targetLevel, currentNet);
                const targetCost = targetLevel > level
                  ? getCorruptionUpgradeCost(countryDetail, level, targetLevel)
                  : 0;

                return (
                  <button
                    key={targetLevel}
                    type="button"
                    aria-label={`${title}, level ${targetLevel}`}
                    aria-current={isCurrent ? 'step' : undefined}
                    disabled={busy || isCurrent || isPrevious || !canUpgrade}
                    onClick={() => setConfirmation({ track: id, fromLevel: level, targetLevel })}
                    title={isCurrent
                      ? 'Level saat ini'
                      : isPrevious
                        ? `Level ${targetLevel} sudah dilewati`
                        : canUpgrade
                          ? `Upgrade ke level ${targetLevel} · ${formatCorruptionCurrency(targetCost)}`
                          : 'Kas tidak cukup atau upgrade membuat netto harian negatif'}
                    className={`h-5 min-w-5 flex-1 rounded-sm transition ${
                      isCurrent
                        ? 'bg-[#00FFAA] shadow-[0_0_8px_#00FFAA]'
                        : isPrevious
                          ? 'border border-[#00FFAA]/25 bg-[#00FFAA]/50'
                          : canUpgrade
                            ? 'border border-[#00FFAA]/30 bg-[#0A1A1A] hover:border-[#00FFAA] hover:bg-[#00FFAA]/20'
                            : 'cursor-not-allowed border border-slate-700 bg-slate-800 opacity-50'
                    }`}
                  />
                );
              })}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="text-[#8BA3A3]">
                Biaya saat ini: <strong className="text-[#E0E0E0]">{formatCorruptionCurrency(getDailyMinistryCost(level))}/hari</strong>
              </span>
              {level < MAX_CORRUPTION_LEVEL && (
                <button
                  type="button"
                  disabled={busy || !canUpgradeCorruptionTrack(countryDetail, id, level + 1, currentNet)}
                  onClick={() => setConfirmation({ track: id, fromLevel: level, targetLevel: level + 1 })}
                  className="inline-flex items-center gap-2 rounded-lg border border-[#00FFAA]/30 bg-[#00FFAA]/10 px-3 py-2 font-bold text-[#00FFAA] transition hover:bg-[#00FFAA]/20 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Hammer className="h-4 w-4" />
                  Tingkatkan · {formatCorruptionCurrency(
                    getCorruptionUpgradeCost(countryDetail, level, level + 1),
                  )}
                </button>
              )}
            </div>
          </div>
        </article>
      ))}

      <article className="flex flex-col gap-3 rounded-xl border border-sky-400/20 bg-sky-950/20 p-4 sm:flex-row sm:items-center">
        <Eye className="h-5 w-5 shrink-0 text-sky-300" />
        <div className="flex-1">
          <h4 className="text-sm font-bold text-white">Audit anggaran nasional</h4>
          <p className="mt-1 text-xs text-[#8BA3A3]">Audit berkala menurunkan indeks korupsi dan dapat menemukan bukti kasus aktif.</p>
        </div>
        <button
          type="button"
          disabled={busy || countryDetail.corruption_last_audit_month === currentMonth || budget < auditCost}
          onClick={onAudit}
          className="shrink-0 rounded-lg border border-sky-400/30 bg-sky-400/10 px-3 py-2 text-xs font-bold text-sky-200 transition hover:bg-sky-400/20 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {countryDetail.corruption_last_audit_month === currentMonth
            ? 'Sudah audit bulan ini'
            : `Audit · ${formatCorruptionCurrency(auditCost)}`}
        </button>
      </article>

      {confirmation && selectedTrack && (
        <div
          className="fixed inset-0 z-[220] flex items-center justify-center bg-black/60 p-4"
          onClick={() => setConfirmation(null)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="corruption-upgrade-title"
            onClick={(event) => event.stopPropagation()}
            className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-[#00FFAA]/30 bg-[#0F2424] p-5 shadow-2xl sm:p-7"
          >
            <button
              type="button"
              aria-label="Tutup konfirmasi upgrade"
              onClick={() => setConfirmation(null)}
              className="absolute right-4 top-4 text-[#6B8A8A] transition hover:text-[#00FFAA]"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="mb-5 flex items-center gap-3 pr-8">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-[#00FFAA]/30 bg-[#0A1A1A] text-[#00FFAA]">
                <selectedTrack.icon className="h-7 w-7" />
              </div>
              <div>
                <h3 id="corruption-upgrade-title" className="text-base font-black uppercase text-[#E0E0E0] sm:text-lg">
                  {selectedTrack.title}
                </h3>
                <p className="text-xs font-semibold text-[#8BA3A3]">
                  Level {confirmation.fromLevel} → {confirmation.targetLevel}
                  {confirmation.targetLevel - confirmation.fromLevel > 1 &&
                    ` (melewati ${confirmation.targetLevel - confirmation.fromLevel - 1} level)`}
                </p>
              </div>
            </div>

            <div className="space-y-2 rounded-xl border border-[#00FFAA]/20 bg-[#0A1A1A] p-4">
              <div className="max-h-40 space-y-2 overflow-y-auto">
                {Array.from(
                  { length: confirmation.targetLevel - confirmation.fromLevel },
                  (_, index) => confirmation.fromLevel + index + 1,
                ).map((stepLevel) => (
                  <div key={stepLevel} className="flex justify-between gap-4 text-xs font-bold text-[#8BA3A3]">
                    <span>Biaya dari level {stepLevel - 1} ke {stepLevel}:</span>
                    <span className="shrink-0 text-[#E0E0E0]">
                      {formatCorruptionCurrency(getCorruptionUpgradeCost(countryDetail, stepLevel - 1, stepLevel))}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between border-t border-[#00FFAA]/20 pt-3 text-sm font-black">
                <span className="text-[#8BA3A3]">Total biaya upgrade:</span>
                <span className="text-[#00FFAA]">{formatCorruptionCurrency(upgradeCost)}</span>
              </div>
              <div className="flex justify-between gap-4 text-sm font-bold">
                <span className="text-[#8BA3A3]">Kas negara sekarang:</span>
                <span className="text-[#E0E0E0]">{formatCorruptionCurrency(budget)}</span>
              </div>
              <div className="flex justify-between gap-4 border-t border-[#00FFAA]/20 pt-3 text-sm font-black">
                <span className="text-[#8BA3A3]">Kas setelah upgrade:</span>
                <span className="text-amber-400">{formatCorruptionCurrency(budget - upgradeCost)}</span>
              </div>
              <div className="flex justify-between gap-4 text-xs font-bold">
                <span className="text-[#8BA3A3]">Netto harian setelah upgrade:</span>
                <span className={projectedNet >= 0 ? 'text-[#00FFAA]' : 'text-rose-400'}>
                  {formatDailyBalance(projectedNet)}
                </span>
              </div>
              <p className="border-t border-[#00FFAA]/20 pt-2 text-xs text-[#8BA3A3]">
                Netto harian saat ini: {formatDailyBalance(currentNet)}. Biaya operasional level baru akan mengurangi netto setiap hari.
              </p>
            </div>

            <p className="my-5 text-sm text-[#8BA3A3]">{selectedTrack.description}</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmation(null)}
                className="flex-1 rounded-lg border border-[#00FFAA]/30 bg-[#0A1A1A] px-4 py-3 text-sm font-bold uppercase text-[#8BA3A3] transition hover:text-white"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={busy || !canUpgradeCorruptionTrack(countryDetail, confirmation.track, confirmation.targetLevel, currentNet)}
                onClick={confirmUpgrade}
                className="flex-1 rounded-lg bg-[#00FFAA] px-4 py-3 text-sm font-black uppercase text-[#0A1A1A] transition hover:bg-[#00FFAA]/80 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Upgrade
              </button>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}
