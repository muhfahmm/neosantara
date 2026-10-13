import { getProductionBonusMultiplier } from "../../../../../../../bonus_logic";

export interface FuelRule {
  resourceKey: string;
  label: string;
  amount: number;
}

const KELISTRIKAN_FUEL_REQUIREMENTS: Record<string, FuelRule[]> = {
  pembangkit_listrik_tenaga_gas: [
    { resourceKey: 'gas_alam', label: 'gas alam', amount: 2 },
  ],
  pembangkit_listrik_tenaga_nuklir: [
    { resourceKey: 'uranium', label: 'uranium', amount: 1 },
  ],
  pembangkit_listrik_tenaga_uap: [
    { resourceKey: 'batu_bara', label: 'batu bara', amount: 50 },
    { resourceKey: 'minyak_bumi', label: 'minyak bumi', amount: 5 },
  ],
};

export function getKelistrikanFuelRequirements(buildingKey: string): FuelRule[] {
  return KELISTRIKAN_FUEL_REQUIREMENTS[buildingKey] || [];
}

export interface ElectricityFuelBalance {
  production: number;
  consumption: number;
  balance: number;
}

export function getElectricityFuelBalance(
  countryDetail: Record<string, any> | null | undefined,
  resourceKey: string,
  metadata: Record<string, any> | null = {}
): ElectricityFuelBalance {
  if (!countryDetail) return { production: 0, consumption: 0, balance: 0 };

  const safeMetadata = metadata ?? {};
  const resourceMetadata = safeMetadata[resourceKey] || Object.values(safeMetadata).find(
    (entry: any) => entry?.dataKey === resourceKey
  );
  const miningCount = Math.max(0, Number(countryDetail[resourceKey]) || 0);
  const production = miningCount
    * (Number(resourceMetadata?.produksi) || 0)
    * getProductionBonusMultiplier(countryDetail, resourceKey);
  const consumption = Object.entries(KELISTRIKAN_FUEL_REQUIREMENTS).reduce((total, [buildingKey, requirements]) => {
    const buildingCount = Math.max(0, Number(countryDetail[buildingKey]) || 0);
    const resourceUse = requirements
      .filter((requirement) => requirement.resourceKey === resourceKey)
      .reduce((sum, requirement) => sum + requirement.amount, 0);
    return total + buildingCount * resourceUse;
  }, 0);

  return { production, consumption, balance: production - consumption };
}
