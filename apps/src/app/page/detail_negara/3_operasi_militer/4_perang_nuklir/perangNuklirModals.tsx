"use client";
import SharedModalCloseButton from '@/app/page/root_modals_design_menu/ModalCloseButton';
import React from "react";
import { createPortal } from "react-dom";
import { useState } from "react";
import { ShieldAlert, X } from "lucide-react";
import IcbmTidakTersediaModal from "./IcbmTidakTersediaModal";

interface PerangNuklirModalProps {
	isOpen: boolean;
	countryName?: string | null;
	onClose: () => void;
	onConfirm: () => void;
	availableIcbmCount?: number;
}

export default function PerangNuklirModal({ isOpen, countryName, onClose, onConfirm, availableIcbmCount }: PerangNuklirModalProps) {
	const [isIcbmUnavailableOpen, setIsIcbmUnavailableOpen] = useState(false);
	if (!isOpen) return null;

	const modalContent = (
		<div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 font-sans text-white pointer-events-none">
			<div
				className="modal-responsive-shell overflow-y-auto flex flex-col bg-root-surface border border-root-accent/30 rounded-2xl shadow-2xl relative pointer-events-auto"
				role="dialog"
				aria-modal="true"
				aria-labelledby="nuclear-confirm-title"
			>
				<div className="flex items-center justify-between border-b border-rose-500/20 bg-root-canvas px-5 sm:px-6 py-4">
					<h3 id="nuclear-confirm-title" className="text-lg sm:text-xl font-black text-rose-400 tracking-wide uppercase">
						Konfirmasi Perang Nuklir
					</h3>
					<SharedModalCloseButton
						type="button"
						onClick={onClose}
						className="rounded-lg p-1.5 text-root-subtle transition-colors hover:text-rose-400"
						aria-label="Tutup konfirmasi perang nuklir"
					 appearance="custom">
						<X className="h-4 w-4" />
					</SharedModalCloseButton>
				</div>

				<div className="space-y-4 p-4 sm:p-6">
					<p className="text-sm sm:text-base text-root-text leading-relaxed">
						Melancarkan serangan nuklir terhadap <strong className="text-white">{countryName}</strong>? Ini adalah eskalasi tertinggi dan hampir selalu membawa kehancuran besar.
					</p>
					<div role="alert" className="flex items-start gap-3 rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 sm:p-4">
						<ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-rose-400" aria-hidden="true" />
						<p className="text-xs sm:text-sm leading-relaxed text-rose-200">
							Konsekuensi diplomatik: seluruh 210 negara memberikan penalti hubungan sebesar <strong>-5</strong>.
						</p>
					</div>
				</div>

				<div className="flex flex-col sm:flex-row gap-3 justify-end border-t border-rose-500/20 bg-root-canvas p-4">
					<button
						type="button"
						onClick={onClose}
						className="min-h-11 w-full sm:w-auto px-6 bg-root-canvas hover:bg-[#142A2A] border border-root-accent/30 rounded-xl py-2 text-center text-root-text font-black text-[11px] sm:text-xs tracking-widest uppercase transition-all duration-150 cursor-pointer shadow hover:shadow-md"
					>
						Batal
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
						className="min-h-11 w-full sm:w-auto px-6 bg-rose-700 hover:bg-rose-800 border border-rose-600 rounded-xl py-2 text-center text-white font-black text-[11px] sm:text-xs tracking-widest uppercase transition-all duration-150 cursor-pointer shadow hover:shadow-md active:scale-[0.98]"
					>
						Konfirmasi Nuklir
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