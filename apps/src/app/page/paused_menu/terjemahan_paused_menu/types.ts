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
import type idSatisfactionStatistics from './id/navigasi_menu/kepuasan_menu/statistik.json';
import type idSatisfactionIncrease from './id/navigasi_menu/kepuasan_menu/naikkan_kepuasan.json';
import type idPopulationSummary from './id/navigasi_menu/populasi_menu/ringkasan_populasi.json';
import type idPopulationBirths from './id/navigasi_menu/populasi_menu/rincian_kelahiran.json';
import type idPopulationDeaths from './id/navigasi_menu/populasi_menu/rincian_kematian.json';
import type idPopulationWelfare from './id/navigasi_menu/populasi_menu/kesejahteraan.json';
import type idPopulationWelfareInitiatives from './id/navigasi_menu/populasi_menu/naikkan_kesejahteraan.json';
import type idElectricityGrid from './id/navigasi_menu/produksi_konsumsi/listrik_nasional/listrik_nasional.json';
import type idFoodConsumption from './id/navigasi_menu/produksi_konsumsi/konsumsi_makanan/konsumsi_makanan.json';
import type idEconomyTrade from './id/navigasi_menu/ekonomi_menu/perdagangan.json';
import type idEconomyTax from './id/navigasi_menu/ekonomi_menu/pajak.json';
import type idEconomyLoans from './id/navigasi_menu/ekonomi_menu/pinjaman.json';
import type idEconomyIncome from './id/navigasi_menu/ekonomi_menu/pendapatan.json';
import type idEconomyPurchasingPower from './id/navigasi_menu/ekonomi_menu/daya_beli.json';
import type idEconomySystem from './id/navigasi_menu/ekonomi_menu/sistem_ekonomi.json';
import type idConstructionProduction from './id/navigasi_menu/pembangunan_menu/produksi/produksi.json';
import type idConstructionPublicPlaces from './id/navigasi_menu/pembangunan_menu/tempat_umum/tempat_umum.json';
import type idConstructionHousing from './id/navigasi_menu/pembangunan_menu/hunian_permukiman/hunian_permukiman.json';

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
  | 'detail_negara_ai'
  | 'navigation_satisfaction_statistics'
  | 'navigation_satisfaction_increase'
  | 'navigation_population_summary'
  | 'navigation_population_births'
  | 'navigation_population_deaths'
  | 'navigation_population_welfare'
  | 'navigation_population_welfare_initiatives'
  | 'navigation_electricity_grid'
  | 'navigation_food_consumption'
  | 'navigation_economy_trade'
  | 'navigation_economy_tax'
  | 'navigation_economy_loans'
  | 'navigation_economy_income'
  | 'navigation_economy_purchasing_power'
  | 'navigation_economy_system'
  | 'navigation_construction_production'
  | 'navigation_construction_public_places'
  | 'navigation_construction_housing';

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
  navigation_satisfaction_statistics: typeof idSatisfactionStatistics;
  navigation_satisfaction_increase: typeof idSatisfactionIncrease;
  navigation_population_summary: typeof idPopulationSummary;
  navigation_population_births: typeof idPopulationBirths;
  navigation_population_deaths: typeof idPopulationDeaths;
  navigation_population_welfare: typeof idPopulationWelfare;
  navigation_population_welfare_initiatives: typeof idPopulationWelfareInitiatives;
  navigation_electricity_grid: typeof idElectricityGrid;
  navigation_food_consumption: typeof idFoodConsumption;
  navigation_economy_trade: typeof idEconomyTrade;
  navigation_economy_tax: typeof idEconomyTax;
  navigation_economy_loans: typeof idEconomyLoans;
  navigation_economy_income: typeof idEconomyIncome;
  navigation_economy_purchasing_power: typeof idEconomyPurchasingPower;
  navigation_economy_system: typeof idEconomySystem;
  navigation_construction_production: typeof idConstructionProduction;
  navigation_construction_public_places: typeof idConstructionPublicPlaces;
  navigation_construction_housing: typeof idConstructionHousing;
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
  | `navigation_satisfaction_statistics.${NestedKeyOf<typeof idSatisfactionStatistics>}`
  | `navigation_satisfaction_increase.${NestedKeyOf<typeof idSatisfactionIncrease>}`
  | `navigation_population_summary.${NestedKeyOf<typeof idPopulationSummary>}`
  | `navigation_population_births.${NestedKeyOf<typeof idPopulationBirths>}`
  | `navigation_population_deaths.${NestedKeyOf<typeof idPopulationDeaths>}`
  | `navigation_population_welfare.${NestedKeyOf<typeof idPopulationWelfare>}`
  | `navigation_population_welfare_initiatives.${NestedKeyOf<typeof idPopulationWelfareInitiatives>}`
  | `navigation_electricity_grid.${NestedKeyOf<typeof idElectricityGrid>}`
  | `navigation_food_consumption.${NestedKeyOf<typeof idFoodConsumption>}`
  | `navigation_economy_trade.${NestedKeyOf<typeof idEconomyTrade>}`
  | `navigation_economy_tax.${NestedKeyOf<typeof idEconomyTax>}`
  | `navigation_economy_loans.${NestedKeyOf<typeof idEconomyLoans>}`
  | `navigation_economy_income.${NestedKeyOf<typeof idEconomyIncome>}`
  | `navigation_economy_purchasing_power.${NestedKeyOf<typeof idEconomyPurchasingPower>}`
  | `navigation_economy_system.${NestedKeyOf<typeof idEconomySystem>}`
  | `navigation_construction_production.${NestedKeyOf<typeof idConstructionProduction>}`
  | `navigation_construction_public_places.${NestedKeyOf<typeof idConstructionPublicPlaces>}`
  | `navigation_construction_housing.${NestedKeyOf<typeof idConstructionHousing>}`
  | (string & {});

export type InterpolationParams = Record<string, string | number>;
