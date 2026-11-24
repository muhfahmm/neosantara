"use client";

import RootInfoModalHeader from '@/app/page/root_modals_design_menu/RootInfoModalHeader';
import { getRelationTier } from '@/app/logic/relationTiers';
import React, { useState, useEffect, useMemo } from "react";
import {
  Gift,
  ChevronDown,
  TrendingUp,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Package,
  Layers,
  CheckCircle2,
  Plus,
  Minus
} from "lucide-react";
import PilihItemModal from "@/app/page/navigasi_menu/2_navigasi_bawah/4_ekonomi/1_perdagangan/umum/PilihItemModal";
import { getMaterialStock } from "@/app/page/navigasi_menu/2_navigasi_bawah/5_pembangunan/build_logic/build_logic";
import { getRelationValue, setRelationModifier } from "../../../../../../../json/4_database_hubungan_antar_negara/relationsRegistry";
import { COUNTRIES_DATA } from "@/app/page/map_system/map-data";
import NotebookModalWrapper from "@/app/page/navigasi_menu/2_navigasi_bawah/NotebookModalWrapper";
import { useLanguage } from "@/app/page/paused_menu/terjemahan_paused_menu/languageLogic";
import { getLocalizedCountryName } from '@/app/logic/countryNameLogic';

const CATEGORY_MAP: Record<string, string[]> = {
  criticalMinerals: ["uranium", "batu_bara", "minyak_bumi", "gas_alam", "garam", "litium", "logam_tanah_jarang", "bijih_besi"],
  manufacturing: ["pabrik_semikonduktor", "pabrik_mesin", "pabrik_besi", "semen_beton", "kayu"],
  livestock: ["ayam_unggas", "sapi_perah", "sapi_potong", "domba_kambing"],
  agriculture: ["padi", "gandum", "jagung", "sayur", "umbi", "kedelai", "kelapa_sawit", "kopi", "teh", "kakao", "tebu", "karet"],
  fishery: ["udang", "mutiara", "ikan"],
  foodProcessing: ["air_mineral", "gula", "roti", "pengolahan_daging", "mie_instan", "minyak_goreng", "susu"]
};

const COMMODITY_VALUE: Record<string, number> = {
  uranium: 8000, batu_bara: 100, minyak_bumi: 150, gas_alam: 120, garam: 50,
  litium: 3000, logam_tanah_jarang: 5000, bijih_besi: 800,
  pabrik_semikonduktor: 4000, pabrik_mesin: 10000, pabrik_besi: 10000,
  semen_beton: 300, kayu: 200, ayam_unggas: 60, sapi_perah: 200,
  sapi_potong: 180, domba_kambing: 150, padi: 80, gandum: 90, jagung: 70,
  sayur: 100, umbi: 60, kedelai: 120, kelapa_sawit: 130, kopi: 300,
  teh: 250, kakao: 350, tebu: 100, karet: 200,
  udang: 500, mutiara: 1000, ikan: 300, air_mineral: 50,
  gula: 150, roti: 200, pengolahan_daging: 250, mie_instan: 180, minyak_goreng: 220,
  susu: 160,
};

interface BeriHadiahModalProps {
  isOpen: boolean;
  countryName?: string | null;
  playerCountryDetail?: any;
  setPlayerCountryDetail?: (detail: any | ((prev: any) => any)) => void;
  setCountryDetail?: (detail: any | ((prev: any) => any)) => void;
  onClose: () => void;
  onConfirm?: () => void;
}

