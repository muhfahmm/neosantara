'use client';

import { useState, useEffect, useRef } from "react";
import { X, Globe, Landmark, Shield, Users, Banknote, Scale, Home, Handshake } from 'lucide-react';
import { COUNTRIES_DATA } from '../map_system/map-data';
import countryPaths from '../map_system/country-paths.json';
import { calculateCountryNetBalance } from '@/app/logic/economic_logic/treasuryUpdater';
import { calculateCountryNetPopulation } from '@/app/logic/populations_logic/population_logic';
import { getRelationValue } from '@/../../json/database_hubungan_antar_negara/relationsRegistry';

// Import 3 komponen terpisah
import InformasiUmum from "./1_informasi_umum/informasi_umum";
import Geopolitik from "./2_geopolitik/geopolitik";
import OperasiMiliter from "./3_operasi_militer/operasi_militer";

interface CountryDetailModalProps {
  isOpen: boolean;
  countryName: string | null;
  onClose: () => void;
  countryDetail?: any; // Data detail negara dari API (negara yang sedang dimainkan)
  setCountryDetail?: (detail: any | ((prev: any) => any)) => void;
  currentDate?: Date; // Tanggal terkini dari TimeController
  playerNetBalanceAdjustment?: number;
  adjustPlayerNetBalance?: (delta: number) => void;
}

