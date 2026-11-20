import React from 'react';
import { Flame, Check, X, ShieldAlert } from 'lucide-react';
import { PemberontakanNotification } from './pemberontakanLogic';
import { useLanguage } from '@/app/page/paused_menu/terjemahan_paused_menu/languageLogic';
import { getInboxNotificationMessage } from '@/app/page/menus/inbox/logic/notificationMessage';
import { getLocalizedCountryName } from '@/app/logic/countryNameLogic';

interface PemberontakanNotificationProps {
  notification: PemberontakanNotification;
  onAccept?: () => void;
  onReject?: () => void;
}

export default function PemberontakanNotificationCard({ notification, onAccept, onReject }: PemberontakanNotificationProps) {
  const { t } = useLanguage();
  const isHandled = notification.isHandled;
  const country = getLocalizedCountryName(notification.provinceName || 'Wilayah');
  const risk = notification.effectTextKey
    ? t(notification.effectTextKey, notification.effectTextParams)
    : notification.effectText || '';
  const cost = notification.costEM ?? 250;

  return (
    <div className={`border-l-4 ${isHandled ? 'bg-emerald-950/30 border-emerald-500' : 'bg-amber-950/40 border-amber-500'} p-4 sm:p-5 rounded-r-2xl shadow-lg flex gap-4 items-start select-none relative overflow-hidden transition-all border border-amber-500/20`}>
      <div className={`w-11 h-11 rounded-xl ${isHandled ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'bg-amber-500/20 border-amber-500/40 text-amber-400'} border flex items-center justify-center shrink-0 shadow-inner`}>
        {isHandled ? <Check className="w-6 h-6 text-emerald-400" /> : <Flame className="w-6 h-6 animate-pulse text-amber-400" />}
      </div>

      <div className="flex-1 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-sm font-black text-white uppercase tracking-wide leading-tight">
            {t('side_inbox.defense.pemberontakanTitle', { country }) }
          </h4>
          <span className="text-[10px] font-bold text-amber-300 bg-amber-900/60 px-2.5 py-0.5 rounded-full border border-amber-500/40 uppercase tracking-wider">
            {t('side_inbox.defense.pemberontakanBadge')}
          </span>
        </div>

        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          {t('side_inbox.defense.affectedRegion', { province: country })} | {t('side_inbox.timeLabel')}: {notification.timestamp}
        </p>

        <p className="text-xs font-medium text-slate-200 leading-relaxed pt-0.5">
          {getInboxNotificationMessage(notification, t)}
        </p>

        <div className="bg-root-canvas border border-amber-500/30 rounded-xl p-2.5 text-xs text-amber-300 font-bold flex items-center justify-between">
          <span>{risk}</span>
          <span className="text-amber-400 font-black">{t('side_inbox.defense.recoveryCost', { cost })}</span>
        </div>

        <div className="pt-2 flex items-center justify-end gap-2.5">
          {isHandled ? (
            <div className="text-[11px] font-bold text-emerald-400 bg-emerald-950/80 px-3 py-1.5 rounded-xl border border-emerald-500/50 flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5" />
              <span>{t('side_inbox.defense.stabilized')}</span>
            </div>
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
                  className="px-3.5 py-1.5 text-[10px] font-black uppercase tracking-wider bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 rounded-xl transition-all cursor-pointer shadow-[0_0_12px_rgba(245,158,11,0.4)] flex items-center gap-1.5"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>{t('side_inbox.defense.quellRebellion')}</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
