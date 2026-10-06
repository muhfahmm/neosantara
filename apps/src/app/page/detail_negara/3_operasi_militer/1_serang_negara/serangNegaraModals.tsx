"use client";
import React, { useState } from "react";
import { COUNTRIES_DATA } from "@/app/page/map_system/map-data";
import HasilPertempuran from "./hasil_pertempuran";
import KonfirmasiPeluncuranSerangan from "./konfirmasi_peluncuran_serangan";
import KonfirmasiSerangModals from "@/app/page/navigasi_menu/2_navigasi_bawah/6_pertahanan/1_serang_negara/modals_menu/KonfirmasiSerangModals";

interface SerangNegaraModalProps {
	isOpen: boolean;
	countryName?: string | null;
	playerCountryDetail?: any;
	targetCountryDetail?: any;
	onClose: () => void;
	onConfirm: (actionType: 'aneksasi' | 'jarah' | 'mundur', targetCountry: string) => void;
}

export default function SerangNegaraModal({
	isOpen,
	countryName,
	playerCountryDetail,
	targetCountryDetail,
	onClose,
	onConfirm,
}: SerangNegaraModalProps) {
	const [isLaunchConfirmationOpen, setIsLaunchConfirmationOpen] = useState(false);
	const [battleOutcome, setBattleOutcome] = useState<{
		isVictory: boolean;
		playerScore: number;
		targetScore: number;
	} | null>(null);

	if (!isOpen || !countryName) return null;

	const targetData = COUNTRIES_DATA.find(
		(c) => c.country.toLowerCase().trim() === countryName.toLowerCase().trim()
	);

	const playerName = playerCountryDetail?.country || 'China';

	// Perhitungan kekuatan militer kasar
	const playerPersonnel = Number(playerCountryDetail?.personel_aktif || 1200000);
	const targetBudget = Number((targetData as any)?.anggaran || 15000);
	const targetPersonnel = Math.floor(targetBudget * 10);

	const playerPower = Math.floor(playerPersonnel / 1000);
	const targetPower = Math.floor(targetPersonnel / 1000);

	const handleLaunchAttack = () => {
		// Evaluasi Kemenangan / Kekalahan berdasarkan kekuatan
		const randomBonus = Math.floor(Math.random() * 200) - 100;
		const playerTotal = playerPower + randomBonus;
		const targetTotal = targetPower;

		const isVictory = playerTotal >= targetTotal * 0.4; // Pemain militer kuat biasanya menang

		setBattleOutcome({
			isVictory,
			playerScore: Math.max(10, playerTotal),
			targetScore: Math.max(10, targetTotal),
		});
	};

	const handleCloseReset = () => {
		setIsLaunchConfirmationOpen(false);
		setBattleOutcome(null);
		onClose();
	};

	const handleBackToConfirmation = () => {
		setIsLaunchConfirmationOpen(false);
	};

	const handleSelectAction = (action: 'aneksasi' | 'jarah' | 'mundur') => {
		setIsLaunchConfirmationOpen(false);
		setBattleOutcome(null);
		onConfirm(action, countryName);
	};

	if (battleOutcome) {
		return (
			<HasilPertempuran
				isVictory={battleOutcome.isVictory}
				playerName={playerName}
				countryName={countryName}
				onClose={handleCloseReset}
				onSelectAction={handleSelectAction}
			/>
		);
	}

	if (isLaunchConfirmationOpen) {
		return (
			<KonfirmasiPeluncuranSerangan
				playerName={playerName}
				playerIso={(playerCountryDetail?.iso || 'cn').toLowerCase()}
				playerPower={playerPower}
				targetName={countryName}
				targetIso={(targetData?.iso || 'un').toLowerCase()}
				targetPower={targetPower}
				onBack={handleBackToConfirmation}
				onConfirm={handleLaunchAttack}
			/>
		);
	}

	const targetForConfirmation = {
		countryName,
		payload: targetCountryDetail || targetData || { country: countryName },
	};

	return (
		<KonfirmasiSerangModals
			isOpen={isOpen}
			onClose={handleCloseReset}
			targetCountry={targetForConfirmation}
			countryDetail={playerCountryDetail}
			onConfirm={() => setIsLaunchConfirmationOpen(true)}
		/>
	);
}
