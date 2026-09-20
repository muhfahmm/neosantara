"use client"
import React from "react";
import { X } from "lucide-react";

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
      <div className="bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans pointer-events-auto">
        <div className="flex items-center justify-between px-8 py-6 border-b border-[#00FFAA]/20 bg-[#0A1A1A] relative z-10">
          <div>
            <h3 className="text-2xl font-black text-[#00FFAA] uppercase">Pilih Tenor</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 sm:p-2.5 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] text-[#00FFAA] hover:bg-[#00FFAA] hover:text-[#0A1A1A] transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1.5"
          >
            <span className="text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 bg-[#0A1A1A]/80 custom-scrollbar">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {TENOR_OPTIONS.map((option) => {
              const active = option.days === selectedTerm;
              return (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => onSelectTerm(option.days)}
                  className={`rounded-2xl border px-4 py-6 text-left transition ${
                    active
                      ? "border-[#00FFAA] bg-[#00FFAA] text-[#0A1A1A] font-black cursor-pointer"
                      : "border-[#00FFAA]/20 bg-[#0F2424] text-[#E0E0E0] hover:border-[#00FFAA]/50 hover:bg-[#0F2424]/80 cursor-pointer"
                  }`}
                >
                  <div className="text-lg font-black">{option.label}</div>
                  <div className={`text-[10px] mt-1 ${active ? "text-[#0A1A1A]" : "text-[#6B8A8A]"}`}>{option.days.toLocaleString("id-ID")} hari</div>
                </button>
              );
            })}
          </div>

          <div className="mt-6 rounded-2xl border border-[#00FFAA]/30 bg-[#0F2424] p-4 text-sm text-[#E0E0E0]">
            <p className="font-black text-[#00FFAA]">Terpilih:</p>
            <p className="mt-1 font-bold">{selectedTerm.toLocaleString("id-ID")} hari</p>
          </div>
        </div>
      </div>
    </div>
  );
}
