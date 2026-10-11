"use client";
import React from "react";
import { HandHeart, X } from "lucide-react";

interface MintaBantuanModalProps {
	isOpen: boolean;
	countryName?: string | null;
	onClose: () => void;
	onConfirm: () => void;
}

export default function MintaBantuanModal({ isOpen, countryName, onClose, onConfirm }: MintaBantuanModalProps) {
	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-transparent pointer-events-none">
			<div className="bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl overflow-hidden w-full max-w-md shadow-2xl pointer-events-auto">

				{/* Header */}
				<div className="px-4 sm:px-5 py-3 border-b border-[#00FFAA]/20 flex items-center justify-between bg-[#0A1A1A] gap-2 shrink-0 rounded-t-2xl">
					<div className="flex items-center gap-2 sm:gap-2.5">
						<div className="p-1.5 bg-[#0F2424] rounded-lg border border-[#00FFAA]/30 shrink-0">
							<HandHeart className="h-4 w-4 text-[#00FFAA]" />
						</div>
						<h3 className="text-sm sm:text-base font-bold text-[#00FFAA] tracking-tight leading-none uppercase">
							Konfirmasi Minta Bantuan
						</h3>
					</div>

					<button
						onClick={onClose}
						className="p-1.5 rounded-lg border border-[#00FFAA]/30 bg-[#0F2424] text-[#6B8A8A] hover:text-[#00FFAA] hover:border-[#00FFAA] transition-all cursor-pointer"
					>
						<X className="h-4 w-4" />
					</button>
				</div>

				{/* Body */}
				<div className="p-4 sm:p-5">
					<p className="text-xs sm:text-sm text-[#E0E0E0] leading-relaxed">
						Minta bantuan ke{" "}
						<strong className="text-[#00FFAA] font-bold uppercase">{countryName}</strong>?
						Bantuan dapat berupa dukungan militer, ekonomi, atau kemanusiaan.
					</p>
				</div>

				{/* Footer */}
				<div className="px-4 sm:px-5 py-3 border-t border-[#00FFAA]/20 bg-[#0A1A1A] flex gap-3 shrink-0">
					<button
						onClick={onClose}
						className="flex-1 bg-[#0F2424] hover:bg-[#163535] border border-[#00FFAA]/30 rounded-lg py-2.5 text-center text-[#E0E0E0] font-black text-xs tracking-wider uppercase transition-all cursor-pointer"
					>
						Batal
					</button>
					<button
						onClick={() => { onConfirm(); onClose(); }}
						className="flex-1 bg-[#00FFAA] hover:bg-[#00e699] border border-[#00FFAA] rounded-lg py-2.5 text-center text-[#0A1A1A] font-black text-xs tracking-wider uppercase transition-all cursor-pointer shadow-md"
					>
						Minta
					</button>
				</div>
			</div>
		</div>
	);
}