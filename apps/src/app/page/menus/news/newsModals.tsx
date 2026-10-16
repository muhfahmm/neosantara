'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { Newspaper, X, Swords, Flag, Coins, ShieldAlert, Sparkles, Filter } from 'lucide-react';
import { InvasionNewsData } from './logic/1_berita_invasi/beritaInvasiLogic';
import { AnnexationNewsData } from './logic/2_berita_aneksasi/beritaAneksasiLogic';
import { ResourceLootNewsData } from './logic/3_berita_pengambilan_sda/beritaPengambilanSDALogic';
import { DiplomacyNewsData } from './logic/4_diplomasi/diplomasiNewsLogic';
import { EconomyNewsData } from './logic/5_ekonomi_keuangan/ekonomiKeuanganNewsLogic';
import { MilitaryAchievementNewsData } from './logic/6_pencapaian_militer/pencapaianMiliterNewsLogic';
import { SecurityCouncilInvasionNews } from '@/app/page/navigasi_menu/2_navigasi_bawah/7_geopolitik/1_PBB/2_keamanan_PBB/logic/1_invasiMiliterGabunganLogic';
import type { AiNewsItem } from '@/app/logic/npc_ai_brain/core/aiNewsBridge';

export type NewsItemData =
  | InvasionNewsData
  | AnnexationNewsData
  | ResourceLootNewsData
  | DiplomacyNewsData
  | EconomyNewsData
  | MilitaryAchievementNewsData
  | SecurityCouncilInvasionNews
  | AiNewsItem;

type NewsCategory = 'semua' | 'diplomasi' | 'ekonomi_keuangan' | 'pencapaian_militer' | 'operasi_militer';
type NewsType = NewsItemData['type'];

interface TopRightNewsIconProps {
  onClick?: () => void;
  isOpen?: boolean;
  onClose?: () => void;
  newsList?: NewsItemData[];
  onClearNews?: () => void;
  onOpenAiConstruction?: (news: AiNewsItem) => void;
  onOpenNewsCountry?: (countryName: string) => void;
}

function isAiConstructionNews(item: NewsItemData): item is AiNewsItem {
  return (
    (item.type === "pembangunan_sipil" ||
      item.type === "ekspansi_militer" ||
      item.type === "pengadaan_armada" ||
      item.type === "kebijakan_negara") &&
    "countryName" in item &&
    Boolean(item.countryName)
  );
}

function getNewsCountryName(item: NewsItemData): string | undefined {
  if ('countryName' in item && typeof item.countryName === 'string' && item.countryName) {
    return item.countryName;
  }
  if ('targetCountry' in item && item.targetCountry) return item.targetCountry;
  if ('target' in item && typeof item.target?.name === 'string' && item.target.name) {
    return item.target.name;
  }
  if ('attackerCountry' in item && item.attackerCountry) return item.attackerCountry;
  return undefined;
}

