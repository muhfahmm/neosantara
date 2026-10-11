"use client";
import React, { useState, useEffect, useMemo } from "react";
import {
  Gift,
  X,
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
import PilihItemModal from "@/app/page/navigasi_menu/2_navigasi_bawah/4_ekonomi/1_perdagangan/PilihItemModal";
import { getMaterialStock } from "@/app/page/navigasi_menu/2_navigasi_bawah/5_pembangunan/build_logic/build_logic";
import { getRelationValue, setRelationModifier } from "@/../../json/database_hubungan_antar_negara/relationsRegistry";
import { COUNTRIES_DATA } from "@/app/page/map_system/map-data";

const CATEGORY_MAP: Record<string, string[]> = {
  "Mineral & Energi": ["uranium", "batu_bara", "minyak_bumi", "gas_alam", "garam", "litium", "logam_tanah_jarang", "bijih_besi"],
  "Manufaktur": ["pabrik_semikonduktor", "pabrik_mesin_mobil", "pabrik_mesin_motor", "semen_beton", "kayu"],
  "Peternakan": ["ayam_unggas", "sapi_perah", "sapi_potong", "domba_kambing"],
  "Agrikultur": ["padi", "gandum", "jagung", "sayur", "umbi", "kedelai", "kelapa_sawit", "kopi", "teh", "kakao", "tebu", "karet"],
  "Perikanan": ["udang", "mutiara", "ikan"],
  "Olahan Pangan": ["air_mineral", "gula", "roti", "pengolahan_daging", "mie_instan", "minyak_goreng", "susu"]
};

const COMMODITY_VALUE: Record<string, number> = {
  uranium: 8000, batu_bara: 100, minyak_bumi: 150, gas_alam: 120, garam: 50,
  litium: 3000, logam_tanah_jarang: 5000, bijih_besi: 800,
  pabrik_semikonduktor: 4000, pabrik_mesin_mobil: 15000, pabrik_mesin_motor: 5000,
  semen_beton: 300, kayu: 200, ayam_unggas: 60, sapi_perah: 200,
  sapi_potong: 180, domba_kambing: 150, padi: 80, gandum: 90, jagung: 70,
  sayur: 100, umbi: 60, kedelai: 120, kelapa_sawit: 130, kopi: 300,
  teh: 250, kakao: 350, tebu: 100, karet: 200,
  udang: 500, mutiara: 1000, ikan: 300, air_mineral: 50,
  gula: 150, roti: 200, pengolahan_daging: 250, mie_instan: 180, minyak_goreng: 220,
  susu: 160,
};

const formatLabel = (key: string) =>
  key.replace(/_/g, " ").replace(/\b\w/g, (ch) => ch.toUpperCase());

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

  const targetCountryName = countryName || "Negara Target";
  const isAllCountries = targetCountryName === "Semua Negara";
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
      category,
      items: keys.map((key) => {
        const itemStock = playerCountryDetail ? getMaterialStock(playerCountryDetail, key) : 0;
        return {
          label: `${formatLabel(key)} (Stok: ${itemStock.toLocaleString("id-ID")})`,
          value: key,
          disabled: false
        };
      })
    }));
  }, [playerCountryDetail]);

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

  const getRelationStatusBadge = (val: number) => {
    if (val >= 80) return { label: "Sangat Mesra", color: "text-emerald-400 bg-emerald-950/60 border-emerald-500/30" };
    if (val >= 60) return { label: "Bersahabat", color: "text-[#00FFAA] bg-[#00FFAA]/10 border-[#00FFAA]/30" };
    if (val >= 40) return { label: "Netral", color: "text-amber-300 bg-amber-950/60 border-amber-500/30" };
    if (val >= 20) return { label: "Dingin", color: "text-orange-400 bg-orange-950/60 border-orange-500/30" };
    return { label: "Musuh", color: "text-rose-400 bg-rose-950/60 border-rose-500/30" };
  };

  const currentBadge = getRelationStatusBadge(currentRelation);
  const newBadge = getRelationStatusBadge(newRelation);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none">
        {/* Modal Container */}
        <div className="bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans pointer-events-auto shadow-2xl">
          {/* HEADER */}
          <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-[#00FFAA]/20 flex items-center justify-between bg-[#0A1A1A] relative z-10 gap-2 shrink-0 rounded-t-2xl">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1 sm:p-1.5 bg-[#0F2424] rounded-lg border border-[#00FFAA]/30 shrink-0">
                <Gift className="h-4 w-4 sm:h-5 sm:w-5 text-[#00FFAA]" />
              </div>
              <div>
                <h2 className="text-base sm:text-xl font-bold text-[#00FFAA] tracking-tight leading-none uppercase">
                  Beri Hadiah Komoditas
                </h2>
                <p className="text-[10px] sm:text-xs text-[#6B8A8A] font-semibold mt-1">
                  Negara Penerima: <span className="text-[#E0E0E0] font-bold">{targetCountryName}</span>
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 lg:p-2 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] text-[#6B8A8A] hover:text-[#00FFAA] hover:border-[#00FFAA] transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1 shadow-sm shrink-0"
            >
              <span className="text-[10px] lg:text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* BODY */}
          <div className="flex-1 min-h-0 bg-[#0F2424] relative z-10 p-4 sm:p-6 flex flex-col gap-3 sm:gap-4 overflow-y-auto custom-scrollbar">
            {/* Notice + Stock Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 shrink-0">
              <div className="p-3 rounded-xl bg-[#0A1A1A] border border-[#00FFAA]/20 flex items-start gap-2.5">
                <Sparkles className="h-4 w-4 text-[#00FFAA] shrink-0 mt-0.5" />
                <p className="text-[11px] sm:text-xs text-[#E0E0E0] leading-relaxed">
                  Kirim bantuan komoditas ke <strong className="text-white">{targetCountryName}</strong>. Setiap setara <strong className="text-[#00FFAA]">10.000 Nilai Komoditas</strong> akan menaikkan <strong className="text-[#00FFAA]">+1 Tingkat Hubungan</strong>.
                </p>
              </div>

              <div className="flex items-center justify-between bg-[#0A1A1A] p-3 rounded-xl border border-[#00FFAA]/20">
                <span className="text-[11px] sm:text-xs text-[#6B8A8A] font-semibold flex items-center gap-2">
                  <Package className="h-4 w-4 text-[#00FFAA]" />
                  Stok Komoditas Tersedia:
                </span>
                <span className={`font-black text-sm ${stockAvailable > 0 ? "text-[#00FFAA]" : "text-rose-400"}`}>
                  {stockAvailable.toLocaleString("id-ID")} Unit
                </span>
              </div>
            </div>

            {/* Pemilihan Komoditas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 shrink-0">
              {/* Button Pemilih Produk */}
              <div>
                <label className="block text-[10px] sm:text-xs font-black text-[#00FFAA] uppercase tracking-wider mb-2">
                  Pilih Produk Komoditas
                </label>
                <button
                  type="button"
                  onClick={() => setIsProductPickerOpen(true)}
                  className="w-full h-11 bg-[#0A1A1A] hover:bg-[#00FFAA]/5 border border-[#00FFAA]/40 hover:border-[#00FFAA] rounded-xl px-3 flex items-center justify-between text-white transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Layers className="h-4 w-4 text-[#00FFAA] shrink-0" />
                    <span className="font-sans font-bold text-xs sm:text-sm tracking-wide truncate text-[#E0E0E0]">
                      {formatLabel(selectedProduct)}
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-[#00FFAA] shrink-0" />
                </button>
              </div>

              {/* Input Kuantitas Hadiah */}
              <div>
                <label className="block text-[10px] sm:text-xs font-black text-[#00FFAA] uppercase tracking-wider mb-2">
                  Jumlah Komoditas (Unit)
                </label>
                <div className="flex items-center gap-2 bg-[#0A1A1A] border border-[#00FFAA]/40 rounded-xl px-3 h-11">
                  <input
                    type="number"
                    min={1}
                    value={quantity || ""}
                    onChange={(e) => setQuantity(Math.max(0, parseInt(e.target.value) || 0))}
                    className="flex-1 bg-transparent text-sm font-sans font-black text-[#E0E0E0] outline-none placeholder-[#6B8A8A]"
                    placeholder="0"
                  />
                  <span className="text-xs font-bold text-[#6B8A8A] mr-2">Unit</span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => handleAddQty(-10)}
                      className="p-1.5 bg-[#0F2424] hover:bg-[#00FFAA]/20 border border-[#00FFAA]/30 rounded text-[#00FFAA] transition-all cursor-pointer"
                      title="-10"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddQty(10)}
                      className="p-1.5 bg-[#0F2424] hover:bg-[#00FFAA]/20 border border-[#00FFAA]/30 rounded text-[#00FFAA] transition-all cursor-pointer"
                      title="+10"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={handleSetMax}
                      className="px-2 py-1 bg-[#00FFAA]/20 hover:bg-[#00FFAA]/30 border border-[#00FFAA]/50 rounded text-[10px] font-black text-[#00FFAA] transition-all cursor-pointer"
                    >
                      Max
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Nilai Diplomatik Hadiah */}
            <div className="p-3 bg-[#0A1A1A] border border-[#00FFAA]/20 rounded-xl flex items-center justify-between shrink-0 text-xs">
              <span className="text-[#6B8A8A] font-semibold">
                Estimasi Nilai Diplomatik ({quantity.toLocaleString("id-ID")} x {unitValue.toLocaleString("id-ID")}):
              </span>
              <span className="font-black text-[#00FFAA] text-sm">
                {totalGiftValue.toLocaleString("id-ID")} Nilai
              </span>
            </div>

            {/* Impact Preview Card — Hanya ditampilkan jika untuk 1 negara spesifik */}
            {!isAllCountries ? (
              <div className="bg-[#0A1A1A] p-3 sm:p-4 rounded-xl border border-[#00FFAA]/30 shrink-0">
                <div className="text-[10px] sm:text-xs font-black text-[#6B8A8A] uppercase tracking-wider flex items-center justify-between mb-3">
                  <span>Kalkulasi Peningkatan Hubungan</span>
                  <TrendingUp className="h-4 w-4 text-[#00FFAA]" />
                </div>

                <div className="flex items-center justify-between gap-3 bg-[#0F2424] p-3 rounded-lg border border-[#00FFAA]/20">
                  {/* Current Level */}
                  <div className="text-center flex-1">
                    <span className="block text-[9px] sm:text-[10px] font-bold text-[#6B8A8A] uppercase">Saat Ini</span>
                    <span className="text-lg sm:text-xl font-black text-[#E0E0E0]">{currentRelation}</span>
                    <div className="mt-1">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${currentBadge.color}`}>
                        {currentBadge.label}
                      </span>
                    </div>
                  </div>

                  {/* Arrow & Delta */}
                  <div className="flex flex-col items-center justify-center px-2">
                    <span className="text-[11px] font-black text-[#00FFAA] bg-[#00FFAA]/10 px-2 py-0.5 rounded border border-[#00FFAA]/30 mb-1 whitespace-nowrap">
                      +{actualGained} Tingkat
                    </span>
                    <ArrowRight className="h-4 w-4 text-[#00FFAA]" />
                  </div>

                  {/* New Level */}
                  <div className="text-center flex-1">
                    <span className="block text-[9px] sm:text-[10px] font-bold text-[#6B8A8A] uppercase">Setelah Pemberian</span>
                    <span className="text-lg sm:text-xl font-black text-[#00FFAA]">{newRelation}</span>
                    <div className="mt-1">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${newBadge.color}`}>
                        {newBadge.label}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Remainder info */}
                {totalGiftValue > 0 && totalGiftValue < 10000 && (
                  <p className="text-[10px] sm:text-[11px] text-amber-300 flex items-center gap-1.5 mt-2.5">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    <span>
                      Nilai komoditas saat ini ({totalGiftValue.toLocaleString("id-ID")}) belum mencapai ambang minimum 10.000 untuk menaikkan 1 tingkat hubungan.
                    </span>
                  </p>
                )}
              </div>
            ) : (
              /* Ringkasan dampak global saat target adalah Semua Negara */
              <div className="bg-[#0A1A1A] p-3 sm:p-4 rounded-xl border border-[#00FFAA]/30 shrink-0 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Sparkles className="h-4 w-4 text-[#00FFAA] shrink-0" />
                  <span className="text-xs text-[#E0E0E0] font-semibold">
                    Efek Global ke Seluruh Negara:
                  </span>
                </div>
                <span className="text-sm font-black text-[#00FFAA] bg-[#00FFAA]/10 px-3 py-1 rounded-lg border border-[#00FFAA]/30">
                  +{actualGained} Tingkat untuk Setiap Negara
                </span>
              </div>
            )}

            {/* Error / Warning Alert */}
            {isInsufficientStock && (
              <div className="p-2.5 sm:p-3 bg-rose-950/60 border border-rose-500/40 rounded-xl text-rose-300 text-[11px] sm:text-xs flex items-center gap-2 shrink-0">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                <span>Stok komoditas Anda tidak mencukupi (Tersedia: {stockAvailable.toLocaleString("id-ID")} unit).</span>
              </div>
            )}

            {isMaxRelation && (
              <div className="p-2.5 sm:p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-emerald-300 text-[11px] sm:text-xs flex items-center gap-2 shrink-0">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                <span>Tingkat hubungan dengan negara ini sudah mencapai nilai maksimum (100).</span>
              </div>
            )}

            {/* Spacer */}
            <div className="flex-1" />
          </div>

          {/* FOOTER */}
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-[#00FFAA]/20 bg-[#0A1A1A] shrink-0 rounded-b-2xl">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-[#0F2424] hover:bg-[#163535] border border-[#00FFAA]/30 rounded-xl py-2.5 sm:py-3 text-center text-[#E0E0E0] font-extrabold text-xs tracking-wider uppercase transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={!isValid}
                onClick={handleConfirm}
                className={`flex-1 rounded-xl py-2.5 sm:py-3 text-center font-black text-xs tracking-wider uppercase transition-all shadow-lg flex items-center justify-center gap-2 ${
                  isValid
                    ? "bg-[#00FFAA] hover:bg-[#00e699] text-[#0A1A1A] border border-[#00FFAA] cursor-pointer"
                    : "bg-gray-700 text-gray-400 border border-gray-600 cursor-not-allowed opacity-50"
                }`}
              >
                <Gift className="h-4 w-4" />
                Berikan Hadiah (+{actualGained})
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL PILIH PRODUK KOMODITAS */}
      <PilihItemModal
        isOpen={isProductPickerOpen}
        onClose={() => setIsProductPickerOpen(false)}
        title="Pilih Produk Komoditas"
        data={groupedProductItems}
        selectedValue={selectedProduct}
        onSelect={(val) => setSelectedProduct(val)}
      />
    </>
  );
}