'use client';

import { useEffect, useMemo } from 'react';
import { ArrowLeft, ScrollText } from 'lucide-react';
import { useLanguage } from '../paused_menu/terjemahan_paused_menu/languageLogic';
import styles from './credits-menu.module.css';

interface CreditsMenuProps {
  onBack: () => void;
}

export function CreditsMenu({ onBack }: CreditsMenuProps) {
  const { t } = useLanguage();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onBack();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onBack]);

  const sections = useMemo(() => [
    {
      title: t('menu_utama.credits.teamTitle'),
      intro: t('menu_utama.credits.teamIntro'),
      entries: [
        ['menu_utama.credits.founderRole', 'menu_utama.credits.founderName'],
        ['menu_utama.credits.developmentRole', 'menu_utama.credits.teamName'],
        ['menu_utama.credits.designRole', 'menu_utama.credits.teamName'],
        ['menu_utama.credits.uiRole', 'menu_utama.credits.teamName'],
        ['menu_utama.credits.storyRole', 'menu_utama.credits.teamName'],
      ],
    },
    {
      title: t('menu_utama.credits.techTitle'),
      intro: t('menu_utama.credits.techIntro'),
      entries: [
        ['menu_utama.credits.webRole', 'menu_utama.credits.webValue'],
        ['menu_utama.credits.appRole', 'menu_utama.credits.appValue'],
        ['menu_utama.credits.mapRole', 'menu_utama.credits.mapValue'],
        ['menu_utama.credits.styleRole', 'menu_utama.credits.styleValue'],
        ['menu_utama.credits.iconsRole', 'menu_utama.credits.iconsValue'],
        ['menu_utama.credits.databaseRole', 'menu_utama.credits.databaseValue'],
      ],
      note: t('menu_utama.credits.techNote'),
    },
    {
      title: t('menu_utama.credits.assetsTitle'),
      entries: [
        ['menu_utama.credits.mapDataRole', 'menu_utama.credits.mapDataValue'],
        ['menu_utama.credits.flagRole', 'menu_utama.credits.flagValue'],
        ['menu_utama.credits.audioRole', 'menu_utama.credits.audioValue'],
        ['menu_utama.credits.visualRole', 'menu_utama.credits.visualValue'],
      ],
    },
    {
      title: t('menu_utama.credits.thanksTitle'),
      paragraphs: [
        t('menu_utama.credits.communityThanks'),
        t('menu_utama.credits.familyThanks'),
      ],
    },
    {
      title: t('menu_utama.credits.loreTitle'),
      paragraphs: [
        t('menu_utama.credits.publishedBy'),
        t('menu_utama.credits.producedBy'),
        t('menu_utama.credits.supportedBy'),
      ],
    },
    {
      title: t('menu_utama.credits.disclaimerTitle'),
      paragraphs: [t('menu_utama.credits.disclaimer')],
    },
  ], [t]);

  return (
    <main
      className="relative isolate flex h-screen h-[100dvh] flex-col overflow-hidden bg-[#0A1A1A] text-[#d9f5e9]"
      aria-labelledby="credits-title"
    >
      <div className="pointer-events-none absolute inset-0 opacity-[0.035]" aria-hidden="true">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(0,255,170,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,170,0.8) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
        }} />
      </div>
      <div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="z-10 flex shrink-0 items-center justify-between border-b border-emerald-400/20 bg-[#0A1A1A]/90 px-4 py-3 sm:px-7 sm:py-4">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <ScrollText className="h-5 w-5 text-[#00FFAA]" aria-hidden="true" />
            <div className="min-w-0">
              <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-emerald-300/60">
                {t('menu_utama.credits.terminalLabel')}
              </p>
              <h1 id="credits-title" className="text-sm font-black uppercase tracking-[0.18em] text-[#00FFAA] sm:text-base">
                {t('menu_utama.credits.title')}
              </h1>
            </div>
          </div>
          <button
            type="button"
            onClick={onBack}
            aria-label={t('menu_utama.credits.back')}
            className="ml-3 inline-flex min-h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md border border-emerald-400/40 bg-emerald-400/10 px-2 text-[9px] font-black uppercase tracking-wider text-[#00FFAA] transition hover:bg-emerald-400/20 sm:gap-2 sm:px-3 sm:text-[10px]"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            {t('menu_utama.credits.back')}
          </button>
        </div>

        <div className={`relative min-h-0 flex-1 overflow-hidden ${styles.viewport}`}>
          <div className={styles.roll}>
            <p className="mb-8 text-center font-mono text-[10px] uppercase tracking-[0.28em] text-emerald-100/50">
              {t('menu_utama.credits.subtitle')}
            </p>
            {sections.map((section) => (
              <section key={section.title} className="mb-8 border-l border-emerald-400/30 pl-4 sm:mb-10 sm:pl-6">
                <h2 className="mb-3 font-mono text-xs font-black uppercase tracking-[0.18em] text-[#00FFAA] sm:text-sm">
                  {section.title}
                </h2>
                {section.intro && (
                  <p className="mb-3 text-sm leading-relaxed text-emerald-50/75">
                    {section.intro}
                  </p>
                )}
                {section.entries && (
                  <dl className="space-y-2">
                    {section.entries.map(([role, value]) => (
                      <div key={role} className="grid gap-0.5 text-sm sm:grid-cols-[minmax(12rem,0.8fr)_1.2fr] sm:gap-4">
                        <dt className="text-emerald-100/55">{t(role)}</dt>
                        <dd className="font-semibold text-emerald-50/90">{t(value)}</dd>
                      </div>
                    ))}
                  </dl>
                )}
                {section.note && (
                  <p className="mt-4 text-xs leading-relaxed text-emerald-100/55">{section.note}</p>
                )}
                {section.paragraphs && (
                  <div className="space-y-3 text-sm leading-relaxed text-emerald-50/75">
                    {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                  </div>
                )}
              </section>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}
