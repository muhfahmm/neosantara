"use client";
import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export interface MaterialRequirement {
  resourceKey: string;
  label: string;
  group: string;
  amount?: number;
}

interface MaterialRequirementsDisplayProps {
  requirements: MaterialRequirement[];
  materialStocks: Record<string, number>;
  onMaterialClick?: (resourceKey: string, label: string) => void;
  showToggleButton?: boolean;
  defaultShowMaterials?: boolean;
  compactView?: boolean; // Untuk tampilan compact tanpa toggle/border
}

export default function MaterialRequirementsDisplay({
  requirements,
  materialStocks,
  onMaterialClick,
  showToggleButton = true,
  defaultShowMaterials = true,
  compactView = false,
}: MaterialRequirementsDisplayProps) {
  const [showMaterialGrid, setShowMaterialGrid] = useState(defaultShowMaterials);

  if (!requirements || requirements.length === 0) {
    return (
      <div className="text-xs text-[#8b7e66]">
        Tidak ada material yang dibutuhkan untuk bangunan ini.
      </div>
    );
  }

  // 🔥 COMPACT VIEW - Untuk tampilan singkat di card preview
  if (compactView) {
    return (
      <div className="bg-[#e4dac3]/20 border border-[#C4B49C]/30 rounded-xl p-3 space-y-2">
        <div className="text-xs font-bold text-[#5c3c10] uppercase tracking-wider">Material Dibutuhkan</div>
        <div className="grid grid-cols-3 gap-2">
          {requirements.slice(0, 3).map((material) => {
            const stock = materialStocks[material.resourceKey] ?? 0;
            const isStockZero = stock <= 0;

            return (
              <div
                key={`${material.resourceKey}-${material.group}`}
                onClick={() => onMaterialClick?.(material.resourceKey, material.label)}
                className={`flex flex-col items-center justify-center bg-white/80 border rounded-lg p-2 cursor-pointer hover:border-[#5c3c10]/60 transition-all min-h-[60px] ${
                  isStockZero ? 'border-red-400 bg-red-50/70' : 'border-[#C4B49C]/30'
                }`}
              >
                <div className="font-bold text-[9px] text-center text-[#2e261a]">{material.label}</div>
                {material.amount !== undefined && (
                  <div className="text-[8px] uppercase tracking-[0.1em] text-[#5c3c10] mt-0.5">
                    x{material.amount}
                  </div>
                )}
                <div className={`text-[9px] font-black mt-0.5 ${isStockZero ? 'text-red-600' : 'text-[#8b7e66]'}`}>
                  {stock.toLocaleString('id-ID')}
                </div>
              </div>
            );
          })}
        </div>
        {requirements.length > 3 && (
          <div className="text-[9px] text-[#8b7e66] text-center pt-1 border-t border-[#C4B49C]/20">
            +{requirements.length - 3} material lainnya
          </div>
        )}
      </div>
    );
  }

  // 🔥 FULL VIEW - Untuk tampilan lengkap di modal
  return (
    <div className="space-y-3 text-xs">
      {showToggleButton && (
        <div className="flex items-center justify-between">
          <div className="font-black uppercase tracking-[0.2em] text-[#5c3c10]">Material Dibutuhkan</div>
          <button
            onClick={() => setShowMaterialGrid(!showMaterialGrid)}
            className="flex items-center gap-1.5 px-2 py-1 bg-white/80 border border-[#C4B49C]/30 rounded-lg text-[#5c3c10] hover:bg-[#5c3c10]/10 transition-all cursor-pointer"
          >
            {showMaterialGrid ? (
              <>
                <EyeOff className="h-3 w-3" />
                <span className="text-[8px] font-bold uppercase">Sembunyikan</span>
              </>
            ) : (
              <>
                <Eye className="h-3 w-3" />
                <span className="text-[8px] font-bold uppercase">Tampilkan</span>
              </>
            )}
          </button>
        </div>
      )}

      <div
        className={`grid grid-cols-4 gap-2 overflow-hidden transition-all duration-500 ease-in-out ${
          showMaterialGrid ? 'max-h-[1500px] opacity-100 mt-2' : 'max-h-0 opacity-0 mt-0'
        }`}
      >
        {requirements.map((material) => {
          const stock = materialStocks[material.resourceKey] ?? 0;
          const isStockZero = stock <= 0;

          return (
            <button
              key={`${material.resourceKey}-${material.group}`}
              type="button"
              onClick={() => onMaterialClick?.(material.resourceKey, material.label)}
              className={`flex flex-col items-center justify-center bg-white/80 border rounded-xl p-2.5 min-h-[50px] cursor-pointer hover:border-[#5c3c10]/60 transition-all ${
                isStockZero ? 'border-red-400 bg-red-50/70 text-red-800' : 'border-[#C4B49C]/30'
              }`}
            >
              <div className="font-bold text-[10px] text-center">{material.label}</div>
              {material.amount !== undefined && (
                <div className="text-[9px] uppercase tracking-[0.15em] text-[#5c3c10] mt-1">
                  x{material.amount}
                </div>
              )}
              <div className={`text-[10px] font-black mt-0.5 ${isStockZero ? 'text-red-600' : 'text-[#8b7e66]'}`}>
                {stock.toLocaleString('id-ID')}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
