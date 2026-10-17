"use client";
import React, { useState, useEffect } from "react";
import { Heart, Coins, TrendingUp, AlertCircle, Sparkles, X, Plus, RotateCcw, ArrowRight, CheckCircle2 } from "lucide-react";
import { getRelationValue, setRelationModifier } from "../../../../../../../json/4_database_hubungan_antar_negara/relationsRegistry";
import { COUNTRIES_DATA } from "@/app/page/map_system/map-data";

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
		<div className="fixed inset-0 z-50 flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none">

			{/* Modal Container — Sama ukuran dengan modal lainnya */}
			<div className="bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans pointer-events-auto shadow-2xl">

				{/* HEADER */}
				<div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-[#00FFAA]/20 flex items-center justify-between bg-[#0A1A1A] relative z-10 gap-2 shrink-0 rounded-t-2xl">
					<div className="flex items-center gap-2 sm:gap-3">
						<div className="p-1 sm:p-1.5 bg-[#0F2424] rounded-lg border border-[#00FFAA]/30 shrink-0">
							<Heart className="h-4 w-4 sm:h-5 sm:w-5 text-[#00FFAA]" />
						</div>
						<div>
							<h2 className="text-base sm:text-xl font-bold text-[#00FFAA] tracking-tight leading-none uppercase">
								Tingkatkan Hubungan Diplomatik
							</h2>
							<p className="text-[10px] sm:text-xs text-[#6B8A8A] font-semibold mt-1">
								Negara Target: <span className="text-[#E0E0E0] font-bold">{targetCountryName}</span>
							</p>
						</div>
					</div>

					<button
						onClick={onClose}
						className="p-1.5 lg:p-2 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] text-[#6B8A8A] hover:text-[#00FFAA] hover:border-[#00FFAA] transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1 shadow-sm shrink-0"
					>
						<span className="text-[10px] lg:text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
						<X className="h-4 w-4" />
					</button>
				</div>

				{/* BODY — Flex column, isi compact agar tidak perlu scroll */}
				<div className="flex-1 min-h-0 bg-[#0F2424] relative z-10 p-4 sm:p-6 flex flex-col gap-3 sm:gap-4">

					{/* Notice + Budget Info — Grid 2 kolom */}
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 shrink-0">
						{/* Notice */}
						<div className="p-3 rounded-xl bg-[#0A1A1A] border border-[#00FFAA]/20 flex items-start gap-2.5">
							<Sparkles className="h-4 w-4 text-[#00FFAA] shrink-0 mt-0.5" />
							<p className="text-[11px] sm:text-xs text-[#E0E0E0] leading-relaxed">
								Berikan bantuan <strong className="text-[#00FFAA]">NEO</strong> kepada <strong className="text-white">{targetCountryName}</strong>. Setiap <strong className="text-[#00FFAA]">10.000 NEO</strong> = <strong className="text-[#00FFAA]">+1 Tingkat</strong> hubungan.
							</p>
						</div>

						{/* Budget Info */}
						<div className="flex items-center justify-between bg-[#0A1A1A] p-3 rounded-xl border border-[#00FFAA]/20">
							<span className="text-[11px] sm:text-xs text-[#6B8A8A] font-semibold flex items-center gap-2">
								<Coins className="h-4 w-4 text-[#00FFAA]" />
								Anggaran NEO Anda:
							</span>
							<span className="font-black text-[#00FFAA] text-sm">
								{formatNEO(playerBudget)} NEO
							</span>
						</div>
					</div>

					{/* Input Nominal NEO */}
					<div className="shrink-0">
						<label className="block text-[10px] sm:text-xs font-black text-[#00FFAA] uppercase tracking-wider mb-2">
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
								className="w-full bg-[#051010] border-2 border-[#00FFAA]/40 focus:border-[#00FFAA] rounded-xl py-2.5 px-4 text-base font-black text-[#00FFAA] outline-none transition placeholder-[#6B8A8A]/60"
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
								className="py-1.5 px-2 bg-[#0A1A1A] hover:bg-[#00FFAA]/10 border border-[#00FFAA]/30 rounded-lg text-[11px] font-bold text-[#00FFAA] transition-all cursor-pointer flex items-center justify-center gap-1"
							>
								<Plus className="h-3 w-3" /> 10rb
							</button>
							<button
								type="button"
								onClick={() => handleAddAmount(50000)}
								className="py-1.5 px-2 bg-[#0A1A1A] hover:bg-[#00FFAA]/10 border border-[#00FFAA]/30 rounded-lg text-[11px] font-bold text-[#00FFAA] transition-all cursor-pointer flex items-center justify-center gap-1"
							>
								<Plus className="h-3 w-3" /> 50rb
							</button>
							<button
								type="button"
								onClick={() => handleAddAmount(100000)}
								className="py-1.5 px-2 bg-[#0A1A1A] hover:bg-[#00FFAA]/10 border border-[#00FFAA]/30 rounded-lg text-[11px] font-bold text-[#00FFAA] transition-all cursor-pointer flex items-center justify-center gap-1"
							>
								<Plus className="h-3 w-3" /> 100rb
							</button>
							<button
								type="button"
								onClick={handleSetMax}
								className="py-1.5 px-2 bg-[#00FFAA]/20 hover:bg-[#00FFAA]/30 border border-[#00FFAA]/50 rounded-lg text-[11px] font-black text-[#00FFAA] transition-all cursor-pointer"
							>
								Maksimal
							</button>
						</div>
					</div>

					{/* Impact Preview Card — Hanya ditampilkan jika untuk 1 negara spesifik */}
					{!isAllCountries ? (
						<div className="bg-[#0A1A1A] p-3 sm:p-4 rounded-xl border border-[#00FFAA]/30 shrink-0">
							<div className="text-[10px] sm:text-xs font-black text-[#6B8A8A] uppercase tracking-wider flex items-center justify-between mb-3">
								<span>Kalkulasi Peningkatan Hubungan</span>
								<TrendingUp className="h-4 w-4 text-[#00FFAA]" />
							</div>

							<div className="flex items-center justify-between gap-3 bg-[#0F2424] p-3 rounded-lg border border-[#00FFAA]/20">
								{/* Current Level */}
								<div className="text-center flex-1">
									<span className="block text-[9px] sm:text-[10px] font-bold text-[#6B8A8A] uppercase">Saat Ini</span>
									<span className="text-lg sm:text-xl font-black text-[#E0E0E0]">{currentRelation}</span>
									<div className="mt-1">
										<span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${currentBadge.color}`}>
											{currentBadge.label}
										</span>
									</div>
								</div>

								{/* Arrow & Delta */}
								<div className="flex flex-col items-center justify-center px-2">
									<span className="text-[11px] font-black text-[#00FFAA] bg-[#00FFAA]/10 px-2 py-0.5 rounded border border-[#00FFAA]/30 mb-1 whitespace-nowrap">
										+{actualGained} Tingkat
									</span>
									<ArrowRight className="h-4 w-4 text-[#00FFAA]" />
								</div>

								{/* New Level */}
								<div className="text-center flex-1">
									<span className="block text-[9px] sm:text-[10px] font-bold text-[#6B8A8A] uppercase">Setelah Pemberian</span>
									<span className="text-lg sm:text-xl font-black text-[#00FFAA]">{newRelation}</span>
									<div className="mt-1">
										<span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${newBadge.color}`}>
											{newBadge.label}
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
						<div className="bg-[#0A1A1A] p-3 sm:p-4 rounded-xl border border-[#00FFAA]/30 shrink-0 flex items-center justify-between">
							<div className="flex items-center gap-2.5">
								<Sparkles className="h-4 w-4 text-[#00FFAA] shrink-0" />
								<span className="text-xs text-[#E0E0E0] font-semibold">
									Efek Global ke Seluruh Negara:
								</span>
							</div>
							<span className="text-sm font-black text-[#00FFAA] bg-[#00FFAA]/10 px-3 py-1 rounded-lg border border-[#00FFAA]/30">
								+{actualGained} Tingkat untuk Setiap Negara
							</span>
						</div>
					)}

					{/* Warning / Error Messages */}
					{isInsufficientBudget && (
						<div className="p-2.5 sm:p-3 bg-rose-950/60 border border-rose-500/40 rounded-xl text-rose-300 text-[11px] sm:text-xs flex items-center gap-2 shrink-0">
							<AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
							<span>Anggaran NEO Anda tidak mencukupi (Tersedia: {formatNEO(playerBudget)} NEO).</span>
						</div>
					)}

					{isLessThanMin && (
						<div className="p-2.5 sm:p-3 bg-amber-950/60 border border-amber-500/40 rounded-xl text-amber-300 text-[11px] sm:text-xs flex items-center gap-2 shrink-0">
							<AlertCircle className="h-4 w-4 shrink-0 text-amber-400" />
							<span>Minimal pemberian bantuan adalah 10.000 NEO untuk 1 tingkat hubungan.</span>
						</div>
					)}

					{isMaxRelation && (
						<div className="p-2.5 sm:p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-emerald-300 text-[11px] sm:text-xs flex items-center gap-2 shrink-0">
							<CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
							<span>Tingkat hubungan dengan negara ini sudah mencapai nilai maksimum (100).</span>
						</div>
					)}

					{/* Spacer untuk mendorong footer ke bawah */}
					<div className="flex-1" />
				</div>

				{/* FOOTER — Selalu di bawah */}
				<div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-[#00FFAA]/20 bg-[#0A1A1A] shrink-0 rounded-b-2xl">
					<div className="flex gap-3">
						<button
							type="button"
							onClick={onClose}
							className="flex-1 bg-[#0F2424] hover:bg-[#163535] border border-[#00FFAA]/30 rounded-xl py-2.5 sm:py-3 text-center text-[#E0E0E0] font-extrabold text-xs tracking-wider uppercase transition-all cursor-pointer"
						>
							Batal
						</button>
						<button
							type="button"
							disabled={!isValid}
							onClick={handleConfirm}
							className={`flex-1 rounded-xl py-2.5 sm:py-3 text-center font-black text-xs tracking-wider uppercase transition-all shadow-lg flex items-center justify-center gap-2 ${isValid
									? "bg-[#00FFAA] hover:bg-[#00e699] text-[#0A1A1A] border border-[#00FFAA] cursor-pointer"
									: "bg-gray-700 text-gray-400 border border-gray-600 cursor-not-allowed opacity-50"
								}`}
						>
							<Heart className="h-4 w-4" />
							Tingkatkan (+{actualGained})
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}