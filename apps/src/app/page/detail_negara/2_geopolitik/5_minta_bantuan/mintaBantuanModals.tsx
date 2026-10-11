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
		<div className="fixed inset-0 z-50 flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none">
			<div className="bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans pointer-events-auto shadow-2xl">

				{/* Header */}
				<div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-[#00FFAA]/20 flex items-center justify-between bg-[#0A1A1A] gap-2 shrink-0 rounded-t-2xl">
					<div className="flex items-center gap-2 sm:gap-3">
						<div className="p-1 sm:p-1.5 bg-[#0F2424] rounded-lg border border-[#00FFAA]/30 shrink-0">
							<HandHeart className="h-4 w-4 sm:h-5 sm:w-5 text-[#00FFAA]" />
						</div>
						<h3 className="text-base sm:text-xl font-bold text-[#00FFAA] tracking-tight leading-none uppercase">
							Konfirmasi Minta Bantuan
						</h3>
					</div>

					<button
						onClick={onClose}
						className="p-1.5 lg:p-2 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] text-[#6B8A8A] hover:text-[#00FFAA] hover:border-[#00FFAA] transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1 shadow-sm"
					>
						<span className="text-[10px] lg:text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
						<X className="h-4 w-4" />
					</button>
				</div>

				{/* Body */}
				<div className="flex-1 min-h-0 bg-[#0F2424] relative z-10 p-6 sm:p-8 flex flex-col items-center justify-center">
					<p className="text-sm sm:text-base text-[#E0E0E0] leading-relaxed text-center max-w-2xl">
						Minta bantuan ke{" "}
						<strong className="text-[#00FFAA] font-bold uppercase">{countryName}</strong>?
						Bantuan dapat berupa dukungan militer, ekonomi, atau kemanusiaan.
					</p>
				</div>

				{/* Footer */}
				<div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-[#00FFAA]/20 bg-[#0A1A1A] shrink-0 rounded-b-2xl">
					<div className="flex gap-3 justify-end">
						<button
							onClick={onClose}
							className="px-6 py-3 bg-[#0F2424] hover:bg-[#163535] border border-[#00FFAA]/30 rounded-xl text-center text-[#E0E0E0] font-black text-xs tracking-wider uppercase transition-all cursor-pointer"
						>
							Batal
						</button>
						<button
							onClick={() => { onConfirm(); onClose(); }}
							className="px-6 py-3 bg-[#00FFAA] hover:bg-[#00e699] border border-[#00FFAA] rounded-xl text-center text-[#0A1A1A] font-black text-xs tracking-wider uppercase transition-all cursor-pointer shadow-md"
						>
							Minta
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}