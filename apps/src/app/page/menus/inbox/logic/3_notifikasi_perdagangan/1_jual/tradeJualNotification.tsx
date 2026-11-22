import React from 'react';
import { ShoppingBag, Check, X } from 'lucide-react';
import { useLanguage } from '@/app/page/paused_menu/terjemahan_paused_menu/languageLogic';
import { getLocalizedCountryName } from '@/app/logic/countryNameLogic';
import { formatNeo } from '@/app/logic/economic_logic/neoCurrency';

interface TradeJualNotificationProps {
  notification: any; // TradeOfferNotification
  onAccept?: () => void;
  onReject?: () => void;
}

export default function TradeJualNotification({ notification, onAccept, onReject }: TradeJualNotificationProps) {
  const { t, language } = useLanguage();
  const rawKey = notification.productKey || '';
  const localizedProduct = t(`side_inbox.items.${rawKey}`) || rawKey.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
  const partner = getLocalizedCountryName(notification.partnerName || 'Mitra');

  const title = t('side_inbox.trade.jualTitle', { partner, product: localizedProduct }) ;
  const badge = t('side_inbox.trade.jualBadge');
  const senderLabel = t('side_inbox.trade.jualSender', { partner }) ;
  const message = t('side_inbox.trade.jualMessage', {
    partner,
    product: localizedProduct,
    quantity: notification.quantity?.toLocaleString('id-ID', { maximumFractionDigits: 2 }),
    price: formatNeo(notification.pricePerUnit, language),
    total: formatNeo(notification.totalPrice, language),
  }) ;

  return (
    <div className="bg-amber-50/70 border-l-4 border-amber-500 p-4 rounded-r-xl shadow-sm flex gap-4 items-start select-none">
      <div className="w-10 h-10 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-600 shrink-0">
        <ShoppingBag className="w-5 h-5" />
      </div>
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-black text-amber-900 uppercase tracking-wide">{title}</h4>
          <span className="text-[10px] font-bold text-amber-700 bg-amber-100/50 px-2 py-0.5 rounded border border-amber-200">
            {badge}
          </span>
        </div>
        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          {t('side_inbox.senderPrefix', { sender: senderLabel, date: notification.timestamp })}
        </p>
        <p className="text-xs font-medium text-slate-700 leading-relaxed pt-1">
          {message}
        </p>
        
        {/* Detail Permintaan Pembelian */}
        <div className="bg-root-canvas border border-root-accent/25 rounded-lg p-2.5 mt-2 grid grid-cols-3 gap-2 text-center text-[10px] font-bold text-root-text">
          <div>
            <div className="text-root-body text-[10px] font-extrabold tracking-wide uppercase">{t('side_inbox.trade.exportQty')}</div>
            <div>{notification.quantity?.toLocaleString('id-ID', { maximumFractionDigits: 2 })} Unit</div>
          </div>
          <div>
            <div className="text-root-body text-[10px] font-extrabold tracking-wide uppercase">{t('side_inbox.trade.offerPrice')}</div>
            <div>{formatNeo(notification.pricePerUnit, language)} NEO</div>
          </div>
          <div>
            <div className="text-root-body text-[10px] font-extrabold tracking-wide uppercase">{t('side_inbox.trade.totalRevenue')}</div>
            <div className="text-root-accent">{formatNeo(notification.totalPrice, language)} NEO</div>
          </div>
        </div>

        <div className="pt-2 flex justify-end gap-2">
          {onReject && (
            <button
              onClick={onReject}
              className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider bg-rose-100 hover:bg-rose-200 border border-rose-300 text-rose-800 rounded transition-all cursor-pointer shadow-sm flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              {t('side_inbox.trade.reject')}
            </button>
          )}
          {onAccept && (
            <button
              onClick={onAccept}
              className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-[#FAF6EE] rounded transition-all cursor-pointer shadow hover:shadow-md flex items-center gap-1"
            >
              <Check className="w-3 h-3" />
              {t('side_inbox.trade.acceptSell')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
