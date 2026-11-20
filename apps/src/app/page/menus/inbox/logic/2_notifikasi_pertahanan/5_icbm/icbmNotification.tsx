import React from 'react';
import { Rocket, AlertTriangle, Shield } from 'lucide-react';
import { ICBMNotification } from './icbmLogic';
import { useLanguage } from '@/app/page/paused_menu/terjemahan_paused_menu/languageLogic';
import { getInboxNotificationSender } from '@/app/page/menus/inbox/logic/notificationMessage';
import { getInboxNotificationMessage } from '@/app/page/menus/inbox/logic/notificationMessage';

interface ICBMNotificationProps {
  notification: ICBMNotification;
  onAccept?: () => void;
  onReject?: () => void;
}

export default function ICBMNotificationCard({ notification, onAccept, onReject }: ICBMNotificationProps) {
  const { t } = useLanguage();
  const isHandled = notification.isHandled;

  return (
    <div className={`border-l-4 ${isHandled ? 'bg-emerald-950/30 border-emerald-500' : 'bg-red-950/50 border-red-600'} p-4 sm:p-5 rounded-r-2xl shadow-lg flex gap-4 items-start select-none relative overflow-hidden transition-all border border-red-500/30 animate-pulse`}>
      <div className="w-11 h-11 rounded-xl bg-red-600/20 border border-red-500/50 text-red-500 flex items-center justify-center shrink-0 shadow-inner">
        <Rocket className="w-6 h-6 animate-bounce" />
      </div>

      <div className="flex-1 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-sm font-black text-white uppercase tracking-wide leading-tight">
            {t('side_inbox.defense.icbmTitle') }
          </h4>
          <span className="text-[10px] font-bold text-red-300 bg-red-900/80 px-2.5 py-0.5 rounded-full border border-red-500/50 uppercase tracking-wider">
            {t('side_inbox.defense.icbmBadge')}
          </span>
        </div>

        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          {t('side_inbox.senderPrefix', { sender: getInboxNotificationSender(notification, t), date: notification.timestamp })}
        </p>

        <p className="text-xs font-medium text-slate-200 leading-relaxed pt-0.5">
          {getInboxNotificationMessage(notification, t)}
        </p>

        <div className="bg-root-canvas border border-red-500/40 rounded-xl p-2.5 text-xs text-red-300 font-bold flex items-center justify-between">
          <span>{t('side_inbox.defense.targetLocation')}: {notification.targetCity || t('side_inbox.defense.defaultTargetLocation')}</span>
          <span className="text-red-400 font-black">{t('side_inbox.defense.estimatedImpact')}</span>
        </div>
      </div>
    </div>
  );
}
