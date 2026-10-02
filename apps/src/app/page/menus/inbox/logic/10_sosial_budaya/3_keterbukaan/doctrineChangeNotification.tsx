import React from 'react';
import { Sliders, TrendingUp, TrendingDown, Shield } from 'lucide-react';
import { DoctrineChangeNotification } from './doctrineChangeLogic';

interface Props {
  notification: DoctrineChangeNotification;
  onAccept?: () => void;
  onReject?: () => void;
}

export default function DoctrineChangeNotificationCard({ notification }: Props) {
  const { sliderLabel, fromValue, toValue, threshold, effects } = notification;
  const isIncrease = toValue >= fromValue;
  const isPositive = threshold === 'above70' || threshold === 'drastic_up' || (isIncrease && threshold !== 'drastic_down');

  return (
    <div className={`border-l-4 ${isPositive ? 'bg-emerald-950/40 border-emerald-500' : 'bg-rose-950/40 border-rose-500'} p-4 sm:p-5 rounded-r-2xl shadow-lg flex gap-4 items-start select-none relative overflow-hidden transition-all border ${isPositive ? 'border-emerald-500/30' : 'border-rose-500/30'}`}>
      <div className={`w-11 h-11 rounded-xl ${isPositive ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'bg-rose-500/20 border-rose-500/40 text-rose-400'} border flex items-center justify-center shrink-0 shadow-inner`}>
        <Sliders className={`w-6 h-6 ${isPositive ? 'text-emerald-400 animate-bounce' : 'text-rose-400 animate-pulse'}`} />
      </div>

      <div className="flex-1 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-sm font-black text-white uppercase tracking-wide leading-tight">
            {notification.title}
          </h4>
          <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 border ${isPositive ? 'text-emerald-300 bg-emerald-900/80 border-emerald-500/50' : 'text-rose-300 bg-rose-900/80 border-rose-500/50'}`}>
            {isIncrease ? <TrendingUp className="w-3 h-3 text-emerald-400" /> : <TrendingDown className="w-3 h-3 text-rose-400" />}
            {sliderLabel}: {fromValue}% ➔ {toValue}%
          </span>
        </div>

        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Pengirim: {notification.sender} | Tanggal: {notification.timestamp}
        </p>

        <p className="text-xs font-medium text-slate-200 leading-relaxed pt-0.5">
          {notification.message}
        </p>

        {effects && effects.length > 0 && (
          <div className="bg-[#0A1A1A] border border-slate-700/50 rounded-xl p-2.5 text-xs text-slate-300 font-bold flex flex-wrap gap-2 items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Dampak Kebijakan:</span>
            <div className="flex flex-wrap gap-1.5">
              {effects.map((eff, i) => (
                <span key={i} className={`px-2 py-0.5 rounded-md border text-[10px] font-black uppercase ${eff.value.startsWith('+') ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300' : 'bg-rose-950/80 border-rose-500/40 text-rose-300'}`}>
                  {eff.stat}: {eff.value}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
