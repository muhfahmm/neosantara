"use client";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  useDeferredValue,
} from "react";
import { X, Tag, Loader2 } from "lucide-react";
import NotebookModalWrapper from "../../NotebookModalWrapper";
import { generateHargaChangeNotification } from "@/app/page/menus/inbox/logic/7_notifikasi_ekonomi/2_harga_barang_pokok/hargaChangeLogic";
import { generateDemonstrasiHargaNotification } from "@/app/page/menus/inbox/logic/7_notifikasi_ekonomi/demo_logic/demonstrasiEkonomiLogic";
import { calculatePriceCommodityImpacts } from "@/app/logic/economic_logic/economicPopulationImpact";

// ─────────────────────────────────────────────────────────────────────────
// Helper murni & Pre-computed Constants
// ─────────────────────────────────────────────────────────────────────────
const PRICE_OPTIONS = [10000, 25000, 50000, 75000, 100000].map((val) => ({
  value: val,
  label: val.toLocaleString("id-ID", { maximumFractionDigits: 2 }),
}));

const MIN_PRICE = 10000;
const MAX_PRICE = 100000;
const SUBSIDY_COST = 20_000_000;
const DEBOUNCE_MS = 200;

function calculateSatisfactionFromPrices(
  currentPrices: Record<string, number>,
  subsidized: boolean
): number {
  const entries = Object.entries(currentPrices).filter(([key]) =>
    key.startsWith("harga_")
  );
  if (entries.length === 0) return 50;

  let totalScore = 0;
  for (const [, value] of entries) {
    let score = 100 - ((value - MIN_PRICE) / (MAX_PRICE - MIN_PRICE)) * 100;
    score = Math.min(100, Math.max(0, score));
    totalScore += score;
  }

  let avgScore = totalScore / entries.length;
  if (subsidized) avgScore = Math.min(100, avgScore + 5);
  return Math.round(avgScore);
}

type PendingChange = { key: string; value: number; oldValue: number };

// ─────────────────────────────────────────────────────────────────────────
// 1. MEMOIZED COMPONENT: Hanya me-render ulang kartu yang diklik
// ─────────────────────────────────────────────────────────────────────────
interface CommodityCardProps {
  itemKey: string;
  currentValue: number;
  impact: number;
  onPriceChange: (key: string, val: number) => void;
}

