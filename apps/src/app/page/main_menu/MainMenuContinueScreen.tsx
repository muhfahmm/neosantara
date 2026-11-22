'use client';

import type { MouseEvent } from 'react';
import { ArrowLeft, CalendarDays, Globe, Landmark, Trash2 } from 'lucide-react';
import { useLanguage } from '../paused_menu/terjemahan_paused_menu/languageLogic';

export interface MainMenuSave {
  id: number;
  save_name: string;
  country_name: string;
  country_iso?: string;
  game_date: string;
  anggaran?: number;
  ideology?: string;
}

interface MainMenuContinueScreenProps {
  saves: MainMenuSave[];
  isLoading: boolean;
  onBack: () => void;
  onLoad: (save: MainMenuSave) => void;
  onDelete: (id: number, event: MouseEvent<HTMLButtonElement>) => void;
}

export function MainMenuContinueScreen({
  saves,
  isLoading,
  onBack,
  onLoad,
  onDelete,
}: MainMenuContinueScreenProps) {
  const { t } = useLanguage();

  return (
    <main className="relative isolate flex min-h-screen min-h-[100dvh] flex-col overflow-hidden bg-[#070b14] font-sans text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: 'linear-gradient(rgba(16,185,129,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.8) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />
      <header className="relative z-10 flex shrink-0 items-center gap-4 border-b border-emerald-500/15 px-4 py-4 sm:px-8 lg:px-12">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 text-xs font-bold uppercase tracking-wider text-slate-300 transition hover:border-emerald-400/40 hover:text-emerald-300"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {t('menu_utama.credits.back')}
        </button>
        <div className="min-w-0">
          <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-emerald-400/60">
            NEOSANTARA • SAVE ARCHIVE
          </p>
          <h1 className="truncate text-base font-black uppercase tracking-[0.16em] sm:text-xl">
            {t('menu_utama.continue_modal_title')}
          </h1>
        </div>
      </header>

      <section className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-6 sm:px-8 sm:py-10">
        <div className="mb-5 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-300/60">
          <span className="h-px flex-1 bg-emerald-400/15" />
          <span>{t('menu_utama.continue_sub')}</span>
          <span className="h-px flex-1 bg-emerald-400/15" />
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex min-h-64 flex-col items-center justify-center gap-4 text-slate-400">
              <div className="h-9 w-9 animate-spin rounded-full border-2 border-emerald-500/20 border-t-emerald-400" />
              <p className="text-sm font-bold">{t('menu_utama.loading_saves')}</p>
            </div>
          ) : saves.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] px-5 text-center">
              <Globe className="mb-4 h-10 w-10 text-slate-600" aria-hidden="true" />
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-300">
                {t('menu_utama.no_saves_title')}
              </h2>
              <p className="mt-2 max-w-md text-xs leading-relaxed text-slate-500">
                {t('menu_utama.no_saves_desc')}
              </p>
            </div>
          ) : (
            <div className="grid gap-3 lg:grid-cols-2">
              {saves.map((save) => (
                <article
                  key={save.id}
                  className="group flex min-w-0 items-center gap-4 rounded-xl border border-white/10 bg-white/[0.04] p-4 transition hover:border-emerald-400/30 hover:bg-white/[0.07]"
                >
                  <button
                    type="button"
                    onClick={() => onLoad(save)}
                    className="flex min-w-0 flex-1 items-start gap-4 text-left"
                  >
                    <img
                      src={`https://flagcdn.com/w80/${save.country_iso?.toLowerCase() || 'un'}.png`}
                      className="mt-0.5 h-8 w-12 shrink-0 rounded border border-white/10 object-cover"
                      alt=""
                      aria-hidden="true"
                      onError={(event) => {
                        event.currentTarget.src = 'https://flagcdn.com/w80/un.png';
                      }}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-black uppercase text-white transition group-hover:text-emerald-300">
                        {save.save_name}
                      </span>
                      <span className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] font-bold text-slate-400">
                        <span className="inline-flex items-center gap-1.5">
                          <Globe className="h-3.5 w-3.5 text-emerald-400" />
                          {save.country_name}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <CalendarDays className="h-3.5 w-3.5 text-blue-400" />
                          {new Date(save.game_date).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                        {save.anggaran !== undefined && (
                          <span className="inline-flex items-center gap-1.5">
                            <Landmark className="h-3.5 w-3.5 text-amber-400" />
                            {save.anggaran.toLocaleString('id-ID', { maximumFractionDigits: 2 })} NEO
                          </span>
                        )}
                        {save.ideology && (
                          <span className="rounded border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 uppercase tracking-wider text-emerald-300">
                            {save.ideology}
                          </span>
                        )}
                      </span>
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={(event) => onDelete(save.id, event)}
                    title={t('menu_utama.delete_save_title')}
                    aria-label={`${t('menu_utama.delete_save_title')}: ${save.save_name}`}
                    className="shrink-0 rounded-lg border border-red-500/20 bg-red-500/10 p-2.5 text-red-400 transition hover:bg-red-500/20 hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
