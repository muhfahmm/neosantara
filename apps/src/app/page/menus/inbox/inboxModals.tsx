'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { Inbox, X, Trash2, Clock, CheckCircle2, AlertTriangle, ShieldAlert, ChevronRight, User } from 'lucide-react';
import { getIsoForCountryName } from '@/app/page/navigasi_menu/2_navigasi_bawah/7_geopolitik/1_PBB/pbbCountryIso';
import { NotificationMessage } from './logic/1_notifikasi_kepuasan_dan_peringkat/1_kepuasan/kepuasanLogic';
import KepuasanNotification from './logic/1_notifikasi_kepuasan_dan_peringkat/1_kepuasan/kepuasanNotification';
import PeringkatNotification from './logic/1_notifikasi_kepuasan_dan_peringkat/2_peringkat/peringkatNotification';
import KesejahteraanNotification from './logic/1_notifikasi_kepuasan_dan_peringkat/3_kesejahteraan/kesejahteraanNotification';
import TradeBeliNotification from './logic/3_notifikasi_perdagangan/2_beli/tradeBeliNotification';
import TradeJualNotification from './logic/3_notifikasi_perdagangan/1_jual/tradeJualNotification';
import EmbassyNotification from './logic/4_notifikasi_kedubes/embassyNotification';
import BencanaNotification from './logic/6_notifikasi_bencana/1_bencana_alam/bencanaNotification';
import WabahNotification from './logic/6_notifikasi_bencana/2_wabah_penyakit/wabahNotification';
import KeamananNotificationCard from './logic/14_notifikasi_keamanan/keamananNotification';
import TradeRelationNotification from './logic/3_notifikasi_perdagangan/3_hubungan_dagang/tradeRelationNotification';
import SpionaseNotificationCard from './logic/2_notifikasi_pertahanan/1_spionase/spionaseNotification';
import SabotaseNotificationCard from './logic/2_notifikasi_pertahanan/2_sabotase/sabotaseNotification';
import DiserangNotificationCard from './logic/2_notifikasi_pertahanan/3_diserang/diserangNotification';
import PemberontakanNotificationCard from './logic/2_notifikasi_pertahanan/4_pemberontakan/pemberontakanNotification';
import ICBMNotificationCard from './logic/2_notifikasi_pertahanan/5_icbm/icbmNotification';
import PajakChangeNotificationCard from './logic/7_notifikasi_ekonomi/1_perubahan_pajak/pajakChangeNotification';
import HargaChangeNotificationCard from './logic/7_notifikasi_ekonomi/2_harga_barang_pokok/hargaChangeNotification';
import SubsidiChangeNotificationCard from './logic/7_notifikasi_ekonomi/3_kebijakan_subsidi/subsidiChangeNotification';
import DemonstrasiEkonomiNotificationCard from './logic/7_notifikasi_ekonomi/demo_logic/demonstrasiEkonomiNotificationCard';
import ListrikDefisitNotificationCard from './logic/8_kebutuhan_pokok_warga/1_kelistrikan/listrikDefisitNotificationCard';
import HunianDefisitNotificationCard from './logic/8_kebutuhan_pokok_warga/2_hunian/hunianDefisitNotificationCard';
import PanganDefisitNotificationCard from './logic/8_kebutuhan_pokok_warga/3_pangan/panganDefisitNotificationCard';
import TempatUmumDefisitNotificationCard from './logic/8_kebutuhan_pokok_warga/4_tempat_umum/tempatUmumDefisitNotificationCard';
import PopulasiDefisitNotificationCard from './logic/8_kebutuhan_pokok_warga/5_populasi/populasiDefisitNotificationCard';
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
import { isNonActionableUpdateNotification } from './logic/automaticChangeNotification';
import { getInboxNotificationImage } from './inboxAssetMapping';

