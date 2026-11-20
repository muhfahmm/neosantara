import React from 'react';
import { Zap, ArrowRight, Check } from 'lucide-react';
import { ListrikDefisitNotification } from './listrikDefisitLogic';
import { useLanguage } from '@/app/page/paused_menu/terjemahan_paused_menu/languageLogic';

export interface ListrikDefisitNotificationCardProps {
  notification: ListrikDefisitNotification;
  onAccept?: () => void;
  onReject?: () => void;
  onRedirect?: () => void;
}

export default function ListrikDefisitNotificationCard({
  notification,
  onAccept,
  onReject,
  onRedirect
}: ListrikDefisitNotificationCardProps) {
  const { t } = useLanguage();
  const isHandled = notification.isHandled;

  return (
    <div className={`border-l-4 ${isHandled ? 'bg-emerald-950/30 border-emerald-500' : 'bg-amber-950/40 border-amber-500'} p-4 sm:p-5 rounded-r-2xl shadow-lg flex gap-4 items-start select-none relative overflow-hidden transition-all border border-amber-500/20`}>
      <div className={`w-11 h-11 rounded-xl ${isHandled ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'bg-amber-500/20 border-amber-500/40 text-amber-400'} border flex items-center justify-center shrink-0 shadow-inner`}>
        {isHandled ? <Check className="w-6 h-6 text-emerald-400" /> : <Zap className="w-6 h-6 animate-pulse text-amber-400" />}
      </div>

      <div className="flex-1 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-sm font-black text-white uppercase tracking-wide leading-tight">
            {t('side_inbox.basicNeeds.electricTitle') || notification.title}
          </h4>
          <span className="text-[10px] font-bold text-amber-300 bg-amber-900/60 px-2.5 py-0.5 rounded-full border border-amber-500/40 uppercase tracking-wider">
            {t('side_inbox.basicNeeds.electricBadge') || 'Kebutuhan Energi'}
          </span>
        </div>

        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          {t('side_inbox.senderPrefix', { sender: notification.sender, date: notification.timestamp }) || `Pengirim: ${notification.sender} | Tanggal: ${notification.timestamp}`}
        </p>

        <p className="text-xs font-medium text-slate-200 leading-relaxed pt-0.5">
          {notification.message}
        </p>

        <div className="pt-2 flex items-center justify-end">
          {isHandled ? (
            <div className="text-[11px] font-bold text-emerald-400 bg-emerald-950/80 px-3 py-1.5 rounded-xl border border-emerald-500/50 flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5" />
              <span>{t('side_inbox.basicNeeds.resolved') || 'PASOKAN ENERGI LISTRIK SUDAH MENCUKUPI'}</span>
            </div>
          ) : (
            <button
              onClick={onRedirect || onAccept}
              className="px-3.5 py-1.5 text-[10px] font-black uppercase tracking-wider bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 rounded-xl transition-all cursor-pointer shadow-[0_0_12px_rgba(245,158,11,0.4)] flex items-center gap-1.5 font-bold"
            >
              <span>{t('side_inbox.basicNeeds.solveNow') || 'Bangun Pembangkit Listrik →'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
