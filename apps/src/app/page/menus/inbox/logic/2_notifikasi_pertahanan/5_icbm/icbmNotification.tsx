import React from 'react';
import { Radio, Check, X, ShieldAlert } from 'lucide-react';
import { ICBMNotification } from './icbmLogic';

interface ICBMNotificationProps {
  notification: ICBMNotification;
  onAccept?: () => void;
  onReject?: () => void;
}

export default function ICBMNotificationCard({ notification, onAccept, onReject }: ICBMNotificationProps) {
  const isHandled = notification.isHandled;

  return (
    <div className={`border-l-4 ${isHandled ? 'bg-emerald-950/30 border-emerald-500' : 'bg-rose-950/70 border-rose-600'} p-4 sm:p-5 rounded-r-2xl shadow-xl flex gap-4 items-start select-none relative overflow-hidden transition-all border border-rose-600/40 animate-pulse`}>
      <div className={`w-11 h-11 rounded-xl ${isHandled ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'bg-rose-600/30 border-rose-500/50 text-rose-400'} border flex items-center justify-center shrink-0 shadow-inner`}>
        {isHandled ? <Check className="w-6 h-6 text-emerald-400" /> : <Radio className="w-6 h-6 animate-ping text-rose-400" />}
      </div>

      <div className="flex-1 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-sm font-black text-rose-200 uppercase tracking-wide leading-tight">
            {notification.title}
          </h4>
          <span className="text-[10px] font-black text-rose-100 bg-rose-900/80 px-2.5 py-0.5 rounded-full border border-rose-500/60 uppercase tracking-wider">
            ANCAMAN NUKLIR DEFCON 1
          </span>
        </div>

        <p className="text-[10px] font-bold text-rose-300 uppercase tracking-wider">
          Peluncur: {notification.launcherCountry} | Target: {notification.targetCity} | Waktu: {notification.timestamp}
        </p>

        <p className="text-xs font-medium text-slate-100 leading-relaxed pt-0.5">
          {notification.message}
        </p>

        <div className="bg-[#1A0A0A] border border-rose-500/50 rounded-xl p-2.5 text-xs text-rose-300 font-bold flex items-center justify-between">
          <span>Dampak: {notification.effectText}</span>
          <span className="text-amber-300 font-black">Biaya Pencegatan (Anti-Ballistic System): {notification.costEM} EM</span>
        </div>

        <div className="pt-2 flex items-center justify-end gap-2.5">
          {isHandled ? (
            <div className="text-[11px] font-bold text-emerald-400 bg-emerald-950/80 px-3 py-1.5 rounded-xl border border-emerald-500/50 flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5" />
              <span>RUDAL NUKLIR BERHASIL DICEGAT & DIHANCURKAN DI UDARA</span>
            </div>
          ) : (
            <>
              {onReject && (
                <button
                  onClick={onReject}
                  className="px-3.5 py-1.5 text-[10px] font-black uppercase tracking-wider bg-rose-950/80 hover:bg-rose-900 border border-rose-500/60 text-rose-200 rounded-xl transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
                >
                  <X className="w-3.5 h-3.5" />
                  Pasrah / Tidak Cegat
                </button>
              )}
              {onAccept && (
                <button
                  onClick={onAccept}
                  className="px-4 py-1.5 text-[10px] font-black uppercase tracking-wider bg-rose-500 hover:bg-rose-400 text-white rounded-xl transition-all cursor-pointer shadow-[0_0_20px_rgba(244,63,94,0.6)] flex items-center gap-1.5 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Aktifkan Perisai Rudal ({notification.costEM} EM)
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
