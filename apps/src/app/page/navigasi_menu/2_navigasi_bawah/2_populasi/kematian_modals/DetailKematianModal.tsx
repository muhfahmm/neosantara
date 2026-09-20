"use client";

import React, { useState } from "react";
import { X, Users, Heart, Shield, Home, HeartPulse, Utensils, AlertTriangle, Factory, ArrowUpRight, Skull, Info } from "lucide-react";

import {
  calculateGeneralSatisfaction,
  calculateLifeExpectancy,
  calculateSecurityLevel,
  calculateDailyDeaths,
} from "@/app/logic/populations_logic/population_logic";

// ðŸ”¥ Import 7 modal detail (pastikan path sesuai struktur Anda)
import DetailHarapanHidupModal from './grid_modals/DetailHarapanHidupModal';
import DetailKeamananModal from './grid_modals/DetailKeamananModal';
import DetailTunawismaModal from './grid_modals/DetailTunawismaModal';
import DetailKesehatanModal from './grid_modals/DetailKesehatanModal';
import DetailKetahananPanganModal from './grid_modals/DetailKetahananPanganModal';
import DetailKriminalitasModal from './grid_modals/DetailKriminalitasModal';
import DetailPolusiModal from './grid_modals/DetailPolusiModal';

// Import dari logic yang baru dibuat
import { calculateKeamananLogic } from "./logic/keamananLogic";
import { calculateKesehatanLogic } from "./logic/kesehatanLogic";
import { calculateTunawismaLogic } from "./logic/tunawismaLogic";
import { calculateKriminalitasLogic } from "./logic/kriminalitasLogic";

interface DetailKematianModalProps {
  isOpen: boolean;
  onClose: () => void;
  countryDetail?: any;
  selectedCountry?: any;
  homelessCount?: number; // Data tunawisma dari induk
  onOpenTempatUmum?: (tabId: string) => void;
  onOpenIndustriPangan?: () => void;
  onOpenArmada?: (tabId: 'aktif' | 'infrastruktur' | 'polisi') => void;
}

