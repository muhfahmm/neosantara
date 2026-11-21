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
import idPenelitianEkonomi from './id/side_menu/penelitian/ekonomi/main.json';
import idPenelitianMiliter from './id/side_menu/penelitian/militer/main.json';
import idPenelitianDiplomasi from './id/side_menu/penelitian/diplomasi/main.json';
import idShop from './id/side_menu/shop/shop.json';
import idPelacakanAktivitas from './id/side_menu/pelacakan_aktivitas/pelacakan_aktivitas.json';
import idCountryDetailUser from './id/detail_negara/detail_negara_user/main.json';
import idCountryDetailAI from './id/detail_negara/detail_negara_ai/main.json';
import idSatisfactionStatistics from './id/navigasi_menu/kepuasan_menu/statistik.json';
import idSatisfactionIncrease from './id/navigasi_menu/kepuasan_menu/naikkan_kepuasan.json';
import idPopulationSummary from './id/navigasi_menu/populasi_menu/ringkasan_populasi.json';
import idPopulationBirths from './id/navigasi_menu/populasi_menu/rincian_kelahiran.json';
import idPopulationDeaths from './id/navigasi_menu/populasi_menu/rincian_kematian.json';
import idPopulationWelfare from './id/navigasi_menu/populasi_menu/kesejahteraan.json';
import idPopulationWelfareInitiatives from './id/navigasi_menu/populasi_menu/naikkan_kesejahteraan.json';
import idElectricityGrid from './id/navigasi_menu/produksi_konsumsi/listrik_nasional/listrik_nasional.json';
import idFoodConsumption from './id/navigasi_menu/produksi_konsumsi/konsumsi_makanan/konsumsi_makanan.json';
import idEconomyTrade from './id/navigasi_menu/ekonomi_menu/perdagangan.json';
import idEconomyTax from './id/navigasi_menu/ekonomi_menu/pajak.json';
import idEconomyLoans from './id/navigasi_menu/ekonomi_menu/pinjaman.json';
import idEconomyIncome from './id/navigasi_menu/ekonomi_menu/pendapatan.json';
import idEconomyPurchasingPower from './id/navigasi_menu/ekonomi_menu/daya_beli.json';
import idEconomySystem from './id/navigasi_menu/ekonomi_menu/sistem_ekonomi.json';
import idConstructionProduction from './id/navigasi_menu/pembangunan_menu/produksi/produksi.json';
import idConstructionPublicPlaces from './id/navigasi_menu/pembangunan_menu/tempat_umum/tempat_umum.json';
import idConstructionHousing from './id/navigasi_menu/pembangunan_menu/hunian_permukiman/hunian_permukiman.json';
import idDefenseAttack from './id/navigasi_menu/pertahanan_menu/serang_negara/serang_negara.json';
import idDefenseEspionage from './id/navigasi_menu/pertahanan_menu/spionase/spionase.json';
import idDefenseSabotage from './id/navigasi_menu/pertahanan_menu/sabotase/sabotase.json';
import idDefenseAnnexedTerritories from './id/navigasi_menu/pertahanan_menu/wilayah_direbut/wilayah_direbut.json';
import idMilitaryMenu from './id/navigasi_menu/militer_menu/militer_menu.json';
import idIcbmMenu from './id/navigasi_menu/icbm_menu/icbm_menu.json';
import idGeopoliticsPbb from './id/navigasi_menu/geopolitik_menu/pbb_menu/pbb_menu.json';
import idGeopoliticsEmbassy from './id/navigasi_menu/geopolitik_menu/kedutaan_besar/kedutaan_besar.json';
import idGeopoliticsOrganizations from './id/navigasi_menu/geopolitik_menu/organisasi_internasional/organisasi_internasional.json';
import idGeopoliticsRelations from './id/navigasi_menu/geopolitik_menu/tingkat_hubungan/tingkat_hubungan.json';

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
  side_penelitian: {
    ...idPenelitian,
    categories: {
      ekonomi: idPenelitianEkonomi,
      militer: idPenelitianMiliter,
      diplomasi: idPenelitianDiplomasi,
    },
  },
  side_shop: idShop,
  side_pelacakan_aktivitas: idPelacakanAktivitas,
  detail_negara_user: idCountryDetailUser,
  detail_negara_ai: idCountryDetailAI,
  navigation_satisfaction_statistics: idSatisfactionStatistics,
  navigation_satisfaction_increase: idSatisfactionIncrease,
  navigation_population_summary: idPopulationSummary,
  navigation_population_births: idPopulationBirths,
  navigation_population_deaths: idPopulationDeaths,
  navigation_population_welfare: idPopulationWelfare,
  navigation_population_welfare_initiatives: idPopulationWelfareInitiatives,
  navigation_electricity_grid: idElectricityGrid,
  navigation_food_consumption: idFoodConsumption,
  navigation_economy_trade: idEconomyTrade,
  navigation_economy_tax: idEconomyTax,
  navigation_economy_loans: idEconomyLoans,
  navigation_economy_income: idEconomyIncome,
  navigation_economy_purchasing_power: idEconomyPurchasingPower,
  navigation_economy_system: idEconomySystem,
  navigation_construction_production: idConstructionProduction,
  navigation_construction_public_places: idConstructionPublicPlaces,
  navigation_construction_housing: idConstructionHousing,
  navigation_defense_attack: idDefenseAttack,
  navigation_defense_espionage: idDefenseEspionage,
  navigation_defense_sabotage: idDefenseSabotage,
  navigation_defense_annexed_territories: idDefenseAnnexedTerritories,
  navigation_military_menu: idMilitaryMenu,
  navigation_icbm_menu: idIcbmMenu,
  navigation_geopolitics_pbb: idGeopoliticsPbb,
  navigation_geopolitics_embassy: idGeopoliticsEmbassy,
  navigation_geopolitics_organizations: idGeopoliticsOrganizations,
  navigation_geopolitics_relations: idGeopoliticsRelations,
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
    researchEconomy,
    researchMilitary,
    researchDiplomacy,
    side_shop,
    side_pelacakan_aktivitas,
    detail_negara_user,
    detail_negara_ai,
    satisfactionStatistics,
    satisfactionIncrease,
    populationSummary,
    populationBirths,
    populationDeaths,
    populationWelfare,
    populationWelfareInitiatives,
    electricityGrid,
    foodConsumption,
    economyTrade,
    economyTax,
    economyLoans,
    economyIncome,
    economyPurchasingPower,
    economySystem,
    constructionProduction,
    constructionPublicPlaces,
    constructionHousing,
    defenseAttack,
    defenseEspionage,
    defenseSabotage,
    defenseAnnexedTerritories,
    militaryMenu,
    icbmMenu,
    geopoliticsPbb,
    geopoliticsEmbassy,
    geopoliticsOrganizations,
    geopoliticsRelations,
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
    import(`./${code}/side_menu/penelitian/ekonomi/main.json`).then((m) => m.default).catch(() => ({})),
    import(`./${code}/side_menu/penelitian/militer/main.json`).then((m) => m.default).catch(() => ({})),
    import(`./${code}/side_menu/penelitian/diplomasi/main.json`).then((m) => m.default).catch(() => ({})),
    import(`./${code}/side_menu/shop/shop.json`).then((m) => m.default).catch(() => ({})),
    import(`./${code}/side_menu/pelacakan_aktivitas/pelacakan_aktivitas.json`).then((m) => m.default).catch(() => ({})),
    import(`./${code}/detail_negara/detail_negara_user/main.json`).then((m) => m.default).catch(() => ({})),
    import(`./${code}/detail_negara/detail_negara_ai/main.json`).then((m) => m.default).catch(() => ({})),
    import(`./${code}/navigasi_menu/kepuasan_menu/statistik.json`).then((m) => m.default).catch(() => ({})),
    import(`./${code}/navigasi_menu/kepuasan_menu/naikkan_kepuasan.json`).then((m) => m.default).catch(() => ({})),
    import(`./${code}/navigasi_menu/populasi_menu/ringkasan_populasi.json`).then((m) => m.default).catch(() => ({})),
    import(`./${code}/navigasi_menu/populasi_menu/rincian_kelahiran.json`).then((m) => m.default).catch(() => ({})),
    import(`./${code}/navigasi_menu/populasi_menu/rincian_kematian.json`).then((m) => m.default).catch(() => ({})),
    import(`./${code}/navigasi_menu/populasi_menu/kesejahteraan.json`).then((m) => m.default).catch(() => ({})),
    import(`./${code}/navigasi_menu/populasi_menu/naikkan_kesejahteraan.json`).then((m) => m.default).catch(() => ({})),
    import(`./${code}/navigasi_menu/produksi_konsumsi/listrik_nasional/listrik_nasional.json`).then((m) => m.default).catch(() => ({})),
    import(`./${code}/navigasi_menu/produksi_konsumsi/konsumsi_makanan/konsumsi_makanan.json`).then((m) => m.default).catch(() => ({})),
    import(`./${code}/navigasi_menu/ekonomi_menu/perdagangan.json`).then((m) => m.default).catch(() => ({})),
    import(`./${code}/navigasi_menu/ekonomi_menu/pajak.json`).then((m) => m.default).catch(() => ({})),
    import(`./${code}/navigasi_menu/ekonomi_menu/pinjaman.json`).then((m) => m.default).catch(() => ({})),
    import(`./${code}/navigasi_menu/ekonomi_menu/pendapatan.json`).then((m) => m.default).catch(() => ({})),
    import(`./${code}/navigasi_menu/ekonomi_menu/daya_beli.json`).then((m) => m.default).catch(() => ({})),
    import(`./${code}/navigasi_menu/ekonomi_menu/sistem_ekonomi.json`).then((m) => m.default).catch(() => ({})),
    import(`./${code}/navigasi_menu/pembangunan_menu/produksi/produksi.json`).then((m) => m.default).catch(() => ({})),
    import(`./${code}/navigasi_menu/pembangunan_menu/tempat_umum/tempat_umum.json`).then((m) => m.default).catch(() => ({})),
    import(`./${code}/navigasi_menu/pembangunan_menu/hunian_permukiman/hunian_permukiman.json`).then((m) => m.default).catch(() => ({})),
    import(`./${code}/navigasi_menu/pertahanan_menu/serang_negara/serang_negara.json`).then((m) => m.default).catch(() => ({})),
    import(`./${code}/navigasi_menu/pertahanan_menu/spionase/spionase.json`).then((m) => m.default).catch(() => ({})),
    import(`./${code}/navigasi_menu/pertahanan_menu/sabotase/sabotase.json`).then((m) => m.default).catch(() => ({})),
    import(`./${code}/navigasi_menu/pertahanan_menu/wilayah_direbut/wilayah_direbut.json`).then((m) => m.default).catch(() => ({})),
    import(`./${code}/navigasi_menu/militer_menu/militer_menu.json`).then((m) => m.default).catch(() => ({})),
    import(`./${code}/navigasi_menu/icbm_menu/icbm_menu.json`).then((m) => m.default).catch(() => ({})),
    import(`./${code}/navigasi_menu/geopolitik_menu/pbb_menu/pbb_menu.json`).then((m) => m.default).catch(() => ({})),
    import(`./${code}/navigasi_menu/geopolitik_menu/kedutaan_besar/kedutaan_besar.json`).then((m) => m.default).catch(() => ({})),
    import(`./${code}/navigasi_menu/geopolitik_menu/organisasi_internasional/organisasi_internasional.json`).then((m) => m.default).catch(() => ({})),
    import(`./${code}/navigasi_menu/geopolitik_menu/tingkat_hubungan/tingkat_hubungan.json`).then((m) => m.default).catch(() => ({})),
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
    side_penelitian: {
      ...side_penelitian,
      categories: {
        ekonomi: researchEconomy,
        militer: researchMilitary,
        diplomasi: researchDiplomacy,
      },
    },
    side_shop,
    side_pelacakan_aktivitas,
    detail_negara_user,
    detail_negara_ai,
    navigation_satisfaction_statistics: satisfactionStatistics,
    navigation_satisfaction_increase: satisfactionIncrease,
    navigation_population_summary: populationSummary,
    navigation_population_births: populationBirths,
    navigation_population_deaths: populationDeaths,
    navigation_population_welfare: populationWelfare,
    navigation_population_welfare_initiatives: populationWelfareInitiatives,
    navigation_electricity_grid: electricityGrid,
    navigation_food_consumption: foodConsumption,
    navigation_economy_trade: economyTrade,
    navigation_economy_tax: economyTax,
    navigation_economy_loans: economyLoans,
    navigation_economy_income: economyIncome,
    navigation_economy_purchasing_power: economyPurchasingPower,
    navigation_economy_system: economySystem,
    navigation_construction_production: constructionProduction,
    navigation_construction_public_places: constructionPublicPlaces,
    navigation_construction_housing: constructionHousing,
    navigation_defense_attack: defenseAttack,
    navigation_defense_espionage: defenseEspionage,
    navigation_defense_sabotage: defenseSabotage,
    navigation_defense_annexed_territories: defenseAnnexedTerritories,
    navigation_military_menu: militaryMenu,
    navigation_icbm_menu: icbmMenu,
    navigation_geopolitics_pbb: geopoliticsPbb,
    navigation_geopolitics_embassy: geopoliticsEmbassy,
    navigation_geopolitics_organizations: geopoliticsOrganizations,
    navigation_geopolitics_relations: geopoliticsRelations,
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
      document.documentElement.lang = code;
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
