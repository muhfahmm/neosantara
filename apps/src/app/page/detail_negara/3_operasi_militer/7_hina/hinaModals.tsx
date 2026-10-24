"use client";
import React from "react";
import { createPortal } from "react-dom";

interface HinaModalProps {
	isOpen: boolean;
	countryName?: string | null;
	onClose: () => void;
	onConfirm: () => void;
}

export default function HinaModal({ isOpen, countryName, onClose, onConfirm }: HinaModalProps) {
	if (!isOpen) return null;

	const modalContent = (
		// 🔥 PERBAIKAN: Menghapus bg-black/60 agar tidak ada backdrop
		<div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 font-sans text-white pointer-events-none">
			{/* Container Modal Lebih Lebar dan Panjang */}
			<div className="w-full max-w-2xl min-h-[450px] flex flex-col bg-[#0F2424] border border-amber-500/40 rounded-2xl p-6 sm:p-8 shadow-[0_0_40px_rgba(245,158,11,0.15)] relative pointer-events-auto">
				
				{/* Area Konten */}
				<div className="flex-1">
					<h3 className="text-xl sm:text-2xl font-black text-amber-400 tracking-wide uppercase mb-6 border-b border-amber-500/20 pb-4">
						Konfirmasi Hina
					</h3>
					
					<p className="text-sm sm:text-base text-[#E0E0E0] mb-6 leading-relaxed">
						Hina publik atau pemimpin <strong className="text-white">{countryName}</strong>? Tindakan diplomatik yang memalukan dapat memperburuk hubungan internasional.
					</p>
				</div>

				{/* Area Tombol di bagian paling bawah (Diperkecil) */}
				<div className="flex flex-col sm:flex-row gap-3 justify-end mt-6 pt-4 border-t border-amber-500/20">
					<button
						onClick={onClose}
						className="w-full sm:w-auto px-6 bg-[#0A1A1A] hover:bg-[#142A2A] border border-[#00FFAA]/30 rounded-xl py-2 text-center text-[#E0E0E0] font-black text-[11px] sm:text-xs tracking-widest uppercase transition-all duration-150 cursor-pointer shadow hover:shadow-md"
					>
						Batal
					</button>

					<button
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