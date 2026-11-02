"use client";
import React, { useState } from "react";
import { ShieldAlert, X } from "lucide-react";
import { COUNTRIES_DATA } from "@/app/page/map_system/map-data";
import KonfirmasiPeluncuranSerangan from "./konfirmasi_peluncuran_serangan";
import KonfirmasiSerangModals from "@/app/page/navigasi_menu/2_navigasi_bawah/6_pertahanan/1_serang_negara/modals_menu/KonfirmasiSerangModals";
import { areSameWarCountry, getWarCountryIdentity } from './warCountryIdentity';

import { getArmadaPowerSummary } from "@/app/page/navigasi_menu/2_navigasi_bawah/6_pertahanan/4_armada/logic/armadaLogic";
import { applyWarLossesToUserArmada } from './war_algoritm/battleEngine';
import { getActivePlayerAttack, type PlayerAttackStatus } from '@/app/page/navigasi_menu/2_navigasi_bawah/6_pertahanan/1_serang_negara/modals_menu/playerAttackStatus';

interface SerangNegaraModalProps {
	isOpen: boolean;
	countryName?: string | null;
	selectedCity?: string | null;
	selectedCityId?: string | null;
	playerCountryDetail?: any;
	targetCountryDetail?: any;
	isAttackInProgress?: boolean;
	onClose: () => void;
	onConfirm: (actionType: 'aneksasi' | 'jarah' | 'mundur', targetCountry: string) => void;
	onCloseDetailModal?: () => void;
	onAttackLaunched?: () => void;
	onAttackBlocked?: () => void;
	onPlayerAttackBlocked?: (status: PlayerAttackStatus, requestedTarget: string) => void;
	updatePlayerCountryDetail?: (updater: (prev: any) => any) => void;
}

export default function SerangNegaraModal({
	isOpen,
	countryName,
	selectedCity,
	selectedCityId,
	playerCountryDetail,
	targetCountryDetail,
	isAttackInProgress = false,
	onClose,
	onConfirm,
	onCloseDetailModal,
	onAttackLaunched,
	onAttackBlocked,
	onPlayerAttackBlocked,
	updatePlayerCountryDetail,
}: SerangNegaraModalProps) {
	const [isLaunchConfirmationOpen, setIsLaunchConfirmationOpen] = useState(false);
	const [blockedAttackReason, setBlockedAttackReason] = useState<'pact' | 'self' | null>(null);

	if (!isOpen || !countryName) return null;

	if (blockedAttackReason) {
		const isSelfAttack = blockedAttackReason === 'self';
		return (
			<div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md p-4" role="alertdialog" aria-modal="true" aria-labelledby="attack-block-title">
				<div className="w-full max-w-lg max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-2xl border border-[#00FFAA]/30 bg-[#0F2424] text-white shadow-2xl">
					<div className="flex items-center justify-between border-b border-amber-400/20 bg-[#0A1A1A] px-5 sm:px-6 py-4">
						<div className="flex items-center gap-3">
							<ShieldAlert className="h-5 w-5 text-amber-400" />
							<h3 id="attack-block-title" className="text-base font-black uppercase tracking-wider text-amber-300">
								Serangan Tidak Dapat Dilakukan
							</h3>
						</div>
						<button type="button" onClick={() => setBlockedAttackReason(null)} className="rounded-lg p-1.5 text-[#6B8A8A] transition-colors hover:text-amber-400" aria-label="Tutup">
							<X className="h-4 w-4" />
						</button>
					</div>
					<div className="space-y-5 p-5 sm:p-6">
						<p className="text-sm leading-relaxed text-[#E0E0E0]">
							{isSelfAttack
								? <>Target <strong className="text-white">{countryName}</strong> adalah negara Anda sendiri. Negara tidak dapat melancarkan serangan terhadap dirinya sendiri.</>
								: <>Anda tidak dapat menyerang <strong className="text-white">{countryName}</strong> karena negara tersebut masih terikat <strong className="text-amber-300">Pakta Non-Agresi</strong> dengan negara Anda.</>}
						</p>
						{!isSelfAttack && <p className="text-xs leading-relaxed text-[#6B8A8A]">
							Putus pakta non-agresi terlebih dahulu melalui menu Detail Negara sebelum melancarkan serangan.
						</p>}
						<button type="button" onClick={() => setBlockedAttackReason(null)} className="w-full rounded-xl bg-amber-500 py-3 text-sm font-black uppercase tracking-wider text-[#0A1A1A] transition-colors hover:bg-amber-400">
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

	const handleLaunchAttack = (deploymentConfig?: Record<string, number>) => {
		const activeAttack = getActivePlayerAttack();
		if (activeAttack) {
			setIsLaunchConfirmationOpen(false);
			onPlayerAttackBlocked?.(activeAttack, countryName);
			onClose();
			return;
		}
		if (isAttackInProgress) {
			setIsLaunchConfirmationOpen(false);
			onClose();
			onAttackBlocked?.();
			return;
		}
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

		let committedDeploymentConfig = deploymentConfig;
		if (!committedDeploymentConfig && typeof window !== "undefined") {
			try {
				const saved = localStorage.getItem("deployed_units_config");
				if (saved) {
					committedDeploymentConfig = Object.fromEntries(
						Object.entries(JSON.parse(saved) as Record<string, unknown>).filter(
							(entry): entry is [string, number] => typeof entry[1] === "number",
						),
					);
				}
			} catch (error) {
				console.error("Gagal membaca konfigurasi pengerahan sebelum serangan.", error);
				return;
			}
		}
		if (!committedDeploymentConfig) {
			console.error("Serangan dibatalkan karena tidak ada pasukan yang dikerahkan.");
			return;
		}
		committedDeploymentConfig = Object.fromEntries(
			Object.entries(committedDeploymentConfig)
				.filter((entry): entry is [string, number] => Number.isFinite(entry[1]))
				.map(([key, percentage]) => [key, Math.min(100, Math.max(0, percentage))]),
		);
		if (Object.values(committedDeploymentConfig).every(value => value <= 0)) {
			console.error("Serangan dibatalkan karena tidak ada pasukan yang dikerahkan.");
			return;
		}

		const attackerDetailBeforeDeployment = playerCountryDetail;
		// Hold deployed units out of the available army until battle resolution.
		const { updatedDetail, losses } = applyWarLossesToUserArmada(
			attackerDetailBeforeDeployment,
			1,
			false,
			committedDeploymentConfig,
		);
		if (losses.length === 0) {
			console.error("Serangan dibatalkan karena stok pasukan yang dipilih sudah habis.");
			return;
		}
		if (updatePlayerCountryDetail) {
			updatePlayerCountryDetail(() => updatedDetail);
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
						playerCountryDetail: attackerDetailBeforeDeployment,
						targetCountryDetail: targetSource,
						attackerCountryDetail: attackerDetailBeforeDeployment,
						committedArmySnapshot: attackerDetailBeforeDeployment,
						committedArmyDetail: updatedDetail,
						troopsCommitted: true,
						deployedUnitsConfig: committedDeploymentConfig,
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
			onAttackBlocked={(status, requestedTarget) => onPlayerAttackBlocked?.(status, requestedTarget)}
			onConfirm={(deploymentConfig) => {
				if (isSelfTarget) {
					setBlockedAttackReason('self');
					return;
				}
				if (hasActiveNonAggressionPact) {
					setBlockedAttackReason('pact');
					return;
				}
				handleLaunchAttack(deploymentConfig);
			}}
		/>
	);
}
