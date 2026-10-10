"use client";
import React, { useEffect, useState } from "react";
import { X, FileText } from "lucide-react";
import {
  TAX_CONFIGS,
  calculateIncomeAtRate,
} from "@/app/logic/economic_logic/2_tax_logic/taxLogic";
import { generatePajakChangeNotification } from "@/app/page/menus/inbox/logic/7_notifikasi_ekonomi/1_perubahan_pajak/pajakChangeLogic";
import {
  applyOrthodoxPersonalIncomeTaxRevenueBonus,
  ORTHODOX_PERSONAL_INCOME_TAX_REVENUE_BONUS,
} from "@/app/page/bonus_logic/agama_bonus_logic/kristen";
import {
  applyBuddhaEnvironmentalTaxRevenueBonus,
  BUDDHA_ENVIRONMENTAL_TAX_REVENUE_BONUS,
} from "@/app/page/bonus_logic/agama_bonus_logic/buddha";
import {
  DEMOCRACY_TAX_REVENUE_BONUS,
  applyDemocracyTaxRevenueBonus,
} from "@/app/page/bonus_logic/ideologi_bonus_logic/demokrasi";
import {
  CAPITALISM_TAX_REVENUE_BONUS,
  applyCapitalismTaxRevenueBonus,
} from "@/app/page/bonus_logic/ideologi_bonus_logic/kapitalisme";
import {
  LIBERALISM_TAX_REVENUE_BONUS,
  applyLiberalismTaxRevenueBonus,
} from "@/app/page/bonus_logic/ideologi_bonus_logic/liberalisme";
import {
  CONSERVATISM_TAX_REVENUE_BONUS,
  applyConservatismTaxRevenueBonus,
} from "@/app/page/bonus_logic/ideologi_bonus_logic/konservatisme";
import {
  getHarmonisasiFiskalGlobalBonusPercent,
  applyHarmonisasiFiskalGlobalTaxRevenueBonus,
} from "@/app/page/bonus_logic";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  countryDetail: any;
  setCountryDetail: (detail: any) => void;
}

/**
 * Mengambil nilai pajak dari objek detail berdasarkan jalur path.
 * Jika nilai tidak ditemukan atau bukan angka, mengembalikan fallback (default 0).
 */
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

