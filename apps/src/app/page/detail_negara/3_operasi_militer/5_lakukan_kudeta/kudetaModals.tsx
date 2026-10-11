"use client";
import React from "react";

interface KudetaModalProps {
	isOpen: boolean;
	countryName?: string | null;
	onClose: () => void;
	onConfirm: () => void;
}

export default function KudetaModal({ isOpen, countryName, onClose, onConfirm }: KudetaModalProps) {
	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans text-white">
			<div className="w-full max-w-[440px] bg-[#0F2424] border border-rose-500/40 rounded-2xl p-6 shadow-2xl relative">
				<h3 className="text-lg font-black text-rose-400 tracking-wide uppercase mb-3">Konfirmasi Lakukan Kudeta</h3>
				<p className="text-xs sm:text-sm text-[#E0E0E0] mb-6 leading-relaxed">Lakukan kudeta di <strong className="text-white">{countryName}</strong>? Ini adalah operasi rahasia yang berisiko tinggi terhadap stabilitas pemerintahan.</p>

				<div className="flex gap-3 justify-end">
					<button
						onClick={onClose}
						className="flex-1 bg-[#0A1A1A] hover:bg-[#142A2A] border border-[#00FFAA]/30 rounded-xl py-2.5 text-center text-[#E0E0E0] font-black text-[12px] tracking-widest uppercase transition-all duration-150 cursor-pointer shadow hover:shadow-md"
					>
						Batal
					</button>

					<button
						onClick={() => { onConfirm(); onClose(); }}
						className="flex-1 bg-rose-600 hover:bg-rose-700 border border-rose-500 rounded-xl py-2.5 text-center text-white font-black text-[12px] tracking-widest uppercase transition-all duration-150 cursor-pointer shadow hover:shadow-md active:scale-[0.98]"
					>
						Lakukan
					</button>
				</div>
			</div>
		</div>
	);
}

