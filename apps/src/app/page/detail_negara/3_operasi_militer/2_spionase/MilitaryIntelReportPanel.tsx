"use client";

import type { SpionaseMilitaryIntelReport } from './logic/spionaseMiliterLogic';
import { useLanguage } from '@/app/page/paused_menu/terjemahan_paused_menu/languageLogic';

export default function MilitaryIntelReportPanel({
  report,
}: {
  report: SpionaseMilitaryIntelReport;
}) {
  const { t, language } = useLanguage();
  const tr = (key: string, params?: Record<string, string | number>) =>
    t(`navigation_defense_espionage.report.${key}`, params);
  const groups = [
    { id: 'darat', label: tr('land') },
    { id: 'udara', label: tr('air') },
    { id: 'laut', label: tr('sea') },
  ] as const;
  const formatNumber = (value: number): string =>
    value.toLocaleString(language, { maximumFractionDigits: 2 });
  return (
    <section className="rounded-xl border border-root-accent/30 bg-root-canvas p-4 text-left">
      <h4 className="mb-3 text-xs font-black uppercase tracking-wider text-root-accent">
        {tr('militaryTitle', { country: report.targetCountry })}
      </h4>
      <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
        {groups.map(group => {
          const intel = report.groups[group.id];
          return (
            <div key={group.id} className="rounded-lg border border-root-accent/15 bg-root-surface p-2">
              <p className="text-[11px] font-black uppercase text-white">{group.label}</p>
              <p className="mt-1 text-[10px] text-root-subtle">
                {tr('unitsAndPower', {
                  units: formatNumber(intel.totalUnits),
                  power: formatNumber(intel.totalPower),
                })}
              </p>
            </div>
          );
        })}
      </div>
      <p className="mb-2 text-[10px] font-bold text-root-subtle">
        {tr('total', {
          units: formatNumber(report.totalUnits),
          power: formatNumber(report.totalPower),
          health: formatNumber(report.totalHealth),
        })}
      </p>
      <div className="max-h-48 space-y-3 overflow-y-auto pr-1">
        {groups.map(group => {
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
                      <span className="truncate">
                        {t(`navigation_defense_attack.units.${unit.unitKey}`) === `navigation_defense_attack.units.${unit.unitKey}`
                          ? unit.unitKey.replace(/_/g, ' ')
                          : t(`navigation_defense_attack.units.${unit.unitKey}`)}
                      </span>
                      <span className="shrink-0 font-mono">
                        {tr('unitsAndPower', {
                          units: formatNumber(unit.quantity),
                          power: formatNumber(unit.totalPower),
                        })}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[10px] text-root-subtle">{tr('noUnits')}</p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
