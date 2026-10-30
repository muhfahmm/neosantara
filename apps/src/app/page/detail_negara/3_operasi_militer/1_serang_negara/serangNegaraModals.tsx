"use client";
import React, { useState } from "react";
import { ShieldAlert, X } from "lucide-react";
import { COUNTRIES_DATA } from "@/app/page/map_system/map-data";
import KonfirmasiPeluncuranSerangan from "./konfirmasi_peluncuran_serangan";
import KonfirmasiSerangModals from "@/app/page/navigasi_menu/2_navigasi_bawah/6_pertahanan/1_serang_negara/modals_menu/KonfirmasiSerangModals";
import { areSameWarCountry, getWarCountryIdentity } from './warCountryIdentity';

import { getArmadaPowerSummary } from "@/app/page/navigasi_menu/2_navigasi_bawah/6_pertahanan/4_armada/logic/armadaLogic";

interface SerangNegaraModalProps {
	isOpen: boolean;
	countryName?: string | null;
	selectedCity?: string | null;
	selectedCityId?: string | null;
	playerCountryDetail?: any;
	targetCountryDetail?: any;
	onClose: () => void;
	onConfirm: (actionType: 'aneksasi' | 'jarah' | 'mundur', targetCountry: string) => void;
	onCloseDetailModal?: () => void;
	onAttackLaunched?: () => void;
}

export default function SerangNegaraModal({
	isOpen,
	countryName,
	selectedCity,
	selectedCityId,
	playerCountryDetail,
	targetCountryDetail,
	onClose,
	onConfirm,
	onCloseDetailModal,
	onAttackLaunched,
}: SerangNegaraModalProps) {
	const [isLaunchConfirmationOpen, setIsLaunchConfirmationOpen] = useState(false);
	const [blockedAttackReason, setBlockedAttackReason] = useState<'pact' | 'self' | null>(null);

	if (!isOpen || !countryName) return null;

	if (blockedAttackReason) {
		const isSelfAttack = blockedAttackReason === 'self';
		return (
			<div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md p-4" role="alertdialog" aria-modal="true" aria-labelledby="attack-block-title">
				<div className="w-full max-w-lg overflow-hidden rounded-2xl border-2 border-amber-400/50 bg-[#0d161a] text-white shadow-2xl">
					<div className="flex items-center justify-between border-b border-amber-400/20 bg-[#14232a] px-6 py-4">
						<div className="flex items-center gap-3">
							<ShieldAlert className="h-6 w-6 text-amber-400" />
							<h3 id="attack-block-title" className="text-base font-black uppercase tracking-wider text-amber-300">
								Serangan Tidak Dapat Dilakukan
							</h3>
						</div>
						<button type="button" onClick={() => setBlockedAttackReason(null)} className="rounded-lg p-2 text-[#8ab0b8] transition-colors hover:bg-white/5 hover:text-white" aria-label="Tutup">
							<X className="h-5 w-5" />
						</button>
					</div>
					<div className="space-y-5 p-6">
						<p className="text-sm leading-relaxed text-[#b8cbd0]">
							{isSelfAttack
								? <>Target <strong className="text-white">{countryName}</strong> adalah negara Anda sendiri. Negara tidak dapat melancarkan serangan terhadap dirinya sendiri.</>
								: <>Anda tidak dapat menyerang <strong className="text-white">{countryName}</strong> karena negara tersebut masih terikat <strong className="text-amber-300">Pakta Non-Agresi</strong> dengan negara Anda.</>}
						</p>
						{!isSelfAttack && <p className="text-xs leading-relaxed text-[#8ab0b8]">
							Putus pakta non-agresi terlebih dahulu melalui menu Detail Negara sebelum melancarkan serangan.
						</p>}
						<button type="button" onClick={() => setBlockedAttackReason(null)} className="w-full rounded-xl bg-amber-500 py-3 text-sm font-black uppercase tracking-wider text-[#0d161a] transition-colors hover:bg-amber-400">
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

	const playerName = playerCountryDetail?.country || 'Afganistan';
	const playerIso = playerCountryDetail?.iso || getWarCountryIdentity(playerName);
	const targetIso = targetData?.iso || getWarCountryIdentity(countryName);
	const isSelfTarget = areSameWarCountry(playerName, countryName, playerIso, targetIso);
	const normalizeCountryName = (name: unknown) => String(name || '')
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.trim();
	const hasActiveNonAggressionPact = Array.isArray(playerCountryDetail?.nonAggressionPacts) &&
		playerCountryDetail.nonAggressionPacts.some(
			(partner: unknown) => normalizeCountryName(partner) === normalizeCountryName(countryName)
		);

	// Hitung kekuatan militer riil berbasis Armada Power Summary
	const targetSource = targetCountryDetail || targetData || { country: countryName };
	const attackerSummary = getArmadaPowerSummary(playerCountryDetail);
	const targetSummary = getArmadaPowerSummary(targetSource);

	const playerPower = attackerSummary?.totals?.totalPower ?? 1000000;
	const targetPower = targetSummary?.totals?.totalPower ?? 1000000;

	const handleLaunchAttack = () => {
		if (isSelfTarget) {
			setIsLaunchConfirmationOpen(false);
			setBlockedAttackReason('self');
			return;
		}
		if (hasActiveNonAggressionPact) {
			setIsLaunchConfirmationOpen(false);
			setBlockedAttackReason('pact');
			return;
		}

		onAttackLaunched?.();
		setIsLaunchConfirmationOpen(false);
		onClose();
		if (onCloseDetailModal) {
			onCloseDetailModal();
		}

		// Trigger animasi perang top-level setelah modal tertutup sepenuhnya
		if (typeof window !== 'undefined') {
			window.dispatchEvent(
				new CustomEvent('start_war_animation', {
					detail: {
						attacker: playerName,
						target: countryName,
						targetCityId: selectedCityId || undefined,
						targetCityName: selectedCity || undefined,
						playerPower,
						targetPower,
						playerCountryDetail,
						targetCountryDetail: targetSource,
					},
				})
			);
		}
	};

	const handleCloseReset = () => {
		setIsLaunchConfirmationOpen(false);
		onClose();
	};

	const handleBackToConfirmation = () => {
		setIsLaunchConfirmationOpen(false);
	};

	if (isLaunchConfirmationOpen) {
		return (
			<KonfirmasiPeluncuranSerangan
				playerName={playerName}
				playerIso={String(playerIso).toLowerCase()}
				playerPower={playerPower}
				targetName={countryName}
				targetIso={String(targetIso).toLowerCase()}
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
				if (isSelfTarget) {
					setBlockedAttackReason('self');
					return;
				}
				if (hasActiveNonAggressionPact) {
					setBlockedAttackReason('pact');
					return;
				}
				handleLaunchAttack();
			}}
		/>
	);
}
