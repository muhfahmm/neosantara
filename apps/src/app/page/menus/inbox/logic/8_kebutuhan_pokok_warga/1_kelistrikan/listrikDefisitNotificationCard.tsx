import React from 'react';
import { Zap, AlertTriangle } from 'lucide-react';
import { ListrikDefisitNotification } from './listrikDefisitLogic';

interface Props {
  notification: ListrikDefisitNotification;
  onAccept?: () => void;
  onReject?: () => void;
}

export default function ListrikDefisitNotificationCard({ notification }: Props) {
  const { totalProduction, totalConsumption, deficitMW, deficitStep } = notification;

  return (
    <div className="border-l-4 bg-rose-950/40 border-rose-500 p-4 sm:p-5 rounded-r-2xl shadow-lg flex gap-4 items-start select-none relative overflow-hidden transition-all border border-rose-500/30">
      <div className="w-11 h-11 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center shrink-0 shadow-inner">
        <Zap className="w-6 h-6 text-rose-400 animate-pulse" />
      </div>

      <div className="flex-1 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-sm font-black text-white uppercase tracking-wide leading-tight">
            {notification.title}
          </h4>
          <span className="text-[10px] font-black text-rose-300 bg-rose-900/80 border border-rose-500/50 px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-rose-400 animate-bounce" />
            Defisit -{deficitStep}%
          </span>
        </div>

        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Pengirim: {notification.sender} | Tanggal: {notification.timestamp}
        </p>

        <p className="text-xs font-medium text-slate-200 leading-relaxed pt-0.5">
          {notification.message}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-[#0A1A1A] border border-rose-500/20 rounded-xl p-2.5 text-xs">
          <div className="flex flex-col">
            <span className="text-[9px] font-bold text-slate-400 uppercase">Produksi Aktif</span>
            <span className="text-emerald-400 font-black">{totalProduction.toLocaleString('id-ID')} MW</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-bold text-slate-400 uppercase">Konsumsi Terestimasi</span>
            <span className="text-rose-400 font-black">{totalConsumption.toLocaleString('id-ID', { maximumFractionDigits: 2 })} MW</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-bold text-slate-400 uppercase">Defisit Daya</span>
            <span className="text-rose-400 font-black">-{deficitMW.toLocaleString('id-ID', { maximumFractionDigits: 2 })} MW</span>
          </div>
        </div>
      </div>
    </div>
  );
}
