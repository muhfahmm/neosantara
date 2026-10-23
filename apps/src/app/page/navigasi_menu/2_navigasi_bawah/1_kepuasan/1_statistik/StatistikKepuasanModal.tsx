"use client";

import Image from "next/image";
import { X, Smile, TrendingUp } from "lucide-react";
import NotebookModalWrapper from "../../NotebookModalWrapper";
import {
  calculateKepuasan,
  calculateSatisfactionIndicatorScores,
  calculateEconomicPolicySatisfaction,
  calculateSubsidySatisfaction,
} from "@/app/logic/kepuasanCalculator";

interface StatistikKepuasanModalProps {
  isOpen: boolean;
  onClose: () => void;
  setActiveMenu?: (menu: string) => void;
  onOpenTempatUmum?: (tabId: string) => void;
  countryDetail: any;
  setCountryDetail?: (detail: any) => void;
  selectedCountry: any;
  metadata?: any;
}

export default function StatistikKepuasanModal({
  isOpen,
  onClose,
  setActiveMenu,
  countryDetail,
  selectedCountry,
  metadata,
}: StatistikKepuasanModalProps) {
  if (!isOpen) return null;

  // Gunakan utility terpusat agar konsisten dengan nilai di navbar
  const sectorScores = calculateSatisfactionIndicatorScores(
    countryDetail,
    metadata ?? {}
  );
  const generalSatisfaction = calculateKepuasan(countryDetail, metadata);
  const economicPolicySatisfaction =
    calculateEconomicPolicySatisfaction(countryDetail);
  const subsidySatisfaction = calculateSubsidySatisfaction(countryDetail);

  // Sektor-sektor yang diminta
  const sectors = [
    {
      name: "Pajak",
      score: sectorScores.pajak,
      image:
        "/images/game/population/satisfaction-sectors/satisfaction-sector-asset-01.svg",
      color: "text-emerald-600",
      menuId: "Menu:Pajak",
    },
    {
      name: "Harga Barang Pokok",
      score: sectorScores.harga,
      image:
        "/images/game/population/satisfaction-sectors/satisfaction-sector-asset-02.svg",
      color: "text-amber-600",
      menuId: "Menu:Harga",
    },
    {
      name: "Produksi Pangan",
      score: sectorScores.pangan,
      image:
        "/images/game/population/satisfaction-sectors/satisfaction-sector-asset-03.svg",
      color: "text-green-600",
      menuId: "Menu:IndustriPangan",
    },
    {
      name: "Produksi Listrik",
      score: sectorScores.listrik,
      image:
        "/images/game/population/satisfaction-sectors/satisfaction-sector-asset-04.svg",
      color: "text-blue-600",
      menuId: "Menu:Kelistrikan",
    },
    {
      name: "Hunian Permukiman",
      score: sectorScores.hunian,
      image:
        "/images/game/population/satisfaction-sectors/satisfaction-sector-asset-05.svg",
      color: "text-rose-600",
      menuId: "Menu:HunianPermukiman",
    },
    {
      name: "Layanan Publik & Tempat Umum",
      score: sectorScores.layananPublik,
      image:
        "/images/game/population/satisfaction-sectors/satisfaction-sector-asset-06.svg",
      color: "text-yellow-700",
      menuId: "Menu:TempatUmum",
    },
    {
      name: "Doktrin & Keterbukaan",
      score: sectorScores.keterbukaan,
      image:
        "/images/game/population/satisfaction-sectors/satisfaction-sector-asset-07.svg",
      color: "text-indigo-600",
      menuId: "Menu:DoktrinKeterbukaan",
    },
    {
      name: "Kebijakan & Sistem Ekonomi",
      score: economicPolicySatisfaction,
      image:
        "/images/game/population/satisfaction-sectors/satisfaction-sector-asset-08.svg",
      color: "text-cyan-600",
      menuId: "Menu:SistemEkonomi",
    },
    {
      name: "Alokasi & Kebijakan Subsidi",
      score: subsidySatisfaction,
      image:
        "/images/game/population/satisfaction-sectors/satisfaction-sector-asset-09.svg",
      color: "text-amber-600",
      menuId: "Menu:KebijakanSubsidi",
    },
    {
      name: "Integritas & Anti-Korupsi",
      score: sectorScores.integritas,
      image:
        "/images/game/population/satisfaction-sectors/satisfaction-sector-asset-10.svg",
      color: "text-emerald-600",
      menuId: "Menu:AntiKorupsi",
    },
  ];

  return (
    <NotebookModalWrapper onClose={onClose}>
      <div className="relative flex h-full flex-col overflow-hidden rounded-xl border border-[#00FFAA]/20 bg-[#0A1A1A] shadow-[0_0_30px_rgba(0,255,170,0.15)]">
        {/* Header */}
        <div className="relative z-10 flex shrink-0 items-center justify-between gap-2 border-b border-[#00FFAA]/20 bg-[#0A1A1A] px-4 py-2.5 sm:px-6 sm:py-3">
          <div className="flex flex-wrap items-center gap-3 sm:gap-6">
            <div className="flex items-center gap-2">
              <div className="shrink-0 rounded-lg border border-[#00FFAA]/30 bg-[#0F2424] p-1 sm:p-1.5">
                <Smile className="h-4 w-4 text-[#00FFAA] sm:h-5 sm:w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold uppercase leading-none tracking-tight text-[#00FFAA] sm:text-xl">
                  Kepuasan Rakyat
                </h2>
              </div>
            </div>

            <div className="flex items-center rounded-lg border border-[#00FFAA]/30 bg-[#0A1A1A] p-0.5 sm:p-1">
              <button className="cursor-pointer rounded-md bg-[#00FFAA] px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#0A1A1A] transition-all sm:text-xs">
                Statistik
              </button>
              <button
                onClick={() => setActiveMenu?.("Action:NaikkanKepuasan")}
                className="cursor-pointer rounded-md px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#6B8A8A] transition-all hover:text-[#E0E0E0] sm:text-xs"
              >
                Naikkan Peringkat
              </button>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex cursor-pointer items-center gap-1 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] p-1.5 text-xs font-bold uppercase text-[#6B8A8A] shadow-sm transition-all hover:border-[#00FFAA] hover:text-[#00FFAA] lg:p-2"
          >
            <span className="pl-1 text-[10px] font-semibold uppercase tracking-widest lg:text-xs">
              Tutup
            </span>
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Area: HANYA MENGGANTI custom-scrollbar DENGAN TAILWIND SCROLLBAR */}
        <div className="relative z-10 flex-1 overflow-y-auto bg-[#0A1A1A]/80 p-3 sm:p-5
          [&::-webkit-scrollbar]:w-1.5 sm:[&::-webkit-scrollbar]:w-2 
          [&::-webkit-scrollbar-track]:bg-[#0A1A1A] 
          [&::-webkit-scrollbar-track]:rounded-full 
          [&::-webkit-scrollbar-track]:border-l [&::-webkit-scrollbar-track]:border-[#00FFAA]/20
          [&::-webkit-scrollbar-thumb]:bg-gradient-to-b [&::-webkit-scrollbar-thumb]:from-[#00FFAA] [&::-webkit-scrollbar-thumb]:to-[#00B37A]
          [&::-webkit-scrollbar-thumb]:rounded-full 
          [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb]:border-[#0A1A1A]
          [&::-webkit-scrollbar-thumb]:shadow-[0_0_10px_rgba(0,255,170,0.6)]
          hover:[&::-webkit-scrollbar-thumb]:from-[#33FFBB] hover:[&::-webkit-scrollbar-thumb]:to-[#00FFAA]
          [&::-webkit-scrollbar-button]:hidden
        ">
          <div className="animate-in fade-in space-y-4 duration-300 sm:space-y-5">
            {/* Kartu skor umum */}
            <div className="flex flex-row items-center justify-between gap-2.5 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] p-2.5 lg:gap-3 lg:p-3 2xl:p-4">
              <div className="flex items-center gap-2.5 lg:gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#00FFAA]/40 bg-[#0A1A1A] lg:h-11 lg:w-11 2xl:h-14 2xl:w-14">
                  <Smile className="h-4 w-4 text-[#00FFAA] lg:h-5 lg:w-5 2xl:h-7 2xl:w-7" />
                </div>
                <div>
                  <h3 className="mb-0.5 text-xs font-black uppercase leading-none tracking-wide text-[#E0E0E0] lg:mb-1 lg:text-sm 2xl:text-base">
                    Persetujuan Umum Rakyat
                  </h3>
                </div>
              </div>

              <div className="min-w-[75px] shrink-0 rounded-lg border border-[#00FFAA]/30 bg-[#0A1A1A] px-2.5 py-1 text-right lg:min-w-[95px] lg:px-3.5 lg:py-1.5 2xl:min-w-[110px] 2xl:px-4 2xl:py-2">
                <p className="text-base font-black leading-none tracking-tight text-[#00FFAA] lg:text-xl 2xl:text-2xl">
                  {Math.round(generalSatisfaction)}%
                </p>
                <p className="mt-0.5 flex items-center justify-end gap-0.5 text-[8px] font-bold uppercase tracking-wider text-[#00FFAA] lg:text-[9px]">
                  <TrendingUp className="h-2 w-2 lg:h-2.5 lg:w-2.5" /> Stabil
                </p>
              </div>
            </div>

            <section>
              <div className="mb-3 flex items-center gap-2.5 px-1 lg:mb-4 lg:gap-3 2xl:mb-5">
                <div className="rounded-lg border border-[#00FFAA]/30 bg-[#0F2424] p-1 lg:p-1.5">
                  <TrendingUp className="h-3.5 w-3.5 text-[#00FFAA] lg:h-4 lg:w-4" />
                </div>
                <h3 className="text-sm font-black uppercase italic tracking-wider text-[#E0E0E0] lg:text-base 2xl:text-lg">
                  Sektor Utama
                </h3>
                <div className="ml-2 h-[1px] flex-1 bg-gradient-to-r from-[#00FFAA]/30 to-transparent lg:ml-4"></div>
              </div>

              <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2 lg:gap-3 2xl:gap-4">
                {sectors.map((sector) => {
                  return (
                    <button
                      key={sector.name}
                      onClick={() => {
                        setActiveMenu?.(sector.menuId);
                      }}
                      className="group relative flex cursor-pointer items-center gap-2.5 overflow-hidden rounded-xl border border-[#00FFAA]/20 bg-[#0F2424] p-2.5 text-left transition-all hover:border-[#00FFAA] hover:bg-[#00FFAA]/10 lg:gap-3.5 lg:p-3.5 2xl:gap-4 2xl:rounded-2xl 2xl:p-5"
                    >
                      <div className="shrink-0">
                        <Image
                          src={sector.image}
                          alt=""
                          width={56}
                          height={56}
                          className="h-10 w-10 object-contain lg:h-12 lg:w-12 2xl:h-14 2xl:w-14"
                        />
                      </div>
                      <div className="min-w-0 flex-1 space-y-1 lg:space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] font-black uppercase text-[#E0E0E0] group-hover:text-[#00FFAA] lg:text-xs">
                          <span className="whitespace-normal pr-1 leading-tight">
                            {sector.name}
                          </span>
                          <span className="shrink-0 text-[#00FFAA]">
                            {sector.score}%
                          </span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full border border-[#00FFAA]/20 bg-[#0A1A1A] lg:h-2 2xl:h-2.5">
                          <div
                            className="h-full rounded-full bg-[#00FFAA]"
                            style={{ width: `${sector.score}%` }}
                          />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          </div>
        </div>
      </div>
    </NotebookModalWrapper>
  );
}