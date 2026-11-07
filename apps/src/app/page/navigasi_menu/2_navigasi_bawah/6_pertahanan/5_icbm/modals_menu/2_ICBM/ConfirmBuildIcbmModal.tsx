"use client";
import SharedModalCloseButton from '@/app/page/root_modals_design_menu/ModalCloseButton';
import React from "react";
import { X } from "lucide-react";
import NotebookModalWrapper from "../../../../NotebookModalWrapper";

interface ConfirmBuildIcbmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  quantity: number;
  totalCashCost: number;
  totalUraniumCost: number;
  totalBuildDays: number;
  completionDate: string;
}

export default function ConfirmBuildIcbmModal({
  isOpen,
  onClose,
  onConfirm,
  quantity,
  totalCashCost,
  totalUraniumCost,
  totalBuildDays,
  completionDate,
}: ConfirmBuildIcbmModalProps) {
  if (!isOpen) return null;

  return (
    <NotebookModalWrapper onClose={onClose} compact zIndexClass="z-[100]">
      <div className="flex flex-col font-sans">
        <div className="px-4 sm:px-5 py-3 border-b border-root-accent/20 bg-root-canvas flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black text-root-accent uppercase tracking-wide">Konfirmasi Pembangunan ICBM</h3>
            <p className="text-[11px] text-root-subtle mt-1">Pastikan sumber daya mencukupi sebelum melanjutkan.</p>
          </div>
          <SharedModalCloseButton onClick={onClose} className="p-2.5 rounded-xl border border-root-accent/40 text-root-subtle hover:text-root-accent hover:bg-root-accent/10 transition-all cursor-pointer flex items-center gap-1.5" appearance="custom">
            <span className="text-[10px] font-black uppercase tracking-widest pl-1">Tutup</span>
            <X className="h-5 w-5" />
          </SharedModalCloseButton>
        </div>

        <div className="p-4 sm:p-5 bg-root-surface">
          <div className="space-y-4 text-sm text-root-body">
            <p className="font-bold">Anda akan membangun <span className="text-root-accent">{quantity} ICBM</span> dengan biaya:</p>
            <ul className="space-y-2 pl-4 list-disc marker:text-root-accent">
              <li>{totalCashCost.toLocaleString("id-ID", { maximumFractionDigits: 0 })} NEO</li>
              <li>{totalUraniumCost} uranium</li>
              <li>Durasi: {totalBuildDays} hari</li>
              <li>Selesai pada: {completionDate}</li>
            </ul>
            <p className="text-root-subtle">Klik Oke untuk melanjutkan dan kembali ke Komando Strategis Nuklir.</p>
          </div>
        </div>

        <div className="px-4 sm:px-5 py-3 border-t border-root-accent/20 bg-root-canvas flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2 rounded-lg border border-root-accent/40 text-root-muted font-bold hover:border-root-accent hover:text-root-accent transition-all cursor-pointer">Batal</button>
          <button onClick={() => { onConfirm(); }} className="px-5 py-2 rounded-lg bg-root-accent text-root-accent-ink font-black hover:brightness-95 active:scale-95 transition-all cursor-pointer">Oke</button>
        </div>
    </div>
    </NotebookModalWrapper>
  );
}