export default function BeriHadiahModal({
  isOpen,
  countryName,
  playerCountryDetail,
  setPlayerCountryDetail,
  setCountryDetail,
  onClose,
  onConfirm
}: BeriHadiahModalProps) {
  const { t, language } = useLanguage();
  const numberFormat = useMemo(
    () => new Intl.NumberFormat(language, { maximumFractionDigits: 2 }),
    [language],
  );
  const effectiveSetPlayerCountryDetail = setPlayerCountryDetail || setCountryDetail;
  const [selectedProduct, setSelectedProduct] = useState<string>("padi");
  const [quantity, setQuantity] = useState<number>(100);
  const [isProductPickerOpen, setIsProductPickerOpen] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedProduct("padi");
      setQuantity(100);
    }
  }, [isOpen]);

  const targetCountryName = countryName || t("detail_negara_ai.geopolitics.targetCountry");
  const isAllCountries = countryName === "Semua Negara";
  const targetCountryDisplayName = countryName && !isAllCountries
    ? getLocalizedCountryName(countryName, language)
    : targetCountryName;
  const playerCountryName =
    playerCountryDetail?.country ||
    playerCountryDetail?.nama ||
    playerCountryDetail?.country_name ||
    "Indonesia";

  const currentRelation = getRelationValue(playerCountryName, targetCountryName);

  // Periksa stok komoditas pemain
  const stockAvailable = useMemo(() => {
    if (!selectedProduct || !playerCountryDetail) return 0;
    return getMaterialStock(playerCountryDetail, selectedProduct);
  }, [selectedProduct, playerCountryDetail]);

  // Kalkulasi nilai diplomatik hadiah
  const unitValue = COMMODITY_VALUE[selectedProduct] || 100;
  const totalGiftValue = unitValue * quantity;

  // 10.000 Nilai Komoditas Hadiah = 1 Tingkat Hubungan
  const gainedLevels = Math.floor(totalGiftValue / 10000);
  const maxPossibleIncrease = Math.max(0, 100 - currentRelation);
  const actualGained = isAllCountries ? gainedLevels : Math.min(gainedLevels, maxPossibleIncrease);
  const newRelation = Math.min(100, currentRelation + gainedLevels);

  const isInsufficientStock = quantity > stockAvailable;
  const isLessThanMin = quantity <= 0 || gainedLevels < 1;
  const isMaxRelation = !isAllCountries && currentRelation >= 100;
  const isValid = quantity > 0 && !isInsufficientStock && gainedLevels > 0 && !isMaxRelation;

  // Format data item untuk modal pemilih
  const groupedProductItems = useMemo(() => {
    return Object.entries(CATEGORY_MAP).map(([category, keys]) => ({
      category: t(`navigation_economy_trade.transaction.categories.${category}`),
      items: keys.map((key) => {
        const itemStock = playerCountryDetail ? getMaterialStock(playerCountryDetail, key) : 0;
        return {
        label: `${t(`navigation_economy_trade.transaction.products.${key}`)} (${t("detail_negara_ai.geopolitics.stock")}: ${numberFormat.format(itemStock)})`,
          value: key,
          disabled: false
        };
      })
    }));
  }, [numberFormat, playerCountryDetail, t]);

  const handleAddQty = (amount: number) => {
    setQuantity((prev) => Math.max(1, prev + amount));
  };

  const handleSetMax = () => {
    if (stockAvailable > 0) {
      setQuantity(stockAvailable);
    }
  };

  const handleConfirm = () => {
    if (!isValid) return;

    // 1. Perbarui nilai hubungan diplomatik global
    if (targetCountryName === "Semua Negara") {
      const allOtherCountries = (COUNTRIES_DATA || [])
        .map((c) => c.country)
        .filter((name): name is string => Boolean(name && name.toLowerCase().trim() !== playerCountryName.toLowerCase().trim()));
      allOtherCountries.forEach((cName) => {
        setRelationModifier(playerCountryName, cName, actualGained);
      });
    } else {
      setRelationModifier(playerCountryName, targetCountryName, actualGained);
    }

    // 2. Potong stok komoditas dari playerCountryDetail
    if (effectiveSetPlayerCountryDetail) {
      effectiveSetPlayerCountryDetail((prev: any) => {
        if (!prev) return prev;
        const inventoryKey = `inventory_${selectedProduct}`;
        const accumulatedKey = `accumulated_${selectedProduct}`;
        const currentStock = getMaterialStock(prev, selectedProduct);
        const newStock = Math.max(0, currentStock - quantity);

        return {
          ...prev,
          [inventoryKey]: newStock,
          [accumulatedKey]: newStock
        };
      });
    }

    // 3. Picu event pembaruan hubungan agar UI peta dan modal lain tersinkronisasi
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("country_relations_updated"));
    }

    if (onConfirm) {
      onConfirm();
    }

    onClose();
  };

  const currentBadge = getRelationTier(currentRelation);
  const newBadge = getRelationTier(newRelation);

  if (!isOpen) return null;

  return (
    <>
      <NotebookModalWrapper
        onClose={onClose}
        zIndexClass="z-[100000001]"
      >
        <div className="flex h-full min-h-0 flex-col overflow-hidden bg-root-surface font-sans">
          <RootInfoModalHeader
            title={t("detail_negara_ai.geopolitics.giveGiftTitle")}
            onClose={onClose}
            icon={<Gift />}
            size="standard"
          />

          {/* BODY */}
          <div className="flex-1 min-h-0 bg-root-surface relative z-10 p-4 sm:p-6 flex flex-col gap-3 sm:gap-4 overflow-y-auto custom-scrollbar">
            {/* Notice + Stock Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 shrink-0">
              <div className="p-3 rounded-xl bg-root-canvas border border-root-accent/20 flex items-start gap-2.5">
                <Sparkles className="h-4 w-4 text-root-accent shrink-0 mt-0.5" />
                <p className="text-[11px] sm:text-xs text-root-text leading-relaxed">
                  {t("detail_negara_ai.geopolitics.commodityGiftSummary", {
                    country: targetCountryDisplayName,
                    threshold: numberFormat.format(10000),
                  })}
                </p>
              </div>

              <div className="flex items-center justify-between bg-root-canvas p-3 rounded-xl border border-root-accent/20">
                <span className="text-[11px] sm:text-xs text-root-subtle font-semibold flex items-center gap-2">
                  <Package className="h-4 w-4 text-root-accent" />
                  {t("detail_negara_ai.geopolitics.availableCommodityStock")}:
                </span>
                <span className={`font-black text-sm ${stockAvailable > 0 ? "text-root-accent" : "text-rose-400"}`}>
                  {numberFormat.format(stockAvailable)} {t("detail_negara_ai.geopolitics.unit")}
                </span>
              </div>
            </div>

            {/* Pemilihan Komoditas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 shrink-0">
              {/* Button Pemilih Produk */}
              <div>
                <label className="block text-[10px] sm:text-xs font-black text-root-accent uppercase tracking-wider mb-2">
                  {t("detail_negara_ai.geopolitics.selectCommodityProduct")}
                </label>
                <button
                  type="button"
                  onClick={() => setIsProductPickerOpen(true)}
                  className="w-full h-11 bg-root-canvas hover:bg-root-accent/5 border border-root-accent/40 hover:border-root-accent rounded-xl px-3 flex items-center justify-between text-root-text transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Layers className="h-4 w-4 text-root-accent shrink-0" />
                    <span className="font-sans font-bold text-xs sm:text-sm tracking-wide truncate text-root-text">
                      {t(`navigation_economy_trade.transaction.products.${selectedProduct}`)}
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-root-accent shrink-0" />
                </button>
              </div>

              {/* Input Kuantitas Hadiah */}
              <div>
                <label className="block text-[10px] sm:text-xs font-black text-root-accent uppercase tracking-wider mb-2">
                  {t("detail_negara_ai.geopolitics.commodityAmount")}
                </label>
                <div className="flex h-11 w-full min-w-0 items-center gap-1.5 rounded-xl border border-root-accent/40 bg-root-canvas px-2 sm:gap-2 sm:px-3">
                  <input
                    type="number"
                    min={1}
                    value={quantity || ""}
                    onChange={(e) => setQuantity(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-0 min-w-0 flex-1 bg-transparent text-sm font-sans font-black text-root-text outline-none placeholder-root-subtle"
                    placeholder="0"
                  />
                  <span className="mr-1 shrink-0 text-xs font-bold text-root-subtle">{t("detail_negara_ai.geopolitics.unit")}</span>
                  <div className="flex shrink-0 gap-1">
                    <button
                      type="button"
                      onClick={() => handleAddQty(-10)}
                      className="p-1.5 bg-root-surface hover:bg-root-accent/20 border border-root-accent/30 rounded text-root-accent transition-all cursor-pointer"
                      title="-10"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddQty(10)}
                      className="p-1.5 bg-root-surface hover:bg-root-accent/20 border border-root-accent/30 rounded text-root-accent transition-all cursor-pointer"
                      title="+10"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={handleSetMax}
                      className="px-2 py-1 bg-root-accent/20 hover:bg-root-accent/30 border border-root-accent/50 rounded text-[10px] font-black text-root-accent transition-all cursor-pointer"
                    >
                      {t("detail_negara_ai.geopolitics.max")}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Nilai Diplomatik Hadiah */}
            <div className="p-3 bg-root-canvas border border-root-accent/20 rounded-xl flex items-center justify-between shrink-0 text-xs">
              <span className="text-root-subtle font-semibold">
                {t("detail_negara_ai.geopolitics.estimatedDiplomaticValue", {
                  quantity: numberFormat.format(quantity),
                  unitValue: numberFormat.format(unitValue),
                })}
              </span>
              <span className="font-black text-root-accent text-sm">
                {numberFormat.format(totalGiftValue)} {t("detail_negara_ai.geopolitics.commodityValue")}
              </span>
            </div>

            {/* Impact Preview Card — Hanya ditampilkan jika untuk 1 negara spesifik */}
            {!isAllCountries ? (
              <div className="bg-root-canvas p-3 sm:p-4 rounded-xl border border-root-accent/30 shrink-0">
                <div className="text-[10px] sm:text-xs font-black text-root-subtle uppercase tracking-wider flex items-center justify-between mb-3">
                  <span>{t("detail_negara_ai.geopolitics.relationCalcTitle")}</span>
                  <TrendingUp className="h-4 w-4 text-root-accent" />
                </div>

                <div className="flex items-center justify-between gap-3 bg-root-surface p-3 rounded-lg border border-root-accent/20">
                  {/* Current Level */}
                  <div className="text-center flex-1">
                    <span className="block text-[9px] sm:text-[10px] font-bold text-root-subtle uppercase">{t("detail_negara_ai.geopolitics.current")}</span>
                    <span className="text-lg sm:text-xl font-black text-root-text">{currentRelation}</span>
                    <div className="mt-1">
                      <span className={`inline-block px-3 py-0.5 rounded-md border font-black text-xs shadow-sm ${currentBadge.badgeClassName}`}>
                        {t(`detail_negara_ai.geopolitics.relationTiers.${currentBadge.id}`)}
                      </span>
                    </div>
                  </div>

                  {/* Arrow & Delta */}
                  <div className="flex flex-col items-center justify-center px-2">
                    <span className="text-[11px] font-black text-root-accent bg-root-accent/10 px-2 py-0.5 rounded border border-root-accent/30 mb-1 whitespace-nowrap">
                      +{actualGained} {t("detail_negara_ai.geopolitics.level")}
                    </span>
                    <ArrowRight className="h-4 w-4 text-root-accent" />
                  </div>

                  {/* New Level */}
                  <div className="text-center flex-1">
                    <span className="block text-[9px] sm:text-[10px] font-bold text-root-subtle uppercase">{t("detail_negara_ai.geopolitics.afterGiving")}</span>
                    <span className="text-lg sm:text-xl font-black text-root-accent">{newRelation}</span>
                    <div className="mt-1">
                      <span className={`inline-block px-3 py-0.5 rounded-md border font-black text-xs shadow-sm ${newBadge.badgeClassName}`}>
                        {t(`detail_negara_ai.geopolitics.relationTiers.${newBadge.id}`)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Remainder info */}
                {totalGiftValue > 0 && totalGiftValue < 10000 && (
                  <p className="text-[10px] sm:text-[11px] text-amber-300 flex items-center gap-1.5 mt-2.5">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    <span>
                      {t("detail_negara_ai.geopolitics.giftBelowThreshold", {
                        value: numberFormat.format(totalGiftValue),
                        threshold: numberFormat.format(10000),
                      })}
                    </span>
                  </p>
                )}
              </div>
            ) : (
              /* Ringkasan dampak global saat target adalah Semua Negara */
              <div className="bg-root-canvas p-3 sm:p-4 rounded-xl border border-root-accent/30 shrink-0 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Sparkles className="h-4 w-4 text-root-accent shrink-0" />
                  <span className="text-xs text-root-text font-semibold">
                    {t("detail_negara_ai.geopolitics.globalEffectAllCountries")}
                  </span>
                </div>
                <span className="text-sm font-black text-root-accent bg-root-accent/10 px-3 py-1 rounded-lg border border-root-accent/30">
                  {t("detail_negara_ai.geopolitics.relationIncreasePerCountry", { levels: actualGained })}
                </span>
              </div>
            )}

            {/* Error / Warning Alert */}
            {isInsufficientStock && (
              <div className="p-2.5 sm:p-3 bg-root-modal-negative-bg border border-root-modal-negative/40 rounded-xl text-root-modal-negative text-[11px] sm:text-xs flex items-center gap-2 shrink-0">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                <span>{t("detail_negara_ai.geopolitics.insufficientCommodityStock")} ({t("detail_negara_ai.geopolitics.available")}: {numberFormat.format(stockAvailable)} {t("detail_negara_ai.geopolitics.unit")}).</span>
              </div>
            )}

            {isMaxRelation && (
              <div className="p-2.5 sm:p-3 bg-root-modal-positive-bg border border-root-modal-positive-border rounded-xl text-root-modal-positive text-[11px] sm:text-xs flex items-center gap-2 shrink-0">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                <span>{t("detail_negara_ai.geopolitics.maxRelationReached")}</span>
              </div>
            )}

            {/* Spacer */}
            <div className="flex-1" />
          </div>

          {/* FOOTER */}
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-root-accent/20 bg-root-canvas shrink-0 rounded-b-2xl">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-root-surface hover:bg-root-accent/10 border border-root-accent/30 hover:border-root-accent rounded-xl py-2.5 sm:py-3 text-center text-root-text font-extrabold text-xs tracking-wider uppercase transition-all cursor-pointer"
              >
                {t("detail_negara_ai.common.cancel")}
              </button>
              <button
                type="button"
                disabled={!isValid}
                onClick={handleConfirm}
                className={`flex-1 rounded-xl py-2.5 sm:py-3 text-center font-black text-xs tracking-wider uppercase transition-all shadow-lg flex items-center justify-center gap-2 ${isValid
                    ? "bg-root-accent hover:bg-root-accent/85 text-root-accent-ink border border-root-accent cursor-pointer"
                    : "bg-root-modal-neutral-bg text-root-muted border border-root-accent/20 cursor-not-allowed opacity-60"
                  }`}
              >
                <Gift className="h-4 w-4" />
                {t("detail_negara_ai.geopolitics.giveGift")} (+{actualGained})
              </button>
            </div>
          </div>
        </div>
      </NotebookModalWrapper>

      {/* MODAL PILIH PRODUK KOMODITAS */}
      <PilihItemModal
        isOpen={isProductPickerOpen}
        onClose={() => setIsProductPickerOpen(false)}
        title={t("detail_negara_ai.geopolitics.selectCommodityProduct")}
        data={groupedProductItems}
        selectedValue={selectedProduct}
        onSelect={(val) => setSelectedProduct(val)}
      />
    </>
  );
}