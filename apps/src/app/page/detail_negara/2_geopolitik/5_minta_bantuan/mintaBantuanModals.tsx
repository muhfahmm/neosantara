"use client";
import React from "react";
import { createPortal } from "react-dom";
import NotebookModalWrapper from "@/app/page/navigasi_menu/2_navigasi_bawah/NotebookModalWrapper";
import { HandHeart } from "lucide-react";

interface MintaBantuanModalProps {
	isOpen: boolean;
	countryName?: string | null;
	onClose: () => void;
	onConfirm: () => void;
}

export default function MintaBantuanModal({ isOpen, countryName, onClose, onConfirm }: MintaBantuanModalProps) {
	if (!isOpen) return null;

	const modalContent = (
		<NotebookModalWrapper compact zIndexClass="z-[9999]">
			{/* Container Modal Lebih Lebar dan Panjang */}
			<div className="w-full flex flex-col p-4 sm:p-5 font-sans text-white">
				
				{/* Area Konten */}
				<div className="flex-1">
					{/* Header (Tombol Tutup dihapus) */}
					<div className="flex items-center justify-start mb-6 border-b border-root-accent/20 pb-4">
						<div className="flex items-center gap-3">
							<div className="p-2 bg-root-canvas rounded-lg border border-root-accent/30 shrink-0">
								<HandHeart className="h-5 w-5 text-root-accent" />
							</div>
							<h3 className="text-xl sm:text-2xl font-black text-root-accent tracking-wide uppercase">
								Konfirmasi Minta Bantuan
							</h3>
						</div>
					</div>

					{/* Body */}
					<p className="text-sm sm:text-base text-root-text mb-6 leading-relaxed">
						Apakah Anda ingin meminta bantuan kepada{" "}
						<strong className="text-root-accent uppercase">{countryName}</strong>?
						Bantuan dapat berupa dukungan militer, ekonomi, atau kemanusiaan.
					</p>
				</div>

				{/* Area Tombol di bagian paling bawah (Diperkecil) */}
				<div className="flex flex-col sm:flex-row gap-3 justify-end mt-6 pt-4 border-t border-root-accent/20">
					<button
						onClick={onClose}
						className="w-full sm:w-auto px-6 bg-root-canvas hover:bg-[#142A2A] border border-root-accent/30 rounded-xl py-2 text-center text-root-text font-black text-[11px] sm:text-xs tracking-widest uppercase transition-all duration-150 cursor-pointer shadow hover:shadow-md"
					>
						Batal
					</button>

					<button
						onClick={() => { onConfirm(); onClose(); }}
						className="w-full sm:w-auto px-6 bg-root-accent hover:bg-[#00e699] border border-root-accent rounded-xl py-2 text-center text-root-canvas font-black text-[11px] sm:text-xs tracking-widest uppercase transition-all duration-150 cursor-pointer shadow hover:shadow-md active:scale-[0.98]"
					>
						Minta
					</button>
				</div>

			</div>
		</NotebookModalWrapper>
	);

	if (typeof window !== "undefined") {
		return createPortal(modalContent, document.body);
	}

	return modalContent;
}