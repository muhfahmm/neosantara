"use client";

import { useState, type CSSProperties } from "react";
import Image from "next/image";
import { Smile, TrendingUp, Info } from "lucide-react";
import NotebookModalWrapper from "../../NotebookModalWrapper";
import MenuInfoModal from "@/app/page/navigasi_menu/2_navigasi_bawah/MenuInfoModal";
import RootModalTabs from "@/app/page/root_modals_design_menu/RootModalTabs";
import RootModalCloseButton from "@/app/page/root_modals_design_menu/RootModalCloseButton";
import { useLanguage } from "@/app/page/paused_menu/terjemahan_paused_menu/languageLogic";
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
  const { t } = useLanguage();
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
      name: t("navigation_satisfaction_statistics.sectors.tax"),
      score: sectorScores.pajak,
      image:
        "/images/game/population/satisfaction-sectors/satisfaction-sector-asset-01.svg",
      menuId: "Menu:Pajak",
    },
    {
      name: t("navigation_satisfaction_statistics.sectors.goodsPrices"),
      score: sectorScores.harga,
      image:
        "/images/game/population/satisfaction-sectors/satisfaction-sector-asset-02.svg",
      menuId: "Menu:Harga",
    },
    {
      name: t("navigation_satisfaction_statistics.sectors.foodProduction"),
      score: sectorScores.pangan,
      image:
        "/images/game/population/satisfaction-sectors/satisfaction-sector-asset-03.svg",
      menuId: "Menu:IndustriPangan",
    },
    {
      name: t("navigation_satisfaction_statistics.sectors.electricityProduction"),
      score: sectorScores.listrik,
      image:
        "/images/game/population/satisfaction-sectors/satisfaction-sector-asset-04.svg",
      menuId: "Menu:Kelistrikan",
    },
    {
      name: t("navigation_satisfaction_statistics.sectors.housing"),
      score: sectorScores.hunian,
      image:
        "/images/game/population/satisfaction-sectors/satisfaction-sector-asset-05.svg",
      menuId: "Menu:HunianPermukiman",
    },
    {
      name: t("navigation_satisfaction_statistics.sectors.publicServices"),
      score: sectorScores.layananPublik,
      image:
        "/images/game/population/satisfaction-sectors/satisfaction-sector-asset-06.svg",
      menuId: "Menu:TempatUmum",
    },
    {
      name: t("navigation_satisfaction_statistics.sectors.doctrine"),
      score: sectorScores.keterbukaan,
      image:
        "/images/game/population/satisfaction-sectors/satisfaction-sector-asset-07.svg",
      menuId: "Menu:DoktrinKeterbukaan",
    },
    {
      name: t("navigation_satisfaction_statistics.sectors.economicPolicy"),
      score: economicPolicySatisfaction,
      image:
        "/images/game/population/satisfaction-sectors/satisfaction-sector-asset-08.svg",
      menuId: "Menu:SistemEkonomi",
    },
    {
      name: t("navigation_satisfaction_statistics.sectors.subsidies"),
      score: subsidySatisfaction,
      image:
        "/images/game/population/satisfaction-sectors/satisfaction-sector-asset-09.svg",
      menuId: "Menu:KebijakanSubsidi",
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
                  {t("navigation_satisfaction_statistics.title")}
                </h2>
              </div>
            </div>

          </div>

          <div className={"root-modal-util-6cfc7e6ab3"}>
            <button type="button" onClick={() => setIsInfoOpen(true)} title={t("navigation_satisfaction_statistics.infoButton")} aria-label={t("navigation_satisfaction_statistics.infoButton")} className={"root-modal-info-button root-modal-util-1697100c43"}>
              <Info aria-hidden="true" />
            </button>
            <RootModalCloseButton onClick={onClose} />
          </div>
        </div>

        <div className={"satisfaction-modal-summary root-modal-util-6614545ce3"}>
          <div className={"root-modal-util-6cfc7e6ab3"}>
            <Smile className={"root-modal-util-00f4ec4a9a"} />
            <span className={"root-modal-util-14d6efe9ef root-modal-util-614c0c7dff"}>
              {t("navigation_satisfaction_statistics.civilSatisfaction")}
            </span>
            <span className={"root-modal-util-04f32edb66 root-modal-util-4457a4d3a8"}>
              {Math.round(generalSatisfaction)}%
            </span>
          </div>

          <div className={"satisfaction-modal-summary-controls"}>
            <RootModalTabs
              className={"satisfaction-modal-tabs"}
              items={[
                { label: t("navigation_satisfaction_statistics.statisticsTab"), isActive: true },
                {
                  label: t("navigation_satisfaction_statistics.increaseTab"),
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
      title={t("navigation_satisfaction_statistics.info.title")}
      description={t("navigation_satisfaction_statistics.info.description")}
    />
    </>
  );
}