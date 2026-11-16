"use client";
import React from "react";
import RootConfirmModal from "@/app/page/root_modals_design_menu/RootConfirmModal";

interface HinaModalProps {
	isOpen: boolean;
	countryName?: string | null;
	onClose: () => void;
	onConfirm: () => void;
}

export default function HinaModal({ isOpen, countryName, onClose, onConfirm }: HinaModalProps) {
	return (
		<RootConfirmModal
			isOpen={isOpen}
			title="Konfirmasi Hina"
			onClose={onClose}
			onConfirm={onConfirm}
			confirmLabel="Hina"
			confirmButtonClassName="bg-amber-600 hover:bg-amber-700 active:bg-amber-800 border border-amber-600 rounded-xl py-2 text-center text-white font-black text-[11px] sm:text-xs tracking-widest uppercase transition-all duration-150 cursor-pointer shadow hover:shadow-md active:scale-[0.98]"
			footerBorderClassName="border-amber-500/20"
		>
			<p className="text-sm sm:text-base text-root-text leading-relaxed mb-6">
				Hina publik atau pemimpin <strong className="text-white">{countryName}</strong>? Tindakan diplomatik yang memalukan dapat memperburuk hubungan internasional.
			</p>
		</RootConfirmModal>
	);
}
