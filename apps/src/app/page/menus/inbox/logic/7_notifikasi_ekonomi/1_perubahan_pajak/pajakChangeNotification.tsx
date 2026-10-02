import React from 'react';
import { FileText, TrendingUp, TrendingDown, Check, AlertTriangle } from 'lucide-react';
import { PajakChangeNotification } from './pajakChangeLogic';

interface PajakChangeNotificationProps {
  notification: PajakChangeNotification;
  onAccept?: () => void;
  onReject?: () => void;
}

export default function PajakChangeNotificationCard({ notification, onAccept, onReject }: PajakChangeNotificationProps) {
  const isIncrease = notification.isIncrease;

  return (
    <div className={`border-l-4 ${isIncrease ? 'bg-amber-950/40 border-amber-500' : 'bg-emerald-950/40 border-emerald-500'} p-4 sm:p-5 rounded-r-2xl shadow-lg flex gap-4 items-start select-none relative overflow-hidden transition-all border ${isIncrease ? 'border-amber-500/20' : 'border-emerald-500/20'}`}>
      <div className={`w-11 h-11 rounded-xl ${isIncrease ? 'bg-amber-500/20 border-amber-500/40 text-amber-400' : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'} border flex items-center justify-center shrink-0 shadow-inner`}>
        {isIncrease ? <TrendingUp className="w-6 h-6 text-amber-400 animate-pulse" /> : <TrendingDown className="w-6 h-6 text-emerald-400 animate-bounce" />}
      </div>

      <div className="flex-1 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-sm font-black text-white uppercase tracking-wide leading-tight">
            {notification.title}
          </h4>
          <span className={`text-[10px] font-bold ${isIncrease ? 'text-amber-300 bg-amber-900/60 border-amber-500/40' : 'text-emerald-300 bg-emerald-900/60 border-emerald-500/40'} px-2.5 py-0.5 rounded-full border uppercase tracking-wider`}>
            {isIncrease ? 'Pajak Naik (Protes)' : 'Pajak Turun (Bahagia)'}
          </span>
        </div>

        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Pengirim: {notification.sender} | Tanggal: {notification.timestamp}
        </p>

        <p className="text-xs font-medium text-slate-200 leading-relaxed pt-0.5">
          {notification.message}
        </p>

        <div className="bg-[#0A1A1A] border border-slate-700/50 rounded-xl p-2.5 text-xs text-slate-300 font-bold flex items-center justify-between">
          <span>Komoditas: {notification.taxName}</span>
          <span className={isIncrease ? 'text-amber-400 font-black' : 'text-emerald-400 font-black'}>
            Perubahan: {notification.oldRate}% ➔ {notification.newRate}%
          </span>
        </div>
      </div>
    </div>
  );
}
