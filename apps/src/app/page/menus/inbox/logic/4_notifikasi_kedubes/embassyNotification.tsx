import React from 'react';
import { Building2, ArrowRight } from 'lucide-react';
import { EmbassyOfferNotification } from './1_penawaran_kedutaan_besar';
import { useLanguage } from '@/app/page/paused_menu/terjemahan_paused_menu/languageLogic';

export interface EmbassyNotificationProps {
  notification: EmbassyOfferNotification;
  onAccept?: () => void;
  onReject?: () => void;
  onRedirectClick?: () => void;
}

export default function EmbassyNotification({ notification, onAccept, onReject, onRedirectClick }: EmbassyNotificationProps) {
  const { t } = useLanguage();
  const partner = notification.partnerCountry || 'Mitra';

  return (
    <div className="bg-root-surface border border-root-accent/30 p-4 sm:p-5 rounded-2xl shadow-sm flex gap-4 items-start select-none relative overflow-hidden transition-all">
      <div className="w-11 h-11 rounded-xl bg-root-canvas border border-root-accent/30 flex items-center justify-center text-root-accent shrink-0 shadow-inner">
        <Building2 className="w-6 h-6" />
      </div>

      <div className="flex-1 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-sm font-black text-root-accent uppercase tracking-wide leading-tight">
            {t('side_inbox.geopolitics.embassyTitle', { partner }) || notification.title}
          </h4>
          <span className="text-[10px] font-bold text-root-accent bg-root-accent/10 px-2.5 py-0.5 rounded-full border border-root-accent/30 uppercase tracking-wider">
            {t('side_inbox.geopolitics.embassyBadge') || 'Kedutaan Besar'}
          </span>
        </div>

        <p className="text-[10px] font-bold text-root-subtle uppercase tracking-wider">
          {t('side_inbox.senderPrefix', { sender: notification.sender, date: notification.timestamp }) || `Pengirim: ${notification.sender} | Waktu: ${notification.timestamp}`}
        </p>

        <p className="text-xs font-medium text-root-text leading-relaxed pt-0.5">
          {notification.message}
        </p>

        <div className="pt-2 flex items-center justify-end">
          <button
            onClick={onRedirectClick || onAccept}
            className="px-3.5 py-1.5 text-[10px] font-black uppercase tracking-wider bg-root-accent hover:bg-root-accent/80 text-root-canvas rounded-xl transition-all cursor-pointer shadow-[0_0_12px_rgba(0,255,170,0.3)] flex items-center gap-1.5"
          >
            <span>Buka Kedutaan Besar →</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
