"use client";

import { getCapitalCoord } from "../path-war";
import { getWarUnitComposition } from "../../detail_negara/3_operasi_militer/1_serang_negara/war_algoritm/warUnitComposition";

export interface StationedPeacekeeper {
  id: string;
  allyCountry: string;
  allyIso?: string;
  capital: string;
  lat: number;
  lng: number;
  power: number;
  deployedUnits: Record<string, number>;
  deployedUnitQuantities?: Record<string, number>;
  userArmadaSnapshot?: any;
  deployedAt: string;
}

export type PeacekeeperUnitCommitment = Partial<Pick<
  StationedPeacekeeper,
  "deployedUnitQuantities" | "userArmadaSnapshot" | "deployedUnits"
>>;

export const PEACEKEEPER_UPDATED_EVENT = "neosantara_peacekeeper_updated";

// In-memory store (hilang saat halaman di-refresh)
let inMemoryPeacekeepers: StationedPeacekeeper[] = [];
let inTransitPeacekeepers: Array<{
  id: string;
  allyCountry: string;
  deployedUnitQuantities: Record<string, number>;
}> = [];

export function getStationedPeacekeeperUnitQuantities(
  peacekeeper: Partial<Pick<
    StationedPeacekeeper,
    "deployedUnitQuantities" | "userArmadaSnapshot" | "deployedUnits"
  >> | null | undefined,
): Record<string, number> {
  if (!peacekeeper) return {};

  const savedQuantities = Object.fromEntries(
    Object.entries(peacekeeper.deployedUnitQuantities || {}).filter(
      ([, quantity]) => Number.isFinite(quantity) && quantity > 0,
    ),
  );
  if (Object.keys(savedQuantities).length > 0) return savedQuantities;

  return Object.fromEntries(
    getWarUnitComposition(
      peacekeeper.userArmadaSnapshot || {},
      peacekeeper.deployedUnits || {},
      true,
    ).flatMap((unit) => {
      if (!unit.catalogKey || !Number.isFinite(unit.quantity) || unit.quantity <= 0) return [];
      return [[unit.catalogKey === "barak" ? "pasukan_infanteri" : unit.catalogKey, unit.quantity]];
    }),
  );
}

export function restoreStationedPeacekeeperUnits(
  currentDetail: Record<string, unknown> | null,
  peacekeeper: PeacekeeperUnitCommitment,
): Record<string, unknown> | null {
  if (!currentDetail) return currentDetail;

  const quantities = getStationedPeacekeeperUnitQuantities(peacekeeper);
  if (Object.keys(quantities).length === 0) return currentDetail;

  const nextDetail = JSON.parse(JSON.stringify(currentDetail)) as Record<string, unknown>;
  const asRecord = (value: unknown): Record<string, unknown> =>
    value !== null && typeof value === "object" && !Array.isArray(value)
      ? value as Record<string, unknown>
      : {};
  const numberOrZero = (value: unknown): number => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
  };
  const maxQuantity = (...values: unknown[]): number =>
    Math.max(0, ...values.map(numberOrZero));
  const armada = { ...asRecord(nextDetail.armada) };

  for (const [unitKey, rawQuantity] of Object.entries(quantities)) {
    const quantity = numberOrZero(rawQuantity);
    if (quantity <= 0) continue;

    if (unitKey === "pasukan_infanteri" || unitKey === "barak") {
      const darat = asRecord(armada.darat);
      const currentInfantry = maxQuantity(
        nextDetail.pasukan_infanteri,
        armada.pasukan_infanteri,
        darat.pasukan_infanteri,
        numberOrZero(nextDetail.barak) * 800,
        numberOrZero(armada.barak) * 800,
        numberOrZero(darat.barak) * 800,
      );
      const restoredInfantry = currentInfantry + quantity;
      const barracks = Math.floor(restoredInfantry / 800);
      nextDetail.pasukan_infanteri = restoredInfantry;
      nextDetail.barak = barracks;
      armada.pasukan_infanteri = restoredInfantry;
      armada.barak = barracks;
      armada.darat = {
        ...darat,
        pasukan_infanteri: restoredInfantry,
        barak: barracks,
      };
      continue;
    }

    const group = unitKey.startsWith("kapal_")
      ? "laut"
      : /^(jet_|pesawat_|helikopter_|drone_)/.test(unitKey)
        ? "udara"
        : "darat";
    const groupDetail = asRecord(armada[group]);
    const restoredQuantity = maxQuantity(
      nextDetail[unitKey],
      armada[unitKey],
      groupDetail[unitKey],
    ) + quantity;
    nextDetail[unitKey] = restoredQuantity;
    armada[unitKey] = restoredQuantity;
    armada[group] = { ...groupDetail, [unitKey]: restoredQuantity };
  }

  nextDetail.armada = armada;
  return nextDetail;
}

export function getArmyWithStationedPeacekeepers(
  currentDetail: Record<string, unknown> | null,
  peacekeepers: readonly PeacekeeperUnitCommitment[] = loadPeacekeeperUnitCommitments(),
): Record<string, unknown> | null {
  return peacekeepers.reduce(
    (detail, peacekeeper) => restoreStationedPeacekeeperUnits(detail, peacekeeper),
    currentDetail,
  );
}

