export interface IndustrialMaterialRequirement {
  resourceKey: string;
  label: string;
  amount: number;
}

export interface IndustrialMaterialConsumer extends IndustrialMaterialRequirement {
  buildingKey: string;
  buildingLabel: string;
}

const INDUSTRIAL_MATERIAL_CONSUMERS: Record<string, IndustrialMaterialConsumer[]> = {
  bijih_besi: [
    { buildingKey: "pabrik_semikonduktor", buildingLabel: "Pabrik Semikonduktor", resourceKey: "bijih_besi", label: "bijih besi", amount: 1 },
    { buildingKey: "pabrik_mesin", buildingLabel: "Pabrik Mesin", resourceKey: "bijih_besi", label: "bijih besi", amount: 1 },
    { buildingKey: "pabrik_besi", buildingLabel: "Pabrik Besi", resourceKey: "bijih_besi", label: "bijih besi", amount: 1 },
  ],
  logam_tanah_jarang: [
    { buildingKey: "pabrik_semikonduktor", buildingLabel: "Pabrik Semikonduktor", resourceKey: "logam_tanah_jarang", label: "logam tanah jarang", amount: 1 },
    { buildingKey: "pabrik_mesin", buildingLabel: "Pabrik Mesin", resourceKey: "logam_tanah_jarang", label: "logam tanah jarang", amount: 1 },
  ],
  litium: [
    { buildingKey: "pabrik_semikonduktor", buildingLabel: "Pabrik Semikonduktor", resourceKey: "litium", label: "litium", amount: 1 },
    { buildingKey: "pabrik_mesin", buildingLabel: "Pabrik Mesin", resourceKey: "litium", label: "litium", amount: 1 },
  ],
};

export function getIndustrialMaterialRequirements(buildingKey: string): IndustrialMaterialRequirement[] {
  return Object.values(INDUSTRIAL_MATERIAL_CONSUMERS)
    .flat()
    .filter((consumer) => consumer.buildingKey === buildingKey)
    .map(({ resourceKey, label, amount }) => ({ resourceKey, label, amount }));
}

export function getIndustrialMaterialConsumers(
  countryDetail: Record<string, unknown> | null | undefined,
  resourceKey: string,
): Array<IndustrialMaterialConsumer & { buildingCount: number; totalConsumption: number }> {
  if (!countryDetail) return [];

  return (INDUSTRIAL_MATERIAL_CONSUMERS[resourceKey] || []).map((consumer) => {
    const buildingCount = Math.max(0, Number(countryDetail[consumer.buildingKey]) || 0);
    return {
      ...consumer,
      buildingCount,
      totalConsumption: buildingCount * consumer.amount,
    };
  });
}

export function getTotalIndustrialMaterialConsumption(
  countryDetail: Record<string, unknown> | null | undefined,
  resourceKey: string,
  availableProduction = Number.POSITIVE_INFINITY,
): number {
  const demandedConsumption = getIndustrialMaterialConsumers(countryDetail, resourceKey)
    .reduce((total, consumer) => total + consumer.totalConsumption, 0);

  return Math.min(demandedConsumption, Math.max(0, availableProduction));
}
