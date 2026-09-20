// ArmadaModal.tsx
"use client"
import React, { useState, useEffect } from "react";
import { X, ShieldAlert, Swords, Building2, Shield } from "lucide-react";
import ArmadaAktif from "./1_tab_menu/1_armada_aktif";
import InfrastrukturMiliter from "./1_tab_menu/2_infrastruktur_militer";
import ArmadaPolisi from "./1_tab_menu/3_armada_polisi";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  countryDetail: any;
  setCountryDetail: (detail: any) => void;
  onGotoProduction?: (tab: string, key: string) => void;
  currentDate?: string | Date;
  initialTab?: 'aktif' | 'infrastruktur' | 'polisi';
}

export default function ArmadaModal({ isOpen, onClose, countryDetail, setCountryDetail, onGotoProduction, currentDate, initialTab = 'aktif' }: ModalProps) {
  const [activeTab, setActiveTab] = useState<'aktif' | 'infrastruktur' | 'polisi'>(initialTab);
  
  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  const [highlightInfraKey, setHighlightInfraKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const countryName =
    countryDetail?.country ||
    countryDetail?.nama_negara ||
    countryDetail?.name_id ||
    countryDetail?.name_en ||
    "Negara";

  // 🔥 Clear highlight after animation using useEffect
  useEffect(() => {
    if (highlightInfraKey) {
      const timer = setTimeout(() => setHighlightInfraKey(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [highlightInfraKey]);

  // 🔥 PERBAIKAN BUG: useEffect penyelesaian konstruksi/rekrutmen DIHAPUS dari sini.
  //
  // SEBELUMNYA di sini ada useEffect yang JUGA memproses ongoingConstructions
  // yang sudah selesai (type "recruitment"/"construction"/"purchase"), TAPI:
  //   1) Untuk type "construction" ia menulis ke `newDetail[key]` (TOP-LEVEL),
  //      bukan ke `newDetail.armada[group][key]` seperti seharusnya.
  //   2) Ia selalu menambah tepat +1, mengabaikan `c.quantity` yang sebenarnya
  //      diminta pengguna.
  //
  // Akibatnya: `1_armada_aktif.tsx` (lewat fungsi getData) mengecek top-level
  // key LEBIH DULU sebelum armada[group][key]. Begitu useEffect di file ini
  // menulis top-level key baru (mis. `tank_tempur_utama: 1`), nilai itu
  // "menutupi" nilai asli yang benar di `armada.darat.tank_tempur_utama`
  // (mis. 4650) — sehingga tampilan kartu di Tab Armada Aktif mendadak
  // turun jadi 1 padahal sebelumnya sudah terakumulasi banyak.
  //
  // Selain itu, useEffect ini BERJALAN BERSAMAAN (race condition) dengan
  // useEffect serupa yang SUDAH ADA dan SUDAH BENAR di `1_armada_aktif.tsx`
  // (yang menambah ke armada[group][key] dengan quantity yang benar). Dua
  // useEffect yang memproses array `ongoingConstructions` yang sama secara
  // independen inilah sumber bug-nya.
  //
  // Fix: cukup SATU sumber kebenaran untuk memproses penyelesaian
  // recruitment/construction unit Armada Aktif, yaitu useEffect yang ada
  // di `1_armada_aktif.tsx`. File ini tidak perlu (dan tidak boleh) ikut
  // memprosesnya lagi.
  //
  // Catatan: jika InfrastrukturMiliter (bangunan seperti Barak, Hangar
  // Tank, Gudang Senjata, dst) punya kebutuhan serupa untuk memproses
  // constructionnya sendiri, itu HARUS ditangani di dalam komponen
  // InfrastrukturMiliter itu sendiri (dengan menulis ke lokasi data yang
  // benar dan menghormati quantity) — bukan di sini secara generik.

  const handleNavigateToInfra = (infraKey: string) => {
    setActiveTab("infrastruktur");
    setHighlightInfraKey(infraKey);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none">
      <div className="bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans pointer-events-auto shadow-2xl">
        
        {/* HEADER */}
        <div className="px-6 py-4 border-b border-[#00FFAA]/30 flex items-center justify-between bg-[#0A1A1A] relative z-10 shrink-0">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#0F2424] rounded-xl border border-[#00FFAA]/30">
                <ShieldAlert className="h-6 w-6 text-rose-500 animate-pulse" />
              </div>
              <div>
                <h2 className="text-xl font-black text-[#00FFAA] tracking-wider uppercase">Pertahanan & Keamanan</h2>
                <p className="text-[11px] font-bold uppercase tracking-widest text-[#6B8A8A] mt-0.5">{countryName}</p>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] text-[#6B8A8A] hover:text-[#00FFAA] hover:border-[#00FFAA] transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* BODY MODAL */}
        <div className="flex-1 min-h-0 overflow-y-auto p-6 bg-[#0F2424] relative z-10 no-scrollbar">
          <div className="bg-[#0A1A1A] p-1 rounded-xl border border-[#00FFAA]/20 inline-flex mb-6 shadow-sm">
            <button 
              onClick={() => setActiveTab("aktif")} 
              className={`flex items-center gap-2 px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${
                activeTab === "aktif" 
                  ? "bg-[#00FFAA] text-[#0A1A1A] shadow-md shadow-[#00FFAA]/20" 
                  : "text-[#6B8A8A] hover:text-[#00FFAA]"
              }`}
            >
              <Swords className="w-4 h-4" /> Armada Aktif
            </button>
            <button 
              onClick={() => setActiveTab("infrastruktur")} 
              className={`flex items-center gap-2 px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${
                activeTab === "infrastruktur" 
                  ? "bg-[#00FFAA] text-[#0A1A1A] shadow-md shadow-[#00FFAA]/20" 
                  : "text-[#6B8A8A] hover:text-[#00FFAA]"
              }`}
            >
              <Building2 className="w-4 h-4" /> Infrastruktur
            </button>
            <button 
              onClick={() => setActiveTab("polisi")} 
              className={`flex items-center gap-2 px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${
                activeTab === "polisi" 
                  ? "bg-[#00FFAA] text-[#0A1A1A] shadow-md shadow-[#00FFAA]/20" 
                  : "text-[#6B8A8A] hover:text-[#00FFAA]"
              }`}
            >
              <Shield className="w-4 h-4" /> Armada Polisi
            </button>
          </div>

          <div className="space-y-4">
            {activeTab === "aktif" && <ArmadaAktif countryDetail={countryDetail} setCountryDetail={setCountryDetail} onCapacityFull={handleNavigateToInfra} onGotoProduction={onGotoProduction} currentDate={currentDate} />}
            {activeTab === "infrastruktur" && <InfrastrukturMiliter countryDetail={countryDetail} setCountryDetail={setCountryDetail} highlightKey={highlightInfraKey} onGotoProduction={onGotoProduction} ongoingConstructions={countryDetail?.ongoingConstructions || []} currentDate={currentDate} />}
            {activeTab === "polisi" && <ArmadaPolisi countryDetail={countryDetail} setCountryDetail={setCountryDetail} />}
          </div>
        </div>
      </div>
    </div>
  );
}