import React from 'react';
import { ShieldAlert, Check, X, Shield } from 'lucide-react';
import { DefenseAllianceOfferNotification } from './defenseAllianceLogic';

interface DefenseAllianceNotificationCardProps {
  notification: DefenseAllianceOfferNotification;
  onAccept?: () => void;
  onReject?: () => void;
}

export default function DefenseAllianceNotificationCard({
  notification,
  onAccept,
  onReject
}: DefenseAllianceNotificationCardProps) {
  const isHandled = notification.isHandled;
  const status = notification.status;

  return (
    <div className={`border-l-4 ${isHandled ? (status === 'rejected' ? 'bg-rose-950/30 border-rose-500' : 'bg-emerald-950/30 border-emerald-500') : 'bg-indigo-950/40 border-indigo-500'} p-4 sm:p-5 rounded-r-2xl shadow-lg flex gap-4 items-start select-none relative overflow-hidden transition-all border border-indigo-500/20`}>
      <div className={`w-11 h-11 rounded-xl ${isHandled ? (status === 'rejected' ? 'bg-rose-500/20 border-rose-500/40 text-rose-400' : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400') : 'bg-indigo-500/20 border-indigo-500/40 text-indigo-400'} border flex items-center justify-center shrink-0 shadow-inner`}>
        {isHandled ? (status === 'rejected' ? <X className="w-6 h-6 text-rose-400" /> : <Check className="w-6 h-6 text-emerald-400" />) : <Shield className="w-6 h-6 animate-pulse text-indigo-400" />}
      </div>

      <div className="flex-1 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-sm font-black text-white uppercase tracking-wide leading-tight">
            {notification.title}
          </h4>
          <span className="text-[10px] font-bold text-indigo-300 bg-indigo-900/60 px-2.5 py-0.5 rounded-full border border-indigo-500/40 uppercase tracking-wider">
            Aliansi Militer
          </span>
        </div>

        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Pengirim: {notification.sender} | Tanggal: {notification.timestamp}
        </p>

        <p className="text-xs font-medium text-slate-200 leading-relaxed pt-0.5">
          {notification.message}
        </p>

        <div className="pt-2 flex items-center justify-end gap-2.5">
          {isHandled ? (
            <div className={`text-[11px] font-bold ${status === 'rejected' ? 'text-rose-400 bg-rose-950/80 border-rose-500/50' : 'text-emerald-400 bg-emerald-950/80 border-emerald-500/50'} px-3 py-1.5 rounded-xl border flex items-center gap-1.5`}>
              {status === 'rejected' ? <X className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
              <span>{status === 'rejected' ? `ALIANSI PERTAHANAN DENGAN ${notification.partnerCountry} DITOLAK` : `ALIANSI PERTAHANAN RESMI TERBENTUK DENGAN ${notification.partnerCountry}`}</span>
            </div>
          ) : (
            <>
              {onReject && (
                <button
                  onClick={onReject}
                  className="px-3.5 py-1.5 text-[10px] font-black uppercase tracking-wider bg-rose-950/60 hover:bg-rose-900 border border-rose-500/40 text-rose-300 rounded-xl transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
                >
                  <X className="w-3.5 h-3.5" />
                  Tolak Aliansi
                </button>
              )}
              {onAccept && (
                <button
                  onClick={onAccept}
                  className="px-4 py-1.5 text-[10px] font-black uppercase tracking-wider bg-[#00FFAA] hover:bg-emerald-400 text-[#0A1A1A] rounded-xl transition-all cursor-pointer shadow-[0_0_15px_rgba(0,255,170,0.3)] flex items-center gap-1.5 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Bentuk Aliansi Pertahanan
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
