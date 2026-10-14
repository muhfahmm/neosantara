"use client";

import React, { useMemo } from "react";
import {
  FileText,
  DollarSign,
  TrendingUp,
  Percent,
  CheckCircle,
  Building,
  UserCheck,
  ShoppingBag,
  Sparkles,
  TreePine,
} from "lucide-react";
import {
  TAX_CONFIGS,
  calculateIncomeAtRate,
} from "@/app/logic/economic_logic/2_tax_logic/taxLogic";
import {
  applyDemocracyTaxRevenueBonus,
} from "@/app/page/bonus_logic/ideologi_bonus_logic/demokrasi";
import {
  applyCapitalismTaxRevenueBonus,
} from "@/app/page/bonus_logic/ideologi_bonus_logic/kapitalisme";
import {
  applyLiberalismTaxRevenueBonus,
} from "@/app/page/bonus_logic/ideologi_bonus_logic/liberalisme";
import {
  applyConservatismTaxRevenueBonus,
} from "@/app/page/bonus_logic/ideologi_bonus_logic/konservatisme";
import {
  applyOrthodoxPersonalIncomeTaxRevenueBonus,
} from "@/app/page/bonus_logic/agama_bonus_logic/kristen";
import {
  applyBuddhaEnvironmentalTaxRevenueBonus,
} from "@/app/page/bonus_logic/agama_bonus_logic/buddha";

interface PajakSectionProps {
  countryDetail: Record<string, any> | null;
}

const getTaxValue = (detail: any, path: string[], fallback: number = 0): number => {
  let current: any = detail;
  for (const key of path) {
    if (current == null || typeof current !== "object") return fallback;
    current = current[key];
  }
  return typeof current === "number" ? current : fallback;
};

const applyIdeologyTaxBonus = (revenue: number, ideology: unknown) =>
  applyLiberalismTaxRevenueBonus(
    applyCapitalismTaxRevenueBonus(
      applyConservatismTaxRevenueBonus(
        applyDemocracyTaxRevenueBonus(revenue, ideology),
        ideology
      ),
      ideology
    ),
    ideology
  );

const formatNumber = (val: unknown): string => {
  const num = Number(val ?? 0);
  return Number.isFinite(num) ? num.toLocaleString("id-ID", { maximumFractionDigits: 2 }) : "0";
};

