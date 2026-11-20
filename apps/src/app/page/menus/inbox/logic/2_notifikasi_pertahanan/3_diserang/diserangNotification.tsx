import React from 'react';
import { ShieldAlert, Check, Swords, Shield } from 'lucide-react';
import { DiserangNotification } from './diserangLogic';
import { useLanguage } from '@/app/page/paused_menu/terjemahan_paused_menu/languageLogic';
import { getInboxNotificationMessage, getInboxNotificationSender } from '@/app/page/menus/inbox/logic/notificationMessage';

export interface DiserangNotificationProps {
  notification: DiserangNotification;
  userCountryName?: string;
  onAccept?: () => void;
  onReject?: () => void;
}

export default function DiserangNotificationCard({ notification, userCountryName, onAccept, onReject }: DiserangNotificationProps) {
  const { t } = useLanguage();
  const isHandled = notification.isHandled;

  return (
    <div className={`border-l-4 ${isHandled ? 'bg-emerald-950/30 border-emerald-500' : 'bg-rose-950/40 border-rose-500'} p-4 sm:p-5 rounded-r-2xl shadow-lg flex gap-4 items-start select-none relative overflow-hidden transition-all border border-rose-500/20`}>
      <div className={`w-11 h-11 rounded-xl ${isHandled ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'bg-rose-500/20 border-rose-500/40 text-rose-400'} border flex items-center justify-center shrink-0 shadow-inner`}>
        {isHandled ? <Check className="w-6 h-6 text-emerald-400" /> : <ShieldAlert className="w-6 h-6 animate-pulse text-rose-400" />}
      </div>

      <div className="flex-1 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-sm font-black text-white uppercase tracking-wide leading-tight">
            {t('side_inbox.defense.diserangTitle') }
          </h4>
          <span className="text-[10px] font-bold text-rose-300 bg-rose-900/60 px-2.5 py-0.5 rounded-full border border-rose-500/40 uppercase tracking-wider">
            {t('side_inbox.defense.diserangBadge')}
          </span>
        </div>

        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          {t('side_inbox.senderPrefix', { sender: getInboxNotificationSender(notification, t), date: notification.timestamp })}
        </p>

        <p className="text-xs font-medium text-slate-200 leading-relaxed pt-0.5">
          {getInboxNotificationMessage(notification, t)}
        </p>

        <div className="bg-root-canvas border border-rose-500/30 rounded-xl p-2.5 text-xs text-rose-300 font-bold flex items-center justify-between">
          <span>{t('side_inbox.defense.impact')}: {notification.effectTextKey ? t(notification.effectTextKey) : notification.effectText}</span>
          <span className="text-rose-400 font-black">{t('side_inbox.defense.mobilizationCost')}: {notification.costEM} NEO</span>
        </div>

        <div className="pt-2 flex items-center justify-end gap-2.5">
          {isHandled ? (
            <div className="text-[11px] font-bold text-emerald-400 bg-emerald-950/80 px-3 py-1.5 rounded-xl border border-emerald-500/50 flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5" />
              <span>{t('side_inbox.defense.defenseDeployed')}</span>
            </div>
          ) : (
            <>
              {onAccept && (
                <button
                  onClick={onAccept}
                  className="px-3.5 py-1.5 text-[10px] font-black uppercase tracking-wider bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white rounded-xl transition-all cursor-pointer shadow-[0_0_12px_rgba(244,63,94,0.4)] flex items-center gap-1.5"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>{t('side_inbox.defense.deployDefense')}</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
