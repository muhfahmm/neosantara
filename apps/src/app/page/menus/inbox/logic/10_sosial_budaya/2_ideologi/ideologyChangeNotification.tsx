import React from 'react';
import { Shield, TrendingUp, TrendingDown, AlertTriangle, Sparkles, AlertCircle } from 'lucide-react';
import { IdeologyChangeNotification } from './ideologyChangeLogic';

interface Props {
  notification: IdeologyChangeNotification;
  onAccept?: () => void;
  onReject?: () => void;
}

export default function IdeologyChangeNotificationCard({ notification }: Props) {
  const { fromIdeology, toIdeology, approvalDelta, mood, eventChain } = notification;
  const isPositive = approvalDelta >= 0;

  const getBadgeStyle = () => {
    switch (mood) {
      case 'euforia':
      case 'senang':
      case 'bangga':
        return 'text-emerald-300 bg-emerald-900/80 border-emerald-500/50';
      case 'panik':
      case 'marah':
      case 'protes':
        return 'text-rose-300 bg-rose-900/80 border-rose-500/50';
      default:
        return 'text-amber-300 bg-amber-900/80 border-amber-500/50';
    }
  };

  return (
    <div className={`border-l-4 ${isPositive ? 'bg-emerald-950/40 border-emerald-500' : 'bg-rose-950/40 border-rose-500'} p-4 sm:p-5 rounded-r-2xl shadow-lg flex gap-4 items-start select-none relative overflow-hidden transition-all border ${isPositive ? 'border-emerald-500/30' : 'border-rose-500/30'}`}>
      <div className={`w-11 h-11 rounded-xl ${isPositive ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'bg-rose-500/20 border-rose-500/40 text-rose-400'} border flex items-center justify-center shrink-0 shadow-inner`}>
        <Shield className={`w-6 h-6 ${isPositive ? 'text-emerald-400 animate-bounce' : 'text-rose-400 animate-pulse'}`} />
      </div>

      <div className="flex-1 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-sm font-black text-white uppercase tracking-wide leading-tight">
            {notification.title}
          </h4>
          <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 border ${getBadgeStyle()}`}>
            {isPositive ? <TrendingUp className="w-3 h-3 text-emerald-400" /> : <TrendingDown className="w-3 h-3 text-rose-400" />}
            Approval: {isPositive ? `+${approvalDelta}%` : `${approvalDelta}%`}
          </span>
        </div>

        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Pengirim: {notification.sender} | Tanggal: {notification.timestamp}
        </p>

        <p className="text-xs font-medium text-slate-200 leading-relaxed pt-0.5">
          {notification.message}
        </p>

        <div className="bg-[#0A1A1A] border border-slate-700/50 rounded-xl p-2.5 text-xs text-slate-300 font-bold flex items-center justify-between">
          <span>Transisi Ideologi: <strong className="text-slate-100">{fromIdeology}</strong> ➔ <strong className="text-[#00FFAA]">{toIdeology}</strong></span>
          <span className={isPositive ? 'text-emerald-400 font-black' : 'text-rose-400 font-black'}>
            Status: {mood.toUpperCase()}
          </span>
        </div>

        {eventChain && eventChain.length > 0 && (
          <div className="bg-[#0F2424] border border-[#00FFAA]/20 rounded-xl p-2.5 space-y-1.5 mt-2">
            <span className="text-[10px] font-black text-[#00FFAA] uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#00FFAA]" />
              Prediksi Dini Event Chain (3 Hari):
            </span>
            <div className="space-y-1">
              {eventChain.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-[10px] text-slate-300">
                  <span>• {item.message}</span>
                  <span className="font-bold text-amber-400">{item.effect}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
