"use client"

import React from "react";

interface TabelSelesaiProps {
  entries: Array<{ id: string; label: string; amount: number; endDate: Date | null }>;
}

export const formatTanggalIndo = (dateStr: string | Date | null) => {
  if (!dateStr) return "-";
  const dateObj = typeof dateStr === "string" ? new Date(`${dateStr}T00:00:00`) : dateStr;
  if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) return String(dateStr);
  const day = dateObj.getDate();
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const month = monthNames[dateObj.getMonth()];
  const year = dateObj.getFullYear();
  return `${day} ${month} ${year}`;
};

export default function TabelSelesai({ entries }: TabelSelesaiProps) {
  // 🔥 EMPTY STATE (Sama seperti TabelDalamPembangunan)
  if (entries.length === 0) {
    return (
      <div className="p-8 text-center text-xs font-bold text-root-subtle bg-root-canvas">
        Belum ada ICBM yang selesai.
      </div>
    );
  }

  return (
    <table className="w-full text-xs bg-root-canvas">
      <thead className="bg-root-canvas text-root-accent border-b border-root-accent/20">
        <tr>
          <th className="sticky top-0 z-10 bg-root-canvas px-3 py-2 text-left text-[9px] sm:text-[10px] font-black uppercase tracking-wider whitespace-nowrap">No</th>
          <th className="sticky top-0 z-10 bg-root-canvas px-3 py-2 text-left text-[9px] sm:text-[10px] font-black uppercase tracking-wider whitespace-nowrap">Keterangan</th>
          <th className="sticky top-0 z-10 bg-root-canvas px-3 py-2 text-left text-[9px] sm:text-[10px] font-black uppercase tracking-wider whitespace-nowrap">Selesai Pada</th>
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
              {entry.endDate ? formatTanggalIndo(entry.endDate) : '-'}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}3