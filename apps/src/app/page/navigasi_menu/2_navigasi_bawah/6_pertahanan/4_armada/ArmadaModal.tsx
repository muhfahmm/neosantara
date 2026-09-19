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
      <div className="bg-[#FAF6EE] border-2 sm:border-3 border-[#C4B49C] rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans pointer-events-auto shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,0,0,0.03)_0%,transparent_100%)] pointer-events-none" />

        <div className="px-8 py-6 border-b-2 border-[#C4B49C]/30 flex items-center justify-between bg-[#FAF6EE] relative z-10 shrink-0">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <ShieldAlert className="h-6 w-6 text-rose-700 animate-pulse" />
              <div>
                <h2 className="text-2xl font-bold text-[#5c3c10] tracking-tight leading-none uppercase">Pertahanan & Keamanan</h2>
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#8b7e66] mt-1">{countryName}</p>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 sm:p-2.5 rounded-xl border-2 border-[#C4B49C] bg-transparent text-[#8b7e66] hover:text-[#5c3c10] hover:bg-black/5 active:bg-black/10 transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1.5 shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto p-6 bg-[#FAF6EE]/40 relative z-10 no-scrollbar">
          <div className="bg-[#e4dac3]/40 p-1 rounded-xl border border-[#C4B49C]/40 inline-flex mb-6 shadow-sm">
            <button onClick={() => setActiveTab("aktif")} className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${activeTab === "aktif" ? "bg-[#5c3c10] text-[#FAF6EE] shadow-md shadow-[#5c3c10]/20" : "text-[#8b7e66] hover:text-[#5c3c10]"}`}>
              <Swords className="w-4 h-4" /> Armada Aktif
            </button>
            <button onClick={() => setActiveTab("infrastruktur")} className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${activeTab === "infrastruktur" ? "bg-[#5c3c10] text-[#FAF6EE] shadow-md shadow-[#5c3c10]/20" : "text-[#8b7e66] hover:text-[#5c3c10]"}`}>
              <Building2 className="w-4 h-4" /> Infrastruktur
            </button>
            <button onClick={() => setActiveTab("polisi")} className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${activeTab === "polisi" ? "bg-[#5c3c10] text-[#FAF6EE] shadow-md shadow-[#5c3c10]/20" : "text-[#8b7e66] hover:text-[#5c3c10]"}`}>
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