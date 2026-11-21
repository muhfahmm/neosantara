"use client"
import React, { useEffect, useState } from "react";
import { Shield, Globe2, MapPin } from "lucide-react";
import NotebookModalWrapper from "../../NotebookModalWrapper";
import RootModalCloseButton from "@/app/page/root_modals_design_menu/RootModalCloseButton";
import { rootBorderRadius } from "@/app/page/root_modals_design_menu/rootBorderRadius";
import MenuInfoButton from "../../MenuInfoButton";
import { COUNTRIES_DATA } from "@/app/page/map_system/map-data";
import { useLanguage } from "@/app/page/paused_menu/terjemahan_paused_menu/languageLogic";
import { getAnnexedTerritories } from "./annexedTerritoriesLogic";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  countryDetail: Record<string, unknown> | null;
  playerCountryName: string;
}

function readAnnexedTerritories(playerCountryName: string) {
  if (typeof window === "undefined") return [];
  const gameWindow = window as Window & {
    neosantara_annexed_countries?: Record<string, { attackerCountry?: string }>;
    neosantara_city_owner?: Record<string, {
      cityId?: string;
      cityName?: string;
      countryIso?: string;
      ownerCountry?: string;
    }>;
  };
  return getAnnexedTerritories(
    playerCountryName,
    gameWindow.neosantara_annexed_countries || {},
    gameWindow.neosantara_city_owner || {},
    COUNTRIES_DATA,
  );
}

export default function WilayahDirebutModal({
  isOpen,
  onClose,
  countryDetail,
  playerCountryName
}: ModalProps) {
  const { t, language } = useLanguage();
  const tr = (key: string, params?: Record<string, string | number>) =>
    t(`navigation_defense_annexed_territories.${key}`, params);
  const [annexedTerritories, setAnnexedTerritories] = useState(() => readAnnexedTerritories(playerCountryName));
  const countryDetailName = [
    countryDetail?.country,
    countryDetail?.nama_negara,
    countryDetail?.name_id,
    countryDetail?.name_en
  ].find((name): name is string => typeof name === "string");

  useEffect(() => {
    const updateAnnexedTerritories = () => {
      setAnnexedTerritories(readAnnexedTerritories(playerCountryName));
    };
    updateAnnexedTerritories();
    window.addEventListener("map_territory_color_updated", updateAnnexedTerritories);
    return () => window.removeEventListener("map_territory_color_updated", updateAnnexedTerritories);
  }, [playerCountryName]);

  if (!isOpen) return null;

  const fullyAnnexedCount = annexedTerritories.filter(territory => territory.fullyAnnexed).length;
  const capturedCityCount = annexedTerritories.reduce((total, territory) => total + territory.cities.length, 0);
  const formatCount = (count: number) => count.toLocaleString(language);
  const countryLabel = playerCountryName || countryDetailName || tr("menu.countryFallback");

  return (
    <NotebookModalWrapper onClose={onClose}>
      <div className="root-modal-util-b74379da23 annexed-territories-modal">
        <div className="satisfaction-modal-header root-modal-util-9462ce2345">
          <div className="satisfaction-modal-header-main root-modal-util-020752a5a2 no-scrollbar">
            <div className="root-modal-util-08dfbca033">
              <div className="root-modal-util-739d92b232">
                <Shield aria-hidden="true" className="root-modal-util-d252947d10 text-rose-500" />
              </div>
              <h2 className="root-modal-util-6b4648c53a root-modal-util-c2385a463d">
                {tr("menu.title")}
                <span className="ml-2 align-middle text-[9px] font-semibold tracking-normal text-root-subtle normal-case">
                  {countryLabel}
                </span>
              </h2>
            </div>
          </div>
          <div className="root-modal-util-08dfbca033">
            <MenuInfoButton
              title={tr("menu.infoTitle")}
              description={tr("menu.infoDescription")}
            />
            <RootModalCloseButton onClick={onClose} />
          </div>
        </div>

        <div className="annexed-territories-content flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 bg-root-surface relative z-10 neon-scrollbar">
          {annexedTerritories.length === 0 ? (
            <div className="annexed-territories-empty flex min-h-[280px] flex-col items-center justify-center text-center">
              <div className="p-5 rounded-full bg-root-canvas border border-root-accent/20 mb-5">
                <Globe2 className="h-12 w-12 text-root-subtle" strokeWidth={1.5} />
              </div>
              <h3 className="annexed-territories-empty-title text-xl sm:text-2xl font-black uppercase text-root-text">
                {tr("menu.emptyTitle")}
              </h3>
              <p className="mt-2 max-w-md text-sm text-root-subtle">
                {tr("menu.emptyDescription", { country: countryLabel })}
              </p>
            </div>
          ) : (
            <div>
              <div className={`annexed-territories-summary mb-4 flex flex-col gap-3 border border-root-accent/20 bg-root-canvas p-3 sm:flex-row sm:items-center sm:justify-between ${rootBorderRadius.card}`}>
                <p className="text-xs font-bold uppercase tracking-wider text-root-subtle">{tr("summary.description", { country: countryLabel })}</p>
                <div className="flex flex-wrap gap-2 sm:justify-end">
                  <span className="annexed-territories-count rounded-full border border-root-accent/30 bg-root-accent/10 px-3 py-1 text-xs font-black text-root-accent">
                    {tr("summary.annexedCountries", { count: formatCount(fullyAnnexedCount) })}
                  </span>
                  <span className="annexed-territories-count rounded-full border border-root-accent/30 bg-root-accent/10 px-3 py-1 text-xs font-black text-root-accent">
                    {tr("summary.capturedCities", { count: formatCount(capturedCityCount) })}
                  </span>
                </div>
              </div>
              <div className="annexed-territories-grid grid grid-cols-1 gap-3 sm:grid-cols-2">
                {annexedTerritories.map(territory => (
                  <div
                    key={territory.iso}
                    className="annexed-territory-card flex items-center gap-3 rounded-xl border border-root-accent/20 bg-root-canvas p-4"
                  >
                    {territory.iso ? (
                      <img
                        src={`https://flagcdn.com/w40/${territory.iso}.png`}
                        alt=""
                        className="h-6 w-9 shrink-0 rounded border border-root-accent/20 object-cover"
                      />
                    ) : (
                      <MapPin aria-hidden="true" className="h-5 w-5 shrink-0 text-root-accent" />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="annexed-territory-name text-sm font-bold text-root-text">{territory.name}</span>
                        <span className="rounded-full border border-root-accent/30 bg-root-accent/10 px-2 py-1 text-[10px] font-bold text-root-accent">
                          {territory.fullyAnnexed
                            ? tr("territory.fullAnnexation")
                            : tr("territory.capturedCityCount", { count: formatCount(territory.cities.length) })}
                        </span>
                      </div>
                      {territory.cities.length > 0 && (
                        <details className="mt-2 border-t border-root-accent/10 pt-2">
                          <summary className="cursor-pointer text-xs font-semibold text-root-subtle hover:text-root-text">
                            {tr("territory.showCities", { count: formatCount(territory.cities.length) })}
                          </summary>
                          <ul className="mt-2 flex flex-wrap gap-1.5">
                            {territory.cities.map(city => (
                              <li
                                key={city}
                                className="rounded-md border border-root-accent/15 bg-root-surface px-2 py-1 text-xs text-root-text"
                              >
                                {city}
                              </li>
                            ))}
                          </ul>
                        </details>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </NotebookModalWrapper>
  );
}