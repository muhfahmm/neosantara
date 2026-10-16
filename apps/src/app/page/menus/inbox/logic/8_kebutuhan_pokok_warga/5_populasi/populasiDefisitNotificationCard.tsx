"use client";

import { AlertTriangle, Users } from "lucide-react";
import type { PopulasiDefisitNotification } from "./populasiDefisitLogic";

interface Props {
  notification: PopulasiDefisitNotification;
}

export default function PopulasiDefisitNotificationCard({
  notification,
}: Props) {
  return (
    <article className="relative flex items-start gap-4 overflow-hidden rounded-2xl border border-rose-500/30 border-l-4 border-l-rose-500 bg-rose-950/40 p-4 shadow-lg sm:p-5">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-rose-500/40 bg-rose-500/20 text-rose-400">
        <Users className="h-6 w-6" />
      </div>
      <div className="flex-1 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-sm font-black uppercase leading-tight tracking-wide text-white">
            {notification.title}
          </h4>
          <span className="flex items-center gap-1 rounded-full border border-rose-500/50 bg-rose-900/80 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-rose-300">
            <AlertTriangle className="h-3 w-3" />
            Populasi menurun
          </span>
        </div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Pengirim: {notification.sender} | Tanggal: {notification.timestamp}
        </p>
        <p className="text-xs font-medium leading-relaxed text-slate-200">
          {notification.message}
        </p>
        <div className="grid grid-cols-1 gap-2 pt-1 sm:grid-cols-2">
          <div className="rounded-lg border border-rose-500/20 bg-[#0A1A1A] p-2.5">
            <p className="text-[9px] font-bold uppercase text-slate-400">
              Perubahan bersih harian
            </p>
            <p className="mt-1 text-sm font-black text-rose-400">
              {notification.dailyChange.toLocaleString("id-ID")} jiwa
            </p>
          </div>
          <div className="rounded-lg border border-rose-500/20 bg-[#0A1A1A] p-2.5">
            <p className="text-[9px] font-bold uppercase text-slate-400">
              Populasi saat laporan
            </p>
            <p className="mt-1 text-sm font-black text-[#E0E0E0]">
              {notification.currentPopulation.toLocaleString("id-ID")} jiwa
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
