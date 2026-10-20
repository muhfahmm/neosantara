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
import {
  calculateKepuasan,
  calculateKeterbukaanScore,
  createSatisfactionSectorBaseline,
  countLowSatisfactionSectors,
  LOW_SECTOR_DECAY_INTERVAL_MONTHS,
  LOW_SECTOR_DECAY_MAX_POINTS_PER_INTERVAL,
  LOW_SECTOR_DECAY_POINTS_PER_SECTOR,
} from "@/app/logic/kepuasanCalculator";
import {
  calculateKesejahteraan,
  calculateKesejahteraanDecay,
} from "@/app/logic/kesejahteraanCalculator";
import { calculatePresidentRating, getMonthsDifference } from "@/app/logic/peringkatCalculator";
import { runNpcCountryBrain } from "@/app/logic/npc_ai_brain/orchestrator";
import { evaluateAndControlDemographics } from "@/app/logic/npc_ai_brain/demographics/demographicControllerAI";
import { isNegaraNuklirBawaan, getNegaraNuklirBaseIcbm } from "@/app/logic/npc_ai_brain/military/nuclearControllerAI";

export const NPC_COUNTRY_SIMULATION_UPDATED_EVENT = "neosantara:npc-country-simulation-updated";

type CountryRecord = Record<string, any> & { jumlah_penduduk: number };

export interface NpcSimulationState {
  version: 1;
  playerCountrySlug: string;
  lastSimulatedDate: string;
  countries: Record<string, Record<string, unknown>>;
}

interface PendingSimulationJob {
  playerCountrySlug: string;
  currentDate: string;
  countries: CountryRecord[];
  metadata: Record<string, any>;
}

let activeNpcSimulationState: NpcSimulationState | null = null;
let simulationQueue: Promise<void> = Promise.resolve();
let pendingSimulationJob: PendingSimulationJob | null = null;
let pendingSimulationTimer: number | null = null;
let simulationGeneration = 0;

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

export function clearActiveNpcCountrySimulationState(): void {
  simulationGeneration += 1;
  activeNpcSimulationState = null;
  pendingSimulationJob = null;
  if (pendingSimulationTimer !== null && typeof window !== "undefined") {
    window.clearTimeout(pendingSimulationTimer);
  }
  pendingSimulationTimer = null;
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(NPC_COUNTRY_SIMULATION_UPDATED_EVENT));
  }
}

export function getNpcCountrySimulationSnapshot(): NpcSimulationState | null {
  if (!activeNpcSimulationState) return null;
  return JSON.parse(JSON.stringify(activeNpcSimulationState)) as NpcSimulationState;
}

export function updateNpcCountrySimulationState(
  countrySlug: string,
  updates: Record<string, unknown>,
): boolean {
  const state = activeNpcSimulationState;
  const slug = normalizeSlug(countrySlug);
  if (!state || !slug || slug === state.playerCountrySlug) return false;

  state.countries[slug] = {
    ...(state.countries[slug] || {}),
    ...updates,
  };
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(NPC_COUNTRY_SIMULATION_UPDATED_EVENT));
  }
  return true;
}

