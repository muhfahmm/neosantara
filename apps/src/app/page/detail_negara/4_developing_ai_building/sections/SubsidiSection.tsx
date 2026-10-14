"use client";

import React, { useMemo, useState } from "react";
import {
  HandHelping,
  TrendingDown,
  DollarSign,
  Heart,
  CheckCircle,
  XCircle,
  Search,
} from "lucide-react";
import {
  INITIAL_SUBSIDY_ITEMS,
  SubsidyItem,
  calculateSubsidySummary,
  formatCurrencyCompact,
  clampSubsidyCost,
} from "@/../../json/database_kebijakan_subsidi/index";
import { calculateSubsidySatisfaction } from "@/app/logic/kepuasanCalculator";

interface SubsidiSectionProps {
  countryDetail: Record<string, any> | null;
}

const formatNumber = (val: unknown): string => {
  const num = Number(val ?? 0);
  return Number.isFinite(num) ? num.toLocaleString("id-ID", { maximumFractionDigits: 2 }) : "0";
};

export default function SubsidiSection({ countryDetail }: SubsidiSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("Semua");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [dbSubsidyStates, setDbSubsidyStates] = useState<Record<string, boolean> | null>(null);

  // Fetch data subsidi negara dari /api/country-data jika belum ada di countryDetail
  React.useEffect(() => {
    if (countryDetail?.subsidy_states && Object.keys(countryDetail.subsidy_states).length > 0) {
      setDbSubsidyStates(null);
      return;
    }

    const slug = countryDetail?.country_slug || countryDetail?.slug;
    const countryName = countryDetail?.country || countryDetail?.nama_negara || countryDetail?.name_id || countryDetail?.name_en;
    if (!slug && !countryName) return;

    let isMounted = true;
    const pathQuery = slug ? `${encodeURIComponent(slug)}.ts` : `${encodeURIComponent(countryName)}.ts`;
    fetch(`/api/country-data?path=${pathQuery}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isMounted || !data || data.error || !data.subsidy_states) return;
        setDbSubsidyStates(data.subsidy_states);
      })
      .catch((err) => {
        console.error("Gagal mengambil data subsidi negara:", err);
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
    countryDetail?.subsidy_states,
  ]);

  // Resolusi status subsidi negara
  const subsidyItems = useMemo<SubsidyItem[]>(() => {
    const subsidyStates = (countryDetail?.subsidy_states || dbSubsidyStates) as Record<string, boolean> | undefined;

    return INITIAL_SUBSIDY_ITEMS.map((item) => ({
      ...item,
      budgetCost: clampSubsidyCost(item.budgetCost),
      isSubsidized: subsidyStates && subsidyStates[item.id] !== undefined
        ? Boolean(subsidyStates[item.id])
        : item.isSubsidized,
    }));
  }, [countryDetail, dbSubsidyStates]);

  const summary = useMemo(() => {
    return calculateSubsidySummary(subsidyItems);
  }, [subsidyItems]);

  const satisfactionBonus = useMemo(() => {
    return calculateSubsidySatisfaction(subsidyItems);
  }, [subsidyItems]);

  const categories = useMemo(() => {
    const setCats = new Set(subsidyItems.map((i) => i.category));
    return ["Semua", ...Array.from(setCats)];
  }, [subsidyItems]);

  const filteredItems = useMemo(() => {
    return subsidyItems.filter((item) => {
      const matchCat = selectedCategory === "Semua" || item.category === selectedCategory;
      const matchQuery =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [subsidyItems, selectedCategory, searchQuery]);

  return (
    <div className="space-y-4">
      {/* HEADER SECTION SUBSIDI */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0A1A1A]/80 border border-[#00FFAA]/20 p-4 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#0F2424] border border-[#00FFAA]/30">
            <HandHelping className="w-5 h-5 text-[#00FFAA]" />
          </div>
          <div>
            <h4 className="text-sm sm:text-base font-black uppercase tracking-wider text-[#00FFAA] flex items-center gap-2">
              Kebijakan Subsidi Pemerintah
            </h4>
            <p className="text-[10px] sm:text-xs text-[#6B8A8A] font-semibold">
              Bantalan sosial, intervensi harga bahan pokok, energi, dan bantuan masyarakat
            </p>
          </div>
        </div>

        {/* Quick Badges */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0F2424] border border-[#00FFAA]/30 rounded-xl">
            <DollarSign className="w-3.5 h-3.5 text-rose-400" />
            <span className="text-[10px] font-bold text-[#6B8A8A] uppercase">Total Beban APBN:</span>
            <span className="text-[11px] font-black text-rose-400">
              {formatCurrencyCompact(summary.totalCost)} / hari
            </span>
          </div>
        </div>
      </div>

      {/* TOP SUMMARY STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-[#0A1A1A] border border-[#00FFAA]/20 p-4 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#6B8A8A]">
              Subsidi Aktif
            </span>
            <span className="text-xs font-bold text-[#00FFAA]">
              {summary.activeCount} / {summary.totalCount} Program
            </span>
          </div>
          <p className="text-2xl font-black text-[#00FFAA]">
            {summary.activeCount}{" "}
            <span className="text-sm font-bold text-[#6B8A8A]">Terbuka</span>
          </p>
          <p className="text-[10px] text-[#8AB0A8] mt-1 font-medium">
            Program bantuan sosial yang didanai negara
          </p>
        </div>

        <div className="bg-[#0A1A1A] border border-[#00FFAA]/20 p-4 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#6B8A8A]">
              Total Biaya Harian
            </span>
            <TrendingDown className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-2xl font-black text-rose-400">
            {formatNumber(summary.totalCost)}{" "}
            <span className="text-sm font-bold text-rose-300">NEO</span>
          </p>
          <p className="text-[10px] text-[#8AB0A8] mt-1 font-medium">Pengeluaran kas APBN harian</p>
        </div>

        <div className="bg-[#0A1A1A] border border-[#00FFAA]/20 p-4 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#6B8A8A]">
              Bonus Kepuasan Rakyat
            </span>
            <Heart className="w-4 h-4 text-[#00FFAA]" />
          </div>
          <p className="text-2xl font-black text-[#00FFAA]">
            +{satisfactionBonus}{" "}
            <span className="text-sm font-bold text-[#6B8A8A]">Poin</span>
          </p>
          <p className="text-[10px] text-[#8AB0A8] mt-1 font-medium">
            Dampak positif terhadap persetujuan publik
          </p>
        </div>
      </div>

      {/* FILTER KATEGORI & PENCARIAN */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0A1A1A]/60 p-3 rounded-2xl border border-[#00FFAA]/15">
        <div className="flex flex-wrap items-center gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                selectedCategory === cat
                  ? "bg-[#00FFAA] text-[#0A1A1A] font-black shadow-sm"
                  : "bg-[#0F2424] text-[#6B8A8A] hover:text-[#00FFAA] border border-[#00FFAA]/20"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-[#6B8A8A] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari program subsidi..."
            className="w-full pl-8 pr-3 py-1 rounded-xl bg-[#0F2424] border border-[#00FFAA]/30 text-xs text-[#E0E0E0] placeholder:text-[#6B8A8A] focus:outline-none focus:border-[#00FFAA]"
          />
        </div>
      </div>

      {/* GRID KARTU DAFTAR SUBSIDI */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredItems.map((item) => {
          return (
            <div
              key={item.id}
              className={`rounded-2xl p-3.5 flex flex-col justify-between border transition-all shadow-sm ${
                item.isSubsidized
                  ? "bg-[#0A1A1A] border-[#00FFAA]/40"
                  : "bg-[#0A1A1A]/70 border-[#00FFAA]/15 opacity-70"
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-[#0F2424] border border-[#00FFAA]/20 text-[#8AB0A8]">
                    {item.category}
                  </span>
                  <span
                    className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 border ${
                      item.isSubsidized
                        ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                        : "bg-rose-500/15 border-rose-500/30 text-rose-300"
                    }`}
                  >
                    {item.isSubsidized ? (
                      <>
                        <CheckCircle className="w-3 h-3" /> Aktif
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3" /> Nonaktif
                      </>
                    )}
                  </span>
                </div>

                <h5 className="text-xs font-black text-[#E0E0E0] uppercase tracking-wider mb-1">
                  {item.name}
                </h5>
                <p className="text-[10px] text-[#6B8A8A] line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-[#00FFAA]/10 flex items-center justify-between text-xs">
                <span className="text-[10px] font-bold text-[#6B8A8A] uppercase">
                  Alokasi Biaya:
                </span>
                <span
                  className={`font-black ${
                    item.isSubsidized ? "text-rose-400" : "text-[#6B8A8A]"
                  }`}
                >
                  {formatNumber(item.budgetCost)} NEO/hari
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
