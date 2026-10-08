"use client";
import React, { useState } from "react";
import { ShieldAlert, X } from "lucide-react";
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
	const [isPactBlocked, setIsPactBlocked] = useState(false);
	const [battleOutcome, setBattleOutcome] = useState<{
		isVictory: boolean;
		playerScore: number;
		targetScore: number;
	} | null>(null);

	if (!isOpen || !countryName) return null;

	if (isPactBlocked) {
		return (
			<div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md p-4" role="alertdialog" aria-modal="true" aria-labelledby="non-aggression-block-title">
				<div className="w-full max-w-lg overflow-hidden rounded-2xl border-2 border-amber-400/50 bg-[#0d161a] text-white shadow-2xl">
					<div className="flex items-center justify-between border-b border-amber-400/20 bg-[#14232a] px-6 py-4">
						<div className="flex items-center gap-3">
							<ShieldAlert className="h-6 w-6 text-amber-400" />
							<h3 id="non-aggression-block-title" className="text-base font-black uppercase tracking-wider text-amber-300">
								Serangan Tidak Dapat Dilakukan
							</h3>
						</div>
						<button type="button" onClick={() => setIsPactBlocked(false)} className="rounded-lg p-2 text-[#8ab0b8] transition-colors hover:bg-white/5 hover:text-white" aria-label="Tutup">
							<X className="h-5 w-5" />
						</button>
					</div>
					<div className="space-y-5 p-6">
						<p className="text-sm leading-relaxed text-[#b8cbd0]">
							Anda tidak dapat menyerang <strong className="text-white">{countryName}</strong> karena negara tersebut masih terikat <strong className="text-amber-300">Pakta Non-Agresi</strong> dengan negara Anda.
						</p>
						<p className="text-xs leading-relaxed text-[#8ab0b8]">
							Putus pakta non-agresi terlebih dahulu melalui menu Detail Negara sebelum melancarkan serangan.
						</p>
						<button type="button" onClick={() => setIsPactBlocked(false)} className="w-full rounded-xl bg-amber-500 py-3 text-sm font-black uppercase tracking-wider text-[#0d161a] transition-colors hover:bg-amber-400">
							Mengerti
						</button>
					</div>
				</div>
			</div>
		);
	}

	const targetData = COUNTRIES_DATA.find(
		(c) => c.country.toLowerCase().trim() === countryName.toLowerCase().trim()
	);

	const playerName = playerCountryDetail?.country || 'China';
	const normalizeCountryName = (name: unknown) => String(name || '')
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.trim();
	const hasActiveNonAggressionPact = Array.isArray(playerCountryDetail?.nonAggressionPacts) &&
		playerCountryDetail.nonAggressionPacts.some(
			(partner: unknown) => normalizeCountryName(partner) === normalizeCountryName(countryName)
		);

	// Perhitungan kekuatan militer kasar
	const playerPersonnel = Number(playerCountryDetail?.personel_aktif || 1200000);
	const targetBudget = Number((targetData as any)?.anggaran || 15000);
	const targetPersonnel = Math.floor(targetBudget * 10);

	const playerPower = Math.floor(playerPersonnel / 1000);
	const targetPower = Math.floor(targetPersonnel / 1000);

	const handleLaunchAttack = () => {
		if (hasActiveNonAggressionPact) {
			setIsLaunchConfirmationOpen(false);
			setIsPactBlocked(true);
			return;
		}

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
		if (hasActiveNonAggressionPact) {
			setBattleOutcome(null);
			setIsPactBlocked(true);
			return;
		}
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
			onConfirm={() => {
				if (hasActiveNonAggressionPact) {
					setIsPactBlocked(true);
					return;
				}
				setIsLaunchConfirmationOpen(true);
			}}
		/>
	);
}
