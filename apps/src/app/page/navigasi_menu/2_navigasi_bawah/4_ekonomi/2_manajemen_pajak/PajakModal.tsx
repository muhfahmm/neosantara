"use client";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { X, FileText } from "lucide-react";
import NotebookModalWrapper from "../../NotebookModalWrapper";
import { calculateIncomeAtRate } from "@/app/logic/economic_logic/2_tax_logic/taxLogic";
import { calculateTaxPopulationImpact } from "@/app/logic/economic_logic/2_tax_logic/taxPopulationImpact";
import { generatePajakChangeNotification } from "@/app/page/menus/inbox/logic/7_notifikasi_ekonomi/1_perubahan_pajak/pajakChangeLogic";
import { generateDemonstrasiPajakNotification } from "@/app/page/menus/inbox/logic/7_notifikasi_ekonomi/demo_logic/demonstrasiEkonomiLogic";
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
  getKementerianKeuanganTaxRevenueBonusPercent,
  applyKementerianKeuanganTaxRevenueBonus,
} from "@/app/page/bonus_logic";
import { getActiveSectorImpacts } from "@/app/page/navigasi_menu/2_navigasi_bawah/9_kementrian/1_pemberantasan_korupsi/logic/corruptionLogic";
import { calculateTaxSatisfaction } from "@/app/logic/kepuasanCalculator";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  countryDetail: any;
  setCountryDetail: React.Dispatch<React.SetStateAction<any>>;
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

/**
 * Hitung tarif pajak awal dari countryDetail.
 * Dipakai untuk inisialisasi state lokal dan reset ketika negara berganti.
 * Fungsi ini murni (pure) — tidak tergantung pada state komponen.
 */
const computeInitialRates = (cd: any): Record<string, number> => ({
  income_tax: Number(
    getTaxValue(cd, ["income_tax"]) ??
    getTaxValue(cd, ["pajak", "penghasilan", "tarif"]) ??
    0
  ),
  corporate_tax: Number(
    getTaxValue(cd, ["corporate"]) ??
    getTaxValue(cd, ["pajak", "korporasi", "tarif"]) ??
    0
  ),
  vat: Number(
    getTaxValue(cd, ["ppn"]) ??
    getTaxValue(cd, ["pajak", "ppn", "tarif"]) ??
    0
  ),
  cigarette_tax: Number(
    getTaxValue(cd, ["cigarette_tax"]) ??
    getTaxValue(cd, ["pajak", "bea_cukai", "tarif"]) ??
    0
  ),
  environment_tax: Number(
    getTaxValue(cd, ["environment_tax"]) ??
    getTaxValue(cd, ["pajak", "lingkungan", "tarif"]) ??
    0
  ),
});

const TAX_NAME_LABEL: Record<string, string> = {
  vat: "Pajak Pertambahan Nilai (PPN)",
  corporate_tax: "Pajak Korporasi",
  income_tax: "Pajak Penghasilan Pribadi",
  cigarette_tax: "Cukai",
  environment_tax: "Pajak Lingkungan",
};

// ─────────────────────────────────────────────────────────────────────────
// Wrapper: memindahkan early-return `if (!isOpen) return null` KE LUAR
// komponen yang memiliki hooks. Ini memperbaiki pelanggaran Rules of Hooks
// (dulu hooks dipanggil SETELAH early return — bisa bikin crash "Rendered
// more hooks than during the previous render").
// ─────────────────────────────────────────────────────────────────────────
export default function PajakModal(props: ModalProps) {
  if (!props.isOpen) return null;
  return (
    <PajakModalContent
      onClose={props.onClose}
      countryDetail={props.countryDetail}
      setCountryDetail={props.setCountryDetail}
    />
  );
}

