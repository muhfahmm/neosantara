"use client";
import React, { useMemo } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, Percent } from "lucide-react";
import NotebookModalWrapper from "@/app/page/navigasi_menu/2_navigasi_bawah/NotebookModalWrapper";
import RootInfoModalHeader from "@/app/page/root_modals_design_menu/RootInfoModalHeader";
import { useLanguage } from "@/app/page/paused_menu/terjemahan_paused_menu/languageLogic";
import { calculateCoupSuccessChance } from "./logic/coupChanceCalculator";

interface KudetaModalProps {
	isOpen: boolean;
	countryName?: string | null;
	playerCountryDetail?: Record<string, unknown> | null;
	targetCountryDetail?: Record<string, unknown> | null;
	targetSatisfactionScore?: number;
	relationValue?: number;
	onClose: () => void;
	onConfirm: () => boolean | void;
}

export default function KudetaModal({
	isOpen,
	countryName,
	playerCountryDetail,
	targetCountryDetail,
	targetSatisfactionScore,
	relationValue,
	onClose,
	onConfirm,
}: KudetaModalProps) {
	const { t } = useLanguage();

	const chanceBreakdown = useMemo(() => {
		if (!isOpen) return null;
		return calculateCoupSuccessChance({
			playerCountryDetail,
			targetCountryDetail,
			targetSatisfactionScore,
			relationValue,
		});
	}, [isOpen, playerCountryDetail, targetCountryDetail, targetSatisfactionScore, relationValue]);

	if (!isOpen) return null;

	const modalContent = (
		<NotebookModalWrapper compact zIndexClass="z-[100000001]" frameClassName="root-confirm-modal-frame">
			<div
				className="w-full flex flex-col p-4 sm:p-5 font-sans text-white"
				role="dialog"
				aria-modal="true"
				aria-labelledby="coup-confirm-title"
			>
				<RootInfoModalHeader
					title={t("detail_negara_ai.military.coupTitle")}
					titleId="coup-confirm-title"
					onClose={onClose}
					icon={<AlertTriangle className="text-amber-400" />}
					size="compact"
				/>

				<div className="flex-1 space-y-4 my-2">
					<p className="text-sm sm:text-base text-root-text leading-relaxed">
						{t("detail_negara_ai.military.coupPromptPrefix")}{" "}
						<strong className="text-white">{countryName}</strong>?{" "}
						{t("detail_negara_ai.military.coupPromptSuffix")}
					</p>

					{/* Indikator Peluang Keberhasilan Kudeta */}
					{chanceBreakdown && (
						<div className="bg-black/35 border border-root-accent/20 rounded-xl p-3.5 sm:p-4 space-y-3">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<Percent className="w-4 h-4 text-emerald-400" />
									<span className="text-xs uppercase tracking-wider font-semibold text-gray-300">
										{t("detail_negara_ai.military.coupSuccessChance")}
									</span>
								</div>
								<span
									className={`text-lg font-black ${
										chanceBreakdown.totalChance >= 60
											? "text-emerald-400"
											: chanceBreakdown.totalChance >= 40
											? "text-amber-400"
											: "text-rose-400"
									}`}
								>
									{chanceBreakdown.totalChance}%
								</span>
							</div>

							{/* Progress Bar */}
							<div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
								<div
									className={`h-full transition-all duration-300 ${
										chanceBreakdown.totalChance >= 60
											? "bg-emerald-500"
											: chanceBreakdown.totalChance >= 40
											? "bg-amber-500"
											: "bg-rose-500"
									}`}
									style={{ width: `${chanceBreakdown.totalChance}%` }}
								/>
							</div>

							{/* 5 Faktor Rincian */}
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px] text-gray-300">
								<div className="flex items-center justify-between p-1.5 rounded bg-white/5">
									<span className="text-gray-400">
										{t("detail_negara_ai.military.coupFactorBase")}:
									</span>
									<span className="font-semibold text-white">+{chanceBreakdown.baseChance}%</span>
								</div>
								<div className="flex items-center justify-between p-1.5 rounded bg-white/5">
									<span className="text-gray-400">
										{t("detail_negara_ai.military.coupFactorStability")}:
									</span>
									<span
										className={`font-semibold ${
											chanceBreakdown.stabilityModifier >= 0
												? "text-emerald-400"
												: "text-rose-400"
										}`}
									>
										{chanceBreakdown.stabilityModifier >= 0 ? "+" : ""}
										{chanceBreakdown.stabilityModifier}%
									</span>
								</div>
								<div className="flex items-center justify-between p-1.5 rounded bg-white/5">
									<span className="text-gray-400">
										{t("detail_negara_ai.military.coupFactorIntel")}:
									</span>
									<span className="font-semibold text-emerald-400">
										+{chanceBreakdown.intelligenceBonus}%
									</span>
								</div>
								<div className="flex items-center justify-between p-1.5 rounded bg-white/5">
									<span className="text-gray-400">
										{t("detail_negara_ai.military.coupFactorMilitary")}:
									</span>
									<span
										className={`font-semibold ${
											chanceBreakdown.militaryDefensePenalty >= 0
												? "text-emerald-400"
												: "text-rose-400"
										}`}
									>
										{chanceBreakdown.militaryDefensePenalty >= 0 ? "+" : ""}
										{chanceBreakdown.militaryDefensePenalty}%
									</span>
								</div>
								<div className="sm:col-span-2 flex items-center justify-between p-1.5 rounded bg-white/5">
									<span className="text-gray-400">
										{t("detail_negara_ai.military.coupFactorIdeology")}:
									</span>
									<span
										className={`font-semibold ${
											chanceBreakdown.ideologyDiplomacyModifier >= 0
												? "text-emerald-400"
												: "text-rose-400"
										}`}
									>
										{chanceBreakdown.ideologyDiplomacyModifier >= 0 ? "+" : ""}
										{chanceBreakdown.ideologyDiplomacyModifier}%
									</span>
								</div>
							</div>

							<p className="text-[10px] text-amber-300/80 italic mt-1 leading-normal">
								{t("detail_negara_ai.military.coupRiskWarning")}
							</p>
						</div>
					)}
				</div>

				{/* Footer Tombol Aksi */}
				<div className="flex flex-col sm:flex-row gap-3 justify-end mt-4 pt-4 border-t border-rose-500/20">
					<button
						type="button"
						onClick={onClose}
						className="w-full sm:w-auto px-6 bg-root-canvas hover:bg-[#142A2A] border border-root-accent/30 rounded-xl py-2 text-center text-root-text font-black text-[11px] sm:text-xs tracking-widest uppercase transition-all duration-150 cursor-pointer shadow hover:shadow-md"
					>
						{t("detail_negara_ai.common.cancel")}
					</button>

					<button
						type="button"
						onClick={() => {
							if (onConfirm() !== false) onClose();
						}}
						className="w-full sm:w-auto px-6 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 border border-rose-500 rounded-xl py-2 text-center text-white font-black text-[11px] sm:text-xs tracking-widest uppercase transition-all duration-150 cursor-pointer shadow hover:shadow-md active:scale-[0.98]"
					>
						{t("detail_negara_ai.military.coupConfirm")}
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
