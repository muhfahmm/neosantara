import React from 'react';
import { Landmark, AlertTriangle, ArrowRight, FileText } from 'lucide-react';
import { AIResolusiPBBNotification } from './resolusiPBBLogic';
import { useLanguage } from '@/app/page/paused_menu/terjemahan_paused_menu/languageLogic';

interface ResolusiPBBNotificationCardProps {
  notification: AIResolusiPBBNotification;
  onAccept?: () => void;
  onRedirect?: () => void;
}

export default function ResolusiPBBNotificationCard({
  notification,
  onAccept,
  onRedirect
}: ResolusiPBBNotificationCardProps) {
  const { t } = useLanguage();
  const score = notification.relationScore;
  const isNoTarget = notification.resolutionType === 'war_ban' || 
    notification.resolutionType === 'production_ban' ||
    notification.targetCountry?.toLowerCase().includes('dunia') || 
    notification.targetCountry?.toLowerCase().includes('global') ||
    notification.targetCountry?.toLowerCase().includes('sektor') ||
    notification.resolutionTitle?.toLowerCase().includes('larangan perang') ||
    notification.resolutionTitle?.toLowerCase().includes('larangan produksi');

  const cleanTitle = isNoTarget
    ? notification.title.replace(/➔.*/g, '').trim()
    : notification.title;

  const displayTarget = notification.resolutionType === 'production_ban' || notification.resolutionTitle?.toLowerCase().includes('produksi')
    ? 'Sektor Komoditas Global'
    : 'Seluruh Dunia (Global)';

  return (
    <div className="border-l-4 bg-cyan-950/40 border-cyan-400 p-4 sm:p-5 rounded-r-2xl shadow-lg flex gap-4 items-start select-none relative overflow-hidden transition-all border border-cyan-500/30">
      <div className="w-11 h-11 rounded-xl bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 flex items-center justify-center shrink-0 shadow-inner">
        <Landmark className="w-6 h-6 animate-pulse text-cyan-300" />
      </div>

      <div className="flex-1 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-sm font-black text-white uppercase tracking-wide leading-tight">
            {t('side_inbox.geopolitics.unResolutionTitle', { title: cleanTitle }) || cleanTitle}
          </h4>
          <span className="text-[10px] font-extrabold text-cyan-300 bg-cyan-900/80 px-2.5 py-0.5 rounded-full border border-cyan-500/50 uppercase tracking-wider flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            Hubungan: {score}/100
          </span>
        </div>

        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          {t('side_inbox.senderPrefix', { sender: notification.sender, date: notification.timestamp }) || `Pengirim: ${notification.sender} | Tanggal: ${notification.timestamp}`}
        </p>

        <p className="text-xs font-medium text-slate-200 leading-relaxed pt-0.5">
          {notification.message}
        </p>

        <div className="bg-root-canvas border border-cyan-500/30 rounded-xl p-2.5 text-xs text-cyan-300 font-bold flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1">
          <span>Usulan: {notification.resolutionTitle}</span>
          <span className="text-root-subtle font-black">Target: {notification.targetCountry || displayTarget}</span>
        </div>

        <div className="pt-2 flex items-center justify-end">
          <button
            onClick={onRedirect}
            className="px-3.5 py-1.5 text-[10px] font-black uppercase tracking-wider bg-cyan-500 hover:bg-cyan-400 active:bg-cyan-600 text-slate-950 rounded-xl transition-all cursor-pointer shadow-[0_0_12px_rgba(6,182,212,0.4)] flex items-center gap-1.5"
          >
            <span>{t('side_inbox.geopolitics.openResolution') || 'Buka Detail Resolusi PBB →'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
