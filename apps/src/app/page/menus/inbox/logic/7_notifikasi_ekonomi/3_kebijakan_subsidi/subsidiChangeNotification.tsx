import React from 'react';
import { HandHelping, Check, AlertTriangle } from 'lucide-react';
import { SubsidiChangeNotification } from './subsidiChangeLogic';

interface SubsidiChangeNotificationProps {
  notification: SubsidiChangeNotification;
  onAccept?: () => void;
  onReject?: () => void;
}

export default function SubsidiChangeNotificationCard({ notification, onAccept, onReject }: SubsidiChangeNotificationProps) {
  const isSubsidized = notification.isSubsidized;

  return (
    <div className={`border-l-4 ${isSubsidized ? 'bg-emerald-950/40 border-emerald-500' : 'bg-rose-950/40 border-rose-500'} p-4 sm:p-5 rounded-r-2xl shadow-lg flex gap-4 items-start select-none relative overflow-hidden transition-all border ${isSubsidized ? 'border-emerald-500/20' : 'border-rose-500/20'}`}>
      <div className={`w-11 h-11 rounded-xl ${isSubsidized ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'bg-rose-500/20 border-rose-500/40 text-rose-400'} border flex items-center justify-center shrink-0 shadow-inner`}>
        {isSubsidized ? <HandHelping className="w-6 h-6 text-emerald-400 animate-bounce" /> : <AlertTriangle className="w-6 h-6 text-rose-400 animate-pulse" />}
      </div>

      <div className="flex-1 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-sm font-black text-white uppercase tracking-wide leading-tight">
            {notification.title}
          </h4>
          <span className={`text-[10px] font-bold ${isSubsidized ? 'text-emerald-300 bg-emerald-900/60 border-emerald-500/40' : 'text-rose-300 bg-rose-900/60 border-rose-500/40'} px-2.5 py-0.5 rounded-full border uppercase tracking-wider`}>
            {isSubsidized ? 'Subsidi Diberikan (Senang)' : 'Subsidi Dicabut (Gejolak)'}
          </span>
        </div>

        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Pengirim: {notification.sender} | Tanggal: {notification.timestamp}
        </p>

        <p className="text-xs font-medium text-slate-200 leading-relaxed pt-0.5">
          {notification.message}
        </p>

        <div className="bg-[#0A1A1A] border border-slate-700/50 rounded-xl p-2.5 text-xs text-slate-300 font-bold flex items-center justify-between">
          <span>Program: {notification.subsidyName}</span>
          <span className={isSubsidized ? 'text-emerald-400 font-black' : 'text-rose-400 font-black'}>
            Status: {isSubsidized ? 'AKTIF' : 'NONAKTIF'}
          </span>
        </div>
      </div>
    </div>
  );
}
