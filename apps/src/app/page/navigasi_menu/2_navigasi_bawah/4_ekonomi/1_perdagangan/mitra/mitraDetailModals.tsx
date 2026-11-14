// mitra/mitraDetailModals.tsx

"use client"

import React from "react";
import { Building2, Globe, FileText, Handshake, ArrowRightLeft } from "lucide-react";
import { TradePartner } from "./mitraModalsMenu";
import NotebookModalWrapper from "../../../NotebookModalWrapper";
import RootInfoModalHeader from "@/app/page/root_modals_design_menu/RootInfoModalHeader";
import SharedModalCloseButton from "@/app/page/root_modals_design_menu/ModalCloseButton";

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
    <NotebookModalWrapper
      zIndexClass="z-[70]"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="trade-partner-detail-title"
        className="root-modal-util-b74379da23 min-w-0"
      >
        <RootInfoModalHeader
          title="Detail Hubungan Dagang"
          titleId="trade-partner-detail-title"
          onClose={onClose}
          size="standard"
          icon={<Building2 aria-hidden="true" />}
        />

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-root-surface relative z-10 neon-scrollbar">
          <div className="max-w-4xl mx-auto space-y-8">
            
            {/* Judul Negara */}
            <div className="flex items-center gap-4 pb-4 border-b border-root-accent/20">
              <div className="p-3 rounded-xl bg-root-accent/10 border border-root-accent/30">
                <Globe className="h-8 w-8 text-root-accent" />
              </div>
              <div>
                <h3 className="text-3xl font-black text-root-text uppercase">{partner.nama_negara}</h3>
                <p className="text-sm text-root-subtle font-semibold flex items-center gap-2 mt-0.5">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
                  {partner.region}
                </p>
              </div>
            </div>

            {/* Grid Informasi Detail */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Kartu 1: Status & Hubungan */}
              <div className="bg-root-canvas border border-root-accent/20 p-5 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-root-accent border-b border-root-accent/20 pb-2 mb-2">
                  <Handshake className="h-5 w-5" />
                  <h4 className="text-sm font-black uppercase tracking-wider">Status Hubungan</h4>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-root-subtle font-semibold">Status Saat Ini:</span>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
                    ${partner.status_hubungan === 'Aktif' ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/30' : 
                      partner.status_hubungan === 'Pasif' ? 'bg-amber-950/40 text-amber-400 border border-amber-500/30' : 
                      'bg-root-surface text-root-subtle border border-root-subtle/30'}`}>
                    {partner.status_hubungan}
                  </span>
                </div>
                {partner.jenis_perjanjian && (
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-sm text-root-subtle font-semibold">Jenis Perjanjian:</span>
                    <span className="px-3 py-1 bg-root-accent/10 text-root-accent border border-root-accent/30 rounded-full text-[10px] font-bold uppercase tracking-wider">
                      {partner.jenis_perjanjian}
                    </span>
                  </div>
                )}
              </div>

              {/* Kartu 2: Aksi Perdagangan */}
              <div className="bg-root-canvas border border-root-accent/20 p-5 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-root-accent border-b border-root-accent/20 pb-2 mb-2">
                  <ArrowRightLeft className="h-5 w-5" />
                  <h4 className="text-sm font-black uppercase tracking-wider">Aksi Perdagangan</h4>
                </div>
                <div className="flex flex-col gap-3 pt-1">
                  <div className="flex items-center justify-between border-b border-root-accent/10 pb-2">
                    <span className="text-sm text-root-subtle font-semibold">Mulai transaksi dengan:</span>
                    <span className="text-sm font-bold text-root-text">{partner.nama_negara}</span>
                  </div>
                  <div className="flex gap-3">
                    {/* TOMBOL BELI */}
                    <button
                      onClick={() => onBeli && onBeli(partner)}
                      className="flex-1 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-root-canvas text-xs font-black uppercase tracking-wide transition-all cursor-pointer"
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
            <div className="bg-root-canvas border border-root-accent/20 p-6 rounded-xl">
              <div className="flex items-center gap-2 mb-3 border-b border-root-accent/20 pb-2">
                <FileText className="h-5 w-5 text-root-accent" />
                <h4 className="text-sm font-black text-root-accent uppercase tracking-wider">Catatan Perdagangan</h4>
              </div>
              <p className="text-sm text-root-subtle leading-relaxed">
                Mitra dagang ini memiliki status hubungan <strong className="text-root-accent">{partner.status_hubungan}</strong> dengan negara Anda.
                {partner.jenis_perjanjian ? ` Perjanjian yang berlaku saat ini adalah: ${partner.jenis_perjanjian}.` : ''}
              </p>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-4 border-t border-root-accent/20 flex justify-end bg-root-canvas relative z-10">
          <SharedModalCloseButton
            type="button"
            onClick={onClose} 
            className="px-6 py-2.5 rounded-xl border border-root-accent/30 text-root-accent hover:bg-root-accent hover:text-root-canvas transition-all cursor-pointer text-xs font-black uppercase tracking-wider"
           appearance="custom">
            Tutup
          </SharedModalCloseButton>
        </div>
      </div>
    </NotebookModalWrapper>
  );
}