export function CountryDetailModal({ isOpen, countryName, onClose, countryDetail, setCountryDetail, currentDate, playerNetBalanceAdjustment = 0, adjustPlayerNetBalance }: CountryDetailModalProps) {
  // State untuk menu tab
  const [activeTab, setActiveTab] = useState<"informasi" | "geopolitik" | "militer">("informasi");

  // State untuk data negara yang diklik
  const [fetchedDetail, setFetchedDetail] = useState<any>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // State statistik Netto APBN & Netto Populasi harian negara yang ditampilkan
  const [dailyNetBalance, setDailyNetBalance] = useState<number>(0);
  const [dailyNetPopulation, setDailyNetPopulation] = useState<number>(0);

  // Ref untuk melacak pergantian hari khusus di modal
  const prevModalUpdateDateRef = useRef<string | null>(null);
  
  // PERBAIKAN: Ref untuk mencegah fetch ulang data saat modal dibuka/tutup (Data tetap progresif)
  const fetchedRef = useRef<string | null>(null);

  // PERBAIKAN: Fetch data hanya SEKALI saat pertama kali negara dibuka
  useEffect(() => {
    if (!isOpen || !countryName) return;

    // Jika sudah pernah fetch negara ini sebelumnya, jangan fetch lagi (mencegah reset data)
    if (fetchedRef.current === countryName) return;

    const alreadyLoadedCountryDetail = countryDetail?.country?.toLowerCase().trim() === countryName.toLowerCase().trim();
    if (alreadyLoadedCountryDetail) {
      fetchedRef.current = countryName;
      setFetchedDetail(countryDetail);
      setIsLoadingDetail(false);
      setActiveTab("informasi");
      prevModalUpdateDateRef.current = null;
      setDailyNetBalance(calculateCountryNetBalance(countryDetail));
      setDailyNetPopulation(calculateCountryNetPopulation(countryDetail));
      return;
    }

    // Tandai negara ini sudah di-fetch
    fetchedRef.current = countryName;

    setFetchedDetail(null);
    setIsLoadingDetail(true);
    setActiveTab("informasi");
    prevModalUpdateDateRef.current = null;

    const loadDetail = async () => {
      // Cari path file berdasarkan countryName (case-insensitive)
      const relPath = Object.entries(countryPaths as Record<string, string>).find(
        ([name]) => name.toLowerCase() === countryName.toLowerCase()
      )?.[1];

      if (!relPath) {
        console.warn(`[detail_negara] Tidak ditemukan path untuk: ${countryName}`);
        setIsLoadingDetail(false);
        return;
      }

      try {
        const res = await fetch(`/api/country-data?path=${relPath}`);
        const data = await res.json();

        if (data?.error) {
          console.warn(`[detail_negara] Error dari API untuk ${countryName}:`, data.error);
          setIsLoadingDetail(false);
          return;
        }

        setFetchedDetail(data);

        // Hitung Netto APBN & Netto Populasi Harian awal saat data pertama dimuat
        const initialNet = calculateCountryNetBalance(data);
        const initialPopNet = calculateCountryNetPopulation(data);
        setDailyNetBalance(initialNet);
        setDailyNetPopulation(initialPopNet);
      } catch (e) {
        console.error(`[detail_negara] Gagal fetch data untuk ${countryName}:`, e);
      } finally {
        setIsLoadingDetail(false);
      }
    };

    loadDetail();
  }, [isOpen, countryName, countryDetail]);

  // PERBAIKAN: Logika Simulasi Update Kas & Populasi Harian (Tetap berjalan saat modal terbuka)
  useEffect(() => {
    if (!isOpen || !fetchedDetail || !currentDate) return;

    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    const currentDateStr = `${year}-${month}-${day}`;

    if (prevModalUpdateDateRef.current === null) {
      prevModalUpdateDateRef.current = currentDateStr;
      return;
    }

    if (prevModalUpdateDateRef.current === currentDateStr) return;

    prevModalUpdateDateRef.current = currentDateStr;

    // 1. Hitung Netto Anggaran Harian
    const netBalance = calculateCountryNetBalance(fetchedDetail);
    setDailyNetBalance(netBalance);

    // 2. Hitung Perubahan Populasi Harian (Kelahiran - Kematian)
    const netPopulationChange = calculateCountryNetPopulation(fetchedDetail);
    setDailyNetPopulation(netPopulationChange);

    // 3. Update Anggaran dan Jumlah Penduduk secara real-time
    setFetchedDetail((prev: any) => {
      if (!prev) return prev;
      const currentPop = Number(prev.jumlah_penduduk) || 0;
      return {
        ...prev,
        anggaran: (Number(prev.anggaran) || 0) + netBalance,
        jumlah_penduduk: Math.max(0, currentPop + netPopulationChange),
      };
    });
  }, [currentDate, fetchedDetail, isOpen]);


  // Hitung Netto APBN target negara yang ditampilkan di header dan summary
  const targetBaseNetBalance = fetchedDetail ? dailyNetBalance : 0;
  const targetEffectiveNetBalance = targetBaseNetBalance;

  // Hitung Netto APBN negara pemain yang digunakan untuk biaya kedutaan
  const playerBaseNetBalance = countryDetail ? calculateCountryNetBalance(countryDetail) : 0;
  const playerEffectiveNetBalance = playerBaseNetBalance + playerNetBalanceAdjustment;

  if (!isOpen || !countryName) return null;

  // Ambil data dasar (iso, capital) dari COUNTRIES_DATA (sumber peta)
  const mapData = COUNTRIES_DATA?.find(
    (c) => c.country?.toLowerCase().trim() === countryName.toLowerCase().trim()
  );

  // Gunakan fetchedDetail sebagai sumber utama, countryDetail sebagai fallback
  const detailData = fetchedDetail || countryDetail;

  // Fallback ganda untuk iso dan capital
  const iso = mapData?.iso || detailData?.iso || "";
  const capital = mapData?.capital || detailData?.capital || "Data tidak tersedia";
  
  // Hitung Hubungan
  const playerCountryName = countryDetail?.country || countryDetail?.nama_negara || countryDetail?.name_id || countryDetail?.name || "Indonesia";
  const relationValue = getRelationValue(playerCountryName, countryName);

  // Fungsi Helper untuk bendera di Header
  const renderFlagHeader = (iso: string | undefined, altName: string) => {
    if (!iso || iso.length !== 2) return null;
    return (
      <div className="w-8 h-5 rounded-sm overflow-hidden border border-[#00FFAA]/30 flex-shrink-0 shadow-sm bg-[#0A1A1A] relative flex items-center justify-center">
        <img
          src={`https://flagcdn.com/w80/${iso.toLowerCase()}.png`}
          alt={altName}
          className="w-full h-full object-cover absolute inset-0"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none">
      <div className="bg-[#0F2424] border-2 sm:border-3 border-[#00FFAA]/30 rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans pointer-events-auto shadow-2xl">
        
        {/* Background Glow Texture */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,255,170,0.05)_0%,transparent_100%)] pointer-events-none" />

        {/* HEADER Modal */}
        <div className="px-6 sm:px-8 py-4 sm:py-5 border-b border-[#00FFAA]/20 flex items-center justify-between bg-[#0A1A1A] relative z-10 shrink-0">
          <div className="flex items-center gap-3 sm:gap-4">
            
            {/* 1. Icon Globe */}
            <div className="p-2 sm:p-2.5 bg-[#00FFAA]/10 rounded-xl border border-[#00FFAA]/30 shrink-0 flex items-center justify-center">
              <Globe className="h-6 w-6 text-[#00FFAA]" />
            </div>
            
            {/* 2. Judul & Subjudul */}
            <div>
              {/* Judul Utama */}
              <h2 className="text-xl sm:text-2xl font-bold text-[#00FFAA] tracking-tight leading-none uppercase">
                DETAIL NEGARA
              </h2>
              
              <div className="flex items-center gap-2 mt-1">
                {renderFlagHeader(iso, countryName)}
                <p className="text-xs text-[#00FFAA]/70 font-semibold uppercase tracking-wider">
                  {countryName}, {capital}
                </p>
              </div>
            </div>

          </div>

          <button
            onClick={onClose}
            className="p-2 sm:p-2.5 rounded-xl border border-[#00FFAA]/30 bg-[#0A1A1A] text-[#00FFAA]/70 hover:text-[#00FFAA] hover:bg-[#00FFAA]/10 active:bg-[#00FFAA]/20 transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1.5 shadow-sm"
            aria-label="Tutup detail negara"
          >
            <span className="text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* DATA RINGKASAN */}
        <div className="px-6 sm:px-8 py-3 bg-[#0A1A1A]/80 border-b border-[#00FFAA]/20 flex items-center gap-6 sm:gap-8 relative z-10 overflow-x-auto shrink-0 no-scrollbar">
          <div className="flex items-center gap-6 min-w-max">
            {/* Hubungan */}
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-[#00FFAA]/10 rounded-lg border border-[#00FFAA]/20 text-[#00FFAA]">
                <Handshake className="h-4 w-4 text-[#00FFAA]" />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-[#00FFAA]/60 uppercase tracking-wider">Hubungan</span>
                <span className={`text-[11px] font-extrabold uppercase ${relationValue >= 75 ? 'text-emerald-400' : relationValue >= 50 ? 'text-[#00FFAA]' : 'text-rose-400'}`}>
                  {relationValue}
                </span>
              </div>
            </div>

            {/* Ibukota */}
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-[#00FFAA]/10 rounded-lg border border-[#00FFAA]/20 text-[#00FFAA]">
                <Landmark className="h-4 w-4 text-[#00FFAA]" />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-[#00FFAA]/60 uppercase tracking-wider">Ibukota</span>
                <span className="text-[11px] font-bold text-[#00FFAA] uppercase">
                  {capital}
                </span>
              </div>
            </div>

            {/* Populasi */}
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-[#00FFAA]/10 rounded-lg border border-[#00FFAA]/20 text-[#00FFAA]">
                <Users className="h-4 w-4 text-[#00FFAA]" />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-[#00FFAA]/60 uppercase tracking-wider">Populasi</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-[#00FFAA] uppercase">
                    {detailData?.jumlah_penduduk
                      ? detailData.jumlah_penduduk.toLocaleString('id-ID')
                      : isLoadingDetail
                        ? <span className="inline-block w-20 h-3 bg-[#00FFAA]/20 animate-pulse rounded" />
                        : '-'
                    }
                  </span>
                  {!isLoadingDetail && detailData && (
                    <span className={`text-[10px] font-black ${dailyNetPopulation >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      ({dailyNetPopulation >= 0 ? `+${dailyNetPopulation.toLocaleString('id-ID')}` : dailyNetPopulation.toLocaleString('id-ID')})
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Anggaran Negara */}
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-[#00FFAA]/10 rounded-lg border border-[#00FFAA]/20 text-[#00FFAA]">
                <Banknote className="h-4 w-4 text-[#00FFAA]" />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-[#00FFAA]/60 uppercase tracking-wider">Anggaran</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-[#00FFAA] uppercase">
                    {isLoadingDetail
                      ? <span className="inline-block w-16 h-3 bg-[#00FFAA]/20 animate-pulse rounded" />
                      : detailData?.anggaran !== undefined ? `${detailData.anggaran.toLocaleString('id-ID')} EM` : '-'
                    }
                  </span>
                  {!isLoadingDetail && detailData && (
                    <span className={`text-[10px] font-black ${targetEffectiveNetBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      ({targetEffectiveNetBalance >= 0 ? `+${targetEffectiveNetBalance.toLocaleString('id-ID')}` : targetEffectiveNetBalance.toLocaleString('id-ID')})
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Ideologi */}
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-[#00FFAA]/10 rounded-lg border border-[#00FFAA]/20 text-[#00FFAA]">
                <Scale className="h-4 w-4 text-[#00FFAA]" />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-[#00FFAA]/60 uppercase tracking-wider">Ideologi</span>
                <span className="text-[11px] font-bold text-[#00FFAA] uppercase">
                  {detailData?.ideology
                    ? detailData.ideology
                    : isLoadingDetail
                      ? <span className="inline-block w-20 h-3 bg-[#00FFAA]/20 animate-pulse rounded" />
                      : '-'
                  }
                </span>
              </div>
            </div>

            {/* Agama */}
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-[#00FFAA]/10 rounded-lg border border-[#00FFAA]/20 text-[#00FFAA]">
                <Home className="h-4 w-4 text-[#00FFAA]" />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-[#00FFAA]/60 uppercase tracking-wider">Agama</span>
                <span className="text-[11px] font-bold text-[#00FFAA] uppercase">
                  {detailData?.religion
                    ? detailData.religion
                    : isLoadingDetail
                      ? <span className="inline-block w-16 h-3 bg-[#00FFAA]/20 animate-pulse rounded" />
                      : '-'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* BODY CONTENT */}
        <div className="flex-1 min-h-0 overflow-y-auto p-6 sm:p-8 bg-[#0F2424] relative z-10 no-scrollbar">
          <div className="max-w-4xl mx-auto">
            
            {/* Menu 3 Tab Navigasi */}
            <div className="bg-[#0A1A1A] p-1 rounded-xl border border-[#00FFAA]/20 inline-flex mb-6 shadow-sm flex-wrap gap-1 backdrop-blur-md">
              <button
                onClick={() => setActiveTab("informasi")}
                className={`px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === "informasi" ? "bg-[#00FFAA] text-[#0A1A1A] shadow-md shadow-[#00FFAA]/20" : "text-[#00FFAA]/60 hover:text-[#00FFAA]"
                }`}
              >
                <Globe className="h-4 w-4" /> Informasi Umum
              </button>
              <button
                onClick={() => setActiveTab("geopolitik")}
                className={`px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === "geopolitik" ? "bg-[#00FFAA] text-[#0A1A1A] shadow-md shadow-[#00FFAA]/20" : "text-[#00FFAA]/60 hover:text-[#00FFAA]"
                }`}
              >
                <Landmark className="h-4 w-4" /> Geopolitik
              </button>
              <button
                onClick={() => setActiveTab("militer")}
                className={`px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === "militer" ? "bg-[#00FFAA] text-[#0A1A1A] shadow-md shadow-[#00FFAA]/20" : "text-[#00FFAA]/60 hover:text-[#00FFAA]"
                }`}
              >
                <Shield className="h-4 w-4" /> Operasi Militer
              </button>
            </div>

            {/* Render 3 Komponen Berdasarkan Active Tab */}
            {activeTab === "informasi" && (
              <InformasiUmum
                countryName={countryName}
                playerCountryDetail={countryDetail}
                setPlayerCountryDetail={setCountryDetail}
                currentNetBalance={playerEffectiveNetBalance}
                adjustNetBalance={adjustPlayerNetBalance}
              />
            )}

            {activeTab === "geopolitik" && (
              <Geopolitik countryName={countryName} playerCountryDetail={countryDetail} />
            )}

            {activeTab === "militer" && (
              <OperasiMiliter countryName={countryName} playerCountryDetail={countryDetail} />
            )}

          </div>
        </div>

      </div>
    </div>
  );
}