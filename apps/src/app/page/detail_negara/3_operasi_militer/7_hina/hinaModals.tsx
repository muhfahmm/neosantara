"use client";
import React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface HinaModalProps {
	isOpen: boolean;
	countryName?: string | null;
	onClose: () => void;
	onConfirm: () => void;
}

export default function HinaModal({ isOpen, countryName, onClose, onConfirm }: HinaModalProps) {
	if (!isOpen) return null;

	const modalContent = (
		<div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 font-sans text-white pointer-events-none">
			<div
				className="w-full max-w-lg max-h-[calc(100dvh-2rem)] overflow-y-auto flex flex-col bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl shadow-2xl relative pointer-events-auto"
				role="dialog"
				aria-modal="true"
				aria-labelledby="hina-confirm-title"
			>
				<div className="flex items-center justify-between border-b border-amber-500/20 bg-[#0A1A1A] px-5 sm:px-6 py-4">
					<h3 id="hina-confirm-title" className="text-lg sm:text-xl font-black text-amber-400 tracking-wide uppercase">
						Konfirmasi Hina
					</h3>
					<button
						type="button"
						onClick={onClose}
						className="rounded-lg p-1.5 text-[#6B8A8A] transition-colors hover:text-amber-400"
						aria-label="Tutup konfirmasi hina"
					>
						<X className="h-4 w-4" />
					</button>
				</div>

				<div className="p-5 sm:p-6">
					<p className="text-sm sm:text-base text-[#E0E0E0] leading-relaxed">
						Hina publik atau pemimpin <strong className="text-white">{countryName}</strong>? Tindakan diplomatik yang memalukan dapat memperburuk hubungan internasional.
					</p>
				</div>

				<div className="flex flex-col sm:flex-row gap-3 justify-end border-t border-amber-500/20 bg-[#0A1A1A] p-4">
					<button
						type="button"
						onClick={onClose}
						className="w-full sm:w-auto px-6 bg-[#0A1A1A] hover:bg-[#142A2A] border border-[#00FFAA]/30 rounded-xl py-2 text-center text-[#E0E0E0] font-black text-[11px] sm:text-xs tracking-widest uppercase transition-all duration-150 cursor-pointer shadow hover:shadow-md"
					>
						Batal
					</button>

					<button
						type="button"
						onClick={() => { onConfirm(); onClose(); }}
						className="w-full sm:w-auto px-6 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 border border-amber-600 rounded-xl py-2 text-center text-white font-black text-[11px] sm:text-xs tracking-widest uppercase transition-all duration-150 cursor-pointer shadow hover:shadow-md active:scale-[0.98]"
					>
						Hina
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