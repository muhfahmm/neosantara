"use client";
import React from "react";
import NotebookModalWrapper from "../../../NotebookModalWrapper";
import RootInfoModalHeader from "@/app/page/root_modals_design_menu/RootInfoModalHeader";
import { rootBorderRadius } from "@/app/page/root_modals_design_menu/rootBorderRadius";
import { rootModalTypography } from "@/app/page/root_modals_design_menu/rootModalTypography";

interface InfoBangunanModalProps {
  label: string;
  perCount: number;
  konsumsiUnit: number;
  biaya: number;
  waktu?: number;
  onClose: () => void;
}

export default function InfoBangunanModal({
  label,
  perCount,
  konsumsiUnit,
  biaya,
  waktu,
  onClose,
}: InfoBangunanModalProps) {
  return (
    <NotebookModalWrapper onClose={onClose}>
      <div className="root-modal-util-b74379da23">
        <RootInfoModalHeader title={`Info Bangunan - ${label}`} onClose={onClose} size="standard" />

        <div className={`root-info-modal-content p-4 sm:p-5 relative z-10 flex-1 overflow-y-auto space-y-4 custom-scrollbar ${rootModalTypography.body}`}>
          <div className={`root-info-modal-summary flex flex-col gap-1 border border-root-accent/20 bg-root-canvas p-3 sm:p-4 ${rootBorderRadius.card}`}>
            <div className="flex justify-between items-center">
              <span className="text-root-muted">Listrik Dikonsumsi (Satuan):</span>
              <span className="text-xs font-black text-rose-400">{konsumsiUnit.toLocaleString('id-ID', { maximumFractionDigits: 4 })} MW</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-root-muted">Listrik Dikonsumsi (Total):</span>
              <span className="text-xs font-black text-rose-400">{(konsumsiUnit * perCount).toLocaleString('id-ID', { maximumFractionDigits: 2 })} MW</span>
            </div>
            <div className="flex justify-between items-center border-t border-root-accent/10 pt-1 mt-1">
              <span className="text-root-muted">Biaya Pembangunan:</span>
              <span className="text-xs font-black text-root-accent">{biaya.toLocaleString('id-ID', { maximumFractionDigits: 2 })} NEO</span>
            </div>
            {waktu !== undefined && (
              <div className="flex justify-between items-center">
                <span className="text-root-muted">Estimasi Waktu Pembangunan:</span>
                <span className="text-xs font-bold text-root-text">{waktu} hari</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-root-muted">Jumlah Bangunan Saat Ini:</span>
              <span className="text-xs font-black text-root-accent">{perCount} unit</span>
            </div>
          </div>
        </div>

      </div>
    </NotebookModalWrapper>
  );
}