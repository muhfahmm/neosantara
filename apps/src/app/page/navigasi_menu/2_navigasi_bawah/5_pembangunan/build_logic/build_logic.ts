"use client";

import { useEffect, useMemo } from "react";
import { formatDate, getDaysElapsed } from "@/app/logic/production_logic";
import { getEconomicEmbargoProductionMultiplier } from "@/app/page/navigasi_menu/2_navigasi_bawah/7_geopolitik/1_PBB/1_resolusi_PBB/logic/3_economicEmbargoLogic";
import { getActiveProductionBanForResource } from "@/app/page/navigasi_menu/2_navigasi_bawah/7_geopolitik/1_PBB/1_resolusi_PBB/logic/5_laranganProduksiLogic";
import {
  FOOD_CONSUMPTION_PER_CAPITA,
  calculateConsumption,
} from "../../3_produksi_konsumsi/2_industri_pangan/logic/produksiKonsumsiLogic";
import { getProductionBonusMultiplier } from "../1_produksi/bonus_logic";

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

  // Jika belum ada data akumulasi inventory (hari pertama), stok diawali dari 0
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
  currentDateStr: string,
  getExternalProductionMultiplier: (resourceKey: string) => number = () => 1
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
    const productionBan = getActiveProductionBanForResource(resourceKey);
    const isFoodCommodity = FOOD_CONSUMPTION_PER_CAPITA[resourceKey] !== undefined;
    if (buildingCount === 0 && !(productionBan && isFoodCommodity)) continue;
    const bMeta = findBuildingMetadata(metadata, resourceKey);
    if (!productionBan && (!bMeta || !bMeta.produksi)) continue;

    const buildDateKey = `build_date_${resourceKey}`;
    const buildDate = countryDetail?.[buildDateKey] || currentDateStr;
    const lastUpdateKey = `last_update_date_${resourceKey}`;
    const lastUpdateDate = countryDetail?.[lastUpdateKey] || buildDate;
    const inventoryKey = `inventory_${resourceKey}`;

    const productionBanStart = productionBan?.finishedAt || lastUpdateDate;
    const effectiveLastUpdate = productionBan && productionBanStart > lastUpdateDate
      ? productionBanStart
      : lastUpdateDate;
    const daysPassed = getDaysElapsed(effectiveLastUpdate, currentDateStr);
    if (daysPassed <= 0) continue;

    if (productionBan) {
      const currentStock = Number(countryDetail?.[inventoryKey]) || 0;
      const dailyConsumption = isFoodCommodity
        ? calculateConsumption(pop, FOOD_CONSUMPTION_PER_CAPITA[resourceKey])
        : 0;
      updates[inventoryKey] = Math.max(0, currentStock - dailyConsumption * daysPassed);
      updates[lastUpdateKey] = currentDateStr;
      hasUpdates = true;
      continue;
    }

    let dailyAmount: number;
    const productionMultiplier =
      getProductionBonusMultiplier(countryDetail, resourceKey) *
      getExternalProductionMultiplier(resourceKey);
    if (isFoodCommodity) {
      // Apply sanctions to gross production before subtracting population consumption.
      const dailyProd = Number(bMeta.produksi) * buildingCount * productionMultiplier;
      const dailyCons = calculateConsumption(pop, FOOD_CONSUMPTION_PER_CAPITA[resourceKey]);
      dailyAmount = Math.max(0, dailyProd - dailyCons);
    } else {
      dailyAmount = Number(bMeta.produksi) * buildingCount * productionMultiplier;
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
  currentDate?: string | Date,
  getProductionMultiplier: (resourceKey: string) => number = resourceKey =>
    getEconomicEmbargoProductionMultiplier(
      countryDetail?.country || countryDetail?.nama_negara || countryDetail?.country_name || '',
      resourceKey
    )
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
      safeDateString,
      getProductionMultiplier
    );

    if (hasUpdates) {
      setCountryDetail((prev: any) => ({ ...prev, ...updates }));
    }
  }, [safeDateString, metadata, countryDetail, setCountryDetail, getProductionMultiplier]);

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