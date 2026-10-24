"use client";
import React from "react";
import { createPortal } from "react-dom";

interface AliansiPertahananModalProps {
	isOpen: boolean;
	countryName?: string | null;
	onClose: () => void;
	onConfirm: () => void;
}

export default function AliansiPertahananModal({ isOpen, countryName, onClose, onConfirm }: AliansiPertahananModalProps) {
	if (!isOpen) return null;
	const modalContent = (
		<div className="fixed inset-0 z-[100000001] flex items-center justify-center p-4 font-sans pointer-events-none">
			{/* Container Modal Lebih Lebar dan Panjang */}
			<div className="w-full max-w-2xl min-h-[450px] flex flex-col bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl p-6 sm:p-8 shadow-[0_0_40px_rgba(0,255,170,0.15)] relative text-white pointer-events-auto">
				
				{/* Area Konten */}
				<div className="flex-1">
					<h3 className="text-xl sm:text-2xl font-black text-[#00FFAA] tracking-wide uppercase mb-6 border-b border-[#00FFAA]/20 pb-4">
						Konfirmasi Aliansi Pertahanan
					</h3>
					
					<p className="text-sm sm:text-base text-[#E0E0E0] mb-6 leading-relaxed">
						Apakah Anda ingin mengajukan Aliansi Pertahanan dengan <strong className="text-white">{countryName}</strong>? Jika disetujui, kedua negara akan saling membantu saat diserang.
					</p>
				</div>

				{/* Area Tombol di bagian paling bawah (Diperkecil) */}
				<div className="flex flex-col sm:flex-row gap-3 justify-end mt-6 pt-4 border-t border-[#00FFAA]/20">
					<button
						onClick={onClose}
						className="w-full sm:w-auto px-6 bg-[#0A1A1A] hover:bg-[#142A2A] border border-[#00FFAA]/30 rounded-xl py-2 text-center text-[#E0E0E0] font-black text-[11px] sm:text-xs tracking-widest uppercase transition-all duration-150 cursor-pointer shadow hover:shadow-md"
					>
						Batal
					</button>

					<button
						onClick={() => { onConfirm(); onClose(); }}
						className="w-full sm:w-auto px-6 bg-[#00FFAA] hover:bg-[#00e699] border border-[#00FFAA] rounded-xl py-2 text-center text-[#0A1A1A] font-black text-[11px] sm:text-xs tracking-widest uppercase transition-all duration-150 cursor-pointer shadow hover:shadow-md active:scale-[0.98]"
					>
						Ajukan Aliansi
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