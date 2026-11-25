"use client";
import React, { useState } from "react";
import { createPortal } from "react-dom";

import NotebookModalWrapper from "@/app/page/navigasi_menu/2_navigasi_bawah/NotebookModalWrapper";
import RootInfoModalHeader from "@/app/page/root_modals_design_menu/RootInfoModalHeader";
import { useLanguage } from "@/app/page/paused_menu/terjemahan_paused_menu/languageLogic";
import SerangModals from "@/app/page/navigasi_menu/2_navigasi_bawah/6_pertahanan/1_serang_negara/modals_menu/KonfirmasiSerangModals";
import { useTravelFuelQuote } from "@/app/page/navigasi_menu/2_navigasi_bawah/3_produksi_konsumsi/fuelLogic/useTravelFuelQuote";
import { getTravelFuelStatus } from "@/app/page/navigasi_menu/2_navigasi_bawah/3_produksi_konsumsi/fuelLogic/travelFuelLogic";

interface KirimPasukanModalProps {
	isOpen: boolean;
	countryName?: string | null;
	playerCountryDetail?: any;
	targetCountryDetail?: any;
	onClose: () => void;
	onConfirm: (deploymentConfig: Record<string, number>) => void;
}

export default function KirimPasukanModal({
	isOpen,
	countryName,
	playerCountryDetail,
	targetCountryDetail,
	onClose,
	onConfirm,
}: KirimPasukanModalProps) {
	const { t } = useLanguage();
	const [showTroopSelection, setShowTroopSelection] = useState(false);

	const playerName = String(
		playerCountryDetail?.country ||
		playerCountryDetail?.nama_negara ||
		playerCountryDetail?.name_id ||
		playerCountryDetail?.name_en ||
		""
	);

	const targetName = countryName || "";

	const fuelQuote = useTravelFuelQuote(
		playerName,
		targetName,
		"military-attack",
		isOpen && showTroopSelection
	);

	const travelFuelStatus = getTravelFuelStatus(
		playerCountryDetail,
		fuelQuote.cost,
		fuelQuote.loading,
		fuelQuote.fallback
	);

	if (!isOpen) return null;

	const handleProceedToTroopSelection = () => {
		setShowTroopSelection(true);
	};

	const handleTroopSelectionConfirm = (deploymentConfig: Record<string, number>) => {
		setShowTroopSelection(false);
		onConfirm(deploymentConfig);
		onClose();
	};

	const handleCloseAll = () => {
		setShowTroopSelection(false);
		onClose();
	};

	if (showTroopSelection) {
		const targetCountryObj = {
			countryName: targetName,
			displayCountryName: targetName,
			payload: targetCountryDetail || { country: targetName },
		};

		return (
			<SerangModals
				isOpen={true}
				onClose={() => setShowTroopSelection(false)}
				targetCountry={targetCountryObj}
				countryDetail={playerCountryDetail}
				onConfirm={handleTroopSelectionConfirm}
				onAttackBlocked={() => {}}
				travelFuelStatus={travelFuelStatus}
				mode="bantuan_militer"
				customTitle="KONFIRMASI PENGIRIMAN PASUKAN PERDAMAIAN"
				customConfirmLabel="KIRIM PASUKAN PERDAMAIAN"
			/>
		);
	}

	const modalContent = (
		<NotebookModalWrapper compact zIndexClass="z-[100000001]">
			{/* Container Modal Lebih Lebar dan Panjang */}
			<div className="w-full flex flex-col p-4 sm:p-5 font-sans text-white">
				
				{/* Area Konten */}
				<div className="flex-1">
					<RootInfoModalHeader title={t("detail_negara_ai.sendTroops.title")} onClose={handleCloseAll} size="compact" />
					
					<p className="text-sm sm:text-base text-root-text mb-6 leading-relaxed">
						{t("detail_negara_ai.sendTroops.promptPrefix")} <strong className="text-white">{countryName}</strong>? {t("detail_negara_ai.sendTroops.promptSuffix")}
					</p>
				</div>

				{/* Area Tombol di bagian paling bawah */}
				<div className="flex flex-col sm:flex-row gap-3 justify-end mt-6 pt-4 border-t border-root-accent/20">
					<button
						onClick={handleCloseAll}
						className="w-full sm:w-auto px-6 bg-root-canvas hover:bg-[#142A2A] border border-root-accent/30 rounded-xl py-2 text-center text-root-text font-black text-[11px] sm:text-xs tracking-widest uppercase transition-all duration-150 cursor-pointer shadow hover:shadow-md"
					>
						{t("detail_negara_ai.common.cancel")}
					</button>

					<button
						onClick={handleProceedToTroopSelection}
						className="w-full sm:w-auto px-6 bg-sky-600 hover:bg-sky-500 border border-sky-400 rounded-xl py-2 text-center text-white font-black text-[11px] sm:text-xs tracking-widest uppercase transition-all duration-150 cursor-pointer shadow hover:shadow-md active:scale-[0.98]"
					>
						{t("detail_negara_ai.sendTroops.confirm")}
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
