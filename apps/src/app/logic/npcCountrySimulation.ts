"use client";

import { useEffect, useState } from "react";
import {
  calculateNetBalanceWithEconomicEmbargo,
  getEconomicEmbargoProductionMultiplier,
} from "@/app/page/navigasi_menu/2_navigasi_bawah/7_geopolitik/1_PBB/1_resolusi_PBB/logic/3_economicEmbargoLogic";
import { calculateDailyMaterialProduction } from "@/app/page/navigasi_menu/2_navigasi_bawah/5_pembangunan/build_logic/build_logic";
import {
  calculateDailyPopulationChange,
  updateDailyPopulation,
} from "@/app/logic/populations_logic/population_logic";

const NPC_SIMULATION_STORAGE_PREFIX = "neosantara_npc_simulation_v1:";
const NPC_SIMULATION_ACTIVE_CAMPAIGN_KEY = "neosantara_npc_simulation_active_campaign";
export const NPC_COUNTRY_SIMULATION_UPDATED_EVENT = "neosantara:npc-country-simulation-updated";

type CountryRecord = Record<string, any> & { jumlah_penduduk: number };

interface NpcSimulationState {
  version: 1;
  playerCountrySlug: string;
  lastSimulatedDate: string;
  countries: Record<string, Record<string, unknown>>;
}

function normalizeSlug(value: unknown): string {
  return String(value || "").trim().toLowerCase();
}

function isValidDateString(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function toDateString(value: Date | string): string | null {
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null;
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  const match = String(value).match(/^(\d{4}-\d{2}-\d{2})/);
  return match && isValidDateString(match[1]) ? match[1] : null;
}

function nextDate(date: string): string {
  const value = new Date(`${date}T00:00:00.000Z`);
  value.setUTCDate(value.getUTCDate() + 1);
  return value.toISOString().slice(0, 10);
}

function getStorageKey(playerCountrySlug: string): string {
  return `${NPC_SIMULATION_STORAGE_PREFIX}${encodeURIComponent(playerCountrySlug)}`;
}

export function clearActiveNpcCountrySimulationState(): void {
  if (typeof window === "undefined") return;

  try {
    const activeCampaignKey = window.localStorage.getItem(NPC_SIMULATION_ACTIVE_CAMPAIGN_KEY);
    if (activeCampaignKey) window.localStorage.removeItem(activeCampaignKey);
    window.localStorage.removeItem(NPC_SIMULATION_ACTIVE_CAMPAIGN_KEY);
  } catch (error) {
    console.error("Gagal menghapus state simulasi NPC dari LocalStorage:", error);
  }
}

function readSimulationState(key: string): NpcSimulationState | null {
  try {
    const serialized = window.localStorage.getItem(key);
    if (!serialized) return null;

    const state = JSON.parse(serialized) as Partial<NpcSimulationState>;
    if (
      state.version !== 1 ||
      typeof state.playerCountrySlug !== "string" ||
      typeof state.lastSimulatedDate !== "string" ||
      !isValidDateString(state.lastSimulatedDate) ||
      !state.countries ||
      typeof state.countries !== "object"
    ) {
      throw new Error("Format state simulasi NPC di LocalStorage tidak valid.");
    }

    return state as NpcSimulationState;
  } catch (error) {
    console.error("Gagal membaca state simulasi NPC dari LocalStorage:", error);
    return null;
  }
}

function getMutableCountryState(country: CountryRecord): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(country).filter(([key]) =>
      key === "anggaran" ||
      key === "jumlah_penduduk" ||
      key === "accumulated_births" ||
      key === "accumulated_deaths" ||
      key === "laju_pertumbuhan" ||
      key === "food_supply_ratio" ||
      key === "food_deficit_tier" ||
      key === "housing_fulfillment" ||
      key === "housing_deficit_tier" ||
      key === "overpop_tier" ||
      key === "health_tier" ||
      key === "population_status" ||
      key.startsWith("inventory_") ||
      key.startsWith("last_update_date_")
    )
  );
}

function simulateCountryDay(
  country: CountryRecord,
  date: string,
  previousDate: string,
  metadata: Record<string, any>
): CountryRecord {
  const countryName = String(
    country.name_id || country.nama_negara || country.country || country.country_name || ""
  );
  const materialResult = calculateDailyMaterialProduction(
    country,
    metadata,
    date,
    resourceKey => getEconomicEmbargoProductionMultiplier(countryName, resourceKey),
    previousDate
  );
  const withProduction = materialResult.hasUpdates
    ? { ...country, ...materialResult.updates }
    : country;

  const populationMetrics = calculateDailyPopulationChange(
    withProduction,
    countryName,
    metadata,
    date
  );
  const withPopulation = {
    ...withProduction,
    ...updateDailyPopulation(
      withProduction,
      populationMetrics,
      countryName,
      metadata,
      date
    ),
  };

  return {
    ...withPopulation,
    anggaran:
      (Number(withPopulation.anggaran) || 0) +
      calculateNetBalanceWithEconomicEmbargo(withPopulation, countryName),
  };
}