const CommodityCard = React.memo(
  ({ itemKey, currentValue, impact, onPriceChange }: CommodityCardProps) => {
    const formattedName = itemKey
      .replace("harga_", "")
      .replace(/_/g, " ")
      .toUpperCase();
    const formattedValue = currentValue.toLocaleString("id-ID", {
      maximumFractionDigits: 2,
    });

    return (
      <div className="bg-[#0A1A1A] border border-[#00FFAA]/30 rounded-xl p-3 lg:p-4">
        <div className="flex items-center justify-between mb-2.5 lg:mb-3">
          <div>
            <p className="text-xs lg:text-sm font-black text-[#00FFAA] uppercase">
              {formattedName}
            </p>
            <p className="text-[11px] lg:text-xs text-[#6B8A8A]">
              Nilai saat ini:{" "}
              <span className="font-bold text-[#E0E0E0]">
                {formattedValue}
              </span>
            </p>
            <p className="text-[11px] lg:text-xs text-[#6B8A8A] mt-1">
              Dampak populasi:{" "}
              <span className="font-bold text-[#00FFAA]">
                {impact.toFixed(2)}% / bulan
              </span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 lg:gap-2">
          {PRICE_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => onPriceChange(itemKey, option.value)}
              className={`px-2.5 lg:px-3 py-1.5 lg:py-2 rounded-lg border text-[10px] lg:text-xs font-black uppercase transition cursor-pointer ${
                currentValue === option.value
                  ? "bg-[#00FFAA] text-[#0A1A1A] border-[#00FFAA] font-bold"
                  : "bg-[#0F2424] text-[#E0E0E0] border-[#00FFAA]/30 hover:border-[#00FFAA]"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    );
  }
);
CommodityCard.displayName = "CommodityCard";

// ─────────────────────────────────────────────────────────────────────────
// Wrapper — Rules of Hooks fix
// ─────────────────────────────────────────────────────────────────────────
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  countryDetail: any;
  setCountryDetail: React.Dispatch<React.SetStateAction<any>>;
}

export default function HargaModal(props: ModalProps) {
  if (!props.isOpen) return null;
  return (
    <HargaModalContent
      onClose={props.onClose}
      countryDetail={props.countryDetail}
      setCountryDetail={props.setCountryDetail}
    />
  );
}

function HargaModalContent({
  onClose,
  countryDetail,
  setCountryDetail,
}: Omit<ModalProps, "isOpen">) {
  const [, startTransition] = useTransition();

  const [prices, setPrices] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subsidyActive, setSubsidyActive] = useState(false);

  // 2. DEFERRED STATE: Memberikan prioritas utama pada klik tombol.
  // Kalkulasi berat (satisfaction & impacts) akan mengekor di belakang.
  const deferredPrices = useDeferredValue(prices);

  const countryName = String(countryDetail?.country || "");
  const anggaran = Number(countryDetail?.anggaran || 0);

  // ── Refs ──────────────────────────────────────────────────────────────
  const pricesInitializedRef = useRef<string>("");
  const committedPricesRef = useRef<Record<string, number>>({});
  const countryDetailRef = useRef(countryDetail);

  useEffect(() => {
    countryDetailRef.current = countryDetail;
  }, [countryDetail]);

  const pendingRef = useRef<PendingChange[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ─────────────────────────────────────────────────────────────────────
  // Load data harga (1× per negara)
  // ─────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!countryName) return;
    if (pricesInitializedRef.current === countryName) return;
    pricesInitializedRef.current = countryName;

    if (
      countryDetailRef.current?.harga &&
      typeof countryDetailRef.current.harga === "object" &&
      Object.keys(countryDetailRef.current.harga).length > 0
    ) {
      const initial = countryDetailRef.current.harga as Record<string, number>;
      setPrices(initial);
      committedPricesRef.current = initial;
      setSubsidyActive(Boolean(countryDetailRef.current?.subsidyActive));
      return;
    }

    let cancelled = false;
    const loadPrices = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(
          `/api/price-data?country=${encodeURIComponent(countryName)}`
        );
        const data = await res.json();
        if (cancelled) return;

        if (data?.prices) {
          const defaultPrices = data.prices as Record<string, number>;
          setPrices(defaultPrices);
          committedPricesRef.current = defaultPrices;
          startTransition(() => {
            setCountryDetail((prev: any) => {
              if (!prev) return prev;
              return {
                ...prev,
                harga: defaultPrices,
                subsidyActive: false,
              };
            });
          });
        } else {
          setPrices({});
          committedPricesRef.current = {};
        }
      } catch (err) {
        if (cancelled) return;
        console.error("Failed to load price data", err);
        setError("Gagal memuat data harga dari database.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadPrices();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countryName]);

  // ─────────────────────────────────────────────────────────────────────
  // useMemo — Berbasis `deferredPrices` agar UI tidak nge-lag
  // ─────────────────────────────────────────────────────────────────────
  const satisfaction = useMemo(
    () => calculateSatisfactionFromPrices(deferredPrices, subsidyActive),
    [deferredPrices, subsidyActive]
  );

  const commodityImpacts = useMemo(
    () =>
      calculatePriceCommodityImpacts({
        harga: deferredPrices,
        subsidyActive,
      }),
    [deferredPrices, subsidyActive]
  );

  const impactByKey = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of commodityImpacts) {
      map.set(item.key, item.monthlyModifierPercent);
    }
    return map;
  }, [commodityImpacts]);

  const avgCommodityModifier = useMemo(() => {
    if (commodityImpacts.length === 0) return 0;
    const sum = commodityImpacts.reduce(
      (acc, item) => acc + item.monthlyModifierPercent,
      0
    );
    return (sum / commodityImpacts.length) * 0.25;
  }, [commodityImpacts]);

  const priceEntries = useMemo(
    () => Object.entries(prices).filter(([key]) => key.startsWith("harga_")),
    [prices]
  );

  // ─────────────────────────────────────────────────────────────────────
  // Flush (Menggabungkan pending changes & commit via startTransition)
  // ─────────────────────────────────────────────────────────────────────
  const flushPending = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }

    const batch = pendingRef.current;
    if (batch.length === 0) return;
    pendingRef.current = [];

    const next = { ...committedPricesRef.current };
    const notifs: any[] = [];
    const dateStr =
      countryDetailRef.current?.current_date ||
      new Date().toISOString().split("T")[0];
    const isSubsidy = Boolean(countryDetailRef.current?.subsidyActive);

    for (const { key, value, oldValue } of batch) {
      next[key] = value;

      const formatted = key
        .replace("harga_", "")
        .replace(/_/g, " ")
        .toUpperCase();

      notifs.push(
        generateHargaChangeNotification(formatted, oldValue, value, dateStr)
      );

      if (value > oldValue) {
        const oldIndex = PRICE_OPTIONS.findIndex((o) => o.value === oldValue);
        const newIndex = PRICE_OPTIONS.findIndex((o) => o.value === value);
        const levelJump =
          oldIndex !== -1 && newIndex !== -1
            ? newIndex - oldIndex
            : value >= oldValue * 2
              ? 3
              : 1;
        const demoChance = levelJump >= 3 ? 0.8 : 0.4;
        if (Math.random() < demoChance) {
          notifs.unshift(
            generateDemonstrasiHargaNotification(
              formatted,
              oldValue,
              value,
              levelJump,
              dateStr
            )
          );
        }
      }
    }

    committedPricesRef.current = next;
    const newSat = calculateSatisfactionFromPrices(next, isSubsidy);

    startTransition(() => {
      setCountryDetail((prev: any) => {
        if (!prev) return prev;
        const existing: any[] = Array.isArray(prev.pending_notifications)
          ? [...prev.pending_notifications]
          : [];
        return {
          ...prev,
          harga: next,
          pending_notifications: [...notifs, ...existing],
          ...(next.harga_beras !== undefined
            ? { price_rice: next.harga_beras }
            : {}),
          ...(next.harga_minyak_goreng !== undefined
            ? { price_fuel: next.harga_minyak_goreng }
            : {}),
          satisfaction: {
            ...(prev.satisfaction || {}),
            price: newSat,
          },
        };
      });
    });
  }, [setCountryDetail]);

  // ─────────────────────────────────────────────────────────────────────
  // Cleanup (Flush on unmount)
  // ─────────────────────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
      const batch = pendingRef.current;
      if (batch.length === 0) return;
      pendingRef.current = [];

      const next = { ...committedPricesRef.current };
      const notifs: any[] = [];
      const dateStr =
        countryDetailRef.current?.current_date ||
        new Date().toISOString().split("T")[0];
      const isSubsidy = Boolean(countryDetailRef.current?.subsidyActive);

      for (const { key, value, oldValue } of batch) {
        next[key] = value;
        const formatted = key
          .replace("harga_", "")
          .replace(/_/g, " ")
          .toUpperCase();
        notifs.push(
          generateHargaChangeNotification(formatted, oldValue, value, dateStr)
        );
      }

      committedPricesRef.current = next;
      const newSat = calculateSatisfactionFromPrices(next, isSubsidy);

      // on unmount, do sync update
      setCountryDetail((prev: any) => {
        if (!prev) return prev;
        const existing: any[] = Array.isArray(prev.pending_notifications)
          ? [...prev.pending_notifications]
          : [];
        return {
          ...prev,
          harga: next,
          pending_notifications: [...notifs, ...existing],
          ...(next.harga_beras !== undefined
            ? { price_rice: next.harga_beras }
            : {}),
          ...(next.harga_minyak_goreng !== undefined
            ? { price_fuel: next.harga_minyak_goreng }
            : {}),
          satisfaction: {
            ...(prev.satisfaction || {}),
            price: newSat,
          },
        };
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─────────────────────────────────────────────────────────────────────
  // Handlers
  // ─────────────────────────────────────────────────────────────────────
  const handlePriceChange = useCallback(
    (key: string, value: number) => {
      const committed = committedPricesRef.current;
      const oldValue = committed[key] ?? value;
      if (oldValue === value) return;

      // Update UI secara instan
      setPrices((prev) =>
        prev[key] === value ? prev : { ...prev, [key]: value }
      );

      pendingRef.current.push({ key, value, oldValue });

      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(flushPending, DEBOUNCE_MS);
    },
    [flushPending]
  );

  const handleSubsidize = useCallback(() => {
    if (!setCountryDetail) return;
    if (Number(countryDetailRef.current?.anggaran || 0) < SUBSIDY_COST) return;

    flushPending();
    setSubsidyActive(true);

    const newSat = calculateSatisfactionFromPrices(
      committedPricesRef.current,
      true
    );

    startTransition(() => {
      setCountryDetail((prev: any) => {
        if (!prev) return prev;
        const prevAnggaran = Number(prev.anggaran || 0);
        if (prevAnggaran < SUBSIDY_COST) return prev;
        const prevKepuasan = Number(prev.kepuasan || 65);
        const newKepuasan = Math.min(100, prevKepuasan + 5.0);
        return {
          ...prev,
          anggaran: prevAnggaran - SUBSIDY_COST,
          kepuasan: newKepuasan,
          subsidyActive: true,
          satisfaction: {
            ...(prev.satisfaction || {}),
            price: newSat,
          },
        };
      });
    });
  }, [flushPending, setCountryDetail]);

  // ─────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────
  return (
    <NotebookModalWrapper onClose={onClose}>
      <div className="flex flex-col h-full overflow-hidden">
        <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-[#00FFAA]/20 flex items-center justify-between bg-[#0A1A1A] relative z-10 gap-2 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1 sm:p-1.5 bg-[#0F2424] rounded-lg border border-[#00FFAA]/30 shrink-0">
              <Tag className="h-4 w-4 sm:h-5 sm:w-5 text-[#00FFAA]" />
            </div>
            <div>
              <h2 className="text-base sm:text-xl font-bold text-[#00FFAA] tracking-tight leading-none uppercase">
                Kontrol Harga Barang Pokok
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

        <div className="flex-1 overflow-y-auto p-4 lg:p-6 bg-[#0F2424] relative z-10 custom-scrollbar">
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-[#00FFAA] mb-6">
              <Loader2 className="h-4 w-4 animate-spin text-[#00FFAA]" />
              Memuat data harga negara...
            </div>
          ) : null}

          {error ? <p className="text-sm text-rose-400 mb-4">{error}</p> : null}

          <div className="space-y-3 lg:space-y-4 mb-4 lg:mb-6">
            {priceEntries.length === 0 ? (
              <p className="text-sm text-[#6B8A8A]">
                Belum ada data harga yang tersedia untuk negara ini.
              </p>
            ) : (
              priceEntries.map(([key, value]) => (
                <CommodityCard
                  key={key}
                  itemKey={key}
                  currentValue={value}
                  impact={impactByKey.get(key) ?? 0}
                  onPriceChange={handlePriceChange}
                />
              ))
            )}
          </div>

          {/* Tombol Subsidi */}
          <button
            onClick={handleSubsidize}
            disabled={anggaran < SUBSIDY_COST || subsidyActive}
            className={`w-full mt-2 mb-4 py-2.5 rounded-xl border font-black text-xs uppercase tracking-wider transition cursor-pointer ${
              subsidyActive
                ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300 cursor-not-allowed"
                : anggaran < SUBSIDY_COST
                  ? "bg-[#0F2424] border-[#00FFAA]/20 text-[#6B8A8A] cursor-not-allowed"
                  : "bg-[#00FFAA]/15 border-[#00FFAA]/50 text-[#00FFAA] hover:bg-[#00FFAA]/25"
            }`}
          >
            {subsidyActive
              ? "Subsidi Harga Aktif"
              : `Aktifkan Subsidi Harga (-${SUBSIDY_COST.toLocaleString(
                  "id-ID"
                )} NEO)`}
          </button>

          {/* ---- INDEKS KEPUASAN RAKYAT (HARGA) ---- */}
          <div className="mt-4 lg:mt-6 p-4 lg:p-5 rounded-xl border border-[#00FFAA]/30 bg-[#0A1A1A]">
            <div className="flex justify-between items-center">
              <span className="text-[11px] lg:text-xs font-black text-[#00FFAA] uppercase tracking-widest">
                Indeks Kepuasan Rakyat (Harga Pokok)
              </span>
              <span className="text-xl lg:text-2xl font-black text-[#00FFAA]">
                {satisfaction} / 100
              </span>
            </div>
            <div className="w-full h-2.5 lg:h-3 bg-[#0F2424] border border-[#00FFAA]/20 rounded-full mt-2.5 lg:mt-3 overflow-hidden">
              <div
                className="h-full rounded-full bg-[#00FFAA] transition-all duration-200"
                style={{ width: `${satisfaction}%` }}
              />
            </div>
            {commodityImpacts.length > 0 && (
              <p
                className={`mt-3 text-center text-xs font-bold ${
                  avgCommodityModifier >= 0
                    ? "text-[#00FFAA]"
                    : "text-rose-400"
                }`}
              >
                Dampak populasi harga pokok:{" "}
                {avgCommodityModifier >= 0 ? "+" : ""}
                {avgCommodityModifier.toFixed(2)}% / bulan
              </p>
            )}
          </div>
        </div>
      </div>
    </NotebookModalWrapper>
  );
}