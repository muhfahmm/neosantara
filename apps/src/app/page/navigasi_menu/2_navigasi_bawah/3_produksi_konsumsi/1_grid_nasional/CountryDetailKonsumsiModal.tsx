"use client";

import SharedModalCloseButton from '@/app/page/root_modals_design_menu/ModalCloseButton';
import React, { useState, useMemo } from "react";
import { X, Zap, Building2, Home, Factory, Search, Shield } from "lucide-react";
import NotebookModalWrapper from "@/app/page/navigasi_menu/2_navigasi_bawah/NotebookModalWrapper";

interface CountryDetailKonsumsiModalProps {
  isOpen: boolean;
  onClose: () => void;
  countryData: any;
  metadata?: Record<string, any>;
}

export default function CountryDetailKonsumsiModal({
  isOpen,
  onClose,
  countryData,
  metadata = {},
}: CountryDetailKonsumsiModalProps) {
  const [activeTab, setActiveTab] = useState<"semua" | "produksi" | "tempat_umum" | "hunian" | "pertahanan">("semua");
  const [searchQuery, setSearchQuery] = useState("");

  const countryName = countryData?.name_id || countryData?.name || countryData?.country || "Negara";

  // Utility findMeta
  const findMeta = (key: string) => {
    if (!metadata) return undefined;
    if (metadata[key]) return metadata[key];
    for (const k of Object.keys(metadata)) {
      const entry = metadata[k];
      if (!entry) continue;
      if (entry.dataKey === key) return entry;
      if (k.endsWith(`_${key}`) || k === `1_${key}`) return entry;
    }
    return undefined;
  };

  // 1. Kalkulasi Sektor Hunian
  const hunianKeys = [
    { key: "rumah_subsidi", label: "Perumahan Subsidi Rakyat", defaultRate: 0.0009 },
    { key: "apartemen", label: "Apartemen Modern & High-Rise", defaultRate: 0.0022 },
    { key: "mansion", label: "Kompleks Mansion Mewah", defaultRate: 0.0055 },
  ];

  const hunianBreakdown = hunianKeys.map((item) => {
    const count = Number(countryData?.[item.key]) || 0;
    const bMeta = findMeta(item.key);
    const rate = Number(bMeta?.konsumsi_listrik) || item.defaultRate;
    const total = count * rate;
    return {
      key: item.key,
      label: item.label,
      sector: "Hunian & Permukiman",
      count,
      rate,
      total,
    };
  });

  const totalHunianConsumption = hunianBreakdown.reduce((sum, h) => sum + h.total, 0);

  // 2. Kalkulasi Sektor Tempat Umum
  const tempatUmumKeys = [
    { key: "jalan_raya", label: "Jalan Raya & Tol", sector: "Infrastruktur" },
    { key: "pelabuhan", label: "Pelabuhan Laut", sector: "Infrastruktur" },
    { key: "bandara", label: "Bandara Udara", sector: "Infrastruktur" },
    { key: "stasiun_kereta", label: "Stasiun Kereta Api", sector: "Infrastruktur" },
    { key: "terminal_bus", label: "Terminal Bus", sector: "Infrastruktur" },
    { key: "jembatan_nasional", label: "Jembatan Nasional", sector: "Infrastruktur" },
    { key: "pembangkit_listrik", label: "Jaringan Listrik Publik", sector: "Infrastruktur" },
    { key: "prasekolah", label: "PAUD & TK", sector: "Pendidikan" },
    { key: "dasar", label: "Sekolah Dasar (SD)", sector: "Pendidikan" },
    { key: "menengah", label: "Sekolah Menengah (SMP/SMA)", sector: "Pendidikan" },
    { key: "universitas", label: "Perguruan Tinggi / Universitas", sector: "Pendidikan" },
    { key: "laboratorium", label: "Laboratorium Riset", sector: "Pendidikan" },
    { key: "observatorium", label: "Observatorium Antariksa", sector: "Pendidikan" },
    { key: "rumah_sakit", label: "Rumah Sakit Umum", sector: "Kesehatan" },
    { key: "puskesmas", label: "Puskesmas Kecamatan", sector: "Kesehatan" },
    { key: "klinik", label: "Klinik Pratama", sector: "Kesehatan" },
    { key: "kantor_polisi", label: "Kantor Polisi", sector: "Hukum & Keamanan" },
    { key: "pos_polisi", label: "Pos Polisi", sector: "Hukum & Keamanan" },
    { key: "pengadilan", label: "Gedung Pengadilan", sector: "Hukum & Keamanan" },
    { key: "pusat_bantuan_hukum", label: "Pusat Bantuan Hukum", sector: "Hukum & Keamanan" },
    { key: "kejaksaan", label: "Kantor Kejaksaan", sector: "Hukum & Keamanan" },
    { key: "armada_mobil_polisi", label: "Armada Mobil Polisi", sector: "Hukum & Keamanan" },
    { key: "akademi_polisi", label: "Akademi Polisi", sector: "Hukum & Keamanan" },
    { key: "lapas", label: "Lembaga Pemasyarakatan", sector: "Hukum & Keamanan" },
    { key: "stadion", label: "Stadion Olahraga", sector: "Olahraga & Hiburan" },
    { key: "kolam_renang", label: "Fasilitas Akuatik", sector: "Olahraga & Hiburan" },
    { key: "taman_kota", label: "Taman Kota", sector: "Olahraga & Hiburan" },
    { key: "pasar_tradisional", label: "Pasar Tradisional", sector: "Komersial" },
    { key: "pusat_perbelanjaan", label: "Pusat Perbelanjaan / Mall", sector: "Komersial" },
    { key: "hotel", label: "Hotel & Penginapan", sector: "Komersial" },
  ];

  const tempatUmumBreakdown = tempatUmumKeys.map((item) => {
    const count = Number(countryData?.[item.key]) || 0;
    const bMeta = findMeta(item.key);
    const rate = Number(bMeta?.konsumsi_listrik) || 0;
    const total = count * rate;
    return {
      key: item.key,
      label: item.label,
      sector: item.sector,
      count,
      rate,
      total,
    };
  }).filter((item) => item.count > 0 || item.rate > 0);

  const totalTempatUmumConsumption = tempatUmumBreakdown.reduce((sum, t) => sum + t.total, 0);

  // 3. Kalkulasi Sektor Pertahanan & Keamanan
  const pertahananKeys = [
    { key: "barak", label: "Barak Militer", defaultRate: 0.5, sector: "Militer & Pertahanan" },
    { key: "gudang_senjata", label: "Gudang Senjata & Amunisi", defaultRate: 0.5, sector: "Militer & Pertahanan" },
    { key: "hangar_tank", label: "Hangar Tank & Kendaraan Tempur", defaultRate: 0.5, sector: "Militer & Pertahanan" },
    { key: "pangkalan_udara", label: "Pangkalan Angkatan Udara", defaultRate: 0.5, sector: "Militer & Pertahanan" },
    { key: "pangkalan_laut", label: "Pangkalan Angkatan Laut", defaultRate: 0.5, sector: "Militer & Pertahanan" },
    { key: "markas_komando", label: "Markas Besar Komando Militer", defaultRate: 0.5, sector: "Militer & Pertahanan" },
    { key: "pos_perbatasan", label: "Pos Pengamanan Perbatasan", defaultRate: 0.2, sector: "Militer & Pertahanan" },
    { key: "sistem_radar", label: "Stasiun Radar Pertahanan Udara", defaultRate: 0.8, sector: "Militer & Pertahanan" },
  ];

  const pertahananBreakdown = pertahananKeys.map((item) => {
    let count = Number(countryData?.[item.key]) || 0;
    if (count <= 0 && countryData?.pertahanan?.[item.key] !== undefined) {
      count = Number(countryData.pertahanan[item.key]) || 0;
    }
    const bMeta = findMeta(item.key);
    const rate = Number(bMeta?.konsumsi_listrik) || item.defaultRate;
    const total = count * rate;
    return {
      key: item.key,
      label: item.label,
      sector: item.sector,
      count,
      rate,
      total,
    };
  });

  const totalPertahananConsumption = pertahananBreakdown.reduce((sum, p) => sum + p.total, 0);

  // 4. Kalkulasi Sektor Produksi & Industri
  const produksiBreakdown = useMemo(() => {
    if (!metadata) return [];
    const list: Array<{ key: string; label: string; sector: string; count: number; rate: number; total: number }> = [];

    Object.keys(metadata).forEach((mKey) => {
      const bMeta = metadata[mKey];
      const rate = Number(bMeta?.konsumsi_listrik) || 0;
      if (rate <= 0) return;

      const dataKey = bMeta?.dataKey || mKey.replace(/^\d+_/, "");
      if (hunianKeys.some((h) => h.key === dataKey)) return;
      if (pertahananKeys.some((p) => p.key === dataKey)) return;

      const count = Number(countryData?.[dataKey]) || Number(countryData?.[mKey]) || 0;
      const label = bMeta?.nama_bangunan || bMeta?.label || dataKey.replace(/_/g, " ").toUpperCase();
      const total = count * rate;

      if (!list.some((l) => l.key === dataKey)) {
        list.push({
          key: dataKey,
          label,
          sector: "Produksi & Manufaktur",
          count,
          rate,
          total,
        });
      }
    });

    return list;
  }, [countryData, metadata]);

  const totalProduksiConsumption = produksiBreakdown.reduce((sum, p) => sum + p.total, 0);

  const allItems = useMemo(() => {
    return [
      ...produksiBreakdown.map((i) => ({ ...i, category: "produksi" })),
      ...tempatUmumBreakdown.map((i) => ({ ...i, category: "tempat_umum" })),
      ...hunianBreakdown.map((i) => ({ ...i, category: "hunian" })),
      ...pertahananBreakdown.map((i) => ({ ...i, category: "pertahanan" })),
    ];
  }, [produksiBreakdown, tempatUmumBreakdown, hunianBreakdown, pertahananBreakdown]);

  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      const matchTab = activeTab === "semua" || item.category === activeTab;
      const matchQuery =
        item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sector.toLowerCase().includes(searchQuery.toLowerCase());
      return matchTab && matchQuery && (item.count > 0 || item.total > 0);
    });
  }, [allItems, activeTab, searchQuery]);

  const totalAllBreakdownConsumption = totalProduksiConsumption + totalTempatUmumConsumption + totalPertahananConsumption + totalHunianConsumption;

  if (!isOpen) return null;

  return (
    <NotebookModalWrapper zIndexClass="z-[70]">
      <div className="relative flex h-full min-h-0 w-full flex-col overflow-hidden font-sans pointer-events-auto">

        {/* HEADER */}
        <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-rose-500/20 flex items-center justify-between bg-root-canvas relative z-10 gap-2 shrink-0 rounded-t-2xl">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1 sm:p-1.5 bg-root-surface rounded-lg border border-rose-500/40 text-rose-400 shrink-0">
              <Zap className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-xl font-bold text-rose-400 tracking-tight leading-none uppercase">
                Rincian Konsumsi Listrik - {countryName}
              </h2>
              <p className="text-[10px] text-root-subtle font-semibold mt-0.5">Detail beban konsumsi listrik nasional</p>
            </div>
          </div>

          <SharedModalCloseButton
            onClick={onClose}
            className="p-1.5 lg:p-2 rounded-xl border border-rose-500/30 bg-root-surface text-root-subtle hover:text-rose-400 hover:border-rose-400 transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1 shadow-sm"
           appearance="custom">
            <span className="text-[10px] lg:text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
            <X className="h-4 w-4" />
          </SharedModalCloseButton>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-root-canvas/90 relative z-10 custom-scrollbar space-y-6">

          {/* CARD SUMMARY GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3.5">
            <div className="bg-rose-950/40 border border-rose-500/40 p-3.5 rounded-xl flex flex-col justify-between">
              <div>
                <p className="text-[9px] font-black uppercase tracking-wider text-rose-400">Total Konsumsi Terestimasi</p>
                <p className="text-lg sm:text-xl font-black text-rose-400 mt-1 break-words">
                  {totalAllBreakdownConsumption.toLocaleString("id-ID", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} <span className="text-xs font-bold text-root-subtle">MW</span>
                </p>
              </div>
              <p className="text-[9px] text-rose-300/70 mt-1.5 font-medium">Beban energi nasional</p>
            </div>

            <div className="bg-root-canvas border border-root-accent/20 p-3.5 rounded-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <Factory className="w-3.5 h-3.5 text-root-accent" />
                  <p className="text-[9px] font-black uppercase tracking-wider text-root-subtle">Produksi & Tambang</p>
                </div>
                <p className="text-base sm:text-lg font-black text-root-accent">
                  {totalProduksiConsumption.toLocaleString("id-ID", { maximumFractionDigits: 1 })} <span className="text-xs font-bold text-root-subtle">MW</span>
                </p>
              </div>
              <p className="text-[9px] text-root-subtle mt-1.5 font-medium">{produksiBreakdown.filter(p => p.count > 0).length} jenis industri</p>
            </div>

            <div className="bg-root-canvas border border-root-accent/20 p-3.5 rounded-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <Building2 className="w-3.5 h-3.5 text-root-accent" />
                  <p className="text-[9px] font-black uppercase tracking-wider text-root-subtle">Tempat Umum</p>
                </div>
                <p className="text-base sm:text-lg font-black text-root-accent">
                  {totalTempatUmumConsumption.toLocaleString("id-ID", { maximumFractionDigits: 1 })} <span className="text-xs font-bold text-root-subtle">MW</span>
                </p>
              </div>
              <p className="text-[9px] text-root-subtle mt-1.5 font-medium">{tempatUmumBreakdown.filter(t => t.count > 0).length} fasilitas publik</p>
            </div>

            <div className="bg-root-canvas border border-root-accent/20 p-3.5 rounded-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <Shield className="w-3.5 h-3.5 text-root-accent" />
                  <p className="text-[9px] font-black uppercase tracking-wider text-root-subtle">Pertahanan & Keamanan</p>
                </div>
                <p className="text-base sm:text-lg font-black text-root-accent">
                  {totalPertahananConsumption.toLocaleString("id-ID", { maximumFractionDigits: 1 })} <span className="text-xs font-bold text-root-subtle">MW</span>
                </p>
              </div>
              <p className="text-[9px] text-root-subtle mt-1.5 font-medium">{pertahananBreakdown.filter(p => p.count > 0).length} pangkalan & infrastruktur</p>
            </div>

            <div className="bg-root-canvas border border-root-accent/20 p-3.5 rounded-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <Home className="w-3.5 h-3.5 text-root-accent" />
                  <p className="text-[9px] font-black uppercase tracking-wider text-root-subtle">Hunian & Permukiman</p>
                </div>
                <p className="text-base sm:text-lg font-black text-root-accent">
                  {totalHunianConsumption.toLocaleString("id-ID", { maximumFractionDigits: 2 })} <span className="text-xs font-bold text-root-subtle">MW</span>
                </p>
              </div>
              <p className="text-[9px] text-root-subtle mt-1.5 font-medium">Beban rumah tangga</p>
            </div>
          </div>

          {/* FILTER & SEARCH TABS */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-root-canvas p-2.5 rounded-xl border border-root-accent/20">
            <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar pb-1 sm:pb-0">
              <button
                onClick={() => setActiveTab("semua")}
                className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === "semua"
                    ? "bg-root-accent text-root-canvas shadow-md"
                    : "bg-root-surface text-root-subtle hover:text-root-accent hover:bg-root-surface/80"
                }`}
              >
                Semua Sektor
              </button>
              <button
                onClick={() => setActiveTab("produksi")}
                className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === "produksi"
                    ? "bg-root-accent text-root-canvas shadow-md"
                    : "bg-root-surface text-root-subtle hover:text-root-accent hover:bg-root-surface/80"
                }`}
              >
                Produksi
              </button>
              <button
                onClick={() => setActiveTab("tempat_umum")}
                className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === "tempat_umum"
                    ? "bg-root-accent text-root-canvas shadow-md"
                    : "bg-root-surface text-root-subtle hover:text-root-accent hover:bg-root-surface/80"
                }`}
              >
                Tempat Umum
              </button>
              <button
                onClick={() => setActiveTab("pertahanan")}
                className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === "pertahanan"
                    ? "bg-root-accent text-root-canvas shadow-md"
                    : "bg-root-surface text-root-subtle hover:text-root-accent hover:bg-root-surface/80"
                }`}
              >
                Pertahanan & Keamanan
              </button>
              <button
                onClick={() => setActiveTab("hunian")}
                className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === "hunian"
                    ? "bg-root-accent text-root-canvas shadow-md"
                    : "bg-root-surface text-root-subtle hover:text-root-accent hover:bg-root-surface/80"
                }`}
              >
                Hunian
              </button>
            </div>

            <div className="relative min-w-[180px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-root-subtle" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari fasilitas..."
                className="w-full bg-root-surface border border-root-accent/30 rounded-lg pl-8 pr-3 py-1.5 text-xs text-root-text placeholder-root-subtle focus:outline-none focus:border-root-accent"
              />
            </div>
          </div>

          {/* DAFTAR BREAKDOWN ITEM */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <div
                  key={`${item.category}-${item.key}`}
                  className="bg-root-canvas border border-root-accent/20 p-3.5 rounded-xl flex flex-col justify-between shadow-sm"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <span className="text-[10px] font-black uppercase text-root-subtle tracking-wider leading-tight">
                        {item.sector}
                      </span>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-root-surface border border-root-accent/20 text-root-accent shrink-0">
                        {item.count.toLocaleString("id-ID", { maximumFractionDigits: 2 })} unit
                      </span>
                    </div>
                    <h4 className="text-xs sm:text-sm font-black text-root-text uppercase tracking-wide leading-snug">
                      {item.label}
                    </h4>
                  </div>

                  <div className="border-t border-root-accent/10 mt-3 pt-2 flex items-center justify-between">
                    <div>
                      <p className="text-[9px] text-root-subtle">Konsumsi / Unit:</p>
                      <p className="text-xs font-bold text-root-text">
                        {item.rate.toLocaleString("id-ID", { maximumFractionDigits: 4 })} MW
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] text-rose-400 font-bold">Total Beban:</p>
                      <p className="text-sm font-black text-rose-400">
                        {item.total.toLocaleString("id-ID", { maximumFractionDigits: 2 })} MW
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-12 text-center bg-root-canvas border border-root-accent/10 rounded-xl">
                <p className="text-xs text-root-subtle font-bold uppercase tracking-wider">Tidak ada fasilitas yang sesuai kriteria pencarian.</p>
              </div>
            )}
          </div>

        </div>

      </div>
    </NotebookModalWrapper>
  );
}