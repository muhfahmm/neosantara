"use client";

import { Undo2 } from "lucide-react";
import { getLocalizedCountryName } from "@/app/logic/countryNameLogic";
import RootConfirmModal from "@/app/page/root_modals_design_menu/RootConfirmModal";
import { useLanguage } from "@/app/page/paused_menu/terjemahan_paused_menu/languageLogic";

interface TarikPasukanModalProps {
  isOpen: boolean;
  countryName: string;
  onClose: () => void;
  onConfirm: () => void;
  confirmDisabled?: boolean;
}

export default function TarikPasukanModal({
  isOpen,
  countryName,
  onClose,
  onConfirm,
  confirmDisabled = false,
}: TarikPasukanModalProps) {
  const { t, language } = useLanguage();
  const localizedCountryName = getLocalizedCountryName(countryName, language);

  return (
    <RootConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title={t("game.peacekeeperForces.withdrawTitle", { country: localizedCountryName })}
      icon={<Undo2 aria-hidden="true" />}
      confirmLabel={t("game.peacekeeperForces.withdrawConfirm")}
      cancelLabel={t("game.peacekeeperForces.withdrawCancel")}
      confirmDisabled={confirmDisabled}
      isDestructive
      zIndexClass="z-[100000002]"
    >
      <p className="py-3 text-sm leading-relaxed text-root-text">
        {t("game.peacekeeperForces.withdrawMessage", { country: localizedCountryName })}
      </p>
    </RootConfirmModal>
  );
}
