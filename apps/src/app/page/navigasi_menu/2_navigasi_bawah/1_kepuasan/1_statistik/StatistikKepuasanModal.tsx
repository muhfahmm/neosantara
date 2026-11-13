"use client";

import { useState, type CSSProperties } from "react";
import Image from "next/image";
import { Smile, TrendingUp, Info } from "lucide-react";
import NotebookModalWrapper from "../../NotebookModalWrapper";
import MenuInfoModal from "@/app/page/navigasi_menu/2_navigasi_bawah/MenuInfoModal";
import RootModalTabs from "@/app/page/root_modals_design_menu/RootModalTabs";
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
      <div className={"root-modal-util-52b6b298fe"}>
        {/* Header */}
        <div className={"satisfaction-modal-header root-modal-util-4450f1d9ee"}>
          <div className={"satisfaction-modal-header-main root-modal-util-935108d13c no-scrollbar"}>
            <div className={"root-modal-util-c7c918256f"}>
              <div className={"root-modal-util-acd42b9a36"}>
                <Smile className={"root-modal-util-ea2c28151c"} />
              </div>
              <div>
                <h2 className={`root-modal-util-6b4648c53a root-modal-util-c2385a463d`}>
                  Kepuasan Rakyat
                </h2>
              </div>
            </div>

          </div>

          <div className={"root-modal-util-6cfc7e6ab3"}>
            <button type="button" onClick={() => setIsInfoOpen(true)} title="Informasi statistik kepuasan rakyat" aria-label="Informasi statistik kepuasan rakyat" className={"root-modal-info-button root-modal-util-1697100c43"}>
              <Info aria-hidden="true" />
            </button>
            <RootModalCloseButton onClick={onClose} />
          </div>
        </div>

        <div className={"satisfaction-modal-summary root-modal-util-6614545ce3"}>
          <div className={"root-modal-util-6cfc7e6ab3"}>
            <Smile className={"root-modal-util-00f4ec4a9a"} />
            <span className={"root-modal-util-14d6efe9ef root-modal-util-614c0c7dff"}>
              Kepuasan Sipil:
            </span>
            <span className={"root-modal-util-04f32edb66 root-modal-util-4457a4d3a8"}>
              {Math.round(generalSatisfaction)}%
            </span>
          </div>

          <div className={"satisfaction-modal-summary-controls"}>
            <RootModalTabs
              className={"satisfaction-modal-tabs"}
              compact
              items={[
                { label: "Statistik", isActive: true },
                {
                  label: "Naikkan Peringkat",
                  isActive: false,
                  onClick: () => setActiveMenu?.("Action:NaikkanKepuasan"),
                  onPointerDown: () => setActiveMenu?.("Action:NaikkanKepuasan"),
                },
              ]}
            />
          </div>
        </div>

        {/* Content Area: HANYA MENGGANTI custom-scrollbar DENGAN TAILWIND SCROLLBAR */}
        <div className={"satisfaction-modal-content root-modal-util-9c12d57a09"}>
          <div className={"satisfaction-modal-content-body root-modal-enter root-modal-fade-in root-modal-util-90f9f3a7db"}>
            <section>
              <div className={"root-modal-util-8230f2ccb3"}>
                <div className={"root-modal-util-7ccf491d2f"}>
                  <TrendingUp className={"root-modal-util-79b40bc7fa"} />
                </div>
                <h3 className={`root-modal-util-9361ef65fc root-modal-util-cdb3e20c19 `}>
                  Sektor Utama
                </h3>
                <div className={"root-modal-util-d43b1ea5a7"}></div>
              </div>

              <div className={"satisfaction-sector-list root-modal-util-11abdabb16"}>
                {sectors.map((sector) => {
                  return (
                    <button
                      key={sector.name}
                      onClick={() => {
                        setActiveMenu?.(sector.menuId);
                      }}
                      className={`root-satisfaction-index satisfaction-sector-card group root-modal-util-9cb3716085 root-modal-util-5f22e64f22 root-modal-util-58e2ece8b7 `}
                    >
                      <div className={"satisfaction-sector-icon root-modal-util-012fbd121f"}>
                        <Image
                          src={sector.image}
                          alt=""
                          width={56}
                          height={56}
                          className={"root-modal-util-da8e04fbee"}
                        />
                      </div>
                      <div className={"root-modal-util-7d3b745d3f"}>
                        <div className={"root-modal-util-a09a9a725b"}>
                          <span className={"root-satisfaction-index-title root-modal-util-56db152630"}>
                            {sector.name}
                          </span>
                          <span className={"root-satisfaction-index-value root-modal-util-4711eb3412"}>
                            {sector.score}%
                          </span>
                        </div>
                        <div className={"satisfaction-sector-progress root-modal-util-f51324f898"}>
                          <div
                            className={"root-modal-progress-fill root-modal-util-42e4dc2b79"}
                            style={{ "--root-modal-progress-value": `${sector.score}%` } as CSSProperties}
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