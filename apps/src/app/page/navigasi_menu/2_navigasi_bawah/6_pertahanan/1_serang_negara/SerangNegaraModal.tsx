"use client"
import React, { useMemo, useState } from "react";
import { X, Shield, Swords, ChevronUp, ChevronDown, Search } from "lucide-react";
import { getArmadaPowerSummary } from "../4_armada/logic/armadaLogic";
// 🔥 Import modal serang baru yang akan kita buat
import SerangModals from "./modals_menu/KonfirmasiSerangModals";
// 🔥 Import COUNTRIES_DATA untuk meng-enrich ISO
import { COUNTRIES_DATA } from "@/app/page/map_system/map-data";
import KonfirmasiPeluncuranSerangan from "@/app/page/detail_negara/3_operasi_militer/1_serang_negara/konfirmasi_peluncuran_serangan";
import HasilPertempuran from "@/app/page/detail_negara/3_operasi_militer/1_serang_negara/hasil_pertempuran";

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
  const [isLaunchConfirmationOpen, setIsLaunchConfirmationOpen] = useState(false);
  const [battleOutcome, setBattleOutcome] = useState<boolean | null>(null);
  const [internalCountries, setInternalCountries] = useState<any[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

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

    const annexedStore = (typeof window !== 'undefined' ? (window as any).neosantara_annexed_countries : {}) || {};

    // 1. Petakan data negara dasar
    const countryMap = new Map<string, any>();
    source.forEach((c: any) => {
      const cName = c?.nama_negara || c?.country || c?.name_id || c?.name_en || "Negara";
      countryMap.set(cName.toLowerCase().trim(), JSON.parse(JSON.stringify(c)));
    });

    // 2. Gabungkan unit militer & infrastruktur dari negara yang dianeksasi ke penyerangnya
    const annexedTargets = new Set<string>();

    Object.entries(annexedStore).forEach(([targetKey, data]: [string, any]) => {
      if (!data || !data.attackerCountry) return;
      
      const targetNorm = targetKey.toLowerCase().trim();
      const attackerNorm = data.attackerCountry.toLowerCase().trim();

      const targetObj = countryMap.get(targetNorm);
      const attackerObj = countryMap.get(attackerNorm);

      if (targetObj && attackerObj && targetNorm !== attackerNorm) {
        annexedTargets.add(targetNorm);

        // Jumlahkan unit armada & infrastruktur
        const keysToSum = [
          'barak', 'gudang_senjata', 'hangar_tank', 'pangkalan_udara', 'pangkalan_laut',
          'pasukan_infanteri', 'tank_tempur_utama', 'apc_ifv', 'artileri_berat', 'sistem_peluncur_roket', 'pertahanan_udara_mobile', 'kendaraan_taktis',
          'kapal_induk', 'kapal_induk_nuklir', 'kapal_destroyer', 'kapal_korvet', 'kapal_selam_nuklir', 'kapal_selam_regular', 'kapal_ranjau', 'kapal_logistik',
          'jet_tempur_siluman', 'jet_tempur_interceptor', 'pesawat_pengebom', 'helikopter_serang', 'pesawat_pengintai', 'drone_intai_uav', 'drone_kamikaze', 'pesawat_angkut'
        ];

        keysToSum.forEach(key => {
          const tVal = Number(targetObj[key] ?? targetObj?.armada?.[key] ?? 0);
          if (tVal > 0) {
            const currentAttackerVal = Number(attackerObj[key] ?? attackerObj?.armada?.[key] ?? 0);
            attackerObj[key] = currentAttackerVal + tVal;
            if (attackerObj.armada && typeof attackerObj.armada === 'object') {
              attackerObj.armada[key] = (Number(attackerObj.armada[key] ?? 0)) + tVal;
            }
          }
        });
      }
    });

    return Array.from(countryMap.values())
      .filter((country: any) => {
        const cName = (country?.nama_negara || country?.country || country?.name_id || country?.name_en || "Negara").toLowerCase().trim();
        return !annexedTargets.has(cName);
      })
      .map((country: any) => {
        const summary = getArmadaPowerSummary(country);
        const groupTotals = summary?.totals?.groups;
        const countryName = country?.nama_negara || country?.country || country?.name_id || country?.name_en || "Negara";
        
        let iso = "";
        if (COUNTRIES_DATA && Array.isArray(COUNTRIES_DATA)) {
          const mapData = COUNTRIES_DATA.find((c: any) => 
            c.country && c.country.toLowerCase().trim() === countryName.toLowerCase().trim()
          );
          if (mapData?.iso) {
            iso = mapData.iso;
          }
        }
        
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
          iso: iso,
        };
      });
  }, [prefetchedAllCountries, internalCountries]);

  const rankings = useMemo(() => {
    let sortableItems = [...rawRankings];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      sortableItems = sortableItems.filter(item => 
        item.countryName.toLowerCase().includes(q)
      );
    }
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
  }, [rawRankings, sortConfig, searchQuery]);

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

  const handleConfirmAttack = () => {
    setIsSerangModalOpen(false);
    setIsLaunchConfirmationOpen(true);
  };

  const handleLaunchAttack = () => {
    if (!selectedTarget) return;

    const attackerPower = getArmadaPowerSummary(countryDetail).totals.totalPower;
    const targetPower = selectedTarget.totalPower;
    const randomBonus = Math.floor(Math.random() * 200) - 100;
    setBattleOutcome(attackerPower + randomBonus >= targetPower * 0.4);
    setIsLaunchConfirmationOpen(false);
  };

  const closeAttackFlow = () => {
    setIsSerangModalOpen(false);
    setIsLaunchConfirmationOpen(false);
    setBattleOutcome(null);
    onClose();
  };

  const handleSelectBattleAction = (actionType: 'aneksasi' | 'jarah' | 'mundur') => {
    if (!selectedTarget || typeof window === 'undefined') return;

    window.dispatchEvent(new CustomEvent('trigger_player_attack', {
      detail: {
        actionType,
        targetCountry: selectedTarget.countryName
      }
    }));
    closeAttackFlow();
  };

  const selectedCountryName = useMemo(() => {
    return countryDetail?.country || countryDetail?.nama_negara || countryDetail?.name_id || countryDetail?.name_en || "Negara";
  }, [countryDetail]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none">
        <div className="bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans pointer-events-auto shadow-2xl">
          
          <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-[#00FFAA]/20 flex items-center justify-between bg-[#0A1A1A] relative z-10 gap-2 shrink-0 rounded-t-2xl">
            <div className="flex items-center gap-4 lg:gap-8">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1 sm:p-1.5 bg-[#0F2424] rounded-lg border border-[#00FFAA]/30 shrink-0">
                  <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-rose-500 animate-pulse" />
                </div>
                <div>
                  <h2 className="text-base sm:text-xl font-bold text-[#00FFAA] tracking-tight leading-none uppercase">Serang Negara</h2>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-2 ml-4 lg:ml-8 pl-4 lg:pl-8 border-l border-[#00FFAA]/30">
                <span className="text-[10px] lg:text-[11px] font-black uppercase tracking-wider text-[#6B8A8A]">{selectedCountryName}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Input Search Bar */}
              <div className="relative w-48 sm:w-60">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#00FFAA]/60" />
                <input
                  type="text"
                  placeholder="Cari negara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#051111] border border-[#00FFAA]/30 rounded-lg pl-8 pr-3 py-1 text-xs text-[#E0E0E0] placeholder-[#6B8A8A] focus:outline-none focus:border-[#00FFAA] transition-colors"
                />
              </div>

              <button onClick={onClose} className="p-1.5 lg:p-2 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] text-[#6B8A8A] hover:text-[#00FFAA] hover:border-[#00FFAA] transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1 shadow-sm">
                <span className="text-[10px] lg:text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto p-6 bg-[#0F2424] relative z-10 no-scrollbar flex flex-col items-center">
            <div className="w-full space-y-4">
              <div className="text-xs font-semibold text-[#6B8A8A] leading-relaxed">
                Tabel ranking 207 negara berdasarkan total kekuatan gabungan darat, laut, dan udara. Klik header kolom untuk mengurutkan data. Klik ikon <Swords className="inline w-3.5 h-3.5 text-rose-400" /> untuk menyerang target.
              </div>

              <div className="w-full overflow-hidden border border-[#00FFAA]/20 rounded-xl bg-[#0A1A1A] shadow-sm">
                <div className="max-h-[52vh] overflow-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-[#0A1A1A] border-b border-[#00FFAA]/20 sticky top-0 z-10 text-[9px] sm:text-[10px] lg:text-xs whitespace-nowrap">
                      <tr>
                        <th className="px-2 py-1.5 text-left font-black text-[#00FFAA] uppercase tracking-normal sm:tracking-wider w-10 bg-[#0A1A1A]">Rank</th>
                        <th className="px-2 py-1.5 text-left font-black text-[#00FFAA] uppercase tracking-normal sm:tracking-wider cursor-pointer hover:bg-[#00FFAA]/10 transition-colors bg-[#0A1A1A]" onClick={() => handleSort('countryName')}>
                          Negara{getSortArrow('countryName')}
                        </th>
                        <th className="px-2 py-1.5 text-right font-black text-[#00FFAA] uppercase tracking-normal sm:tracking-wider cursor-pointer hover:bg-[#00FFAA]/10 transition-colors bg-[#0A1A1A]" onClick={() => handleSort('darat')}>
                          Darat{getSortArrow('darat')}
                        </th>
                        <th className="px-2 py-1.5 text-right font-black text-[#00FFAA] uppercase tracking-normal sm:tracking-wider cursor-pointer hover:bg-[#00FFAA]/10 transition-colors bg-[#0A1A1A]" onClick={() => handleSort('laut')}>
                          Laut{getSortArrow('laut')}
                        </th>
                        <th className="px-2 py-1.5 text-right font-black text-[#00FFAA] uppercase tracking-normal sm:tracking-wider cursor-pointer hover:bg-[#00FFAA]/10 transition-colors bg-[#0A1A1A]" onClick={() => handleSort('udara')}>
                          Udara{getSortArrow('udara')}
                        </th>
                        <th className="px-2 py-1.5 text-right font-black text-[#00FFAA] uppercase tracking-normal sm:tracking-wider cursor-pointer hover:bg-[#00FFAA]/10 transition-colors bg-[#0A1A1A]" onClick={() => handleSort('totalPower')}>
                          Total Kekuatan{getSortArrow('totalPower')}
                        </th>
                        <th className="px-2 py-1.5 text-center font-black text-[#00FFAA] uppercase tracking-normal sm:tracking-wider bg-[#0A1A1A]">Aksi</th>
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
      {selectedTarget && isLaunchConfirmationOpen && (
        <KonfirmasiPeluncuranSerangan
          playerName={selectedCountryName}
          playerIso={String(countryDetail?.iso || 'cn').toLowerCase()}
          playerPower={getArmadaPowerSummary(countryDetail).totals.totalPower}
          targetName={selectedTarget.countryName}
          targetIso={String(selectedTarget.iso || 'un').toLowerCase()}
          targetPower={selectedTarget.totalPower}
          onBack={() => {
            setIsLaunchConfirmationOpen(false);
            setIsSerangModalOpen(true);
          }}
          onConfirm={handleLaunchAttack}
        />
      )}
      {selectedTarget && battleOutcome !== null && (
        <HasilPertempuran
          isVictory={battleOutcome}
          playerName={selectedCountryName}
          countryName={selectedTarget.countryName}
          onClose={closeAttackFlow}
          onSelectAction={handleSelectBattleAction}
        />
      )}
    </>
  );
}