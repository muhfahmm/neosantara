"use client";
import React from "react";
import { createPortal } from "react-dom";
import { useState } from "react";
import RootInfoModalHeader from '@/app/page/root_modals_design_menu/RootInfoModalHeader';
import IcbmTidakTersediaModal from "./IcbmTidakTersediaModal";
import { useIcbmMenuTranslation } from '@/app/page/paused_menu/terjemahan_paused_menu/useIcbmMenuTranslation';

interface PerangNuklirModalProps {
	isOpen: boolean;
	countryName?: string | null;
	onClose: () => void;
	onConfirm: () => void;
	availableIcbmCount?: number;
}

export default function PerangNuklirModal({ isOpen, countryName, onClose, onConfirm, availableIcbmCount }: PerangNuklirModalProps) {
	const [isIcbmUnavailableOpen, setIsIcbmUnavailableOpen] = useState(false);
	const { translate } = useIcbmMenuTranslation();
	if (!isOpen) return null;
	const confirmationLead = translate("war.confirmationLead");

	const modalContent = (
		<div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 font-sans text-white pointer-events-none">
			<div
				className="modal-responsive-shell overflow-y-auto flex flex-col bg-root-surface border border-root-accent/30 rounded-2xl shadow-2xl relative pointer-events-auto"
				role="dialog"
				aria-modal="true"
				aria-labelledby="nuclear-confirm-title"
			>
				<RootInfoModalHeader
					title={translate("war.confirmationTitle")}
					titleId="nuclear-confirm-title"
					onClose={onClose}
					size="standard"
				/>

				<div className="p-5 sm:p-6">
					<p className="text-sm sm:text-base text-root-text leading-relaxed">
						{confirmationLead}{confirmationLead ? " " : null}
						<strong className="text-white">{countryName}</strong>
						{translate("war.confirmationTail")}
					</p>
				</div>

				<div className="flex flex-col sm:flex-row gap-3 justify-end border-t border-rose-500/20 bg-root-canvas p-4">
					<button
						type="button"
						onClick={onClose}
						className="w-full sm:w-auto px-6 bg-root-canvas hover:bg-[#142A2A] border border-root-accent/30 rounded-xl py-2 text-center text-root-text font-black text-[11px] sm:text-xs tracking-widest uppercase transition-all duration-150 cursor-pointer shadow hover:shadow-md"
					>
						{translate("common.cancel")}
					</button>

					<button
						type="button"
						onClick={() => {
							if (availableIcbmCount !== undefined && availableIcbmCount < 1) {
								setIsIcbmUnavailableOpen(true);
								return;
							}
							onConfirm();
							onClose();
						}}
						className="w-full sm:w-auto px-6 bg-rose-700 hover:bg-rose-800 border border-rose-600 rounded-xl py-2 text-center text-white font-black text-[11px] sm:text-xs tracking-widest uppercase transition-all duration-150 cursor-pointer shadow hover:shadow-md active:scale-[0.98]"
					>
						{translate("war.confirmNuclear")}
					</button>
				</div>

			</div>
		</div>
	);

	if (typeof window !== "undefined") {
		return (
			<>
				{createPortal(modalContent, document.body)}
				<IcbmTidakTersediaModal
					isOpen={isIcbmUnavailableOpen}
					onClose={() => setIsIcbmUnavailableOpen(false)}
				/>
			</>
		);
	}

	return modalContent;
}