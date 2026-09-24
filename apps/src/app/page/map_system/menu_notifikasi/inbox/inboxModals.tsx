'use client';

import React from 'react';
import { Inbox, X, Trash2 } from 'lucide-react';
import { NotificationMessage } from './logic/1_notifikasi_pokok/1_kepuasan_dan_peringkat/1_kepuasan/kepuasanLogic';
import KepuasanNotification from './logic/1_notifikasi_pokok/1_kepuasan_dan_peringkat/1_kepuasan/kepuasanNotification';
import PeringkatNotification from './logic/1_notifikasi_pokok/1_kepuasan_dan_peringkat/2_peringkat/peringkatNotification';
import KesejahteraanNotification from './logic/1_notifikasi_pokok/1_kepuasan_dan_peringkat/3_kesejahteraan/kesejahteraanNotification';
import TradeBeliNotification from './logic/1_notifikasi_pokok/4_perdagangan/2_beli/tradeBeliNotification';
import TradeJualNotification from './logic/1_notifikasi_pokok/4_perdagangan/1_jual/tradeJualNotification';

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
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <>
      <button
        onClick={onClick}
        title="Inbox - Pesan dan Notifikasi"
        className="fixed top-24 left-7 z-[100] w-9 h-9 lg:w-10 lg:h-10 xl:w-12 xl:h-12 rounded-full bg-[#0F2424] border border-[#00FFAA]/40 text-[#00FFAA] hover:bg-[#00FFAA] hover:text-[#0A1A1A] shadow-[0_4px_12px_rgba(0,0,0,0.4)] flex items-center justify-center cursor-pointer transition-all group"
      >
        <Inbox className="w-4 h-4 lg:w-5 lg:h-5 xl:w-6 xl:h-6 transition-transform group-hover:scale-110" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 border border-[#0A1A1A] text-white text-[9px] font-black w-4 h-4 lg:w-5 lg:h-5 rounded-full flex items-center justify-center shadow animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* 🔥 Inbox Modal - Ukuran dan Tema Konsisten dengan Modal Lainnya */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none">
          <div className="bg-[#0F2424]/90 backdrop-blur-md border border-[#00FFAA]/30 rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans pointer-events-auto shadow-2xl">

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
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#0A1A1A]/80 relative z-10 custom-scrollbar flex flex-col">
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
                    switch (notif.type) {
                      case 'kepuasan':
                        if ((notif as any).tradeType === 'jual') {
                          return (
                            <TradeJualNotification
                              key={notif.id}
                              notification={notif}
                              onAccept={handleAction}
                              onReject={handleRedirect}
                            />
                          );
                        }
                        return <KepuasanNotification key={notif.id} notification={notif} onActionClick={handleAction} onRedirectClick={handleRedirect} />;
                      case 'peringkat':
                        return <PeringkatNotification key={notif.id} notification={notif} onActionClick={handleAction} onRedirectClick={handleRedirect} />;
                      case 'kesejahteraan':
                        if ((notif as any).tradeType === 'beli') {
                          return (
                            <TradeBeliNotification
                              key={notif.id}
                              notification={notif}
                              onAccept={handleAction}
                              onReject={handleRedirect}
                            />
                          );
                        }
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
        </div>
      )}
    </>
  );
}