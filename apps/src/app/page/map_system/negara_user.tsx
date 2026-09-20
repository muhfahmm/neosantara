'use client';

import React from 'react';
import { X, User, Globe, Building2, Users, Landmark, ShieldCheck, Info } from 'lucide-react';

import { calculateCountryGDP } from '@/app/logic/economic_logic/treasuryUpdater';

interface NegaraUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCountry?: {
    country?: string;
    capital?: string;
    iso?: string;
  } | null;
  countryDetail?: any;
}

export default function NegaraUserModal({ isOpen, onClose, selectedCountry, countryDetail }: NegaraUserModalProps) {
  if (!isOpen) return null;

  const countryName = selectedCountry?.country || '—';
  const capital = selectedCountry?.capital || countryDetail?.ibukota || '—';
  const iso = (selectedCountry?.iso || '').toLowerCase();
  const population = countryDetail?.populasi;
  const gdp = calculateCountryGDP(countryDetail) || countryDetail?.pdb;
  const ideology = countryDetail?.ideologi || '—';
  const religion = countryDetail?.agama_utama || '—';

  const formatNumber = (n: number | undefined) => {
    if (n == null) return '—';
    if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)} M`;
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)} Jt`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)} Rb`;
    return n.toLocaleString('id-ID');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none">
      <div className="bg-[#FAF6EE] border-2 sm:border-3 border-[#C4B49C] rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans pointer-events-auto shadow-2xl">
        
        {/* Background Texture */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,0,0,0.03)_0%,transparent_100%)] pointer-events-none" />

        {/* HEADER */}
        <div className="px-6 sm:px-8 py-4 sm:py-5 border-b-2 border-[#C4B49C]/30 flex items-center justify-between bg-[#FAF6EE] relative z-10 shrink-0">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-3">
              {/* Flag */}
              {iso && (
                <div className="w-10 h-7 rounded overflow-hidden border-2 border-[#C4B49C]/60 shadow-md flex-shrink-0 bg-[#e4dac3]">
                  <img
                    src={`https://flagcdn.com/w80/${iso}.png`}
                    alt={countryName}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                </div>
              )}
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl sm:text-2xl font-bold text-[#5c3c10] tracking-tight leading-none uppercase">
                    {countryName}
                  </h2>
                  <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[9px] font-black uppercase tracking-wider shadow-sm">
                    <User className="w-2.5 h-2.5" />
                    NEGARA ANDA
                  </span>
                </div>
                <p className="text-xs text-[#8b7e66] font-semibold mt-1">Detail Negara Anda Sendiri</p>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 sm:p-2.5 rounded-xl border-2 border-[#C4B49C] bg-transparent text-[#8b7e66] hover:text-[#5c3c10] hover:bg-black/5 active:bg-black/10 transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1.5 shadow-sm"
          >
            <span className="text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* BODY CONTENT */}
        <div className="flex-1 min-h-0 overflow-y-auto p-6 sm:p-8 bg-[#FAF6EE]/40 relative z-10 no-scrollbar">
          <div className="max-w-4xl mx-auto space-y-6">
            
            {/* PROTOTYPE BANNER */}
            <div className="flex items-start gap-3 px-5 py-4 rounded-xl bg-amber-50 border border-amber-300/60 shadow-sm">
              <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-700 font-semibold leading-relaxed">
                <span className="font-black text-amber-800 uppercase">PROTOTIPE</span> — Halaman ini masih dalam tahap pengembangan.
                Tampilan lengkap profil negara Anda akan segera tersedia.
              </p>
            </div>

            {/* STATS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Ibukota */}
              <div className="flex items-center gap-3 bg-white/70 border border-[#C4B49C]/30 rounded-xl p-4 shadow-sm">
                <div className="p-2 rounded-lg bg-[#5c3c10]/10 border border-[#5c3c10]/15">
                  <Landmark className="w-5 h-5 text-[#5c3c10]" />
                </div>
                <div>
                  <p className="text-[9px] font-black text-[#8b7e66] uppercase tracking-widest">Ibukota</p>
                  <p className="text-base font-black text-[#5c3c10] mt-0.5">{capital}</p>
                </div>
              </div>

              {/* Populasi */}
              <div className="flex items-center gap-3 bg-white/70 border border-[#C4B49C]/30 rounded-xl p-4 shadow-sm">
                <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/15">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-[9px] font-black text-[#8b7e66] uppercase tracking-widest">Populasi</p>
                  <p className="text-base font-black text-[#5c3c10] mt-0.5">{formatNumber(population)}</p>
                </div>
              </div>

              {/* PDB */}
              <div className="flex items-center gap-3 bg-white/70 border border-[#C4B49C]/30 rounded-xl p-4 shadow-sm">
                <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/15">
                  <Building2 className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-[9px] font-black text-[#8b7e66] uppercase tracking-widest">PDB</p>
                  <p className="text-base font-black text-[#5c3c10] mt-0.5">{formatNumber(gdp)}</p>
                </div>
              </div>

              {/* Ideologi */}
              <div className="flex items-center gap-3 bg-white/70 border border-[#C4B49C]/30 rounded-xl p-4 shadow-sm">
                <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/15">
                  <Globe className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-[9px] font-black text-[#8b7e66] uppercase tracking-widest">Ideologi</p>
                  <p className="text-base font-black text-[#5c3c10] mt-0.5">{ideology}</p>
                </div>
              </div>

              {/* Agama - Mengambil lebar penuh */}
              <div className="col-span-1 md:col-span-2 flex items-center gap-3 bg-white/70 border border-[#C4B49C]/30 rounded-xl p-4 shadow-sm">
                <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/15">
                  <ShieldCheck className="w-5 h-5 text-rose-500" />
                </div>
                <div>
                  <p className="text-[9px] font-black text-[#8b7e66] uppercase tracking-widest">Agama Utama</p>
                  <p className="text-base font-black text-[#5c3c10] mt-0.5">{religion}</p>
                </div>
              </div>
            </div>

            {/* FOOTER NOTE */}
            <div className="text-center text-[10px] text-[#C4B49C] font-semibold tracking-wider uppercase pt-2 border-t border-[#C4B49C]/20">
              Ini adalah negara yang sedang Anda pimpin
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}