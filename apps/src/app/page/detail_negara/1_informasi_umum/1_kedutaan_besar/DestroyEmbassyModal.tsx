"use client";
import RootConfirmModal from "@/app/page/root_modals_design_menu/RootConfirmModal";
import { useLanguage } from "@/app/page/paused_menu/terjemahan_paused_menu/languageLogic";
interface DestroyEmbassyModalProps {
  isOpen: boolean;
  countryName?: string | null;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DestroyEmbassyModal({ isOpen, countryName, onClose, onConfirm }: DestroyEmbassyModalProps) {
  const { t } = useLanguage();
  return (
    <RootConfirmModal
      isOpen={isOpen}
      title={t("detail_negara_ai.embassy.destroyTitle")}
      onClose={onClose}
      onConfirm={onConfirm}
      confirmLabel={t("detail_negara_ai.embassy.destroyConfirm")}
      isDestructive
      footerBorderClassName="border-rose-500/20"
    >
      <p className="text-sm sm:text-base text-root-text mb-6 leading-relaxed">
        {t("detail_negara_ai.embassy.destroyPromptPrefix")}{" "}
        <strong className="text-white">{countryName}</strong>? {t("detail_negara_ai.embassy.cannotUndo")}
      </p>
    </RootConfirmModal>
  );
}