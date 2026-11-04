"use client";

import React from "react";
import { Rocket, ShieldCheck, AlertCircle } from "lucide-react";

interface TabelStokIcbmProps {
  totalReadyIcbm: number;
  countryName?: string;
  consumedCount?: number;
}

export default function TabelStokIcbm({
  totalReadyIcbm,
  countryName = "Negara Pemain",
  consumedCount = 0,
}: TabelStokIcbmProps) {
  if (totalReadyIcbm <= 0) {
    return (
      <div className="p-8 text-center text-xs font-bold text-root-subtle bg-root-canvas flex flex-col items-center justify-center gap-3">
        <div className="p-3 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm font-black text-rose-400 uppercase tracking-wide">
            Tidak Ada Stok Rudal ICBM Aktif
          </p>
          <p className="text-[11px] text-root-subtle mt-1 font-normal">
            Negara {countryName} saat ini tidak memiliki persediaan rudal balistik antar-benua siap luncur di silo.
            {consumedCount > 0 && ` (${consumedCount} unit telah digunakan untuk uji coba).`}
          </p>
        </div>
      </div>
    );
  }

  // Buat daftar unit ICBM siap tempur yang saat ini aktif
  const readyUnits = Array.from({ length: totalReadyIcbm }, (_, idx) => ({
    id: `icbm-ready-${idx + 1}`,
    index: idx + 1,
    name: `ICBM Strategis Unit #${idx + 1}`,
    type: "Rudal Balistik Antar-Benua (Hulu Ledak Termonuklir)",
    status: "SIAP TEMPUR (Siap Luncur)",
    silo: `Silo Bawah Tanah Sektor ${String.fromCharCode(65 + (idx % 8))}-${(idx % 12) + 1}`,
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
              Persediaan Rudal ICBM Aktif: {totalReadyIcbm} Unit
            </h4>
            <p className="text-[10px] sm:text-[11px] text-root-subtle">
              Seluruh rudal dalam status siaga tinggi di pangkalan militer {countryName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-root-accent/15 border border-root-accent/40 text-root-accent text-[10px] font-black uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" /> Siaga Strategis 100%
          </span>
          {consumedCount > 0 && (
            <span className="px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[10px] font-bold">
              {consumedCount} Unit Teruji
            </span>
          )}
        </div>
      </div>

      {/* Tabel Detail Tiap Rudal */}
      <table className="w-full text-xs bg-root-canvas">
        <thead className="bg-root-canvas text-root-accent border-b border-root-accent/20">
          <tr>
            <th className="sticky top-0 z-10 bg-root-canvas px-3 py-2 text-left text-[9px] sm:text-[10px] font-black uppercase tracking-wider whitespace-nowrap">
              No
            </th>
            <th className="sticky top-0 z-10 bg-root-canvas px-3 py-2 text-left text-[9px] sm:text-[10px] font-black uppercase tracking-wider whitespace-nowrap">
              Alutsista
            </th>
            <th className="sticky top-0 z-10 bg-root-canvas px-3 py-2 text-left text-[9px] sm:text-[10px] font-black uppercase tracking-wider whitespace-nowrap">
              Tipe / Spesifikasi
            </th>
            <th className="sticky top-0 z-10 bg-root-canvas px-3 py-2 text-left text-[9px] sm:text-[10px] font-black uppercase tracking-wider whitespace-nowrap">
              Lokasi Penempatan
            </th>
            <th className="sticky top-0 z-10 bg-root-canvas px-3 py-2 text-center text-[9px] sm:text-[10px] font-black uppercase tracking-wider whitespace-nowrap">
              Status Operasional
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-root-accent/10">
          {readyUnits.map((unit) => (
            <tr key={unit.id} className="hover:bg-root-surface transition-colors">
              <td className="px-3 py-2.5 font-bold text-root-text">{unit.index}</td>
              <td className="px-3 py-2.5 font-bold text-white flex items-center gap-2">
                <Rocket className="w-3.5 h-3.5 text-rose-400" />
                {unit.name}
              </td>
              <td className="px-3 py-2.5 text-root-subtle font-medium text-[11px]">
                {unit.type}
              </td>
              <td className="px-3 py-2.5 text-root-text font-mono text-[11px]">
                {unit.silo}
              </td>
              <td className="px-3 py-2.5 text-center">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-root-accent/15 text-root-accent border border-root-accent/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-root-accent animate-ping" />
                  {unit.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}