export function restoreNpcCountrySimulationState(value: unknown): void {
  simulationGeneration += 1;
  pendingSimulationJob = null;
  if (pendingSimulationTimer !== null && typeof window !== "undefined") {
    window.clearTimeout(pendingSimulationTimer);
  }
  pendingSimulationTimer = null;
  if (value === null || value === undefined) {
    activeNpcSimulationState = null;
    return;
  }

  if (!value || typeof value !== "object") {
    throw new Error("Format state simulasi NPC di save tidak valid.");
  }
  const state = value as Partial<NpcSimulationState>;
  if (
    state.version !== 1 ||
    typeof state.playerCountrySlug !== "string" ||
    typeof state.lastSimulatedDate !== "string" ||
    !isValidDateString(state.lastSimulatedDate) ||
    !state.countries ||
    typeof state.countries !== "object" ||
    Array.isArray(state.countries)
  ) {
    throw new Error("Format state simulasi NPC di save tidak valid.");
  }
  activeNpcSimulationState = state as NpcSimulationState;
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
      key === "armada" ||
      key === "kepuasan" ||
      key === "npc_country_metrics_initialized" ||
      key === "satisfaction_sector_baseline" ||
      key === "presidentRating" ||
      key === "rating_month_counter" ||
      key === "last_rating_threshold" ||
      key === "kesejahteraan" ||
      key === "kesejahteraan_bonus" ||
      key === "kesejahteraan_decay" ||
      key === "kesejahteraan_month_counter" ||
      key === "last_kesejahteraan_threshold" ||
      key === "sector_deficit_month_counter" ||
      key === "sector_deficit_kepuasan_penalty" ||
      key === "ai_brain_state" ||
      key === "ai_civilian_construction_queue" ||
      key === "ai_military_infra_queue" ||
      key === "ai_military_unit_queue" ||
      key === "ai_nuclear_queue" ||
      key === "programNuklirActive" ||
      key === "icbm_status" ||
      key === "icbm_jumlah" ||
      key === "icbmBuildTask" ||
      key === "ongoingConstructions" ||
      key === "opennessIndex" ||
      key === "speechScore" ||
      key === "religionScore" ||
      key === "demoScore" ||
      key === "transparencyScore" ||
      key === "mediaScore" ||
      key === "internetScore" ||
      key === "borderScore" ||
      key === "tradeScore" ||
      key === "diplomacyScore" ||
      key === "pajak" ||
      key === "ppn" ||
      key === "corporate" ||
      key === "income_tax" ||
      key === "cigarette_tax" ||
      key === "environment_tax" ||
      key === "harga" ||
      key === "sistem_ekonomi_val" ||
      key.startsWith("policy_") ||
      key === "subsidy_states" ||
      key.startsWith("inventory_") ||
      key.startsWith("build_date_") ||
      key.startsWith("last_update_date_") ||
      typeof country[key] === "number" // izinkan penambahan jumlah bangunan oleh AI
    )
  );
}

