// File: DemonstrasiEkonomiNotificationCard.tsx
import React from 'react';
import { Flame, Megaphone, ShieldAlert, MessageSquare, Banknote, EyeOff, Tv, AlertTriangle } from 'lucide-react';
import { DemonstrasiNotification } from './demonstrasiEkonomiLogic';

interface Props {
  notification: DemonstrasiNotification;
  onAction?: (actionType: 'hard_power' | 'dialog' | 'fulfill' | 'ignore' | 'distraction') => void;
}

export default function DemonstrasiEkonomiNotificationCard({ notification, onAction }: Props) {
  const isEkstrem = notification.severity === 'ekstrem';
  const isHandled = notification.demo_status === 'selesai' || notification.demo_status === 'kerusuhan';

  return (
    <div className={`border-l-4 ${isEkstrem ? 'bg-rose-950/50 border-rose-500' : 'bg-amber-950/40 border-amber-500'} p-4 sm:p-5 rounded-r-2xl flex flex-col gap-4 select-none relative border ${isEkstrem ? 'border-rose-500/30' : 'border-amber-500/30'}`}>
      
      {/* HEADER KARTU */}
      <div className="flex gap-4 items-start">
        <div className={`w-12 h-12 rounded-xl ${isEkstrem ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'} border flex items-center justify-center shrink-0`}>
          {isEkstrem ? <Flame className="w-7 h-7 animate-bounce" /> : <Megaphone className="w-6 h-6 animate-pulse" />}
        </div>
        <div className="flex-1 space-y-1">
          <h4 className="text-sm font-black text-white uppercase tracking-wide leading-tight">
            {notification.title}
          </h4>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Pengirim: {notification.sender} | Tanggal: {notification.timestamp}
          </p>
        </div>
      </div>

      {/* ISI PESAN */}
      <p className="text-xs font-medium text-slate-200 leading-relaxed whitespace-pre-wrap">
        {notification.message}
      </p>

      {/* STATUS BADGE */}
      <div className="bg-[#0A1A1A] border border-slate-700/50 rounded-xl p-2.5 text-xs text-slate-300 font-bold flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <ShieldAlert className="w-4 h-4 text-rose-400" />
          <span>Penyebab: <strong className="text-white uppercase">{notification.cause}</strong></span>
        </div>
        <span className={`text-[11px] font-black uppercase ${notification.demo_status === 'selesai' ? 'text-emerald-400' : notification.demo_status === 'kerusuhan' ? 'text-rose-600' : 'text-rose-400'}`}>
          STATUS: {notification.demo_status === 'dialog' ? 'DALAM DIALOG' : notification.demo_status === 'ignored' ? 'DIABAIKAN' : notification.demo_status === 'selesai' ? 'DITANGANI' : notification.demo_status === 'kerusuhan' ? 'KERUSUHAN' : 'GEJOLAK AKTIF'}
        </span>
      </div>

      {/* TOMBOL AKSI (Hanya muncul jika belum ditangani & bukan kerusuhan) */}
      {!isHandled && notification.demo_status !== 'dialog' && notification.demo_status !== 'ignored' && onAction && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2 pt-3 border-t border-slate-700/50">
          <button onClick={() => onAction('hard_power')} className="flex flex-col items-center justify-center gap-1 p-2 rounded-lg bg-rose-900/40 hover:bg-rose-800/60 border border-rose-500/30 text-rose-200 transition-all cursor-pointer">
            <ShieldAlert className="w-4 h-4" />
            <span className="text-[9px] font-bold uppercase text-center">Bubarkan<br/>(Aparat)</span>
          </button>
          
          <button onClick={() => onAction('dialog')} className="flex flex-col items-center justify-center gap-1 p-2 rounded-lg bg-blue-900/40 hover:bg-blue-800/60 border border-blue-500/30 text-blue-200 transition-all cursor-pointer">
            <MessageSquare className="w-4 h-4" />
            <span className="text-[9px] font-bold uppercase text-center">Dialog<br/>Terbuka</span>
          </button>

          <button onClick={() => onAction('fulfill')} className="flex flex-col items-center justify-center gap-1 p-2 rounded-lg bg-emerald-900/40 hover:bg-emerald-800/60 border border-emerald-500/30 text-emerald-200 transition-all cursor-pointer">
            <Banknote className="w-4 h-4" />
            <span className="text-[9px] font-bold uppercase text-center">Penuhi<br/>Tuntutan</span>
          </button>

          <button onClick={() => onAction('distraction')} className="flex flex-col items-center justify-center gap-1 p-2 rounded-lg bg-purple-900/40 hover:bg-purple-800/60 border border-purple-500/30 text-purple-200 transition-all cursor-pointer">
            <Tv className="w-4 h-4" />
            <span className="text-[9px] font-bold uppercase text-center">Pengalihan<br/>Isu</span>
          </button>

          <button onClick={() => onAction('ignore')} className="flex flex-col items-center justify-center gap-1 p-2 rounded-lg bg-slate-800/40 hover:bg-slate-700/60 border border-slate-500/30 text-slate-300 transition-all cursor-pointer col-span-2 md:col-span-1">
            <EyeOff className="w-4 h-4" />
            <span className="text-[9px] font-bold uppercase text-center">Abaikan<br/>Demo</span>
          </button>
        </div>
      )}

      {notification.demo_status === 'dialog' && (
         <div className="mt-2 text-center p-2 bg-blue-900/30 border border-blue-500/30 rounded-lg text-blue-300 text-[10px] font-bold uppercase">
            ⏳ Negosiasi sedang berlangsung... (Selesai pada {notification.demo_deadline})
         </div>
      )}
    </div>
  );
}