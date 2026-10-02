import React from 'react';
import { Check, X } from 'lucide-react';
import { TradeRelationOfferNotification } from './1_penawaran_perdagangan';
import { COUNTRIES_DATA } from '@/app/page/map_system/map-data';

interface TradeRelationNotificationProps {
  notification: TradeRelationOfferNotification;
  onAccept?: () => void;
  onReject?: () => void;
}

export default function TradeRelationNotification({
  notification,
  onAccept,
  onReject
}: TradeRelationNotificationProps) {
  // Get country ISO code
  const partnerName = notification.partnerCountry;
  const foundCountry = COUNTRIES_DATA?.find(
    c => c.country?.toLowerCase().trim() === partnerName?.toLowerCase().trim()
  );
  const iso = foundCountry?.iso?.toLowerCase() || '';

  return (
    <div className="bg-[#0F2424] border border-[#00FFAA]/40 p-4 rounded-xl shadow-lg flex gap-4 items-start select-none relative overflow-hidden group hover:border-[#00FFAA]/70 transition-all">
      {/* Visual Accent Bar */}
      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#00FFAA]" />

      <div className="w-10 h-10 rounded-full bg-[#051111] border border-[#00FFAA]/40 flex items-center justify-center overflow-hidden shrink-0 mt-0.5 shadow">
        {iso ? (
          <img
            src={`https://flagcdn.com/w80/${iso}.png`}
            alt={partnerName}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <span className="text-base font-bold text-[#00FFAA]">🌐</span>
        )}
      </div>

      <div className="flex-1 space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-sm font-bold text-[#00FFAA] tracking-wide uppercase flex items-center gap-2">
            {iso && (
              <img
                src={`https://flagcdn.com/w40/${iso}.png`}
                alt={partnerName}
                className="w-5 h-3.5 object-cover rounded-sm border border-[#00FFAA]/30 inline-block"
              />
            )}
            {notification.title}
          </h4>
          <span className="text-[10px] font-extrabold text-[#00FFAA] bg-[#00FFAA]/10 px-2 py-0.5 rounded border border-[#00FFAA]/30 shrink-0">
            Diplomasi Dagang
          </span>
        </div>

        <p className="text-[10px] font-semibold text-[#6B8A8A] uppercase tracking-wider">
          Pengirim: {notification.sender} | Waktu: {notification.timestamp}
        </p>

        <p className="text-xs font-normal text-[#E0E0E0] leading-relaxed pt-1">
          {notification.message}
        </p>

        {/* Info Box */}
        <div className="bg-[#0A1A1A] border border-[#00FFAA]/20 rounded-lg p-2.5 mt-2 flex items-center justify-between text-xs text-[#00FFAA]">
          <span className="text-[11px] text-[#A0C0C0]">Status Kedutaan Besar:</span>
          <span className="font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/30 text-[10px]">
            Tanpa Embassy (Peluang 25%/Bulan ~ 3x/Thn)
          </span>
        </div>

        <div className="pt-2 flex justify-end gap-2">
          {onReject && (
            <button
              onClick={onReject}
              className="px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider bg-red-950/60 hover:bg-red-900 border border-red-500/40 text-red-300 rounded-lg transition-all cursor-pointer flex items-center gap-1.5"
            >
              <X className="w-3.5 h-3.5" />
              Tolak
            </button>
          )}
          {onAccept && (
            <button
              onClick={onAccept}
              className="px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider bg-[#00FFAA] hover:bg-[#00FFAA]/80 text-[#0A1A1A] rounded-lg transition-all cursor-pointer shadow-[0_0_12px_rgba(0,255,170,0.3)] flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              Terima & Buka Hubungan Dagang
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
