'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Inbox, X, Trash2 } from 'lucide-react';
import { NotificationMessage } from './logic/1_notifikasi_kepuasan_dan_peringkat/1_kepuasan/kepuasanLogic';
import KepuasanNotification from './logic/1_notifikasi_kepuasan_dan_peringkat/1_kepuasan/kepuasanNotification';
import PeringkatNotification from './logic/1_notifikasi_kepuasan_dan_peringkat/2_peringkat/peringkatNotification';
import KesejahteraanNotification from './logic/1_notifikasi_kepuasan_dan_peringkat/3_kesejahteraan/kesejahteraanNotification';
import TradeBeliNotification from './logic/3_notifikasi_perdagangan/2_beli/tradeBeliNotification';
import TradeJualNotification from './logic/3_notifikasi_perdagangan/1_jual/tradeJualNotification';
import EmbassyNotification from './logic/4_notifikasi_kedubes/embassyNotification';
import BencanaNotification from './logic/6_notifikasi_bencana/1_bencana_alam/bencanaNotification';
import WabahNotification from './logic/6_notifikasi_bencana/2_wabah_penyakit/wabahNotification';
import TradeRelationNotification from './logic/3_notifikasi_perdagangan/3_hubungan_dagang/tradeRelationNotification';
import SpionaseNotificationCard from './logic/2_notifikasi_pertahanan/1_spionase/spionaseNotification';
import SabotaseNotificationCard from './logic/2_notifikasi_pertahanan/2_sabotase/sabotaseNotification';
import DiserangNotificationCard from './logic/2_notifikasi_pertahanan/3_diserang/diserangNotification';
import PemberontakanNotificationCard from './logic/2_notifikasi_pertahanan/4_pemberontakan/pemberontakanNotification';
import ICBMNotificationCard from './logic/2_notifikasi_pertahanan/5_icbm/icbmNotification';
import PajakChangeNotificationCard from './logic/7_notifikasi_ekonomi/1_perubahan_pajak/pajakChangeNotification';
import HargaChangeNotificationCard from './logic/7_notifikasi_ekonomi/2_harga_barang_pokok/hargaChangeNotification';
import SubsidiChangeNotificationCard from './logic/7_notifikasi_ekonomi/3_kebijakan_subsidi/subsidiChangeNotification';
import ListrikDefisitNotificationCard from './logic/8_kebutuhan_pokok_warga/1_kelistrikan/listrikDefisitNotificationCard';
import HunianDefisitNotificationCard from './logic/8_kebutuhan_pokok_warga/2_hunian/hunianDefisitNotificationCard';
import PanganDefisitNotificationCard from './logic/8_kebutuhan_pokok_warga/3_pangan/panganDefisitNotificationCard';
import TempatUmumDefisitNotificationCard from './logic/8_kebutuhan_pokok_warga/4_tempat_umum/tempatUmumDefisitNotificationCard';
import IdeologyChangeNotificationCard from './logic/10_sosial_budaya/2_ideologi/ideologyChangeNotification';
import ReligionChangeNotificationCard from './logic/10_sosial_budaya/1_agama/religionChangeNotification';
import DoctrineChangeNotificationCard from './logic/10_sosial_budaya/3_keterbukaan/doctrineChangeNotification';
import ResearchChangeNotificationCard from './logic/11_notifikasi_penelitian/researchChangeNotification';
import SistemEkonomiChangeNotificationCard from './logic/7_notifikasi_ekonomi/4_sistem_ekonomi/sistemEkonomiChangeNotification';
import KabinetChangeNotificationCard from './logic/13_notifikasi_kabinet/kabinetChangeNotification';
import NonAggressionNotificationCard from './logic/5_notifikasi_geopolitik/1_pakta_non_agresi/nonAggressionNotificationCard';
import DefenseAllianceNotificationCard from './logic/5_notifikasi_geopolitik/2_aliansi_pertahanan/defenseAllianceNotificationCard';
import ResearchContractNotificationCard from './logic/5_notifikasi_geopolitik/3_kontrak_penelitian/researchContractNotificationCard';
import HubunganPanasNotificationCard from './logic/5_notifikasi_geopolitik/4_hubungan_panas/hubunganPanasNotificationCard';
import ResolusiPBBNotificationCard from './logic/5_notifikasi_geopolitik/5_pbb/1_resolusi/resolusiPBBNotificationCard';
import KeamananPBBNotificationCard from './logic/5_notifikasi_geopolitik/5_pbb/2_keamanan/keamananPBBNotificationCard';
import { getActiveUserCountryName } from '@/app/page/navigasi_menu/2_navigasi_bawah/7_geopolitik/1_PBB/1_resolusi_PBB/logic/resolusiPBBUILogic';

