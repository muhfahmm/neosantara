"use client"
import React from "react"; // 🔥 PERBAIKAN: Import React untuk dukungan JSX
import { X, FileText } from "lucide-react";

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
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-black/60 backdrop-blur-sm pointer-events-auto">
      <div className="bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="px-8 py-5 border-b border-[#00FFAA]/20 flex items-center justify-between bg-[#0A1A1A] relative z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#00FFAA]/10 rounded-xl border border-[#00FFAA]/30">
              <FileText className="h-6 w-6 text-[#00FFAA]" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#E0E0E0] uppercase tracking-wide">Pilih Negara Target</h3>
              <p className="text-xs text-[#6B8A8A] font-medium mt-0.5">Pilih benua, lalu pilih negara target Anda.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl border border-[#00FFAA]/30 bg-[#00FFAA]/10 text-[#00FFAA] hover:bg-[#00FFAA]/20 transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-widest pl-1">Tutup</span>
            <X className="h-5 w-5" />
          </button>
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
                      ? 'bg-[#00FFAA] text-[#0A1A1A] shadow-lg shadow-[#00FFAA]/20'
                      : 'bg-[#0A1A1A] border border-[#00FFAA]/20 text-[#6B8A8A] hover:text-[#E0E0E0] hover:border-[#00FFAA]/40'
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
        <div className="flex items-center justify-end gap-4 px-8 py-4 border-t border-[#00FFAA]/20 bg-[#0A1A1A] relative z-10 shrink-0">
          <button onClick={onClose} className="px-6 py-2.5 rounded-xl border border-[#00FFAA]/30 bg-[#00FFAA]/10 text-[#00FFAA] hover:bg-[#00FFAA]/20 transition-all font-bold text-xs uppercase tracking-wider cursor-pointer">Tutup</button>
        </div>
      </div>
    </div>
  );
}