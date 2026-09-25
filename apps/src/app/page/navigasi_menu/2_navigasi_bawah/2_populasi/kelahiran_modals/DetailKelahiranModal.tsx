"use client";

import React, { useState } from "react";
import { X, Users, Baby, HeartPulse, Home, GraduationCap, Banknote, ArrowUpRight, Smile, Heart, Activity, Info } from "lucide-react";

import {
  calculateGeneralSatisfaction,
  calculateDailyBirths,
  calculateDailyDeaths,
  calculateLifeExpectancy,
  calculateSecurityLevel,
} from "@/app/logic/populations_logic/population_logic";

// ðŸ”¥ Import ke-5 modal detail
import DetailPopulasiDasarModal from "./grid_modals/DetailPopulasiDasarModal";
import DetailKesejahteraanModal from "./grid_modals/DetailKesejahteraanModal";
import DetailFasilitasKesehatanModal from "./grid_modals/DetailFasilitasKesehatanModal";
import DetailKebijakanInsentifAnakModal from "./grid_modals/DetailKebijakanInsentifAnakModal";
import DetailTingkatPendidikanModal from "./grid_modals/DetailTingkatPendidikanModal";

import { calculateKesehatanLogic } from "../kematian_modals/logic/kesehatanLogic";

interface DetailKelahiranModalProps {
  isOpen: boolean;
  onClose: () => void;
  countryDetail?: any;
  selectedCountry?: any;
  dailyBirths?: number;
  dailyDeaths?: number;
  netDailyChange?: number;
  onOpenTempatUmum?: (tabId: string) => void; // Handler untuk buka TempatUmumModal dengan tab tertentu
}

