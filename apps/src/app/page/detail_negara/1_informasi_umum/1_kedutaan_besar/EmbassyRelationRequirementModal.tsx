"use client";
import RootConfirmModal from "@/app/page/root_modals_design_menu/RootConfirmModal";
import { useLanguage } from "@/app/page/paused_menu/terjemahan_paused_menu/languageLogic";
interface EmbassyRelationRequirementModalProps {
  isOpen: boolean;
  countryName?: string | null;
  currentRelation: number;
  minimumRelation: number;
  onClose: () => void;
}

export default function EmbassyRelationRequirementModal({
  isOpen,
  countryName,
  currentRelation,
  minimumRelation,
  onClose,
}: EmbassyRelationRequirementModalProps) {
  const { t } = useLanguage();
  return (
    <RootConfirmModal
      isOpen={isOpen}
      title={t("detail_negara_ai.embassy.relationReqTitle")}
      onClose={onClose}
      variant="info"
      cancelLabel={t("detail_negara_ai.embassy.understood")}
      footerBorderClassName="border-amber-400/20"
    >
      <p className="text-sm sm:text-base text-root-text leading-relaxed">
        {t("detail_negara_ai.embassy.relationReqPrefix")} <strong className="text-white">{countryName}</strong> {t("detail_negara_ai.embassy.relationReqMid")}{" "}
        <strong className="text-amber-300">{minimumRelation}</strong> {t("detail_negara_ai.embassy.relationReqSuffix")}{" "}
        <strong className="text-amber-300">{currentRelation}</strong>.
      </p>
    </RootConfirmModal>
  );
}