import React from 'react';
import { Bomb, Check, X, ShieldAlert } from 'lucide-react';
import { SabotaseNotification } from './sabotaseLogic';

interface SabotaseNotificationProps {
  notification: SabotaseNotification;
  onAccept?: () => void;
  onReject?: () => void;
}

export default function SabotaseNotificationCard({ notification, onAccept, onReject }: SabotaseNotificationProps) {
  const isHandled = notification.isHandled;

  return (
    <div className={`border-l-4 ${isHandled ? 'bg-emerald-950/30 border-emerald-500' : 'bg-red-950/40 border-red-500'} p-4 sm:p-5 rounded-r-2xl shadow-lg flex gap-4 items-start select-none relative overflow-hidden transition-all border border-red-500/20`}>
      <div className={`w-11 h-11 rounded-xl ${isHandled ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'bg-red-500/20 border-red-500/40 text-red-400'} border flex items-center justify-center shrink-0 shadow-inner`}>
        {isHandled ? <Check className="w-6 h-6 text-emerald-400" /> : <Bomb className="w-6 h-6 animate-bounce text-red-400" />}
      </div>

      <div className="flex-1 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-sm font-black text-white uppercase tracking-wide leading-tight">
            {notification.title}
          </h4>
          <span className="text-[10px] font-bold text-red-300 bg-red-900/60 px-2.5 py-0.5 rounded-full border border-red-500/40 uppercase tracking-wider">
            Sabotase ({notification.sabotaseType})
          </span>
        </div>

        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Pelaku Terduga: {notification.partnerCountry} | Tanggal: {notification.timestamp}
        </p>

        <p className="text-xs font-medium text-slate-200 leading-relaxed pt-0.5">
          {notification.message}
        </p>

        <div className="bg-[#0A1A1A] border border-red-500/30 rounded-xl p-2.5 text-xs text-red-300 font-bold flex items-center justify-between">
          <span>Kerusakan: {notification.effectText}</span>
          <span className="text-amber-400 font-black">Investigasi & Perbaikan: {notification.costEM} EM</span>
        </div>

        <div className="pt-2 flex items-center justify-end gap-2.5">
          {isHandled ? (
            <div className="text-[11px] font-bold text-emerald-400 bg-emerald-950/80 px-3 py-1.5 rounded-xl border border-emerald-500/50 flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5" />
              <span>KERUSAKAN PERBAIKAN & PENANGANAN SELESAI</span>
            </div>
          ) : (
            <>
              {onReject && (
                <button
                  onClick={onReject}
                  className="px-3.5 py-1.5 text-[10px] font-black uppercase tracking-wider bg-rose-950/60 hover:bg-rose-900 border border-rose-500/40 text-rose-300 rounded-xl transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
                >
                  <X className="w-3.5 h-3.5" />
                  Biarkan (Pemulihan Alami 14 Hari)
                </button>
              )}
              {onAccept && (
                <button
                  onClick={onAccept}
                  className="px-4 py-1.5 text-[10px] font-black uppercase tracking-wider bg-[#00FFAA] hover:bg-emerald-400 text-[#0A1A1A] rounded-xl transition-all cursor-pointer shadow-[0_0_15px_rgba(0,255,170,0.3)] flex items-center gap-1.5 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Investigasi & Perbaiki ({notification.costEM} EM)
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
