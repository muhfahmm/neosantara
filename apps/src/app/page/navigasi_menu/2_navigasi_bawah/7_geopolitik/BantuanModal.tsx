"use client"
import SharedModalCloseButton from '@/app/page/root_modals_design_menu/ModalCloseButton';
import React from "react";
import { X, Globe, Construction } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  countryDetail: any;
  setCountryDetail: (detail: any) => void;
}

export default function BantuanModal({ isOpen, onClose, countryDetail, setCountryDetail }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none">
      <div className="bg-root-surface border border-root-accent/30 rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans pointer-events-auto shadow-2xl">
        <div className="px-8 py-5 border-b border-root-accent/20 flex items-center justify-between bg-root-canvas relative z-10">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-root-accent/10 rounded-xl border border-root-accent/30">
                <Globe className="h-6 w-6 text-root-accent" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-root-text tracking-wide leading-none uppercase">Program Bantuan Kemanusiaan</h2>
              </div>
            </div>
          </div>
          <SharedModalCloseButton onClick={onClose} className="p-2 sm:p-2.5 rounded-xl border border-root-accent/30 bg-root-accent/10 text-root-accent hover:bg-root-accent/20 transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1.5 shadow-sm" appearance="custom">
            <span className="text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
            <X className="h-5 w-5" />
          </SharedModalCloseButton>
        </div>

        {/* BODY MODAL */}
        <div className="flex-1 min-h-0 overflow-y-auto p-8 bg-root-surface relative z-10 custom-scrollbar flex flex-col items-center justify-center">
          <div className="flex flex-col items-center justify-center w-full max-w-2xl py-6 text-center">
            
            <div className="p-6 rounded-full bg-root-canvas border border-root-accent/30 mb-8">
              <Construction className="w-20 h-20 text-root-accent" strokeWidth={1.5} />
            </div>

            <h3 className="text-5xl md:text-6xl font-black uppercase text-root-text tracking-wide leading-[0.95] mb-4">
              Dalam<br />Pengembangan
            </h3>

            <div className="w-16 h-1 bg-root-accent/40 rounded-full mb-6" />

            <p className="text-sm md:text-base text-root-subtle font-medium leading-relaxed max-w-lg">
              Sistem pengiriman bantuan kemanusiaan internasional sedang dalam tahap pembangunan.
              Pantau terus perkembangannya untuk memperkuat reputasi dan hegemoni kemanusiaan Anda.
            </p>

            <div className="mt-8 inline-flex items-center rounded-full bg-root-accent/10 border border-root-accent/30 px-6 py-2 text-xs font-bold uppercase tracking-widest text-root-accent">
              <span className="mr-2 h-2.5 w-2.5 animate-pulse rounded-full bg-root-accent" />
              Segera Hadir
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}