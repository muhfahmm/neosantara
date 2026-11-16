import RootInfoModalHeader from '@/app/page/root_modals_design_menu/RootInfoModalHeader';
import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Bomb, UserPlus, Target } from "lucide-react";
import { COUNTRIES_DATA } from "@/app/page/map_system/map-data";
import { getSabotaseSuccessChance } from "./logic/sabotaseLogic";
import { getCovertPersonnel, recruitPersonnel, COVERT_PERSONNEL_UPDATED_EVENT } from "../covertPersonnelStorage";
import { SABOTASE_TARGET_OPTIONS } from "./sabotaseTargetOptions";
import RekrutPenyabotModal from "./RekrutPenyabotModal";
import TravelFuelCostPanel from "@/app/page/navigasi_menu/2_navigasi_bawah/3_produksi_konsumsi/fuelLogic/TravelFuelCostPanel";
import { getTravelFuelStatus } from "@/app/page/navigasi_menu/2_navigasi_bawah/3_produksi_konsumsi/fuelLogic/travelFuelLogic";
import { useTravelFuelQuote } from "@/app/page/navigasi_menu/2_navigasi_bawah/3_produksi_konsumsi/fuelLogic/useTravelFuelQuote";

interface SabotaseModalProps {
	isOpen: boolean;
	countryName?: string | null;
	playerCountryDetail?: Record<string, unknown> | null;
	currentBudget?: number;
	adjustNetBalance?: (delta: number) => void;
	updatePlayerCountryDetail?: (updater: (previous: Record<string, unknown> | null) => Record<string, unknown> | null) => void;
	onClose: () => void;
	onConfirm: (targetCountry: string, operationTarget: string, fuelCost: number) => boolean;
}