export default function DetailKelahiranModal({
  isOpen,
  onClose,
  countryDetail,
  selectedCountry,
  dailyBirths: propsDailyBirths,
  dailyDeaths: propsDailyDeaths,
  netDailyChange: propsNetDailyChange,
  onOpenTempatUmum,
}: DetailKelahiranModalProps) {
  // ðŸ”¥ State untuk 5 modal detail
  const [openPopulasiDasar, setOpenPopulasiDasar] = useState(false);
  const [openKesejahteraan, setOpenKesejahteraan] = useState(false);
  const [openFasilitasKesehatan, setOpenFasilitasKesehatan] = useState(false);
  const [openKebijakanInsentifAnak, setOpenKebijakanInsentifAnak] = useState(false);
  const [openTingkatPendidikan, setOpenTingkatPendidikan] = useState(false);

  if (!isOpen) return null;

  const populasi = countryDetail?.jumlah_penduduk || 10_000_000;

  const countryName = selectedCountry?.country?.toLowerCase?.() || "";

  // ðŸ”¥ Siapkan detail untuk menghitung kepuasan (sama seperti di modal utama)
  const detailWithDefaults = {
    ...countryDetail,
  };
  const kepuasanUmum = calculateGeneralSatisfaction(detailWithDefaults);

  // Ambil data user
  const programInsentifAnak = countryDetail?.program_insentif_anak ?? false;

  // Kesehatan - mengambil data dinamis seperti di menu kematian
  const kesehatanRes = calculateKesehatanLogic(countryDetail, populasi);
  const jumlahRumahSakit = kesehatanRes.jumlahRumahSakit;
  const hospitalRatio = kesehatanRes.kesehatanRatio;
  const healthFactor = 0.7 + 0.3 * hospitalRatio;

  // Pendidikan - mengambil data dinamis (total sekolah dibangun / ideal)
  const eduKeys = ["prasekolah", "dasar", "menengah", "lanjutan", "universitas", "lembaga_pendidikan", "laboratorium", "observatorium", "pusat_penelitian", "pusat_pengembangan", "literasi"];
  const totalEducation = eduKeys.reduce((sum, key) => sum + (Number(countryDetail?.[key]) || 0), 0);
  const idealEducation = Math.ceil(populasi / 50000) || 1;
  const educationRatio = Math.min(1, totalEducation / idealEducation);
  const tingkatPendidikan = educationRatio;
  const educationFactor = 1.1 - (0.3 * tingkatPendidikan);

  // ðŸ”¥ Hitung Kelahiran dan Kematian (atau gunakan nilai dari props jika tersedia)
  const dailyBirths = propsDailyBirths !== undefined ? propsDailyBirths : calculateDailyBirths(
    populasi,
    kepuasanUmum,
    0, // livingCostIndex tidak lagi digunakan
    0,
    0,
    programInsentifAnak,
    0,
    tingkatPendidikan,
    detailWithDefaults
  );

  const lifeExpectancy = calculateLifeExpectancy(detailWithDefaults, kepuasanUmum);
  const securityLevel = calculateSecurityLevel(detailWithDefaults, kepuasanUmum);
  const dailyDeaths = propsDailyDeaths !== undefined ? propsDailyDeaths : calculateDailyDeaths(populasi, lifeExpectancy, securityLevel, detailWithDefaults);

  // ðŸ”¥ Pertumbuhan Bersih
  const netDailyChange = propsNetDailyChange !== undefined ? propsNetDailyChange : (dailyBirths - dailyDeaths);

  // ðŸ”¥ Variabel perhitungan multiplier UI
  const welfareFactor = 0.75; // Tanpa livingCostIndex
  const policyFactor = programInsentifAnak ? 1.2 : 1.0;
  const satisfactionFactor = 0.5 + (kepuasanUmum / 200);

  const formatNumber = (num: number) => num.toLocaleString('id-ID');
  const countryDisplayName = selectedCountry?.country || "Indonesia";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none">
      <div className="bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans pointer-events-auto">

        {/* Header */}
        <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-[#00FFAA]/20 flex items-center justify-between bg-[#0A1A1A] relative z-10 gap-2 shrink-0 rounded-t-2xl">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1 sm:p-1.5 bg-[#0F2424] rounded-lg border border-[#00FFAA]/30 shrink-0">
              <Users className="h-4 w-4 sm:h-5 sm:w-5 text-[#00FFAA]" />
            </div>
            <div>
              <h2 className="text-base sm:text-xl font-bold text-[#00FFAA] tracking-tight leading-none uppercase">Rincian Pertumbuhan Penduduk</h2>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 lg:p-2 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] text-[#6B8A8A] hover:text-[#00FFAA] hover:border-[#00FFAA] transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1 shadow-sm">
            <span className="text-[10px] lg:text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-[#0A1A1A]/80 relative z-10 custom-scrollbar">
          <div className="space-y-6">

            {/* Ringkasan Utama - Pertumbuhan Bersih */}
            <div className="bg-[#0A1A1A] border border-[#00FFAA]/20 p-6 rounded-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-black text-[#6B8A8A] uppercase tracking-wider">Pertumbuhan Penduduk Harian</p>
                  <p className={`text-4xl font-black mt-1 ${netDailyChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {netDailyChange >= 0 ? '+' : ''}{formatNumber(netDailyChange)} <span className="text-lg text-[#6B8A8A] font-bold">/hr</span>
                  </p>
                </div>
                <div className="p-4 bg-[#00FFAA]/10 rounded-full border border-[#00FFAA]/30">
                  <Activity className="h-10 w-10 text-[#00FFAA]" />
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="bg-[#0F2424] p-3 rounded-xl border border-emerald-500/30">
                  <p className="text-[10px] text-emerald-400 font-black uppercase">Kelahiran</p>
                  <p className="text-xl font-black text-emerald-400">+{formatNumber(dailyBirths)}</p>
                </div>
                <div className="bg-[#0F2424] p-3 rounded-xl border border-rose-500/30">
                  <p className="text-[10px] text-rose-400 font-black uppercase">Kematian</p>
                  <p className="text-xl font-black text-rose-400">-{formatNumber(dailyDeaths)}</p>
                </div>
              </div>
              <p className="mt-4 text-xs text-[#6B8A8A] font-medium">
                {netDailyChange >= 0
                  ? `Populasi bertambah ${formatNumber(netDailyChange)} jiwa setiap hari.`
                  : `Populasi berkurang ${formatNumber(Math.abs(netDailyChange))} jiwa setiap hari.`
                }
              </p>
            </div>

            {/* Breakdown Faktor Kelahiran */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* 1. Populasi Dasar */}
              <div className="bg-[#0A1A1A] border border-[#00FFAA]/20 p-4 rounded-xl space-y-2 relative">
                <button
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-[#0F2424] border border-[#00FFAA]/30 text-[#6B8A8A] hover:text-[#00FFAA] transition-colors cursor-pointer"
                  onClick={() => setOpenPopulasiDasar(true)}
                >
                  <Info className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-[#00FFAA]/10 rounded-lg">
                    <Users className="h-4 w-4 text-[#00FFAA]" />
                  </div>
                  <h4 className="text-xs font-black text-[#00FFAA] uppercase">Populasi Dasar</h4>
                </div>
                <p className="text-sm font-bold text-[#E0E0E0]">{formatNumber(populasi)} jiwa</p>
              </div>

              {/* 2. Kesejahteraan */}
              <div className="bg-[#0A1A1A] border border-[#00FFAA]/20 p-4 rounded-xl space-y-2 relative">
                <button
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-[#0F2424] border border-[#00FFAA]/30 text-[#6B8A8A] hover:text-[#00FFAA] transition-colors cursor-pointer"
                  onClick={() => setOpenKesejahteraan(true)}
                >
                  <Info className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-[#00FFAA]/10 rounded-lg">
                    <Banknote className="h-4 w-4 text-[#00FFAA]" />
                  </div>
                  <h4 className="text-xs font-black text-[#00FFAA] uppercase">Kesejahteraan</h4>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-[#E0E0E0]">
                    {countryDetail?.kesejahteraan !== undefined ? Math.round(Number(countryDetail.kesejahteraan)) : 50} INDX
                  </span>
                  <span className="text-[10px] text-[#6B8A8A]">× {welfareFactor.toFixed(3)}</span>
                </div>
              </div>

              {/* 3. Fasilitas Kesehatan */}
              <div 
                className="bg-[#0A1A1A] border border-[#00FFAA]/20 p-4 rounded-xl space-y-2 relative cursor-pointer hover:border-[#00FFAA]/60 hover:bg-[#00FFAA]/5 transition-all duration-200"
                onClick={() => onOpenTempatUmum?.('kesehatan')}
              >
                <button
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-[#0F2424] border border-[#00FFAA]/30 text-[#6B8A8A] hover:text-[#00FFAA] transition-colors cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenFasilitasKesehatan(true);
                  }}
                >
                  <Info className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-[#00FFAA]/10 rounded-lg">
                    <HeartPulse className="h-4 w-4 text-[#00FFAA]" />
                  </div>
                  <h4 className="text-xs font-black text-[#00FFAA] uppercase">Fasilitas Kesehatan</h4>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-[#E0E0E0]">{jumlahRumahSakit} RS (rasio {hospitalRatio.toFixed(2)})</span>
                  <span className="text-[10px] text-[#6B8A8A]">× {healthFactor.toFixed(3)}</span>
                </div>
                <p className="text-[10px] text-[#6B8A8A]">Fasilitas medis pendukung persalinan aman.</p>
              </div>

              {/* 4. Kebijakan Insentif Anak */}
              <div className="bg-[#0A1A1A] border border-[#00FFAA]/20 p-4 rounded-xl space-y-2 relative">
                <button
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-[#0F2424] border border-[#00FFAA]/30 text-[#6B8A8A] hover:text-[#00FFAA] transition-colors cursor-pointer"
                  onClick={() => setOpenKebijakanInsentifAnak(true)}
                >
                  <Info className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-[#00FFAA]/10 rounded-lg">
                    <Home className="h-4 w-4 text-[#00FFAA]" />
                  </div>
                  <h4 className="text-xs font-black text-[#00FFAA] uppercase">Kebijakan Insentif Anak</h4>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-[#E0E0E0]">{programInsentifAnak ? 'Aktif' : 'Tidak Aktif'}</span>
                  <span className="text-[10px] text-[#6B8A8A]">× {policyFactor.toFixed(2)}</span>
                </div>
              </div>

              {/* 5. Tingkat Pendidikan */}
              <div 
                className="bg-[#0A1A1A] border border-[#00FFAA]/20 p-4 rounded-xl space-y-2 relative cursor-pointer hover:border-[#00FFAA]/60 hover:bg-[#00FFAA]/5 transition-all duration-200"
                onClick={() => onOpenTempatUmum?.('pendidikan')}
              >
                <button
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-[#0F2424] border border-[#00FFAA]/30 text-[#6B8A8A] hover:text-[#00FFAA] transition-colors cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenTingkatPendidikan(true);
                  }}
                >
                  <Info className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-[#00FFAA]/10 rounded-lg">
                    <GraduationCap className="h-4 w-4 text-[#00FFAA]" />
                  </div>
                  <h4 className="text-xs font-black text-[#00FFAA] uppercase">Tingkat Pendidikan</h4>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-[#E0E0E0]">{(tingkatPendidikan * 100).toFixed(0)}% (rasio {educationRatio.toFixed(2)})</span>
                  <span className="text-[10px] text-[#6B8A8A]">× {educationFactor.toFixed(3)}</span>
                </div>
                <p className="text-[10px] text-[#6B8A8A]">Tingkat edukasi memengaruhi perencanaan keluarga.</p>
              </div>

            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#0A1A1A] border-t border-[#00FFAA]/20 flex justify-end relative z-10 shrink-0">
          <button onClick={onClose} className="px-8 py-2.5 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] text-[#00FFAA] hover:bg-[#00FFAA] hover:text-[#0A1A1A] transition-all font-black text-xs uppercase tracking-wider cursor-pointer">
            Tutup
          </button>
        </div>
      </div>

      {/* ðŸ”¥ Render modal detail */}
      <DetailPopulasiDasarModal
        isOpen={openPopulasiDasar}
        onClose={() => setOpenPopulasiDasar(false)}
        countryDetail={countryDetail}
        selectedCountry={selectedCountry}
      />
      <DetailKesejahteraanModal
        isOpen={openKesejahteraan}
        onClose={() => setOpenKesejahteraan(false)}
        countryDetail={countryDetail}
        selectedCountry={selectedCountry}
      />
      <DetailFasilitasKesehatanModal
        isOpen={openFasilitasKesehatan}
        onClose={() => setOpenFasilitasKesehatan(false)}
        countryDetail={countryDetail}
        selectedCountry={selectedCountry}
      />
      <DetailKebijakanInsentifAnakModal
        isOpen={openKebijakanInsentifAnak}
        onClose={() => setOpenKebijakanInsentifAnak(false)}
        countryDetail={countryDetail}
        selectedCountry={selectedCountry}
      />
      <DetailTingkatPendidikanModal
        isOpen={openTingkatPendidikan}
        onClose={() => setOpenTingkatPendidikan(false)}
        countryDetail={countryDetail}
        selectedCountry={selectedCountry}
      />

    </div>
  );
}
