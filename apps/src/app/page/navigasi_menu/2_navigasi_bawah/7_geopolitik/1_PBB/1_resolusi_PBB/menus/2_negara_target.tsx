"use client"
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
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
  renderFlag
}: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <NotebookModalWrapper onClose={onClose} zIndexClass="z-[200]">
      <div className="flex h-full flex-col overflow-hidden">
        <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-root-accent/30 flex items-center justify-between bg-root-canvas relative z-10 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-root-surface rounded-xl border border-root-accent/30">
              <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-root-accent" />
            </div>
            <div>
              <h3 className={rootModalTypography.title}>Pilih Negara Target</h3>
              <p className="text-[10px] font-bold uppercase tracking-widest text-root-subtle mt-1">Pilih benua, lalu pilih negara target Anda.</p>
            </div>
          </div>
          <RootModalCloseButton onClick={onClose} />
        </div>
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-root-surface relative z-10 custom-scrollbar flex flex-col items-center">
          <div className="w-full max-w-4xl">
            <div className="flex flex-wrap justify-center gap-2.5 mb-8">
              {Object.keys(groupedCountries).map((continent) => (
                <button
                  key={continent}
                  onClick={() => setActiveContinent(continent)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    activeContinent === continent
                      ? 'bg-root-accent text-root-canvas shadow-lg shadow-root-accent/20'
                      : 'bg-root-canvas border border-root-accent/20 text-root-subtle hover:text-root-text hover:border-root-accent/40'
                  }`}
                >
                  {continent} ({groupedCountries[continent].length})
                </button>
              ))}
            </div>
            {activeContinent && groupedCountries[activeContinent] && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {groupedCountries[activeContinent]
                  .filter(c => c.id !== selectedCountry?.id)
                  .map((c) => (
                    <button
                      key={c.id}
                      onClick={() => onSelectTarget(c)}
                      className="flex flex-col items-center p-3 rounded-xl border transition-all cursor-pointer bg-root-canvas border-root-accent/20 hover:border-root-accent hover:bg-root-accent/10"
                    >
                      {renderFlag(c.iso, c.name)}
                      <span className="text-[11px] font-semibold mt-2 text-center leading-tight text-root-text">
                        {c.name}
                      </span>
                    </button>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </NotebookModalWrapper>,
    document.body
  );
}