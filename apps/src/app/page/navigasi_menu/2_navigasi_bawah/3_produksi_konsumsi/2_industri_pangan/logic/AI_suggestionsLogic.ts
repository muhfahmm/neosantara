import { ElementType } from "react";
import { Beef, Wheat, Fish, Cookie } from "lucide-react";
import { 
  FOOD_CONSUMPTION_PER_CAPITA, 
  calculateProduction, 
  calculateConsumption 
} from "./produksiKonsumsiLogic";

export const SECTOR_MAP: Record<string, { label: string; icon: ElementType; items: string[] }> = {
  peternakan: {
    label: "Peternakan",
    icon: Beef,
    items: ["ayam_unggas", "sapi_potong", "sapi_perah", "domba_kambing"]
  },
  agrikultur: {
    label: "Agrikultur",
    icon: Wheat,
    items: ["padi", "gandum", "jagung", "sayur", "umbi", "kedelai", "kelapa_sawit", "kopi", "teh", "kakao", "tebu", "karet"]
  },
  perikanan: {
    label: "Perikanan",
    icon: Fish,
    items: ["udang", "ikan", "mutiara"]
  },
  olahan_pangan: {
    label: "Olahan Pangan",
    icon: Cookie,
    items: ["air_mineral", "gula", "roti", "pengolahan_daging", "mie_instan", "minyak_goreng", "susu", "beras"]
  }
};

export interface CommodityAnalysis {
  key: string;
  label: string;
  balance: number;
  isDeficit: boolean;
  isSurplus: boolean;
}

export interface SectorAnalysisResult {
  sectorId: string;
  sectorLabel: string;
  totalDeficit: number;
  totalSurplus: number;
  commodities: CommodityAnalysis[];
}

export const generateSectorAnalysis = (
  sectorId: string,
  countryDetail: any,
  metadata: any,
  population: number
): SectorAnalysisResult | null => {
  const sectorData = SECTOR_MAP[sectorId];
  if (!sectorData) return null;

  let totalDeficit = 0;
  let totalSurplus = 0;
  const commodities: CommodityAnalysis[] = [];

  sectorData.items.forEach((key) => {
    if (!FOOD_CONSUMPTION_PER_CAPITA[key]) return;

    const production = calculateProduction(key, countryDetail, metadata);
    const consumption = calculateConsumption(population, FOOD_CONSUMPTION_PER_CAPITA[key]);
    const balance = production - consumption;
    const label = metadata?.[key]?.label || key.replace(/_/g, ' ').replace(/\b\w/g, (ch) => ch.toUpperCase());

    if (balance < 0) {
      totalDeficit += Math.abs(balance);
      commodities.push({ key, label, balance, isDeficit: true, isSurplus: false });
    } else if (balance > 0) {
      totalSurplus += balance;
      commodities.push({ key, label, balance, isDeficit: false, isSurplus: true });
    } else {
      commodities.push({ key, label, balance, isDeficit: false, isSurplus: false });
    }
  });

  return {
    sectorId,
    sectorLabel: sectorData.label,
    totalDeficit,
    totalSurplus,
    commodities
  };
};

// 🔥 NEW: Logika rekomendasi pembangunan untuk modal detail defisit
export const calculateDeficitRecommendation = (
  commodityKey: string,
  countryDetail: any,
  metadata: any,
  population: number
) => {
  const label = metadata?.[commodityKey]?.label || commodityKey.replace(/_/g, ' ').replace(/\b\w/g, (ch) => ch.toUpperCase());
  const consumptionPerCapita = FOOD_CONSUMPTION_PER_CAPITA[commodityKey];
  
  if (!consumptionPerCapita) return null;

  const currentProd = calculateProduction(commodityKey, countryDetail, metadata);
  const currentCons = calculateConsumption(population, consumptionPerCapita);
  const deficit = currentCons - currentProd; // Defisit positif

  // Jika tidak defisit, tidak perlu rekomendasi
  if (deficit <= 0) return null;

  // Ambil produksi per unit dari metadata
  const bMeta = metadata?.[commodityKey];
  const prodPerUnit = Number(bMeta?.produksi) || 0;

  let buildingsNeeded = 0;
  // Matematika: Agar surplus, kita perlu (defisit + 1) / produksi_per_unit
  if (prodPerUnit > 0) {
    buildingsNeeded = Math.ceil((deficit + 1) / prodPerUnit);
  }

  return {
    key: commodityKey,
    label,
    currentProd,
    currentCons,
    deficit,
    prodPerUnit,
    buildingsNeeded
  };
};