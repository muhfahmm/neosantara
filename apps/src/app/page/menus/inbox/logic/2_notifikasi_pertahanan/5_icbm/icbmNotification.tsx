import React from 'react';
import { Radio, Check, X, ShieldAlert, Atom, Hammer, ArrowRight } from 'lucide-react';
import { ICBMNotification } from './icbmLogic';

interface ICBMNotificationProps {
  notification: ICBMNotification;
  onAccept?: () => void;
  onReject?: () => void;
}

export default function ICBMNotificationCard({ notification, onAccept, onReject }: ICBMNotificationProps) {
  const tradeType = notification.tradeType;
  const isHandled = notification.isHandled;

  // 1. Notifikasi Pembangunan Program Nuklir Dimulai
  if (tradeType === 'program_nuklir_dimulai') {
    return (
      <div className="border-l-4 bg-amber-950/40 border-amber-500 p-4 sm:p-5 rounded-r-2xl shadow-xl flex gap-4 items-start select-none relative overflow-hidden transition-all border border-amber-500/30">
        <div className="w-11 h-11 rounded-xl bg-amber-500/20 border border-amber-500/50 text-amber-400 flex items-center justify-center shrink-0 shadow-inner">
          <Hammer className="w-6 h-6 animate-bounce text-amber-400" />
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 className="text-sm font-black text-amber-200 uppercase tracking-wide leading-tight">
              {notification.title}
            </h4>
            <span className="text-[10px] font-black text-amber-300 bg-amber-900/80 px-2.5 py-0.5 rounded-full border border-amber-500/60 uppercase tracking-wider">
              DALAM PEMBANGUNAN
            </span>
          </div>

          <p className="text-[10px] font-bold text-amber-400/80 uppercase tracking-wider">
            Pengirim: {notification.sender} | Tanggal: {notification.timestamp}
          </p>

          <p className="text-xs font-medium text-slate-200 leading-relaxed pt-0.5">
            {notification.message}
          </p>

          <div className="bg-[#1A140A] border border-amber-500/40 rounded-xl p-2.5 text-xs text-amber-300 font-bold flex items-center justify-between">
            <span>Status: {notification.effectText}</span>
          </div>
        </div>
      </div>
    );
  }

  // 2. Notifikasi Program Nuklir Selesai & Aktif
  if (tradeType === 'program_nuklir_selesai') {
    return (
      <div className="border-l-4 bg-emerald-950/50 border-emerald-400 p-4 sm:p-5 rounded-r-2xl shadow-xl flex gap-4 items-start select-none relative overflow-hidden transition-all border border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
        <div className="w-11 h-11 rounded-xl bg-emerald-500/20 border border-emerald-400/50 text-emerald-400 flex items-center justify-center shrink-0 shadow-inner">
          <Atom className="w-6 h-6 animate-pulse text-emerald-400" />
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 className="text-sm font-black text-emerald-200 uppercase tracking-wide leading-tight">
              {notification.title}
            </h4>
            <span className="text-[10px] font-black text-emerald-300 bg-emerald-900/80 px-2.5 py-0.5 rounded-full border border-emerald-400/60 uppercase tracking-wider">
              NUKLIR AKTIF & SIAP
            </span>
          </div>

          <p className="text-[10px] font-bold text-emerald-400/80 uppercase tracking-wider">
            Pengirim: {notification.sender} | Tanggal: {notification.timestamp}
          </p>

          <p className="text-xs font-medium text-slate-100 leading-relaxed pt-0.5">
            {notification.message}
          </p>

          <div className="bg-[#0A1A14] border border-emerald-500/40 rounded-xl p-2.5 text-xs text-emerald-300 font-bold flex items-center justify-between">
            <span>{notification.effectText}</span>
          </div>

          {onAccept && (
            <div className="pt-2 flex justify-end">
              <button
                onClick={onAccept}
                className="px-4 py-1.5 text-[10px] font-black uppercase tracking-wider bg-[#00FFAA] hover:bg-emerald-400 text-[#0A1A1A] rounded-xl transition-all cursor-pointer shadow-[0_0_15px_rgba(0,255,170,0.3)] flex items-center gap-1.5 hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Buka Komando Nuklir</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 3. Notifikasi Deteksi Peluncuran ICBM Darurat
  return (
    <div className={`border-l-4 ${isHandled ? 'bg-emerald-950/30 border-emerald-500' : 'bg-rose-950/70 border-rose-600'} p-4 sm:p-5 rounded-r-2xl shadow-xl flex gap-4 items-start select-none relative overflow-hidden transition-all border border-rose-600/40 animate-pulse`}>
      <div className={`w-11 h-11 rounded-xl ${isHandled ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'bg-rose-600/30 border-rose-500/50 text-rose-400'} border flex items-center justify-center shrink-0 shadow-inner`}>
        {isHandled ? <Check className="w-6 h-6 text-emerald-400" /> : <Radio className="w-6 h-6 animate-ping text-rose-400" />}
      </div>

      <div className="flex-1 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-sm font-black text-rose-200 uppercase tracking-wide leading-tight">
            {notification.title}
          </h4>
          <span className="text-[10px] font-black text-rose-100 bg-rose-900/80 px-2.5 py-0.5 rounded-full border border-rose-500/60 uppercase tracking-wider">
            ANCAMAN NUKLIR DEFCON 1
          </span>
        </div>

        <p className="text-[10px] font-bold text-rose-300 uppercase tracking-wider">
          Peluncur: {notification.launcherCountry || 'Musuh'} | Target: {notification.targetCity || 'Ibu Kota'} | Waktu: {notification.timestamp}
        </p>

        <p className="text-xs font-medium text-slate-100 leading-relaxed pt-0.5">
          {notification.message}
        </p>

        <div className="bg-[#1A0A0A] border border-rose-500/50 rounded-xl p-2.5 text-xs text-rose-300 font-bold flex items-center justify-between">
          <span>Dampak: {notification.effectText}</span>
          {notification.costEM && <span className="text-amber-300 font-black">Biaya Pencegatan (Anti-Ballistic System): {notification.costEM} EM</span>}
        </div>

        <div className="pt-2 flex items-center justify-end gap-2.5">
          {isHandled ? (
            <div className="text-[11px] font-bold text-emerald-400 bg-emerald-950/80 px-3 py-1.5 rounded-xl border border-emerald-500/50 flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5" />
              <span>RUDAL NUKLIR BERHASIL DICEGAT & DIHANCURKAN DI UDARA</span>
            </div>
          ) : (
            <>
              {onReject && (
                <button
                  onClick={onReject}
                  className="px-3.5 py-1.5 text-[10px] font-black uppercase tracking-wider bg-rose-950/80 hover:bg-rose-900 border border-rose-500/60 text-rose-200 rounded-xl transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
                >
                  <X className="w-3.5 h-3.5" />
                  Pasrah / Tidak Cegat
                </button>
              )}
              {onAccept && (
                <button
                  onClick={onAccept}
                  className="px-4 py-1.5 text-[10px] font-black uppercase tracking-wider bg-rose-500 hover:bg-rose-400 text-white rounded-xl transition-all cursor-pointer shadow-[0_0_20px_rgba(244,63,94,0.6)] flex items-center gap-1.5 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Aktifkan Perisai Rudal ({notification.costEM} EM)
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
