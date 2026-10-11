"use client";
import React from "react";

interface AliansiPertahananModalProps {
	isOpen: boolean;
	countryName?: string | null;
	onClose: () => void;
	onConfirm: () => void;
}

export default function AliansiPertahananModal({ isOpen, countryName, onClose, onConfirm }: AliansiPertahananModalProps) {
	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans">
			<div className="w-full max-w-[440px] bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl p-6 shadow-2xl relative text-white">
				<h3 className="text-lg font-black text-[#00FFAA] tracking-wide uppercase mb-3">Konfirmasi Aliansi Pertahanan</h3>
				<p className="text-xs sm:text-sm text-[#E0E0E0] mb-6 leading-relaxed">Apakah Anda ingin mengajukan Aliansi Pertahanan dengan <strong className="text-white">{countryName}</strong>? Jika disetujui, kedua negara akan saling membantu saat diserang.</p>

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
						Ajukan Aliansi
					</button>
				</div>
			</div>
		</div>
	);
}

