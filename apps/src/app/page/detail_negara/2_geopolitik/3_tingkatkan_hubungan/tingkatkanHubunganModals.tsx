"use client";

import RootInfoModalHeader from '@/app/page/root_modals_design_menu/RootInfoModalHeader';
import { getRelationBadge } from '@/app/logic/relationTiers';
import React, { useState, useEffect } from "react";
import { Heart, Coins, TrendingUp, AlertCircle, Sparkles, Plus, RotateCcw, ArrowRight, CheckCircle2 } from "lucide-react";
import { getRelationValue, setRelationModifier } from "../../../../../../../json/4_database_hubungan_antar_negara/relationsRegistry";
import { COUNTRIES_DATA } from "@/app/page/map_system/map-data";
import NotebookModalWrapper from "@/app/page/navigasi_menu/2_navigasi_bawah/NotebookModalWrapper";
import { useLanguage } from "@/app/page/paused_menu/terjemahan_paused_menu/languageLogic";

interface TingkatkanHubunganModalProps {
	isOpen: boolean;
	countryName?: string | null;
	playerCountryDetail?: any;
	setPlayerCountryDetail?: (detail: any | ((prev: any) => any)) => void;
	onClose: () => void;
	onConfirm?: (amount: number, gainedLevels: number) => void;
}