interface TopLeftIconProps {
  onClick?: () => void;
  isOpen?: boolean;
  onClose?: () => void;
  notifications?: NotificationMessage[];
  onClearAll?: () => void;
  onActionClick?: (notification: NotificationMessage) => void;
  onRedirectClick?: (notification: NotificationMessage) => void;
}

export default function TopLeftIcon({
  onClick,
  isOpen,
  onClose,
  notifications = [],
  onClearAll,
  onActionClick,
  onRedirectClick
}: TopLeftIconProps) {
  const [mounted, setMounted] = useState(false);
  const [toastNotification, setToastNotification] = useState<NotificationMessage | null>(null);
  const [showToast, setShowToast] = useState(false);
  const dismissedToastIdRef = useRef<string | null>(null);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Popup Toast Otomatis Muncul & Sinkron secara Realtime Saat Ada Notifikasi Belum Dibaca
  useEffect(() => {
    const latestUnread = notifications.find(n => !n.isRead);

    if (latestUnread) {
      setToastNotification(latestUnread);
      // Tampilkan toast jika notifikasi ini belum ditutup secara manual oleh user
      if (dismissedToastIdRef.current !== latestUnread.id) {
        setShowToast(true);
      }
    } else {
      setToastNotification(null);
      setShowToast(false);
    }
  }, [notifications]);

  return (
    <>
      {mounted && createPortal(
        <div className="fixed top-24 left-7 z-[200000] flex flex-col items-start gap-2 pointer-events-auto">
          <button
            onClick={() => {
              if (toastNotification) {
                dismissedToastIdRef.current = toastNotification.id;
              }
              setShowToast(false);
              if (onClick) onClick();
            }}
            title="Inbox - Pesan dan Notifikasi"
            className="relative w-9 h-9 lg:w-10 lg:h-10 xl:w-12 xl:h-12 rounded-full bg-[#0F2424] border border-[#00FFAA]/40 text-[#00FFAA] hover:bg-[#00FFAA] hover:text-[#0A1A1A] shadow-[0_4px_12px_rgba(0,0,0,0.4)] flex items-center justify-center cursor-pointer transition-all group"
          >
            <Inbox className="w-4 h-4 lg:w-5 lg:h-5 xl:w-6 xl:h-6 transition-transform group-hover:scale-110" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 border border-[#0A1A1A] text-white text-[9px] font-black w-4 h-4 lg:w-5 lg:h-5 rounded-full flex items-center justify-center shadow animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* 🔥 POPUP TOAST NOTIFIKASI DI BAWAH INBOX (MNCUL WALAUPUN MODAL SEDANG TERBUKA, RENDERED VIA PORTAL Z-200000) */}
          {showToast && toastNotification && (
            <div
              onClick={() => {
                if (toastNotification) {
                  dismissedToastIdRef.current = toastNotification.id;
                }
                setShowToast(false);
                if (onClick) onClick();
              }}
              className="w-80 bg-[#0F2424] border-2 border-[#00FFAA] rounded-2xl p-3.5 shadow-[0_10px_30px_rgba(0,255,170,0.35)] animate-in fade-in slide-in-from-top-3 duration-300 cursor-pointer hover:bg-[#143030] transition-all group relative z-[200000]"
            >
              <div className="flex items-center justify-between pb-1.5 border-b border-[#00FFAA]/30">
                <span className="text-[11px] font-black text-[#00FFAA] uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#00FFAA] animate-ping" />
                  Pesan Baru Masuk
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (toastNotification) {
                      dismissedToastIdRef.current = toastNotification.id;
                    }
                    setShowToast(false);
                  }}
                  className="text-slate-400 hover:text-white p-0.5 rounded"
                >
                  <X className="w-4 h-4 text-[#00FFAA]" />
                </button>
              </div>
              <h5 className="text-xs font-bold text-white mt-2 line-clamp-1 group-hover:text-[#00FFAA] transition-colors leading-snug">
                {toastNotification.title}
              </h5>
              <p className="text-[11px] text-slate-300 line-clamp-2 mt-1 leading-relaxed">
                {toastNotification.message}
              </p>
              <div className="mt-2 flex items-center justify-between pt-1 border-t border-[#00FFAA]/10">
                <span className="text-[9px] text-[#6B8A8A] font-semibold">{toastNotification.timestamp}</span>
                <span className="text-[10px] text-[#00FFAA] font-black underline group-hover:translate-x-1 transition-transform">
                  Buka Inbox ({unreadCount}) →
                </span>
              </div>
            </div>
          )}
        </div>,
        document.body
      )}

      {/* 🔥 Inbox Modal - Render via Portal agar sama dengan Sidang Umum PBB */}
      {isOpen && mounted && createPortal(
        <div className="fixed inset-0 z-[100000] flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none">
          <div className="bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans pointer-events-auto">

            {/* 🔥 HEADER MODAL */}
            <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-[#00FFAA]/20 flex items-center justify-between bg-[#0A1A1A] relative z-10 shrink-0 rounded-t-2xl">
              <div className="flex items-center gap-2">
                <div className="p-1 sm:p-1.5 rounded-lg border border-[#00FFAA]/30 bg-[#0F2424] shrink-0">
                  <Inbox className="h-4 w-4 sm:h-5 sm:w-5 text-[#00FFAA]" />
                </div>
                <div>
                  <h2 className="text-base sm:text-xl font-bold text-[#00FFAA] tracking-tight leading-none uppercase">Inbox & Notifikasi</h2>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {notifications.length > 0 && onClearAll && (
                  <button
                    onClick={onClearAll}
                    className="px-3 py-1.5 rounded-xl border border-red-500/40 bg-red-950/40 text-red-400 hover:bg-red-900/60 transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1.5"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="hidden sm:inline">Bersihkan Semua</span>
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-2 sm:p-2.5 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] text-[#00FFAA] hover:bg-[#00FFAA] hover:text-[#0A1A1A] transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1.5"
                >
                  <span className="text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* 🔥 BODY MODAL */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#0A1A1A] relative z-10 custom-scrollbar flex flex-col">
              {notifications.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 max-w-md mx-auto my-auto">
                  <Inbox className="h-16 w-16 text-[#00FFAA]/30" />
                  <h4 className="text-lg font-bold text-[#00FFAA] uppercase">Tidak Ada Pesan</h4>
                  <p className="text-xs text-[#6B8A8A] leading-relaxed">
                    Belum ada pesan atau pemberitahuan yang masuk. Semua laporan dan notifikasi akan muncul di sini.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 max-w-4xl mx-auto w-full">
                  {notifications.map((notif) => {
                    const handleAction = onActionClick ? () => onActionClick(notif) : undefined;
                    const handleRedirect = onRedirectClick ? () => onRedirectClick(notif) : undefined;

                    const tradeType = (notif as any).tradeType;
                    if (tradeType === 'jual') {
                      return (
                        <TradeJualNotification
                          key={notif.id}
                          notification={notif}
                          onAccept={handleAction}
                          onReject={handleRedirect}
                        />
                      );
                    }
                    if (tradeType === 'beli') {
                      return (
                        <TradeBeliNotification
                          key={notif.id}
                          notification={notif}
                          onAccept={handleAction}
                          onReject={handleRedirect}
                        />
                      );
                    }
                    if (tradeType === 'penawaran_kedutaan_besar') {
                      return (
                        <EmbassyNotification
                          key={notif.id}
                          notification={notif as any}
                          onAccept={handleAction}
                          onReject={handleRedirect}
                        />
                      );
                    }
                    if (tradeType === 'penawaran_hubungan_dagang') {
                      return (
                        <TradeRelationNotification
                          key={notif.id}
                          notification={notif as any}
                          onAccept={handleAction}
                          onReject={handleRedirect}
                        />
                      );
                    }
                    if (tradeType === 'bencana_alam') {
                      return (
                        <BencanaNotification
                          key={notif.id}
                          notification={notif as any}
                          onAccept={handleAction}
                          onReject={handleRedirect}
                        />
                      );
                    }
                    if (tradeType === 'wabah_penyakit') {
                      return (
                        <WabahNotification
                          key={notif.id}
                          notification={notif as any}
                          onAccept={handleAction}
                          onReject={handleRedirect}
                        />
                      );
                    }
                    if (tradeType === 'spionase') {
                      return (
                        <SpionaseNotificationCard
                          key={notif.id}
                          notification={notif as any}
                          onAccept={handleAction}
                          onReject={handleRedirect}
                        />
                      );
                    }
                    if (tradeType === 'sabotase') {
                      return (
                        <SabotaseNotificationCard
                          key={notif.id}
                          notification={notif as any}
                          onAccept={handleAction}
                          onReject={handleRedirect}
                        />
                      );
                    }
                    if (tradeType === 'diserang') {
                      return (
                        <DiserangNotificationCard
                          key={notif.id}
                          notification={notif as any}
                          onAccept={handleAction}
                          onReject={handleRedirect}
                        />
                      );
                    }
                    if (tradeType === 'pemberontakan') {
                      return (
                        <PemberontakanNotificationCard
                          key={notif.id}
                          notification={notif as any}
                          onAccept={handleAction}
                          onReject={handleRedirect}
                        />
                      );
                    }
                    if (tradeType === 'icbm' || tradeType === 'program_nuklir_dimulai' || tradeType === 'program_nuklir_selesai') {
                      return (
                        <ICBMNotificationCard
                          key={notif.id}
                          notification={notif as any}
                          onAccept={handleAction}
                          onReject={handleRedirect}
                        />
                      );
                    }
                    if (tradeType === 'perubahan_pajak') {
                      return (
                        <PajakChangeNotificationCard
                          key={notif.id}
                          notification={notif as any}
                          onAccept={handleAction}
                          onReject={handleRedirect}
                        />
                      );
                    }
                    if (tradeType === 'harga_barang_pokok') {
                      return (
                        <HargaChangeNotificationCard
                          key={notif.id}
                          notification={notif as any}
                          onAccept={handleAction}
                          onReject={handleRedirect}
                        />
                      );
                    }
                    if (tradeType === 'kebijakan_subsidi') {
                      return (
                        <SubsidiChangeNotificationCard
                          key={notif.id}
                          notification={notif as any}
                          onAccept={handleAction}
                          onReject={handleRedirect}
                        />
                      );
                    }
                    if (tradeType === 'defisit_listrik') {
                      return (
                        <ListrikDefisitNotificationCard
                          key={notif.id}
                          notification={notif as any}
                          onAccept={handleAction}
                          onReject={handleRedirect}
                        />
                      );
                    }
                    if (tradeType === 'defisit_hunian') {
                      return (
                        <HunianDefisitNotificationCard
                          key={notif.id}
                          notification={notif as any}
                          onAccept={handleAction}
                          onReject={handleRedirect}
                        />
                      );
                    }
                    if (tradeType === 'defisit_pangan') {
                      return (
                        <PanganDefisitNotificationCard
                          key={notif.id}
                          notification={notif as any}
                          onAccept={handleAction}
                          onReject={handleRedirect}
                        />
                      );
                    }
                    if (tradeType === 'defisit_tempat_umum') {
                      return (
                        <TempatUmumDefisitNotificationCard
                          key={notif.id}
                          notification={notif as any}
                          onAccept={handleAction}
                          onReject={handleRedirect}
                        />
                      );
                    }
                    if (tradeType === 'perubahan_ideologi') {
                      return (
                        <IdeologyChangeNotificationCard
                          key={notif.id}
                          notification={notif as any}
                          onAccept={handleAction}
                          onReject={handleRedirect}
                        />
                      );
                    }
                    if (tradeType === 'perubahan_agama') {
                      return (
                        <ReligionChangeNotificationCard
                          key={notif.id}
                          notification={notif as any}
                          onAccept={handleAction}
                          onReject={handleRedirect}
                        />
                      );
                    }
                    if (tradeType === 'perubahan_doktrin') {
                      return (
                        <DoctrineChangeNotificationCard
                          key={notif.id}
                          notification={notif as any}
                          onAccept={handleAction}
                          onReject={handleRedirect}
                        />
                      );
                    }
                    if (tradeType === 'perubahan_fokus_riset') {
                      return (
                        <ResearchChangeNotificationCard
                          key={notif.id}
                          notification={notif as any}
                          onAccept={handleAction}
                          onReject={handleRedirect}
                        />
                      );
                    }
                    if (tradeType === 'perubahan_sistem_ekonomi') {
                      return (
                        <SistemEkonomiChangeNotificationCard
                          key={notif.id}
                          notification={notif as any}
                          onAccept={handleAction}
                          onReject={handleRedirect}
                        />
                      );
                    }
                    if (tradeType === 'perubahan_kabinet') {
                      return (
                        <KabinetChangeNotificationCard
                          key={notif.id}
                          notification={notif as any}
                          onAccept={handleAction}
                          onReject={handleRedirect}
                        />
                      );
                    }
                    if (tradeType === 'penawaran_pakta_non_agresi') {
                      return (
                        <NonAggressionNotificationCard
                          key={notif.id}
                          notification={notif as any}
                          onAccept={handleAction}
                          onReject={handleRedirect}
                        />
                      );
                    }
                    if (tradeType === 'penawaran_aliansi_pertahanan') {
                      return (
                        <DefenseAllianceNotificationCard
                          key={notif.id}
                          notification={notif as any}
                          onAccept={handleAction}
                          onReject={handleRedirect}
                        />
                      );
                    }
                    if (tradeType === 'penawaran_kontrak_penelitian') {
                      return (
                        <ResearchContractNotificationCard
                          key={notif.id}
                          notification={notif as any}
                          onAccept={handleAction}
                          onReject={handleRedirect}
                        />
                      );
                    }
                    if (tradeType === 'hubungan_panas') {
                      return (
                        <HubunganPanasNotificationCard
                          key={notif.id}
                          notification={notif as any}
                          onAccept={handleAction}
                          onRedirect={handleRedirect}
                        />
                      );
                    }
                    if (tradeType === 'usulan_resolusi_pbb') {
                      const activeUser = getActiveUserCountryName();
                      const proposer = (notif as any).proposerCountry;
                      const isUserCreated = (notif as any).id?.includes('user');
                      if (proposer && proposer.toLowerCase() === activeUser.toLowerCase() && !isUserCreated) {
                        return null;
                      }
                      return (
                        <ResolusiPBBNotificationCard
                          key={notif.id}
                          notification={notif as any}
                          onAccept={handleAction}
                          onRedirect={handleRedirect}
                        />
                      );
                    }
                    if (tradeType === 'usulan_keamanan_pbb') {
                      const activeUser = getActiveUserCountryName();
                      const proposer = (notif as any).proposerCountry;
                      const isUserCreated = (notif as any).id?.includes('user');
                      if (proposer && proposer.toLowerCase() === activeUser.toLowerCase() && !isUserCreated) {
                        return null;
                      }
                      return (
                        <KeamananPBBNotificationCard
                          key={notif.id}
                          notification={notif as any}
                          onAccept={handleAction}
                          onRedirect={handleRedirect}
                        />
                      );
                    }

                    switch (notif.type) {
                      case 'kepuasan':
                        return <KepuasanNotification key={notif.id} notification={notif} onActionClick={handleAction} onRedirectClick={handleRedirect} />;
                      case 'peringkat':
                        return <PeringkatNotification key={notif.id} notification={notif} onActionClick={handleAction} onRedirectClick={handleRedirect} />;
                      case 'kesejahteraan':
                        return <KesejahteraanNotification key={notif.id} notification={notif} onActionClick={handleAction} onRedirectClick={handleRedirect} />;
                      default:
                        return (
                          <div key={notif.id} className="bg-[#0F2424] border border-[#00FFAA]/30 p-4 rounded-xl shadow-sm">
                            <h4 className="font-bold text-[#00FFAA]">{notif.title}</h4>
                            <p className="text-xs text-[#6B8A8A]">{notif.timestamp}</p>
                            <p className="text-xs text-[#E0E0E0] mt-2">{notif.message}</p>
                          </div>
                        );
                    }
                  })}
                </div>
              )}
            </div>

            {/* 🔥 FOOTER MODAL */}
            <div className="p-3 bg-[#0A1A1A] border-t border-[#00FFAA]/20 flex justify-end relative z-10 shrink-0">
              <button
                onClick={onClose}
                className="px-6 py-2 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] text-[#00FFAA] hover:bg-[#00FFAA] hover:text-[#0A1A1A] transition-all font-bold text-xs uppercase tracking-wider cursor-pointer"
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