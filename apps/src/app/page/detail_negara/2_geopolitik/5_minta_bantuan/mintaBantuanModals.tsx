"use client";
import React from "react";
import { createPortal } from "react-dom";
import { HandHeart, X } from "lucide-react";

interface MintaBantuanModalProps {
	isOpen: boolean;
	countryName?: string | null;
	onClose: () => void;
	onConfirm: () => void;
}

export default function MintaBantuanModal({ isOpen, countryName, onClose, onConfirm }: MintaBantuanModalProps) {
	if (!isOpen) return null;

	const modalContent = (
		<div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 font-sans pointer-events-auto">
			<div className="w-full max-w-[440px] bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl p-6 shadow-2xl relative text-white">
				{/* Header */}
				<div className="flex items-start justify-between mb-3">
					<div className="flex items-center gap-2.5">
						<div className="p-1.5 bg-[#0A1A1A] rounded-lg border border-[#00FFAA]/30 shrink-0">
							<HandHeart className="h-4 w-4 text-[#00FFAA]" />
						</div>
						<h3 className="text-lg font-black text-[#00FFAA] tracking-wide uppercase">
							Konfirmasi Minta Bantuan
						</h3>
					</div>
					<button
						onClick={onClose}
						className="p-1 rounded-lg text-[#6B8A8A] hover:text-[#00FFAA] transition-colors cursor-pointer"
					>
						<X className="h-4 w-4" />
					</button>
				</div>

				{/* Body */}
				<p className="text-xs sm:text-sm text-[#E0E0E0] mb-6 leading-relaxed">
					Apakah Anda ingin meminta bantuan kepada{" "}
					<strong className="text-[#00FFAA] uppercase">{countryName}</strong>?
					Bantuan dapat berupa dukungan militer, ekonomi, atau kemanusiaan.
				</p>

				{/* Footer */}
				<div className="flex gap-3 justify-end">
					<button
						onClick={onClose}
						className="flex-1 bg-[#0A1A1A] hover:bg-[#142A2A] border border-[#00FFAA]/30 rounded-xl py-2.5 text-center text-[#E0E0E0] font-black text-[12px] tracking-widest uppercase transition-all duration-150 cursor-pointer shadow hover:shadow-md"
					>
						Batal
					</button>

					<button
						onClick={() => { onConfirm(); onClose(); }}
						className="flex-1 bg-[#00FFAA] hover:bg-[#00e699] border border-[#00FFAA] rounded-xl py-2.5 text-center text-[#0A1A1A] font-black text-[12px] tracking-widest uppercase transition-all duration-150 cursor-pointer shadow hover:shadow-md active:scale-[0.98]"
					>
						Minta
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