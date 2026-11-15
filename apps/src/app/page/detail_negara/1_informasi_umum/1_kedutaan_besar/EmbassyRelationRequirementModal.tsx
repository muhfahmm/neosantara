"use client";
import RootConfirmModal from "@/app/page/root_modals_design_menu/RootConfirmModal";
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
  return (
    <RootConfirmModal
      isOpen={isOpen}
      title="Kedutaan Belum Dapat Dibangun"
      onClose={onClose}
      variant="info"
      cancelLabel="Mengerti"
      footerBorderClassName="border-amber-400/20"
    >
      <p className="text-sm sm:text-base text-root-text leading-relaxed">
        Hubungan dengan <strong className="text-white">{countryName}</strong> harus mencapai minimal{" "}
        <strong className="text-amber-300">{minimumRelation}</strong> untuk membangun kedutaan. Hubungan saat ini{" "}
        <strong className="text-amber-300">{currentRelation}</strong>.
      </p>
    </RootConfirmModal>
  );
}