import React from 'react';
import { Landmark, AlertTriangle, ArrowRight, FileText } from 'lucide-react';
import { AIResolusiPBBNotification } from './resolusiPBBLogic';

interface ResolusiPBBNotificationCardProps {
  notification: AIResolusiPBBNotification;
  onAccept?: () => void;
  onRedirect?: () => void;
}

export default function ResolusiPBBNotificationCard({
  notification,
  onAccept,
  onRedirect
}: ResolusiPBBNotificationCardProps) {
  const score = notification.relationScore;

  return (
    <div className="border-l-4 bg-cyan-950/40 border-cyan-400 p-4 sm:p-5 rounded-r-2xl shadow-lg flex gap-4 items-start select-none relative overflow-hidden transition-all border border-cyan-500/30">
      <div className="w-11 h-11 rounded-xl bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 flex items-center justify-center shrink-0 shadow-inner">
        <Landmark className="w-6 h-6 animate-pulse text-cyan-300" />
      </div>

      <div className="flex-1 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-sm font-black text-white uppercase tracking-wide leading-tight">
            {notification.title}
          </h4>
          <span className="text-[10px] font-extrabold text-cyan-300 bg-cyan-900/80 px-2.5 py-0.5 rounded-full border border-cyan-500/50 uppercase tracking-wider flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            Hubungan: {score}/100
          </span>
        </div>

        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Pengusul: {notification.proposerCountry} | Target: {notification.targetCountry} | Tanggal: {notification.timestamp}
        </p>

        <p className="text-xs font-medium text-slate-200 leading-relaxed pt-0.5">
          {notification.message}
        </p>

        <div className="bg-[#051111] border border-cyan-500/30 rounded-xl p-2.5 text-xs text-cyan-300 font-bold flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-cyan-400" />
            {notification.resolutionTitle}
          </span>
        </div>

        <div className="pt-2 flex items-center justify-end gap-2.5">
          {(onAccept || onRedirect) && (
            <button
              onClick={onAccept || onRedirect}
              className="px-4 py-1.5 text-[10px] font-black uppercase tracking-wider bg-[#00FFAA] hover:bg-emerald-400 text-[#0A1A1A] rounded-xl transition-all cursor-pointer shadow-[0_0_15px_rgba(0,255,170,0.3)] flex items-center gap-1.5 hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Buka Sidang PBB</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