export function loadPeacekeeperDeploymentsInTransit(): PeacekeeperUnitCommitment[] {
  return inTransitPeacekeepers.map(({ deployedUnitQuantities }) => ({ deployedUnitQuantities }));
}

export function loadPeacekeeperUnitCommitments(): PeacekeeperUnitCommitment[] {
  return [...loadStationedPeacekeepers(), ...loadPeacekeeperDeploymentsInTransit()];
}

export function registerPeacekeeperInTransit(deployment: {
  id: string;
  allyCountry: string;
  deployedUnitQuantities: Record<string, number>;
}): void {
  inTransitPeacekeepers = [
    ...inTransitPeacekeepers.filter((item) => item.id !== deployment.id),
    deployment,
  ];
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(PEACEKEEPER_UPDATED_EVENT));
  }
}

export function loadStationedPeacekeepers(): StationedPeacekeeper[] {
  // Hanya simpan di memori runtime saat sesi permainan aktif
  // Ketika user me-refresh halaman (F5), tank penjaga perdamaian akan hilang/reset
  return [...inMemoryPeacekeepers];
}

export function saveStationedPeacekeepers(list: StationedPeacekeeper[]): void {
  inMemoryPeacekeepers = [...list];
  if (typeof window !== "undefined") {
    // Bersihkan storage lama jika sebelumnya tersimpan
    try {
      localStorage.removeItem("neosantara_stationed_peacekeepers");
    } catch {}
    window.dispatchEvent(new CustomEvent(PEACEKEEPER_UPDATED_EVENT, { detail: list }));
  }
}

export function addStationedPeacekeeper(
  pk: Omit<StationedPeacekeeper, "id">,
  deploymentId?: string,
): StationedPeacekeeper {
  if (deploymentId) {
    inTransitPeacekeepers = inTransitPeacekeepers.filter((item) => item.id !== deploymentId);
  }
  const current = loadStationedPeacekeepers();
  // Selalu pastikan koordinat terkunci di ibukota resmi sekutu
  const officialCoord = getCapitalCoord(pk.allyCountry);
  const targetLat = officialCoord?.lat ?? pk.lat;
  const targetLng = officialCoord?.lng ?? pk.lng;

  // Jika sudah ada kontingen di negara sekutu yang sama, gabungkan kekuatannya
  const normAlly = pk.allyCountry.toLowerCase().trim();
  const existingIndex = current.findIndex(
    item => item.allyCountry.toLowerCase().trim() === normAlly
  );

  let updatedList: StationedPeacekeeper[];
  let savedEntry: StationedPeacekeeper;

  if (existingIndex >= 0) {
    const existing = current[existingIndex];
    const combinedUnits = { ...existing.deployedUnits };
    for (const [key, qty] of Object.entries(pk.deployedUnits)) {
      combinedUnits[key] = (combinedUnits[key] || 0) + qty;
    }
    const combinedUnitQuantities = getStationedPeacekeeperUnitQuantities(existing);
    for (const [key, qty] of Object.entries(getStationedPeacekeeperUnitQuantities(pk))) {
      combinedUnitQuantities[key] = (combinedUnitQuantities[key] || 0) + qty;
    }
    savedEntry = {
      ...existing,
      power: existing.power + pk.power,
      deployedUnits: combinedUnits,
      deployedUnitQuantities: combinedUnitQuantities,
      userArmadaSnapshot: pk.userArmadaSnapshot || existing.userArmadaSnapshot,
      lat: targetLat,
      lng: targetLng,
      capital: pk.capital || existing.capital,
      deployedAt: pk.deployedAt || existing.deployedAt,
    };
    updatedList = [...current];
    updatedList[existingIndex] = savedEntry;
  } else {
    savedEntry = {
      ...pk,
      lat: targetLat,
      lng: targetLng,
      id: `pk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    };
    updatedList = [...current, savedEntry];
  }

  saveStationedPeacekeepers(updatedList);
  return savedEntry;
}

export function removeStationedPeacekeeper(allyCountry: string): void {
  const current = loadStationedPeacekeepers();
  const normAlly = allyCountry.toLowerCase().trim();
  const updatedList = current.filter(item => item.allyCountry.toLowerCase().trim() !== normAlly);
  saveStationedPeacekeepers(updatedList);
}

export function getStationedPeacekeeperPower(allyCountry: string): number {
  const current = loadStationedPeacekeepers();
  const normAlly = allyCountry.toLowerCase().trim();
  const match = current.find(item => item.allyCountry.toLowerCase().trim() === normAlly);
  return match?.power ?? 0;
}

export function getStationedPeacekeeper(allyCountry: string): StationedPeacekeeper | null {
  const current = loadStationedPeacekeepers();
  const normAlly = allyCountry.toLowerCase().trim();
  return current.find(item => item.allyCountry.toLowerCase().trim() === normAlly) ?? null;
}
