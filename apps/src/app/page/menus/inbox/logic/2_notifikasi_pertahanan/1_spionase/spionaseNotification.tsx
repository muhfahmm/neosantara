import React from 'react';
import { Eye, Check, X, ShieldAlert } from 'lucide-react';
import type { SpionaseNotification } from '@/app/page/detail_negara/3_operasi_militer/2_spionase/logic/spionaseLogic';
import EconomicIntelReportPanel from '@/app/page/detail_negara/3_operasi_militer/2_spionase/EconomicIntelReportPanel';
import MilitaryIntelReportPanel from '@/app/page/detail_negara/3_operasi_militer/2_spionase/MilitaryIntelReportPanel';

interface SpionaseNotificationProps {
  notification: SpionaseNotification;
  onAccept?: () => void;
  onReject?: () => void;
}

export default function SpionaseNotificationCard({ notification, onAccept, onReject }: SpionaseNotificationProps) {
  const isHandled = notification.isHandled;
  const isOffensive = notification.isOffensive;
  const isSuccess = notification.operationResult === 'success';

  if (isOffensive) {
    return (
      <div className={`border-l-4 ${isSuccess ? 'bg-emerald-950/30 border-emerald-500' : 'bg-rose-950/40 border-rose-500'} p-4 sm:p-5 rounded-r-2xl shadow-lg flex gap-4 items-start select-none relative overflow-hidden transition-all border ${isSuccess ? 'border-emerald-500/20' : 'border-rose-500/20'}`}>
        <div className={`w-11 h-11 rounded-xl ${isSuccess ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'bg-rose-500/20 border-rose-500/40 text-rose-400'} border flex items-center justify-center shrink-0 shadow-inner`}>
          {isSuccess ? <Check className="w-6 h-6 text-emerald-400" /> : <X className="w-6 h-6 text-rose-400" />}
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 className="text-sm font-black text-white uppercase tracking-wide leading-tight">
              {notification.title}
            </h4>
            <span className={`text-[10px] font-bold ${isSuccess ? 'text-emerald-300 bg-emerald-900/60 border-emerald-500/40' : 'text-rose-300 bg-rose-900/60 border-rose-500/40'} px-2.5 py-0.5 rounded-full border uppercase tracking-wider`}>
              {isSuccess ? 'Operasi Sukses' : 'Operasi Gagal'}
            </span>
          </div>

          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Pengirim: {notification.sender} | Target: {notification.partnerCountry} | Tanggal: {notification.timestamp}
          </p>

          <p className="text-xs font-medium text-slate-200 leading-relaxed pt-0.5">
            {notification.message}
          </p>

          <div className={`bg-root-canvas border ${isSuccess ? 'border-emerald-500/30 text-emerald-300' : 'border-rose-500/30 text-rose-300'} rounded-xl p-2.5 text-xs font-bold flex items-center justify-between`}>
            <span>Hasil Intelijen: {notification.effectText}</span>
            <span className="text-root-subtle font-black">Target: {notification.operationTarget || 'Informasi Rahasia'}</span>
          </div>

          {notification.militaryReport && (
            <MilitaryIntelReportPanel report={notification.militaryReport} />
          )}
          {notification.economicReport && (
            <EconomicIntelReportPanel report={notification.economicReport} />
          )}

          <div className="pt-2 flex items-center justify-end">
            <div className={`text-[11px] font-bold ${isSuccess ? 'text-emerald-400 bg-emerald-950/80 border-emerald-500/50' : 'text-rose-400 bg-rose-950/80 border-rose-500/50'} px-3 py-1.5 rounded-xl border flex items-center gap-1.5`}>
              {isSuccess ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
              <span>{isSuccess ? 'LAPORAN INTELIJEN TERVERIFIKASI' : 'OPERASI DITUTUP / AGEN DIEVAKUASI'}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`border-l-4 ${isHandled ? 'bg-emerald-950/30 border-emerald-500' : 'bg-purple-950/40 border-purple-500'} p-4 sm:p-5 rounded-r-2xl shadow-lg flex gap-4 items-start select-none relative overflow-hidden transition-all border border-purple-500/20`}>
      <div className={`w-11 h-11 rounded-xl ${isHandled ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'bg-purple-500/20 border-purple-500/40 text-purple-400'} border flex items-center justify-center shrink-0 shadow-inner`}>
        {isHandled ? <Check className="w-6 h-6 text-emerald-400" /> : <Eye className="w-6 h-6 animate-pulse text-purple-400" />}
      </div>

      <div className="flex-1 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-sm font-black text-white uppercase tracking-wide leading-tight">
            {notification.title}
          </h4>
          <span className="text-[10px] font-bold text-purple-300 bg-purple-900/60 px-2.5 py-0.5 rounded-full border border-purple-500/40 uppercase tracking-wider">
            Spionase ({notification.level})
          </span>
        </div>

        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Pengirim: {notification.sender} | Tanggal: {notification.timestamp}
        </p>

        <p className="text-xs font-medium text-slate-200 leading-relaxed pt-0.5">
          {notification.message}
        </p>

        <div className="bg-root-canvas border border-purple-500/30 rounded-xl p-2.5 text-xs text-purple-300 font-bold flex items-center justify-between">
          <span>Dampak: {notification.effectText}</span>
          <span className="text-amber-400 font-black">Biaya Operasi: {notification.costEM} NEO</span>
        </div>

        <div className="pt-2 flex items-center justify-end gap-2.5">
          {isHandled ? (
            <div className="text-[11px] font-bold text-emerald-400 bg-emerald-950/80 px-3 py-1.5 rounded-xl border border-emerald-500/50 flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5" />
              <span>{notification.status === 'ignored' ? 'EFEK SPIONASE AKTIF' : 'AGEN INTELIJEN TELAH DITANGKAP / DITANGANI'}</span>
            </div>
          ) : (
            <>
              {onReject && (
                <button
                  onClick={onReject}
                  className="px-3.5 py-1.5 text-[10px] font-black uppercase tracking-wider bg-rose-950/60 hover:bg-rose-900 border border-rose-500/40 text-rose-300 rounded-xl transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
                >
                  <X className="w-3.5 h-3.5" />
                  Abaikan (Risiko Leak)
                </button>
              )}
              {onAccept && (
                <button
                  onClick={onAccept}
                  className="px-4 py-1.5 text-[10px] font-black uppercase tracking-wider bg-root-accent hover:bg-emerald-400 text-root-canvas rounded-xl transition-all cursor-pointer shadow-[0_0_15px_rgba(0,255,170,0.3)] flex items-center gap-1.5 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Tangkap Agen ({notification.costEM} NEO)
                </button>
              )}
            </>
          )}
        </div>
        {!isHandled && typeof notification.remainingResponseDays === 'number' && (
          <p className="text-[10px] font-bold text-amber-300">
            Batas respons: {notification.remainingResponseDays} hari game
          </p>
        )}
      </div>
    </div>
  );
}