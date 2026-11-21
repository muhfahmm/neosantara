import { useCallback } from "react";
import { useLanguage } from "./languageLogic";

type TranslationParams = Record<string, string | number>;
type Translate = (key: string, params?: TranslationParams) => string;

export function useKementerianMenuTranslation() {
  const { t, language } = useLanguage();
  const ministry = useCallback<Translate>(
    (key, params) => t(`navigation_ministry_menu.${key}`, params),
    [t]
  );

  return { language, ministry };
}
