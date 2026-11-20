'use client';

import SharedModalCloseButton from '@/app/page/root_modals_design_menu/ModalCloseButton';
import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { Newspaper, X, Swords, Flag, Coins, ShieldAlert, Sparkles } from 'lucide-react';
import NotebookModalWrapper from '@/app/page/navigasi_menu/2_navigasi_bawah/NotebookModalWrapper';
import RootInfoModalHeader from '@/app/page/root_modals_design_menu/RootInfoModalHeader';
import { useLanguage } from '@/app/page/paused_menu/terjemahan_paused_menu/languageLogic';
import { useViewportMode } from '@/app/hooks/useViewportMode';
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

type NewsType = NewsItemData['type'];

interface TopRightNewsIconProps {
  onClick?: () => void;
  isOpen?: boolean;
  onClose?: () => void;
  newsList?: NewsItemData[];
  onClearNews?: () => void;
  onOpenAiConstruction?: (news: AiNewsItem) => void;
  onOpenNewsCountry?: (countryName: string) => void;
  isMenuButtonHidden?: boolean;
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

function limitNewsPerMonth(news: NewsItemData[]): NewsItemData[] {
  const monthlyNewsCounts = new Map<string, number>();
  return news.filter((item) => {
    const month = item.dateStr.slice(0, 7);
    const count = monthlyNewsCounts.get(month) ?? 0;
    if (count >= 30) return false;
    monthlyNewsCounts.set(month, count + 1);
    return true;
  });
}

export default function TopRightNewsIcon({
  onClick,
  isOpen,
  onClose,
  newsList = [],
  onClearNews,
  onOpenAiConstruction,
  onOpenNewsCountry,
  isMenuButtonHidden = false,
}: TopRightNewsIconProps) {
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const viewportMode = useViewportMode();
  const isLandscapePhone = viewportMode === 'landscapePhone';
  const isPortraitPhone = viewportMode === 'portraitPhone';
  const isMobile = isLandscapePhone || isPortraitPhone;
  const [toastNews, setToastNews] = useState<NewsItemData | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [selectedOperationNews, setSelectedOperationNews] = useState<SecurityCouncilInvasionNews | null>(null);
  const dismissedToastIdRef = React.useRef<string | null>(null);
  const cappedNewsList = useMemo(
    () => limitNewsPerMonth(newsList),
    [newsList],
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  // Popup Toast Otomatis Muncul di Sebelah Kiri (Seperti Inbox) saat ada Berita Baru
  useEffect(() => {
    // Jangan munculkan popup toast jika game sedang di-pause
    const isGamePaused = typeof window !== 'undefined' ? Boolean((window as any).neosantara_is_paused) : false;
    if (isGamePaused) {
      setShowToast(false);
      return;
    }

    if (cappedNewsList.length > 0) {
      const latest = cappedNewsList[0];
      if (dismissedToastIdRef.current !== latest.id) {
        setToastNews(latest);
        setShowToast(true);
      }
    } else {
      setToastNews(null);
      setShowToast(false);
    }
  }, [cappedNewsList]);

  useEffect(() => {
    if (!showToast || !toastNews) return;

    const timer = window.setTimeout(() => {
      dismissedToastIdRef.current = toastNews.id;
      setShowToast(false);
    }, 3000);

    return () => window.clearTimeout(timer);
  }, [showToast, toastNews?.id]);

  const displayNews = cappedNewsList;

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
    const trBadge = type ? t(`side_news.badges.${type}`) : '';
    const label = (trBadge && trBadge !== `side_news.badges.${type}`) ? trBadge : (typeLabels[type] || type);
    switch (type) {
      case 'invasi':
        return (
          <span className="text-[10px] font-extrabold text-rose-400 bg-rose-500/15 px-2.5 py-0.5 rounded-full border border-rose-500/30 uppercase tracking-wider flex items-center gap-1">
            <Swords className="w-3 h-3 text-rose-400" />
            {label}
          </span>
        );
      case 'aneksasi':
        return (
          <span className="text-[10px] font-extrabold text-amber-400 bg-amber-500/15 px-2.5 py-0.5 rounded-full border border-amber-500/30 uppercase tracking-wider flex items-center gap-1">
            <Flag className="w-3 h-3 text-amber-400" />
            {label}
          </span>
        );
      case 'pengambilan_sda':
        return (
          <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/30 uppercase tracking-wider flex items-center gap-1">
            <Coins className="w-3 h-3 text-emerald-400" />
            {label}
          </span>
        );
      case 'invasi_gabungan_pbb':
        return (
          <span className="text-[10px] font-extrabold text-cyan-300 bg-cyan-500/15 px-2.5 py-0.5 rounded-full border border-cyan-500/30 uppercase tracking-wider flex items-center gap-1">
            <Swords className="w-3 h-3" />
            {label}
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-extrabold text-root-accent bg-root-accent/10 px-2.5 py-0.5 rounded-full border border-root-accent/30 uppercase tracking-wider">
            {label}
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
          <div className="w-10 h-10 rounded-xl bg-root-accent/10 border border-root-accent/30 text-root-accent flex items-center justify-center shrink-0 shadow-inner">
            <Newspaper className="w-5 h-5" />
          </div>
        );
    }
  };

  return (
    <>
      {mounted && !isMenuButtonHidden && createPortal(
        <button
          onClick={onClick}
          title="Berita - Berita dan Update Negara"
          className="side-floating-btn side-btn-news"
        >
          <Image
            src="/images/game/interface/menu/news.svg"
            alt=""
            aria-hidden="true"
            onError={(event) => { event.currentTarget.style.display = 'none'; }}
            width={72}
            height={72}
          />
          {newsList.length > 0 && (
            <span className="side-floating-badge">
              {newsList.length}
            </span>
          )}
        </button>,
        document.body
      )}

      {/* 🔥 POPUP TOAST NOTIFIKASI BERITA DI SEBELAH KIRI */}
      {mounted && !isMenuButtonHidden && showToast && toastNews && createPortal(
        <div
          style={{
            top: isLandscapePhone ? 'calc(var(--safe-top) + 5.5rem)' : isPortraitPhone ? 'calc(var(--safe-top) + 12rem)' : undefined,
            left: isMobile ? 'calc(var(--safe-left) + 0.5rem)' : undefined,
          }}
          className={`fixed z-[100100] pointer-events-auto ${
            isLandscapePhone || isPortraitPhone ? '' : 'top-[19rem] left-7'
          }`}
        >
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
            className="flex h-28 w-64 flex-col rounded-xl border-2 border-root-accent bg-root-surface p-2.5 shadow-[0_8px_22px_rgba(0,255,170,0.3)] animate-in fade-in slide-in-from-top-3 duration-300 cursor-pointer hover:bg-[#143030] transition-all group"
          >
            <div className="flex items-center justify-between pb-1.5 border-b border-root-accent/30">
              <span className="text-[10px] font-black text-root-accent uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-root-accent animate-ping" />
                {t('side_news.contents.toastTitle') || 'Berita Geopolitik Baru!'}
              </span>
              <SharedModalCloseButton
                onClick={(e) => {
                  e.stopPropagation();
                  if (toastNews) {
                    dismissedToastIdRef.current = toastNews.id;
                  }
                  setShowToast(false);
                }}
                className="text-slate-400 hover:text-white p-0.5 rounded"
               appearance="custom">
                <X className="w-3.5 h-3.5 text-root-accent" />
              </SharedModalCloseButton>
            </div>
            <h5 className="mt-1.5 line-clamp-2 whitespace-normal break-words text-[11px] font-bold leading-snug text-white group-hover:text-root-accent transition-colors">
              {(() => {
                const tr = toastNews.type ? t(`side_news.headlines.${toastNews.type}`) : '';
                return (tr && tr !== `side_news.headlines.${toastNews.type}`) ? tr : toastNews.headline;
              })()}
            </h5>
            <div className="mt-auto flex items-center justify-between border-t border-root-accent/10 pt-1 text-[9px] text-root-subtle">
              <span>{toastNews.timestamp}</span>
              <span className="font-extrabold text-root-accent group-hover:underline">
                {t('side_news.contents.openMenu') || 'Buka Menu →'}
              </span>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* 🔥 News Modal - Render via Portal */}
      {isOpen && mounted && createPortal(
        <NotebookModalWrapper onClose={onClose} zIndexClass="z-[200]">
          <div className="root-modal-util-52b6b298fe news-modal-typography font-sans">

            <RootInfoModalHeader
              title={t('side_news.title')}
              onClose={onClose}
              icon={<Newspaper />}
              size="standard"
              actions={
                onClearNews && newsList.length > 0 ? (
                  <button
                    onClick={onClearNews}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-bold text-rose-400 hover:bg-rose-500/10 border border-rose-500/30 uppercase tracking-wider transition-all cursor-pointer shrink-0"
                  >
                    {t('side_news.clearNews')}
                  </button>
                ) : undefined
              }
            />

            {/* 🔥 BODY MODAL */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-root-canvas relative z-10 custom-scrollbar">
              {displayNews.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center space-y-4 max-w-md mx-auto my-auto py-16">
                  <Newspaper className="h-16 w-16 text-root-accent/20" />
                  <h4 className="text-lg font-bold text-root-accent uppercase">
                    {t('side_news.empty')}
                  </h4>
                </div>
              ) : (
                <div className="space-y-4">
                  {displayNews.map((news) => {
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
                      className={`bg-root-surface border border-root-accent/25 p-4 sm:p-5 rounded-2xl shadow-lg relative space-y-3 hover:border-root-accent/50 transition-all ${canNavigate ? 'cursor-pointer' : ''}`}
                    >
                      <div className="flex items-start gap-3.5">
                        {renderIcon(news.type)}

                        <div className="flex-1 space-y-1.5">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <h3 className="text-sm sm:text-base font-black text-white tracking-wide leading-tight">
                              {(() => {
                                const tr = news.type ? t(`side_news.headlines.${news.type}`) : '';
                                return (tr && tr !== `side_news.headlines.${news.type}`) ? tr : news.headline;
                              })()}
                            </h3>
                            {renderBadge(news.type)}
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-[10px] font-bold text-root-subtle uppercase tracking-wider">
                            {('attackerCountry' in news) && (
                              <>
                                <span>{t('side_news.attacker')}: <strong className="text-white">{news.attackerCountry}</strong></span>
                                <span>•</span>
                                <span>{t('side_news.target')}: <strong className="text-white">{news.targetCountry}</strong></span>
                                <span>•</span>
                              </>
                            )}
                            <span>{t('side_news.time')}: <strong className="text-amber-400">{news.dateStr} ({news.timestamp})</strong></span>
                          </div>

                          <p className="text-xs font-medium text-slate-300 leading-relaxed pt-1">
                            {(() => {
                              if (news.type && t(`side_news.contents.${news.type}`)) {
                                const actor = ('countryName' in news && news.countryName) || ('attackerCountry' in news && news.attackerCountry) || '';
                                const partner = ('targetCountry' in news && news.targetCountry) || ('target' in news && news.target?.name) || '';
                                return t(`side_news.contents.${news.type}`, { actor, partner });
                              }
                              return news.content;
                            })()}
                          </p>

                          {/* Extra info spesifik tipe berita */}
                          {news.type === 'aneksasi' && (
                            <div className="bg-[#051111] border border-amber-500/30 rounded-xl p-2.5 text-xs text-amber-300 font-bold flex items-center justify-between mt-2">
                              <span className="flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                                {t('side_news.mapUpdatedAnnexation', { target: news.targetCountry, attacker: news.attackerCountry }) ||
                                  `Peta Diperbarui: Warna wilayah ${news.targetCountry} telah disesuaikan dengan warna ${news.attackerCountry}!`}
                              </span>
                            </div>
                          )}

                          {news.type === 'pengambilan_sda' && (
                            <div className="bg-[#051111] border border-emerald-500/30 rounded-xl p-2.5 text-xs text-emerald-300 font-bold flex items-center justify-between mt-2">
                              <span className="flex items-center gap-1.5">
                                <Coins className="w-3.5 h-3.5 text-emerald-400" />
                                {t('side_news.assetLootTransfer', { cash: new Intl.NumberFormat('id-ID').format(news.lootedCash) }) ||
                                  `Transfer Aset: Kas +${new Intl.NumberFormat('id-ID').format(news.lootedCash)} NEO & Seluruh SDA Berhasil Diambil`}
                              </span>
                            </div>
                          )}
                          {news.type === 'invasi_gabungan_pbb' && (
                            <div className="mt-2 text-xs font-bold text-cyan-300">
                              {t('side_news.unParticipantsNotice', { count: news.participants.length }) ||
                                `Klik untuk melihat ${news.participants.length} negara anggota Dewan Keamanan yang terlibat.`}
                            </div>
                          )}

                          {canNavigate && (
                            <div className="pt-2 flex items-center justify-end">
                              <span className="text-[10px] font-black text-root-accent group-hover:underline flex items-center gap-1">
                                {canOpenConstruction ? t('side_news.openConstruction') : canOpenCountry ? t('side_news.openCountry') : t('side_news.openOperation')}
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
          {selectedOperationNews && (
            <div
              className="fixed inset-0 z-[220] flex items-center justify-center p-4 pointer-events-auto"
              onClick={() => setSelectedOperationNews(null)}
            >
              <section
                role="dialog"
                aria-modal="true"
                aria-labelledby="pbb-operation-title"
                className="modal-responsive-shell overflow-hidden rounded-2xl border border-cyan-400/40 bg-root-surface shadow-2xl"
                onClick={event => event.stopPropagation()}
              >
                <RootInfoModalHeader
                  title={t('side_news.unOperationTitle')}
                  titleId="pbb-operation-title"
                  onClose={() => setSelectedOperationNews(null)}
                  icon={<Newspaper />}
                  size="standard"
                  centerContent={
                    <p className="text-xs text-slate-400">
                      {t('side_news.target')}: <strong className="text-white">{selectedOperationNews.target.name}</strong>
                    </p>
                  }
                />
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
                      {t('side_news.noUnMembers')}
                    </p>
                  )}
                </div>
              </section>
            </div>
          )}
          </div>
        </NotebookModalWrapper>,
        document.body
      )}
    </>
  );
}
