'use client';

import React, { useMemo, useState } from 'react';
import { X, Search, AlertTriangle } from 'lucide-react';
import { COUNTRIES_DATA } from '../../../../../map_system/map-data';
import { getEmbassiesForCountry } from "../../../../../../../../../json/6_database_kedutaan_besar/embassyRegistry";

interface TambahMitraBaruProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserCountry: string;
  partners: { nama_negara: string }[];
  onAddPartner: (countryName: string, region: string) => void;
  countryDetail?: any;
}

// Helper bendera
const getFlagEmoji = (iso: string) => {
  if (!iso || iso.length !== 2) return '';
  const codePoints = iso.toUpperCase().split('').map(c => 127397 + c.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};

export default function TambahMitraBaru({
  isOpen,
  onClose,
  currentUserCountry,
  partners,
  onAddPartner,
  countryDetail,
}: TambahMitraBaruProps) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [noEmbassyModalData, setNoEmbassyModalData] = useState<{ countryName: string } | null>(null);
  const [confirmModalData, setConfirmModalData] = useState<{ countryName: string; region: string } | null>(null);

  const currentPartnerNames = useMemo(() => {
    return new Set(partners.map((p) => p.nama_negara.toLowerCase().trim()));
  }, [partners]);

  const activeEmbassies = useMemo(() => {
    const directEmbassies = Array.isArray(countryDetail?.embassies) ? countryDetail.embassies : [];
    const removedEmbassies = Array.isArray(countryDetail?.removedEmbassies) ? countryDetail.removedEmbassies : [];
    const removedTradePartners = Array.isArray(countryDetail?.removedTradePartners) ? countryDetail.removedTradePartners : [];
    const dbEmbassies = getEmbassiesForCountry(currentUserCountry);

    const customTrade = Array.isArray(countryDetail?.tradeAgreements) ? countryDetail.tradeAgreements : [];
    const tradeEmbassies = customTrade
      .filter((a: any) => {
        const norm = String(a.mitra || '').toLowerCase().trim();
        return !removedTradePartners.some((r: string) => String(r || '').toLowerCase().trim() === norm) &&
          !removedEmbassies.some((r: string) => String(r || '').toLowerCase().trim() === norm);
      })
      .map((a: any) => a.mitra);

    const set = new Set<string>();
    dbEmbassies.forEach((m: string) => set.add(String(m).toLowerCase().trim()));
    directEmbassies.forEach((e: any) => {
      const name = typeof e === 'string' ? e : (e.mitra || e.nama_negara);
      if (name) set.add(String(name).toLowerCase().trim());
    });
    tradeEmbassies.forEach((m: any) => {
      if (m) set.add(String(m).toLowerCase().trim());
    });

    removedEmbassies.forEach((r: string) => set.delete(String(r).toLowerCase().trim()));

    return set;
  }, [currentUserCountry, countryDetail?.embassies, countryDetail?.removedEmbassies, countryDetail?.removedTradePartners, countryDetail?.tradeAgreements]);

  const handleSelectCountry = (countryName: string, region: string) => {
    const normalizedTarget = countryName.toLowerCase().trim();
    const hasEmbassy = activeEmbassies.has(normalizedTarget);

    if (!hasEmbassy) {
      setNoEmbassyModalData({ countryName });
      return;
    }

    setConfirmModalData({ countryName, region });
  };

  const handleConfirmAddPartner = () => {
    if (!confirmModalData) return;
    onAddPartner(confirmModalData.countryName, confirmModalData.region);
    setConfirmModalData(null);
  };

  const filteredCountries = useMemo(() => {
    return COUNTRIES_DATA.filter((item) => {
      const nameLower = item.country.toLowerCase().trim();
      const isUserCountry = nameLower === currentUserCountry.toLowerCase().trim();
      const isAlreadyPartner = currentPartnerNames.has(nameLower);
      const matchesSearch = item.country.toLowerCase().includes(searchQuery.toLowerCase());
      return !isUserCountry && !isAlreadyPartner && matchesSearch;
    });
  }, [currentUserCountry, currentPartnerNames, searchQuery]);

  const groupedByContinent = useMemo(() => {
    const groups: Record<string, typeof COUNTRIES_DATA> = {};
    filteredCountries.forEach((item) => {
      const continent = item.continent || 'Lainnya';
      if (!groups[continent]) {
        groups[continent] = [];
      }
      groups[continent].push(item);
    });
    return groups;
  }, [filteredCountries]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[70] flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none">
        <div className="bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans pointer-events-auto">
          {/* HEADER */}
          <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-[#00FFAA]/20 flex items-center justify-between bg-[#0A1A1A] relative z-10 gap-2 shrink-0 rounded-t-2xl">
            <div className="flex-1">
              <h2 className="text-base sm:text-xl font-bold text-[#00FFAA] tracking-tight leading-none uppercase">Tambah Mitra Dagang Baru</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 lg:p-2 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] text-[#6B8A8A] hover:text-[#00FFAA] hover:border-[#00FFAA] transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1 shadow-sm"
            >
              <span className="text-[10px] lg:text-xs font-semibold uppercase tracking-widest pl-1">Batal</span>
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* BAR PENCARIAN */}
          <div className="px-4 sm:px-6 py-3 bg-[#0A1A1A] border-b border-[#00FFAA]/20 relative z-10 shrink-0 flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B8A8A]" />
              <input
                type="text"
                placeholder="Cari nama negara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] text-sm font-semibold text-[#E0E0E0] placeholder-[#6B8A8A] focus:outline-none focus:border-[#00FFAA] transition-colors"
              />
            </div>
          </div>

          {/* BODY LIST NEGARA */}
          <div className="flex-1 overflow-y-auto p-8 bg-[#0F2424] relative z-10 neon-scrollbar">
            {Object.keys(groupedByContinent).length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-20 text-[#6B8A8A]">
                <Search className="h-12 w-12 mb-3 opacity-30 text-[#00FFAA] animate-pulse" />
                <p className="text-sm font-bold text-[#E0E0E0]">Tidak ada negara ditemukan</p>
                <p className="text-xs text-[#6B8A8A]">Coba masukkan kata kunci pencarian yang lain.</p>
              </div>
            ) : (
              <div className="space-y-10">
                {Object.entries(groupedByContinent).sort(([a], [b]) => a.localeCompare(b)).map(([continent, countries]) => (
                  <div key={continent} className="space-y-4">
                    <h3 className="text-sm font-black text-[#00FFAA] uppercase tracking-widest border-b border-[#00FFAA]/20 pb-2 flex items-center justify-between">
                      <span>🌍 Benua {continent}</span>
                      <span className="text-[10px] bg-[#00FFAA]/10 text-[#00FFAA] border border-[#00FFAA]/30 px-2 py-0.5 rounded-full font-bold">
                        {countries.length} Negara
                      </span>
                    </h3>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {countries.sort((a, b) => a.country.localeCompare(b.country)).map((item) => {
                        const hasEmbassy = activeEmbassies.has(item.country.toLowerCase().trim());
                        return (
                          <button
                            key={item.id}
                            onClick={() => handleSelectCountry(item.country, item.continent || 'Internasional')}
                            className={`p-4 rounded-xl flex items-center gap-3 transition-all cursor-pointer text-left w-full group relative ${hasEmbassy
                                ? 'bg-[#0A1A1A] hover:bg-[#00FFAA]/15 border-2 border-[#00FFAA] shadow-[0_0_10px_rgba(0,255,170,0.15)]'
                                : 'bg-[#0A1A1A] hover:bg-[#00FFAA]/5 border border-[#00FFAA]/20 hover:border-[#00FFAA]/50 opacity-80 hover:opacity-100'
                              }`}
                          >
                            {item.iso ? (
                              <div className="w-8 h-5 rounded-sm overflow-hidden border border-[#00FFAA]/30 flex-shrink-0 bg-[#0F2424] relative group-hover:scale-105 transition-transform">
                                <img
                                  src={`https://flagcdn.com/w80/${item.iso.toLowerCase()}.png`}
                                  alt={item.country}
                                  className="w-full h-full object-cover absolute inset-0"
                                />
                              </div>
                            ) : (
                              <div className="w-8 h-5 rounded-sm bg-[#0F2424] border border-[#00FFAA]/20 flex-shrink-0" />
                            )}
                            <div className="overflow-hidden">
                              <h4 className={`text-xs font-bold transition-colors uppercase truncate ${hasEmbassy ? 'text-[#00FFAA]' : 'text-[#E0E0E0] group-hover:text-[#00FFAA]'}`}>
                                {item.country}
                              </h4>
                              <p className="text-[9px] text-[#6B8A8A] font-semibold uppercase truncate">
                                {item.capital}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL GAGAL TAMBAH MITRA (KARENA TIDAK ADA KEDUBES) */}
      {noEmbassyModalData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-auto">
          <div className="bg-[#0F2424] border-2 border-rose-500/40 rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[940px] xl:max-w-[1040px] 2xl:max-w-5xl shadow-2xl flex flex-col font-sans pointer-events-auto relative space-y-0">
            <div className="px-6 sm:px-8 py-3.5 sm:py-4 border-b border-rose-500/20 flex items-center justify-between bg-[#0A1A1A] shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg border border-rose-500/30 bg-rose-950/40 text-rose-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h2 className="text-sm sm:text-base font-black tracking-wider uppercase text-rose-400">
                  Pemberitahuan / Peringatan
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setNoEmbassyModalData(null)}
                aria-label="Tutup modal"
                className="p-1.5 rounded-lg border border-rose-500/30 bg-rose-950/30 text-rose-400 hover:bg-rose-500 hover:text-white transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1"
              >
                <span className="text-[11px] font-bold uppercase tracking-wider pl-0.5">Tutup</span>
                <span aria-hidden="true" className="text-base leading-none">×</span>
              </button>
            </div>

            {/* Body Content */}
            <div className="flex-1 min-h-0 p-6 sm:p-8 overflow-y-auto neon-scrollbar">
              <h3 className="text-lg sm:text-xl font-black uppercase tracking-wide mb-3 text-rose-400">
                Gagal Menambahkan Mitra
              </h3>
              <div className="space-y-2 text-sm sm:text-base text-[#A0B0B0] leading-relaxed font-medium">
                <p>
                  Anda tidak dapat menjalin hubungan dagang dengan <strong className="text-white uppercase">{noEmbassyModalData.countryName}</strong> karena negara Anda belum memiliki <strong className="text-rose-400">Kedutaan Besar (Kedubes)</strong> yang aktif di sana.
                </p>
                <p className="text-xs text-[#6B8A8A]">
                  💡 Buka kantor Kedutaan Besar terlebih dahulu di menu <strong>Geopolitik → Kedutaan Besar</strong> sebelum mengajukan perjanjian perdagangan bilateral.
                </p>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="px-6 sm:px-8 py-3.5 sm:py-4 border-t border-rose-500/20 bg-[#0A1A1A] flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setNoEmbassyModalData(null)}
                className="min-w-28 px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider cursor-pointer transition-all bg-rose-500/20 border border-rose-500/50 text-rose-400 hover:bg-rose-500/30"
              >
                Paham
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI TAMBAH MITRA DAGANG */}
      {confirmModalData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-auto">
          <div className="bg-[#0F2424] border-2 border-[#00FFAA]/40 rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[940px] xl:max-w-[1040px] 2xl:max-w-5xl shadow-2xl flex flex-col font-sans pointer-events-auto relative space-y-0">
            <div className="px-6 sm:px-8 py-3.5 sm:py-4 border-b border-[#00FFAA]/20 flex items-center justify-between bg-[#0A1A1A] shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg border border-[#00FFAA]/30 bg-[#0F2424] text-[#00FFAA]">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-sm sm:text-base font-black tracking-wider uppercase text-[#00FFAA]">
                  Konfirmasi Perjanjian Dagang
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setConfirmModalData(null)}
                aria-label="Tutup modal"
                className="p-1.5 rounded-lg border border-[#00FFAA]/30 bg-[#0F2424] text-[#00FFAA] hover:bg-[#00FFAA] hover:text-[#0A1A1A] transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1"
              >
                <span className="text-[11px] font-bold uppercase tracking-wider pl-0.5">Tutup</span>
                <span aria-hidden="true" className="text-base leading-none">×</span>
              </button>
            </div>

            {/* Body Content */}
            <div className="flex-1 min-h-0 p-6 sm:p-8 overflow-y-auto neon-scrollbar">
              <h3 className="text-lg sm:text-xl font-black uppercase tracking-wide mb-3 text-[#E0E0E0]">
                Konfirmasi Perjanjian Dagang
              </h3>
              <div className="space-y-2 text-sm sm:text-base text-[#A0B0B0] leading-relaxed font-medium">
                <p>
                  Apakah Anda yakin ingin menjalin hubungan mitra dagang resmi dengan negara <strong className="text-[#00FFAA] uppercase">{confirmModalData.countryName}</strong>?
                </p>
                <p className="text-xs text-[#6B8A8A]">
                  🤝 Setelah bermitra, Anda dapat melakukan transaksi jual-beli komoditas strategis secara langsung dengan negara tersebut.
                </p>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="px-6 sm:px-8 py-3.5 sm:py-4 border-t border-[#00FFAA]/20 bg-[#0A1A1A] flex justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setConfirmModalData(null)}
                className="min-w-24 px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider cursor-pointer transition-all bg-[#0F2424] border border-[#00FFAA]/30 text-[#00FFAA] hover:bg-[#00FFAA] hover:text-[#0A1A1A]"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmAddPartner}
                className="min-w-28 px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider cursor-pointer transition-all bg-[#00FFAA] text-[#0A1A1A] hover:bg-[#00FFAA]/80 shadow-[0_0_15px_rgba(0,255,170,0.3)]"
              >
                Setuju & Tambahkan
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}