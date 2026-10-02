import React from 'react';
import { Home, AlertTriangle } from 'lucide-react';
import { HunianDefisitNotification } from './hunianDefisitLogic';

interface Props {
  notification: HunianDefisitNotification;
  onAccept?: () => void;
  onReject?: () => void;
}

export default function HunianDefisitNotificationCard({ notification }: Props) {
  const { totalCapacity, population, shortage, percentageMet } = notification;

  return (
    <div className="border-l-4 bg-amber-950/40 border-amber-500 p-4 sm:p-5 rounded-r-2xl shadow-lg flex gap-4 items-start select-none relative overflow-hidden transition-all border border-amber-500/30">
      <div className="w-11 h-11 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0 shadow-inner">
        <Home className="w-6 h-6 text-amber-400 animate-pulse" />
      </div>

      <div className="flex-1 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-sm font-black text-white uppercase tracking-wide leading-tight">
            {notification.title}
          </h4>
          <span className="text-[10px] font-black text-amber-300 bg-amber-900/80 border border-amber-500/50 px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-amber-400 animate-bounce" />
            Terakomodasi: {percentageMet.toFixed(1)}%
          </span>
        </div>

        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Pengirim: {notification.sender} | Tanggal: {notification.timestamp}
        </p>

        <p className="text-xs font-medium text-slate-200 leading-relaxed pt-0.5">
          {notification.message}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-[#0A1A1A] border border-amber-500/20 rounded-xl p-2.5 text-xs">
          <div className="flex flex-col">
            <span className="text-[9px] font-bold text-slate-400 uppercase">Kapasitas Hunian</span>
            <span className="text-emerald-400 font-black">{totalCapacity.toLocaleString('id-ID')} jiwa</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-bold text-slate-400 uppercase">Total Populasi</span>
            <span className="text-slate-200 font-black">{population.toLocaleString('id-ID')} jiwa</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-bold text-slate-400 uppercase">Tunawisma / Defisit</span>
            <span className="text-rose-400 font-black">-{shortage.toLocaleString('id-ID')} jiwa</span>
          </div>
        </div>
      </div>
    </div>
  );
}
