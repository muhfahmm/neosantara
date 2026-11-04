"use client";
import React from "react";
import { createPortal } from "react-dom";

import NotebookModalWrapper from "@/app/page/navigasi_menu/2_navigasi_bawah/NotebookModalWrapper";
import TravelFuelCostPanel from "@/app/page/navigasi_menu/2_navigasi_bawah/3_produksi_konsumsi/fuelLogic/TravelFuelCostPanel";
import type { TravelFuelStatus } from "@/app/page/navigasi_menu/2_navigasi_bawah/3_produksi_konsumsi/fuelLogic/travelFuelLogic";
interface PaktaNonAgresiModalProps {
	isOpen: boolean;
	countryName?: string | null;
	chancePercent?: number;
	onClose: () => void;
	onConfirm: () => void;
	travelFuelStatus?: TravelFuelStatus;
}

export default function PaktaNonAgresiModal({ isOpen, countryName, onClose, onConfirm, travelFuelStatus }: PaktaNonAgresiModalProps) {
	if (!isOpen) return null;

	const modalContent = (
		<NotebookModalWrapper compact maxWidthClass="max-w-xl" zIndexClass="z-[100000001]">
			{/* Container Modal */}
			<div className="w-full flex flex-col p-4 sm:p-5 font-sans text-white">
				
				{/* Area Konten */}
				<div className="flex-1">
					<h3 className="text-xl sm:text-2xl font-black text-root-accent tracking-wide uppercase mb-6 border-b border-root-accent/20 pb-4">
						Konfirmasi Pakta Non-Agresi
					</h3>
					
					<p className="text-sm sm:text-base text-root-text mb-4 leading-relaxed">
						Apakah Anda ingin mengajukan Pakta Non-Agresi kepada <strong className="text-white text-lg">{countryName}</strong>?
					</p>
					<p className="text-sm sm:text-base text-root-text mb-6 leading-relaxed">
						Pakta ini akan berlaku jika diterima dan menegaskan bahwa kedua negara tidak akan saling menyerang dalam jangka waktu yang disepakati.
					</p>
					{travelFuelStatus && <TravelFuelCostPanel status={travelFuelStatus} />}
					
					{/* 🔥 PERBAIKAN: Blok Peluang Diterima telah dihapus */}
				</div>

				{/* Area Tombol di bagian paling bawah */}
				<div className="flex flex-col sm:flex-row gap-3 justify-end mt-6 pt-4 border-t border-root-accent/20">
					<button
						onClick={onClose}
						className="w-full sm:w-auto px-6 bg-root-canvas border border-root-accent/30 hover:border-root-accent rounded-xl py-2 text-center text-root-text font-black text-[11px] sm:text-xs tracking-widest uppercase transition-colors duration-150 cursor-pointer shadow"
					>
						Batal
					</button>

					<button
						onClick={() => { onConfirm(); onClose(); }}
						disabled={travelFuelStatus ? !travelFuelStatus.ok : false}
						className="w-full sm:w-auto px-6 bg-root-accent border border-root-accent hover:border-root-text rounded-xl py-2 text-center text-root-canvas font-black text-[11px] sm:text-xs tracking-widest uppercase transition-colors duration-150 cursor-pointer shadow active:scale-[0.98]"
					>
						Jalin Pakta
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