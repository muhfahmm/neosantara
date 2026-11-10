'use client';

import SharedModalCloseButton from '@/app/page/root_modals_design_menu/ModalCloseButton';
import React from 'react';
import { User, Globe, Building2, Users, Landmark, ShieldCheck, TrendingUp } from 'lucide-react';

import { calculateCountryGDP, formatCurrencyEM } from '@/app/logic/economic_logic/treasuryUpdater';
import { calculateNetBalanceWithEconomicEmbargo } from '@/app/page/navigasi_menu/2_navigasi_bawah/7_geopolitik/1_PBB/1_resolusi_PBB/logic/3_economicEmbargoLogic';
import { calculateCountryNetPopulation } from '@/app/logic/populations_logic/population_logic';

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
  const netPopulationChange = calculateCountryNetPopulation(countryDetail);

  const anggaran = Number(countryDetail?.anggaran) || 0;
  const gdp = calculateCountryGDP(countryDetail) || Number(countryDetail?.pdb) || 500_000;
  const netBalance = calculateNetBalanceWithEconomicEmbargo(countryDetail, selectedCountry?.country);
  const netBalanceLabel = `${netBalance >= 0 ? '+ ' : '- '}${Math.abs(netBalance).toLocaleString('id-ID', { maximumFractionDigits: 2 })}`;

  const ideology = countryDetail?.ideology || countryDetail?.ideologi || '—';
  const religion = countryDetail?.religion || countryDetail?.agama_utama || countryDetail?.agama || '—';

  const formatNumber = (n: number | undefined) => {
    if (n == null || n === 0) return '—';
    return n.toLocaleString('id-ID', { maximumFractionDigits: 2 });
  };

  return (
    <div
      style={{
        paddingTop: 'var(--modal-top-offset)',
        paddingBottom: 'var(--modal-bottom-offset)',
        paddingLeft: 'var(--modal-side-offset)',
        paddingRight: 'var(--modal-side-offset)',
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-transparent pointer-events-none"
    >
      <div className="modal-responsive-shell bg-root-surface border border-root-accent/30 rounded-2xl overflow-hidden flex flex-col relative font-sans pointer-events-auto shadow-2xl">

        {/* Background Texture */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,255,170,0.03)_0%,transparent_100%)] pointer-events-none" />

        {/* HEADER */}
        <div className="px-3 sm:px-6 py-3 sm:py-5 border-b border-root-accent/20 flex items-center justify-between gap-2 bg-root-canvas relative z-10 shrink-0">
          <div className="flex min-w-0 items-center gap-2 sm:gap-4">
            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
              {/* Flag */}
              {iso && (
                <div className="w-8 sm:w-10 h-6 sm:h-7 rounded overflow-hidden border border-root-accent/30 shadow-md flex-shrink-0 bg-root-canvas">
                  <img
                    src={`https://flagcdn.com/w80/${iso}.png`}
                    alt={countryName}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                </div>
              )}
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-3">
                  <h2 className="text-base sm:text-2xl font-bold text-root-accent tracking-tight leading-tight uppercase break-words">
                    {countryName}
                  </h2>
                  <span className="flex shrink-0 items-center gap-1 px-2 sm:px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[8px] sm:text-[9px] font-black uppercase tracking-wider shadow-sm">
                    <User className="w-2.5 h-2.5" />
                    NEGARA ANDA
                  </span>
                </div>
                <p className="text-[10px] sm:text-xs text-root-subtle font-semibold mt-1">Detail Negara Anda Sendiri</p>
              </div>
            </div>
          </div>

          <SharedModalCloseButton
            onClick={onClose}
          />
        </div>

        {/* BODY CONTENT */}
        <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-5 md:p-8 bg-root-surface relative z-10 no-scrollbar">
          <div className="w-full max-w-4xl mx-auto space-y-4 sm:space-y-6">

            {/* STATS GRID */}
            <div className="grid grid-cols-3 lg:grid-cols-2 gap-2 sm:gap-4">
              {/* Ibukota */}
              <div className="flex min-w-0 flex-col items-start gap-1.5 md:flex-row md:items-center md:gap-2 sm:gap-3 bg-root-canvas border border-root-accent/20 rounded-xl p-2 md:p-3 sm:p-4 shadow-sm">
                <div className="shrink-0 p-1 md:p-1.5 sm:p-2 rounded-lg bg-root-accent/10 border border-root-accent/20">
                  <Landmark className="w-3.5 h-3.5 md:w-4 md:h-4 sm:w-5 sm:h-5 text-root-accent" />
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] font-black text-root-subtle uppercase tracking-widest">Ibukota</p>
                  <p className="text-xs md:text-sm sm:text-base font-black text-root-text mt-0.5 break-words">{capital}</p>
                </div>
              </div>

              {/* Populasi */}
              <div className="flex min-w-0 flex-col items-start gap-1.5 md:flex-row md:items-center md:gap-2 sm:gap-3 bg-root-canvas border border-root-accent/20 rounded-xl p-2 md:p-3 sm:p-4 shadow-sm">
                <div className="shrink-0 p-1 md:p-1.5 sm:p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <Users className="w-3.5 h-3.5 md:w-4 md:h-4 sm:w-5 sm:h-5 text-blue-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] font-black text-root-subtle uppercase tracking-widest">Populasi</p>
                  <p className="mt-0.5 flex flex-wrap items-center gap-x-1 text-[10px] md:text-sm sm:text-base font-black text-root-text">
                    <span className="break-words">{formatNumber(population)}</span>
                    <span className={`${netPopulationChange >= 0 ? 'text-emerald-400' : 'text-rose-400'} text-[9px] md:text-[10px] sm:text-xs font-black`}>
                      ({netPopulationChange >= 0 ? `+${netPopulationChange.toLocaleString('id-ID', { maximumFractionDigits: 2 })}` : netPopulationChange.toLocaleString('id-ID', { maximumFractionDigits: 2 })})
                    </span>
                  </p>
                </div>
              </div>

              {/* Kas Negara */}
              <div className="flex min-w-0 flex-col items-start gap-1.5 md:flex-row md:items-center md:gap-2 sm:gap-3 bg-root-canvas border border-root-accent/20 rounded-xl p-2 md:p-3 sm:p-4 shadow-sm">
                <div className="shrink-0 p-1 md:p-1.5 sm:p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <Building2 className="w-3.5 h-3.5 md:w-4 md:h-4 sm:w-5 sm:h-5 text-emerald-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] font-black text-root-subtle uppercase tracking-widest">Kas Negara</p>
                  <p className="mt-0.5 flex flex-wrap items-center gap-x-1 text-[10px] md:text-sm sm:text-base font-black text-root-text">
                    <span className={`break-words ${anggaran < 0 ? 'text-rose-400 font-black' : ''}`}>{formatCurrencyEM(anggaran)}</span>
                    <span className={`${netBalance >= 0 ? 'text-root-accent' : 'text-rose-400'} text-[9px] md:text-[10px] sm:text-xs font-black`}>
                      ({netBalanceLabel})
                    </span>
                  </p>
                </div>
              </div>

              {/* Ideologi */}
              <div className="flex min-w-0 flex-col items-start gap-1.5 md:flex-row md:items-center md:gap-2 sm:gap-3 bg-root-canvas border border-root-accent/20 rounded-xl p-2 md:p-3 sm:p-4 shadow-sm">
                <div className="shrink-0 p-1 md:p-1.5 sm:p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
                  <Globe className="w-3.5 h-3.5 md:w-4 md:h-4 sm:w-5 sm:h-5 text-purple-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] font-black text-root-subtle uppercase tracking-widest">Ideologi</p>
                  <p className="text-xs md:text-sm sm:text-base font-black text-root-text mt-0.5 break-words">{ideology}</p>
                </div>
              </div>

              {/* Agama - Mengambil lebar penuh */}
              <div className="flex min-w-0 flex-col items-start gap-1.5 lg:flex-row lg:items-center lg:gap-2 sm:gap-3 bg-root-canvas border border-root-accent/20 rounded-xl p-2 lg:p-3 sm:p-4 shadow-sm">
                <div className="shrink-0 p-1 md:p-1.5 sm:p-2 rounded-lg bg-rose-500/10 border border-rose-500/20">
                  <ShieldCheck className="w-3.5 h-3.5 md:w-4 md:h-4 sm:w-5 sm:h-5 text-rose-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] font-black text-root-subtle uppercase tracking-widest">Agama Utama</p>
                  <p className="text-xs md:text-sm sm:text-base font-black text-root-text mt-0.5 break-words">{religion}</p>
                </div>
              </div>

              {/* PDB */}
              <div className="flex min-w-0 flex-col items-start gap-1.5 lg:flex-row lg:items-center lg:gap-2 sm:gap-3 bg-root-canvas border border-root-accent/20 rounded-xl p-2 lg:p-3 sm:p-4 shadow-sm">
                <div className="shrink-0 p-1 md:p-1.5 sm:p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <TrendingUp className="w-3.5 h-3.5 md:w-4 md:h-4 sm:w-5 sm:h-5 text-amber-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] font-black text-root-subtle uppercase tracking-widest">PDB Harian</p>
                  <p className="text-xs md:text-sm sm:text-base font-black text-root-text mt-0.5 break-words">{formatCurrencyEM(gdp)}</p>
                </div>
              </div>
            </div>

            {/* FOOTER NOTE */}
            <div className="text-center text-[10px] text-root-subtle font-semibold tracking-wider uppercase pt-2 border-t border-root-accent/20">
              Ini adalah negara yang sedang Anda pimpin
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}