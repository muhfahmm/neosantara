import React from 'react';
import { Flame, AlertTriangle, ArrowRight, ShieldAlert } from 'lucide-react';
import { HubunganPanasNotification } from './hubunganPanasLogic';

interface HubunganPanasNotificationCardProps {
  notification: HubunganPanasNotification;
  onAccept?: () => void;
  onRedirect?: () => void;
}

export default function HubunganPanasNotificationCard({
  notification,
  onAccept,
  onRedirect
}: HubunganPanasNotificationCardProps) {
  const score = notification.relationScore;
  const isExtreme = score <= 5;

  return (
    <div className={`border-l-4 ${isExtreme ? 'bg-rose-950/60 border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.3)]' : 'bg-amber-950/50 border-amber-500'} p-4 sm:p-5 rounded-r-2xl shadow-lg flex gap-4 items-start select-none relative overflow-hidden transition-all border border-rose-500/30`}>
      <div className={`w-11 h-11 rounded-xl ${isExtreme ? 'bg-rose-500/20 border-rose-500/50 text-rose-400' : 'bg-amber-500/20 border-amber-500/50 text-amber-400'} border flex items-center justify-center shrink-0 shadow-inner`}>
        {isExtreme ? <ShieldAlert className="w-6 h-6 animate-bounce text-rose-400" /> : <Flame className="w-6 h-6 animate-pulse text-amber-400" />}
      </div>

      <div className="flex-1 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-sm font-black text-white uppercase tracking-wide leading-tight">
            {notification.title}
          </h4>
          <span className={`text-[10px] font-extrabold ${isExtreme ? 'text-rose-300 bg-rose-900/80 border-rose-500/50 animate-pulse' : 'text-amber-300 bg-amber-900/80 border-amber-500/50'} px-2.5 py-0.5 rounded-full border uppercase tracking-wider flex items-center gap-1`}>
            <AlertTriangle className="w-3 h-3" />
            Skor: {score}/100
          </span>
        </div>

        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Pengirim: {notification.sender} | Tanggal: {notification.timestamp}
        </p>

        <p className="text-xs font-medium text-slate-200 leading-relaxed pt-0.5">
          {notification.message}
        </p>

        <div className="pt-2 flex items-center justify-end gap-2.5">
          {onAccept && (
            <button
              onClick={onAccept}
              className="px-4 py-1.5 text-[10px] font-black uppercase tracking-wider bg-[#00FFAA] hover:bg-emerald-400 text-[#0A1A1A] rounded-xl transition-all cursor-pointer shadow-[0_0_15px_rgba(0,255,170,0.3)] flex items-center gap-1.5 hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Perbaiki Diplomasi</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
