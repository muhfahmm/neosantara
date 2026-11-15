"use client";

import SharedModalCloseButton from '@/app/page/root_modals_design_menu/ModalCloseButton';
import React from "react";
import { AlertTriangle, Landmark, Coins, X } from "lucide-react";
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
    <NotebookModalWrapper onClose={onClose} zIndexClass="z-[100000050]">
      <div className="relative flex-1 w-full overflow-y-auto p-4 font-sans sm:p-5">
        <SharedModalCloseButton
          type="button"
          aria-label="Tutup konfirmasi pemindahan ibukota"
          onClick={onClose}
          className="absolute right-4 top-4 text-root-subtle transition hover:text-root-accent cursor-pointer"
          appearance="custom"
        >
          <X className="h-5 w-5" />
        </SharedModalCloseButton>

        <div className="flex items-center gap-3 mb-4">
          <div className="h-12 w-12 rounded-lg bg-root-canvas border border-root-accent/30 flex items-center justify-center shrink-0">
            <Landmark className="h-6 w-6 text-root-accent" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-root-text uppercase leading-none">
              Konfirmasi Pemindahan Ibukota
            </h3>
          </div>
        </div>

        <div className="bg-root-canvas border border-root-accent/20 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between gap-3 border-b border-root-accent/20 pb-4 mb-4">
            <div className="text-center flex-1">
              <span className="text-xs text-root-subtle uppercase font-bold block mb-1">Ibukota Lama</span>
              <span className="text-base sm:text-lg font-black text-root-text">{currentCapital}</span>
            </div>
            <div className="px-2 sm:px-4 text-root-accent font-black text-xl sm:text-2xl">➔</div>
            <div className="text-center flex-1">
              <span className="text-xs text-root-accent uppercase font-bold block mb-1">Ibukota Baru</span>
              <span className="text-base sm:text-lg font-black text-root-accent">{targetCity}</span>
            </div>
          </div>

          <div className="space-y-2.5 text-xs sm:text-sm">
            <div className="flex items-center justify-between">
              <span className="text-root-subtle flex items-center gap-2">
                <Coins className="h-4 w-4 text-root-accent" />
                Biaya Relokasi Resmi:
              </span>
              <span className="font-black text-root-accent text-lg">
                {PINDAH_IBUKOTA_COST.toLocaleString("id-ID")} NEO
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-root-subtle uppercase">Kas Negara Saat Ini:</span>
              <span className={`text-lg font-black ${canAfford ? "text-root-text" : "text-rose-400"}`}>
                {countryMoney.toLocaleString("id-ID", { maximumFractionDigits: 2 })} NEO
              </span>
            </div>

            <div className="border-t border-root-accent/20 mt-3 pt-3 flex justify-between items-center">
              <span className="text-xs font-bold text-root-subtle uppercase">Perkiraan Sisa Kas:</span>
              <span className={`text-lg font-black ${canAfford ? "text-amber-400" : "text-rose-400"}`}>
                {(countryMoney - PINDAH_IBUKOTA_COST).toLocaleString("id-ID", { maximumFractionDigits: 2 })} NEO
              </span>
            </div>
          </div>
        </div>

        <div className="mb-4 flex items-start gap-2 text-xs font-semibold leading-relaxed text-root-subtle">
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
          <div>
            <span className="font-bold text-amber-400">Ketentuan cooldown 5 tahun. </span>
            Setelah ibukota baru ditetapkan, Anda tidak dapat memindahkan ibukota lagi hingga{" "}
            <span className="font-bold text-root-text underline">{formatDisplayDate(cooldownUntil)}</span>.
          </div>
        </div>

        {!canAfford && (
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-lg p-3 mb-4 text-center text-rose-400 font-bold text-xs">
            Kas negara tidak mencukupi untuk biaya relokasi sebesar 150.000 NEO.
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-lg border border-root-accent/30 bg-root-canvas text-root-subtle hover:text-root-text active:scale-95 transition-all font-bold text-sm uppercase cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={!canAfford}
            className={`flex-1 px-4 py-2.5 rounded-lg font-bold text-sm uppercase transition-all shadow-md ${
              canAfford
                ? "bg-root-accent text-root-canvas hover:bg-root-accent/80 active:scale-95 cursor-pointer"
                : "bg-gray-700 text-gray-400 border border-gray-600 cursor-not-allowed opacity-50"
            }`}
          >
            Tetapkan Ibukota
          </button>
        </div>
      </div>
    </NotebookModalWrapper>
  );
}