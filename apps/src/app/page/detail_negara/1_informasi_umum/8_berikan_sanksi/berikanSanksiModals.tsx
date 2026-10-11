"use client";
import React from "react";

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

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans">
			<div className="w-full max-w-[440px] bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl p-6 shadow-2xl relative text-white">
				<h3 className="text-lg font-black text-[#00FFAA] tracking-wide uppercase mb-3">Konfirmasi Berikan Sanksi</h3>
				<p className="text-xs sm:text-sm text-[#E0E0E0] mb-4 leading-relaxed">
					Terapkan sanksi terhadap <strong className="text-white">{countryName}</strong>? Hubungan diplomatik akan turun secara acak sebesar <strong className="text-rose-400">15–30 poin</strong>.
				</p>
				<div className="mb-6 rounded-xl border border-[#00FFAA]/20 bg-[#0A1A1A] p-4 text-xs sm:text-sm text-[#E0E0E0]">
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

				<div className="flex gap-3 justify-end">
					<button
						onClick={onClose}
						className="flex-1 bg-[#0A1A1A] hover:bg-[#142A2A] border border-[#00FFAA]/30 rounded-xl py-2.5 text-center text-[#E0E0E0] font-black text-[12px] tracking-widest uppercase transition-all duration-150 cursor-pointer shadow hover:shadow-md"
					>
						Batal
					</button>

					<button
						onClick={() => { onConfirm(); onClose(); }}
						className="flex-1 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 border border-amber-600 rounded-xl py-2.5 text-center text-white font-black text-[12px] tracking-widest uppercase transition-all duration-150 cursor-pointer shadow hover:shadow-md active:scale-[0.98]"
					>
						Terapkan Sanksi
					</button>
				</div>
			</div>
		</div>
	);
}
