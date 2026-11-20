import React from 'react';
import { Landmark, ArrowRight, Check } from 'lucide-react';
import { TempatUmumDefisitNotification } from './tempatUmumDefisitLogic';
import { useLanguage } from '@/app/page/paused_menu/terjemahan_paused_menu/languageLogic';
import { getInboxNotificationSender } from '@/app/page/menus/inbox/logic/notificationMessage';
import { getInboxNotificationMessage } from '@/app/page/menus/inbox/logic/notificationMessage';

export interface TempatUmumDefisitNotificationCardProps {
  notification: TempatUmumDefisitNotification;
  onAccept?: () => void;
  onReject?: () => void;
  onRedirect?: () => void;
}

export default function TempatUmumDefisitNotificationCard({
  notification,
  onAccept,
  onReject,
  onRedirect
}: TempatUmumDefisitNotificationCardProps) {
  const { t } = useLanguage();
  const isHandled = notification.isHandled;

  return (
    <div className={`border-l-4 ${isHandled ? 'bg-emerald-950/30 border-emerald-500' : 'bg-blue-950/40 border-blue-500'} p-4 sm:p-5 rounded-r-2xl shadow-lg flex gap-4 items-start select-none relative overflow-hidden transition-all border border-blue-500/20`}>
      <div className={`w-11 h-11 rounded-xl ${isHandled ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'bg-blue-500/20 border-blue-500/40 text-blue-400'} border flex items-center justify-center shrink-0 shadow-inner`}>
        {isHandled ? <Check className="w-6 h-6 text-emerald-400" /> : <Landmark className="w-6 h-6 animate-pulse text-blue-400" />}
      </div>

      <div className="flex-1 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-sm font-black text-white uppercase tracking-wide leading-tight">
            {t('side_inbox.basicNeeds.publicTitle') }
          </h4>
          <span className="text-[10px] font-bold text-blue-300 bg-blue-900/60 px-2.5 py-0.5 rounded-full border border-blue-500/40 uppercase tracking-wider">
            {t('side_inbox.basicNeeds.publicBadge')}
          </span>
        </div>

        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          {t('side_inbox.senderPrefix', { sender: getInboxNotificationSender(notification, t), date: notification.timestamp })}
        </p>

        <p className="text-xs font-medium text-slate-200 leading-relaxed pt-0.5">
          {getInboxNotificationMessage(notification, t)}
        </p>

        <div className="pt-2 flex items-center justify-end">
          {isHandled ? (
            <div className="text-[11px] font-bold text-emerald-400 bg-emerald-950/80 px-3 py-1.5 rounded-xl border border-emerald-500/50 flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5" />
              <span>{t('side_inbox.basicNeeds.resolved')}</span>
            </div>
          ) : (
            <button
              onClick={onRedirect || onAccept}
              className="px-3.5 py-1.5 text-[10px] font-black uppercase tracking-wider bg-blue-500 hover:bg-blue-400 active:bg-blue-600 text-slate-950 rounded-xl transition-all cursor-pointer shadow-[0_0_12px_rgba(59,130,246,0.4)] flex items-center gap-1.5 font-bold"
            >
              <span>{t('side_inbox.basicNeeds.solveNow')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
