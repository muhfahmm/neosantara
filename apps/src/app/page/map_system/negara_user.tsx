'use client';

import SharedModalCloseButton from '@/app/page/root_modals_design_menu/ModalCloseButton';
import React, { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { User, Globe, Building2, Users, Landmark, ShieldCheck, TrendingUp, Star, Flag, Swords, X } from 'lucide-react';

import { calculateCountryGDP, formatCurrencyEM } from '@/app/logic/economic_logic/treasuryUpdater';
import { calculateNetBalanceWithEconomicEmbargo } from '@/app/page/navigasi_menu/2_navigasi_bawah/7_geopolitik/1_PBB/1_resolusi_PBB/logic/3_economicEmbargoLogic';
import { calculateCountryNetPopulation } from '@/app/logic/populations_logic/population_logic';
import { getArmadaPowerSummary } from '@/app/page/navigasi_menu/2_navigasi_bawah/6_pertahanan/4_armada/logic/armadaLogic';
import NotebookModalWrapper from '@/app/page/navigasi_menu/2_navigasi_bawah/NotebookModalWrapper';
import {
  getCountryProfileSummaries,
  loadCountryProfileSummaries,
  subscribeToCountryProfileSummaries,
} from '@/lib/countryProfileSummaryRegistry';
import {
  computeNationInfluence,
  getMilitaryPowerCardTotals,
  type AnnexedCountryStore,
  type VictoryCount,
} from './nationInfluenceLogic';

interface NegaraUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCountry?: {
    country?: string;
    capital?: string;
    iso?: string;
  } | null;
  countryDetail?: Record<string, unknown> | null;
}

function subscribeToTerritoryChanges(onChange: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('map_territory_color_updated', onChange);
  return () => window.removeEventListener('map_territory_color_updated', onChange);
}

function getAnnexedCountriesSnapshot(): string {
  if (typeof window === 'undefined') return '{}';
  const store = (window as Window & {
    neosantara_annexed_countries?: AnnexedCountryStore;
  }).neosantara_annexed_countries || {};
  return JSON.stringify(store);
}

function getDetailString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

