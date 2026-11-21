"use client";

import SharedModalCloseButton from '@/app/page/root_modals_design_menu/ModalCloseButton';
import React, { useState, useMemo } from "react";
import {
  X,
  Landmark,
  Search,
  CheckCircle,
  MapPin,
} from "lucide-react";
import { CAPITALS_DATA } from "@/app/page/map_system/map-data";
import { majorCities as MAJOR_CITIES_DATA } from "@/app/page/map_system/mapDataAssets";
import NotebookModalWrapper from "@/app/page/navigasi_menu/2_navigasi_bawah/NotebookModalWrapper";
import KonfirmasiGantiIbukotaModal, {
  PINDAH_IBUKOTA_COST,
  PINDAH_IBUKOTA_COOLDOWN_YEARS,
} from "./KonfirmasiGantiIbukotaModal";
import { useKementerianMenuTranslation } from "@/app/page/paused_menu/terjemahan_paused_menu/useKementerianMenuTranslation";

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
  const { language, ministry: tr } = useKementerianMenuTranslation();
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
      return a.name.localeCompare(b.name, language);
    });

    return list;
  }, [countryName, countryDetail?.iso, currentCapital, language]);

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
          <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-root-accent/30 flex items-center justify-between bg-root-canvas relative z-10 shrink-0">
            <div className="flex items-center gap-3 sm:gap-6 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-[#FFE600]/15 rounded-lg border border-[#FFE600]/30 text-[#FFE600]">
                  <Landmark className="h-5 w-5 shrink-0" />
                </div>
                <div>
                  <h3 className="text-[length:var(--modal-font-title)] font-bold text-root-text tracking-wide uppercase flex items-center gap-2">
                    {tr("capital.relocationTitle")}
                    <span className="max-w-[40vw] truncate rounded border border-[#FFE600]/30 bg-[#FFE600]/20 px-2 py-0.5 text-[10px] font-bold uppercase text-[#FFE600]">
                      {currentCapital}
                    </span>
                  </h3>
                </div>
              </div>

            </div>

            <SharedModalCloseButton
              onClick={onClose}
              className="p-1.5 lg:p-2 rounded-xl border border-root-accent/30 bg-root-surface text-root-subtle hover:text-root-accent hover:border-root-accent transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1 shadow-sm shrink-0"
             appearance="custom">
              <span className="text-[10px] lg:text-xs font-semibold uppercase tracking-widest pl-1">{tr("common.close")}</span>
              <X className="h-4 w-4" />
            </SharedModalCloseButton>
          </div>

          {/* Search Bar */}
          <div className="relative z-10 flex shrink-0 items-center justify-end border-b border-root-accent/20 bg-root-canvas px-4 py-2 sm:px-6">
            <div className="relative w-full sm:max-w-64">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-root-accent/60" />
              <input
                type="search"
                aria-label={tr("capital.search")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={tr("capital.searchPlaceholder")}
                className="h-9 w-full rounded-xl border border-root-accent/30 bg-[#051111] py-1 pl-8 pr-3 text-xs text-root-text placeholder-root-subtle transition-colors focus:border-root-accent focus:outline-none"
              />
            </div>
          </div>

          {/* List Kota */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 neon-scrollbar bg-root-surface">
            {filteredCities.length === 0 ? (
              <div className="py-16 text-center text-root-subtle text-xs">
                {tr("capital.noCityMatch", { query: searchTerm })}
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
                        : "bg-root-canvas border-root-accent/15 hover:border-root-accent/40 hover:bg-root-surface"
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`p-2.5 rounded-xl border ${
                          isSelected
                            ? "bg-[#FFE600]/20 border-[#FFE600]/40 text-[#FFE600]"
                            : "bg-root-accent/10 border-root-accent/20 text-root-accent"
                        }`}
                      >
                        <MapPin className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-sm sm:text-base font-extrabold ${
                              isSelected ? "text-[#FFE600]" : "text-root-text"
                            }`}
                          >
                            {city.name}
                          </span>
                          {isSelected && (
                            <span className="text-[10px] bg-[#FFE600] text-root-canvas font-black px-2 py-0.5 rounded uppercase tracking-wider">
                              {tr("capital.current")}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-root-subtle">
                          {city.lat.toFixed(2)}°, {city.lng.toFixed(2)}°
                        </span>
                      </div>
                    </div>

                    <div>
                      {isSelected ? (
                        <span className="text-xs font-bold text-[#FFE600] px-3 py-1.5 flex items-center gap-1.5">
                          <CheckCircle className="h-4 w-4" />
                          {tr("common.active")}
                        </span>
                      ) : (
                        <button
                          onClick={() => setSelectedTargetCity(city.name)}
                          disabled={isCooldownActive || money < PINDAH_IBUKOTA_COST}
                          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                            isCooldownActive || money < PINDAH_IBUKOTA_COST
                              ? "bg-gray-800 text-gray-500 border border-gray-700 cursor-not-allowed opacity-50"
                              : "bg-root-accent hover:bg-root-accent/90 text-root-canvas shadow-[0_0_12px_rgba(0,255,170,0.25)] active:scale-95"
                          }`}
                        >
                          {tr("capital.select")}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
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