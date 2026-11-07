"use client";
import React from "react";
import { createPortal } from "react-dom";

import NotebookModalWrapper from "@/app/page/navigasi_menu/2_navigasi_bawah/NotebookModalWrapper";
import TravelFuelCostPanel from "@/app/page/navigasi_menu/2_navigasi_bawah/3_produksi_konsumsi/fuelLogic/TravelFuelCostPanel";
import type { TravelFuelStatus } from "@/app/page/navigasi_menu/2_navigasi_bawah/3_produksi_konsumsi/fuelLogic/travelFuelLogic";
interface AliansiPertahananModalProps {
	isOpen: boolean;
	countryName?: string | null;
	onClose: () => void;
	onConfirm: () => void;
	travelFuelStatus?: TravelFuelStatus;
}

export default function AliansiPertahananModal({ isOpen, countryName, onClose, onConfirm, travelFuelStatus }: AliansiPertahananModalProps) {
	if (!isOpen) return null;
	const modalContent = (
		<NotebookModalWrapper compact zIndexClass="z-[100000001]">
			{/* Container Modal Lebih Lebar dan Panjang */}
			<div className="w-full flex flex-col p-4 sm:p-5 font-sans text-white">
				
				{/* Area Konten */}
				<div className="flex-1">
					<h3 className="text-xl sm:text-2xl font-black text-root-accent tracking-wide uppercase mb-6 border-b border-root-accent/20 pb-4">
						Konfirmasi Aliansi Pertahanan
					</h3>
					
					<p className="text-sm sm:text-base text-root-text mb-6 leading-relaxed">
						Apakah Anda ingin mengajukan Aliansi Pertahanan dengan <strong className="text-white">{countryName}</strong>? Jika disetujui, kedua negara akan saling membantu saat diserang.
					</p>
					{travelFuelStatus && <TravelFuelCostPanel status={travelFuelStatus} />}
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
						disabled={travelFuelStatus ? !travelFuelStatus.ok : false}
						className="w-full sm:w-auto px-6 bg-root-accent hover:bg-[#00e699] border border-root-accent rounded-xl py-2 text-center text-root-canvas font-black text-[11px] sm:text-xs tracking-widest uppercase transition-all duration-150 cursor-pointer shadow hover:shadow-md active:scale-[0.98]"
					>
						Ajukan Aliansi
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