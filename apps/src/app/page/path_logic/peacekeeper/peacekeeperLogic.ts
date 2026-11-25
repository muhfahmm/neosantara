"use client";

export interface StationedPeacekeeper {
  id: string;
  allyCountry: string;
  allyIso?: string;
  capital: string;
  lat: number;
  lng: number;
  power: number;
  deployedUnits: Record<string, number>;
  deployedAt: string;
}

const STORAGE_KEY = "neosantara_stationed_peacekeepers";
export const PEACEKEEPER_UPDATED_EVENT = "neosantara_peacekeeper_updated";

export function loadStationedPeacekeepers(): StationedPeacekeeper[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn("[PeacekeeperLogic] Failed to load stationed peacekeepers:", e);
    return [];
  }
}

export function saveStationedPeacekeepers(list: StationedPeacekeeper[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent(PEACEKEEPER_UPDATED_EVENT, { detail: list }));
  } catch (e) {
    console.warn("[PeacekeeperLogic] Failed to save stationed peacekeepers:", e);
  }
}

export function addStationedPeacekeeper(pk: Omit<StationedPeacekeeper, "id">): StationedPeacekeeper {
  const current = loadStationedPeacekeepers();
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
    savedEntry = {
      ...existing,
      power: existing.power + pk.power,
      deployedUnits: combinedUnits,
      lat: pk.lat || existing.lat,
      lng: pk.lng || existing.lng,
      capital: pk.capital || existing.capital,
      deployedAt: pk.deployedAt || existing.deployedAt,
    };
    updatedList = [...current];
    updatedList[existingIndex] = savedEntry;
  } else {
    savedEntry = {
      ...pk,
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
