'use client';

import React, { useEffect, useState } from 'react';
import { isDesktopOrAppEnvironment } from '@/lib/clientEnv';
import { ShieldAlert, Download, Monitor, Smartphone } from 'lucide-react';

interface DesktopOnlyGuardProps {
  children: React.ReactNode;
}

export default function DesktopOnlyGuard({ children }: DesktopOnlyGuardProps) {
  const [isClient, setIsClient] = useState(false);
  const [isAllowed, setIsAllowed] = useState(true);

  useEffect(() => {
    setIsClient(true);
    // Development mode bypass jika env NEXT_PUBLIC_ALLOW_WEB_DEV diaktifkan, jika tidak cek desktop env
    const allowWebInDev = process.env.NEXT_PUBLIC_ALLOW_WEB_GAME === 'true';
    if (allowWebInDev) {
      setIsAllowed(true);
      return;
    }

    const allowed = isDesktopOrAppEnvironment();
    setIsAllowed(allowed);
  }, []);

  if (!isClient) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950 text-white">
        <div className="animate-pulse text-xs tracking-widest text-emerald-500 font-mono">
          NEOSANTARA CORE INITIALIZING...
        </div>
      </div>
    );
  }

  if (!isAllowed) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 p-6 text-white select-none">
        <div className="relative max-w-lg w-full rounded-2xl border border-emerald-500/30 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-xl text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <ShieldAlert className="h-8 w-8 animate-pulse" />
          </div>

          <h2 className="text-xl font-bold tracking-wider text-emerald-400 font-mono uppercase mb-2">
            Akses Web Dibatasi
          </h2>
          <p className="text-sm text-slate-400 mb-6 leading-relaxed">
            Sistem simulasi <strong className="text-white">Neosantara</strong> berjalan dalam mode serverless backend / API. Antarmuka permainan hanya dapat diakses melalui aplikasi resmi <strong className="text-emerald-400">Desktop (.exe)</strong> atau <strong className="text-emerald-400">Mobile (.apk)</strong>.
          </p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
              <Monitor className="h-6 w-6 text-emerald-400 mb-2" />
              <span className="text-xs font-semibold text-slate-200">Desktop App</span>
              <span className="text-[10px] text-slate-400">Windows (.exe)</span>
            </div>
            <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
              <Smartphone className="h-6 w-6 text-emerald-400 mb-2" />
              <span className="text-xs font-semibold text-slate-200">Mobile App</span>
              <span className="text-[10px] text-slate-400">Android (.apk)</span>
            </div>
          </div>

          <a
            href="/"
            className="inline-flex items-center justify-center gap-2 w-full py-3 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs tracking-wider uppercase transition-all shadow-lg shadow-emerald-500/20 font-mono"
          >
            <Download className="h-4 w-4" />
            Kembali ke Portal Download
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
