import React from 'react';
import { ShieldAlert, Check, X, Shield, Clock } from 'lucide-react';
import { BantuanSekutuNotification, BANTUAN_SEKUTU_CONFIG } from './bantuanSekutuLogic';

interface BantuanSekutuNotificationProps {
  notification: BantuanSekutuNotification;
  onAccept?: () => void;
  onReject?: () => void;
}

export default function BantuanSekutuNotificationCard({
  notification,
  onAccept,
  onReject,
}: BantuanSekutuNotificationProps) {
  const isHandled = Boolean(notification.isHandled || notification.status !== 'pending');
  const isAccepted = notification.status === 'accepted';
  const isExpired = notification.status === 'expired';
  const isRejected = notification.status === 'rejected';

  return (
    <div
      className={`border-l-4 ${
        isAccepted
          ? 'bg-emerald-950/30 border-emerald-500 border-emerald-500/20'
          : isExpired || isRejected
          ? 'bg-slate-900/40 border-slate-600 border-slate-700/30 opacity-75'
          : 'bg-amber-950/40 border-amber-500 border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.15)]'
      } p-4 sm:p-5 rounded-r-2xl shadow-lg flex gap-4 items-start select-none relative overflow-hidden transition-all border`}
    >
      <div
        className={`w-11 h-11 rounded-xl ${
          isAccepted
            ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
            : isExpired || isRejected
            ? 'bg-slate-800 border-slate-700 text-slate-400'
            : 'bg-amber-500/20 border-amber-500/40 text-amber-400'
        } border flex items-center justify-center shrink-0 shadow-inner`}
      >
        {isAccepted ? (
          <Check className="w-6 h-6 text-emerald-400" />
        ) : isExpired || isRejected ? (
          <Shield className="w-6 h-6 text-slate-500" />
        ) : (
          <ShieldAlert className="w-6 h-6 text-amber-400 animate-pulse" />
        )}
      </div>

      <div className="flex-1 space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-sm font-black text-white uppercase tracking-wide leading-tight">
            {notification.title}
          </h4>
          <span
            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${
              isAccepted
                ? 'text-emerald-300 bg-emerald-900/60 border-emerald-500/40'
                : isExpired || isRejected
                ? 'text-slate-400 bg-slate-800 border-slate-700'
                : 'text-amber-300 bg-amber-900/60 border-amber-500/40'
            }`}
          >
            {isAccepted
              ? 'BANTUAN DITERIMA'
              : isExpired
              ? 'PERMINTAAN KEDALUWARSA'
              : isRejected
              ? 'DITOLAK'
              : notification.category}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          <span>Sekutu: <strong className="text-emerald-400">{notification.allyCountry}</strong></span>
          <span>•</span>
          <span>Penyerang: <strong className="text-rose-400">{notification.attackerCountry}</strong></span>
          <span>•</span>
          <span>Tanggal: {notification.timestamp}</span>
        </div>

        <p className="text-xs font-medium text-slate-200 leading-relaxed pt-0.5">
          {notification.message}
        </p>

        {/* Ringkasan Keadaan & Batas Waktu */}
        <div className="bg-root-canvas border border-amber-500/20 rounded-xl p-3 grid grid-cols-2 sm:grid-cols-3 gap-2 text-center text-xs font-bold text-white shadow-inner">
          <div className="border-r border-amber-500/20 pr-1">
            <div className="text-slate-400 text-[9px] uppercase font-bold tracking-wider">Status Aliansi</div>
            <div className="text-emerald-400 font-extrabold mt-0.5">AKTIF</div>
          </div>
          <div className="border-r border-amber-500/20 px-1">
            <div className="text-slate-400 text-[9px] uppercase font-bold tracking-wider">Batas Menjawab</div>
            <div className="text-amber-300 font-extrabold mt-0.5 flex items-center justify-center gap-1">
              <Clock className="w-3 h-3 text-amber-400" />
              <span>{notification.deadlineDate}</span>
            </div>
          </div>
          <div className="col-span-2 sm:col-span-1 pl-1">
            <div className="text-slate-400 text-[9px] uppercase font-bold tracking-wider">Sanksi Tolak</div>
            <div className="text-rose-400 font-extrabold mt-0.5">
              Hubungan {BANTUAN_SEKUTU_CONFIG.relationPenaltyReject}
            </div>
          </div>
        </div>

        {/* Tombol Aksi */}
        <div className="pt-2 flex items-center justify-end gap-2.5">
          {isHandled ? (
            <div className="text-[11px] font-bold text-slate-300 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-700 flex items-center gap-1.5">
              {isAccepted && <Check className="w-3.5 h-3.5 text-emerald-400" />}
              {isRejected && <X className="w-3.5 h-3.5 text-rose-400" />}
              <span>
                {isAccepted
                  ? 'BANTUAN MILITER TELAH DISETUJUI'
                  : isRejected
                  ? 'PERMINTAAN DITOLAK'
                  : 'PERMINTAAN TELAH BERAKHIR / KEDALUWARSA'}
              </span>
            </div>
          ) : (
            <>
              {onReject && (
                <button
                  type="button"
                  onClick={onReject}
                  className="px-3.5 py-1.5 text-[10px] font-black uppercase tracking-wider bg-rose-950/60 hover:bg-rose-900 border border-rose-500/40 text-rose-300 rounded-xl transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
                >
                  <X className="w-3.5 h-3.5" />
                  Tolak
                </button>
              )}
              {onAccept && (
                <button
                  type="button"
                  onClick={onAccept}
                  className="px-4 py-1.5 text-[10px] font-black uppercase tracking-wider bg-root-accent hover:bg-emerald-400 text-root-canvas rounded-xl transition-all cursor-pointer shadow-[0_0_15px_rgba(0,255,170,0.3)] flex items-center gap-1.5 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Check className="w-3.5 h-3.5" />
                  Terima Bantuan
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