function initializeNpcCountryMetrics(
  country: CountryRecord,
  metadata: Record<string, any>,
): CountryRecord {
  const initialized: CountryRecord = { ...country };
  const wasInitialized = initialized.npc_country_metrics_initialized === true;
  initialized.kepuasan = Number(initialized.kepuasan ?? 50);
  initialized.presidentRating = Number(
    initialized.presidentRating ??
    initialized.president_rating ??
    initialized.rating_presiden ??
    initialized.peringkat ??
    50
  );
  initialized.rating_month_counter = Number(initialized.rating_month_counter ?? 0);
  initialized.last_rating_threshold = Number(initialized.last_rating_threshold ?? 12);
  initialized.kesejahteraan = Number(
    initialized.kesejahteraan ?? initialized.indeks_kesejahteraan ?? 50
  );
  initialized.kesejahteraan_bonus = Number(initialized.kesejahteraan_bonus ?? 0);
  initialized.kesejahteraan_decay = Number(initialized.kesejahteraan_decay ?? 0);
  initialized.kesejahteraan_month_counter = Number(initialized.kesejahteraan_month_counter ?? 0);
  initialized.last_kesejahteraan_threshold = Number(initialized.last_kesejahteraan_threshold ?? 12);
  initialized.sector_deficit_month_counter = Number(initialized.sector_deficit_month_counter ?? 0);
  initialized.sector_deficit_kepuasan_penalty = Number(initialized.sector_deficit_kepuasan_penalty ?? 0);
  initialized.satisfaction_sector_baseline ??= createSatisfactionSectorBaseline(initialized, metadata);
  initialized.anggaran = Number(
    initialized.anggaran ??
    initialized.kas_negara ??
    initialized.kas ??
    100_000
  );
  initialized.jumlah_penduduk = Number(
    initialized.jumlah_penduduk ??
    initialized.populasi ??
    10_000_000
  );
  if (!wasInitialized) {
    initialized.kepuasan = calculateKepuasan(initialized, metadata);
    initialized.kesejahteraan = calculateKesejahteraan(
      initialized,
      metadata,
      initialized.kesejahteraan,
    ).overallScore;
    initialized.npc_country_metrics_initialized = true;
  }

  // Jika negara adalah salah satu dari 5 negara pemilik nuklir default dunia (AS, Rusia, China, Korut, India),
  // pastikan status Program Nuklir selalu AKTIF dan bersih dari antrean riset program nuklir!
  const isDefaultNuclear = isNegaraNuklirBawaan(
    String(initialized.country_slug || ""),
    String(initialized.name_id || initialized.nama_negara || initialized.country || ""),
    String(initialized.iso || "")
  );
  if (isDefaultNuclear) {
    initialized.programNuklirActive = true;
    const baseIcbm = getNegaraNuklirBaseIcbm(
      String(initialized.country_slug || ""),
      String(initialized.name_id || initialized.nama_negara || initialized.country || ""),
      String(initialized.iso || "")
    );
    if (initialized.icbm_jumlah === undefined || initialized.icbm_jumlah === null || Number(initialized.icbm_jumlah) < baseIcbm) {
      initialized.icbm_jumlah = baseIcbm;
      initialized.icbm_status = baseIcbm > 0;
    }
    if (Array.isArray(initialized.ai_nuclear_queue)) {
      initialized.ai_nuclear_queue = initialized.ai_nuclear_queue.filter((q: any) => q.type !== "program_nuklir");
    }
    if (Array.isArray(initialized.ongoingConstructions)) {
      initialized.ongoingConstructions = initialized.ongoingConstructions.filter((c: any) => c.buildingKey !== "program_nuklir");
    }
  }

  return initialized;
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
    previousDate
  );
  const withPopulation: CountryRecord = {
    ...withProduction,
    ...updateDailyPopulation(
      withProduction,
      populationMetrics,
      countryName,
      metadata,
      date
    ),
  };

  const monthsPassed = Math.max(0, getMonthsDifference(previousDate, date));
  const lowSectorCount = countLowSatisfactionSectors(country, metadata);
  const previousDeficitMonths = Math.max(0, Number(country.sector_deficit_month_counter) || 0);
  const accumulatedDeficitMonths = lowSectorCount > 0
    ? previousDeficitMonths + monthsPassed
    : 0;
  const completedDeficitPeriods = lowSectorCount > 0
    ? Math.floor(accumulatedDeficitMonths / LOW_SECTOR_DECAY_INTERVAL_MONTHS)
    : 0;
  const sectorDeficitPenaltyThisTick = completedDeficitPeriods * Math.min(
    LOW_SECTOR_DECAY_MAX_POINTS_PER_INTERVAL,
    lowSectorCount * LOW_SECTOR_DECAY_POINTS_PER_SECTOR,
  );
  const sectorDeficitMonthCounter = lowSectorCount > 0
    ? accumulatedDeficitMonths % LOW_SECTOR_DECAY_INTERVAL_MONTHS
    : 0;
  const accumulatedSectorPenalty = lowSectorCount > 0
    ? Math.max(0, Number(country.sector_deficit_kepuasan_penalty) || 0) +
      sectorDeficitPenaltyThisTick
    : 0;
  const nextKepuasan = Math.max(
    0,
    Math.min(
      100,
      parseFloat(
        (
          Number(country.kepuasan ?? 50) -
          sectorDeficitPenaltyThisTick
        ).toFixed(1),
      ),
    ),
  );
  const withSatisfaction: CountryRecord = {
    ...withPopulation,
    kepuasan: nextKepuasan,
    sector_deficit_month_counter: sectorDeficitMonthCounter,
    sector_deficit_kepuasan_penalty: accumulatedSectorPenalty,
  };
  const keterbukaanScore = calculateKeterbukaanScore(country);
  const ratingResult = calculatePresidentRating({
    currentRating: Number(country.presidentRating ?? 50),
    ratingMonthCounter: Number(country.rating_month_counter) || 0,
    lastRatingThreshold: Number(country.last_rating_threshold) || 12,
    monthsPassed,
    currentKepuasan: nextKepuasan,
    keterbukaanScore,
    lowSectorCount,
    additionalDecay: sectorDeficitPenaltyThisTick,
    countryDetail: country,
    lastDate: previousDate,
    currentDate: date,
  });
  const welfareResult = calculateKesejahteraanDecay({
    currentKesejahteraan: Number(country.kesejahteraan ?? 50),
    kesejahteraanMonthCounter: Number(country.kesejahteraan_month_counter) || 0,
    lastKesejahteraanThreshold: Number(country.last_kesejahteraan_threshold) || 12,
    monthsPassed,
    currentKepuasan: nextKepuasan,
    keterbukaanScore,
    lowSectorCount,
    additionalDecay: sectorDeficitPenaltyThisTick,
  });

  const withSimulation: CountryRecord = {
    ...withSatisfaction,
    presidentRating: ratingResult.presidentRating,
    rating_month_counter: ratingResult.rating_month_counter,
    last_rating_threshold: ratingResult.last_rating_threshold,
    kesejahteraan: welfareResult.nextKesejahteraan,
    kesejahteraan_bonus: Number(country.kesejahteraan_bonus) || 0,
    kesejahteraan_decay:
      (Number(country.kesejahteraan_decay) || 0) + welfareResult.decayThisTick,
    kesejahteraan_month_counter: welfareResult.kesejahteraan_month_counter,
    last_kesejahteraan_threshold: welfareResult.last_kesejahteraan_threshold,
    anggaran:
      (Number(withSatisfaction.anggaran) || 0) +
      calculateNetBalanceWithEconomicEmbargo(withSatisfaction, countryName),
  };

  // Eksekusi Otak AI Negara NPC (9 Indikator & Pembangunan Sektor)
  const brainExecution = runNpcCountryBrain(withSimulation, metadata, date);
  const updatedNpcCountry = brainExecution.updatedCountry as CountryRecord;

  // Evaluasi dan Kontrol Demografi Cerdas oleh AI (Pajak, Harga, Sistem Ekonomi, Subsidi)
  // Memastikan laju pertumbuhan tidak boleh minus, menjaga rentang minimal +1 s/d +500 jiwa/hari
  const currentNetGrowth = Number(updatedNpcCountry.laju_pertumbuhan ?? populationMetrics.netDailyChange ?? 0);
  const currentPop = Math.max(0, Number(updatedNpcCountry.jumlah_penduduk) || 10_000_000);
  evaluateAndControlDemographics(updatedNpcCountry, currentNetGrowth, currentPop);

  return updatedNpcCountry;
}

