"use client";
import React from "react";
import RootConfirmModal from "@/app/page/root_modals_design_menu/RootConfirmModal";
import { HandHeart } from "lucide-react";
import { useLanguage } from "@/app/page/paused_menu/terjemahan_paused_menu/languageLogic";

interface MintaBantuanModalProps {
	isOpen: boolean;
	countryName?: string | null;
	onClose: () => void;
	onConfirm: () => void;
}

export default function MintaBantuanModal({ isOpen, countryName, onClose, onConfirm }: MintaBantuanModalProps) {
	const { t } = useLanguage();
	return (
		<RootConfirmModal
			isOpen={isOpen}
			title={t("detail_negara_ai.geopolitics.requestHelpTitle")}
			icon={<HandHeart className="w-4 h-4 text-root-accent" />}
			onClose={onClose}
			onConfirm={onConfirm}
			confirmLabel={t("detail_negara_ai.geopolitics.requestHelpConfirm")}
			footerBorderClassName="border-root-accent/20"
		>
			<p className="text-sm sm:text-base text-root-text mb-6 leading-relaxed">
				{t("detail_negara_ai.geopolitics.requestHelpPromptPrefix")}{" "}
				<strong className="text-root-accent uppercase">{countryName}</strong>?
				{" "}{t("detail_negara_ai.geopolitics.requestHelpPromptSuffix")}
			</p>
		</RootConfirmModal>
	);
}
