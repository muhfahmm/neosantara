"use client";
import React, { useState, useEffect } from "react";
import { Heart, Coins, TrendingUp, AlertCircle, Sparkles, X, Plus, RotateCcw, ArrowRight, CheckCircle2 } from "lucide-react";
import { getRelationValue, setRelationModifier } from "@/../../json/database_hubungan_antar_negara/relationsRegistry";

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
	const [inputAmount, setInputAmount] = useState<number>(10000);
	const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

	// Reset state when modal opens
	useEffect(() => {
		if (isOpen) {
			setInputAmount(10000);
			setFeedbackMsg(null);
		}
	}, [isOpen]);

	if (!isOpen) return null;

	const targetCountryName = countryName || "Negara Target";
	const playerCountryName = playerCountryDetail?.country || playerCountryDetail?.nama || playerCountryDetail?.country_name || "Indonesia";
	const playerBudget = Number(playerCountryDetail?.anggaran || 0);

	// Get current relation
	const currentRelation = getRelationValue(playerCountryName, targetCountryName);

	// Calculate points: 10,000 NEO = 1 point increase
	const gainedLevels = Math.floor(inputAmount / 10000);
	const maxPossibleIncrease = Math.max(0, 100 - currentRelation);
	const actualGained = Math.min(gainedLevels, maxPossibleIncrease);
	const newRelation = Math.min(100, currentRelation + gainedLevels);

	const isInsufficientBudget = inputAmount > playerBudget;
	const isLessThanMin = inputAmount < 10000;
	const isMaxRelation = currentRelation >= 100;
	const isValid = inputAmount >= 10000 && !isInsufficientBudget && gainedLevels > 0;

	const handleAddAmount = (addValue: number) => {
		setInputAmount((prev) => Math.max(0, prev + addValue));
	};

	const handleSetMax = () => {
		// Set maximum affordable multiple of 10,000
		const maxAffordable = Math.floor(playerBudget / 10000) * 10000;
		setInputAmount(Math.max(10000, maxAffordable));
	};

	const handleConfirm = () => {
		if (!isValid) return;

		// 1. Update global relations modifier registry
		setRelationModifier(playerCountryName, targetCountryName, actualGained);

		// 2. Deduct budget from player state
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

		// 3. Trigger global custom event so DetailNegara & TingkatHubungan modals update instantly
		if (typeof window !== "undefined") {
			window.dispatchEvent(new Event("country_relations_updated"));
		}

		if (onConfirm) {
			onConfirm(inputAmount, actualGained);
		}

		onClose();
	};

	const formatNEO = (num: number) => {
		return num.toLocaleString("id-ID");
	};

	// Determine relation status badge text & color
	const getRelationStatusBadge = (val: number) => {
		if (val >= 80) return { label: "Sangat Mesra", color: "text-emerald-400 bg-emerald-950/60 border-emerald-500/30" };
		if (val >= 60) return { label: "Bersahabat", color: "text-[#00FFAA] bg-[#00FFAA]/10 border-[#00FFAA]/30" };
		if (val >= 40) return { label: "Netral", color: "text-amber-300 bg-amber-950/60 border-amber-500/30" };
		if (val >= 20) return { label: "Dingin", color: "text-orange-400 bg-orange-950/60 border-orange-500/30" };
		return { label: "Musuh", color: "text-rose-400 bg-rose-950/60 border-rose-500/30" };
	};

	const currentBadge = getRelationStatusBadge(currentRelation);
	const newBadge = getRelationStatusBadge(newRelation);

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
			<div className="w-full max-w-lg bg-[#0A1A1A] border-2 border-[#00FFAA]/40 rounded-2xl p-6 shadow-2xl relative text-white overflow-hidden">
				
				{/* Background Glow */}
				<div className="absolute -top-24 -right-24 w-48 h-48 bg-[#00FFAA]/10 rounded-full blur-3xl pointer-events-none" />
				<div className="absolute -bottom-24 -left-24 w-48 h-48 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

				{/* Header */}
				<div className="flex items-center justify-between border-b border-[#00FFAA]/20 pb-4 mb-5">
					<div className="flex items-center gap-3">
						<div className="p-2.5 bg-[#00FFAA]/10 rounded-xl border border-[#00FFAA]/30 text-[#00FFAA]">
							<Heart className="h-6 w-6 text-[#00FFAA]" />
						</div>
						<div>
							<h3 className="text-lg font-extrabold text-[#00FFAA] tracking-tight uppercase">
								Tingkatkan Hubungan Diplomatik
							</h3>
							<p className="text-xs text-[#00FFAA]/70 font-medium">
								Negara Target: <span className="text-white font-bold">{targetCountryName}</span>
							</p>
						</div>
					</div>
					<button
						onClick={onClose}
						className="p-1.5 rounded-lg border border-[#00FFAA]/20 text-[#00FFAA]/60 hover:text-[#00FFAA] hover:bg-[#00FFAA]/10 transition cursor-pointer"
					>
						<X className="h-5 w-5" />
					</button>
				</div>

				{/* Body Content */}
				<div className="space-y-5">
					{/* Explanation Notice */}
					<div className="p-3.5 rounded-xl bg-[#0F2424] border border-[#00FFAA]/20 flex items-start gap-3">
						<Sparkles className="h-5 w-5 text-[#00FFAA] shrink-0 mt-0.5" />
						<div className="text-xs text-gray-300 leading-relaxed">
							Berikan bantuan finansial berupa uang <strong className="text-[#00FFAA]">NEO</strong> kepada{" "}
							<strong className="text-white">{targetCountryName}</strong>. Setiap{" "}
							<strong className="text-[#00FFAA]">10.000 NEO</strong> yang Anda berikan akan menaikkan{" "}
							<strong className="text-[#00FFAA]">1 Tingkat Hubungan</strong>.
						</div>
					</div>

					{/* Player Anggaran Info */}
					<div className="flex items-center justify-between bg-[#0F2424]/80 p-3 rounded-xl border border-[#00FFAA]/20 text-xs">
						<span className="text-gray-400 font-semibold flex items-center gap-2">
							<Coins className="h-4 w-4 text-[#00FFAA]" />
							Anggaran NEO Anda:
						</span>
						<span className="font-extrabold text-[#00FFAA] text-sm">
							{formatNEO(playerBudget)} NEO
						</span>
					</div>

					{/* Input Nominal NEO */}
					<div>
						<label className="block text-xs font-bold text-[#00FFAA] uppercase tracking-wider mb-2">
							Input Nominal Bantuan (NEO)
						</label>
						<div className="relative">
							<input
								type="number"
								min={10000}
								step={10000}
								value={inputAmount || ""}
								onChange={(e) => setInputAmount(Math.max(0, parseInt(e.target.value) || 0))}
								placeholder="Masukkan nominal NEO (Kelipatan 10.000)"
								className="w-full bg-[#051010] border-2 border-[#00FFAA]/40 focus:border-[#00FFAA] rounded-xl py-3 px-4 text-lg font-black text-[#00FFAA] outline-none transition placeholder-gray-600"
							/>
							<span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-[#00FFAA]/60">
								NEO
							</span>
						</div>

						{/* Quick Preset Buttons */}
						<div className="grid grid-cols-4 gap-2 mt-2">
							<button
								type="button"
								onClick={() => handleAddAmount(10000)}
								className="py-1.5 px-2 bg-[#0F2424] hover:bg-[#00FFAA]/10 border border-[#00FFAA]/30 rounded-lg text-[11px] font-bold text-[#00FFAA] transition flex items-center justify-center gap-1"
							>
								<Plus className="h-3 w-3" /> 10rb
							</button>
							<button
								type="button"
								onClick={() => handleAddAmount(50000)}
								className="py-1.5 px-2 bg-[#0F2424] hover:bg-[#00FFAA]/10 border border-[#00FFAA]/30 rounded-lg text-[11px] font-bold text-[#00FFAA] transition flex items-center justify-center gap-1"
							>
								<Plus className="h-3 w-3" /> 50rb
							</button>
							<button
								type="button"
								onClick={() => handleAddAmount(100000)}
								className="py-1.5 px-2 bg-[#0F2424] hover:bg-[#00FFAA]/10 border border-[#00FFAA]/30 rounded-lg text-[11px] font-bold text-[#00FFAA] transition flex items-center justify-center gap-1"
							>
								<Plus className="h-3 w-3" /> 100rb
							</button>
							<button
								type="button"
								onClick={handleSetMax}
								className="py-1.5 px-2 bg-[#00FFAA]/20 hover:bg-[#00FFAA]/30 border border-[#00FFAA]/50 rounded-lg text-[11px] font-black text-[#00FFAA] transition"
							>
								Maksimal
							</button>
						</div>
					</div>

					{/* Relationship Impact Preview Card */}
					<div className="bg-[#051010] p-4 rounded-xl border border-[#00FFAA]/30 space-y-3">
						<div className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center justify-between">
							<span>Kalkulasi Peningkatan Hubungan</span>
							<TrendingUp className="h-4 w-4 text-[#00FFAA]" />
						</div>

						<div className="flex items-center justify-between gap-3 bg-[#0F2424] p-3 rounded-lg border border-[#00FFAA]/20">
							{/* Current Level */}
							<div className="text-center flex-1">
								<span className="block text-[10px] font-bold text-gray-400 uppercase">Saat Ini</span>
								<span className="text-lg font-black text-white">{currentRelation}</span>
								<div className="mt-1">
									<span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${currentBadge.color}`}>
										{currentBadge.label}
									</span>
								</div>
							</div>

							{/* Arrow & Delta */}
							<div className="flex flex-col items-center justify-center px-2">
								<span className="text-xs font-black text-[#00FFAA] bg-[#00FFAA]/10 px-2 py-0.5 rounded border border-[#00FFAA]/30 mb-1">
									+{actualGained} Tingkat
								</span>
								<ArrowRight className="h-4 w-4 text-[#00FFAA]" />
							</div>

							{/* New Level */}
							<div className="text-center flex-1">
								<span className="block text-[10px] font-bold text-gray-400 uppercase">Setelah Pemberian</span>
								<span className="text-lg font-black text-[#00FFAA]">{newRelation}</span>
								<div className="mt-1">
									<span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${newBadge.color}`}>
										{newBadge.label}
									</span>
								</div>
							</div>
						</div>

						{/* Remainder info if input is not exact multiple of 10,000 */}
						{inputAmount > 0 && inputAmount % 10000 !== 0 && (
							<p className="text-[11px] text-amber-300 flex items-center gap-1.5">
								<AlertCircle className="h-3.5 w-3.5 shrink-0" />
								<span>
									Nominal {formatNEO(inputAmount)} NEO memberikan <strong className="text-white">+{gainedLevels} tingkat</strong> (sisa {formatNEO(inputAmount % 10000)} NEO tidak dihitung).
								</span>
							</p>
						)}
					</div>

					{/* Warning / Error Messages */}
					{isInsufficientBudget && (
						<div className="p-3 bg-rose-950/60 border border-rose-500/40 rounded-xl text-rose-300 text-xs flex items-center gap-2">
							<AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
							<span>Anggaran NEO Anda tidak mencukupi (Tersedia: {formatNEO(playerBudget)} NEO).</span>
						</div>
					)}

					{isLessThanMin && (
						<div className="p-3 bg-amber-950/60 border border-amber-500/40 rounded-xl text-amber-300 text-xs flex items-center gap-2">
							<AlertCircle className="h-4 w-4 shrink-0 text-amber-400" />
							<span>Minimal pemberian bantuan adalah 10.000 NEO untuk 1 tingkat hubungan.</span>
						</div>
					)}

					{isMaxRelation && (
						<div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
							<CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
							<span>Tingkat hubungan dengan negara ini sudah mencapai nilai maksimum (100).</span>
						</div>
					)}
				</div>

				{/* Footer Buttons */}
				<div className="flex gap-3 justify-end mt-6 pt-4 border-t border-[#00FFAA]/20">
					<button
						type="button"
						onClick={onClose}
						className="flex-1 bg-[#0F2424] hover:bg-[#163535] border border-[#00FFAA]/30 rounded-xl py-3 text-center text-gray-300 font-extrabold text-xs tracking-wider uppercase transition cursor-pointer"
					>
						Batal
					</button>
					<button
						type="button"
						disabled={!isValid}
						onClick={handleConfirm}
						className={`flex-1 rounded-xl py-3 text-center text-black font-black text-xs tracking-wider uppercase transition shadow-lg flex items-center justify-center gap-2 ${
							isValid
								? "bg-[#00FFAA] hover:bg-[#00e699] border border-[#00FFAA] cursor-pointer"
								: "bg-gray-700 text-gray-400 border border-gray-600 cursor-not-allowed opacity-50"
						}`}
					>
						<Heart className="h-4 w-4 fill-black" />
						Tingkatkan (+{actualGained})
					</button>
				</div>
			</div>
		</div>
	);
}
