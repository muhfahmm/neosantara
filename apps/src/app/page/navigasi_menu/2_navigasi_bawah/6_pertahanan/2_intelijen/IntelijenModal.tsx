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
      <div className="bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans pointer-events-auto shadow-2xl">
        
        {/* HEADER MODAL */}
        <div className="px-6 py-4 border-b border-[#00FFAA]/30 flex items-center justify-between bg-[#0A1A1A] relative z-10 shrink-0">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#0F2424] rounded-xl border border-[#00FFAA]/30">
                {activeTab === 'spionase' ? (
                  <Eye className="h-6 w-6 text-[#00FFAA] animate-pulse" />
                ) : (
                  <Bomb className="h-6 w-6 text-orange-400 animate-pulse" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-black text-[#00FFAA] tracking-wider uppercase">
                  {activeTab === 'spionase' ? 'Badan Intelijen & Sandi Negara' : 'Divisi Operasi Khusus'}
                </h2>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] text-[#6B8A8A] hover:text-[#00FFAA] hover:border-[#00FFAA] transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* BODY MODAL */}
        <div className="flex-1 min-h-0 overflow-y-auto p-6 bg-[#0F2424] relative z-10 no-scrollbar flex flex-col items-center">
          <div className="w-full space-y-4">
            
            {/* 2 TAB MENU */}
            <div className="bg-[#0A1A1A] p-1 rounded-xl border border-[#00FFAA]/20 inline-flex shadow-sm">
              <button
                onClick={() => setActiveTab('spionase')}
                className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${
                  activeTab === 'spionase'
                    ? 'bg-[#00FFAA] text-[#0A1A1A] shadow-md shadow-[#00FFAA]/20'
                    : 'text-[#6B8A8A] hover:text-[#00FFAA]'
                }`}
              >
                Spionase
              </button>
              <button
                onClick={() => setActiveTab('sabotase')}
                className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${
                  activeTab === 'sabotase'
                    ? 'bg-[#00FFAA] text-[#0A1A1A] shadow-md shadow-[#00FFAA]/20'
                    : 'text-[#6B8A8A] hover:text-[#00FFAA]'
                }`}
              >
                Sabotase
              </button>
            </div>

            {/* RENDER KOMPONEN TABEL TERPISAH */}
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