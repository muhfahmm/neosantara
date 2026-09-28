'use client';

import React from 'react';
import { X, User, Globe, Building2, Users, Landmark, ShieldCheck } from 'lucide-react';

import { calculateCountryGDP, calculateCountryNetBalance, formatCurrencyEM } from '@/app/logic/economic_logic/treasuryUpdater';

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

  const countryName = selectedCountry?.country || countryDetail?.nama_negara || '—';
  const capital = selectedCountry?.capital || countryDetail?.ibukota || '—';
  const iso = (selectedCountry?.iso || countryDetail?.iso || '').toLowerCase();
  
  const population = Number(
    countryDetail?.jumlah_penduduk ?? 
    countryDetail?.populasi ?? 
    countryDetail?.population ?? 
    countryDetail?.penduduk ?? 
    0
  );
  
  const anggaran = Number(countryDetail?.anggaran) || 0;
  const netBalance = calculateCountryNetBalance(countryDetail);
  const netBalanceLabel = `${netBalance >= 0 ? '+ ' : '- '}${Math.abs(netBalance).toLocaleString('id-ID')}`;

  const ideology = countryDetail?.ideology || countryDetail?.ideologi || '—';
  const religion = countryDetail?.religion || countryDetail?.agama_utama || countryDetail?.agama || '—';

  const formatNumber = (n: number | undefined) => {
    if (n == null || n === 0) return '—';
    return n.toLocaleString('id-ID');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none">
      <div className="bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans pointer-events-auto shadow-2xl">
        
        {/* Background Texture */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,255,170,0.03)_0%,transparent_100%)] pointer-events-none" />

        {/* HEADER */}
        <div className="px-6 sm:px-8 py-4 sm:py-5 border-b border-[#00FFAA]/20 flex items-center justify-between bg-[#0A1A1A] relative z-10 shrink-0">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-3">
              {/* Flag */}
              {iso && (
                <div className="w-10 h-7 rounded overflow-hidden border border-[#00FFAA]/30 shadow-md flex-shrink-0 bg-[#0A1A1A]">
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
                  <h2 className="text-xl sm:text-2xl font-bold text-[#00FFAA] tracking-tight leading-none uppercase">
                    {countryName}
                  </h2>
                  <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-black uppercase tracking-wider shadow-sm">
                    <User className="w-2.5 h-2.5" />
                    NEGARA ANDA
                  </span>
                </div>
                <p className="text-xs text-[#6B8A8A] font-semibold mt-1">Detail Negara Anda Sendiri</p>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 sm:p-2.5 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] text-[#6B8A8A] hover:text-[#00FFAA] hover:border-[#00FFAA] transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1.5 shadow-sm"
          >
            <span className="text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* BODY CONTENT */}
        <div className="flex-1 min-h-0 overflow-y-auto p-6 sm:p-8 bg-[#0F2424] relative z-10 no-scrollbar">
          <div className="max-w-4xl mx-auto space-y-6">
            
            {/* STATS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Ibukota */}
              <div className="flex items-center gap-3 bg-[#0A1A1A] border border-[#00FFAA]/20 rounded-xl p-4 shadow-sm">
                <div className="p-2 rounded-lg bg-[#00FFAA]/10 border border-[#00FFAA]/20">
                  <Landmark className="w-5 h-5 text-[#00FFAA]" />
                </div>
                <div>
                  <p className="text-[9px] font-black text-[#6B8A8A] uppercase tracking-widest">Ibukota</p>
                  <p className="text-base font-black text-[#E0E0E0] mt-0.5">{capital}</p>
                </div>
              </div>

              {/* Populasi */}
              <div className="flex items-center gap-3 bg-[#0A1A1A] border border-[#00FFAA]/20 rounded-xl p-4 shadow-sm">
                <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <Users className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-[9px] font-black text-[#6B8A8A] uppercase tracking-widest">Populasi</p>
                  <p className="text-base font-black text-[#E0E0E0] mt-0.5">{formatNumber(population)}</p>
                </div>
              </div>

              {/* Kas Negara */}
              <div className="flex items-center gap-3 bg-[#0A1A1A] border border-[#00FFAA]/20 rounded-xl p-4 shadow-sm">
                <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <Building2 className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-[9px] font-black text-[#6B8A8A] uppercase tracking-widest">Kas Negara</p>
                  <p className="text-base font-black text-[#E0E0E0] mt-0.5 flex items-center gap-2">
                    <span className={anggaran < 0 ? 'text-rose-400 font-black' : ''}>{formatCurrencyEM(anggaran)}</span>
                    <span className={`${netBalance >= 0 ? 'text-[#00FFAA]' : 'text-rose-400'} text-xs font-black`}>
                      ({netBalanceLabel})
                    </span>
                  </p>
                </div>
              </div>

              {/* Ideologi */}
              <div className="flex items-center gap-3 bg-[#0A1A1A] border border-[#00FFAA]/20 rounded-xl p-4 shadow-sm">
                <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
                  <Globe className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-[9px] font-black text-[#6B8A8A] uppercase tracking-widest">Ideologi</p>
                  <p className="text-base font-black text-[#E0E0E0] mt-0.5">{ideology}</p>
                </div>
              </div>

              {/* Agama - Mengambil lebar penuh */}
              <div className="col-span-1 md:col-span-2 flex items-center gap-3 bg-[#0A1A1A] border border-[#00FFAA]/20 rounded-xl p-4 shadow-sm">
                <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20">
                  <ShieldCheck className="w-5 h-5 text-rose-400" />
                </div>
                <div>
                  <p className="text-[9px] font-black text-[#6B8A8A] uppercase tracking-widest">Agama Utama</p>
                  <p className="text-base font-black text-[#E0E0E0] mt-0.5">{religion}</p>
                </div>
              </div>
            </div>

            {/* FOOTER NOTE */}
            <div className="text-center text-[10px] text-[#6B8A8A] font-semibold tracking-wider uppercase pt-2 border-t border-[#00FFAA]/20">
              Ini adalah negara yang sedang Anda pimpin
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}