export default function TopRightNewsIcon({
  onClick,
  isOpen,
  onClose,
  newsList = [],
  onClearNews,
  onOpenAiConstruction,
  onOpenNewsCountry,
}: TopRightNewsIconProps) {
  const [mounted, setMounted] = useState(false);
  const [filterCategory, setFilterCategory] = useState<NewsCategory>('semua');
  const [filterType, setFilterType] = useState<'semua' | NewsType>('semua');

  const [toastNews, setToastNews] = useState<NewsItemData | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [selectedOperationNews, setSelectedOperationNews] = useState<SecurityCouncilInvasionNews | null>(null);
  const dismissedToastIdRef = React.useRef<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Popup Toast Otomatis Muncul di Sebelah Kiri (Seperti Inbox) saat ada Berita Baru
  useEffect(() => {
    if (newsList.length > 0) {
      const latest = newsList[0];
      if (dismissedToastIdRef.current !== latest.id) {
        setToastNews(latest);
        setShowToast(true);
      }
    } else {
      setToastNews(null);
      setShowToast(false);
    }
  }, [newsList]);

  useEffect(() => {
    if (!showToast || !toastNews) return;

    const timer = window.setTimeout(() => {
      dismissedToastIdRef.current = toastNews.id;
      setShowToast(false);
    }, 3000);

    return () => window.clearTimeout(timer);
  }, [showToast, toastNews?.id]);

  const getCategory = (item: NewsItemData): Exclude<NewsCategory, 'semua'> => {
    if ('category' in item) return item.category;
    return 'operasi_militer';
  };

  const filteredNews = newsList.filter((item) => (
    (filterCategory === 'semua' || getCategory(item) === filterCategory) &&
    (filterType === 'semua' || item.type === filterType)
  ));

  const categoryTypes: Record<Exclude<NewsCategory, 'semua'>, NewsType[]> = {
    diplomasi: ['pakta_non_agresi', 'aliansi_pertahanan', 'perjanjian_dagang', 'kontrak_penelitian', 'sanksi_ekonomi', 'update_geopolitik'],
    ekonomi_keuangan: ['krisis_ekonomi', 'pajak_baru', 'kebijakan_negara', 'pembangunan_sipil', 'update_geopolitik'],
    pencapaian_militer: ['program_nuklir', 'ekspansi_militer', 'pengadaan_armada', 'update_geopolitik'],
    operasi_militer: ['invasi', 'invasi_gabungan_pbb', 'aneksasi', 'pengambilan_sda'],
  };

  const typeLabels: Record<NewsType, string> = {
    invasi: 'Invasi Militer',
    aneksasi: 'Aneksasi Wilayah',
    pengambilan_sda: 'Perampasan Aset & SDA',
    pakta_non_agresi: 'Pakta Non-Agresi',
    aliansi_pertahanan: 'Aliansi Pertahanan',
    perjanjian_dagang: 'Perjanjian Dagang',
    kontrak_penelitian: 'Kontrak Penelitian',
    sanksi_ekonomi: 'Sanksi Ekonomi',
    krisis_ekonomi: 'Krisis Ekonomi',
    pajak_baru: 'Pajak Baru',
    program_nuklir: 'Program Nuklir',
    invasi_gabungan_pbb: 'Invasi Gabungan PBB',
    kebijakan_negara: 'Penyesuaian Kebijakan Negara',
    pembangunan_sipil: 'Pembangunan Fasilitas Sipil',
    ekspansi_militer: 'Pembangunan Infrastruktur Militer',
    pengadaan_armada: 'Penambahan Unit Militer',
    update_geopolitik: 'Langkah Geopolitik AI',
  };

  const renderBadge = (type: NewsItemData['type']) => {
    switch (type) {
      case 'invasi':
        return (
          <span className="text-[10px] font-extrabold text-rose-400 bg-rose-500/15 px-2.5 py-0.5 rounded-full border border-rose-500/30 uppercase tracking-wider flex items-center gap-1">
            <Swords className="w-3 h-3 text-rose-400" />
            Invasi Militer
          </span>
        );
      case 'aneksasi':
        return (
          <span className="text-[10px] font-extrabold text-amber-400 bg-amber-500/15 px-2.5 py-0.5 rounded-full border border-amber-500/30 uppercase tracking-wider flex items-center gap-1">
            <Flag className="w-3 h-3 text-amber-400" />
            Aneksasi Wilayah
          </span>
        );
      case 'pengambilan_sda':
        return (
          <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/30 uppercase tracking-wider flex items-center gap-1">
            <Coins className="w-3 h-3 text-emerald-400" />
            Perampasan Aset & SDA
          </span>
        );
      case 'invasi_gabungan_pbb':
        return (
          <span className="text-[10px] font-extrabold text-cyan-300 bg-cyan-500/15 px-2.5 py-0.5 rounded-full border border-cyan-500/30 uppercase tracking-wider flex items-center gap-1">
            <Swords className="w-3 h-3" />
            Invasi Gabungan PBB
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-extrabold text-[#00FFAA] bg-[#00FFAA]/10 px-2.5 py-0.5 rounded-full border border-[#00FFAA]/30 uppercase tracking-wider">
            {typeLabels[type]}
          </span>
        );
    }
  };

  const renderIcon = (type: NewsItemData['type']) => {
    switch (type) {
      case 'invasi':
        return (
          <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center shrink-0 shadow-inner">
            <ShieldAlert className="w-5 h-5 animate-pulse text-rose-400" />
          </div>
        );
      case 'aneksasi':
        return (
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0 shadow-inner">
            <Flag className="w-5 h-5 animate-bounce text-amber-400" />
          </div>
        );
      case 'pengambilan_sda':
        return (
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0 shadow-inner">
            <Coins className="w-5 h-5 text-emerald-400" />
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 rounded-xl bg-[#00FFAA]/10 border border-[#00FFAA]/30 text-[#00FFAA] flex items-center justify-center shrink-0 shadow-inner">
            <Newspaper className="w-5 h-5" />
          </div>
        );
    }
  };

  return (
    <>
      <button
        onClick={onClick}
        title="Berita - Berita dan Update Negara"
        className="fixed top-40 right-7 z-[100] flex h-12 w-12 cursor-pointer items-center justify-center transition-transform group hover:scale-110 lg:top-40 lg:h-14 lg:w-14 xl:top-48 xl:h-16 xl:w-16"
      >
        <Image
          src="/images/game/interface/menu/news.svg"
          alt=""
          aria-hidden="true"
          width={72}
          height={72}
          className="h-14 w-14 object-contain brightness-125 saturate-150 drop-shadow-[0_0_6px_rgba(0,255,170,0.55)] lg:h-16 lg:w-16 xl:h-[4.5rem] xl:w-[4.5rem]"
        />
        {newsList.length > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 lg:h-5 lg:w-5 items-center justify-center rounded-full bg-rose-500 text-[9px] lg:text-[10px] font-black text-white shadow-md border border-[#0F2424]">
            {newsList.length}
          </span>
        )}
      </button>

      {/* 🔥 POPUP TOAST NOTIFIKASI BERITA DI SEBELAH KIRI */}
      {mounted && showToast && toastNews && createPortal(
        <div className="fixed top-[19rem] left-7 z-[100100] pointer-events-auto">
          <div
            onClick={() => {
              if (toastNews) {
                dismissedToastIdRef.current = toastNews.id;
                setShowToast(false);
                const targetCountry = getNewsCountryName(toastNews);
                if (isAiConstructionNews(toastNews) && onOpenAiConstruction) {
                  onOpenAiConstruction(toastNews);
                  return;
                } else if (targetCountry && onOpenNewsCountry) {
                  onOpenNewsCountry(targetCountry);
                  return;
                }
              }
              setShowToast(false);
              if (onClick) onClick();
            }}
            className="w-64 max-h-[calc(100vh-20rem)] overflow-y-auto bg-[#0F2424] border-2 border-[#00FFAA] rounded-xl p-2.5 shadow-[0_8px_22px_rgba(0,255,170,0.3)] animate-in fade-in slide-in-from-top-3 duration-300 cursor-pointer hover:bg-[#143030] transition-all group"
          >
            <div className="flex items-center justify-between pb-1.5 border-b border-[#00FFAA]/30">
              <span className="text-[10px] font-black text-[#00FFAA] uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#00FFAA] animate-ping" />
                Berita Geopolitik Baru!
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (toastNews) {
                    dismissedToastIdRef.current = toastNews.id;
                  }
                  setShowToast(false);
                }}
                className="text-slate-400 hover:text-white p-0.5 rounded"
              >
                <X className="w-3.5 h-3.5 text-[#00FFAA]" />
              </button>
            </div>
            <h5 className="text-[11px] font-bold text-white mt-1.5 whitespace-normal break-words group-hover:text-[#00FFAA] transition-colors leading-snug">
              {toastNews.headline}
            </h5>
            <div className="flex items-center justify-between mt-1.5 pt-1 border-t border-[#00FFAA]/10 text-[9px] text-[#6B8A8A]">
              <span>{toastNews.timestamp}</span>
              <span className="font-extrabold text-[#00FFAA] group-hover:underline">Buka Menu →</span>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* 🔥 News Modal - Render via Portal */}
      {isOpen && mounted && createPortal(
        <div className="fixed inset-0 z-[200] flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none">
          <div className="bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans pointer-events-auto shadow-2xl">

            {/* 🔥 HEADER MODAL */}
            <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-[#00FFAA]/20 flex items-center justify-between bg-[#0A1A1A] relative z-10 shrink-0 rounded-t-2xl">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1 sm:p-1.5 rounded-lg border border-[#00FFAA]/30 bg-[#0F2424] shrink-0">
                  <Newspaper className="h-4 w-4 sm:h-5 sm:w-5 text-[#00FFAA]" />
                </div>
                <div>
                  <h2 className="text-base sm:text-xl font-bold text-[#00FFAA] tracking-tight leading-none uppercase">Berita & Update Geopolitik</h2>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 sm:p-2.5 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] text-[#00FFAA] hover:bg-[#00FFAA] hover:text-[#0A1A1A] transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1.5 shadow-sm"
              >
                <span className="text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* 🔥 FILTER BAR */}
            <div className="px-4 sm:px-6 py-2 bg-[#051111] border-b border-[#00FFAA]/15 flex items-center justify-between gap-2 shrink-0">
              <div className="min-w-0 space-y-2 overflow-x-auto custom-scrollbar">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Filter className="w-3.5 h-3.5 text-[#6B8A8A] shrink-0" />
                  <span className="text-[10px] font-bold text-[#6B8A8A] uppercase tracking-wider shrink-0 mr-1">Filter:</span>
                  {([
                    ['semua', 'Semua'],
                    ['diplomasi', 'Diplomasi'],
                    ['ekonomi_keuangan', 'Ekonomi & Keuangan'],
                    ['pencapaian_militer', 'Pencapaian Militer'],
                    ['operasi_militer', 'Operasi Perang'],
                  ] as Array<[NewsCategory, string]>).map(([category, label]) => (
                    <button
                      key={category}
                      onClick={() => {
                        setFilterCategory(category);
                        setFilterType('semua');
                      }}
                      className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer whitespace-nowrap ${
                        filterCategory === category
                          ? 'bg-[#00FFAA] text-[#0A1A1A] shadow-md shadow-[#00FFAA]/20'
                          : 'bg-[#0F2424] text-[#6B8A8A] hover:text-[#00FFAA] border border-[#00FFAA]/20'
                      }`}
                    >
                      {label} ({category === 'semua'
                        ? newsList.length
                        : newsList.filter(item => getCategory(item) === category).length})
                    </button>
                  ))}
                </div>
                {filterCategory !== 'semua' && (
                  <div className="flex items-center gap-1.5 pl-5">
                    <button
                      onClick={() => setFilterType('semua')}
                      className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase transition-all cursor-pointer whitespace-nowrap ${
                        filterType === 'semua'
                          ? 'bg-[#00FFAA]/20 text-[#00FFAA]'
                          : 'bg-[#0F2424] text-[#6B8A8A] hover:text-[#00FFAA]'
                      }`}
                    >
                      Semua Subkategori
                    </button>
                    {categoryTypes[filterCategory].map(type => (
                      <button
                        key={type}
                        onClick={() => setFilterType(type)}
                        className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase transition-all cursor-pointer whitespace-nowrap ${
                          filterType === type
                            ? 'bg-[#00FFAA]/20 text-[#00FFAA]'
                            : 'bg-[#0F2424] text-[#6B8A8A] hover:text-[#00FFAA]'
                        }`}
                      >
                        {typeLabels[type]} ({newsList.filter(item => item.type === type).length})
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {onClearNews && newsList.length > 0 && (
                <button
                  onClick={onClearNews}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-bold text-rose-400 hover:bg-rose-500/10 border border-rose-500/30 uppercase tracking-wider transition-all cursor-pointer shrink-0"
                >
                  Bersihkan
                </button>
              )}
            </div>

            {/* 🔥 BODY MODAL */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#0A1A1A] relative z-10 custom-scrollbar">
              {filteredNews.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center space-y-4 max-w-md mx-auto my-auto py-16">
                  <Newspaper className="h-16 w-16 text-[#00FFAA]/20" />
                  <h4 className="text-lg font-bold text-[#00FFAA] uppercase">Tidak Ada Berita</h4>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredNews.map((news) => {
                    const targetCountry = getNewsCountryName(news);
                    const canOpenCountry = Boolean(targetCountry && onOpenNewsCountry);
                    const canOpenConstruction = isAiConstructionNews(news) && Boolean(onOpenAiConstruction);
                    const canOpenParticipants = news.type === 'invasi_gabungan_pbb';
                    const canNavigate = canOpenConstruction || canOpenCountry || canOpenParticipants;
                    const openNews = () => {
                      if (isAiConstructionNews(news) && onOpenAiConstruction) {
                        onOpenAiConstruction(news);
                      } else if (targetCountry && onOpenNewsCountry) {
                        onOpenNewsCountry(targetCountry);
                      } else if (news.type === 'invasi_gabungan_pbb') {
                        setSelectedOperationNews(news);
                      }
                    };

                    return (
                    <div
                      key={news.id}
                      onClick={canNavigate ? openNews : undefined}
                      onKeyDown={event => {
                        if (canNavigate && (event.key === 'Enter' || event.key === ' ')) {
                          event.preventDefault();
                          openNews();
                        }
                      }}
                      role={canNavigate ? 'button' : undefined}
                      tabIndex={canNavigate ? 0 : undefined}
                      title={canOpenConstruction ? `Klik untuk melihat pembangunan di ${targetCountry}` : canOpenCountry ? `Klik untuk melihat negara ${targetCountry}` : canOpenParticipants ? 'Klik untuk melihat negara peserta' : undefined}
                      className={`bg-[#0F2424] border border-[#00FFAA]/25 p-4 sm:p-5 rounded-2xl shadow-lg relative space-y-3 hover:border-[#00FFAA]/50 transition-all ${canNavigate ? 'cursor-pointer' : ''}`}
                    >
                      <div className="flex items-start gap-3.5">
                        {renderIcon(news.type)}

                        <div className="flex-1 space-y-1.5">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <h3 className="text-sm sm:text-base font-black text-white tracking-wide leading-tight">
                              {news.headline}
                            </h3>
                            {renderBadge(news.type)}
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-[10px] font-bold text-[#6B8A8A] uppercase tracking-wider">
                            {('attackerCountry' in news) && (
                              <>
                                <span>Penyerang: <strong className="text-white">{news.attackerCountry}</strong></span>
                                <span>•</span>
                                <span>Target: <strong className="text-white">{news.targetCountry}</strong></span>
                                <span>•</span>
                              </>
                            )}
                            <span>Waktu: <strong className="text-amber-400">{news.dateStr} ({news.timestamp})</strong></span>
                          </div>

                          <p className="text-xs font-medium text-slate-300 leading-relaxed pt-1">
                            {news.content}
                          </p>

                          {/* Extra info spesifik tipe berita */}
                          {news.type === 'aneksasi' && (
                            <div className="bg-[#051111] border border-amber-500/30 rounded-xl p-2.5 text-xs text-amber-300 font-bold flex items-center justify-between mt-2">
                              <span className="flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                                Peta Diperbarui: Warna wilayah {news.targetCountry} telah disesuaikan dengan warna {news.attackerCountry}!
                              </span>
                            </div>
                          )}

                          {news.type === 'pengambilan_sda' && (
                            <div className="bg-[#051111] border border-emerald-500/30 rounded-xl p-2.5 text-xs text-emerald-300 font-bold flex items-center justify-between mt-2">
                              <span className="flex items-center gap-1.5">
                                <Coins className="w-3.5 h-3.5 text-emerald-400" />
                                Transfer Aset: Kas +{new Intl.NumberFormat('id-ID').format(news.lootedCash)} NEO & Seluruh SDA Berhasil Diambil
                              </span>
                            </div>
                          )}
                          {news.type === 'invasi_gabungan_pbb' && (
                            <div className="mt-2 text-xs font-bold text-cyan-300">
                              Klik untuk melihat {news.participants.length} negara anggota Dewan Keamanan yang terlibat.
                            </div>
                          )}

                          {canNavigate && (
                            <div className="pt-2 flex items-center justify-end">
                              <span className="text-[10px] font-black text-[#00FFAA] group-hover:underline flex items-center gap-1">
                                {canOpenConstruction ? 'Buka Menu Pembangunan / Kebijakan →' : canOpenCountry ? 'Buka Profil Negara →' : 'Buka Detail Operasi →'}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          {selectedOperationNews && (
            <div
              className="fixed inset-0 z-[220] flex items-center justify-center bg-black/70 p-4 pointer-events-auto"
              onClick={() => setSelectedOperationNews(null)}
            >
              <section
                role="dialog"
                aria-modal="true"
                aria-labelledby="pbb-operation-title"
                className="w-full max-w-xl max-h-[80vh] overflow-hidden rounded-2xl border border-cyan-400/40 bg-[#0F2424] shadow-2xl"
                onClick={event => event.stopPropagation()}
              >
                <header className="flex items-center justify-between gap-3 border-b border-cyan-400/20 bg-[#0A1A1A] px-5 py-4">
                  <div>
                    <h3 id="pbb-operation-title" className="font-black text-cyan-300">
                      Pasukan Operasi Gabungan PBB
                    </h3>
                    <p className="mt-1 text-xs text-slate-400">
                      Target: <strong className="text-white">{selectedOperationNews.target.name}</strong>
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedOperationNews(null)}
                    aria-label="Tutup daftar negara peserta"
                    className="rounded-lg border border-cyan-400/30 p-2 text-cyan-300 hover:bg-cyan-400/10"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </header>
                <div className="max-h-[60vh] space-y-2 overflow-y-auto p-4">
                  {selectedOperationNews.participants.map(participant => (
                    <div
                      key={`${selectedOperationNews.resolutionId}-${participant.iso}`}
                      className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#051111] px-4 py-3"
                    >
                      <span className="font-bold text-white">{participant.name}</span>
                      <span className="shrink-0 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-1 text-[10px] font-bold uppercase text-cyan-300">
                        {participant.role}
                      </span>
                    </div>
                  ))}
                  {selectedOperationNews.participants.length === 0 && (
                    <p className="py-8 text-center text-sm text-slate-400">
                      Tidak ada anggota Dewan Keamanan yang tersedia untuk operasi ini.
                    </p>
                  )}
                </div>
              </section>
            </div>
          )}
        </div>,
        document.body
      )}
    </>
  );
}