"use client";
import React from "react";
import { Info } from "lucide-react";
import MaterialRequirementsDisplay, { MaterialRequirement } from "./MaterialRequirementsDisplay";

interface BuildingRequirementCardProps {
  buildingKey: string;
  buildingLabel: string;
  buildingDescription?: string;
  quantity?: number;
  requirements: MaterialRequirement[];
  materialStocks: Record<string, number>;
  onInfoClick?: (buildingKey: string) => void;
  onMaterialClick?: (resourceKey: string, label: string) => void;
  highlightBorder?: boolean;
  cost?: number;
}

export default function BuildingRequirementCard({
  buildingKey,
  buildingLabel,
  buildingDescription,
  quantity = 0,
  requirements,
  materialStocks,
  onInfoClick,
  onMaterialClick,
  highlightBorder = false,
  cost = 0,
}: BuildingRequirementCardProps) {
  const hasMissingMaterials = requirements.some(
    (req) => (materialStocks[req.resourceKey] ?? 0) < (req.amount ?? 0)
  );

  return (
    <div
      className={`relative rounded-2xl overflow-hidden flex flex-col transition-all bg-white/95 border-2 shadow-md hover:shadow-lg cursor-pointer p-5 min-h-[280px] ${
        highlightBorder ? 'border-emerald-400 shadow-emerald-200 hover:border-emerald-500' : 'border-[#C4B49C]/30 hover:border-[#C4B49C]/50'
      }`}
    >
      {/* Header dengan Info Button */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 pr-2">
          <p className="text-[11px] font-black uppercase text-[#8b7e66] tracking-wider">
            {buildingLabel}
          </p>
          {buildingDescription && (
            <p className="text-[9px] text-[#8b7e66] mt-1">{buildingDescription}</p>
          )}
        </div>
        {onInfoClick && (
          <button
            onClick={() => onInfoClick(buildingKey)}
            className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-[#5c3c10]/10 hover:bg-[#5c3c10]/20 text-[#5c3c10] transition-colors cursor-pointer"
          >
            <Info className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Quantity & Cost */}
      <div className="flex justify-between items-center mb-3 pb-3 border-b border-[#C4B49C]/20">
        <div>
          <div className="text-2xl font-black text-[#2e261a]">{quantity}</div>
          <p className="text-[9px] font-bold text-[#8b7e66]">Unit</p>
        </div>
        {cost > 0 && (
          <div className="text-right">
            <div className="text-sm font-black text-[#2e261a]">{cost.toLocaleString('id-ID')}</div>
            <p className="text-[9px] font-bold text-[#8b7e66]">NEO</p>
          </div>
        )}
      </div>

      {/* Material Requirements */}
      <div className="flex-1 overflow-y-auto">
        <MaterialRequirementsDisplay
          requirements={requirements}
          materialStocks={materialStocks}
          onMaterialClick={onMaterialClick}
          showToggleButton={false}
          defaultShowMaterials={true}
          compactView={true}
        />
      </div>

      {/* Warning jika ada material yang kurang */}
      {hasMissingMaterials && (
        <div className="mt-3 pt-3 border-t border-red-200 bg-red-50/50 rounded-lg p-2">
          <p className="text-[9px] font-bold text-red-700 text-center">⚠️ Material Kurang</p>
        </div>
      )}
    </div>
  );
}
