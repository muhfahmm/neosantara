"use client";
import React from "react";
import { X } from "lucide-react";

interface InfoInfrastrukturModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedItem: any;
  formatNumber: (value: unknown) => string;
  getNestedValue: (obj: any, key: string) => number;
  countryDetail: any;
}

export default function InfoInfrastrukturModal({
  isOpen,
  onClose,
  selectedItem,
  formatNumber,
  getNestedValue,
  countryDetail,
}: InfoInfrastrukturModalProps) {
  if (!isOpen || !selectedItem) return null;

  const value = getNestedValue(countryDetail, selectedItem.key);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none">
      <div className="bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans animate-in fade-in zoom-in-95 duration-150 pointer-events-auto shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,255,170,0.03)_0%,transparent_100%)] pointer-events-none" />

        {/* Header */}
        <div className="px-6 py-4 border-b border-[#00FFAA]/30 flex items-center justify-between bg-[#0A1A1A] relative z-10 shrink-0">
          <h3 className="font-black text-[#00FFAA] uppercase tracking-wider text-xl">{selectedItem?.label}</h3>
          <button 
            onClick={onClose} 
            className="p-2 sm:p-2.5 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] text-[#6B8A8A] hover:text-[#00FFAA] hover:border-[#00FFAA] transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1.5 shadow-sm"
          >
            <span className="text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#0F2424] relative z-10 space-y-4 text-xs font-semibold text-[#E0E0E0] custom-scrollbar">
          {selectedItem?.deskripsi && (
            <div className="bg-[#0A1A1A] p-4 rounded-xl border border-[#00FFAA]/20">
              <p className="text-[12px] font-bold text-[#6B8A8A] mb-1">Deskripsi</p>
              <p className="text-sm font-semibold text-[#E0E0E0]">{selectedItem.deskripsi}</p>
            </div>
          )}

          <div className="bg-[#0A1A1A] p-4 rounded-xl border border-[#00FFAA]/20">
            <p className="text-[12px] font-bold text-[#6B8A8A] mb-1">Jumlah</p>
            <p className="text-xl font-black text-white">
              {formatNumber(value)} {selectedItem?.satuan_kapasitas || "Unit"}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#0A1A1A] p-4 rounded-xl border border-[#00FFAA]/20">
              <p className="text-[12px] font-bold text-[#6B8A8A] mb-1">Biaya Pembangunan</p>
              <p className="text-base font-black text-[#00FFAA]">
                {formatNumber(selectedItem?.biaya_pembangunan)} EM
              </p>
            </div>
            <div className="bg-[#0A1A1A] p-4 rounded-xl border border-[#00FFAA]/20">
              <p className="text-[12px] font-bold text-[#6B8A8A] mb-1">Waktu Pembangunan</p>
              <p className="text-base font-black text-white">
                {selectedItem?.waktu_pembangunan} Hari
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#0A1A1A] p-4 rounded-xl border border-[#00FFAA]/20">
              <p className="text-[12px] font-bold text-[#6B8A8A] mb-1">Tenaga Kerja</p>
              <p className="text-base font-black text-white">
                {formatNumber(selectedItem?.lowongan_kerja)} orang
              </p>
            </div>
            <div className="bg-[#0A1A1A] p-4 rounded-xl border border-[#00FFAA]/20">
              <p className="text-[12px] font-bold text-[#6B8A8A] mb-1">Konsumsi Listrik</p>
              <p className="text-base font-black text-white">
                {formatNumber(selectedItem?.konsumsi_listrik)} kW
              </p>
            </div>
          </div>

          {selectedItem?.kapasitas && (
            <div className="bg-[#0A1A1A] p-4 rounded-xl border border-[#00FFAA]/20">
              <p className="text-[12px] font-bold text-[#6B8A8A] mb-1">Kapasitas</p>
              <p className="text-xl font-black text-[#00FFAA]">
                {formatNumber(selectedItem.kapasitas)} {selectedItem.satuan_kapasitas}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#0A1A1A] border-t border-[#00FFAA]/20 flex justify-end relative z-10 shrink-0">
          <button 
            onClick={onClose} 
            className="px-6 py-2.5 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] text-[#6B8A8A] hover:text-white text-[10px] font-black uppercase cursor-pointer hover:bg-[#1A3838] transition-all text-center"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
