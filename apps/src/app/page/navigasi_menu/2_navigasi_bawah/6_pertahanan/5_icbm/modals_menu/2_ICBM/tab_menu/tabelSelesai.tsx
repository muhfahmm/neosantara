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
      <div className="p-8 text-center text-xs font-bold text-[#6B8A8A] bg-[#0A1A1A]">
        Belum ada ICBM yang selesai.
      </div>
    );
  }

  return (
    <table className="w-full text-xs bg-[#0A1A1A]">
      <thead className="bg-[#0A1A1A] text-[#00FFAA] border-b border-[#00FFAA]/20">
        <tr>
          <th className="sticky top-0 z-10 bg-[#0A1A1A] px-3 py-2 text-left text-[9px] sm:text-[10px] font-black uppercase tracking-wider whitespace-nowrap">No</th>
          <th className="sticky top-0 z-10 bg-[#0A1A1A] px-3 py-2 text-left text-[9px] sm:text-[10px] font-black uppercase tracking-wider whitespace-nowrap">Keterangan</th>
          <th className="sticky top-0 z-10 bg-[#0A1A1A] px-3 py-2 text-left text-[9px] sm:text-[10px] font-black uppercase tracking-wider whitespace-nowrap">Selesai Pada</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-[#00FFAA]/10">
        {entries.map((entry, idx) => (
          <tr key={entry.id} className="hover:bg-[#0F2424] transition-colors">
            <td className="px-3 py-2 font-bold text-[#E0E0E0]">{idx + 1}</td>
            <td className="px-3 py-2 font-bold text-[#E0E0E0]">
              {entry.label.replace(/ selesai dalam \d+ hari/, '')}
            </td>
            <td className="px-3 py-2 font-bold text-[#00FFAA]">
              {entry.endDate ? formatTanggalIndo(entry.endDate) : '-'}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}3