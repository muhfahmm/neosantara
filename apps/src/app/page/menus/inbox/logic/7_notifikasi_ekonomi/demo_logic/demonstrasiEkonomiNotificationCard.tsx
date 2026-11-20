import React from 'react';
import { Flame, Megaphone, ShieldAlert, MessageSquare, Banknote, EyeOff } from 'lucide-react';
import { DemonstrasiNotification } from './demonstrasiEkonomiLogic';
import { useLanguage } from '@/app/page/paused_menu/terjemahan_paused_menu/languageLogic';

interface Props {
  notification: DemonstrasiNotification;
  onAction?: (actionType: 'hard_power' | 'dialog' | 'fulfill' | 'ignore') => void;
}

export default function DemonstrasiEkonomiNotificationCard({ notification, onAction }: Props) {
  const { t } = useLanguage();
  const isEkstrem = notification.severity === 'ekstrem';
  const isHandled = notification.demo_status === 'selesai' || notification.demo_status === 'kerusuhan';

  return (
    <div className={`border-l-4 ${isEkstrem ? 'bg-rose-950/50 border-rose-500' : 'bg-amber-950/40 border-amber-500'} p-4 sm:p-5 rounded-r-2xl flex flex-col gap-4 select-none relative border ${isEkstrem ? 'border-rose-500/30' : 'border-amber-500/30'}`}>
      
      {/* HEADER KARTU */}
      <div className="flex gap-4 items-start">
        <div className={`w-12 h-12 rounded-xl ${isEkstrem ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'} border flex items-center justify-center shrink-0`}>
          {isEkstrem ? <Flame className="w-7 h-7" /> : <Megaphone className="w-6 h-6" />}
        </div>
        <div className="flex-1 space-y-1">
          <h4 className="text-sm font-black text-white uppercase tracking-wide leading-tight">
            {notification.title}
          </h4>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            {t('side_inbox.senderPrefix', { sender: notification.sender, date: notification.timestamp }) || `Pengirim: ${notification.sender} | Tanggal: ${notification.timestamp}`}
          </p>
        </div>
      </div>

      {/* ISI PESAN */}
      <p className="text-xs font-medium text-slate-200 leading-relaxed whitespace-pre-wrap">
        {notification.message}
      </p>

      {/* STATUS & MASSA BADGE */}
      <div className="bg-root-canvas border border-slate-700/50 rounded-xl p-2.5 text-xs text-slate-300 font-bold flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span>Penyebab: <strong className="text-white uppercase">{notification.cause}</strong></span>
          </div>
          {notification.demonstratorCount != null && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-950/80 border border-rose-500/40 text-[11px] text-rose-300">
              <span>👥</span>
              <span>Massa: <strong className="text-white font-mono">{Number(notification.demonstratorCount).toLocaleString('id-ID')}</strong> jiwa</span>
            </div>
          )}
        </div>

        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
          notification.demo_status === 'selesai'
            ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
            : notification.demo_status === 'kerusuhan'
            ? 'bg-red-950/80 border-red-500/60 text-red-300 animate-pulse'
            : 'bg-amber-950/80 border-amber-500/50 text-amber-300 animate-pulse'
        }`}>
          Status: {notification.demo_status?.toUpperCase() || 'BERLANGSUNG'}
        </span>
      </div>

      {/* ACTION BUTTONS (HANYA MUNCUL JIKA DEMO BELUM SELESAI / KERUSUHAN) */}
      {!isHandled && onAction && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-slate-800">
          <button
            onClick={() => onAction('hard_power')}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-rose-600/30 hover:bg-rose-600/50 text-rose-300 border border-rose-500/40 transition-all cursor-pointer shadow-sm hover:scale-[1.02] active:scale-[0.98]"
            title="Gunakan aparat keamanan untuk membubarkan massa secara paksa"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Tindak Tegas</span>
          </button>

          <button
            onClick={() => onAction('dialog')}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-300 border border-cyan-500/40 transition-all cursor-pointer shadow-sm hover:scale-[1.02] active:scale-[0.98]"
            title="Lakukan dialog publik dan dengarkan aspirasi demonstran"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Dialog Terbuka</span>
          </button>

          <button
            onClick={() => onAction('fulfill')}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 transition-all cursor-pointer shadow-sm hover:scale-[1.02] active:scale-[0.98]"
            title="Penuhi tuntutan ekonomi demonstran untuk meredakan amarah publik"
          >
            <Banknote className="w-3.5 h-3.5" />
            <span>Penuhi Tuntutan</span>
          </button>

          <button
            onClick={() => onAction('ignore')}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600/50 transition-all cursor-pointer shadow-sm hover:scale-[1.02] active:scale-[0.98]"
            title="Biarkan demonstrasi tanpa intervensi pemerintah"
          >
            <EyeOff className="w-3.5 h-3.5" />
            <span>Abaikan Aksi</span>
          </button>
        </div>
      )}
    </div>
  );
}
