"use client";
import React from "react";
import { createPortal } from "react-dom";

import NotebookModalWrapper from "@/app/page/navigasi_menu/2_navigasi_bawah/NotebookModalWrapper";
import TravelFuelCostPanel from "@/app/page/navigasi_menu/2_navigasi_bawah/3_produksi_konsumsi/fuelLogic/TravelFuelCostPanel";
import type { TravelFuelStatus } from "@/app/page/navigasi_menu/2_navigasi_bawah/3_produksi_konsumsi/fuelLogic/travelFuelLogic";
interface KontrakPenelitianModalProps {
	isOpen: boolean;
	countryName?: string | null;
	onClose: () => void;
	onConfirm: () => void;
	travelFuelStatus?: TravelFuelStatus;
}

export default function KontrakPenelitianModal({ isOpen, countryName, onClose, onConfirm, travelFuelStatus }: KontrakPenelitianModalProps) {
	if (!isOpen) return null;
	const modalContent = (
		<NotebookModalWrapper compact maxWidthClass="max-w-xl" zIndexClass="z-[100000001]">
			{/* Container Modal Lebih Lebar dan Panjang */}
			<div className="w-full flex flex-col p-4 sm:p-5 font-sans text-white">
				
				{/* Area Konten */}
				<div className="flex-1">
					<h3 className="text-xl sm:text-2xl font-black text-[#00FFAA] tracking-wide uppercase mb-6 border-b border-[#00FFAA]/20 pb-4">
						Konfirmasi Kontrak Penelitian
					</h3>
					
					<p className="text-sm sm:text-base text-[#E0E0E0] mb-6 leading-relaxed">
						Mulai kontrak penelitian dengan <strong className="text-white">{countryName}</strong>? Kolaborasi ini mengurangi durasi semua penelitian nasional sebesar <strong className="text-[#00FFAA]">0,1%</strong> per negara mitra.
					</p>
					{travelFuelStatus && <TravelFuelCostPanel status={travelFuelStatus} />}
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
						disabled={travelFuelStatus ? !travelFuelStatus.ok : false}
						className="w-full sm:w-auto px-6 bg-[#00FFAA] hover:bg-[#00e699] border border-[#00FFAA] rounded-xl py-2 text-center text-[#0A1A1A] font-black text-[11px] sm:text-xs tracking-widest uppercase transition-all duration-150 cursor-pointer shadow hover:shadow-md active:scale-[0.98]"
					>
						Mulai Kontrak
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