'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Newspaper, X, Swords, Flag, Coins, ShieldAlert, Sparkles, Filter } from 'lucide-react';
import { InvasionNewsData } from './logic/1_berita_invasi/beritaInvasiLogic';
import { AnnexationNewsData } from './logic/2_berita_aneksasi/beritaAneksasiLogic';
import { ResourceLootNewsData } from './logic/3_berita_pengambilan_sda/beritaPengambilanSDALogic';

export type NewsItemData = InvasionNewsData | AnnexationNewsData | ResourceLootNewsData;

interface TopRightNewsIconProps {
  onClick?: () => void;
  isOpen?: boolean;
  onClose?: () => void;
  newsList?: NewsItemData[];
  onClearNews?: () => void;
}

export default function TopRightNewsIcon({
  onClick,
  isOpen,
  onClose,
  newsList = [],
  onClearNews
}: TopRightNewsIconProps) {
  const [mounted, setMounted] = useState(false);
  const [filterType, setFilterType] = useState<'semua' | 'invasi' | 'aneksasi' | 'pengambilan_sda'>('semua');

  const [toastNews, setToastNews] = useState<NewsItemData | null>(null);
  const [showToast, setShowToast] = useState(false);
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

  const filteredNews = newsList.filter((item) => {
    if (filterType === 'semua') return true;
    return item.type === filterType;
  });

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
      default:
        return null;
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
    }
  };

  return (
    <>
      <button
        onClick={onClick}
        title="Berita - Berita dan Update Negara"
        className="fixed top-36 lg:top-40 xl:top-44 right-7 z-[100] w-9 h-9 lg:w-10 lg:h-10 xl:w-12 xl:h-12 rounded-full bg-[#0F2424] border border-[#00FFAA]/40 text-[#00FFAA] hover:bg-[#00FFAA] hover:text-[#0A1A1A] shadow-[0_4px_12px_rgba(0,0,0,0.4)] flex items-center justify-center cursor-pointer transition-all group"
      >
        <Newspaper className="w-4 h-4 lg:w-5 lg:h-5 xl:w-6 xl:h-6 transition-transform group-hover:scale-110" />
        {newsList.length > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 lg:h-5 lg:w-5 items-center justify-center rounded-full bg-rose-500 text-[9px] lg:text-[10px] font-black text-white shadow-md border border-[#0F2424]">
            {newsList.length}
          </span>
        )}
      </button>

      {/* 🔥 POPUP TOAST NOTIFIKASI BERITA DI SEBELAH KIRI (DI BAWAH INBOX, RENDERED VIA PORTAL Z-200000) */}
      {mounted && showToast && toastNews && createPortal(
        <div className="fixed top-[19rem] left-7 z-[100100] pointer-events-auto">
          <div
            onClick={() => {
              if (toastNews) {
                dismissedToastIdRef.current = toastNews.id;
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
              <span className="font-extrabold text-[#00FFAA] group-hover:underline">Buka Berita →</span>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* 🔥 News Modal - Render via Portal agar sama dengan Sidang Umum PBB */}
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
                  <p className="text-[10px] font-bold text-[#6B8A8A] uppercase tracking-wider mt-0.5">Kabar konflik, aneksasi, dan perubahan peta kekuatan dunia</p>
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
            <div className="px-4 sm:px-6 py-2 bg-[#051111] border-b border-[#00FFAA]/15 flex items-center justify-between gap-2 overflow-x-auto custom-scrollbar shrink-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Filter className="w-3.5 h-3.5 text-[#6B8A8A] shrink-0" />
                <span className="text-[10px] font-bold text-[#6B8A8A] uppercase tracking-wider shrink-0 mr-1">Filter:</span>
                
                <button
                  onClick={() => setFilterType('semua')}
                  className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                    filterType === 'semua'
                      ? 'bg-[#00FFAA] text-[#0A1A1A] shadow-md shadow-[#00FFAA]/20'
                      : 'bg-[#0F2424] text-[#6B8A8A] hover:text-[#00FFAA] border border-[#00FFAA]/20'
                  }`}
                >
                  Semua ({newsList.length})
                </button>

                <button
                  onClick={() => setFilterType('invasi')}
                  className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                    filterType === 'invasi'
                      ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                      : 'bg-[#0F2424] text-[#6B8A8A] hover:text-rose-400 border border-[#00FFAA]/20'
                  }`}
                >
                  Invasi ({newsList.filter(n => n.type === 'invasi').length})
                </button>

                <button
                  onClick={() => setFilterType('aneksasi')}
                  className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                    filterType === 'aneksasi'
                      ? 'bg-amber-500 text-[#0A1A1A] shadow-md shadow-amber-500/20'
                      : 'bg-[#0F2424] text-[#6B8A8A] hover:text-amber-400 border border-[#00FFAA]/20'
                  }`}
                >
                  Aneksasi ({newsList.filter(n => n.type === 'aneksasi').length})
                </button>

                <button
                  onClick={() => setFilterType('pengambilan_sda')}
                  className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                    filterType === 'pengambilan_sda'
                      ? 'bg-emerald-500 text-[#0A1A1A] shadow-md shadow-emerald-500/20'
                      : 'bg-[#0F2424] text-[#6B8A8A] hover:text-emerald-400 border border-[#00FFAA]/20'
                  }`}
                >
                  Perampasan Aset ({newsList.filter(n => n.type === 'pengambilan_sda').length})
                </button>
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
                  <p className="text-xs text-[#6B8A8A] leading-relaxed">
                    Belum ada berita atau update perang yang sesuai dengan filter ini. Pantau terus perkembangan situasi nasional dan internasional.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredNews.map((news) => (
                    <div
                      key={news.id}
                      className="bg-[#0F2424] border border-[#00FFAA]/25 p-4 sm:p-5 rounded-2xl shadow-lg relative space-y-3 hover:border-[#00FFAA]/50 transition-all"
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

                          <div className="flex items-center gap-3 text-[10px] font-bold text-[#6B8A8A] uppercase tracking-wider">
                            <span>Penyerang: <strong className="text-white">{news.attackerCountry}</strong></span>
                            <span>•</span>
                            <span>Target: <strong className="text-white">{news.targetCountry}</strong></span>
                            <span>•</span>
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
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 🔥 FOOTER MODAL */}
            <div className="p-3 bg-[#0A1A1A] border-t border-[#00FFAA]/20 flex justify-between items-center relative z-10 shrink-0">
              <span className="text-[10px] font-bold text-[#6B8A8A] uppercase tracking-wider pl-2">
                Total {filteredNews.length} Laporan Berita
              </span>
              <button 
                onClick={onClose}
                className="px-6 py-2 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] text-[#00FFAA] hover:bg-[#00FFAA] hover:text-[#0A1A1A] transition-all font-bold text-xs uppercase tracking-wider cursor-pointer shadow-sm"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}