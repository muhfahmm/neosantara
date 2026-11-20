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
import type idPenelitianEkonomi from './id/side_menu/penelitian/ekonomi/main.json';
import type idPenelitianMiliter from './id/side_menu/penelitian/militer/main.json';
import type idPenelitianDiplomasi from './id/side_menu/penelitian/diplomasi/main.json';
import type idShop from './id/side_menu/shop/shop.json';
import type idPelacakanAktivitas from './id/side_menu/pelacakan_aktivitas/pelacakan_aktivitas.json';
import type idCountryDetailUser from './id/detail_negara/detail_negara_user/main.json';
import type idCountryDetailAI from './id/detail_negara/detail_negara_ai/main.json';

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
  dir: TextDirection;
}

export const SUPPORTED_LANGUAGES: readonly LanguageMeta[] = [
  { code: 'id', nativeName: 'Bahasa Indonesia', nameEn: 'Indonesian', dir: 'ltr' },
  { code: 'en', nativeName: 'English', nameEn: 'English', dir: 'ltr' },
  { code: 'zh-CN', nativeName: '简体中文', nameEn: 'Simplified Chinese', dir: 'ltr' },
  { code: 'es', nativeName: 'Español', nameEn: 'Spanish', dir: 'ltr' },
  { code: 'de', nativeName: 'Deutsch', nameEn: 'German', dir: 'ltr' },
  { code: 'ja', nativeName: '日本語', nameEn: 'Japanese', dir: 'ltr' },
  { code: 'ko', nativeName: '한국어', nameEn: 'Korean', dir: 'ltr' },
  { code: 'ar', nativeName: 'العربية', nameEn: 'Arabic', dir: 'rtl' },
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
  | 'side_pelacakan_aktivitas'
  | 'detail_negara_user'
  | 'detail_negara_ai';

type ResearchTranslation = typeof idPenelitian & {
  categories: {
    ekonomi: typeof idPenelitianEkonomi;
    militer: typeof idPenelitianMiliter;
    diplomasi: typeof idPenelitianDiplomasi;
  };
};

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
  side_penelitian: ResearchTranslation;
  side_shop: typeof idShop;
  side_pelacakan_aktivitas: typeof idPelacakanAktivitas;
  detail_negara_user: typeof idCountryDetailUser;
  detail_negara_ai: typeof idCountryDetailAI;
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
  | `side_penelitian.${NestedKeyOf<ResearchTranslation>}`
  | `side_shop.${NestedKeyOf<typeof idShop>}`
  | `side_pelacakan_aktivitas.${NestedKeyOf<typeof idPelacakanAktivitas>}`
  | `detail_negara_user.${NestedKeyOf<typeof idCountryDetailUser>}`
  | `detail_negara_ai.${NestedKeyOf<typeof idCountryDetailAI>}`
  | (string & {});

export type InterpolationParams = Record<string, string | number>;
