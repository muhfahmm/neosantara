"use client";

import React from "react";
import { AlertTriangle, Landmark, Coins, CheckCircle2, X } from "lucide-react";
import NotebookModalWrapper from "@/app/page/navigasi_menu/2_navigasi_bawah/NotebookModalWrapper";

export const PINDAH_IBUKOTA_COST = 150000;
export const PINDAH_IBUKOTA_COOLDOWN_YEARS = 5;

interface KonfirmasiGantiIbukotaModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetCity: string;
  currentCapital: string;
  countryMoney: number;
  currentDate?: Date | string;
  onConfirm: () => void;
}

export default function KonfirmasiGantiIbukotaModal({
  isOpen,
  onClose,
  targetCity,
  currentCapital,
  countryMoney,
  currentDate,
  onConfirm,
}: KonfirmasiGantiIbukotaModalProps) {
  if (!isOpen) return null;

  const canAfford = countryMoney >= PINDAH_IBUKOTA_COST;

  // Format tanggal saat ini & tanggal cooldown selesai
  const now = currentDate ? new Date(currentDate) : new Date();
  const cooldownUntil = new Date(now.getTime());
  cooldownUntil.setFullYear(cooldownUntil.getFullYear() + PINDAH_IBUKOTA_COOLDOWN_YEARS);

  const formatDisplayDate = (d: Date) => {
    return d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <NotebookModalWrapper compact maxWidthClass="max-w-xl" zIndexClass="z-[100000050]">
      {/* Container Modal Mengikuti Ukuran & Style Modal Konfirmasi Kedutaan */}
      <div className="w-full flex flex-col p-4 sm:p-5 font-sans text-white">
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-amber-400/20 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-400/10 rounded-xl border border-amber-400/30 text-amber-300">
              <Landmark className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-amber-300 tracking-wide uppercase leading-tight">
                Konfirmasi Pemindahan Ibukota
              </h3>
              <p className="text-xs text-root-subtle">Keputusan Strategis Kenegaraan</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-root-subtle hover:text-amber-300 hover:bg-amber-400/10 rounded-xl transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Area Konten Utama */}
        <div className="flex-1 space-y-4">
          {/* Visualisasi Perpindahan */}
          <div className="bg-root-canvas/90 border border-amber-400/20 rounded-xl p-4 flex items-center justify-between">
            <div className="text-center flex-1">
              <span className="text-xs text-root-subtle uppercase font-bold block mb-1">Ibukota Lama</span>
              <span className="text-base sm:text-lg font-black text-root-text">{currentCapital}</span>
            </div>
            <div className="px-4 text-amber-400 font-black text-xl sm:text-2xl">➔</div>
            <div className="text-center flex-1">
              <span className="text-xs text-amber-300 uppercase font-bold block mb-1">Ibukota Baru</span>
              <span className="text-base sm:text-lg font-black text-amber-300">{targetCity}</span>
            </div>
          </div>

          {/* Rincian Finansial */}
          <div className="bg-[#050D0D]/90 border border-root-accent/20 rounded-xl p-4 space-y-2.5 text-xs sm:text-sm">
            <div className="flex items-center justify-between">
              <span className="text-[#A2B7B2] flex items-center gap-2">
                <Coins className="h-4 w-4 text-amber-400" />
                Biaya Relokasi Resmi:
              </span>
              <span className="font-extrabold text-amber-300 text-sm sm:text-base">
                {PINDAH_IBUKOTA_COST.toLocaleString("id-ID")} NEO
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#A2B7B2]">Kas Negara Saat Ini:</span>
              <span className={`font-bold ${canAfford ? "text-root-accent" : "text-rose-400"}`}>
                {countryMoney.toLocaleString("id-ID", { maximumFractionDigits: 2 })} NEO
              </span>
            </div>

            <div className="border-t border-root-accent/10 pt-2.5 flex items-center justify-between">
              <span className="text-root-subtle">Perkiraan Sisa Kas:</span>
              <span className={`font-bold ${canAfford ? "text-root-text" : "text-rose-400"}`}>
                {(countryMoney - PINDAH_IBUKOTA_COST).toLocaleString("id-ID", { maximumFractionDigits: 2 })} NEO
              </span>
            </div>
          </div>

          {/* Box Peringatan Cooldown 5 Tahun */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3.5 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-200/90 leading-relaxed">
              <p className="font-bold text-amber-400 text-xs sm:text-sm mb-0.5">Ketentuan Cooldown 5 Tahun</p>
              Setelah ibukota baru ditetapkan, Anda tidak dapat memindahkan ibukota lagi hingga{" "}
              <span className="font-bold text-white underline">{formatDisplayDate(cooldownUntil)}</span>.
            </div>
          </div>

          {!canAfford && (
            <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3 text-center text-rose-400 font-bold text-xs">
              Kas negara tidak mencukupi untuk biaya relokasi sebesar 150.000 NEO.
            </div>
          )}
        </div>

        {/* Area Tombol Footer */}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-amber-400/20">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl border border-root-accent/30 bg-root-canvas text-[#A2B7B2] hover:text-white hover:border-root-accent/50 transition-colors font-bold text-xs uppercase cursor-pointer"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            disabled={!canAfford}
            className={`px-7 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-md ${
              canAfford
                ? "bg-root-accent hover:bg-[#00e699] text-root-canvas border border-root-accent cursor-pointer hover:shadow-lg active:scale-[0.98]"
                : "bg-gray-700 text-gray-400 border border-gray-600 cursor-not-allowed opacity-50"
            }`}
          >
            <CheckCircle2 className="h-4 w-4" />
            Tetapkan Ibukota
          </button>
        </div>
      </div>
    </NotebookModalWrapper>
  );
}