function PajakModalContent({
  onClose,
  countryDetail,
  setCountryDetail,
}: Omit<ModalProps, "isOpen">) {
  // Identitas negara — untuk deteksi ganti negara tanpa memicu re-init
  // setiap kali countryDetail berubah (NPC sim, kepuasan auto-refresh, dll.).
  const countryKey = String(
    countryDetail?.id ??
    countryDetail?.country ??
    countryDetail?.nama_negara ??
    countryDetail?.name ??
    ""
  );

  // ── State lokal (preview) — murah, hanya update UI saat drag ──
  const [tempRates, setTempRates] = useState<Record<string, number>>(() =>
    computeInitialRates(countryDetail)
  );

  // ── Nilai "committed" terakhir — untuk dedupe notifikasi saat release ──
  const committedRatesRef = useRef<Record<string, number>>(
    computeInitialRates(countryDetail)
  );
  const lastCountryKeyRef = useRef<string>(countryKey);

  // ─────────────────────────────────────────────────────────────────────
  // FIX #3: Reset `tempRates` HANYA ketika negara berganti.
  // Effect lama punya `countryDetail?.income_tax` dkk. di dep array sehingga
  // setiap commit → effect fire → setTempRates(initialRates) → feedback loop
  // 2–3× render per tick slider.
  // ─────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (lastCountryKeyRef.current === countryKey) return;
    lastCountryKeyRef.current = countryKey;
    const initial = computeInitialRates(countryDetail);
    setTempRates(initial);
    committedRatesRef.current = initial;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countryKey]);

  // ─────────────────────────────────────────────────────────────────────
  // Initialize `satisfaction.tax` saat pertama kali modal dibuka atau
  // negara berganti (jika belum ada nilainya).
  // ─────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!countryDetail) return;
    if (countryDetail.satisfaction?.tax !== undefined) return;

    const initial = computeInitialRates(countryDetail);
    const initialSatisfaction = calculateTaxSatisfaction(countryDetail, initial);

    setCountryDetail((prev: any) => {
      if (!prev) return prev;
      // Guard di dalam updater: state bisa berubah di antara effect run & commit
      if (prev.satisfaction?.tax !== undefined) return prev;
      return {
        ...prev,
        satisfaction: {
          ...(prev.satisfaction || {}),
          tax: initialSatisfaction,
        },
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countryKey]);

  // ─────────────────────────────────────────────────────────────────────
  // FIX #1: Preview — hanya update state lokal. Dipanggil 60×/detik saat drag.
  // Murah: shallow clone objek kecil, tidak menyentuh countryDetail global.
  // ─────────────────────────────────────────────────────────────────────
  const handleTaxPreview = useCallback((taxId: string, nextVal: number) => {
    setTempRates((prev) =>
      prev[taxId] === nextVal ? prev : { ...prev, [taxId]: nextVal }
    );
  }, []);

  // ─────────────────────────────────────────────────────────────────────
  // FIX #1 + #6: Commit — dipanggil SEKALI saat user melepas slider.
  // Menyentuh countryDetail global + generate TEPAT SATU notifikasi (dari
  // committedRatesRef → nextVal), bukan puluhan notifikasi per tick.
  // ─────────────────────────────────────────────────────────────────────
  const handleTaxCommit = useCallback(
    (taxId: string, nextVal: number) => {
      if (!setCountryDetail) return;

      const oldVal = committedRatesRef.current[taxId] ?? 0;
      if (oldVal === nextVal) return; // tidak berubah — skip

      // Update committed ref DULU agar commit berikutnya memakai baseline
      // yang benar (meskipun React belum sempat commit countryDetail).
      const nextCommitted = { ...committedRatesRef.current, [taxId]: nextVal };
      committedRatesRef.current = nextCommitted;

      const taxLabel = TAX_NAME_LABEL[taxId] || taxId;
      const dateStr =
        countryDetail?.current_date || new Date().toISOString().split("T")[0];

      setCountryDetail((prev: any) => {
        const current = prev || countryDetail || {};

        // Notifikasi: satu untuk perubahan tarif
        const existingNotifs: any[] = Array.isArray(current.pending_notifications)
          ? [...current.pending_notifications]
          : [];

        const notif = generatePajakChangeNotification(
          taxLabel,
          oldVal,
          nextVal,
          dateStr
        );
        let newPendingNotifs: any[] = [notif, ...existingNotifs];

        // Notifikasi demo hanya jika kenaikan ekstrem ≥ 10 poin
        const diff = nextVal - oldVal;
        if (diff >= 10 && Math.random() < 0.8) {
          const countryPop = Number(current?.jumlah_penduduk || current?.populasi || 50000000);
          const demoNotif = generateDemonstrasiPajakNotification(
            taxLabel,
            oldVal,
            nextVal,
            diff,
            dateStr,
            countryPop
          );
          newPendingNotifs.unshift(demoNotif);
        }

        // FIX #5: hitung satisfaction SEKALI dengan `current` + `nextCommitted`
        // (bukan 2× dengan tempRates lalu updatedRates seperti sebelumnya).
        const newSatisfaction = calculateTaxSatisfaction(current, nextCommitted);

        return {
          ...current,
          pending_notifications: newPendingNotifs,
          income_tax:
            taxId === "income_tax"
              ? nextVal
              : getTaxValue(current, ["income_tax"], current?.income_tax ?? 0),
          corporate:
            taxId === "corporate_tax"
              ? nextVal
              : getTaxValue(current, ["corporate"], current?.corporate ?? 0),
          ppn:
            taxId === "vat"
              ? nextVal
              : getTaxValue(current, ["ppn"], current?.ppn ?? 0),
          cigarette_tax:
            taxId === "cigarette_tax"
              ? nextVal
              : getTaxValue(current, ["cigarette_tax"], current?.cigarette_tax ?? 0),
          environment_tax:
            taxId === "environment_tax"
              ? nextVal
              : getTaxValue(current, ["environment_tax"], current?.environment_tax ?? 0),
          pajak: {
            ...(current?.pajak || {}),
            penghasilan:
              taxId === "income_tax"
                ? { ...(current?.pajak?.penghasilan || {}), tarif: nextVal }
                : current?.pajak?.penghasilan,
            korporasi:
              taxId === "corporate_tax"
                ? { ...(current?.pajak?.korporasi || {}), tarif: nextVal }
                : current?.pajak?.korporasi,
            ppn:
              taxId === "vat"
                ? { ...(current?.pajak?.ppn || {}), tarif: nextVal }
                : current?.pajak?.ppn,
            bea_cukai:
              taxId === "cigarette_tax"
                ? { ...(current?.pajak?.bea_cukai || {}), tarif: nextVal }
                : current?.pajak?.bea_cukai,
            lingkungan:
              taxId === "environment_tax"
                ? { ...(current?.pajak?.lingkungan || {}), tarif: nextVal }
                : current?.pajak?.lingkungan,
          },
          satisfaction: {
            ...(current?.satisfaction || {}),
            tax: newSatisfaction,
          },
        };
      });
    },
    [countryDetail, setCountryDetail]
  );

  // ─────────────────────────────────────────────────────────────────────
  // FIX #4: useMemo — kalkulasi berat tidak dihitung ulang saat countryDetail
  // berubah karena alasan non-relevan (NPC sim, notifikasi, dll.).
  // ─────────────────────────────────────────────────────────────────────

  const satisfaction = useMemo(
    () => calculateTaxSatisfaction(countryDetail, tempRates),
    [countryDetail, tempRates]
  );

  const taxPopulationImpact = useMemo(
    () => calculateTaxPopulationImpact(countryDetail, tempRates),
    [countryDetail, tempRates]
  );
  const populationTaxModifier = taxPopulationImpact.monthlyModifierPercent * 0.25;

  const ideology = String(countryDetail?.ideology || "").trim().toLowerCase();
  const religion = String(countryDetail?.religion || "").trim().toLowerCase();
  const hasDemocracyTaxBonus = ideology === "demokrasi";
  const hasCapitalismTaxBonus = ideology === "kapitalisme";
  const hasLiberalismTaxBonus = ideology === "liberalisme";
  const hasConservatismTaxBonus = ideology === "konservatisme";
  const hasOrthodoxTaxBonus = religion === "kristen ortodoks";
  const hasBuddhaTaxBonus = religion === "buddha";

  const revenues = useMemo(() => {
    const vat = applyIdeologyTaxBonus(
      calculateIncomeAtRate(tempRates.vat, 500),
      countryDetail?.ideology
    );
    const corporate = applyIdeologyTaxBonus(
      calculateIncomeAtRate(tempRates.corporate_tax, 500),
      countryDetail?.ideology
    );
    const personal = applyIdeologyTaxBonus(
      applyOrthodoxPersonalIncomeTaxRevenueBonus(
        calculateIncomeAtRate(tempRates.income_tax, 500),
        countryDetail?.religion
      ),
      countryDetail?.ideology
    );
    const cigarette = applyIdeologyTaxBonus(
      calculateIncomeAtRate(tempRates.cigarette_tax, 500),
      countryDetail?.ideology
    );
    const environmental = applyIdeologyTaxBonus(
      applyBuddhaEnvironmentalTaxRevenueBonus(
        calculateIncomeAtRate(tempRates.environment_tax, 500),
        countryDetail?.religion
      ),
      countryDetail?.ideology
    );
    return { vat, corporate, personal, cigarette, environmental };
  }, [tempRates, countryDetail?.ideology, countryDetail?.religion]);

  const {
    vat: vatRevenue,
    corporate: corporateTaxRevenue,
    personal: personalIncomeTaxRevenue,
    cigarette: cigaretteTaxRevenue,
    environmental: environmentalTaxRevenue,
  } = revenues;

  const harmonisasiTaxBonusPercent = useMemo(
    () => getHarmonisasiFiskalGlobalBonusPercent(countryDetail),
    [countryDetail]
  );
  const kemenkeuTaxBonusPercent = useMemo(
    () => getKementerianKeuanganTaxRevenueBonusPercent(countryDetail),
    [countryDetail]
  );

  const corruptionImpacts = useMemo(
    () => getActiveSectorImpacts(countryDetail),
    [countryDetail]
  );

  const baseTotalIncome =
    vatRevenue +
    corporateTaxRevenue +
    personalIncomeTaxRevenue +
    cigaretteTaxRevenue +
    environmentalTaxRevenue;

  const totalIncomeWithHarmonisasi = useMemo(
    () =>
      applyHarmonisasiFiskalGlobalTaxRevenueBonus(
        baseTotalIncome * (1 - corruptionImpacts.taxRevenueLossPercent / 100),
        countryDetail
      ),
    [baseTotalIncome, corruptionImpacts.taxRevenueLossPercent, countryDetail]
  );

  const totalIncome = useMemo(
    () =>
      Math.round(
        applyKementerianKeuanganTaxRevenueBonus(
          totalIncomeWithHarmonisasi,
          countryDetail
        )
      ),
    [totalIncomeWithHarmonisasi, countryDetail]
  );

  const hasKemenkeuBonus = kemenkeuTaxBonusPercent > 0;
  const kemenkeuBonusAmount = Math.max(
    0,
    totalIncome - Math.round(totalIncomeWithHarmonisasi)
  );

  // ─────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────
  return (
    <NotebookModalWrapper onClose={onClose}>
      <div className="flex flex-col h-full overflow-hidden">
        <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-[#00FFAA]/20 flex items-center justify-between bg-[#0A1A1A] relative z-10 gap-2 shrink-0">
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

        {corruptionImpacts.taxRevenueLossPercent > 0 && (
          <div className="mx-4 mt-3 rounded-xl border border-rose-500/25 bg-rose-950/20 px-4 py-3 text-xs text-rose-200 sm:mx-6">
            Kebocoran pajak dari kasus korupsi aktif mengurangi estimasi
            penerimaan sebesar {corruptionImpacts.taxRevenueLossPercent}%.
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-3.5 lg:p-5 2xl:p-8 bg-[#0A1A1A]/80 relative z-10 neon-scrollbar">
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
                    ({vatRevenue.toLocaleString("id-ID")} NEO)
                  </span>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={tempRates.vat}
                onChange={(e) =>
                  handleTaxPreview("vat", parseInt(e.target.value))
                }
                onPointerUp={(e) =>
                  handleTaxCommit(
                    "vat",
                    parseInt((e.target as HTMLInputElement).value)
                  )
                }
                onKeyUp={(e) =>
                  handleTaxCommit(
                    "vat",
                    parseInt((e.target as HTMLInputElement).value)
                  )
                }
                onBlur={(e) =>
                  handleTaxCommit(
                    "vat",
                    parseInt((e.target as HTMLInputElement).value)
                  )
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
                  <span className="text-[#E0E0E0]">
                    {tempRates.corporate_tax}%
                  </span>
                  <span className="text-emerald-400 font-black">
                    ({corporateTaxRevenue.toLocaleString("id-ID")} NEO)
                  </span>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={tempRates.corporate_tax}
                onChange={(e) =>
                  handleTaxPreview("corporate_tax", parseInt(e.target.value))
                }
                onPointerUp={(e) =>
                  handleTaxCommit(
                    "corporate_tax",
                    parseInt((e.target as HTMLInputElement).value)
                  )
                }
                onKeyUp={(e) =>
                  handleTaxCommit(
                    "corporate_tax",
                    parseInt((e.target as HTMLInputElement).value)
                  )
                }
                onBlur={(e) =>
                  handleTaxCommit(
                    "corporate_tax",
                    parseInt((e.target as HTMLInputElement).value)
                  )
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
                    ({personalIncomeTaxRevenue.toLocaleString("id-ID")} NEO)
                  </span>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={tempRates.income_tax}
                onChange={(e) =>
                  handleTaxPreview("income_tax", parseInt(e.target.value))
                }
                onPointerUp={(e) =>
                  handleTaxCommit(
                    "income_tax",
                    parseInt((e.target as HTMLInputElement).value)
                  )
                }
                onKeyUp={(e) =>
                  handleTaxCommit(
                    "income_tax",
                    parseInt((e.target as HTMLInputElement).value)
                  )
                }
                onBlur={(e) =>
                  handleTaxCommit(
                    "income_tax",
                    parseInt((e.target as HTMLInputElement).value)
                  )
                }
                className="w-full accent-[#00FFAA] cursor-pointer"
              />
              <p className="text-[10px] text-[#6B8A8A]">
                0% = 0 NEO, 100% = 500 NEO income
              </p>
              {hasOrthodoxTaxBonus && (
                <span className="inline-flex rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-emerald-400">
                  Bonus Kristen Ortodoks: Penerimaan +
                  {ORTHODOX_PERSONAL_INCOME_TAX_REVENUE_BONUS * 100}%
                </span>
              )}
            </div>

            {/* 4. Cukai - Cukai */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-[#00FFAA] uppercase">
                <span>Cukai</span>
                <div className="flex items-center gap-2">
                  <span className="text-[#E0E0E0]">
                    {tempRates.cigarette_tax}%
                  </span>
                  <span className="text-emerald-400 font-black">
                    ({cigaretteTaxRevenue.toLocaleString("id-ID")} NEO)
                  </span>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={tempRates.cigarette_tax}
                onChange={(e) =>
                  handleTaxPreview("cigarette_tax", parseInt(e.target.value))
                }
                onPointerUp={(e) =>
                  handleTaxCommit(
                    "cigarette_tax",
                    parseInt((e.target as HTMLInputElement).value)
                  )
                }
                onKeyUp={(e) =>
                  handleTaxCommit(
                    "cigarette_tax",
                    parseInt((e.target as HTMLInputElement).value)
                  )
                }
                onBlur={(e) =>
                  handleTaxCommit(
                    "cigarette_tax",
                    parseInt((e.target as HTMLInputElement).value)
                  )
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
                  <span className="text-[#E0E0E0]">
                    {tempRates.environment_tax}%
                  </span>
                  <span className="text-emerald-400 font-black">
                    ({environmentalTaxRevenue.toLocaleString("id-ID")} NEO)
                  </span>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={tempRates.environment_tax}
                onChange={(e) =>
                  handleTaxPreview("environment_tax", parseInt(e.target.value))
                }
                onPointerUp={(e) =>
                  handleTaxCommit(
                    "environment_tax",
                    parseInt((e.target as HTMLInputElement).value)
                  )
                }
                onKeyUp={(e) =>
                  handleTaxCommit(
                    "environment_tax",
                    parseInt((e.target as HTMLInputElement).value)
                  )
                }
                onBlur={(e) =>
                  handleTaxCommit(
                    "environment_tax",
                    parseInt((e.target as HTMLInputElement).value)
                  )
                }
                className="w-full accent-[#00FFAA] cursor-pointer"
              />
              <p className="text-[10px] text-[#6B8A8A]">
                0% = 0 NEO, 100% = 500 NEO income
              </p>
              {hasBuddhaTaxBonus && (
                <span className="inline-flex rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-emerald-400">
                  Bonus Buddha: Penerimaan pajak lingkungan +
                  {BUDDHA_ENVIRONMENTAL_TAX_REVENUE_BONUS * 100}%
                </span>
              )}
            </div>
          </div>

          {/* Total Income Summary */}
          <div className="mt-8 p-5 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424]">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <span className="text-sm font-black text-[#00FFAA] uppercase tracking-widest flex items-center gap-1.5">
                Total Pendapatan Pajak
                {hasKemenkeuBonus && (
                  <span className="text-xs font-black text-[#00FFAA] normal-case">
                    + bonus ({kemenkeuTaxBonusPercent}%) =
                  </span>
                )}
              </span>
              <div className="flex items-center gap-2">
                {hasKemenkeuBonus && (
                  <span className="text-base font-bold text-rose-400 line-through opacity-80">
                    {Math.round(totalIncomeWithHarmonisasi).toLocaleString(
                      "id-ID",
                      { maximumFractionDigits: 2 }
                    )}
                  </span>
                )}
                <span className="text-2xl font-black text-emerald-400">
                  {totalIncome.toLocaleString("id-ID", {
                    maximumFractionDigits: 2,
                  })}{" "}
                  NEO
                </span>
              </div>
            </div>
            {hasKemenkeuBonus && (
              <span className="mt-3 inline-flex rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-emerald-400">
                Bonus Kementerian Keuangan: Seluruh penerimaan pajak +
                {kemenkeuTaxBonusPercent}% (+
                {kemenkeuBonusAmount.toLocaleString("id-ID", {
                  maximumFractionDigits: 2,
                })}{" "}
                NEO)
              </span>
            )}
            {hasDemocracyTaxBonus && (
              <span className="mt-3 inline-flex rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-emerald-400">
                Bonus Demokrasi: seluruh penerimaan pajak +
                {DEMOCRACY_TAX_REVENUE_BONUS * 100}%
              </span>
            )}
            {hasCapitalismTaxBonus && (
              <span className="mt-3 inline-flex rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-emerald-400">
                Bonus Kapitalisme: seluruh penerimaan pajak +
                {CAPITALISM_TAX_REVENUE_BONUS * 100}%
              </span>
            )}
            {hasLiberalismTaxBonus && (
              <span className="mt-3 inline-flex rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-emerald-400">
                Bonus Liberalisme: seluruh penerimaan pajak +
                {LIBERALISM_TAX_REVENUE_BONUS * 100}%
              </span>
            )}
            {hasConservatismTaxBonus && (
              <span className="mt-3 inline-flex rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-emerald-400">
                Bonus Konservatisme: seluruh penerimaan pajak +
                {CONSERVATISM_TAX_REVENUE_BONUS * 100}%
              </span>
            )}
            {harmonisasiTaxBonusPercent > 0 && (
              <span className="mt-3 inline-flex rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-emerald-400">
                Bonus Harmonisasi Fiskal Global: Seluruh penerimaan pajak +
                {harmonisasiTaxBonusPercent}%
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

          <p
            className={`mt-3 text-center text-xs font-bold ${
              populationTaxModifier >= 0 ? "text-[#00FFAA]" : "text-rose-400"
            }`}
          >
            Dampak populasi pajak: {populationTaxModifier >= 0 ? "+" : ""}
            {populationTaxModifier.toFixed(2)}% / bulan
          </p>
        </div>
      </div>
    </NotebookModalWrapper>
  );
}