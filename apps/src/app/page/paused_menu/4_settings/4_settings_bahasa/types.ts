import type idCommon from './id/common.json';
import type idNavbar from './id/navbar/navbar.json';
import type idSettings from './id/settings.json';
import type idGame from './id/game.json';
import type idPausedMenu from './id/paused_menu/paused_menu.json';

import type idInbox from './id/side_menu/inbox/inbox.json';
import type idNews from './id/side_menu/news/news.json';
import type idReward from './id/side_menu/reward/reward.json';
import type idMisi from './id/side_menu/misi/misi.json';
import type idPenelitian from './id/side_menu/penelitian/penelitian.json';
import type idShop from './id/side_menu/shop/shop.json';
import type idPelacakanAktivitas from './id/side_menu/pelacakan_aktivitas/pelacakan_aktivitas.json';

export type TextDirection = 'ltr' | 'rtl';

export type LanguageCode =
  | 'id'
  | 'en'
  | 'zh-CN'
  | 'es'
  | 'de'
  | 'ja'
  | 'ko'
  | 'ar';

export interface LanguageMeta {
  code: LanguageCode;
  nativeName: string;
  nameEn: string;
  flagCode: string;
  dir: TextDirection;
}

export const SUPPORTED_LANGUAGES: readonly LanguageMeta[] = [
  { code: 'id', nativeName: 'Bahasa Indonesia', nameEn: 'Indonesian', flagCode: 'id', dir: 'ltr' },
  { code: 'en', nativeName: 'English', nameEn: 'English', flagCode: 'gb', dir: 'ltr' },
  { code: 'zh-CN', nativeName: '简体中文', nameEn: 'Simplified Chinese', flagCode: 'cn', dir: 'ltr' },
  { code: 'es', nativeName: 'Español', nameEn: 'Spanish', flagCode: 'es', dir: 'ltr' },
  { code: 'de', nativeName: 'Deutsch', nameEn: 'German', flagCode: 'de', dir: 'ltr' },
  { code: 'ja', nativeName: '日本語', nameEn: 'Japanese', flagCode: 'jp', dir: 'ltr' },
  { code: 'ko', nativeName: '한국어', nameEn: 'Korean', flagCode: 'kr', dir: 'ltr' },
  { code: 'ar', nativeName: 'العربية', nameEn: 'Arabic', flagCode: 'sa', dir: 'rtl' },
] as const;

export const DEFAULT_LANGUAGE: LanguageCode = 'id';

export type TranslationNamespace =
  | 'common'
  | 'navbar'
  | 'settings'
  | 'game'
  | 'paused_menu'
  | 'side_inbox'
  | 'side_news'
  | 'side_reward'
  | 'side_misi'
  | 'side_penelitian'
  | 'side_shop'
  | 'side_pelacakan_aktivitas';

export interface TranslationSchema {
  common: typeof idCommon;
  navbar: typeof idNavbar;
  settings: typeof idSettings;
  game: typeof idGame;
  paused_menu: typeof idPausedMenu;
  side_inbox: typeof idInbox;
  side_news: typeof idNews;
  side_reward: typeof idReward;
  side_misi: typeof idMisi;
  side_penelitian: typeof idPenelitian;
  side_shop: typeof idShop;
  side_pelacakan_aktivitas: typeof idPelacakanAktivitas;
}

export type TranslationRecord = Record<string, string | Record<string, unknown>>;
export type LanguageDictionary = Record<TranslationNamespace, TranslationRecord>;

export type NestedKeyOf<T> = T extends object
  ? {
      [K in keyof T & string]: T[K] extends object
        ? `${K}.${NestedKeyOf<T[K]>}`
        : K;
    }[keyof T & string]
  : never;

export type TranslationKey =
  | `common.${NestedKeyOf<typeof idCommon>}`
  | `navbar.${NestedKeyOf<typeof idNavbar>}`
  | `settings.${NestedKeyOf<typeof idSettings>}`
  | `game.${NestedKeyOf<typeof idGame>}`
  | `paused_menu.${NestedKeyOf<typeof idPausedMenu>}`
  | `side_inbox.${NestedKeyOf<typeof idInbox>}`
  | `side_news.${NestedKeyOf<typeof idNews>}`
  | `side_reward.${NestedKeyOf<typeof idReward>}`
  | `side_misi.${NestedKeyOf<typeof idMisi>}`
  | `side_penelitian.${NestedKeyOf<typeof idPenelitian>}`
  | `side_shop.${NestedKeyOf<typeof idShop>}`
  | `side_pelacakan_aktivitas.${NestedKeyOf<typeof idPelacakanAktivitas>}`
  | (string & {});

export type InterpolationParams = Record<string, string | number>;
