"use client";

import type { TravelFuelStatus } from "./travelFuelLogic";
import { useLanguage } from "@/app/page/paused_menu/terjemahan_paused_menu/languageLogic";

export default function TravelFuelCostPanel({
  status,
  label,
  locale,
  translate,
}: {
  status: TravelFuelStatus;
  label?: string;
  locale?: string;
  translate?: (
    key: "calculating" | "barrels" | "stock" | "remaining" | "fallback" | "insufficient" | "warning",
    params?: Record<string, string | number>,
  ) => string;
}) {
  const { t, language } = useLanguage();
  const resolvedLocale = locale ?? (language === "id" ? "id-ID" : language);
  const resolvedLabel = label ?? t("common.travelCostPanel.title");
  const translateFuelText = (
    key: "calculating" | "barrels" | "stock" | "remaining" | "fallback" | "insufficient" | "warning",
    params?: Record<string, string | number>,
  ) => translate?.(key, params) ?? t(`common.travelCostPanel.${key}`, params);
  const numberFormat = (value: number) =>
    value.toLocaleString(resolvedLocale, { maximumFractionDigits: 0 });

  return (
    <div className={`mb-5 rounded-xl border p-3 text-sm ${
      status.ok
        ? "border-root-accent/25 bg-root-accent/5"
        : "border-root-danger/40 bg-root-danger/10"
    }`}>
      <p className="font-bold text-root-text">
        {resolvedLabel}:{" "}
        <span className={status.ok ? "text-root-accent" : "text-root-danger"}>
          {status.loading || status.cost === null
            ? translateFuelText("calculating")
            : `${numberFormat(status.cost)} ${translateFuelText("barrels")}`}
        </span>
        {" | "}{translateFuelText("stock")}: {numberFormat(status.stock)}
        {" | "}{translateFuelText("remaining")}: {numberFormat(status.remaining)}
      </p>
      {status.fallback && !status.loading && (
        <p className="mt-1 text-xs text-amber-300">
          {translateFuelText("fallback")}
        </p>
      )}
      {!status.ok && !status.loading && (
        <p className="mt-1 font-bold text-root-danger">
          {translateFuelText("insufficient")}
        </p>
      )}
      {status.belowDailyPowerPlantNeed && status.ok && (
        <p className="mt-1 text-xs font-bold text-amber-300">
          {translateFuelText("warning", {
            amount: numberFormat(status.dailyPowerPlantNeed),
          })}
        </p>
      )}
    </div>
  );
}