function yieldToBrowser(): Promise<void> {
  return new Promise(resolve => {
    const idleWindow = window as Window & {
      requestIdleCallback?: (
        callback: (deadline: { timeRemaining: () => number; didTimeout: boolean }) => void,
        options?: { timeout: number }
      ) => number;
    };
    if (idleWindow.requestIdleCallback) {
      idleWindow.requestIdleCallback(() => resolve(), { timeout: 500 });
      return;
    }
    window.setTimeout(resolve, 32);
  });
}

async function persistNpcSimulation(
  playerCountrySlug: string,
  currentDate: string,
  sourceCountries: CountryRecord[],
  metadata: Record<string, any>
): Promise<void> {
  const generation = simulationGeneration;
  const previousState = activeNpcSimulationState?.playerCountrySlug === playerCountrySlug
    ? activeNpcSimulationState
    : null;
  const state: NpcSimulationState = previousState ?? {
    version: 1,
    playerCountrySlug,
    lastSimulatedDate: currentDate,
    countries: {},
  };

  if (!previousState) {
    for (const country of sourceCountries) {
      const slug = normalizeSlug(country.country_slug);
      if (!slug || slug === playerCountrySlug) continue;
      state.countries[slug] = getMutableCountryState(
        initializeNpcCountryMetrics(country, metadata),
      );
    }
    activeNpcSimulationState = state;
    window.dispatchEvent(new CustomEvent(NPC_COUNTRY_SIMULATION_UPDATED_EVENT));
    return;
  }
  // Jika permainan sedang dijeda (paused), AI tidak boleh melakukan aktivitas/simulasi pertambahan hari
  const isGlobalPaused = typeof window !== "undefined" && Boolean((window as any).neosantara_is_paused);
  if (isGlobalPaused) return;

  if (currentDate < state.lastSimulatedDate) return;
  if (
    currentDate === state.lastSimulatedDate &&
    sourceCountries.every(country => {
      const slug = normalizeSlug(country.country_slug);
      return !slug || slug === playerCountrySlug ||
        state.countries[slug]?.npc_country_metrics_initialized === true;
    })
  ) {
    return;
  }

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

    simulatedCountries.set(slug, initializeNpcCountryMetrics({
      ...baseline,
      ...(state.countries[slug] || {}),
      religion: baseline.religion,
      ideology: baseline.ideology,
    }, metadata));
  }

  let simulationDate = state.lastSimulatedDate;
  while (simulationDate < currentDate) {
    const previousDate = simulationDate;
    simulationDate = nextDate(simulationDate);
    let sliceStartedAt = performance.now();
    for (const [slug, country] of simulatedCountries) {
      if (generation !== simulationGeneration) return;
      simulatedCountries.set(
        slug,
        simulateCountryDay(country, simulationDate, previousDate, metadata)
      );

      if (performance.now() - sliceStartedAt >= 2) {
        await yieldToBrowser();
        sliceStartedAt = performance.now();
      }
    }
  }

  for (const [slug, country] of simulatedCountries) {
    state.countries[slug] = getMutableCountryState(country);
  }
  state.lastSimulatedDate = currentDate;
  if (generation !== simulationGeneration) return;
  activeNpcSimulationState = state;
  window.dispatchEvent(new CustomEvent(NPC_COUNTRY_SIMULATION_UPDATED_EVENT));
}

