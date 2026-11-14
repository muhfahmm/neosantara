"use client"
import React from "react";
import RootInfoModalHeader from "@/app/page/root_modals_design_menu/RootInfoModalHeader";

interface TenorOption {
  label: string;
  days: number;
}

interface PilihTenorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTerm: number;
  onSelectTerm: (days: number) => void;
}

const TENOR_OPTIONS: TenorOption[] = [
  { label: "6 Bulan", days: 180 },
  { label: "9 Bulan", days: 270 },
  { label: "1 Tahun", days: 365 },
  { label: "2 Tahun", days: 730 },
  { label: "3 Tahun", days: 1095 },
  { label: "4 Tahun", days: 1460 },
  { label: "5 Tahun", days: 1825 },
];

export default function PilihTenorModal({ isOpen, onClose, selectedTerm, onSelectTerm }: PilihTenorModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none">
      <div className="modal-responsive-shell bg-root-surface border border-root-accent/30 rounded-2xl overflow-hidden flex flex-col relative font-sans pointer-events-auto">
        <RootInfoModalHeader
          title="Pilih Tenor"
          onClose={onClose}
          size="standard"
        />

        <div className="min-h-0 flex-1 overflow-y-auto bg-root-canvas/80 p-3 custom-scrollbar sm:p-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
            {TENOR_OPTIONS.map((option) => {
              const active = option.days === selectedTerm;
              return (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => onSelectTerm(option.days)}
                  className={`rounded-2xl border px-4 py-6 text-left transition ${
                    active
                      ? "border-root-accent bg-root-accent text-root-canvas font-black cursor-pointer"
                      : "border-root-accent/20 bg-root-surface text-root-text hover:border-root-accent/50 hover:bg-root-surface/80 cursor-pointer"
                  }`}
                >
                  <div className="text-lg font-black">{option.label}</div>
                  <div className={`text-[10px] mt-1 ${active ? "text-root-canvas" : "text-root-subtle"}`}>{option.days.toLocaleString("id-ID", { maximumFractionDigits: 2 })} hari</div>
                </button>
              );
            })}
          </div>

          <div className="mt-6 rounded-2xl border border-root-accent/30 bg-root-surface p-4 text-sm text-root-text">
            <p className="font-black text-root-accent">Terpilih:</p>
            <p className="mt-1 font-bold">{selectedTerm.toLocaleString("id-ID", { maximumFractionDigits: 2 })} hari</p>
          </div>
        </div>
      </div>
    </div>
  );
}