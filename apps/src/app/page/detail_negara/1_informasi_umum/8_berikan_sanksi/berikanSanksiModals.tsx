"use client";
import React from "react";
import { createPortal } from "react-dom";

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
		// 🔥 PERBAIKAN: Menghapus bg-black/60 agar tidak ada backdrop
		<div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 font-sans pointer-events-none">
			{/* Container Modal Lebih Lebar dan Panjang */}
			<div className="w-full max-w-2xl min-h-[450px] flex flex-col bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl p-6 sm:p-8 shadow-[0_0_40px_rgba(0,255,170,0.15)] relative text-white pointer-events-auto">
				
				{/* Area Konten */}
				<div className="flex-1">
					<h3 className="text-xl sm:text-2xl font-black text-[#00FFAA] tracking-wide uppercase mb-6 border-b border-[#00FFAA]/20 pb-4">
						Konfirmasi Berikan Sanksi
					</h3>
					
					<p className="text-sm sm:text-base text-[#E0E0E0] mb-4 leading-relaxed">
						Terapkan sanksi terhadap <strong className="text-white">{countryName}</strong>? Hubungan diplomatik akan turun secara acak sebesar <strong className="text-rose-400">15–30 poin</strong>.
					</p>
					
					<div className="mb-6 rounded-xl border border-[#00FFAA]/20 bg-[#0A1A1A] p-4 text-sm sm:text-base text-[#E0E0E0]">
						<div className="flex justify-between gap-3">
							<span className="text-[#6B8A8A]">Netto kas saat ini</span>
							<strong className="text-right text-[#00FFAA] font-mono">{formatNetBalance(currentNetBalance)}</strong>
						</div>
						<div className="my-2 border-t border-[#00FFAA]/20" />
						<div className="flex justify-between gap-3">
							<span className="text-[#6B8A8A]">Dampak tiap sanksi</span>
							<strong className="text-rose-400">-{reductionPercent}%</strong>
						</div>
						<div className="mt-1 flex justify-between gap-3">
							<span className="text-[#6B8A8A]">Netto kas setelah sanksi</span>
							<strong className="text-right text-rose-400 font-mono">{formatNetBalance(reducedNetBalance)}</strong>
						</div>
					</div>
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
						className="w-full sm:w-auto px-6 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 border border-amber-600 rounded-xl py-2 text-center text-white font-black text-[11px] sm:text-xs tracking-widest uppercase transition-all duration-150 cursor-pointer shadow hover:shadow-md active:scale-[0.98]"
					>
						Terapkan Sanksi
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