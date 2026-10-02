// bencanaNotification.tsx
// Component UI Notifikasi Bencana Alam di Inbox

import React from 'react';
import { AlertTriangle, Flame, ShieldAlert, Check, X } from 'lucide-react';
import { BencanaAlamNotification } from './bencanaLogic';

interface BencanaNotificationProps {
  notification: BencanaAlamNotification;
  onAccept?: () => void;
  onReject?: () => void;
}

export default function BencanaNotification({ notification, onAccept, onReject }: BencanaNotificationProps) {
  const isHandled = notification.isHandled;

  return (
    <div className={`border-l-4 ${isHandled ? 'bg-emerald-950/30 border-emerald-500' : 'bg-rose-950/40 border-rose-500'} p-4 sm:p-5 rounded-r-2xl shadow-lg flex gap-4 items-start select-none relative overflow-hidden transition-all border border-rose-500/20`}>
      {/* Icon */}
      <div className={`w-11 h-11 rounded-xl ${isHandled ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'bg-rose-500/20 border-rose-500/40 text-rose-400'} border flex items-center justify-center shrink-0 shadow-inner`}>
        {isHandled ? <Check className="w-6 h-6 text-emerald-400" /> : <Flame className="w-6 h-6 animate-pulse" />}
      </div>

      <div className="flex-1 space-y-2">
        {/* Header Title & Category */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-sm font-black text-white uppercase tracking-wide leading-tight">
            {notification.title}
          </h4>
          <span className="text-[10px] font-bold text-rose-300 bg-rose-900/60 px-2.5 py-0.5 rounded-full border border-rose-500/40 uppercase tracking-wider">
            {notification.category || 'Bencana Alam'}
          </span>
        </div>

        {/* Sender & Timestamp */}
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Pengirim: {notification.sender} | Tanggal: {notification.timestamp}
        </p>

        {/* Message */}
        <p className="text-xs font-medium text-slate-200 leading-relaxed pt-0.5">
          {notification.message}
        </p>

        {/* Details Grid: Korban & Kerugian */}
        <div className="bg-[#0A1A1A] border border-rose-500/30 rounded-xl p-3 grid grid-cols-3 gap-2 text-center text-xs font-bold text-white shadow-inner">
          <div className="border-r border-rose-500/20 pr-1">
            <div className="text-slate-400 text-[9px] uppercase font-bold tracking-wider">Korban Terdampak</div>
            <div className="text-rose-400 font-extrabold mt-0.5">{notification.korban?.toLocaleString('id-ID')} Jiwa</div>
          </div>
          <div className="border-r border-rose-500/20 px-1">
            <div className="text-slate-400 text-[9px] uppercase font-bold tracking-wider">Total Kerugian</div>
            <div className="text-amber-400 font-extrabold mt-0.5">{notification.totalKerugian?.toLocaleString('id-ID')} NEO</div>
          </div>
          <div className="pl-1">
            <div className="text-slate-400 text-[9px] uppercase font-bold tracking-wider">Alokasi Bantuan (1 NEO/Jiwa)</div>
            <div className="text-[#00FFAA] font-extrabold mt-0.5">{notification.bantuanCost?.toLocaleString('id-ID')} NEO</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex items-center justify-end gap-2.5">
          {isHandled ? (
            <div className="text-[11px] font-bold text-emerald-400 bg-emerald-950/80 px-3 py-1.5 rounded-xl border border-emerald-500/50 flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5" />
              <span>BANTUAN SEBESAR {notification.bantuanCost?.toLocaleString('id-ID')} NEO TELAH DISALURKAN</span>
            </div>
          ) : (
            <>
              {onReject && (
                <button
                  onClick={onReject}
                  className="px-3.5 py-1.5 text-[10px] font-black uppercase tracking-wider bg-rose-950/60 hover:bg-rose-900 border border-rose-500/40 text-rose-300 rounded-xl transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
                >
                  <X className="w-3.5 h-3.5" />
                  Abaikan / Tolak
                </button>
              )}
              {onAccept && (
                <button
                  onClick={onAccept}
                  className="px-4 py-1.5 text-[10px] font-black uppercase tracking-wider bg-[#00FFAA] hover:bg-emerald-400 text-[#0A1A1A] rounded-xl transition-all cursor-pointer shadow-[0_0_15px_rgba(0,255,170,0.3)] flex items-center gap-1.5 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Check className="w-3.5 h-3.5" />
                  Bantu Korban ({notification.bantuanCost?.toLocaleString('id-ID')} NEO)
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
