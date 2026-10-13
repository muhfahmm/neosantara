"use client";
import React from "react";
import BuildingRequirementCard from "./BuildingRequirementCard";
import { MaterialRequirement } from "./MaterialRequirementsDisplay";

export interface BuildingWithRequirements {
  buildingKey: string;
  buildingLabel: string;
  buildingDescription?: string;
  quantity?: number;
  requirements: MaterialRequirement[];
  cost?: number;
}

interface MaterialRequirementsGridProps {
  title?: string;
  buildings: BuildingWithRequirements[];
  materialStocks: Record<string, number>;
  onInfoClick?: (buildingKey: string) => void;
  onMaterialClick?: (resourceKey: string, label: string) => void;
  highlightKeys?: string[] | string | null;
  gridCols?: 2 | 3 | 4 | 5;
}

export default function MaterialRequirementsGrid({
  title,
  buildings,
  materialStocks,
  onInfoClick,
  onMaterialClick,
  highlightKeys,
  gridCols = 3,
}: MaterialRequirementsGridProps) {
  if (!buildings || buildings.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-[#8b7e66]">Tidak ada building tersedia</p>
      </div>
    );
  }

  // Normalize highlightKeys to array
  const highlightKeysArray = Array.isArray(highlightKeys)
    ? highlightKeys
    : typeof highlightKeys === "string"
      ? [highlightKeys]
      : [];

  const gridColsClass = {
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-4",
    5: "grid-cols-5",
  }[gridCols] || "grid-cols-3";

  return (
    <div className="space-y-4">
      {title && (
        <div>
          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-[#5c3c10] mb-2">
            {title}
          </h3>
          <div className="h-1 w-12 bg-gradient-to-r from-[#5c3c10] to-[#8b7e66] rounded-full"></div>
        </div>
      )}

      <div className={`grid ${gridColsClass} gap-6`}>
        {buildings.map((building) => (
          <BuildingRequirementCard
            key={building.buildingKey}
            buildingKey={building.buildingKey}
            buildingLabel={building.buildingLabel}
            buildingDescription={building.buildingDescription}
            quantity={building.quantity}
            requirements={building.requirements}
            materialStocks={materialStocks}
            onInfoClick={onInfoClick}
            onMaterialClick={onMaterialClick}
            highlightBorder={highlightKeysArray.includes(building.buildingKey)}
            cost={building.cost}
          />
        ))}
      </div>
    </div>
  );
}
