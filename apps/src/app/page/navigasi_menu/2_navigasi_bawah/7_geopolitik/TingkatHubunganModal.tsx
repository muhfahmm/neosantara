"use client"

import SharedModalCloseButton from '@/app/page/root_modals_design_menu/ModalCloseButton';
import { getRelationBadge, RELATION_TIERS } from '@/app/logic/relationTiers';
import React, { useEffect, useState } from "react";
import { X, Globe, Search, Info, Building2, ShieldCheck, ShieldAlert, Heart, Gift, Coins, Sparkles, ArrowRight } from "lucide-react";
import NotebookModalWrapper from "../NotebookModalWrapper";
import { COUNTRIES_DATA } from "@/app/page/map_system/map-data";
import { getRelationValue, hasEmbassy } from "../../../../../../../json/4_database_hubungan_antar_negara/relationsRegistry";
import getTradeAgreementsForCountry from "../../../../../../../json/9_database_mitra_perdagangan/tradeAgreementRegistry";
import { getEmbassiesForCountry } from "../../../../../../../json/6_database_kedutaan_besar/embassyRegistry";
import TingkatkanHubunganModal from "@/app/page/detail_negara/2_geopolitik/3_tingkatkan_hubungan/tingkatkanHubunganModals";
import BeriHadiahModal from "@/app/page/detail_negara/2_geopolitik/2_beri_hadiah/beriHadiahModals";
import MenuInfoButton from "../MenuInfoButton";
import RootModalCloseButton from "@/app/page/root_modals_design_menu/RootModalCloseButton";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCountry?: any;
  countryDetail?: any;
  setCountryDetail?: (detail: any | ((prev: any) => any)) => void;
}

const normalizeContinent = (continent: any) => {
  if (typeof continent !== 'string') return 'Lainnya';
  const value = continent.trim().toLowerCase();
  if (value === 'asia') return 'Asia';
  if (value === 'africa' || value === 'afrika') return 'Africa';
  if (value === 'europe' || value === 'eropa') return 'Europe';
  if (value === 'north america' || value === 'amerika utara') return 'North America';
  if (value === 'south america' || value === 'amerika selatan') return 'South America';
  if (value === 'oceania' || value === 'oseania' || value === 'australia') return 'Oceania';
  return continent || 'Lainnya';
};

