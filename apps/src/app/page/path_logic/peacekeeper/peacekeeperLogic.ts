"use client";

import { getCapitalCoord } from "../path-war";

export interface StationedPeacekeeper {
  id: string;
  allyCountry: string;
  allyIso?: string;
  capital: string;
  lat: number;
  lng: number;
  power: number;
  deployedUnits: Record<string, number>;
  userArmadaSnapshot?: any;
  deployedAt: string;
}

export const PEACEKEEPER_UPDATED_EVENT = "neosantara_peacekeeper_updated";

// In-memory store (hilang saat halaman di-refresh)
let inMemoryPeacekeepers: StationedPeacekeeper[] = [];

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

export function addStationedPeacekeeper(pk: Omit<StationedPeacekeeper, "id">): StationedPeacekeeper {
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
    savedEntry = {
      ...existing,
      power: existing.power + pk.power,
      deployedUnits: combinedUnits,
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
