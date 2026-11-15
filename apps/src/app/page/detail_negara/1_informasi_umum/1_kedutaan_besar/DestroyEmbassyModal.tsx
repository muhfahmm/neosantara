"use client";
import RootConfirmModal from "@/app/page/root_modals_design_menu/RootConfirmModal";
interface DestroyEmbassyModalProps {
  isOpen: boolean;
  countryName?: string | null;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DestroyEmbassyModal({ isOpen, countryName, onClose, onConfirm }: DestroyEmbassyModalProps) {
  return (
    <RootConfirmModal
      isOpen={isOpen}
      title="Konfirmasi Hancurkan Kedutaan"
      onClose={onClose}
      onConfirm={onConfirm}
      confirmLabel="Hancurkan Kedutaan"
      isDestructive
      footerBorderClassName="border-rose-500/20"
    >
      <p className="text-sm sm:text-base text-root-text mb-6 leading-relaxed">
        Apakah Anda yakin ingin menghancurkan kedutaan di{" "}
        <strong className="text-white">{countryName}</strong>? Tindakan ini tidak dapat dibatalkan.
      </p>
    </RootConfirmModal>
  );
}