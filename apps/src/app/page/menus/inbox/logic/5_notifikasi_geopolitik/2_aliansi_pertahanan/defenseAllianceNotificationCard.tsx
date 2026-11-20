import React from 'react';
import { ShieldCheck, Check, X, Shield } from 'lucide-react';
import { DefenseAllianceOfferNotification } from './defenseAllianceLogic';
import { useLanguage } from '@/app/page/paused_menu/terjemahan_paused_menu/languageLogic';
import { getInboxNotificationMessage, getInboxNotificationSender } from '../../notificationMessage';
import { getLocalizedCountryName } from '@/app/logic/countryNameLogic';

interface DefenseAllianceNotificationCardProps {
  notification: DefenseAllianceOfferNotification;
  onAccept?: () => void;
  onReject?: () => void;
}

export default function DefenseAllianceNotificationCard({
  notification,
  onAccept,
  onReject
}: DefenseAllianceNotificationCardProps) {
  const { t } = useLanguage();
  const isHandled = notification.isHandled;
  const status = notification.status;
  const partner = getLocalizedCountryName(notification.partnerCountry || 'Mitra');

  return (
    <div className={`border-l-4 ${isHandled ? (status === 'rejected' ? 'bg-rose-950/30 border-rose-500' : 'bg-emerald-950/30 border-emerald-500') : 'bg-indigo-950/40 border-indigo-400'} p-4 sm:p-5 rounded-r-2xl shadow-lg flex gap-4 items-start select-none relative overflow-hidden transition-all border border-indigo-500/20`}>
      <div className={`w-11 h-11 rounded-xl ${isHandled ? (status === 'rejected' ? 'bg-rose-500/20 border-rose-500/40 text-rose-400' : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400') : 'bg-indigo-500/20 border-indigo-500/40 text-indigo-400'} border flex items-center justify-center shrink-0 shadow-inner`}>
        {isHandled ? (status === 'rejected' ? <X className="w-6 h-6 text-rose-400" /> : <Check className="w-6 h-6 text-emerald-400" />) : <Shield className="w-6 h-6 animate-pulse text-indigo-300" />}
      </div>

      <div className="flex-1 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-sm font-black text-white uppercase tracking-wide leading-tight">
            {t('side_inbox.geopolitics.allianceTitle', { partner }) }
          </h4>
          <span className="text-[10px] font-bold text-indigo-300 bg-indigo-900/60 px-2.5 py-0.5 rounded-full border border-indigo-500/40 uppercase tracking-wider">
            {t('side_inbox.geopolitics.allianceBadge')}
          </span>
        </div>

        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          {t('side_inbox.senderPrefix', { sender: getInboxNotificationSender(notification, t), date: notification.timestamp })}
        </p>

        <p className="text-xs font-medium text-slate-200 leading-relaxed pt-0.5">
          {getInboxNotificationMessage(notification, t)}
        </p>

        <div className="pt-2 flex items-center justify-end gap-2.5">
          {isHandled ? (
            <button
              onClick={onReject}
              className={`text-[11px] font-bold ${status === 'rejected' ? 'text-rose-400 bg-rose-950/80 border-rose-500/50 hover:bg-rose-900/90' : 'text-emerald-400 bg-emerald-950/80 border-emerald-500/50 hover:bg-emerald-900/90'} px-3 py-1.5 rounded-xl border flex items-center gap-1.5 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] shadow-sm`}
              title={t('side_inbox.geopolitics.openCountryDetails')}
            >
              {status === 'rejected' ? <X className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
              <span>{t('side_inbox.geopolitics.allianceSigned', { partner })}</span>
            </button>
          ) : (
            <>
              {onReject && (
                <button
                  onClick={onReject}
                  className="px-3.5 py-1.5 text-[10px] font-black uppercase tracking-wider bg-rose-950/60 hover:bg-rose-900 border border-rose-500/40 text-rose-300 rounded-xl transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>{t('side_inbox.actions.reject')}</span>
                </button>
              )}
              {onAccept && (
                <button
                  onClick={onAccept}
                  className="px-3.5 py-1.5 text-[10px] font-black uppercase tracking-wider bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white rounded-xl transition-all cursor-pointer shadow-[0_0_12px_rgba(99,102,241,0.4)] flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{t('side_inbox.geopolitics.acceptAlliance')}</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
