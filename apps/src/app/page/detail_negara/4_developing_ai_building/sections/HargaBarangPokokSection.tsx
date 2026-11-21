"use client";

import React, { useMemo } from "react";
import {
  Tag,
  DollarSign,
  TrendingDown,
  ShoppingBasket,
  Smile,
  ShieldCheck,
} from "lucide-react";
import { useLanguage } from "@/app/page/paused_menu/terjemahan_paused_menu/languageLogic";

interface HargaBarangPokokSectionProps {
  countryDetail: Record<string, any> | null;
}

// 8 Komoditas pokok resmi sesuai tabel database_harga_barang
const DATABASE_COMMODITIES = [
  { key: "harga_beras", defaultPrice: 25000, unit: "kg" },
  { key: "harga_daging_sapi", defaultPrice: 75000, unit: "kg" },
  { key: "harga_ayam", defaultPrice: 50000, unit: "kg" },
  { key: "harga_minyak_goreng", defaultPrice: 25000, unit: "liter" },
  { key: "harga_gula", defaultPrice: 25000, unit: "kg" },
  { key: "harga_telur", defaultPrice: 50000, unit: "kg" },
  { key: "harga_listrik", defaultPrice: 75000, unit: "kWh" },
  { key: "harga_air", defaultPrice: 25000, unit: "m³" },
];

const formatNumber = (val: unknown): string => {
  const num = Number(val ?? 0);
  return Number.isFinite(num) ? num.toLocaleString("id-ID", { maximumFractionDigits: 2 }) : "0";
};

