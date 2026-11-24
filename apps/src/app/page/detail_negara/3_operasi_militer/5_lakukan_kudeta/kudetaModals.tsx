"use client";
import RootInfoModalHeader from '@/app/page/root_modals_design_menu/RootInfoModalHeader';
import React from "react";
import { createPortal } from "react-dom";
import { AlertTriangle } from "lucide-react";
import { useLanguage } from "@/app/page/paused_menu/terjemahan_paused_menu/languageLogic";

interface KudetaModalProps {
	isOpen: boolean;
	countryName?: string | null;
	onClose: () => void;
	onConfirm: () => boolean | void;
}

export default function KudetaModal({ isOpen, countryName, onClose, onConfirm }: KudetaModalProps) {
	const { t } = useLanguage();
	if (!isOpen) return null;

	const modalContent = (
		<div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 font-sans text-white pointer-events-none">
			<div
				className="modal-responsive-shell overflow-y-auto flex flex-col bg-root-surface border border-root-accent/30 rounded-2xl shadow-2xl relative pointer-events-auto"
				role="dialog"
				aria-modal="true"
				aria-labelledby="coup-confirm-title"
			>
				<RootInfoModalHeader
					title={t("detail_negara_ai.military.coupTitle")}
					titleId="coup-confirm-title"
					onClose={onClose}
					icon={<AlertTriangle />}
					size="standard"
				/>

				<div className="p-5 sm:p-6">
					<p className="text-sm sm:text-base text-root-text leading-relaxed">
						{t("detail_negara_ai.military.coupPromptPrefix")} <strong className="text-white">{countryName}</strong>? {t("detail_negara_ai.military.coupPromptSuffix")}
					</p>
				</div>

				<div className="flex flex-col sm:flex-row gap-3 justify-end border-t border-rose-500/20 bg-root-canvas p-4">
					<button
						type="button"
						onClick={onClose}
						className="w-full sm:w-auto px-6 bg-root-canvas hover:bg-[#142A2A] border border-root-accent/30 rounded-xl py-2 text-center text-root-text font-black text-[11px] sm:text-xs tracking-widest uppercase transition-all duration-150 cursor-pointer shadow hover:shadow-md"
					>
						{t("detail_negara_ai.common.cancel")}
					</button>

					<button
						type="button"
						onClick={() => {
							if (onConfirm() !== false) onClose();
						}}
						className="w-full sm:w-auto px-6 bg-rose-600 hover:bg-rose-700 border border-rose-500 rounded-xl py-2 text-center text-white font-black text-[11px] sm:text-xs tracking-widest uppercase transition-all duration-150 cursor-pointer shadow hover:shadow-md active:scale-[0.98]"
					>
						{t("detail_negara_ai.military.coupConfirm")}
					</button>
				</div>

			</div>
		</div>
	);

	if (typeof window !== "undefined") {
		return createPortal(modalContent, document.body);
	}

	return modalContent;
}