function applyCountrySimulationState<T extends Record<string, any>>(
  country: T,
  state: NpcSimulationState | null
): T {
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
}

export function applyNpcCountrySimulationStates<T extends Record<string, any>>(
  countries: readonly T[]
): T[] {
  return countries.map(country => applyCountrySimulationState(country, activeNpcSimulationState));
}

export function applyNpcCountrySimulationState<T extends Record<string, any>>(country: T): T {
  return applyNpcCountrySimulationStates([country])[0] ?? country;
}

export function useNpcCountrySimulation(
  currentDate: Date | string | null | undefined,
  playerCountrySlug: unknown,
  metadata: Record<string, any>,
  isPaused: boolean = false
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
    // Jika game dalam keadaan PAUSED, jangan jadwalkan atau jalankan simulasi AI NPC!
    const isGamePaused = isPaused || (typeof window !== "undefined" && Boolean((window as any).neosantara_is_paused));
    if (isGamePaused) {
      if (pendingSimulationTimer !== null && typeof window !== "undefined") {
        window.clearTimeout(pendingSimulationTimer);
        pendingSimulationTimer = null;
      }
      pendingSimulationJob = null;
      return;
    }

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

    pendingSimulationJob = {
      playerCountrySlug: normalizedPlayerSlug,
      currentDate: currentDateString,
      countries,
      metadata,
    };
    if (pendingSimulationTimer !== null) window.clearTimeout(pendingSimulationTimer);
    pendingSimulationTimer = window.setTimeout(() => {
      pendingSimulationTimer = null;
      void flushNpcCountrySimulation().catch(error => {
        console.error("Gagal menjalankan simulasi NPC:", error);
      });
    }, 250);
  }, [normalizedPlayerSlug, loadedForPlayerSlug, currentDateString, countries, metadata, isPaused]);
}

export async function flushNpcCountrySimulation(): Promise<void> {
  if (pendingSimulationTimer !== null && typeof window !== "undefined") {
    window.clearTimeout(pendingSimulationTimer);
    pendingSimulationTimer = null;
  }
  const job = pendingSimulationJob;
  pendingSimulationJob = null;
  let jobPromise = simulationQueue;
  if (job) {
    jobPromise = simulationQueue
      .catch(error => {
        console.error("Simulasi NPC sebelumnya gagal:", error);
      })
      .then(() => persistNpcSimulation(
        job.playerCountrySlug,
        job.currentDate,
        job.countries,
        job.metadata
      ));
    simulationQueue = jobPromise;
  }
  await jobPromise;
}
