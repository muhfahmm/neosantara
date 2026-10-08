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
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
			<div className="w-full max-w-[420px] bg-white rounded-2xl p-6 shadow-lg border border-[#E5DCCF]">
				<h3 className="text-lg font-black text-[#3d2911] mb-3">Konfirmasi Berikan Sanksi</h3>
				<p className="text-sm text-[#5c3c10] mb-4">
					Terapkan sanksi terhadap <strong>{countryName}</strong>? Hubungan diplomatik akan turun secara acak sebesar <strong>15–30 poin</strong>.
				</p>
				<div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-[#5c3c10]">
					<div className="flex justify-between gap-3">
						<span>Netto kas saat ini</span>
						<strong className="text-right">{formatNetBalance(currentNetBalance)}</strong>
					</div>
					<div className="my-2 border-t border-amber-200" />
					<div className="flex justify-between gap-3">
						<span>Dampak tiap sanksi</span>
						<strong className="text-rose-700">-{reductionPercent}%</strong>
					</div>
					<div className="mt-1 flex justify-between gap-3">
						<span>Netto kas setelah sanksi</span>
						<strong className="text-right text-rose-700">{formatNetBalance(reducedNetBalance)}</strong>
					</div>
				</div>

				<div className="flex gap-3 justify-end">
					<button
						onClick={onClose}
						className="flex-1 bg-white/70 border border-[#C4B49C]/30 rounded py-2.5 text-center text-[#5c3c10] font-black text-[12px] tracking-widest uppercase transition-all duration-150 cursor-pointer hover:shadow-md"
					>
						Batal
					</button>

					<button
						onClick={() => { onConfirm(); onClose(); }}
						className="flex-1 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 border border-amber-700 rounded py-2.5 text-center text-white font-black text-[12px] tracking-widest uppercase transition-all duration-150 cursor-pointer shadow hover:shadow-md active:scale-[0.98]"
					>
						Terapkan Sanksi
					</button>
				</div>
			</div>
		</div>
	);
}
