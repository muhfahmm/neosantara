"use client"
import React from "react";
import { AlertCircle, TrendingUp, Factory } from "lucide-react";
import NotebookModalWrapper from "../../NotebookModalWrapper";
import RootModalCloseButton from "@/app/page/root_modals_design_menu/RootModalCloseButton";
import { useLanguage } from "@/app/page/paused_menu/terjemahan_paused_menu/languageLogic";

interface DeficitDetailProps {
  isOpen: boolean;
  onClose: () => void;
  data: {
    key: string;
    label: string;
    currentProd: number;
    currentCons: number;
    deficit: number;
    prodPerUnit: number;
    buildingsNeeded: number;
  } | null;
  onGotoProduction?: (tab: string, key: string, quantity?: number) => void;
}

// Helper format angka
const formatNumber = (value: any, locale: string) => {
  const parsed = Number(value) || 0;
  return parsed.toLocaleString(locale);
};

export default function AIDetailDefisitModal({
  isOpen,
  onClose,
  data,
  onGotoProduction
}: DeficitDetailProps) {
  const { t, language } = useLanguage();
  if (!isOpen || !data) return null;

  const {
    label,
    currentProd,
    currentCons,
    deficit,
    prodPerUnit,
    buildingsNeeded,
    key
  } = data;
  const labelKey = `navigation_food_consumption.commodities.${key}`;
  const translatedLabel = t(labelKey);
  const displayLabel = translatedLabel === labelKey ? label : translatedLabel;

  const handleBuild = () => {
    onGotoProduction?.('industri_pangan', key, buildingsNeeded);
  };

  return (
    <NotebookModalWrapper onClose={onClose} zIndexClass="z-[76]">
      <div className="flex h-full flex-col overflow-hidden">
        
        {/* HEADER */}
        <div className="flex shrink-0 items-center justify-between border-b border-root-accent/20 bg-root-canvas px-4 py-2.5 sm:px-6 sm:py-3">
          <div>
            <h3 className="text-base font-black uppercase tracking-[0.2em] text-root-accent flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-400" />
              {t("navigation_food_consumption.deficitModal.title")}
            </h3>
            <p className="text-[11px] font-bold text-root-subtle uppercase tracking-wider">{displayLabel}</p>
          </div>
          <RootModalCloseButton onClick={onClose} />
        </div>

        {/* BODY */}
        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-4 text-sm text-root-text neon-scrollbar sm:p-6">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl bg-root-canvas p-4 border border-root-accent/20 text-center">
              <div className="text-[10px] font-bold text-root-subtle uppercase tracking-tight mb-1">{t("navigation_food_consumption.deficitModal.currentProduction")}</div>
              <div className="font-black text-emerald-400 text-lg">+{formatNumber(currentProd, language)}</div>
            </div>
            <div className="rounded-xl bg-root-canvas p-4 border border-rose-500/30 text-center">
              <div className="text-[10px] font-bold text-rose-300 uppercase tracking-tight mb-1">{t("navigation_food_consumption.deficitModal.totalConsumption")}</div>
              <div className="font-black text-rose-400 text-lg">-{formatNumber(currentCons, language)}</div>
            </div>
            <div className="rounded-xl bg-root-canvas p-4 border border-rose-500/50 text-center">
              <div className="text-[10px] font-bold text-rose-300 uppercase tracking-tight mb-1">{t("navigation_food_consumption.deficitModal.totalDeficit")}</div>
              <div className="font-black text-rose-400 text-lg">-{formatNumber(deficit, language)}</div>
            </div>
          </div>

          <div className="border-t border-root-accent/10 pt-4">
            <p className="font-bold text-root-accent uppercase tracking-wider mb-3">
              💡 {t("navigation_food_consumption.deficitModal.recommendation")}
            </p>
            
            <div className="bg-root-canvas border border-root-accent/20 rounded-xl p-5 flex flex-col gap-3">
              <div className="flex justify-between items-center text-root-text">
                <span className="font-bold">{t("navigation_food_consumption.deficitModal.formulaTitle")}</span>
                <span className="text-xs font-bold text-root-subtle">{t("navigation_food_consumption.deficitModal.formula")}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-root-surface p-3 rounded-lg border border-root-accent/10 text-center">
                  <p className="text-[10px] text-root-subtle uppercase tracking-tight">{t("navigation_food_consumption.deficitModal.deficit")}</p>
                  <p className="text-lg font-black text-rose-400">-{formatNumber(deficit, language)}</p>
                </div>
                <div className="bg-root-surface p-3 rounded-lg border border-root-accent/10 text-center">
                  <p className="text-[10px] text-root-subtle uppercase tracking-tight">{t("navigation_food_consumption.deficitModal.productionPerUnit")}</p>
                  <p className="text-lg font-black text-emerald-400">+{formatNumber(prodPerUnit, language)}</p>
                </div>
                <div className="bg-root-accent/10 p-3 rounded-lg border border-root-accent/30 text-center">
                  <p className="text-[10px] text-root-accent uppercase tracking-tight">{t("navigation_food_consumption.deficitModal.buildingsNeeded")}</p>
                  <p className="text-xl font-black text-root-accent">{t("navigation_food_consumption.deficitModal.unitCount", { count: buildingsNeeded })}</p>
                </div>
          </div>
            </div>
          </div>

          <div className="bg-root-canvas p-4 rounded-xl border border-root-accent/20 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <span className="font-black uppercase tracking-wider text-root-accent block mb-1 text-xs">🏗️ {t("navigation_food_consumption.deficitModal.conclusion")}</span>
              <p className="text-sm text-root-text">
                {t("navigation_food_consumption.deficitModal.conclusionText", {
                  deficit: `-${formatNumber(deficit, language)}`,
                  buildings: buildingsNeeded,
                  label: displayLabel,
                })}
              </p>
            </div>
            <button
              onClick={handleBuild}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-root-accent text-root-canvas hover:bg-root-accent/80 transition-all font-black text-xs uppercase tracking-wider whitespace-nowrap cursor-pointer"
            >
              <Factory className="w-4 h-4" /> {t("navigation_food_consumption.deficitModal.buildButton", { buildings: buildingsNeeded })}
            </button>
          </div>

        </div>
      </div>
    </NotebookModalWrapper>
  );
}