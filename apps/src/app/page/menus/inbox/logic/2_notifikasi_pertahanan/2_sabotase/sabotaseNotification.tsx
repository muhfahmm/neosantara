import React from 'react';
import { Bomb, Check, X, ShieldAlert } from 'lucide-react';
import type { SabotaseNotification } from '@/app/page/detail_negara/3_operasi_militer/3_sabotase/logic/sabotaseLogic';

interface SabotaseNotificationProps {
  notification: SabotaseNotification;
  onAccept?: () => void;
  onReject?: () => void;
}

export default function SabotaseNotificationCard({ notification, onAccept, onReject }: SabotaseNotificationProps) {
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
              {isSuccess ? 'Sabotase Berhasil' : 'Sabotase Digagalkan'}
            </span>
          </div>

          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Pengirim: {notification.sender} | Target: {notification.partnerCountry} | Tanggal: {notification.timestamp}
          </p>

          <p className="text-xs font-medium text-slate-200 leading-relaxed pt-0.5">
            {notification.message}
          </p>

          <div className={`bg-root-canvas border ${isSuccess ? 'border-emerald-500/30 text-emerald-300' : 'border-rose-500/30 text-rose-300'} rounded-xl p-2.5 text-xs font-bold flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1`}>
            <span>Dampak Kerusakan: {notification.effectText}</span>
            <span className="text-root-subtle font-black">Instalasi: {notification.operationTarget || 'Fasilitas Militer'}</span>
          </div>

          <div className="pt-2 flex items-center justify-end">
            <div className={`text-[11px] font-bold ${isSuccess ? 'text-emerald-400 bg-emerald-950/80 border-emerald-500/50' : 'text-rose-400 bg-rose-950/80 border-rose-500/50'} px-3 py-1.5 rounded-xl border flex items-center gap-1.5`}>
              {isSuccess ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
              <span>{isSuccess ? 'OPERASI SABOTASE SELESAI' : 'TIM SABOTASE TELAH DIEVAKUASI'}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`border-l-4 ${isHandled ? 'bg-emerald-950/30 border-emerald-500' : 'bg-red-950/40 border-red-500'} p-4 sm:p-5 rounded-r-2xl shadow-lg flex gap-4 items-start select-none relative overflow-hidden transition-all border border-red-500/20`}>
      <div className={`w-11 h-11 rounded-xl ${isHandled ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'bg-red-500/20 border-red-500/40 text-red-400'} border flex items-center justify-center shrink-0 shadow-inner`}>
        {isHandled ? <Check className="w-6 h-6 text-emerald-400" /> : <Bomb className="w-6 h-6 animate-bounce text-red-400" />}
      </div>

      <div className="flex-1 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-sm font-black text-white uppercase tracking-wide leading-tight">
            {notification.title}
          </h4>
          <span className="text-[10px] font-bold text-red-300 bg-red-900/60 px-2.5 py-0.5 rounded-full border border-red-500/40 uppercase tracking-wider">
            Sabotase ({notification.sabotaseType})
          </span>
        </div>

        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Pelaku Terduga: {notification.partnerCountry} | Tanggal: {notification.timestamp}
        </p>

        <p className="text-xs font-medium text-slate-200 leading-relaxed pt-0.5">
          {notification.message}
        </p>

        <div className="bg-root-canvas border border-red-500/30 rounded-xl p-2.5 text-xs text-red-300 font-bold flex items-center justify-between">
          <span>Kerusakan: {notification.effectText}</span>
          <span className="text-amber-400 font-black">Investigasi & Perbaikan: {notification.costEM} EM</span>
        </div>

        <div className="pt-2 flex items-center justify-end gap-2.5">
          {isHandled ? (
            <div className="text-[11px] font-bold text-emerald-400 bg-emerald-950/80 px-3 py-1.5 rounded-xl border border-emerald-500/50 flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5" />
              <span>{notification.status === 'ignored' ? 'KERUSAKAN ALUTSISTA PERMANEN TERJADI' : 'KERUSAKAN PERBAIKAN & PENANGANAN SELESAI'}</span>
            </div>
          ) : (
            <>
              {onReject && (
                <button
                  onClick={onReject}
                  className="px-3.5 py-1.5 text-[10px] font-black uppercase tracking-wider bg-rose-950/60 hover:bg-rose-900 border border-rose-500/40 text-rose-300 rounded-xl transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
                >
                  <X className="w-3.5 h-3.5" />
                  Abaikan (Risiko Kerusakan Permanen)
                </button>
              )}
              {onAccept && (
                <button
                  onClick={onAccept}
                  className="px-4 py-1.5 text-[10px] font-black uppercase tracking-wider bg-root-accent hover:bg-emerald-400 text-root-canvas rounded-xl transition-all cursor-pointer shadow-[0_0_15px_rgba(0,255,170,0.3)] flex items-center gap-1.5 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Investigasi & Perbaiki ({notification.costEM} EM)
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