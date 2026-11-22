'use client';

import { useState } from 'react';
import { ArrowLeft, Monitor, Music, Volume2 } from 'lucide-react';
import { useLanguage } from '../paused_menu/terjemahan_paused_menu/languageLogic';
import { MapSettingsSection } from '../paused_menu/4_settings/MapSettingsSection';
import { ThemeSettingsSection } from '../paused_menu/4_settings/ThemeSettingsSection';
import { LanguageSettingsSection } from '../paused_menu/terjemahan_paused_menu/LanguageSettingsSection';
import { soundManager } from '@/lib/soundManager';

interface MainMenuSettingsScreenProps {
  onBack: () => void;
}

export function MainMenuSettingsScreen({ onBack }: MainMenuSettingsScreenProps) {
  const { t } = useLanguage();
  const [musicVol, setMusicVol] = useState(() => soundManager?.getMusicVolume() ?? 80);
  const [sfxVol, setSfxVol] = useState(() => soundManager?.getSfxVolume() ?? 70);
  const [resolution, setResolution] = useState('1920x1080');

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
            NEOSANTARA • SYSTEM CONFIGURATION
          </p>
          <h1 className="truncate text-base font-black uppercase tracking-[0.16em] sm:text-xl">
            {t('paused_menu.settings.title')}
          </h1>
        </div>
      </header>

      <section className="relative z-10 mx-auto w-full max-w-5xl flex-1 overflow-y-auto px-4 py-5 sm:px-8 sm:py-8">
        <div className="space-y-6 rounded-xl border border-emerald-500/15 bg-slate-950/45 p-4 sm:p-7">
          <div className="grid gap-x-10 gap-y-6 md:grid-cols-2">
            <div className="space-y-6">
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-200">
                    <Music className="h-4 w-4 text-emerald-400" />
                    {t('paused_menu.settings.musicVolume', { value: musicVol })}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={musicVol}
                    onChange={(event) => {
                      const value = Number(event.target.value);
                      setMusicVol(value);
                      soundManager?.setMusicVolume(value);
                    }}
                    className="w-full cursor-pointer accent-emerald-400"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-200">
                    <Volume2 className="h-4 w-4 text-emerald-400" />
                    {t('paused_menu.settings.sfxVolume', { value: sfxVol })}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={sfxVol}
                    onChange={(event) => {
                      const value = Number(event.target.value);
                      setSfxVol(value);
                      soundManager?.setSfxVolume(value);
                    }}
                    className="w-full cursor-pointer accent-emerald-400"
                  />
                </div>
              </div>

              <div className="space-y-2 border-t border-emerald-500/15 pt-5">
                <label className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-200">
                  <Monitor className="h-4 w-4 text-emerald-400" />
                  {t('paused_menu.settings.resolution')}
                </label>
                <select
                  value={resolution}
                  onChange={(event) => setResolution(event.target.value)}
                  className="w-full cursor-pointer rounded border border-emerald-500/25 bg-slate-950 px-3 py-2.5 text-sm font-bold text-slate-200 outline-none transition focus:border-emerald-400"
                >
                  <option value="1920x1080">1920 x 1080 (16:9)</option>
                  <option value="1600x900">1600 x 900 (16:9)</option>
                  <option value="1280x720">1280 x 720 (16:9)</option>
                </select>
              </div>
            </div>

            <div className="space-y-5">
              <ThemeSettingsSection />
              <LanguageSettingsSection />
              <MapSettingsSection />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