export default function HargaBarangPokokSection({
  countryDetail,
}: HargaBarangPokokSectionProps) {
  const { t } = useLanguage();
  const [dbPrices, setDbPrices] = React.useState<Record<string, number> | null>(null);

  // Fetch data harga dari /api/price-data jika harga belum ada di countryDetail
  React.useEffect(() => {
    const rawPrices = countryDetail?.harga as Record<string, number> | undefined;
    const hasExistingPrices = rawPrices && Object.keys(rawPrices).length > 0 && Object.values(rawPrices).some((p) => Number(p) > 0);

    if (hasExistingPrices) {
      setDbPrices(null);
      return;
    }

    const countryName = countryDetail?.country || countryDetail?.nama_negara || countryDetail?.name_id || countryDetail?.country_slug;
    if (!countryName) return;

    let isMounted = true;
    fetch(`/api/price-data?country=${encodeURIComponent(countryName)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isMounted || !data || data.error || !data.prices) return;
        setDbPrices(data.prices);
      })
      .catch((err) => {
        console.error("Gagal mengambil data harga barang negara:", err);
      });

    return () => {
      isMounted = false;
    };
  }, [
    countryDetail?.country,
    countryDetail?.nama_negara,
    countryDetail?.name_id,
    countryDetail?.country_slug,
    countryDetail?.harga,
  ]);

  const pricesMap: Record<string, number> = useMemo(() => {
    const propPrices = (countryDetail?.harga as Record<string, number>) || {};
    return {
      ...dbPrices,
      ...propPrices,
    };
  }, [countryDetail, dbPrices]);

  const subsidyActive = Boolean(countryDetail?.subsidyActive);

  // Daftar item harga yang di-resolve sesuai 8 komoditas resmi database
  const items = useMemo(() => {
    return DATABASE_COMMODITIES.map((c) => {
      // Periksa key harga atau alias
      let val = pricesMap[c.key];
      if (val === undefined) {
        if (c.key === "harga_ayam") val = pricesMap["harga_daging_ayam"];
        if (c.key === "harga_telur") val = pricesMap["harga_telur_ayam"];
      }
      return {
        ...c,
        label: t(`detail_negara_ai.building.hargaBarang.commodities.${c.key}` as any),
        price: Number(val !== undefined && !isNaN(Number(val)) ? val : c.defaultPrice),
      };
    });
  }, [pricesMap, t]);

  // Hitung rata-rata harga barang pokok
  const averagePrice = useMemo(() => {
    if (items.length === 0) return 0;
    const sum = items.reduce((acc, it) => acc + it.price, 0);
    return Math.round(sum / items.length);
  }, [items]);

  // Hitung indeks keterjangkauan harga (Formula resmi kepuasanCalculator)
  const priceSatisfaction = useMemo(() => {
    if (items.length === 0) return 50;
    const minPrice = 10000;
    const maxPrice = 100000;
    let totalScore = 0;

    for (const it of items) {
      let score = 100 - ((it.price - minPrice) / (maxPrice - minPrice)) * 100;
      score = Math.min(100, Math.max(0, score));
      totalScore += score;
    }

    let avgScore = totalScore / items.length;
    if (subsidyActive) avgScore = Math.min(100, avgScore + 5);
    return Math.round(avgScore);
  }, [items, subsidyActive]);

  return (
    <div className="space-y-4">
      {/* HEADER SECTION HARGA POKOK */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-root-canvas/80 border border-root-accent/20 p-4 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-root-surface border border-root-accent/30">
            <Tag className="w-5 h-5 text-root-accent" />
          </div>
          <div>
            <h4 className="text-sm sm:text-base font-black uppercase tracking-wider text-root-accent flex items-center gap-2">
              {t("detail_negara_ai.building.hargaBarang.title")}
            </h4>
            <p className="text-[10px] sm:text-xs text-root-subtle font-semibold">
              {t("detail_negara_ai.building.hargaBarang.desc")}
            </p>
          </div>
        </div>

        {/* Quick Badges */}
        <div className="flex items-center gap-2">
          {subsidyActive && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
                {t("detail_negara_ai.building.hargaBarang.foodSubsidyActive")}
              </span>
            </div>
          )}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-root-surface border border-root-accent/30 rounded-xl">
            <DollarSign className="w-3.5 h-3.5 text-root-accent" />
            <span className="text-[10px] font-bold text-root-subtle uppercase">
              {t("detail_negara_ai.building.hargaBarang.average")}
            </span>
            <span className="text-[11px] font-black text-root-accent">
              Rp {formatNumber(averagePrice)}
            </span>
          </div>
        </div>
      </div>

      {/* TOP SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-root-canvas border border-root-accent/20 p-4 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-root-subtle">
              {t("detail_negara_ai.building.hargaBarang.avgMarketPrice")}
            </span>
            <ShoppingBasket className="w-4 h-4 text-root-accent" />
          </div>
          <p className="text-2xl font-black text-root-text">
            Rp {formatNumber(averagePrice)}
          </p>
          <p className="text-[10px] text-[#8AB0A8] mt-1 font-medium">
            {t("detail_negara_ai.building.hargaBarang.basedOnCommodities", { count: items.length })}
          </p>
        </div>

        <div className="bg-root-canvas border border-root-accent/20 p-4 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-root-subtle">
              {t("detail_negara_ai.building.hargaBarang.affordabilityStatus")}
            </span>
            <Smile className="w-4 h-4 text-root-accent" />
          </div>
          <p className="text-2xl font-black text-root-accent">
            {priceSatisfaction >= 75
              ? t("detail_negara_ai.building.hargaBarang.statusVeryAffordable")
              : priceSatisfaction >= 50
              ? t("detail_negara_ai.building.hargaBarang.statusModerate")
              : t("detail_negara_ai.building.hargaBarang.statusHighInflation")}
          </p>
          <p className="text-[10px] text-[#8AB0A8] mt-1 font-medium">
            {t("detail_negara_ai.building.hargaBarang.consumerPurchasingPower")}
          </p>
        </div>

        <div className="bg-root-canvas border border-root-accent/20 p-4 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-root-subtle">
              {t("detail_negara_ai.building.hargaBarang.priceSatisfactionIndex")}
            </span>
            <span className="text-xs font-bold text-root-accent">{priceSatisfaction}/100</span>
          </div>
          <p className="text-2xl font-black text-root-accent">{priceSatisfaction}%</p>
          <div className="w-full h-2 bg-root-surface rounded-full overflow-hidden mt-2 border border-root-accent/20">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                priceSatisfaction >= 70 ? "bg-root-accent" : priceSatisfaction >= 40 ? "bg-amber-400" : "bg-rose-500"
              }`}
              style={{ width: `${priceSatisfaction}%` }}
            />
          </div>
        </div>
      </div>

      {/* GRID KARTU HARGA KOMODITAS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-3.5">
        {items.map((item) => {
          const isCheap = item.price <= 25000;
          const isExpensive = item.price >= 75000;
          return (
            <div
              key={item.key}
              className="bg-root-canvas border border-root-accent/20 rounded-2xl p-3.5 flex flex-col justify-between hover:border-root-accent/50 transition-all shadow-sm group min-h-[105px]"
            >
              <div>
                <div className="flex items-start justify-between gap-1 mb-1.5">
                  <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-[#8AB0A8] leading-tight">
                    {item.label}
                  </p>
                  <span className="text-[9px] font-bold text-root-subtle">/{item.unit}</span>
                </div>
              </div>

              <div className="mt-auto">
                <p
                  className={`text-base sm:text-lg font-black tracking-tight leading-none ${
                    isCheap ? "text-emerald-400" : isExpensive ? "text-rose-400" : "text-root-text"
                  }`}
                >
                  Rp {formatNumber(item.price)}
                </p>
                <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-root-accent/10 text-[9px] font-semibold text-root-subtle">
                  <span>{t("detail_negara_ai.building.hargaBarang.statusLabel")}</span>
                  <span className={isCheap ? "text-emerald-400" : isExpensive ? "text-rose-400" : "text-amber-400"}>
                    {isCheap
                      ? t("detail_negara_ai.building.hargaBarang.statusCheap")
                      : isExpensive
                      ? t("detail_negara_ai.building.hargaBarang.statusExpensive")
                      : t("detail_negara_ai.building.hargaBarang.statusFair")}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
