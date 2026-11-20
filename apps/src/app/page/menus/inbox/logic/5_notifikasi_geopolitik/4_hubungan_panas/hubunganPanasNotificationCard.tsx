import React from 'react';
import { AlertOctagon, Check, ArrowRight } from 'lucide-react';
import { HubunganPanasNotification } from './hubunganPanasLogic';
import { useLanguage } from '@/app/page/paused_menu/terjemahan_paused_menu/languageLogic';
import { getInboxNotificationMessage, getInboxNotificationSender } from '../../notificationMessage';
import { getLocalizedCountryName } from '@/app/logic/countryNameLogic';

interface HubunganPanasNotificationCardProps {
  notification: HubunganPanasNotification;
  onAccept?: () => void;
  onRedirect?: () => void;
}

export default function HubunganPanasNotificationCard({
  notification,
  onAccept,
  onRedirect
}: HubunganPanasNotificationCardProps) {
  const { t } = useLanguage();
  const partner = getLocalizedCountryName(notification.partnerCountry || 'Mitra');

  return (
    <div className="border-l-4 bg-orange-950/40 border-orange-500 p-4 sm:p-5 rounded-r-2xl shadow-lg flex gap-4 items-start select-none relative overflow-hidden transition-all border border-orange-500/20">
      <div className="w-11 h-11 rounded-xl bg-orange-500/20 border border-orange-500/40 text-orange-400 flex items-center justify-center shrink-0 shadow-inner">
        <AlertOctagon className="w-6 h-6 animate-pulse text-orange-400" />
      </div>

      <div className="flex-1 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-sm font-black text-white uppercase tracking-wide leading-tight">
            {t('side_inbox.geopolitics.hotRelationTitle', { partner }) }
          </h4>
          <span className="text-[10px] font-bold text-orange-300 bg-orange-900/60 px-2.5 py-0.5 rounded-full border border-orange-500/40 uppercase tracking-wider">
            {t('side_inbox.geopolitics.hotRelationBadge')}
          </span>
        </div>

        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          {t('side_inbox.senderPrefix', { sender: getInboxNotificationSender(notification, t), date: notification.timestamp })}
        </p>

        <p className="text-xs font-medium text-slate-200 leading-relaxed pt-0.5">
          {getInboxNotificationMessage(notification, t)}
        </p>

        <div className="pt-2 flex items-center justify-end">
          <button
            onClick={onRedirect}
            className="px-3.5 py-1.5 text-[10px] font-black uppercase tracking-wider bg-orange-500 hover:bg-orange-400 active:bg-orange-600 text-slate-950 rounded-xl transition-all cursor-pointer shadow-[0_0_12px_rgba(249,115,22,0.4)] flex items-center gap-1.5"
          >
            <span>{t('side_inbox.geopolitics.openBilateralDiplomacy')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
