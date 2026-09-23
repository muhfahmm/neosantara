export interface TempatUmumSectorAnalysis {
  tabId: string;
  tabLabel: string;
  satisfactionScore: number;
  status: "KRISIS" | "TERBATAS" | "MENCUKUPI";
  recommendation: string;
  keys: string[];
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
    penegakan_hukum: 0.0005,
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

  if (satisfactionScore >= 80) {
    status = "MENCUKUPI";
    recommendation = `Ketersediaan fasilitas ${tabLabel.toLowerCase()} saat ini sudah sangat ideal (Skor: ${satisfactionScore}/100) dan mencukupi kebutuhan seluruh rakyat.`;
  } else if (satisfactionScore >= 50) {
    status = "TERBATAS";
    recommendation = `Fasilitas ${tabLabel.toLowerCase()} masih terbatas (Skor: ${satisfactionScore}/100). Disarankan untuk memperbanyak unit bangunan guna meningkatkan tingkat kepuasan publik.`;
  } else {
    status = "KRISIS";
    recommendation = `Krisis fasilitas ${tabLabel.toLowerCase()}! (Skor: ${satisfactionScore}/100). Prioritaskan pembangunan infrastruktur/layanan ${tabLabel.toLowerCase()} segera untuk mencegah penurunan kepuasan umum rakyat.`;
  }

  return {
    tabId,
    tabLabel,
    satisfactionScore,
    status,
    recommendation,
    keys,
  };
};

export interface HunianSectorAnalysis {
  tabId: string;
  tabLabel: string;
  capacityPerUnit: number;
  totalCapacity: number;
  population: number;
  deficitUnitsNeeded: number;
  recommendation: string;
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

  return {
    tabId,
    tabLabel,
    capacityPerUnit,
    totalCapacity,
    population,
    deficitUnitsNeeded,
    recommendation,
  };
};