export default function PajakSection({ countryDetail }: PajakSectionProps) {
  const [dbTaxRates, setDbTaxRates] = React.useState<Record<string, number> | null>(null);

  // Jika countryDetail belum memiliki data pajak (atau bernilai 0), fetch dari /api/pajak-negara
  React.useEffect(() => {
    const slug = countryDetail?.country_slug || countryDetail?.slug;
    const countryName = countryDetail?.country || countryDetail?.nama_negara || countryDetail?.name_id || countryDetail?.name_en;

    const currentPajak = countryDetail?.pajak;
    const hasExistingPajak =
      (currentPajak?.ppn?.tarif || 0) > 0 ||
      (currentPajak?.korporasi?.tarif || 0) > 0 ||
      (currentPajak?.penghasilan?.tarif || 0) > 0 ||
      (countryDetail?.ppn || 0) > 0 ||
      (countryDetail?.corporate || 0) > 0 ||
      (countryDetail?.income_tax || 0) > 0;

    if (hasExistingPajak) {
      setDbTaxRates(null);
      return;
    }

    if (!slug && !countryName) return;

    let isMounted = true;
    const queryParam = slug ? `slug=${encodeURIComponent(slug)}` : `country=${encodeURIComponent(countryName)}`;

    fetch(`/api/pajak-negara?${queryParam}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isMounted || !data || data.error) return;
        setDbTaxRates({
          income_tax: Number(data.tarif_penghasilan ?? 0),
          corporate_tax: Number(data.tarif_korporasi ?? 0),
          vat: Number(data.tarif_ppn ?? 0),
          cigarette_tax: Number(data.tarif_bea_cukai ?? 0),
          environment_tax: Number(data.tarif_lingkungan ?? 0),
        });
      })
      .catch((err) => {
        console.error("Gagal mengambil data pajak negara:", err);
      });

    return () => {
      isMounted = false;
    };
  }, [
    countryDetail?.country_slug,
    countryDetail?.slug,
    countryDetail?.country,
    countryDetail?.nama_negara,
    countryDetail?.name_id,
    countryDetail?.pajak,
    countryDetail?.ppn,
    countryDetail?.corporate,
    countryDetail?.income_tax,
  ]);

  // Ambil tarif pajak dari countryDetail atau fallback ke dbTaxRates
  const taxRates = useMemo(() => {
    const hasPajakObj = countryDetail?.pajak && typeof countryDetail.pajak === "object";
    const penghasilanVal = hasPajakObj ? countryDetail.pajak.penghasilan?.tarif : undefined;
    const korporasiVal = hasPajakObj ? countryDetail.pajak.korporasi?.tarif : undefined;
    const ppnVal = hasPajakObj ? countryDetail.pajak.ppn?.tarif : undefined;
    const beaCukaiVal = hasPajakObj ? countryDetail.pajak.bea_cukai?.tarif : undefined;
    const lingkunganVal = hasPajakObj ? countryDetail.pajak.lingkungan?.tarif : undefined;

    return {
      income_tax: Number(
        countryDetail?.income_tax ??
        penghasilanVal ??
        dbTaxRates?.income_tax ??
        TAX_CONFIGS[0].baseRate
      ),
      corporate_tax: Number(
        countryDetail?.corporate ??
        korporasiVal ??
        dbTaxRates?.corporate_tax ??
        TAX_CONFIGS[1].baseRate
      ),
      vat: Number(
        countryDetail?.ppn ??
        ppnVal ??
        dbTaxRates?.vat ??
        TAX_CONFIGS[2].baseRate
      ),
      cigarette_tax: Number(
        countryDetail?.cigarette_tax ??
        beaCukaiVal ??
        dbTaxRates?.cigarette_tax ??
        TAX_CONFIGS[3].baseRate
      ),
      environment_tax: Number(
        countryDetail?.environment_tax ??
        lingkunganVal ??
        dbTaxRates?.environment_tax ??
        TAX_CONFIGS[4].baseRate
      ),
    };
  }, [countryDetail, dbTaxRates]);

  // Hitung estimasi penerimaan kas masing-masing jenis pajak
  const taxCalculations = useMemo(() => {
    const ideology = countryDetail?.ideology;
    const religion = countryDetail?.religion;

    return TAX_CONFIGS.map((config) => {
      const rate = taxRates[config.id as keyof typeof taxRates] ?? config.baseRate;
      let income = calculateIncomeAtRate(rate, config.maxIncome);

      // Bonus agama
      if (config.id === "income_tax") {
        income = applyOrthodoxPersonalIncomeTaxRevenueBonus(income, religion);
      } else if (config.id === "environment_tax") {
        income = applyBuddhaEnvironmentalTaxRevenueBonus(income, religion);
      }

      // Bonus ideologi
      income = applyIdeologyTaxBonus(income, ideology);

      return {
        ...config,
        currentRate: rate,
        estimatedRevenue: income,
      };
    });
  }, [countryDetail, taxRates]);

  const totalEstimatedRevenue = useMemo(
    () => taxCalculations.reduce((sum, item) => sum + item.estimatedRevenue, 0),
    [taxCalculations]
  );

  const averageTaxRate = useMemo(() => {
    const sum = Object.values(taxRates).reduce((acc, r) => acc + r, 0);
    return (sum / Object.keys(taxRates).length).toFixed(1);
  }, [taxRates]);

  // Indeks kepuasan rakyat terhadap beban pajak (Rumus resmi kepuasanCalculator)
  const taxSatisfactionScore = useMemo(() => {
    const avgRate = Number(averageTaxRate);
    const maxPossibleIncome = 5 * 500;
    return Math.min(
      100,
      Math.max(1, Math.round(100 - avgRate + (totalEstimatedRevenue / maxPossibleIncome) * 20))
    );
  }, [averageTaxRate, totalEstimatedRevenue]);

  return (
    <div className="space-y-4">
      {/* HEADER SECTION PAJAK */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0A1A1A]/80 border border-[#00FFAA]/20 p-4 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#0F2424] border border-[#00FFAA]/30">
            <FileText className="w-5 h-5 text-[#00FFAA]" />
          </div>
          <div>
            <h4 className="text-sm sm:text-base font-black uppercase tracking-wider text-[#00FFAA] flex items-center gap-2">
              Sistem & Manajemen Pajak Negara
            </h4>
            <p className="text-[10px] sm:text-xs text-[#6B8A8A] font-semibold">
              Tarif penerimaan fiskal dan estimasi kas pajak nasional
            </p>
          </div>
        </div>

        {/* Quick Summary Badges */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0F2424] border border-[#00FFAA]/30 rounded-xl">
            <TrendingUp className="w-3.5 h-3.5 text-[#00FFAA]" />
            <span className="text-[10px] font-bold text-[#6B8A8A] uppercase">Total Penerimaan:</span>
            <span className="text-[11px] font-black text-[#00FFAA]">
              +{formatNumber(totalEstimatedRevenue)} NEO / hari
            </span>
          </div>
        </div>
      </div>

      {/* TOP SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-[#0A1A1A] border border-[#00FFAA]/20 p-4 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#6B8A8A]">
              Rata-rata Tarif Pajak
            </span>
            <Percent className="w-4 h-4 text-[#00FFAA]" />
          </div>
          <p className="text-2xl font-black text-[#E0E0E0]">{averageTaxRate}%</p>
          <p className="text-[10px] text-[#8AB0A8] mt-1 font-medium">Beban fiskal gabungan 5 sektor</p>
        </div>

        <div className="bg-[#0A1A1A] border border-[#00FFAA]/20 p-4 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#6B8A8A]">
              Estimasi Kas Harian
            </span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400">
            +{formatNumber(totalEstimatedRevenue)}{" "}
            <span className="text-sm font-bold text-emerald-300">NEO</span>
          </p>
          <p className="text-[10px] text-[#8AB0A8] mt-1 font-medium">Pemasukan kas APBN negara</p>
        </div>

        <div className="bg-[#0A1A1A] border border-[#00FFAA]/20 p-4 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#6B8A8A]">
              Indeks Kepuasan Pajak
            </span>
            <span className="text-xs font-bold text-[#00FFAA]">{taxSatisfactionScore}/100</span>
          </div>
          <p className="text-2xl font-black text-[#00FFAA]">{taxSatisfactionScore}%</p>
          <div className="w-full h-2 bg-[#0F2424] rounded-full overflow-hidden mt-2 border border-[#00FFAA]/20">
            <div
              className="h-full rounded-full bg-[#00FFAA]"
              style={{ width: `${taxSatisfactionScore}%` }}
            />
          </div>
        </div>
      </div>

      {/* 5 KARTU PAJAK DETAIL */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {taxCalculations.map((tax) => {
          let IconComponent = FileText;
          if (tax.id === "income_tax") IconComponent = UserCheck;
          if (tax.id === "corporate_tax") IconComponent = Building;
          if (tax.id === "vat") IconComponent = ShoppingBag;
          if (tax.id === "cigarette_tax") IconComponent = Sparkles;
          if (tax.id === "environment_tax") IconComponent = TreePine;

          return (
            <div
              key={tax.id}
              className="bg-[#0A1A1A] border border-[#00FFAA]/20 rounded-2xl p-4 flex flex-col justify-between hover:border-[#00FFAA]/50 transition-all shadow-sm"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="p-2 rounded-xl bg-[#0F2424] text-[#00FFAA] border border-[#00FFAA]/20">
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <span className="text-sm sm:text-base font-black text-[#00FFAA] px-2.5 py-0.5 rounded-lg bg-[#0F2424] border border-[#00FFAA]/30">
                    {tax.currentRate}%
                  </span>
                </div>
                <h5 className="text-xs font-black uppercase tracking-wider text-[#E0E0E0] mb-1">
                  {tax.name}
                </h5>
                <p className="text-[10px] text-[#6B8A8A]">
                  Batas rentang tarif: {tax.minRate}% - {tax.maxRate}% (Standar {tax.baseRate}%)
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#00FFAA]/15 flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#6B8A8A] uppercase tracking-wider">
                  Estimasi Pendapatan:
                </span>
                <span className="text-xs font-black text-emerald-400">
                  +{formatNumber(tax.estimatedRevenue)} NEO
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
