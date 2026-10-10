// wabahNotification.tsx
// Component UI Notifikasi Wabah Penyakit (Epidemi & Pandemi) di Inbox

import React from 'react';
import { Activity, Check, X, Stethoscope } from 'lucide-react';
import { WabahPenyakitNotification } from './wabahLogic';

interface WabahNotificationProps {
  notification: WabahPenyakitNotification;
  onAccept?: () => void;
  onReject?: () => void;
}

export default function WabahNotification({ notification, onAccept, onReject }: WabahNotificationProps) {
  const isHandled = notification.isHandled;
  const isPandemi = notification.category?.includes('Pandemi');

  return (
    <div className={`border-l-4 ${isHandled ? 'bg-emerald-950/30 border-emerald-500' : isPandemi ? 'bg-purple-950/40 border-purple-500' : 'bg-teal-950/40 border-teal-500'} p-4 sm:p-5 rounded-r-2xl shadow-lg flex gap-4 items-start select-none relative overflow-hidden transition-all border ${isPandemi ? 'border-purple-500/20' : 'border-teal-500/20'}`}>
      {/* Icon */}
      <div className={`w-11 h-11 rounded-xl ${isHandled ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : isPandemi ? 'bg-purple-500/20 border-purple-500/40 text-purple-400' : 'bg-teal-500/20 border-teal-500/40 text-teal-400'} border flex items-center justify-center shrink-0 shadow-inner`}>
        {isHandled ? <Check className="w-6 h-6 text-emerald-400" /> : <Activity className="w-6 h-6 animate-pulse" />}
      </div>

      <div className="flex-1 space-y-2">
        {/* Header Title & Category */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-sm font-black text-white uppercase tracking-wide leading-tight">
            {notification.title}
          </h4>
          <span className={`text-[10px] font-bold ${isPandemi ? 'text-purple-300 bg-purple-900/60 border-purple-500/40' : 'text-teal-300 bg-teal-900/60 border-teal-500/40'} px-2.5 py-0.5 rounded-full border uppercase tracking-wider`}>
            {notification.category || 'Wabah Penyakit'}
          </span>
        </div>

        {/* Sender & Timestamp */}
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Pengirim: {notification.sender} | Tanggal: {notification.timestamp}
        </p>

        {/* Message */}
        <p className="text-xs font-medium text-slate-200 leading-relaxed pt-0.5">
          {notification.message}
        </p>
        {notification.skenario &&
          notification.persentaseTerinfeksi !== undefined &&
          notification.persentaseKematian !== undefined && (
          <p className="text-[10px] font-bold text-slate-400">
            Skenario {notification.skenario} · {(notification.persentaseTerinfeksi * 100).toLocaleString('id-ID', { maximumFractionDigits: 2 })}% terinfeksi · IFR {(notification.persentaseKematian * 100).toLocaleString('id-ID', { maximumFractionDigits: 2 })}%
          </p>
        )}

        {/* Details Grid: Kasus, perkiraan kematian, dan biaya */}
        <div className="bg-[#0A1A1A] border border-teal-500/30 rounded-xl p-3 grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs font-bold text-white shadow-inner">
          <div className="border-r border-teal-500/20 pr-1">
            <div className="text-slate-400 text-[9px] uppercase font-bold tracking-wider">Kasus Terinfeksi</div>
            <div className="text-purple-400 font-extrabold mt-0.5">{notification.korban?.toLocaleString('id-ID')} Orang</div>
          </div>
          <div className="border-r border-teal-500/20 px-1">
            <div className="text-slate-400 text-[9px] uppercase font-bold tracking-wider">Perkiraan Kematian</div>
            <div className="text-rose-400 font-extrabold mt-0.5">{notification.perkiraanKematian?.toLocaleString('id-ID')} Orang</div>
          </div>
          <div className="border-r border-teal-500/20 px-1">
            <div className="text-slate-400 text-[9px] uppercase font-bold tracking-wider">Durasi</div>
            <div className="text-cyan-300 font-extrabold mt-0.5">{notification.durationDays} Hari</div>
          </div>
          <div className="border-r border-teal-500/20 px-1">
            <div className="text-slate-400 text-[9px] uppercase font-bold tracking-wider">Kerugian Sektor Medis</div>
            <div className="text-amber-400 font-extrabold mt-0.5">{notification.totalKerugian?.toLocaleString('id-ID')} NEO</div>
          </div>
          <div className="pl-1">
            <div className="text-slate-400 text-[9px] uppercase font-bold tracking-wider">Biaya Medis (1 NEO/Pasien)</div>
            <div className="text-[#00FFAA] font-extrabold mt-0.5">{notification.bantuanCost?.toLocaleString('id-ID')} NEO</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex items-center justify-end gap-2.5">
          {isHandled ? (
            <div className="text-[11px] font-bold text-emerald-400 bg-emerald-950/80 px-3 py-1.5 rounded-xl border border-emerald-500/50 flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5" />
              <span>DANA MEDIS SEBESAR {notification.bantuanCost?.toLocaleString('id-ID')} NEO TELAH DISALURKAN</span>
            </div>
          ) : (
            <>
              {onReject && (
                <button
                  onClick={onReject}
                  className="px-3.5 py-1.5 text-[10px] font-black uppercase tracking-wider bg-rose-950/60 hover:bg-rose-900 border border-rose-500/40 text-rose-300 rounded-xl transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
                >
                  <X className="w-3.5 h-3.5" />
                  Abaikan / Tolak
                </button>
              )}
              {onAccept && (
                <button
                  onClick={onAccept}
                  className="px-4 py-1.5 text-[10px] font-black uppercase tracking-wider bg-[#00FFAA] hover:bg-emerald-400 text-[#0A1A1A] rounded-xl transition-all cursor-pointer shadow-[0_0_15px_rgba(0,255,170,0.3)] flex items-center gap-1.5 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Stethoscope className="w-3.5 h-3.5" />
                  Bantu Medis ({notification.bantuanCost?.toLocaleString('id-ID')} NEO)
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