export default function TingkatkanHubunganModal({
	isOpen,
	countryName,
	playerCountryDetail,
	setPlayerCountryDetail,
	onClose,
	onConfirm
}: TingkatkanHubunganModalProps) {
	const { t } = useLanguage();
	const [inputAmount, setInputAmount] = useState<number>(10000);
	const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

	useEffect(() => {
		if (isOpen) {
			setInputAmount(10000);
			setFeedbackMsg(null);
		}
	}, [isOpen]);

	if (!isOpen) return null;

	const targetCountryName = countryName || "Negara Target";
	const isAllCountries = targetCountryName === "Semua Negara";
	const playerCountryName = playerCountryDetail?.country || playerCountryDetail?.nama || playerCountryDetail?.country_name || "Indonesia";
	const playerBudget = Number(playerCountryDetail?.anggaran || 0);

	const currentRelation = getRelationValue(playerCountryName, targetCountryName);

	const gainedLevels = Math.floor(inputAmount / 10000);
	const maxPossibleIncrease = Math.max(0, 100 - currentRelation);
	const actualGained = isAllCountries ? gainedLevels : Math.min(gainedLevels, maxPossibleIncrease);
	const newRelation = Math.min(100, currentRelation + gainedLevels);

	const isInsufficientBudget = inputAmount > playerBudget;
	const isLessThanMin = inputAmount < 10000;
	const isMaxRelation = !isAllCountries && currentRelation >= 100;
	const isValid = inputAmount >= 10000 && !isInsufficientBudget && gainedLevels > 0 && !isMaxRelation;

	const handleAddAmount = (addValue: number) => {
		setInputAmount((prev) => Math.max(0, prev + addValue));
	};

	const handleSetMax = () => {
		const maxAffordable = Math.floor(playerBudget / 10000) * 10000;
		setInputAmount(Math.max(10000, maxAffordable));
	};

	const handleConfirm = () => {
		if (!isValid) return;

		if (targetCountryName === "Semua Negara") {
			const allOtherCountries = (COUNTRIES_DATA || [])
				.map((c) => c.country)
				.filter((name): name is string => Boolean(name && name.toLowerCase().trim() !== playerCountryName.toLowerCase().trim()));
			allOtherCountries.forEach((cName) => {
				setRelationModifier(playerCountryName, cName, actualGained);
			});
		} else {
			setRelationModifier(playerCountryName, targetCountryName, actualGained);
		}

		if (setPlayerCountryDetail) {
			setPlayerCountryDetail((prev: any) => {
				if (!prev) return prev;
				const currentAnggaran = Number(prev.anggaran || 0);
				return {
					...prev,
					anggaran: Math.max(0, currentAnggaran - inputAmount),
				};
			});
		}

		if (typeof window !== "undefined") {
			window.dispatchEvent(new Event("country_relations_updated"));
		}

		if (onConfirm) {
			onConfirm(inputAmount, actualGained);
		}

		onClose();
	};

	const formatNEO = (num: number) => {
		return num.toLocaleString("id-ID", { maximumFractionDigits: 2 });
	};

	const currentBadge = getRelationBadge(currentRelation);
	const newBadge = getRelationBadge(newRelation);

	return (
		<NotebookModalWrapper onClose={onClose}>
			<div className="flex h-full min-h-0 flex-col overflow-hidden bg-root-surface font-sans shadow-2xl">

				<RootInfoModalHeader
					title={t("detail_negara_ai.geopolitics.improveRelationTitle")}
					onClose={onClose}
					icon={<Heart />}
					size="standard"
					centerContent={
						<p className="text-[10px] sm:text-xs text-root-subtle font-semibold">
							{t("detail_negara_ai.geopolitics.targetCountry")}: <span className="text-root-text font-bold">{targetCountryName}</span>
						</p>
					}
				/>

				{/* BODY — Flex column, isi compact agar tidak perlu scroll */}
				<div className="flex-1 min-h-0 bg-root-surface relative z-10 p-4 sm:p-6 flex flex-col gap-3 sm:gap-4">

					{/* Notice + Budget Info — Grid 2 kolom */}
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 shrink-0">
						{/* Notice */}
						<div className="p-3 rounded-xl bg-root-canvas border border-root-accent/20 flex items-start gap-2.5">
							<Sparkles className="h-4 w-4 text-root-accent shrink-0 mt-0.5" />
							<p className="text-[11px] sm:text-xs text-root-text leading-relaxed">
								{t("detail_negara_ai.geopolitics.giveAidPrefix")} <strong className="text-root-accent">NEO</strong> {t("detail_negara_ai.geopolitics.to")} <strong className="text-white">{targetCountryName}</strong>. {t("detail_negara_ai.geopolitics.every10kNeo")} <strong className="text-root-accent">10.000 NEO</strong> = <strong className="text-root-accent">+1 {t("detail_negara_ai.geopolitics.level")}</strong> {t("detail_negara_ai.geopolitics.relationLower")}.
							</p>
						</div>

						{/* Budget Info */}
						<div className="flex items-center justify-between bg-root-canvas p-3 rounded-xl border border-root-accent/20">
							<span className="text-[11px] sm:text-xs text-root-subtle font-semibold flex items-center gap-2">
								<Coins className="h-4 w-4 text-root-accent" />
								{t("detail_negara_ai.geopolitics.yourNeoBudget")}:
							</span>
							<span className="font-black text-root-accent text-sm">
								{formatNEO(playerBudget)} NEO
							</span>
						</div>
					</div>

					{/* Input Nominal NEO */}
					<div className="shrink-0">
						<label className="block text-[10px] sm:text-xs font-black text-root-accent uppercase tracking-wider mb-2">
							{t("detail_negara_ai.geopolitics.inputAidNominal")}
						</label>
						<div className="relative">
							<input
								type="number"
								min={10000}
								step={10000}
								value={inputAmount || ""}
								onChange={(e) => setInputAmount(Math.max(0, parseInt(e.target.value) || 0))}
								placeholder={t("detail_negara_ai.geopolitics.inputAidPlaceholder")}
								className="w-full bg-root-canvas border-2 border-root-accent/40 focus:border-root-accent rounded-xl py-2.5 px-4 text-base font-black text-root-accent outline-none transition placeholder-root-subtle/60"
							/>
							<span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-root-accent/60">
								NEO
							</span>
						</div>

						{/* Quick Preset Buttons */}
						<div className="grid grid-cols-4 gap-2 mt-2">
							<button
								type="button"
								onClick={() => handleAddAmount(10000)}
								className="py-1.5 px-2 bg-root-canvas hover:bg-root-accent/10 border border-root-accent/30 rounded-lg text-[11px] font-bold text-root-accent transition-all cursor-pointer flex items-center justify-center gap-1"
							>
								<Plus className="h-3 w-3" /> 10rb
							</button>
							<button
								type="button"
								onClick={() => handleAddAmount(50000)}
								className="py-1.5 px-2 bg-root-canvas hover:bg-root-accent/10 border border-root-accent/30 rounded-lg text-[11px] font-bold text-root-accent transition-all cursor-pointer flex items-center justify-center gap-1"
							>
								<Plus className="h-3 w-3" /> 50rb
							</button>
							<button
								type="button"
								onClick={() => handleAddAmount(100000)}
								className="py-1.5 px-2 bg-root-canvas hover:bg-root-accent/10 border border-root-accent/30 rounded-lg text-[11px] font-bold text-root-accent transition-all cursor-pointer flex items-center justify-center gap-1"
							>
								<Plus className="h-3 w-3" /> 100rb
							</button>
							<button
								type="button"
								onClick={handleSetMax}
								className="py-1.5 px-2 bg-root-accent/20 hover:bg-root-accent/30 border border-root-accent/50 rounded-lg text-[11px] font-black text-root-accent transition-all cursor-pointer"
							>
								{t("detail_negara_ai.geopolitics.max")}
							</button>
						</div>
					</div>

					{/* Impact Preview Card — Hanya ditampilkan jika untuk 1 negara spesifik */}
					{!isAllCountries ? (
						<div className="bg-root-canvas p-3 sm:p-4 rounded-xl border border-root-accent/30 shrink-0">
							<div className="text-[10px] sm:text-xs font-black text-root-subtle uppercase tracking-wider flex items-center justify-between mb-3">
								<span>{t("detail_negara_ai.geopolitics.relationCalcTitle")}</span>
								<TrendingUp className="h-4 w-4 text-root-accent" />
							</div>

							<div className="flex items-center justify-between gap-3 bg-root-surface p-3 rounded-lg border border-root-accent/20">
								{/* Current Level */}
								<div className="text-center flex-1">
									<span className="block text-[9px] sm:text-[10px] font-bold text-root-subtle uppercase">{t("detail_negara_ai.geopolitics.current")}</span>
									<span className="text-lg sm:text-xl font-black text-root-text">{currentRelation}</span>
									<div className="mt-1">
										<span className={`inline-block px-3 py-0.5 rounded-md border font-black text-xs shadow-sm ${currentBadge.className}`}>
											{currentBadge.alias}
										</span>
									</div>
								</div>

								{/* Arrow & Delta */}
								<div className="flex flex-col items-center justify-center px-2">
									<span className="text-[11px] font-black text-root-accent bg-root-accent/10 px-2 py-0.5 rounded border border-root-accent/30 mb-1 whitespace-nowrap">
										+{actualGained} {t("detail_negara_ai.geopolitics.level")}
									</span>
									<ArrowRight className="h-4 w-4 text-root-accent" />
								</div>

								{/* New Level */}
								<div className="text-center flex-1">
									<span className="block text-[9px] sm:text-[10px] font-bold text-root-subtle uppercase">{t("detail_negara_ai.geopolitics.afterGiving")}</span>
									<span className="text-lg sm:text-xl font-black text-root-accent">{newRelation}</span>
									<div className="mt-1">
										<span className={`inline-block px-3 py-0.5 rounded-md border font-black text-xs shadow-sm ${newBadge.className}`}>
											{newBadge.alias}
										</span>
									</div>
								</div>
							</div>

							{/* Remainder info */}
							{inputAmount > 0 && inputAmount % 10000 !== 0 && (
								<p className="text-[10px] sm:text-[11px] text-amber-300 flex items-center gap-1.5 mt-2.5">
									<AlertCircle className="h-3.5 w-3.5 shrink-0" />
									<span>
										Nominal {formatNEO(inputAmount)} NEO memberi <strong className="text-white">+{gainedLevels} tingkat</strong> (sisa {formatNEO(inputAmount % 10000)} NEO tidak dihitung).
									</span>
								</p>
							)}
						</div>
					) : (
						/* Info ringkasan global saat target adalah Semua Negara */
						<div className="bg-root-canvas p-3 sm:p-4 rounded-xl border border-root-accent/30 shrink-0 flex items-center justify-between">
							<div className="flex items-center gap-2.5">
								<Sparkles className="h-4 w-4 text-root-accent shrink-0" />
								<span className="text-xs text-root-text font-semibold">
									Efek Global ke Seluruh Negara:
								</span>
							</div>
							<span className="text-sm font-black text-root-accent bg-root-accent/10 px-3 py-1 rounded-lg border border-root-accent/30">
								+{actualGained} Tingkat untuk Setiap Negara
							</span>
						</div>
					)}

					{/* Warning / Error Messages */}
					{isInsufficientBudget && (
						<div className="p-2.5 sm:p-3 bg-root-modal-negative-bg border border-root-modal-negative/40 rounded-xl text-root-modal-negative text-[11px] sm:text-xs flex items-center gap-2 shrink-0">
							<AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
							<span>{t("detail_negara_ai.geopolitics.insufficientNeoBudget")} ({t("detail_negara_ai.geopolitics.available")}: {formatNEO(playerBudget)} NEO).</span>
						</div>
					)}

					{isLessThanMin && (
						<div className="p-2.5 sm:p-3 bg-root-modal-warning-bg border border-root-modal-warning/40 rounded-xl text-root-modal-warning text-[11px] sm:text-xs flex items-center gap-2 shrink-0">
							<AlertCircle className="h-4 w-4 shrink-0 text-amber-400" />
							<span>{t("detail_negara_ai.geopolitics.minAidWarning")}</span>
						</div>
					)}

					{isMaxRelation && (
						<div className="p-2.5 sm:p-3 bg-root-modal-positive-bg border border-root-modal-positive-border rounded-xl text-root-modal-positive text-[11px] sm:text-xs flex items-center gap-2 shrink-0">
							<CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
							<span>{t("detail_negara_ai.geopolitics.maxRelationReached")}</span>
						</div>
					)}

					{/* Spacer untuk mendorong footer ke bawah */}
					<div className="flex-1" />
				</div>

				{/* FOOTER — Selalu di bawah */}
				<div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-root-accent/20 bg-root-canvas shrink-0 rounded-b-2xl">
					<div className="flex gap-3">
						<button
							type="button"
							onClick={onClose}
							className="flex-1 bg-root-surface hover:bg-root-accent/10 border border-root-accent/30 hover:border-root-accent rounded-xl py-2.5 sm:py-3 text-center text-root-text font-extrabold text-xs tracking-wider uppercase transition-all cursor-pointer"
						>
							{t("detail_negara_ai.common.cancel")}
						</button>
						<button
							type="button"
							disabled={!isValid}
							onClick={handleConfirm}
							className={`flex-1 rounded-xl py-2.5 sm:py-3 text-center font-black text-xs tracking-wider uppercase transition-all shadow-lg flex items-center justify-center gap-2 ${isValid
									? "bg-root-accent hover:bg-root-accent/85 text-root-accent-ink border border-root-accent cursor-pointer"
									: "bg-root-modal-neutral-bg text-root-muted border border-root-accent/20 cursor-not-allowed opacity-60"
								}`}
						>
							<Heart className="h-4 w-4" />
							{t("detail_negara_ai.geopolitics.improve")} (+{actualGained})
						</button>
					</div>
				</div>
			</div>
		</NotebookModalWrapper>
	);
}