function persistNpcSimulation(
  playerCountrySlug: string,
  currentDate: string,
  sourceCountries: CountryRecord[],
  metadata: Record<string, any>
): void {
  const storageKey = getStorageKey(playerCountrySlug);
  const previousState = readSimulationState(storageKey);
  const state: NpcSimulationState = previousState ?? {
    version: 1,
    playerCountrySlug,
    lastSimulatedDate: currentDate,
    countries: {},
  };

  window.localStorage.setItem(NPC_SIMULATION_ACTIVE_CAMPAIGN_KEY, storageKey);

  if (!previousState) {
    window.localStorage.setItem(storageKey, JSON.stringify(state));
    return;
  }
  if (currentDate <= state.lastSimulatedDate) return;

  const simulatedCountries = new Map<string, CountryRecord>();
  const annexedCountries =
    (window as Window & { neosantara_annexed_countries?: Record<string, unknown> })
      .neosantara_annexed_countries || {};
  for (const baseline of sourceCountries) {
    const slug = normalizeSlug(baseline.country_slug);
    if (!slug || slug === playerCountrySlug) continue;
    const countryName = normalizeSlug(
      baseline.name_id || baseline.nama_negara || baseline.country || baseline.country_name
    );
    const countryIso = normalizeSlug(baseline.iso);
    if (
      annexedCountries[slug] ||
      annexedCountries[countryName] ||
      annexedCountries[countryName.replace(/[^a-z0-9]/g, "")] ||
      (countryIso && (annexedCountries[countryIso] || annexedCountries[`iso_${countryIso}`]))
    ) {
      continue;
    }

    simulatedCountries.set(slug, {
      ...baseline,
      ...(state.countries[slug] || {}),
      religion: baseline.religion,
      ideology: baseline.ideology,
    });
  }

  let simulationDate = state.lastSimulatedDate;
  while (simulationDate < currentDate) {
    const previousDate = simulationDate;
    simulationDate = nextDate(simulationDate);
    for (const [slug, country] of simulatedCountries) {
      simulatedCountries.set(
        slug,
        simulateCountryDay(country, simulationDate, previousDate, metadata)
      );
    }
  }

  for (const [slug, country] of simulatedCountries) {
    state.countries[slug] = getMutableCountryState(country);
  }
  state.lastSimulatedDate = currentDate;
  window.localStorage.setItem(storageKey, JSON.stringify(state));
  window.dispatchEvent(new CustomEvent(NPC_COUNTRY_SIMULATION_UPDATED_EVENT));
}

export function applyNpcCountrySimulationState<T extends Record<string, any>>(country: T): T {
  if (typeof window === "undefined") return country;

  try {
    const activeCampaignKey = window.localStorage.getItem(NPC_SIMULATION_ACTIVE_CAMPAIGN_KEY);
    if (!activeCampaignKey) return country;
    const state = readSimulationState(activeCampaignKey);
    if (!state) return country;

    const slug = normalizeSlug(country.country_slug);
    if (!slug || slug === state.playerCountrySlug) return country;
    const countryState = state.countries[slug];
    if (!countryState) return country;

    return {
      ...country,
      ...countryState,
      religion: country.religion,
      ideology: country.ideology,
    };
  } catch (error) {
    console.error("Gagal menerapkan state simulasi NPC:", error);
    return country;
  }
}

export function useNpcCountrySimulation(
  currentDate: Date | string | null | undefined,
  playerCountrySlug: unknown,
  metadata: Record<string, any>
): void {
  const [countries, setCountries] = useState<CountryRecord[]>([]);
  const [loadedForPlayerSlug, setLoadedForPlayerSlug] = useState("");
  const normalizedPlayerSlug = normalizeSlug(playerCountrySlug);
  const currentDateString = currentDate ? toDateString(currentDate) : null;

  useEffect(() => {
    if (!normalizedPlayerSlug) {
      setCountries([]);
      setLoadedForPlayerSlug("");
      return;
    }

    setCountries([]);
    setLoadedForPlayerSlug("");
    try {
      window.localStorage.setItem(
        NPC_SIMULATION_ACTIVE_CAMPAIGN_KEY,
        getStorageKey(normalizedPlayerSlug)
      );
    } catch (error) {
      console.error("Gagal memilih campaign simulasi NPC di LocalStorage:", error);
    }

    let isCurrent = true;
    fetch("/api/country-data?all=true", { cache: "no-store" })
      .then(async response => {
        if (!response.ok) {
          throw new Error(`Gagal memuat negara untuk simulasi NPC: HTTP ${response.status}`);
        }
        const data = await response.json();
        if (!Array.isArray(data)) {
          throw new Error("Data negara NPC dari API bukan berupa daftar.");
        }
        if (isCurrent) {
          setCountries(data);
          setLoadedForPlayerSlug(normalizedPlayerSlug);
        }
      })
      .catch(error => {
        console.error("Simulasi NPC tidak dapat memuat data negara:", error);
      });

    return () => {
      isCurrent = false;
    };
  }, [normalizedPlayerSlug]);

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !normalizedPlayerSlug ||
      loadedForPlayerSlug !== normalizedPlayerSlug ||
      !currentDateString ||
      countries.length === 0 ||
      Object.keys(metadata).length === 0
    ) {
      return;
    }

    const timeoutId = setTimeout(() => {
      try {
        persistNpcSimulation(
          normalizedPlayerSlug,
          currentDateString,
          countries,
          metadata
        );
      } catch (error) {
        console.error("Gagal menyimpan state simulasi NPC ke LocalStorage:", error);
      }
    }, 50);

    return () => clearTimeout(timeoutId);
  }, [normalizedPlayerSlug, loadedForPlayerSlug, currentDateString, countries, metadata]);
}