interface TopLeftIconProps {
  onClick?: () => void;
  isOpen?: boolean;
  onClose?: () => void;
  notifications?: NotificationMessage[];
  onClearAll?: () => void;
  onActionClick?: (notification: NotificationMessage, actionType?: string) => void;
  onCrackdownClick?: (notification: NotificationMessage) => void;
  onRedirectClick?: (notification: NotificationMessage) => void;
  userCountryName?: string;
}

export default function TopLeftIcon({
  onClick,
  isOpen,
  onClose,
  notifications = [],
  onClearAll,
  onActionClick,
  onCrackdownClick,
  onRedirectClick,
  userCountryName,
}: TopLeftIconProps) {
  const [mounted, setMounted] = useState(false);
  const [toastNotification, setToastNotification] = useState<NotificationMessage | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [selectedNotificationId, setSelectedNotificationId] = useState<string | null>(null);
  const dismissedToastIdRef = useRef<string | null>(null);
  const visibleNotifications = useMemo(() => {
    const seen = new Set<string>();
    return notifications.filter(notification => {
      if (!notification || isNonActionableUpdateNotification(notification)) return false;
      if (seen.has(notification.id)) return false;
      seen.add(notification.id);
      return true;
    });
  }, [notifications]);
  const unreadCount = visibleNotifications.filter(n => !n.isRead).length;
  const orderedNotifications = useMemo(() => {
    return [...visibleNotifications].sort((first, second) => {
      const firstArrivalDate = first.diplomacyArrivalDate;
      const secondArrivalDate = second.diplomacyArrivalDate;
      if (firstArrivalDate && secondArrivalDate) {
        const arrivalDateOrder = firstArrivalDate.localeCompare(secondArrivalDate);
        if (arrivalDateOrder !== 0) return arrivalDateOrder;
        return (first.diplomacyArrivalDays ?? 0) - (second.diplomacyArrivalDays ?? 0);
      }
      if (firstArrivalDate) return -1;
      if (secondArrivalDate) return 1;
      return 0;
    });
  }, [visibleNotifications]);

  useEffect(() => {
    if (orderedNotifications.length > 0) {
      if (!selectedNotificationId || !orderedNotifications.some(n => n.id === selectedNotificationId)) {
        setSelectedNotificationId(orderedNotifications[0].id);
      }
    } else {
      setSelectedNotificationId(null);
    }
  }, [orderedNotifications, selectedNotificationId]);

  const selectedNotification = useMemo(() => {
    if (!selectedNotificationId) return orderedNotifications[0] || null;
    return orderedNotifications.find(n => n.id === selectedNotificationId) || orderedNotifications[0] || null;
  }, [orderedNotifications, selectedNotificationId]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Popup Toast Otomatis Muncul & Sinkron secara Realtime Saat Ada Notifikasi Belum Dibaca
  useEffect(() => {
    const latestUnread = visibleNotifications.find(n => !n.isRead);

    if (latestUnread) {
      setToastNotification(latestUnread);
      if (dismissedToastIdRef.current !== latestUnread.id) {
        setShowToast(true);
      }
    } else {
      setToastNotification(null);
      setShowToast(false);
    }
  }, [visibleNotifications]);

  useEffect(() => {
    if (!showToast || !toastNotification) return;

    const timer = window.setTimeout(() => {
      dismissedToastIdRef.current = toastNotification.id;
      setShowToast(false);
    }, 3000);

    return () => window.clearTimeout(timer);
  }, [showToast, toastNotification?.id]);



  const renderActiveNotificationDetail = (notif: NotificationMessage) => {
    const handleAction = onActionClick ? () => onActionClick(notif) : undefined;
    const handleCrackdown = onCrackdownClick ? () => onCrackdownClick(notif) : undefined;
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
    if (tradeType === 'bencana_alam' && (notif as any).eventType !== 'police') {
      return (
        <BencanaNotification
          key={notif.id}
          notification={notif as any}
          onAccept={handleAction}
          onReject={handleRedirect}
        />
      );
    }
    if (tradeType === 'keamanan' || (tradeType === 'bencana_alam' && (notif as any).eventType === 'police')) {
      return (
        <KeamananNotificationCard
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
          userCountryName={userCountryName}
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
    if (tradeType === 'icbm' || tradeType === 'program_nuklir_dimulai' || tradeType === 'program_nuklir_selesai' || tradeType === 'ujicoba_nuklir') {
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
    if (tradeType === 'demonstrasi_rakyat') {
      return (
        <DemonstrasiEkonomiNotificationCard
          key={notif.id}
          notification={notif as any}
          onAction={(actionType) => {
            if (onActionClick) onActionClick(notif, actionType);
          }}
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
    if (tradeType === 'defisit_populasi') {
      return (
        <PopulasiDefisitNotificationCard
          key={notif.id}
          notification={notif as any}
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
        return <PeringkatNotification key={notif.id} notification={notif} onCrackdownClick={handleCrackdown} />;
      case 'kesejahteraan':
        return <KesejahteraanNotification key={notif.id} notification={notif} />;
      default:
        return (
          <div key={notif.id} className="bg-[#0F2424] border border-[#00FFAA]/30 p-5 rounded-xl shadow-sm">
            <h4 className="font-bold text-[#00FFAA] text-sm uppercase">{notif.title}</h4>
            <div className="text-xs text-[#6B8A8A] mt-1">Pengirim: {notif.sender || 'Pemerintah'} | {notif.timestamp}</div>
            <div className="text-xs text-[#E0E0E0] mt-3 leading-relaxed">{notif.message}</div>
          </div>
        );
    }
  };

  return (
    <>
      {mounted && createPortal(
        <div className="fixed top-24 left-7 z-[200010] flex flex-col items-start gap-2 pointer-events-auto">
          <button
            onClick={() => {
              if (toastNotification) {
                dismissedToastIdRef.current = toastNotification.id;
              }
              setShowToast(false);
              if (onClick) onClick();
            }}
            title="Inbox - Pesan dan Notifikasi"
            className="relative flex h-12 w-12 cursor-pointer items-center justify-center transition-transform group hover:scale-110 lg:h-14 lg:w-14 xl:h-16 xl:w-16"
          >
            <div className="relative flex h-full w-full items-center justify-center">
              <Image
                src="/images/game/interface/menu/inbox.svg"
                alt="Inbox"
                width={72}
                height={72}
                priority
                className="h-14 w-14 object-contain brightness-125 saturate-150 drop-shadow-[0_0_6px_rgba(0,255,170,0.55)] lg:h-16 lg:w-16 xl:h-[4.5rem] xl:w-[4.5rem]"
              />
              {unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-black text-white shadow-lg border-2 border-[#0A1A1A] animate-pulse">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </div>
              )}
            </div>
          </button>

          {/* Toast Notification Box */}
          <div
            className={`transition-[opacity,transform] duration-300 ease-out origin-top-left will-change-[opacity,transform] ${showToast && toastNotification
                ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
                : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
              } w-72 rounded-xl border border-[#00FFAA]/40 bg-[#0F2424] p-3 shadow-lg cursor-pointer group`}
            onClick={() => {
              if (toastNotification) {
                dismissedToastIdRef.current = toastNotification.id;
              }
              setShowToast(false);
              if (onClick) onClick();
            }}
          >
            <div className="flex items-center justify-between border-b border-[#00FFAA]/20 pb-1.5">
              <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-[#00FFAA]">
                <span className={`h-2 w-2 rounded-full bg-[#00FFAA] ${showToast ? 'animate-ping' : ''}`} />
                Pesan Baru Masuk
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  dismissedToastIdRef.current = toastNotification?.id || null;
                  setShowToast(false);
                }}
                className="rounded p-0.5 text-slate-400 hover:text-white"
              >
                <X className="h-3.5 w-3.5 text-[#00FFAA]" />
              </button>
            </div>
            <h5 className="mt-1.5 whitespace-normal break-words text-[11px] font-bold leading-snug text-white group-hover:text-[#00FFAA]">
              {toastNotification?.title}
            </h5>
            <div className="mt-1.5 flex items-center justify-between border-t border-[#00FFAA]/10 pt-1">
              <span className="text-[8px] font-semibold text-[#6B8A8A]">{toastNotification?.timestamp}</span>
              <span className="text-[9px] font-black text-[#00FFAA] underline transition-transform group-hover:translate-x-1">
                Buka Inbox ({unreadCount}) →
              </span>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* 🔥 Inbox Modal Prototype (2 Kolom: Master List di Kiri & Detail Konten di Kanan) */}
      {isOpen && mounted && createPortal(
        <div className="fixed inset-0 z-[100000] flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 pointer-events-none">
          <div className="bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[940px] xl:max-w-[1040px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans pointer-events-auto shadow-2xl">

            {/* 🔥 HEADER MODAL */}
            <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-[#00FFAA]/20 flex items-center justify-between bg-[#0A1A1A] relative z-10 shrink-0 rounded-t-2xl">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg border border-[#00FFAA]/30 bg-[#0F2424] shrink-0 text-[#00FFAA]">
                  <Inbox className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-[#00FFAA] tracking-tight leading-none uppercase">
                    Inbox & Notifikasi
                  </h2>
                  <span className="text-[9px] font-bold text-[#6B8A8A] uppercase tracking-wider">
                    {orderedNotifications.length} Pesan ({unreadCount} Belum Dibaca)
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={onClose}
                  className="p-1.5 sm:p-2 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] text-[#00FFAA] hover:bg-[#00FFAA] hover:text-[#0A1A1A] transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1.5"
                >
                  <span className="text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* 🔥 BODY MODAL: 2-COLUMN SPLIT PROTOTYPE */}
            <div className="flex-1 flex overflow-hidden bg-[#0A1A1A]">
              {visibleNotifications.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 max-w-md mx-auto my-auto p-6">
                  <Inbox className="h-16 w-16 text-[#00FFAA]/30" />
                  <h4 className="text-lg font-bold text-[#00FFAA] uppercase">Tidak Ada Pesan</h4>
                  <div className="text-xs text-[#6B8A8A]">Kotak masuk Anda bersih. Tidak ada notifikasi atau penawaran yang tertunda.</div>
                </div>
              ) : (
                <>
                  {/* === KOLOM KIRI: DAFTAR PESAN / MASTER LIST === */}
                  <div className="w-[42%] sm:w-[40%] lg:w-[36%] flex flex-col border-r border-[#00FFAA]/20 bg-[#081515] overflow-hidden shrink-0">
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-2 sm:p-2.5 space-y-1.5">
                      {orderedNotifications.map((notif) => {
                        const isSelected = selectedNotification?.id === notif.id;
                        const notifSender = String(notif.sender || (notif as any).partnerCountry || (notif as any).proposerCountry || 'Pemerintah');
                        const countryIso = getIsoForCountryName(notifSender);
                        const isUrgent = notif.title?.toLowerCase().includes('peringatan') || notif.title?.toLowerCase().includes('krisis') || notif.title?.toLowerCase().includes('diserang');

                        return (
                          <div
                            key={notif.id}
                            onClick={() => setSelectedNotificationId(notif.id)}
                            className={`group relative rounded-xl p-2.5 sm:p-3 transition-all cursor-pointer border flex items-center gap-2.5 sm:gap-3 ${isSelected
                                ? 'bg-[#00FFAA]/15 border-[#00FFAA] shadow-[0_0_12px_rgba(0,255,170,0.2)]'
                                : 'bg-[#0F2424]/60 border-[#00FFAA]/15 hover:bg-[#0F2424] hover:border-[#00FFAA]/40'
                              }`}
                          >
                            {/* Avatar / Country Flag / Persona */}
                            <div className="relative shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#0A1A1A] border border-[#00FFAA]/30 overflow-hidden flex items-center justify-center shadow">
                              {countryIso && countryIso !== 'un' ? (
                                <img
                                  src={`https://flagcdn.com/w80/${countryIso.toLowerCase()}.png`}
                                  alt={notifSender}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://flagcdn.com/w80/un.png';
                                  }}
                                />
                              ) : (
                                <User className="w-4 h-4 text-[#00FFAA]" />
                              )}
                              {!notif.isRead && (
                                <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                              )}
                            </div>

                            {/* Info Singkat */}
                            <div className="flex-1 min-w-0">
                              {/* PERBAIKAN: Menghapus truncate dan menambahkan break-words agar judul wrap ke bawah */}
                              <h4 className={`text-[11px] sm:text-xs font-black leading-tight whitespace-normal break-words ${isUrgent ? 'text-rose-400' : isSelected ? 'text-[#00FFAA]' : 'text-[#E0E0E0]'
                                }`}>
                                {notif.title}
                              </h4>
                              {/* PERBAIKAN: Menambahkan flex-wrap pada container dan menghapus truncate di span */}
                              <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 mt-1 text-[9px] text-[#6B8A8A] font-semibold">
                                {countryIso && countryIso !== 'un' && (
                                  <img
                                    src={`https://flagcdn.com/w20/${countryIso.toLowerCase()}.png`}
                                    alt=""
                                    className="w-3.5 h-2.5 object-cover rounded-xs shrink-0"
                                  />
                                )}
                                <span className="whitespace-normal break-words">{notifSender}</span>
                                <span className="ml-auto shrink-0 flex items-center gap-0.5 text-[8.5px] text-[#557575]">
                                  <Clock className="w-2.5 h-2.5" />
                                  {notif.timestamp}
                                </span>
                              </div>
                            </div>

                            <ChevronRight className={`w-3.5 h-3.5 shrink-0 transition-transform ${isSelected ? 'text-[#00FFAA] translate-x-0.5' : 'text-[#6B8A8A]/50 group-hover:text-[#00FFAA]'
                              }`} />
                          </div>
                        );
                      })}
                    </div>

                    {/* Tombol Bersihkan Semua di Footer Kolom Kiri */}
                    {visibleNotifications.length > 0 && onClearAll && (
                      <div className="p-2 sm:p-2.5 border-t border-[#00FFAA]/20 bg-[#051111]">
                        <button
                          onClick={onClearAll}
                          className="w-full py-2 px-3 rounded-lg border border-red-500/40 bg-red-950/30 text-red-400 hover:bg-red-900/50 hover:text-red-300 transition-all cursor-pointer font-bold text-[10px] sm:text-xs uppercase flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Hapus Semua Pesan</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* === KOLOM KANAN: DETAIL KONTEN & AKSI === */}
                  <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 bg-[#0A1A1A]">
                    {selectedNotification ? (
                      <div className="max-w-2xl mx-auto space-y-4">
                        {renderActiveNotificationDetail(selectedNotification)}

                        {/* 🔥 Ilustrasi Gambar Notifikasi */}
                        {(() => {
                          const imageUrl = getInboxNotificationImage(selectedNotification);
                          if (!imageUrl) return null;
                          return (
                            <div className="mt-4 rounded-2xl border border-[#00FFAA]/25 bg-[#081515] p-3 shadow-lg flex items-center justify-center overflow-hidden">
                              <img
                                src={imageUrl}
                                alt={selectedNotification.title || 'Ilustrasi Notifikasi'}
                                className="w-full max-h-56 sm:max-h-64 object-contain rounded-xl"
                                onError={(e) => {
                                  // Fallback sembunyikan jika ada error load gambar
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                            </div>
                          );
                        })()}
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center text-center text-slate-500 text-xs">
                        Pilih pesan di sebelah kiri untuk melihat detail.
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}