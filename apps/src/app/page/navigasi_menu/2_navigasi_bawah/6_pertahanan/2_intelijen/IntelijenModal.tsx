"use client"
import React, { useState } from "react";
import { X, Eye, Bomb } from "lucide-react";
import Spionase from "./table_menu/1_tabel_spionase";
import Sabotase from "./table_menu/2_tabel_sabotase";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  countryDetail: any;
  setCountryDetail: (detail: any) => void;
  prefetchedAllCountries?: any[]; // 🔥 Tambahkan prop ini!
}

export default function IntelijenModal({ isOpen, onClose, countryDetail, setCountryDetail, prefetchedAllCountries }: ModalProps) {
  const [activeTab, setActiveTab] = useState<'spionase' | 'sabotase'>('spionase');
  if (!isOpen) return null;

  const anggaran = countryDetail?.anggaran || 0;

  // 🔥 Logika aksi untuk Spionase
  const handleSpionaseAction = (target: any) => {
    if (anggaran < 10000000) {
      alert("Kas negara tidak mencukupi untuk misi spionase!");
      return;
    }
    setCountryDetail({
      ...countryDetail,
      anggaran: anggaran - 10000000
    });
    alert(`Misi spionase 'Sandi Garuda' sukses diluncurkan ke negara: ${target.countryName}!`);
  };

  // 🔥 Logika aksi untuk Sabotase
  const handleSabotaseAction = (target: any) => {
    if (anggaran < 20000000) {
      alert("Kas negara tidak mencukupi untuk operasi sabotase!");
      return;
    }
    setCountryDetail({
      ...countryDetail,
      anggaran: anggaran - 20000000
    });
    alert(`Divisi Operasi Khusus berhasil melakukan sabotase di negara: ${target.countryName}!`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none">
      <div className="bg-[#FAF6EE] border-2 sm:border-3 border-[#C4B49C] rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans pointer-events-auto shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,0,0,0.03)_0%,transparent_100%)] pointer-events-none" />
        
        {/* HEADER MODAL */}
        <div className="px-8 py-6 border-b-2 border-[#C4B49C]/30 flex items-center justify-between bg-[#FAF6EE] relative z-10 shrink-0">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              {activeTab === 'spionase' ? (
                <Eye className="h-6 w-6 text-indigo-700 animate-pulse" />
              ) : (
                <Bomb className="h-6 w-6 text-rose-700 animate-pulse" />
              )}
              <div>
                <h2 className="text-2xl font-bold text-[#5c3c10] tracking-tight leading-none uppercase">
                  {activeTab === 'spionase' ? 'Badan Intelijen & Sandi Negara' : 'Divisi Operasi Khusus'}
                </h2>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 sm:p-2.5 rounded-xl border-2 border-[#C4B49C] bg-transparent text-[#8b7e66] hover:text-[#5c3c10] hover:bg-black/5 active:bg-black/10 transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1.5 shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* BODY MODAL */}
        <div className="flex-1 min-h-0 overflow-y-auto p-8 bg-[#FAF6EE]/40 relative z-10 no-scrollbar flex flex-col items-center">
          <div className="w-full max-w-5xl space-y-6">
            
            {/* 🔥 2 TAB MENU */}
            <div className="bg-[#e4dac3]/40 p-1 rounded-xl border border-[#C4B49C]/40 inline-flex shadow-sm">
              <button
                onClick={() => setActiveTab('spionase')}
                className={`px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${
                  activeTab === 'spionase'
                    ? 'bg-[#5c3c10] text-[#FAF6EE] shadow-md shadow-[#5c3c10]/20'
                    : 'text-[#8b7e66] hover:text-[#5c3c10]'
                }`}
              >
                Spionase
              </button>
              <button
                onClick={() => setActiveTab('sabotase')}
                className={`px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${
                  activeTab === 'sabotase'
                    ? 'bg-[#5c3c10] text-[#FAF6EE] shadow-md shadow-[#5c3c10]/20'
                    : 'text-[#8b7e66] hover:text-[#5c3c10]'
                }`}
              >
                Sabotase
              </button>
            </div>

            {/* 🔥 RENDER KOMPONEN TABEL TERPISAH */}
            <div className="w-full mt-2">
              {activeTab === 'spionase' && (
                <Spionase prefetchedAllCountries={prefetchedAllCountries} countryDetail={countryDetail} onAction={handleSpionaseAction} />
              )}
              {activeTab === 'sabotase' && (
                <Sabotase prefetchedAllCountries={prefetchedAllCountries} countryDetail={countryDetail} onAction={handleSabotaseAction} />
              )}
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}