export default function NegaraUserModal({ isOpen, onClose, selectedCountry, countryDetail }: NegaraUserModalProps) {
  const countrySummaries = useSyncExternalStore(
    subscribeToCountryProfileSummaries,
    getCountryProfileSummaries,
    getCountryProfileSummaries
  );
  const annexedCountriesJson = useSyncExternalStore(
    subscribeToTerritoryChanges,
    getAnnexedCountriesSnapshot,
    () => '{}'
  );
  const annexedCountries = useMemo(
    () => JSON.parse(annexedCountriesJson) as AnnexedCountryStore,
    [annexedCountriesJson]
  );
  const [isSummaryLoading, setIsSummaryLoading] = useState(
    () => getCountryProfileSummaries().length === 0
  );
  const [summaryError, setSummaryError] = useState('');

  useEffect(() => {
    if (!isOpen || countrySummaries.length > 0) return;
    let active = true;
    loadCountryProfileSummaries()
      .then(() => {
        if (!active) return;
        setIsSummaryLoading(false);
        setSummaryError('');
      })
      .catch(error => {
        if (!active || getCountryProfileSummaries().length > 0) return;
        console.error('Failed to load country profile summaries in country modal:', error);
        setSummaryError(error instanceof Error ? error.message : String(error));
        setIsSummaryLoading(false);
      });

    return () => {
      active = false;
    };
  }, [isOpen, countrySummaries.length]);

  const countryName = selectedCountry?.country || getDetailString(countryDetail?.nama_negara) || '—';
  const capital = selectedCountry?.capital || getDetailString(countryDetail?.ibukota) || '—';
  const iso = (selectedCountry?.iso || getDetailString(countryDetail?.iso)).toLowerCase();

  const population = Number(
    countryDetail?.jumlah_penduduk ??
    countryDetail?.populasi ??
    countryDetail?.population ??
    countryDetail?.penduduk ??
    0
  );
  const netPopulationChange = calculateCountryNetPopulation({
    ...(countryDetail || {}),
    jumlah_penduduk: population,
  });

  const anggaran = Number(countryDetail?.anggaran) || 0;
  const gdp = calculateCountryGDP(countryDetail) || Number(countryDetail?.pdb) || 500_000;
  const netBalance = calculateNetBalanceWithEconomicEmbargo(countryDetail || {}, selectedCountry?.country);
  const netBalanceLabel = `${netBalance >= 0 ? '+ ' : '- '}${Math.abs(netBalance).toLocaleString('id-ID', { maximumFractionDigits: 2 })}`;

  const ideology = getDetailString(countryDetail?.ideology) ||
    getDetailString(countryDetail?.ideologi) || '—';
  const religion = getDetailString(countryDetail?.religion) ||
    getDetailString(countryDetail?.agama_utama) ||
    getDetailString(countryDetail?.agama) || '—';
  const playerInfluenceData = useMemo(() => ({
    country_slug: getDetailString(countryDetail?.country_slug),
    country: selectedCountry?.country || getDetailString(countryDetail?.nama_negara) ||
      getDetailString(countryDetail?.country),
    name_id: getDetailString(countryDetail?.nama_negara),
    name_en: getDetailString(countryDetail?.name_en),
    religion,
    ideology,
  }), [
    countryDetail?.country_slug,
    countryDetail?.nama_negara,
    countryDetail?.country,
    countryDetail?.name_en,
    selectedCountry?.country,
    religion,
    ideology,
  ]);
  const influence = useMemo(
    () => computeNationInfluence(playerInfluenceData, countrySummaries, annexedCountries),
    [playerInfluenceData, countrySummaries, annexedCountries]
  );
  const militaryPower = useMemo(
    () => getMilitaryPowerCardTotals(getArmadaPowerSummary(countryDetail)),
    [countryDetail]
  );
  const formatNumber = (n: number | undefined) => {
    if (n == null || n === 0) return '—';
    return n.toLocaleString('id-ID', { maximumFractionDigits: 2 });
  };

  const renderVictoryCard = (
    title: string,
    Icon: typeof Star,
    result: VictoryCount
  ) => (
    <div className="flex min-w-0 flex-col gap-2 rounded-xl border border-root-accent/20 bg-root-canvas p-2 shadow-sm sm:p-4">
      <div className="flex min-w-0 items-center gap-2">
        <div className="shrink-0 rounded-lg border border-root-accent/20 bg-root-accent/10 p-1.5">
          <Icon className="h-4 w-4 text-root-accent sm:h-5 sm:w-5" />
        </div>
        <p className="min-w-0 text-[9px] font-black uppercase tracking-widest text-root-subtle">{title}</p>
      </div>
      <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
        <span className="text-sm font-black text-root-text sm:text-lg">
          {countrySummaries.length === 0 && isSummaryLoading ? '...' : `${result.same} / ${result.total}`}
        </span>
        <span className="text-xs font-black" style={{ color: '#00FFAA' }}>
          {countrySummaries.length === 0 && isSummaryLoading ? '...' : `${result.percent.toFixed(1)}%`}
        </span>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-root-accent/10">
        <div
          className="h-full rounded-full transition-[width] duration-300"
          style={{
            width: countrySummaries.length === 0 && isSummaryLoading ? '35%' : `${result.percent}%`,
            backgroundColor: '#00FFAA',
            opacity: countrySummaries.length === 0 && isSummaryLoading ? 0.45 : 1,
          }}
        />
      </div>
      {summaryError && countrySummaries.length === 0 && (
        <p className="text-[9px] text-rose-400" role="status">
          Gagal memuat data negara: {summaryError}
        </p>
      )}
    </div>
  );

  if (!isOpen) return null;

  return (
    <NotebookModalWrapper
      onClose={onClose}
      zIndexClass="z-50"
      frameClassName="country-detail-modal-frame"
    >
      <div
        className="country-user-modal-panel bg-root-surface border-none rounded-none overflow-hidden w-full h-full max-h-full flex flex-col relative font-sans pointer-events-auto shadow-none"
      >

        {/* Background Texture */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,255,170,0.03)_0%,transparent_100%)] pointer-events-none" />

        {/* HEADER */}
        <div className="country-detail-modal-header px-3 sm:px-8 py-2 sm:py-4 border-b border-root-accent/20 flex items-center justify-between bg-root-canvas relative z-10 shrink-0">
          <div className="flex min-w-0 items-center gap-2 sm:gap-4">
            {iso && iso.length === 2 && (
                <div className="relative flex h-3.5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-sm border border-root-accent/30 bg-root-canvas shadow-sm sm:h-5 sm:w-8">
                  <img
                    src={`https://flagcdn.com/w80/${iso}.png`}
                    alt={countryName}
                    className="absolute inset-0 h-full w-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                </div>
              )}
            <div className="min-w-0">
                <div className="mt-0.5 flex flex-wrap items-center gap-1 sm:mt-1 sm:gap-2">
                  <p className="text-[10px] font-black uppercase tracking-tight text-root-accent sm:text-xs">
                    {countryName}
                  </p>
                  <span className="flex shrink-0 items-center gap-1 px-2 sm:px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[8px] sm:text-[9px] font-black uppercase tracking-wider shadow-sm">
                    <User className="w-2.5 h-2.5" />
                    NEGARA ANDA
                  </span>
                </div>
                <p className="text-[10px] font-semibold text-root-subtle sm:text-xs">Detail Negara Anda Sendiri</p>
              </div>
          </div>

          <SharedModalCloseButton
            onClick={onClose}
            className="country-detail-close-button p-1 sm:p-2 rounded-lg sm:rounded-xl border border-root-accent/30 bg-root-surface text-root-accent hover:bg-root-accent hover:text-root-canvas transition-all cursor-pointer font-bold text-[10px] sm:text-xs uppercase flex items-center gap-1 sm:gap-1.5"
            appearance="custom"
          >
            <span className="text-[10px] font-semibold uppercase tracking-widest pl-0.5 sm:pl-1 sm:text-xs">Tutup</span>
            <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </SharedModalCloseButton>
        </div>

        {/* BODY CONTENT */}
        <div className="country-detail-modal-body flex-1 min-h-0 overflow-y-auto p-3 sm:p-5 md:p-8 bg-root-surface relative z-10 no-scrollbar">
          <div className="country-user-modal-content w-full max-w-4xl mx-auto space-y-4 sm:space-y-6">

            {/* STATS GRID */}
            <div className="country-user-stats-grid grid grid-cols-3 gap-2 sm:gap-4">
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

              {renderVictoryCard('Kemenangan Agama', Star, influence.faith)}
              {renderVictoryCard('Kemenangan Ideologi', Flag, influence.ideology)}

              <div className="flex min-w-0 flex-col gap-2 rounded-xl border border-root-accent/20 bg-root-canvas p-2 shadow-sm sm:p-4">
                <div className="flex min-w-0 items-center gap-2">
                  <div className="shrink-0 rounded-lg border border-rose-500/20 bg-rose-500/10 p-1.5">
                    <Swords className="h-4 w-4 text-rose-400 sm:h-5 sm:w-5" />
                  </div>
                  <p className="min-w-0 text-[9px] font-black uppercase tracking-widest text-root-subtle">
                    Total Kekuatan Militer (Power)
                  </p>
                </div>
                <p className="text-sm font-black text-root-text sm:text-lg">
                  {militaryPower.totalPower.toLocaleString('id-ID', { maximumFractionDigits: 2 })}
                </p>
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-[9px] font-bold text-root-subtle sm:text-[10px]">
                  <span>Darat {militaryPower.darat.toLocaleString('id-ID', { maximumFractionDigits: 2 })}</span>
                  <span>Laut {militaryPower.laut.toLocaleString('id-ID', { maximumFractionDigits: 2 })}</span>
                  <span>Udara {militaryPower.udara.toLocaleString('id-ID', { maximumFractionDigits: 2 })}</span>
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
    </NotebookModalWrapper>
  );
}