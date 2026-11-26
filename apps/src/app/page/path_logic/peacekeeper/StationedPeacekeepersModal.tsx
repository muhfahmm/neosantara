"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { ShieldCheck } from "lucide-react";
import { getLocalizedCountryName } from "@/app/logic/countryNameLogic";
import { formatLocaleDate, formatLocaleNumber, useLanguage } from "@/app/page/paused_menu/terjemahan_paused_menu/languageLogic";
import NotebookModalWrapper from "@/app/page/navigasi_menu/2_navigasi_bawah/NotebookModalWrapper";
import RootInfoModalHeader from "@/app/page/root_modals_design_menu/RootInfoModalHeader";
import {
  getWarUnitComposition,
  type WarUnitGroup,
} from "../../detail_negara/3_operasi_militer/1_serang_negara/war_algoritm/warUnitComposition";
import {
  getStationedPeacekeeperUnitQuantities,
  type StationedPeacekeeper,
} from "./peacekeeperLogic";
import TarikPasukanModal from "./TarikPasukanModal";

interface StationedPeacekeepersModalProps {
  peacekeeper: StationedPeacekeeper | null;
  onClose: () => void;
  onWithdraw: (peacekeeper: StationedPeacekeeper) => void;
}

const GROUPS: WarUnitGroup[] = ["darat", "laut", "udara"];

export default function StationedPeacekeepersModal({
  peacekeeper,
  onClose,
  onWithdraw,
}: StationedPeacekeepersModalProps) {
  const { t, language } = useLanguage();
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

  if (!peacekeeper || typeof document === "undefined") return null;

  const countryName = getLocalizedCountryName(peacekeeper.allyIso || peacekeeper.allyCountry, language);
  const units = getWarUnitComposition(
    getStationedPeacekeeperUnitQuantities(peacekeeper),
    {},
    false,
  );
  const deployedDate = new Date(`${peacekeeper.deployedAt}T12:00:00`);
  const formattedDate = Number.isFinite(deployedDate.getTime())
    ? formatLocaleDate(deployedDate, language)
    : peacekeeper.deployedAt;

  return createPortal(
    <NotebookModalWrapper
      onClose={onClose}
      isHidden={isWithdrawModalOpen}
      zIndexClass="z-[100000001]"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="stationed-peacekeepers-title"
        className="root-modal-util-b74379da23 flex h-full w-full min-h-0 flex-col font-sans"
      >
        <RootInfoModalHeader
          title={t("game.peacekeeperForces.title", { country: countryName })}
          titleId="stationed-peacekeepers-title"
          icon={<ShieldCheck aria-hidden="true" />}
          onClose={onClose}
          closeAriaLabel={t("game.peacekeeperForces.close")}
          size="standard"
        />

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-sky-400/25 bg-sky-400/10 p-3">
            <p className="text-sm font-bold text-white">
              {t("game.attackerForces.unitsBrought")}
            </p>
            <p className="text-xs font-bold text-sky-200">
              {t("game.peacekeeperForces.combatPower")}:{" "}
              <span className="tabular-nums text-white">
                {formatLocaleNumber(peacekeeper.power, language)}
              </span>
            </p>
          </div>

          <p className="text-xs text-root-subtle">
            {t("game.peacekeeperForces.deployedAt", { date: formattedDate })}
          </p>

          {units.length > 0 ? (
            <div className="flex flex-col gap-4">
              {GROUPS.map((group) => {
                const groupUnits = units.filter((unit) => unit.group === group);
                if (groupUnits.length === 0) return null;

                return (
                  <section
                    key={group}
                    className="rounded-xl border border-root-accent/20 bg-root-canvas/70 p-3"
                  >
                    <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-root-accent">
                      {t(`navigation_defense_attack.groups.${group}`)}
                    </h3>
                    <ul className="space-y-2">
                      {groupUnits.map((unit) => (
                        <li
                          key={`${group}-${unit.kind}`}
                          className="flex items-start justify-between gap-3 text-sm"
                        >
                          <span className="text-white/75">
                            {unit.catalogKey
                              ? t(`navigation_defense_attack.units.${unit.catalogKey}`)
                              : unit.displayName || unit.label}
                          </span>
                          <strong className="shrink-0 tabular-nums text-white">
                            {formatLocaleNumber(unit.quantity, language)}
                          </strong>
                        </li>
                      ))}
                    </ul>
                  </section>
                );
              })}
            </div>
          ) : (
            <p className="rounded-xl bg-white/5 p-3 text-sm text-white/70">
              {t("game.peacekeeperForces.noData")}
            </p>
          )}
        </div>
        <footer className="flex shrink-0 justify-end border-t border-root-accent/20 p-3 sm:p-4">
          <button
            type="button"
            onClick={() => setIsWithdrawModalOpen(true)}
            className="min-h-[44px] rounded-xl border border-sky-300/50 bg-sky-400/15 px-5 py-2 text-xs font-black uppercase tracking-wider text-sky-200 transition-colors hover:border-sky-200 hover:bg-sky-400/25"
          >
            {t("game.peacekeeperForces.withdrawButton")}
          </button>
        </footer>
      </section>
      <TarikPasukanModal
        isOpen={isWithdrawModalOpen}
        countryName={peacekeeper.allyCountry}
        onClose={() => setIsWithdrawModalOpen(false)}
        onConfirm={() => onWithdraw(peacekeeper)}
        confirmDisabled={units.length === 0}
      />
    </NotebookModalWrapper>,
    document.body,
  );
}