export default function SabotaseModal({
	isOpen,
	countryName,
	playerCountryDetail,
	currentBudget = 0,
	adjustNetBalance,
	updatePlayerCountryDetail,
	onClose,
	onConfirm,
}: SabotaseModalProps) {
	const [selectedTargetId, setSelectedTargetId] = useState<string>(SABOTASE_TARGET_OPTIONS[0].id);
	const [isTargetDropdownOpen, setIsTargetDropdownOpen] = useState<boolean>(false);
	const [isRekrutModalOpen, setIsRekrutModalOpen] = useState<boolean>(false);
	const [penyabotCount, setPenyabotCount] = useState<number>(() => getCovertPersonnel().penyabot);
	const targetDropdownRef = useRef<HTMLDivElement>(null);
	const launchInProgressRef = useRef(false);
	const targetCountryName = String(countryName || "").trim();
	const playerCountryName = String(
		playerCountryDetail?.country ||
		playerCountryDetail?.nama_negara ||
		playerCountryDetail?.name_id ||
		playerCountryDetail?.name_en ||
		"",
	);
	const travelFuelQuote = useTravelFuelQuote(
		playerCountryName,
		targetCountryName,
		"sabotase",
		isOpen && Boolean(targetCountryName),
	);
	const travelFuelStatus = getTravelFuelStatus(
		playerCountryDetail,
		travelFuelQuote.cost,
		travelFuelQuote.loading,
		travelFuelQuote.fallback,
	);

	useEffect(() => {
		if (!isOpen) launchInProgressRef.current = false;
	}, [isOpen]);

	useEffect(() => {
		const syncPersonnel = () => {
			setPenyabotCount(getCovertPersonnel().penyabot);
		};
		syncPersonnel();
		window.addEventListener(COVERT_PERSONNEL_UPDATED_EVENT, syncPersonnel);
		return () => window.removeEventListener(COVERT_PERSONNEL_UPDATED_EVENT, syncPersonnel);
	}, [isOpen]);

	useEffect(() => {
		if (isOpen) {
			setIsTargetDropdownOpen(false);
			setSelectedTargetId(SABOTASE_TARGET_OPTIONS[0].id);
			setIsRekrutModalOpen(false);
		}
	}, [isOpen]);

	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (targetDropdownRef.current && !targetDropdownRef.current.contains(e.target as Node)) {
				setIsTargetDropdownOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	if (!isOpen) return null;

	const successChance = getSabotaseSuccessChance(playerCountryDetail);
	const targetData = COUNTRIES_DATA.find(
		country => country.country.toLowerCase() === targetCountryName.toLowerCase(),
	);
	const selectedTargetOption = SABOTASE_TARGET_OPTIONS.find(t => t.id === selectedTargetId) || SABOTASE_TARGET_OPTIONS[0];

	const handleRecruitConfirm = (count: number, totalCost: number) => {
		recruitPersonnel('penyabot', count);
		if (updatePlayerCountryDetail) {
			updatePlayerCountryDetail(prev => {
				if (!prev) return prev;
				const currentKas = Number(prev.anggaran || 0);
				return {
					...prev,
					anggaran: Math.max(0, currentKas - totalCost),
				};
			});
		} else if (adjustNetBalance) {
			adjustNetBalance(-totalCost);
		}
		setIsRekrutModalOpen(false);
	};

	const renderFlag = (iso?: string, name?: string) => {
		if (!iso || iso.length !== 2) {
			return <span className="w-6 h-4 rounded-sm bg-slate-300 flex items-center justify-center text-[9px]">🏳️</span>;
		}
		return (
			<img
				src={`https://flagcdn.com/w40/${iso.toLowerCase()}.png`}
				alt={name || iso}
				className="w-6 h-4 rounded-sm object-cover border border-black/20 shadow-sm shrink-0"
				onError={(e) => {
					(e.target as HTMLImageElement).src = "https://flagcdn.com/w40/un.png";
				}}
			/>
		);
	};

	const modalContent = (
		<div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 font-sans text-white pointer-events-none">
			<div className="modal-responsive-shell flex flex-col bg-root-surface border border-rose-500/40 rounded-2xl p-6 sm:p-8 shadow-[0_0_40px_rgba(225,29,72,0.15)] relative pointer-events-auto">
				
				<RootInfoModalHeader
					title="Sabotase Fasilitas Negara"
					onClose={onClose}
					icon={<Bomb />}
					size="standard"
				/>

				{/* BODY CONTENT */}
				<div className="flex-1 flex flex-col">
					<p className="text-sm sm:text-base text-root-text mb-4 leading-relaxed">
						Negara target mengikuti detail negara yang sedang dibuka:
					</p>

					<div className="w-full h-12 bg-root-canvas border border-rose-500/30 rounded-xl px-4 flex items-center gap-3 text-white mb-3">
						{renderFlag(targetData?.iso, targetCountryName)}
						<span className="font-bold text-sm tracking-wide truncate text-rose-400">
							{targetCountryName || "Negara target tidak tersedia"}
						</span>
					</div>

					{/* DROPDOWN TUJUAN OPERASI SABOTASE */}
					<div className="relative mb-3" ref={targetDropdownRef}>
						<div className="text-[11px] font-bold uppercase tracking-wider text-root-subtle mb-1.5 flex items-center gap-1.5">
							<Target className="w-3.5 h-3.5 text-rose-400" />
							<span>Target Fasilitas Sabotase</span>
						</div>
						<button
							type="button"
							onClick={() => setIsTargetDropdownOpen(!isTargetDropdownOpen)}
							className="w-full h-12 bg-root-canvas hover:bg-[#142A2A] border border-rose-500/30 rounded-xl px-4 flex items-center justify-between text-white transition-colors cursor-pointer text-left"
						>
							<div className="flex flex-col truncate pr-2">
								<span className="font-bold text-xs sm:text-sm text-rose-400 truncate">
									{selectedTargetOption.label}
								</span>
							</div>
							<ChevronDown className={`w-5 h-5 text-rose-400 transition-transform duration-200 shrink-0 ${isTargetDropdownOpen ? 'rotate-180' : ''}`} />
						</button>

						{isTargetDropdownOpen && (
							<div className="absolute left-0 right-0 top-full mt-2 max-h-56 overflow-y-auto bg-root-canvas border border-rose-500/30 rounded-xl shadow-2xl z-50 divide-y divide-rose-500/10">
								{SABOTASE_TARGET_OPTIONS.map((opt) => (
									<button
										key={opt.id}
										type="button"
										onClick={() => {
											setSelectedTargetId(opt.id);
											setIsTargetDropdownOpen(false);
										}}
										className={`w-full px-4 py-2.5 text-left hover:bg-rose-500/10 transition-colors ${
											selectedTargetId === opt.id ? 'bg-rose-500/20 border-l-4 border-rose-500' : ''
										}`}
									>
										<div className={`text-xs sm:text-sm font-bold ${selectedTargetId === opt.id ? 'text-rose-400' : 'text-root-text'}`}>
											{opt.label}
										</div>
										<div className="text-[11px] text-root-subtle mt-0.5 leading-snug">
											{opt.description}
										</div>
									</button>
								))}
							</div>
						)}
					</div>

					{/* PANEL PENYABOT & TOMBOL REKRUT */}
					<div className="bg-root-canvas border border-rose-500/20 rounded-xl p-3.5 mb-3 flex items-center justify-between">
						<div className="flex items-center gap-3">
							<div className="p-2 bg-root-surface border border-rose-500/30 rounded-lg">
								<Bomb className="w-5 h-5 text-rose-400" />
							</div>
							<div>
								<span className="text-[11px] font-bold uppercase tracking-wider text-root-subtle block">
									Personel Sabotase
								</span>
								<div className="text-sm font-black text-white">
									Penyabot: <span className="text-rose-400">{penyabotCount}</span>
								</div>
							</div>
						</div>

						<button
							type="button"
							onClick={() => setIsRekrutModalOpen(true)}
							className="px-4 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500 text-rose-400 hover:text-rose-300 font-black text-xs uppercase tracking-wider transition-all duration-150 flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-sm"
						>
							<UserPlus className="w-3.5 h-3.5" />
							Rekrut
						</button>
					</div>

					<div className="bg-root-canvas border border-rose-500/20 rounded-xl p-3.5 inline-block">
						<div className="flex items-center justify-between gap-8 text-sm font-bold text-root-subtle">
							<span>Peluang Keberhasilan:</span>
							<span className="text-rose-400 font-black text-lg">{successChance}%</span>
						</div>
					</div>
					<TravelFuelCostPanel status={travelFuelStatus} label="Bahan bakar operasi" />
				</div>

				{/* FOOTER ACTIONS */}
				<div className="flex flex-col sm:flex-row gap-3 justify-end mt-6 pt-4 border-t border-rose-500/20">
					<button
						type="button"
						onClick={onClose}
						className="w-full sm:w-auto px-6 bg-root-canvas hover:bg-[#142A2A] border border-root-accent/30 rounded-xl py-2 text-center text-root-text font-black text-[11px] sm:text-xs tracking-widest uppercase transition-all duration-150 cursor-pointer shadow hover:shadow-md"
					>
						Batal
					</button>
					<button
						type="button"
						disabled={penyabotCount < 1 || !travelFuelStatus.ok}
						onClick={() => {
							if (
								!targetCountryName ||
								!travelFuelStatus.ok ||
								travelFuelQuote.cost === null ||
								launchInProgressRef.current
							) return;
							if (penyabotCount < 1) {
								alert("Anda tidak memiliki penyabot yang tersedia! Silakan rekrut terlebih dahulu.");
								return;
							}
							launchInProgressRef.current = true;
							if (onConfirm(targetCountryName, selectedTargetOption.label, travelFuelQuote.cost)) {
								onClose();
							} else {
								launchInProgressRef.current = false;
							}
						}}
						className="w-full sm:w-auto px-6 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 disabled:bg-rose-600/30 disabled:text-white/50 disabled:cursor-not-allowed disabled:border-transparent border border-rose-500 rounded-xl py-2 text-center text-white font-black text-[11px] sm:text-xs tracking-widest uppercase transition-all duration-150 cursor-pointer shadow hover:shadow-md active:scale-[0.98]"
					>
						Lancarkan Sabotase
					</button>
				</div>
			</div>

			{/* MODAL REKRUT PENYABOT */}
			<RekrutPenyabotModal
				isOpen={isRekrutModalOpen}
				currentPersonnelCount={penyabotCount}
				currentBudget={currentBudget}
				onClose={() => setIsRekrutModalOpen(false)}
				onConfirm={handleRecruitConfirm}
			/>
		</div>
	);

	if (typeof window !== "undefined") {
		return createPortal(modalContent, document.body);
	}

	return modalContent;
}