export default function PajakModal({
  isOpen,
  onClose,
  countryDetail,
  setCountryDetail,
}: ModalProps) {
  if (!isOpen) return null;

  // Inisialisasi nilai awal dengan fallback 0, dipaksa menjadi number
  const initialRates = {
    income_tax: Number(
      getTaxValue(countryDetail, ["income_tax"]) ??
      getTaxValue(countryDetail, ["pajak", "penghasilan", "tarif"]) ??
      0
    ),
    corporate_tax: Number(
      getTaxValue(countryDetail, ["corporate"]) ??
      getTaxValue(countryDetail, ["pajak", "korporasi", "tarif"]) ??
      0
    ),
    vat: Number(
      getTaxValue(countryDetail, ["ppn"]) ??
      getTaxValue(countryDetail, ["pajak", "ppn", "tarif"]) ??
      0
    ),
    cigarette_tax: Number(
      getTaxValue(countryDetail, ["cigarette_tax"]) ??
      getTaxValue(countryDetail, ["pajak", "bea_cukai", "tarif"]) ??
      0
    ),
    environment_tax: Number(
      getTaxValue(countryDetail, ["environment_tax"]) ??
      getTaxValue(countryDetail, ["pajak", "lingkungan", "tarif"]) ??
      0
    ),
  };

  const [tempRates, setTempRates] = useState<Record<string, number>>(initialRates);

  useEffect(() => {
    setTempRates(initialRates);
  }, [
    countryDetail?.id,
    countryDetail?.name,
    countryDetail?.income_tax,
    countryDetail?.corporate,
    countryDetail?.ppn,
    countryDetail?.cigarette_tax,
    countryDetail?.environment_tax,
    countryDetail?.pajak?.penghasilan?.tarif,
    countryDetail?.pajak?.korporasi?.tarif,
    countryDetail?.pajak?.ppn?.tarif,
    countryDetail?.pajak?.bea_cukai?.tarif,
    countryDetail?.pajak?.lingkungan?.tarif,
  ]);

  // ---- FUNGSI MENGHITUNG INDEKS KEPUASAN ----
  const calculateSatisfaction = (rates: typeof tempRates) => {
    const { vat, corporate_tax, income_tax, cigarette_tax, environment_tax } = rates;
    const avgRate = (vat + corporate_tax + income_tax + cigarette_tax + environment_tax) / 5;
    const total =
      applyIdeologyTaxBonus(calculateIncomeAtRate(vat, 500), countryDetail?.ideology) +
      applyIdeologyTaxBonus(calculateIncomeAtRate(corporate_tax, 500), countryDetail?.ideology) +
      applyIdeologyTaxBonus(
        applyOrthodoxPersonalIncomeTaxRevenueBonus(
          calculateIncomeAtRate(income_tax, 500),
          countryDetail?.religion
        ),
        countryDetail?.ideology
      ) +
      applyIdeologyTaxBonus(calculateIncomeAtRate(cigarette_tax, 500), countryDetail?.ideology) +
      applyIdeologyTaxBonus(
        applyBuddhaEnvironmentalTaxRevenueBonus(
          calculateIncomeAtRate(environment_tax, 500),
          countryDetail?.religion
        ),
        countryDetail?.ideology
      );
    const maxIncome = 5 * 500; // 2500 NEO
    // Kepuasan = 100 - rata-rata tarif + (pendapatan / maxPendapatan * 20)
    let satisfaction = 100 - avgRate + (total / maxIncome) * 20;
    // Clamp antara 1 dan 100
    return Math.min(100, Math.max(1, Math.round(satisfaction)));
  };

  const satisfaction = calculateSatisfaction(tempRates);
  const ideology = String(countryDetail?.ideology || "").trim().toLowerCase();
  const hasDemocracyTaxBonus = ideology === "demokrasi";
  const hasCapitalismTaxBonus = ideology === "kapitalisme";
  const hasLiberalismTaxBonus = ideology === "liberalisme";
  const hasConservatismTaxBonus = ideology === "konservatisme";
  const vatRevenue = applyIdeologyTaxBonus(
    calculateIncomeAtRate(tempRates.vat, 500),
    countryDetail?.ideology
  );
  const corporateTaxRevenue = applyIdeologyTaxBonus(
    calculateIncomeAtRate(tempRates.corporate_tax, 500),
    countryDetail?.ideology
  );
  const personalIncomeTaxRevenue = applyIdeologyTaxBonus(
    applyOrthodoxPersonalIncomeTaxRevenueBonus(
      calculateIncomeAtRate(tempRates.income_tax, 500),
      countryDetail?.religion
    ),
    countryDetail?.ideology
  );
  const hasOrthodoxTaxBonus =
    String(countryDetail?.religion || "").trim().toLowerCase() === "kristen ortodoks";
  const cigaretteTaxRevenue = applyIdeologyTaxBonus(
    calculateIncomeAtRate(tempRates.cigarette_tax, 500),
    countryDetail?.ideology
  );
  const environmentalTaxRevenue = applyIdeologyTaxBonus(
    applyBuddhaEnvironmentalTaxRevenueBonus(
      calculateIncomeAtRate(tempRates.environment_tax, 500),
      countryDetail?.religion
    ),
    countryDetail?.ideology
  );
  const hasBuddhaTaxBonus =
    String(countryDetail?.religion || "").trim().toLowerCase() === "buddha";

  // --- Initialize satisfaction.tax hanya saat modal pertama kali buka & countryDetail berubah ---
  useEffect(() => {
    if (!isOpen || !countryDetail) return;

    // IMPORTANT: Hanya update satisfaction jika belum ada atau modal baru pertama kali buka
    if (countryDetail.satisfaction?.tax !== undefined) return; // Jangan update lagi jika sudah ada

    const initialSatisfaction = calculateSatisfaction(initialRates);
    setCountryDetail({
      ...countryDetail,
      satisfaction: {
        ...(countryDetail?.satisfaction || {}),
        tax: initialSatisfaction,
      },
    });
  }, [isOpen, countryDetail?.id]); // Only depend on isOpen & countryDetail ID, not initialRates!

  const handleTaxChange = (taxId: string, nextVal: number) => {
    const oldVal = tempRates[taxId] ?? 0;
    const updatedRates = {
      ...tempRates,
      [taxId]: nextVal,
    };
    setTempRates(updatedRates);

    // Update countryDetail dengan nilai baru, indeks kepuasan, dan notifikasi
    const newSatisfaction = calculateSatisfaction(updatedRates);

    let newPendingNotifs: any[] = Array.isArray(countryDetail?.pending_notifications) ? [...countryDetail.pending_notifications] : [];
    if (oldVal !== nextVal) {
      const taxNames: Record<string, string> = {
        vat: "Pajak Pertambahan Nilai (PPN)",
        corporate_tax: "Pajak Korporasi",
        income_tax: "Pajak Penghasilan Pribadi",
        cigarette_tax: "Cukai",
        environment_tax: "Pajak Lingkungan"
      };
      const taxLabel = taxNames[taxId] || taxId;
      const dateStr = countryDetail?.current_date || new Date().toISOString().split('T')[0];
      const notif = generatePajakChangeNotification(taxLabel, oldVal, nextVal, dateStr);
      newPendingNotifs = [notif, ...newPendingNotifs];
    }

    setCountryDetail({
      ...countryDetail,
      pending_notifications: newPendingNotifs,
      income_tax:
        taxId === "income_tax"
          ? nextVal
          : getTaxValue(countryDetail, ["income_tax"], countryDetail?.income_tax ?? 0),
      corporate:
        taxId === "corporate_tax"
          ? nextVal
          : getTaxValue(countryDetail, ["corporate"], countryDetail?.corporate ?? 0),
      ppn:
        taxId === "vat"
          ? nextVal
          : getTaxValue(countryDetail, ["ppn"], countryDetail?.ppn ?? 0),
      cigarette_tax:
        taxId === "cigarette_tax"
          ? nextVal
          : getTaxValue(countryDetail, ["cigarette_tax"], countryDetail?.cigarette_tax ?? 0),
      environment_tax:
        taxId === "environment_tax"
          ? nextVal
          : getTaxValue(countryDetail, ["environment_tax"], countryDetail?.environment_tax ?? 0),
      pajak: {
        ...(countryDetail?.pajak || {}),
        penghasilan:
          taxId === "income_tax"
            ? { ...(countryDetail?.pajak?.penghasilan || {}), tarif: nextVal }
            : countryDetail?.pajak?.penghasilan,
        korporasi:
          taxId === "corporate_tax"
            ? { ...(countryDetail?.pajak?.korporasi || {}), tarif: nextVal }
            : countryDetail?.pajak?.korporasi,
        ppn:
          taxId === "vat"
            ? { ...(countryDetail?.pajak?.ppn || {}), tarif: nextVal }
            : countryDetail?.pajak?.ppn,
        bea_cukai:
          taxId === "cigarette_tax"
            ? { ...(countryDetail?.pajak?.bea_cukai || {}), tarif: nextVal }
            : countryDetail?.pajak?.bea_cukai,
        lingkungan:
          taxId === "environment_tax"
            ? { ...(countryDetail?.pajak?.lingkungan || {}), tarif: nextVal }
            : countryDetail?.pajak?.lingkungan,
      },
      // Simpan indeks kepuasan ke dalam countryDetail (gunakan key 'satisfaction' dengan subkey 'tax')
      satisfaction: {
        ...(countryDetail?.satisfaction || {}),
        tax: newSatisfaction,
      },
    });
  };

  const harmonisasiTaxBonusPercent = getHarmonisasiFiskalGlobalBonusPercent(countryDetail);

  // Hitung total pendapatan dari semua pajak (untuk ditampilkan)
  const baseTotalIncome =
    vatRevenue +
    corporateTaxRevenue +
    personalIncomeTaxRevenue +
    cigaretteTaxRevenue +
    environmentalTaxRevenue;

  const totalIncome = applyHarmonisasiFiskalGlobalTaxRevenueBonus(
    baseTotalIncome,
    countryDetail
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none">
      <div className="bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans pointer-events-auto">
        <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-[#00FFAA]/20 flex items-center justify-between bg-[#0A1A1A] relative z-10 gap-2 shrink-0 rounded-t-2xl">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1 sm:p-1.5 bg-[#0F2424] rounded-lg border border-[#00FFAA]/30 shrink-0">
              <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-[#00FFAA]" />
            </div>
            <div>
              <h2 className="text-base sm:text-xl font-bold text-[#00FFAA] tracking-tight leading-none uppercase">
                Kebijakan Perpajakan Fiskal
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 lg:p-2 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] text-[#6B8A8A] hover:text-[#00FFAA] hover:border-[#00FFAA] transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1 shadow-sm"
          >
            <span className="text-[10px] lg:text-xs font-semibold uppercase tracking-widest pl-1">
              Tutup
            </span>
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-3.5 lg:p-5 2xl:p-8 bg-[#0A1A1A]/80 relative z-10 custom-scrollbar">
          <p className="text-[10px] lg:text-xs text-[#6B8A8A] font-semibold leading-relaxed mb-3.5 lg:mb-5 2xl:mb-6">
            Sesuaikan tarif pajak nasional untuk membiayai belanja militer dan
            infrastruktur publik. Hati-hati, pajak tinggi memicu protes rakyat!
          </p>

          <div className="space-y-5">
            {/* 1. PPN - Pajak Pertambahan Nilai */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-[#00FFAA] uppercase">
                <span>Pajak Pertambahan Nilai (PPN)</span>
                <div className="flex items-center gap-2">
                  <span className="text-[#E0E0E0]">{tempRates.vat}%</span>
                  <span className="text-emerald-400 font-black">
                    ({vatRevenue.toLocaleString(
                      "id-ID"
                    )}{" "} NEO)
                  </span>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={tempRates.vat}
                onChange={(e) =>
                  handleTaxChange("vat", parseInt(e.target.value))
                }
                className="w-full accent-[#00FFAA] cursor-pointer"
              />
              <p className="text-[10px] text-[#6B8A8A]">
                0% = 0 NEO, 100% = 500 NEO income
              </p>
            </div>

            {/* 2. Korporasi - Pajak Korporasi */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-[#00FFAA] uppercase">
                <span>Pajak Korporasi</span>
                <div className="flex items-center gap-2">
                  <span className="text-[#E0E0E0]">{tempRates.corporate_tax}%</span>
                  <span className="text-emerald-400 font-black">
                    ({corporateTaxRevenue.toLocaleString(
                      "id-ID"
                    )}{" "} NEO)
                  </span>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={tempRates.corporate_tax}
                onChange={(e) =>
                  handleTaxChange("corporate_tax", parseInt(e.target.value))
                }
                className="w-full accent-[#00FFAA] cursor-pointer"
              />
              <p className="text-[10px] text-[#6B8A8A]">
                0% = 0 NEO, 100% = 500 NEO income
              </p>
            </div>

            {/* 3. Penghasilan - Pajak Penghasilan Pribadi */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-[#00FFAA] uppercase">
                <span>Pajak Penghasilan Pribadi</span>
                <div className="flex items-center gap-2">
                  <span className="text-[#E0E0E0]">{tempRates.income_tax}%</span>
                  <span className="text-emerald-400 font-black">
                    ({personalIncomeTaxRevenue.toLocaleString(
                      "id-ID"
                    )}{" "} NEO)
                  </span>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={tempRates.income_tax}
                onChange={(e) =>
                  handleTaxChange("income_tax", parseInt(e.target.value))
                }
                className="w-full accent-[#00FFAA] cursor-pointer"
              />
              <p className="text-[10px] text-[#6B8A8A]">
                0% = 0 NEO, 100% = 500 NEO income
              </p>
              {hasOrthodoxTaxBonus && (
                <span className="inline-flex rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-emerald-400">
                  Bonus Kristen Ortodoks: Penerimaan +{ORTHODOX_PERSONAL_INCOME_TAX_REVENUE_BONUS * 100}%
                </span>
              )}
            </div>

            {/* 4. Cukai - Cukai */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-[#00FFAA] uppercase">
                <span>Cukai</span>
                <div className="flex items-center gap-2">
                  <span className="text-[#E0E0E0]">{tempRates.cigarette_tax}%</span>
                  <span className="text-emerald-400 font-black">
                    ({cigaretteTaxRevenue.toLocaleString(
                      "id-ID"
                    )}{" "} NEO)
                  </span>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={tempRates.cigarette_tax}
                onChange={(e) =>
                  handleTaxChange("cigarette_tax", parseInt(e.target.value))
                }
                className="w-full accent-[#00FFAA] cursor-pointer"
              />
              <p className="text-[10px] text-[#6B8A8A]">
                0% = 0 NEO, 100% = 500 NEO income
              </p>
            </div>

            {/* 5. Lingkungan - Pajak Lingkungan */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-[#00FFAA] uppercase">
                <span>Pajak Lingkungan</span>
                <div className="flex items-center gap-2">
                  <span className="text-[#E0E0E0]">{tempRates.environment_tax}%</span>
                  <span className="text-emerald-400 font-black">
                    ({environmentalTaxRevenue.toLocaleString(
                      "id-ID"
                    )}{" "} NEO)
                  </span>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={tempRates.environment_tax}
                onChange={(e) =>
                  handleTaxChange("environment_tax", parseInt(e.target.value))
                }
                className="w-full accent-[#00FFAA] cursor-pointer"
              />
              <p className="text-[10px] text-[#6B8A8A]">
                0% = 0 NEO, 100% = 500 NEO income
              </p>
              {hasBuddhaTaxBonus && (
                <span className="inline-flex rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-emerald-400">
                  Bonus Buddha: Penerimaan pajak lingkungan +{BUDDHA_ENVIRONMENTAL_TAX_REVENUE_BONUS * 100}%
                </span>
              )}
            </div>
          </div>

          {/* Total Income Summary */}
          <div className="mt-8 p-5 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424]">
            <div className="flex justify-between items-center">
              <span className="text-sm font-black text-[#00FFAA] uppercase tracking-widest">
                Total Pendapatan Pajak
              </span>
              <span className="text-2xl font-black text-emerald-400">
                {totalIncome.toLocaleString("id-ID")} NEO
              </span>
            </div>
            {hasDemocracyTaxBonus && (
              <span className="mt-3 inline-flex rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-emerald-400">
                Bonus Demokrasi: seluruh penerimaan pajak +{DEMOCRACY_TAX_REVENUE_BONUS * 100}%
              </span>
            )}
            {hasCapitalismTaxBonus && (
              <span className="mt-3 inline-flex rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-emerald-400">
                Bonus Kapitalisme: seluruh penerimaan pajak +{CAPITALISM_TAX_REVENUE_BONUS * 100}%
              </span>
            )}
            {hasLiberalismTaxBonus && (
              <span className="mt-3 inline-flex rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-emerald-400">
                Bonus Liberalisme: seluruh penerimaan pajak +{LIBERALISM_TAX_REVENUE_BONUS * 100}%
              </span>
            )}
            {hasConservatismTaxBonus && (
              <span className="mt-3 inline-flex rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-emerald-400">
                Bonus Konservatisme: seluruh penerimaan pajak +{CONSERVATISM_TAX_REVENUE_BONUS * 100}%
              </span>
            )}
            {harmonisasiTaxBonusPercent > 0 && (
              <span className="mt-3 inline-flex rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-emerald-400">
                Bonus Harmonisasi Fiskal Global: Seluruh penerimaan pajak +{harmonisasiTaxBonusPercent}%
              </span>
            )}
          </div>

          {/* ---- INDEKS KEPUASAN RAKYAT ---- */}
          <div className="mt-6 p-5 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424]">
            <div className="flex justify-between items-center">
              <span className="text-sm font-black text-[#00FFAA] uppercase tracking-widest">
                Indeks Kepuasan Rakyat (Pajak)
              </span>
              <span className="text-3xl font-black text-amber-400">
                {satisfaction} / 100
              </span>
            </div>
            <div className="w-full h-3 bg-[#0A1A1A] border border-[#00FFAA]/20 rounded-full mt-3 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-200"
                style={{ width: `${satisfaction}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}