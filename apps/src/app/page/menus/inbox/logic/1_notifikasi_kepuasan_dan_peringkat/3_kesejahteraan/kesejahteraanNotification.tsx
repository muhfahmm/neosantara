import React from 'react';
import { Heart } from 'lucide-react';
import { NotificationMessage } from '../1_kepuasan/kepuasanLogic';

interface KesejahteraanNotificationProps {
  notification: NotificationMessage;
}

export default function KesejahteraanNotification({ notification }: KesejahteraanNotificationProps) {
  return (
    <div className="bg-rose-50/70 border-l-4 border-rose-500 p-4 rounded-r-xl shadow-sm flex gap-4 items-start select-none">
      <div className="w-10 h-10 rounded-full bg-rose-100 border border-rose-300 flex items-center justify-center text-rose-600 shrink-0">
        <Heart className="w-5 h-5" />
      </div>
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-black text-rose-900 uppercase tracking-wide">{notification.title}</h4>
          <span className="text-[10px] font-bold text-rose-700 bg-rose-100/50 px-2 py-0.5 rounded border border-rose-200">
            Kesejahteraan: {notification.value}/100
          </span>
        </div>
        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          Pengirim: {notification.sender} | Waktu: {notification.timestamp}
        </p>
        <p className="text-xs font-medium text-slate-700 leading-relaxed pt-1">
          {notification.message}
        </p>
      </div>
    </div>
  );
}
