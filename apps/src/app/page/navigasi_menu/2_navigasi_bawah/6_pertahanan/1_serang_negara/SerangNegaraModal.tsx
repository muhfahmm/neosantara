"use client"
import React, { useMemo, useState } from "react";
import { X, Shield, Swords, ChevronUp, ChevronDown } from "lucide-react";
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
    if (sortConfig?.key !== key) return <span className="text-[#8b7e66]/40 ml-1 text-xs font-normal">⇅</span>;
    if (sortConfig.direction === 'asc') return <ChevronUp className="h-3 w-3 ml-1 inline text-[#5c3c10]" />;
    return <ChevronDown className="h-3 w-3 ml-1 inline text-[#5c3c10]" />;
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
        <div className="bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans pointer-events-auto shadow-2xl">
          
          <div className="px-6 py-4 border-b border-[#00FFAA]/30 flex items-center justify-between bg-[#0A1A1A] relative z-10 shrink-0">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[#0F2424] rounded-xl border border-[#00FFAA]/30">
                  <Shield className="h-6 w-6 text-rose-500 animate-pulse" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-[#00FFAA] tracking-wider uppercase">Serang Negara</h2>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-[#6B8A8A] mt-0.5">{selectedCountryName}</p>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] text-[#6B8A8A] hover:text-[#00FFAA] hover:border-[#00FFAA] transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto p-6 bg-[#0F2424] relative z-10 no-scrollbar flex flex-col items-center">
            <div className="w-full space-y-4">
              <div className="text-xs font-semibold text-[#6B8A8A] leading-relaxed">
                Tabel ranking 207 negara berdasarkan total kekuatan gabungan darat, laut, dan udara. Klik header kolom untuk mengurutkan data. Klik ikon <Swords className="inline w-3.5 h-3.5 text-rose-400" /> untuk menyerang target.
              </div>

              <div className="w-full overflow-hidden border border-[#00FFAA]/20 rounded-xl bg-[#0A1A1A] shadow-sm">
                <div className="max-h-[52vh] overflow-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-[#0F2424] border-b border-[#00FFAA]/20 sticky top-0 z-10">
                      <tr>
                        <th className="px-4 py-3 text-left font-black text-[#00FFAA] uppercase tracking-wider w-12">Rank</th>
                        <th className="px-4 py-3 text-left font-black text-[#00FFAA] uppercase tracking-wider cursor-pointer hover:bg-[#00FFAA]/10 transition-colors" onClick={() => handleSort('countryName')}>
                          Negara{getSortArrow('countryName')}
                        </th>
                        <th className="px-4 py-3 text-right font-black text-[#00FFAA] uppercase tracking-wider cursor-pointer hover:bg-[#00FFAA]/10 transition-colors" onClick={() => handleSort('darat')}>
                          Darat{getSortArrow('darat')}
                        </th>
                        <th className="px-4 py-3 text-right font-black text-[#00FFAA] uppercase tracking-wider cursor-pointer hover:bg-[#00FFAA]/10 transition-colors" onClick={() => handleSort('laut')}>
                          Laut{getSortArrow('laut')}
                        </th>
                        <th className="px-4 py-3 text-right font-black text-[#00FFAA] uppercase tracking-wider cursor-pointer hover:bg-[#00FFAA]/10 transition-colors" onClick={() => handleSort('udara')}>
                          Udara{getSortArrow('udara')}
                        </th>
                        <th className="px-4 py-3 text-right font-black text-[#00FFAA] uppercase tracking-wider cursor-pointer hover:bg-[#00FFAA]/10 transition-colors" onClick={() => handleSort('totalPower')}>
                          Total Kekuatan{getSortArrow('totalPower')}
                        </th>
                        <th className="px-4 py-3 text-center font-black text-[#00FFAA] uppercase tracking-wider">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#00FFAA]/10">
                      {isLoading && rankings.length === 0 ? (
                        <tr><td colSpan={7} className="px-4 py-8 text-center text-sm font-bold text-[#6B8A8A]">Memuat ranking kekuatan negara…</td></tr>
                      ) : rankings.length === 0 ? (
                        <tr><td colSpan={7} className="px-4 py-8 text-center text-sm font-bold text-[#6B8A8A]">Data ranking belum tersedia.</td></tr>
                      ) : (
                        rankings.map((row, index) => {
                          const isUser = row.countryName.toLowerCase().trim() === selectedCountryName.toLowerCase().trim();
                          return (
                            <tr 
                              key={`${row.countryName}-${index}`} 
                              className={`transition-colors ${
                                isUser
                                  ? 'bg-[#00FFAA]/10 hover:bg-[#00FFAA]/20 border-l-4 border-l-[#00FFAA]'
                                  : 'hover:bg-[#00FFAA]/5'
                              }`}
                            >
                              <td className={`px-3 py-2.5 font-black ${isUser ? 'text-[#00FFAA]' : 'text-[#E0E0E0]'}`}>{index + 1}</td>
                              
                              <td className={`px-3 py-2.5 font-bold ${isUser ? 'text-[#00FFAA]' : 'text-[#E0E0E0]'}`}>
                                <div className="flex items-center gap-2">
                                  {row.iso ? (
                                    <img
                                      src={`https://flagcdn.com/w20/${row.iso.toLowerCase()}.png`}
                                      alt={row.countryName}
                                      className="w-5 h-4 object-cover rounded-sm border border-[#00FFAA]/20 shadow-sm flex-shrink-0"
                                      onError={(e) => (e.target as HTMLImageElement).style.display = "none"}
                                    />
                                  ) : (
                                    <div className="w-5 h-4 rounded-sm bg-[#0F2424] border border-[#00FFAA]/20 flex-shrink-0" />
                                  )}
                                  <span>{row.countryName}</span>
                                </div>
                              </td>
                              
                              <td className="px-3 py-2.5 text-[#E0E0E0]">{formatNumber(row.darat)}</td>
                              <td className="px-3 py-2.5 text-[#E0E0E0]">{formatNumber(row.laut)}</td>
                              <td className="px-3 py-2.5 text-[#E0E0E0]">{formatNumber(row.udara)}</td>
                              <td className={`px-3 py-2.5 font-black ${isUser ? 'text-[#00FFAA]' : 'text-rose-400'}`}>{formatNumber(row.totalPower)}</td>
                              <td className="px-3 py-2.5 text-center">
                                <button 
                                  onClick={() => handleOpenAttackModal(row)}
                                  className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white border border-rose-500/30 transition-all cursor-pointer"
                                  title="Serang negara ini"
                                >
                                  <Swords className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-[#00FFAA]/30 bg-[#0A1A1A] relative z-10 shrink-0 flex items-center justify-end">
            <button onClick={onClose} className="px-6 py-2 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] text-[#6B8A8A] hover:text-[#00FFAA] hover:border-[#00FFAA] transition-all font-black text-xs uppercase tracking-wider cursor-pointer">
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