"use client";

import React from 'react';
import { Play, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/app/page/paused_menu/terjemahan_paused_menu/languageLogic';

type Props = { children: React.ReactNode };

interface State {
  hasError: boolean;
  errorMessage: string;
}

function ErrorBoundaryFallback({ onReload }: { onReload: () => void }) {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-[#070b14] text-white flex flex-col items-center justify-center p-6 text-center select-none">
      <div className="w-16 h-16 mb-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
        <span className="text-2xl font-black">!</span>
      </div>
      <h1 className="text-xl sm:text-2xl font-black tracking-wider text-slate-100 mb-2">
        {t('common.errorBoundary.title')}
      </h1>
      <p className="text-xs sm:text-sm text-slate-400 max-w-md mb-6 leading-relaxed">
        {t('common.errorBoundary.description')}
      </p>
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
        <Link
          href="/page/map_system/pilih-negara"
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-bold text-xs uppercase tracking-wider transition-all"
        >
          <Play className="w-4 h-4" />
          {t('common.errorBoundary.startSimulation')}
        </Link>
        <button
          onClick={onReload}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-bold text-xs uppercase tracking-wider transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          {t('common.errorBoundary.reload')}
        </button>
      </div>
    </div>
  );
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, errorMessage: error?.message || 'Unknown error' };
  }

  async componentDidCatch(error: any, info: any) {
    try {
      await fetch('/api/client-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'errorBoundary', error: String(error), info }),
      });
    } catch {
      // ignore network errors in fallback reporter
    }
    console.error('ErrorBoundary caught error:', error, info);
  }

  handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return <ErrorBoundaryFallback onReload={this.handleReload} />;
    }
    return this.props.children;
  }
}
