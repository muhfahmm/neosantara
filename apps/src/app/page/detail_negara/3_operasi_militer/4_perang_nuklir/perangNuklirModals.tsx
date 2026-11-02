"use client";
import React from "react";
import { createPortal } from "react-dom";
import { useState } from "react";
import { X } from "lucide-react";
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
				className="w-full max-w-lg max-h-[calc(100dvh-2rem)] overflow-y-auto flex flex-col bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl shadow-2xl relative pointer-events-auto"
				role="dialog"
				aria-modal="true"
				aria-labelledby="nuclear-confirm-title"
			>
				<div className="flex items-center justify-between border-b border-rose-500/20 bg-[#0A1A1A] px-5 sm:px-6 py-4">
					<h3 id="nuclear-confirm-title" className="text-lg sm:text-xl font-black text-rose-400 tracking-wide uppercase">
						Konfirmasi Perang Nuklir
					</h3>
					<button
						type="button"
						onClick={onClose}
						className="rounded-lg p-1.5 text-[#6B8A8A] transition-colors hover:text-rose-400"
						aria-label="Tutup konfirmasi perang nuklir"
					>
						<X className="h-4 w-4" />
					</button>
				</div>

				<div className="p-5 sm:p-6">
					<p className="text-sm sm:text-base text-[#E0E0E0] leading-relaxed">
						Melancarkan serangan nuklir terhadap <strong className="text-white">{countryName}</strong>? Ini adalah eskalasi tertinggi dan hampir selalu membawa kehancuran besar.
					</p>
				</div>

				<div className="flex flex-col sm:flex-row gap-3 justify-end border-t border-rose-500/20 bg-[#0A1A1A] p-4">
					<button
						type="button"
						onClick={onClose}
						className="w-full sm:w-auto px-6 bg-[#0A1A1A] hover:bg-[#142A2A] border border-[#00FFAA]/30 rounded-xl py-2 text-center text-[#E0E0E0] font-black text-[11px] sm:text-xs tracking-widest uppercase transition-all duration-150 cursor-pointer shadow hover:shadow-md"
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
						className="w-full sm:w-auto px-6 bg-rose-700 hover:bg-rose-800 border border-rose-600 rounded-xl py-2 text-center text-white font-black text-[11px] sm:text-xs tracking-widest uppercase transition-all duration-150 cursor-pointer shadow hover:shadow-md active:scale-[0.98]"
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