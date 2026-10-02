import React from 'react';
import { Utensils, AlertTriangle } from 'lucide-react';
import { PanganDefisitNotification } from './panganDefisitLogic';

interface Props {
  notification: PanganDefisitNotification;
  onAccept?: () => void;
  onReject?: () => void;
}

export default function PanganDefisitNotificationCard({ notification }: Props) {
  const { deficitCount, totalSectors, deficitCommodityNames } = notification;

  return (
    <div className="border-l-4 bg-rose-950/40 border-rose-500 p-4 sm:p-5 rounded-r-2xl shadow-lg flex gap-4 items-start select-none relative overflow-hidden transition-all border border-rose-500/30">
      <div className="w-11 h-11 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center shrink-0 shadow-inner">
        <Utensils className="w-6 h-6 text-rose-400 animate-pulse" />
      </div>

      <div className="flex-1 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-sm font-black text-white uppercase tracking-wide leading-tight">
            {notification.title}
          </h4>
          <span className="text-[10px] font-black text-rose-300 bg-rose-900/80 border border-rose-500/50 px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-rose-400 animate-bounce" />
            {deficitCount} Sektor Defisit (🚨 Kritis)
          </span>
        </div>

        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Pengirim: {notification.sender} | Tanggal: {notification.timestamp}
        </p>

        <p className="text-xs font-medium text-slate-200 leading-relaxed pt-0.5">
          {notification.message}
        </p>

        <div className="bg-[#0A1A1A] border border-rose-500/20 rounded-xl p-2.5 text-xs space-y-1">
          <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase">
            <span>Daftar Sektor Defisit ({deficitCount} dari {totalSectors}):</span>
          </div>
          <div className="flex flex-wrap gap-1 pt-1">
            {deficitCommodityNames.map((name, i) => (
              <span key={i} className="px-2 py-0.5 rounded-md bg-rose-950/80 border border-rose-500/40 text-[10px] font-bold text-rose-300">
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
