import React from 'react';
import { Smile, AlertTriangle, ExternalLink } from 'lucide-react';
import { NotificationMessage } from './kepuasanLogic';

interface KepuasanNotificationProps {
  notification: NotificationMessage;
  onActionClick?: () => void;
  onRedirectClick?: () => void;
}

export default function KepuasanNotification({ notification, onActionClick, onRedirectClick }: KepuasanNotificationProps) {
  return (
    <div className="bg-amber-50/70 border-l-4 border-amber-500 p-4 rounded-r-xl shadow-sm flex gap-4 items-start select-none">
      <div className="w-10 h-10 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-600 shrink-0">
        <Smile className="w-5 h-5" />
      </div>
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-black text-amber-900 uppercase tracking-wide">{notification.title}</h4>
          <span className="text-[10px] font-bold text-amber-700 bg-amber-100/50 px-2 py-0.5 rounded border border-amber-200">
            Nilai: {notification.value}/100
          </span>
        </div>
        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          Pengirim: {notification.sender} | Waktu: {notification.timestamp}
        </p>
        <p className="text-xs font-medium text-slate-700 leading-relaxed pt-1">
          {notification.message}
        </p>
        <div className="pt-2 flex justify-end gap-2">
          {onActionClick && (
            <button
              onClick={onActionClick}
              className="px-3 py-1 text-[10px] font-black uppercase tracking-wider bg-amber-100 hover:bg-amber-200 border border-amber-300 text-amber-800 rounded transition-all cursor-pointer shadow-sm flex items-center gap-1"
            >
              <AlertTriangle className="w-3 h-3" />
              Luncurkan Festival Sosial
            </button>
          )}
          {onRedirectClick && (
            <button
              onClick={onRedirectClick}
              className="px-3 py-1 text-[10px] font-black uppercase tracking-wider bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-[#FAF6EE] rounded transition-all cursor-pointer shadow hover:shadow-md flex items-center gap-1"
            >
              <ExternalLink className="w-3 h-3" />
              Naikkan Kepuasan
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
