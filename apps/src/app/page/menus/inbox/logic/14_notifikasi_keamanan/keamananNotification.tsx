import React from 'react';
import { Shield, Check, X } from 'lucide-react';
import { KeamananNotification } from './keamananLogic';

interface KeamananNotificationProps {
  notification: KeamananNotification;
  onAccept?: () => void;
  onReject?: () => void;
}

export default function KeamananNotificationCard({
  notification,
  onAccept,
  onReject,
}: KeamananNotificationProps) {
  const isHandled = notification.isHandled;

  return (
    <div className={`border-l-4 ${isHandled ? 'bg-emerald-950/30 border-emerald-500' : 'bg-rose-950/40 border-rose-500'} p-4 sm:p-5 rounded-r-2xl shadow-lg flex gap-4 items-start select-none relative overflow-hidden transition-all border border-rose-500/20`}>
      <div className={`w-11 h-11 rounded-xl ${isHandled ? 'bg-emerald-500/20 border-emerald-500/40' : 'bg-rose-500/20 border-rose-500/40'} border flex items-center justify-center shrink-0 shadow-inner`}>
        {isHandled
          ? <Check className="w-6 h-6 text-emerald-400" />
          : <Shield className="w-6 h-6 text-rose-400 animate-pulse" />}
      </div>

      <div className="flex-1 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-sm font-black text-white uppercase tracking-wide leading-tight">
            {notification.title}
          </h4>
          <span className="text-[10px] font-bold text-rose-300 bg-rose-900/60 px-2.5 py-0.5 rounded-full border border-rose-500/40 uppercase tracking-wider">
            {notification.category}
          </span>
        </div>

        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Pengirim: {notification.sender} | Tanggal: {notification.timestamp}
        </p>
        <p className="text-[10px] font-bold uppercase tracking-wider text-rose-300">
          Risiko keamanan dari sektor kesehatan &amp; penegakan hukum: {notification.securityRiskPercent}%
        </p>
        <p className="text-xs font-medium text-slate-200 leading-relaxed pt-0.5">
          {notification.message}
        </p>

        <div className="bg-[#0A1A1A] border border-rose-500/30 rounded-xl p-3 grid grid-cols-3 gap-2 text-center text-xs font-bold text-white shadow-inner">
          <div className="border-r border-rose-500/20 pr-1">
            <div className="text-slate-400 text-[9px] uppercase font-bold tracking-wider">Warga Terdampak</div>
            <div className="text-rose-400 font-extrabold mt-0.5">{notification.korban.toLocaleString('id-ID')} Orang</div>
          </div>
          <div className="border-r border-rose-500/20 px-1">
            <div className="text-slate-400 text-[9px] uppercase font-bold tracking-wider">Total Kerugian</div>
            <div className="text-amber-400 font-extrabold mt-0.5">{notification.totalKerugian.toLocaleString('id-ID')} NEO</div>
          </div>
          <div className="pl-1">
            <div className="text-slate-400 text-[9px] uppercase font-bold tracking-wider">Biaya Operasi Kepolisian</div>
            <div className="text-[#00FFAA] font-extrabold mt-0.5">{notification.responseCost.toLocaleString('id-ID')} NEO</div>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-end gap-2.5">
          {isHandled ? (
            <div className="text-[11px] font-bold text-emerald-400 bg-emerald-950/80 px-3 py-1.5 rounded-xl border border-emerald-500/50 flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5" />
              <span>OPERASI KEPOLISIAN SEBESAR {notification.responseCost.toLocaleString('id-ID')} NEO TELAH DILAKSANAKAN</span>
            </div>
          ) : (
            <>
              {onReject && (
                <button onClick={onReject} className="px-3.5 py-1.5 text-[10px] font-black uppercase tracking-wider bg-rose-950/60 hover:bg-rose-900 border border-rose-500/40 text-rose-300 rounded-xl transition-all cursor-pointer shadow-sm flex items-center gap-1.5">
                  <X className="w-3.5 h-3.5" />
                  Abaikan / Tolak
                </button>
              )}
              {onAccept && (
                <button onClick={onAccept} className="px-4 py-1.5 text-[10px] font-black uppercase tracking-wider bg-[#00FFAA] hover:bg-emerald-400 text-[#0A1A1A] rounded-xl transition-all cursor-pointer shadow-[0_0_15px_rgba(0,255,170,0.3)] flex items-center gap-1.5 hover:scale-[1.02] active:scale-[0.98]">
                  <Check className="w-3.5 h-3.5" />
                  Danai Operasi ({notification.responseCost.toLocaleString('id-ID')} NEO)
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
