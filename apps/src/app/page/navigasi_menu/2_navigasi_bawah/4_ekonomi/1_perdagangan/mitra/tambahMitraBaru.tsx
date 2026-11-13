'use client';

import React, { useMemo, useState } from 'react';
import { Search, Handshake, ShieldAlert, Check } from 'lucide-react';
import NotebookModalWrapper from '../../../NotebookModalWrapper';
import RootInfoModalHeader from "@/app/page/root_modals_design_menu/RootInfoModalHeader";
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
      <NotebookModalWrapper
        zIndexClass="z-[70]"
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-trade-partner-title"
          className="root-modal-util-b74379da23 min-w-0"
        >
          <RootInfoModalHeader
            title="Tambah Mitra Dagang Baru"
            titleId="add-trade-partner-title"
            onClose={onClose}
            size="standard"
            icon={<Handshake aria-hidden="true" />}
          />

          {/* BAR PENCARIAN */}
          <div className="px-4 sm:px-6 py-3 bg-root-canvas border-b border-root-accent/20 relative z-10 shrink-0 flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-root-subtle" />
              <input
                type="text"
                placeholder="Cari nama negara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-root-accent/30 bg-root-surface text-sm font-semibold text-root-text placeholder-root-subtle focus:outline-none focus:border-root-accent transition-colors"
              />
            </div>
          </div>

          {/* BODY LIST NEGARA */}
          <div className="flex-1 overflow-y-auto p-8 bg-root-surface relative z-10 neon-scrollbar">
            {Object.keys(groupedByContinent).length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-20 text-root-subtle">
                <Search className="h-12 w-12 mb-3 opacity-30 text-root-accent animate-pulse" />
                <p className="text-sm font-bold text-root-text">Tidak ada negara ditemukan</p>
                <p className="text-xs text-root-subtle">Coba masukkan kata kunci pencarian yang lain.</p>
              </div>
            ) : (
              <div className="space-y-10">
                {Object.entries(groupedByContinent).sort(([a], [b]) => a.localeCompare(b)).map(([continent, countries]) => (
                  <div key={continent} className="space-y-4">
                    <h3 className="text-sm font-black text-root-accent uppercase tracking-widest border-b border-root-accent/20 pb-2 flex items-center justify-between">
                      <span>🌍 Benua {continent}</span>
                      <span className="text-[10px] bg-root-accent/10 text-root-accent border border-root-accent/30 px-2 py-0.5 rounded-full font-bold">
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
                                ? 'bg-root-canvas hover:bg-root-accent/15 border-2 border-root-accent shadow-[0_0_10px_rgba(0,255,170,0.15)]'
                                : 'bg-root-canvas hover:bg-root-accent/5 border border-root-accent/20 hover:border-root-accent/50 opacity-80 hover:opacity-100'
                              }`}
                          >
                            {item.iso ? (
                              <div className="w-8 h-5 rounded-sm overflow-hidden border border-root-accent/30 flex-shrink-0 bg-root-surface relative group-hover:scale-105 transition-transform">
                                <img
                                  src={`https://flagcdn.com/w80/${item.iso.toLowerCase()}.png`}
                                  alt={item.country}
                                  className="w-full h-full object-cover absolute inset-0"
                                />
                              </div>
                            ) : (
                              <div className="w-8 h-5 rounded-sm bg-root-surface border border-root-accent/20 flex-shrink-0" />
                            )}
                            <div className="overflow-hidden">
                              <h4 className={`text-xs font-bold transition-colors uppercase truncate ${hasEmbassy ? 'text-root-accent' : 'text-root-text group-hover:text-root-accent'}`}>
                                {item.country}
                              </h4>
                              <p className="text-[9px] text-root-subtle font-semibold uppercase truncate">
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
      </NotebookModalWrapper>

      {/* MODAL GAGAL TAMBAH MITRA (KARENA TIDAK ADA KEDUBES) */}
      {noEmbassyModalData && (
        <NotebookModalWrapper
          zIndexClass="z-[100]"
          compact
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="no-embassy-title"
            className="overflow-hidden"
          >
            <RootInfoModalHeader
              title="Pemberitahuan / Peringatan"
              titleId="no-embassy-title"
              onClose={() => setNoEmbassyModalData(null)}
              size="standard"
              icon={<ShieldAlert aria-hidden="true" />}
            />

            {/* Body Content */}
            <div className="p-5 sm:p-6">
              <h3 className="text-lg sm:text-xl font-black uppercase tracking-wide mb-3 text-rose-400">
                Gagal Menambahkan Mitra
              </h3>
              <div className="space-y-2 text-sm sm:text-base text-[#A0B0B0] leading-relaxed font-medium">
                <p>
                  Anda tidak dapat menjalin hubungan dagang dengan <strong className="text-white uppercase">{noEmbassyModalData.countryName}</strong> karena negara Anda belum memiliki <strong className="text-rose-400">Kedutaan Besar (Kedubes)</strong> yang aktif di sana.
                </p>
                <p className="text-xs text-root-subtle">
                  💡 Buka kantor Kedutaan Besar terlebih dahulu di menu <strong>Geopolitik → Kedutaan Besar</strong> sebelum mengajukan perjanjian perdagangan bilateral.
                </p>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="px-6 sm:px-8 py-3.5 sm:py-4 border-t border-rose-500/20 bg-root-canvas flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setNoEmbassyModalData(null)}
                className="min-w-28 px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider cursor-pointer transition-all bg-rose-500/20 border border-rose-500/50 text-rose-400 hover:bg-rose-500/30"
              >
                Paham
              </button>
            </div>
          </section>
        </NotebookModalWrapper>
      )}

      {/* MODAL KONFIRMASI TAMBAH MITRA DAGANG */}
      {confirmModalData && (
        <NotebookModalWrapper
          zIndexClass="z-[100]"
          compact
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-add-trade-partner-title"
            className="overflow-hidden"
          >
            <RootInfoModalHeader
              title="Konfirmasi Perjanjian Dagang"
              titleId="confirm-add-trade-partner-title"
              onClose={() => setConfirmModalData(null)}
              size="standard"
              icon={<Check aria-hidden="true" />}
            />

            {/* Body Content */}
            <div className="p-5 sm:p-6">
              <h3 className="text-lg sm:text-xl font-black uppercase tracking-wide mb-3 text-root-text">
                Konfirmasi Perjanjian Dagang
              </h3>
              <div className="space-y-2 text-sm sm:text-base text-[#A0B0B0] leading-relaxed font-medium">
                <p>
                  Apakah Anda yakin ingin menjalin hubungan mitra dagang resmi dengan negara <strong className="text-root-accent uppercase">{confirmModalData.countryName}</strong>?
                </p>
                <p className="text-xs text-root-subtle">
                  🤝 Setelah bermitra, Anda dapat melakukan transaksi jual-beli komoditas strategis secara langsung dengan negara tersebut.
                </p>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="px-6 sm:px-8 py-3.5 sm:py-4 border-t border-root-accent/20 bg-root-canvas flex justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setConfirmModalData(null)}
                className="min-w-24 px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider cursor-pointer transition-all bg-root-surface border border-root-accent/30 text-root-accent hover:bg-root-accent hover:text-root-canvas"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmAddPartner}
                className="min-w-28 px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider cursor-pointer transition-all bg-root-accent text-root-canvas hover:bg-root-accent/80 shadow-[0_0_15px_rgba(0,255,170,0.3)]"
              >
                Setuju & Tambahkan
              </button>
            </div>
          </section>
        </NotebookModalWrapper>
      )}
    </>
  );
}