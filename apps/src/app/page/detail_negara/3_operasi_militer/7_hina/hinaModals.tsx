"use client";
import React from "react";
import RootConfirmModal from "@/app/page/root_modals_design_menu/RootConfirmModal";
import { useLanguage } from "@/app/page/paused_menu/terjemahan_paused_menu/languageLogic";

interface HinaModalProps {
	isOpen: boolean;
	countryName?: string | null;
	onClose: () => void;
	onConfirm: () => void;
}

export default function HinaModal({ isOpen, countryName, onClose, onConfirm }: HinaModalProps) {
	const { t } = useLanguage();
	return (
		<RootConfirmModal
			isOpen={isOpen}
			title={t("detail_negara_ai.military.insultTitle")}
			onClose={onClose}
			onConfirm={onConfirm}
			confirmLabel={t("detail_negara_ai.actions.insult")}
			confirmButtonClassName="bg-amber-600 hover:bg-amber-700 active:bg-amber-800 border border-amber-600 rounded-xl py-2 text-center text-white font-black text-[11px] sm:text-xs tracking-widest uppercase transition-all duration-150 cursor-pointer shadow hover:shadow-md active:scale-[0.98]"
			footerBorderClassName="border-amber-500/20"
		>
			<p className="text-sm sm:text-base text-root-text leading-relaxed mb-6">
				{t("detail_negara_ai.military.insultPromptPrefix")} <strong className="text-white">{countryName}</strong>? {t("detail_negara_ai.military.insultPromptSuffix")}
			</p>
		</RootConfirmModal>
	);
}
