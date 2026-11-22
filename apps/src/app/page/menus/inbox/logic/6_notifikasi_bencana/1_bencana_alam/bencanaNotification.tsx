// bencanaNotification.tsx
// Component UI Notifikasi Bencana Alam di Inbox

import React from 'react';
import { Flame, Check, X } from 'lucide-react';
import { BencanaAlamNotification } from './bencanaLogic';
import { useLanguage } from '@/app/page/paused_menu/terjemahan_paused_menu/languageLogic';
import { getInboxNotificationSender } from '@/app/page/menus/inbox/logic/notificationMessage';
import { getInboxNotificationMessage, getInboxNotificationTitle } from '../../notificationMessage';

interface BencanaNotificationProps {
  notification: BencanaAlamNotification;
  onAccept?: () => void;
  onReject?: () => void;
}

export default function BencanaNotification({ notification, onAccept, onReject }: BencanaNotificationProps) {
  const { t, language } = useLanguage();
  const isHandled = notification.isHandled;
  const responseCost = notification.bantuanCost;
  const numberFormat = new Intl.NumberFormat(language, { maximumFractionDigits: 2 });

  return (
    <div className={`border-l-4 ${isHandled ? 'bg-emerald-950/30 border-emerald-500' : 'bg-rose-950/40 border-rose-500'} p-4 sm:p-5 rounded-r-2xl shadow-lg flex gap-4 items-start select-none relative overflow-hidden transition-all border border-rose-500/20`}>
      {/* Icon */}
      <div className={`w-11 h-11 rounded-xl ${isHandled ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'bg-rose-500/20 border-rose-500/40 text-rose-400'} border flex items-center justify-center shrink-0 shadow-inner`}>
        {isHandled ? <Check className="w-6 h-6 text-emerald-400" /> : <Flame className="w-6 h-6 animate-pulse" />}
      </div>

      <div className="flex-1 space-y-2">
        {/* Header Title & Category */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-sm font-black text-white uppercase tracking-wide leading-tight">
            {getInboxNotificationTitle(notification, t)}
          </h4>
          <span className="text-[10px] font-bold text-rose-300 bg-rose-900/60 px-2.5 py-0.5 rounded-full border border-rose-500/40 uppercase tracking-wider">
            {t('side_inbox.disaster.naturalBadge')}
          </span>
        </div>

        {/* Sender & Timestamp */}
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          {t('side_inbox.senderPrefix', { sender: getInboxNotificationSender(notification, t), date: notification.timestamp })}
        </p>

        {/* Message */}
        <p className="text-xs font-medium text-slate-200 leading-relaxed pt-0.5">
          {getInboxNotificationMessage(notification, t)}
        </p>

        {/* Details Grid: Korban & Kerugian */}
        <div className="bg-root-canvas border border-rose-500/30 rounded-xl p-3 grid grid-cols-2 sm:grid-cols-3 gap-2 text-center text-xs font-bold text-white shadow-inner">
          <div className="border-r border-rose-500/20 pr-1">
            <div className="text-slate-400 text-[9px] uppercase font-bold tracking-wider">{t('side_inbox.disaster.victims')}</div>
            <div className="text-rose-400 font-extrabold mt-0.5">{numberFormat.format(notification.korban ?? 0)} {t('side_inbox.demo.people')}</div>
          </div>
          <div className="border-r border-rose-500/20 pr-1">
            <div className="text-slate-400 text-[9px] uppercase font-bold tracking-wider">{t('side_inbox.disaster.financialLoss')}</div>
            <div className="text-amber-400 font-extrabold mt-0.5">{numberFormat.format(notification.totalKerugian ?? 0)} NEO</div>
          </div>
          <div>
            <div className="text-slate-400 text-[9px] uppercase font-bold tracking-wider">{t('side_inbox.disaster.aidCost')}</div>
            <div className="text-emerald-400 font-extrabold mt-0.5">{numberFormat.format(responseCost ?? 0)} NEO</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex items-center justify-end gap-2.5">
          {isHandled ? (
            <div className="text-[11px] font-bold text-emerald-400 bg-emerald-950/80 px-3 py-1.5 rounded-xl border border-emerald-500/50 flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5" />
              <span>{t('side_inbox.disaster.handled')}</span>
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
                  className="px-3.5 py-1.5 text-[10px] font-black uppercase tracking-wider bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white rounded-xl transition-all cursor-pointer shadow-[0_0_12px_rgba(244,63,94,0.4)] flex items-center gap-1.5"
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>{t('side_inbox.disaster.sendAid')}</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
