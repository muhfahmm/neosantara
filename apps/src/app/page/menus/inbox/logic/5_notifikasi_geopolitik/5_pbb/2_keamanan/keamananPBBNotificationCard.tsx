import React from 'react';
import { ShieldAlert, AlertTriangle, ArrowRight, Shield } from 'lucide-react';
import { AIKeamananPBBNotification } from './keamananPBBLogic';

interface KeamananPBBNotificationCardProps {
  notification: AIKeamananPBBNotification;
  onAccept?: () => void;
  onRedirect?: () => void;
}

export default function KeamananPBBNotificationCard({
  notification,
  onAccept,
  onRedirect
}: KeamananPBBNotificationCardProps) {
  const score = notification.relationScore;

  return (
    <div className="border-l-4 bg-rose-950/60 border-rose-500 p-4 sm:p-5 rounded-r-2xl shadow-xl flex gap-4 items-start select-none relative overflow-hidden transition-all border border-rose-500/40 animate-pulse">
      <div className="w-11 h-11 rounded-xl bg-rose-500/20 border border-rose-500/50 text-rose-400 flex items-center justify-center shrink-0 shadow-inner">
        <ShieldAlert className="w-6 h-6 animate-bounce text-rose-400" />
      </div>

      <div className="flex-1 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-sm font-black text-rose-200 uppercase tracking-wide leading-tight">
            {notification.title}
          </h4>
          <span className="text-[10px] font-extrabold text-rose-200 bg-rose-900/90 px-2.5 py-0.5 rounded-full border border-rose-500/60 uppercase tracking-wider flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-rose-400" />
            Hubungan: {score}/100
          </span>
        </div>

        <p className="text-[10px] font-bold text-rose-300 uppercase tracking-wider">
          Pengusul: {notification.proposerCountry} | Target: {notification.targetCountry} | Tanggal: {notification.timestamp}
        </p>

        <p className="text-xs font-medium text-slate-100 leading-relaxed pt-0.5">
          {notification.message}
        </p>

        <div className="bg-[#1A0A0A] border border-rose-500/40 rounded-xl p-2.5 text-xs text-rose-300 font-bold flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-rose-400" />
            {notification.actionTitle}
          </span>
        </div>

        <div className="pt-2 flex items-center justify-end gap-2.5">
          {(onAccept || onRedirect) && (
            <button
              onClick={onAccept || onRedirect}
              className="px-4 py-1.5 text-[10px] font-black uppercase tracking-wider bg-rose-500 hover:bg-rose-400 text-white rounded-xl transition-all cursor-pointer shadow-[0_0_15px_rgba(244,63,94,0.4)] flex items-center gap-1.5 hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Dewan Keamanan PBB</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
