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
		// 🔥 PERBAIKAN: Menghapus bg-black/60 agar tidak ada backdrop
		<div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 font-sans pointer-events-none">
			{/* Container Modal Lebih Lebar dan Panjang */}
			<div className="w-full max-w-2xl min-h-[450px] flex flex-col bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl p-6 sm:p-8 shadow-[0_0_40px_rgba(0,255,170,0.15)] relative text-white pointer-events-auto">
				
				{/* Area Konten */}
				<div className="flex-1">
					{/* Header */}
					<div className="flex items-start justify-between mb-6 border-b border-[#00FFAA]/20 pb-4">
						<div className="flex items-center gap-3">
							<div className="p-2 bg-[#0A1A1A] rounded-lg border border-[#00FFAA]/30 shrink-0">
								<HandHeart className="h-5 w-5 text-[#00FFAA]" />
							</div>
							<h3 className="text-xl sm:text-2xl font-black text-[#00FFAA] tracking-wide uppercase">
								Konfirmasi Minta Bantuan
							</h3>
						</div>
						<button
							onClick={onClose}
							className="p-1.5 rounded-lg text-[#6B8A8A] hover:text-[#00FFAA] hover:bg-[#00FFAA]/10 transition-colors cursor-pointer"
						>
							<X className="h-5 w-5" />
						</button>
					</div>

					{/* Body */}
					<p className="text-sm sm:text-base text-[#E0E0E0] mb-6 leading-relaxed">
						Apakah Anda ingin meminta bantuan kepada{" "}
						<strong className="text-[#00FFAA] uppercase">{countryName}</strong>?
						Bantuan dapat berupa dukungan militer, ekonomi, atau kemanusiaan.
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