import React from 'react';
import { FlaskConical, Check, X, Atom } from 'lucide-react';
import { ResearchContractOfferNotification } from './researchContractLogic';

interface ResearchContractNotificationCardProps {
  notification: ResearchContractOfferNotification;
  onAccept?: () => void;
  onReject?: () => void;
}

export default function ResearchContractNotificationCard({
  notification,
  onAccept,
  onReject
}: ResearchContractNotificationCardProps) {
  const isHandled = notification.isHandled;
  const status = notification.status;

  return (
    <div className={`border-l-4 ${isHandled ? (status === 'rejected' ? 'bg-rose-950/30 border-rose-500' : 'bg-emerald-950/30 border-emerald-500') : 'bg-purple-950/40 border-purple-500'} p-4 sm:p-5 rounded-r-2xl shadow-lg flex gap-4 items-start select-none relative overflow-hidden transition-all border border-purple-500/20`}>
      <div className={`w-11 h-11 rounded-xl ${isHandled ? (status === 'rejected' ? 'bg-rose-500/20 border-rose-500/40 text-rose-400' : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400') : 'bg-purple-500/20 border-purple-500/40 text-purple-400'} border flex items-center justify-center shrink-0 shadow-inner`}>
        {isHandled ? (status === 'rejected' ? <X className="w-6 h-6 text-rose-400" /> : <Check className="w-6 h-6 text-emerald-400" />) : <FlaskConical className="w-6 h-6 animate-pulse text-purple-300" />}
      </div>

      <div className="flex-1 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-sm font-black text-white uppercase tracking-wide leading-tight">
            {notification.title}
          </h4>
          <span className="text-[10px] font-bold text-purple-300 bg-purple-900/60 px-2.5 py-0.5 rounded-full border border-purple-500/40 uppercase tracking-wider">
            Sains & Inovasi
          </span>
        </div>

        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Pengirim: {notification.sender} | Tanggal: {notification.timestamp}
        </p>

        <p className="text-xs font-medium text-slate-200 leading-relaxed pt-0.5">
          {notification.message}
        </p>

        <div className="pt-2 flex items-center justify-end gap-2.5">
          {isHandled ? (
            <button
              onClick={onReject}
              className={`text-[11px] font-bold ${status === 'rejected' ? 'text-rose-400 bg-rose-950/80 border-rose-500/50 hover:bg-rose-900/90' : 'text-emerald-400 bg-emerald-950/80 border-emerald-500/50 hover:bg-emerald-900/90'} px-3 py-1.5 rounded-xl border flex items-center gap-1.5 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] shadow-sm`}
              title="Buka Detail Negara"
            >
              {status === 'rejected' ? <X className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
              <span>{status === 'rejected' ? `KONTRAK PENELITIAN DENGAN ${notification.partnerCountry} DITOLAK` : `KONTRAK PENELITIAN JOINT-R&D RESMI DITANDATANGANI`}</span>
            </button>
          ) : (
            <>
              {onReject && (
                <button
                  onClick={onReject}
                  className="px-3.5 py-1.5 text-[10px] font-black uppercase tracking-wider bg-rose-950/60 hover:bg-rose-900 border border-rose-500/40 text-rose-300 rounded-xl transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
                >
                  <X className="w-3.5 h-3.5" />
                  Tolak Kontrak
                </button>
              )}
              {onAccept && (
                <button
                  onClick={onAccept}
                  className="px-4 py-1.5 text-[10px] font-black uppercase tracking-wider bg-[#00FFAA] hover:bg-emerald-400 text-[#0A1A1A] rounded-xl transition-all cursor-pointer shadow-[0_0_15px_rgba(0,255,170,0.3)] flex items-center gap-1.5 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Atom className="w-3.5 h-3.5" />
                  Terima Kontrak Penelitian
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
