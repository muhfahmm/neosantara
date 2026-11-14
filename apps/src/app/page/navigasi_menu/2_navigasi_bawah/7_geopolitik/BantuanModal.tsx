"use client"
import React from "react";
import { Globe, Construction } from "lucide-react";
import RootInfoModalHeader from "@/app/page/root_modals_design_menu/RootInfoModalHeader";

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
      <div className="modal-responsive-shell bg-root-surface border border-root-accent/30 rounded-2xl overflow-hidden flex flex-col relative font-sans pointer-events-auto shadow-2xl">
        <RootInfoModalHeader
          title="Program Bantuan Kemanusiaan"
          onClose={onClose}
          size="standard"
          icon={<Globe aria-hidden="true" className="text-root-accent" />}
        />

        {/* BODY MODAL */}
        <div className="relative z-10 flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto bg-root-surface p-4 sm:p-8 custom-scrollbar">
          <div className="flex w-full max-w-2xl flex-col items-center justify-center py-4 text-center sm:py-6">
            
            <div className="mb-6 rounded-full border border-root-accent/30 bg-root-canvas p-4 sm:mb-8 sm:p-6">
              <Construction className="h-14 w-14 text-root-accent sm:h-20 sm:w-20" strokeWidth={1.5} />
            </div>

            <h3 className="mb-4 text-4xl font-black uppercase leading-[0.95] tracking-wide text-root-text sm:text-5xl md:text-6xl">
              Dalam<br />Pengembangan
            </h3>

            <div className="w-16 h-1 bg-root-accent/40 rounded-full mb-6" />

            <p className="max-w-lg text-sm font-medium leading-relaxed text-root-subtle md:text-base">
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