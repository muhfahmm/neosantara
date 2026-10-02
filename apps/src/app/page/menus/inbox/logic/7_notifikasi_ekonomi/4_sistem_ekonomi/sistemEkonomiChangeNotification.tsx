import React from 'react';
import { Scale, TrendingUp, TrendingDown } from 'lucide-react';
import { SistemEkonomiChangeNotification } from './sistemEkonomiChangeLogic';

interface Props {
  notification: SistemEkonomiChangeNotification;
  onAccept?: () => void;
  onReject?: () => void;
}

export default function SistemEkonomiChangeNotificationCard({ notification }: Props) {
  const { sliderValue, systemName, policyChoices } = notification;
  const isCapitalist = sliderValue >= 50;

  return (
    <div className={`border-l-4 ${isCapitalist ? 'bg-emerald-950/40 border-emerald-500' : 'bg-amber-950/40 border-amber-500'} p-4 sm:p-5 rounded-r-2xl shadow-lg flex gap-4 items-start select-none relative overflow-hidden transition-all border ${isCapitalist ? 'border-emerald-500/30' : 'border-amber-500/30'}`}>
      <div className={`w-11 h-11 rounded-xl ${isCapitalist ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'bg-amber-500/20 border-amber-500/40 text-amber-400'} border flex items-center justify-center shrink-0 shadow-inner`}>
        <Scale className="w-6 h-6 animate-pulse" />
      </div>

      <div className="flex-1 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-sm font-black text-white uppercase tracking-wide leading-tight">
            {notification.title}
          </h4>
          <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${isCapitalist ? 'text-emerald-300 bg-emerald-900/80 border-emerald-500/50' : 'text-amber-300 bg-amber-900/80 border-amber-500/50'}`}>
            Spektrum: {sliderValue}%
          </span>
        </div>

        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Pengirim: {notification.sender} | Tanggal: {notification.timestamp}
        </p>

        <p className="text-xs font-medium text-slate-200 leading-relaxed pt-0.5">
          {notification.message}
        </p>

        <div className="bg-[#0A1A1A] border border-slate-700/50 rounded-xl p-2.5 text-xs text-slate-300 font-bold flex justify-between items-center">
          <span>Sistem: <strong className="text-white">{systemName}</strong></span>
          <span className="text-[10px] font-bold text-[#00FFAA]">Kartu Kebijakan Diterapkan</span>
        </div>
      </div>
    </div>
  );
}
