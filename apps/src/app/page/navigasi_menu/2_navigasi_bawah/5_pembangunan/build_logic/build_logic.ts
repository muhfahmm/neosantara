"use client";

import { useEffect, useMemo } from "react";
import { formatDate, getDaysElapsed } from "@/app/logic/production_logic";
import {
  FOOD_CONSUMPTION_PER_CAPITA,
  calculateConsumption,
} from "../../3_produksi_konsumsi/2_industri_pangan/logic/produksiKonsumsiLogic";

export const RESOURCE_KEY_ALIASES: Record<string, string> = {};

export const normalizeResourceKey = (key: string): string => {
  return RESOURCE_KEY_ALIASES[key] || key;
};

export const getMaterialStock = (countryDetail: any, resourceKey: string, metadata?: Record<string, any>): number => {
  if (!countryDetail) return 0;
  const normalizedKey = normalizeResourceKey(resourceKey);
  const inventoryKey = `inventory_${normalizedKey}`;
  if (countryDetail[inventoryKey] !== undefined && countryDetail[inventoryKey] !== null) {
    return Number(countryDetail[inventoryKey]) || 0;
  }

  const isFoodCommodity = FOOD_CONSUMPTION_PER_CAPITA[normalizedKey] !== undefined;
  if (isFoodCommodity) {
    const buildingCount = Number(countryDetail?.[normalizedKey]) || 0;
    if (buildingCount === 0) return 0;
    const bMeta = findBuildingMetadata(metadata || {}, normalizedKey);
    const DEFAULT_PROD: Record<string, number> = {
      air_mineral: 1000,
      gula: 250,
      roti: 150,
      pengolahan_daging: 120,
      mie_instan: 500,
      minyak_goreng: 250,
      susu: 180,
      beras: 300,
    };
    const prodPerUnit = Number(bMeta?.produksi) || DEFAULT_PROD[normalizedKey] || 0;
    const dailyProd = prodPerUnit * buildingCount;
    const pop = Number(countryDetail?.jumlah_penduduk) || 0;
    const dailyCons = calculateConsumption(pop, FOOD_CONSUMPTION_PER_CAPITA[normalizedKey]);
    return Math.max(0, dailyProd - dailyCons);
  }

  return 0;
};

export const findBuildingMetadata = (metadata: Record<string, any>, key: string) => {
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

export function calculateDailyMaterialProduction(
  countryDetail: any,
  metadata: Record<string, any>,
  currentDateStr: string
) {
  if (!currentDateStr || !metadata || Object.keys(metadata).length === 0 || !countryDetail) {
    return { hasUpdates: false, updates: {} as Record<string, any> };
  }

  let hasUpdates = false;
  const updates: Record<string, any> = {};
  const allKeys = Object.keys(metadata);
  const pop = Number(countryDetail?.jumlah_penduduk) || 0;

  for (const resourceKey of allKeys) {
    const buildingCount = Number(countryDetail?.[resourceKey]) || 0;
    if (buildingCount === 0) continue;
    const bMeta = findBuildingMetadata(metadata, resourceKey);
    if (!bMeta || !bMeta.produksi) continue;

    const buildDateKey = `build_date_${resourceKey}`;
    const buildDate = countryDetail?.[buildDateKey] || currentDateStr;
    const lastUpdateKey = `last_update_date_${resourceKey}`;
    const lastUpdateDate = countryDetail?.[lastUpdateKey] || buildDate;
    const inventoryKey = `inventory_${resourceKey}`;

    if (lastUpdateDate === currentDateStr) continue;

    const daysPassed = getDaysElapsed(lastUpdateDate, currentDateStr);
    if (daysPassed <= 0) continue;

    const isFoodCommodity = FOOD_CONSUMPTION_PER_CAPITA[resourceKey] !== undefined;

    let dailyAmount: number;
    if (isFoodCommodity) {
      // Untuk komoditas pangan: tambahkan Netto (Produksi - Konsumsi) per hari
      const dailyProd = Number(bMeta.produksi) * buildingCount;
      const dailyCons = calculateConsumption(pop, FOOD_CONSUMPTION_PER_CAPITA[resourceKey]);
      const dailyNetto = dailyProd - dailyCons;
      // Jika netto negatif (defisit), tidak tambahkan apa-apa (min 0)
      dailyAmount = Math.max(0, dailyNetto);
    } else {
      // Untuk non-pangan: tambahkan produksi penuh
      dailyAmount = Number(bMeta.produksi) * buildingCount;
    }

    const productionAdded = dailyAmount * daysPassed;
    const currentStock = Number(countryDetail?.[inventoryKey]) || 0;
    updates[inventoryKey] = currentStock + productionAdded;
    updates[lastUpdateKey] = currentDateStr;
    hasUpdates = true;
  }

  return { hasUpdates, updates };
}


export function useMaterialProduction(
  countryDetail: any,
  setCountryDetail: (detail: any) => void,
  metadata: Record<string, any>,
  currentDate?: string | Date
) {
  const safeDateString = useMemo(() => {
    if (!currentDate) return formatDate(new Date());
    if (typeof currentDate === "string") return currentDate;
    if (currentDate instanceof Date && !isNaN(currentDate.getTime())) {
      return formatDate(currentDate);
    }
    return formatDate(new Date());
  }, [currentDate]);

  useEffect(() => {
    if (!safeDateString || !metadata || Object.keys(metadata).length === 0 || !countryDetail) return;
    
    const { hasUpdates, updates } = calculateDailyMaterialProduction(
      countryDetail,
      metadata,
      safeDateString
    );

    if (hasUpdates) {
      setCountryDetail((prev: any) => ({ ...prev, ...updates }));
    }
  }, [safeDateString, metadata, countryDetail, setCountryDetail]);

  return { safeDateString };
}

export function deductBuildingMaterials(
  countryDetail: any,
  requirements?: { resourceKey: string; amount?: number }[],
  buildQuantity: number = 1
) {
  if (!countryDetail || !requirements || requirements.length === 0) return countryDetail;
  const updatedDetail = { ...countryDetail };

  requirements.forEach((material) => {
    const normalizedKey = normalizeResourceKey(material.resourceKey);
    const invKey = `inventory_${normalizedKey}`;
    const currentInv = getMaterialStock(updatedDetail, material.resourceKey);
    const baseAmount = material.amount || 0;
    const totalAmount = baseAmount * buildQuantity;
    updatedDetail[invKey] = Math.max(0, currentInv - totalAmount);
  });

  return updatedDetail;
}