export default function TingkatHubunganModal({ isOpen, onClose, selectedCountry, countryDetail, setCountryDetail }: ModalProps) {
  // ═══════════════════════════════════════════════════════════════
  // ✅ SEMUA HOOKS DIDEKLARASIKAN DI SINI — JANGAN DIHAPUS
  // ═══════════════════════════════════════════════════════════════
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({
    key: 'no',
    direction: 'asc',
  });

  const [isLegendOpen, setIsLegendOpen] = useState(false);
  const [, setRelationRevision] = useState(0);

  // State untuk alur "Tingkatkan Hubungan Semua Negara"
  const [isPilihJalurOpen, setIsPilihJalurOpen] = useState(false);
  const [isTingkatkanUangOpen, setIsTingkatkanUangOpen] = useState(false);
  const [isBeriHadiahBarangOpen, setIsBeriHadiahBarangOpen] = useState(false);

  useEffect(() => {
    const refreshRelations = () => setRelationRevision(revision => revision + 1);
    window.addEventListener('country_relations_updated', refreshRelations);
    return () => window.removeEventListener('country_relations_updated', refreshRelations);
  }, []);

  if (!isOpen) return null;

  const playerCountryName = selectedCountry?.country || countryDetail?.country || countryDetail?.nama_negara || countryDetail?.name_id || "Indonesia";
  const normPlayer = playerCountryName.toLowerCase().trim();

  const sqlDbEmbassies = getEmbassiesForCountry(playerCountryName);
  const directEmbassies = Array.isArray(countryDetail?.embassies) ? countryDetail.embassies : [];
  const removedEmbassies = Array.isArray(countryDetail?.removedEmbassies) ? countryDetail.removedEmbassies : [];
  const removedTradePartners = Array.isArray(countryDetail?.removedTradePartners) ? countryDetail.removedTradePartners : [];
  const customTradeAgreements = Array.isArray(countryDetail?.tradeAgreements) ? countryDetail.tradeAgreements : [];

  const activeTradeMitras: string[] = Array.isArray(customTradeAgreements)
    ? customTradeAgreements
      .filter((agreement: any) => {
        const normMitra = String(agreement.mitra || '').toLowerCase().trim();
        const isRemovedTrade = removedTradePartners.some((r: string) => String(r || '').toLowerCase().trim() === normMitra);
        const isRemovedEmbassy = removedEmbassies.some((r: string) => String(r || '').toLowerCase().trim() === normMitra);
        return !isRemovedTrade && !isRemovedEmbassy;
      })
      .map((agreement: any) => agreement.mitra)
    : [];

  const activeDirectEmbassies: string[] = directEmbassies
    .map((e: any) => e.mitra || e.nama_negara || e.name)
    .filter(Boolean);

  const allActiveEmbassyNames = Array.from(new Set([...sqlDbEmbassies, ...activeTradeMitras, ...activeDirectEmbassies])).filter(m => {
    const norm = m.toLowerCase().trim();
    return !removedEmbassies.some((r: string) => r.toLowerCase().trim() === norm);
  });

  const annexedStore = (typeof window !== 'undefined' ? (window as any).neosantara_annexed_countries : {}) || {};

  const allTargetCountries = COUNTRIES_DATA.filter((c) => {
    const raw = String(c.country || '');
    const norm = raw.toLowerCase().trim();
    const isoNorm = String(c.iso || '').toLowerCase().trim();
    if (norm === normPlayer) return false;
    const isAnnexed = Boolean(
      annexedStore[raw] ||
      annexedStore[norm] ||
      (isoNorm && annexedStore[isoNorm])
    );
    return !isAnnexed;
  }).map((c, idx) => {
    const relVal = getRelationValue(playerCountryName, c.country);
    const embassyExists = hasEmbassy(playerCountryName, c.country, allActiveEmbassyNames);
    return {
      no: idx + 1,
      name: c.country,
      continent: normalizeContinent(c.continent),
      relation: relVal,
      hasEmbassy: embassyExists,
    };
  });

  const handleSort = (key: string) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc',
    }));
  };

  const renderSortArrow = (key: string) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? ' ▲' : ' ▼';
  };

  let rows = allTargetCountries;

  if (searchQuery.trim() !== '') {
    const q = searchQuery.toLowerCase();
    rows = rows.filter(
      (item) => item.name.toLowerCase().includes(q) || item.continent.toLowerCase().includes(q)
    );
  }

  const sortedRows = [...rows].sort((a, b) => {
    const key = sortConfig.key as keyof typeof a;
    const aVal = a[key];
    const bVal = b[key];
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortConfig.direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    } else {
      return sortConfig.direction === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    }
  });

  const countByCategory = {
    sangatBuruk: allTargetCountries.filter(c => c.relation >= 0 && c.relation <= 25).length,
    buruk: allTargetCountries.filter(c => c.relation >= 26 && c.relation <= 40).length,
    netral: allTargetCountries.filter(c => c.relation >= 41 && c.relation <= 65).length,
    baik: allTargetCountries.filter(c => c.relation >= 66 && c.relation <= 80).length,
    sangatBaik: allTargetCountries.filter(c => c.relation >= 81 && c.relation <= 100).length,
  };

  return (
    <>
      {!isLegendOpen && !isPilihJalurOpen && !isTingkatkanUangOpen && !isBeriHadiahBarangOpen && <NotebookModalWrapper onClose={onClose}>
        <div className="flex flex-col h-full overflow-hidden">

          {/* HEADER */}
          <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-root-accent/20 flex items-center justify-between bg-root-canvas relative z-10 shrink-0">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-root-surface rounded-xl border border-root-accent/30">
                <Globe className="h-4 w-4 sm:h-5 sm:w-5 text-root-accent animate-pulse" />
              </div>
              <div>
                <h2 className="text-base sm:text-xl font-bold text-root-accent tracking-tight leading-none uppercase">Tingkat Hubungan Diplomatik</h2>
                <p className="text-[10px] font-bold uppercase tracking-widest text-root-subtle mt-1">{playerCountryName}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPilihJalurOpen(true)}
                className="p-1.5 lg:p-2 px-2.5 lg:px-3 rounded-xl border border-root-accent/40 bg-root-surface text-root-accent hover:bg-root-accent hover:text-root-canvas transition-all cursor-pointer font-bold text-[10px] lg:text-xs uppercase flex items-center gap-1.5 shadow-sm"
                title="Tingkatkan Hubungan Semua Negara"
              >
                <Heart className="h-3.5 w-3.5 fill-root-accent hover:fill-root-canvas" />
                <span className="font-black tracking-wider whitespace-nowrap">Tingkatkan Hubungan Semua Negara</span>
              </button>
              <MenuInfoButton
                title="Tingkat Hubungan"
                description="Lihat tingkat hubungan diplomatik dengan negara lain, telusuri negara berdasarkan hubungan, dan gunakan aksi diplomasi yang tersedia untuk memperbaikinya. Hubungan dapat memengaruhi kerja sama bilateral serta respons negara lain."
              />
              <SharedModalCloseButton
                onClick={onClose}
                className="p-1.5 lg:p-2 rounded-xl border border-root-accent/30 bg-root-surface text-root-subtle hover:text-root-accent hover:border-root-accent transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1 shadow-sm shrink-0"
               appearance="custom">
                <span className="text-[10px] lg:text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
                <X className="h-4 w-4" />
              </SharedModalCloseButton>
            </div>
          </div>

          {/* BODY TABEL */}
          <div className="flex-1 min-h-0 flex flex-col p-6 bg-root-surface relative z-10">
            <div className="flex justify-between items-center gap-3 mb-4 flex-shrink-0">
              <button
                onClick={() => setIsLegendOpen(true)}
                className="px-4 py-2 rounded-lg bg-root-canvas border border-root-accent/30 text-root-accent text-[10px] font-black uppercase tracking-wider hover:bg-root-accent/10 transition-all cursor-pointer flex items-center gap-2"
              >
                <Info className="h-3.5 w-3.5 text-root-accent" />
                Legenda Hubungan
              </button>

              <div className="relative">
                <input
                  type="text"
                  placeholder="Cari negara / benua..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-lg bg-root-canvas border border-root-accent/30 text-xs font-bold text-root-text outline-none focus:border-root-accent w-52 transition-all placeholder:text-root-subtle"
                />
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-root-subtle" />
              </div>
            </div>

            <div className="flex-1 min-h-0 bg-root-canvas border border-root-accent/20 rounded-xl overflow-hidden shadow-sm flex flex-col">
              <div className="flex-1 min-h-0 overflow-y-auto neon-scrollbar">
                <table className="min-w-full table-auto border-separate border-spacing-0 text-left">
                  <thead className="sticky top-0 z-10 bg-root-canvas">
                    <tr className="border-b border-root-accent/20">
                      <th className="sticky top-0 z-10 bg-root-canvas px-3 py-2 border-b border-root-accent/20 text-center cursor-pointer hover:bg-root-accent/10 transition text-[9px] sm:text-[10px] text-root-accent font-black uppercase tracking-wider whitespace-nowrap w-14" onClick={() => handleSort('no')}>No{renderSortArrow('no')}</th>
                      <th className="sticky top-0 z-10 bg-root-canvas px-3 py-2 border-b border-root-accent/20 cursor-pointer hover:bg-root-accent/10 transition text-[9px] sm:text-[10px] text-root-accent font-black uppercase tracking-wider whitespace-nowrap" onClick={() => handleSort('name')}>Nama Negara{renderSortArrow('name')}</th>
                      <th className="sticky top-0 z-10 bg-root-canvas px-3 py-2 border-b border-root-accent/20 cursor-pointer hover:bg-root-accent/10 transition text-[9px] sm:text-[10px] text-root-accent font-black uppercase tracking-wider whitespace-nowrap" onClick={() => handleSort('continent')}>Benua{renderSortArrow('continent')}</th>
                      <th className="sticky top-0 z-10 bg-root-canvas px-3 py-2 border-b border-root-accent/20 text-center cursor-pointer hover:bg-root-accent/10 transition text-[9px] sm:text-[10px] text-root-accent font-black uppercase tracking-wider whitespace-nowrap" onClick={() => handleSort('hasEmbassy')}>Kedutaan Besar{renderSortArrow('hasEmbassy')}</th>
                      <th className="sticky top-0 z-10 bg-root-canvas px-3 py-2 border-b border-root-accent/20 text-center cursor-pointer hover:bg-root-accent/10 transition text-[9px] sm:text-[10px] text-root-accent font-black uppercase tracking-wider whitespace-nowrap" onClick={() => handleSort('relation')}>Tingkat Hubungan{renderSortArrow('relation')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-root-accent/10">
                    {sortedRows.length === 0 ? (
                      <tr>
                        <td className="px-4 py-6 text-center text-sm font-bold text-root-subtle" colSpan={5}>
                          Tidak ada data yang cocok dengan pencarian "{searchQuery}".
                        </td>
                      </tr>
                    ) : (
                      sortedRows.map((row, index) => {
                        const { alias, className } = getRelationBadge(row.relation);
                        return (
                          <tr key={`${row.name}-${index}`} className="hover:bg-root-accent/5 transition-colors">
                            <td className="px-4 py-3 text-center text-xs font-bold text-root-subtle">{index + 1}</td>
                            <td className="px-4 py-3 text-xs font-bold text-root-text">
                              <div className="flex items-center gap-2">
                                {row.hasEmbassy ? (
                                  <Building2 className="w-4 h-4 text-root-accent shrink-0" />
                                ) : (
                                  <Building2 className="w-4 h-4 text-root-muted opacity-60 shrink-0" />
                                )}
                                <span>{row.name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-xs font-bold text-root-subtle">{row.continent}</td>
                            <td className="px-4 py-3 text-center text-xs font-bold">
                              {row.hasEmbassy ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-root-accent/15 text-root-accent border border-root-accent/30 text-[11px] font-bold">
                                  <ShieldCheck className="w-3.5 h-3.5" />
                                  Ada Kedutaan
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-root-canvas text-root-muted border border-root-accent/20 text-[11px] font-medium">
                                  <ShieldAlert className="w-3.5 h-3.5 opacity-60" />
                                  Tidak Ada
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center text-xs font-bold">
                              <span className={`inline-block px-3 py-0.5 rounded-md border font-black text-xs shadow-sm ${className}`}>
                                {row.relation} - {alias}
                              </span>
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
      </NotebookModalWrapper>}

      {/* MODAL LEGENDA */}
      {isLegendOpen && (
        <NotebookModalWrapper onClose={() => setIsLegendOpen(false)} compact zIndexClass="z-[70]">
          <div role="dialog" aria-modal="true" aria-labelledby="relation-legend-title" className="flex max-h-[calc(100dvh-160px)] min-w-0 flex-col overflow-hidden">
            <div className="px-4 sm:px-5 py-3 border-b border-root-accent/20 flex items-center justify-between bg-root-canvas gap-2 shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-root-surface rounded-lg border border-root-accent/30">
                  <Info className="h-4 w-4 text-root-accent" />
                </div>
                <h3 id="relation-legend-title" className="text-sm font-bold text-root-accent uppercase tracking-wide">
                  Indikator Hubungan Diplomatik
                </h3>
              </div>
              <RootModalCloseButton onClick={() => setIsLegendOpen(false)} />
            </div>

            <div className="min-h-0 overflow-y-auto bg-root-surface p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-root-accent/15 pb-2">
                <span className="text-xs font-bold text-root-text">0 - 25</span>
                <div className="flex items-center gap-3">
                  <span className="inline-block px-3 py-1 rounded-md bg-red-500/15 text-red-400 border border-red-500/30 font-bold text-xs">Sangat Buruk</span>
                  <span className="text-xs font-semibold text-root-subtle w-20 text-right">({countByCategory.sangatBuruk} negara)</span>
                </div>
              </div>
              <div className="flex items-center justify-between border-b border-root-accent/15 pb-2">
                <span className="text-xs font-bold text-root-text">26 - 40</span>
                <div className="flex items-center gap-3">
                  <span className="inline-block px-3 py-1 rounded-md bg-rose-500/15 text-rose-400 border border-rose-500/30 font-bold text-xs">Buruk</span>
                  <span className="text-xs font-semibold text-root-subtle w-20 text-right">({countByCategory.buruk} negara)</span>
                </div>
              </div>
              <div className="flex items-center justify-between border-b border-root-accent/15 pb-2">
                <span className="text-xs font-bold text-root-text">41 - 65</span>
                <div className="flex items-center gap-3">
                  <span className="inline-block px-3 py-1 rounded-md bg-yellow-500/15 text-yellow-400 border border-yellow-500/30 font-bold text-xs">Netral</span>
                  <span className="text-xs font-semibold text-root-subtle w-20 text-right">({countByCategory.netral} negara)</span>
                </div>
              </div>
              <div className="flex items-center justify-between border-b border-root-accent/15 pb-2">
                <span className="text-xs font-bold text-root-text">66 - 80</span>
                <div className="flex items-center gap-3">
                  <span className="inline-block px-3 py-1 rounded-md bg-green-500/15 text-green-400 border border-green-500/30 font-bold text-xs">Baik</span>
                  <span className="text-xs font-semibold text-root-subtle w-20 text-right">({countByCategory.baik} negara)</span>
                </div>
              </div>
              <div className="flex items-center justify-between border-b border-root-accent/15 pb-2">
                <span className="text-xs font-bold text-root-text">81 - 100</span>
                <div className="flex items-center gap-3">
                  <span className="inline-block px-3 py-1 rounded-md bg-root-accent/15 text-root-accent border border-root-accent/30 font-bold text-xs">Sangat Baik</span>
                  <span className="text-xs font-semibold text-root-subtle w-20 text-right">({countByCategory.sangatBaik} negara)</span>
                </div>
              </div>
            </div>

            <div className="px-5 py-3 border-t border-root-accent/20 bg-root-canvas">
              <SharedModalCloseButton
                onClick={() => setIsLegendOpen(false)}
                className="w-full py-2.5 rounded-xl bg-root-accent text-root-canvas text-xs font-black uppercase tracking-widest hover:bg-root-accent/80 transition-all cursor-pointer"
               appearance="custom">
                Tutup
              </SharedModalCloseButton>
            </div>
          </div>
        </NotebookModalWrapper>
      )}

      {/* MODAL PILIH JALUR */}
      {isPilihJalurOpen && (
        <NotebookModalWrapper onClose={() => setIsPilihJalurOpen(false)}>
          <div className="flex h-full flex-col overflow-hidden">

            <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-root-accent/20 flex items-center justify-between bg-root-canvas gap-2 shrink-0 rounded-t-2xl">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1 sm:p-1.5 bg-root-surface rounded-lg border border-root-accent/30 shrink-0">
                  <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-root-accent" />
                </div>
                <div>
                  <h3 className="text-base sm:text-xl font-bold text-root-accent tracking-tight leading-none uppercase">
                    Pilih Jalur Diplomasi
                  </h3>
                  <p className="text-[10px] sm:text-xs text-root-subtle font-semibold mt-1">
                    Tingkatkan Hubungan ke Seluruh Negara Dunia
                  </p>
                </div>
              </div>

              <SharedModalCloseButton
                onClick={() => setIsPilihJalurOpen(false)}
                className="p-1.5 lg:p-2 rounded-xl border border-root-accent/30 bg-root-surface text-root-subtle hover:text-root-accent hover:border-root-accent transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1 shadow-sm shrink-0"
               appearance="custom">
                <span className="text-[10px] lg:text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
                <X className="h-4 w-4" />
              </SharedModalCloseButton>
            </div>

            <div className="flex-1 min-h-0 bg-root-surface relative z-10 p-6 sm:p-8 lg:p-12 flex flex-col items-center justify-center gap-6 sm:gap-8">
              <p className="text-sm sm:text-base text-root-text text-center leading-relaxed max-w-2xl">
                Pilih metode bantuan yang ingin Anda salurkan untuk menaikkan tingkat hubungan bilateral dengan{" "}
                <strong className="text-root-accent">seluruh negara dunia</strong>.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 w-full max-w-3xl">
                <button
                  type="button"
                  onClick={() => {
                    setIsPilihJalurOpen(false);
                    setIsTingkatkanUangOpen(true);
                  }}
                  className="group flex flex-col items-center justify-center text-center p-6 sm:p-8 rounded-2xl border border-root-accent/30 bg-root-canvas hover:bg-root-accent/10 hover:border-root-accent transition-all cursor-pointer shadow-sm hover:scale-[1.02] min-h-[200px] sm:min-h-[240px]"
                >
                  <div className="p-4 bg-root-accent/10 rounded-2xl border border-root-accent/30 mb-4 group-hover:bg-root-accent transition-all">
                    <Coins className="h-8 w-8 sm:h-10 sm:w-10 text-root-accent group-hover:text-root-canvas transition-colors" />
                  </div>
                  <h4 className="text-base sm:text-lg font-black text-root-accent uppercase tracking-wide mb-2">
                    Jalur Uang (NEO)
                  </h4>
                  <p className="text-xs sm:text-sm text-root-subtle leading-relaxed max-w-xs">
                    Tingkatkan Hubungan Diplomatik dengan menyalurkan kas anggaran negara (10.000 NEO = +1 Tingkat).
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsPilihJalurOpen(false);
                    setIsBeriHadiahBarangOpen(true);
                  }}
                  className="group flex flex-col items-center justify-center text-center p-6 sm:p-8 rounded-2xl border border-root-accent/30 bg-root-canvas hover:bg-root-accent/10 hover:border-root-accent transition-all cursor-pointer shadow-sm hover:scale-[1.02] min-h-[200px] sm:min-h-[240px]"
                >
                  <div className="p-4 bg-root-accent/10 rounded-2xl border border-root-accent/30 mb-4 group-hover:bg-root-accent transition-all">
                    <Gift className="h-8 w-8 sm:h-10 sm:w-10 text-root-accent group-hover:text-root-canvas transition-colors" />
                  </div>
                  <h4 className="text-base sm:text-lg font-black text-root-accent uppercase tracking-wide mb-2">
                    Jalur Hadiah Komoditas
                  </h4>
                  <p className="text-xs sm:text-sm text-root-subtle leading-relaxed max-w-xs">
                    Beri Hadiah Komoditas berupa hasil mineral, pangan, manufaktur, agrikultur, atau perikanan.
                  </p>
                </button>
              </div>

              <div className="flex-1" />
            </div>

            <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-root-accent/20 bg-root-canvas shrink-0 rounded-b-2xl">
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setIsPilihJalurOpen(false)}
                  className="px-6 py-3 bg-root-surface hover:bg-root-accent/10 border border-root-accent/30 hover:border-root-accent rounded-xl text-center text-root-text font-black text-xs tracking-wider uppercase transition-all cursor-pointer"
                >
                  Batal
                </button>
              </div>
            </div>

          </div>
        </NotebookModalWrapper>
      )}

      {/* MODAL TINGKATKAN HUBUNGAN (JALUR UANG) */}
      <TingkatkanHubunganModal
        isOpen={isTingkatkanUangOpen}
        countryName="Semua Negara"
        playerCountryDetail={countryDetail}
        setPlayerCountryDetail={setCountryDetail}
        onClose={() => setIsTingkatkanUangOpen(false)}
        onConfirm={(amount, gained) => {
          console.log(`Tingkatkan Hubungan Semua Negara -> ${amount} NEO (+${gained} tingkat)`);
        }}
      />

      {/* MODAL BERI HADIAH (JALUR HADIAH) */}
      <BeriHadiahModal
        isOpen={isBeriHadiahBarangOpen}
        countryName="Semua Negara"
        playerCountryDetail={countryDetail}
        setCountryDetail={setCountryDetail}
        onClose={() => setIsBeriHadiahBarangOpen(false)}
        onConfirm={() => {
          console.log(`Beri Hadiah Komoditas ke Semua Negara berhasil`);
        }}
      />
    </>
  );
}