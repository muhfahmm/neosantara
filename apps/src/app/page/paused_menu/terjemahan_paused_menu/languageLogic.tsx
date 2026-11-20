'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useSyncExternalStore,
} from 'react';
import type {
  LanguageCode,
  LanguageDictionary,
  LanguageMeta,
  TextDirection,
  TranslationKey,
  TranslationNamespace,
  InterpolationParams,
} from './types';
import {
  DEFAULT_LANGUAGE,
  SUPPORTED_LANGUAGES,
} from './types';

// Static import untuk bahasa default (id) agar selalu tersedia instan sebagai fallback
import idCommon from './id/common.json';
import idNavbar from './id/navbar/navbar.json';
import idSettings from './id/settings.json';
import idGame from './id/game.json';
import idPausedMenu from './id/paused_menu/paused_menu.json';

import idInbox from './id/side_menu/inbox/inbox.json';
import idNews from './id/side_menu/news/news.json';
import idReward from './id/side_menu/reward/reward.json';
import idMisi from './id/side_menu/misi/misi.json';
import idPenelitian from './id/side_menu/penelitian/penelitian.json';
import idShop from './id/side_menu/shop/shop.json';
import idPelacakanAktivitas from './id/side_menu/pelacakan_aktivitas/pelacakan_aktivitas.json';

const ID_DICTIONARY: LanguageDictionary = {
  common: idCommon,
  navbar: idNavbar,
  settings: idSettings,
  game: idGame,
  paused_menu: idPausedMenu,
  side_inbox: idInbox,
  side_news: idNews,
  side_reward: idReward,
  side_misi: idMisi,
  side_penelitian: idPenelitian,
  side_shop: idShop,
  side_pelacakan_aktivitas: idPelacakanAktivitas,
};

const STORAGE_KEY = 'app_language';
const LANGUAGE_CHANGE_EVENT = 'neosantara_language_changed';

function readStoredLanguage(): LanguageCode {
  if (typeof window === 'undefined') {
    return DEFAULT_LANGUAGE;
  }
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY) as LanguageCode | null;
    if (saved && SUPPORTED_LANGUAGES.some((lang) => lang.code === saved)) {
      return saved;
    }
  } catch (e) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Failed to read language preference from localStorage', e);
    }
  }
  return DEFAULT_LANGUAGE;
}

function subscribeToLanguageChange(callback: () => void) {
  if (typeof window === 'undefined') {
    return () => {};
  }
  window.addEventListener(LANGUAGE_CHANGE_EVENT, callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener(LANGUAGE_CHANGE_EVENT, callback);
    window.removeEventListener('storage', callback);
  };
}

// Dynamic loader dictionary untuk tiap bahasa
async function loadLanguageDictionary(code: LanguageCode): Promise<LanguageDictionary> {
  if (code === 'id') {
    return ID_DICTIONARY;
  }

  const [
    common,
    navbar,
    settings,
    game,
    paused_menu,
    side_inbox,
    side_news,
    side_reward,
    side_misi,
    side_penelitian,
    side_shop,
    side_pelacakan_aktivitas,
  ] = await Promise.all([
    import(`./${code}/common.json`).then((m) => m.default).catch(() => ({})),
    import(`./${code}/navbar/navbar.json`).then((m) => m.default).catch(() => ({})),
    import(`./${code}/settings.json`).then((m) => m.default).catch(() => ({})),
    import(`./${code}/game.json`).then((m) => m.default).catch(() => ({})),
    import(`./${code}/paused_menu/paused_menu.json`).then((m) => m.default).catch(() => ({})),
    import(`./${code}/side_menu/inbox/inbox.json`).then((m) => m.default).catch(() => ({})),
    import(`./${code}/side_menu/news/news.json`).then((m) => m.default).catch(() => ({})),
    import(`./${code}/side_menu/reward/reward.json`).then((m) => m.default).catch(() => ({})),
    import(`./${code}/side_menu/misi/misi.json`).then((m) => m.default).catch(() => ({})),
    import(`./${code}/side_menu/penelitian/penelitian.json`).then((m) => m.default).catch(() => ({})),
    import(`./${code}/side_menu/shop/shop.json`).then((m) => m.default).catch(() => ({})),
    import(`./${code}/side_menu/pelacakan_aktivitas/pelacakan_aktivitas.json`).then((m) => m.default).catch(() => ({})),
  ]);

  return {
    common,
    navbar,
    settings,
    game,
    paused_menu,
    side_inbox,
    side_news,
    side_reward,
    side_misi,
    side_penelitian,
    side_shop,
    side_pelacakan_aktivitas,
  };
}

