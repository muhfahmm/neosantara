import { useCallback } from "react";
import { useLanguage } from "./languageLogic";

type TranslationParams = Record<string, string | number>;
type Translate = (key: string, params?: TranslationParams) => string;

export function useGeopoliticsMenuTranslation() {
  const { t, language } = useLanguage();
  const pbb = useCallback<Translate>(
    (key, params) => t(`navigation_geopolitics_pbb.${key}`, params),
    [t]
  );
  const embassy = useCallback<Translate>(
    (key, params) => t(`navigation_geopolitics_embassy.${key}`, params),
    [t]
  );
  const organizations = useCallback<Translate>(
    (key, params) => t(`navigation_geopolitics_organizations.${key}`, params),
    [t]
  );
  const relations = useCallback<Translate>(
    (key, params) => t(`navigation_geopolitics_relations.${key}`, params),
    [t]
  );

  return { language, pbb, embassy, organizations, relations };
}
