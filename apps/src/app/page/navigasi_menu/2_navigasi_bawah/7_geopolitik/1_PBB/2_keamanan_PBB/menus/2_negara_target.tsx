"use client"
import React from "react";
import { FileText } from "lucide-react";
import NotebookModalWrapper from "../../../../NotebookModalWrapper";
import RootModalCloseButton from "@/app/page/root_modals_design_menu/RootModalCloseButton";
import { rootModalTypography } from "@/app/page/root_modals_design_menu/rootModalTypography";

interface CountryOption {
  id: number;
  name: string;
  iso: string;
  continent: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  countries: CountryOption[];
  groupedCountries: Record<string, CountryOption[]>;
  activeContinent: string;
  setActiveContinent: (continent: string) => void;
  selectedCountry: any;
  onSelectTarget: (country: CountryOption) => void;
  renderFlag: (iso: string | undefined, altName: string, size?: "sm" | "md") => React.ReactElement | null;
}

export default function CountryTargetModal({
  isOpen,
  onClose,
  groupedCountries,
  activeContinent,
  setActiveContinent,
  selectedCountry,
  onSelectTarget,
  renderFlag,
}: Props) {
  if (!isOpen) return null;

  return (
    <NotebookModalWrapper onClose={onClose} zIndexClass="z-[200]">
      <div className="flex h-full flex-col overflow-hidden">
        <div className="px-8 py-5 border-b border-[#00FFAA]/20 flex items-center justify-between bg-[#0A1A1A] relative z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#00FFAA]/10 rounded-xl border border-[#00FFAA]/30">
              <FileText className="h-6 w-6 text-[#00FFAA]" />
            </div>
            <div>
              <h3 className={rootModalTypography.title}>Pilih Negara Target</h3>
              <p className="text-xs text-[#6B8A8A] font-medium mt-0.5">Pilih benua, lalu pilih negara target Anda.</p>
            </div>
          </div>
          <RootModalCloseButton onClick={onClose} />
        </div>
        <div className="flex-1 overflow-y-auto p-8 bg-[#0F2424] relative z-10 custom-scrollbar flex flex-col items-center">
          <div className="w-full max-w-4xl">
            <div className="flex flex-wrap justify-center gap-2.5 mb-8">
              {Object.keys(groupedCountries).map((continent) => (
                <button
                  key={continent}
                  onClick={() => setActiveContinent(continent)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    activeContinent === continent
                      ? "bg-[#00FFAA] text-[#0A1A1A] shadow-lg shadow-[#00FFAA]/20"
                      : "bg-[#0A1A1A] border border-[#00FFAA]/20 text-[#6B8A8A] hover:text-[#E0E0E0] hover:border-[#00FFAA]/40"
                  }`}
                >
                  {continent} ({groupedCountries[continent].length})
                </button>
              ))}
            </div>
            {activeContinent && groupedCountries[activeContinent] && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {groupedCountries[activeContinent]
                  .filter((c) => c.id !== selectedCountry?.id)
                  .map((c) => (
                    <button
                      key={c.id}
                      onClick={() => onSelectTarget(c)}
                      className="flex flex-col items-center p-3 rounded-xl border transition-all cursor-pointer bg-[#0A1A1A] border-[#00FFAA]/20 hover:border-[#00FFAA] hover:bg-[#00FFAA]/10"
                    >
                      {renderFlag(c.iso, c.name)}
                      <span className="text-[11px] font-semibold mt-2 text-center leading-tight text-[#E0E0E0]">
                        {c.name}
                      </span>
                    </button>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </NotebookModalWrapper>
  );
}
