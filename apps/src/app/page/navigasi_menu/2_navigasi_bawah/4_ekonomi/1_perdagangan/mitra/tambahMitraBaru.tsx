'use client';

import React, { useMemo } from 'react';
import { X, Search } from 'lucide-react';
import { COUNTRIES_DATA } from '../../../../../map_system/map-data';

interface TambahMitraBaruProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserCountry: string; // Negara yang sedang digunakan user (tidak ditampilkan di daftar)
  partners: { nama_negara: string }[]; // Mitra saat ini (tidak bisa ditambahkan lagi)
  onAddPartner: (countryName: string, region: string) => void;
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
}: TambahMitraBaruProps) {
  const [searchQuery, setSearchQuery] = React.useState('');

  const currentPartnerNames = useMemo(() => {
    return new Set(partners.map((p) => p.nama_negara.toLowerCase().trim()));
  }, [partners]);

  // Filter 207 negara dari map-data (kecuali negara user dan yang sudah jadi mitra)
  const filteredCountries = useMemo(() => {
    return COUNTRIES_DATA.filter((item) => {
      const nameLower = item.country.toLowerCase().trim();
      const isUserCountry = nameLower === currentUserCountry.toLowerCase().trim();
      const isAlreadyPartner = currentPartnerNames.has(nameLower);
      const matchesSearch = item.country.toLowerCase().includes(searchQuery.toLowerCase());
      return !isUserCountry && !isAlreadyPartner && matchesSearch;
    });
  }, [currentUserCountry, currentPartnerNames, searchQuery]);

  // Kelompokkan berdasarkan benua
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
    <div className="fixed inset-0 z-[70] flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none">
      <div className="bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans pointer-events-auto">
        {/* HEADER */}
        <div className="px-8 py-6 border-b border-[#00FFAA]/20 flex items-center justify-between bg-[#0A1A1A] relative z-10 shrink-0">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-[#00FFAA] tracking-tight uppercase">Tambah Mitra Dagang Baru</h2>
            <p className="text-xs text-[#6B8A8A] font-semibold mt-1">
              Pilih negara di bawah ini untuk memulai hubungan kemitraan dagang bilateral
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] text-[#00FFAA] hover:bg-[#00FFAA] hover:text-[#0A1A1A] transition-all cursor-pointer font-black text-xs uppercase flex items-center gap-1.5"
          >
            <span className="text-[10px] font-black uppercase tracking-widest pl-1">Batal</span>
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* BAR PENCARIAN */}
        <div className="px-8 py-4 bg-[#0A1A1A] border-b border-[#00FFAA]/20 relative z-10 shrink-0 flex items-center gap-3">
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
        <div className="flex-1 overflow-y-auto p-8 bg-[#0F2424] relative z-10 no-scrollbar">
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
                  {/* Judul Benua */}
                  <h3 className="text-sm font-black text-[#00FFAA] uppercase tracking-widest border-b border-[#00FFAA]/20 pb-2 flex items-center justify-between">
                    <span>🌍 Benua {continent}</span>
                    <span className="text-[10px] bg-[#00FFAA]/10 text-[#00FFAA] border border-[#00FFAA]/30 px-2 py-0.5 rounded-full font-bold">
                      {countries.length} Negara
                    </span>
                  </h3>

                  {/* Grid Negara */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {countries.sort((a, b) => a.country.localeCompare(b.country)).map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          onAddPartner(item.country, item.continent || 'Internasional');
                        }}
                        className="bg-[#0A1A1A] hover:bg-[#00FFAA]/10 border border-[#00FFAA]/20 hover:border-[#00FFAA] p-4 rounded-xl flex items-center gap-3 transition-all cursor-pointer text-left w-full group"
                      >
                        {/* Flag Image Rendering */}
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
                          <h4 className="text-xs font-bold text-[#E0E0E0] group-hover:text-[#00FFAA] transition-colors uppercase truncate">
                            {item.country}
                          </h4>
                          <p className="text-[9px] text-[#6B8A8A] font-semibold uppercase truncate">
                            {item.capital}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}