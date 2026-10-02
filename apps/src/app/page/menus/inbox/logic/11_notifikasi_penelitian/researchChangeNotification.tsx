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
      case 'ekonomi': return <Banknote className="w-6 h-6 text-[#00FFAA] animate-bounce" />;
      case 'militer': return <Shield className="w-6 h-6 text-[#00FFAA] animate-bounce" />;
      case 'diplomasi': return <Globe2 className="w-6 h-6 text-[#00FFAA] animate-bounce" />;
      default: return <FlaskConical className="w-6 h-6 text-[#00FFAA] animate-pulse" />;
    }
  };

  return (
    <div className="border-l-4 bg-emerald-950/40 border-[#00FFAA] p-4 sm:p-5 rounded-r-2xl shadow-lg flex gap-4 items-start select-none relative overflow-hidden transition-all border border-[#00FFAA]/30">
      <div className="w-11 h-11 rounded-xl bg-[#00FFAA]/20 border border-[#00FFAA]/40 text-[#00FFAA] flex items-center justify-center shrink-0 shadow-inner">
        {getIcon()}
      </div>

      <div className="flex-1 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-sm font-black text-white uppercase tracking-wide leading-tight">
            {notification.title}
          </h4>
          <span className="text-[10px] font-black text-[#00FFAA] bg-[#00FFAA]/20 border border-[#00FFAA]/40 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            Riset Aktif
          </span>
        </div>

        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Pengirim: {notification.sender} | Tanggal: {notification.timestamp}
        </p>

        <p className="text-xs font-medium text-slate-200 leading-relaxed pt-0.5">
          {notification.message}
        </p>

        <div className="bg-[#0A1A1A] border border-[#00FFAA]/20 rounded-xl p-2.5 text-xs text-slate-300 font-bold flex justify-between items-center">
          <span>Sektor Strategis: <strong className="text-white">{categoryName}</strong></span>
          <span className="text-[10px] font-bold text-[#00FFAA]">{focusScope}</span>
        </div>
      </div>
    </div>
  );
}
