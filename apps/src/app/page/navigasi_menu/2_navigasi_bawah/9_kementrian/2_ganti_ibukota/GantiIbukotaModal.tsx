"use client";

import React, { useState, useMemo } from "react";
import {
  X,
  Landmark,
  Search,
  CheckCircle,
  AlertCircle,
  Clock,
  Coins,
  MapPin,
  Sparkles,
} from "lucide-react";
import { CAPITALS_DATA } from "@/app/page/map_system/map-data";
import MAJOR_CITIES_DATA from "@/app/page/map_system/major_cities.json";
import NotebookModalWrapper from "@/app/page/navigasi_menu/2_navigasi_bawah/NotebookModalWrapper";
import KonfirmasiGantiIbukotaModal, {
  PINDAH_IBUKOTA_COST,
  PINDAH_IBUKOTA_COOLDOWN_YEARS,
} from "./KonfirmasiGantiIbukotaModal";

interface GantiIbukotaModalProps {
  isOpen: boolean;
  onClose: () => void;
  countryDetail: any;
  setCountryDetail: (detail: any) => void;
  currentDate?: Date | string;
}

interface CityOption {
  name: string;
  lat: number;
  lng: number;
  isCurrentCapital: boolean;
}

export default function GantiIbukotaModal({
  isOpen,
  onClose,
  countryDetail,
  setCountryDetail,
  currentDate,
}: GantiIbukotaModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTargetCity, setSelectedTargetCity] = useState<string | null>(null);

  const countryName =
    countryDetail?.country ||
    countryDetail?.nama_negara ||
    countryDetail?.name ||
    "Indonesia";

  const currentCapital =
    countryDetail?.capital ||
    countryDetail?.ibukota ||
    (typeof window !== "undefined"
      ? (window as Window & { neosantara_player_capital?: string }).neosantara_player_capital
      : undefined) ||
    "Jakarta";

  const money = countryDetail?.anggaran ?? 0;

  // Cek Cooldown
  const cooldownUntilStr = countryDetail?.capital_change_cooldown_until as string | undefined;
  const now = currentDate ? new Date(currentDate) : new Date();
  const cooldownUntilDate = cooldownUntilStr ? new Date(cooldownUntilStr) : null;
  const isCooldownActive = Boolean(
    cooldownUntilDate && !isNaN(cooldownUntilDate.getTime()) && cooldownUntilDate.getTime() > now.getTime()
  );

  // Kumpulkan semua nama kota yang berada di negara pemain (default Indonesia atau countryName)
  const availableCities = useMemo(() => {
    const list: CityOption[] = [];
    const addedNames = new Set<string>();

    const targetIso = (countryDetail?.iso || "id").toLowerCase().trim();
    const targetCountryLower = countryName.toLowerCase().trim();

    // 1. Ambil dari CAPITALS_DATA
    const baseCapitals = CAPITALS_DATA.filter(
      (c) =>
        c.iso.toLowerCase().trim() === targetIso ||
        c.country.toLowerCase().trim() === targetCountryLower
    );
    for (const c of baseCapitals) {
      const name = c.capital.trim();
      if (!addedNames.has(name.toLowerCase())) {
        addedNames.add(name.toLowerCase());
        list.push({
          name,
          lat: c.lat,
          lng: c.lng,
          isCurrentCapital: name.toLowerCase() === currentCapital.toLowerCase(),
        });
      }
    }

    // 2. Ambil dari MAJOR_CITIES_DATA
    const majorCities = (MAJOR_CITIES_DATA as typeof CAPITALS_DATA).filter(
      (c) =>
        c.iso.toLowerCase().trim() === targetIso ||
        c.country.toLowerCase().trim() === targetCountryLower
    );
    for (const c of majorCities) {
      const name = c.capital.trim();
      if (!addedNames.has(name.toLowerCase())) {
        addedNames.add(name.toLowerCase());
        list.push({
          name,
          lat: c.lat,
          lng: c.lng,
          isCurrentCapital: name.toLowerCase() === currentCapital.toLowerCase(),
        });
      }
    }

    // Sort: Ibukota saat ini di paling atas, lalu urut abjad
    list.sort((a, b) => {
      if (a.isCurrentCapital) return -1;
      if (b.isCurrentCapital) return 1;
      return a.name.localeCompare(b.name, "id-ID");
    });

    return list;
  }, [countryName, countryDetail?.iso, currentCapital]);

  const filteredCities = useMemo(() => {
    if (!searchTerm.trim()) return availableCities;
    return availableCities.filter((city) =>
      city.name.toLowerCase().includes(searchTerm.toLowerCase().trim())
    );
  }, [availableCities, searchTerm]);

  // Handle eksekusi pergantian ibukota
  const handleExecuteChange = () => {
    if (!selectedTargetCity) return;
    if (money < PINDAH_IBUKOTA_COST) return;
    if (isCooldownActive) return;

    // Hitung tanggal cooldown 5 tahun ke depan
    const cooldownDate = new Date(now.getTime());
    cooldownDate.setFullYear(cooldownDate.getFullYear() + PINDAH_IBUKOTA_COOLDOWN_YEARS);
    const cooldownIso = cooldownDate.toISOString();

    const newMoney = money - PINDAH_IBUKOTA_COST;

    // Simpan di window agar instan dibaca engine peta
    if (typeof window !== "undefined") {
      (window as Window & { neosantara_player_capital?: string }).neosantara_player_capital =
        selectedTargetCity;
    }

    // Update state global countryDetail
    setCountryDetail((prev: any) => ({
      ...prev,
      capital: selectedTargetCity,
      ibukota: selectedTargetCity,
      anggaran: newMoney,
      capital_change_cooldown_until: cooldownIso,
      capital_last_changed_date: now.toISOString(),
    }));

    // Trigger event agar map-system segera merefresh layout teks ibukota kuning WASM
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("neosantara_capital_changed", {
          detail: {
            newCapital: selectedTargetCity,
            oldCapital: currentCapital,
            country: countryName,
          },
        })
      );
    }

    setSelectedTargetCity(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {!selectedTargetCity && (
        <NotebookModalWrapper onClose={onClose} zIndexClass="z-[70]">
        <div className="flex flex-col h-full overflow-hidden font-sans">
          {/* Header */}
          <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-[#00FFAA]/30 flex items-center justify-between bg-[#0A1A1A] relative z-10 shrink-0">
            <div className="flex items-center gap-3 sm:gap-6 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-[#FFE600]/15 rounded-lg border border-[#FFE600]/30 text-[#FFE600]">
                  <Landmark className="h-5 w-5 shrink-0" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-[#E0E0E0] tracking-wide uppercase flex items-center gap-2">
                    Relokasi & Pergantian Ibukota
                    <span className="text-[10px] bg-[#FFE600]/20 text-[#FFE600] px-2 py-0.5 rounded border border-[#FFE600]/30 font-bold uppercase">
                      Kementerian
                    </span>
                  </h3>
                  <p className="text-[11px] text-[#6B8A8A]">
                    Pilih kota strategis untuk dijadikan pusat pemerintahan nasional
                  </p>
                </div>
              </div>

              {/* Status Ibukota & Biaya */}
              <div className="flex items-center gap-2 bg-[#0F2424] px-3 py-1 rounded-lg border border-[#FFE600]/25">
                <span className="text-[11px] text-[#A2B7B2]">Saat Ini:</span>
                <span className="text-xs font-black text-[#FFE600] uppercase flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  {currentCapital}
                </span>
              </div>

              <div className="text-[11px] sm:text-xs font-bold text-[#00FFAA] bg-[#0F2424] px-3 py-1 rounded-lg border border-[#00FFAA]/20 flex items-center gap-1.5">
                <Coins className="h-3.5 w-3.5 text-[#00FFAA]" />
                <span>Biaya: {PINDAH_IBUKOTA_COST.toLocaleString("id-ID")} NEO</span>
              </div>

              {isCooldownActive && cooldownUntilDate ? (
                <div className="flex items-center gap-1 text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/25 text-[11px] font-semibold">
                  <Clock className="h-3.5 w-3.5" />
                  <span>
                    Cooldown s.d.{" "}
                    {cooldownUntilDate.toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/25 text-[11px] font-bold">
                  <CheckCircle className="h-3.5 w-3.5" />
                  <span>Siap Dipindahkan</span>
                </div>
              )}
            </div>

            <button
              onClick={onClose}
              className="p-1.5 lg:p-2 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] text-[#6B8A8A] hover:text-[#00FFAA] hover:border-[#00FFAA] transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1 shadow-sm shrink-0"
            >
              <span className="text-[10px] lg:text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="p-3 sm:p-4 border-b border-[#00FFAA]/20 bg-[#0A1A1A] shrink-0">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B8A8A]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari nama kota besar..."
                className="w-full bg-[#0F2424] border border-[#00FFAA]/25 rounded-xl pl-10 pr-4 py-2 text-xs text-[#E0E0E0] placeholder-[#6B8A8A] focus:outline-none focus:border-[#00FFAA] transition-colors"
              />
            </div>
          </div>

          {/* List Kota */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 neon-scrollbar bg-[#0F2424]">
            {filteredCities.length === 0 ? (
              <div className="py-16 text-center text-[#6B8A8A] text-xs">
                Tidak ada kota yang cocok dengan pencarian "{searchTerm}".
              </div>
            ) : (
              filteredCities.map((city) => {
                const isSelected = city.isCurrentCapital;
                return (
                  <div
                    key={city.name}
                    className={`p-4 rounded-xl border transition-all flex items-center justify-between ${
                      isSelected
                        ? "bg-[#FFE600]/10 border-[#FFE600]/50 shadow-[0_0_15px_rgba(255,230,0,0.1)]"
                        : "bg-[#0A1A1A] border-[#00FFAA]/15 hover:border-[#00FFAA]/40 hover:bg-[#0F2424]"
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`p-2.5 rounded-xl border ${
                          isSelected
                            ? "bg-[#FFE600]/20 border-[#FFE600]/40 text-[#FFE600]"
                            : "bg-[#00FFAA]/10 border-[#00FFAA]/20 text-[#00FFAA]"
                        }`}
                      >
                        <MapPin className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-sm sm:text-base font-extrabold ${
                              isSelected ? "text-[#FFE600]" : "text-[#E0E0E0]"
                            }`}
                          >
                            {city.name}
                          </span>
                          {isSelected && (
                            <span className="text-[10px] bg-[#FFE600] text-[#0A1A1A] font-black px-2 py-0.5 rounded uppercase tracking-wider">
                              Ibukota Saat Ini
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-[#6B8A8A]">
                          Koordinat: {city.lat.toFixed(2)}°, {city.lng.toFixed(2)}°
                        </span>
                      </div>
                    </div>

                    <div>
                      {isSelected ? (
                        <span className="text-xs font-bold text-[#FFE600] px-3 py-1.5 flex items-center gap-1.5">
                          <CheckCircle className="h-4 w-4" />
                          Aktif
                        </span>
                      ) : (
                        <button
                          onClick={() => setSelectedTargetCity(city.name)}
                          disabled={isCooldownActive || money < PINDAH_IBUKOTA_COST}
                          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                            isCooldownActive || money < PINDAH_IBUKOTA_COST
                              ? "bg-gray-800 text-gray-500 border border-gray-700 cursor-not-allowed opacity-50"
                              : "bg-[#00FFAA] hover:bg-[#00FFAA]/90 text-[#0A1A1A] shadow-[0_0_12px_rgba(0,255,170,0.25)] active:scale-95"
                          }`}
                        >
                          Pilih Ibukota
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Warning */}
          <div className="px-5 py-3 border-t border-[#00FFAA]/20 bg-[#0A1A1A] shrink-0 flex items-center justify-between text-xs text-[#6B8A8A]">
            <div className="flex items-center gap-1.5">
              <AlertCircle className="h-4 w-4 text-[#00FFAA] shrink-0" />
              <span>
                Pemindahan ibukota memerlukan biaya 150.000 NEO dan dikenakan masa cooldown selama 5 tahun.
              </span>
            </div>

            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] text-[#E0E0E0] hover:text-[#00FFAA] transition-colors font-semibold cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      </NotebookModalWrapper>
      )}

      {/* Modal Konfirmasi Pergantian */}
      {selectedTargetCity && (
        <KonfirmasiGantiIbukotaModal
          isOpen={Boolean(selectedTargetCity)}
          onClose={() => setSelectedTargetCity(null)}
          targetCity={selectedTargetCity}
          currentCapital={currentCapital}
          countryMoney={money}
          currentDate={currentDate}
          onConfirm={handleExecuteChange}
        />
      )}
    </>
  );
}
