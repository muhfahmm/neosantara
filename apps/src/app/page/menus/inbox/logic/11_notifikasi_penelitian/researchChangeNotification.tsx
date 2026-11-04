import React from 'react';
import { FlaskConical, Banknote, Shield, Globe2 } from 'lucide-react';
import { ResearchChangeNotification } from './researchChangeLogic';

interface Props {
  notification: ResearchChangeNotification;
  onAccept?: () => void;
  onReject?: () => void;
}

export default function ResearchChangeNotificationCard({ notification }: Props) {
  const { categoryKey, categoryName, focusScope } = notification;

  const getIcon = () => {
    switch (categoryKey) {
      case 'ekonomi': return <Banknote className="w-6 h-6 text-root-accent animate-bounce" />;
      case 'militer': return <Shield className="w-6 h-6 text-root-accent animate-bounce" />;
      case 'diplomasi': return <Globe2 className="w-6 h-6 text-root-accent animate-bounce" />;
      default: return <FlaskConical className="w-6 h-6 text-root-accent animate-pulse" />;
    }
  };

  return (
    <div className="border-l-4 bg-emerald-950/40 border-root-accent p-4 sm:p-5 rounded-r-2xl shadow-lg flex gap-4 items-start select-none relative overflow-hidden transition-all border border-root-accent/30">
      <div className="w-11 h-11 rounded-xl bg-root-accent/20 border border-root-accent/40 text-root-accent flex items-center justify-center shrink-0 shadow-inner">
        {getIcon()}
      </div>

      <div className="flex-1 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-sm font-black text-white uppercase tracking-wide leading-tight">
            {notification.title}
          </h4>
          <span className="text-[10px] font-black text-root-accent bg-root-accent/20 border border-root-accent/40 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            Riset Aktif
          </span>
        </div>

        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Pengirim: {notification.sender} | Tanggal: {notification.timestamp}
        </p>

        <p className="text-xs font-medium text-slate-200 leading-relaxed pt-0.5">
          {notification.message}
        </p>

        <div className="bg-root-canvas border border-root-accent/20 rounded-xl p-2.5 text-xs text-slate-300 font-bold flex justify-between items-center">
          <span>Sektor Strategis: <strong className="text-white">{categoryName}</strong></span>
          <span className="text-[10px] font-bold text-root-accent">{focusScope}</span>
        </div>
      </div>
    </div>
  );
}