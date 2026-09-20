// mitra/mitraDetailModals.tsx

"use client"

import React from "react";
import { X, Building2, Globe, FileText, Handshake, ArrowRightLeft } from "lucide-react";
import { TradePartner } from "./mitraModalsMenu";

interface MitraDetailModalsProps {
  isOpen: boolean;
  onClose: () => void;
  partner: TradePartner | null;
  // TAMBAHAN: Callback untuk tombol Beli dan Jual
  onBeli?: (partner: TradePartner) => void;
  onJual?: (partner: TradePartner) => void;
}

export default function MitraDetailModals({ 
  isOpen, 
  onClose, 
  partner,
  onBeli,
  onJual
}: MitraDetailModalsProps) {
  // Jika modal tertutup atau data partner kosong, jangan render
  if (!isOpen || !partner) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none">
      <div className="bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans pointer-events-auto">
        {/* Header */}
        <div className="px-8 py-6 border-b border-[#00FFAA]/20 flex items-center justify-between bg-[#0A1A1A] relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#00FFAA]/10 rounded-xl border border-[#00FFAA]/30">
              <Building2 className="h-6 w-6 text-[#00FFAA]" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#00FFAA] tracking-tight leading-none uppercase">
                Detail Hubungan Dagang
              </h2>
              <p className="text-xs text-[#6B8A8A] font-semibold mt-1">
                Informasi lengkap mitra dagang yang dipilih
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2.5 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] text-[#00FFAA] hover:bg-[#00FFAA] hover:text-[#0A1A1A] transition-all cursor-pointer"
          >
            <span className="text-[10px] font-black uppercase tracking-widest pl-1">Tutup</span>
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-[#0F2424] relative z-10 no-scrollbar">
          <div className="max-w-4xl mx-auto space-y-8">
            
            {/* Judul Negara */}
            <div className="flex items-center gap-4 pb-4 border-b border-[#00FFAA]/20">
              <div className="p-3 rounded-xl bg-[#00FFAA]/10 border border-[#00FFAA]/30">
                <Globe className="h-8 w-8 text-[#00FFAA]" />
              </div>
              <div>
                <h3 className="text-3xl font-black text-[#E0E0E0] uppercase">{partner.nama_negara}</h3>
                <p className="text-sm text-[#6B8A8A] font-semibold flex items-center gap-2 mt-0.5">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
                  {partner.region}
                </p>
              </div>
            </div>

            {/* Grid Informasi Detail */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Kartu 1: Status & Hubungan */}
              <div className="bg-[#0A1A1A] border border-[#00FFAA]/20 p-5 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-[#00FFAA] border-b border-[#00FFAA]/20 pb-2 mb-2">
                  <Handshake className="h-5 w-5" />
                  <h4 className="text-sm font-black uppercase tracking-wider">Status Hubungan</h4>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#6B8A8A] font-semibold">Status Saat Ini:</span>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
                    ${partner.status_hubungan === 'Aktif' ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/30' : 
                      partner.status_hubungan === 'Pasif' ? 'bg-amber-950/40 text-amber-400 border border-amber-500/30' : 
                      'bg-[#0F2424] text-[#6B8A8A] border border-[#6B8A8A]/30'}`}>
                    {partner.status_hubungan}
                  </span>
                </div>
                {partner.jenis_perjanjian && (
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-sm text-[#6B8A8A] font-semibold">Jenis Perjanjian:</span>
                    <span className="px-3 py-1 bg-[#00FFAA]/10 text-[#00FFAA] border border-[#00FFAA]/30 rounded-full text-[10px] font-bold uppercase tracking-wider">
                      {partner.jenis_perjanjian}
                    </span>
                  </div>
                )}
              </div>

              {/* Kartu 2: Aksi Perdagangan */}
              <div className="bg-[#0A1A1A] border border-[#00FFAA]/20 p-5 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-[#00FFAA] border-b border-[#00FFAA]/20 pb-2 mb-2">
                  <ArrowRightLeft className="h-5 w-5" />
                  <h4 className="text-sm font-black uppercase tracking-wider">Aksi Perdagangan</h4>
                </div>
                <div className="flex flex-col gap-3 pt-1">
                  <div className="flex items-center justify-between border-b border-[#00FFAA]/10 pb-2">
                    <span className="text-sm text-[#6B8A8A] font-semibold">Mulai transaksi dengan:</span>
                    <span className="text-sm font-bold text-[#E0E0E0]">{partner.nama_negara}</span>
                  </div>
                  <div className="flex gap-3">
                    {/* TOMBOL BELI */}
                    <button
                      onClick={() => onBeli && onBeli(partner)}
                      className="flex-1 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-[#0A1A1A] text-xs font-black uppercase tracking-wide transition-all cursor-pointer"
                    >
                      Beli
                    </button>
                    {/* TOMBOL JUAL */}
                    <button
                      onClick={() => onJual && onJual(partner)}
                      className="flex-1 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-black uppercase tracking-wide transition-all cursor-pointer"
                    >
                      Jual
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Ringkasan Deskripsi */}
            <div className="bg-[#0A1A1A] border border-[#00FFAA]/20 p-6 rounded-xl">
              <div className="flex items-center gap-2 mb-3 border-b border-[#00FFAA]/20 pb-2">
                <FileText className="h-5 w-5 text-[#00FFAA]" />
                <h4 className="text-sm font-black text-[#00FFAA] uppercase tracking-wider">Catatan Perdagangan</h4>
              </div>
              <p className="text-sm text-[#6B8A8A] leading-relaxed">
                Mitra dagang ini memiliki status hubungan <strong className="text-[#00FFAA]">{partner.status_hubungan}</strong> dengan negara Anda. 
                {partner.jenis_perjanjian ? ` Perjanjian yang berlaku saat ini adalah: ${partner.jenis_perjanjian}.` : ''}
              </p>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-4 border-t border-[#00FFAA]/20 flex justify-end bg-[#0A1A1A] relative z-10">
          <button 
            onClick={onClose} 
            className="px-6 py-2.5 rounded-xl border border-[#00FFAA]/30 text-[#00FFAA] hover:bg-[#00FFAA] hover:text-[#0A1A1A] transition-all cursor-pointer text-xs font-black uppercase tracking-wider"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
