import { useCallback } from "react";
import { useLanguage } from "./languageLogic";

export function useIcbmMenuTranslation() {
  const { t, language } = useLanguage();
  const translate = useCallback(
    (key: string, params?: Record<string, string | number>) =>
      t(`navigation_icbm_menu.${key}`, params),
    [t]
  );

  return { language, translate };
}

export function formatIcbmDate(
  value: string | Date | null | undefined,
  language: string
): string {
  if (!value) return "-";

  const date = value instanceof Date
    ? value
    : new Date(`${value.slice(0, 10)}T00:00:00`);
  if (Number.isNaN(date.getTime())) return String(value);

  return new Intl.DateTimeFormat(language, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}
