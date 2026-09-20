"use client"
import React, { useMemo, useState } from "react";
import { X, Shield, Swords } from "lucide-react";
import { getArmadaPowerSummary } from "../4_armada/logic/armadaLogic";
// 🔥 Import modal serang baru yang akan kita buat
import SerangModals from "./modals_menu/KonfirmasiSerangModals";
// 🔥 Import COUNTRIES_DATA untuk meng-enrich ISO
import { COUNTRIES_DATA } from "@/app/page/map_system/map-data";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  countryDetail: any;
  setCountryDetail: (detail: any) => void;
  prefetchedAllCountries?: any[];
}

type RankingRow = {
  countryName: string;
  totalPower: number;
  totalHealth: number;
  darat: number;
  laut: number;
  udara: number;
  payload: any;
  iso?: string; // 🔥 Tambahkan field ISO untuk bendera
};

const formatNumber = (value: unknown) => {
  const numeric = Number(value ?? 0);
  return Number.isFinite(numeric) ? numeric.toLocaleString("id-ID") : "0";
};

export default function SerangNegaraModal({ 
  isOpen, 
  onClose, 
  countryDetail, 
  setCountryDetail, 
  prefetchedAllCountries,
}: ModalProps) {
  // 🔥 State untuk menampung target yang dipilih dan membuka modal serang
  const [selectedTarget, setSelectedTarget] = useState<RankingRow | null>(null);
  const [isSerangModalOpen, setIsSerangModalOpen] = useState(false);
  const [internalCountries, setInternalCountries] = useState<any[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [sortConfig, setSortConfig] = useState<{ key: keyof RankingRow; direction: 'asc' | 'desc' } | null>({
    key: 'totalPower',
    direction: 'desc'
  });

  React.useEffect(() => {
    if (!isOpen) return;
    if (Array.isArray(prefetchedAllCountries) && prefetchedAllCountries.length > 0) return;

    let isMounted = true;
    setIsLoading(true);

    fetch('/api/country-data?all=true')
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setInternalCountries(data);
        }
      })
      .catch((err) => console.warn('[SerangNegaraModal] Failed to fetch all countries:', err))
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, prefetchedAllCountries]);

  const rawRankings = React.useMemo(() => {
    let source: any[] = [];
    if (Array.isArray(prefetchedAllCountries) && prefetchedAllCountries.length > 0) {
      source = prefetchedAllCountries;
    } else if (Array.isArray(internalCountries) && internalCountries.length > 0) {
      source = internalCountries;
    } else if (Array.isArray(COUNTRIES_DATA) && COUNTRIES_DATA.length > 0) {
      source = COUNTRIES_DATA;
    }

    return source
      .map((country: any) => {
        const summary = getArmadaPowerSummary(country);
        const groupTotals = summary?.totals?.groups;
        const countryName = country?.nama_negara || country?.country || country?.name_id || country?.name_en || "Negara";
        
        // 🔥 PERBAIKAN: Cari ISO dari COUNTRIES_DATA terlebih dahulu, lalu fallback ke berbagai properti
        let iso = "";
        
        // 1. Coba cari dari COUNTRIES_DATA menggunakan nama negara
        if (COUNTRIES_DATA && Array.isArray(COUNTRIES_DATA)) {
          const mapData = COUNTRIES_DATA.find((c: any) => 
            c.country && c.country.toLowerCase().trim() === countryName.toLowerCase().trim()
          );
          if (mapData?.iso) {
            iso = mapData.iso;
          }
        }
        
        // 2. Jika belum ketemu, coba dari property negara itu sendiri
        if (!iso) {
          iso = country?.iso || 
                country?.iso2 || 
                country?.country_code || 
                country?.kode_negara || 
                country?.alpha2Code || 
                country?.cca2 || 
                "";
        }

        return {
          countryName,
          totalPower: summary?.totals?.totalPower ?? 0,
          totalHealth: summary?.totals?.totalHealth ?? 0,
          darat: groupTotals?.darat?.power ?? 0,
          laut: groupTotals?.laut?.power ?? 0,
          udara: groupTotals?.udara?.power ?? 0,
          payload: country,
          iso: iso, // 🔥 Sertakan ISO dalam data ranking
        };
      });
  }, [prefetchedAllCountries, internalCountries]);

  const rankings = useMemo(() => {
    let sortableItems = [...rawRankings];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (typeof a[sortConfig.key] === 'string') {
          const aVal = a[sortConfig.key] as string;
          const bVal = b[sortConfig.key] as string;
          if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
          if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
          return 0;
        } else {
          const aVal = a[sortConfig.key] as number;
          const bVal = b[sortConfig.key] as number;
          if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
          if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
          return 0;
        }
      });
    }
    return sortableItems;
  }, [rawRankings, sortConfig]);

  const handleSort = (key: keyof RankingRow) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortArrow = (key: keyof RankingRow) => {
    if (sortConfig?.key === key) {
      return sortConfig.direction === 'asc' ? ' ▲' : ' ▼';
    }
    return '';
  };

  // 🔥 Fungsi ketika tombol pedang diklik: Buka modal serang
  const handleOpenAttackModal = (target: RankingRow) => {
    setSelectedTarget(target);
    setIsSerangModalOpen(true);
  };

  // 🔥 Fungsi ketika konfirmasi serangan di modal serang ditekan
  const handleConfirmAttack = () => {
    // Di sini Anda bisa menambahkan logika pengurangan pasukan, logika perang, dll.
    console.log(`Meluncurkan serangan ke: ${selectedTarget?.countryName}`);
    
    // Tutup kedua modal setelah konfirmasi
    setIsSerangModalOpen(false);
    onClose(); 
  };

  const selectedCountryName = useMemo(() => {
    return countryDetail?.country || countryDetail?.nama_negara || countryDetail?.name_id || countryDetail?.name_en || "Negara";
  }, [countryDetail]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none">
        <div className="bg-[#FAF6EE] border-2 sm:border-3 border-[#C4B49C] rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans pointer-events-auto shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,0,0,0.03)_0%,transparent_100%)] pointer-events-none" />

          <div className="px-8 py-6 border-b-2 border-[#C4B49C]/30 flex items-center justify-between bg-[#FAF6EE] relative z-10 shrink-0">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <Shield className="h-6 w-6 text-rose-700 animate-pulse" />
                <div>
                  <h2 className="text-2xl font-bold text-[#5c3c10] tracking-tight leading-none uppercase">Serang Negara</h2>
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#8b7e66] mt-1">{selectedCountryName}</p>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-2 sm:p-2.5 rounded-xl border-2 border-[#C4B49C] bg-transparent text-[#8b7e66] hover:text-[#5c3c10] hover:bg-black/5 active:bg-black/10 transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1.5 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* 🔥 BODY MODAL: Diberi flex-col items-center dan pembungkus max-w-5xl agar layoutnya sama persis */}
          <div className="flex-1 min-h-0 overflow-y-auto p-8 bg-[#FAF6EE]/40 relative z-10 no-scrollbar flex flex-col items-center">
            <div className="w-full max-w-5xl space-y-6">
              <div className="text-xs font-semibold text-[#8b7e66] leading-relaxed">
                Tabel ranking 207 negara berdasarkan total kekuatan gabungan darat, laut, dan udara. Klik header kolom untuk mengurutkan data. Klik ikon <Swords className="inline w-3 h-3" /> untuk menyerang target.
              </div>

              <div className="w-full overflow-hidden rounded-2xl border-2 border-[#C4B49C]/40 bg-white/80 shadow-sm">
                <div className="max-h-[50vh] overflow-auto">
                  <table className="min-w-full text-left text-[11px]">
                    <thead className="sticky top-0 z-10 bg-[#5c3c10] text-[#FAF6EE] uppercase tracking-[0.18em]">
                      <tr>
                        <th className="px-3 py-3 font-black">Rank</th>
                        <th className="px-3 py-3 font-black cursor-pointer hover:bg-[#4a2f0d] transition-colors" onClick={() => handleSort('countryName')}>
                          Negara{getSortArrow('countryName')}
                        </th>
                        <th className="px-3 py-3 font-black cursor-pointer hover:bg-[#4a2f0d] transition-colors" onClick={() => handleSort('darat')}>
                          Darat{getSortArrow('darat')}
                        </th>
                        <th className="px-3 py-3 font-black cursor-pointer hover:bg-[#4a2f0d] transition-colors" onClick={() => handleSort('laut')}>
                          Laut{getSortArrow('laut')}
                        </th>
                        <th className="px-3 py-3 font-black cursor-pointer hover:bg-[#4a2f0d] transition-colors" onClick={() => handleSort('udara')}>
                          Udara{getSortArrow('udara')}
                        </th>
                        <th className="px-3 py-3 font-black cursor-pointer hover:bg-[#4a2f0d] transition-colors" onClick={() => handleSort('totalPower')}>
                          Total Kekuatan{getSortArrow('totalPower')}
                        </th>
                        <th className="px-3 py-3 font-black text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {isLoading && rankings.length === 0 ? (
                        <tr><td colSpan={7} className="px-4 py-8 text-center text-sm font-bold text-[#8b7e66]">Memuat ranking kekuatan negara…</td></tr>
                      ) : rankings.length === 0 ? (
                        <tr><td colSpan={7} className="px-4 py-8 text-center text-sm font-bold text-[#8b7e66]">Data ranking belum tersedia.</td></tr>
                      ) : (
                        rankings.map((row, index) => (
                          <tr 
                            key={`${row.countryName}-${index}`} 
                            className={`border-b border-[#C4B49C]/25 transition-colors ${
                              row.countryName.toLowerCase().trim() === selectedCountryName.toLowerCase().trim()
                                ? 'bg-emerald-100/80 hover:bg-emerald-200/80 border-l-4 border-l-emerald-600'
                                : 'odd:bg-[#FBF7EE] even:bg-white/60 hover:bg-[#e4dac3]/30'
                            }`}
                          >
                            <td className={`px-3 py-2 font-black ${
                              row.countryName.toLowerCase().trim() === selectedCountryName.toLowerCase().trim()
                                ? 'text-emerald-900'
                                : 'text-[#5c3c10]'
                            }`}>{index + 1}</td>
                            
                            {/* 🔥 PERBAIKAN: Kolom negara dengan bendera tanpa label tambahan */}
                            <td className={`px-3 py-2 font-bold ${
                              row.countryName.toLowerCase().trim() === selectedCountryName.toLowerCase().trim()
                                ? 'text-emerald-900'
                                : 'text-[#5c3c10]'
                            }`}>
                              <div className="flex items-center gap-2">
                                {row.iso ? (
                                  <img
                                    src={`https://flagcdn.com/w20/${row.iso.toLowerCase()}.png`}
                                    alt={row.countryName}
                                    className="w-5 h-4 object-cover rounded-sm border border-[#5c3c10]/10 shadow-sm flex-shrink-0"
                                    onError={(e) => (e.target as HTMLImageElement).style.display = "none"}
                                  />
                                ) : (
                                  // 🔥 Jika data ISO kosong, tampilkan kotak abu-abu
                                  <div className="w-5 h-4 rounded-sm bg-[#e4dac3] border border-[#5c3c10]/20 flex-shrink-0" />
                                )}
                                <span>{row.countryName}</span>
                              </div>
                            </td>
                            
                            <td className="px-3 py-2 text-[#5c3c10]">{formatNumber(row.darat)}</td>
                            <td className="px-3 py-2 text-[#5c3c10]">{formatNumber(row.laut)}</td>
                            <td className="px-3 py-2 text-[#5c3c10]">{formatNumber(row.udara)}</td>
                            <td className={`px-3 py-2 font-black ${
                              row.countryName.toLowerCase().trim() === selectedCountryName.toLowerCase().trim()
                                ? 'text-emerald-600'
                                : 'text-rose-700'
                            }`}>{formatNumber(row.totalPower)}</td>
                            <td className="px-3 py-2 text-center">
                              <button 
                                onClick={() => handleOpenAttackModal(row)}
                                className="p-1.5 rounded-lg bg-rose-600/10 text-rose-700 hover:bg-rose-600 hover:text-white border border-rose-600/30 transition-all cursor-pointer"
                                title="Serang negara ini"
                              >
                                <Swords className="w-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div className="px-8 py-4 border-t-2 border-[#C4B49C]/30 bg-[#FAF6EE]/80 relative z-10 shrink-0 flex items-center justify-end">
            <button onClick={onClose} className="px-6 py-2.5 rounded-xl border-2 border-[#C4B49C] bg-transparent text-[#8b7e66] hover:text-[#5c3c10] hover:bg-black/5 transition-all font-black text-xs uppercase tracking-wider cursor-pointer">
              Batal
            </button>
          </div>
        </div>
      </div>

      {/* 🔥 RENDER MODAL SERANG BARU */}
      {selectedTarget && (
        <SerangModals
          isOpen={isSerangModalOpen}
          onClose={() => setIsSerangModalOpen(false)}
          targetCountry={selectedTarget}
          countryDetail={countryDetail}
          onConfirm={handleConfirmAttack}
        />
      )}
    </>
  );
}