export default function DetailKematianModal({
  isOpen,
  onClose,
  countryDetail,
  selectedCountry,
  homelessCount: propsHomelessCount,
  onOpenTempatUmum,
  onOpenIndustriPangan,
  onOpenArmada,
}: DetailKematianModalProps) {
  // ðŸ”¥ State untuk 7 modal detail (agar tombol Info bisa membuka modal)
  const [isHarapanHidupOpen, setIsHarapanHidupOpen] = useState(false);
  const [isKeamananOpen, setIsKeamananOpen] = useState(false);
  const [isTunawismaOpen, setIsTunawismaOpen] = useState(false);
  const [isKesehatanOpen, setIsKesehatanOpen] = useState(false);
  const [isKetahananPanganOpen, setIsKetahananPanganOpen] = useState(false);
  const [isKriminalitasOpen, setIsKriminalitasOpen] = useState(false);
  const [isPolusiOpen, setIsPolusiOpen] = useState(false);

  if (!isOpen) return null;

  const populasi = countryDetail?.jumlah_penduduk || 10_000_000;

  const countryName = selectedCountry?.country?.toLowerCase?.() || "";

  const detailWithDefaults = { ...countryDetail };
  const kepuasanUmum = calculateGeneralSatisfaction(detailWithDefaults);
  const lifeExpectancy = calculateLifeExpectancy(detailWithDefaults, kepuasanUmum);
  const securityLevel = calculateSecurityLevel(detailWithDefaults, kepuasanUmum);

  // --- Data visual UI & Logic Baru ---
  const harapanHidup = countryDetail?.harapan_hidup ?? 70;
  const indeksKetahananPangan = countryDetail?.indeks_ketahanan_pangan ?? 60;
  const polusiIndex = countryDetail?.polusi_index ?? 40;

  // Hitung dengan logic baru
  const keamananRes = calculateKeamananLogic(countryDetail, populasi);
  const kesehatanRes = calculateKesehatanLogic(countryDetail, populasi);
  const tunawismaRes = calculateTunawismaLogic(countryDetail, populasi, propsHomelessCount);
  const kriminalitasRes = calculateKriminalitasLogic(countryDetail, populasi);

  const tingkatKeamanan = keamananRes.tingkatKeamanan;
  const homelessCount = tunawismaRes.homelessCount;
  const jumlahRumahSakit = kesehatanRes.jumlahRumahSakit;
  const tingkatKriminalitas = kriminalitasRes.tingkatKriminalitas;

  const lifeExpectancyFactor = Math.max(0.8, 1.2 - (0.005 * (harapanHidup - 50)));
  const securityFactor = keamananRes.securityFactor;
  const homelessRatio = homelessCount / populasi;
  const homelessFactor = tunawismaRes.homelessFactor;
  const hospitalRatio = kesehatanRes.kesehatanRatio;
  const healthFactor = kesehatanRes.healthFactor;
  const foodSecurityFactor = 0.7 + (0.003 * indeksKetahananPangan);
  const crimeFactor = kriminalitasRes.crimeFactor;
  const pollutionFactor = 1 + (polusiIndex / 200);

  const dailyDeaths = calculateDailyDeaths(populasi, lifeExpectancy, securityLevel, detailWithDefaults);

  const formatNumber = (num: number) => num.toLocaleString('id-ID');
  const countryDisplayName = selectedCountry?.country || "Indonesia";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none">
      <div className="bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans pointer-events-auto">

        {/* Header */}
        <div className="px-6 sm:px-8 py-4 border-b border-[#00FFAA]/20 flex items-center justify-between bg-[#0A1A1A] relative z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-500/10 rounded-xl border border-rose-500/30">
              <Users className="h-6 w-6 text-rose-400" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#00FFAA] tracking-tight leading-none uppercase">Rincian Angka Kematian</h2>
              <p className="text-xs text-[#6B8A8A] font-medium mt-1">Faktor-faktor yang memengaruhi kematian di {countryDisplayName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 sm:p-2.5 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] text-[#00FFAA] hover:bg-[#00FFAA] hover:text-[#0A1A1A] transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 min-h-0 overflow-y-auto p-6 sm:p-8 bg-[#0A1A1A]/80 relative z-10 custom-scrollbar">
          <div className="space-y-6">
            
            {/* Ringkasan Utama */}
            <div className="bg-[#0A1A1A] border border-[#00FFAA]/20 p-6 rounded-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-black text-[#6B8A8A] uppercase tracking-wider">Kematian Harian</p>
                  <p className="text-4xl font-black text-rose-400 mt-1">-{formatNumber(dailyDeaths)}</p>
                </div>
                <div className="p-4 bg-rose-500/10 rounded-full border border-rose-500/30">
                  <Skull className="h-10 w-10 text-rose-400" />
                </div>
              </div>
              <p className="mt-4 text-xs text-[#6B8A8A] font-medium">
                Berdasarkan total populasi {formatNumber(populasi)} jiwa dan kondisi sosial-ekonomi terkini.
              </p>
            </div>

            {/* Breakdown Faktor */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 1. Harapan Hidup */}
              <div className="bg-[#0A1A1A] border border-[#00FFAA]/20 p-4 rounded-xl space-y-2 relative">
                <button
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-[#0F2424] border border-[#00FFAA]/30 text-[#6B8A8A] hover:text-[#00FFAA] transition-colors cursor-pointer"
                  onClick={() => setIsHarapanHidupOpen(true)}
                >
                  <Info className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-[#00FFAA]/10 rounded-lg">
                    <Heart className="h-4 w-4 text-[#00FFAA]" />
                  </div>
                  <h4 className="text-xs font-black text-[#00FFAA] uppercase">Harapan Hidup</h4>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-[#E0E0E0]">{harapanHidup} tahun</span>
                  <span className="text-[10px] text-[#6B8A8A]">× {lifeExpectancyFactor.toFixed(3)}</span>
                </div>
                <p className="text-[10px] text-[#6B8A8A]">Semakin tinggi harapan hidup, semakin rendah angka kematian.</p>
              </div>

              {/* 2. Keamanan */}
              <div className="bg-[#0A1A1A] border border-[#00FFAA]/20 p-4 rounded-xl space-y-2 relative">
                <button
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-[#0F2424] border border-[#00FFAA]/30 text-[#6B8A8A] hover:text-[#00FFAA] transition-colors cursor-pointer"
                  onClick={() => setIsKeamananOpen(true)}
                >
                  <Info className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-[#00FFAA]/10 rounded-lg">
                    <Shield className="h-4 w-4 text-[#00FFAA]" />
                  </div>
                  <h4 className="text-xs font-black text-[#00FFAA] uppercase">Tingkat Keamanan</h4>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-[#E0E0E0]">{tingkatKeamanan}%</span>
                  <span className="text-[10px] text-[#6B8A8A]">× {securityFactor.toFixed(3)}</span>
                </div>
                <p className="text-[10px] text-[#6B8A8A]">Lingkungan aman mengurangi kematian akibat kriminalitas dan kecelakaan.</p>
              </div>

              {/* 3. Tunawisma */}
              <div className="bg-[#0A1A1A] border border-[#00FFAA]/20 p-4 rounded-xl space-y-2 relative">
                <button
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-[#0F2424] border border-[#00FFAA]/30 text-[#6B8A8A] hover:text-[#00FFAA] transition-colors cursor-pointer"
                  onClick={() => setIsTunawismaOpen(true)}
                >
                  <Info className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-[#00FFAA]/10 rounded-lg">
                    <Home className="h-4 w-4 text-[#00FFAA]" />
                  </div>
                  <h4 className="text-xs font-black text-[#00FFAA] uppercase">Tunawisma</h4>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-[#E0E0E0]">{formatNumber(homelessCount)} jiwa ({ (homelessRatio * 100).toFixed(2)}%)</span>
                  <span className="text-[10px] text-[#6B8A8A]">× {homelessFactor.toFixed(3)}</span>
                </div>
                <p className="text-[10px] text-[#6B8A8A]">Setiap 1% populasi tunawisma meningkatkan kematian sebesar 5%.</p>
              </div>

              {/* 4. Kesehatan */}
              <div 
                className="bg-[#0A1A1A] border border-[#00FFAA]/20 p-4 rounded-xl space-y-2 relative cursor-pointer hover:border-[#00FFAA]/60 hover:bg-[#00FFAA]/5 transition-all duration-200"
                onClick={() => onOpenTempatUmum?.('kesehatan')}
              >
                <button
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-[#0F2424] border border-[#00FFAA]/30 text-[#6B8A8A] hover:text-[#00FFAA] transition-colors cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsKesehatanOpen(true);
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
                <p className="text-[10px] text-[#6B8A8A]">Ketersediaan RS yang cukup menurunkan kematian akibat penyakit yang dapat diobati.</p>
              </div>

              {/* 5. Ketahanan Pangan */}
              <div 
                className="bg-[#0A1A1A] border border-[#00FFAA]/20 p-4 rounded-xl space-y-2 relative cursor-pointer hover:border-[#00FFAA]/60 hover:bg-[#00FFAA]/5 transition-all duration-200"
                onClick={() => onOpenIndustriPangan?.()}
              >
                <button
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-[#0F2424] border border-[#00FFAA]/30 text-[#6B8A8A] hover:text-[#00FFAA] transition-colors cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsKetahananPanganOpen(true);
                  }}
                >
                  <Info className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-[#00FFAA]/10 rounded-lg">
                    <Utensils className="h-4 w-4 text-[#00FFAA]" />
                  </div>
                  <h4 className="text-xs font-black text-[#00FFAA] uppercase">Ketahanan Pangan</h4>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-[#E0E0E0]">{indeksKetahananPangan}%</span>
                  <span className="text-[10px] text-[#6B8A8A]">× {foodSecurityFactor.toFixed(3)}</span>
                </div>
                <p className="text-[10px] text-[#6B8A8A]">Ketersediaan pangan yang cukup mengurangi kematian akibat malnutrisi.</p>
              </div>

              {/* 6. Kriminalitas */}
              <div 
                className="bg-[#0A1A1A] border border-[#00FFAA]/20 p-4 rounded-xl space-y-2 relative cursor-pointer hover:border-[#00FFAA]/60 hover:bg-[#00FFAA]/5 transition-all duration-200"
                onClick={() => onOpenArmada?.('polisi')}
              >
                <button
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-[#0F2424] border border-[#00FFAA]/30 text-[#6B8A8A] hover:text-[#00FFAA] transition-colors cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsKriminalitasOpen(true);
                  }}
                >
                  <Info className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-[#00FFAA]/10 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-[#00FFAA]" />
                  </div>
                  <h4 className="text-xs font-black text-[#00FFAA] uppercase">Tingkat Kriminalitas</h4>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-[#E0E0E0]">{tingkatKriminalitas}%</span>
                  <span className="text-[10px] text-[#6B8A8A]">× {crimeFactor.toFixed(3)}</span>
                </div>
                <p className="text-[10px] text-[#6B8A8A]">Setiap 1% kriminalitas meningkatkan kematian sebesar 2%.</p>
              </div>

              {/* 7. Polusi */}
              <div className="bg-[#0A1A1A] border border-[#00FFAA]/20 p-4 rounded-xl space-y-2 relative">
                <button
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-[#0F2424] border border-[#00FFAA]/30 text-[#6B8A8A] hover:text-[#00FFAA] transition-colors cursor-pointer"
                  onClick={() => setIsPolusiOpen(true)}
                >
                  <Info className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-[#00FFAA]/10 rounded-lg">
                    <Factory className="h-4 w-4 text-[#00FFAA]" />
                  </div>
                  <h4 className="text-xs font-black text-[#00FFAA] uppercase">Tingkat Polusi</h4>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-[#E0E0E0]">{polusiIndex}</span>
                  <span className="text-[10px] text-[#6B8A8A]">× {pollutionFactor.toFixed(3)}</span>
                </div>
                <p className="text-[10px] text-[#6B8A8A]">Setiap 10 poin polusi meningkatkan kematian sebesar 5%.</p>
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

      {/* ðŸ”¥ RENDER 7 MODAL DETAIL DI SINI (Agar tombol Info berfungsi) */}
      <DetailHarapanHidupModal
        isOpen={isHarapanHidupOpen}
        onClose={() => setIsHarapanHidupOpen(false)}
        countryDetail={countryDetail}
        selectedCountry={selectedCountry}
      />
      <DetailKeamananModal
        isOpen={isKeamananOpen}
        onClose={() => setIsKeamananOpen(false)}
        countryDetail={countryDetail}
        selectedCountry={selectedCountry}
      />
      <DetailTunawismaModal
        isOpen={isTunawismaOpen}
        onClose={() => setIsTunawismaOpen(false)}
        countryDetail={countryDetail}
        selectedCountry={selectedCountry}
      />
      <DetailKesehatanModal
        isOpen={isKesehatanOpen}
        onClose={() => setIsKesehatanOpen(false)}
        countryDetail={countryDetail}
        selectedCountry={selectedCountry}
      />
      <DetailKetahananPanganModal
        isOpen={isKetahananPanganOpen}
        onClose={() => setIsKetahananPanganOpen(false)}
        countryDetail={countryDetail}
        selectedCountry={selectedCountry}
      />
      <DetailKriminalitasModal
        isOpen={isKriminalitasOpen}
        onClose={() => setIsKriminalitasOpen(false)}
        countryDetail={countryDetail}
        selectedCountry={selectedCountry}
      />
      <DetailPolusiModal
        isOpen={isPolusiOpen}
        onClose={() => setIsPolusiOpen(false)}
        countryDetail={countryDetail}
        selectedCountry={selectedCountry}
      />
    </div>
  );
}

