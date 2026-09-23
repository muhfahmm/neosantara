import { 
  FOOD_CONSUMPTION_PER_CAPITA, 
  calculateProduction, 
  calculateConsumption 
} from "../../../3_produksi_konsumsi/2_industri_pangan/logic/produksiKonsumsiLogic";

export interface CommodityAnalysis {
  key: string;
  label: string;
  balance: number;
  isDeficit: boolean;
  isSurplus: boolean;
}

export interface ProductionSectorAnalysisResult {
  sectorId: string;
  sectorLabel: string;
  totalDeficit: number;
  totalSurplus: number;
  commodities: CommodityAnalysis[];
}

export const generateProductionSectorAnalysis = (
  sectorId: string,
  sectorLabel: string,
  keys: string[],
  countryDetail: any,
  metadata: any
): ProductionSectorAnalysisResult => {
  const population = Number(countryDetail?.jumlah_penduduk) || 0;
  let totalDeficit = 0;
  let totalSurplus = 0;
  const commodities: CommodityAnalysis[] = [];

  keys.forEach((key) => {
    const consumptionPerCapita = FOOD_CONSUMPTION_PER_CAPITA[key];
    const production = calculateProduction(key, countryDetail, metadata);
    const consumption = consumptionPerCapita ? calculateConsumption(population, consumptionPerCapita) : 0;
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
    sectorLabel,
    totalDeficit,
    totalSurplus,
    commodities
  };
};

export const calculateDeficitDetailData = (
  commodityKey: string,
  countryDetail: any,
  metadata: any
) => {
  const population = Number(countryDetail?.jumlah_penduduk) || 0;
  const consumptionPerCapita = FOOD_CONSUMPTION_PER_CAPITA[commodityKey];
  const currentProd = calculateProduction(commodityKey, countryDetail, metadata);
  const currentCons = consumptionPerCapita ? calculateConsumption(population, consumptionPerCapita) : 0;
  const deficit = Math.max(0, currentCons - currentProd);
  const label = metadata?.[commodityKey]?.label || commodityKey.replace(/_/g, ' ').replace(/\b\w/g, (ch) => ch.toUpperCase());
  const prodPerUnit = Number(metadata?.[commodityKey]?.produksi) || 1;
  const buildingsNeeded = Math.ceil(deficit / prodPerUnit);

  return {
    key: commodityKey,
    label,
    currentProd,
    currentCons,
    deficit,
    prodPerUnit,
    buildingsNeeded,
  };
};
