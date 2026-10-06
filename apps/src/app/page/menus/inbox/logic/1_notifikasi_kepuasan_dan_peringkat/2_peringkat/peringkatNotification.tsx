import React from 'react';
import { Award, ShieldAlert } from 'lucide-react';
import { NotificationMessage } from '../1_kepuasan/kepuasanLogic';

interface PeringkatNotificationProps {
  notification: NotificationMessage;
  onCrackdownClick?: () => void;
}

export default function PeringkatNotification({ notification, onCrackdownClick }: PeringkatNotificationProps) {
  return (
    <div className="bg-red-50/70 border-l-4 border-red-500 p-4 rounded-r-xl shadow-sm flex gap-4 items-start select-none">
      <div className="w-10 h-10 rounded-full bg-red-100 border border-red-300 flex items-center justify-center text-red-600 shrink-0">
        <Award className="w-5 h-5" />
      </div>
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-black text-red-900 uppercase tracking-wide">{notification.title}</h4>
          <span className="text-[10px] font-bold text-red-700 bg-red-100/50 px-2 py-0.5 rounded border border-red-200">
            Peringkat: {notification.value}/100
          </span>
        </div>
        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          Pengirim: {notification.sender} | Waktu: {notification.timestamp}
        </p>
        <p className="text-xs font-medium text-slate-700 leading-relaxed pt-1">
          {notification.message}
        </p>
        <div className="pt-2 flex justify-end gap-2">
          {notification.provinceIncident && onCrackdownClick && (
            <button
              onClick={onCrackdownClick}
              disabled={notification.provinceIncident.handled}
              className="px-3 py-1 text-[10px] font-black uppercase tracking-wider bg-rose-100 hover:bg-rose-200 border border-rose-300 text-rose-900 rounded transition-all cursor-pointer shadow-sm flex items-center gap-1 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <ShieldAlert className="w-3 h-3" />
              {notification.provinceIncident.handled ? 'Massa Telah Dibubarkan' : 'Bubarkan Massa'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
