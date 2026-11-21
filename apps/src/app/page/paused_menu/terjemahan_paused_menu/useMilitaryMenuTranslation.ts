import { useLanguage } from "./languageLogic";

export function useMilitaryMenuTranslation() {
  const { t, language } = useLanguage();
  const translate = (key: string, params?: Record<string, string | number>) =>
    t(`navigation_military_menu.${key}`, params);

  return { language, translate };
}
