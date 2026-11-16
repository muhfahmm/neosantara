"use client";

import type { SpionaseMilitaryIntelReport } from './logic/spionaseMiliterLogic';

const GROUPS = [
  { id: 'darat', label: 'Darat' },
  { id: 'udara', label: 'Udara' },
  { id: 'laut', label: 'Laut' },
] as const;

const formatNumber = (value: number): string =>
  value.toLocaleString('id-ID', { maximumFractionDigits: 2 });

export default function MilitaryIntelReportPanel({
  report,
}: {
  report: SpionaseMilitaryIntelReport;
}) {
  return (
    <section className="rounded-xl border border-root-accent/30 bg-root-canvas p-4 text-left">
      <h4 className="mb-3 text-xs font-black uppercase tracking-wider text-root-accent">
        Laporan Kekuatan Militer — {report.targetCountry}
      </h4>
      <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
        {GROUPS.map(group => {
          const intel = report.groups[group.id];
          return (
            <div key={group.id} className="rounded-lg border border-root-accent/15 bg-root-surface p-2">
              <p className="text-[11px] font-black uppercase text-white">{group.label}</p>
              <p className="mt-1 text-[10px] text-root-subtle">
                {formatNumber(intel.totalUnits)} unit · daya {formatNumber(intel.totalPower)}
              </p>
            </div>
          );
        })}
      </div>
      <p className="mb-2 text-[10px] font-bold text-root-subtle">
        Total: {formatNumber(report.totalUnits)} unit · daya {formatNumber(report.totalPower)} · HP {formatNumber(report.totalHealth)}
      </p>
      <div className="max-h-48 space-y-3 overflow-y-auto pr-1">
        {GROUPS.map(group => {
          const units = report.groups[group.id].units;
          return (
            <div key={group.id}>
              <p className="mb-1 text-[10px] font-black uppercase text-root-accent">{group.label}</p>
              {units.length > 0 ? (
                <ul className="space-y-1">
                  {units.map(unit => (
                    <li
                      key={unit.unitKey}
                      className="flex items-center justify-between gap-3 text-[10px] text-root-text"
                    >
                      <span className="truncate">{unit.unitKey.replace(/_/g, ' ')}</span>
                      <span className="shrink-0 font-mono">
                        {formatNumber(unit.quantity)} unit · daya {formatNumber(unit.totalPower)}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[10px] text-root-subtle">Tidak ada unit terdeteksi.</p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
