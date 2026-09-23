export interface FacilityItemAnalysis {
  key: string;
  label: string;
  count: number;
  targetCount: number;
  deficit: number;
  isDeficit: boolean;
  recommendedBuildQty: number;
}

export interface TempatUmumSectorAnalysis {
  tabId: string;
  tabLabel: string;
  satisfactionScore: number;
  status: "KRISIS" | "TERBATAS" | "MENCUKUPI";
  recommendation: string;
  keys: string[];
  ratio: number;
  percentageMet: number;
  facilities: FacilityItemAnalysis[];
}

export const generateTempatUmumAIAnalysis = (
  tabId: string,
  tabLabel: string,
  keys: string[],
  countryDetail: any,
  metadata: any
): TempatUmumSectorAnalysis => {
  const population = Number(countryDetail?.jumlah_penduduk) || 10_000_000;
  
  const targets: Record<string, number> = {
    infrastruktur: 0.00005,
    pendidikan: 0.0001,
    kesehatan: 0.00004,
    penegakan_hukum: 1 / 15000, // 1 Bangunan : 15.000 Jiwa
    olahraga_hiburan: 0.00008,
    komersial: 0.00002,
  };

  let totalFacilityCount = 0;
  keys.forEach((key) => {
    totalFacilityCount += Number(countryDetail?.[key]) || 0;
  });

  const ratio = population > 0 ? totalFacilityCount / population : 0;
  const targetRatio = targets[tabId] || 0.0001;
  const percentageMet = Math.min(100, (ratio / targetRatio) * 100);
  const satisfactionScore = Math.round(percentageMet);

  let status: "KRISIS" | "TERBATAS" | "MENCUKUPI" = "MENCUKUPI";
  let recommendation = "";

  if (satisfactionScore >= 76) {
    status = "MENCUKUPI";
    recommendation = `✅ Ketersediaan fasilitas ${tabLabel.toLowerCase()} sangat mencukupi bagi seluruh rakyat.`;
  } else if (satisfactionScore >= 41) {
    status = "TERBATAS";
    recommendation = `⚠️ Fasilitas ${tabLabel.toLowerCase()} masih terbatas, perlu pembangunan lebih lanjut.`;
  } else {
    status = "KRISIS";
    recommendation = `🔴 Krisis fasilitas ${tabLabel.toLowerCase()}, tingkat keterpenuhan sangat rendah.`;
  }

  const targetPerFacility = keys.length > 0 ? Math.max(1, Math.ceil((population * targetRatio) / keys.length)) : 10;
  const facilities: FacilityItemAnalysis[] = keys.map((key) => {
    const meta = metadata?.[key] || metadata?.[`1_${key}`] || {};
    const label = meta?.label || key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    const count = Number(countryDetail?.[key]) || 0;
    const deficit = Math.max(0, targetPerFacility - count);
    const isDeficit = deficit > 0;
    const recommendedBuildQty = isDeficit ? Math.min(20, Math.max(1, deficit)) : 0;

    return {
      key,
      label,
      count,
      targetCount: targetPerFacility,
      deficit,
      isDeficit,
      recommendedBuildQty,
    };
  });

  return {
    tabId,
    tabLabel,
    satisfactionScore,
    status,
    recommendation,
    keys,
    ratio,
    percentageMet,
    facilities,
  };
};

export interface HunianItemAnalysis {
  key: string;
  label: string;
  count: number;
  capacityPerUnit: number;
  totalCapacity: number;
  deficitUnitsNeeded: number;
  isDeficit: boolean;
}

export interface HunianSectorAnalysis {
  tabId: string;
  tabLabel: string;
  capacityPerUnit: number;
  totalCapacity: number;
  population: number;
  deficitUnitsNeeded: number;
  recommendation: string;
  housingItems: HunianItemAnalysis[];
}

export const generateHunianAIAnalysis = (
  tabId: string,
  tabLabel: string,
  countryDetail: any,
  metadata: any
): HunianSectorAnalysis => {
  const population = Number(countryDetail?.jumlah_penduduk) || 0;
  const meta = metadata?.[tabId] || metadata?.[`1_${tabId}`] || {};
  const capacityPerUnit = Number(meta?.kapasitas) || (tabId === 'rumah_subsidi' ? 4 : tabId === 'apartemen' ? 50 : 8);
  const currentCount = Number(countryDetail?.[tabId]) || 0;
  const totalCapacity = currentCount * capacityPerUnit;

  const totalHousingCapacity = (Number(countryDetail?.rumah_subsidi) || 0) * 4 +
    (Number(countryDetail?.apartemen) || 0) * 50 +
    (Number(countryDetail?.mansion) || 0) * 8;

  const populationDeficit = Math.max(0, population - totalHousingCapacity);
  const deficitUnitsNeeded = populationDeficit > 0 ? Math.ceil(populationDeficit / capacityPerUnit) : 0;

  let recommendation = "";
  if (deficitUnitsNeeded > 0) {
    recommendation = `Kapasitas hunian nasional masih defisit bagi ${populationDeficit.toLocaleString('id-ID')} jiwa. Disarankan membangun minimal ${deficitUnitsNeeded.toLocaleString('id-ID')} unit ${tabLabel} tambahan.`;
  } else {
    recommendation = `Kapasitas hunian nasional dalam kondisi aman dan memenuhi total populasi ${population.toLocaleString('id-ID')} jiwa.`;
  }

  const housingKeys = [
    { key: 'rumah_subsidi', label: 'Rumah Subsidi', cap: 4 },
    { key: 'apartemen', label: 'Apartemen', cap: 50 },
    { key: 'mansion', label: 'Mansion', cap: 8 },
  ];

  const housingItems: HunianItemAnalysis[] = housingKeys.map((item) => {
    const cnt = Number(countryDetail?.[item.key]) || 0;
    const itemCap = cnt * item.cap;
    const itemDeficit = populationDeficit > 0 ? Math.ceil(populationDeficit / item.cap) : 0;
    return {
      key: item.key,
      label: item.label,
      count: cnt,
      capacityPerUnit: item.cap,
      totalCapacity: itemCap,
      deficitUnitsNeeded: itemDeficit,
      isDeficit: itemDeficit > 0,
    };
  });

  return {
    tabId,
    tabLabel,
    capacityPerUnit,
    totalCapacity,
    population,
    deficitUnitsNeeded,
    recommendation,
    housingItems,
  };
};
