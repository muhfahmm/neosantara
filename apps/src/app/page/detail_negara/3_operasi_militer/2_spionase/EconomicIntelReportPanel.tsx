"use client";

import type { SpionaseEconomicIntelReport } from './logic/spionaseEkonomiLogic';
import { useLanguage } from '@/app/page/paused_menu/terjemahan_paused_menu/languageLogic';

export default function EconomicIntelReportPanel({
  report,
}: {
  report: SpionaseEconomicIntelReport;
}) {
  const { t, language } = useLanguage();
  const formatNumber = (value: number): string =>
    value.toLocaleString(language, { maximumFractionDigits: 2 });
  return (
    <section className="rounded-xl border border-root-accent/30 bg-root-canvas p-4 text-left">
      <h4 className="mb-3 text-xs font-black uppercase tracking-wider text-root-accent">
        {t('navigation_defense_espionage.report.fiscalTitle', { country: report.targetCountry })}
      </h4>
      <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <div className="rounded-lg border border-root-accent/15 bg-root-surface p-3">
          <p className="text-[10px] font-black uppercase text-root-subtle">{t('navigation_defense_espionage.report.budget')}</p>
          <p className="mt-1 text-sm font-black text-white">{formatNumber(report.budget)} NEO</p>
        </div>
        <div className="rounded-lg border border-root-accent/15 bg-root-surface p-3">
          <p className="text-[10px] font-black uppercase text-root-subtle">{t('navigation_defense_espionage.report.dailyTax')}</p>
          <p className="mt-1 text-sm font-black text-white">
            {formatNumber(report.estimatedDailyTaxRevenue)} NEO / {t('navigation_defense_espionage.report.daily')}
          </p>
        </div>
      </div>
      <ul className="space-y-1.5">
        {report.taxRates.map(tax => (
          <li
            key={tax.id}
            className="flex items-center justify-between gap-3 text-[10px] text-root-text"
          >
            <span>{t(`navigation_defense_espionage.report.taxLabels.${tax.id}`)}</span>
            <span className="shrink-0 font-mono font-bold text-root-accent">
              {formatNumber(tax.rate)}%
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
