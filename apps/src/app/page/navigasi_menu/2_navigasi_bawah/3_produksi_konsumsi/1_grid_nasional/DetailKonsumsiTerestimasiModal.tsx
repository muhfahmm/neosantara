"use client";

import React, { useState, useMemo } from "react";
import { X, Zap, Activity, Building2, Home, Factory, Search, ChevronRight, ShieldAlert, AlertTriangle } from "lucide-react";

interface DetailKonsumsiTerestimasiModalProps {
  isOpen: boolean;
  onClose: () => void;
  countryDetail: any;
  metadata?: Record<string, any>;
  estimatedConsumptionMW: number;
}

export default function DetailKonsumsiTerestimasiModal({
  isOpen,
  onClose,
  countryDetail,
  metadata = {},
  estimatedConsumptionMW,
}: DetailKonsumsiTerestimasiModalProps) {
  const [activeTab, setActiveTab] = useState<"semua" | "produksi" | "tempat_umum" | "hunian">("semua");
  const [searchQuery, setSearchQuery] = useState("");

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
    const count = Number(countryDetail?.[item.key]) || 0;
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
    // Infrastruktur
    { key: "jalan_raya", label: "Jalan Raya & Tol", sector: "Infrastruktur" },
    { key: "pelabuhan", label: "Pelabuhan Laut", sector: "Infrastruktur" },
    { key: "bandara", label: "Bandara Udara", sector: "Infrastruktur" },
    { key: "stasiun_kereta", label: "Stasiun Kereta Api", sector: "Infrastruktur" },
    { key: "terminal_bus", label: "Terminal Bus", sector: "Infrastruktur" },
    { key: "jembatan_nasional", label: "Jembatan Nasional", sector: "Infrastruktur" },
    { key: "pembangkit_listrik", label: "Jaringan Listrik Publik", sector: "Infrastruktur" },
    // Pendidikan
    { key: "prasekolah", label: "PAUD & TK", sector: "Pendidikan" },
    { key: "dasar", label: "Sekolah Dasar (SD)", sector: "Pendidikan" },
    { key: "menengah", label: "Sekolah Menengah (SMP/SMA)", sector: "Pendidikan" },
    { key: "universitas", label: "Perguruan Tinggi / Universitas", sector: "Pendidikan" },
    { key: "laboratorium", label: "Laboratorium Riset", sector: "Pendidikan" },
    { key: "observatorium", label: "Observatorium Antariksa", sector: "Pendidikan" },
    // Kesehatan
    { key: "rumah_sakit", label: "Rumah Sakit Umum", sector: "Kesehatan" },
    { key: "puskesmas", label: "Puskesmas Kecamatan", sector: "Kesehatan" },
    { key: "klinik", label: "Klinik Pratama", sector: "Kesehatan" },
    // Hukum & Keamanan
    { key: "kantor_polisi", label: "Kantor Polisi", sector: "Hukum & Keamanan" },
    { key: "pos_polisi", label: "Pos Polisi", sector: "Hukum & Keamanan" },
    { key: "pengadilan", label: "Gedung Pengadilan", sector: "Hukum & Keamanan" },
    { key: "lapas", label: "Lembaga Pemasyarakatan", sector: "Hukum & Keamanan" },
    // Olahraga & Hiburan
    { key: "stadion", label: "Stadion Olahraga", sector: "Olahraga & Hiburan" },
    { key: "kolam_renang", label: "Fasilitas Akuatik", sector: "Olahraga & Hiburan" },
    { key: "taman_kota", label: "Taman Kota", sector: "Olahraga & Hiburan" },
    // Komersial
    { key: "pasar_tradisional", label: "Pasar Tradisional", sector: "Komersial" },
    { key: "pusat_perbelanjaan", label: "Pusat Perbelanjaan / Mall", sector: "Komersial" },
    { key: "hotel", label: "Hotel & Penginapan", sector: "Komersial" },
  ];

  const tempatUmumBreakdown = tempatUmumKeys.map((item) => {
    const count = Number(countryDetail?.[item.key]) || 0;
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

  // 3. Kalkulasi Sektor Produksi & Industri
  const produksiBreakdown = useMemo(() => {
    if (!metadata) return [];
    const list: Array<{ key: string; label: string; sector: string; count: number; rate: number; total: number }> = [];

    Object.keys(metadata).forEach((mKey) => {
      const bMeta = metadata[mKey];
      const rate = Number(bMeta?.konsumsi_listrik) || 0;
      if (rate <= 0) return;

      const dataKey = bMeta?.dataKey || mKey.replace(/^\d+_/, "");
      // Hindari duplikasi yang sudah ada di hunian/tempat umum
      if (hunianKeys.some((h) => h.key === dataKey)) return;

      const count = Number(countryDetail?.[dataKey]) || Number(countryDetail?.[mKey]) || 0;
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
  }, [countryDetail, metadata]);

  const totalProduksiConsumption = produksiBreakdown.reduce((sum, p) => sum + p.total, 0);

  // Gabungkan semua item
  const allItems = useMemo(() => {
    return [
      ...produksiBreakdown.map((i) => ({ ...i, category: "produksi" })),
      ...tempatUmumBreakdown.map((i) => ({ ...i, category: "tempat_umum" })),
      ...hunianBreakdown.map((i) => ({ ...i, category: "hunian" })),
    ];
  }, [produksiBreakdown, tempatUmumBreakdown, hunianBreakdown]);

  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      const matchTab = activeTab === "semua" || item.category === activeTab;
      const matchQuery =
        item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sector.toLowerCase().includes(searchQuery.toLowerCase());
      return matchTab && matchQuery && (item.count > 0 || item.total > 0);
    });
  }, [allItems, activeTab, searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none">
      <div className="bg-[#0F2424]/95 backdrop-blur-md border border-rose-500/30 rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans pointer-events-auto shadow-2xl">

        {/* HEADER */}
        <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-rose-500/20 flex items-center justify-between bg-[#0A1A1A] relative z-10 gap-2 shrink-0 rounded-t-2xl">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1 sm:p-1.5 bg-[#0F2424] rounded-lg border border-rose-500/40 text-rose-400 shrink-0">
              <Zap className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-xl font-bold text-rose-400 tracking-tight leading-none uppercase">Rincian Konsumsi Listrik Terestimasi</h2>
              <p className="text-[10px] text-[#6B8A8A] font-semibold mt-0.5">Detail beban konsumsi listrik dari seluruh sektor nasional</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 lg:p-2 rounded-xl border border-rose-500/30 bg-[#0F2424] text-[#6B8A8A] hover:text-rose-400 hover:border-rose-400 transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1 shadow-sm"
          >
            <span className="text-[10px] lg:text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#0A1A1A]/90 relative z-10 custom-scrollbar space-y-6">

          {/* CARD SUMMARY GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            
            {/* Total Konsumsi */}
            <div className="bg-rose-950/40 border border-rose-500/40 p-4 rounded-xl flex flex-col justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-rose-400">Total Konsumsi Terestimasi</p>
                <p className="text-xl sm:text-2xl font-black text-rose-400 mt-1 break-words">
                  {estimatedConsumptionMW.toLocaleString("id-ID")} <span className="text-xs font-bold text-[#6B8A8A]">MW</span>
                </p>
              </div>
              <p className="text-[9px] text-rose-300/70 mt-2 font-medium">Beban energi nasional secara keseluruhan</p>
            </div>

            {/* Sektor Produksi */}
            <div className="bg-[#0A1A1A] border border-[#00FFAA]/20 p-4 rounded-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <Factory className="w-3.5 h-3.5 text-[#00FFAA]" />
                  <p className="text-[10px] font-black uppercase tracking-wider text-[#6B8A8A]">Sektor Produksi & Tambang</p>
                </div>
                <p className="text-lg sm:text-xl font-black text-[#00FFAA]">
                  {totalProduksiConsumption.toLocaleString("id-ID", { maximumFractionDigits: 1 })} <span className="text-xs font-bold text-[#6B8A8A]">MW</span>
                </p>
              </div>
              <p className="text-[9px] text-[#6B8A8A] mt-2 font-medium">{produksiBreakdown.filter(p => p.count > 0).length} jenis industri aktif</p>
            </div>

            {/* Sektor Tempat Umum */}
            <div className="bg-[#0A1A1A] border border-[#00FFAA]/20 p-4 rounded-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <Building2 className="w-3.5 h-3.5 text-[#00FFAA]" />
                  <p className="text-[10px] font-black uppercase tracking-wider text-[#6B8A8A]">Tempat Umum & Layanan</p>
                </div>
                <p className="text-lg sm:text-xl font-black text-[#00FFAA]">
                  {totalTempatUmumConsumption.toLocaleString("id-ID", { maximumFractionDigits: 1 })} <span className="text-xs font-bold text-[#6B8A8A]">MW</span>
                </p>
              </div>
              <p className="text-[9px] text-[#6B8A8A] mt-2 font-medium">{tempatUmumBreakdown.filter(t => t.count > 0).length} fasilitas publik terdaftar</p>
            </div>

            {/* Sektor Hunian */}
            <div className="bg-[#0A1A1A] border border-[#00FFAA]/20 p-4 rounded-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <Home className="w-3.5 h-3.5 text-[#00FFAA]" />
                  <p className="text-[10px] font-black uppercase tracking-wider text-[#6B8A8A]">Hunian & Permukiman</p>
                </div>
                <p className="text-lg sm:text-xl font-black text-[#00FFAA]">
                  {totalHunianConsumption.toLocaleString("id-ID", { maximumFractionDigits: 2 })} <span className="text-xs font-bold text-[#6B8A8A]">MW</span>
                </p>
              </div>
              <p className="text-[9px] text-[#6B8A8A] mt-2 font-medium">Beban kelistrikan rumah tangga & hunian</p>
            </div>

          </div>

          {/* FILTER & SEARCH TABS */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#0A1A1A] p-2.5 rounded-xl border border-[#00FFAA]/20">
            {/* TAB BUTTONS */}
            <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar pb-1 sm:pb-0">
              <button
                onClick={() => setActiveTab("semua")}
                className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === "semua"
                    ? "bg-[#00FFAA] text-[#0A1A1A] shadow-md"
                    : "bg-[#0F2424] text-[#6B8A8A] hover:text-[#00FFAA] hover:bg-[#0F2424]/80"
                }`}
              >
                Semua Sektor
              </button>
              <button
                onClick={() => setActiveTab("produksi")}
                className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === "produksi"
                    ? "bg-[#00FFAA] text-[#0A1A1A] shadow-md"
                    : "bg-[#0F2424] text-[#6B8A8A] hover:text-[#00FFAA] hover:bg-[#0F2424]/80"
                }`}
              >
                Produksi & Manufaktur
              </button>
              <button
                onClick={() => setActiveTab("tempat_umum")}
                className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === "tempat_umum"
                    ? "bg-[#00FFAA] text-[#0A1A1A] shadow-md"
                    : "bg-[#0F2424] text-[#6B8A8A] hover:text-[#00FFAA] hover:bg-[#0F2424]/80"
                }`}
              >
                Tempat Umum
              </button>
              <button
                onClick={() => setActiveTab("hunian")}
                className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === "hunian"
                    ? "bg-[#00FFAA] text-[#0A1A1A] shadow-md"
                    : "bg-[#0F2424] text-[#6B8A8A] hover:text-[#00FFAA] hover:bg-[#0F2424]/80"
                }`}
              >
                Hunian
              </button>
            </div>

            {/* SEARCH BOX */}
            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#6B8A8A]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari fasilitas..."
                className="w-full bg-[#0F2424] border border-[#00FFAA]/30 rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#E0E0E0] placeholder-[#6B8A8A] focus:outline-none focus:border-[#00FFAA]"
              />
            </div>
          </div>

          {/* DAFTAR BREAKDOWN ITEM */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <div
                  key={`${item.category}-${item.key}`}
                  className="bg-[#0A1A1A] border border-[#00FFAA]/20 p-3.5 rounded-xl flex flex-col justify-between hover:border-[#00FFAA]/50 transition-all"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <span className="text-[10px] font-black uppercase text-[#6B8A8A] tracking-wider leading-tight">
                        {item.sector}
                      </span>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-[#0F2424] border border-[#00FFAA]/20 text-[#00FFAA] shrink-0">
                        {item.count.toLocaleString("id-ID")} unit
                      </span>
                    </div>
                    <h4 className="text-xs sm:text-sm font-black text-[#E0E0E0] uppercase tracking-wide leading-snug">
                      {item.label}
                    </h4>
                  </div>

                  <div className="border-t border-[#00FFAA]/10 mt-3 pt-2 flex items-center justify-between">
                    <div>
                      <p className="text-[9px] text-[#6B8A8A]">Konsumsi / Unit:</p>
                      <p className="text-xs font-bold text-[#E0E0E0]">
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
              <div className="col-span-full py-12 text-center bg-[#0A1A1A] border border-[#00FFAA]/10 rounded-xl">
                <p className="text-xs text-[#6B8A8A] font-bold uppercase tracking-wider">Tidak ada fasilitas yang sesuai kriteria pencarian.</p>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
