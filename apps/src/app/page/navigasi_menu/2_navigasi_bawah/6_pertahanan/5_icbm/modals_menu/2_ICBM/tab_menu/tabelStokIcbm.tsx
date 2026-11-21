"use client";
import RootTable, { RootTableHeader, RootTableHeadCell, RootTableRow, RootTableCell } from "@/app/page/root_modals_design_menu/RootTable";

import React from "react";
import { Rocket, ShieldCheck, AlertCircle } from "lucide-react";
import { useIcbmMenuTranslation } from "@/app/page/paused_menu/terjemahan_paused_menu/useIcbmMenuTranslation";

interface TabelStokIcbmProps {
  totalReadyIcbm: number;
  countryName?: string;
  consumedCount?: number;
  language: string;
}

export default function TabelStokIcbm({
  totalReadyIcbm,
  countryName,
  consumedCount = 0,
  language,
}: TabelStokIcbmProps) {
  const { translate } = useIcbmMenuTranslation();
  const resolvedCountryName = countryName || translate("common.playerCountry");
  if (totalReadyIcbm <= 0) {
    return (
      <div className="p-8 text-center text-xs font-bold text-root-subtle bg-root-canvas flex flex-col items-center justify-center gap-3">
        <div className="p-3 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm font-black text-rose-400 uppercase tracking-wide">
            {translate("buildStatus.stockEmptyTitle")}
          </p>
          <p className="text-[11px] text-root-subtle mt-1 font-normal">
            {translate("buildStatus.stockEmptyDescription", { country: resolvedCountryName })}
            {consumedCount > 0 && ` ${translate("buildStatus.usedForTesting", { count: consumedCount.toLocaleString(language) })}`}
          </p>
        </div>
      </div>
    );
  }

  // Buat daftar unit ICBM siap tempur yang saat ini aktif
  const readyUnits = Array.from({ length: totalReadyIcbm }, (_, idx) => ({
    id: `icbm-ready-${idx + 1}`,
    index: idx + 1,
    name: translate("buildStatus.unitName", { count: idx + 1 }),
    type: translate("buildStatus.weaponType"),
    status: translate("buildStatus.ready"),
    silo: translate("buildStatus.silo", {
      sector: String.fromCharCode(65 + (idx % 8)),
      number: (idx % 12) + 1,
    }),
  }));

  return (
    <div className="w-full bg-root-canvas">
      {/* Banner Ringkasan Stok */}
      <div className="p-4 bg-root-surface/80 border-b border-root-accent/20 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-root-accent/10 border border-root-accent/30 text-root-accent">
            <Rocket className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-black text-root-accent uppercase tracking-wide">
              {translate("buildStatus.stockSummary", { count: totalReadyIcbm.toLocaleString(language) })}
            </h4>
            <p className="text-[10px] sm:text-[11px] text-root-subtle">
              {translate("buildStatus.stockSummaryDescription", { country: resolvedCountryName })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-root-accent/15 border border-root-accent/40 text-root-accent text-[10px] font-black uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" /> {translate("buildStatus.strategicAlert")}
          </span>
          {consumedCount > 0 && (
            <span className="px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[10px] font-bold">
              {translate("buildStatus.tested", { count: consumedCount.toLocaleString(language) })}
            </span>
          )}
        </div>
      </div>

      {/* Tabel Detail Tiap Rudal */}
      <RootTable className="w-full text-xs bg-root-canvas">
        <RootTableHeader>
          <tr>
            <RootTableHeadCell className="w-12">{translate("buildStatus.no")}</RootTableHeadCell>
            <RootTableHeadCell>{translate("buildStatus.weapon")}</RootTableHeadCell>
            <RootTableHeadCell>{translate("buildStatus.type")}</RootTableHeadCell>
            <RootTableHeadCell>{translate("buildStatus.placement")}</RootTableHeadCell>
            <RootTableHeadCell className="text-center">{translate("buildStatus.operationalStatus")}</RootTableHeadCell>
          </tr>
        </RootTableHeader>
        <tbody className="divide-y divide-root-accent/10">
          {readyUnits.map((unit) => (
            <RootTableRow key={unit.id}>
              <RootTableCell className="font-bold text-root-text">{unit.index}</RootTableCell>
              <RootTableCell className="font-bold text-white">
                <div className="flex items-center gap-2">
                  <Rocket className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span>{unit.name}</span>
                </div>
              </RootTableCell>
              <RootTableCell className="text-root-subtle font-medium text-[11px]">
                {unit.type}
              </RootTableCell>
              <RootTableCell className="text-root-text font-mono text-[11px]">
                {unit.silo}
              </RootTableCell>
              <RootTableCell className="text-center">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-root-accent/15 text-root-accent border border-root-accent/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-root-accent animate-ping shrink-0" />
                  {unit.status}
                </span>
              </RootTableCell>
            </RootTableRow>
          ))}
        </tbody>
      </RootTable>
    </div>
  );
}