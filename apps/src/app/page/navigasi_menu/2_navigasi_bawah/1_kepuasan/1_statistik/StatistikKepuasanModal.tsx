"use client";

import { useState } from "react";
import Image from "next/image";
import { Smile, TrendingUp, Info } from "lucide-react";
import NotebookModalWrapper from "../../NotebookModalWrapper";
import MenuInfoModal from "@/app/page/navigasi_menu/2_navigasi_bawah/MenuInfoModal";
import RootModalTabs from "@/app/page/root_modals_design_menu/RootModalTabs";
import { rootModalTypography } from "@/app/page/root_modals_design_menu/rootModalTypography";
import { rootBorderRadius } from "@/app/page/root_modals_design_menu/rootBorderRadius";
import RootModalCloseButton from "@/app/page/root_modals_design_menu/RootModalCloseButton";
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
  const [isInfoOpen, setIsInfoOpen] = useState(false);
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
      menuId: "Menu:Pajak",
    },
    {
      name: "Harga Barang Pokok",
      score: sectorScores.harga,
      image:
        "/images/game/population/satisfaction-sectors/satisfaction-sector-asset-02.svg",
      menuId: "Menu:Harga",
    },
    {
      name: "Produksi Pangan",
      score: sectorScores.pangan,
      image:
        "/images/game/population/satisfaction-sectors/satisfaction-sector-asset-03.svg",
      menuId: "Menu:IndustriPangan",
    },
    {
      name: "Produksi Listrik",
      score: sectorScores.listrik,
      image:
        "/images/game/population/satisfaction-sectors/satisfaction-sector-asset-04.svg",
      menuId: "Menu:Kelistrikan",
    },
    {
      name: "Hunian Permukiman",
      score: sectorScores.hunian,
      image:
        "/images/game/population/satisfaction-sectors/satisfaction-sector-asset-05.svg",
      menuId: "Menu:HunianPermukiman",
    },
    {
      name: "Layanan Publik & Tempat Umum",
      score: sectorScores.layananPublik,
      image:
        "/images/game/population/satisfaction-sectors/satisfaction-sector-asset-06.svg",
      menuId: "Menu:TempatUmum",
    },
    {
      name: "Doktrin & Keterbukaan",
      score: sectorScores.keterbukaan,
      image:
        "/images/game/population/satisfaction-sectors/satisfaction-sector-asset-07.svg",
      menuId: "Menu:DoktrinKeterbukaan",
    },
    {
      name: "Kebijakan & Sistem Ekonomi",
      score: economicPolicySatisfaction,
      image:
        "/images/game/population/satisfaction-sectors/satisfaction-sector-asset-08.svg",
      menuId: "Menu:SistemEkonomi",
    },
    {
      name: "Alokasi & Kebijakan Subsidi",
      score: subsidySatisfaction,
      image:
        "/images/game/population/satisfaction-sectors/satisfaction-sector-asset-09.svg",
      menuId: "Menu:KebijakanSubsidi",
    },
    {
      name: "Integritas & Anti-Korupsi",
      score: sectorScores.integritas,
      image:
        "/images/game/population/satisfaction-sectors/satisfaction-sector-asset-10.svg",
      menuId: "Menu:AntiKorupsi",
    },
  ];

  return (
    <>
    {!isInfoOpen && <NotebookModalWrapper onClose={onClose}>
      <div className="relative flex h-full flex-col overflow-hidden rounded-xl border border-root-accent/20 bg-root-canvas">
        {/* Header */}
        <div className="satisfaction-modal-header relative z-10 flex shrink-0 items-center justify-between gap-2 border-b border-root-accent/20 bg-root-canvas px-4 py-2.5 sm:px-6 sm:py-3">
          <div className="satisfaction-modal-header-main flex min-w-0 flex-1 flex-nowrap items-center gap-2 overflow-x-auto whitespace-nowrap no-scrollbar sm:gap-4">
            <div className="flex shrink-0 items-center gap-2 whitespace-nowrap">
              <div className="shrink-0 rounded-lg border border-root-accent/30 bg-root-surface p-1 sm:p-1.5">
                <Smile className="h-4 w-4 text-root-text sm:h-5 sm:w-5" />
              </div>
              <div>
                <h2 className={`${rootModalTypography.title} leading-none`}>
                  Kepuasan Rakyat
                </h2>
              </div>
            </div>

            <RootModalTabs
              className="satisfaction-modal-tabs"
              items={[
                { label: "Statistik", isActive: true },
                {
                  label: "Naikkan Peringkat",
                  isActive: false,
                  onClick: () => setActiveMenu?.("Action:NaikkanKepuasan"),
                },
              ]}
            />
          </div>

          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setIsInfoOpen(true)} title="Informasi statistik kepuasan rakyat" aria-label="Informasi statistik kepuasan rakyat" className="flex shrink-0 cursor-pointer items-center justify-center rounded-full border border-root-accent/50 bg-root-canvas p-1 text-root-accent transition-all hover:bg-root-accent hover:text-root-canvas">
              <Info className="h-3.5 w-3.5" />
            </button>
            <RootModalCloseButton
              onClick={onClose}
              className="root-modal-mobile-close-button"
            />
          </div>
        </div>

        {/* Content Area: HANYA MENGGANTI custom-scrollbar DENGAN TAILWIND SCROLLBAR */}
        <div className="relative z-10 flex-1 overflow-y-auto bg-root-canvas/80 p-3 sm:p-5
          [&::-webkit-scrollbar]:w-1.5 sm:[&::-webkit-scrollbar]:w-2 
          [&::-webkit-scrollbar-track]:bg-root-canvas
          [&::-webkit-scrollbar-track]:rounded-full 
          [&::-webkit-scrollbar-track]:border-l [&::-webkit-scrollbar-track]:border-root-accent/20
          [&::-webkit-scrollbar-thumb]:bg-gradient-to-b [&::-webkit-scrollbar-thumb]:from-root-accent [&::-webkit-scrollbar-thumb]:to-[#00B37A]
          [&::-webkit-scrollbar-thumb]:rounded-full 
          [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb]:border-root-canvas
          hover:[&::-webkit-scrollbar-thumb]:from-[#33FFBB] hover:[&::-webkit-scrollbar-thumb]:to-root-accent
          [&::-webkit-scrollbar-button]:hidden
        ">
          <div className="animate-in fade-in space-y-4 duration-300 sm:space-y-5">
            {/* Kartu skor umum */}
            <div className={`flex flex-row items-center justify-between gap-2.5 ${rootBorderRadius.card} border border-root-accent/30 bg-root-surface p-2.5 lg:gap-3 lg:p-3 2xl:p-4`}>
              <div className="flex items-center gap-2.5 lg:gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-root-accent/40 bg-root-canvas lg:h-11 lg:w-11 2xl:h-14 2xl:w-14">
                  <Smile className="h-4 w-4 text-root-text lg:h-5 lg:w-5 2xl:h-7 2xl:w-7" />
                </div>
                <div>
                  <h3 className="mb-0.5 text-xs font-black uppercase leading-none tracking-wide text-root-text lg:mb-1 lg:text-sm 2xl:text-base">
                    Persetujuan Umum Rakyat
                  </h3>
                </div>
              </div>

              <div className="min-w-[75px] shrink-0 rounded-lg border border-root-accent/30 bg-root-canvas px-2.5 py-1 text-right lg:min-w-[95px] lg:px-3.5 lg:py-1.5 2xl:min-w-[110px] 2xl:px-4 2xl:py-2">
                <p className={`${rootModalTypography.value} text-base leading-none tracking-tight lg:text-xl 2xl:text-2xl`}>
                  {Math.round(generalSatisfaction)}%
                </p>
                <p className={`${rootModalTypography.label} mt-0.5 flex items-center justify-end gap-0.5`}>
                  <TrendingUp className="h-2 w-2 lg:h-2.5 lg:w-2.5" /> Stabil
                </p>
              </div>
            </div>

            <section>
              <div className="mb-3 flex items-center gap-2.5 px-1 lg:mb-4 lg:gap-3 2xl:mb-5">
                <div className="rounded-lg border border-root-accent/30 bg-root-surface p-1 lg:p-1.5">
                  <TrendingUp className="h-3.5 w-3.5 text-root-text lg:h-4 lg:w-4" />
                </div>
                <h3 className={`${rootModalTypography.sectionTitle} italic lg:text-base 2xl:text-lg`}>
                  Sektor Utama
                </h3>
                <div className="ml-2 h-[1px] flex-1 bg-gradient-to-r from-root-accent/30 to-transparent lg:ml-4"></div>
              </div>

              <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2 lg:gap-3 2xl:gap-4">
                {sectors.map((sector) => {
                  return (
                    <button
                      key={sector.name}
                      onClick={() => {
                        setActiveMenu?.(sector.menuId);
                      }}
                      className={`group relative flex cursor-pointer items-center gap-2.5 overflow-hidden ${rootBorderRadius.card} border border-root-accent/20 bg-root-surface p-2.5 text-left transition-all hover:border-root-accent hover:bg-root-accent/10 lg:gap-3.5 lg:p-3.5 2xl:gap-4 2xl:p-5`}
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
                        <div className="flex items-center justify-between text-[11px] font-semibold uppercase text-root-text lg:text-xs">
                          <span className="whitespace-normal pr-1 leading-tight">
                            {sector.name}
                          </span>
                          <span className="shrink-0 text-root-text">
                            {sector.score}%
                          </span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full border border-root-accent/20 bg-root-canvas lg:h-2 2xl:h-2.5">
                          <div
                            className="h-full rounded-full bg-root-accent"
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
    </NotebookModalWrapper>}
    <MenuInfoModal
      isOpen={isInfoOpen}
      onClose={() => setIsInfoOpen(false)}
      title="Informasi Statistik Kepuasan Rakyat"
      description="Nilai kepuasan merangkum kondisi umum dan indikator sektoral seperti pajak, harga, pangan, serta layanan publik. Gunakan tab Statistik untuk meninjau skor dan akses sektor terkait untuk melihat kebijakan yang memengaruhinya."
    />
    </>
  );
}