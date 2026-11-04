"use client";
import React from "react";
import { createPortal } from "react-dom";

import NotebookModalWrapper from "@/app/page/navigasi_menu/2_navigasi_bawah/NotebookModalWrapper";
interface BerikanSanksiModalProps {
	isOpen: boolean;
	countryName?: string | null;
	currentNetBalance?: number;
	reductionPercent?: number;
	onClose: () => void;
	onConfirm: () => void;
}

export default function BerikanSanksiModal({
	isOpen,
	countryName,
	currentNetBalance = 0,
	reductionPercent = 5,
	onClose,
	onConfirm,
}: BerikanSanksiModalProps) {
	if (!isOpen) return null;

	const netBalanceMultiplier = currentNetBalance >= 0
		? 1 - reductionPercent / 100
		: 1 + reductionPercent / 100;
	const reducedNetBalance = currentNetBalance * netBalanceMultiplier;
	const formatNetBalance = (value: number) =>
		`${value >= 0 ? '+' : ''}${value.toLocaleString('id-ID', { maximumFractionDigits: 2 })} NEO`;

	const modalContent = (
		<NotebookModalWrapper compact maxWidthClass="max-w-xl" zIndexClass="z-[100000001]">
			{/* Container Modal Lebih Lebar dan Panjang */}
			<div className="w-full flex flex-col p-4 sm:p-5 font-sans text-white">
				
				{/* Area Konten */}
				<div className="flex-1">
					<h3 className="text-xl sm:text-2xl font-black text-root-accent tracking-wide uppercase mb-6 border-b border-root-accent/20 pb-4">
						Konfirmasi Berikan Sanksi
					</h3>
					
					<p className="text-sm sm:text-base text-root-text mb-4 leading-relaxed">
						Terapkan sanksi terhadap <strong className="text-white">{countryName}</strong>? Hubungan diplomatik akan turun secara acak sebesar <strong className="text-rose-400">15–30 poin</strong>.
					</p>
					
					<div className="mb-6 rounded-xl border border-root-accent/20 bg-root-canvas p-4 text-sm sm:text-base text-root-text">
						<div className="flex justify-between gap-3">
							<span className="text-root-subtle">Netto kas saat ini</span>
							<strong className="text-right text-root-accent font-mono">{formatNetBalance(currentNetBalance)}</strong>
						</div>
						<div className="my-2 border-t border-root-accent/20" />
						<div className="flex justify-between gap-3">
							<span className="text-root-subtle">Dampak tiap sanksi</span>
							<strong className="text-rose-400">-{reductionPercent}%</strong>
						</div>
						<div className="mt-1 flex justify-between gap-3">
							<span className="text-root-subtle">Netto kas setelah sanksi</span>
							<strong className="text-right text-rose-400 font-mono">{formatNetBalance(reducedNetBalance)}</strong>
						</div>
					</div>
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
						className="w-full sm:w-auto px-6 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 border border-amber-600 rounded-xl py-2 text-center text-white font-black text-[11px] sm:text-xs tracking-widest uppercase transition-all duration-150 cursor-pointer shadow hover:shadow-md active:scale-[0.98]"
					>
						Terapkan Sanksi
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