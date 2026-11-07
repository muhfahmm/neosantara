"use client";
import SharedModalCloseButton from '@/app/page/root_modals_design_menu/ModalCloseButton';
import React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface KudetaModalProps {
	isOpen: boolean;
	countryName?: string | null;
	onClose: () => void;
	onConfirm: () => void;
}

export default function KudetaModal({ isOpen, countryName, onClose, onConfirm }: KudetaModalProps) {
	if (!isOpen) return null;

	const modalContent = (
		<div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 font-sans text-white pointer-events-none">
			<div
				className="modal-responsive-shell overflow-y-auto flex flex-col bg-root-surface border border-root-accent/30 rounded-2xl shadow-2xl relative pointer-events-auto"
				role="dialog"
				aria-modal="true"
				aria-labelledby="coup-confirm-title"
			>
				<div className="flex items-center justify-between border-b border-rose-500/20 bg-root-canvas px-5 sm:px-6 py-4">
					<h3 id="coup-confirm-title" className="text-lg sm:text-xl font-black text-rose-400 tracking-wide uppercase">
						Konfirmasi Lakukan Kudeta
					</h3>
					<SharedModalCloseButton
						type="button"
						onClick={onClose}
						className="rounded-lg p-1.5 text-root-subtle transition-colors hover:text-rose-400"
						aria-label="Tutup konfirmasi kudeta"
					 appearance="custom">
						<X className="h-4 w-4" />
					</SharedModalCloseButton>
				</div>

				<div className="p-5 sm:p-6">
					<p className="text-sm sm:text-base text-root-text leading-relaxed">
						Lakukan kudeta di <strong className="text-white">{countryName}</strong>? Ini adalah operasi rahasia yang berisiko tinggi terhadap stabilitas pemerintahan.
					</p>
				</div>

				<div className="flex flex-col sm:flex-row gap-3 justify-end border-t border-rose-500/20 bg-root-canvas p-4">
					<button
						type="button"
						onClick={onClose}
						className="w-full sm:w-auto px-6 bg-root-canvas hover:bg-[#142A2A] border border-root-accent/30 rounded-xl py-2 text-center text-root-text font-black text-[11px] sm:text-xs tracking-widest uppercase transition-all duration-150 cursor-pointer shadow hover:shadow-md"
					>
						Batal
					</button>

					<button
						type="button"
						onClick={() => { onConfirm(); onClose(); }}
						className="w-full sm:w-auto px-6 bg-rose-600 hover:bg-rose-700 border border-rose-500 rounded-xl py-2 text-center text-white font-black text-[11px] sm:text-xs tracking-widest uppercase transition-all duration-150 cursor-pointer shadow hover:shadow-md active:scale-[0.98]"
					>
						Lakukan
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