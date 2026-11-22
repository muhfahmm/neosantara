'use client';

import React from 'react';
import { Languages, Check } from 'lucide-react';
import { useLanguage } from './languageLogic';
import { SUPPORTED_LANGUAGES, type LanguageCode } from './types';

export function LanguageSettingsSection() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="space-y-3 pt-4 border-t border-root-accent/15 text-start">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-black text-root-text uppercase tracking-wider flex items-center gap-1.5">
          <Languages className="w-3.5 h-3.5 text-root-accent shrink-0" />
          <span>{t('paused_menu.settings.languageTitle')}</span>
        </label>
        <span className="text-[9px] font-mono text-root-accent/70 uppercase">
          {t('paused_menu.settings.languageSubtitle')}
        </span>
      </div>

      <p className="text-[11px] text-gray-400">
        {t('paused_menu.settings.languageDesc')}
      </p>

      {/* Grid 8 Bahasa */}
      <div
        role="radiogroup"
        aria-label={t('paused_menu.settings.languageTitle')}
        className="grid grid-cols-2 gap-2"
      >
        {SUPPORTED_LANGUAGES.map((item) => {
          const isSelected = language === item.code;
          return (
            <button
              key={item.code}
              type="button"
              role="radio"
              aria-checked={isSelected}
              tabIndex={0}
              onClick={() => setLanguage(item.code as LanguageCode)}
              className={`relative px-3 py-2.5 rounded border text-start transition-all cursor-pointer flex items-center justify-between group ${
                isSelected
                  ? 'bg-root-accent/20 border-root-accent text-root-accent shadow-[0_0_10px_rgba(0,255,170,0.25)]'
                  : 'bg-root-canvas border-root-accent/20 text-gray-400 hover:text-white hover:border-root-accent/40'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0 pr-1">
                <img
                  src={`https://flagcdn.com/w40/${item.flagCode}.png`}
                  alt=""
                  aria-hidden="true"
                  className="w-5 h-4 shrink-0 rounded-[2px] object-cover shadow-[0_0_0_1px_rgba(255,255,255,0.12)]"
                  onError={(event) => {
                    event.currentTarget.style.display = 'none';
                  }}
                />
                <div className="flex flex-col min-w-0">
                  <div className="flex items-baseline gap-1.5 min-w-0">
                    <span className="text-[12px] font-bold tracking-wide truncate">
                      {item.nativeName}
                    </span>
                    <span className="shrink-0 text-[9px] font-mono text-root-accent/70">
                      ({item.code})
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-400 group-hover:text-gray-300 font-mono">
                    {item.nameEn}
                  </span>
                </div>
              </div>

              {isSelected && (
                <div className="shrink-0 flex items-center justify-center w-4 h-4 rounded-full bg-root-accent/30 text-root-accent">
                  <Check className="w-3 h-3 stroke-[2.5]" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
