/**
 * Hook untuk memudahkan integrasi requirements logic ke komponen
 * Menghubungkan data dari requirements files dengan material stocks
 */

import { useMemo } from "react";
import { MaterialRequirement } from "./MaterialRequirementsDisplay";

interface RequirementItem {
  group: string;
  label: string;
  resourceKey: string;
  amount: number;
}

interface BuildingRequirements {
  buildingKey: string;
  requirements: RequirementItem[];
}

interface UseRequirementsProps {
  requirements: BuildingRequirements[];
  materialStocks: Record<string, number>;
  buildingKey?: string;
}

export function useRequirements({
  requirements,
  materialStocks,
  buildingKey,
}: UseRequirementsProps) {
  // 🔥 Dapatkan requirements untuk specific building
  const buildingRequirements = useMemo(() => {
    if (!buildingKey) return [];
    const found = requirements.find((r) => r.buildingKey === buildingKey);
    return found?.requirements || [];
  }, [requirements, buildingKey]);

  // 🔥 Konversi ke MaterialRequirement format
  const materialRequirements = useMemo((): MaterialRequirement[] => {
    return buildingRequirements.map((req) => ({
      resourceKey: req.resourceKey,
      label: req.label,
      group: req.group,
      amount: req.amount,
    }));
  }, [buildingRequirements]);

  // 🔥 Cek material yang kurang
  const missingMaterials = useMemo((): MaterialRequirement[] => {
    return materialRequirements.filter(
      (material) =>
        (materialStocks[material.resourceKey] ?? 0) < (material.amount ?? 0)
    );
  }, [materialRequirements, materialStocks]);

  // 🔥 Hitung total biaya jika ada info cost
  const hasAllMaterials = missingMaterials.length === 0;

  // 🔥 Hitung summary
  const summary = useMemo(() => {
    return {
      totalMaterials: materialRequirements.length,
      missingCount: missingMaterials.length,
      completionPercentage: Math.round(
        ((materialRequirements.length - missingMaterials.length) /
          materialRequirements.length) *
          100
      ),
      hasAllMaterials,
    };
  }, [materialRequirements, missingMaterials, hasAllMaterials]);

  return {
    materialRequirements,
    missingMaterials,
    summary,
    hasAllMaterials,
  };
}

/**
 * Hook untuk batch processing multiple buildings
 */
interface UseMultipleRequirementsProps {
  requirementsList: BuildingRequirements[][];
  materialStocks: Record<string, number>;
  buildingKeys?: string[];
}

export function useMultipleRequirements({
  requirementsList,
  materialStocks,
  buildingKeys,
}: UseMultipleRequirementsProps) {
  const allRequirements = useMemo(() => {
    if (!buildingKeys) return {};

    const result: Record<string, ReturnType<typeof useRequirements>> = {};

    buildingKeys.forEach((key, idx) => {
      const requirements = requirementsList[idx] || [];
      result[key] = useRequirements({
        requirements,
        materialStocks,
        buildingKey: key,
      });
    });

    return result;
  }, [requirementsList, materialStocks, buildingKeys]);

  const totalSummary = useMemo(() => {
    const keys = Object.keys(allRequirements);
    if (keys.length === 0) {
      return {
        totalBuildings: 0,
        totalMaterials: 0,
        totalMissing: 0,
        averageCompletion: 0,
      };
    }

    let totalMaterials = 0;
    let totalMissing = 0;

    keys.forEach((key) => {
      totalMaterials += allRequirements[key].summary.totalMaterials;
      totalMissing += allRequirements[key].summary.missingCount;
    });

    return {
      totalBuildings: keys.length,
      totalMaterials,
      totalMissing,
      averageCompletion: Math.round(
        ((totalMaterials - totalMissing) / totalMaterials) * 100
      ),
    };
  }, [allRequirements]);

  return {
    allRequirements,
    totalSummary,
  };
}

/**
 * Helper function untuk merge multiple requirement files
 */
export function mergeRequirements(
  ...requirementArrays: BuildingRequirements[][]
): BuildingRequirements[] {
  const merged: Record<string, BuildingRequirements> = {};

  requirementArrays.forEach((array) => {
    array.forEach((req) => {
      if (merged[req.buildingKey]) {
        // Jika sudah ada, merge requirements
        merged[req.buildingKey].requirements = [
          ...new Map(
            [
              ...merged[req.buildingKey].requirements,
              ...req.requirements,
            ].map((r) => [r.resourceKey, r])
          ).values(),
        ];
      } else {
        merged[req.buildingKey] = req;
      }
    });
  });

  return Object.values(merged);
}
