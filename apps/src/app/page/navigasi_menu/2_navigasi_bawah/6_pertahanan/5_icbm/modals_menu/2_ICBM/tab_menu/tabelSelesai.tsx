"use client"
import RootTable from "@/app/page/root_modals_design_menu/RootTable";

import React from "react";
import { formatIcbmDate, useIcbmMenuTranslation } from "@/app/page/paused_menu/terjemahan_paused_menu/useIcbmMenuTranslation";

interface TabelSelesaiProps {
  entries: Array<{ id: string; label: string; amount: number; endDate: Date | null }>;
}

export default function TabelSelesai({ entries }: TabelSelesaiProps) {
  const { language, translate } = useIcbmMenuTranslation();
  // 🔥 EMPTY STATE (Sama seperti TabelDalamPembangunan)
  if (entries.length === 0) {
    return (
      <div className="p-8 text-center text-xs font-bold text-root-subtle bg-root-canvas">
        {translate("buildStatus.completedEmpty")}
      </div>
    );
  }

  return (
    <RootTable className="w-full text-xs bg-root-canvas">
      <thead className="bg-root-canvas text-root-accent border-b border-root-accent/20">
        <tr>
          <th className="sticky top-0 z-10 bg-root-canvas px-3 py-2 text-left text-[9px] sm:text-[10px] font-black uppercase tracking-wider whitespace-nowrap">{translate("buildStatus.no")}</th>
          <th className="sticky top-0 z-10 bg-root-canvas px-3 py-2 text-left text-[9px] sm:text-[10px] font-black uppercase tracking-wider whitespace-nowrap">{translate("buildStatus.description")}</th>
          <th className="sticky top-0 z-10 bg-root-canvas px-3 py-2 text-left text-[9px] sm:text-[10px] font-black uppercase tracking-wider whitespace-nowrap">{translate("buildStatus.completedOn")}</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-root-accent/10">
        {entries.map((entry, idx) => (
          <tr key={entry.id} className="hover:bg-root-surface transition-colors">
            <td className="px-3 py-2 font-bold text-root-text">{idx + 1}</td>
            <td className="px-3 py-2 font-bold text-root-text">
              {entry.label.replace(/ selesai dalam \d+ hari/, '')}
            </td>
            <td className="px-3 py-2 font-bold text-root-accent">
              {entry.endDate ? formatIcbmDate(entry.endDate, language) : '-'}
            </td>
          </tr>
        ))}
      </tbody>
    </RootTable>
  );
}3