import React from 'react';
import { Eye, Check, X, ShieldAlert } from 'lucide-react';
import type { SpionaseNotification } from '@/app/page/detail_negara/3_operasi_militer/2_spionase/logic/spionaseLogic';
import { useLanguage } from '@/app/page/paused_menu/terjemahan_paused_menu/languageLogic';

interface SpionaseNotificationProps {
  notification: SpionaseNotification;
  onAccept?: () => void;
  onReject?: () => void;
}

export default function SpionaseNotificationCard({ notification, onAccept, onReject }: SpionaseNotificationProps) {
  const { t } = useLanguage();
  const isHandled = notification.isHandled;
  const isSuccess = notification.operationResult === 'success';
  const partner = notification.partnerCountry || 'Target';

  return (
    <div className={`border-l-4 ${isSuccess ? 'bg-emerald-950/30 border-emerald-500' : 'bg-rose-950/40 border-rose-500'} p-4 sm:p-5 rounded-r-2xl shadow-lg flex gap-4 items-start select-none relative overflow-hidden transition-all border ${isSuccess ? 'border-emerald-500/20' : 'border-rose-500/20'}`}>
      <div className={`w-11 h-11 rounded-xl ${isSuccess ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'bg-rose-500/20 border-rose-500/40 text-rose-400'} border flex items-center justify-center shrink-0 shadow-inner`}>
        {isSuccess ? <Check className="w-6 h-6 text-emerald-400" /> : <Eye className="w-6 h-6 text-rose-400 animate-pulse" />}
      </div>

      <div className="flex-1 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-sm font-black text-white uppercase tracking-wide leading-tight">
            {t('side_inbox.defense.spionaseTitle', { partner }) || notification.title}
          </h4>
          <span className={`text-[10px] font-bold ${isSuccess ? 'text-emerald-300 bg-emerald-900/60 border-emerald-500/40' : 'text-rose-300 bg-rose-900/60 border-rose-500/40'} px-2.5 py-0.5 rounded-full border uppercase tracking-wider`}>
            {isSuccess ? (t('side_inbox.defense.spionaseSuccess') || 'Misi Berhasil') : (t('side_inbox.defense.spionaseFailed') || 'Agen Tertangkap')}
          </span>
        </div>

        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          {t('side_inbox.senderPrefix', { sender: notification.sender, date: notification.timestamp }) || `Pengirim: ${notification.sender} | Target: ${notification.partnerCountry} | Tanggal: ${notification.timestamp}`}
        </p>

        <p className="text-xs font-medium text-slate-200 leading-relaxed pt-0.5">
          {notification.message}
        </p>

        <div className="pt-2 flex items-center justify-end">
          <div className={`text-[11px] font-bold ${isSuccess ? 'text-emerald-400 bg-emerald-950/80 border-emerald-500/50' : 'text-rose-400 bg-rose-950/80 border-rose-500/50'} px-3 py-1.5 rounded-xl border flex items-center gap-1.5`}>
            {isSuccess ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
            <span>{isSuccess ? 'LAPORAN INTELIJEN TELAH DIARSIPKAN' : 'STATUS AGEN TELAH DIPERBARUI'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