interface LanguageContextValue {
  language: LanguageCode;
  setLanguage: (code: LanguageCode) => void;
  dir: TextDirection;
  currentMeta: LanguageMeta;
  t: (key: TranslationKey, params?: InterpolationParams) => string;
  isReady: boolean;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function resolveNestedValue(obj: Record<string, unknown> | undefined, path: string[]): string | undefined {
  let current: unknown = obj;
  for (const seg of path) {
    if (!current || typeof current !== 'object') {
      return undefined;
    }
    current = (current as Record<string, unknown>)[seg];
  }
  return typeof current === 'string' ? current : undefined;
}

function interpolate(template: string, params?: InterpolationParams): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, paramName) => {
    if (paramName in params) {
      return String(params[paramName]);
    }
    return match;
  });
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const language = useSyncExternalStore(
    subscribeToLanguageChange,
    readStoredLanguage,
    () => DEFAULT_LANGUAGE
  );

  const [dictionaries, setDictionaries] = useState<Partial<Record<LanguageCode, LanguageDictionary>>>({
    id: ID_DICTIONARY,
  });

  // Dynamic import kamus saat bahasa berubah
  useEffect(() => {
    let isCancelled = false;

    if (!dictionaries[language]) {
      loadLanguageDictionary(language)
        .then((dict) => {
          if (!isCancelled) {
            setDictionaries((prev) => ({ ...prev, [language]: dict }));
          }
        })
        .catch((err) => {
          if (process.env.NODE_ENV === 'development') {
            console.error(`Failed to load dictionary for language ${language}:`, err);
          }
        });
    }

    return () => {
      isCancelled = true;
    };
  }, [language, dictionaries]);

  // Handle HTML document dir dan lang attribute
  useEffect(() => {
    const meta = SUPPORTED_LANGUAGES.find((l) => l.code === language);
    const dir = meta ? meta.dir : 'ltr';

    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
      document.documentElement.dir = dir;
    }
  }, [language]);

  const setLanguage = useCallback((code: LanguageCode) => {
    if (!SUPPORTED_LANGUAGES.some((lang) => lang.code === code)) {
      return;
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, code);
      window.dispatchEvent(new Event(LANGUAGE_CHANGE_EVENT));
    } catch (e) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to save language preference to localStorage', e);
      }
    }
  }, []);

  const currentMeta = useMemo(() => {
    return SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];
  }, [language]);

  const t = useCallback(
    (key: TranslationKey, params?: InterpolationParams): string => {
      const parts = key.split('.');
      if (parts.length < 2) {
        return key;
      }

      const ns = parts[0] as TranslationNamespace;
      const keyPath = parts.slice(1);

      // 1. Coba cari di bahasa terpilih
      const activeDict = dictionaries[language];
      if (activeDict && activeDict[ns]) {
        const found = resolveNestedValue(activeDict[ns] as Record<string, unknown>, keyPath);
        if (found !== undefined && found.trim() !== '') {
          return interpolate(found, params);
        }
      }

      // 2. Fallback ke bahasa Indonesia (id)
      const idDict = ID_DICTIONARY[ns];
      if (idDict) {
        const fallbackValue = resolveNestedValue(idDict as Record<string, unknown>, keyPath);
        if (fallbackValue !== undefined && fallbackValue.trim() !== '') {
          return interpolate(fallbackValue, params);
        }
      }

      // 3. Jika di `id` juga tidak ada sama sekali
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[i18n] Missing translation for key: "${key}" in language "${language}" and fallback "id"`);
      }

      return key;
    },
    [language, dictionaries]
  );

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      dir: currentMeta.dir,
      currentMeta,
      t,
      isReady: true,
    }),
    [language, setLanguage, currentMeta, t]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
